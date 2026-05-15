Generate all ADF, SQL, and test artefacts for a migration.

## Usage

```
/implement {migration-id} [{task-uid}]
```

Omit `{task-uid}` to implement all READY TO IMPLEMENT tasks.
Provide `{task-uid}` to implement a single task (e.g. `/implement sftp-accounts T005`).

## Pre-condition

All task cards in `tasks/{migration-id}/` must have `**Validation Status:** READY TO IMPLEMENT`.
(Or the specified task must be READY TO IMPLEMENT when running single-task mode.)

## Steps

1. Read ALL files in `constitution/`.
2. Verify all target task cards are READY TO IMPLEMENT.
3. Read TDD, blueprint, field mapping, and pipeline design.
4. Implement each task in the order defined in `/task.md` (infrastructure first, docs last).
5. After each task, mark `**Validation Status:** IMPLEMENTED` in the task card.

## Implementation Rules

### SQL DDL Files

Location: `output/{migration-id}/sql/schema/`

Generate idempotent DDL following `constitution/03-sql-staging-standards.md` exactly:
- Use `IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE ...)` guards
- Include all required columns (run_id, loaded_at, etc.)
- Include all indexes
- Schemas created via: `IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = '{schema}') EXEC('CREATE SCHEMA [{schema}]')`

### SQL Stored Procedure Files

Location: `output/{migration-id}/sql/procedures/`

Generate using `CREATE OR ALTER PROCEDURE` pattern.
Follow the template from `constitution/03-sql-staging-standards.md` exactly:
- SET NOCOUNT ON
- TRY/CATCH with THROW
- MERGE or DELETE+INSERT per @RunId (idempotent)
- All validation rules from field mapping applied as CASE expressions

### deploy.sql

Location: `output/{migration-id}/sql/deploy.sql`

Master script that runs all DDL then all SPs in order:
```sql
PRINT 'Creating schemas...'
:r schema/00-schemas.sql
PRINT 'Creating staging tables...'
:r schema/01-stg_{entity}_raw.sql
...
PRINT 'Creating stored procedures...'
:r procedures/usp_{entity}_promote.sql
PRINT 'Deployment complete.'
```

### ADF JSON Files

Location: `output/{migration-id}/adf/{type}/{name}.json`

Generate valid ADF JSON matching the format in `constitution/02-adf-standards.md`.

**Linked Services:** Use `AzureKeyVaultSecret` for all connection strings/keys.
**Datasets:** Parameterize `fileName` and `folderPath`.
**Pipelines:** Include all parameters, activities in correct order, retry policies, onFailure paths.
**Data Flows:** Include source projection, all derived columns from field mapping, lookups, sink with upsert key.
**Triggers:** Correct cron expression or storage event configuration.

### ARM Template

Location: `output/{migration-id}/adf/arm-template.json`

Generate a complete ARM template that deploys all linked services, datasets, data flows, pipelines, and triggers.
Generate `arm-template-parameters.json` with all environment-specific values as parameters.

### deploy.ps1

Location: `output/{migration-id}/adf/deploy.ps1`

```powershell
param(
    [Parameter(Mandatory)][string]$Environment,
    [Parameter(Mandatory)][string]$ResourceGroup,
    [Parameter(Mandatory)][string]$FactoryName
)

$ParameterFile = "arm-template-parameters-$Environment.json"

az datafactory pipeline create-run ...
# Full deployment script
```

### Test Data Files

Location: `output/{migration-id}/tests/data/`

Generate CSV/JSON test files matching the source file format exactly:
- `{entity}_test_happy_{date}.csv` — valid records covering all mapped fields
- `{entity}_test_partial_{date}.csv` — mix: 80% valid, 20% with each validation failure type
- `{entity}_test_allinvalid_{date}.csv` — all records violating required rules
- `{entity}_test_empty_{date}.csv` — header row only

### Test Scripts

Location: `output/{migration-id}/tests/scripts/`

**deposit-test-file.ps1** — PowerShell script to upload a test file to SFTP:
```powershell
param(
    [string]$SftpHost,
    [string]$SftpUser,
    [string]$KeyFile,
    [string]$LocalFile,
    [string]$RemotePath
)
# Use WinSCP .NET assembly or ssh/sftp CLI
```

**validate-results.sql** — Post-run validation queries:
```sql
-- Check audit log
SELECT * FROM audit.migration_run WHERE batch_date = '{batchDate}';
-- Check stage counts
SELECT validation_status, COUNT(*) FROM stg.{entity}_stage WHERE run_id = '{runId}' GROUP BY validation_status;
-- Check error details
SELECT * FROM err.{entity} WHERE run_id = '{runId}';
```

---

## Progress Tracking

After implementing each task, print a one-line progress update:
```
  ✓ {task-uid}: {task-title}
```

---

## Output

Print final summary:

```
IMPLEMENTATION COMPLETE — {migration-id}
════════════════════════════════════════
SQL Files   : {N} (schema DDL + SPs)
ADF Files   : {N} (LS + DS + DF + PL + TR + ARM + deploy.ps1)
Test Files  : {N} (data + scripts)
Total Files : {N}

Output Location: output/{migration-id}/

Next step: /document {migration-id}
```
