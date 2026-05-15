# Power Apps — GitHub Copilot Agent Template

This folder is a deployable template for the **Power Apps delivery agent** for GitHub Copilot in VS Code.

The Power Apps agent takes a Power Platform requirement from plain-language description to production-ready Canvas Apps, Power Automate Flows, Copilot Studio agents, Model-Driven Apps, and Dataverse Schema — following your project's constitution rules at every step.

## What's included

```
.github/
  agents/
    power-apps.agent.md                                      ← Custom agent definition
  prompts/
    power-apps-spec.prompt.md                                ← /power-apps-spec
    power-apps-spec-alm.prompt.md                            ← /power-apps-spec-alm
    power-apps-review.prompt.md                              ← /power-apps-review
    power-apps-split-spec.prompt.md                          ← /power-apps-split-spec
    power-apps-impact.prompt.md                              ← /power-apps-impact
    power-apps-fdd.prompt.md                                 ← /power-apps-fdd
    power-apps-testplan.prompt.md                            ← /power-apps-testplan
    power-apps-extract.prompt.md                             ← /power-apps-extract
    power-apps-plan.prompt.md                                ← /power-apps-plan
    power-apps-clarify.prompt.md                             ← /power-apps-clarify
    power-apps-tdd.prompt.md                                 ← /power-apps-tdd
    power-apps-blueprint.prompt.md                           ← /power-apps-blueprint
    power-apps-task.prompt.md                                ← /power-apps-task
    power-apps-validate.prompt.md                            ← /power-apps-validate
    power-apps-implement.prompt.md                           ← /power-apps-implement
    power-apps-document.prompt.md                            ← /power-apps-document
    power-apps-alm.prompt.md                                 ← /power-apps-alm
  instructions/
    power-apps-constitution.instructions.md                  ← Always-on rules (auto-injected)
constitution/                                                ← Power Platform rules
doc-templates/                                               ← Documentation templates
specs/                                                       ← Generated: spec.md, review.md
plans/                                                       ← Generated: plan.md, work-items.yaml
tasks/                                                       ← Generated: NN-{name}.md task cards
output/                                                      ← Generated: src/, impl-docs/, alm/
docs-generated/                                              ← Generated: all documents
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project root (or merge)
2. **Copy the `constitution/` folder** from `templates/power-apps/constitution/`
3. **Copy the `doc-templates/` folder** from `templates/power-apps/doc-templates/`
4. Create empty folders: `specs/`, `plans/`, `tasks/`, `output/`, `docs-generated/`
5. Configure `constitution/04-dataverse-schema.md` with publisher prefix, and `constitution/10-alm-configuration.md` with ALM settings

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **Power Apps Agent**
3. Type naturally, e.g.:
   - `Write a spec for a customer request tracker canvas app`
   - `Generate the FDD for customer-request-tracker`
   - `Implement the Dataverse schema for customer-request-tracker`

### Option B — Invoke a prompt directly

- `/power-apps-spec` — write the functional specification
- `/power-apps-spec-alm` — import and enhance ALM work items (structured intake)
- `/power-apps-review` — validate the spec against the constitution (APPROVED gate)
- `/power-apps-split-spec` — split a mixed Power Apps + Integration + Data Migration spec
- `/power-apps-impact` — brownfield impact analysis (IMPACT-ASSESSED gate)
- `/power-apps-fdd` — generate the Functional Design Document
- `/power-apps-testplan` — generate the test plan and strategy (7 suites: Canvas, Model-Driven, Flow, Copilot, Security, UAT, Regression)
- `/power-apps-extract` — extract test plan / suites / cases to ALM-ready files
- `/power-apps-plan` — generate the technical work item plan
- `/power-apps-clarify` — review plan for task-readiness (TASK-READY gate)
- `/power-apps-tdd` — generate the Technical Design Document
- `/power-apps-blueprint` — generate the Solution Blueprint (5 patterns: Canvas-First, Model-Driven-First, Copilot-Led, Flow-Orchestrated, Hybrid)
- `/power-apps-task` — generate dev-ready task cards
- `/power-apps-validate` — validate task cards (READY TO IMPLEMENT gate)
- `/power-apps-implement` — generate Canvas App Power Fx YAML, Flow JSON, Copilot topic YAML, Dataverse schema
- `/power-apps-document` — generate app design, flow docs, deployment guide, user guide
- `/power-apps-alm` — synchronise work items with Azure DevOps

## Workflow

```
PHASE 1 — DEFINE

  /power-apps-spec {feature}                 → specs/{f}/spec.md
  /power-apps-review {f}                     → specs/{f}/review.md              ← APPROVED gate
  /power-apps-fdd {f}                        → docs-generated/{f}/functional-design-document.md
  /power-apps-testplan {f}                   → docs-generated/{f}/test-plan-and-strategy.md
  /power-apps-extract testplan {f}           → docs-generated/{f}/alm-extract/

  [Brownfield only]
  /power-apps-impact {f}                     → specs/{f}/impact-analysis.md     ← IMPACT-ASSESSED gate

PHASE 2 — DESIGN

  /power-apps-plan {f}                       → plans/{f}/plan.md + work-items.yaml
                                               plans/_component-registry.md (updated)
  /power-apps-clarify {f}                    → plans/{f}/clarify.md             ← TASK-READY gate
  /power-apps-tdd {f}                        → docs-generated/{f}/technical-design-document.md
  /power-apps-blueprint {f}                  → docs-generated/{f}/solution-blueprint.md

PHASE 3 — BUILD

  /power-apps-task {f}                       → tasks/{f}/NN-{name}.md
  /power-apps-validate {f}                   → updates validation-status in each card
  /power-apps-implement {f}/{task-card}      → output/{f}/src/CanvasApps/, Flows/, CopilotStudio/, DataverseSchema/
  /power-apps-document {f}                   → docs-generated/{f}/app-design.md + flow-documentation + deployment-guide + user-guide
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `/spec`, `/review`, `/fdd`, `/implement` | `/power-apps-spec`, `/power-apps-review` etc. (prefixed) |
| `constitution/CLAUDE.md` auto-loaded | Agent body + `.instructions.md` auto-injected for `docs-generated/**` |
| 4 approval gates in sequence | Same gates — APPROVED → IMPACT-ASSESSED → TASK-READY → READY TO IMPLEMENT |
| 5 architecture patterns for Power Platform | Same — Canvas-First, Model-Driven-First, Copilot-Led, Flow-Orchestrated, Hybrid |

## Notes

- Four approval gates must be passed in sequence — the agent enforces them
- **Brownfield mode** adds `/power-apps-impact` between review and plan — enable in `constitution/10-alm-configuration.md`
- Delegation-unsafe filters on large Dataverse tables are a BLOCKER — the agent enforces this at review and validate
- Test plan generates 7 suites: Canvas App, Model-Driven App, Flow, Copilot Studio, Security, UAT, Regression
- The `/power-apps-extract` sub-commands (`testplan` | `testsuites` | `testcases`) write JSON as the primary ALM import artifact
- DLP policy compliance is enforced — no unapproved connectors
- Dataverse schema changes must be deployed before any Canvas App, Flow, or Copilot topic that reads or writes those tables
