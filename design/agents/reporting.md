---
title: reporting — CE SSRS + Power BI
status: live
adr-refs: [ADR-0006, ADR-0001]
last-reviewed: 2026-05-14
owner: design
---

# reporting — CE SSRS + Power BI

> CE SSRS plus Power BI (CE data and BYOD-exposed F&O data). **F&O native SSRS stays in the d365-fo agent.**

## Scope

- CE SSRS reports (fetchxml-driven or pre-filtered SQL)
- Power BI datasets, dataflows (Gen1 + Gen2), reports, dashboards, apps
- Power BI Embedded configuration
- RLS (Row-Level Security) / OLS (Object-Level Security) definitions
- Bookmarks, navigation, themes
- Composite models, incremental refresh policies
- Data gateways, sensitivity labels
- Data sourcing patterns: Dataverse direct, BYOD, entity store, Azure Synapse Link, data lake export

**Out of scope (handled elsewhere):**
- F&O native SSRS (RDP-driven) → d365-fo agent
- Power BI Embedded application code → integration agent (when wrapping with Functions / Logic Apps)

## docScope

Per [ADR-0006](../adr/0006-doc-scope-domain-vs-feature.md): **domain** for `fdd`, `tdd`, `blueprint`. One `projects/{p}/reporting/fdd.md` per project, accumulating reports / dashboards / datasets / dataflow definitions as features add them. Same `feature-id` tagging rules as CE and integration.

## Sub-domains in constitution

```
agents/reporting/constitution/
├── 00-charter.md
├── 01-ce-ssrs-standards.md            # fetchxml vs SQL, parameter handling, security
├── 02-power-bi-standards.md           # datasets, dataflows, semantic model, RLS, OLS
├── 03-data-sourcing.md                # Dataverse, BYOD, entity store, Synapse Link, data lake
├── 04-performance-and-refresh.md      # dataset size limits, incremental refresh, composite models
└── 05-multilingual.md                 # localized labels, RTL support
```

## Customization inventory

- CE SSRS reports (fetchxml or pre-filtered)
- Power BI datasets
- Power BI dataflows (Gen1, Gen2)
- Power BI reports
- Power BI dashboards
- Power BI apps
- Power BI Embedded configuration
- RLS / OLS definitions
- Bookmarks, navigation, themes
- Data gateways
- Sensitivity labels
- Composite models
- Incremental refresh policies
- Subscriptions, snapshots (SSRS)
- Synapse Link configurations, long-term retention, data lake export

## Templates

```
agents/reporting/templates/
├── fdd.template.md                   # Domain FDD; sections per report/dashboard/dataset
├── tdd.template.md                   # Per-report details (data source, query, parameters, RLS)
├── blueprint.template.md             # Reporting topology — sources → dataflows → datasets → reports
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

Review checklists authored fresh (the predecessor reporting templates lacked review checklists — closing that gap is part of this agent's design). Categories follow Power BI guidance: dataset size / performance, RLS coverage, refresh strategy, sensitivity classification, data source authoritative-ness, accessibility (color contrast, screen-reader labels).

## Commands

Base 17. No reporting-specific extras in v1.

## Process flow

Same as the standard agent. `/blueprint` produces the reporting topology (Mermaid flowchart from sources through dataflows to datasets to reports).

## Work products

- `projects/{p}/reporting/fdd.md` *(domain — sections per report/dashboard)*
- `projects/{p}/reporting/tdd.md` *(domain — query bodies, RLS roles, dataflow steps)*
- `projects/{p}/reporting/blueprint.md` *(domain — reporting topology)*
- `projects/{p}/reporting/features/{f}/spec.md`, `plan.md`, `test-plan/`, `tasks/`, `reviews/spec-review.md`, `output/` *(report definitions, PBIT/PBIX files, RDL files, dataflow JSON)*

## Multilingual support

Per `project.config.yaml` `multilingual.reports: true`, the agent emits localised report labels using the language pack approach. Power BI handles this via translations on dataset fields; CE SSRS via parameterised labels in the report definition. Both authored in `agents/reporting/templates/` patterns.

## References

- ADRs: [ADR-0006](../adr/0006-doc-scope-domain-vs-feature.md), [ADR-0001](../adr/0001-review-scope-spec-only.md), [ADR-0010](../adr/0010-templates-agent-owned.md)
- Cross-references: [03-agent-inventory.md](../03-agent-inventory.md), [09-orchestration-patterns.md](../09-orchestration-patterns.md)
- Backlog: `bk-027` (reporting agent design — this doc), `bk-025` (per-agent generic)
