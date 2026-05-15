# solution-architect

> Aggregator: reads per-agent blueprints, FDDs, and TDDs and produces three cross-agent deliverables — the unified blueprint, a cross-agent gap review report, and an interactive clickable HTML solution prototype. Per [design/agents/solution-architect.md](../../design/agents/solution-architect.md) and [ADR-0005](../../design/adr/0005-d365-ce-multi-file-sub-platform.md).

## What

The solution-architect agent makes the whole-solution view visible:

- **`/solution-blueprint`** — synthesises every agent's blueprint into a single C4-style unified diagram set (System Context / Containers / Components-per-agent) plus a reconciled NFR matrix and cross-agent integration contracts table.
- **`/solution-review`** — cross-agent gap analysis. Surfaces entity-name mismatches, NFR conflicts, integration-contract drift, missing upstream blueprints, ownership conflicts, orphan components, and unreconciled ADR citations.
- **`/solution-prototype`** — clickable HTML prototype showing persona landings, module hubs, per-entity form mockups, dashboards, and cross-module journey flows. Sales-time / stakeholder-demo deliverable.

This agent does NOT author specs / plans / FDDs / TDDs / per-feature blueprints — domain agents own those. Effort estimation is `solution-estimate`'s domain. ALM round-trip is `alm`'s domain.

## How

- **First architecture review** — after the domain agents have authored their initial blueprints, run `/solution-blueprint`. Expect a sparse unified diagram (only the agents that have outputs); use `/solution-review` to surface gaps.
- **Gap analysis any time** — run `/solution-review` to get a fresh report. It does not block; it surfaces inconsistencies for the affected agents to resolve.
- **Stakeholder demo** — run `/solution-prototype` to produce the clickable HTML. Open `solution-prototype/index.html` or serve it via `python -m http.server 8080`.
- **Brownfield mode** — set `project.config.yaml mode: brownfield`; every output renders side-by-side as-is + to-be views (sourced from the brownfield agent's `_brownfield/docs-generated/` when Phase 7 builds it).

## Details

- **Constitution** *(agent-owned per [ADR-0010](../../design/adr/0010-templates-agent-owned.md))*:
  - [constitution/00-charter.md](constitution/00-charter.md) — purpose, in/out of scope, boundaries
  - [constitution/01-architecture-principles.md](constitution/01-architecture-principles.md) — 7 principles enforced when synthesising the unified blueprint
  - [constitution/02-aggregation-rules.md](constitution/02-aggregation-rules.md) — source discovery + synthesis rules per command
  - [constitution/03-prototype-generation-rules.md](constitution/03-prototype-generation-rules.md) — design tokens + 6-layer layout + QA checklist for the HTML prototype

- **Templates**:
  - [blueprint.template.md](templates/blueprint.template.md) — `/solution-blueprint` output template
  - [solution-review-report.template.md](templates/solution-review-report.template.md) — `/solution-review` output template
  - [helpers/form-mockup-generator.prompt.md](templates/helpers/form-mockup-generator.prompt.md) — per-entity form rendering helper (PORTED VERBATIM from SW; mirrored from d365-ce per per-agent autonomy)
  - [solution-prototype/_index.template.html](templates/solution-prototype/_index.template.html) — master shell
  - [solution-prototype/navigation.template.html](templates/solution-prototype/navigation.template.html) — reusable nav fragments
  - [solution-prototype/persona-landing.template.html](templates/solution-prototype/persona-landing.template.html) — per-persona day-1 view
  - [solution-prototype/module-hub.template.html](templates/solution-prototype/module-hub.template.html) — Sales/Service/etc. hub
  - [solution-prototype/journey-flow.template.html](templates/solution-prototype/journey-flow.template.html) — multi-screen cross-module journey
  - [solution-prototype/dashboard.template.html](templates/solution-prototype/dashboard.template.html) — dashboard mockup
  - [solution-prototype/_assets/d365-tokens.css](templates/solution-prototype/_assets/d365-tokens.css) — D365 design tokens
  - [solution-prototype/_assets/prototype.css](templates/solution-prototype/_assets/prototype.css) — cross-page layout
  - [solution-prototype/_assets/prototype.js](templates/solution-prototype/_assets/prototype.js) — interactive behaviours

- **Commands**:
  - [.claude/commands/solution-blueprint.md](.claude/commands/solution-blueprint.md)
  - [.claude/commands/solution-review.md](.claude/commands/solution-review.md)
  - [.claude/commands/solution-prototype.md](.claude/commands/solution-prototype.md)

- **Design doc**: [design/agents/solution-architect.md](../../design/agents/solution-architect.md)
- **Related ADRs**:
  - [ADR-0005](../../design/adr/0005-d365-ce-multi-file-sub-platform.md) (form-mockup helper origin; mirrored here)
  - [ADR-0010](../../design/adr/0010-templates-agent-owned.md) (templates + constitution agent-owned)
  - [ADR-0001](../../design/adr/0001-review-scope-spec-only.md) (no `/review` for this aggregator)

## Outputs

All under `projects/{p}/_aggregator/architecture/`:

- `solution-blueprint.md` (from `/solution-blueprint`)
- `solution-review-report.md` (from `/solution-review`)
- `solution-prototype/` folder (from `/solution-prototype`)

## What this agent does NOT do

- Does NOT author per-agent blueprints. That's each domain agent's `/blueprint` command.
- Does NOT enforce per-agent FDD/TDD quality. That's `doc_lint` inside each domain agent's `/fdd` and `/tdd`.
- Does NOT push to ADO / JIRA. That's the `alm` agent (consuming a handoff from any agent that runs `/alm-extract`).
- Does NOT estimate effort. That's `solution-estimate`.
