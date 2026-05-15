"""dataflow-codegen CLI.

Reads /config/entities/*.json (plus /config/_project.json) and writes
/adf/dataflows/generated/df_transform_<entityKey>_inbound.json per entity.

Exit codes:
  0  all generated successfully
  1  one or more entities failed (e.g. malformed config)
  2  bad arguments
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import click

from .generator import (
    generate_inbound_dataflow,
    generate_outbound_dataflow,
    generate_phase2_dataflow,
    write_dataflow_arm,
)


@click.command()
@click.option(
    "--config-root",
    type=click.Path(exists=True, file_okay=False, dir_okay=True, path_type=Path),
    default=Path("config"),
    help="Root of the /config/ tree (default: ./config).",
)
@click.option(
    "--out-dir",
    type=click.Path(file_okay=False, path_type=Path),
    default=Path("adf/dataflows/generated"),
    help="Where to write the generated ARM JSON (default: ./adf/dataflows/generated).",
)
@click.option(
    "--entity",
    type=str,
    default=None,
    help="Generate for one entity only (e.g. customer). Default: all entities.",
)
def main(config_root: Path, out_dir: Path, entity: str | None) -> None:
    """Generate ADF Mapping Data Flow ARM JSON for every entity in CONFIG_ROOT."""
    project_path = config_root / "_project.json"
    project = json.loads(project_path.read_text(encoding="utf-8")) if project_path.exists() else {}

    entities_dir = config_root / "entities"
    if not entities_dir.exists():
        click.echo(f"dataflow-codegen: no entities directory at {entities_dir}", err=True)
        sys.exit(2)

    paths = sorted(entities_dir.glob("*.json"))
    if entity:
        paths = [p for p in paths if p.stem == entity]
    if not paths:
        click.echo("dataflow-codegen: no entity configs found", err=True)
        sys.exit(1)

    failed: list[Path] = []
    for ep in paths:
        try:
            cfg = json.loads(ep.read_text(encoding="utf-8"))
            direction = cfg.get("direction", "inbound")
            if direction in {"inbound", "bidirectional"}:
                arm = generate_inbound_dataflow(cfg, project)
                target = out_dir / f"{arm['name']}.json"
                write_dataflow_arm(arm, target)
                click.echo(f"  wrote {target}")
                # B015: phase-2 data flow (only when entity has loadPhase:2 fields)
                phase2_arm = generate_phase2_dataflow(cfg, project)
                if phase2_arm:
                    target = out_dir / f"{phase2_arm['name']}.json"
                    write_dataflow_arm(phase2_arm, target)
                    click.echo(f"  wrote {target}")
            if direction in {"outbound", "bidirectional"}:
                arm = generate_outbound_dataflow(cfg, project)
                target = out_dir / f"{arm['name']}.json"
                write_dataflow_arm(arm, target)
                click.echo(f"  wrote {target}")
            if direction not in {"inbound", "outbound", "bidirectional"}:
                click.echo(f"  skip {ep.name} (direction={direction})")
        except Exception as e:
            click.echo(f"  FAIL {ep.name}: {type(e).__name__}: {e}", err=True)
            failed.append(ep)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
