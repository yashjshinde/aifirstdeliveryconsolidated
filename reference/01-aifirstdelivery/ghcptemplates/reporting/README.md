# Reporting — GitHub Copilot Agent Template

This folder is a deployable template for the **Reporting delivery agent** for GitHub Copilot in VS Code.

The Reporting agent takes a reporting requirement from plain-language description to documented, deployment-ready assets — Power BI datasets, DAX measures, RLS configurations, SSRS stored procedures, RDL specifications, and operational documentation.

Supports: Power BI Interactive, Power BI Paginated, and SSRS reports.

## What's included

```
.github/
  agents/
    reporting.agent.md                                       ← Custom agent definition
  prompts/
    reporting-spec.prompt.md                                 ← /reporting-spec
    reporting-spec-alm.prompt.md                             ← /reporting-spec-alm
    reporting-review.prompt.md                               ← /reporting-review
    reporting-split-spec.prompt.md                           ← /reporting-split-spec
    reporting-impact.prompt.md                               ← /reporting-impact
    reporting-fdd.prompt.md                                  ← /reporting-fdd
    reporting-testplan.prompt.md                             ← /reporting-testplan
    reporting-extract.prompt.md                              ← /reporting-extract
    reporting-plan.prompt.md                                 ← /reporting-plan
    reporting-clarify.prompt.md                              ← /reporting-clarify
    reporting-tdd.prompt.md                                  ← /reporting-tdd
    reporting-blueprint.prompt.md                            ← /reporting-blueprint
    reporting-task.prompt.md                                 ← /reporting-task
    reporting-validate.prompt.md                             ← /reporting-validate
    reporting-implement.prompt.md                            ← /reporting-implement
    reporting-document.prompt.md                             ← /reporting-document
    reporting-alm.prompt.md                                  ← /reporting-alm
  instructions/
    reporting-constitution.instructions.md                   ← Always-on rules (auto-injected)
constitution/                                                ← 13 reporting rules files
doc-templates/                                               ← Documentation templates
specs/                                                       ← Generated: spec.md, review.md, impact-analysis.md
plans/                                                       ← Generated: plan.md, work-items.yaml, clarify.md
tasks/                                                       ← Generated: NN-{name}.md task cards
output/                                                      ← Generated: datasets/, measures/, rls/, reports/, rdl/, sql/, alm/
docs-generated/                                              ← Generated: FDD, TDD, blueprint, test plan, deployment guide, alm-extract/
```

## Source of truth

**Claude commands are the source of truth.** The GHCP prompt files are generated — do not edit them directly.

| Edit here | Then run |
|---|---|
| `templates/reporting/.claude/commands/*.md` | `.\tools\generate-prompts.ps1` |

The script adds the GHCP YAML frontmatter and prefixes all command references (`/spec` → `/reporting-spec`). File path references (e.g., `specs/{f}/review.md`) are preserved as-is.

```powershell
# Regenerate all 17 prompt files
cd ghcptemplates/reporting
.\tools\generate-prompts.ps1

# Regenerate a single command
.\tools\generate-prompts.ps1 -Command spec
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project root (or merge with an existing `.github/` folder)
2. **Copy the `constitution/` folder** to your project root
3. **Copy the `doc-templates/` folder** to your project root
4. Create empty folders: `specs/`, `plans/`, `tasks/`, `output/`, `docs-generated/`
5. Configure `constitution/10-alm-configuration.md` — set workspace prefix, ALM settings, SSRS section (if applicable), and brownfield settings (if applicable)

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **Reporting Agent**
3. Type naturally, e.g.:
   - `Write a spec for a Power BI sales performance dashboard`
   - `Generate the FDD for sales-performance-dashboard`
   - `Implement the star schema dataset for sales-performance-dashboard`

### Option B — Invoke a prompt directly

- `/reporting-spec` — write the functional specification
- `/reporting-spec-alm` — import and enhance ALM work items (structured intake)
- `/reporting-review` — validate the spec against the constitution (APPROVED gate)
- `/reporting-split-spec` — split a mixed Reporting + CE / Integration / Data Migration spec
- `/reporting-impact` — brownfield impact analysis (IMPACT-ASSESSED gate — brownfield only)
- `/reporting-fdd` — generate the Functional Design Document
- `/reporting-testplan` — generate the test plan and strategy (4 suites)
- `/reporting-extract` — extract test plan / suites / cases to ALM-ready files
- `/reporting-plan` — generate the technical work item plan
- `/reporting-clarify` — review plan for task-readiness (TASK-READY gate)
- `/reporting-tdd` — generate the Technical Design Document (star schema, DAX catalogue, RLS expressions)
- `/reporting-blueprint` — generate the Solution Blueprint
- `/reporting-task` — generate dev-ready task cards
- `/reporting-validate` — validate task cards (READY TO IMPLEMENT gate)
- `/reporting-implement` — generate TMDL, DAX measure files, RLS definitions, report specs, RDL specs, SQL stored procedures
- `/reporting-document` — generate data dictionary, deployment guide, asset registry, release notes
- `/reporting-alm` — synchronise work items with Azure DevOps

## Workflow

```
PHASE 1 — DEFINE

  /reporting-spec {feature}                  → specs/{f}/spec.md
  /reporting-review {f}                      → specs/{f}/review.md              ← APPROVED gate
  /reporting-fdd {f}                         → docs-generated/{f}/functional-design-document.md
  /reporting-testplan {f}                    → docs-generated/{f}/test-plan-and-strategy.md
  /reporting-extract testplan {f}            → docs-generated/{f}/alm-extract/

  [Brownfield only — run before /reporting-plan]
  /reporting-impact {f}                      → specs/{f}/impact-analysis.md     ← IMPACT-ASSESSED gate

PHASE 2 — DESIGN

  /reporting-plan {f}                        → plans/{f}/plan.md + work-items.yaml
                                               plans/_component-registry.md (updated)
  /reporting-clarify {f}                     → plans/{f}/clarify.md             ← TASK-READY gate
  /reporting-tdd {f}                         → docs-generated/{f}/technical-design-document.md
  /reporting-blueprint {f}                   → docs-generated/{f}/solution-blueprint.md

PHASE 3 — BUILD

  /reporting-task {f}                        → tasks/{f}/NN-{name}.md
  /reporting-validate {f}                    → updates validation-status in each card    ← READY TO IMPLEMENT gate
  /reporting-implement {f}/{task-card}       → output/{f}/datasets/, measures/, rls/, reports/, rdl/, sql/
  /reporting-document {f}                    → docs-generated/{f}/data-dictionary.md + deployment-guide + asset-registry + release-notes
  /reporting-alm {f}                         → output/{f}/alm/extract-{timestamp}.json (sync to Azure DevOps)
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `/spec`, `/review`, `/fdd` etc. | `/reporting-spec`, `/reporting-review` etc. (prefixed) |
| `constitution/CLAUDE.md` auto-loaded | `reporting.agent.md` body + `reporting-constitution.instructions.md` auto-injected |
| 4 approval gates in sequence | Same gates — APPROVED → IMPACT-ASSESSED → TASK-READY → READY TO IMPLEMENT |
| 17 commands | 17 commands (same workflow) |

## Spec Coverage — What the Spec Captures

`/reporting-spec` generates a comprehensive spec covering:

| Section | Content |
|---|---|
| §3 Report Catalogue | Report name, type, workspace, sensitivity label, environment naming |
| §5 Functional Requirements | Per-FR: Report type, audience, canvas size, data sources, RLS roles + named test users, accessibility requirements, embedding scenarios, export/delivery (subscription details + stored proc name for SSRS), KPIs in 6-column format |
| §6 Report Impact Summary | Sensitivity label column; reports sourcing D365 entity data must be Confidential minimum |
| §7 Business Rules | All BR-NNN referenced in §5 |
| §8 Data Model Requirements | Star schema, date dimension columns, relationship direction rules, cross-reference to brownfield entity-catalogue |
| §8a Dataflow Dependencies | Dataflow-to-dataset dependencies, incremental refresh config, refresh sequencing |
| §9 Assumptions and Constraints | Credential storage per data source, capacity tier, 3-year row growth estimate per fact table |
| §14 Traceability Matrix | ALM Epic / Feature / Story ID columns |
| §15 Brownfield Context | 7-column KPI mapping table (FR \| KPI \| Logic \| Table Name \| Field Names \| Action \| Remarks) — only when brownfield.enabled = true |

### KPI Table Format

All measures/KPIs in §5 must use this **6-column format**:

| KPI | Logic | Table Name | Field Names / Filters Applied | Display Format | Remarks |
|---|---|---|---|---|---|

All §15 brownfield mapping rows use this **7-column format** (adds Action):

| FR | KPI | Logic | Table Name | Field Names / Filters Applied | Action | Remarks |
|---|---|---|---|---|---|---|

Action values: **NEW** | **EXTEND** | **REPLACE** | **REFERENCED**

## Review Coverage — What `/reporting-review` Checks

Enhanced review checks across 4 categories:

**Category 0 — Multi-Domain Detection** (CE / Integration / Data Migration signals → BLOCKER if found)

**Category 1 — Completeness** (16 checks):
- KPI table has all 6 columns including Display Format — **BLOCKER**
- Every RLS role has a named test user — **BLOCKER**
- Sensitivity Label column present in §6 — **BLOCKER**
- §8a (Dataflow Dependencies) populated — **Required**
- §15 Brownfield Context populated when brownfield.enabled — **Required (brownfield only)**

**Category 2 — Constitution Compliance** (14 checks):
- No flat denormalised table as sole dataset — **BLOCKER**
- Date dimension table present — **BLOCKER**
- No bidirectional relationships without justification — **BLOCKER**
- Sensitivity label not assigned — **BLOCKER**
- No service principal for embedding — **BLOCKER**
- WCAG accessibility present — **Required**
- Incremental refresh addressed for datasets > 10M rows — **Required**

**Category 3 — Implementation Readiness** (8 checks):
- RLS test users identified for each role — **BLOCKER**
- All data sources named (not TBD) — **BLOCKER**

**Category 4 — Traceability** (3 checks)

## Plan Coverage — What `/reporting-plan` Produces

`/reporting-plan` decomposes the spec into a 4-level work item hierarchy:

```
Epic (L1 — Reporting Capability)
  └─ Feature (L2 — Functional Grouping: Dataset, Report Build, RLS, Deployment)
       └─ User Story (L3 — As a {persona}, I want {report}, so that {value})
             └─ Task (L4 — WHAT to build)
```

Each Task (L4) has:
- Component type: Dataset | DataModel | Measure | RLS | Report-Interactive | Report-Paginated | Report-SSRS | Dataflow | Configuration | Deployment | Testing
- Role: Developer | BI Developer | Data Engineer | QA | Functional
- Complexity: S | M | L | XL
- Brownfield action (brownfield only): NEW | EXTEND | REPLACE | REFERENCED
- Mandatory paired test tasks auto-generated

**Implementation phases:**
- Phase 1: DataModel + Dataflow + workspace/gateway configuration
- Phase 2: Measure + RLS tasks
- Phase 3: Report build tasks
- Phase 4: Testing + deployment pipeline configuration

## Brownfield Mode

Enable in `constitution/10-alm-configuration.md`:

```yaml
brownfield:
  enabled: true
  docs-path: ../d365-ce-brownfield/docs-generated
```

`docs-path` must point to the brownfield agent's `docs-generated/` **ROOT** folder — not a subfolder.

When enabled, every command reads the full brownfield documentation set before generating output:

| Document | Path | Purpose |
|---|---|---|
| Solution overview | `{docs-path}/component-inventory.md` | Component counts and package breakdown |
| **Entity catalogue** | `{docs-path}/functional/entity-catalogue.md` | **Primary source** — all D365/Dataverse entities with attributes, field names, data types |
| Functional overview | `{docs-path}/functional/functional-overview.md` | Business process context |
| Security model | `{docs-path}/functional/security-model.md` | Existing security roles and access patterns |
| Data model | `{docs-path}/architecture/data-model.md` | Entity relationships and cardinality |
| Solution blueprint | `{docs-path}/architecture/solution-blueprint.md` | Solution architecture |
| Reporting inventory | `{docs-path}/reporting/reporting-inventory.md` | Existing reports, data sources, workspaces |
| SSRS reports | `{docs-path}/reporting/ssrs/{ReportName}.md` | Per-SSRS-report detail |
| Power BI reports | `{docs-path}/reporting/power-bi/{ReportName}.md` | Per-Power-BI-report inventory |

This ensures KPIs and attributes are mapped to **existing D365 entities and fields** from `entity-catalogue.md` rather than invented new. The brownfield gate (`/reporting-impact`) must be run before `/reporting-plan` when brownfield mode is enabled.

## Notes

- Four approval gates must be passed in sequence — the agent enforces them
- **RLS** not defined for a role mentioned in the spec is a BLOCKER at review
- **Sensitivity labels** are mandatory on all reports and datasets — missing label is a BLOCKER
- **WCAG AA** contrast ratio ≥ 4.5:1 is mandatory for all interactive and embedded reports
- Test plan generates 4 suites: Data Accuracy, UAT, RLS Security, Regression
- Test tasks are auto-generated: `TEST-{id}-data-accuracy`, `TEST-{id}-rls-validation`, `TEST-{id}-visual-render`
- Datasets must be deployed before measures; measures and RLS before reports; workspace before deployment pipeline
- The `/reporting-extract` sub-commands (`testplan` | `testsuites` | `testcases`) write JSON as the primary ALM import artifact with `content-format: "markdown"` preserved
- `/reporting-implement` generates TMDL files (star schema), DAX measure files, RLS role definitions, report page specs, RDL specs, and SQL stored procedures
