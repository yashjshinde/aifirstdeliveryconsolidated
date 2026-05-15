# ADF / Data Migration Analysis Rules

This file defines how the CE Brownfield agent documents Azure Data Factory artifacts found in `input/adf/`. Documentation follows Data Migration agent standards — the Reporting Agent documents the visuals; this agent documents what moves the data.

## Principle

The CE Brownfield agent is the **single documentation agent** for all artifacts in the solution. ADF artifacts are documented here for completeness. The resulting documentation (`docs-generated/data-migration/`) is a handoff package for the Data Migration agent to use as the starting point for its implementation work.

---

## ADF Artifact Detection Signatures

| File/Pattern | Component Type |
|---|---|
| `pipelines/*.json` | ADF Pipeline definition |
| `linkedServices/*.json` | ADF Linked Service (connection definition) |
| `datasets/*.json` | ADF Dataset definition |
| `dataflows/*.json` or `dataflow/*.json` | ADF Data Flow (transformation logic) |
| `triggers/*.json` | ADF Trigger (schedule or event) |
| `*.json` with `"$schema"` containing `"pipeline"` | ADF Pipeline |
| `*.json` with `"properties.type"` = `"AzureSqlDatabase"` / `"AzureBlob"` / `"SftpServer"` etc. | Linked Service |

---

## Pipeline Documentation Rules

For each pipeline JSON (`pipelines/{Name}.json`):

### What to Extract

1. **Pipeline Name** — `name` field at root.
2. **Description** — `properties.description` (often empty; infer from activity names).
3. **Parameters** — `properties.parameters` object: parameter name, type, default value.
4. **Activities** — `properties.activities` array. For each activity:
   - `name`: activity display name
   - `type`: Copy | Lookup | GetMetadata | ForEach | IfCondition | Wait | SetVariable | ExecutePipeline | DataFlow | SqlServerStoredProcedure | WebActivity | AzureFunctionActivity
   - `dependsOn`: upstream activity names and conditions (Succeeded/Failed/Skipped/Completed)
   - For Copy activities: `source.type`, `sink.type`, `source.query` / `sink.tableName`
   - For DataFlow activities: `typeProperties.dataflow.referenceName`
   - For ForEach: `items`, `activities` (nested)
   - For IfCondition: `expression.value`, `ifTrueActivities`, `ifFalseActivities`
5. **Inferred direction**: source linked service type → sink linked service type (e.g., SFTP → Dataverse).

### Activity Sequence

Document as a numbered list showing the pipeline flow:
```
1. GetMetadata — Check if SFTP file exists
2. IfCondition — File found?
   True:
     3. Copy — SFTP CSV → SQL Staging (stg_customers_raw)
     4. DataFlow — Transform and upsert to Dataverse
     5. SqlStoredProcedure — Mark records processed
   False:
     6. Wait — 30 minutes
```

---

## Linked Service Documentation Rules

For each linked service (`linkedServices/{Name}.json`):

| Field | What to Document |
|---|---|
| `name` | Linked service name |
| `properties.type` | Technology type (AzureSqlDatabase, SftpServer, AzureDataLakeStorage, CosmosDb, Dataverse, etc.) |
| `properties.typeProperties.server` / `url` / `host` | Connection target (exclude credentials) |
| `properties.typeProperties.authenticationType` | Auth mechanism (ServicePrincipal, ManagedIdentity, Basic, Key) |

Flag `Basic` auth (username/password) as `⚠ SECURITY RISK — should use managed identity or service principal`.
Never document actual credential values — only authentication type.

---

## Dataset Documentation Rules

For each dataset (`datasets/{Name}.json`):

| Field | What to Document |
|---|---|
| `name` | Dataset name |
| `properties.type` | Dataset type (AzureSqlTable, DelimitedText, Json, Parquet, etc.) |
| `properties.linkedServiceName.referenceName` | Which linked service it uses |
| `properties.typeProperties.tableName` / `fileName` / `folderPath` | Target table or file path |
| Column mappings | `properties.schema` array if present — column names and types |

---

## Data Flow Documentation Rules

For each data flow (`dataflows/{Name}.json`):

1. **Transformation Sources** — each source dataset and linked service.
2. **Transformation Steps** — filter, derived columns, join, aggregate, conditional split steps.
3. **Sinks** — each sink dataset and write behaviour (insert/update/upsert/delete).
4. **Column Mappings** — if explicit mappings exist, document source column → target column.
5. **Business logic inferred** — note any filter conditions or derivation logic in plain language.

---

## Trigger Documentation Rules

For each trigger (`triggers/{Name}.json`):

| Trigger Type | What to Document |
|---|---|
| `ScheduleTrigger` | CRON expression → human-readable schedule; time zone; pipeline(s) triggered |
| `TumblingWindowTrigger` | Frequency; start time; pipeline triggered; retry policy |
| `BlobEventsTrigger` | Storage account; container; blob path pattern; event type (created/deleted) |
| `CustomEventsTrigger` | Event Grid topic; subject filter; pipeline triggered |

---

## Output Structure

All ADF documentation goes to `docs-generated/data-migration/`:

```
docs-generated/data-migration/
├── adf-topology.md           ← summary: all pipelines, linked services, triggers
├── pipelines/{Name}.md       ← per-pipeline detail
└── dataflows/{Name}.md       ← per-data-flow detail (if complex enough to warrant own file)
```

### adf-topology.md Structure

```markdown
# ADF Topology

## Pipeline Inventory

| Pipeline Name | Direction | Source | Sink | Schedule | Description |
|---|---|---|---|---|---|

## Linked Service Inventory

| Name | Type | Target | Auth Method | Notes |
|---|---|---|---|---|

## Trigger Inventory

| Trigger Name | Type | Schedule / Event | Pipelines Triggered | Notes |
|---|---|---|---|---|

## Integration with D365 CE

[Document which Dataverse entities are written to or read from by each pipeline]
```

---

## Flagging Conventions

```
⚠ NEEDS REVIEW       Cannot determine pipeline intent from activity names alone
⚠ SECURITY RISK      Basic auth on linked service; hard-coded credentials detected
⚠ NO ERROR HANDLING  Pipeline has no IfCondition or Try/Catch around failure-prone steps
⚠ ORPHANED PIPELINE  Pipeline found with no trigger referencing it
*(inferred)*          Direction or purpose derived from context, not explicit naming
```

---

## Handoff Note

Include at the top of `docs-generated/data-migration/adf-topology.md`:

> **Note:** This documentation was generated by the CE Brownfield agent. It covers the ADF/Data Migration components found in this solution. The **Data Migration agent** is the implementation owner for these components — provide this document as input to the Data Migration agent's `/spec` workflow.
