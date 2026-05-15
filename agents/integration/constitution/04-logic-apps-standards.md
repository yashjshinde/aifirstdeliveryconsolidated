---
agent: integration
sub-area: logic-apps
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Logic Apps Standards

## Consumption vs Standard

- **Consumption** for low-to-moderate per-second workflows with simple state.
- **Standard** (single-tenant) for stateful workflows, custom code (.NET extensions), or VNet integration.

Default to Consumption unless a hard requirement forces Standard.

## Naming

- Workflow names: `la-{integration-name}-{purpose}` (e.g., `la-customer-sync-create`)
- Action names: PascalCase, verb-first (`SendEmail`, `LookupCustomer`, `TransformToCanonical`)
- Variable names: camelCase

## Error handling

Every Logic App **must** include a top-level Scope arrangement:
1. **Try Scope** — main logic
2. **Catch Scope** — `runAfter: { Try: [Failed, TimedOut, Skipped] }`
   - Compose error envelope (run id, action name, error message, severity)
   - Send to Service Bus dead-letter topic + record in Log Analytics
3. **Finally Scope** — `runAfter: { Try: [Succeeded, Failed, TimedOut, Skipped] }`
   - Persist outcome to Dataverse `flow-run-log` (or equivalent)
   - Update correlation tracking

## Connections + connection references

- Connections authenticated via Managed Identity wherever possible.
- Connection references registered in `connections.json` deployed via ARM/Bicep — never click-created.

## Parameter strategy

- All environment-specific values in `parameters.json` keyed by env (DEV / TEST / UAT / PROD).
- App settings on Standard plans for secrets-by-reference.

## Idempotency

- HTTP triggers MUST validate an idempotency token in the header (`X-Idempotency-Key`) and reject duplicates.
- Service Bus triggers MUST de-duplicate by `messageId`.

## Custom code (Standard only)

- Author `.csx` only where Logic App connector composition would create unreadable mega-actions (>30 actions).
- Each custom-code file ≤ 200 lines.

## See also

- [03-azure-functions-standards.md](03-azure-functions-standards.md) (when to choose Functions instead)
- [05-service-bus-and-event-grid.md](05-service-bus-and-event-grid.md)
- [12-observability-and-nfr.md](12-observability-and-nfr.md)
