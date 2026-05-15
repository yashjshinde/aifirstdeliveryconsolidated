# Constitution — Logic Apps

## Version
- Use **Logic Apps Standard** (single-tenant) for new workflows — not Consumption
- Standard allows local development, source control, and VNET integration

## Workflow Design
- One workflow = one business process
- Workflow name: `{purpose}-workflow` (e.g., `account-sync-workflow`, `invoice-approval-workflow`)
- Avoid deeply nested conditions — use child workflows or Functions for complex logic
- Maximum 3 levels of nesting before extracting to a sub-workflow or Function

## Error Handling
- Set `runAfter` with `Failed`, `TimedOut`, `Skipped` for every critical action
- Use a dedicated `error-handler` scope for cleanup and alerting
- Configure retry policies explicitly on all connector actions — do not use defaults
- Recommended retry: exponential backoff, max 4 retries

## Connectors
- Use **built-in connectors** over managed connectors where available (lower latency, no egress)
- Service Bus, HTTP, Azure Functions: use built-in
- For Dataverse/D365: use the managed Dataverse connector
- Never use deprecated connector versions — always select the latest

## Expressions
- Use `@variables()` for values reused more than once
- Prefer `@body()` and `@outputs()` over long expression chains
- Document complex expressions with a comment action above them

## Source Control
- Logic App Standard workflows stored as JSON in git
- Use `azd` or Bicep for IaC deployment — never deploy via portal clicks to non-dev environments

## Security
- Use Managed Identity for all connector authentication
- Enable HTTPS-only — no HTTP endpoints
- Restrict inbound HTTP triggers with SAS token or IP allowlist
