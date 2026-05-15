# D365 CE — GitHub Copilot Agent Template

This folder is a deployable template for the **D365 CE delivery agent** for GitHub Copilot in VS Code.

## What's included

```
.github/
  agents/
    d365-ce.agent.md              ← Custom agent definition (select from Copilot agent picker)
  prompts/
    d365-ce-spec.prompt.md        ← /d365-ce-spec       — write functional spec
    d365-ce-spec-alm.prompt.md    ← /d365-ce-spec-alm   — structured ALM intake (L1/L2/L3)
    d365-ce-review.prompt.md      ← /d365-ce-review     — review and gate-check spec
    d365-ce-split-spec.prompt.md  ← /d365-ce-split-spec — split mixed CE+Integration+DM+RPT spec
    d365-ce-impact.prompt.md      ← /d365-ce-impact     — brownfield impact analysis
    d365-ce-plan.prompt.md        ← /d365-ce-plan       — technical decomposition
    d365-ce-clarify.prompt.md     ← /d365-ce-clarify    — plan readiness check
    d365-ce-fdd.prompt.md         ← /d365-ce-fdd        — Functional Design Document
    d365-ce-testplan.prompt.md    ← /d365-ce-testplan   — Test Plan and Strategy
    d365-ce-tdd.prompt.md         ← /d365-ce-tdd        — Technical Design Document
    d365-ce-blueprint.prompt.md   ← /d365-ce-blueprint  — Solution Blueprint
    d365-ce-task.prompt.md        ← /d365-ce-task       — task card generation
    d365-ce-validate.prompt.md    ← /d365-ce-validate   — pre-implement validation
    d365-ce-implement.prompt.md   ← /d365-ce-implement  — code generation
    d365-ce-document.prompt.md    ← /d365-ce-document   — post-implement docs
    d365-ce-alm.prompt.md         ← /d365-ce-alm        — ALM work item sync
    d365-ce-extract.prompt.md     ← /d365-ce-extract    — test case ALM export
  instructions/
    d365-ce-constitution.instructions.md  ← Always-on rules (auto-injected for CE artifacts)
constitution/                     ← Domain rules — copy from templates/d365-ce/constitution/
doc-templates/                    ← Document templates — copy from templates/d365-ce/doc-templates/
specs/                            ← Generated specs land here
plans/                            ← Generated plans land here
tasks/                            ← Generated task cards land here
docs-generated/                   ← Generated FDD, TDD, Blueprint, Test Plans land here
output/                           ← Generated code and impl docs land here
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project's root (or merge if `.github/` already exists)
2. **Copy the `constitution/` folder** from `templates/d365-ce/constitution/` to your project root
3. **Copy the `doc-templates/` folder** from `templates/d365-ce/doc-templates/` to your project root
4. Create empty folders: `specs/`, `plans/`, `tasks/`, `docs-generated/`, `output/`
5. Customise `constitution/10-alm-configuration.md` with your project's ALM settings

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker (robot icon) → select **D365 CE Agent**
3. Type your request naturally, e.g.:
   - `Write a spec for customer loyalty points`
   - `Review the account-merge spec`
   - `Generate tasks for account-merge`

### Option B — Invoke a prompt directly

In Copilot Chat (any mode), type `/` and select a prompt:
- `/d365-ce-spec` — write a functional spec (plain-language intake)
- `/d365-ce-spec-alm` — structured ALM intake — import and enhance L1/L2/L3 work items
- `/d365-ce-review` — review an existing spec (APPROVED gate)
- `/d365-ce-split-spec` — split a mixed CE + Integration / Data Migration / Reporting spec
- `/d365-ce-impact` — brownfield impact analysis (IMPACT-ASSESSED gate — brownfield mode only)
- `/d365-ce-plan` — generate a technical plan
- `/d365-ce-clarify` — check plan readiness (TASK-READY gate)
- `/d365-ce-fdd` — generate FDD
- `/d365-ce-testplan` — generate test plan
- `/d365-ce-tdd` — generate TDD
- `/d365-ce-blueprint` — generate solution blueprint
- `/d365-ce-task` — generate task cards
- `/d365-ce-validate` — validate task cards (READY TO IMPLEMENT gate)
- `/d365-ce-implement` — generate code
- `/d365-ce-document` — generate post-implement docs
- `/d365-ce-alm` — ALM work item sync
- `/d365-ce-extract` — export test cases for ALM

## Workflow

```
PHASE 1 — DEFINE

  /d365-ce-spec {feature}         → specs/{feature}/spec.md
  [or /d365-ce-spec-alm {feature} → specs/{feature}/spec.md  (structured ALM intake)]
  /d365-ce-review {feature}       → specs/{feature}/review.md          ← APPROVED gate
  [/d365-ce-split-spec {feature}  → splits mixed-domain spec if needed]
  [/d365-ce-impact {feature}      → specs/{feature}/impact-analysis.md ← IMPACT-ASSESSED gate (brownfield)]
  /d365-ce-fdd {feature}          → docs-generated/{feature}/functional-design-document.md
  /d365-ce-testplan {feature}     → docs-generated/{feature}/test-plan-and-strategy.md

PHASE 2 — DESIGN

  /d365-ce-plan {feature}         → plans/{feature}/plan.md + work-items.yaml
                                    plans/_component-registry.md (updated)
  /d365-ce-clarify {feature}      → plans/{feature}/clarify.md         ← TASK-READY gate
  /d365-ce-tdd {feature}          → docs-generated/{feature}/technical-design-document.md
  /d365-ce-blueprint {feature}    → docs-generated/{feature}/solution-blueprint.md

PHASE 3 — BUILD

  /d365-ce-task {feature}         → tasks/{feature}/NN-{name}.md
  /d365-ce-validate {feature}     → updates validation-status in task cards  ← READY TO IMPLEMENT gate
  /d365-ce-implement {feature}    → output/{feature}/src/
  /d365-ce-document {feature}     → docs-generated/{feature}/ (deployment guide, release notes, etc.)
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `.claude/commands/*.md` | `.github/prompts/d365-ce-*.prompt.md` |
| `.claude/settings.json` (file permissions) | `tools:` array in `.agent.md` |
| `constitution/CLAUDE.md` (auto-loaded) | Agent body + `.instructions.md` (auto-injected) |
| Slash command auto-completes from `.claude/commands/` | Slash command auto-completes from `.github/prompts/` |
| Constitution read programmatically at start | Read by agent on first action (instruction in agent body) |

## Notes

- The `.instructions.md` file is **auto-injected** by Copilot when you open any file in `specs/`, `plans/`, `tasks/`, `output/`, or `docs-generated/` — keeping constitution rules always in context
- The agent reads `constitution/` files at the start of every command for the full, detailed rules
- All secrets must go through Azure Key Vault — the agent will flag any violation
- Gate checks are enforced by the agent — it will stop and tell you what to resolve if a pre-condition is not met
