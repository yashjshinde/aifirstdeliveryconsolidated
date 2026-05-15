"""Finding model — the structured form of every validate-config result."""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any


class Severity(str, Enum):
    ERROR = "error"
    WARNING = "warning"

    @property
    def github_actions_keyword(self) -> str:
        return "error" if self is Severity.ERROR else "warning"


@dataclass(frozen=True)
class Finding:
    """A single rule violation. Stable, hashable, ordering-friendly for dedup."""

    code: str                       # e.g. "V001", "V020"
    severity: Severity
    message: str                    # human-readable; first sentence is the summary
    file: Path | None = None        # the config file (None for cross-file findings)
    json_pointer: str = ""          # RFC 6901, e.g. "/fields/3/transform/forward"
    line: int | None = None         # 1-based line in the file (best-effort)
    col: int | None = None
    rule_url: str = ""              # link back to the design doc section
    context: dict[str, Any] = field(default_factory=dict)

    @property
    def is_error(self) -> bool:
        return self.severity is Severity.ERROR

    def __lt__(self, other: "Finding") -> bool:
        return (str(self.file or ""), self.line or 0, self.col or 0, self.code) < (
            str(other.file or ""),
            other.line or 0,
            other.col or 0,
            other.code,
        )

    def matches(self, rule: str, file: str | None = None, jp: str | None = None) -> bool:
        """True iff this finding matches an allowlist entry. Path comparison is
        cross-platform: backslashes and forward slashes are normalized."""
        if rule != self.code:
            return False
        if file is not None:
            if self.file is None:
                return False
            this_path = str(self.file).replace("\\", "/")
            wanted = file.replace("\\", "/")
            if not this_path.endswith(wanted):
                return False
        if jp is not None and jp != self.json_pointer:
            return False
        return True


# ---------------------------------------------------------------------------
# Rule catalog — single source of truth for code→description+severity+url.
# Mirrors the catalog in detailed-design/01-config-schemas.md §6.
# Update both when adding/changing a rule.
# ---------------------------------------------------------------------------

RULE_CATALOG: dict[str, tuple[Severity, str, str]] = {
    # V0xx — Schema-level
    "V001": (Severity.ERROR,   "JSON syntactically valid",                   "01-config-schemas.md#61"),
    "V002": (Severity.ERROR,   "Validates against the relevant JSON Schema", "01-config-schemas.md#61"),
    "V003": (Severity.ERROR,   "additionalProperties:false violation",       "01-config-schemas.md#61"),
    "V004": (Severity.ERROR,   "entityKey filename matches contents",        "01-config-schemas.md#61"),
    "V005": (Severity.ERROR,   "waveKey filename matches contents",          "01-config-schemas.md#61"),
    "V006": (Severity.ERROR,   "notification.to non-empty when email enabled","01-config-schemas.md#61"),
    "V007": (Severity.WARNING, "batchSize outside Dataverse-recommended range","01-config-schemas.md#61"),
    # V01x — Cross-file
    "V010": (Severity.ERROR,   "wave entityKey resolves to an entity config","01-config-schemas.md#62"),
    "V011": (Severity.ERROR,   "wave direction compatible with entity direction","01-config-schemas.md#62"),
    "V012": (Severity.ERROR,   "aliasesFile reference resolves",             "01-config-schemas.md#62"),
    "V013": (Severity.ERROR,   "aliasesFile refTable/refField matches importer","01-config-schemas.md#62"),
    "V014": (Severity.WARNING, "lookup references no known master",          "01-config-schemas.md#62"),
    "V015": (Severity.ERROR,   "N:N relationshipSchemaName unique across entities","01-config-schemas.md#62"),
    # V02x — Transform completeness
    "V020": (Severity.ERROR,   "Non-invertible transform missing reverse block","01-config-schemas.md#63"),
    "V021": (Severity.ERROR,   "map.forward.map is 1:1 OR reverse.map declared","01-config-schemas.md#63"),
    "V022": (Severity.ERROR,   "choice forward.map values are in OptionSet range","01-config-schemas.md#63"),
    "V023": (Severity.WARNING, "lookup.entitySetName is plural-shaped",      "01-config-schemas.md#63"),
    "V024": (Severity.WARNING, "lookup.aliases keys reachable after normalize","01-config-schemas.md#63"),
    "V025": (Severity.ERROR,   "Alias filename matches refTable__refField",  "01-config-schemas.md#63"),
    "V026": (Severity.ERROR,   "Self-lookup declares loadPhase:2",           "01-config-schemas.md#63"),
    "V027": (Severity.WARNING, "createIfMissing=true without createDefaults (v2)","01-config-schemas.md#63"),
    "V028": (Severity.ERROR,   "createIfMissing=true rejected in v1",        "01-config-schemas.md#63"),
    # V03x — Wave graph
    "V030": (Severity.ERROR,   "Wave entities form a DAG (no cycles)",       "01-config-schemas.md#64"),
    "V031": (Severity.ERROR,   "dependsOn references an entity in same wave","01-config-schemas.md#64"),
    "V032": (Severity.ERROR,   "Phase ordering consistent with dependsOn",   "01-config-schemas.md#64"),
    "V033": (Severity.ERROR,   "No phase gaps in topological pass",          "01-config-schemas.md#64"),
    "V034": (Severity.WARNING, "N:N relatedEntity in wave but not in dependsOn","01-config-schemas.md#64"),
    # V04x — Direction-specific
    "V040": (Severity.ERROR,   "Inbound entity has at least one inbound field","01-config-schemas.md#65"),
    "V041": (Severity.ERROR,   "Outbound target.query non-null per mode",    "01-config-schemas.md#65"),
    "V042": (Severity.ERROR,   "Outbound lookups have $expand or are excluded","01-config-schemas.md#65"),
    "V043": (Severity.WARNING, "Bidirectional transforms declare explicit reverse","01-config-schemas.md#65"),
    "V045": (Severity.WARNING, "OData filter parseable after token substitution","01-config-schemas.md#65"),
    # V05x — Operational
    "V050": (Severity.WARNING, "dedup.checksumColumns overlaps alternateKey","01-config-schemas.md#66"),
    "V051": (Severity.WARNING, "dateTime with sourceTz=targetTz=UTC is a no-op","01-config-schemas.md#66"),
    "V052": (Severity.WARNING, "partialLoadAllowed:false with failureThresholdPct>0","01-config-schemas.md#66"),
}


def lookup_rule(code: str) -> tuple[Severity, str, str]:
    """Returns (severity, description, doc_url) for a rule code."""
    if code not in RULE_CATALOG:
        raise KeyError(f"Unknown rule code: {code}. Add to RULE_CATALOG in errors.py.")
    return RULE_CATALOG[code]


def severity_for(code: str) -> Severity:
    return RULE_CATALOG[code][0]
