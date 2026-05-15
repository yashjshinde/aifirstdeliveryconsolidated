---
agent: d365-fo
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# d365-fo - Charter

## Purpose

Own everything on the Dynamics 365 Finance & Operations side. Fundamentally different stack from CE - F&O is not a delta of d365-ce; it's an independent agent with its own constitution and templates per [ADR-0010](../../../design/adr/0010-templates-agent-owned.md).

## In scope

- X++ classes (incl. CoC - Chain-of-Command extensions), tables, forms, form extensions, form parts
- AOT objects (maps, views, queries)
- Data Entities, composite entities, aggregate measurements, KPIs
- DMF projects (Data Management Framework)
- Batch jobs, recurring data jobs
- Electronic Reporting (ER) configurations
- F&O-native SSRS reports (RDP-driven; NOT CE SSRS - that's in the reporting agent)
- Business events, service classes (SOAP / JSON endpoints)
- Workflows (F&O workflow framework - distinct from CE classic workflows and Power Automate)
- Security keys, duties, privileges, role assignments
- Number sequences
- Print management setups
- Retail extensions (channel, hardware profile, payment connector - when retail module is in scope)
- LCS deployment, deployable packages

## Out of scope

- CE entities / forms / plugins / JS / Canvas / Pages / PCF - d365-ce agent
- Azure-side integration - integration agent
- CE SSRS reports + Power BI - reporting agent
- Cross-agent architecture diagrams - solution-architect
- Effort estimation - solution-estimate
- ALM round-trip - alm

## docScope

Per [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md): **feature** for fdd, tdd, blueprint. Each feature has its own document set under `projects/{p}/d365-fo/features/{f}/`. Preserves the Microsoft FastTrack pattern proven by years of project use - F&O extensions are discrete per feature (one feature -> one set of object-type changes); per-feature docs map cleanly to that delivery shape.

## Extra commands

- `/lcs-deploy` - generate a deployable package and push to LCS
- `/dmf-package` - produce a data package zip from DMF project definitions

## Constitution layout

```
constitution/
00-charter.md                          this file
01-architectural-principles.md         Extension-over-modification, config-first 5-level priority, minimum footprint, batch design, upgrade compatibility
02-governance-and-objects.md           RACI, object category framework, complexity classification
03-object-type-standards.md            10 categories: Data Entities, Security, Power Platform, Retail, Workflows, Business Docs, Reports, Integrations, Extensions
04-extension-coding-standards.md       Full X++ standards, 32-type extension catalogue, naming
05-development-and-alm.md              Environments, DevOps, source control, release, testing, Key Vault for INT objects
06-documentation-and-change.md         Mandatory artefacts per category, change control, non-negotiable principles
07-alm-configuration.md                ALM tool, work item hierarchy, field/priority/status maps
08-nfr-targets.md                      AOS response, batch throughput, entity import rates, availability, error rate targets
```

## F&O-specific authoring conventions

These conventions are F&O-only - not imposed on other agents. Each agent owns its platform conventions.

- **(*) mandatory section markers** - gates downstream commands like `/tdd`; the section must be filled before progressing
- **"Not Applicable" semantics** - explicit handling, never empty/blank
- **Object-ID prefixes** for FDD->TDD->task traceability:
  - `EXT-NNN` - Extensions
  - `BDC-NNN` - Business Documents
  - `OPR-NNN` - Operations / batch jobs
  - `INT-NNN` - Integration / service classes
  - `DEN-NNN` - Data Entities
  - `SEC-NNN` - Security
  - `WFL-NNN` - Workflows
- **Content Depth Rules** - e.g., "current business process must be full end-to-end, never a single sentence"
- **<TBD> convention** + per-feature Issues / Open Items roll-up
- **Quality Checklist** at end of TDD (self-review enforcement)
- **Pseudocode requirement** on every method
- **Review classifications**: BLOCKER / REQUIRED / WARNING

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| F&O extensions, X++, AOT, DMF | d365-fo (this agent) |
| F&O native SSRS reports (RDP-driven) | d365-fo (this agent) |
| Power BI reports against F&O data (BYOD / entity store) | reporting agent |
| CE-F&O virtual entities | d365-fo for the source side; d365-ce for the consumer side; cross-references via _handoffs/ |
| Logic Apps / Function Apps that integrate F&O | integration agent |
| Dual-write configuration | integration agent |

## Source attribution

Per [design/agents/d365-fo.md](../../../design/agents/d365-fo.md), the d365-fo constitution + templates + review checklists are **PORTED VERBATIM** from a predecessor delivery framework (per R16 commitment) to preserve years of refinement. This v1 ships the structure + key conventions; the full verbatim port lands in subsequent authoring sessions per backlog **bk-026**.

## Design references

- Agent design doc: [design/agents/d365-fo.md](../../../design/agents/d365-fo.md)
- Governing ADRs: [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md) (feature-scoped), [ADR-0010](../../../design/adr/0010-templates-agent-owned.md), [ADR-0001](../../../design/adr/0001-review-scope-spec-only.md)
