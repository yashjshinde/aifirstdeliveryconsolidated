Generate dev-ready task cards from the plan.

## Usage

```
/task {migration-id}
```

## Pre-condition

`plans/{migration-id}/clarify.md` must be **TASK-READY**.

## Steps

1. Read ALL files in `constitution/`.
2. Verify clarify is TASK-READY.
3. Read `plans/{migration-id}/work-items.yaml`.

3b. **Cross-Feature Pre-requisite Check** — read `plans/_component-registry.md` if it exists:
    - Identify any migration component with overlap type SEQUENTIAL (this migration depends on another plan's component)
    - For each SEQUENTIAL dependency: add a pre-requisite checkbox to every affected task card:
      `- [ ] **Cross-feature dependency:** {component name} (e.g., SQL staging table, linked service) must exist as part of {other-plan} before this task can run`
    - For any CONFLICT overlap: add a warning block at the top of the affected task card:
      `> ⚠ **CONFLICT WARNING:** {component name} is also used by {other-plan}. Coordinate before implementing.`
    - If no SEQUENTIAL or CONFLICT overlaps: proceed without adding extra checkboxes

3c. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true` and `specs/{migration-id}/impact-analysis.md` exists:
    - Read `specs/{migration-id}/impact-analysis.md` — Section 8 (Existing ADF Artefacts).
    - For any ADF Pipeline or Data Flow task where Section 8 lists an `EXTEND` artefact:
      - Read the existing artefact JSON from the `source-file` path recorded in Section 8.
      - Extract the minimal relevant block:
        - ADF Pipeline → the `activities` array (not the full pipeline definition)
        - ADF Data Flow → the `transformations` array and `sources`/`sinks` definitions
        - ADF Linked Service → the `typeProperties` block
      - Embed this block in the task card under **Existing Artefact → Current Definition**.
      - Add **Existing Artefact → Required Delta**: describe the specific change needed
        (new activity, modified transformation, added parameter) — not a full rewrite instruction.
    - For `CONFLICT` artefacts: include a warning block in the task card:
      `⚠ CONFLICT: The existing artefact at {source-file} contradicts the spec intent. Resolve
       the open question in impact-analysis.md Section 8 before implementing this task.`
    - For `NEW` artefacts: no existing file — task card proceeds as normal (create from scratch).
    If `false` or impact-analysis.md does not exist: skip.

4. Read TDD and blueprint if they exist.
5. For each Task entry in work-items.yaml, generate a task card in `tasks/{migration-id}/`.

## Task Card Format

File naming: `{NN}-{tag}-{name}.md` where NN is a zero-padded sequence and tag is the component type (e.g. `01-sql-raw-table.md`, `02-sql-stage-table.md`, `03-adf-linkedservice-sftp.md`).

```markdown
# Task: {title}

**ID:**               {uid}
**Type:**             Task
**Parent Story:**     {parent-uid} — {story title}
**Feature:**          {feature-uid} — {feature title}
**Tags:**             {tags}
**Estimate:**         {N}h
**ALM ID:**           *(pending)*
**Validation Status:** *(pending)*

---

## Context

{1-2 sentence explanation of why this task exists and what it enables}

## Artefact

**Output File:** `output/{migration-id}/{path}/{filename}`

## Acceptance Criteria

- [ ] {specific, testable criterion 1}
- [ ] {specific, testable criterion 2}
- [ ] {specific, testable criterion 3}

## Implementation Notes

### {For SQL DDL tasks:}
- Schema: `{schema}`
- Table name: `{table_name}`
- Required columns: {list from constitution/03-sql-staging-standards.md}
- Constraints: {PK, indexes}
- Script must be idempotent (IF NOT EXISTS)

### {For SQL SP tasks:}
- SP name: `{sp_name}`
- Parameters: `@RunId NVARCHAR(50)`, `@BatchDate DATE`
- Logic: {step-by-step bullet points}
- Must use TRY/CATCH with THROW
- Must be idempotent (safe to re-run for same @RunId)

### {For ADF Linked Service tasks:}
- JSON file: `output/{migration-id}/adf/linkedServices/{name}.json`
- Type: {LinkedServiceType}
- Authentication: {method}
- Key Vault secrets required: {list}

### {For ADF Dataset tasks:}
- JSON file: `output/{migration-id}/adf/datasets/{name}.json`
- Linked Service: {ls_name}
- Format: {format}
- Parameters: {list}

### {For ADF Pipeline tasks:}
- JSON file: `output/{migration-id}/adf/pipelines/{name}.json`
- Activities: {list in order}
- Parameters: runId, environment, batchDate + {others}
- On failure: route to PL_NOTIFY_{Entity}
- Retry policy: 3 retries, 30s interval

### {For ADF Data Flow tasks:}
- JSON file: `output/{migration-id}/adf/dataflows/{name}.json`
- Source: {dataset name}
- Sink: {dataset name}
- Transformations: {ordered list from field mapping}

### {For test data tasks:}
- File: `output/{migration-id}/tests/data/{filename}`
- Format: CSV/JSON
- Record count: {N}
- Scenarios covered: {list}

## AI Notes

> **AI Notes** — {1–2 sentences: key implementation decision for this artefact, approach alternative considered and rejected, or risk specific to this task}

## Definition of Done

- [ ] Artefact file written to correct path
- [ ] JSON is valid (ADF artefacts)
- [ ] SQL script is idempotent and executes without error
- [ ] Follows all naming conventions from `constitution/`
- [ ] No hardcoded credentials
- [ ] Referenced Key Vault secrets are documented
```

## Rules

- **AI Notes:** In every task card, populate the `## AI Notes` section with `> **AI Notes** — {1–2 sentences: key implementation decision for this artefact, approach alternative considered and rejected, or risk specific to this task}`. Write only what is non-obvious — never summarise what the task does.

## Ordering

Generate task cards in this order:
1. Infrastructure (Key Vault secrets documentation)
2. SQL schema (schemas DDL)
3. SQL tables (raw → stage → error → audit, in that order)
4. SQL stored procedures
5. ADF Linked Services
6. ADF Datasets (source → staging → target)
7. ADF Data Flows
8. ADF Pipelines (Notify → Ingest/Extract → Transform/Export → Orchestrator)
9. ADF Triggers
10. Test data files
11. Test scripts
12. ARM template and deploy script
13. Documentation tasks

---

## Output

Write `tasks/{migration-id}/NN-{name}.md` for each task.

Print:

```
TASKS GENERATED — {migration-id}
════════════════════════════════════════
Folder    : tasks/{migration-id}/
Total     : {N} tasks
  SQL     : {N} (schema + SPs)
  ADF     : {N} (LS + DS + DF + PL + TR)
  Testing : {N}
  Deploy  : {N}
  Docs    : {N}

Next step: /validate {migration-id}
```
