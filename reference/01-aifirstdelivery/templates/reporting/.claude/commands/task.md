Generate development-ready task cards from an approved technical plan.

## Usage

```
/task {feature-name}
```

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`.
2. If status is `NOT READY`, stop and tell the user to resolve blockers in the clarify report first.
3. If status is `PARTIALLY READY`, warn the user and skip tasks flagged as NOT READY.

## Steps

4. Read all files in `constitution/` including `10-alm-configuration.md`.
5. Read `plans/{feature-name}/plan.md` and `specs/{feature-name}/spec.md`.

5a. **Cross-Feature Pre-requisite Check** — read `plans/_component-registry.md` if it exists:
    - Identify any component in `plans/{feature-name}/plan.md`'s Section 4a (Cross-Feature Dependencies) that has overlap type SEQUENTIAL (this feature depends on another feature's component)
    - For each SEQUENTIAL dependency: add a pre-requisite checkbox to every affected task card:
      `- [ ] **Cross-feature dependency:** {component name} (e.g., dataset or dataflow) must be deployed as part of {other-feature} before this task can be completed`
    - For any CONFLICT overlap: add a warning block at the top of the affected task card:
      `> ⚠ **CONFLICT WARNING:** {component name} is also modified by {other-feature}. Coordinate with that feature team before implementing.`
    - If no SEQUENTIAL or CONFLICT overlaps: proceed without adding extra checkboxes

5b. Check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `brownfield.enabled: true`, read ALL brownfield documentation from `{brownfield.docs-path}`:

    **Solution overview:**
    - `component-inventory.md` — solution component counts and package breakdown
    - `00-index.md` (if exists) — index of all generated documents

    **Functional documentation — primary source for entity and attribute mapping:**
    - `functional/entity-catalogue.md` (if exists) — all D365/Dataverse entities with attributes,
      field names, data types; use this to populate Existing Fields for EXTEND tasks with exact names
    - `functional/functional-overview.md` (if exists) — business process context
    - `functional/security-model.md` (if exists) — existing RLS role names and access patterns

    **Architecture:**
    - `architecture/data-model.md` (if exists) — entity relationships and cardinality
    - `architecture/solution-blueprint.md` (if exists) — solution architecture

    **Reporting artefacts:**
    - `reporting/reporting-inventory.md` (if exists) — existing reports, workspaces, and data sources;
      use confirmed workspace names rather than placeholders
    - All files in `reporting/ssrs/` (if exists) — per-SSRS-report detail: existing field lists,
      parameters, stored procedure names; source for Existing Fields in SSRS EXTEND tasks
    - All files in `reporting/power-bi/` (if exists) — per-Power-BI-report inventory; source for
      Existing Fields in Power BI EXTEND tasks

    Use this data to populate the **Existing Fields** row in the Reporting Specifics table for every EXTEND task,
    and to ensure Technical Approach steps reference existing artefacts by their exact names.
    - Also read the `source-file` path recorded in `specs/{feature-name}/impact-analysis.md` for this component:
      - If `source-file` is a valid path: open the file and extract the minimal relevant block:
        - SSRS (.rdl) → the `<DataSets>` block + `<ReportParameters>` list (XML excerpt)
        - Power BI (.pbix/.pbit) → not directly readable; use the brownfield doc's field list as the
          authoritative existing-field reference and note the file path for the developer
        - Shared Dataset (.rds) → the query definition
        Embed this block (or the file path with a note for .pbix) in the task card under
        **Existing System → Existing Artefact**.
        Add **Existing System → Required Delta**: describe the specific change needed (new parameter,
        new measure, new page, modified dataset query) — not a full rewrite instruction.
      - If `source-file: ⚠ NOT FOUND`: write in the task card's **Existing System** section:
        `⚠ Source file not found in input/reporting/. Developer must locate the file before starting. Brownfield doc summary: {summary from Step 5a above}`

6. For each Level-4 task in the plan, generate a task card using `tasks/_template.md` as the authoritative structure:
   - File: `tasks/{feature-name}/{nn}-{task-slug}.md` where `nn` is a sequential two-digit number.
   - Derive `role` and `type` from the task's Role/Type columns in the plan.

7. Write all task cards to `tasks/{feature-name}/`.
8. Print a manifest of all task cards created, grouped by User Story.

## Each Task Card Must Contain

- **Front matter**: task-id, component-type, story-ref, fr-refs, role, type, complexity, status, validation-status, output-path, alm-type, alm-parent-ref, alm-id (null), priority
- **Plan Reference** table — L1/L2/L3 parent chain, related FRs, dependency and follow-on task IDs
- **Context** — story objective and which story ACs this task contributes to
- **Pre-requisites** — checkboxes: specific dependency task IDs + environment/access state
- **Reporting Specifics** table — applicable rows only:
  | Field | Value |
  |---|---|
  | PBIX / RDL File | {filename} |
  | Dataset / Data Source | {dataset or data source name} |
  | Workspace | {workspace name} |
  | Report Page / Tab | {page name (if Report task)} |
  | Measure Name | {measure name (if Measure task)} |
  | RLS Role Name | {role name (if RLS task)} |
  | Stored Procedure | {proc name (if SSRS task)} |
  | Existing Fields | *(brownfield EXTEND tasks only)* {comma-separated list of columns/measures already present in the dataset — sourced from `dataset-catalogue.md` and `measure-catalogue.md`; write "N/A — NEW component" for NEW tasks} |
  | Net-New Fields | *(brownfield EXTEND tasks only)* {comma-separated list of columns/measures being added by this task} |
- **Technical Approach** — numbered steps; specific enough that a BI developer needs no further questions
- **Validation** — 2–4 bullet points: what to execute and what to expect
- **Acceptance Criteria** — AC-001, AC-002, … — numbered, testable, specific
- **Test Cases** — one per AC minimum; positive + negative paths
- **Output Location** — exact path in `output/{feature-name}/`
- **AI Notes** — `> **AI Notes** — {1–2 sentences: key design decision or risk specific to this task}`
- **Definition of Done** — checklist the developer/BI developer signs off before marking DONE

## Rules

- Task cards are developer-ready: a BI developer must be able to implement without asking questions.
- Each task card is self-contained — do not refer to "see previous task" for context.
- Measure task cards must include the business definition of the measure.
- RLS task cards must include the filter logic in plain language (DAX belongs in the TDD).
- SSRS task cards must include the stored procedure name and parameter list.
- Every acceptance criterion must be independently verifiable.
- Pre-requisites must cite specific task IDs — not vague statements like "data model complete".
- *(Brownfield mode)* For EXTEND tasks, the Technical Approach must cite existing fields and measures by their
  exact names from the brownfield inventory — generic references such as "the existing sales measure" are not acceptable.
- *(Brownfield mode)* For REPLACE tasks, the Technical Approach must name the specific artefact being superseded
  and include a step to retire or archive it after the new artefact is validated.

## Task Card Manifest

```
TASK CARDS GENERATED — {feature-name}
═══════════════════════════════════════
User Story {US-Prefix}-001 — {Story Title}
  01-task-slug.md  ({T-Prefix}-001)
  02-task-slug.md  ({T-Prefix}-002)

Total: {N} task cards
Next step: /validate {feature-name}
```
