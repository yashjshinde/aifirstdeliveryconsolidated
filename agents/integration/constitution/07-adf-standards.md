---
agent: integration
sub-area: adf
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Azure Data Factory (ADF) Standards

## Naming

- Factory: `adf-{env}-{purpose}` (e.g., `adf-prod-d365-warehouse`)
- Pipeline: `pl-{source}-to-{target}-{action}` (e.g., `pl-sftp-to-staging-load`)
- Linked Service: `ls-{kind}-{name}` (e.g., `ls-blob-storage`, `ls-dataverse-prod`)
- Dataset: `ds-{linked-service}-{entity}` (e.g., `ds-blob-customer-csv`)
- Trigger: `trg-{frequency}-{purpose}` (e.g., `trg-hourly-customer-sync`)

## Pipeline patterns

| Pattern | When |
|---|---|
| **Copy** | Direct point-to-point with no transformation; uses Copy activity |
| **Mapping Data Flow** | Row-level transformation, joins, lookups; auto-scales Spark cluster |
| **Lookup + ForEach** | Driving table of work items; iterate sequentially or in parallel |
| **Stored Procedure** | Push compute to SQL; use when set-based ops outperform Data Flow |
| **Switch** | Conditional branching by source-system kind |

## Parameterisation

- Every pipeline accepts `runId`, `loadType` (`full` | `delta`), `tenantId`, `correlationId` as pipeline parameters.
- Linked Service connection strings parameterised at factory level (env-specific).
- Avoid baked-in dataset names — use dataset parameters.

## Integration Runtime selection

- **Azure IR**: SaaS-to-SaaS pipelines (Blob ↔ Dataverse ↔ Synapse ↔ ADLS Gen2)
- **Self-hosted IR**: On-prem sources (SQL Server on-prem, file shares, SAP behind firewall)
- **Azure-SSIS IR**: Lift-and-shift SSIS packages only — new development should not target SSIS

## Idempotency

- Source watermarks recorded in `dbo.AdfWatermark(source_table, watermark_value, updated_at)`
- Pipelines re-runnable: a re-run with the same `runId` overwrites the corresponding staging partition

## Logging + monitoring

- Custom `LogPipelineRun` Stored Proc invoked at pipeline start (`Pre-Run`) and end (`Post-Run` / `On-Failure`)
- Diagnostic settings stream activity runs to Log Analytics
- Alert: `pipeline failed AND not "Cancelled"` within 5 min

## Mapping Data Flow rules

- Skip-on-error MUST be explicit per source (not on by default)
- Use sink-staging for Dataverse / SQL targets when volume > 100k rows
- Watermark column referenced via parameter, not hardcoded

## See also

- [02-batch-patterns.md](02-batch-patterns.md)
- [08-sql-staging-and-procs.md](08-sql-staging-and-procs.md)
- [12-observability-and-nfr.md](12-observability-and-nfr.md)
