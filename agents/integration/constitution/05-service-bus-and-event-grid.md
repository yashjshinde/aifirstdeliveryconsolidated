---
agent: integration
sub-area: service-bus-and-event-grid
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Service Bus and Event Grid Standards

## Service Bus topology

- **Namespace tier**:
  - Standard for ≤ 1k messages/sec and message size ≤ 256 KB
  - Premium when message size > 256 KB (claim-check pattern preferred regardless), VNet integration, or geo-DR is required
- **Naming**:
  - Topic / queue: `sb-{domain}-{event-or-command}-{verb}` (e.g., `sb-customer-events-created`)
  - Subscription: `sub-{consumer-application}` (e.g., `sub-billing-svc`)

## Service Bus message properties

- `messageId` — set explicitly (deterministic), used for idempotent de-duplication
- `sessionId` — set when ordered delivery within a partition key is required
- `correlationId` — propagate across the entire flow chain
- `contentType: application/json`
- Custom properties: `eventType`, `eventVersion`, `producer`

## Subscriptions + rules

- Use SQL filters on subscriptions when consumers only need a subset (`eventType = 'CustomerCreated'`).
- Avoid OR'd rules — split into multiple subscriptions for clarity.
- Default `Auto Delete on Idle` to **never** unless the subscription is genuinely throwaway.

## Dead-letter handling

- **Max delivery count**: 5 (let retry handle transient; dead-letter exposes a real bug)
- DLQ poll: every 15 min, alert if `Count > 0`
- Reactivation: human-in-the-loop via a Logic App "Resubmit DLQ" flow that requires approval

## Sessions

When ordering matters within a partition (e.g., per-customer events): enable Sessions on the queue/subscription. Receivers MUST use the session-receive API; the regular receive will starve session-locked messages.

## Event Grid topology

- **Custom topics** for domain events that consumers fan out from
- **System topics** for Azure platform events (blob created, resource changed)
- **Domains** for multi-tenant scenarios (each tenant a topic under the domain)

## Event Grid event envelope

Follow the CloudEvents 1.0 schema:
```json
{
  "specversion": "1.0",
  "type": "com.acme.customer.created",
  "source": "/acme/customer-svc",
  "id": "{guid}",
  "time": "{iso8601}",
  "datacontenttype": "application/json",
  "data": { ... }
}
```

## Idempotency

- `id` field is the de-duplication key; consumers MUST track seen IDs for at least `lockDuration * maxRetries * 2`.

## See also

- [01-event-driven-patterns.md](01-event-driven-patterns.md)
- [03-azure-functions-standards.md § Idempotency](03-azure-functions-standards.md)
- [12-observability-and-nfr.md](12-observability-and-nfr.md)
