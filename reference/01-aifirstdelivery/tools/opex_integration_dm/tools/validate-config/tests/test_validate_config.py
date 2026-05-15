"""End-to-end tests against the real /config/ tree + intentionally-bad fixtures."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from validate_config.allowlist import AllowlistEntry, filter_findings, load
from validate_config.errors import Finding, Severity
from validate_config.runner import promote_warnings, run

REPO_ROOT = Path(__file__).resolve().parents[3]
CONFIG_ROOT = REPO_ROOT / "config"


# ---------------------------------------------------------------------------
# Happy path: the configs the framework ships should validate clean (or near-clean)
# ---------------------------------------------------------------------------
def test_shipped_configs_have_no_errors():
    findings = run(CONFIG_ROOT)
    errors = [f for f in findings if f.is_error]
    assert errors == [], f"Expected zero errors against shipped configs, got:\n" + "\n".join(
        f"  {f.code} {f.file}: {f.message}" for f in errors
    )


def test_shipped_configs_warnings_documented():
    """Warnings are OK but we want to see them in test output for visibility."""
    findings = run(CONFIG_ROOT)
    warnings = [f for f in findings if not f.is_error]
    # Print to stderr so pytest -s shows them; assertion is informational only.
    for w in sorted(warnings):
        print(f"WARN {w.code} {w.file}: {w.message}")


# ---------------------------------------------------------------------------
# V001 — bad JSON syntax
# ---------------------------------------------------------------------------
def test_V001_bad_json(tmp_path: Path):
    _scaffold_minimal(tmp_path)
    (tmp_path / "entities" / "broken.json").write_text("{ not valid json", encoding="utf-8")
    findings = run(tmp_path)
    assert any(f.code == "V001" for f in findings)


# ---------------------------------------------------------------------------
# V002 — schema violation (missing required property)
# ---------------------------------------------------------------------------
def test_V002_schema_violation(tmp_path: Path):
    _scaffold_minimal(tmp_path)
    bad = {
        "entityKey": "broken",
        "direction": "inbound",
        # missing source, target, fields → schema fails
    }
    (tmp_path / "entities" / "broken.json").write_text(json.dumps(bad), encoding="utf-8")
    findings = run(tmp_path)
    assert any(f.code == "V002" for f in findings), [f.code for f in findings]


# ---------------------------------------------------------------------------
# V004 — entityKey filename mismatch
# ---------------------------------------------------------------------------
def test_V004_entitykey_filename_mismatch(tmp_path: Path):
    _scaffold_minimal(tmp_path)
    doc = _minimal_inbound_entity("not_matching")
    (tmp_path / "entities" / "customer.json").write_text(json.dumps(doc), encoding="utf-8")
    findings = run(tmp_path)
    assert any(f.code == "V004" for f in findings), [f.code for f in findings]


# ---------------------------------------------------------------------------
# V010 — wave references unknown entity
# ---------------------------------------------------------------------------
def test_V010_wave_references_unknown_entity(tmp_path: Path):
    _scaffold_minimal(tmp_path)
    wave = {
        "$schemaVersion": "1",
        "waveKey": "phantom",
        "direction": "inbound",
        "entities": [{"entityKey": "ghost", "phase": 1}],
    }
    (tmp_path / "waves" / "phantom.json").write_text(json.dumps(wave), encoding="utf-8")
    findings = run(tmp_path)
    assert any(f.code == "V010" for f in findings), [f.code for f in findings]


# ---------------------------------------------------------------------------
# V028 — createIfMissing=true is rejected in v1 (caught by schema enum)
# ---------------------------------------------------------------------------
def test_V028_createIfMissing_true_rejected(tmp_path: Path):
    _scaffold_minimal(tmp_path)
    doc = _minimal_inbound_entity("badlookup")
    doc["fields"].append({
        "source": "X",
        "target": "x",
        "targetType": "lookup",
        "transform": {
            "type": "lookup",
            "forward": {
                "referenceTable":     "t",
                "entitySetName":      "ts",
                "navigationProperty": "T",
                "refField":           "code",
                "createIfMissing":    True,  # <— violation
            },
        },
    })
    (tmp_path / "entities" / "badlookup.json").write_text(json.dumps(doc), encoding="utf-8")
    findings = run(tmp_path)
    # The enum [false] in the schema fires V002; the dedicated V028 rule may not run
    # because the schema is already rejecting it. Either is acceptable; assert one of them.
    assert any(f.code in {"V002", "V028"} for f in findings), [f.code for f in findings]


# ---------------------------------------------------------------------------
# V030 — wave dependency cycle
# ---------------------------------------------------------------------------
def test_V030_wave_cycle(tmp_path: Path):
    _scaffold_minimal(tmp_path)
    # Create three entities A, B, C with A->B->C->A cycle in dependsOn
    for name in ("a", "b", "c"):
        (tmp_path / "entities" / f"{name}.json").write_text(
            json.dumps(_minimal_inbound_entity(name)), encoding="utf-8"
        )
    wave = {
        "$schemaVersion": "1",
        "waveKey": "cyclic",
        "direction": "inbound",
        "entities": [
            {"entityKey": "a", "phase": 1, "dependsOn": ["c"]},
            {"entityKey": "b", "phase": 1, "dependsOn": ["a"]},
            {"entityKey": "c", "phase": 1, "dependsOn": ["b"]},
        ],
    }
    (tmp_path / "waves" / "cyclic.json").write_text(json.dumps(wave), encoding="utf-8")
    findings = run(tmp_path)
    assert any(f.code == "V030" for f in findings), [f.code for f in findings]


# ---------------------------------------------------------------------------
# V032 — phase ordering vs dependsOn
# ---------------------------------------------------------------------------
def test_V032_phase_ordering(tmp_path: Path):
    _scaffold_minimal(tmp_path)
    for name in ("a", "b"):
        (tmp_path / "entities" / f"{name}.json").write_text(
            json.dumps(_minimal_inbound_entity(name)), encoding="utf-8"
        )
    wave = {
        "$schemaVersion": "1",
        "waveKey": "badorder",
        "direction": "inbound",
        "entities": [
            {"entityKey": "a", "phase": 1, "dependsOn": ["b"]},  # dep is in same phase
            {"entityKey": "b", "phase": 1},
        ],
    }
    (tmp_path / "waves" / "badorder.json").write_text(json.dumps(wave), encoding="utf-8")
    findings = run(tmp_path)
    assert any(f.code == "V032" for f in findings), [f.code for f in findings]


# ---------------------------------------------------------------------------
# strict mode promotes warnings
# ---------------------------------------------------------------------------
def test_strict_promotes_warnings():
    findings = [
        Finding(code="V007", severity=Severity.WARNING, message="batchSize odd"),
        Finding(code="V001", severity=Severity.ERROR,   message="parse failed"),
    ]
    promoted = promote_warnings(findings)
    assert all(f.is_error for f in promoted)
    assert promoted[0].code == "V007"  # still V007, just promoted to error


# ---------------------------------------------------------------------------
# Allowlist suppresses matching findings
# ---------------------------------------------------------------------------
def test_allowlist_suppresses():
    findings = [
        Finding(code="V023", severity=Severity.WARNING, message="weird plural",
                file=Path("entities/customer.json"),
                json_pointer="/fields/3/transform/forward/entitySetName"),
    ]
    allow = [AllowlistEntry({
        "rule": "V023",
        "file": "entities/customer.json",
        "jsonPointer": "/fields/3/transform/forward/entitySetName",
        "reason": "irregular plural — confirmed in DV metadata",
        "added": "2026-05-13T00:00:00Z",
    })]
    remaining, suppressed, expired = filter_findings(findings, allow)
    assert remaining == []
    assert len(suppressed) == 1
    assert expired == []


# ---------------------------------------------------------------------------
# Test scaffolding helpers
# ---------------------------------------------------------------------------
def _scaffold_minimal(root: Path) -> None:
    """Create a minimal valid /config/ tree (schemas + project + one entity + one wave)."""
    (root / "schemas").mkdir(parents=True, exist_ok=True)
    (root / "entities").mkdir(parents=True, exist_ok=True)
    (root / "waves").mkdir(parents=True, exist_ok=True)
    (root / "aliases").mkdir(parents=True, exist_ok=True)

    # Copy the real schemas
    real_schemas = CONFIG_ROOT / "schemas"
    for s in real_schemas.glob("*.json"):
        (root / "schemas" / s.name).write_text(s.read_text(encoding="utf-8"), encoding="utf-8")

    # Minimal project
    (root / "_project.json").write_text(json.dumps({
        "$schemaVersion": "1",
        "batchSize": 500,
        "retry": {"maxAttempts": 5, "backoffSec": 30},
        "notification": {"enabled": False},
    }), encoding="utf-8")


def _minimal_inbound_entity(name: str) -> dict:
    return {
        "$schemaVersion": "1",
        "entityKey": name,
        "direction": "inbound",
        "source": {
            "system": "SFTP",
            "format": "csv",
            "sftpLinkedService": "ls_sftp_fusion",
            "inbound": {"pathPattern": f"/exports/{name}_*.csv"},
        },
        "target": {
            "system": "Dataverse",
            "entityLogicalName": "account",
            "alternateKey": ["accountnumber"],
            "inbound": {"writeMode": "upsert"},
        },
        "fields": [
            {
                "source": "X",
                "target": "x",
                "targetType": "text",
                "transform": {"type": "direct"},
            }
        ],
    }
