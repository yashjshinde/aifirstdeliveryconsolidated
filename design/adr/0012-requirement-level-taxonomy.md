---
adr: 0012
title: Requirement Level L1-L5 business-process taxonomy as a first-class column on the estimation inventory
status: accepted
decided-on: 2026-05-15
supersedes:
superseded-by:
master-plan-refs: [§7.5, §26]
design-doc-refs: [agents/solution-estimate.md]
---

# ADR-0012 — Requirement Level L1-L5 (Business-Process Taxonomy)

## Status

`accepted` — decided 2026-05-15 in response to DEFECT-001 reported by the platform owner.

## Context

The `solution-estimate` agent's `Estimation-BusinessReqDetail.md` deliverable previously had no column representing the **business-process level** of a requirement. Stakeholders (BAs, customer process owners) need to filter and roll up requirements by where they sit in the standard process-decomposition taxonomy:

| Level | Name | Description | Example |
|---|---|---|---|
| **L1** | Category / Enterprise View | Highest-level value chain map. Groups major end-to-end business domains or operational functions. | Supply Chain Management, Human Resources, Finance |
| **L2** | Process Group | Breaks L1 categories into major workflows or distinct end-to-end process cycles. | Procure-to-Pay, Order-to-Cash, Recruit-to-Retire |
| **L3** | Process / Sub-Process | Specific processes within an L2 group, including handoffs, decisions, and cross-functional interactions. | Select Supplier, Create Purchase Order, Process Invoice |
| **L4** | Activity | Individual activities or steps required to complete the L3 process. Identifies roles, applications, and business rules. | Evaluate Suppliers, Obtain Approvals, Enter Contract Data in ERP |
| **L5** | Task / Work Instruction | Most granular operational steps. Dictates exactly how a specific system screen is used or how an action is performed. | Click "Create Vendor," Fill in Tax ID, Submit Form |

This taxonomy is industry-standard (APQC PCF, eTOM, MIT Process Handbook all use a comparable 4-5-level decomposition). It is **orthogonal** to the estimation hierarchy the agent already uses internally (Project / Module / Capability / Feature / Inventory Factor) — the existing internal hierarchy is how the agent rolls up effort; the requirement-level taxonomy is how stakeholders reason about the work.

The existing internal hierarchy was historically named `L1 / L2 / L3 / L4 / L5` (see prior text of [constitution/04-categorization-rules.md](../agents/solution-estimate/constitution/04-categorization-rules.md)). Adopting the new business-process taxonomy at the same `L1-L5` labels creates a direct naming collision. This ADR resolves the collision by renaming the existing hierarchy and reserving `L1-L5` exclusively for the new business-process taxonomy.

User additional constraints (from DEFECT-001):

1. The `Requirement Level` column on the inventory MUST be a **single column** (not split into 5 separate L1/L2/L3/L4/L5 columns) — including on XLSX/CSV/JSON export.
2. The stakeholder deliverable MUST include a **Requirement Level Distribution** summary section showing requirement count + estimated effort rolled up per level.

## Decision

Three parts:

### (a) Add `Requirement Level` as a new, single column on the estimation inventory

`agents/solution-estimate/templates/business-req-detail.template.md` gains a column named **`Requirement Level`**. Its values are `L1` / `L2` / `L3` / `L4` / `L5` per the business-process taxonomy above. One value per row.

The column is **single** on every output surface (markdown, CSV, XLSX, JSON). On XLSX in particular, it does NOT split into five `L1`, `L2`, `L3`, `L4`, `L5` columns — the value stays in one cell.

A new constitution file `agents/solution-estimate/constitution/05-requirement-levels.md` defines the taxonomy + the classification heuristic the agent applies during requirement ingestion + examples + ambiguity-handling rules.

### (b) Rename the existing internal hierarchy to remove the naming collision

The agent's internal estimation hierarchy (Project / Module / Capability / Feature / Inventory Factor) is renamed throughout the agent from `L1-L5` labels to the explicit named labels:

| Was (pre-2026-05-15) | Now (post-ADR-0012) | Source / derivation |
|---|---|---|
| `L1` | **Project** | `project.config.yaml name` |
| `L2` | **Module** | `module-detection.yaml` |
| `L3` | **Capability** | per-module taxonomy in `04-categorization-rules.md` |
| `L4` | **Feature** | free-form per-project; agent groups consecutive related Req IDs |
| `L5` | **Inventory Factor** | mirrors the `Inventory` column (one of 103 factors) |

The composite path on the inventory's `Categorization` column changes:

- **Before:** `L1 > L2 > L3 > L4 > L5` (e.g., `acme > Sales > Lead Mgmt > Lead Form Enhancements > New CRM Plugin Build & UT`)
- **After:** `Project > Module > Capability > Feature > Factor` (e.g., `acme > Sales > Lead Mgmt > Lead Form Enhancements > New CRM Plugin Build & UT`)

The composite path's content is unchanged; only the labels change.

On XLSX export, the Categorization column splits into FIVE named columns: `Project` / `Module` / `Capability` / `Feature` / `Factor`. The labels `L1` / `L2` / `L3` / `L4` / `L5` are NEVER used for the estimation hierarchy after this ADR.

### (c) Add a Requirement Level Distribution summary to the stakeholder deliverable

`agents/solution-estimate/templates/module-overall-hrs.template.md` gains a new sub-section under §4 (and the existing `§4 Requirement Hierarchy (L1 to L5)` is renamed to `§4 Estimation Hierarchy` to match the rename above). The new sub-section presents:

- A 5-row table: Level / Description / Requirement Count / Inventory Rows / Build Hrs / Project Hrs / % of Total Hrs
- A Mermaid pie chart titled "Requirement Level Distribution" showing count per level
- A short narrative summary surfaced at the top: e.g., "63% of requirements are L3 (Process), 22% are L4 (Activity), 8% are L5 (Task), 5% are L2 (Process Group), 2% are L1 (Category)"

This gives stakeholders the rolled-up answer to "where in the process taxonomy is the bulk of the work?"

## Alternatives considered

- **Adopt `Requirement Level` as a 5-column split on XLSX (one column per level).** Rejected by user explicitly. The taxonomy is hierarchical (a row's level uniquely identifies its position) and the value is naturally singular; splitting into 5 columns would force every row to have 4 empty cells and confuse downstream pivot logic.
- **Keep `L1-L5` labels on the existing internal hierarchy AND add a new `Process Level` column with values P1-P5.** Rejected because (i) the user's terminology is "Requirement Level" with values L1-L5 and we should match user terminology, and (ii) "P1-P5" introduces yet another label set rather than retiring an ambiguous one. Eliminating the naming collision by renaming the existing scheme is cleaner.
- **Drop the existing internal hierarchy entirely; replace it with the business-process taxonomy.** Rejected because the internal hierarchy serves a real purpose (roll up effort by Module / Capability / Feature for project-management reporting). The two schemes are orthogonal and both have stakeholder consumers.
- **Make `Requirement Level` optional (only when business analysts have classified).** Rejected because optional means "missing for most rows" — defeating the analysis primitive the user wants. The agent will infer the level from requirement text + module context + Inventory Factor when not explicitly supplied; a row with low confidence emits a Typed Gap of category `REQUIREMENT-LEVEL-INFERENCE` so the gap is surfaced rather than silently filled.

## Consequences

**Positive:**

- Stakeholders can filter / pivot / chart requirements by business-process level (a primitive customer-side analysis need).
- The new `Requirement Level` column has a single, unambiguous meaning — no collision with the agent's internal effort-rollup hierarchy.
- The renamed estimation-hierarchy columns (Project / Module / Capability / Feature / Factor) on XLSX export are self-documenting — no `L1-L5` legend required.
- The Requirement Level Distribution chart gives the stakeholder deliverable a missing summary primitive.

**Negative:**

- Backwards-compatibility break for any prior estimates already produced with `L1-L5` labels in the Categorization column. *Mitigation:* per ADR-0011 the publish pipeline regenerates derivative surfaces on every run; no prior project has been built that would carry the old labels.
- The agent must classify every requirement into one of the 5 levels — adds a per-row classification step. *Mitigation:* the classification heuristic in `05-requirement-levels.md` uses requirement text + module context + Inventory Factor, all of which the agent already analyses; the additional cost is a single deterministic lookup per row.
- The Categorization column path label changes (still the same values; just relabelled). Markdown body display is human-readable either way; the change is breaking only for tooling that parsed `L1=...` from the path string. *Mitigation:* no such tooling exists at the time of this ADR (the agent is the only consumer of its own output).

**Affected design docs:** [agents/solution-estimate.md](../agents/solution-estimate.md) (updated 2026-05-15).

**Affected agent files (per resolution entry `2026-05-15-007`):**

- `agents/solution-estimate/constitution/01-template-alignment.md` (Categorization column rename + new Requirement Level column)
- `agents/solution-estimate/constitution/04-categorization-rules.md` (renamed scheme: L1→Project, L2→Module, L3→Capability, L4→Feature, L5→Factor; updated XLSX export column names)
- `agents/solution-estimate/constitution/05-requirement-levels.md` (NEW — business-process taxonomy + classification heuristic)
- `agents/solution-estimate/templates/business-req-detail.template.md` (Categorization label rename + new Requirement Level column)
- `agents/solution-estimate/templates/module-overall-hrs.template.md` (§4 renamed to "Estimation Hierarchy"; new §4.5 "Requirement Level Distribution")
- `agents/solution-estimate/.claude/commands/estimate.md` (execution flow adds requirement-level classification step)
- `agents/solution-estimate/README.md` (surface the new column + the rename)

## References

- Master plan: §7.5 (solution-estimate agent), §26 (revision discipline)
- Related ADRs: [ADR-0009](0009-solution-estimate-consolidated.md) (the foundational agent ADR this builds on; not superseded)
- Design docs: [design/agents/solution-estimate.md](../agents/solution-estimate.md)
- Implementation log entries: `2026-05-15-006` (defect intake), `2026-05-15-007` (DEFECT-001 resolution)
