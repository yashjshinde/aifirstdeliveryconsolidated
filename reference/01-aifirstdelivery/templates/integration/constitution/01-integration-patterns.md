# Constitution — Integration Patterns

## Pattern Selection Rules

| Scenario | Use | Do Not Use |
|---|---|---|
| Async fire-and-forget between systems | Service Bus Queue | HTTP direct call |
| Pub/sub fan-out to multiple consumers | Service Bus Topic | Queue |
| Request/response API over HTTP | APIM + Azure Function | Direct service URL |
| Long-running multi-step orchestration | Logic App (Standard) | Durable Function for simple flows |
| High-throughput event streaming | Event Hub | Service Bus |
| Scheduled batch processing | Timer-triggered Function | Logic App recurrence for heavy compute |
| Lightweight transformation/routing only | Logic App | Function (over-engineering) |
| Custom compute / complex business logic | Azure Function | Logic App expressions |

## Never Use
- Direct database connections across system boundaries — always use an API or message
- Polling loops with `sleep` — use event-driven triggers
- Synchronous HTTP calls with no timeout — always set explicit timeouts

## Naming Conventions
- Resource group: `rg-{project}-{environment}` (e.g., `rg-crm-integration-prod`)
- Service Bus namespace: `sb-{project}-{environment}`
- Function App: `func-{project}-{purpose}-{environment}`
- Logic App: `la-{project}-{purpose}-{environment}`
- APIM instance: `apim-{project}-{environment}`

## Environment Tagging
Every Azure resource must have tags:
- `environment`: dev | test | uat | prod
- `project`: {project-name}
- `owner`: {team-name}
- `cost-centre`: {code}
