# D365 F&O — GitHub Copilot Agent Template

This folder is a deployable template for the **D365 F&O delivery agent** for GitHub Copilot in VS Code.

## What's included

```
.github/
  agents/
    d365-fo.agent.md                  ← Custom agent definition
  prompts/
    d365-fo-fdd.prompt.md             ← /d365-fo-fdd         — Functional Design Specification
    d365-fo-fdd-review.prompt.md      ← /d365-fo-fdd-review  — FDD review and gate-check
    d365-fo-tdd.prompt.md             ← /d365-fo-tdd         — Technical Design Document
    d365-fo-tdd-review.prompt.md      ← /d365-fo-tdd-review  — TDD review and gate-check
    d365-fo-plan.prompt.md            ← /d365-fo-plan        — technical decomposition
    d365-fo-plan-review.prompt.md     ← /d365-fo-plan-review — plan readiness check
    d365-fo-testplan.prompt.md        ← /d365-fo-testplan    — Test Plan and Strategy
    d365-fo-implement.prompt.md       ← /d365-fo-implement   — X++ implementation
    d365-fo-blueprint.prompt.md       ← /d365-fo-blueprint   — Solution Blueprint
    d365-fo-document.prompt.md        ← /d365-fo-document    — post-implement docs
    d365-fo-split-spec.prompt.md      ← /d365-fo-split-spec  — split multi-domain spec
    d365-fo-alm.prompt.md             ← /d365-fo-alm         — ALM work item sync
    d365-fo-extract.prompt.md         ← /d365-fo-extract     — test case ALM export
  instructions/
    d365-fo-constitution.instructions.md  ← Always-on rules (auto-injected for F&O artifacts)
constitution/                         ← Domain rules
doc-templates/                        ← Document templates
docs/                                 ← Generated FDD, TDD, test plans land here
plans/                                ← Generated plans land here
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project's root (or merge if `.github/` already exists)
2. **Copy the `constitution/` folder** from `templates/d365-fo/constitution/` to your project root
3. **Copy the `doc-templates/` folder** from `templates/d365-fo/doc-templates/` to your project root
4. Create empty folders: `docs/`, `plans/`
5. Customise `constitution/10-alm-configuration.md` with your project's ALM settings

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **D365 F&O Agent**
3. Type naturally, e.g.:
   - `Write a functional design for purchase order approval`
   - `Review the vendor-portal FDD`
   - `Generate tasks for purchase-order-approval`

### Option B — Invoke a prompt directly

- `/d365-fo-fdd` — write a Functional Design Specification (FDD)
- `/d365-fo-fdd-review` — review and gate-check the FDD
- `/d365-fo-tdd` — generate Technical Design Document
- `/d365-fo-tdd-review` — review and gate-check the TDD
- `/d365-fo-plan` — generate technical task plan (auto-scans for cross-feature conflicts)
- `/d365-fo-plan-review` — check plan readiness
- `/d365-fo-testplan` — generate Test Plan and test cases (6 suites)
- `/d365-fo-implement` — generate X++ implementation stubs (cross-feature pre-requisite check before each object)
- `/d365-fo-blueprint` — generate Solution Blueprint
- `/d365-fo-document` — generate post-implement docs
- `/d365-fo-split-spec` — split a multi-domain FDD
- `/d365-fo-alm` — ALM work item sync
- `/d365-fo-extract` — export test cases for ALM

## Workflow

```
/d365-fo-fdd         → docs/{req}/fdd.md
/d365-fo-fdd-review  → docs/{req}/fdd-review.md         ← FDD APPROVED gate
/d365-fo-tdd         → docs/{req}/tdd.md
/d365-fo-tdd-review  → docs/{req}/tdd-review.md         ← TDD APPROVED gate
/d365-fo-testplan    → docs/{req}/test-plan.md + test-cases/
/d365-fo-plan        → plans/{req}/plan.md + work-items.yaml
                       plans/_component-registry.md (updated)
/d365-fo-plan-review → plans/{req}/plan-review.md       ← PLAN APPROVED gate
/d365-fo-blueprint   → docs/{req}/solution-blueprint.md
/d365-fo-implement   → output/{req}/src/              ← cross-feature pre-req checked per object
/d365-fo-document    → docs/{req}/deployment-guide.md etc.
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `.claude/commands/*.md` | `.github/prompts/d365-fo-*.prompt.md` |
| `/fdd`, `/tdd` commands | `/d365-fo-fdd`, `/d365-fo-tdd` prompts |
| `constitution/CLAUDE.md` auto-loaded | Agent body + `.instructions.md` auto-injected |
| FDD-first workflow (no spec phase) | Same FDD-first workflow |

## Notes

- D365 F&O uses a **FDD-first** workflow (not spec-first like other templates)
- Three approval gates: FDD APPROVED → TDD APPROVED → PLAN APPROVED
- X++ extension rules enforced: always extend, never modify standard objects
- The `.instructions.md` file is auto-injected when editing `docs/` or `plans/` artifacts
