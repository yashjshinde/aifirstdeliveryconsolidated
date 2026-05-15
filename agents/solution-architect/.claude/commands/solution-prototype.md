---
description: Generate a clickable HTML solution prototype showcasing persona landings, module hubs, per-entity form mockups, dashboards, and cross-module journey flows.
agent: solution-architect
---

# /solution-prototype

> Produce an interactive clickable HTML prototype of the entire solution. Sales-time / stakeholder-demo deliverable per [ADR-0005](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md). Per [constitution/03-prototype-generation-rules.md](../../constitution/03-prototype-generation-rules.md).

## Usage

```
/solution-prototype [--persona <name>] [--module <name>] [--journey <name>] [--include forms|navigation|dashboards|all] [--project <name>]
```

| Flag | Behavior |
|---|---|
| `--persona <name>` | Focus on one persona's view |
| `--module <name>` | Focus on one module hub |
| `--journey <name>` | Focus on one cross-module journey |
| `--include` | Limit prototype scope to subset (default: `all`) |
| `--project <name>` | Override project resolved from cwd |

Bare `/solution-prototype` generates the FULL prototype (every persona + every module + every entity form + every journey + every dashboard).

## Inputs (aggregated across agents)

| Input | Source |
|---|---|
| Personas | `projects/{p}/project.config.yaml personas:` (or auto-detected from spec.md persona sections if not declared) |
| Modules | `agents-enabled` + each domain agent's FDD §3 (User Scenarios) |
| Entities | Domain agents' FDD §7 (Entity Model) |
| Apps (model-driven, Canvas, Power Pages) | `agents/d365-ce/` and `projects/{p}/d365-ce/fdd.md` |
| Journeys | spec.md user scenarios across all agents |
| Brownfield as-is | `_brownfield/docs-generated/` when `project.config.yaml mode: brownfield` |

## Execution flow

1. Resolve project + read `project.config.yaml`.
2. Discover personas (config → fallback: extract from spec.md persona sections).
3. Discover modules (`agents-enabled` filtered to domain agents).
4. Discover entities (FDD §7 per agent).
5. Discover journeys (spec.md user scenarios; map cross-module).
6. Apply `--persona` / `--module` / `--journey` / `--include` filters.
7. Render each page:
   - `index.html` from [_index.template.html](../../templates/solution-prototype/_index.template.html)
   - `personas/{slug}.html` from [persona-landing.template.html](../../templates/solution-prototype/persona-landing.template.html) (one per persona)
   - `modules/{slug}.html` from [module-hub.template.html](../../templates/solution-prototype/module-hub.template.html) (one per module)
   - `forms/{entity}.html` via [helpers/form-mockup-generator.prompt.md](../../templates/helpers/form-mockup-generator.prompt.md) (one per entity)
   - `dashboards/{slug}.html` from [dashboard.template.html](../../templates/solution-prototype/dashboard.template.html) (one per dashboard)
   - `journeys/{slug}.html` from [journey-flow.template.html](../../templates/solution-prototype/journey-flow.template.html) (one per journey)
8. Copy `assets/` (d365-tokens.css + prototype.css + prototype.js) into the output folder.
9. **Brownfield mode**: render side-by-side as-is/to-be views per page.
10. Run the QA checklist from [constitution/03-prototype-generation-rules.md § QA checklist](../../constitution/03-prototype-generation-rules.md). BLOCKER findings fail the write.
11. Write `README.md` in the output folder with a walkthrough script for stakeholders.

## Output

`projects/{p}/_aggregator/architecture/solution-prototype/` containing:

- `index.html` (master shell)
- `personas/*.html` (one per persona)
- `modules/*.html` (one per module)
- `forms/*.html` (one per entity)
- `dashboards/*.html` (one per dashboard)
- `journeys/*.html` (one per cross-module journey)
- `assets/d365-tokens.css`, `assets/prototype.css`, `assets/prototype.js`
- `README.md` (walkthrough script + how to view)

## How to view

```
# Open the prototype in a browser:
start projects/{p}/_aggregator/architecture/solution-prototype/index.html

# Or serve via a simple HTTP server (Python or Node):
cd projects/{p}/_aggregator/architecture/solution-prototype
python -m http.server 8080
# then http://localhost:8080
```

## Idempotency

Re-running with no source changes produces identical content per page (content-hash compared; no-op writes). Run with `--persona` / `--module` / `--journey` to scope down for quick iterations.

## See also

- [constitution/03-prototype-generation-rules.md](../../constitution/03-prototype-generation-rules.md) — design tokens + 6-layer layout + QA checklist
- [helpers/form-mockup-generator.prompt.md](../../templates/helpers/form-mockup-generator.prompt.md) — per-entity form rendering
- [solution-prototype/*](../../templates/solution-prototype/) — 6 page templates + 3 assets
- [design/agents/solution-architect.md](../../../design/agents/solution-architect.md)
