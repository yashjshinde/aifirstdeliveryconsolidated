---
title: brownfield — reverse-engineering existing solutions
status: live
adr-refs: [ADR-0007, ADR-0008]
last-reviewed: 2026-05-14
owner: design
---

# brownfield — standalone agent

> Reverse-engineering and documentation of an **existing** solution. **One standalone agent** — not per-domain. Domain agents (CE / F&O / Integration / Reporting) read its output via MCP when `project.config.yaml mode: brownfield`.

## Operating model

### Auto-mode (no per-doc human review)

Brownfield is the **only agent without `/review` for any doc** ([ADR-0007](../adr/0007-brownfield-auto-mode-self-healing.md)). Volume is too high (hundreds of plugins, flows, entities, JS files) for per-doc human review. The agent owns its own quality gate:

- Validators are **machine code** in MCP `brownfield_validators/` — deterministic, fast, versioned, unit-tested
- Each doc-generation step runs validators inline → if fail, **agent re-attempts** with a focused fix prompt (max N=3 retries)
- When the agent truly can't recover, it logs a **typed gap entry** in `gap-log.json`
- The user reviews the **gap log** (one structured artefact), not the generated docs

### Pattern + binding architecture ([ADR-0008](../adr/0008-brownfield-patterns-and-bindings.md))

Real D365 / Power Platform surface is **~140+ artifact types** across CE / FO / Integration / Reporting. The agent uses:

- **9 reusable patterns** (one Markdown template per shape family)
- **~185 small bindings** (one ~30-line YAML per artifact type) wiring each artifact to a pattern + extractors + cross-refs + validators + output path + optional module-gate

## Eight commands (replaces the base 17)

```yaml
- name: brownfield
  base-commands: false
  extra-commands: [prepare, scan, document, fdd, tdd, blueprint, generate, index, handoff]
```

| Command | Purpose |
|---|---|
| `/prepare` | Validate inputs in `_brownfield/input/`; check for required source files |
| `/scan` | Build `inventory.json` enumerating every artifact (uses scan templates per platform) |
| `/document` | Render per-artifact docs from inventory using bindings (the heavy step) |
| `/fdd` | Synthesize functional overview from per-artifact docs |
| `/tdd` | Synthesize technical overview |
| `/blueprint` | Synthesize solution blueprint |
| `/generate` | Full auto pipeline: `/scan` → `/document` → `/fdd`/`/tdd`/`/blueprint` → synthesis |
| `/index` | Generate `docs-generated/00-index.md` master navigation |
| `/handoff` | Publish `_brownfield/{inventory.json, impact-map.json, gap-log.json, coverage-report.md}` so domain agents can consume |

## Constitution (generalized per platform)

```
agents/brownfield/constitution/
├── 00-charter.md
├── 01-architectural-principles.md     # Evidence Over Assumption + flagging conventions
├── 02-documentation-standards.md      # No Grouping rule (machine-enforced)
├── 03-quality-rules.md                # Zero-tolerance gate (machine-enforced)
├── 04-input-file-types-base.md        # Platform-agnostic input rules
└── platforms/
    ├── d365-ce.md                     # CE-specific input file types + analysis rules
    ├── d365-fo.md                     # AOT XML, deployable packages, X++ extension catalog
    ├── integration.md                 # Azure-side: Functions, Logic Apps, ADF, Service Bus, APIM
    ├── reporting.md                   # Power BI, SSRS, dataflows
    └── power-platform.md              # Canvas, Power Pages, PCF, Custom Pages, Power Automate Desktop
```

## Nine patterns — reusable doc shapes

```
agents/brownfield/templates/patterns/
├── schema-asset.template.md           # Tables, EDTs, classes-with-fields, KPIs, Data Entities, Custom APIs, Cosmos containers, SQL tables
├── code-asset.template.md             # Plugins, JS per function, X++ methods, Azure Functions, CWA, Durable orchestrators, ADF data flows, stored procs
├── config-asset.template.md           # Number seqs, env vars, connection refs, currencies, UoMs, audit config, calendars, APIM named values
├── process-asset.template.md          # Classic workflows, BPFs, Power Automate flows, business rules, business events, dup detection, routing rules, Logic Apps
├── ui-asset.template.md               # Forms, views, charts, dashboards, Canvas screens, web pages, custom pages, email templates, ribbons, sitemap
├── security-asset.template.md         # Security roles, FLS profiles, teams, table permissions, web roles, FO duties/privileges, hierarchy security
├── integration-asset.template.md      # Logic Apps whole-flow, API conns, ADF pipelines, SB topics, EG topics, APIM products, custom connectors, dual-write
├── container-asset.template.md        # Solutions, patches, FO models, function apps, workspaces, model-driven apps, Power Pages site, ADF linked services
└── catalog-asset.template.md          # Products, price lists, territories, goals, marketing lists, campaigns, KB categories
```

## ~185 bindings — one YAML per artifact type

Layout:

```
agents/brownfield/templates/bindings/
├── d365-ce/                           # ~70 bindings
│   ├── entity.binding.yaml
│   ├── plugin.binding.yaml
│   ├── js-function.binding.yaml
│   ├── plugin-step.binding.yaml
│   ├── custom-api.binding.yaml
│   ├── canvas-app.binding.yaml
│   ├── canvas-component-library.binding.yaml
│   ├── custom-page.binding.yaml
│   ├── web-page.binding.yaml
│   ├── web-template.binding.yaml
│   ├── web-role.binding.yaml
│   ├── table-permission.binding.yaml
│   ├── form.binding.yaml
│   ├── view.binding.yaml
│   ├── dashboard.binding.yaml
│   ├── chart.binding.yaml
│   ├── email-template.binding.yaml
│   ├── word-template.binding.yaml
│   ├── excel-template.binding.yaml
│   ├── mail-merge.binding.yaml
│   ├── ribbon-diff.binding.yaml
│   ├── sitemap.binding.yaml
│   ├── bpf.binding.yaml
│   ├── classic-workflow.binding.yaml
│   ├── business-rule.binding.yaml
│   ├── security-role.binding.yaml
│   ├── fls-profile.binding.yaml
│   ├── team.binding.yaml
│   ├── audit-config.binding.yaml
│   ├── dup-detection-rule.binding.yaml
│   ├── auto-number.binding.yaml
│   ├── hierarchy-security.binding.yaml
│   ├── env-variable.binding.yaml
│   ├── connection-reference.binding.yaml
│   ├── currency.binding.yaml
│   ├── product.binding.yaml
│   ├── price-list.binding.yaml
│   ├── territory.binding.yaml
│   ├── goal.binding.yaml
│   ├── marketing-list.binding.yaml
│   ├── campaign.binding.yaml
│   ├── customer-journey.binding.yaml
│   ├── sla.binding.yaml                       # requires: module:customer-service
│   ├── queue.binding.yaml                     # requires: module:customer-service
│   ├── routing-rule.binding.yaml              # requires: module:customer-service
│   ├── entitlement.binding.yaml               # requires: module:customer-service
│   ├── kb-article.binding.yaml                # requires: module:customer-service
│   ├── macro.binding.yaml                     # requires: module:customer-service
│   ├── productivity-pane.binding.yaml         # requires: module:customer-service
│   └── ...
├── d365-fo/                           # ~50 bindings
│   ├── table.binding.yaml
│   ├── edt.binding.yaml
│   ├── base-enum.binding.yaml
│   ├── class.binding.yaml
│   ├── view.binding.yaml
│   ├── query.binding.yaml
│   ├── form.binding.yaml
│   ├── menu-item.binding.yaml
│   ├── report.binding.yaml
│   ├── fo-workflow.binding.yaml
│   ├── service-class.binding.yaml
│   ├── data-entity.binding.yaml
│   ├── composite-entity.binding.yaml
│   ├── aggregate-measurement.binding.yaml
│   ├── kpi.binding.yaml
│   ├── business-event.binding.yaml
│   ├── batch-job.binding.yaml
│   ├── dmf-project.binding.yaml
│   ├── er-format.binding.yaml
│   ├── er-model.binding.yaml
│   ├── er-mapping.binding.yaml
│   ├── security-key.binding.yaml
│   ├── role.binding.yaml
│   ├── duty.binding.yaml
│   ├── privilege.binding.yaml
│   ├── workspace.binding.yaml
│   ├── mobile-workspace.binding.yaml
│   ├── number-sequence.binding.yaml
│   ├── print-mgmt.binding.yaml
│   ├── retail-extension.binding.yaml          # requires: module:retail
│   ├── channel.binding.yaml                   # requires: module:retail
│   ├── hardware-profile.binding.yaml          # requires: module:retail
│   ├── payment-connector.binding.yaml         # requires: module:retail
│   ├── country-feature.binding.yaml
│   ├── tax-engine.binding.yaml
│   ├── address-book.binding.yaml
│   ├── dual-write-config.binding.yaml
│   ├── virtual-entity-provider.binding.yaml
│   ├── model.binding.yaml
│   ├── reference-model.binding.yaml
│   └── ...
├── integration/                       # ~40 bindings
│   ├── function-app.binding.yaml
│   ├── function-per-trigger.binding.yaml
│   ├── durable-orchestrator.binding.yaml
│   ├── logic-app-consumption.binding.yaml
│   ├── logic-app-standard.binding.yaml
│   ├── api-connection.binding.yaml
│   ├── integration-account.binding.yaml
│   ├── adf-pipeline.binding.yaml
│   ├── adf-linked-service.binding.yaml
│   ├── adf-dataset.binding.yaml
│   ├── adf-data-flow.binding.yaml
│   ├── adf-trigger.binding.yaml
│   ├── adf-ir.binding.yaml
│   ├── sb-topic.binding.yaml
│   ├── sb-subscription.binding.yaml
│   ├── sb-queue.binding.yaml
│   ├── eg-topic.binding.yaml
│   ├── eg-subscription.binding.yaml
│   ├── event-hub.binding.yaml
│   ├── apim-product.binding.yaml
│   ├── apim-api.binding.yaml
│   ├── apim-operation.binding.yaml
│   ├── apim-policy.binding.yaml
│   ├── apim-backend.binding.yaml
│   ├── custom-connector.binding.yaml
│   ├── storage-account.binding.yaml
│   ├── blob-container.binding.yaml
│   ├── cosmos-container.binding.yaml
│   ├── sql-database.binding.yaml
│   ├── stored-proc.binding.yaml
│   ├── app-registration.binding.yaml
│   ├── managed-identity.binding.yaml
│   ├── key-vault.binding.yaml
│   ├── private-endpoint.binding.yaml
│   ├── nsg.binding.yaml
│   ├── application-insights.binding.yaml
│   ├── log-analytics.binding.yaml
│   ├── diagnostic-setting.binding.yaml
│   ├── alert-rule.binding.yaml
│   └── sftp-watcher.binding.yaml
└── reporting/                         # ~25 bindings
    ├── pbi-workspace.binding.yaml
    ├── pbi-dataset.binding.yaml
    ├── pbi-report.binding.yaml
    ├── pbi-dataflow-gen1.binding.yaml
    ├── pbi-dataflow-gen2.binding.yaml
    ├── pbi-paginated-report.binding.yaml
    ├── pbi-app.binding.yaml
    ├── pbi-rls-role.binding.yaml
    ├── pbi-ols-rule.binding.yaml
    ├── data-gateway.binding.yaml
    ├── sensitivity-label.binding.yaml
    ├── composite-model.binding.yaml
    ├── incremental-refresh-policy.binding.yaml
    ├── ssrs-report.binding.yaml
    ├── ssrs-subscription.binding.yaml
    ├── ssrs-snapshot.binding.yaml
    ├── excel-template.binding.yaml
    ├── synapse-link-config.binding.yaml
    └── long-term-retention.binding.yaml
```

### Binding example

```yaml
artifactType: entity
displayName: "Dataverse Table"
pattern: schema-asset
sourcePaths:
  - "Entities/*/Entity.xml"
extractors:
  fields: "Entities/*/Entity.xml > attributes"
  relationships: "Entities/*/Entity.xml > relationships"
  keys: "EntityKeys/*"
  alternateKeys: "EntityKeys/*[type=alternate]"
crossRefs:
  - { type: plugin-step, link: "step.PrimaryEntityName == artifact.name" }
  - { type: form,        link: "form.ObjectTypeCode == artifact.name" }
  - { type: view,        link: "view.ReturnedTypeCode == artifact.name" }
  - { type: flow,        link: "flow.trigger.entity == artifact.name" }
requires: []                          # no module gate; always run
validators: [ validate_entity_field_dictionary, validate_evidence_chain ]
outputPath: "docs-generated/technical/data-model/entities/{name}.md"
```

Module-gated example:

```yaml
artifactType: sla
pattern: process-asset
requires: module:customer-service     # silent-skip if module not detected
...
```

## Module-detection

```yaml
# agents/brownfield/templates/module-detection.yaml
modules:
  customer-service:
    detected-when: ["entity.name in [sla, queue, routingrule, entitlement, knowledgearticle, msdyn_macro]"]
  sales:
    detected-when: ["entity.name in [opportunity, quote, salesorder, invoice, product, pricelevel]"]
  marketing:
    detected-when: ["entity.name starts-with [msdynmkt_, list]"]
  field-service:
    detected-when: ["entity.name starts-with msdyn_workorder"]
  retail:
    detected-when: ["fo.module.retail.present == true"]
```

**Shared with solution-estimate** — same keyword-to-module mapping. See `agents/solution-estimate/templates/module-detection.yaml` which references this file.

## Five synthesis templates (project-level)

Emit once per project, not per artifact:

```
agents/brownfield/templates/synthesis/
├── component-inventory.template.md     → docs-generated/inventory.md
├── functional-overview.template.md     → docs-generated/functional/functional-overview.md
├── integration-topology.template.md    → docs-generated/architecture/integration-topology.md
├── solution-blueprint.template.md      → docs-generated/architecture/solution-blueprint.md
└── technical-overview.template.md      → docs-generated/technical/technical-overview.md
```

## Per-platform scan templates

```
agents/brownfield/templates/scan/
├── d365-ce.template.md                # Solution ZIP extraction; entity XML, plugin assemblies, JS web resources, etc.
├── d365-fo.template.md                # AOT XML; deployable package extraction; X++ source
├── integration.template.md            # ARM templates, Function Apps, Logic App definitions, ADF JSON
├── reporting.template.md              # PBIX file, Power BI workspace API, RDL files
├── power-apps.template.md             # .msapp ZIP extraction (Canvas screens, controls, data sources, on-start formula)
├── power-pages.template.md            # Site XML — page hierarchy, web template→page binding, table permissions
└── custom-pages.template.md           # XAML/JSON extraction
```

## MCP `brownfield-engine/` tool group

```
tools/mcp-server/groups/brownfield-engine/
├── binding-loader.ts         # parses bindings/*.binding.yaml
├── pattern-renderer.ts       # renders patterns with extracted data
├── module-detector.ts        # applies module-detection.yaml
├── extractor.ts              # runs declarative extractors (XPath/JSONPath/regex/zip-walker)
├── cross-ref.ts              # computes cross-reference tables from inventory
├── coverage-tracker.ts       # records each artifact: documented vs gap-logged
├── pipeline.ts               # orchestrates the generation loop
└── synthesis-runner.ts       # runs the 5 synthesis templates after per-artifact pass
```

## MCP `brownfield_validators/` (10 validators)

Per [ADR-0007](../adr/0007-brownfield-auto-mode-self-healing.md):

| Validator | Detects | Self-heal action |
|---|---|---|
| `validate_no_grouping` | "Other X (~N more)" patterns | Re-prompt to author per-file sections |
| `validate_entity_field_dictionary` | Source attribute count ≠ documented field count | Re-prompt with missing-field list |
| `validate_form_layout` | Form doc missing tab/section/field structure | Re-extract form XML; re-prompt |
| `validate_flow_runbook` | Flow doc missing numbered actions / branches / errors | Re-prompt with flow JSON chunks |
| `validate_plugin_logic` | Plugin doc missing if-then / Dataverse ops / errors | Re-prompt with C# Execute() body |
| `validate_ssrs_sql` | Report has paraphrased SQL, not verbatim `<CommandText>` | Parse RDL; re-prompt with raw SQL |
| `validate_integration_contract` | Missing request/response/status/auth/retry | Re-prompt with Function code + Logic App def |
| `validate_power_apps_depth` | Canvas / Pages / Custom Pages at inventory level only | Re-extract if source present; else log BLOCKED-BY-BINARY |
| `validate_evidence_chain` | Claims without source reference | Re-prompt to add citations |
| `validate_inventory_coverage` | Any artifact category absent from inventory | List missing categories; re-prompt to scan |

CI test corpus (anonymised D365 solution) at `tools/mcp-server/brownfield_validators/test-corpus/`.

## Generation pipeline (the loop)

```
1. Load inventory.json
2. detect_modules(inventory)
3. for each artifactType in inventory:
     binding = load_binding(platform, artifactType)
     if not binding: log gap UNSUPPORTED-PATTERN; continue
     if binding.requires and not in detected_modules: skip silently (correct)
     for each instance of artifactType:
       pattern = load_pattern(binding.pattern)
       data = run_extractors(binding.sourcePaths, binding.extractors, instance)
       cross_refs = compute_cross_refs(binding.crossRefs, instance, inventory)
       doc = render(pattern, data, cross_refs)
       for attempt in 1..3:
         issues = run_validators(binding.validators + global_validators, doc)
         if not issues: write_to(binding.outputPath); break
         doc = re_attempt_with_focused_prompt(doc, issues)
       if still failing: log_gap; write doc with KNOWN_GAP markers
4. emit 5 synthesis docs (read inventory + per-artifact outputs)
5. emit coverage-report.md
6. emit gap-log.{json,md}
```

## Gap-log schema

`schemas/brownfield-gap-log.v1.json`:

```yaml
- id: <uuid>
  category: BLOCKED-BY-BINARY | MISSING-INPUT | INFERENCE-LOW-CONFIDENCE | EXCEEDED-RETRY-LIMIT | UNSUPPORTED-PATTERN
  artifact: <file or asset path>
  reason: <short>
  whatWouldUnblock: <one-line hint>
  severity: blocker | warning | info
  timestamp: <ISO 8601>
```

## Coverage guarantee

Every artifact in inventory is either:

- (a) **documented** at the depth its binding's validators require AND passes them, or
- (b) has a **typed entry** in `gap-log.json`, or
- (c) belongs to a binding whose `requires:` module is **not installed** (silent-skip is correct)

**No artifact is silently dropped.**

## Output organization

```
projects/{p}/_brownfield/docs-generated/
├── 00-index.md                       # master nav
├── inventory.{json,md}                # full inventory
├── functional/                        # business-facing synthesis (5 synthesis docs)
├── technical/
│   ├── data-model/                    # entities, EDTs, ERD
│   ├── code/                          # plugins, JS, X++, Azure Functions, CWA
│   ├── ui/                            # forms, views, charts, dashboards, ribbons, sitemap, apps
│   ├── processes/                     # BPFs, workflows, flows, business rules, business events, dup rules
│   ├── power-apps/                    # canvas, component libs, custom pages
│   ├── power-pages/                   # pages, templates, web roles, permissions, identity providers
│   ├── security/                      # roles, teams, FLS, hierarchy, audit
│   ├── customer-service/              # SLAs, queues, routing, entitlements, KB, macros (module-gated)
│   ├── sales/  marketing/  field-service/    # (module-gated)
│   ├── reference-data/                # currencies, UoMs, option sets, connection refs, env vars, calendars
│   ├── templates/                     # email, Word, Excel, mail-merge
│   ├── office-integration/            # server-side sync, Outlook, Teams, SharePoint
│   ├── mobile/                        # offline profiles, mobile-specific JS
│   └── audit-compliance/              # audit config, GDPR, dup detection
├── architecture/                      # solution-blueprint, dependency-map, impact-map, topology
├── data-migration/                    # source-target maps, reference data, cutover, reconciliation
├── gap-log.{json,md}                  # the one artifact users scan
└── coverage-report.md                 # auto-generated: % of inventory items documented per category
```

F&O / Integration / Reporting analogues follow the same shape per-platform.

## docScope

Brownfield is per-artefact (not domain or feature) — no `docScope` keys. Outputs accumulate under `projects/{p}/_brownfield/`.

## References

- ADRs: [ADR-0007](../adr/0007-brownfield-auto-mode-self-healing.md), [ADR-0008](../adr/0008-brownfield-patterns-and-bindings.md), [ADR-0001](../adr/0001-review-scope-spec-only.md) (notably no /review for brownfield)
- Cross-references: [11-mcp-server.md](../11-mcp-server.md) (brownfield-engine + brownfield_validators tool groups), [09-orchestration-patterns.md](../09-orchestration-patterns.md), [agents/solution-estimate.md](solution-estimate.md) (brownfield multipliers feed estimate)
- Backlog: `bk-011` (patterns), `bk-012` (bindings), `bk-013` (module-detection), `bk-014` (engine code), `bk-015` (scan templates), `bk-016` (validators + test corpus), `bk-017` (doc command output formats)
