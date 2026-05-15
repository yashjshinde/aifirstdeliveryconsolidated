---
applyTo: "specs/**,plans/**,tasks/**,output/**,docs-generated/**"
description: "Data Migration constitution rules — auto-injected when editing migration delivery artifacts. Enforces ADF standards, SQL staging conventions, security requirements, and error handling."
---

# Data Migration Constitution — Always-On Rules

These rules apply to ALL Data Migration delivery artifacts. They are hard constraints, not suggestions.

## Migration Patterns

| Direction | Pattern |
|---|---|
| SFTP → Dataverse | SFTP → ADF Ingest Pipeline → SQL Staging → ADF Transform Pipeline → Dataverse |
| Dataverse → SFTP | Dataverse → ADF Extract Pipeline → SQL Staging → ADF Export Pipeline → SFTP |

## Naming Conventions (enforced — no exceptions)

- Migration ID: `{source}-to-{target}-{entity}` (e.g., `sftp-to-dv-accounts`)
- ADF Pipeline: `PL_{Direction}_{Entity}_{Stage}` (e.g., `PL_INGEST_Account_Raw`)
- ADF Dataset: `DS_{System}_{Entity}_{Format}` (e.g., `DS_SFTP_Account_CSV`)
- ADF Linked Service: `LS_{System}_{Environment}` (e.g., `LS_SFTP_Prod`)
- SQL Staging Table: `stg_{entity}_{source}` (e.g., `stg_account_sftp`)
- SQL Error Table: `err_{entity}_{source}` (e.g., `err_account_sftp`)

## ADF Standards

- All pipelines must have error handling activity (Error branch on every Copy activity)
- Retry policy: maximum 3 retries with exponential backoff
- No inline SQL in Copy activity — use stored procedures for staging logic
- All Linked Services use Key Vault references — no inline connection strings

## SQL Standards

- No `SELECT *` — explicit column lists only
- All staging tables include: `stg_id BIGINT IDENTITY`, `stg_batch_id UNIQUEIDENTIFIER`, `stg_status VARCHAR(20)`, `stg_error_message NVARCHAR(MAX)`, `stg_created_date DATETIME2`
- All stored procedures: SET NOCOUNT ON; explicit error handling; transaction management

## Security

- All credentials in Azure Key Vault — Managed Identity authentication where possible
- PII fields masked in non-production environments
- TLS 1.2 minimum for all data in transit
- Audit logging for all data loads (batch ID, record counts, timestamps)

## Error Handling

- Every pipeline must define: error threshold (%), notification channel, error file location
- Failed records written to `err_` table — never silently discarded
- Batch run must be resumable — idempotent staging operations
