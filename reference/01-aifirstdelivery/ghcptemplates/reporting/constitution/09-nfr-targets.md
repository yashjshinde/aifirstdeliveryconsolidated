# Non-Functional Requirements — Default Targets

These are the default NFR targets for reporting solutions. Override in a specific spec when project requirements differ.

## Performance

| Metric | Target | Notes |
|---|---|---|
| Interactive report page load (Import mode) | < 3 seconds | All visuals rendered; measured with default filter |
| Interactive report page load (DirectQuery) | < 5 seconds | Measured with a selective date filter applied |
| Paginated / SSRS report render | < 10 seconds | First page visible; measured with a typical parameter set |
| Dataset refresh (< 500k rows) | < 15 minutes | Full refresh; incremental refresh target < 5 minutes |
| Dataset refresh (> 500k rows) | < 60 minutes | Incremental refresh target < 10 minutes |
| DAX query response (single visual) | < 1 second | 95th percentile; measured in Performance Analyzer |
| Concurrent users (Power BI Service) | 100 users | Without degradation for Import mode |
| Concurrent users (DirectQuery) | 20 users | Before query queuing; aggregation tables required above this |

## Availability

| Metric | Target |
|---|---|
| Power BI Service availability | 99.9% (Microsoft SLA — inherit) |
| Scheduled refresh success rate | ≥ 99% over rolling 30-day window |
| SSRS report server availability | 99.5% (business hours) |
| Refresh failure alert response | Acknowledge within 2 hours; resolve within 4 hours |

## Data Freshness

| Data Type | Default Refresh Frequency | Notes |
|---|---|---|
| Operational dashboards (KPIs, pipeline) | Daily at 06:00 UTC | Increase to hourly if business requires |
| Financial / reconciliation reports | Daily at 02:00 UTC (post nightly close) | Must complete before business start |
| SSRS operational reports | Real-time (Fetch XML / SQL live) | No refresh schedule — live query |
| Historical / archival reports | Weekly | Off-peak; Sunday 01:00 UTC |

## Security

| Requirement | Target |
|---|---|
| RLS enforcement | 100% — no report with restricted data may be published without RLS |
| Sensitivity label application | 100% — all datasets and PBIX files in PROD must have a label |
| Service principal authentication | Mandatory for all scheduled refresh and embedding |
| Guest user access review | Quarterly |

## Scalability

| Metric | Target |
|---|---|
| Model row count growth (Import) | Design for 3× current volume without Premium upgrade |
| Dataset size | < 1 GB (shared capacity); < 10 GB (Premium/Fabric) |
| Report count per workspace | < 100 published reports per workspace |
