# SQL Staging Standards

## Purpose

SQL Staging acts as the control plane for all migrations:
- Landing zone for raw inbound data (before validation)
- Transformation workspace (before target write)
- Error repository (records that failed validation)
- Audit log (run history, record counts, durations)

---

## Table Naming

| Table Purpose | Name Pattern | Example |
|---|---|---|
| Raw landing | `stg_{entity}_raw` | `stg_account_raw` |
| Validated stage | `stg_{entity}_stage` | `stg_account_stage` |
| Error table | `err_{entity}` | `err_account` |
| Audit log | `audit_migration_run` | (shared across all entities) |
| Lookup/Reference | `ref_{entity}` | `ref_country_codes` |

---

## Raw Table DDL Template

```sql
CREATE TABLE [stg].[{entity}_raw] (
    [raw_id]          BIGINT          IDENTITY(1,1) NOT NULL,
    [run_id]          NVARCHAR(50)    NOT NULL,
    [source_file]     NVARCHAR(500)   NULL,
    [source_row_num]  INT             NULL,
    [batch_date]      DATE            NOT NULL,
    [loaded_at]       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    -- source columns as NVARCHAR(MAX) to avoid load failures
    -- replace with typed versions in stage table
    CONSTRAINT [PK_stg_{entity}_raw] PRIMARY KEY CLUSTERED ([raw_id])
);
```

Rules:
- Raw table columns are always `NVARCHAR(MAX)` — type conversion happens in the stage promotion SP.
- `run_id` must match the ADF pipeline run ID for traceability.
- Never add indexes to raw tables (high-volume insert).

---

## Stage Table DDL Template

```sql
CREATE TABLE [stg].[{entity}_stage] (
    [stage_id]          BIGINT          IDENTITY(1,1) NOT NULL,
    [run_id]            NVARCHAR(50)    NOT NULL,
    [batch_date]        DATE            NOT NULL,
    [validation_status] NVARCHAR(20)    NOT NULL DEFAULT 'PENDING',  -- PENDING|VALID|INVALID
    [error_message]     NVARCHAR(2000)  NULL,
    [promoted_at]       DATETIME2       NULL,
    -- typed target columns
    CONSTRAINT [PK_stg_{entity}_stage] PRIMARY KEY CLUSTERED ([stage_id])
);

CREATE NONCLUSTERED INDEX [IX_stg_{entity}_stage_run]
    ON [stg].[{entity}_stage] ([run_id], [validation_status]);
```

---

## Error Table DDL Template

```sql
CREATE TABLE [err].[{entity}] (
    [error_id]          BIGINT          IDENTITY(1,1) NOT NULL,
    [run_id]            NVARCHAR(50)    NOT NULL,
    [batch_date]        DATE            NOT NULL,
    [source_row_num]    INT             NULL,
    [error_code]        NVARCHAR(50)    NULL,
    [error_message]     NVARCHAR(2000)  NOT NULL,
    [raw_data]          NVARCHAR(MAX)   NULL,
    [created_at]        DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [PK_err_{entity}] PRIMARY KEY CLUSTERED ([error_id])
);
```

---

## Audit Log Table

```sql
CREATE TABLE [audit].[migration_run] (
    [run_id]            NVARCHAR(50)    NOT NULL,
    [migration_name]    NVARCHAR(200)   NOT NULL,
    [direction]         NVARCHAR(50)    NOT NULL,
    [entity_name]       NVARCHAR(100)   NOT NULL,
    [batch_date]        DATE            NOT NULL,
    [started_at]        DATETIME2       NOT NULL,
    [completed_at]      DATETIME2       NULL,
    [status]            NVARCHAR(20)    NOT NULL DEFAULT 'RUNNING',  -- RUNNING|SUCCESS|PARTIAL|FAILED
    [total_records]     INT             NULL,
    [success_records]   INT             NULL,
    [error_records]     INT             NULL,
    [source_file]       NVARCHAR(500)   NULL,
    [target_info]       NVARCHAR(500)   NULL,
    CONSTRAINT [PK_audit_migration_run] PRIMARY KEY CLUSTERED ([run_id])
);
```

---

## Stored Procedure Standards

### Stage Promotion SP

```sql
CREATE OR ALTER PROCEDURE [stg].[usp_{entity}_promote]
    @RunId      NVARCHAR(50),
    @BatchDate  DATE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validate and insert into stage
        INSERT INTO [stg].[{entity}_stage] (run_id, batch_date, validation_status, ...)
        SELECT
            @RunId,
            @BatchDate,
            CASE
                WHEN {validation_condition} THEN 'VALID'
                ELSE 'INVALID'
            END,
            ...
        FROM [stg].[{entity}_raw]
        WHERE run_id = @RunId;

        -- 2. Route invalid records to error table
        INSERT INTO [err].[{entity}] (run_id, batch_date, error_code, error_message, raw_data, source_row_num)
        SELECT @RunId, @BatchDate, 'VALIDATION_FAILED', error_message, raw_data, source_row_num
        FROM [stg].[{entity}_stage]
        WHERE run_id = @RunId AND validation_status = 'INVALID';

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
```

Rules:
1. Every SP must have `SET NOCOUNT ON`.
2. Use `TRY/CATCH` with `THROW` — never swallow exceptions.
3. SPs must be idempotent: safe to re-run for same `@RunId`.
4. No dynamic SQL unless documented with justification.
5. All SPs in `[stg]` or `[err]` schema — never `[dbo]`.

---

## Schema Deployment

- All DDL scripts in `output/{migration}/sql/schema/`.
- All SP scripts in `output/{migration}/sql/procedures/`.
- Include `output/{migration}/sql/deploy.sql` master script that runs in order.
- Scripts must be idempotent: use `IF NOT EXISTS` / `CREATE OR ALTER`.
- No `DROP TABLE` in deployment scripts — use column additions / `ALTER TABLE`.
