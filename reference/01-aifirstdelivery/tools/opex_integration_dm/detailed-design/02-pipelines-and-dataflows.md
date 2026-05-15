# 02 — ADF Pipelines & Mapping Data Flows

Implementer-ready specification for every Azure Data Factory pipeline and Mapping Data Flow in the framework. Each pipeline is documented as an **activity DAG** with parameter contracts, expression bindings, retry/timeout policy, and explicit success/failure outcomes. After the per-pipeline sections, the **Transform Expression Library** gives the exact Data Flow expression for every transform type from [01-config-schemas.md §3](01-config-schemas.md#3-entity-mapping-schema).

## 0. Conventions

### 0.1 Pipeline parameters

Every pipeline accepts a common parameter envelope plus pipeline-specific values:

| Parameter | Type | Required | Purpose |
| --- | --- | --- | --- |
| `entityKey` | string | yes | Slug from entity config; drives folder paths and config lookup. |
| `runId` | string | no (defaults to `pipeline().RunId`) | Correlation ID. Reused on re-runs from checkpoint. |
| `waveRunId` | string | no | When the pipeline is invoked from `pl_wave_orchestrator`, the parent wave's RunId. |
| `direction` | string enum: `inbound`, `outbound` | yes for bidirectional entities | Picked by parent orchestrator from entity config or wave config. |
| `configPath` | string | no | Absolute ADLS path; overrides `/config/entities/<entityKey>.json` when wave pins a snapshot. |
| `runMode` | string enum: `incremental`, `full` | no (default `incremental`) | Forces full extract on outbound. |
| `forceFull` | bool | no (default `false`) | Outbound-only override that resets the watermark for this run. |

### 0.2 Activity naming convention

`<Verb>_<Object>` (PascalCase), e.g. `Lookup_EntityConfig`, `Copy_RawToStaged`, `WebActivity_BypassPlugins`. Activity names are referenced in expressions and in checkpoint markers, so renames are breaking changes.

### 0.3 Activity-level retry policy

Default for every activity unless overridden by the per-pipeline spec:

```json
"policy": {
  "timeout": "0.02:00:00",      // 2 hours
  "retry": 3,
  "retryIntervalInSeconds": 60,
  "secureOutput": false,
  "secureInput": false
}
```

`secureInput`/`secureOutput` are set to `true` on activities that touch Key Vault references or Dataverse SPN secrets.

### 0.4 Checkpoint markers

Every sub-pipeline writes `/audit/checkpoints/<runId>/<pipelineName>.json` on success:

```json
{
  "pipelineName": "pl_extract_file",
  "entityKey": "customer",
  "runId": "<guid>",
  "status": "Success",
  "startedAt": "2026-05-13T02:00:14Z",
  "completedAt": "2026-05-13T02:00:47Z",
  "metrics": { "rowsIn": 100, "rowsOut": 100 }
}
```

`pl_master_orchestrator` reads checkpoints on re-run with the same `runId` and skips already-completed sub-pipelines.

### 0.5 Audit log row

Every pipeline appends one row to `/audit/run_history.parquet` on completion (regardless of status):

```
runId | waveRunId | entityKey | direction | pipelineName | step | status | startedAt | completedAt | inputRows | outputRows | errorRows | failureReason
```

`status` ∈ `Success | Partial | Failed | Skipped`.

---

## 1. `pl_wave_orchestrator`

Multi-entity orchestrator from spec §5. Single source of `waveRunId`.

**Parameters:**

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `waveKey` | string | yes | Resolves `/config/waves/<waveKey>.json` |
| `runMode` | string | no | `incremental`/`full`, passed through to children |
| `forceFull` | bool | no | Outbound override |
| `entityFilter` | array<string> | no | Empty → run all entities; non-empty → run only those (see spec §5.6) |
| `priorWaveRunId` | string | no | When set, child entities inherit this `waveRunId` and reuse `/audit/wave_runs/<priorWaveRunId>/configs/` |

**Activity DAG:**

```
SetVariable_WaveRunId
   │
Lookup_WaveConfig                    /config/waves/{waveKey}.json
   │
Lookup_ProjectConfig                 /config/_project.json
   │
ForEach_EntityForSnapshot   ──► Copy_PinConfig (if configVersion=pinAtWaveStart)
   │
SetVariable_ExecutionPlan            topo-sort entities, group by phase
   │
ForEach_Phase  (sequential)
   │
   ForEach_EntityInPhase (parallel iff entity.concurrent=true)
   │     │
   │     IfCondition_ShouldRun
   │       True  → ExecutePipeline_EntityOrchestrator(pl_master_orchestrator)
   │       False → Append_SkippedStatus
   │     │
   │     Copy_EntityStatus            → /audit/wave_runs/<waveRunId>/<entityKey>.json
   │
   IfCondition_RefreshMastersBetweenPhases
     True → ExecutePipeline_RefreshTouchedMasters
   │
WebActivity_AggregateWaveStatus      reads all per-entity status JSONs
   │
WebActivity_SendWaveNotification     Logic App
   │
Copy_WaveSummary                     → /audit/wave_runs/<waveRunId>/wave_summary.json
```

**Key expressions:**

- `WaveRunId`: `@coalesce(pipeline().parameters.priorWaveRunId, pipeline().RunId)`
- Execution plan computed inline using a chain of `Filter` activities (one per phase) plus a `SetVariable` accumulator. Reference: Microsoft Learn pattern "topological sort in ADF using nested ForEach".
- Skip check `ShouldRun`:
  ```
  @or(
    empty(variables('FailedDependencies')),
    equals(activity('Lookup_WaveConfig').output.firstRow.failurePolicy.onDependencyFailure, 'runAnyway')
  )
  ```
- **All `Lookup` activities reading a single JSON config (`Lookup_WaveConfig`, `Lookup_EntityConfig`, `Lookup_ProjectConfig`) must be configured with `firstRowOnly: true`** — without this, the output property is `.value` (an array) instead of `.firstRow` (a single object), and every downstream `@activity('Lookup_*').output.firstRow.X` expression returns `null`. This is the most common cut-and-paste defect in ADF; pin it in the activity JSON.

**Concurrency:** `concurrency: 1` at the pipeline level — only one instance per `waveKey` runs at a time. Subsequent triggers queue.

**Failure handling:**

- If `failurePolicy.onEntityFailure == "stopWave"`: the inner `ForEach_Phase` is wrapped in a Failure path that breaks the outer loop using `Until` with a `WaveAborted` flag.
- If `continueIndependent`: the outer ForEach is plain and `Append_SkippedStatus` records skipped entities for the final aggregator.

**Outputs:**

- `/audit/wave_runs/<waveRunId>/wave_summary.json` (always written)
- One row per entity to `/audit/run_history.parquet`
- One Logic App invocation (notification dispatcher)

---

## 2. `pl_master_orchestrator`

Single-entity orchestrator from spec §4.1. Switches on direction.

**Parameters:**

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `entityKey` | string | yes | |
| `direction` | string | conditional | Required for bidirectional entities; ignored otherwise |
| `runMode` | string | no | |
| `forceFull` | bool | no | |
| `configPath` | string | no | Defaults to `/config/entities/<entityKey>.json`; wave passes a snapshot path |
| `waveRunId` | string | no | When set, parent wave context |

**Activity DAG:**

```
Lookup_EntityConfig (@configPath)
   │
Lookup_ProjectConfig (/config/_project.json)
   │
SetVariable_ResolvedDirection        // entity.direction or parameter
   │
Switch (ResolvedDirection)
   │
   ├── case "inbound":
   │     ExecutePipeline_pl_extract_file
   │     ExecutePipeline_pl_stage_validate
   │     ExecutePipeline_pl_master_prefetch
   │     ExecutePipeline_pl_transform_inbound
   │     ExecutePipeline_pl_load_upsert
   │     ExecutePipeline_pl_load_relationships
   │
   ├── case "outbound":
   │     ExecutePipeline_pl_master_prefetch
   │     ExecutePipeline_pl_extract_dataverse
   │     ExecutePipeline_pl_stage_validate          // re-used with outbound flag
   │     ExecutePipeline_pl_transform_outbound
   │     ExecutePipeline_pl_export_relationships
   │     ExecutePipeline_pl_deliver_sftp
   │     ExecutePipeline_pl_advance_watermark
   │
WebActivity_AggregateEntityStatus
WebActivity_SendEntityNotification (only if not invoked from a wave)
Copy_EntityStatus → /audit/wave_runs/<waveRunId or runId>/<entityKey>.json
```

**Checkpoint reuse:** Before each `ExecutePipeline_*`, an `IfCondition` checks `/audit/checkpoints/<runId>/<pipelineName>.json`. If present with `status: Success`, the sub-pipeline is skipped. This makes the orchestrator re-runnable with the same `runId`.

**Concurrency:** `concurrency: 1` per `(entityKey, direction)` — a sentinel marker at `/audit/locks/<entityKey>__<direction>.json` is created on start and deleted on completion. Stale locks older than `_project.json.retry.maxAttempts * timeout` are auto-cleared at the start of every wave-level run.

---

## 3. `pl_extract_file` (inbound)

SFTP → `/raw/<entityKey>/<runId>/`. Driven by `source.inbound`.

**Activity DAG:**

```
Lookup_EntityConfig
   │
GetMetadata_SftpFiles (childItems)   ls $source.inbound.pathPattern
   │
IfCondition_NoFiles
  True  → SetVariable_Status="Success (no-op)" → Copy_Checkpoint → exit
  False ↓
ForEach_File (parallel, batch=4)
   │
   ├── Copy_SftpToRaw                   delimited-text or excel dataset
   │     source: ds_sftp_csv  or  ds_sftp_xlsx (worksheet param)
   │     sink:   ds_adls_parquet  (path: /raw/<entityKey>/<runId>/<filename>.parquet)
   │
   ├── (after success) Copy_ArchiveSftpFile    → $source.inbound.archiveTo
   │
Copy_Checkpoint → /audit/checkpoints/<runId>/pl_extract_file.json
```

**Dataset parameterization:**

- `ds_sftp_csv` parameters: `path` (string), `fileName` (string), `delimiter` (string), `encoding` (string), `firstRowAsHeader` (bool).
- `ds_sftp_xlsx` parameters: `path`, `fileName`, `sheetName`, `firstRowAsHeader`.
- `ds_adls_parquet` parameters: `container`, `folder`, `fileName`.

**Source `wildcardFileName` expression for CSV:**

```
@last(split(pipeline().parameters.sourceInboundPathPattern, '/'))
```

(Driven by `source.inbound.pathPattern` from entity config.)

**Throughput tuning:** Copy DIU defaults to `4`; can be overridden in `_project.json.copyDiu` per environment (parameter not in v1 schema — left for v2 if needed).

**Failure:** any Copy activity failure (5xx from SFTP, schema drift) sets the pipeline status to Failed; the orchestrator does not advance to `pl_stage_validate`.

---

## 4. `pl_stage_validate`

`/raw → /staged`, single Mapping Data Flow `df_stage_validate`.

**Activity DAG:**

```
Lookup_EntityConfig
   │
DataFlow_StageValidate                            // see §13 for the flow spec
   │
SetVariable_ValidationCounters                    // from data flow outputs
   │
IfCondition_PartialBeyondThreshold
   True  → SetVariable_Status="Failed"
   False → SetVariable_Status="Success" or "Partial"
   │
Copy_Checkpoint
```

**Data Flow parameters passed in:**

| Name | Source | Used in flow as |
| --- | --- | --- |
| `inputPath` | `/raw/<entityKey>/<runId>/*.parquet` | Source dataset path |
| `validPath` | `/staged/<entityKey>/<runId>/data.parquet` | Valid-output sink |
| `errorPath` | `/errors/<entityKey>/<runId>/validation_errors.parquet` | Invalid-output sink |
| `fieldsJson` | `@activity('Lookup_EntityConfig').output.firstRow.fields` | Reflective per-field validation |
| `dedupColumnsJson` | `@activity('Lookup_EntityConfig').output.firstRow.dedup.checksumColumns` | dedup-step input |
| `onDuplicate` | `keepLatest`/`keepFirst`/`fail` | dedup-step behavior |

**Output captured:** `activity('DataFlow_StageValidate').output.runStatus.metrics` exposes `rowsRead`, `rowsWritten` (per sink), and the engine's own `errors` count. The pipeline maps these into the audit row.

---

## 5. `pl_master_prefetch`

Refreshes `/masters/<refTable>.parquet` for every distinct `cacheKey` referenced by the entity's lookup/choice/state transforms.

**Activity DAG:**

```
Lookup_EntityConfig
   │
SetVariable_DistinctCacheKeys                     // derived from fields[].transform.forward.cacheKey
   │
Lookup_CacheState (/audit/master_cache_state.json)
   │
ForEach_CacheKey (parallel, batch=6)
   │
   ├── IfCondition_WithinTtl                      // skip if refreshedAt + ttl > now
   │     False ↓
   │     │
   │     Switch (cacheCategory):
   │       case "lookup":
   │         Copy_LookupTable    src=Dataverse(odata $select=<refField>,<primaryIdField>[,<filter>])
   │                             sink=/masters/<refTable>.parquet
   │       case "optionSet":
   │         WebActivity_GetEntityDefinitions
   │         Copy_OptionSetParquet  src=parsed metadata, sink=/masters/optionsets.parquet
   │
   ├── Copy_UpdateCacheState                      // overwrites /audit/master_cache_state.json
```

**Cache state file shape:**

```json
{
  "caches": {
    "opx_equipmentdiscount.opx_code": {
      "table": "opx_equipmentdiscount",
      "refField": "opx_code",
      "rows": 47,
      "refreshedAt": "2026-05-13T02:01:23Z",
      "filter": "statecode eq 0"
    }
  }
}
```

**Wave context:** when invoked by `pl_wave_orchestrator` between phases, this pipeline is called with `forceRefresh: true` parameter that bypasses the TTL check.

---

## 6. `pl_transform_inbound`

`/staged + /masters → /final`. Single Mapping Data Flow `df_transform_inbound`. Implements the transform expression library from §15.

**Activity DAG:**

```
Lookup_EntityConfig
   │
DataFlow_TransformInbound
   │
SetVariable_TransformCounters
   │
IfCondition_LookupCreateMissingRequired           // any field with createIfMissing=true AND unresolved rows?
   True ↓
   ExecutePipeline_CreateMissingMasters           // upserts new master rows + refreshes prefetch
   DataFlow_TransformInbound (re-run on the unresolved subset only)
   │
Copy_Checkpoint
```

**Data Flow parameters:**

| Name | Purpose |
| --- | --- |
| `stagedPath` | `/staged/<entityKey>/<runId>/data.parquet` |
| `mastersBasePath` | `/masters/` |
| `finalPath` | `/final/<entityKey>/<runId>/data.parquet` |
| `errorPath` | `/errors/<entityKey>/<runId>/transform_errors.parquet` |
| `aliasSuggestionPath` | `/errors/<entityKey>/<runId>/alias_suggestions.parquet` |
| `fieldsJson` | The full `fields[]` array from the entity config |
| `aliasFilesJson` | Pre-resolved alias-file contents, keyed by `refTable__refField` |

**Two-pass loading hook:** when any field has `loadPhase: 2`, the orchestrator runs `pl_load_upsert` once (phase 1), then re-invokes `pl_master_prefetch` for the impacted master, then `pl_transform_inbound` again on the phase-2 subset before the second `pl_load_upsert`.

---

## 7. `pl_load_upsert`

`/final → Dataverse` via Copy Activity with Dataverse sink.

**Activity DAG:**

```
Lookup_EntityConfig
   │
Copy_FinalToDataverse
   source: ds_adls_parquet (path = /final/<entityKey>/<runId>/data.parquet)
   sink:   ds_dataverse_upsert (parameterized — see properties below)
   │
SetVariable_LoadCounters
   │
IfCondition_ThresholdExceeded                    // rowsWritten / rowsRead < (100 - failureThresholdPct)/100
   True → SetVariable_Status="Failed"
   False → SetVariable_Status="Success" or "Partial"
   │
Copy_Checkpoint
```

**Critical Dataverse sink properties** (these are the actual names the ADF Dataverse / Dynamics 365 connector accepts; older names corrected from prior draft):

| Property | Set on | Value | Notes |
| --- | --- | --- | --- |
| `writeBehavior` | Copy sink | `Upsert` | Driven by `target.inbound.writeMode`. Connector default is `Insert`. |
| `alternateKeyName` | Copy sink | `@join(pipeline().parameters.alternateKey, ',')` | Connector accepts a **comma-joined string** for multi-column alt-keys. Used directly for Site's `(ACCOUNT_NUMBER, PARTY_SITE_NUMBER)` case. |
| `writeBatchSize` | Copy sink | `@pipeline().parameters.batchSize` | Default 500. See [03-error-model-and-runbook.md §5.x — Throttling math] for the budget calc. |
| `maxConcurrentConnections` | Copy sink | 4 | Tunable per env via Linked Service. |
| `ignoreNullValues` | Copy sink | `true` | When the row's value is null, omit from PATCH (don't clear the DV column). Required when `nullBehavior=skip` on any lookup. |
| `MSCRM.BypassCustomPluginExecution` | Copy sink → `additionalHeaders` | `@string(pipeline().parameters.bypassPlugins)` (i.e. `"true"`/`"false"`) | HTTP header, **not** a top-level sink property. Suppresses plugin/workflow execution on the write. |
| `MSCRM.SuppressDuplicateDetection` | Copy sink → `additionalHeaders` | `"true"` | HTTP header. Avoids 412 conflicts on alt-key races. |
| `logLocationSettings` | Copy sink → `enableSkipIncompatibleRow=true`, then `logSettings.logLocationSettings` | `{ "linkedServiceName": { "referenceName": "ls_adls", "type": "LinkedServiceReference" }, "path": "errors/<entityKey>/<runId>/load_errors" }` | Skipped rows captured to ADLS as CSV per ADF default; `_index.json` produced by post-copy WebActivity. |

Headers are configured on the Copy sink under `sink.additionalHeaders` (an array of `{name, value}` objects in the ARM JSON), **not** by a preceding WebActivity. The prior draft's `WebActivity_ConfigureBypassHeaders` step was a no-op and is removed.

**Two-pass:** for entities with any field marked `loadPhase: 2`, the orchestrator invokes `pl_load_upsert` twice — see [§7b. `pl_load_upsert_phase2`](#7b-pl_load_upsert_phase2-two-pass-for-self-lookups) below.

---

## 7b. `pl_load_upsert_phase2` (two-pass for self-lookups)

Invoked by `pl_master_orchestrator` only when the entity config has **any field marked `loadPhase: 2`** — the canonical example is Customer R10 (`BILL_TO_ACCOUNT` → `msdyn_billingaccount`, a self-lookup on the `account` entity). Phase 1 cannot resolve the lookup because the target account row may itself be created by the same load. Phase 2 closes that gap.

**Parameters:** standard envelope (`entityKey`, `runId`, `waveRunId`, `configPath`) — no new ones.

**Activity DAG:**

```
Lookup_EntityConfig
   │
WaitForDataverseConsistency        // see "Wait strategy" below
   │
ExecutePipeline_pl_master_prefetch (cacheKey = self-lookup's referenceTable, forceRefresh=true)
   │
DataFlow_BuildPhase2Payload
   source: /final/<entityKey>/<runId>/data.parquet   (the phase-1 payload)
   join:   /masters/<self-lookup-refTable>.parquet   (now containing freshly-loaded rows)
   project: <alternateKey columns> + <phase-2 lookup column with resolved GUID>
   filter:  exclude rows that failed phase 1 (read from load_errors/_index.json)
   sink:   /final/<entityKey>/<runId>/phase2.parquet
   │
Copy_Phase2ToDataverse
   source: ds_adls_parquet (path = /final/<entityKey>/<runId>/phase2.parquet)
   sink:   ds_dataverse_update    // same connector, writeBehavior=Update (NOT Upsert)
     writeBehavior: Update
     alternateKeyName: @join(pipeline().parameters.alternateKey, ',')
     writeBatchSize:   @pipeline().parameters.batchSize
     additionalHeaders:
       - { name: "MSCRM.BypassCustomPluginExecution", value: @string(pipeline().parameters.bypassPlugins) }
   │
SetVariable_Phase2Counters
   │
Copy_Checkpoint  → /audit/checkpoints/<runId>/pl_load_upsert_phase2.json
```

**Wait strategy** (`WaitForDataverseConsistency`): Dataverse upserts are read-after-write consistent against the same entity instance, but the **alt-key index** that phase 2's prefetch relies on is rebuilt asynchronously and can lag by 5–30 seconds for large batches. Two options, choose at deploy time per environment:

- **Fixed wait (simpler, default):** `Wait` activity with `waitTimeInSeconds: 30`. Predictable; trades 30s for safety.
- **Poll-until-consistent (faster on warm DV):** a small `Until` loop calling Dataverse `Retrieve` for a sample of the phase-1 alt-keys (the 5 most recently written), exits when every sample resolves; capped at 60s.

Spec section §3.2.6 references this pipeline; the choice between fixed-wait and poll-until is captured in `_project.json.phase2WaitStrategy` (new property, defaults to `fixedWait30s`).

**Failed-row handling:** the data flow's filter step explicitly excludes any source row whose alt-key appears in `load_errors/_index.json` — these rows failed phase 1 and have no Dataverse row to update. Without this, phase 2 would emit PATCH requests that 404 and inflate the error count without root cause.

**Idempotency:** `Update` (not `Upsert`) is used deliberately. A re-run with the same `runId` re-issues PATCH on the same rows; if a CSR changed `msdyn_billingaccount` manually between runs, the second run will overwrite their edit. This matches the "source is authoritative" project posture; if you need protect-manual-edits semantics, set `target.inbound.conflictBehavior: skipIfDifferent` on the field (new property, deferred to v2 if not needed now).

---

## 8. `pl_load_relationships` (inbound)

N:N associate + post-load `setLookup` actions.

**Activity DAG:**

```
Lookup_EntityConfig
   │
ForEach_NNRelationship (sequential)
   │
   ├── DataFlow_ResolveNNGuids        // joins /final + /masters/<relatedEntity> → assoc rows with primaryId, relatedId
   │      output: /audit/intermediate/<runId>/nn_<relationshipSchemaName>.parquet
   │
   ├── ForEach_AssocRow (parallel=10, batchCount=10)
   │     │
   │     WebActivity_Associate                            // retry policy below
   │       url:    @concat(linkedService('ls_dataverse').properties.url,
   │                       '/api/data/v9.2/',
   │                       item().primaryEntity, '(', item().primaryId, ')/',
   │                       item().relationshipSchemaName, '/$ref')
   │       method: POST
   │       body:   @concat('{"@odata.id":"', linkedService('ls_dataverse').properties.url,
   │                       '/api/data/v9.2/', item().relatedSet, '(', item().relatedId, ')"}')
   │       headers:
   │         MSCRM.SuppressDuplicateDetection: "true"
   │       — on success or HTTP 412 → fall through (412 = association exists, idempotent success)
   │       — on any other failure → activity fails (per Web activity semantics);
   │                                 row is captured by the outer ForEach error path
   │
   ├── (on ForEach completion) Copy_FailedAssocRows
   │       Reads ADF's per-iteration ForEach output via @activity('ForEach_AssocRow').output
   │       and writes failed iterations' input rows to:
   │       /errors/<entityKey>/<runId>/assoc_failed_<relationshipSchemaName>.parquet
   │
ForEach_PostLoadAction (sequential)
   │
   ├── DataFlow_FilterByCondition     // applies `condition`, projects rows that need the update
   │      output: /audit/intermediate/<runId>/postload_<index>.parquet
   │
   ├── ForEach_UpdateRow (parallel=4)
   │     WebActivity_PatchTargetEntity
   │       url: @concat(...,'/', item().targetEntity, '(', item().targetId, ')')
   │       method: PATCH
   │       body: @concat('{"', item().targetLookupField, '@odata.bind":"/',
   │                     item().relatedEntitySet, '(', item().valueFromSelf, ')"}')
   │
Copy_Checkpoint
```

**HTTP 412 handling (idempotent re-associate):**

Dataverse returns **HTTP 412 Precondition Failed** when an N:N association already exists. On a re-run with the same `runId`, every association from the prior run hits 412. The framework treats 412 as a **silent success** for `/$ref` POSTs.

Implementation: each `WebActivity_Associate` is wrapped in a Pipeline-level `Try / Catch` pattern using ADF's `Set variable` on the activity's "On failure" dependency, combined with a downstream `If` that inspects `activity('WebActivity_Associate').error.message` for the literal `"already exists"` or the HTTP status code `412`. If matched, mark the iteration Success; otherwise propagate the failure.

The cleanest expression to inspect the failure:

```
@or(
  contains(coalesce(activity('WebActivity_Associate').error.message, ''), '412'),
  contains(coalesce(activity('WebActivity_Associate').error.message, ''), 'already exists')
)
```

Logged as `E5003` (WARN severity) in `/audit/run_history.parquet` so the count of "duplicate-associate" events is visible without alerting.

**Retry policy on associate** (Web activity built-in):

```json
"policy": {
  "timeout": "0.00:30:00",
  "retry": 5,
  "retryIntervalInSeconds": 30
}
```

This retry handles **transient** failures (429, 503, network reset). It does **not** retry 412 — 412 is short-circuited to success above. It does **not** retry 4xx other than 412 — those are real validation errors that go to the failed-row sidecar.

**Why this pattern, not the prior `Until + ForEach`:** ADF `Until` cannot observe per-iteration outcomes of an inner `ForEach`; it can only see the ForEach's aggregate Status. Selectively retrying only-failed iterations is not buildable with `Until + ForEach`. The current design routes failed iterations to a sidecar and uses `pl_reprocess` for any re-attempt — keeping retry logic explicit and the activity DAG inspectable in ADF Monitor.

---

## 9. `pl_extract_dataverse` (outbound)

Dataverse → `/raw/<entityKey>/<runId>/`. Driven by `target.outbound.query`.

**Activity DAG:**

```
Lookup_EntityConfig (firstRowOnly: true)
   │
GetMetadata_Watermark (path: /audit/watermarks/<entityKey>.json)
   │
IfCondition_WatermarkExists
   True  → Lookup_Watermark (firstRowOnly: true) → SetVariable_LastSyncedAt = @activity('Lookup_Watermark').output.firstRow.lastSyncedAt
   False → SetVariable_LastSyncedAt = @activity('Lookup_EntityConfig').output.firstRow.target.outbound.delta.initialFromUtc
   │
ForEach_Field (sequential, over @activity('Lookup_EntityConfig').output.firstRow.fields)
   Append_SelectColumn → @variables('SelectList')      // builds the array of target schema names
   │
SetVariable_SelectListJoined = @join(variables('SelectList'), ',')
SetVariable_ResolvedFilter   = @replace(
                                  @replace(
                                    @activity('Lookup_EntityConfig').output.firstRow.target.outbound.query.odataFilter,
                                    '{lastSyncedAt}',
                                    variables('LastSyncedAt')),
                                  '{runStartUtc}',
                                  formatDateTime(utcNow(), 'yyyy-MM-ddTHH:mm:ssZ'))
   │
Switch (@activity('Lookup_EntityConfig').output.firstRow.target.outbound.query.mode)
   │
   ├── case "odataFilter":
   │     Copy_DataverseODataFilter
   │       src.query: @concat('?$select=', variables('SelectListJoined'),
   │                          '&$filter=', variables('ResolvedFilter'),
   │                          '&$expand=', variables('ExpandList'),
   │                          '&$orderby=', activity('Lookup_EntityConfig').output.firstRow.target.outbound.query.orderBy)
   │       src.pageSize: @activity('Lookup_EntityConfig').output.firstRow.target.outbound.query.pageSize
   │
   ├── case "fetchXml":
   │     Copy_DataverseFetchXml
   │       src.fetchXml: @variables('ResolvedFetchXml')
   │
   ├── case "savedView":
   │     WebActivity_ResolveSavedViewGuid     // queries the userqueries / savedqueries collection
   │     Copy_DataverseSavedView
   │       src.queryUrl: @concat('?savedQuery=', activity('WebActivity_ResolveSavedViewGuid').output.value[0].savedqueryid)
   │
SetVariable_MaxWatermark              // computed by post-copy DataFlow_AggregateMaxWatermark over /raw
   │
Copy_Checkpoint
```

**Token substitution rules** (apply to `odataFilter` and `fetchXml`, deterministic order):

| Token | Replacement source | First-run behavior |
| --- | --- | --- |
| `{lastSyncedAt}` | `/audit/watermarks/<entityKey>.json.lastSyncedAt` | If watermark file missing, substituted with `target.outbound.delta.initialFromUtc` |
| `{runStartUtc}` | `@formatDateTime(utcNow(), 'yyyy-MM-ddTHH:mm:ssZ')` | Always available |
| `{asOfDate}` | `@pipeline().parameters.asOfDate` if non-null, else today at 00:00 UTC | Optional pipeline parameter |
| `{forceFull}` | `'true'` if `runMode=full` or `forceFull=true` param set; else `'false'` | Used to gate `or modifiedon eq null` style escape hatches |

All substitutions emit the value as a **bare ISO-8601 datetime** without the `datetime'...'` wrapper — Dataverse Web API v9 accepts ISO-8601 directly. validate-config rule **V045 (new)** asserts each `odataFilter` is parseable after substitution against `target.entityLogicalName` metadata.

**Watermark file shape:**

```json
{
  "lastSyncedAt": "2026-05-12T23:59:59Z",
  "runId": "<prior runId>",
  "completedAt": "2026-05-13T00:01:10Z",
  "rowsExtracted": 1283
}
```

The watermark is **not** updated here; `pl_advance_watermark` commits after delivery succeeds.

**$select autocomputation:** the `ForEach_Field` step iterates `fields[]` and appends each field's `target` (Dataverse schema name) to the `SelectList` variable. After the loop, `@join(variables('SelectList'), ',')` produces the comma-separated `$select`. `@union` / `[*]` JSONPath-style projection used in the earlier draft is **not** valid ADF expression syntax — only the per-iteration accumulator pattern works.

---

## 10. `pl_transform_outbound`

`/raw + /masters → /staged-out → /final-out`. Single Mapping Data Flow `df_transform_outbound`. Applies reverse transforms.

**Activity DAG:** mirrors §6 but with the outbound data flow. The data flow consumes the same `fieldsJson` and selects each transform's `reverse` block. See §16.

---

## 11. `pl_export_relationships` (outbound)

For each `relationships[]` with `outbound.exportMode == "separateFile"`:

```
ForEach_NNRelationship (sequential)
   │
   Copy_DataverseIntersect           src: Dataverse intersect entity via FetchXml, scoped to same delta filter
                                     sink: /staged-out/<entityKey>/<runId>/relationships/<relationshipSchemaName>.parquet
   │
   DataFlow_ResolveAltKeys           joins both ends to /masters/* on primaryId/relatedId
                                     output: same path with columns from outbound.columns
```

---

## 12. `pl_deliver_sftp` (outbound)

`/staged-out → CSV/Excel → SFTP`.

**Activity DAG:**

```
Lookup_EntityConfig
   │
SetVariable_OutputFileName             // resolves source.outbound.pathPattern tokens
   │
Copy_PrimaryToSftp
   source: /staged-out/<entityKey>/<runId>/data.parquet  (parquet)
   sink:   ds_sftp_csv  or  ds_sftp_xlsx  (target = resolved path)
   formatSettings:
     csv:  { firstRowAsHeader=true, columnDelimiter=$delimiter, encodingName=$encoding }
     xlsx: { sheetName=$worksheet, firstRowAsHeader=true }
   │
ForEach_NNRelationship_File           // emits assoc files alongside the primary
   │
   Copy_RelationshipToSftp
   │
Copy_Checkpoint
```

**Empty result handling:** if `/staged-out/<entityKey>/<runId>/data.parquet` is missing (no extracted rows), the `Switch (config.source.outbound.emptyFileBehavior)` decides:

- `writeHeaderOnly`: emit a zero-data-row CSV with just the header.
- `skipFile`: complete the pipeline as Success but write no file.
- `fail`: pipeline status = Failed (forces investigation).

**Atomic write to SFTP** (added per M1): each Copy activity writes to a `.tmp` suffix path; a follow-on activity renames to the final path so downstream consumers never see a partial file:

```
Copy_PrimaryToSftp_Tmp
   sink path: <pathPattern>.tmp        // e.g. /inbox/customer/customer_20260513_020047_<runId>.csv.tmp
   │
WebActivity_RenameSftp                  // SHIR-hosted Linked Service or a small Azure Function exposing
   method: POST                         // SFTP RENAME; the ADF SFTP Linked Service does not expose a
   body: { "from": "<path>.tmp",        // native rename verb, so this step is delegated.
           "to":   "<path>" }
```

Two implementation options for `WebActivity_RenameSftp` — choose at deploy time per environment:

1. **Recommended:** small Azure Function `func-sftp-rename` (1 endpoint, ~40 lines using `Renci.SshNet` for .NET or `paramiko` for Python). KV-backed credentials, same secret as `ls_sftp_*`. Reuses across all entities.
2. **Alternative:** Custom Activity on the SHIR running `pscp.exe -rename` or `sftp` with a here-doc script. Heavier setup, no extra Azure resource.

Without atomic write, a network drop mid-upload leaves a half-written CSV; the Copy reports success (it sees the byte stream complete); the watermark advances; downstream consumer reads truncated data. The `.tmp`+rename pattern eliminates this failure mode at the cost of one extra activity per file.

---

## 13. `pl_advance_watermark` (outbound, commit step)

Writes the new watermark file **only** after all preceding outbound steps reported success.

**Activity DAG:**

```
IfCondition_AllPriorStepsSuccess
   True ↓
   SetVariable_WatermarkJson = @concat(
       '{"lastSyncedAt":"', variables('MaxWatermark'),
       '","runId":"', pipeline().parameters.runId,
       '","completedAt":"', formatDateTime(utcNow(), 'yyyy-MM-ddTHH:mm:ssZ'),
       '","rowsExtracted":', string(variables('RowsExtracted')),
       '}')
   │
   Copy_NewWatermark
     source: inline JSON dataset with `body: @variables('WatermarkJson')`
              (uses ADF "JSON" dataset with the content-as-source pattern, or a Web activity
              to PUT against the ADLS data-lake REST API)
     sink:   /audit/watermarks/<entityKey>.json (overwrite)
```

The previous draft had `@utcNow()` and other expressions embedded as **bare tokens inside a JSON object literal** — that is not valid ADF syntax. The Copy activity sees the body as a string and the `@` prefixes inside it would be ignored. The fix is to assemble the JSON **as a string** via `@concat(...)` in a `SetVariable` first, then pass that string as the Copy source body.

If any prior step failed, the activity is skipped — the next outbound run will re-extract from the same `lastSyncedAt`.

---

## 14. `pl_reprocess` and `pl_preflight`

### 14.1 `pl_reprocess`

Re-runs the error subset of a prior run.

**Parameters:** `entityKey`, `runId` (of the prior failed run), `errorTypes` (array, default `["validation","transform","load"]`).

**Behavior:**
1. Reads `/errors/<entityKey>/<runId>/<errorType>_errors.parquet` for each requested type.
2. Extracts the original raw rows (joined back to `/raw/<entityKey>/<runId>/`) for re-processing.
3. Runs them through the normal pipeline path starting from `pl_stage_validate`, but with a synthetic `subRunId = <runId>-rp1` so outputs don't overwrite the original run's files.
4. Updates the parent run's status in `/audit/run_history.parquet` if the reprocess clears the error threshold.

### 14.2 `pl_preflight`

Static-config + live-Dataverse assertions before any data run. Implements rules V060–V065 from [01-config-schemas.md §6.7](01-config-schemas.md#67-deferred--runtime-checks-v06x-validate-config-does-not-run-these).

**Activity DAG:**

```
Lookup_EntityConfigs                  // all entities in scope
   │
WebActivity_GetEntityDefinitions      // single call, batched
   │
DataFlow_AssertSchemaAlignment        // streaming compare config vs metadata
   │
ForEach_EntityCheckOptionSets
ForEach_NNCheckRelationship
   │
Copy_PreflightReport                  → /audit/preflight/<runId>/report.json
```

---

## 15. Mapping Data Flow — `df_stage_validate`

**Sources:**

- `srcRaw` → parquet from `/raw/<entityKey>/<runId>/*.parquet` with schema-drift `allowSchemaDrift: true`.

**Transformations (in order):**

| Name | Type | Logic |
| --- | --- | --- |
| `flattenHeaders` | Select | Renames columns to lowercase-trimmed for downstream consistency. |
| `castTypes` | Derived Column | For each field in `fieldsJson`, casts to `sourceType` via `toString()`, `toInteger()`, `toDate()`, `toDecimal()`, `toBoolean()` and captures the cast success in a per-column boolean `__cast_ok_<field>`. |
| `lengthCheck` | Derived Column | For each field with `maxLength`, emits `__len_ok_<field> = length(<field>) <= maxLength`. |
| `mandatoryCheck` | Derived Column | For each mandatory field, emits `__mand_ok_<field> = !isNull(<field>) && length(trim(<field>)) > 0`. |
| `rowValidityFlag` | Derived Column | `__row_valid = and(<all __cast_ok>, <all __len_ok>, <all __mand_ok>)`. |
| `splitInvalid` | Conditional Split | `invalidRows: !__row_valid`, default stream `validRows`. |
| `errorReason` | Derived Column (on invalidRows) | Constructs `__failure_reason` as a delimited string of the failing checks. |
| `dedupKey` | Derived Column (on validRows) | `__hash = sha2(256, concat(<all dedupColumns>))`. |
| `dedupAggregate` | Aggregate (on validRows) | Group by `__hash`. Behavior per `onDuplicate`:<br/>`keepLatest` → `last(*)` after orderBy `__source_row_no` desc;<br/>`keepFirst` → `first(*)`;<br/>`fail` → emit duplicates to a separate sink. |
| `dropMetaColumns` | Select | Removes all `__*` columns except those needed by sinks. |

**Sinks:**

- `sinkValid` → parquet at `validPath`, partition by `entityKey`.
- `sinkInvalid` → parquet at `errorPath` with columns `runId`, `entityKey`, original columns, `__failure_reason`.

**Counters captured by the parent pipeline:** `sinkValid.rowsWritten`, `sinkInvalid.rowsWritten`, `srcRaw.rowsRead`.

---

## 16. Mapping Data Flow — `df_transform_inbound`

**Sources:**

- `srcStaged` → parquet at `stagedPath`.
- `srcMasters_<refTable>` → one parquet source per distinct `referenceTable` mentioned in `fieldsJson` lookups. Each source is **broadcast** (`broadcast: 'left'` in the join).
- `srcAliasFiles_<refTable>__<refField>` → JSON sources for externalized aliases.

**Transformations (per field, in order driven by `fieldsJson`):**

The data flow is a sequence of Derived Columns, Lookups, and Conditional Splits **generated at deploy time by `tools/dataflow-codegen`** from the entity's `fields[]` config. See [§18 Transform Implementation Library](#18-transform-implementation-library--per-type-mdf-transformation-graphs) for the per-type graph templates and [§-A Codegen appendix](#--a-dataflow-codegen-appendix) for the generator spec. The runtime Data Flow JSON is static once generated — ADF does not support per-run topology changes.

**Sinks:**

- `sinkFinal` → parquet at `finalPath`, schema-aligned to Dataverse target attribute names.
- `sinkTransformErrors` → parquet at `errorPath`.
- `sinkAliasSuggestions` → parquet at `aliasSuggestionPath` (only present if any transform configures `onAliasMiss=suggestion` or `onMissing=suggestion`).

---

## 17. Mapping Data Flow — `df_transform_outbound`

Same shape as `df_transform_inbound` but each transform's **reverse** branch is selected. Specific differences:

- `srcStaged` is replaced by `srcRaw` reading `/raw/<entityKey>/<runId>/data.parquet` (Dataverse extract output).
- Lookups using `target.outbound.expand` skip the `srcMasters_*` join entirely — the alt-key is already a column in `srcRaw`.
- The sink writes a parquet keyed by **source-side column names** (file headers), which `pl_deliver_sftp` then materializes to CSV/Excel.

---

## 18. Transform Implementation Library — per-type MDF transformation graphs

> **Important correction from the prior draft.** A single MDF expression cannot perform error routing, broadcast joins, or column assignment — each transform type is implemented as a small **graph of MDF transformations** (Derived Column, Conditional Split, Lookup, Source, plus Filter). The expressions inside those transformations use the real MDF expression language (reference: [Data flow expression functions](https://learn.microsoft.com/azure/data-factory/data-flow-expression-functions)).
>
> Notation in this section:
> - `<F>` = the field config object (codegen substitutes values).
> - `<F.source>` substitutes the file column name; `<F.target>` substitutes the Dataverse schema name.
> - Each subsection lists the **graph** (which MDF transformations, in order) and then the **expressions** that go inside each.
> - For inbound, the source stream is `srcStaged`; for outbound, `srcRaw`.

### 18.1 `direct`

**Graph:** one **Derived Column**.

**Forward expression** (Derived Column rule, column name = `<F.target>`):
```
to<TargetType>(<F.source>)
```
where `to<TargetType>` is one of `toString`, `toInteger`, `toDecimal`, `toBoolean`, `toDate`, `toTimestamp` — selected at codegen time from `<F.targetType>`. `toDate`/`toTimestamp` take an explicit format string from `_project.json.dateTime.format`.

**Reverse expression** (Derived Column rule, column name = `<F.source>`):
```
to<SourceType>(<F.target>)
```

### 18.2 `concat`

**Graph:** one **Derived Column** (forward) / one **Derived Column** (reverse).

**Forward** (column name = `<F.transform.forward.target>`):
```
concatWS('<F.transform.forward.separator>', <F.transform.forward.inputs[0]>, <F.transform.forward.inputs[1]>, ...)
```
MDF's `concatWS(separator, str1, str2, ...)` takes a literal separator and variadic string columns. Codegen unrolls `inputs[]` into discrete arguments.

**Reverse** — split using `regexExtract` with **integer group indexes** (MDF does not support named captures). The codegen converts named groups in `<F.transform.reverse.regex>` to positional groups based on declaration order; one Derived Column rule per group:
```
regexExtract(<F.target>, '<F.transform.reverse.regex>', 1)   // group 1
regexExtract(<F.target>, '<F.transform.reverse.regex>', 2)   // group 2
```

### 18.3 `split`

**Graph:** one **Derived Column** with multiple output columns (forward) / one **Derived Column** (reverse).

**Forward** — one rule per `outputs[i]`:
```
regexExtract(<F.transform.forward.input>, '<F.transform.forward.regex>', <i+1>)
```

**Reverse**:
```
concatWS('<F.transform.reverse.separator>', <F.transform.reverse.inputs[0]>, <F.transform.reverse.inputs[1]>, ...)
```

### 18.4 `conditional`

**Graph:** one **Derived Column**.

**Forward** uses MDF `case()` — pairs of `(condition, value), ..., default`:
```
case(
  <F.transform.forward.rules[0].when_compiled>, <F.transform.forward.rules[0].value>,
  <F.transform.forward.rules[1].when_compiled>, <F.transform.forward.rules[1].value>,
  ...
  <F.transform.forward.default>
)
```
The `when` strings in the config (e.g. `"PRIMARY_MOBILE_PHONE=Y"`) are compiled by codegen into MDF expressions (`equals(PRIMARY_MOBILE_PHONE, 'Y')`).

**Reverse** — one Derived Column rule per `writes[i]` (output column = `<writes[i].column>`):
```
iif(<writes[i].when_compiled>, <writes[i].value>, <writes[i].elseValue>)
```

### 18.5 `map`, `choice`, `state`

**Graph:** one **Derived Column** + one **Conditional Split** for `onMissing` routing.

**Derived Column** (forward, column name = `<F.target>`) — the map is compiled to a `case()`:
```
case(
  equals(<F.source>, 'Billing Account'),  884870000,
  equals(<F.source>, 'Service Account'),  884870001,
  equals(<F.source>, 'Both'),             884870002,
  <F.transform.forward.default>                      // null when default not set
)
```

Separately, codegen adds a metadata column `<F.target>__resolved` set to `true` when the row matched any key:
```
or(
  equals(<F.source>, 'Billing Account'),
  equals(<F.source>, 'Service Account'),
  equals(<F.source>, 'Both')
)
```

**Conditional Split** branches:
- `<F.target>__resolved == true` → continues in the main stream
- `<F.target>__resolved == false && '<F.transform.forward.onMissing>' == 'fail'` → routed to `sinkTransformErrors` with `failureReason = 'E3001 choice.notfound: <fieldName>=' + <F.source>` set in a prior Derived Column
- `<F.target>__resolved == false && '<F.transform.forward.onMissing>' == 'useDefault'` → continues, `<F.target>` already holds the default
- `<F.target>__resolved == false && '<F.transform.forward.onMissing>' == 'passThrough'` → continues with the original source value cast to integer (only meaningful when source already happens to be a valid option int)

**Reverse** for `choice` and `state` — inverse `case()` from option int to label:
```
case(
  equals(<F.target>, 884870000),  'Billing Account',
  equals(<F.target>, 884870001),  'Service Account',
  equals(<F.target>, 884870002),  'Both',
  toString(<F.target>)                                // fallback when onMissing=passThrough
)
```

### 18.6 `yesNo`

**Graph:** one **Derived Column**.

**Forward**:
```
case(
  or(equals(<F.source>, 'Y'), equals(<F.source>, 'Yes'), equals(<F.source>, '1'), equals(<F.source>, 'true')),  true(),
  or(equals(<F.source>, 'N'), equals(<F.source>, 'No'),  equals(<F.source>, '0'), equals(<F.source>, 'false')), false(),
  null()
)
```
(`trueValues[]` and `falseValues[]` from config are unrolled into the `or(...)` arms at codegen time.)

A follow-on Conditional Split routes `isNull(<F.target>)` rows to the error sink with code `E3003`.

**Reverse**:
```
iif(<F.target> == true(), '<F.transform.forward.trueValues[0]>', '<F.transform.forward.falseValues[0]>')
```

### 18.7 `dateTime`

**Graph:** one **Derived Column**.

**Forward** — parse from source format and TZ, convert to UTC:
```
toUTC(
  toTimestamp(<F.source>, '<F.transform.forward.inputFormat>'),
  '<F.transform.forward.sourceTz>'
)
```
MDF `toTimestamp(string, format)` takes only two arguments (timezone is **not** a parameter). The TZ is applied in `toUTC(timestamp, fromTz)` which converts *from* `fromTz` *to* UTC. This corrects the prior draft which used a non-existent 3-arg form.

**Reverse**:
```
toString(
  fromUTC(<F.target>, '<F.transform.forward.sourceTz>'),
  '<F.transform.forward.inputFormat>'
)
```
`fromUTC(timestamp, toTz)` converts UTC into `toTz`. `toString(timestamp, format)` formats for output.

### 18.8 `lookup` (the canonical case)

The most complex transform — a small graph of normalize → alias → join → split.

**Graph:**

```
srcStaged ──┐
            ▼
       DerivedColumn_NormalizeKey            <F.source>_n = <normalize chain>
            ▼
       DerivedColumn_ApplyAliases            <F.source>_canon = case(
                                                 equals(<F.source>_n, 'new delhi'), 'Delhi',
                                                 equals(<F.source>_n, 'bombay'),    'Mumbai',
                                                 ...
                                                 <onAliasMiss=passThrough ? <F.source>_n : null()>
                                             )
            ▼
       LookupTransform_<refTable>            join srcMasters_<refTable>
         (lookupConditions:                     on  <F.source>_canon == <refField>
            <F.source>_canon ==                  joinType: 'left'
            srcMasters_<refTable>.<refField>)    broadcast:
                                                  - 'left'  if estimated row count of master < masterBroadcastThresholdRows (default 100000)
                                                  - 'auto'  otherwise (MDF chooses shuffle/sort-merge)
            ▼
       DerivedColumn_EmitLookup              <F.target> = srcMasters_<refTable>.<primaryIdField>
                                             __lookup_matched = !isNull(srcMasters_<refTable>.<primaryIdField>)
            ▼
       ConditionalSplit_HandleMissing
         matched:    __lookup_matched == true()
         error:      __lookup_matched == false() && '<onMissing>' == 'error'
         suggestion: __lookup_matched == false() && '<onMissing>' == 'suggestion'
         useDefault: __lookup_matched == false() && '<onMissing>' == 'useDefault'
         passNull:   __lookup_matched == false() && '<onMissing>' == 'passNull'
```

The `Lookup` transformation is the MDF construct that performs the broadcast join. The `broadcast: 'left'` setting is a **property of the Lookup transformation** (configured in the ARM JSON's `optimize.broadcast` field), not an annotation on an expression. For masters larger than the threshold, set `broadcast: 'auto'` and let the cluster pick a shuffle/sort-merge plan.

Each split branch then attaches to its sink:
- `matched` → continues to the next transform in the chain (or the final sink).
- `error` → `sinkTransformErrors`, with a prior Derived Column setting `errorCode='E3010'` and `failureReason=concat('lookup.notfound: <refTable>.<refField>=', <F.source>_canon)`.
- `suggestion` → `sinkAliasSuggestions`, with the original `<F.source>` value and the normalized form captured.
- `useDefault` → continues; a prior Derived Column has set `<F.target> = <F.transform.forward.default>`.
- `passNull` → continues with `<F.target> = null()`. If `nullBehavior=skip` is set on the field, a downstream Derived Column adds a sentinel column `__omit_<F.target>` so the load pipeline knows to remove the column from the PATCH body for that row.

**Reverse** (outbound):

If `target.outbound.expand` declared this lookup, the Dataverse extract already includes the alt-key as a column (e.g. `opx_EquipmentDiscount.opx_code`), and the reverse becomes a single Derived Column projection:
```
<F.source> = `opx_EquipmentDiscount.opx_code`         // identifier with dot needs backtick quoting in MDF
```

Otherwise, a Lookup transformation joins against the prefetched master in reverse (target GUID → refField):
```
LookupTransform_reverse: srcRaw join srcMasters_<refTable>
  on srcRaw.<F.target> == srcMasters_<refTable>.<primaryIdField>
  → <F.source> = srcMasters_<refTable>.<refField>
```

### 18.9 Codegen rules

Every transform graph above is generated by `tools/dataflow-codegen` (see §-A in the codegen appendix) from each entity's `/config/entities/<entityKey>.json`. The generator produces one Mapping Data Flow ARM JSON per entity-direction pair: `df_transform_<entityKey>_inbound.json` and `df_transform_<entityKey>_outbound.json`. Generated files are committed under `/adf/dataflows/generated/` and **must not** be hand-edited — the next codegen run overwrites them. Hand-authored Data Flows go under `/adf/dataflows/manual/` if ever needed.

The codegen is the explicit choice that closes the "metadata-driven Data Flow" question from the audit: ADF Data Flow definitions are static at runtime, so the metadata-driven-ness is shifted to **deploy time** via this generator. Any change to an entity mapping triggers a rebuild of its Data Flows in the deployment pipeline.

---

## 19. Pipeline reference card

| Pipeline | Trigger | Mean rows/run | Typical duration | Critical params | Most common failure |
| --- | --- | --- | --- | --- | --- |
| `pl_wave_orchestrator` | Wave trigger | N entities | Sum of children | `waveKey` | Dependency cycle (caught at validate-config) |
| `pl_master_orchestrator` | Entity trigger or wave | 100k | 5–15 min | `entityKey`, `direction` | Sub-pipeline failure |
| `pl_extract_file` | Sub | 100k | 1–3 min | `pathPattern` | SFTP host unreachable |
| `pl_stage_validate` | Sub | 100k | 1–2 min | `fieldsJson` | Schema drift > tolerance |
| `pl_master_prefetch` | Sub | 10k masters | 30–60 s | `cacheKeys` | Dataverse throttle |
| `pl_transform_inbound` | Sub | 100k | 2–4 min | `fieldsJson` | Lookup not-found > threshold |
| `pl_load_upsert` | Sub | 100k | 5–10 min | `alternateKey` | DV throttle, alt-key duplicate |
| `pl_load_relationships` | Sub | 50k assoc | 3–8 min | N:N config | 412 conflicts, throttle |
| `pl_extract_dataverse` | Sub | 100k | 3–6 min | query mode | View not found |
| `pl_transform_outbound` | Sub | 100k | 2–4 min | reverse blocks | Missing reverse rule |
| `pl_export_relationships` | Sub | 50k | 1–3 min | columns | — |
| `pl_deliver_sftp` | Sub | 100k | 1–2 min | pathPattern | SFTP write perms |
| `pl_advance_watermark` | Sub | 1 file | <5s | watermarkField | Path not writable |
| `pl_reprocess` | Manual | varies | varies | runId | Source rows already archived |
| `pl_preflight` | Pre-deploy | 0 data | 30 s | — | Schema missing in DV |

---

## 20. What an implementer should produce

For each pipeline in §1–§14:

1. **ARM JSON** under `/adf/pipelines/<name>.json` matching the activity DAG above. Use ADF Studio to draft, then export and hand-edit for parameter contracts and expression normalization.
2. **Unit test** under `/tests/pipelines/<name>/`: at minimum one happy-path and one failure-path invocation, asserted via ADF SDK or PowerShell scripts.
3. **Activity reference card** in the pipeline's `description` field: max 240 chars, references back to this doc's section number.

For each data flow in §15–§17:

1. **Data Flow JSON** under `/adf/dataflows/generated/<name>.json` — emitted by `tools/dataflow-codegen` (see §-A); never hand-edited.
2. **Data Flow debug session** captured screenshots in `/docs/dataflow-screenshots/`.
3. **Expression test cases** under `/tests/dataflows/<name>/test-cases.csv` covering each transform type from §18.

---

## §-A. Dataflow codegen appendix

### A.1 Why codegen

ADF Mapping Data Flow is **statically defined** in ARM JSON — runtime parameters can change *values* inside expressions but cannot add or remove transformation nodes. The framework is metadata-driven (each entity's mapping declares its fields and transforms), so the data flows have to be **generated from configs at deploy time** rather than interpreted at runtime.

This is the single load-bearing implementation decision that diverges from "everything is dynamic." The orchestrator pipelines (§§1–14) are genuinely metadata-driven via parameters; the data flows are not — they are generated artifacts.

### A.2 Generator I/O

**Input:**
- `/config/entities/<entityKey>.json` — the entity mapping
- `/config/_project.json` — project defaults (e.g. `masterBroadcastThresholdRows`)
- `/config/aliases/<refTable>__<refField>.json` for any field referencing `aliasesFile`

**Output (per entity, per direction):**
- `/adf/dataflows/generated/df_transform_<entityKey>_inbound.json` (when `direction ∈ {inbound, bidirectional}`)
- `/adf/dataflows/generated/df_transform_<entityKey>_outbound.json` (when `direction ∈ {outbound, bidirectional}`)

Both follow the ADF ARM resource schema `Microsoft.DataFactory/factories/dataflows@2018-06-01`.

### A.3 Codegen algorithm (pseudocode)

```python
def generate(entity_config, project_config, alias_files):
    df = DataflowBuilder(name=f"df_transform_{entity.entityKey}_inbound")
    df.add_source("srcStaged", path=f"/staged/{entity.entityKey}/{{runId}}/data.parquet")

    # one source per distinct cacheKey across all lookup fields
    for ck in distinct_cache_keys(entity.fields):
        df.add_source(f"srcMasters_{ck.refTable}",
                      path=f"/masters/{ck.refTable}.parquet",
                      broadcast=("left" if estimated_rows(ck) < project.masterBroadcastThresholdRows else "auto"))

    current_stream = "srcStaged"
    for field in entity.fields:
        graph = TRANSFORM_TEMPLATES[field.transform.type](field, entity, project, alias_files)
        current_stream = graph.append_to(df, after=current_stream)

    # validation + error routing
    df.add_conditional_split(after=current_stream,
                             branches=[("valid", "__valid == true()"),
                                       ("errors", "__valid == false()")])
    df.add_sink("sinkFinal",  stream="valid",  path=f"/final/{entity.entityKey}/{{runId}}/data.parquet")
    df.add_sink("sinkTransformErrors", stream="errors",
                path=f"/errors/{entity.entityKey}/{{runId}}/transform_errors.parquet")
    if any(f.transform.forward.get("onMissing") == "suggestion" for f in entity.fields):
        df.add_sink("sinkAliasSuggestions", path=f"/errors/{entity.entityKey}/{{runId}}/alias_suggestions.parquet")

    return df.to_arm_json()
```

`TRANSFORM_TEMPLATES` is a registry mapping each `transform.type` to a function that returns the small graph from §18. New transform types are added by extending this registry — no other change needed.

### A.4 Where codegen runs

Two equally valid options; pick at deploy time:

1. **In CI, before ADF artifact publish** — `dataflow-codegen` runs as a build step; outputs are committed into `/adf/dataflows/generated/` and published with the rest of the ARM artifacts. **Recommended for v1** because the generated artifacts are reviewable and diffable.

2. **As part of the deploy pipeline** — generated transiently into the deploy agent's workspace and published, never committed. Cleaner repo, but the diff between a config change and its Data Flow consequence becomes invisible.

### A.5 Recompile triggers

The CI pipeline must recompile any entity's data flows when:
- Its `/config/entities/<entityKey>.json` changes.
- Any `/config/aliases/<refTable>__<refField>.json` it references changes.
- `/config/_project.json` changes (project-level defaults affect codegen).
- `tools/dataflow-codegen` itself is updated (engine version bump).

A simple dependency manifest (`/config/_codegen_dependencies.json`, auto-generated) tracks which configs each generated data flow depends on. The CI compares manifest checksums against the previous commit to decide what to rebuild.

### A.6 Out-of-scope here (specified but not deeply detailed)

The exact implementation language for `tools/dataflow-codegen` (Python, .NET, TypeScript) and the full DataflowBuilder library are left to the build team — the I/O contract and algorithm above are what matters. Recommendation: Python with `jsonschema` for validation and a thin templating approach over the ARM JSON Microsoft already publishes for ADF data flow resources.
