---
description: Read requirement inputs and produce the project estimate (3 markdown outputs + optional conditional 4th + optional file export). Single unified command per ADR-0009.
agent: solution-estimate
phase: ESTIMATE
gates: []
doc-revision: 2026-05-15
doc-revision-reason: Rebuilt against design/17-command-doc-standard.md per DEFECT-002 + added Requirement Level (L1-L5 per ADR-0012) per DEFECT-001
---

# /estimate

> Single unified command for solution effort estimation. Reads requirement inputs (RFP, requirements docs, specs, plans, Excel HLRs) and produces the project's authoritative estimate. Per [ADR-0009](../../../design/adr/0009-solution-estimate-consolidated.md). Inventory now carries a **Requirement Level** column (L1-L5 business-process taxonomy) per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md). Documentation conforms to [design/17-command-doc-standard.md](../../../design/17-command-doc-standard.md).

## Quick reference

| Flag | Required? | Default | Purpose |
|---|---|---|---|
| `--input <path>` | no | walks discovery hierarchy | Override the input-discovery walk; point to a specific file or folder |
| `--fresh` | no | incremental (default) | Force clean rebuild from scratch; discards prior manual `Solution / Rationale` overrides |
| `--export <format>` | no | none (markdown only) | Also produce a portable export file: `csv` / `xlsx` / `json` |
| `--export-to <path>` | no | `projects/{p}/_aggregator/estimation/Estimation.<format>` | Override the export file path |
| `--project <name>` | no | resolved from cwd | Project selector |
| `--preserve-manual-overrides` | no | `true` (default) | Keep manual edits to `Solution / Rationale` / `Assumptions` / `Open Questions` columns where Req IDs match between runs |

## Usage

```
/estimate [--input <path>] [--fresh] [--export csv|xlsx|json] [--export-to <path>] [--project <name>] [--preserve-manual-overrides]
```

Bare `/estimate` (no flags) is the typical invocation — it walks the input-discovery hierarchy, ingests everything found, and writes three markdown outputs. All flags are optional.

## Examples

### Example 1 — Most common: first estimate from an RFP

```
/estimate
```

User has dropped an RFP at `projects/{p}/_aggregator/estimation/inputs/rfp.docx`. The agent auto-discovers it, ingests, classifies, sizes, and emits three markdown files. No flags required.

### Example 2 — Export to Excel for spreadsheet review (the DEFECT-002 case)

```
/estimate --export xlsx
```

Same as Example 1 plus produces `Estimation.xlsx` — a multi-sheet workbook (BusinessReqDetail / ModuleBuildHrs / ModuleOverallHrs / FitmentSummary / RequirementLevelSummary / EstimationHierarchy / ConfidenceDistribution / BrownfieldStatus / Assumptions / FactorRates / ProposedFactors). Hand to QA / business analyst for offline review.

### Example 3 — Refresh after domain agents have run

```
/estimate
```

Same bare invocation; the agent re-discovers inputs including per-agent `spec.md` / `plan.md` files under `projects/{p}/{agent}/features/{f}/`. Confidence bands tighten as input quality improves. Manual `Solution / Rationale` overrides preserved (per `--preserve-manual-overrides` default).

### Example 4 — Force clean rebuild

```
/estimate --fresh
```

Discards prior rows including manual overrides. Use when source inputs have changed substantially (e.g., a re-baselined RFP) and incremental merge would leave stale data.

### Example 5 — Point at an ad-hoc input file outside the standard hierarchy

```
/estimate --input C:\Users\me\Desktop\customer-requirements.xlsx
```

Skips auto-discovery; ingests only the file at the given path. Useful for one-off "what would this scope estimate to?" exercises before committing the file to `inputs/`.

### Example 6 — Export to JSON for tool-to-tool exchange

```
/estimate --export json --export-to .\estimate-snapshot.json
```

Produces a canonical JSON snapshot at the given path. Useful for piping into customer-side analytics tooling.

## Common workflows

### Workflow A — First estimate from an RFP (greenfield, no domain agents run yet)

1. User drops the RFP at `projects/{p}/_aggregator/estimation/inputs/rfp.docx`
2. Run `/estimate`
3. Review `Estimation-ModuleOverallHrs.md` (the stakeholder deliverable) — expect wide confidence bands (±30% to ±40%) and many Open Questions
4. If a factor gap is detected, review `Estimation-Proposed-Factors.md` (conditional output)
5. Send to customer for review

### Workflow B — Refresh + export after domain agents run

1. Domain agents (`d365-ce`, `integration`, etc.) have generated specs / plans for each in-scope feature
2. Run `/estimate` — auto-discovers and ingests the new sources; confidence bands tighten
3. Review the updated deliverable
4. Run `/estimate --export xlsx` — produce the workbook
5. Send the XLSX to QA / customer analysts for spreadsheet-driven review

### Workflow C — Round-trip with QA

1. Run `/estimate --export xlsx --export-to qa-pack.xlsx`
2. Send `qa-pack.xlsx` to the QA / business analyst team
3. They edit columns: `Priority`, `Confidence Level`, `Open Questions`, `Requirement Level` (when they override the agent's inference)
4. The edited file comes back; user re-drops it into `inputs/`
5. Run `/estimate` (incremental default) — picks up the edits via Req ID match; preserves them on subsequent runs

### Workflow D — Brownfield project

1. `project.config.yaml mode: brownfield` is set
2. Brownfield agent has produced `agents/brownfield/_brownfield/inventory.json`
3. Run `/estimate` — pulls component classification (NEW / EXTEND / REPLACE / REFERENCED) and applies per-row multipliers
4. The `Brownfield Status` column on each inventory row reflects the multiplier in effect

## Inputs

- `projects/{p}/project.config.yaml` — `name` / `mode` / `estimation.*` / `multilingual` / `nfr` keys
- Input discovery hierarchy (walked in order; stops at first hit when `--input` is omitted):
  1. **Standard inputs folder**: `projects/{p}/_aggregator/estimation/inputs/*` (the typical drop location)
  2. **Generic project inputs catch-all**: `projects/{p}/_inputs/*`
  3. **Completed agent handoffs**: `projects/{p}/_handoffs/*.handoff.json` where `targetAgent == "solution-estimate"`
  4. **Per-agent specs and plans**: `projects/{p}/*/features/*/{spec.md, plan.md}` (when handoffs aren't in place but domain agents have run)
  5. Nothing found → emit "no inputs found" with hints; **do NOT write any output files**
- Constitution files (read at run time):
  - [constitution/01-template-alignment.md](../../constitution/01-template-alignment.md) — output shapes + 7 key rules
  - [constitution/02-factor-definitions.md](../../constitution/02-factor-definitions.md) — 103-factor catalogue + heuristic
  - [constitution/03-fitment-classification.md](../../constitution/03-fitment-classification.md) — 8-value Fitment decision tree
  - [constitution/04-categorization-rules.md](../../constitution/04-categorization-rules.md) — Estimation Hierarchy derivation
  - [constitution/05-requirement-levels.md](../../constitution/05-requirement-levels.md) — **NEW** Requirement Level taxonomy + classification heuristic
- Data files (canonical sources — overridable per project):
  - [templates/factor-rates.yaml](../../templates/factor-rates.yaml)
  - [templates/factor-definitions.md](../../templates/factor-definitions.md)
  - [templates/phase-multipliers.yaml](../../templates/phase-multipliers.yaml)
  - [templates/brownfield-multipliers.yaml](../../templates/brownfield-multipliers.yaml)
  - [templates/confidence-levels.yaml](../../templates/confidence-levels.yaml)
  - [templates/module-detection.yaml](../../templates/module-detection.yaml)

## Input type auto-detection (per file; no per-input-type flag needed)

- File frontmatter has `feature-id:` + spec/plan template marker → **spec** or **plan**
- File is `.docx` / large unstructured `.md` → **RFP**
- File is `.csv` / `.xlsx` with requirement rows → **structured requirements list**
- Folder → recursive scan; mixed inputs merged into one estimation tree

## Execution flow

1. **Resolve project.** Read `projects/{p}/project.config.yaml`; pick up `name`, `mode`, `estimation.*`, `multilingual`, `nfr`. Project name is the Project level of the Categorization path.
2. **Discover inputs** per the hierarchy above (or use `--input` when supplied).
3. **Ingest each input.** Type-detect; parse; extract one or more requirement rows.
4. **Per requirement, walk the Factor selection heuristic** ([constitution/02-factor-definitions.md § heuristic](../../constitution/02-factor-definitions.md)):
   - Set **Fitment** per the 8-value classification decision tree ([constitution/03-fitment-classification.md](../../constitution/03-fitment-classification.md))
   - Set **Module** via [templates/module-detection.yaml](../../templates/module-detection.yaml)
   - Set **Capability / Feature** per [constitution/04-categorization-rules.md](../../constitution/04-categorization-rules.md)
   - Pick **Inventory factor** from the 103-factor catalogue in [templates/factor-rates.yaml](../../templates/factor-rates.yaml)
   - Set **Requirement Level (L1-L5)** per [constitution/05-requirement-levels.md § Classification heuristic](../../constitution/05-requirement-levels.md). When inferred (no explicit marker), emit a Typed Gap of category `REQUIREMENT-LEVEL-INFERENCE`.
   - For mixed-work requirements (Rule #1), emit MULTIPLE rows; **each row carries the same Requirement Level** (the level belongs to the requirement, not to the inventory factor)
   - Set **Brownfield Status** from `agents/brownfield/_brownfield/inventory.json` if `project.config.yaml mode: brownfield`; otherwise `N/A`
   - Set **Confidence Level** from input source quality
   - Set **VS/S/M/C/VC counts** by matching the requirement scope to the per-complexity descriptions in [templates/factor-definitions.md](../../templates/factor-definitions.md)
   - **Solution / Rationale and Assumptions are MANDATORY** (Rule #4)
5. **If any requirement does not match any factor**, propose new factor(s) in `Estimation-Proposed-Factors.md` (conditional output #4). When `project.config.yaml estimation.factorReviewGate: true`, BLOCK output #3 until resolved.
6. **Emit Output 1**: [Estimation-BusinessReqDetail.md](../../templates/business-req-detail.template.md) — two-level grouping (Module → Fitment), all **21 columns** (incl. new `Requirement Level`), empty sub-sections omitted.
7. **Emit Output 2**: [Estimation-ModuleBuildHrs.md](../../templates/module-build-hrs.template.md) — per-module sparse factor tables, hours auto-calculated.
8. **Emit Output 3** (the stakeholder deliverable): [Estimation-ModuleOverallHrs.md](../../templates/module-overall-hrs.template.md) — 5 sections including the renamed `§4 Estimation Hierarchy` and the new `§4.5 Requirement Level Distribution`.
9. **If `--export <format>`**, also produce the export file at the path from `--export-to` (or the default).
10. **Quality self-check**: inline against `templates/checklists/estimate-review.checklist.md` (when authored).
11. **Update `projects/{p}/_handoffs/`** with a `consume` event marking any source handoffs as `CONSUMED`.

## Outputs

All under `projects/{p}/_aggregator/estimation/`:

| File | When emitted | Notes |
|---|---|---|
| `Estimation-BusinessReqDetail.md` | always | 21-column inventory (incl. `Requirement Level`) |
| `Estimation-ModuleBuildHrs.md` | always | per-module factor rollup; auto-calculated hours |
| `Estimation-ModuleOverallHrs.md` | always | the stakeholder deliverable; 5 sections + §4.5 Requirement Level Distribution |
| `Estimation-Proposed-Factors.md` | conditional | only when a factor gap is detected |
| `Estimation.csv` / `Estimation.xlsx` / `Estimation.json` | only when `--export <format>` | path overridable via `--export-to` |

## Hard rules / validation

Per [constitution/01-template-alignment.md § Seven key rules](../../constitution/01-template-alignment.md) plus the Requirement Level rule (post-ADR-0012):

1. One row per inventory type per requirement.
2. Never enter hours manually — only counts.
3. Document all open questions.
4. Solution / Rationale is mandatory.
5. Fitment must be one of the 8 approved values.
6. Priority reflects business impact + delivery phase + dependency order.
7. Type of Integration = `NA` when Fitment != Integration.
8. **Requirement Level must be one of `L1` / `L2` / `L3` / `L4` / `L5`** per [constitution/05-requirement-levels.md](../../constitution/05-requirement-levels.md). Inferred levels emit Typed Gap `REQUIREMENT-LEVEL-INFERENCE`.

Violations → fail the write with a clear list of offending rows.

## Export semantics (per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md))

When `--export xlsx`:

- **`Requirement Level`** is a **single column**. **NEVER** split into 5 columns labelled L1-L5.
- **`Categorization`** splits into **5 named columns**: `Project` / `Module` / `Capability` / `Feature` / `Factor` (NEVER `L1-L5` — those labels are reserved for `Requirement Level`).

When `--export csv`:

- One row per inventory row. `Requirement Level` is one column. `Categorization` stays as one column with the full path string.

When `--export json`:

- One object per inventory row. `requirementLevel: "L3"` is one field. `categorization` is either a path string OR a nested object `{ project, module, capability, feature, factor }`.

## Aggregation mode

When `--input` is omitted AND no inputs found in steps 1-2 of discovery AND `_handoffs/` or per-agent specs/plans exist, the agent enters **aggregation mode**: ingests handoffs and specs/plans from completed domain-agent runs. Used post-domain, near the end of a feature delivery cycle, to refresh the estimate against actuals.

## See also

- **Constitution**: [00-charter.md](../../constitution/00-charter.md), [01-template-alignment.md](../../constitution/01-template-alignment.md), [02-factor-definitions.md](../../constitution/02-factor-definitions.md), [03-fitment-classification.md](../../constitution/03-fitment-classification.md), [04-categorization-rules.md](../../constitution/04-categorization-rules.md) (Estimation Hierarchy), [05-requirement-levels.md](../../constitution/05-requirement-levels.md) (Requirement Level taxonomy, NEW 2026-05-15)
- **Data**: [factor-rates.yaml](../../templates/factor-rates.yaml), [factor-definitions.md](../../templates/factor-definitions.md), [phase-multipliers.yaml](../../templates/phase-multipliers.yaml), [brownfield-multipliers.yaml](../../templates/brownfield-multipliers.yaml), [confidence-levels.yaml](../../templates/confidence-levels.yaml), [module-detection.yaml](../../templates/module-detection.yaml)
- **Templates**: [business-req-detail.template.md](../../templates/business-req-detail.template.md), [module-build-hrs.template.md](../../templates/module-build-hrs.template.md), [module-overall-hrs.template.md](../../templates/module-overall-hrs.template.md), [proposed-factors.template.md](../../templates/proposed-factors.template.md)
- **Design**: [design/agents/solution-estimate.md](../../../design/agents/solution-estimate.md), [design/17-command-doc-standard.md](../../../design/17-command-doc-standard.md)
- **ADRs**: [ADR-0009](../../../design/adr/0009-solution-estimate-consolidated.md), [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md)
- **Defect history**: [implementation.md `2026-05-15-006`](../../../implementation.md) (DEFECT-001 + DEFECT-002 intake), `2026-05-15-007` (DEFECT-001 resolution), `2026-05-15-008` (DEFECT-002 resolution)
