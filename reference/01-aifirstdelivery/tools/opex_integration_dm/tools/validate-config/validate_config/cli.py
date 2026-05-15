"""Command-line entry. Exit codes:

  0  no errors (warnings tolerated unless --strict)
  1  at least one error
  2  configuration problem (e.g., schema files missing)
  3  internal exception
"""
from __future__ import annotations

import sys
from pathlib import Path

import click

from .allowlist import filter_findings, load as load_allowlist
from .errors import Finding, Severity
from .output import emit_github, emit_human, emit_json
from .runner import promote_warnings, run


@click.command()
@click.argument(
    "config_root",
    type=click.Path(exists=True, file_okay=False, dir_okay=True, path_type=Path),
    default=Path("config"),
)
@click.option(
    "--schemas",
    "schemas_dir",
    type=click.Path(exists=False, file_okay=False, dir_okay=True, path_type=Path),
    default=None,
    help="Directory containing the four JSON Schema files (default: <config_root>/schemas)",
)
@click.option(
    "--allowlist",
    "allowlist_path",
    type=click.Path(exists=False, dir_okay=False, path_type=Path),
    default=None,
    help="Path to .validate-config.allowlist.jsonl (default: <config_root>/.validate-config.allowlist.jsonl if present)",
)
@click.option(
    "--strict",
    is_flag=True,
    default=False,
    help="Promote warnings to errors (CI mode).",
)
@click.option(
    "--output",
    "output_format",
    type=click.Choice(["human", "github", "json"], case_sensitive=False),
    default="human",
    help="Output format. 'human' is the default; 'github' uses GitHub Actions workflow commands.",
)
def main(
    config_root: Path,
    schemas_dir: Path | None,
    allowlist_path: Path | None,
    strict: bool,
    output_format: str,
) -> None:
    """Validate every JSON config under CONFIG_ROOT against the framework schemas
    and the rule catalog. Default CONFIG_ROOT is './config'.
    """
    try:
        findings = run(config_root, schemas_dir=schemas_dir)
    except FileNotFoundError as e:
        click.echo(f"validate-config: {e}", err=True)
        sys.exit(2)
    except Exception as e:  # pragma: no cover
        click.echo(f"validate-config: internal error: {type(e).__name__}: {e}", err=True)
        sys.exit(3)

    # Allowlist resolution: explicit path > convention path > none.
    if allowlist_path is None:
        conv = config_root / ".validate-config.allowlist.jsonl"
        if conv.exists():
            allowlist_path = conv
    try:
        allowlist = load_allowlist(allowlist_path)
    except ValueError as e:
        click.echo(f"validate-config: {e}", err=True)
        sys.exit(2)

    remaining, suppressed, expired = filter_findings(findings, allowlist)

    # Expired allowlist entries become errors that the team has to revisit.
    for ent in expired:
        remaining.append(
            Finding(
                code="V998",
                severity=Severity.ERROR,
                message=(
                    f"allowlist entry for rule {ent.rule} is older than 90 days and must "
                    f"be either fixed or have its 'added' field renewed"
                ),
                file=allowlist_path,
                rule_url="01-config-schemas.md#7",
            )
        )

    if strict:
        remaining = promote_warnings(remaining)

    if output_format == "github":
        emit_github(remaining, sys.stdout)
    elif output_format == "json":
        emit_json(remaining, suppressed, sys.stdout)
    else:
        emit_human(remaining, suppressed, sys.stdout)

    error_count = sum(1 for f in remaining if f.is_error)
    sys.exit(0 if error_count == 0 else 1)


if __name__ == "__main__":
    main()
