---
agent: integration
sub-area: event-driven
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Event-Driven Integration Patterns

## Pattern catalogue

| Pattern | When to use | Azure services |
|---|---|---|
| **Pub/Sub** | One producer, many consumers; loose coupling | Service Bus topic + subscriptions; Event Grid |
| **Request/Reply (sync)** | Synchronous query needing a response | APIM + Azure Function HTTP / Logic App; reply queue |
| **Request/Reply (async)** | Long-running operation; correlation by ID | Service Bus queue with correlation id + reply queue |
| **Webhook** | External system pushes notifications to us | Function HTTP trigger; APIM endpoint; Event Grid subscription |
| **Claim-Check** | Large payload; pass a reference instead of the payload | Blob storage + Service Bus / Event Grid notification |
| **Saga / Orchestration** | Long-running multi-step workflow with compensation | Durable Functions; Logic App Standard |
| **Fan-out / Fan-in** | Parallel processing of many work items | Durable Function fan-out; Service Bus topic with multiple subscriptions |

## Selection rules

- **Service Bus** for guaranteed delivery, FIFO, transactions, sessions
- **Event Grid** for fire-and-forget notifications at high volume
- **Event Hubs** for high-throughput streaming (telemetry, IoT, log aggregation)
- **APIM** when external consumers need rate-limiting, transformation, or product/subscription gating

## Documentation per pattern instance

Per pattern instance in the integration FDD §4: pattern name, source, target, payload shape, error path, idempotency, observability.

## See also

- [02-batch-patterns.md](02-batch-patterns.md) for non-event-driven flows
- [03-azure-functions-standards.md](03-azure-functions-standards.md) / [04-logic-apps-standards.md](04-logic-apps-standards.md) / [05-service-bus-and-event-grid.md](05-service-bus-and-event-grid.md) for per-service conventions
