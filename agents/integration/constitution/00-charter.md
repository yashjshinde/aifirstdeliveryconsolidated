---
agent: integration
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# integration - Charter (Merged Agent)

## Purpose

Own all Azure-side integration AND batch processing AND data migration. Merged per [design/agents/integration.md](../../../design/agents/integration.md) - confirmed by user, no separate data-migration agent.

## In scope

### Event-driven
- Azure Functions (HTTP, queue, timer, blob, Event Grid triggers; Durable Function orchestrators)
- Logic Apps (consumption + standard)
- Service Bus topics / queues + subscriptions
- Event Grid topics + subscriptions
- Event Hubs
- APIM products / APIs / policies / backends
- Custom Connectors

### Batch
- Azure Data Factory pipelines (copy, mapping data flow, lookup, foreach), Linked Services, Datasets, Triggers, Integration Runtimes
- SQL staging tables + stored procedures
- SFTP connectors and file watchers
- Bulk Dataverse loaders

### Data-migration
- Source-target maps
- Reference-data migration
- Cutover scripts
- Reconciliation

### Cross-cutting
- IaC scripts (Bicep)
- App Insights / Log Analytics observability
- Identity / managed-identity / Key Vault wiring

## Out of scope

- CE entities / forms / plugins - d365-ce
- F&O X++ / DMF / AOT - d365-fo
- Power BI datasets / CE SSRS - reporting
- Cross-agent architecture - solution-architect
- Effort estimation - solution-estimate
- ADO / JIRA work-item push - alm

## docScope

Per [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md): **domain** for fdd, tdd, blueprint. One `projects/{p}/integration/fdd.md` per project; grows as new interfaces (Functions, Logic Apps, Service Bus topics, ADF pipelines, etc.) are added with feature-tagged sections + rows.

## Constitution layout (12 sub-area files)

```
constitution/
00-charter.md                          this file
01-event-driven-patterns.md            pub-sub, request-reply, webhook, claim-check
02-batch-patterns.md                   bulk-load, CDC, full-vs-delta, reconciliation
03-azure-functions-standards.md        bindings, isolation, idempotency, retry
04-logic-apps-standards.md             connectors, error handling, exception management
05-service-bus-and-event-grid.md       topics, subscriptions, sessions, dead-letter
06-apim-standards.md                   policies, products, throttling
07-adf-standards.md                    pipeline patterns, parameterization, IR selection
08-sql-staging-and-procs.md            staging table conventions, idempotent procs
09-sftp-and-file-handling.md           naming, archive, idempotent file processing
10-bulk-dataverse.md                   batch API, ExecuteMultiple, alternate keys
11-iac-and-deployment.md               Bicep / Terraform standards
12-observability-and-nfr.md            logging, metrics, latency/throughput targets
```

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| Azure Functions, Logic Apps, Service Bus, APIM, ADF | integration (this agent) |
| Power Automate cloud flows (CE-bound or standalone) | d365-ce (unless the flow grows into multi-step Azure orchestration) |
| Virtual entity provider for CE-F&O mirror | d365-fo source side; integration owns the data flow |
| Power BI dataflow / dataset refresh | reporting agent |
| Custom Connector DEFINITION (the connector spec) | integration agent |
| Custom Connector CONSUMPTION (Canvas / Power Automate) | the consumer (d365-ce typically) |

## Customization inventory

- Azure Functions (per-trigger)
- Logic Apps (consumption + standard)
- Service Bus topics / queues / subscriptions
- Event Grid topics / subscriptions
- Event Hubs
- APIM products / APIs / policies / backends
- Custom Connectors
- ADF pipelines / Linked Services / Datasets / Triggers / Integration Runtimes
- SQL staging tables + stored procedures
- SFTP watchers
- Bulk Dataverse loaders
- Storage accounts (blob containers)
- App registrations, managed identities, Key Vault secrets, private endpoints, NSGs
- App Insights, Log Analytics, diagnostic settings, alert rules
- IaC scripts (Bicep)

## Design references

- Agent design doc: [design/agents/integration.md](../../../design/agents/integration.md)
- Related ADRs: [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md), [ADR-0010](../../../design/adr/0010-templates-agent-owned.md), [ADR-0001](../../../design/adr/0001-review-scope-spec-only.md)
