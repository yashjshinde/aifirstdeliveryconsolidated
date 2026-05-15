# 03 — Error Model & Operations Runbook

Implementer-ready specification for **how the framework reports failures, what shape every error record has, when it retries, when it gives up, and what on-call does about it.** The error model is the contract between the engine and three audiences: the **build team** (must implement these codes), **operations** (must respond to them), and **data stewards** (must triage alias suggestions and similar soft-fail outputs).

## 1. Error categorization

Every error emitted by any pipeline has a **code**, **severity**, **category**, and **resolution class**. The catalog uses 7 number ranges, each tied to a layer of the framework:

| Range | Category | Issuing pipelines |
| --- | --- | --- |
| E1xxx | Extract | `pl_extract_file`, `pl_extract_dataverse` |
| E2xxx | Staging / validation | `pl_stage_validate` |
| E3xxx | Transform | `pl_transform_inbound`, `pl_transform_outbound` |
| E4xxx | Load (Dataverse write or SFTP deliver) | `pl_load_upsert`, `pl_deliver_sftp` |
| E5xxx | Relationships / post-load | `pl_load_relationships`, `pl_export_relationships` |
| E6xxx | Wave orchestration | `pl_wave_orchestrator` |
| E7xxx | Config / pre-flight | `pl_preflight`, `tools/validate-config` runtime checks |

**Severity:**
- `FATAL` — pipeline aborts; no further activities run.
- `ROW` — single row rejected to an error sidecar; pipeline continues.
- `SOFT` — row loaded but with a known gap; recorded for steward review (e.g. alias suggestion).
- `WARN` — recorded in audit, not surfaced to notification.

**Resolution class:**
- `auto-retry` — engine retries per §5; only escalated if budget exhausted.
- `data-fix` — operator or steward must correct source/master data before re-running.
- `config-fix` — mapping or wave config edit required.
- `infra-fix` — KV/ADLS/Dataverse/SFTP/SHIR issue; ops on-call escalates.
- `auto-recover` — engine self-corrects on next normal run (e.g. transient throttle within retry budget).

---

## 2. Error code catalog

### 2.1 E1xxx — Extract

| Code | Severity | When | Resolution class | Action |
| --- | --- | --- | --- | --- |
| **E1001** | FATAL | SFTP host unreachable (TCP timeout, DNS failure) | `infra-fix` | On-call: validate SHIR health and SFTP DNS. Restart SHIR if green-pingable from host but ADF can't see it. See runbook §8.1. |
| **E1002** | FATAL | SFTP auth failed (bad cred or expired key) | `infra-fix` | Rotate the KV secret `kv-sftp-<env>` and retest with `pl_preflight`. |
| **E1003** | FATAL | `source.inbound.pathPattern` matched zero files **and** `runMode=full` | `data-fix` | Source system didn't drop the expected file. Contact upstream owner. |
| **E1004** | WARN | `source.inbound.pathPattern` matched zero files **and** `runMode=incremental` | `auto-recover` | Logged as Success (no-op). Investigate only if 3+ consecutive incrementals are empty. |
| **E1005** | ROW | Excel worksheet `source.inbound.worksheet` missing | `config-fix` | Update mapping; redeploy `/config/entities/<entityKey>.json`. |
| **E1010** | FATAL | Dataverse Web API returned 401 | `infra-fix` | SPN secret expired or app user deactivated. Rotate KV secret and re-grant DV roles. |
| **E1011** | FATAL | Dataverse Web API returned 403 on the target entity | `config-fix` | SPN missing security role for the entity; have the DV admin grant it. |
| **E1012** | WARN | Dataverse Web API returned 429 (throttle), retried successfully | `auto-recover` | No action; observed >5/hour means request batchSize tuning. |
| **E1013** | FATAL | Dataverse Web API 429, retries exhausted | `auto-retry` then `infra-fix` | Page on-call; tune `_project.json.batchSize` down 50% and re-run. |
| **E1014** | FATAL | FetchXML/OData query syntactically invalid | `config-fix` | Validate the query in XrmToolBox; fix in entity config. |
| **E1015** | FATAL | `target.outbound.query.savedView` GUID not found | `config-fix` | Update view name; verify with `pl_preflight`. |
| **E1016** | ROW | A row's `target.outbound.delta.watermarkField` is null/missing | `data-fix` | Dataverse rows with the watermark unset cannot participate in incremental. Either populate the field upstream or switch to `runMode=full` for one recovery run. |

### 2.2 E2xxx — Staging / validation

Every E2xxx row is **ROW** severity unless noted; the row is written to `/errors/<entityKey>/<runId>/validation_errors.parquet`.

| Code | Severity | When | Action |
| --- | --- | --- | --- |
| **E2001** | ROW | Type cast failed (e.g. `"abc"` → integer) | Source data fix; re-extract |
| **E2002** | ROW | `maxLength` exceeded | Truncate upstream or relax `maxLength` in mapping |
| **E2003** | ROW | `mandatory:true` field empty | Source data fix |
| **E2004** | ROW | `validations: ["regex:..."]` regex failed | Source data fix |
| **E2005** | ROW | `validations: ["range:min,max"]` numeric out of range | Source data fix |
| **E2006** | FATAL | Schema drift > 30% (more than 30% of expected columns missing) | Source-system schema change; pause wave, update mapping |
| **E2010** | ROW | Duplicate by `dedup.checksumColumns` with `onDuplicate=fail` | Source data fix; or change `onDuplicate` to `keepLatest`/`keepFirst` |
| **E2099** | FATAL | Validation error rate exceeds `_project.json.failureThresholdPct` | Operations: review error sidecar, decide whether to fix-and-rerun or accept a partial load |

### 2.3 E3xxx — Transform

`/errors/<entityKey>/<runId>/transform_errors.parquet` for ROW-severity codes; `/errors/<entityKey>/<runId>/alias_suggestions.parquet` for SOFT-severity codes per spec §3.3.4.

| Code | Severity | When | Action |
| --- | --- | --- | --- |
| **E3001** | ROW | `choice` value not in `forward.map`, `onMissing=fail` | Data fix or extend the map |
| **E3002** | ROW | `state` value not in `forward.map` | Same |
| **E3003** | ROW | `yesNo` value matches neither `trueValues` nor `falseValues` | Extend the lists or fix source |
| **E3004** | ROW | `dateTime` parse failed against `inputFormat` | Verify source format; tweak `inputFormat` |
| **E3005** | ROW | `concat`/`split`/`conditional` evaluated to null when target is mandatory | Inspect rule coverage |
| **E3006** | ROW | `conditional.rules` had no match and `default` is null on a mandatory target | Add default or fix data |
| **E3010** | ROW | `lookup.notfound` and `onMissing=error` | Add master row or alias; or change `createIfMissing=true` |
| **E3011** | SOFT | `lookup.notfound` and `onMissing=suggestion` | Recorded for steward; row loaded with null lookup |
| **E3012** | SOFT | `lookup.notfound`, `createIfMissing=true`, master successfully created | Logged; investigate spike of auto-creates monthly |
| **E3013** | ROW | `lookup.notfound`, `createIfMissing=true`, master create itself failed | Likely DV plugin/validation rejection; see error log |
| **E3014** | WARN | `lookup` resolved via case-insensitive match (`matchPolicy=caseInsensitive`) | Audit only; high counts hint at upstream case inconsistency |
| **E3015** | FATAL | `lookup.entitySetName` or `lookup.navigationProperty` returns 400 from DV | `config-fix`; verify in `EntityDefinitions`. Pre-flight catches most of these. |
| **E3016** | ROW | Reverse transform missing (`concat/split/conditional` with no `reverse` block) and run is outbound | `config-fix`; validate-config V020 should have caught this |
| **E3020** | FATAL | Master `refField` has duplicates (broadcast join would explode rows) | `data-fix` in master; pre-flight runtime check V065 |

### 2.4 E4xxx — Load (Dataverse write or SFTP deliver)

| Code | Severity | When | Action |
| --- | --- | --- | --- |
| **E4001** | ROW | DV: alternate key violation (concurrent insert) | `auto-retry`; row written to `/errors/.../load_errors/` |
| **E4002** | ROW | DV: plugin/business-rule rejection | Inspect plugin trace; may require `bypassPlugins=true` for bulk |
| **E4003** | ROW | DV: required field on the target attribute is null in payload | `data-fix` or set `defaultValue` in mapping |
| **E4004** | ROW | DV: text length exceeds attribute's MaxLength | Truncate upstream or relax `maxLength` in DV |
| **E4005** | ROW | DV: invalid option-set value (transform produced a value outside the entity's allowed options) | Sync option-set values; rebuild `/masters/optionsets.parquet` |
| **E4010** | FATAL | DV: 429 throttle, retries exhausted | Page on-call; reduce batchSize; consider time-shifting load |
| **E4011** | FATAL | DV: 5xx for >50% of batches in a run | Likely DV instance unhealthy; ops on-call |
| **E4012** | WARN | Load error rate within `failureThresholdPct` → pipeline status Partial | Notification fires per `notification.onPartial`; review sidecar |
| **E4013** | FATAL | Load error rate exceeds `failureThresholdPct` → pipeline Failed | Triage sidecar; fix and reprocess via `pl_reprocess` |
| **E4020** | FATAL | SFTP: write path not accessible | Validate SFTP permissions; rotate cred if needed |
| **E4021** | FATAL | SFTP: disk-full / quota exceeded | Coordinate with SFTP host owner |

### 2.5 E5xxx — Relationships / post-load

| Code | Severity | When | Action |
| --- | --- | --- | --- |
| **E5001** | ROW | N:N associate: primary entity GUID not resolvable | Primary alt-key missing from /masters — refresh or fix |
| **E5002** | ROW | N:N associate: related entity GUID not resolvable | Same for related side |
| **E5003** | WARN | N:N associate: HTTP 412 (association already exists) | **Treated as silent success** — the pipeline catches the 412 via `activity('WebActivity_Associate').error.message` containing `"412"` or `"already exists"` and continues. Logged WARN only; count is visible in `/audit/run_history.parquet` as `nnAssociateAlreadyExists` so spikes can be investigated, but never alerts. See [02-pipelines-and-dataflows.md §8](02-pipelines-and-dataflows.md#8-pl_load_relationships-inbound) for the exact pipeline expression. |
| **E5004** | ROW | N:N associate: HTTP 4xx (validation rejected) | Inspect DV error message; data or schema fix |
| **E5005** | FATAL | N:N associate: relationship schema name doesn't exist | Pre-flight should catch; `config-fix` |
| **E5010** | ROW | Post-load `setLookup`: target row to update not found | Target side was deleted between transform and post-load; investigate |
| **E5020** | ROW | Outbound N:N export: intersect-table extract returned a row whose GUID isn't in either master | Master cache stale; refresh and retry |

### 2.6 E6xxx — Wave orchestration

| Code | Severity | When | Action |
| --- | --- | --- | --- |
| **E6001** | FATAL | Wave config has a cycle in `dependsOn` | `config-fix`; validate-config V030 should have caught this |
| **E6002** | FATAL | Wave references an `entityKey` not in `/config/entities/` | `config-fix`; V010 |
| **E6003** | WARN | Entity skipped due to upstream failure (`onDependencyFailure=skipDependent`) | Logged; appears in wave summary email |
| **E6004** | FATAL | `failurePolicy.onEntityFailure=stopWave` and any entity Failed | Triage failed entity; re-run wave with same `priorWaveRunId` |
| **E6005** | FATAL | Wave master-cache refresh between phases failed | Likely Dataverse issue; on-call |
| **E6010** | FATAL | Partial reprocess (`entityFilter`) requested but a `dependsOn` upstream is in Failed/Skipped state and `--ignoreDependencyState` not passed | Operator: fix upstream first |
| **E6011** | WARN | Wave error rate exceeds `wavePartialThresholdPct` but no individual entity Failed | Notification → wave status Failed |

### 2.7 E7xxx — Config / pre-flight

| Code | Severity | When | Action |
| --- | --- | --- | --- |
| **E7001** | FATAL | Entity config fails JSON Schema | `config-fix`; CI should have blocked the deploy |
| **E7002** | FATAL | Entity references a Dataverse entity that doesn't exist | DV admin: create entity per §8 of spec |
| **E7003** | FATAL | Entity references a Dataverse attribute that doesn't exist | Same |
| **E7004** | FATAL | `lookup.entitySetName` does not match Dataverse plural | `config-fix` |
| **E7005** | FATAL | N:N relationship name not found in Dataverse | `config-fix` or DV admin |
| **E7006** | FATAL | `target.alternateKey` is not actually an alt-key on the entity | DV admin: create the alt-key |
| **E7010** | WARN | Master prefetch found duplicates in `refField` | Master data quality issue; resolve before next run |

---

## 3. Error-row schemas (sidecar parquets)

Every sidecar is **parquet** (chosen over CSV for typed columns and Power BI consumption). All sidecars share six **envelope columns** at the front; the rest is sidecar-specific.

### 3.1 Envelope columns (all sidecars)

| Column | Type | Description |
| --- | --- | --- |
| `runId` | string | The ADF `pipeline().RunId` |
| `waveRunId` | string nullable | Set when run from a wave |
| `entityKey` | string | From the entity config |
| `direction` | string | `inbound` or `outbound` |
| `errorCode` | string | One of `E1xxx` … `E7xxx` |
| `errorRecordedAt` | timestamp | UTC, ADF `utcNow()` |

### 3.2 `validation_errors.parquet`

```
+ <envelope>
+ sourceRowIndex            int     // 1-based index in /raw input
+ sourceKeyValues           string  // JSON dict of alt-key columns and their values, e.g. {"ACCOUNT_NUMBER":"CUST-1003"}
+ failedField               string  // null when row-level not field-level
+ failedRule                string  // e.g. "maxLength:100", "mandatory", "regex:^\\d+$"
+ observedValue             string  // null when sensitive
+ failureReason              string  // human-readable, max 500 chars
+ rawRow                    string  // original CSV row as one JSON string, for diff/repro
```

### 3.3 `transform_errors.parquet`

```
+ <envelope>
+ sourceRowIndex            int
+ sourceKeyValues           string
+ transformType             string  // one of the 10 transform types
+ failedField               string
+ stagedValue               string  // post-validation, pre-transform value
+ failureReason             string  // e.g. "lookup.notfound: opx_equipmentdiscount.opx_code='ED-UNKNOWN'"
+ referenceTable            string nullable
+ refField                  string nullable
+ stagedRow                 string  // full staged row as JSON
```

### 3.4 `load_errors/` (ADF Copy Activity log directory)

The Dataverse sink's "log incompatible rows" feature writes Microsoft-defined CSVs under `load_errors/<dateTime>/`. We do not normalize this — the format is owned by ADF — but we index it:

`load_errors/_index.json` (written by `pl_load_upsert`):

```json
{
  "runId": "<guid>",
  "entityKey": "customer",
  "totalRowsAttempted": 100,
  "totalRowsLoaded": 97,
  "totalRowsLogged": 3,
  "logFiles": [
    "load_errors/2026-05-13T020547Z/log-0001.csv"
  ],
  "errorCodes": { "E4002": 2, "E4003": 1 }
}
```

The runbook step §7.3 explains how to convert these into reprocess input.

### 3.5 `alias_suggestions.parquet`

```
+ <envelope>
+ sourceValue               string  // as it appeared in source
+ normalizedValue           string  // after the normalize rules
+ refTable                  string
+ refField                  string
+ rowCount                  int     // how many rows in this run shared the unmapped value
+ sampleSourceKeys          string  // JSON array of up to 10 alt-keys
+ firstSeenRunId            string  // earliest run where this value appeared and was unresolved
+ suggestedAction           string  // engine's recommendation: "add_alias" | "create_master" | "fix_source"
```

`firstSeenRunId` is preserved across runs by the engine reading the prior file (if any) before writing the new one — stewards get aging information for free.

---

## 4. Error-row volume and retention

| Sidecar | Typical size | Retention | Why |
| --- | --- | --- | --- |
| `validation_errors.parquet` | ≤ 5% of inbound rows × ~1KB | **30 days** | Long enough to diff against the next normal run |
| `transform_errors.parquet` | ≤ 1% of staged rows × ~1KB | **30 days** | Same |
| `load_errors/` | ≤ 1% of final rows × ~500B | **90 days** | DV-side root causes can take longer to resolve |
| `alias_suggestions.parquet` | one row per distinct unmapped value | **180 days** | Stewards work weekly cycles |

`/audit/run_history.parquet`, `/audit/wave_runs/`, and `/audit/checkpoints/` are retained **indefinitely** (small footprint, high investigative value).

A lifecycle-management rule on ADLS handles the deletion; the engine doesn't manage retention itself.

---

## 5. Retry & backoff semantics

### 5.1 ADF activity-level retry (built-in)

Every activity in [02-pipelines-and-dataflows.md §0.3](02-pipelines-and-dataflows.md#03-activity-level-retry-policy) has `retry: 3` and `retryIntervalInSeconds: 60` by default — this covers transient network blips.

### 5.2 Project-level retry (engine-applied)

The wrapper pipelines apply `_project.json.retry`:

```
maxAttempts: 5
backoffSec: 30
exponential: true
jitter: true
```

The backoff formula at attempt N (1-indexed):

```
sleep = backoffSec * 2^(N-1) * (1 + random(-jitterPct, +jitterPct))
       capped at 600 seconds
```

With default settings: ~30s, ~60s, ~120s, ~240s, ~480s. Plus jitter ± 20%.

### 5.3 Which errors are retryable?

| Error class | Auto-retried? |
| --- | --- |
| HTTP 408, 429, 500, 502, 503, 504 from DV | yes |
| HTTP 412 on N:N `/$ref` POST (association already exists) | **no — short-circuited to success**; never retried. See E5003 in §2.5. |
| HTTP 412 on entity upsert (alt-key concurrency conflict) | yes — retried by ADF Copy activity's built-in policy |
| SFTP transient (broken pipe, connection reset) | yes |
| All 4xx other than 429/412 | no |
| Data Flow row-level errors | no — row goes to error sidecar, pipeline continues |
| Pipeline activity timeout | yes, up to `retry: 3` |

### 5.4 Retry tracking

Each retry is logged in `/audit/retries/<runId>/<pipelineName>__<activityName>__<attemptN>.json`:

```json
{
  "pipelineName": "pl_load_upsert",
  "activityName": "Copy_FinalToDataverse",
  "attempt": 3,
  "sleptSeconds": 122,
  "previousError": { "code": "E1013", "message": "..." },
  "outcome": "Success"
}
```

If `maxAttempts` is exhausted, the FATAL error code is escalated to notification.

### 5.5 Dataverse service-protection budget (do this math before sizing)

Dataverse enforces three concurrent limits per **app user** (the SPN the framework uses):

| Limit | Value | Reset window |
| --- | --- | --- |
| Number of API requests | **6,000** | rolling 5 minutes |
| Total execution time | **20 minutes** | rolling 5 minutes |
| Concurrent requests | **52** | instantaneous |

Reference: [Service protection API limits](https://learn.microsoft.com/power-apps/developer/data-platform/api-limits). The ADF Dataverse connector receives **HTTP 429** with a `Retry-After` header when any limit is hit; ADF's Copy activity respects the header automatically.

**Per-row request cost** (Copy activity, Upsert mode):

| Operation | Requests/row | Notes |
| --- | --- | --- |
| Upsert by single-column alt-key | 1 PATCH | The connector resolves the alt-key in-URL, no read needed |
| Upsert by multi-column alt-key (Site) | 1 PATCH | Same as above; alt-key is passed comma-joined |
| Upsert with `@odata.bind` for 1 lookup | 1 PATCH | All lookups bind in the same PATCH body |
| Upsert with `@odata.bind` for N lookups | 1 PATCH | Lookup count doesn't increase request count |
| N:N `/$ref` POST | 1 POST per association | One request per N:N row, not per source entity row |
| Master prefetch (`pl_master_prefetch`) | ~1 GET per page | Page size 5000 default |

**Worked example — Customer entity, 50,000-row daily load:**

- `pl_master_prefetch`: 6 lookup masters × ~1 page each = **6 GETs**.
- `pl_load_upsert`: 50,000 rows / 1 request per row = **50,000 PATCHes**. With `writeBatchSize: 500` and `maxConcurrentConnections: 4`, throughput ≈ 4 × ~10 PATCH/sec/connection ≈ **40 PATCH/sec**.
- Run time: 50,000 / 40 ≈ **21 minutes**.
- Peak 5-min window: 40 × 60 × 5 = **12,000 requests** → **exceeds the 6,000 limit by 2×**.

**Mitigations** (ordered by preference):

1. **Reduce `maxConcurrentConnections` from 4 to 2** on the Linked Service. Throughput halves to ~20/sec; peak 5-min window drops to ~6,000 (at the limit). Run time doubles to ~42 min.
2. **Increase `writeBatchSize` toward 1000**. Within reason, batching reduces protocol overhead but ADF's Dataverse connector still issues per-row PATCHes inside the batch — this helps less than the docs imply. Bench in a non-prod env first.
3. **Spread the load across two SPN app users** — each gets its own 6,000-req budget. Requires configuring two Linked Services and partitioning rows (e.g. by `accountnumber.hashCode() % 2`). Costs one more app user.
4. **Off-peak scheduling** — if other DV traffic is heavy at 02:00, move the wave to 04:00.

`_project.json` settings to tune in support of this:

```jsonc
{
  "batchSize": 500,
  "maxConcurrentConnectionsDataverse": 2,    // new property (default 2, was implicit 4 in v1 draft)
  "dataverseRequestsPerMinuteBudget": 1100   // documentation-only; CI lint can flag entity × volume that would exceed this
}
```

**Operational signal:** the load runbook's first check on E1013/E4010/E4011 (page §8.1) is to confirm 429 was the trigger and look at the 5-min request count for the SPN in the Power Platform admin center. If 429 fires inside the configured budget, the budget was set too aggressively; pull `maxConcurrentConnectionsDataverse` down 50% and retry.

---

## 6. Checkpoint protocol and restart

### 6.1 Checkpoint write order

Each sub-pipeline writes its checkpoint **as its last activity**. The orchestrator considers a sub-pipeline complete only when the checkpoint file exists.

### 6.2 Restart sequence

Operator re-fires `pl_master_orchestrator` with the **same** `runId`. The orchestrator:

1. Reads `/audit/checkpoints/<runId>/*.json`.
2. For each sub-pipeline, if a checkpoint exists with `status: Success`, skip it.
3. Resume from the first sub-pipeline without a Success checkpoint.

This makes a failed `pl_load_upsert` re-runnable without re-extracting from SFTP or re-validating staged data.

### 6.3 Wave-level restart

Operator re-fires `pl_wave_orchestrator(waveKey, priorWaveRunId=<original>)`. Children inherit the same `waveRunId`, look up their own `runId` from `/audit/wave_runs/<waveRunId>/<entityKey>.json`, and apply §6.2.

### 6.4 Forcing a clean restart

Pass `cleanRestart: true` to the orchestrator. The first activity becomes `Delete_Checkpoints(<runId>)`, then the run proceeds as fresh.

---

## 7. Notification payload

A single Logic App (`la-opex-notify`) handles all notifications. Activities call its HTTP trigger with this JSON:

```jsonc
{
  "event":     "entity.success" | "entity.partial" | "entity.failure"
             | "wave.success"   | "wave.partial"   | "wave.failure"
             | "sla.breach",
  "runId":     "<guid>",
  "waveRunId": "<guid or null>",
  "entityKey": "customer",                 // null for wave-level events
  "direction": "inbound",
  "startedAt": "2026-05-13T02:00:00Z",
  "completedAt":"2026-05-13T02:14:33Z",
  "metrics": {
    "rowsRead":        12345,
    "rowsLoaded":      12300,
    "validationErrors":12,
    "transformErrors": 18,
    "loadErrors":      15,
    "aliasSuggestions": 4
  },
  "topErrorCodes":   [["E4002", 12], ["E3010", 3]],
  "errorSamples":    [
    { "code": "E4002", "field": "opx_AccountType", "stagedRow": "..." }
  ],
  "links": {
    "runHistoryRow":      "/audit/run_history.parquet#runId=<guid>",
    "validationErrors":   "/errors/customer/<runId>/validation_errors.parquet",
    "transformErrors":    "/errors/customer/<runId>/transform_errors.parquet",
    "loadErrors":         "/errors/customer/<runId>/load_errors/_index.json",
    "aliasSuggestions":   "/errors/customer/<runId>/alias_suggestions.parquet"
  }
}
```

The Logic App fans out:

- **Email** (SMTP/O365): one message per event, body templated by `event`.
- **Teams** (incoming webhook): one Adaptive Card per event, color-coded green/yellow/red. Card includes `topErrorCodes` and direct links from `links`.
- **Routing**: `entity.partial` → email only; `entity.failure` and `wave.failure` → email + Teams.

SLA-breach detection: a separate `pl_sla_monitor` (out of scope here — runs every 15 min) compares in-progress runs against `_project.json.notification.slaMinutes` and emits `sla.breach` events.

---

## 8. Operations runbook

Five scenarios cover ~95% of pages.

### 8.1 Scenario — Dataverse throttling (E1013/E4010/E4011)

**Symptom:** Teams alert "wave.failure customer — E4010 retries exhausted". `metrics.loadErrors` is high, `metrics.rowsLoaded` is far below `rowsRead`.

**Triage (5 min):**
1. Check Dataverse health: `https://<env>.crm.dynamics.com/api/data/v9.2/$metadata` returns 200.
2. Open ADF run; confirm Copy Activity sink throughput.
3. Open Power Platform admin center → Resource → API requests dashboard for the past hour.

**Action:**
- Reduce `_project.json.batchSize` by 50% and re-run.
- If 429 was on read (`pl_master_prefetch`), increase `masterCacheTtlMinutes` so prefetch isn't re-run for the next wave.
- If throttling persists, escalate to MS support with the run's `runId` and the 429 timestamps.

**Recovery:** re-fire the wave with the same `priorWaveRunId`; checkpointed sub-pipelines (extract, stage) are skipped; only the failed load re-runs.

### 8.2 Scenario — High validation error rate (E2099)

**Symptom:** Email "entity.partial customer — 12% validation errors". Threshold is 5%, so it could also be `entity.failure` depending on threshold config.

**Triage (10 min):**
1. Download `/errors/customer/<runId>/validation_errors.parquet`.
2. Group by `failedRule` — usually one rule explains 80% of rows.
3. Sample `rawRow` to see the source data shape.

**Common root causes:**
- **Source format change** — upstream system added a column, shifted positions. Coordinate a fix with the source team or update `source.inbound.headerRow`/`delimiter`.
- **Mandatory rule misset** — a "Y/N" column became optional upstream. Relax `mandatory:false` in the field mapping.
- **Encoding mismatch** — non-ASCII characters land as `?`. Switch `source.encoding` to `windows-1252` if upstream confirms.

**Recovery:** fix the mapping or source, re-fire `pl_master_orchestrator` with a fresh `runId` (clean restart). Use `pl_reprocess` if only a subset needs reprocessing.

### 8.3 Scenario — Lookup not-found surge (E3010 or E3011)

**Symptom:** Email "entity.partial customer — 47 transform errors". Sample shows `E3010 lookup.notfound: opx_equipmentdiscount.opx_code='ED-PLATINUM'`.

**Triage (15 min):**
1. Download `transform_errors.parquet` and `alias_suggestions.parquet`.
2. Inspect the master `/masters/opx_equipmentdiscount.parquet` — is `ED-PLATINUM` truly missing, or is the case different?
3. Check `_project.json.masterCacheTtlMinutes` — was the cache stale at run time?

**Action paths:**
- Master row truly missing → DV admin adds it; or set `createIfMissing:true` if policy allows.
- Master row exists with different casing → set `matchPolicy: caseInsensitive` on the field.
- Recurring variant (e.g. `Platinum-USA`) → add to `/config/aliases/opx_equipmentdiscount__opx_code.json`, no redeploy needed.

**Recovery:** edit master or alias file, re-fire orchestrator (incremental). Affected rows from prior run reprocessable via `pl_reprocess`.

### 8.4 Scenario — Wave dependency failure cascade (E6003 / E6004)

**Symptom:** Wave summary email "wave.failure oracle_fusion_daily. Customer: Failed. Site, Contact: Skipped".

**Triage (5 min):**
1. Open Customer's `runId` row in `/audit/run_history.parquet` — what was the underlying error?
2. Follow that error's runbook (8.1, 8.2, or 8.3).

**Recovery options:**
- **Re-fire the wave** (recommended): same `priorWaveRunId`, Customer reprocesses, Site and Contact then run on the freshly loaded accounts.
- **Run Site/Contact alone after fixing Customer**: `pl_wave_orchestrator(entityFilter=["site","contact"], priorWaveRunId=<orig>)`. Engine validates that Customer is now Success (rule E6010) and proceeds.

### 8.5 Scenario — Stale lock blocks re-run

**Symptom:** Operator manually re-fires `pl_master_orchestrator`, immediate failure: "lock exists at `/audit/locks/customer__inbound.json`".

**Triage (2 min):**
1. Read the lock file: it carries the original `runId` and `acquiredAt`.
2. Check if that `runId`'s ADF run is still in progress in the monitor.

**Action:**
- If the ADF run is genuinely still running: wait. Two concurrent runs would corrupt state.
- If the ADF run is dead (timed out, ADF restarted, etc.): manually delete the lock file. Document the deletion in the run-history audit (the engine writes a `lock.cleared` audit row on next run startup).
- The auto-clear logic (lock-age > `maxAttempts × timeout`) kicks in on the next *wave-level* run automatically.

---

## 9. Audit & observability

### 9.1 `/audit/run_history.parquet` — the operational data lake

Single parquet, append-only, partitioned by `runDate=yyyy-mm-dd`:

```
runId | waveRunId | entityKey | direction | pipelineName | step | status |
startedAt | completedAt | inputRows | outputRows | errorRows | failureReason |
runMode | configVersion | engineVersion
```

Loaded into Power BI for the daily wave dashboard (out of scope here). Queryable directly via Synapse Serverless `OPENROWSET` or Databricks.

### 9.2 Standard queries

| Question | Query (pseudocode) |
| --- | --- |
| What's the failure rate of `pl_load_upsert` over the past 7 days? | `count(*) where pipelineName='pl_load_upsert' and status='Failed' and runDate>=now-7d` |
| Which entity has the most alias suggestions? | `select entityKey, count(*) from <alias_suggestions union> group by entityKey order by 2 desc` |
| What's the median end-to-end wave duration? | `percentile_cont(0.5) within group (order by (completedAt - startedAt)) where pipelineName='pl_wave_orchestrator' and status='Success'` |

### 9.3 Engine versioning

Each pipeline embeds an `engineVersion` constant (e.g. `"1.0.0"`). Engine bumps are recorded in `run_history` so post-incident review can correlate with deploy events.

---

## 10. Notification examples

### 10.1 Email — `entity.failure`

```
Subject: [FAIL] opex-integration: customer inbound (RunId 3f...c1)

Customer inbound load FAILED in 14m 33s.

Read:     12345
Loaded:    8127  (65.8%)
Errors:    4218  (34.2%)

Top error codes:
  E4002 plugin/business-rule rejection         3892
  E3010 lookup not found                        287
  E2003 mandatory field empty                    39

Sample row (E4002):
  ACCOUNT_NUMBER=CUST-1003 | Field=opx_AccountType | Value=884870099
  Reason: "OptionSet value 884870099 is not defined for opx_AccountType"

Sidecars:
  /errors/customer/3f...c1/validation_errors.parquet
  /errors/customer/3f...c1/transform_errors.parquet
  /errors/customer/3f...c1/load_errors/_index.json

Run page: <ADF link>
Runbook:  03-error-model-and-runbook.md §8.1
```

### 10.2 Teams card — `wave.success`

Adaptive Card with three columns (entity, status, rows) and the wave-summary link. Green theme, no @mentions.

---

## 11. What an implementer should produce

1. **Error-code constants file** `tools/errors.json` — single source of truth, consumed by both ADF expressions (via parameter injection) and the validate-config CLI:

```jsonc
{
  "E1001": { "severity": "FATAL", "category": "extract", "resolution": "infra-fix", "message": "SFTP host unreachable" },
  "E2003": { "severity": "ROW",   "category": "validation", "resolution": "data-fix", "message": "Mandatory field empty" },
  /* … one entry per code in §2 … */
}
```

2. **Error-row writers** in each data flow — a parameterized "sink invalid rows" sub-flow that takes the envelope columns + the sidecar-specific columns and writes parquet. Reused by `df_stage_validate` (validation_errors), `df_transform_inbound` (transform_errors, alias_suggestions), `df_transform_outbound` (same), and the load pipelines (`load_errors/_index.json`).

3. **Logic App** `la-opex-notify` with one HTTP trigger and two outbound actions (Office 365 send-email, HTTP-post to Teams webhook). Template the email/Teams bodies from the JSON payload in §7.

4. **Power BI dataset** `opex-integration-ops.pbix` over `/audit/run_history.parquet` and `alias_suggestions.parquet` — handed off to the operations team, not maintained by the build team.

5. **Runbook drills**: §8.1–§8.5 each get a test case in the build team's go-live drill list. Each scenario must be reproducible in a non-prod environment and resolvable in under the documented triage time.

---

## 12. Glossary of states & statuses

| Term | Where it appears | Meaning |
| --- | --- | --- |
| `Success` | run_history.status | Every row in scope loaded; error rate = 0% |
| `Partial` | run_history.status | Some rows in error, rate within `failureThresholdPct` |
| `Failed` | run_history.status | Error rate exceeded threshold OR FATAL error code raised |
| `Skipped` | run_history.status | Wave entity skipped due to upstream failure |
| `In Progress` | ADF Monitor | Pipeline currently running; not yet in run_history |
| `entity.success` etc. | notification.event | Event names dispatched to la-opex-notify |
| `ROW` severity | error catalog | Row → sidecar, pipeline continues |
| `FATAL` severity | error catalog | Pipeline aborts |
| `SOFT` severity | error catalog | Row loaded with a known gap, recorded for steward review |
