# solution-estimate

> Aggregator: reads requirement inputs and produces the project's authoritative effort estimate. 103-factor catalogue, 8-value Fitment classification, 7 phases (×2.76 total project multiplier), brownfield-aware multipliers, confidence bands, and (NEW post-ADR-0012) **Requirement Level L1-L5 business-process taxonomy** as a first-class column on the inventory. Per [ADR-0009](../../design/adr/0009-solution-estimate-consolidated.md) and [ADR-0012](../../design/adr/0012-requirement-level-taxonomy.md).

## Quick reference

Run the single agent command with any combination of these flags. **Bare `/estimate` is the typical invocation** — every flag is optional.

| Flag | Purpose |
|---|---|
| `--input <path>` | Override the auto-discovery walk; point to a specific file or folder |
| `--fresh` | Force clean rebuild; discards prior manual overrides |
| `--export csv\|xlsx\|json` | Also produce a portable export file alongside the markdown outputs |
| `--export-to <path>` | Override the export file path |
| `--project <name>` | Project selector (auto-resolves from cwd when omitted) |
| `--preserve-manual-overrides` | Keep manual edits to Rationale / Assumptions / Open Questions across runs (default `true`) |

See the [full command body](.claude/commands/estimate.md) for the complete contract — usage, examples, common workflows, hard rules, and export semantics. The command body is the canonical reference; this README is the orientation surface.

## What

The solution-estimate agent produces a stakeholder-grade effort estimate from any combination of upstream input (RFP, requirements doc, Excel HLR, per-agent spec.md, per-agent plan.md). Output is **three markdown files + one optional conditional file + one optional export**. Estimates account for brownfield component classification (NEW / EXTEND / REPLACE / REFERENCED) and surface per-row confidence bands rolled up to a project-level band (±10% to ±40%).

**Every requirement row carries TWO orthogonal classifications:**

1. **Requirement Level (`L1` / `L2` / `L3` / `L4` / `L5`)** — the **business-process taxonomy**. Single column on every output surface (NEVER split into 5 columns on XLSX/CSV/JSON). Per [ADR-0012](../../design/adr/0012-requirement-level-taxonomy.md):

   | Level | Name | Description | Example |
   |---|---|---|---|
   | **L1** | Category / Enterprise View | Top-level value chain / domain | Supply Chain Management, Customer Engagement |
   | **L2** | Process Group | End-to-end process cycle | Procure-to-Pay, Case-to-Resolution |
   | **L3** | Process / Sub-Process | Specific process with handoffs + decisions | Create Purchase Order, Triage Case |
   | **L4** | Activity | Single activity within a process | Approve Invoice, Assign Case Owner |
   | **L5** | Task / Work Instruction | UI action / system task | Click "Save", Fill in Tax ID |

2. **Estimation Hierarchy (`Project > Module > Capability > Feature > Factor`)** — the agent's **effort-rollup tree**. Used to aggregate hours by module / capability / feature for project-management reporting. Single column on markdown; splits into 5 named columns on XLSX export (NEVER as L1-L5 — those labels are reserved for Requirement Level). Per [04-categorization-rules.md](constitution/04-categorization-rules.md).

The two are orthogonal. The Stakeholder deliverable `Estimation-ModuleOverallHrs.md` rolls both up: `§4 Estimation Hierarchy` (Project / Module / Capability / Feature / Factor) + the **new** `§4.5 Requirement Level Distribution` (count + hours per L1-L5 level + Mermaid pie + cross-tab Module × Level).

This agent does NOT author specs / plans / FDDs / TDDs / blueprints — those are owned by the domain agents (`d365-ce`, `d365-fo`, `integration`, `reporting`). Cross-agent architecture diagrams are owned by `solution-architect`. ALM round-trip is owned by `alm`.

## How

- **First estimate (RFP only)** — drop the RFP at `projects/{p}/_aggregator/estimation/inputs/rfp.docx`, then run `/estimate`. Expect wide confidence bands (±30% to ±40%) and many Open Questions.
- **Export to Excel for spreadsheet review** — `/estimate --export xlsx` produces a multi-sheet workbook. The Requirement Level column is a **single column** on every sheet.
- **Refined estimate (after domain agents)** — re-run `/estimate` with no flags; the agent re-discovers inputs including per-agent specs/plans and tightens the bands.
- **Add a new requirement source** — drop it under `inputs/`, re-run `/estimate` (default is incremental: prior rows + manual `Solution / Rationale` overrides are preserved where Req IDs match).
- **Round-trip with QA** — `/estimate --export xlsx --export-to qa.xlsx` → QA edits the Requirement Level / Priority / Confidence / Open Questions → re-drop edited file under `inputs/` → run `/estimate` to ingest the edits.
- **Brownfield project** — set `project.config.yaml mode: brownfield`; `/estimate` pulls component classification from `agents/brownfield/_brownfield/inventory.json` (built by Phase 7) and applies per-row multipliers.
- **Proposed factor gate** — if `project.config.yaml estimation.factorReviewGate: true`, any factor-gap requirement blocks the final deliverable until reviewed in `Estimation-Proposed-Factors.md`.

For copy-paste-ready invocations and end-to-end workflow narratives, see [`.claude/commands/estimate.md § Examples`](.claude/commands/estimate.md#examples) and [`§ Common workflows`](.claude/commands/estimate.md#common-workflows).

## Details

- **Constitution** *(agent-owned per [ADR-0010](../../design/adr/0010-templates-agent-owned.md))*:
  - [constitution/00-charter.md](constitution/00-charter.md) — purpose + in/out of scope + boundaries with adjacent agents
  - [constitution/01-template-alignment.md](constitution/01-template-alignment.md) — the 3 outputs + their column shapes + 7 key rules + the new Requirement Level rule
  - [constitution/02-factor-definitions.md](constitution/02-factor-definitions.md) — factor selection heuristic + 5-level complexity model + override path
  - [constitution/03-fitment-classification.md](constitution/03-fitment-classification.md) — 8-value Fitment decision tree
  - [constitution/04-categorization-rules.md](constitution/04-categorization-rules.md) — **Estimation Hierarchy** derivation (Project / Module / Capability / Feature / Factor)
  - [constitution/05-requirement-levels.md](constitution/05-requirement-levels.md) — **Requirement Level** taxonomy (L1-L5 business-process) + classification heuristic *(NEW post-ADR-0012)*

- **Templates**:
  - **Data files** (canonical sources — overridable per project):
    - [factor-rates.yaml](templates/factor-rates.yaml) — 103-factor catalogue with VS/S/M/C/VC hour rates
    - [factor-definitions.md](templates/factor-definitions.md) — per-factor complexity descriptions
    - [phase-multipliers.yaml](templates/phase-multipliers.yaml) — 7 phases (×2.76 total)
    - [brownfield-multipliers.yaml](templates/brownfield-multipliers.yaml) — NEW/EXTEND/REPLACE/REFERENCED/N/A
    - [confidence-levels.yaml](templates/confidence-levels.yaml) — 5 bands (±10% to ±40%)
    - [module-detection.yaml](templates/module-detection.yaml) — Module classification; shared with brownfield agent
  - **Output templates** (consumed by `/estimate`):
    - [business-req-detail.template.md](templates/business-req-detail.template.md) — Output 1 (21-column inventory incl. Requirement Level)
    - [module-build-hrs.template.md](templates/module-build-hrs.template.md) — Output 2 (per-module factor rollup)
    - [module-overall-hrs.template.md](templates/module-overall-hrs.template.md) — Output 3 (stakeholder deliverable; 5 sections + §4.5 Requirement Level Distribution)
    - [proposed-factors.template.md](templates/proposed-factors.template.md) — Output 4 (conditional; factor-gap gate)

- **Commands**:
  - [.claude/commands/estimate.md](.claude/commands/estimate.md) — the single command (rebuilt 2026-05-15 against [design/17-command-doc-standard.md](../../design/17-command-doc-standard.md) per DEFECT-002)

- **Design doc**: [design/agents/solution-estimate.md](../../design/agents/solution-estimate.md)
- **Related ADRs**:
  - [ADR-0009 — Solution-estimate consolidated `/estimate` + 103-factor catalogue + 7 phases](../../design/adr/0009-solution-estimate-consolidated.md)
  - [ADR-0012 — Requirement Level L1-L5 business-process taxonomy](../../design/adr/0012-requirement-level-taxonomy.md) *(NEW 2026-05-15)*
  - [ADR-0010 — Templates and constitution agent-owned](../../design/adr/0010-templates-agent-owned.md) (this agent owns its data files outright)
  - [ADR-0001 — `/review` scoped to spec only](../../design/adr/0001-review-scope-spec-only.md) (no `/review` for this aggregator)

## What this agent does NOT do

- Does NOT author specs, plans, FDDs, TDDs, blueprints. Those live in the domain agents.
- Does NOT push to ADO / JIRA. That's the `alm` agent.
- Does NOT classify brownfield components — it consumes that classification from the `brownfield` agent's `_brownfield/inventory.json`.
- Does NOT enforce gates via `.workflow.json` — this agent is an aggregator with no per-feature workflow state.
- Does NOT split `Requirement Level` into 5 columns on XLSX export. (User-requirement per DEFECT-001 — single column always.)

## Per-project overrides

All template files in this agent are overridable per project under `projects/{p}/_aggregator/estimation/`:

- `factor-rates-override.yaml`
- `factor-definitions-override.md`
- `phase-multipliers-override.yaml`
- `brownfield-multipliers-override.yaml`
- `confidence-levels-override.yaml`
- `module-detection-override.yaml`
- `requirement-levels-override.md` *(NEW post-ADR-0012 — override the classification heuristic per project; e.g., when a customer uses a different process-decomposition vocabulary)*

Per [ADR-0010](../../design/adr/0010-templates-agent-owned.md) two-layer model: project override wins per-key; canonical falls back.

## Revision history

- **2026-05-15** — Rebuilt `/estimate` command body against the new [design/17-command-doc-standard.md](../../design/17-command-doc-standard.md) per DEFECT-002 (Quick reference table + 6 examples + 4 common workflows + above-the-fold flag list). Added `Requirement Level` column + `Estimation Hierarchy` rename per ADR-0012 / DEFECT-001. See implementation log entries `2026-05-15-007` and `2026-05-15-008`.
- **2026-05-14** — Initial Phase 5 build.
