# Constitution — Error Handling and Resilience

## Retry Policy (all components)
- Transient errors (429, 503, network timeout): retry with exponential backoff
- Default: 3 retries, initial delay 2s, max delay 30s, jitter enabled
- Non-transient errors (400, 401, 404): do not retry — fail fast

## Idempotency
- Every message consumer and HTTP handler must be idempotent
- Use a correlation/message ID to detect and skip duplicate processing
- Store processed IDs with a TTL at least as long as the retry window

## Dead-Letter Handling
- Every queue/topic subscription must have a DLQ handler or alert
- DLQ messages must be logged with: messageId, correlationId, reason, original payload
- DLQ messages must trigger an alert to the operations team within 5 minutes

## Circuit Breaker
- Implement circuit breaker for all outbound HTTP calls to external systems
- Open circuit after 5 consecutive failures; half-open after 30 seconds
- Use Polly for .NET implementations

## Timeout Rules
- All outbound HTTP calls: explicit timeout of 30s (never rely on default infinite)
- Service Bus operations: 60s timeout
- Database operations: 15s timeout
- Document timeout values in the technical design

## Error Response Shape (HTTP APIs)
Follow RFC 7807 Problem Details:
```json
{
  "type": "https://errors.{domain}.com/{error-code}",
  "title": "Human-readable title",
  "status": 400,
  "detail": "Specific detail about this instance",
  "instance": "/api/v1/accounts/123",
  "correlationId": "{guid}"
}
```

## Alerting
- Alert on: DLQ count > 0, error rate > threshold, function failures, Logic App failures
- All alerts must have a runbook link in the alert description
- On-call rotation must be notified for P1/P2 issues within 5 minutes
