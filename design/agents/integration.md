---
title: integration — merged event-driven + batch + data-migration
status: live
adr-refs: [ADR-0006, ADR-0001]
last-reviewed: 2026-05-14
owner: design
---

# integration — merged agent

> Single agent covering **event-driven** and **batch** integration plus **data-migration** capability. No separate data-migration sub-agent.

## Scope

- **Event-driven:** Azure Functions (HTTP / queue / timer / blob / Event Grid triggers), Logic Apps (consumption + standard), Service Bus topics / queues / subscriptions, Event Grid topics + subscriptions, APIM products / APIs / policies, Custom Connectors
- **Batch:** Azure Data Factory pipelines (copy, mapping data flow, lookup, foreach), SQL staging tables + stored procedures, SFTP file watchers, bulk Dataverse loaders
- **Data-migration:** source-target maps, reference-data migration, cutover scripts, reconciliation
- **Cross-cutting:** IaC scripts (Bicep), App Insights / Log Analytics observability, identity / managed-identity / Key Vault wiring

## docScope

Per [ADR-0006](../adr/0006-doc-scope-domain-vs-feature.md): **domain** for `fdd`, `tdd`, `blueprint`. One `projects/{p}/integration/fdd.md` per project, growing as new interfaces accumulate. Same additive-section semantics as d365-ce (see `/fdd` flow in [agents/d365-ce.md](d365-ce.md)).

Structural sections (a new interface, a new pattern instance) get a `feature-id`-tagged sub-section. Table-shaped sections (interface catalogue, throughput targets, error-handling matrix) get appended rows with a `feature-id` column.

## Sub-domains in constitution

```
agents/integration/constitution/
├── 00-charter.md
├── 01-event-driven-patterns.md        # pub-sub, request-reply, webhook, claim-check
├── 02-batch-patterns.md               # bulk-load, CDC, full-vs-delta, reconciliation
├── 03-azure-functions-standards.md    # bindings, isolation, idempotency, retry
├── 04-logic-apps-standards.md         # connectors, error handling, exception management
├── 05-service-bus-and-event-grid.md   # topics, subscriptions, sessions, dead-letter
├── 06-apim-standards.md               # policies, products, throttling
├── 07-adf-standards.md                # pipeline patterns, parameterization, IR selection
├── 08-sql-staging-and-procs.md        # staging table conventions, idempotent procs
├── 09-sftp-and-file-handling.md       # naming, archive, idempotent file processing
├── 10-bulk-dataverse.md               # batch API, ExecuteMultiple, alternate keys
├── 11-iac-and-deployment.md           # Bicep / Terraform standards
└── 12-observability-and-nfr.md        # logging, metrics, latency/throughput targets
```

## Customization inventory

- Azure Functions (HTTP, queue, timer, blob, Event Grid triggers; Durable Function orchestrators)
- Logic Apps (consumption + standard)
- Service Bus topics / queues + subscriptions
- Event Grid topics, subscriptions
- Event Hubs
- APIM products / APIs / policies / backends
- Custom Connectors
- ADF pipelines (copy, mapping data flow, lookup, foreach), Linked Services, Datasets, Triggers, Integration Runtimes
- SQL staging tables + stored procedures
- SFTP connectors and file watchers
- Bulk Dataverse loaders
- Storage accounts (blob containers)
- App registrations, managed identities, Key Vault secrets, private endpoints, NSGs
- Application Insights, Log Analytics, diagnostic settings, alert rules
- Patterns: SFTP → Dataverse, Dataverse → SFTP, SQL → Dataverse, Dataverse → SQL → reporting, file → staging → F&O DMF
- IaC scripts (Bicep)

## Templates

Following the standard agent skeleton ([02-agent-skeleton.md](../02-agent-skeleton.md)):

```
agents/integration/templates/
├── fdd.template.md                   # Domain FDD; sections per integration pattern
├── tdd.template.md                   # Per-function/flow technical details
├── blueprint.template.md             # System context + sequence diagrams per pattern
├── test-plan/{index, suite}.template.md
├── task.template.md
├── spec.template.md
├── plan.template.md
├── review-report.template.md
└── checklists/                       # Six checklists; consumed per ADR-0001
    ├── spec-review.checklist.md
    ├── plan-review.checklist.md
    ├── fdd-review.checklist.md
    ├── tdd-review.checklist.md
    ├── blueprint-review.checklist.md
    └── test-plan-review.checklist.md
```

Review checklists are authored fresh (no PORTED source). Categories follow Azure Architecture Center patterns: throughput sizing, retry strategy, dead-letter handling, idempotency, observability coverage, secret management.

## Commands

Base 17. No integration-specific extras in v1.

## Process flow

Same as the standard agent (`/spec → /review → /split? → /impact? → /fdd /test-plan /plan in parallel → /clarify → /tdd /blueprint /task in parallel → /validate → /implement → /document → /alm-extract`), but:

- **`/blueprint`** produces integration architecture diagrams (system context, sequence diagrams per pattern, dataflow diagrams for ADF).
- **`/fdd`** assembles the domain FDD with structural sections per pattern type (one section per Azure Function / Logic App / ADF pipeline) and table-shaped sections (interface catalogue, throughput matrix, error-handling rules).

## Work products

- `projects/{p}/integration/fdd.md` *(domain — grows with feature-tagged sections + rows)*
- `projects/{p}/integration/tdd.md` *(domain)*
- `projects/{p}/integration/blueprint.md` *(domain — system context, sequence diagrams)*
- `projects/{p}/integration/features/{f}/spec.md`, `plan.md`, `test-plan/`, `tasks/`, `reviews/spec-review.md`, `output/` *(IaC scripts, function code, ADF JSON, etc.)*

## Why merged (no separate data-migration agent)

Data migration is a *capability* used during specific delivery phases (initial cutover, post-go-live reconciliations) but the work products (SQL staging procs, ADF pipelines, SFTP file flows, bulk Dataverse loaders) are the same artefacts integration produces continuously. Splitting them would duplicate the constitution and templates for no delivery benefit. Confirmed during platform design.

## References

- ADRs: [ADR-0006](../adr/0006-doc-scope-domain-vs-feature.md), [ADR-0001](../adr/0001-review-scope-spec-only.md), [ADR-0010](../adr/0010-templates-agent-owned.md)
- Cross-references: [03-agent-inventory.md](../03-agent-inventory.md), [09-orchestration-patterns.md](../09-orchestration-patterns.md) (cross-agent dependencies for CE handoffs)
- Backlog: `bk-025` (per-agent generic)
