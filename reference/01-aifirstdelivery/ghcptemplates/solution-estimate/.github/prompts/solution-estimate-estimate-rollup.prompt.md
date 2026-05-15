---
mode: agent
description: "Generate a cross-feature estimation rollup summary with confidence breakdown. Triggers on: 'estimate-rollup', 'rollup', 'estimate summary'."
---

Generate a cross-feature rollup summary with Requirement Level confidence pie chart.

## Usage

```
/solution-estimate-estimate-rollup {project}
```

## Pre-condition Check

1. Check `estimates/{project}/module-overall-hrs.md` exists.
   If not: "No built estimate found. Run `/solution-estimate-estimate-build {project}` first."

## Steps

2. Read all files in `constitution/`.
3. Read `estimates/{project}/module-overall-hrs.md`.
4. Read `estimates/{project}/business-req-detail.md`.
5. Read all `estimates/{project}/*-estimate.md` files to collect metadata (levels used, open questions, assumptions).

6. Count all inventory rows in `business-req-detail.md` by Requirement Level (L1–L5).
   These counts drive the pie chart — derive them from the actual data, never estimate.

7. Build the rollup:
   a. Project overview table.
   b. Estimation provenance table (feature → domain agent → level used → notes).
   c. Module hours summary (replicate the module-overall-hrs table).
   d. Requirement Level distribution table.
   e. Mermaid pie chart (see format below) — use actual row counts.
   f. Confidence narrative (2–3 sentences interpreting the distribution, naming specific modules).
   g. Open questions summary (aggregate from all estimate files — preserve source feature).
   h. Key assumptions summary (aggregate from all estimate files).

8. Write `estimates/{project}/rollup-summary.md`.

9. Print: "Rollup complete — Total Project Hrs: {n}. Confidence distribution: L5={n} L4={n} L3={n} L2={n} L1={n}."

---

## rollup-summary.md Format

```yaml
---
project: {project}
date: {date}
estimation-levels-used: [{list of levels actually used, e.g., ROM, SPEC, PLAN}]
total-modules: {n}
total-inventory-rows: {n}
total-build-hrs: {n}
total-project-hrs: {n}
---
```

### Section 1 — Project Overview

| Item | Value |
|---|---|
| Project | {project} |
| Date | {date} |
| Total Modules | {n} |
| Total Requirements | {n} |
| Total Inventory Rows | {n} |
| Total Org Build & UT Hrs | {n} |
| Total Project Hrs | {n} |
| Estimation Method | Factor-Based (constitution/20-factor-definitions.md) |

### Section 2 — Estimation Provenance

| Feature | Domain Agent | Estimation Level | Notes |
|---|---|---|---|
| {feature} | D365 CE | PLAN | Detailed — post-plan, high confidence |
| {feature} | Integration | SPEC | Structured — post-spec, medium confidence |
| {feature} | (unstructured) | ROM | Rough — from requirements doc, low confidence |

### Section 3 — Module Hours Summary

*(Replicate the full table from `module-overall-hrs.md`)*

| Module / Feature | Org Build & UT Hrs | Plan & Design Hrs | Test Creation Hrs | Test Execution Hrs | Dev Fix Hrs | Deployment Hrs | Total Project Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|
| {module} | {n} | {n} | {n} | {n} | {n} | {n} | **{n}** |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}** | **{n}** | **{n}** | **{n}** |

### Section 4 — Requirement Level Confidence

#### Distribution Table

| Level | Meaning | Count | % |
|---|---|---:|---:|
| L5 | Fully Detailed — signed off, no open questions | {n} | {%} |
| L4 | High Confidence — minor gaps only | {n} | {%} |
| L3 | Medium Confidence — open questions documented | {n} | {%} |
| L2 | Low Confidence — significant scope ambiguity | {n} | {%} |
| L1 | Placeholder — assumption-heavy, must revisit | {n} | {%} |

#### Confidence Pie Chart

```mermaid
pie title Requirement Level Distribution — {project}
    "L5 Fully Detailed" : {count}
    "L4 High Confidence" : {count}
    "L3 Medium Confidence" : {count}
    "L2 Low Confidence" : {count}
    "L1 Placeholder" : {count}
```

#### Confidence Narrative

{Agent writes 2–3 sentences interpreting the chart. Must name specific modules/features.
Example: "78% of requirements are at L4/L5 — this estimate carries high overall confidence and is suitable for contract or SOW use. The 12% at L3 reflects 3 open questions in the Integration — Oracle Fusion module that must be resolved before build commences. The remaining 10% at L1/L2 are unrefined portal requirements from the ROM phase; re-run /solution-estimate-estimate-spec after those specs are approved to improve confidence."}

### Section 5 — Open Questions Summary

| Source Feature | Req ID | Open Question | Priority |
|---|---|---|---|

### Section 6 — Key Assumptions

| Source Feature | Req ID | Assumption | Impact if Wrong |
|---|---|---|---|

---

## Rules

- Pie chart counts are always derived from `business-req-detail.md` actual data — never estimated or approximated.
- Confidence Narrative must reference specific modules or features, not generic statements.
- Open Questions and Assumptions are aggregated from individual estimate files — preserve source feature attribution.
- Sections 5 and 6 must list every open question and assumption from all estimate files — do not summarise away the detail.
