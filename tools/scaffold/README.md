# Scaffold Scripts

> PowerShell tools that create projects, features, and agents. Built per [design/05-project-layout.md](../../design/05-project-layout.md) and [design/02-agent-skeleton.md](../../design/02-agent-skeleton.md).

## Three commands

| Script | Purpose |
|---|---|
| [New-Project.ps1](New-Project.ps1) | Create a new project skeleton under `projects/{Name}/` |
| [New-Feature.ps1](New-Feature.ps1) | Add a feature inside an existing project + agent; writes valid `.workflow.json` |
| [New-Agent.ps1](New-Agent.ps1) | Seed a new agent under `agents/{Name}/` from `_reference/` starters; appends to `agents.yaml` |

All three run on Windows PowerShell 5.1+ and PowerShell 7+. No external module dependencies — YAML parsing is done by [lib/Read-AgentsYaml.ps1](lib/Read-AgentsYaml.ps1) (narrow state machine matching the actual shape of `agents.yaml`). Schema validation runs through [lib/Validate-Config.cjs](lib/Validate-Config.cjs), which re-uses AJV that's already installed for `tools/mcp-server`.

## Common workflow

```powershell
# 1. Scaffold a new project
.\tools\scaffold\New-Project.ps1 -Name 'acme-d365' -Description 'ACME D365 rollout' -Agents 'd365-ce,integration,reporting,alm' -Mode greenfield -AlmTool ado

# 2. Add a feature to an agent
.\tools\scaffold\New-Feature.ps1 -Project 'acme-d365' -Agent 'd365-ce' -Feature 'case-management'

# 3. (Optional) Add a new agent
.\tools\scaffold\New-Agent.ps1 -Name 'd365-bc' -Description 'Business Central agent' -Maturity 'standard' -DocScopeFdd 'feature'
```

## Validation

Every script that emits a config file pipes it through `lib/Validate-Config.cjs` for schema verification:
- `New-Project.ps1` validates `project.config.yaml` against `schemas/project-config.v1.json`
- `New-Feature.ps1` validates `.workflow.json` against `schemas/workflow-state.v1.json`

If validation fails, you'll see a warning (the file is still written, so you can inspect + fix manually).

## File layouts produced

### New-Project.ps1

```
projects/{Name}/
├── project.config.yaml                # validated against project-config.v1
├── work-items.yaml                    # skeleton; partitioned by agent
├── _handoffs/                         # cross-agent handoffs
├── _aggregator/
│   ├── architecture/                  # solution-architect outputs land here
│   └── estimation/inputs/             # solution-estimate inputs land here
├── _brownfield/                       # only when -Mode brownfield
│   ├── input/
│   └── docs-generated/
└── {agent}/                           # one folder per agent in -Agents
    ├── _handoffs/
    └── features/                      # only for agents with BaseCommands=true
```

### New-Feature.ps1

```
projects/{Project}/{Agent}/features/{Feature}/
├── .workflow.json                     # phase=DEFINE, currentStates=[SPEC_DRAFT], gates PENDING
├── test-plan/suites/                  # /test-plan populates
├── reviews/                           # /review, /clarify, /validate populate
├── tasks/                             # /task populates
├── output/                            # /implement populates
├── templates-override/                # optional; per ADR-0010 two-layer resolution
└── constitution-override/             # optional; per ADR-0010
```

For **domain-scoped** agents (CE / Integration / Reporting per ADR-0006), `fdd.md`, `tdd.md`, `blueprint.md` live at the agent root (`projects/{p}/{agent}/`) and are appended to with `<!-- feature-id: {feature} -->` markers when `/fdd` etc. run.

For **feature-scoped** agents (F&O), those docs are created inside this feature folder.

### New-Agent.ps1

```
agents/{Name}/
├── .claude/commands/                  # 17 base command stubs (when -BaseCommands $true) + any -ExtraCommands
├── constitution/                      # seeded from constitution/_reference/*.example
│   ├── 00-charter.md
│   ├── 01-doc-rules.md
│   ├── ... (8 files total)
├── templates/                         # seeded from templates/_reference/*.example
│   ├── spec.template.md
│   ├── plan.template.md
│   ├── fdd.template.md
│   ├── tdd.template.md
│   ├── blueprint.template.md
│   ├── test-plan/index.template.md
│   ├── test-plan/suite.template.md
│   └── checklists/                    # 6 review checklists (consumed per ADR-0001)
└── README.md                          # What/How/Details starter
```

Plus an entry appended to root `agents.yaml`.

## Conventions

- All slugs are lowercase letters/digits/hyphens (matches pattern in `project-config.v1.json` and `workflow-state.v1.json`).
- Scripts refuse to overwrite an existing project/feature/agent unless `-Force` is passed.
- Generated `.workflow.json` always starts at `SPEC_DRAFT` with all hard-gates `PENDING`; the agent's commands move it forward.
- `New-Agent.ps1` appends to `agents.yaml`. If the agent name already exists in the registry, the script warns and skips the append (idempotent against re-runs).

## What this layer does NOT do

- It doesn't author the actual command body content — those stubs are intentional placeholders.
- It doesn't pull from ALM. That's `/alm pull work-items` (the alm agent, built in Phase 8).
- It doesn't run the publish pipeline. That's `tools/sync/Publish-Agents.ps1` (Phase 4).
- It doesn't trigger MCP server startup. The MCP server is invoked by Claude/GHCP per the agent's `.claude/settings.json` (Phase 4).

## Troubleshooting

- **"agents.yaml not found"** → run from inside the repo (or any sub-folder of it). The scripts walk up to find `agents.yaml`.
- **"Agent 'X' is not in agents.yaml"** → either fix the name typo or first run `New-Agent.ps1 -Name X` to register it.
- **Validation warning but file was still written** → the script doesn't abort; inspect the file at the path shown and the validator error explains what's wrong.
- **PowerShell execution policy errors** → run from PowerShell with `-ExecutionPolicy Bypass` or set the policy per Microsoft's guidance.
