---
agent: solution-architect
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Solution Architect — Charter

## Purpose

Read `blueprint.md`, `tdd.md`, and (for the prototype command) `fdd.md` from every domain agent in a project. Produce three cross-agent aggregator outputs:

1. **`/solution-blueprint`** — unified architecture diagram (system context, container, component levels) + ADR list across agents.
2. **`/solution-review`** — gap analysis report flagging cross-agent inconsistencies (entity references that do not match, NFR conflicts, integration contracts that do not reconcile).
3. **`/solution-prototype`** — interactive clickable HTML solution prototype showcasing the entire solution's UX (persona landings + module hubs + per-entity form mockups + cross-module journey flows + dashboards). Sales-time / stakeholder-demo deliverable per [ADR-0005](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md).

## In scope

- **Aggregation across agents.** Reads from d365-ce, d365-fo, integration, reporting (domain agents that produce blueprints / FDDs / TDDs).
- **Three commands**: `/solution-blueprint`, `/solution-review`, `/solution-prototype`. No base 17.
- **Outputs under `projects/{p}/_aggregator/architecture/`**:
  - `solution-blueprint.md` (Mermaid C4-L1, C4-L2, C4-L3)
  - `solution-review-report.md` (gap analysis)
  - `solution-prototype/` (folder of clickable HTML - index, personas, modules, forms, dashboards, journeys, assets)

## Out of scope

- This agent does NOT author specs / plans / FDDs / TDDs / per-feature blueprints. Domain agents own those.
- Effort estimation: solution-estimate agent.
- ALM round-trip: alm agent.
- Brownfield reverse-engineering: brownfield agent (its inventory feeds the as-is side of the prototype when `project.config.yaml mode: brownfield`).

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| Per-agent blueprint.md (domain blueprints) | the domain agent (d365-ce, d365-fo, etc.) |
| Cross-agent unified blueprint | solution-architect (this agent) |
| Per-entity HTML mockup for d365-ce form authoring | d365-ce agent (`fdd-helpers/form-mockup-generator.prompt.md`) - same helper mirrored here |
| Cross-agent clickable solution prototype (personas + modules + journeys) | solution-architect (`/solution-prototype`) |
| Brownfield as-is architecture | brownfield agent (`_brownfield/docs-generated/architecture/`) |

## Design references

- Agent design doc: [design/agents/solution-architect.md](../../../design/agents/solution-architect.md)
- Governing ADR for the form-mockup helper (mirrored from d365-ce): [ADR-0005](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md)
- Aggregator pattern: [design/10-aggregators.md](../../../design/10-aggregators.md)

## Conventions specific to this agent

- **HTML output, not Markdown** for `/solution-prototype`. The `doc_lint` rules (frontmatter, TOC, Mermaid-only, AI Summary) do NOT apply to the prototype HTML - it has its own QA checklist in [03-prototype-generation-rules.md](03-prototype-generation-rules.md).
- **Form-mockup helper is mirrored from d365-ce.** Both agents own a verbatim copy of the SW Form Generation Prompt at `templates/helpers/form-mockup-generator.prompt.md` (the per-agent autonomy principle from [ADR-0010](../../../design/adr/0010-templates-agent-owned.md) - cheaper than cross-agent helper sharing).
- **Brownfield as-is/to-be views.** When `project.config.yaml mode: brownfield`, the prototype includes side-by-side as-is (from `_brownfield/docs-generated/`) vs to-be (from domain agents' approved FDDs).
