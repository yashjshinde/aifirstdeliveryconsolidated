---
mode: agent
description: "Generate a Reporting technical plan - DataModel, Measure, RLS, Report tasks. Triggers on: 'plan', 'technical plan'."
---

Generate a technical plan for a Reporting feature from an approved functional specification.
Produces two outputs: a human-readable plan.md and a machine-readable work-items.yaml for ALM sync.

## Usage

```
/reporting-plan {feature-name}
```

## Pre-condition Check

1. Read `specs/{feature-name}/review.md`. If status is not `APPROVED`, stop: "Run /reporting-review first."

## Steps

2. Read all files in `constitution/` including `10-alm-configuration.md`.
3. Read `specs/{feature-name}/spec.md`.

3a. Check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `brownfield.enabled: true`:
    - Read `specs/{feature-name}/impact-analysis.md` — **required**; if it does not exist, stop:
      "Run /reporting-impact {feature-name} first — impact-analysis.md is required by /reporting-plan when brownfield mode is enabled."
    - Read ALL brownfield documentation from `{brownfield.docs-path}`:

      **Solution overview:**
      - `component-inventory.md` — solution component counts and package breakdown
      - `00-index.md` (if exists) — index of all generated documents

      **Functional documentation — primary source for entity and attribute mapping:**
      - `functional/entity-catalogue.md` (if exists) — all D365/Dataverse entities with attributes,
        field names, and data types; use this to confirm exact names for REUSED vs net-new fields
      - `functional/functional-overview.md` (if exists) — business process context
      - `functional/security-model.md` (if exists) — existing security roles

      **Architecture:**
      - `architecture/data-model.md` (if exists) — entity relationships and cardinality
      - `architecture/solution-blueprint.md` (if exists) — solution architecture

      **Reporting artefacts:**
      - `reporting/reporting-inventory.md` (if exists) — existing reports, data sources, workspaces
      - All files in `reporting/ssrs/` (if exists) — per-SSRS-report detail
      - All files in `reporting/power-bi/` (if exists) — per-Power-BI-report inventory

    Use the impact classification from `impact-analysis.md` (NEW / EXTEND / REPLACE / REFERENCED / CONFLICT)
    to annotate each Level-4 task and to avoid planning build tasks for components already in the brownfield estate.

3b. **Cross-Feature Dependency Scan** — scan existing feature plans before generating any content:
    - List all subdirectories in `plans/` (skip `_template.md`, `_component-registry.md`)
    - For each subdirectory that has a `plan.md`, read its **Section 2 — Task Inventory** (Artefacts column)
    - Read `plans/_component-registry.md` if it exists
    - Extract all Reporting components claimed by other features: Power BI datasets, Power BI reports, SSRS reports, DAX measures, RLS roles, Power BI workspaces, Dataflow names
    - Compare against this spec's **§6 Report Impact Summary** to find shared components
    - Classify each overlap:
      - **CONFLICT** — incompatible change to the same component (e.g., two features both modify the same dataset or define conflicting RLS roles)
      - **SEQUENTIAL** — this feature depends on another feature's component existing first (e.g., this report requires a dataset or dataflow that another feature's plan creates)
      - **SHARED** — both features reference the same component without conflicting modifications (informational only)
    - Record all findings. If no other `plan.md` exists: note "First feature in this application — no existing plans to scan."
    - Results populate **Section 4a — Cross-Feature Dependencies** in the plan output.

4. From `constitution/10-alm-configuration.md`, read the work item hierarchy and ID prefixes.
5. Decompose the spec into four levels using the configured ALM type names:
   ```
   {Level-1 type}  (Reporting Capability — one per major reporting domain / module)
     └─ {Level-2 type}  (Functional Grouping — e.g., Dataset, Report Build, RLS, Deployment)
          └─ {Level-3 type}  (As a {persona}, I want {report/capability}, so that {business value})
                └─ {Level-4 type}  (WHAT to build — dataset table, measure, RLS role, report page, stored procedure)
   ```

6. For each Level-4 item, identify:
   - Component type: Dataset | DataModel | Measure | RLS | Report-Interactive | Report-Paginated | Report-SSRS | Dataflow | Configuration | Deployment | Testing
   - Artefacts affected: PBIX name, RDL name, dataset name, measure name, workspace
   - Dependencies on other tasks
   - Estimated complexity: S | M | L | XL
   - Priority: High | Medium | Low
   - FR references: one or more FR-NNN
   - **Role**: Developer | BI Developer | Data Engineer | QA | Functional
   - **Type**: DataModel | MeasureDev | RLSConfig | ReportBuild | SSRSDev | Dataflow | Config | Testing | Deployment
   - **Brownfield action** *(brownfield mode only)*: NEW | EXTEND | REPLACE | REFERENCED — derived from `impact-analysis.md`.
     For EXTEND tasks: list which existing fields and measures are REUSED vs which are net-new additions.
     For REPLACE tasks: note which existing artefact is superseded.

   **Phase assignment for Configuration tasks:**
   - Workspace setup, sensitivity label assignment, gateway configuration → Phase 1 (data foundation)
   - Refresh schedule configuration, deployment pipeline setup → Phase 4 (deployment)

   **Test tasks (mandatory):**
   For every Measure task: generate a paired data-accuracy test task.
     - Type: Testing | Name: `TEST-{parent-task-id}-data-accuracy` | Checks tolerance ≤ ±0.01% against source
   For every RLS task: generate a paired RLS validation test task.
     - Type: Testing | Name: `TEST-{parent-task-id}-rls-validation` | Covers happy path, exclusion, and empty-state scenarios
   For every Report-Interactive or Report-SSRS task: generate a paired visual/render test task.
     - Type: Testing | Name: `TEST-{parent-task-id}-visual-render` | Covers page load time, cross-filter, drill-through

7. Assign sequential IDs using the configured prefixes.

8. Write `plans/{feature-name}/plan.md` using `plans/_template.md` as the authoritative output structure, with:

   **Section 1 — Work Breakdown (fully nested hierarchy)**
   Each L1 block: ALM ID (pending), Description, FR Coverage, Success Criteria, Architecture Summary (data flow: Source → Dataset → Report → Consumer).
   Each L2 block: ALM ID (pending), Description, FR Coverage.
   Each L3 block: ALM ID (pending), As a / I want to / So that, Mapped FR, Acceptance Criteria (min 2 Given/When/Then).
   Tasks table: Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type.

   **Section 2 — Task Inventory**
   Consolidated table: Task ID, ALM ID, L1, L2, L3, Title, Component Type, Complexity, Role, Type, FR Ref. Totals by complexity and role.

   **Section 3 — Implementation Sequence**
   Phase 1 = DataModel + Dataflow tasks (data foundation first).
   Phase 2 = Measure + RLS tasks (semantic layer).
   Phase 3 = Report build tasks (visual layer).
   Phase 4 = Testing + Deployment tasks.
   Reference specific task IDs in each phase.

   **Section 4a — Cross-Feature Dependencies**
   Findings from the scan in step 3b. For each overlap: feature name, component, overlap type (CONFLICT / SEQUENTIAL / SHARED), and recommended action. If none: "No cross-feature overlaps found."

   **Section 4 — Dependency Mapping**
   Dataset-to-report, measure-to-report, RLS-to-report, dataflow-to-dataset dependency tables.

   **Section 5 — FR → Story → Task Traceability**
   One row per FR: FR, L1, L3s, Key Task IDs.

   **Section 6 — Constitution Exception Requests**
   One row per exception; "None identified." if none.

   **Section 7 — Document Control**
   Version 1.0, date, author.

9. Write `plans/{feature-name}/work-items.yaml` using `plans/_work-items-template.yaml` as the authoritative structure — every item at all four levels.
   - Level 4 fields: component-type, complexity, status: TODO, validation-status: NOT VALIDATED, impl-doc-path: null.
   - Every item: uid = "{feature-name}-{item-id}", alm-id: null.
   - If work-items.yaml already exists: preserve all existing uid and non-null alm-id values.

10. Update `plans/_component-registry.md`:
    - If the file does not exist, create it with this header row:
      `| Feature | Agent | Component Type | Component Name | Action | Plan Path |`
    - For each Reporting component claimed in this plan (Power BI datasets, Power BI reports, SSRS reports, DAX measures, RLS roles, Dataflows, Power BI workspaces), add or update one row:
      - **Feature**: `{feature-name}`
      - **Agent**: `reporting`
      - **Component Type**: PBIDataset | PBIReport | SSRSReport | DAXMeasure | RLSRole | Dataflow | PBIWorkspace | Configuration
      - **Component Name**: exact dataset name, report name, measure name, RLS role name, or workspace name
      - **Action**: NEW | EXTEND | REPLACE (from impact-analysis.md if brownfield; otherwise NEW)
      - **Plan Path**: `plans/{feature-name}/plan.md`
    - UPSERT logic: if a row for this feature + component already exists, update it; if it is new, append it
    - Never delete or modify rows belonging to other features

11. Print summary: L1/L2/L3/L4 counts, complexity breakdown, role breakdown, exception requests.

## Rules

- Data model tasks must appear in Phase 1 — before any measure or report task that depends on those tables.
- Measures must appear in Phase 2 — before report build tasks that use them.
- RLS configuration must appear in Phase 2 — before UAT on any report with RLS.
- Every Level-4 item must trace to at least one FR-NNN.
- The Architecture Summary describes the data flow at planning level — no DAX, no SQL, no PBIX detail.
- **AI Notes:** At the end of each L1 and L2 description block, append `> **AI Notes** — {1–2 sentences: decomposition rationale, architectural decision made, or exception taken}`.
