# AI First Delivery — Tools

Cross-cutting utilities and infrastructure for the AI First Delivery framework.
These are not delivery domain agents — they are shared services that support all templates, regardless of domain.

**What the tools provide:**
- **ALM Agent** — pushes agent outputs to Azure DevOps: work items, wiki pages, test plans, sprint assignment, and pipeline triggers
- **MCP Server** — the Node.js bridge that translates ADO REST API calls into typed tools for any Claude Code session
- **Universal Runner** — runs any domain agent command against Claude API, OpenAI, or Azure OpenAI without Claude Code
- **Agent Prompt Viewer - Job Aid** — browser UI for browsing and copying agent prompts; works as a React dev server or a zero-install standalone HTML file

---

## Table of Contents

- [Available Tools](#available-tools)
- [Getting Started](#getting-started)
  - [Agent Prompt Viewer - Job Aid — no install needed](#agent-prompt-viewer---job-aid--no-install-needed)
  - [GitHub Copilot — runner via script](#github-copilot--runner-via-script)
  - [Direct API — runner any model](#direct-api--runner-any-model)
  - [ALM Agent — Azure DevOps sync](#alm-agent--azure-devops-sync)
- [ALM Agent — Process](#alm-agent--process)
- [Running Agents](#running-agents)
  - [Universal Runner](#universal-runner)
  - [Agent Prompt Viewer - Job Aid](#agent-prompt-viewer---job-aid)
- [Configuration](#configuration)
  - [ALM Agent — Credentials](#alm-agent--credentials)
  - [Universal Runner — Environment Variables](#universal-runner--environment-variables)

---

## Available Tools

| Tool | Purpose | README |
|---|---|---|
| `alm-agent` | Claude Code agent — end-to-end Azure DevOps integration: work items, wiki pages, test plans, sprint assignment, and pipeline triggers | [alm-agent/README.md](alm-agent/README.md) |
| `mcp-server` | Node.js MCP server — exposes Azure DevOps REST API as typed tools for all Claude Code agent sessions | [mcp-server/README.md](mcp-server/README.md) |
| `runner` | Universal CLI runner — runs any domain agent command against Claude API, OpenAI, or Azure OpenAI without Claude Code; generates paste-ready prompts for GitHub Copilot | [runner/README.md](runner/README.md) |
| `lightweight-reactapp` | Agent Prompt Viewer - Job Aid — searchable three-panel browser UI for browsing and copying agent prompts; works as a React dev server or a zero-install standalone HTML file | [lightweight-reactapp/README.md](lightweight-reactapp/README.md) |

---

## Getting Started

### Agent Prompt Viewer - Job Aid — no install needed

Open the standalone HTML in any browser — no npm, no server:

```bash
open tools/lightweight-reactapp/agent-prompt-viewer.html
```

Browse all 10 agents, read command instructions, and copy prompts to clipboard.

### GitHub Copilot — runner via script

Run one script from the repo root. It assembles a complete prompt and copies it to the clipboard.
Paste into Copilot Chat Agent mode (★ icon).

```powershell
# Windows PowerShell — from repo root
.\scripts\copilot-run.ps1 d365-ce spec customer-loyalty-points
.\scripts\copilot-run.ps1 d365-ce review customer-loyalty-points
.\scripts\copilot-run.ps1 data-migration spec sftp-to-dv-accounts
.\scripts\copilot-run.ps1 integration spec erp-customer-sync
```

```bash
# Mac / Linux / Git Bash
./scripts/copilot-run.sh d365-ce spec customer-loyalty-points
```

Script auto-installs runner dependencies on first run. Node.js must be on PATH.
Or use the VS Code Task GUI: `Ctrl+Shift+P` → `Tasks: Run Task` → pick domain + command.

### Direct API — runner any model

```powershell
cd tools/runner
npm install

# Claude API
$env:ANTHROPIC_API_KEY = "sk-..."
node run-agent.js d365-ce spec customer-loyalty-points

# OpenAI
$env:OPENAI_API_KEY = "sk-..."
node run-agent.js d365-ce spec customer-loyalty-points --model openai

# Azure OpenAI
$env:AZURE_OPENAI_ENDPOINT = "https://my-instance.openai.azure.com"
$env:AZURE_OPENAI_API_KEY  = "..."
node run-agent.js d365-ce spec customer-loyalty-points --model azure-openai
```

### ALM Agent — Azure DevOps sync

```powershell
# 1. Build the MCP server (one-time)
cd tools/mcp-server
npm install
npm run build

# 2. Configure credentials and project paths
#    tools/alm-agent/.claude/settings.json          →  mcpServers.ado-alm.env (org, project, PAT)
#    tools/alm-agent/constitution/10-alm-configuration.md  →  area path, iteration, wiki root

# 3. Open the ALM agent in Claude Code
code tools/alm-agent

# 4. Run commands (after domain agents have produced their extract files)
/wi-create-bulk d365-ce customer-loyalty-points
```

See [runner/README.md](runner/README.md) for the full runner CLI reference.

---

## ALM Agent — Process

The ALM agent bridges local project documents with Azure DevOps. Run it after domain agents have generated their extract files.

```
WORK ITEMS
  Domain agent /alm extract {feature} ──► output/{f}/alm/extract-*.json
  /wi-create-bulk {domain} {feature}  ──► ADO: Epic → Feature → User Story → Task (linked)
  /wi-create-bulk ... --dry-run       ──► preview only, no API calls
  /wi-sync {domain} {feature}         ──► work-items.yaml + plan.md + task cards + spec.md updated
  /wi-status {domain} {feature}       ──► sync status report

WIKI
  /wiki-push {domain} {feature} {doc} ──► ADO wiki page created/updated
  /wiki-pull {wiki-path}              ──► local file updated from wiki
  /wiki-sync {domain} {feature}       ──► all configured docs synced in one pass (all 8 domains supported)

TEST
  Domain agent /extract testplan {f}  ──► output/{f}/alm/test-plan-extract.json
  /test-create {domain} {feature}     ──► ADO: Test Plan + Suites + Cases (linked)
  /test-create ... --dry-run          ──► preview only, no API calls
  /test-sync {domain} {feature}       ──► test-plan-and-strategy.md + suite files updated

SPRINT
  /sprint-assign {domain} {feature} {sprint} ──► all work items assigned to iteration

PIPELINE
  /pipeline-run {pipeline-id} [{branch}]     ──► pipeline triggered, run ID returned
  /pipeline-status {pipeline-id} {run-id}    ──► build status and result checked

CLEANUP  ⚠ Destructive — explicit confirmation required for all cleanup commands
  /cleanup-wi {id}                    ──► single work item deleted
  /cleanup-wi-tree {id}               ──► full hierarchy deleted (Epic and all descendants)
  /cleanup-test {plan-id}             ──► test plan + all suites + all cases deleted
  /cleanup-suite {plan-id} {suite-id} ──► all test cases under a suite deleted
```

> **No gates** — every ALM command runs independently. Run commands after the relevant domain agent output exists.

See [alm-agent/README.md](alm-agent/README.md) for the full command reference.

---

## Running Agents

Three ways to run agent commands. Claude Code is the full experience; the runner and prompt viewer work without it.

```
                                        ┌─ Claude Code (slash commands)
templates/d365-ce      ─┐               │
templates/d365-fo      ─┤  agent runs   ├─ tools/runner ──► Claude API / OpenAI / Azure OpenAI
templates/integration  ─┤  via any of ──┤                   (model-agnostic CLI)
templates/power-apps   ─┤               │
templates/data-migration┤               └─ GitHub Copilot (scripts/copilot-run.ps1)
templates/reporting    ─┘

ADO integration (all methods):
  domain agent output ──► tools/alm-agent ──► tools/mcp-server ──► Azure DevOps
                          (Claude Code)        (Node.js MCP)
```

> **MCP Server** — `tools/mcp-server` is the Node.js bridge registered in `.claude/settings.json`. It translates ADO REST API calls into typed MCP tools used by the ALM agent. No direct interaction required — it starts automatically when the ALM agent session opens.

### Universal Runner

Model-agnostic CLI that loads constitution and command files for any domain, calls a model API, and writes output files — no Claude Code required.

```
Step 1 — Load constitution
  templates/{domain}/constitution/CLAUDE.md        ← agent rules
  templates/{domain}/constitution/*.md             ← all standards

Step 2 — Load command instructions
  templates/{domain}/.claude/commands/{cmd}.md     ← what the agent must do

Step 3 — Load existing context
  specs/{feature}/spec.md      (if exists)
  specs/{feature}/review.md    (if exists)
  plans/{feature}/plan.md      (if exists)

Step 4 — Call the model API (streaming)

Step 5 — Parse and write output
  Model wraps each file in: <file path="...">content</file>
  Runner extracts, creates directories, writes files to --context-dir
```

| | Claude Code | Runner |
|---|---|---|
| Constitution auto-loaded | ✅ on session open | ✅ loaded per call |
| Gate enforcement | ✅ automatic hard stop | Advisory — enforced in generated output |
| MCP / ADO tools (`ado_*`) | ✅ | Not available — generates files only |
| Session memory | ✅ | Stateless — context files loaded from disk per call |

See [runner/README.md](runner/README.md) for the full CLI reference.

### Agent Prompt Viewer - Job Aid

Browser-based tool for browsing and copying agent prompts. No Claude Code or API key required.

```
  templates/*/.claude/commands/*.md ──► tools/lightweight-reactapp ──► browser
                                        (React UI or standalone HTML)

STEP 1 — DATA (automatic on npm run dev, or run manually)
  node scripts/generate-data.js
  ──► reads all agent command files and READMEs
  ──► writes src/data/agents-data.js

STEP 2 — VIEW (two options)
  Option A — Standalone HTML (no install)
    open tools/lightweight-reactapp/agent-prompt-viewer.html

  Option B — Dev server (hot reload)
    npm run dev  ──► http://localhost:5173

  Three-panel UI:
    Left   — 10 agents with colour-coded icons and command counts
    Middle — agent README pinned at top; /commands listed below
    Right  — Rendered | Raw tabs per command
```

> After adding or updating agent commands, run `npm run build-html` to regenerate the standalone HTML.

See [lightweight-reactapp/README.md](lightweight-reactapp/README.md) for the full guide.

---

## Configuration

### ALM Agent — Credentials

All credentials are set in `tools/alm-agent/.claude/settings.json`. They are never stored in any documentation file.

```json
{
  "mcpServers": {
    "ado-alm": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\tools\\mcp-server\\dist\\index.js"],
      "env": {
        "ADO_ORG_URL": "https://dev.azure.com/your-org",
        "ADO_PROJECT":  "YourProject",
        "ADO_PAT":      "your-personal-access-token"
      }
    }
  }
}
```

**PAT permissions required:** Work Items (Read & Write), Test Plans (Read & Write), Wiki (Read & Write), Pipelines (Read & Execute), Code (Read) for PR operations.

Project-specific settings (area paths, iteration paths, wiki root, domain paths) go in `tools/alm-agent/constitution/10-alm-configuration.md`.

### Universal Runner — Environment Variables

| Variable | Provider | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | claude | Anthropic API key |
| `OPENAI_API_KEY` | openai | OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | azure-openai | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | azure-openai | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | azure-openai | Default deployment name |

**Supported providers and defaults:**

| Provider | Flag | Default model |
|---|---|---|
| Anthropic Claude | `--model claude` *(default)* | `claude-sonnet-4-6` |
| OpenAI | `--model openai` | `gpt-4o` |
| Azure OpenAI | `--model azure-openai` | Value of `AZURE_OPENAI_DEPLOYMENT` |

Override the default model with `--model-name`:

```bash
node run-agent.js d365-ce spec my-feature --model claude --model-name claude-opus-4-7
node run-agent.js d365-ce spec my-feature --model openai --model-name gpt-4o-mini
```

See [runner/README.md](runner/README.md) and [mcp-server/README.md](mcp-server/README.md) for the complete references.
