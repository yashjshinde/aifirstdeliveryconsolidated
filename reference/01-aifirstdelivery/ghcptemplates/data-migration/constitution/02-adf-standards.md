# ADF Standards

## General Rules

1. All ADF artifacts are defined as JSON files and stored in `output/{migration}/adf/`.
2. Each artifact type has its own subfolder: `pipelines/`, `datasets/`, `linkedServices/`, `dataflows/`, `triggers/`.
3. All JSON must be valid ADF ARM-compatible format (usable with `az datafactory` CLI or Bicep `existing` references).
4. No hardcoded connection strings or credentials — all secrets via Azure Key Vault references.
5. All parameters must be defined at the pipeline level and passed down; no hardcoded values inside activities.

---

## Linked Service Standards

```json
{
  "name": "LS_{System}_{Environment}",
  "type": "Microsoft.DataFactory/factories/linkedservices",
  "properties": {
    "type": "{LinkedServiceType}",
    "typeProperties": {
      "connectionString": {
        "type": "AzureKeyVaultSecret",
        "store": { "referenceName": "LS_KeyVault", "type": "LinkedServiceReference" },
        "secretName": "kv-secret-{system}-connstr-{env}"
      }
    }
  }
}
```

Required linked services for SFTP↔Dataverse patterns:

| Name | Type | Secret Name Pattern |
|---|---|---|
| `LS_SFTP_{Env}` | Sftp | `kv-sftp-{env}-host`, `kv-sftp-{env}-user`, `kv-sftp-{env}-key` |
| `LS_SQL_Staging_{Env}` | AzureSqlDatabase | `kv-sql-staging-{env}-connstr` |
| `LS_Dataverse_{Env}` | CommonDataServiceForApps | `kv-dv-{env}-url`, `kv-dv-{env}-clientid`, `kv-dv-{env}-secret` |
| `LS_KeyVault` | AzureKeyVault | (self-referencing, uses Managed Identity) |
| `LS_ADLS_{Env}` | AzureBlobStorage | `kv-adls-{env}-connstr` (optional landing zone) |

---

## Dataset Standards

```json
{
  "name": "DS_{System}_{Entity}_{Format}",
  "type": "Microsoft.DataFactory/factories/datasets",
  "properties": {
    "linkedServiceName": { "referenceName": "LS_{System}_{Env}", "type": "LinkedServiceReference" },
    "parameters": {
      "fileName": { "type": "string" },
      "folderPath": { "type": "string" }
    },
    "typeProperties": {
      "location": {
        "type": "SftpLocation",
        "folderPath": { "value": "@dataset().folderPath", "type": "Expression" },
        "fileName": { "value": "@dataset().fileName", "type": "Expression" }
      }
    }
  }
}
```

Dataset naming:

| Dataset | Linked Service | Format |
|---|---|---|
| `DS_SFTP_{Entity}_CSV` | `LS_SFTP_{Env}` | DelimitedText |
| `DS_SFTP_{Entity}_JSON` | `LS_SFTP_{Env}` | Json |
| `DS_SQL_{Entity}_Raw` | `LS_SQL_Staging_{Env}` | — (AzureSqlTable) |
| `DS_SQL_{Entity}_Stage` | `LS_SQL_Staging_{Env}` | — (AzureSqlTable) |
| `DS_DV_{Entity}` | `LS_Dataverse_{Env}` | — (CommonDataServiceForApps entity) |

---

## Pipeline Standards

### Parameters

Every pipeline must declare:

| Parameter | Type | Description |
|---|---|---|
| `runId` | String | ADF pipeline run ID (passed from orchestrator) |
| `environment` | String | `dev`, `test`, `prod` |
| `batchDate` | String | Processing date `YYYY-MM-DD` |

### Activities

| Activity | Requirement |
|---|---|
| CopyActivity | Must set `enableStagingBlobStorage: false` unless file > 1 GB |
| StoredProcedure | Use `storedProcedureName` parameter — never inline SQL |
| DataFlow | Set `computeType: MemoryOptimized`, `coreCount: 8` minimum |
| WebActivity | Use Managed Identity authentication for internal endpoints |
| ExecutePipeline | Always `waitOnCompletion: true` |
| SetVariable | Use for tracking RecordCount, ErrorCount, RunId |

### Retry Policy (default for all activities)

```json
"policy": {
  "timeout": "0.12:00:00",
  "retry": 3,
  "retryIntervalInSeconds": 30,
  "secureOutput": false,
  "secureInput": false
}
```

Override per-activity when documented with justification.

### Error Routing

Every pipeline must have:
- `onFailure` path from each critical activity → `PL_NOTIFY_{Entity}` call
- `ifCondition` activity to check ErrorCount before proceeding to target write
- No pipeline may silently swallow errors

---

## Data Flow Standards

### Source Transformation
- Always set `rowLimits` to `0` (unlimited) unless testing
- Use `Projection` step to rename columns to target naming convention
- Use `Cast` step for all type conversions — never rely on implicit casting

### Derived Column Patterns
```
// Trim and upper-case string
trim(upper(Source@FieldName))

// Null coalesce
iifNull(Source@FieldName, 'DEFAULT_VALUE')

// Date parse from string
toDate(Source@DateField, 'dd/MM/yyyy')

// Conditional mapping
iif(Source@StatusCode == '1', 'Active', iif(Source@StatusCode == '2', 'Inactive', 'Unknown'))
```

### Sink Transformation
- For Dataverse: set `upsertSettings.keys` to the alternate key column(s)
- For SQL: set `updateMethod` to `upsert` with primary key

---

## ARM Template Export

Each `output/{migration}/adf/` folder must include:
- `arm-template.json` — full ARM template for deployment
- `arm-template-parameters.json` — parameter file with placeholders
- `deploy.ps1` — PowerShell deployment script using `az datafactory`

The deploy script must accept `-Environment` parameter to select the correct parameter file.
