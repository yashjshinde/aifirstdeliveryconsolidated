"""excel-to-json CLI.

Exit codes:
  0  one or more sheets converted successfully
  1  workbook unreadable or zero sheets recognized
  2  bad arguments
"""
from __future__ import annotations

import sys
from pathlib import Path

import click

from .converter import convert_workbook


@click.command()
@click.argument(
    "workbook",
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
)
@click.option(
    "-o", "--out-dir",
    type=click.Path(file_okay=False, path_type=Path),
    default=Path("config/entities"),
    help="Output directory (default: config/entities)",
)
def main(workbook: Path, out_dir: Path) -> None:
    """Convert WORKBOOK (an .xlsx mapping spreadsheet) into one JSON per sheet
    under OUT_DIR, conforming to /config/schemas/entity-mapping.schema.json.

    The output JSONs intentionally leave certain Dataverse-specific fields
    (entitySetName, navigationProperty) blank — those require a human pass
    against the Dataverse metadata before the config is usable.
    """
    try:
        written = convert_workbook(workbook, out_dir)
    except Exception as e:
        click.echo(f"excel-to-json: {type(e).__name__}: {e}", err=True)
        sys.exit(1)
    if not written:
        click.echo(f"excel-to-json: zero sheets recognized in {workbook}", err=True)
        sys.exit(1)
    for p in written:
        click.echo(f"wrote {p}")
    click.echo(f"\nNote: run validate-config to check the generated files; "
               f"expect TODOs for lookup.entitySetName/navigationProperty.")
    sys.exit(0)


if __name__ == "__main__":
    main()
