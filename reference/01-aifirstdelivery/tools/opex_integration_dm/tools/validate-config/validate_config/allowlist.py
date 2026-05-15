"""Allowlist parsing and matching. Format: JSONL, one entry per line."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .errors import Finding

MAX_AGE_DAYS = 90  # Allowlist entries older than this fail CI per design §7


class AllowlistEntry:
    __slots__ = ("rule", "file", "json_pointer", "reason", "added")

    def __init__(self, raw: dict[str, Any]) -> None:
        self.rule: str = raw["rule"]
        self.file: str | None = raw.get("file")
        self.json_pointer: str | None = raw.get("jsonPointer")
        self.reason: str = raw["reason"]
        added_str = raw.get("added") or raw.get("addedAt")
        self.added: datetime | None = None
        if added_str:
            try:
                self.added = datetime.fromisoformat(added_str.replace("Z", "+00:00"))
            except ValueError:
                pass

    def matches(self, finding: Finding) -> bool:
        return finding.matches(self.rule, self.file, self.json_pointer)

    @property
    def expired(self) -> bool:
        if not self.added:
            return False
        age = datetime.now(timezone.utc) - self.added
        return age.days > MAX_AGE_DAYS


def load(path: Path | None) -> list[AllowlistEntry]:
    if path is None or not path.exists():
        return []
    out: list[AllowlistEntry] = []
    with path.open("r", encoding="utf-8") as fh:
        for lineno, raw_line in enumerate(fh, 1):
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as e:
                raise ValueError(f"{path}:{lineno}: invalid JSON in allowlist: {e}")
            if not isinstance(obj, dict) or "rule" not in obj or "reason" not in obj:
                raise ValueError(f"{path}:{lineno}: allowlist entry must include 'rule' and 'reason'")
            out.append(AllowlistEntry(obj))
    return out


def filter_findings(
    findings: list[Finding],
    allowlist: list[AllowlistEntry],
) -> tuple[list[Finding], list[Finding], list[AllowlistEntry]]:
    """
    Returns (remaining, suppressed, expired_entries).
    `remaining` is what gets reported. `suppressed` is what the allowlist absorbed.
    `expired_entries` represent allowlist rows that are over MAX_AGE_DAYS old —
    the runner upgrades these to errors so the team has to revisit them.
    """
    remaining: list[Finding] = []
    suppressed: list[Finding] = []
    expired = [a for a in allowlist if a.expired]

    for f in findings:
        # only non-expired allowlist entries can suppress
        if any(a.matches(f) and not a.expired for a in allowlist):
            suppressed.append(f)
        else:
            remaining.append(f)
    return remaining, suppressed, expired
