---
mode: agent
description: "Analyse brownfield impact of a reporting spec on existing reports. Triggers on: 'impact', 'brownfield impact'."
---

# /reporting-impact — Brownfield Impact Analysis

Analyse an approved feature spec against an existing reporting system.
Classifies every reporting component the feature touches as NEW, EXTEND, REPLACE, REFERENCED, or CONFLICT.
Required by `/reporting-plan` when `brownfield.enabled: true`.

## Usage

```
/reporting-impact {feature-name}
```

## Pre-condition Check

1. Read `constitution/10-alm-configuration.md` — check `brownfield.enabled`.
   If `false`, stop: "Brownfield mode is not enabled. Set `brownfield.enabled: true` in `constitution/10-alm-configuration.md` to use this command."

2. Read `specs/{feature-name}/review.md`.
   If status is not `APPROVED`, stop: "Spec is not approved. Run `/reporting-review {feature-name}` first."

3. Read `{brownfield.docs-path}/component-inventory.md`.
   If it does not exist, stop: "Brownfield docs not found at `{brownfield.docs-path}`. Run the CE Brownfield agent's `/generate` command first to produce the documentation set, then re-run /reporting-impact."

## Steps

4. Read ALL brownfield documentation from `{brownfield.docs-path}`:

   **Solution overview:**
   - `component-inventory.md` — solution component counts and package breakdown
   - `00-index.md` (if exists) — index of all generated documents

   **Functional documentation — primary source for entity and attribute mapping:**
   - `functional/entity-catalogue.md` (if exists) — all D365/Dataverse entities with attributes,
     field names, data types, and optionset values; use this to identify which fields already exist
     before classifying any KPI or attribute requirement as NEW
   - `functional/functional-overview.md` (if exists) — business process context
   - `functional/security-model.md` (if exists) — existing security roles and access patterns

   **Architecture:**
   - `architecture/data-model.md` (if exists) — entity relationships, cardinality, join keys
   - `architecture/solution-blueprint.md` (if exists) — solution architecture and component dependencies

   **Reporting artefacts:**
   - `reporting/reporting-inventory.md` (if exists) — existing reports, data sources, workspaces
   - All files in `reporting/ssrs/` (if exists) — per-SSRS-report detail: field lists, parameters, queries
   - All files in `reporting/power-bi/` (if exists) — per-Power-BI-report inventory

5. Read `specs/{feature-name}/spec.md` — focus on:
   - §5 Functional Requirements: "Reporting Impact" row for each FR
   - Report Catalogue section
   - RLS Requirements section
   - Data Model Requirements section

6. For every component referenced in the spec, look it up in the brownfield inventory and classify:

   | Action | Meaning |
   |---|---|
   | `NEW` | Does not exist — must be created from scratch |
   | `EXTEND` | Exists; new capability added (new measure, new page, new RLS role, new column) |
   | `REPLACE` | Exists; logic substantially rewritten or removed and rebuilt |
   | `REFERENCED` | Exists and consumed by this feature but its own definition does not change |
   | `CONFLICT` | Exists but the spec's intent contradicts the current documented behaviour |

7. For every `EXTEND`, `REPLACE`, or `CONFLICT` component, read its detailed brownfield doc:
   - Entity / attribute: relevant section in `{brownfield.docs-path}/functional/entity-catalogue.md`
   - Report (SSRS): `{brownfield.docs-path}/reporting/ssrs/{ReportName}.md`
   - Report (Power BI): `{brownfield.docs-path}/reporting/power-bi/{ReportName}.md`
   - Report summary: `{brownfield.docs-path}/reporting/reporting-inventory.md`
   - Security / RLS: `{brownfield.docs-path}/functional/security-model.md`
   - Data relationships: `{brownfield.docs-path}/architecture/data-model.md`

7b. **Source File Resolution** — for every `EXTEND`, `REPLACE`, or `CONFLICT` component from Step 7, locate the actual source file in `input/` using these lookup patterns:

   | Component Type | Lookup Pattern |
   |---|---|
   | SSRS Report (.rdl) | `input/reporting/**/*{ReportName}*.rdl` |
   | SSRS Report (.rdlc) | `input/reporting/**/*{ReportName}*.rdlc` |
   | Power BI Report (.pbix) | `input/reporting/**/*{ReportName}*.pbix` |
   | Power BI Template (.pbit) | `input/reporting/**/*{ReportName}*.pbit` |
   | Shared Dataset (.rds) | `input/reporting/**/*{DatasetName}*.rds` |

   For each component:
   - If file **found**: record `source-file: {relative-path}` alongside that component's row in `impact-analysis.md`.
   - If file **not found**: record `source-file: ⚠ NOT FOUND` and add an entry to the **Open Questions** section:
     "`{Component}` is classified as `{Action}` in the brownfield docs but no source file was found in `input/reporting/`. Confirm whether `/prepare` was run completely or whether the brownfield docs are stale before planning begins."

8. Identify cascading dependencies: for each dataset or measure being modified, find what reports and RLS roles depend on it and assess the blast radius.

9. Write `specs/{feature-name}/impact-analysis.md` using the structure below.

10. Print completion report.

## Output Structure

```markdown
---
feature: {feature-name}
status: IMPACT-ASSESSED
date: {date}
brownfield-docs: {docs-path}
---

# Impact Analysis — {Feature Display Name}

## Summary

| Action | Count | Components |
|---|---|---|
| NEW | {N} | {comma-separated list} |
| EXTEND | {N} | {comma-separated list} |
| REPLACE | {N} | {comma-separated list} |
| REFERENCED | {N} | {comma-separated list} |
| CONFLICT | {N} | {comma-separated list} |

---

## Affected Components

### Datasets / Data Models

| Dataset Name | Brownfield Status | Action | Change Description | Risk |
|---|---|---|---|---|
| {dataset} | EXISTS ({workspace}) | EXTEND | Add {N} tables; update relationships | Low |
| {dataset} | NOT FOUND | NEW | Create per FR-{NNN} | — |

### DAX Measures

| Table | Measure Name | Action | Change Description | Risk |
|---|---|---|---|---|
| {table} | {measure} | EXTEND | Update filter context for FR-{NNN} | Low |
| {table} | {measure} | NEW | Create aggregation measure | — |

### Power BI Reports / Pages

| Report Name | Page | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|
| {report} | {page} | EXTEND | Add visual for FR-{NNN} | Low | `input/reporting/.../{report}.pbix` |
| {report} | — | NEW | New report per spec | — | — |

### Paginated Reports / SSRS Reports

| Report Name | Data Source | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|
| {report} | {datasource} | EXTEND | Add parameter for FR-{NNN} | Medium | `input/reporting/.../{report}.rdl` |

### RLS Roles

| Role Name | Action | Change Description | Risk |
|---|---|---|---|
| {role} | EXTEND | Add filter expression for new entity | Low |
| {role} | NEW | Create per RLS-{NNN} | — |

### Workspaces / Deployment

| Workspace | Action | Change Description |
|---|---|---|
| {workspace} | REFERENCED | Existing workspace; new report deployed here |

---

## Risk Assessment

### High-Risk Changes

*(REPLACE or CONFLICT components only)*

For each: current usage (how many reports/roles reference this dataset or measure), blast radius of modification,
and recommended regression test scope.

*If none: No high-risk changes identified.*

### Dependency Cascade

| Modified Component | Depended On By | Impact |
|---|---|---|
| {dataset/measure} | {report-1}, {report-2} | Re-test all dependent reports after change |

*If none: No cascading dependencies identified.*

### Recommended Implementation Sequence

1. Dataset schema changes — unblock measures and reports that depend on new tables/columns
2. DAX measure additions — after dataset changes committed
3. RLS role updates — after all tables and relationships exist
4. Report page additions — after measures and RLS are validated

---

## Conflicts

For each CONFLICT: describe the contradiction between the spec's intent and the existing implementation.
Recommend one of: (a) spec amendment, (b) supervised migration, (c) parallel implementation.

*If none: No conflicts identified.*

---

## Open Questions

Items where the match between spec components and brownfield inventory was uncertain.
Resolve before planning begins.

*If none: No open questions.*
```

## Completion Report

```
IMPACT ANALYSIS COMPLETE — {feature-name}
══════════════════════════════════════════
Brownfield docs : {docs-path}

Components analysed:
  NEW        : {N}
  EXTEND     : {N}
  REPLACE    : {N}
  REFERENCED : {N}
  CONFLICT   : {N}

Risk summary:
  High-risk changes  : {N}
  Dependency cascades: {N}
  Conflicts          : {N}

Output    : specs/{feature-name}/impact-analysis.md
Next step : /reporting-plan {feature-name}
```
