# Constitution — Azure Functions

## Function Design
- One function = one responsibility
- Function class name: `{Purpose}Function` (e.g., `ProcessOrderFunction`)
- Keep functions stateless — no in-memory state between invocations
- For stateful orchestration, use **Durable Functions** with explicit patterns (fan-out, chaining)

## Triggers
- Prefer event-driven triggers (Service Bus, Event Grid, HTTP) over timer polling
- Timer functions must be idempotent — they may fire twice in a failover
- HTTP-triggered functions must be exposed via APIM — never directly

## Error Handling
- Wrap all logic in try/catch at the function entry point
- Log exceptions with full stack trace via ILogger
- For Service Bus triggers: do not catch and swallow — let the SDK handle retry/DLQ
- For HTTP triggers: return structured error responses (ProblemDetails RFC 7807)

## Configuration
- All configuration via `IConfiguration` / environment variables — never hardcoded
- Secrets must come from Key Vault references — never stored in app settings directly
- Use `local.settings.json` for local dev — ensure it is in `.gitignore`

## Logging
- Use structured logging: `logger.LogInformation("Processing order {OrderId}", orderId)`
- Always log `correlationId` from the message/request at the start of each invocation
- Use Application Insights for all production telemetry
- Log levels: DEBUG (local only), INFO (business events), WARN (degraded state), ERROR (failures)

## Performance
- Avoid `async void` — always `async Task`
- Set function timeout explicitly in `host.json` — do not rely on defaults
- For CPU-bound work, use `Task.Run` to avoid blocking the async pipeline

## Isolation
- Use **Isolated worker process** model (not in-process) for all new functions
- Target .NET 8 or later
