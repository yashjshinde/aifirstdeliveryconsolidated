# Migration Patterns

## Supported Directions

| Direction Key | Source | Staging | Target | Use Case |
|---|---|---|---|---|
| `SFTP_TO_DATAVERSE` | SFTP file (CSV/JSON/XML) | Azure SQL Staging | Dataverse entity | Load master/transactional data from external systems |
| `DATAVERSE_TO_SFTP` | Dataverse entity | Azure SQL Staging | SFTP file (CSV/JSON/XML) | Export Dataverse data to downstream systems |
| `SQL_TO_DATAVERSE` | Azure SQL / On-prem SQL | Azure SQL Staging | Dataverse entity | Migrate legacy system data to Dataverse |
| `DATAVERSE_TO_SQL` | Dataverse entity | Azure SQL Staging | Azure SQL / On-prem SQL | Reporting extracts, data warehouse feeds |
| `SFTP_TO_SQL` | SFTP file | — | Azure SQL | Standalone file-to-database ingestion |
| `SQL_TO_SFTP` | Azure SQL | — | SFTP file | Scheduled SQL-to-file exports |

Configure the active direction in `constitution/10-alm-configuration.md` under `migration.direction`.

---

## Stage Architecture

### SFTP → Dataverse (Full Pattern)

```
SFTP Server
  └── ADF Linked Service (LS_SFTP_*)
        └── ADF Dataset (DS_SFTP_{Entity}_CSV)
              └── PL_INGEST_{Entity}_Raw
                    ├── Activity: CopyActivity → SQL Raw Table (stg_{entity}_raw)
                    ├── Activity: StoredProcedure → Validate & Promote to stg_{entity}_stage
                    └── Activity: SetVariable → RunId, RecordCount, ErrorCount
                          └── PL_TRANSFORM_{Entity}_Stage
                                ├── Activity: DataFlow → DF_{Entity}_Map (field mapping + type cast)
                                └── Activity: CopyActivity → Dataverse Entity
                                      └── PL_NOTIFY_{Entity}
                                            └── Activity: WebActivity → Notify endpoint / Log to audit table
```

### Dataverse → SFTP (Full Pattern)

```
Dataverse
  └── ADF Linked Service (LS_DV_*)
        └── ADF Dataset (DS_DV_{Entity})
              └── PL_EXTRACT_{Entity}_Raw
                    ├── Activity: CopyActivity → SQL Stage Table (stg_{entity}_dv)
                    └── Activity: SetVariable → RunId, RecordCount
                          └── PL_EXPORT_{Entity}_File
                                ├── Activity: DataFlow → DF_{Entity}_Export (format + mask PII)
                                └── Activity: CopyActivity → DS_SFTP_{Entity}_CSV
                                      └── PL_NOTIFY_{Entity}
                                            └── Activity: WebActivity → Notify / Audit
```

---

## Pipeline Naming Standard

| Pattern | Pipeline Name | Purpose |
|---|---|---|
| Ingest | `PL_INGEST_{Entity}_{Qualifier}` | Read from source, write to SQL raw |
| Transform | `PL_TRANSFORM_{Entity}_{Qualifier}` | SQL raw → Dataverse (via data flow) |
| Extract | `PL_EXTRACT_{Entity}_{Qualifier}` | Read Dataverse, write to SQL stage |
| Export | `PL_EXPORT_{Entity}_{Qualifier}` | SQL stage → SFTP file |
| Orchestrator | `PL_ORCH_{Entity}_{Qualifier}` | Parent pipeline (Execute Pipeline activities) |
| Notify | `PL_NOTIFY_{Entity}` | Alerting, audit log, email/webhook |

---

## Data Flow Naming Standard

| Data Flow Name | Purpose |
|---|---|
| `DF_{Entity}_Map` | Source→target field mapping, type conversion, lookup enrichment |
| `DF_{Entity}_Export` | Target→source field mapping for outbound export |
| `DF_{Entity}_Validate` | Business rule validation (standalone, feeds error table) |

---

## Trigger Naming Standard

| Trigger Name | Type | Description |
|---|---|---|
| `TR_{Entity}_Schedule_{Frequency}` | Schedule | Cron-based trigger |
| `TR_{Entity}_Tumbling_{WindowSize}` | Tumbling Window | Time-windowed processing |
| `TR_{Entity}_Storage_{Event}` | Storage Event | SFTP/Blob arrival trigger |
| `TR_{Entity}_Manual` | Manual | On-demand only |

---

## Orchestration Rules

1. All pipelines are called from an Orchestrator pipeline — never trigger leaf pipelines directly from ADF UI in production.
2. The Orchestrator handles: retry logic, parameter passing, success/failure routing.
3. Use `Execute Pipeline` activity with `Wait on completion: true`.
4. Pass `runId` (pipeline run ID) as parameter through all child pipelines for end-to-end traceability.

---

## Idempotency Rules

1. Every ingestion run must be re-runnable without creating duplicates.
2. SQL staging tables must have a `run_id` column — use MERGE or DELETE+INSERT per `run_id`.
3. Dataverse upsert must use the natural key (alternate key), not the record GUID, to support re-runs.
4. File archiving: after successful processing, move source file to `archive/YYYY/MM/DD/` subfolder.
5. If re-processing a file, move from archive back to source folder manually before re-run.

---

## Batch Size Defaults

| Target | Default Batch Size | Max |
|---|---|---|
| Dataverse (write) | 100 records | 1 000 |
| Dataverse (read) | 500 records | 5 000 |
| SQL Staging | 10 000 records | No limit |
| SFTP file | Single file per run | — |

Override per-entity in `constitution/10-alm-configuration.md` under `migration.batch_overrides`.
