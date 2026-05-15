# Error Handling Standards

## Error Categories

| Category | Code Prefix | Description | Response |
|---|---|---|---|
| **Connection** | `CONN_` | Cannot reach source/target | Retry 3×, then fail pipeline |
| **Authentication** | `AUTH_` | Credential or permission failure | Fail immediately, alert ops |
| **Format** | `FMT_` | File format/encoding mismatch | Move to error folder, continue with next file |
| **Validation** | `VAL_` | Business rule violation on a record | Write to error table, continue with valid records |
| **Capacity** | `CAP_` | Throttling, quota, size limit | Retry with backoff, alert if persistent |
| **Data Conflict** | `CONFLICT_` | Duplicate key, constraint violation | Write to error table, log conflict details |
| **System** | `SYS_` | Unexpected exception | Fail pipeline, alert immediately |

---

## Retry Policy

### ADF Activity-Level Retry

```json
"policy": {
  "timeout": "0.12:00:00",
  "retry": 3,
  "retryIntervalInSeconds": 30
}
```

Activities that should NOT retry (fail-fast):
- StoredProcedure activities that modify data (risk of double-write)
- DeleteActivity
- WebActivity for audit/notification (use `retry: 1` only)

### Retry Intervals

| Attempt | Wait |
|---|---|
| 1st retry | 30 seconds |
| 2nd retry | 60 seconds |
| 3rd retry | 120 seconds |
| After 3 failures | Fail the activity |

---

## Partial Success Handling

A migration run is **PARTIAL** when:
- At least 1 record was written to the target successfully, AND
- At least 1 record was written to the error table.

Rules for partial success:
1. The pipeline must complete (not fail) — partial is a valid terminal state.
2. Alert the operations team with the error count and error table query.
3. Update `audit.migration_run` with `status = 'PARTIAL'`.
4. Do NOT re-run automatically — require manual triage of error records.

---

## Dead-Letter Pattern

For validation errors that cannot be automatically corrected:

1. Record written to `err.{entity}` with full `raw_data` preserved.
2. Error record includes `error_code`, `error_message`, `source_row_num`.
3. Operations team triages error table.
4. Corrected records can be manually inserted into `stg.{entity}_stage` with `validation_status = 'VALID'` and re-processed by calling the target-write SP or pipeline directly.

---

## File-Level Error Handling (SFTP Inbound)

```
ADF CopyActivity reads file
  ├── File not found → CONN_FILE_NOT_FOUND → skip (non-critical) or fail (critical)
  ├── Parse error → FMT_PARSE_ERROR → move to /incoming/{entity}/error/, raise alert
  └── Success → proceed to staging SP
        ├── Validation errors → err.{entity} rows created
        └── Complete → move file to /incoming/{entity}/archive/
```

For critical migrations (where file absence = data gap), configure the trigger to fail if no file arrives within the expected window.

---

## Alerting

### When to Alert

| Condition | Severity | Channel |
|---|---|---|
| Pipeline run failed completely | Critical | Email + Teams webhook |
| Partial run with error_records > threshold | Warning | Teams webhook |
| No file received in expected window | Warning | Email |
| Auth failure (CONN or AUTH category) | Critical | Email + PagerDuty (if configured) |
| Error table growing beyond capacity limit | Warning | Teams webhook |

### Alert Payload (WebActivity body)

```json
{
  "migrationName": "@pipeline().parameters.migrationName",
  "runId": "@pipeline().RunId",
  "environment": "@pipeline().parameters.environment",
  "status": "@variables('runStatus')",
  "totalRecords": "@variables('totalRecords')",
  "errorRecords": "@variables('errorRecords')",
  "batchDate": "@pipeline().parameters.batchDate",
  "errorDetail": "@activity('PromoteToStage').error.message"
}
```

---

## Compensation / Rollback

### Inbound (SFTP → Dataverse)

ADF does not support automatic rollback of Dataverse writes.
If a run must be rolled back:
1. Identify records written to Dataverse in this run using `stg.{entity}_stage` where `run_id = '{runId}'`.
2. Use a compensation SP or manual process to delete/revert those records in Dataverse.
3. Delete from `stg.{entity}_stage` and `stg.{entity}_raw` for the `run_id`.
4. Re-run the pipeline from the corrected source file.

### Outbound (Dataverse → SFTP)

Outbound writes to SFTP are fire-and-forget at the file level.
If the wrong file was sent:
1. Contact the receiving party to discard the file.
2. Generate a corrected file and re-send.
3. Log in `audit.migration_run` with `status = 'CORRECTED'` and note in `target_info`.
