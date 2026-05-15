# Constitution — Azure Service Bus

## Topology
- Use **Topics** when more than one consumer reads the same message
- Use **Queues** for point-to-point (single consumer)
- Never put multiple unrelated message types on the same queue/topic

## Message Schema
- All messages must include a header envelope:
  ```json
  {
    "messageId": "{guid}",
    "correlationId": "{guid}",
    "source": "{system-name}",
    "eventType": "{domain}.{entity}.{action}",
    "timestamp": "{ISO8601}",
    "schemaVersion": "1.0",
    "payload": { }
  }
  ```
- `eventType` format: `crm.account.created`, `erp.invoice.updated`
- Never put binary data directly in the message body — use a storage reference

## Retry and Dead-Letter
- Configure **max delivery count** explicitly — do not use the default (10)
- Dead-letter queue must be monitored — always create an alert on DLQ message count > 0
- Messages in DLQ must be logged with `DeadLetterReason` and `DeadLetterErrorDescription`

## Sessions
- Use **message sessions** when ordering within a partition is required
- Set `SessionId` to the entity identifier (e.g., AccountId) for ordered processing

## Security
- Use **Managed Identity** for all Service Bus access — no connection strings in code or config
- Grant minimum role: `Azure Service Bus Data Sender` or `Azure Service Bus Data Receiver`
- Never use the root namespace connection string

## Idempotency
- Consumers must be idempotent — a message may be delivered more than once
- Use `MessageId` for deduplication — store processed IDs in a cache or database
