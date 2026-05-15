---
adr: 0009
title: Solution-estimate consolidated to a single `/estimate` command aligned with project-tested template + 103-factor catalogue + 8-value Fitment + 7 phases
status: accepted
decided-on: 2026-05-14
design-doc-refs: [agents/solution-estimate.md, 10-aggregators.md]
---

# ADR-0009 — Solution-estimate consolidated `/estimate` command

## Status

`accepted` — decided 2026-05-14. Consolidates a cluster of related refinements (the prior revision sequence R22 → R23 → R24 → R25 → R26 → R27 → R28 → R29 → R30 → R31 → R32) into one coherent design.

## Context

Effort estimation for D365 / Power Platform projects has a well-established shape in the field: a multi-row inventory keyed by requirement, classified by **Fitment** (how the requirement is addressed) and **Inventory factor** (the work-product type), with counts at each complexity tier × hour rates per factor × phase multipliers producing a project total.

An early iteration of this agent invented a parallel design (L1–L5 estimation hierarchy, 19 invented columns, generic patterns, binary Config/Custom flag, generic risk multipliers, ROM/Build mode flag, four sibling commands `/estimate-rom`, `/estimate-build`, `/estimate-rollup`, `/factors-review`). When pointed at a project-tested template (`MasterTemplate/estimation-instructions.md` from `Dynamics365AISolution`) that matched real-world output, the invented design was dropped and replaced with the template's verbatim shape.

The factor catalogue then grew through three sources: (1) the template's 19 reference factors, (2) the ICICI Bank Effort Data Excel (5-level complexity model, 11 factors — superseded), (3) the Internal Project SI Effort Data Excel (95 canonical Systems Integrator factors). Reintroducing 8 missing factors from the original template gave a final catalogue of **103 active factors**. Phase multipliers expanded from 5 phases to 7. Brownfield-aware multipliers, confidence bands, and a proposed-factors gate were added from a separate aifirstdelivery reference.

## Decision

A single command with all advanced features consolidated:

### Command surface

```
/estimate [--input <path>] [--fresh] [--export csv|xlsx|json]
```

Three flags. Bare `/estimate` is the typical invocation; **input auto-discovery** walks a hierarchy (standard `_aggregator/estimation/inputs/`, generic `_inputs/`, `_handoffs/`, per-agent specs/plans). No mode flag; depth emerges from per-row Solution/Rationale narrative driven by input content quality.

### 5-level complexity model: VS / S / M / C / VC

Very Simple, Simple, Medium, Complex, Very Complex. Rates per factor per complexity tier extracted verbatim from the SI Effort Data Excel; reintroduced 8 factors carry 4-level rates with `VS` undefined (pending another tool reference).

### 103-factor catalogue

95 tool-canonical SI factors organised into 11 categories (CRM Core Dev / Code-ASP.NET / Reports & Dashboards / Integration & Data Migration / Power Platform / Sales / Service / Marketing / Core Foundation / UI-Navigation / Office-Integration Setup / Security / Process-Workflow-Misc) **plus** 8 reintroduced factors plugging delivery gaps (Azure Function Build & UT, Integration generic, CRM Master Data Preparation, Model Driven App Changes, PCF Control Development, Excel Report, ExperLogix Report, Hierarchy Security). Per-factor complexity descriptions (475 strings = 95 × 5) ported verbatim into `factor-definitions.md`.

### 8-value Fitment (classification)

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

### 7-phase multipliers

| Phase | Multiplier |
|---|---|
| Plan | × 0.07 |
| Analyze | × 0.21 |
| Design | × 0.38 |
| Test Prep | × 0.25 |
| Test Execution | × 0.35 |
| Test/Dev Fix | × 0.35 |
| Deployment | × 0.15 |
| Sum of phases | **× 1.76** |
| **Total project hours = Build × 2.76** | |

### Inventory: 20 columns

14 from the template baseline + 6 added across the consolidation: Categorization (L1–L5), Source, Original Req Ref, VS count, Confidence Level (5 bands: Placeholder ±40% / Low ±30% / Medium ±20% / High ±15% / Fully Detailed ±10%), Brownfield Status (NEW / EXTEND / REPLACE / REFERENCED / N/A; multipliers ×1.0 / ×0.6 / ×1.15 / ×0.0 / ×1.0).

Two-level grouping in inventory output: **Module** (## headers) → **Fitment sub-sections** (Configuration / Customization / Integration / Out-of-Scope; ### headers with row counts). Empty sub-sections omitted. Same Req ID can appear in multiple sub-sections.

### Three markdown outputs + one conditional

1. `Estimation-BusinessReqDetail.md` — per-requirement inventory (20 columns)
2. `Estimation-ModuleBuildHrs.md` — per-module factor rollup with auto-calculated hours; **empty rows suppressed** (typical module renders 10-30 of the 103 factors)
3. `Estimation-ModuleOverallHrs.md` — merged deliverable with five sections (Module Overall Hrs with Confidence Band header / Summary Notes / Config-vs-Custom Split + Mermaid pie / Requirement Hierarchy L1-L5 + Mermaid hierarchy + Confidence Distribution pie / Assumptions, Open Questions & Typed Gaps)
4. `Estimation-Proposed-Factors.md` — **conditional**; emitted only when the agent encounters a requirement that doesn't fit any factor in the 103-factor catalogue. Proposed rates + complexity criteria + which requirements would use it. User accepts permanently (added to `factor-rates.yaml`) or once.

Optional XLSX export adds multi-sheet structure (BusinessReqDetail / ModuleBuildHrs / ModuleOverallHrs / FitmentSummary / CategorizationSplit with L1-L5 sub-sheets / ConfidenceDistribution / BrownfieldStatus / Assumptions / FactorRates / ProposedFactors).

### Seven key rules (template-aligned)

1. One row per inventory type per requirement (never collapse).
2. Never enter hours manually (only counts).
3. Document all open questions explicitly.
4. Solution / Rationale mandatory on every row.
5. Fitment must be one of the 8 approved values.
6. Priority reflects business impact + delivery phase, not client labels.
7. Type of Integration = NA when Fitment ≠ Integration.

## Alternatives considered

- **Keep the four sibling commands.** Reject — cognitive overload; user must remember which command to invoke when. Single command with auto-detection covers all cases.
- **Keep the L1–L5 invented hierarchy as the primary classification.** Reject — doesn't match real-world template; user pointed at the project-tested template as the source of truth. L1–L5 preserved as the Categorization column for traceability inside rows.
- **Use only the 19-factor template list.** Reject — too coarse for SI delivery; misses delivery factors the SI catalogue covers (Power Apps Canvas screens, Power Pages portal, Sales/Service/Marketing modules, etc.).
- **Use only the 95-factor SI Excel.** Reject — missing 8 delivery factors with no SI equivalent (Azure Function, Integration generic, Master Data Prep, Model Driven App Changes, PCF, Excel Report, ExperLogix, Hierarchy Security).
- **5 phases (×2.30 total).** Reject — under-represents the upfront Analyze + Design effort that real D365 projects require. 7 phases (×2.76 total) reflects real delivery effort.

## Consequences

**Positive:**
- One command, three flags, zero modes. Lowest possible user-facing complexity for a tool that does substantial work.
- Estimate is faithful to a project-tested template (verbatim columns, factor rates, phase multipliers, key rules) — output is immediately consumable by SI delivery teams.
- Brownfield-aware (multipliers per row), confidence-aware (per-row + project-level band), gap-detecting (proposed-factors output).

**Negative:**
- Factor catalogue is CE / Power Platform centric with light Integration + Reporting touch. F&O factors, deeper Integration factors (Logic Apps Consumption/Standard, ADF, Service Bus, APIM), and deeper Reporting factors (Power BI Dataset, RLS, OLS, Data Gateway) are queued as extensions (backlog bk-010) — not in v1.
- 103 factors × 5 complexity levels = 475 description strings to maintain. Source Excel is canonical; descriptions ported into `factor-definitions.md` at agent build time.
- Confidence Band auto-derivation depends on per-row Confidence Level being accurate; weak input quality propagates to wide bands.

**Affected design docs:** [agents/solution-estimate.md](../agents/solution-estimate.md), [10-aggregators.md](../10-aggregators.md).

## References

- Design docs: [agents/solution-estimate.md](../agents/solution-estimate.md)
- Source materials (historical, in `reference/` and ported into `agents/solution-estimate/templates/factor-rates.yaml` + `factor-definitions.md` at agent build time): MasterTemplate/estimation-instructions.md, Internal Project SI Effort Data Excel, aifirstdelivery solution-estimate reference
