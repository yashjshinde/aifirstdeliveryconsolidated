# Data Migration — GitHub Copilot Agent Template

This folder is a deployable template for the **Data Migration delivery agent** for GitHub Copilot in VS Code.

The Data Migration agent takes an ADF-based migration or integration requirement from plain-language description to production-ready Azure Data Factory pipelines, SQL staging schemas, and Dataverse/SFTP artefacts — following your project's constitution rules at every step.

Supports bidirectional patterns: SFTP → Dataverse, Dataverse → SFTP, SQL → Dataverse, Dataverse → SQL, SFTP → SQL, SQL → SFTP.

## What's included

```
.github/
  agents/
    data-migration.agent.md                                  ← Custom agent definition
  prompts/
    data-migration-spec.prompt.md                            ← /data-migration-spec
    data-migration-spec-alm.prompt.md                        ← /data-migration-spec-alm
    data-migration-review.prompt.md                          ← /data-migration-review
    data-migration-split-spec.prompt.md                      ← /data-migration-split-spec
    data-migration-impact.prompt.md                          ← /data-migration-impact
    data-migration-mapping.prompt.md                         ← /data-migration-mapping
    data-migration-pipeline.prompt.md                        ← /data-migration-pipeline
    data-migration-testplan.prompt.md                        ← /data-migration-testplan
    data-migration-extract.prompt.md                         ← /data-migration-extract
    data-migration-plan.prompt.md                            ← /data-migration-plan
    data-migration-clarify.prompt.md                         ← /data-migration-clarify
    data-migration-tdd.prompt.md                             ← /data-migration-tdd
    data-migration-blueprint.prompt.md                       ← /data-migration-blueprint
    data-migration-task.prompt.md                            ← /data-migration-task
    data-migration-validate.prompt.md                        ← /data-migration-validate
    data-migration-implement.prompt.md                       ← /data-migration-implement
    data-migration-document.prompt.md                        ← /data-migration-document
    data-migration-alm.prompt.md                             ← /data-migration-alm
  instructions/
    data-migration-constitution.instructions.md              ← Always-on rules (auto-injected)
constitution/                                                ← Data Migration rules
doc-templates/                                               ← Documentation templates
specs/                                                       ← Generated: spec.md, review.md
plans/                                                       ← Generated: plan.md, work-items.yaml
tasks/                                                       ← Generated: NN-{name}.md task cards
output/                                                      ← Generated: adf/, sql/, tests/, alm/
docs-generated/                                              ← Generated: all documents
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project root (or merge)
2. **Copy the `constitution/` folder** from `templates/data-migration/constitution/`
3. **Copy the `doc-templates/` folder** from `templates/data-migration/doc-templates/`
4. Create empty folders: `specs/`, `plans/`, `tasks/`, `output/`, `docs-generated/`
5. Configure `constitution/10-alm-configuration.md` with migration direction, environments, SFTP, and ADF settings

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **Data Migration Agent**
3. Type naturally, e.g.:
   - `Write a spec for an SFTP to Dataverse account load`
   - `Generate the field mapping for sftp-to-dv-accounts`
   - `Implement the ADF pipelines for sftp-to-dv-accounts`

### Option B — Invoke a prompt directly

- `/data-migration-spec` — write the migration specification (13-section)
- `/data-migration-spec-alm` — import and enhance ALM work items (structured intake)
- `/data-migration-review` — validate the spec against the constitution (APPROVED gate)
- `/data-migration-split-spec` — split a mixed migration + CE / integration spec
- `/data-migration-impact` — brownfield impact analysis (IMPACT-ASSESSED gate)
- `/data-migration-mapping` — generate the field mapping document
- `/data-migration-pipeline` — generate the ADF pipeline design
- `/data-migration-testplan` — generate the test plan and strategy
- `/data-migration-extract` — extract test plan / suites / cases to ALM-ready files
- `/data-migration-plan` — generate the technical work item plan
- `/data-migration-clarify` — review plan for task-readiness (TASK-READY gate)
- `/data-migration-tdd` — generate the Technical Design Document
- `/data-migration-blueprint` — generate the Solution Blueprint
- `/data-migration-task` — generate dev-ready task cards
- `/data-migration-validate` — validate task cards (READY TO IMPLEMENT gate)
- `/data-migration-implement` — generate ADF pipelines, SQL schemas, ARM templates, test data
- `/data-migration-document` — generate deployment guide, runbook, release notes
- `/data-migration-alm` — synchronise work items with Azure DevOps

## Workflow

```
PHASE 1 — DEFINE

  /data-migration-spec {migration-id}        → specs/{m}/spec.md
  /data-migration-review {m}                 → specs/{m}/review.md          ← APPROVED gate
  /data-migration-mapping {m}                → docs-generated/{m}/field-mapping.md
  /data-migration-pipeline {m}               → docs-generated/{m}/pipeline-design.md
  /data-migration-testplan {m}               → docs-generated/{m}/test-plan-and-strategy.md
  /data-migration-extract testplan {m}       → docs-generated/{m}/alm-extract/

  [Brownfield only]
  /data-migration-impact {m}                 → specs/{m}/impact-analysis.md  ← IMPACT-ASSESSED gate

PHASE 2 — DESIGN

  /data-migration-plan {m}                   → plans/{m}/plan.md + work-items.yaml
                                               plans/_component-registry.md (updated)
  /data-migration-clarify {m}                → plans/{m}/clarify.md          ← TASK-READY gate
  /data-migration-tdd {m}                    → docs-generated/{m}/technical-design-document.md
  /data-migration-blueprint {m}              → docs-generated/{m}/solution-blueprint.md

PHASE 3 — BUILD

  /data-migration-task {m}                   → tasks/{m}/NN-{name}.md
  /data-migration-validate {m}               → updates validation-status in each card
  /data-migration-implement {m}              → output/{m}/adf/, sql/, tests/
  /data-migration-document {m}               → docs-generated/{m}/deployment-guide.md + runbook + release-notes
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `/spec`, `/review`, `/implement` | `/data-migration-spec`, `/data-migration-review` etc. (prefixed) |
| `constitution/CLAUDE.md` auto-loaded | Agent body + `.instructions.md` auto-injected for `docs-generated/**` |
| 4 approval gates: APPROVED → IMPACT-ASSESSED → TASK-READY → READY TO IMPLEMENT | Same gates, same sequence |
| Brownfield adjustments via `/impact` | Same — enabled via `constitution/10-alm-configuration.md` |

## Notes

- Four approval gates must be passed in sequence — the agent enforces them
- **Brownfield mode** adds `/data-migration-impact` between review and plan — enable in `constitution/10-alm-configuration.md`
- Factor rates for each migration direction are sourced from `constitution/10-alm-configuration.md` — never hardcoded
- `/data-migration-implement` generates ADF Linked Services, Datasets, Data Flows, Pipelines, Triggers, ARM template, SQL DDL, stored procedures, test data, and test scripts in the correct deployment order
- The `/data-migration-extract` sub-commands (`testplan` | `testsuites` | `testcases`) write JSON as the primary ALM import artifact — full rich content with steps as `{ step, action, expected }` arrays
