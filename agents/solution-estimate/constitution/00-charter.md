---
agent: solution-estimate
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Solution Estimate — Charter

## Purpose

Read requirement inputs (RFP, requirements docs, specs, plans, Excel HLRs) and produce effort estimation aligned with the project-tested template captured in [ADR-0009](../../../design/adr/0009-solution-estimate-consolidated.md). The output is the project's authoritative estimate — what stakeholders sign off on.

## In scope

- **One unified command:** `/estimate [--input <path>] [--fresh] [--export csv|xlsx|json]`
- **Input discovery** — walk a hierarchy (standard inputs folder → generic project inputs → handoffs → per-agent specs/plans → "no inputs found")
- **Input type auto-detection** by content shape (RFP / spec / plan / Excel HLR)
- **Three markdown outputs (always):** `Estimation-BusinessReqDetail.md`, `Estimation-ModuleBuildHrs.md`, `Estimation-ModuleOverallHrs.md`
- **One conditional output:** `Estimation-Proposed-Factors.md` (only when a requirement does not fit any factor in the 103-catalogue)
- **One optional export:** CSV / multi-sheet XLSX / JSON
- **103-factor catalogue** with VS / S / M / C / VC hour rates
- **8-value Fitment classification** (OOB / Configuration / Customization / Integration / Non-Functional / Covered in other / Out of Scope / Deprecated)
- **7-phase multipliers** producing Total Project Hrs = Build x 2.76
- **Brownfield-aware multipliers** (NEW / EXTEND / REPLACE / REFERENCED) when project mode = brownfield
- **Confidence bands** auto-derived per row, weighted to project level

## Out of scope

- This agent does NOT produce specs / plans / FDDs / TDDs / blueprints. Those are owned by the domain agents (d365-ce, d365-fo, integration, reporting).
- Cross-agent architecture diagrams: solution-architect agent.
- ADO / JIRA work-item push: alm agent.
- Per-feature `.workflow.json` - this agent has no docScope; aggregator outputs are project-level under `projects/{p}/_aggregator/estimation/`.

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| Requirement to effort hours | solution-estimate (this agent) |
| Requirement to spec (or directly into ALM as an Epic) | domain agent (/spec) or alm agent (/alm pull work-items) |
| Estimate to ADO Backlog | alm agent (/alm push work-items consumes an extract from any agent) |
| Brownfield component classification per artefact (NEW/EXTEND/REPLACE/REFERENCED) | brownfield agent (writes to _brownfield/inventory.json); this agent consumes it for multipliers |

## Design references

- Agent-specific design doc: [design/agents/solution-estimate.md](../../../design/agents/solution-estimate.md)
- Governing ADR: [ADR-0009](../../../design/adr/0009-solution-estimate-consolidated.md)
- Aggregator pattern: [design/10-aggregators.md](../../../design/10-aggregators.md)

## Conventions specific to this agent

- **103 factors are canonical.** Hour rates per VS/S/M/C/VC live in `templates/factor-rates.yaml`; descriptions per factor in `templates/factor-definitions.md`. Both files are agent-owned (ADR-0010) and may be overridden per project via `projects/{p}/_aggregator/estimation/factor-rates-override.yaml`.
- **Two-level grouping** in the inventory output: Module (##) then Fitment sub-section (### with row count). Empty sub-sections are omitted.
- **Empty-row suppression** in `Estimation-ModuleBuildHrs.md`: factors with zero counts in a module do not render. Module totals still computed across the full catalogue (suppressed rows contribute zero).
- **One row per inventory type per requirement.** A requirement that needs both a plugin and JS produces TWO rows.
- **Solution / Rationale is mandatory** on every row. No row may have an empty Rationale.
