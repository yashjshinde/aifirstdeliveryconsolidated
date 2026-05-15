"""JSON Schema (draft 2020-12) validation for config files."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

from .errors import Finding, Severity


# Map filename pattern → which schema validates the file.
# The cli.py + runner.py classify each /config/ file with one of these keys.
SCHEMA_KEYS = ("project", "entity", "wave", "alias")


def load_schemas(schemas_dir: Path) -> dict[str, dict[str, Any]]:
    """Read the four schema files from /config/schemas/."""
    mapping = {
        "project": "project.schema.json",
        "entity":  "entity-mapping.schema.json",
        "wave":    "wave.schema.json",
        "alias":   "alias-file.schema.json",
    }
    out: dict[str, dict[str, Any]] = {}
    for key, fname in mapping.items():
        path = schemas_dir / fname
        if not path.exists():
            raise FileNotFoundError(f"Missing schema: {path}")
        with path.open("r", encoding="utf-8") as fh:
            out[key] = json.load(fh)
    return out


def _build_registry(schemas: dict[str, dict[str, Any]]) -> Registry:
    """Register each schema under its $id so cross-schema $refs resolve."""
    resources = []
    for schema in schemas.values():
        sid = schema.get("$id")
        if not sid:
            continue
        resources.append((sid, Resource.from_contents(schema, default_specification=DRAFT202012)))
    return Registry().with_resources(resources)


def classify_file(path: Path, config_root: Path) -> str | None:
    """
    Determine which schema applies to the file at `path` based on /config/ location.
    Returns one of SCHEMA_KEYS, or None if the file is not validate-config's responsibility
    (e.g. it lives under /config/schemas/).
    """
    try:
        rel = path.relative_to(config_root)
    except ValueError:
        return None
    parts = rel.parts
    if parts and parts[0] == "schemas":
        return None  # don't validate schema files against themselves
    if rel.name == "_project.json":
        return "project"
    if len(parts) >= 2 and parts[0] == "entities":
        return "entity"
    if len(parts) >= 2 and parts[0] == "waves":
        return "wave"
    if len(parts) >= 2 and parts[0] == "aliases":
        return "alias"
    return None


def validate_against_schema(
    file_path: Path,
    instance: Any,
    schema_key: str,
    schemas: dict[str, dict[str, Any]],
    registry: Registry,
) -> list[Finding]:
    """Run jsonschema validation; convert each ValidationError to a Finding."""
    schema = schemas[schema_key]
    validator = Draft202012Validator(schema, registry=registry)
    findings: list[Finding] = []
    for err in sorted(validator.iter_errors(instance), key=lambda e: list(e.path)):
        findings.append(_schema_error_to_finding(err, file_path))
    return findings


def _schema_error_to_finding(err: ValidationError, file_path: Path) -> Finding:
    """Translate a jsonschema ValidationError to our Finding shape."""
    jp = "/" + "/".join(str(p) for p in err.absolute_path) if err.absolute_path else ""

    # Classify the error to pick the most informative rule code.
    validator = err.validator
    if validator == "additionalProperties":
        code = "V003"
    elif validator in {"required", "type", "enum", "const", "pattern", "minimum",
                        "maximum", "minLength", "maxLength", "minItems", "maxItems",
                        "oneOf", "anyOf", "allOf", "if", "then", "else", "minProperties",
                        "maxProperties", "format"}:
        code = "V002"
    else:
        code = "V002"

    severity = Severity.ERROR
    return Finding(
        code=code,
        severity=severity,
        message=f"{err.message} (at {jp or '/'})",
        file=file_path,
        json_pointer=jp,
        rule_url="01-config-schemas.md#61",
    )


def parse_json_file(path: Path) -> tuple[Any | None, Finding | None]:
    """Parse JSON; on failure return a V001 Finding instead."""
    try:
        with path.open("r", encoding="utf-8") as fh:
            return json.load(fh), None
    except json.JSONDecodeError as e:
        return None, Finding(
            code="V001",
            severity=Severity.ERROR,
            message=f"JSON parse error: {e.msg}",
            file=path,
            line=e.lineno,
            col=e.colno,
            rule_url="01-config-schemas.md#61",
        )


def build_registry_for(schemas: dict[str, dict[str, Any]]) -> Registry:
    """Public entry — exposes the internal _build_registry."""
    return _build_registry(schemas)
