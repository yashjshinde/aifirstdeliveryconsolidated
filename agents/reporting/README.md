# reporting

> CE SSRS + Power BI (CE data and BYOD-exposed F&O data). F&O native SSRS stays in d365-fo. Domain-scoped per [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md).

## What

The reporting agent produces specs, plans, FDD, TDD, blueprint, test-plan, and per-feature outputs for CE SSRS reports and the full Power BI surface: datasets, dataflows (Gen1 + Gen2), reports, dashboards, apps, Power BI Embedded configuration, RLS/OLS definitions, refresh schedules, sensitivity labels, and Synapse Link / BYOD / data lake export configurations on top of CE and F&O data. Multilingual + accessibility (WCAG AA) baked in per `project.config.yaml`.

This agent does NOT own F&O-native SSRS (RDP-driven; that stays in d365-fo), Power BI Embedded host application code (in `integration`), upstream data engineering (BYOD pipeline build / Synapse Link config — also in `integration`), effort estimation, or ALM round-trip.

## How

- **New report / dashboard** — `/spec --feature <slug>` → `/review --approve` → `/plan` → `/clarify --approve` → `/task` → `/validate --approve` → `/implement` → `/document` → `/alm-extract`
- **Add to existing domain doc** — `/fdd` / `/tdd` / `/blueprint` append feature-tagged sections + rows. Idempotent re-runs.
- **Cross-agent spec** — `/split` emits handoffs to CE / F&O / integration when the report depends on upstream changes (alternate keys, BYOD export, Synapse Link setup).
- **Brownfield project** — `/impact` reads `_brownfield/inventory.json` (Phase 7) to surface existing datasets / dataflows / reports the new feature must coexist with.

## Details

- **Constitution** *(agent-owned per [ADR-0010](../../design/adr/0010-templates-agent-owned.md))*:
  - [constitution/00-charter.md](constitution/00-charter.md)
  - [constitution/01-ce-ssrs-standards.md](constitution/01-ce-ssrs-standards.md)
  - [constitution/02-power-bi-standards.md](constitution/02-power-bi-standards.md)
  - [constitution/03-data-sourcing.md](constitution/03-data-sourcing.md)
  - [constitution/04-performance-and-refresh.md](constitution/04-performance-and-refresh.md)
  - [constitution/05-multilingual.md](constitution/05-multilingual.md)

- **Templates**:
  - [templates/fdd.template.md](templates/fdd.template.md), [tdd.template.md](templates/tdd.template.md), [blueprint.template.md](templates/blueprint.template.md)
  - [templates/spec.template.md](templates/spec.template.md), [plan.template.md](templates/plan.template.md)
  - [templates/task.template.md](templates/task.template.md)
  - [templates/review-report.template.md](templates/review-report.template.md)
  - [templates/test-plan/index.template.md](templates/test-plan/index.template.md), [suite.template.md](templates/test-plan/suite.template.md)
  - [templates/checklists/](templates/checklists/) — 6 review checklists (categories follow Power BI guidance: dataset size / performance, RLS coverage, refresh strategy, sensitivity classification, data source authoritativeness, accessibility)

- **Commands**: [.claude/commands/](.claude/commands/) — base 17 (per `agents.yaml base-commands: true`; no extras)

- **docScope**: `fdd: domain`, `tdd: domain`, `blueprint: domain` per [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md). One `projects/{p}/reporting/{fdd,tdd,blueprint}.md` per project.

- **Design doc**: [design/agents/reporting.md](../../design/agents/reporting.md)
- **Related ADRs**: [ADR-0001](../../design/adr/0001-review-scope-spec-only.md), [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md), [ADR-0010](../../design/adr/0010-templates-agent-owned.md)

## What this agent does NOT do

- Does NOT build F&O native SSRS (RDP-driven) — that stays in d365-fo per the scope split.
- Does NOT host Power BI Embedded application code — that's integration's responsibility (wrapper Functions / Logic Apps).
- Does NOT build the upstream BYOD pipeline or Synapse Link configuration — those are integration + d365-fo work, consumed here via the data-sourcing sub-area.
