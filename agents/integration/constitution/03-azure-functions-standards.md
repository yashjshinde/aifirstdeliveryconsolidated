---
agent: integration
sub-area: azure-functions
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Azure Functions Standards

## Hosting model

- **Isolated process model** (.NET 8 / .NET 9) is the default. In-process model is forbidden for new code.
- **Plan selection**: Consumption for sporadic load; Premium for cold-start-sensitive HTTP APIs; Dedicated (App Service) only when sharing a plan with other paying-by-VM workloads.

## Trigger conventions

| Trigger | When to use | Required bindings |
|---|---|---|
| HTTP | External request → response under 230 seconds | `HttpTrigger` with explicit auth level (never `Anonymous` in PROD without APIM in front) |
| Queue (Service Bus / Storage) | Decoupled background work | Idempotent handler; max delivery count + dead-letter queue |
| Timer | Scheduled work | CRON expression in `function.json`; lock taken via Azure Storage / blob lease |
| Blob | Reaction to file landing | `BlobTrigger` over Event Grid (NOT polling) |
| Event Grid | Subscribe to platform / custom events | Schema validation in first 5 lines of the handler |

## Idempotency

Every queue / event / timer trigger MUST be idempotent:
1. Compute a deterministic message id (use `messageId` if present; else hash payload).
2. Check `MessageProcessed` table / Redis cache before processing.
3. Insert into `MessageProcessed` only after side-effect commits.

## Retry strategy

- Use the built-in retry policy from `host.json` — exponential backoff, max 5 attempts.
- After max retries → dead-letter queue + alert (Application Insights metric `MessagesDeadLettered > 0`).
- Transient errors only — wrap business-logic errors in `NonRetryableException`.

## Structured logging

Per [12-observability-and-nfr.md](12-observability-and-nfr.md):
- One `ILogger.LogInformation` at function start with input correlation id
- One `ILogger.LogInformation` at function success with elapsed ms
- `ILogger.LogError` on exception (NEVER `ex.ToString()`; pass `ex` as second arg for AI capture)
- Avoid PII in log messages

## Secrets

- Secrets in Key Vault; surface to Function App via Managed Identity + Key Vault reference (no `local.settings.json` in source).
- App settings prefixed `KV_` indicate Key Vault references.

## Function-app project layout

```
projects/{p}/integration/features/{f}/output/functions/
├── {function-app-name}/
│   ├── host.json
│   ├── {FunctionName}/
│   │   ├── function.json
│   │   ├── run.cs   (or run.ts for Node)
│   │   └── README.md (purpose + bindings)
│   └── {SharedLib}/
│       └── ...
```

## See also

- [05-service-bus-and-event-grid.md](05-service-bus-and-event-grid.md)
- [12-observability-and-nfr.md](12-observability-and-nfr.md)
