---
agent: solution-estimate
version: 2.0.0
last-reviewed: 2026-05-15
owner: aggregator
adr-refs: [ADR-0009, ADR-0012]
---

# Template Alignment

This agent's output structure is PORTED from a project-tested estimation template. The shapes below are not invented — every column, every multiplier, every key rule traces back to a real-world estimate that signed off with a customer. Deviations require an ADR.

**Revision 2026-05-15 (per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md)):** Added `Requirement Level` column to Output 1 (now 21 columns; was 20). Renamed the `Categorization` column path labels from `L1 > L2 > L3 > L4 > L5` to `Project > Module > Capability > Feature > Factor` to remove the naming collision with the new business-process taxonomy. XLSX export semantics updated accordingly.

## Output 1 — `Estimation-BusinessReqDetail.md` (21-column inventory)

**Two-level grouping** in the rendered file:

```
## Module: <Module Name>
   ### Configuration (N rows)     # Fitment in {Out of the Box, Configuration, Covered in other req, Non-Functional}
   ### Customization (N rows)     # Fitment = Customization
   ### Integration (N rows)       # Fitment = Integration
   ### Out of Scope / Deprecated  # Fitment in {Out of Scope, Deprecated}; informational, 0 hours
```

Empty sub-sections are omitted. A single Req ID may appear in multiple sub-sections when one requirement needs both a Customization row (Plugin) and a Configuration row (Business Rule).

**21 columns** (was 20 pre-ADR-0012; `Requirement Level` added 2026-05-15):

| Column | Allowed values / format |
|---|---|
| Req ID | `REQ-001` / `US-123` |
| **Requirement Level** | `L1` / `L2` / `L3` / `L4` / `L5` — business-process taxonomy per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md) and [05-requirement-levels.md](05-requirement-levels.md). **Single value on every row.** **NEVER split into 5 columns on any export surface.** |
| Categorization (Project > Module > Capability > Feature > Factor) | Full estimation-hierarchy path on every row. (Was `L1 > L2 > L3 > L4 > L5` pre-ADR-0012; relabelled to remove naming collision with `Requirement Level`.) |
| Source | Where the requirement is documented in our project — file + section (e.g., `RFP.docx §3.2.1`) |
| Original Req Ref | Pointer to system-of-record (JIRA / ADO ticket ID or external register) |
| Module / Feature | Logical functional grouping |
| Req Title | Verbatim requirement statement |
| Priority | `High` / `Medium` / `Low` / `MVP Phase 1` / `MVP Phase 2` |
| Confidence Level | `Placeholder ±40%` / `Low ±30%` / `Medium ±20%` / `High ±15%` / `Fully Detailed ±10%` |
| Fitment | One of 8 values (see 03-fitment-classification.md) |
| Brownfield Status | `NEW` / `EXTEND` / `REPLACE` / `REFERENCED` / `N/A` |
| Type of Integration | `Batch` / `Real-time` / `Middleware` / `API based` / `File based` / `NA` |
| Inventory | The factor that covers this row's work (= Factor level of the Categorization path); one of 103 factors |
| VS count | Integer >= 0 |
| Simple count | Integer >= 0 |
| Medium count | Integer >= 0 |
| Complex count | Integer >= 0 |
| Very Complex count | Integer >= 0 |
| Solution / Rationale | Why this factor + complexity were chosen — **mandatory** |
| Assumptions / Comments | Estimation assumptions / constraints — **mandatory** |
| Open Questions | Unresolved clarifications (may be empty when fully clarified) |

XLSX export rules (per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md)):

- **`Requirement Level`** — single column (NEVER split into 5 columns)
- **`Categorization`** — splits into 5 columns named **`Project`** / **`Module`** / **`Capability`** / **`Feature`** / **`Factor`** for pivot/filter use. (Was `L1`/`L2`/`L3`/`L4`/`L5` columns pre-ADR-0012; relabelled to remove naming collision.)

## Output 2 — `Estimation-ModuleBuildHrs.md` (per-module factor rollup)

One section per module. Each section is a sparse factor table — only factors with at least one non-zero count in that module render. Empty rows suppressed. Typical module: 10-30 visible rows out of 103.

Per-row formula:

```
VS Hrs = VS Count x VS Rate x Brownfield Multiplier
S Hrs  = S Count  x S Rate  x Brownfield Multiplier
M Hrs  = M Count  x M Rate  x Brownfield Multiplier
C Hrs  = C Count  x C Rate  x Brownfield Multiplier
VC Hrs = VC Count x VC Rate x Brownfield Multiplier
Total Hrs (per row) = sum of all five
```

Module Total computed across the **full** 103-factor catalogue (suppressed rows contribute zero — no effort lost). Grand Summary at end of file lists `Module | Total Build Hrs`.

## Output 3 — `Estimation-ModuleOverallHrs.md` (the stakeholder deliverable; 5 sections)

This is the single document stakeholders read. Five sections:

### §1 Module Overall Hours
10-column table: Module / Org Build & UT Hrs / Plan / Analyze / Design / Test Prep / Test Exe / Test/Dev Fix / Deploy / Total Project Hrs.
Phase multipliers from `templates/phase-multipliers.yaml`:
- Plan x 0.07, Analyze x 0.21, Design x 0.38, Test Prep x 0.25, Test Exe x 0.35, Test/Dev Fix x 0.35, Deploy x 0.15
- Sum: 1.76. **Total Project Hrs = Build x 2.76.**

**Confidence Band header** above this table: `Confidence Band: ±X%` auto-derived from weighted Confidence Level distribution across inventory rows. Derivation shown in italics below the header.

### §2 Summary Notes
Total Requirements / Total Inventory Rows / Total Modules / Total Org Build & UT Hours / Total Project Hours.

### §3 Configuration vs Customization Split
Table of `Fitment | Inventory Rows | Modules Touching | % of Total`. Mermaid pie chart. Per-Module Fitment Split table.

### §4 Requirement Hierarchy (L1 to L5)
One table per level: L1 Solution totals; L2 Modules with Config %/Custom %/hours; L3 Capabilities; L4 Features (with Req IDs); L5 cross-cutting Factor usage across all modules. Mermaid hierarchy flowchart TD. **Confidence Distribution pie** showing % of inventory at each band.

### §5 Assumptions, Open Questions & Typed Gaps
- Critical Open Questions (extracted from inventory row Open Questions column, sorted by priority)
- Key Assumptions Made (from Assumptions / Comments column)
- Typed Gaps categorised: `FITMENT-INFERENCE` / `COMPLEXITY-INFERENCE` / `AMBIGUOUS-MODULE` / `MISSING-DETAIL` / `DROPPED-FROM-INVENTORY`

## Output 4 — `Estimation-Proposed-Factors.md` (conditional)

Emitted only when the agent encounters a requirement that doesn't fit any of the 103 factors. Proposes new factor definitions with suggested S/M/C/VC rates + complexity criteria + which requirements would use them. User reviews and decides: accept permanently (added to `factor-rates.yaml`) or accept once.

If `project.config.yaml estimation.factorReviewGate: true`, the final ModuleOverallHrs.md is blocked until this file is reviewed/cleared.

## Seven key rules (enforced by the /estimate command body)

1. **One row per inventory type per requirement.** Never collapse multiple inventory types into a single row.
2. **Never enter hours manually.** Only supply counts (VS/S/M/C/VC); hours derive from rate table.
3. **Document all open questions.** Unresolved ambiguities go in the Open Questions column.
4. **Solution / Rationale is mandatory.** Every row explains why that factor and complexity were chosen.
5. **Fitment must be one of the 8 approved values.** No custom values.
6. **Priority reflects business impact + delivery phase + dependency order.** Do not simply copy client labels.
7. **Type of Integration = NA** for all rows where Fitment != Integration.
