---
migration: {migration-id}
task-id: {uid}
title: {Task Title}
artefact-type: SQL DDL | SQL SP | ADF Linked Service | ADF Dataset | ADF Data Flow | ADF Pipeline | ADF Trigger | Test Data | ARM Template | Documentation
story-ref: {US-NNN}
feature-ref: {F-NNN}
tags: {tags}
estimate-hours: {N}
alm-id: null
validation-status: NOT VALIDATED | READY TO IMPLEMENT | NEEDS REWORK | BLOCKED
author: Claude Code (/task)
---

# Task: {Task Title}

**ID:** {uid}
**Type:** Task
**Parent Story:** {US-NNN} — {story title}
**Feature:** {F-NNN} — {feature title}
**Tags:** {tags}
**Estimate:** {N}h
**ALM ID:** *(pending)*
**Validation Status:** *(pending)*

---

## Context

{1–2 sentence explanation of why this task exists and what it enables downstream.}

**Artefact type:** {SQL DDL | SQL SP | ADF Linked Service | ADF Dataset | ADF Data Flow | ADF Pipeline | ADF Trigger | Test Data | ARM Template | Documentation}

---

## Artefact

**Output File:** `output/{migration-id}/{path}/{filename}`

---

## Acceptance Criteria

- [ ] {Specific, testable criterion 1}
- [ ] {Specific, testable criterion 2}
- [ ] {Specific, testable criterion 3}

---

## Implementation Notes

### For SQL DDL tasks:

- **Schema:** `{schema}`
- **Table name:** `{table_name}` (follows convention: `stg_{entity}_{source}` or `err_{entity}_{source}`)
- **Required columns:** {list from constitution/03-sql-staging-standards.md}
- **Constraints:** PK on `{pk_column}`, index on `{index_columns}`
- Script must be idempotent (`IF NOT EXISTS` / `IF OBJECT_ID IS NULL`)

### For SQL SP tasks:

- **SP name:** `{sp_name}`
- **Parameters:** `@RunId NVARCHAR(50)`, `@BatchDate DATE`, `{others}`
- **Logic:** {step-by-step bullet points}
- Must use `TRY/CATCH` with `THROW`
- Must be idempotent (safe to re-run for same `@RunId`)

### For ADF Linked Service tasks:

- **JSON file:** `output/{migration-id}/adf/linkedServices/{name}.json`
- **Type:** {AzureBlobStorage | Sftp | AzureSqlDatabase | DynamicsAX | AzureKeyVault}
- **Authentication:** Managed Identity / Key Vault secret reference
- **Key Vault secrets required:** {list}

### For ADF Dataset tasks:

- **JSON file:** `output/{migration-id}/adf/datasets/{name}.json`
- **Linked Service:** `{ls_name}`
- **Format:** {DelimitedText | Json | Parquet}
- **Parameters:** {list}

### For ADF Pipeline tasks:

- **JSON file:** `output/{migration-id}/adf/pipelines/{name}.json`
- **Activities (in order):** {list}
- **Parameters:** `runId`, `environment`, `batchDate`, {others}
- **On failure:** route to `PL_NOTIFY_{Entity}`
- **Retry policy:** 3 retries, 30s interval

### For ADF Data Flow tasks:

- **JSON file:** `output/{migration-id}/adf/dataflows/{name}.json`
- **Source:** `{dataset name}`
- **Sink:** `{dataset name}`
- **Transformations:** {ordered list from field-mapping.md}

### For ADF Trigger tasks:

- **JSON file:** `output/{migration-id}/adf/triggers/{name}.json`
- **Type:** ScheduleTrigger / BlobEventsTrigger
- **Schedule / Event:** {cron expression or storage path pattern}
- **Pipeline:** {pipeline name}

### For Test Data tasks:

- **File:** `output/{migration-id}/tests/data/{filename}`
- **Format:** CSV / JSON
- **Record count:** {N}
- **Scenarios covered:** {list — happy path, missing required field, invalid format, duplicate key}

---

## AI Notes

> **AI Notes** — {1–2 sentences: key implementation decision for this artefact, approach alternative considered and rejected, or risk specific to this task}

---

## Definition of Done

- [ ] Artefact file written to correct `output/` path
- [ ] JSON is valid (ADF artefacts)
- [ ] SQL script is idempotent and executes without error
- [ ] Follows all naming conventions from `constitution/`
- [ ] No hardcoded credentials — all secrets reference Key Vault
- [ ] Referenced Key Vault secret names are documented in the task
- [ ] Task card updated: validation-status = READY TO IMPLEMENT
