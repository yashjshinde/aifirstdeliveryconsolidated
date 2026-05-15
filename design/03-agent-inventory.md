---
title: Agent Inventory — Eight Domain Agents
status: live
adr-refs: [ADR-0005, ADR-0006, ADR-0007, ADR-0008, ADR-0009]
last-reviewed: 2026-05-14
owner: design
---

# Agent Inventory — Eight Domain Agents

## Summary table

| # | Agent | Scope | Sub-modules in constitution | docScope (FDD/TDD/blueprint) | Maturity port from predecessor |
|---|---|---|---|---|---|
| 1 | **[d365-ce](agents/d365-ce.md)** *(fat)* | Model-driven CE + Power Apps + Canvas + Power Pages + PCF + all Power Automate + plugins, JS, BPF, workflows, BPM | model-driven, canvas, power-pages, pcf, power-automate | **domain** | Multi-file FDD with SW Phoenix shape ([ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md)) |
| 2 | **[d365-fo](agents/d365-fo.md)** | X++, AOT, deployable packages, LCS, Data Entities, DMF, batch, ER, F&O-SSRS, business events, security keys/duties, SysTest | core-x++, extensions (CoC), dmf, batch-er, fo-ssrs, lcs-deploy | **feature** (FastTrack pattern) | Constitution + templates ported verbatim |
| 3 | **[integration](agents/integration.md)** *(merged)* | Event-driven (Functions, Logic Apps, Service Bus, APIM, Event Grid) AND batch (ADF, SFTP, SQL staging, bulk Dataverse, data migration) | event-driven, batch-adf, sql-staging, sftp, data-migration | **domain** | Authored fresh (review checklists gap) |
| 4 | **[reporting](agents/reporting.md)** | CE SSRS + Power BI (CE data + BYOD-exposed F&O data) | ce-ssrs, power-bi | **domain** | Authored fresh (review checklists gap) |
| 5 | **[solution-estimate](agents/solution-estimate.md)** | ROM / build hours / rollup across all agents | aggregator | n/a | New consolidated `/estimate` per [ADR-0009](adr/0009-solution-estimate-consolidated.md) |
| 6 | **[solution-architect](agents/solution-architect.md)** | Unified solution diagram + cross-agent gap review + clickable HTML prototype | aggregator | project (aggregator) | New (blueprint + prototype) |
| 7 | **[brownfield](agents/brownfield.md)** | Reverse-engineering, inventory, impact analysis | inventory, doc-generation, platforms/{ce,fo,int,rep,power-platform} | feature/asset | Patterns + bindings ([ADR-0008](adr/0008-brownfield-patterns-and-bindings.md)), auto-mode ([ADR-0007](adr/0007-brownfield-auto-mode-self-healing.md)) |
| 8 | **[alm](agents/alm.md)** | Workflow-level ALM ops over ADO and JIRA | alm-mapping, alm-conventions | n/a | 6 commands (push/pull/export/import/status/cleanup) |

## docScope — what it controls

Per [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md):

- **Domain-scoped agents** (CE / Integration / Reporting) — one FDD, TDD, blueprint per project per agent at `projects/{p}/{agent}/{doc}.md`. Sections + table rows tagged with `feature-id` for per-feature traceability. Spec, plan, test-plan, reviews, tasks remain feature-scoped under `projects/{p}/{agent}/features/{f}/`.
- **Feature-scoped agents** (F&O) — each feature has its own full document set at `projects/{p}/d365-fo/features/{f}/{doc}.md`. Preserves the FastTrack delivery shape.
- **Aggregators** (solution-estimate, solution-architect) — project-level outputs under `projects/{p}/_aggregator/`; no per-feature FDD/TDD/blueprint.
- **Brownfield** — per-artefact docs organized by inventory under `projects/{p}/_brownfield/docs-generated/`.
- **ALM** — no documents; orchestrates work-items.

The agent's `docScope` keys live in `agents.yaml` (see [01-repo-structure.md](01-repo-structure.md)). Commands `/fdd`, `/tdd`, `/blueprint` branch on these keys at runtime per [04-workflow-gates.md](04-workflow-gates.md).

## Agent boundaries — who owns what

A common question: when a customer requirement spans multiple agents, who owns each piece? The answer:

| Customer artefact | Owning agent |
|---|---|
| CE entity (table) + fields + relationships | d365-ce |
| Canvas app / Power Pages portal / PCF control / Power Automate flow | d365-ce |
| Plugin / JS web resource / BPF / business rule / classic workflow | d365-ce |
| F&O extension class / form extension / X++ method / CoC class | d365-fo |
| F&O Data Entity + DMF project + batch job + ER configuration + F&O-native SSRS | d365-fo |
| Azure Function / Logic App / Service Bus topic / APIM API / ADF pipeline | integration |
| SFTP file flow / SQL staging proc / bulk Dataverse loader / data migration package | integration |
| CE SSRS report (fetchxml or pre-filtered) | reporting |
| Power BI dataset / dataflow / report / dashboard | reporting |
| Estimation / build hours / config-vs-custom split | solution-estimate |
| Unified architecture diagram / cross-agent gap review / HTML solution prototype | solution-architect |
| Inventory of an existing legacy solution + reverse-engineered docs | brownfield |
| ADO / JIRA work-item sync / round-trip / file export-import | alm |

## Cross-agent handoffs

Per [09-orchestration-patterns.md](09-orchestration-patterns.md), agents coordinate via filesystem state, not a router. The four orchestration patterns:

1. **Intra-agent gate chain** — one agent, one feature. State stays in `.workflow.json`.
2. **Federation handoff** — a spec in CE flags "integration concerns" → `/split` emits a handoff manifest + skeleton spec in the integration agent.
3. **Cross-agent dependency** — CE `/plan` declares `requires: [{agent: integration, ...}]`; `/clarify` blocks until dependency status is READY.
4. **Aggregation** — aggregator commands call `MCP handoff_list_blueprints --project X` and read each agent's outputs.

## Source repos for ported content

When migrating legacy content into the eventual agent folders, these are the source materials (currently in `reference/` which will be removed; ported content lives in `agents/{a}/templates/`, `agents/{a}/constitution/`, etc.):

| Agent | Ported source |
|---|---|
| d365-ce | SW Phoenix FDD shape (master skeleton); SW Form Generation Prompt (form-mockup helper). Per [ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md). |
| d365-fo | Predecessor `aifirstdelivery/templates/d365-fo/` (constitution: architectural-principles, governance, object-type-standards, extension-coding, dev-and-alm, doc-and-change, alm-config, nfr-targets; templates: fdd / tdd / blueprint / test-plan / task / fdd-review checklist / tdd-review checklist) |
| brownfield | Predecessor `aifirstdelivery/templates/d365-ce-brownfield/` constitution rules (Evidence Over Assumption, No Grouping, zero-tolerance gates) ported into validators in MCP code |
| solution-estimate | `Dynamics365AISolution/MasterTemplate/estimation-instructions.md` (template); `Internal Project - SI Effort Data.xlsx` (95-factor catalogue extracted via PowerShell unzip + XML parse); 8 factors reintroduced from the estimation-instructions reference. Per [ADR-0009](adr/0009-solution-estimate-consolidated.md). |
| solution-architect | SW Form Generation Prompt (per-entity HTML mockup generator; mirrored from d365-ce per per-agent autonomy) |

## References

- ADRs: [ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md), [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md), [ADR-0007](adr/0007-brownfield-auto-mode-self-healing.md), [ADR-0008](adr/0008-brownfield-patterns-and-bindings.md), [ADR-0009](adr/0009-solution-estimate-consolidated.md)
- Per-agent docs: [agents/d365-ce.md](agents/d365-ce.md), [agents/d365-fo.md](agents/d365-fo.md), [agents/integration.md](agents/integration.md), [agents/reporting.md](agents/reporting.md), [agents/solution-estimate.md](agents/solution-estimate.md), [agents/solution-architect.md](agents/solution-architect.md), [agents/brownfield.md](agents/brownfield.md), [agents/alm.md](agents/alm.md)
- Workflow: [04-workflow-gates.md](04-workflow-gates.md)
