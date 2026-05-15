"""Orchestrator: discover files, parse + schema-validate them, run rule catalog."""
from __future__ import annotations

from pathlib import Path

from .errors import Finding, Severity
from .rules import RULES, ConfigState
from .schema_validator import (
    build_registry_for,
    classify_file,
    load_schemas,
    parse_json_file,
    validate_against_schema,
)


def _gather_config_files(config_root: Path) -> list[Path]:
    """Walk /config/ for *.json files, excluding /config/schemas/."""
    paths: list[Path] = []
    for p in sorted(config_root.rglob("*.json")):
        # skip schemas directory
        try:
            rel = p.relative_to(config_root)
        except ValueError:
            continue
        if rel.parts and rel.parts[0] == "schemas":
            continue
        paths.append(p)
    return paths


def run(config_root: Path, schemas_dir: Path | None = None) -> list[Finding]:
    """Run schema validation + all rules over /config/. Returns the unfiltered finding list."""
    config_root = config_root.resolve()
    schemas_dir = (schemas_dir or (config_root / "schemas")).resolve()

    if not config_root.exists():
        raise FileNotFoundError(f"Config root does not exist: {config_root}")
    if not schemas_dir.exists():
        raise FileNotFoundError(f"Schemas dir does not exist: {schemas_dir}")

    schemas = load_schemas(schemas_dir)
    registry = build_registry_for(schemas)

    state = ConfigState()
    findings: list[Finding] = []

    for path in _gather_config_files(config_root):
        instance, parse_err = parse_json_file(path)
        if parse_err is not None:
            findings.append(parse_err)
            state.invalid_files.add(path)
            continue

        key = classify_file(path, config_root)
        if key is None:
            continue  # not validate-config's responsibility

        schema_findings = validate_against_schema(path, instance, key, schemas, registry)
        findings.extend(schema_findings)

        # If schema validation failed, cross-file rules might mis-fire on a broken doc.
        # We still record the doc in state so V010/V011 etc. can see entityKey, but
        # we mark the file invalid so rules can decide to skip per-rule.
        if schema_findings:
            state.invalid_files.add(path)

        if key == "project":
            state.project = (path, instance)
        elif key == "entity":
            ek = instance.get("entityKey") or path.stem
            state.entities[ek] = (path, instance)
        elif key == "wave":
            wk = instance.get("waveKey") or path.stem
            state.waves[wk] = (path, instance)
        elif key == "alias":
            ak = path.stem
            state.aliases[ak] = (path, instance)

    # Cross-file and content rules
    for rule in RULES:
        try:
            findings.extend(rule(state))
        except Exception as e:  # pragma: no cover
            findings.append(
                Finding(
                    code="V999",
                    severity=Severity.ERROR,
                    message=f"validate-config internal bug in {rule.__name__}: {type(e).__name__}: {e}",
                )
            )

    return findings


def promote_warnings(findings: list[Finding]) -> list[Finding]:
    """Strict mode: convert warnings into errors."""
    promoted: list[Finding] = []
    for f in findings:
        if f.is_error:
            promoted.append(f)
        else:
            promoted.append(
                Finding(
                    code=f.code,
                    severity=Severity.ERROR,
                    message=f"[strict] {f.message}",
                    file=f.file,
                    json_pointer=f.json_pointer,
                    line=f.line,
                    col=f.col,
                    rule_url=f.rule_url,
                    context=f.context,
                )
            )
    return promoted
