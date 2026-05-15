---
agent: integration
sub-area: batch
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Batch Integration Patterns

## Pattern catalogue

| Pattern | When to use | Azure services |
|---|---|---|
| **Bulk Load (full)** | One-time / periodic full refresh of a target | ADF copy + bulk Dataverse OR DMF |
| **Bulk Load (delta)** | Incremental sync; only new/changed since last run | ADF + watermark column / CDC source |
| **CDC (Change Data Capture)** | Near-realtime delta via source CDC feature | SQL CDC + ADF; Dataverse Synapse Link |
| **File-based ingest** | Source drops files; we pick up and process | SFTP -> blob -> ADF -> staging -> target |
| **Staging-table pattern** | Decouple raw ingest from business validation | SQL staging tables + idempotent procs |
| **Reconciliation** | Verify source-target row counts + checksums | ADF lookup + activity; alert on mismatch |
| **Cutover** | One-shot migration at go-live | Sequenced ADF pipelines + sign-off gates |

## Idempotency requirement

Every batch pattern instance MUST be idempotent (re-running with the same input produces the same target state). Patterns to achieve idempotency:

- Hash-based upsert (compute hash, skip if unchanged)
- Idempotent stored procs (use MERGE / UPSERT semantics)
- Per-record outcome log (insert / update / skip / fail)

## Failure handling

Every batch pipeline has:

- **Dead-letter** target for unrecoverable rows
- **Retry policy** (typically exponential up to 4 attempts)
- **Alert** on overall pipeline failure (App Insights + email/Teams via Logic App)
- **Reconciliation report** generated post-run (row counts; sample failed rows; checksum)

## Documentation per batch flow

Per flow in the integration FDD: source, target, cadence, expected volume, error path, reconciliation strategy, observability dashboards.

## See also

- [07-adf-standards.md](07-adf-standards.md) for ADF pipeline conventions
- [08-sql-staging-and-procs.md](08-sql-staging-and-procs.md) for staging-table conventions
- [10-bulk-dataverse.md](10-bulk-dataverse.md) for bulk Dataverse loader conventions
