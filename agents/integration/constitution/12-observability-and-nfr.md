---
agent: integration
sub-area: observability-and-nfr
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Observability and NFR Targets

## Logging architecture

- **Application Insights** per workload (one per function-app / Logic App standard / APIM instance)
- AI workspace points at a single per-environment **Log Analytics** workspace
- Sampling: adaptive at 100 telemetry items / sec ingest target

## Structured log fields (mandatory)

Every log statement carries at least:

| Field | Type | Example |
|---|---|---|
| `correlationId` | string (guid) | propagated from incoming request / message |
| `tenantId` | string | from request header / message property |
| `workload` | string | `customer-sync` |
| `flow` | string | function / Logic App / pipeline name |
| `severity` | enum | `INFO` / `WARN` / `ERROR` / `CRITICAL` |
| `elapsedMs` | number (success path) | for latency measurement |

## Metrics

Custom metrics emitted via App Insights:

- `MessagesProcessedTotal` — counter; success / failure dimension
- `MessageProcessingDurationMs` — histogram
- `RowsLoaded` (for ADF pipelines) — gauge
- `DlqDepth` — gauge sampled every 5 min
- `ApiCalls` — counter with `consumer` dimension

## Alerts

Per workload:

| Metric | Threshold | Severity | Action |
|---|---|---|---|
| `DlqDepth > 0` for 5 min | 1 | High | Page on-call |
| `MessageProcessingDurationMs P95 > 5 s` for 15 min | 5 | Medium | Email channel |
| `MessagesProcessedTotal{outcome=failure} / total > 5%` for 10 min | 5 | Medium | Email channel |
| Function App `5XX > 1%` for 5 min | 1 | High | Page on-call |

## NFR targets (default — override per project)

| Metric | Target |
|---|---|
| HTTP API P95 latency | < 500 ms (excl. cold start) |
| HTTP API P99 latency | < 1500 ms |
| Async event end-to-end P95 | < 2 s (claim-check excluded) |
| Batch pipeline throughput | ≥ 50k rows / minute (1 IR DIU minimum) |
| Availability | 99.9% per workload (excludes planned maintenance) |
| RTO | 1 h |
| RPO | 5 min (event), 1 h (batch) |

These targets land in the integration FDD §5 NFR mapping per feature. Override in `project.config.yaml integration.nfr.*` as needed.

## Distributed tracing

- W3C Trace Context propagation enabled across HTTP + Service Bus + Logic Apps
- Function host configured for native AI tracking; sample rate set on the AI workspace

## See also

- [03-azure-functions-standards.md § Structured logging](03-azure-functions-standards.md)
- [05-service-bus-and-event-grid.md § Idempotency](05-service-bus-and-event-grid.md)
- [11-iac-and-deployment.md § Tagging](11-iac-and-deployment.md)
