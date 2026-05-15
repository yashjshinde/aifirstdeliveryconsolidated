# Solution Architect — GitHub Copilot Agent Template

This folder is a deployable template for the **Solution Architect agent** for GitHub Copilot in VS Code.

The Solution Architect agent produces cross-platform solution blueprints by synthesising artefacts from all domain agents (D365 CE, D365 F&O, Integration, Power Apps, Data Migration, Reporting).

## What's included

```
.github/
  agents/
    solution-architect.agent.md                             ← Custom agent definition
  prompts/
    solution-architect-solution-blueprint.prompt.md         ← /solution-architect-solution-blueprint
    solution-architect-solution-review.prompt.md            ← /solution-architect-solution-review
  instructions/
    solution-architect-constitution.instructions.md         ← Always-on rules (auto-injected)
constitution/                                               ← Architecture rules
doc-templates/                                              ← Blueprint document templates
output/                                                     ← Generated blueprints land here
```

## How to deploy this template

1. **Copy the `.github/` folder** to your project root (merge if `.github/` already exists)
2. **Copy the `constitution/` folder** from `templates/solution-architect/constitution/`
3. **Copy the `doc-templates/` folder** from `templates/solution-architect/doc-templates/`
4. Create `output/` folder
5. Ensure sibling domain templates are deployed alongside this one

## How to use in Copilot Chat

### Option A — Use the agent (recommended)

1. Open Copilot Chat in VS Code
2. Click the agent picker → select **Solution Architect Agent**
3. Type naturally, e.g.:
   - `Generate the solution blueprint for project Alpha`
   - `Review the Alpha blueprint`

### Option B — Invoke a prompt directly

- `/solution-architect-solution-blueprint` — generate cross-platform solution blueprint
- `/solution-architect-solution-review` — validate blueprint against constitution

## Workflow

```
/solution-architect-solution-blueprint {project-name}
  → Discovers all domain artefacts from sibling templates
  → Synthesises into output/{project-name}/solution-blueprint.md

/solution-architect-solution-review {project-name}
  → Validates blueprint against constitution checklist
  → output/{project-name}/solution-review.md
```

## Key difference from Claude Code

| Claude Code | GitHub Copilot |
|---|---|
| `/solution-blueprint`, `/solution-review` | `/solution-architect-solution-blueprint`, `/solution-architect-solution-review` |
| Auto-discovers sibling templates | Same auto-discovery from sibling folders |
| Architecture level only — no code | Same constraint enforced via constitution |

## Notes

- This agent works across all 6 domain platforms: D365 CE, D365 F&O, Integration, Power Apps, Data Migration, Reporting
- All 10 blueprint sections are mandatory before the blueprint is considered COMPLETE
- All Mermaid diagrams must be embedded inline — no external references
- The constitution auto-injected rules enforce synthesis (no copy-paste from domain TDDs)
