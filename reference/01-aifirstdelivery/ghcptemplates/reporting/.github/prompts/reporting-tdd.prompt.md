---
mode: agent
description: "Generate a Reporting Technical Design Document - data model, DAX measures, RLS design, report layout specs. Triggers on: 'tdd', 'technical design'."
---

Generate a Technical Design Document (TDD) for a Reporting feature from an approved plan.

## Usage

```
/reporting-tdd {feature-name}
```

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`. If status is not `TASK-READY`, stop: "Run /reporting-clarify first."
2. Read all files in `constitution/`.
3. Read `specs/{feature-name}/spec.md` and `docs-generated/{feature-name}/functional-design-document.md`.

3a. Check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `brownfield.enabled: true`, read ALL brownfield documentation from `{brownfield.docs-path}`:

    **Solution overview:**
    - `component-inventory.md` — solution component counts and package breakdown
    - `00-index.md` (if exists) — index of all generated documents

    **Functional documentation — primary source for entity and attribute mapping:**
    - `functional/entity-catalogue.md` (if exists) — all D365/Dataverse entities with attributes,
      field names, data types, and optionset values; use as the baseline for which source fields
      exist before designing fact/dimension table columns in §3
    - `functional/functional-overview.md` (if exists) — business process context
    - `functional/security-model.md` (if exists) — existing security roles; extend rather than duplicate

    **Architecture:**
    - `architecture/data-model.md` (if exists) — entity relationships and cardinality; use as baseline
      for EXTEND datasets — add only the delta rather than redesigning the full schema from scratch
    - `architecture/solution-blueprint.md` (if exists) — solution architecture

    **Reporting artefacts:**
    - `reporting/reporting-inventory.md` (if exists) — existing reports, data sources, workspaces;
      use confirmed workspace IDs rather than placeholders
    - All files in `reporting/ssrs/` (if exists) — per-SSRS-report detail: existing field lists,
      stored procedures, parameters; use as the measure/column baseline for EXTEND tasks
    - All files in `reporting/power-bi/` (if exists) — per-Power-BI-report inventory; extend the
      existing `_Measures` table rather than creating a parallel one; do not duplicate any measure
      whose name and logic already appear in these docs

    Throughout §3–§6, prefix every referenced artefact with its brownfield status:
    **[REUSED]**, **[EXTENDED]**, or **[NEW]** so developers immediately know what already exists.

## Steps

4. Generate the TDD and write to `docs-generated/{feature-name}/technical-design-document.md`.
5. Print a section summary: datasets designed, measures documented, RLS expressions written, SSRS queries listed.

## TDD Structure

**§1 Document Control**
Version 1.0. Technical reviewers: Solution Architect, Data Engineer, BI Developer.

**§2 Architecture Overview**
- High-level architecture diagram (Mermaid) showing: data sources → dataflows/ADF → datasets → reports → consumers.
- Technology stack: Power BI version/capacity tier, SSRS version, gateway type, data source types.
- Storage mode decisions per dataset (Import / DirectQuery / Composite) with justification.

**§3 Data Model Design**
For each dataset:
- Star schema diagram (Mermaid erDiagram): fact tables, dimension tables, bridge tables, relationships.
- Table inventory: Table Name | Type (Fact/Dim/Bridge) | Storage Mode | Row Count Estimate | Source | Partition Column.
- Relationship inventory: From Table | To Table | Direction | Cardinality | Active/Inactive | Reason if Inactive.
- Date table specification: date range, columns, fiscal calendar configuration.
- *(Brownfield mode)* For EXTENDED datasets: show only the delta — new tables and new columns on existing tables.
  Do not redocument unchanged tables or columns. Prefix each new table/column with **[NEW]** and each unchanged
  one referenced for context with **[REUSED]**. Carry forward existing relationship definitions unchanged.

**§4 Data Source and Connection Design**
- Per data source: Source System | Connector Type | Auth Method | Gateway Required | Shared Data Source Name.
- Dataverse connector: environment URL, service principal app ID (variable name, not value), required permissions.
- SQL/on-premises: gateway cluster name, connection string (parameterised), service account.
- Dataflow dependencies: dataflow name, workspace, refresh order.

**§5 Measure Catalogue (DAX)**
For every measure:
- Measure Name | Business Definition | DAX Expression | Format String | Source Table | FR Ref.
- Format DAX using DAX Formatter conventions — line breaks after each argument.
- Flag any measure with ⚠ PERFORMANCE RISK if it uses SUMX over large tables or contains nested CALCULATE.
- *(Brownfield mode)* Add a **Status** column: REUSED | EXTENDED | NEW.
  - **REUSED** — measure already exists in `measure-catalogue.md`; reproduce the existing DAX verbatim, do not alter.
  - **EXTENDED** — measure exists but filter context or variables must change; show both the existing and updated DAX.
  - **NEW** — measure is net-new; check `measure-catalogue.md` first to confirm no synonym exists.
  All measures live in the existing `_Measures` table — do not create a duplicate or renamed measures table.

**§6 RLS Technical Design**
For every RLS role:
- Role Name | DAX Filter Expression | Table Applied To | User Mapping Source | Test Users.
- For dynamic RLS: document the `USERPRINCIPALNAME()` lookup and the user-mapping table structure.
- Confirm that the role definition is tested using "View as role" in Power BI Desktop.

**§7 SSRS / Paginated Report Technical Design**
For each SSRS or Paginated report:
- RDL file name and deployment path.
- Shared data source: name, connection string variable, credential type.
- Dataset queries: stored procedure name, parameters, expected row count range.
- Parameters: name, data type, default, available values source, cascade dependency.
- Report layout: page size, header/footer content, group structure, conditional formatting expressions.
- Subscriptions: schedule, format, recipient list source, parameter values.

**§8 Refresh and Pipeline Design**
- Dataset refresh schedule: cron expression, retry policy, failure notification DL.
- Incremental refresh configuration: archive window, incremental window, partition column.
- Dataflow refresh dependencies (must complete before dataset refresh).
- For DirectQuery: no refresh schedule — document query folding assumptions and aggregation tables.

**§9 Workspace and Deployment Configuration**
- Workspace IDs (DEV/UAT/PROD) — stored as pipeline variables, not hardcoded.
- Deployment pipeline ID and stage configuration.
- Service principal app registration name and permission scopes required.
- Report-level connection string parameters for environment promotion.

**§10 Performance Design**
- Aggregation tables (if DirectQuery): aggregate table structure, DAX SUMMARIZECOLUMNS definition.
- Query reduction techniques applied per report: reduce visuals interactions, disable cross-filter where not needed.
- Performance Analyzer baseline targets per report page.

**§11 Non-Functional Requirements**
Technical targets derived from the spec and `constitution/09-nfr-targets.md`. Include: load time targets, refresh window, model size, concurrent user capacity.

**§12 Technical Risks and Mitigations**
One row per risk: Risk | Severity | Mitigation | FR Ref.

**Appendix A — FR → Technical Artefact Traceability**
FR-NNN | Module | Dataset | Report | Measure(s) | RLS Role | Task ID.

## Rules

- Every DAX measure in the spec's measure catalogue must appear in §5 with a complete expression.
- Every RLS role in the spec must appear in §6 with a DAX filter expression.
- Every SSRS report must appear in §7 with a stored procedure name.
- Do not reference task IDs not yet in the plan — use FR-NNN as the reference.

