# Azure Integration — GitHub Copilot Agent Template

This folder is a deployable template for the **Azure Integration delivery agent** for GitHub Copilot in VS Code.

The Azure Integration agent takes an integration requirement from plain-language description to production-ready Azure Functions, Logic Apps, Service Bus schemas, APIM policies, and Bicep IaC — following your project's constitution rules at every step.

## What's included

```
.github/
  agents/
    integration.agent.md                                     ← Custom agent definition
  prompts/
    integration-spec.prompt.md                               ← /integration-spec
    integration-spec-alm.prompt.md                           ← /integration-spec-alm
    integration-review.prompt.md                             ← /integration-review
    integration-split-spec.prompt.md                         ← /integration-split-spec
    integration-impact.prompt.md                             ← /integration-impact
    integration-fdd.prompt.md                                ← /integration-fdd
    integration-testplan.prompt.md                           ← /integration-testplan
    integration-extract.prompt.md                            ← /integration-extract
    integration-plan.prompt.md                               ← /integration-plan
    integration-clarify.prompt.md                            ← /integration-clarify
    integration-tdd.prompt.md                                ← /integration-tdd
    integration-blueprint.prompt.md                          ← /integration-blueprint
    integration-task.prompt.md                               ← /integration-task
    integration-validate.prompt.md                           ← /integration-validate
    integration-implement.prompt.md                          ← /integration-implement
    integration-document.prompt.md                           ← /integration-document
    integration-alm.prompt.md                                ← /integration-alm
  instructions/
    integration-constitution.instructions.md                 ← Always-on rules (auto-injected)
constitution/                                                ← Azure Integration rules
doc-templates/                                               ← Documentation templates
specs/                                                       ← Generated: spec.md, review.md
plans/                                                       ← Generated: plan.md, work-items.yaml
tasks/                                                       ← Generated: NN-{name}.md task cards
output/                                                      ← Generated: src/, infrastructure/, tests/, alm/
docs-generated/                                              ← Generated: all documents
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project root (or merge)
2. **Copy the `constitution/` folder** from `templates/integration/constitution/`
3. **Copy the `doc-templates/` folder** from `templates/integration/doc-templates/`
4. Create empty folders: `specs/`, `plans/`, `tasks/`, `output/`, `docs-generated/`
5. Configure `constitution/10-alm-configuration.md` with ALM settings, intake mode, and brownfield config

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **Azure Integration Agent**
3. Type naturally, e.g.:
   - `Write a spec for an order-created event processor`
   - `Generate the FDD for order-event-processor`
   - `Implement the Bicep infrastructure for order-event-processor`

### Option B — Invoke a prompt directly

- `/integration-spec` — write the functional specification
- `/integration-spec-alm` — import and enhance ALM work items (structured intake)
- `/integration-review` — validate the spec against the constitution (APPROVED gate)
- `/integration-split-spec` — split a mixed integration + CE / Power Apps / Data Migration spec
- `/integration-impact` — brownfield impact analysis (IMPACT-ASSESSED gate)
- `/integration-fdd` — generate the Functional Design Document
- `/integration-testplan` — generate the test plan and strategy (6 suites: contract, integration, performance, security, chaos, UAT)
- `/integration-extract` — extract test plan / suites / cases to ALM-ready files
- `/integration-plan` — generate the technical work item plan
- `/integration-clarify` — review plan for task-readiness (TASK-READY gate)
- `/integration-tdd` — generate the Technical Design Document
- `/integration-blueprint` — generate the Solution Blueprint (5 architecture patterns)
- `/integration-task` — generate dev-ready task cards
- `/integration-validate` — validate task cards (READY TO IMPLEMENT gate)
- `/integration-implement` — generate Azure Functions, Logic Apps, APIM policy, Bicep IaC, Service Bus schema
- `/integration-document` — generate API contract, message schema, runbook, deployment guide
- `/integration-alm` — synchronise work items with Azure DevOps

## Workflow

```
PHASE 1 — DEFINE

  /integration-spec {feature}                → specs/{f}/spec.md
  /integration-review {f}                    → specs/{f}/review.md             ← APPROVED gate
  /integration-fdd {f}                       → docs-generated/{f}/functional-design-document.md
  /integration-testplan {f}                  → docs-generated/{f}/test-plan-and-strategy.md
  /integration-extract testplan {f}          → docs-generated/{f}/alm-extract/

  [Brownfield only]
  /integration-impact {f}                    → specs/{f}/impact-analysis.md    ← IMPACT-ASSESSED gate

PHASE 2 — DESIGN

  /integration-plan {f}                      → plans/{f}/plan.md + work-items.yaml
                                               plans/_component-registry.md (updated)
  /integration-clarify {f}                   → plans/{f}/clarify.md            ← TASK-READY gate
  /integration-tdd {f}                       → docs-generated/{f}/technical-design-document.md
  /integration-blueprint {f}                 → docs-generated/{f}/solution-blueprint.md

PHASE 3 — BUILD

  /integration-task {f}                      → tasks/{f}/NN-{name}.md
  /integration-validate {f}                  → updates validation-status in each card
  /integration-implement {f}/{task-card}     → output/{f}/src/, infrastructure/, tests/
  /integration-document {f}                  → docs-generated/{f}/api-contract.md + message-schema + runbook + deployment-guide
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `/spec`, `/review`, `/fdd`, `/implement` | `/integration-spec`, `/integration-review` etc. (prefixed) |
| `constitution/CLAUDE.md` auto-loaded | Agent body + `.instructions.md` auto-injected for `docs-generated/**` |
| 4 approval gates in sequence | Same gates — APPROVED → IMPACT-ASSESSED → TASK-READY → READY TO IMPLEMENT |
| 5 architecture patterns: Event-Driven, Request-Response, Orchestration, Hybrid, Fan-out/Fan-in | Same — selected during `/integration-blueprint` |

## Notes

- Four approval gates must be passed in sequence — the agent enforces them
- **Brownfield mode** adds `/integration-impact` between review and plan — enable in `constitution/10-alm-configuration.md`
- Test plan generates 6 suites: contract (message schema), integration (end-to-end), performance, security, chaos/resilience, UAT
- The `/integration-extract` sub-commands (`testplan` | `testsuites` | `testcases`) write JSON as the primary ALM import artifact with steps as `{ step, action, expected }` arrays
- Managed Identity and Key Vault references are enforced — no hardcoded connection strings
- Bicep IaC must be deployed before application code — the agent enforces this dependency order
