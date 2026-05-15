"""Output formatters: human (TTY), github (Actions), json (programmatic)."""
from __future__ import annotations

import json
import sys
from typing import TextIO

from .errors import Finding, Severity


def emit_human(findings: list[Finding], suppressed: list[Finding], out: TextIO) -> None:
    if not findings:
        out.write("\033[32m✓ no findings\033[0m\n")
        if suppressed:
            out.write(f"  ({len(suppressed)} finding(s) suppressed by allowlist)\n")
        return

    errors = [f for f in findings if f.is_error]
    warnings = [f for f in findings if not f.is_error]

    for f in sorted(findings):
        sev_color = "\033[31m" if f.is_error else "\033[33m"
        reset = "\033[0m"
        loc = str(f.file) if f.file else "<global>"
        if f.line:
            loc += f":{f.line}"
            if f.col:
                loc += f":{f.col}"
        out.write(f"{sev_color}{f.code}{reset} {f.severity.value} {loc}\n")
        out.write(f"  {f.message}\n")
        if f.json_pointer:
            out.write(f"  at: {f.json_pointer}\n")
        out.write("\n")

    out.write(f"\nSummary: \033[31m{len(errors)} error(s)\033[0m, "
              f"\033[33m{len(warnings)} warning(s)\033[0m")
    if suppressed:
        out.write(f", {len(suppressed)} suppressed")
    out.write("\n")


def emit_github(findings: list[Finding], out: TextIO) -> None:
    """GitHub Actions workflow command format."""
    for f in sorted(findings):
        kw = f.severity.github_actions_keyword
        attrs = []
        if f.file:
            attrs.append(f"file={f.file}")
        if f.line:
            attrs.append(f"line={f.line}")
        if f.col:
            attrs.append(f"col={f.col}")
        attrs.append(f"title={f.code}")
        attr_str = ",".join(attrs)
        # GitHub strips newlines; replace with %0A
        msg = f.message.replace("\n", "%0A").replace("\r", "")
        if f.json_pointer:
            msg = f"{msg} (at {f.json_pointer})"
        out.write(f"::{kw} {attr_str}::{msg}\n")


def emit_json(findings: list[Finding], suppressed: list[Finding], out: TextIO) -> None:
    payload = {
        "summary": {
            "errors":   sum(1 for f in findings if f.is_error),
            "warnings": sum(1 for f in findings if not f.is_error),
            "suppressed": len(suppressed),
        },
        "findings": [_finding_to_dict(f) for f in sorted(findings)],
        "suppressed": [_finding_to_dict(f) for f in sorted(suppressed)],
    }
    json.dump(payload, out, indent=2, default=str)
    out.write("\n")


def _finding_to_dict(f: Finding) -> dict:
    return {
        "code": f.code,
        "severity": f.severity.value,
        "message": f.message,
        "file": str(f.file) if f.file else None,
        "jsonPointer": f.json_pointer,
        "line": f.line,
        "col": f.col,
        "ruleUrl": f.rule_url,
        "context": f.context,
    }
