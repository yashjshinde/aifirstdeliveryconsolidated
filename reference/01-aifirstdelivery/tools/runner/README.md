# AI First Delivery — Universal Runner

Runs any domain agent command without Claude Code. Works with Claude API, OpenAI, or Azure OpenAI.
Also powers the `copilot-run.ps1` / `copilot-run.sh` scripts that generate prompts for GitHub Copilot.

---

## When to use this

| You want to… | Use |
|---|---|
| Run an agent command and get output files written automatically | `node run-agent.js` with an API key |
| Generate a prompt for GitHub Copilot or ChatGPT | `copilot-run.ps1` (wraps runner with `--output-prompt`) |
| Preview what would be sent to the model | `--dry-run` flag |
| Test a new model or provider | `--model openai` or `--model azure-openai` |

---

## Quick start

```powershell
# One-time setup
cd tools/runner
npm install
```

```powershell
# Write a D365 CE spec — output goes directly to specs/customer-loyalty-points/spec.md
$env:ANTHROPIC_API_KEY = "sk-ant-..."
node run-agent.js d365-ce spec customer-loyalty-points
```

```powershell
# Same command, OpenAI
$env:OPENAI_API_KEY = "sk-..."
node run-agent.js d365-ce spec customer-loyalty-points --model openai
```

```powershell
# Same command, Azure OpenAI
$env:AZURE_OPENAI_ENDPOINT = "https://my-instance.openai.azure.com"
$env:AZURE_OPENAI_API_KEY  = "..."
node run-agent.js d365-ce spec customer-loyalty-points --model azure-openai
```

```powershell
# Preview what would be sent to the model (no API call)
node run-agent.js d365-ce spec customer-loyalty-points --dry-run
```

---

## How it works

```
node run-agent.js d365-ce spec customer-loyalty-points
                  │         │    │
                  │         │    └── feature name → used in output file path
                  │         └─────── command → loads templates/d365-ce/.claude/commands/spec.md
                  └───────────────── domain  → loads templates/d365-ce/constitution/

Step 1 — Load constitution
  templates/d365-ce/constitution/CLAUDE.md        ← agent rules
  templates/d365-ce/constitution/*.md              ← all standards (non-negotiable)

Step 2 — Load command instructions
  templates/d365-ce/.claude/commands/spec.md       ← what the agent must do

Step 3 — Load existing context
  specs/customer-loyalty-points/spec.md (if exists)
  specs/customer-loyalty-points/review.md (if exists)
  plans/customer-loyalty-points/plan.md (if exists)

Step 4 — Call the model API (streaming)

Step 5 — Parse output
  Model wraps each file in: <file path="specs/...">content</file>
  Runner extracts, creates directories, writes files

Step 6 — Done
  specs/customer-loyalty-points/spec.md written to disk
```

---

## Commands

```
run-agent <domain> <command> [feature] [options]

Arguments:
  domain    d365-ce | d365-ce-brownfield | d365-fo | integration | power-apps |
            data-migration | solution-architect | solution-estimate

  command   — D365 CE / Integration / Power Apps / Data Migration —
            spec | spec-alm | review | impact | split-spec | fdd | testplan |
            plan | clarify | tdd | blueprint | mapping | pipeline |
            task | validate | implement | document | extract | alm

            — D365 CE Brownfield —
            scan | index | fdd | tdd | blueprint | document

            — D365 F&O —
            fdd | fdd-review | split-spec | tdd | tdd-review | testplan |
            plan | plan-review | blueprint | implement | document | extract | alm

            — Solution Architect —
            solution-blueprint | solution-review

            — Solution Estimate —
            estimate-rom | estimate-spec | estimate-plan |
            estimate-build | estimate-rollup | factors-review

  feature   Feature name or migration ID (e.g. customer-loyalty-points, sftp-to-dv-accounts)

Options:
  --model <provider>       claude | openai | azure-openai   (default: claude)
  --model-name <name>      Override default model (e.g. claude-opus-4-7, gpt-4o-mini)
  --api-key <key>          API key (or set env var)
  --azure-endpoint <url>   Azure OpenAI endpoint URL
  --azure-deployment <n>   Azure OpenAI deployment name
  --context-dir <dir>      Project directory with specs/, plans/ (default: cwd)
  --templates-dir <dir>    Path to templates/ (auto-detected if omitted)
  --output-prompt <file>   Write assembled prompt to file instead of calling API
  --dry-run                Print assembled prompt to stdout, no API call
```

---

## Environment variables

| Variable | Provider | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | claude | Anthropic API key |
| `OPENAI_API_KEY` | openai | OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | azure-openai | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | azure-openai | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | azure-openai | Default deployment name |

---

## Default models

| Provider | Default model |
|---|---|
| `claude` | `claude-sonnet-4-6` |
| `openai` | `gpt-4o` |
| `azure-openai` | Value of `AZURE_OPENAI_DEPLOYMENT` or `gpt-4o` |

Override with `--model-name`:

```bash
node run-agent.js d365-ce spec my-feature --model claude --model-name claude-opus-4-7
node run-agent.js d365-ce spec my-feature --model openai --model-name gpt-4o-mini
```

---

## File output format

The runner instructs the model to wrap file content in XML tags:

```xml
<file path="specs/my-feature/spec.md">
# Functional Specification — my-feature
...
</file>
```

The runner parses these blocks, creates any missing directories, and writes the files to
`--context-dir`. Any non-file content (agent summary, status messages) is printed to stdout.

Path traversal attacks are blocked — any path that escapes `--context-dir` is silently skipped.

---

## What is not available vs Claude Code

| Claude Code capability | Runner behaviour |
|---|---|
| `/spec` slash command auto-discovery | Invoked explicitly via CLI |
| Auto-load of CLAUDE.md at session open | Loaded by the runner for every call |
| Gate enforcement (APPROVED, TASK-READY) | Enforced by agent in generated output; runner does not re-check |
| MCP tool calls (`ado_*` for ADO) | Not available — agent skips ALM steps; generates files only |
| Write to filesystem via Write tool | Replaced by `<file path="...">` parsing in the runner |
| Session memory across commands | Stateless — context files from disk are loaded per call |

The output quality and content are identical. The automation level is lower — each command
is invoked separately rather than being chained by an interactive session.

---

## Running from outside the repo

If installed globally or used from a different project:

```bash
npm install -g .   # from tools/runner/

# Must specify templates dir explicitly
run-agent d365-ce spec my-feature \
  --templates-dir /path/to/aifirstdelivery/templates \
  --context-dir /path/to/my-project
```

---

## GitHub Copilot

For GitHub Copilot integration, see [docs/github-copilot-guide.md](../../docs/github-copilot-guide.md).
Use `scripts/copilot-run.ps1` (Windows) or `scripts/copilot-run.sh` (Mac/Linux) — these scripts
assemble and copy the prompt to your clipboard automatically.
