---
agent: brownfield
sub-area: input-file-types-base
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Input File Types — Platform-Agnostic Rules

> Inputs land under `projects/{p}/_brownfield/input/`. Each platform's accepted file types are detailed in `platforms/{platform}.md`. This file covers cross-platform rules.

## Input folder layout

```
projects/{p}/_brownfield/input/
├── d365-ce/                # Solution ZIPs, exported entities, plugin assemblies
├── d365-fo/                # Deployable packages, model XML, X++ source
├── integration/            # ARM templates, Function App ZIPs, ADF JSON, Logic App definitions
├── reporting/              # PBIX files, RDL files, dataflow JSON
├── power-apps/             # .msapp exports (Canvas), Custom Pages YAML
├── power-pages/            # Site XML exports
├── custom-pages/           # XAML / JSON
└── architecture/           # Optional: existing C4 / sequence diagrams / SOPs
```

`/prepare` validates the presence of expected files per the platforms declared in `project.config.yaml brownfield.platforms`.

## File-handling discipline

### Source preservation

- Inputs are **read-only** during the agent run. Never modify input files in-place.
- Extracted content goes to `_brownfield/extracted/` (temporary working area; cleaned at the start of `/scan`).
- Pretty-print only in extracted derivatives, not in the original input.

### Binary file handling

Binary formats: `.msapp` (Canvas), `.pbix` (Power BI), `.pbit`, `.zip` solution exports, `.axmodelfile`.

| Format | Strategy |
|---|---|
| `.msapp` | Unzip; treat as folder of YAML + JSON (Power Apps source format when available) |
| `.pbix` | Use `pbi-tools` or PBIP source-format when published; otherwise inventory-level only + `BLOCKED-BY-BINARY` gap |
| `.zip` (solution) | Unzip; analyse XML payload (`Entities/*/Entity.xml`, `Workflows/*.xml`, etc.) |
| `.axmodelfile` | Unpack via `ModelUtil.exe`; analyse X++ source |
| `.dll` (plugin assembly) | Read assembly metadata with reflection-style read-only inspection; for full logic, require source code |

For binary inputs without companion source: `validate_power_apps_depth` enforces an inventory-level-only doc + `BLOCKED-BY-BINARY` gap.

### Encoding

- Source XML / JSON: read as UTF-8; tolerate BOM
- Source `.cs` / `.ts` / `.js` / `.xpp`: UTF-8 expected; flag non-UTF-8 inputs with `MISSING-INPUT` gap
- Output: always UTF-8 no-BOM (per [12-publish-pipeline.md](../../../design/12-publish-pipeline.md) cross-cutting rule)

### Secret redaction

Before extraction emits to disk:

- Connection strings → `{{REDACTED-CONNECTION-STRING}}`
- Account keys → `{{REDACTED-KEY}}`
- OAuth client secrets → `{{REDACTED-SECRET}}`
- Passwords (any field named password/pwd/secret/key) → `{{REDACTED}}`

Pattern: `tools/mcp-server/groups/brownfield-engine/extractor.ts` applies a deny-list regex prior to write.

## Pre-flight input validation

`/prepare` runs the following checks before `/scan` is allowed:

1. **Folder existence** — every platform in `project.config.yaml brownfield.platforms` has a folder under `_brownfield/input/`
2. **Manifest presence** — solution `.zip` containing a top-level `solution.xml`; FO model containing a `Descriptor.xml`; ADF folder containing `ARMTemplateForFactory.json`; etc.
3. **Read permission** — every file under `_brownfield/input/` is readable
4. **Size sanity** — large files (>500 MB single file) flagged with a warning; agent proceeds but reviewer should confirm scan strategy

Pre-flight failure → `MISSING-INPUT` gap entries; `/scan` aborts when blockers present.

## Idempotency

- `/scan` is idempotent on the **same** input set — same `inventory.json` produced
- `/document` is idempotent on the **same** inventory — same outputs produced (modulo retry attempts; the focused-prompt feedback loop is deterministic once a seed is set, but LLM stochasticity may cause minor variance between runs)
- Re-running `/generate` with no input changes → diff should be empty per [12-publish-pipeline.md § drift check](../../../design/12-publish-pipeline.md)

## See also

- [`platforms/d365-ce.md`](platforms/d365-ce.md)
- [`platforms/d365-fo.md`](platforms/d365-fo.md)
- [`platforms/integration.md`](platforms/integration.md)
- [`platforms/reporting.md`](platforms/reporting.md)
- [`platforms/power-platform.md`](platforms/power-platform.md)
