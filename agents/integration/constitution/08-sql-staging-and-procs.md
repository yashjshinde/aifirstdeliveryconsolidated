---
agent: integration
sub-area: sql-staging-and-procs
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# SQL Staging Tables and Stored Procedure Standards

## Schema layout

| Schema | Purpose |
|---|---|
| `stg` | Staging — raw incoming data; one table per source extract |
| `dim` / `fact` | Conformed warehouse layer (when reporting integrates) |
| `int` | Integration mapping tables (lookups, codes, watermarks) |
| `audit` | Run logs (`AdfWatermark`, `PipelineRunLog`, `RowCountAudit`) |

## Staging table conventions

For every source-system entity, a staging table:

```sql
CREATE TABLE stg.Customer (
  -- Surrogate
  StgKey BIGINT IDENTITY(1,1) NOT NULL,
  -- Business
  SourceCustomerId NVARCHAR(64) NOT NULL,
  CustomerName NVARCHAR(255) NOT NULL,
  Email NVARCHAR(255) NULL,
  -- ...source columns
  -- Audit
  LoadRunId UNIQUEIDENTIFIER NOT NULL,
  LoadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  SourceSystem NVARCHAR(32) NOT NULL,
  -- Constraints
  CONSTRAINT PK_stg_Customer PRIMARY KEY (StgKey)
);
CREATE INDEX IX_stg_Customer_LoadRunId ON stg.Customer (LoadRunId);
CREATE INDEX IX_stg_Customer_SourceId ON stg.Customer (SourceCustomerId);
```

Notes:
- `LoadRunId` ties every row to a single ADF pipeline run for re-runnability
- One pipeline run replaces (delete + insert) its own `LoadRunId` partition

## Stored procedure conventions

- Procedure names: `usp_{Schema}_{Action}_{Target}` (e.g., `usp_stg_LoadCustomer`, `usp_int_UpsertCustomer`)
- Always wrap mutations in a transaction with `TRY ... CATCH`
- Always `SET XACT_ABORT ON`
- Always check for the new-version idempotency token

```sql
CREATE PROCEDURE usp_int_UpsertCustomer
  @LoadRunId UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRAN;
    -- 1. Validate inputs / load run is in expected state
    -- 2. MERGE stg.Customer → dim.Customer
    -- 3. Log row counts to audit.RowCountAudit
    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    INSERT audit.PipelineRunLog (LoadRunId, Step, Severity, Message)
    VALUES (@LoadRunId, 'usp_int_UpsertCustomer', 'ERROR', ERROR_MESSAGE());
    THROW;
  END CATCH;
END
```

## Idempotency

- Procs MUST be safe to re-run with the same `LoadRunId` — they `DELETE FROM ... WHERE LoadRunId = @x` before insert
- Watermarks updated only after the proc succeeds (transactional with the data load)

## Indexing strategy

- Cluster on the most common JOIN / WHERE column (usually a surrogate key or business id)
- Non-clustered index on `LoadRunId` for re-run cleanup
- Filtered indexes for soft-deleted (`WHERE IsDeleted = 0`) hot paths

## See also

- [02-batch-patterns.md](02-batch-patterns.md)
- [07-adf-standards.md](07-adf-standards.md)
