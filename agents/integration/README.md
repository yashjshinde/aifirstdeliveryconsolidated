# integration

> Merged event-driven + batch + data-migration agent. Owns the Azure side: Functions, Logic Apps, Service Bus, Event Grid, APIM, Event Hubs, ADF pipelines, SQL staging, SFTP file handling, bulk Dataverse loaders, IaC (Bicep), observability. Domain-scoped FDD/TDD/blueprint per [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md). Per [design/agents/integration.md](../../design/agents/integration.md).

## What

The integration agent produces specs, plans, FDD, TDD, blueprint, test-plan, and per-feature outputs for everything on the Azure-side integration surface. Single merged agent (per R10) covering three capability flavours: **event-driven** (Functions / Logic Apps / Service Bus / Event Grid / APIM), **batch** (ADF / SQL staging / SFTP / bulk Dataverse), and **data-migration** (source-target maps / cutover scripts / reconciliation). One constitution; the differences live in the 13 sub-area files. Domain-scoped FDD/TDD/blueprint accumulate feature-tagged sections + rows across features.

This agent does NOT own CE customisations (`d365-ce`), F&O X++/AOT/DMF (`d365-fo`), Power BI / CE SSRS (`reporting`), cross-agent architecture (`solution-architect`), effort estimation (`solution-estimate`), or ALM round-trip (`alm`). Power Automate cloud flows that are CE-bound stay in `d365-ce`; standalone cloud flows (Azure-side orchestration) live here.

## How

- **New integration feature** — `/spec --feature <slug> --source fresh` → `/review --approve` → `/plan` → `/clarify --approve` → `/task` → `/validate --approve` → `/implement` → `/document` → `/alm-extract`
- **Add to existing domain doc** — `/fdd` (or `/tdd` or `/blueprint`) appends a feature-tagged section to the domain doc + appends rows to table-shaped sections (interface catalogue / throughput targets / error-handling matrix). Idempotent: re-running on an unchanged feature is a no-op.
- **Cross-domain spec** — `/spec` → `/review --approve` flags CE / reporting / d365-fo concerns → `/split` emits handoffs to the affected agents (with skeleton specs in their feature folders).
- **Brownfield project** — when `project.config.yaml mode: brownfield`, `/impact` reads `agents/brownfield/_brownfield/inventory.json` to surface existing integration resources (Function Apps / Logic Apps / topics / pipelines) the new feature must coexist with.
- **From a handoff** — `/spec --source handoff` pre-fills the spec from `projects/{p}/_handoffs/<source-agent>-to-integration-<feature>.handoff.json` (FRs, ACs, NFR targets, cross-references already carried forward).

## Details

- **Constitution** *(agent-owned per [ADR-0010](../../design/adr/0010-templates-agent-owned.md))* — 13 files total (1 charter + 12 sub-area files):
  - [constitution/00-charter.md](constitution/00-charter.md) — purpose + in/out of scope + boundaries
  - [constitution/01-event-driven-patterns.md](constitution/01-event-driven-patterns.md) — pub/sub, request-reply, webhook, claim-check, saga
  - [constitution/02-batch-patterns.md](constitution/02-batch-patterns.md) — bulk-load, CDC, full-vs-delta, reconciliation
  - [constitution/03-azure-functions-standards.md](constitution/03-azure-functions-standards.md) — bindings, isolation, idempotency, retry, structured logging
  - [constitution/04-logic-apps-standards.md](constitution/04-logic-apps-standards.md) — Consumption vs Standard, error scopes, connection references
  - [constitution/05-service-bus-and-event-grid.md](constitution/05-service-bus-and-event-grid.md) — topology, message properties, DLQ handling, sessions
  - [constitution/06-apim-standards.md](constitution/06-apim-standards.md) — products / APIs / policies / backends, rate-limiting, OpenAPI as source-of-truth
  - [constitution/07-adf-standards.md](constitution/07-adf-standards.md) — pipeline patterns, parameterisation, IR selection, watermark/idempotency
  - [constitution/08-sql-staging-and-procs.md](constitution/08-sql-staging-and-procs.md) — `stg`/`dim`/`fact`/`int`/`audit` schema layout, idempotent stored procs
  - [constitution/09-sftp-and-file-handling.md](constitution/09-sftp-and-file-handling.md) — partner folder layout, polling vs event-driven, encoding, secret management
  - [constitution/10-bulk-dataverse.md](constitution/10-bulk-dataverse.md) — API selection by volume, alternate keys, `ExecuteMultipleRequest` patterns
  - [constitution/11-iac-and-deployment.md](constitution/11-iac-and-deployment.md) — Bicep modules, `naming.bicep` helper, what-if discipline, mandatory tags
  - [constitution/12-observability-and-nfr.md](constitution/12-observability-and-nfr.md) — structured log fields, custom metrics, alert thresholds, default NFR targets

- **Templates**:
  - [templates/spec.template.md](templates/spec.template.md), [plan.template.md](templates/plan.template.md), [blueprint.template.md](templates/blueprint.template.md)
  - [templates/fdd.template.md](templates/fdd.template.md) — domain FDD (sections per pattern instance + interface-catalogue / NFR / throughput / error-handling tables)
  - [templates/tdd.template.md](templates/tdd.template.md) — domain TDD (resource catalogue rows + per-resource structural sections incl. pseudocode)
  - [templates/test-plan/index.template.md](templates/test-plan/index.template.md), [suite.template.md](templates/test-plan/suite.template.md) — categories: contract / idempotency / retry+DLQ / performance / failover / security / observability
  - [templates/task.template.md](templates/task.template.md) — L4 task card with resource-kind prefix (`fn` / `la` / `sb` / `eg` / `apim` / `adf` / `sql` / `sftp` / `bicep` / `test` / `observability`)
  - [templates/review-report.template.md](templates/review-report.template.md)
  - [templates/checklists/](templates/checklists/) — 6 review checklists (consumed per [ADR-0001](../../design/adr/0001-review-scope-spec-only.md): spec-review by `/review`, plan-review by `/clarify`, fdd/tdd/blueprint/test-plan inline)

- **Commands**: [.claude/commands/](.claude/commands/) — base 17 (per `agents.yaml base-commands: true`; no extras in v1)

- **docScope**: `fdd: domain`, `tdd: domain`, `blueprint: domain` per [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md). One `projects/{p}/integration/{fdd,tdd,blueprint}.md` per project; grows with feature-tagged sections+rows.

- **Design doc**: [design/agents/integration.md](../../design/agents/integration.md)
- **Related ADRs**: [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md), [ADR-0001](../../design/adr/0001-review-scope-spec-only.md), [ADR-0010](../../design/adr/0010-templates-agent-owned.md)

## What this agent does NOT do

- Does NOT own CE entities / forms / plugins / Canvas apps / Power Pages — that's `d365-ce`.
- Does NOT own F&O X++ / AOT / DMF / batch jobs running in F&O — that's `d365-fo` (the `integration` agent owns Azure-side data movement INTO and OUT OF F&O, not F&O-internal batches).
- Does NOT own Power BI / CE SSRS / Power BI dataflows for reporting — that's `reporting`. The integration agent may build the **plumbing** (Synapse Link config, BYOD pipeline) that feeds reporting; reporting consumes the result.
- Does NOT enforce ALM round-trip / work-item push — that's `alm`. The integration agent emits `/alm-extract` handoffs for ALM to consume.
- Does NOT estimate effort — `solution-estimate` consumes integration's specs / plans during aggregation mode.

## Backlog this agent's content unblocks

- **bk-025** generic per-agent design refinement — closed with the Phase 6 build
- **bk-022** hook configurations for hard-gate enforcement — queued (cross-cutting; not integration-specific)
