# solution-estimate

> Aggregator: reads requirement inputs and produces the project's authoritative effort estimate. 103-factor catalogue, 8-value Fitment classification, 7 phases (×2.76 total project multiplier), brownfield-aware multipliers, confidence bands. Per [ADR-0009](../../design/adr/0009-solution-estimate-consolidated.md).

## What

The solution-estimate agent produces a stakeholder-grade effort estimate from any combination of upstream input (RFP, requirements doc, Excel HLR, per-agent spec.md, per-agent plan.md). Output is **three markdown files + one optional conditional file + one optional export**. Estimates account for brownfield component classification (NEW / EXTEND / REPLACE / REFERENCED) and surface per-row confidence bands rolled up to a project-level band (±10% to ±40%).

This agent does NOT author specs / plans / FDDs / TDDs / blueprints — those are owned by the domain agents (`d365-ce`, `d365-fo`, `integration`, `reporting`). Cross-agent architecture diagrams are owned by `solution-architect`. ALM round-trip is owned by `alm`.

## How

- **First estimate (RFP only)** — drop the RFP at `projects/{p}/_aggregator/estimation/inputs/rfp.docx`, then run `/estimate`. Expect wide confidence bands (±30% to ±40%) and many Open Questions.
- **Refined estimate (after domain agents)** — re-run `/estimate` with no flags; the agent re-discovers inputs including per-agent specs/plans and tightens the bands.
- **Add a new requirement source** — drop it under `inputs/`, re-run `/estimate` (default is incremental: prior rows + manual `Solution / Rationale` overrides are preserved where Req IDs match).
- **Export for spreadsheet review** — `/estimate --export xlsx` produces a multi-sheet workbook.
- **Brownfield project** — set `project.config.yaml mode: brownfield`; `/estimate` pulls component classification from `agents/brownfield/_brownfield/inventory.json` (built by Phase 7) and applies per-row multipliers.
- **Proposed factor gate** — if `project.config.yaml estimation.factorReviewGate: true`, any factor-gap requirement blocks the final deliverable until reviewed in `Estimation-Proposed-Factors.md`.

## Details

- **Constitution** *(agent-owned per [ADR-0010](../../design/adr/0010-templates-agent-owned.md))*:
  - [constitution/00-charter.md](constitution/00-charter.md) — purpose + in/out of scope + boundaries with adjacent agents
  - [constitution/01-template-alignment.md](constitution/01-template-alignment.md) — the 3 outputs + their column shapes + 7 key rules
  - [constitution/02-factor-definitions.md](constitution/02-factor-definitions.md) — factor selection heuristic + 5-level complexity model + override path
  - [constitution/03-fitment-classification.md](constitution/03-fitment-classification.md) — 8-value Fitment decision tree
  - [constitution/04-categorization-rules.md](constitution/04-categorization-rules.md) — L1-L5 hierarchy derivation

- **Templates**:
  - **Data files** (canonical sources — overridable per project):
    - [factor-rates.yaml](templates/factor-rates.yaml) — 103-factor catalogue with VS/S/M/C/VC hour rates
    - [factor-definitions.md](templates/factor-definitions.md) — per-factor complexity descriptions
    - [phase-multipliers.yaml](templates/phase-multipliers.yaml) — 7 phases (×2.76 total)
    - [brownfield-multipliers.yaml](templates/brownfield-multipliers.yaml) — NEW/EXTEND/REPLACE/REFERENCED/N/A
    - [confidence-levels.yaml](templates/confidence-levels.yaml) — 5 bands (±10% to ±40%)
    - [module-detection.yaml](templates/module-detection.yaml) — L2 (Module) classification; shared with brownfield agent
  - **Output templates** (consumed by `/estimate`):
    - [business-req-detail.template.md](templates/business-req-detail.template.md) — Output 1
    - [module-build-hrs.template.md](templates/module-build-hrs.template.md) — Output 2
    - [module-overall-hrs.template.md](templates/module-overall-hrs.template.md) — Output 3 (the stakeholder deliverable; 5 sections)
    - [proposed-factors.template.md](templates/proposed-factors.template.md) — Output 4 (conditional; factor-gap gate)

- **Commands**:
  - [.claude/commands/estimate.md](.claude/commands/estimate.md) — the single command (no base 17 — this is an aggregator)

- **Design doc**: [design/agents/solution-estimate.md](../../design/agents/solution-estimate.md)
- **Related ADRs**:
  - [ADR-0009 — Solution-estimate consolidated `/estimate` + 103-factor catalogue + 7 phases](../../design/adr/0009-solution-estimate-consolidated.md)
  - [ADR-0010 — Templates and constitution agent-owned](../../design/adr/0010-templates-agent-owned.md) (this agent owns its data files outright)
  - [ADR-0001 — `/review` scoped to spec only](../../design/adr/0001-review-scope-spec-only.md) (no `/review` for this aggregator)

## What this agent does NOT do

- Does NOT author specs, plans, FDDs, TDDs, blueprints. Those live in the domain agents.
- Does NOT push to ADO / JIRA. That's the `alm` agent.
- Does NOT classify brownfield components — it consumes that classification from the `brownfield` agent's `_brownfield/inventory.json`.
- Does NOT enforce gates via `.workflow.json` — this agent is an aggregator with no per-feature workflow state.

## Per-project overrides

All template files in this agent are overridable per project under `projects/{p}/_aggregator/estimation/`:

- `factor-rates-override.yaml`
- `factor-definitions-override.md`
- `phase-multipliers-override.yaml`
- `brownfield-multipliers-override.yaml`
- `confidence-levels-override.yaml`
- `module-detection-override.yaml`

Per [ADR-0010](../../design/adr/0010-templates-agent-owned.md) two-layer model: project override wins per-key; canonical falls back.
