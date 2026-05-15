---
adr: 0008
title: Brownfield 9 patterns + ~185 bindings + module-detection (silent-skip uninstalled modules)
status: accepted
decided-on: 2026-05-14
design-doc-refs: [agents/brownfield.md, 11-mcp-server.md]
---

# ADR-0008 — Brownfield 9 patterns + ~185 bindings + module-detection architecture

## Status

`accepted` — decided 2026-05-14.

## Context

A real D365 / Power Platform delivery includes ~140+ distinct artifact types across CE, F&O, Integration, and Reporting (entities, plugins, JS files, BPFs, classic workflows, business rules, Canvas screens, Power Pages templates, web roles, table permissions, PCF controls, custom pages, Azure Functions, Logic Apps, Service Bus topics, ADF pipelines, APIM products, Power BI datasets, …). Authoring 140 unique templates is unmaintainable.

Two structural moves reduce the surface dramatically: (1) most artifacts fall into a handful of *shape families* (schema, code, config, process, ui, security, integration, container, catalog); (2) the differences per-artifact are mostly **what to extract** (XPath/JSONPath into source files) and **how to cross-reference**, not the document shape.

## Decision

Three parts:

### (a) Nine reusable patterns

Each pattern is one Markdown template describing a doc shape. All artifacts of a family render with the same pattern:

| Pattern | Used for |
|---|---|
| `schema-asset.template.md` | Tables, EDTs, classes with fields, KPIs, Aggregate measurements, Data Entities, Custom APIs (params), Custom Connectors (schema), Cosmos containers, SQL tables |
| `code-asset.template.md` | Plugins (per class), JS (per function), X++ methods, Azure Functions, CWA, Durable Function orchestrators, ADF data flows, stored procs |
| `config-asset.template.md` | Number sequences, Env Variables, Connection References, Currencies, UoMs, Auto-number config, Audit config, Holiday schedules, APIM Named values |
| `process-asset.template.md` | Classic workflows, BPFs, Power Automate flows, Business Rules, Business Events, Duplicate Detection rules, Auto-resolution rules, Routing rules, Logic Apps |
| `ui-asset.template.md` | Forms, Views, Charts, Dashboards, Canvas screens, Web pages, Custom Pages, Email templates, Ribbon diffs, SiteMap |
| `security-asset.template.md` | Security Roles, FLS Profiles, Teams, Table Permissions, Web Roles, FO Duties/Privileges, Hierarchy security |
| `integration-asset.template.md` | Logic Apps (whole-flow), API Connections, ADF pipelines, Service Bus topics/subs, Event Grid topics, APIM products/APIs/policies, Custom Connectors (actions), Dual-write configs |
| `container-asset.template.md` | Solutions, Patches, Solution dependencies, FO Models, Function Apps, Workspaces, Model-driven apps, Power Pages site, ADF Linked Services |
| `catalog-asset.template.md` | Products / Families / Bundles, Price Lists, Discount lists, Territories, Goals, Marketing lists, Campaigns, Knowledge categories |

Pattern templates live at `agents/brownfield/templates/patterns/`.

### (b) ~185 small bindings — one YAML per artifact type

Each binding wires an artifact type to a pattern + source paths + extractors + cross-refs + validators + output path + optional module-gate.

```yaml
# agents/brownfield/templates/bindings/d365-ce/entity.binding.yaml
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

Binding inventory:
- ~70 CE bindings
- ~50 F&O bindings
- ~40 Integration bindings
- ~25 Reporting bindings
- **Total: ~185**

Each binding is ~30 lines — adding a new artifact type takes a few minutes, not hours of template authoring.

### (c) Module-detection silent-skips uninstalled modules

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

Bindings declaring `requires: module:<name>` are silent-skipped when the module isn't detected. **Not a gap** — silent skip is the correct behavior for "this module isn't installed in this project."

### Pipeline orchestration

The MCP `brownfield-engine/` tool group orchestrates:

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

### Five synthesis docs (project-level, not per-artifact)

| Synthesis doc | Output | Reads |
|---|---|---|
| component-inventory | `docs-generated/inventory.md` | Full inventory.json |
| functional-overview | `docs-generated/functional/functional-overview.md` | Inventory + per-process docs |
| integration-topology | `docs-generated/architecture/integration-topology.md` | All integration-asset docs |
| solution-blueprint | `docs-generated/architecture/solution-blueprint.md` | All per-artifact docs + architecture inputs |
| technical-overview | `docs-generated/technical/technical-overview.md` | All per-artifact docs |

## Alternatives considered

- **One template per artifact type (~140 templates).** Reject — unmaintainable; each template would be ~200 lines × 140 = 28,000 lines of nearly-identical structure.
- **One mega-template that branches on artifact type.** Reject — branching logic inside a template is a maintenance trap and breaks the doc_lint rule of "no conditionals in templates" (per ADR-0010).
- **No module gating; doc every category and gap-log absences.** Reject — false positives flood the gap log with Marketing / Retail / Service / FieldService misses on greenfield deployments that don't use those modules.

## Consequences

**Positive:**
- Adding a new artifact type is a ~30-line YAML, not a template-authoring exercise.
- Coverage guarantee is honest: every artefact is documented OR gap-logged OR module-gated-skipped.
- Synthesis docs (project-level roll-ups) emerge from per-artifact data, not authored twice.

**Negative:**
- Initial authoring of ~185 bindings is real work (the largest authoring effort in the entire platform per [implementation.md Phase 7 estimate](../../implementation.md)).
- Extractor expressions (XPath/JSONPath/regex/zip-walker) require platform-specific knowledge per binding.
- Module-detection rules need maintenance as Microsoft adds new modules over time.

**Affected design docs:** [agents/brownfield.md](../agents/brownfield.md), [11-mcp-server.md](../11-mcp-server.md).

## References

- Related ADRs: [ADR-0007](0007-brownfield-auto-mode-self-healing.md) (the retry loop that consumes bindings)
