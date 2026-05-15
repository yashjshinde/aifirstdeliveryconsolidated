# d365-fo

> **F&O autonomous agent.** Owns the Dynamics 365 Finance & Operations stack: X++, AOT, DMF, batch, Electronic Reporting, F&O-native SSRS, business events, security keys/duties, SysTest. **Feature-scoped** per [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md) - preserves the Microsoft FastTrack pattern. Constitution PORTED per R16 (full body content queued as bk-026).

## What

The d365-fo agent produces specs, plans, FDD, TDD, blueprint, test-plan, and per-feature outputs for everything on the F&O side. Each feature has its own document set (feature-scoped docScope), matching the F&O delivery shape where each feature touches a discrete set of object-type changes. F&O is **not** a delta of d365-ce - it's an independent stack with its own constitution + templates + extra commands (`/lcs-deploy`, `/dmf-package`).

This agent does NOT own CE work (`d365-ce`), Azure-side integration (`integration`), Power BI / CE SSRS (`reporting`), cross-agent architecture (`solution-architect`), effort estimation (`solution-estimate`), or ALM round-trip (`alm`).

## How

- **New F&O feature** - `/spec --feature <slug> --source fresh` -> `/review --approve` -> `/plan` -> `/clarify --approve` -> `/task` -> `/validate --approve` -> `/implement` -> `/document` -> `/alm-extract`
- **Per-feature shape** - `/fdd`, `/tdd`, `/blueprint` create per-feature documents under `projects/{p}/d365-fo/features/{f}/`. No domain-level accumulation (unlike d365-ce).
- **Deploy to LCS** - `/lcs-deploy --feature <slug>` builds a deployable package and pushes it to LCS via the project's configured LCS connection.
- **Build a data package** - `/dmf-package --feature <slug>` produces a DMF data package zip from the feature's DMF project definitions.
- **Cross-domain spec** - `/spec` -> `/review --approve` flags integration concerns -> `/split` emits handoffs (e.g., Azure-side integration to the integration agent).

## Details

- **Constitution** *(structure PORTED per R16; full body content queued as bk-026)*:
  - [constitution/00-charter.md](constitution/00-charter.md)
  - [constitution/01-architectural-principles.md](constitution/01-architectural-principles.md) (Extension-over-modification + 5-level priority + batch design + upgrade compat)
  - [constitution/02-governance-and-objects.md](constitution/02-governance-and-objects.md) (RACI + object category framework + complexity)
  - [constitution/03-object-type-standards.md](constitution/03-object-type-standards.md) (10 categories, Object-ID prefixes: EXT/BDC/OPR/INT/DEN/SEC/WFL)
  - [constitution/04-extension-coding-standards.md](constitution/04-extension-coding-standards.md) (X++ standards, 32-type extension catalogue)
  - [constitution/05-development-and-alm.md](constitution/05-development-and-alm.md) (environments, DevOps, source control, Key Vault for INT)
  - [constitution/06-documentation-and-change.md](constitution/06-documentation-and-change.md) (mandatory artefacts per category, `*` markers)
  - [constitution/07-alm-configuration.md](constitution/07-alm-configuration.md) (work-item hierarchy, field/priority/status maps)
  - [constitution/08-nfr-targets.md](constitution/08-nfr-targets.md) (AOS response, batch throughput, entity import rates)

- **Templates**: generic FastTrack-shaped from `_reference/` starters; full per-section verbatim port queued as bk-026.

- **Commands**:
  - Base 17 (per `agents.yaml base-commands: true`)
  - Extra: `/lcs-deploy`, `/dmf-package`

- **docScope**: `fdd: feature`, `tdd: feature`, `blueprint: feature` per [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md). Each feature has its own document set.

- **Design doc**: [design/agents/d365-fo.md](../../design/agents/d365-fo.md)
- **Related ADRs**: [ADR-0006](../../design/adr/0006-doc-scope-domain-vs-feature.md), [ADR-0010](../../design/adr/0010-templates-agent-owned.md), [ADR-0001](../../design/adr/0001-review-scope-spec-only.md)

## F&O-specific authoring conventions

- `(*)` mandatory section markers gate downstream commands (refuses to `/tdd` if `*`-marked FDD sections empty)
- "Not Applicable" semantics - never empty/blank
- Object-ID prefixes for FDD->TDD->task traceability (EXT-NNN / BDC-NNN / OPR-NNN / INT-NNN / DEN-NNN / SEC-NNN / WFL-NNN)
- `<TBD>` convention + per-feature Issues / Open Items roll-up
- Quality Checklist mandatory at end of every TDD (self-review enforcement)
- Pseudocode required on every method in TDD §5
- Review classifications: BLOCKER / REQUIRED / WARNING

## Backlog items unblocked

- **bk-026** d365-fo agent design doc - this agent's structure is in place; full verbatim port from predecessor source is the bk-026 authoring work (constitution body + template body + review-checklist categories)
