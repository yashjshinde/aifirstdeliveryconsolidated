---
title: solution-estimate — aggregator for project effort estimation
status: live
adr-refs: [ADR-0009, ADR-0001]
last-reviewed: 2026-05-14
owner: design
---

# solution-estimate — aggregator

> Reads requirement inputs (RFP, requirements docs, specs, plans, Excel HLR) and produces effort estimation aligned with a project-tested template. **103-factor catalogue**, **8-value Fitment classification**, **5-level complexity (VS/S/M/C/VC)**, **7 phase multipliers (×2.76 total)**, brownfield-aware multipliers, confidence bands, proposed-factors gate. See [ADR-0009](../adr/0009-solution-estimate-consolidated.md) for the consolidated rationale.

## Command surface — one command, three flags

```
/estimate [--input <path>] [--fresh] [--export csv|xlsx|json]
```

| Flag | Behavior |
|---|---|
| `--input <path>` | **OPTIONAL** override — point to a specific file/folder outside the standard input location |
| `--fresh` | Force clean rebuild from scratch (rare). **Default: incremental** — preserves prior rows + manual overrides |
| `--export` | CSV / XLSX (multi-sheet) / JSON |

Three flags only. Bare `/estimate` is the typical invocation.

## Input auto-discovery (no `--input` needed)

The agent walks this hierarchy until it finds something:

1. **Standard inputs folder** (typical): `projects/{p}/_aggregator/estimation/inputs/*` — user drops any RFP / requirements doc / spec here
2. **Generic project inputs catch-all**: `projects/{p}/_inputs/*` if present
3. **Completed agent handoffs**: `projects/{p}/_handoffs/` (post-domain mode)
4. **Per-agent specs and plans**: `projects/{p}/*/features/*/{spec.md, plan.md}`
5. **Nothing found** → emit "no inputs found" message with hints

`--input <path>` overrides the hierarchy for ad-hoc usage.

## Input type auto-detection (by content shape)

- File frontmatter has `feature-id:` + spec/plan template marker → spec or plan
- File is `.docx` / large unstructured `.md` → RFP
- File is `.csv` / `.xlsx` with requirement rows → structured requirements list
- Folder → recursive scan; mixed inputs merged

## Three markdown outputs + one conditional

All under `projects/{p}/_aggregator/estimation/`:

### Output 1 — `Estimation-BusinessReqDetail.md`

Per-requirement multi-row inventory. **20 columns**, **two-level grouping** (Module → Fitment sub-section).

Grouping:

```
## Module: Sales
   ### Configuration (N rows)     — Fitment ∈ {Out of the Box, Configuration, Covered in other req, Non-Functional}
   ### Customization (N rows)     — Fitment = Customization
   ### Integration (N rows)       — Fitment = Integration
   ### Out of Scope / Deprecated  — Fitment ∈ {Out of Scope, Deprecated} (informational, 0 hours)
## Module: Service
   ### Configuration (N rows)
   ...
```

20 columns:

| Column | Allowed values |
|---|---|
| Req ID | `REQ-001` / `US-123` |
| Categorization (L1 > L2 > L3 > L4 > L5) | Full estimation hierarchy path |
| Source | Where requirement is documented in our project (file + section) |
| Original Req Ref | Pointer back to system-of-record (JIRA / ADO / customer's own register / deep link) |
| Module / Feature | Logical functional grouping (= L2 + L4 conflated) |
| Req Title | Verbatim requirement statement |
| Priority | `High` / `Medium` / `Low` / `MVP Phase 1` / `MVP Phase 2` |
| **Confidence Level** | `Placeholder ±40%` / `Low ±30%` / `Medium ±20%` / `High ±15%` / `Fully Detailed ±10%` |
| **Fitment** | One of 8 values (see below) |
| **Brownfield Status** | `NEW` (×1.0) / `EXTEND` (×0.6) / `REPLACE` (×1.15) / `REFERENCED` (×0.0) / `N/A` (greenfield) |
| Type of Integration | `Batch` / `Real-time` / `Middleware` / `API based` / `File based` / `NA` |
| Inventory | The factor that covers this row's work (= L5 value); one of 103 factors |
| **VS / S / M / C / VC** counts | Integer ≥ 0 |
| Solution / Rationale | Why this factor + complexity were chosen — **mandatory** |
| Assumptions / Comments | Estimation assumptions / constraints — **mandatory** |
| Open Questions | Unresolved clarifications |

**XLSX export** breaks Categorization into 5 separate L1/L2/L3/L4/L5 columns for pivot/filter use.

**Key rule:** one row per inventory type per requirement. A requirement needing both JS and a Plugin produces two rows.

### Output 2 — `Estimation-ModuleBuildHrs.md`

One section per module. Sparse factor table — only factors with non-zero counts render (typical: 10-30 rows out of 103). **Empty rows suppressed.** Hours are auto-calculated.

Per-row formula:

```
VS Hrs = VS Count × Very Simple rate × Brownfield multiplier
S Hrs  = S Count  × Simple rate      × Brownfield multiplier
M Hrs  = M Count  × Medium rate      × Brownfield multiplier
C Hrs  = C Count  × Complex rate     × Brownfield multiplier
VC Hrs = VC Count × Very Complex rate × Brownfield multiplier
Total Hrs = sum of all five
```

Module totals computed across the **full** catalogue (suppressed rows contribute zero). Grand Summary table at end of file.

### Output 3 — `Estimation-ModuleOverallHrs.md` *(merged 5-section deliverable)*

The stakeholder deliverable. **Five sections** combining what was previously separate files:

**§1 Module Overall Hours** — 10-column table with 7 phase multipliers + Confidence Band header (`Confidence Band: ±X%` auto-derived from weighted Confidence Level distribution).

Phase multipliers:

| Phase | Multiplier |
|---|---|
| Plan | × 0.07 |
| Analyze | × 0.21 |
| Design | × 0.38 |
| Test Prep | × 0.25 |
| Test Execution | × 0.35 |
| Test/Dev Fix | × 0.35 |
| Deployment | × 0.15 |
| **Sum** | **× 1.76** |
| **Total Project Hrs** | Build × **2.76** |

**§2 Summary Notes** — Total Requirements / Total Inventory Rows / Total Modules / Total Org Build & UT Hours / Total Project Hours.

**§3 Configuration vs Customization Split** — table + Mermaid pie chart + per-module split table.

**§4 Requirement Hierarchy L1-L5** — one table per level (L1 Solution, L2 Modules, L3 Capabilities, L4 Features, L5 cross-cutting Factor usage) + Mermaid hierarchy flowchart TD + **Confidence Distribution pie** showing % of inventory at each band.

**§5 Assumptions, Open Questions & Typed Gaps** — consolidated from inventory rows; gaps categorized:

| Category | When applied |
|---|---|
| `FITMENT-INFERENCE` | Agent inferred Fitment value from requirement language |
| `COMPLEXITY-INFERENCE` | Agent inferred S/M/C/VC from requirement adjectives |
| `AMBIGUOUS-MODULE` | Requirement could belong to multiple modules |
| `MISSING-DETAIL` | Requirement too thin to size; placeholder row |
| `DROPPED-FROM-INVENTORY` | Requirement couldn't map to any factor |

### Output 4 — `Estimation-Proposed-Factors.md` *(conditional)*

Emitted only when the agent encounters a requirement that doesn't fit any factor in the 103-factor catalogue. Proposes new factor definitions with suggested S/M/C/VC rates + complexity criteria + which requirements would use them. User decides: accept permanently (add to `factor-rates.yaml`) or accept once.

## 8-value Fitment classification

| Value | Meaning |
|---|---|
| Out of the Box | OOB — no work |
| Configuration | Config layer — declarative |
| Customization | Custom code / plugins / JS |
| Integration | External system integration |
| Non-Functional | NFR-specific work |
| Covered in other requirement | Subsumed |
| Out of Scope | Excluded |
| Deprecated / Not Supported | Cannot be delivered |

## 103-factor catalogue

Lives in `agents/solution-estimate/templates/factor-rates.yaml` and `factor-definitions.md`. Catalogue:

- **95 tool-canonical SI factors** ported verbatim from a canonical Systems Integrator Effort Data Excel, organised into 11 categories: CRM Core Dev (17), Code/ASP.NET (6), Reports & Dashboards (5), Integration & Data Migration (3), Power Platform (5), Sales (15), Service (10), Marketing (5), Core Foundation (6), UI/Navigation (6), Office/Integration Setup (5), Security (5), Process/Workflow/Misc (7).
- **8 reintroduced factors** plugging delivery gaps not covered by the SI Excel: Azure Function Build & UT, Integration (generic), CRM Master Data Preparation, Model Driven App Changes, PCF Control Development, Excel Report, ExperLogix Report, Hierarchy Security. *Reintroduced source: project-tested estimation-instructions template.*

**Total: 103 active factors.**

Per-factor complexity descriptions (475 strings = 95 × 5) are PORTED verbatim into `factor-definitions.md` at agent build time. Hour rates per VS/S/M/C/VC live in `factor-rates.yaml`.

## Brownfield-aware multipliers

Applied per inventory row at hour-calculation time when project is in brownfield mode (`project.config.yaml mode: brownfield`). Auto-populated from brownfield agent's `_brownfield/inventory.json`. Lives in `agents/solution-estimate/templates/brownfield-multipliers.yaml`.

| Brownfield Status | Multiplier | Meaning |
|---|---|---|
| `NEW` | ×1.0 | Full effort, new build |
| `EXTEND` | ×0.6 | Partial effort on existing component |
| `REPLACE` | ×1.15 | Overhead of removal + replacement |
| `REFERENCED` | ×0.0 | No implementation; consumption only |
| `N/A` (greenfield) | ×1.0 implicit | — |

## Confidence levels

Lives in `agents/solution-estimate/templates/confidence-levels.yaml`. Auto-derived per row from input source quality:

| Band | Range | Source qualifying |
|---|---|---|
| Placeholder | ±40% | RFP title only |
| Low | ±30% | RFP narrative |
| Medium | ±20% | Spec with open Qs |
| High | ±15% | Spec, no open Qs |
| Fully Detailed | ±10% | Plan with full ACs |

Confidence Band header in `Estimation-ModuleOverallHrs.md` is the weighted-average across rows.

## Seven key rules (template-aligned)

1. **One row per inventory type per requirement** — never collapse multiple inventory types into a single row.
2. **Never enter hours manually** — only supply counts (VS, S, M, C, VC); hours derive from rate table.
3. **Document all open questions** — unresolved ambiguities go in the Open Questions column.
4. **Solution / Rationale is mandatory** — every row explains why that factor and complexity were chosen.
5. **Fitment must be one of the 8 approved values** — no custom values.
6. **Priority reflects business impact + delivery phase + dependency order** — don't simply copy client labels.
7. **Type of Integration = NA** for all rows where Fitment ≠ Integration.

## Execution flow

1. Ingest the requirement file (Excel / Word / Markdown / text).
2. Group requirements into Modules / Features.
3. Build Business Req. Detail inventory — one row per factor per requirement.
4. Output Business Req. Detail (markdown + optional XLSX).
5. Aggregate counts per module → Module Build Hrs.
6. Populate Module Overall Hrs (Org Build & UT Hrs only; rest auto-calculate).
7. Deliver Module Overall Hrs as the final stakeholder estimation deliverable.

## Constitution

```
agents/solution-estimate/constitution/
├── 00-charter.md
├── 01-template-alignment.md          # PORTED from project-tested estimation-instructions §3 + §4
├── 02-factor-definitions.md          # 103-factor catalogue (descriptions + categories)
├── 03-fitment-classification.md      # 8-value Fitment decision tree
├── 04-categorization-rules.md        # L1-L5 hierarchy derivation heuristics
└── 05-multilingual.md                # if estimation outputs need localization
```

## Templates folder

```
agents/solution-estimate/templates/
├── factor-rates.yaml                 # Hour rates per factor per complexity (VS/S/M/C/VC)
├── factor-definitions.md             # PORTED 475 complexity descriptions
├── phase-multipliers.yaml            # 7 phase multipliers
├── brownfield-multipliers.yaml       # NEW / EXTEND / REPLACE / REFERENCED / N/A
├── confidence-levels.yaml            # 5 bands
├── module-detection.yaml             # Sales / Service / Marketing / Field Service / Retail signals (shared with brownfield)
├── business-req-detail.template.md   # Inventory output template
├── module-build-hrs.template.md      # Per-module factor rollup template
├── module-overall-hrs.template.md    # Merged deliverable template (5 sections)
├── proposed-factors.template.md      # Conditional output template
└── checklists/                       # Six checklists
    ├── spec-review.checklist.md
    ├── plan-review.checklist.md
    ├── estimate-review.checklist.md  # (estimate-specific replacement for FDD/TDD/blueprint/test-plan)
    └── ...
```

## Aggregation mode

The same `/estimate` command without `--input` walks the auto-discovery hierarchy → can aggregate from `_handoffs/` or per-agent specs/plans when those exist. Used post-domain.

## References

- ADR: [ADR-0009](../adr/0009-solution-estimate-consolidated.md) (the consolidated cluster decision)
- Cross-references: [10-aggregators.md](../10-aggregators.md) (aggregator pattern), [agents/brownfield.md](brownfield.md) (provides `_brownfield/inventory.json` for multipliers)
- Backlog: `bk-009` (this agent's authoring), `bk-010` (factor catalogue extensions for F&O / deeper Integration / deeper Reporting)
