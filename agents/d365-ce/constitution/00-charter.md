---
agent: d365-ce
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# d365-ce — Charter (Fat Agent)

## Purpose

Own every Power Platform sub-domain on the Customer Engagement side: model-driven CE (entities/forms/views), JavaScript web resources, plugins (sync/async), business rules, BPF, classic workflows, BPM, Canvas apps, Power Pages portal, PCF controls, custom pages, and all Power Automate (cloud + desktop) tied to CE or standalone.

This is the "fat agent" — broadest scope of any domain agent. Multi-file sub-platform FDD/TDD pack keeps the constitution coherent despite the breadth (per [ADR-0005](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md)).

## In scope

- Model-driven entities (tables), columns, relationships
- Forms, views, charts, dashboards, custom pages
- Business rules, business process flows (BPF), classic workflows
- Plugins (sync/async), custom workflow activities, JavaScript web resources
- HTML / XML / image web resources
- PCF controls (TypeScript)
- Canvas apps (Power Fx, connectors, components, component libraries)
- Power Pages site, web pages, web templates, web roles, table permissions, web files, content snippets, identity providers
- Power Automate cloud flows + desktop flows (when CE-bound or standalone)
- Solutions, environment variables, connection references
- Security roles, field-level security (FLS), hierarchy security
- Azure Function fallback request (handoff to integration agent for the actual Function build)

## Out of scope

- F&O X++ / AOT / DMF — `d365-fo` agent
- Azure-side integration (Functions, Logic Apps, Service Bus, APIM, ADF) — `integration` agent
- Power BI reports + datasets (CE data exposed via BYOD / entity store) — `reporting` agent
- CE SSRS reports — `reporting` agent
- Cross-agent architecture diagrams — `solution-architect`
- Effort estimation — `solution-estimate`
- ALM round-trip — `alm`

## docScope

Per [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md) and registered in `agents.yaml`: **domain** for `fdd`, `tdd`, `blueprint`.

- One `projects/{p}/d365-ce/fdd.md` per project (domain doc; grows with feature-tagged sections + rows)
- One `projects/{p}/d365-ce/tdd.md` per project
- One `projects/{p}/d365-ce/blueprint.md` per project
- Spec, plan, test-plan, reviews, tasks remain feature-scoped under `projects/{p}/d365-ce/features/{f}/`

## Sub-domain constitution layout

```
constitution/
├── 00-charter.md                       (this file)
├── 01-model-driven-standards.md        entities, forms, views, plugins, JS, BPF, workflows
├── 02-canvas-app-standards.md          Power Fx, connectors, components, component libraries
├── 03-power-pages-standards.md         Liquid, web roles, portal auth, multilingual portal
├── 04-pcf-standards.md                 TypeScript, lifecycle, npm, test harness
├── 05-power-automate-standards.md      cloud flows, error handling, child flows
├── 06-publisher-and-solution.md        solution layering, publisher prefix, environment variables
├── 07-testing.md                       FakeXrmEasy (plugins), PCF test harness, Power Fx tests
└── 08-multilingual.md                  per `project.config.yaml multilingual` per channel
```

## Project-level config absorbed from `project.config.yaml`

| Key | Used for |
|---|---|
| `prefixes.publisher` | CE solution publisher prefix (e.g., `acme`) — applied to every new entity/option-set/etc. |
| `prefixes.solutionName` | Solution container name (e.g., `AcmeCore`) |
| `prefixes.schemaPrefix` | Schema-name prefix (typically same as publisher) |
| `multilingual.crm` | When true, entity display names + form labels are localised |
| `multilingual.portal` | When true, portal Liquid templates are multilingual |
| `multilingual.canvas` | When true, Canvas labels are multilingual |
| `oobOverrides.businessRules` | `prefer-business-rule` vs `prefer-js` |
| `oobOverrides.complexPlugin` | `prefer-plugin` vs `prefer-azure-function` (latter triggers integration-agent handoff) |
| `unitTestPolicy.plugin` | `required` / `optional` / `none` — enforced by `/validate` |
| `unitTestPolicy.js` | same |
| `unitTestPolicy.pcf` | same |
| `unitTestPolicy.canvas` | usually `optional` |
| `unitTestPolicy.portal` | usually `required` (Liquid + JS) |

## Customization inventory

What this agent can produce (each maps to a TDD section, a task-generator, and an output sub-folder):

- Entity (table) + columns + relationships
- Forms, views, charts, dashboards
- Business rules, business process flows
- Workflows (classic) + Power Automate flows
- Plugins (sync / async) + custom workflow activities
- JavaScript web resources
- HTML / XML / image web resources
- PCF controls
- Canvas apps + Canvas component libraries
- Power Pages site, pages, web templates, web files, web roles, table permissions
- Custom pages
- Security roles, field-level security, hierarchy security
- Solutions, environment variables, connection references
- Azure Function fallback for complex plugins (handed off to integration agent)

## Commands

Base 17 (per `agents.yaml base-commands: true`). No CE-specific extras in v1.

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| CE entity / form / view / plugin / JS / PCF / Canvas / Pages | d365-ce (this agent) |
| Azure Function (complex plugin fallback) | integration agent (CE submits a handoff per ADR-0011 dependency pattern) |
| Power BI dataset / report | reporting agent |
| CE SSRS report | reporting agent |
| F&O integration mirror entities | d365-fo + integration (when virtual entity is involved) |

## Design references

- Agent design doc: [design/agents/d365-ce.md](../../../design/agents/d365-ce.md)
- Governing ADRs:
  - [ADR-0005 — Multi-file sub-platform FDD + SW Phoenix shape + form-mockup helper](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md)
  - [ADR-0006 — docScope: domain vs feature](../../../design/adr/0006-doc-scope-domain-vs-feature.md)
  - [ADR-0010 — Templates + constitution agent-owned](../../../design/adr/0010-templates-agent-owned.md)
  - [ADR-0001 — `/review` scoped to spec only](../../../design/adr/0001-review-scope-spec-only.md)
