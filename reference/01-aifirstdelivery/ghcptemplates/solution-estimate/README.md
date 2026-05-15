# Solution Estimate — GitHub Copilot Agent Template

This folder is a deployable template for the **Solution Estimate agent** for GitHub Copilot in VS Code.

The Solution Estimate agent produces factor-based project estimates at three confidence levels (ROM ±40%, Structured ±20%, Detailed ±10%) from requirements documents, approved specs, or approved plans.

## What's included

```
.github/
  agents/
    solution-estimate.agent.md                              ← Custom agent definition
  prompts/
    solution-estimate-estimate-rom.prompt.md                ← /solution-estimate-estimate-rom
    solution-estimate-estimate-spec.prompt.md               ← /solution-estimate-estimate-spec
    solution-estimate-estimate-plan.prompt.md               ← /solution-estimate-estimate-plan
    solution-estimate-estimate-build.prompt.md              ← /solution-estimate-estimate-build
    solution-estimate-estimate-rollup.prompt.md             ← /solution-estimate-estimate-rollup
    solution-estimate-factors-review.prompt.md              ← /solution-estimate-factors-review
  instructions/
    solution-estimate-constitution.instructions.md          ← Always-on rules (auto-injected)
constitution/                                               ← Estimation rules and factor rates
doc-templates/                                              ← Estimate document templates
estimates/                                                  ← Generated estimates land here
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project root
2. **Copy the `constitution/` folder** from `templates/solution-estimate/constitution/`
3. **Copy the `doc-templates/` folder** from `templates/solution-estimate/doc-templates/`
4. Create `estimates/` folder
5. Configure factor rates in `constitution/21-factor-rates.md` and rules in `constitution/22-estimation-rules.md`

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **Solution Estimate Agent**
3. Type naturally, e.g.:
   - `ROM estimate for the attached requirements`
   - `Generate a structured estimate for account-loyalty-points`

### Option B — Invoke a prompt directly

- `/solution-estimate-estimate-rom` — ROM estimate (±40%) from unstructured requirements
- `/solution-estimate-estimate-spec` — Structured estimate (±20%) from approved spec
- `/solution-estimate-estimate-plan` — Detailed estimate (±10%) from approved plan
- `/solution-estimate-estimate-build` — Generate formal 3-part deliverable
- `/solution-estimate-estimate-rollup` — Cross-feature rollup with confidence chart
- `/solution-estimate-factors-review` — Review and approve proposed estimation factors

## Workflow

```
Input type → Command → Output

Unstructured requirements:
  /estimate-rom {project}           → estimates/{project}/rom-estimate.md

Approved spec from domain agent:
  /estimate-spec {project} {feature} → estimates/{project}/{feature}-spec-estimate.md

Approved plan from domain agent:
  /estimate-plan {project} {feature} → estimates/{project}/{feature}-plan-estimate.md

Formal deliverable (all 3 files):
  /estimate-build {project}         → estimates/{project}/business-req-detail.md
                                      estimates/{project}/module-build-hrs.md
                                      estimates/{project}/module-overall-hrs.md

Rollup with confidence chart:
  /estimate-rollup {project}        → estimates/{project}/rollup-summary.md
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `/estimate-rom`, `/estimate-spec`, `/estimate-plan` | `/solution-estimate-estimate-rom` etc. (prefixed) |
| Factor rates from `constitution/21-factor-rates.md` | Same — never hardcoded |
| Phase multipliers from `constitution/22-estimation-rules.md` | Same — always sourced, never hardcoded |

## Notes

- Factor rates are **never hardcoded** — always read from `constitution/21-factor-rates.md`
- Phase multipliers are **never hardcoded** — always from `constitution/22-estimation-rules.md`
- If a required factor doesn't exist, it goes to `proposed-factors.md` and must be reviewed via `/factors-review` before `/estimate-build` can run
- Brownfield adjustments: NEW=100%, EXTEND=60%, REPLACE=115%, REFERENCED=0%
