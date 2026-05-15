---
agent: reporting
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# reporting — Charter

## Purpose

Own CE SSRS and Power BI reporting across the project. Surface CE data directly and F&O data exposed via BYOD / Synapse Link / Entity Store. F&O-native SSRS (RDP-driven) stays in the d365-fo agent.

## In scope

- **CE SSRS reports** — fetchxml-driven or pre-filtered SQL
- **Power BI datasets** — composite, DirectQuery, Import
- **Power BI dataflows** (Gen1, Gen2)
- **Power BI reports + dashboards + apps**
- **Power BI Embedded** configuration
- **RLS / OLS** (Row / Object Level Security) definitions
- **Bookmarks, navigation, themes**
- **Composite models, incremental refresh policies**
- **Data gateways, sensitivity labels**
- **Data sourcing patterns:** Dataverse direct, BYOD, entity store, Azure Synapse Link, data lake export
- **Subscriptions, snapshots** (SSRS)
- **Synapse Link** configurations + long-term retention + data lake export

## Out of scope

- F&O native SSRS (RDP-driven) → `d365-fo`
- Power BI Embedded application code (wrapper Functions / Logic Apps) → `integration`
- ALM round-trip → `alm`
- Effort estimation → `solution-estimate`

## docScope

Per [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md): **domain** for `fdd`, `tdd`, `blueprint`. One `projects/{p}/reporting/{fdd,tdd,blueprint}.md` per project; grows additively with `feature-id`-tagged sections + rows.

## Constitution layout

```
constitution/
├── 00-charter.md                  (this file)
├── 01-ce-ssrs-standards.md        fetchxml vs SQL, parameter handling, security
├── 02-power-bi-standards.md       datasets, dataflows, semantic model, RLS, OLS
├── 03-data-sourcing.md            Dataverse direct, BYOD, entity store, Synapse Link, data lake
├── 04-performance-and-refresh.md  dataset size limits, incremental refresh, composite models
└── 05-multilingual.md             localised labels, RTL support
```

## Project-level config absorbed from `project.config.yaml`

| Key | Used for |
|---|---|
| `reporting.workspace` | Power BI workspace name |
| `reporting.dataset.refresh.frequency` | scheduled refresh cadence (Mon-Fri 06:00 default) |
| `reporting.dataset.refresh.windows` | refresh blackouts (e.g., end-of-month cutover) |
| `reporting.gateway` | on-prem gateway name (when on-prem sources) |
| `reporting.rls.policy` | per-tenant / per-region / per-role |
| `multilingual.reports` | when true, emit localised labels per project locales |
| `reporting.embedded.policy` | `app-owns-data` / `user-owns-data` |

## Customisation inventory

- CE SSRS reports
- Power BI datasets
- Power BI dataflows (Gen1, Gen2)
- Power BI reports, dashboards, apps
- Power BI Embedded configuration
- RLS / OLS definitions
- Bookmarks, navigation, themes
- Data gateways
- Sensitivity labels
- Composite models
- Incremental refresh policies
- Subscriptions, snapshots (SSRS)
- Synapse Link configurations

## Commands

Base 17 (per `agents.yaml base-commands: true`). No reporting-specific extras in v1.

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| Power BI dataset / dataflow / report / app | reporting (this agent) |
| CE SSRS report | reporting |
| F&O native SSRS (RDP) | d365-fo |
| BYOD pipeline producing the SQL DB | d365-fo (DMF export) + integration (refresh orchestration) |
| Synapse Link Dataverse plumbing | integration (config + monitoring) |
| Power BI Embedded host application | integration (when wrapping with Functions / Logic Apps) |

## Design references

- Agent design doc: [design/agents/reporting.md](../../../design/agents/reporting.md)
- Related ADRs: [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md), [ADR-0010](../../../design/adr/0010-templates-agent-owned.md), [ADR-0001](../../../design/adr/0001-review-scope-spec-only.md)
