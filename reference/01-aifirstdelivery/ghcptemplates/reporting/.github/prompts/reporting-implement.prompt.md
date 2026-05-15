---
mode: agent
description: "Implement a Reporting task card - generate DAX measures, RLS definitions, RDL specs, dataset config. Triggers on: 'implement', 'generate code'."
---

Implement a development-ready Reporting task card and update the feature implementation tracker.

## Usage

```
/reporting-implement {feature-name}/{task-file}
```

## Pre-condition Check (GATE)

1. Read the task card front matter and check `validation-status`.
2. If `validation-status` is not `READY TO IMPLEMENT`, stop:
   - If `NEEDS REWORK`: "Run `/reporting-validate {feature-name}` first and fix all reported issues."
   - If `BLOCKED`: "This task is blocked by an incomplete dependency."

## Steps

### 1. Load context

3. Read all files in `constitution/`.
4. Read the full task card.
5. Read `specs/{feature-name}/spec.md` for business context.
6. Note the `component-type` — it controls which implementation path to follow.

### 2. Mark task as started

7. Update the task card front matter: set `status: IN PROGRESS`.
8. Create or update `tasks/{feature-name}/tracker.md`.

### 3. Implement the task

Check `component-type` and follow the matching path:

#### Path A — DataModel / Dataset
- Generate TMDL files (model.tmdl, tables/*.tmdl, relationships.tmdl) for the dataset structure.
- Document all tables with columns, data types, and source expressions.
- Document all relationships with direction, cardinality, and active/inactive state.
- Document the Date table specification.
- Write to `output/{feature-name}/dataset/tmdl/`.

#### Path B — Measure
- Generate a DAX measure file: `output/{feature-name}/dataset/measures/{measure-name}.dax`.
- Format using DAX Formatter conventions.
- Include: measure name, DAX expression, format string, and a brief inline comment explaining the calculation intent (one line only).
- Write a paired data-accuracy test specification: `output/{feature-name}/tests/{measure-name}-test.md` with test queries and expected values.

#### Path C — RLS
- Generate the RLS role definition: `output/{feature-name}/dataset/rls/{role-name}.md`.
- Include: role name, DAX filter expression per table, user mapping source, test procedure.
- Write a paired RLS test record: `output/{feature-name}/tests/{role-name}-rls-test.md`.

#### Path D — Report-Interactive
- Generate a report specification document: `output/{feature-name}/reports/{pbix-name}-spec.md`.
- Document all pages: page name, purpose, visual list, filter list, interaction behaviour.
- Document all measures used per page.
- Include deployment configuration: workspace, dataset reference, connection string parameter names.

#### Path E — Report-SSRS / Report-Paginated
- Generate the RDL structure specification: `output/{feature-name}/rdl/{rdl-name}-spec.md`.
- Include: data source reference, dataset queries (stored procedure calls with parameters), report parameters, group structure, header/footer content, conditional formatting rules.
- Generate the stored procedure script: `output/{feature-name}/sql/{proc-name}.sql`.

#### Path F — Dataflow
- Generate dataflow configuration specification: `output/{feature-name}/dataflow/{dataflow-name}-spec.md`.
- Document all queries: source, transformations applied, output table name, data types.
- Document refresh schedule and incremental refresh configuration.

#### Path G — Configuration / Deployment
- Work through each Technical Approach step.
- For automatable steps: generate configuration files (workspace JSON, pipeline JSON, deployment scripts).
- For manual steps: document with `[MANUAL]` prefix and exact instructions.
- Write deployment checklist: `output/{feature-name}/deployment/{task-id}-checklist.md`.

### 4. Verify

- Confirm all acceptance criteria can be checked off.
- Confirm all Definition of Done items are met.
- Confirm no constitution rule is violated.

### 5. Generate implementation record

9. Create `output/{feature-name}/impl-docs/{task-id}-{task-slug}-impl.md`.
10. Update the task card front matter: set `impl-doc-path`.

### 6. Mark task done and update tracker

11. Update the task card: set `status: DONE`.
12. Update `tasks/{feature-name}/tracker.md`.

### 7. Print completion summary

```
IMPLEMENTATION COMPLETE — {task-id}: {task-title}
══════════════════════════════════════════════════
Component type : {component-type}
Files created  : {list of file paths}
Impl doc       : output/{feature}/impl-docs/{task-id}-{slug}-impl.md
Tracker        : tasks/{feature}/tracker.md updated ({done} of {total} tasks done)

Manual steps required:
  {numbered list, or "None — all steps automated"}
```
