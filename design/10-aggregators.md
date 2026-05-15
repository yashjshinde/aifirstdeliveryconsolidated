---
title: Aggregators — solution-architect and solution-estimate flows
status: live
adr-refs: [ADR-0005, ADR-0009]
last-reviewed: 2026-05-14
owner: design
---

# Aggregators

> Two agents are aggregators: **solution-architect** and **solution-estimate**. Both read across all domain agents' outputs and produce project-level deliverables.

## Aggregation principles

1. **Live read.** Aggregator commands re-read the latest from each domain agent on every invocation. No snapshots, no caching beyond the current run.
2. **No commands on domain agents.** Aggregators consume artefacts (blueprint, spec, plan, FDD) but don't trigger commands on the agents that produced them.
3. **Project-level output.** Aggregator outputs live under `projects/{p}/_aggregator/` (architecture or estimation), not under any domain agent's folder.
4. **No `docScope`.** Aggregators don't produce per-feature FDD/TDD/blueprint — their outputs are inherently project-level.

## Solution Architect

Three commands (see [agents/solution-architect.md](agents/solution-architect.md)):

### `/solution-blueprint`

Reads:

- `projects/{p}/d365-ce/blueprint.md` (domain — accumulated across CE features)
- `projects/{p}/d365-fo/features/*/blueprint.md` (feature — aggregated)
- `projects/{p}/integration/blueprint.md` (domain)
- `projects/{p}/reporting/blueprint.md` (domain)

Produces `projects/{p}/_aggregator/architecture/solution-blueprint.md`:

- System context (C4-L1)
- Container diagram (C4-L2)
- Component diagram per agent (C4-L3) — references each agent's blueprint
- ADR list (cross-agent)

Brownfield mode: enhances the diagram from `projects/{p}/_brownfield/docs-generated/architecture/solution-blueprint.md`.

### `/solution-review`

Cross-agent gap analysis. Identifies inconsistencies across agents (entity references, NFR conflicts, integration contracts that don't reconcile). Produces `projects/{p}/_aggregator/architecture/solution-review-report.md`.

### `/solution-prototype`

Clickable HTML solution prototype. See [agents/solution-architect.md](agents/solution-architect.md) for the full output structure and template tree. Uses the SW form-mockup generator helper (mirrored from d365-ce per [ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md)).

Brownfield mode: side-by-side "as-is vs to-be" views per screen.

## Solution Estimate

Single command (see [agents/solution-estimate.md](agents/solution-estimate.md)):

### `/estimate`

Input auto-discovery hierarchy:

1. Standard inputs folder: `projects/{p}/_aggregator/estimation/inputs/*`
2. Generic project inputs catch-all: `projects/{p}/_inputs/*`
3. Completed agent handoffs: `projects/{p}/_handoffs/`
4. Per-agent specs and plans: `projects/{p}/*/features/*/{spec.md, plan.md}`
5. Nothing found → emit "no inputs found" message with hints

Type auto-detection by content shape (frontmatter, file extension, content shape). See [agents/solution-estimate.md](agents/solution-estimate.md) for details.

Outputs under `projects/{p}/_aggregator/estimation/`:

- `Estimation-BusinessReqDetail.md` — 20-column inventory
- `Estimation-ModuleBuildHrs.md` — per-module factor rollup with auto-calculated hours
- `Estimation-ModuleOverallHrs.md` — merged 5-section deliverable (Module Overall Hrs / Summary Notes / Config-vs-Custom Split / Requirement Hierarchy L1-L5 / Assumptions, Open Questions & Typed Gaps)
- `Estimation-Proposed-Factors.md` — conditional, when factor gaps detected
- `Estimation.xlsx` — optional, multi-sheet (when `--export xlsx`)

## When to invoke aggregators

| Phase of the project | Run aggregators? |
|---|---|
| Pre-sales — only have RFP / requirements doc | **Yes** — `/estimate` and (optionally) `/solution-prototype` for stakeholder demos. Bound to be lower confidence (Confidence Band ±30-40%). |
| Design — specs and plans drafted but not all clarified | `/solution-review` to surface cross-agent inconsistencies. `/estimate` for incremental updates. |
| Build — implementation underway | `/solution-blueprint` to refresh architecture view. `/estimate` rarely (only when scope changes). |
| Reverse-engineering — brownfield-only | `/solution-prototype` in brownfield mode produces as-is views. `/estimate` against brownfield inventory (`/handoff` first publishes `_brownfield/inventory.json`). |

## Cross-aggregator data flow

```
brownfield agent              solution-estimate agent          solution-architect agent
       │                                  │                                  │
       │ /handoff                          │                                  │
       │ → _brownfield/inventory.json     │                                  │
       ├──────────────────────────────────┤                                  │
       │                                  │                                  │
       │                                  │ /estimate (brownfield-aware     │
       │                                  │  multipliers from inventory)     │
       │                                  │                                  │
       │                                  │                                  │ /solution-blueprint
       │                                  │                                  │ (reads all agents' blueprints)
       │                                  │                                  │
       │                                  │                                  │ /solution-prototype
       │                                  │                                  │ (as-is/to-be in brownfield mode)
```

## Aggregator commands and `workflow.yaml`

Aggregator commands are not part of the per-feature gate DAG. They can be invoked at any time. The chat UI's "Ready" pane lists them separately under an "Aggregators" section.

## Why aggregators are agents (not standalone scripts)

Aggregators benefit from the same constitution / template / publish-pipeline infrastructure as domain agents. They:

- Author commands in `agents/{a}/.claude/commands/*.md` ([ADR-0003](adr/0003-single-source-of-truth-commands.md))
- Produce four delivery surfaces via the publish pipeline ([ADR-0002](adr/0002-dual-mode-delivery-surfaces.md))
- Package as Claude plugins ([ADR-0004](adr/0004-self-contained-agent-folders.md))
- Consume the same `doc_lint` rules ([ADR-0010](adr/0010-templates-agent-owned.md))

Distinguishing them as "aggregator" agents is a semantic categorization, not a structural one.

## References

- ADRs: [ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md), [ADR-0009](adr/0009-solution-estimate-consolidated.md)
- Per-agent docs: [agents/solution-architect.md](agents/solution-architect.md), [agents/solution-estimate.md](agents/solution-estimate.md), [agents/brownfield.md](agents/brownfield.md)
- Cross-references: [09-orchestration-patterns.md](09-orchestration-patterns.md) (Pattern 4), [11-mcp-server.md](11-mcp-server.md) (`handoff_list_blueprints`)
