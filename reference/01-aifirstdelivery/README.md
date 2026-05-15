# AI First Delivery — Agent Templates

You describe a requirement in plain language. The agent produces a structured specification,
technical plan, task cards, and code — following the same process a senior consultant would use,
enforced by domain-specific rules called the constitution.

**Works with Claude Code, GitHub Copilot, or any AI tool.** You do not need to be locked into
one tool. The same agents run in Claude Code (best experience), via a one-command script into
GitHub Copilot, or against Claude API / OpenAI / Azure OpenAI directly.

**What you get:** structured Markdown documents written to your project folder —
`specs/`, `plans/`, `tasks/`, `docs-generated/`, `output/` — ready to review, commit, or push
to Azure DevOps. The agent never invents requirements and never skips a gate.

**Supported domains:**
- **D365 CE** — Plugins, PCF controls, JavaScript, Dataverse schema
- **D365 F&O** — X++ extensions, data entities, workflows, SSRS
- **Azure Integration** — Azure Functions, Service Bus, Logic Apps, APIM, Bicep
- **Power Apps** — Canvas Apps, Model-Driven Apps, Power Automate, Copilot Studio
- **Data Migration** — ADF pipelines, SQL staging, SFTP ↔ Dataverse
- **Reporting** — Power BI reports, SSRS reports, Paginated reports, DAX measures, RLS, datasets
- **Solution Architect** — cross-domain blueprint synthesised from all sibling agents
- **Solution Estimate** — factor-based ROM estimates at any delivery stage

---

## Table of Contents

- [Getting Started](#getting-started)
  - [Path A — Claude Code](#path-a--claude-code-recommended-for-full-experience)
  - [Path B — GitHub Copilot](#path-b--github-copilot)
    - [Option B1 — GHCP Agent Templates (recommended)](#option-b1--ghcp-agent-templates-recommended)
    - [Option B2 — Script / Direct](#option-b2--script--direct-copilot-chat-no-template-deployment-needed)
  - [Path C — Direct API](#path-c--direct-api-claude--openai--azure-openai)
  - [Agent Prompt Viewer - Job Aid](#agent-prompt-viewer---job-aid)
- [Available Templates](#available-templates)
  - [Example — D365 CE feature end to end](#example--d365-ce-feature-end-to-end)
- [Configuration Reference](#configuration-reference)
  - [`.mcp.json` — MCP Server Wiring](#mcpjson--mcp-server-wiring)
  - [Running the MCP Server Locally](#running-the-mcp-server-locally)
  - [`alm-configuration.md` — Project ALM Settings](#alm-configurationmd--project-alm-settings)
- [The Process](#the-process)
  - [D365 CE / Integration / Power Apps / Reporting](#d365-ce--integration--power-apps--reporting-spec-driven)
  - [D365 F&O](#d365-fo-document-first-four-phases)
  - [Data Migration](#data-migration-adf-pipeline-driven)
  - [D365 CE Brownfield](#d365-ce-brownfield-reverse-engineering)
  - [Solution Architect](#solution-architect-cross-domain-blueprint-synthesis)
  - [Solution Estimate](#solution-estimate-cross-domain-progressive-estimation)
  - [ALM Agent](#alm-agent-azure-devops-integration)
- [Commands](#commands)
  - [Commands — D365 CE / Integration / Power Apps / Reporting](#commands--d365-ce--integration--power-apps--reporting)
  - [Commands — D365 F&O](#commands--d365-fo-document-first)
  - [Commands — Data Migration](#commands--data-migration)
  - [Commands — D365 CE Brownfield](#commands--d365-ce-brownfield)
  - [Commands — Solution Architect](#commands--solution-architect)
  - [Commands — Solution Estimate](#commands--solution-estimate)
  - [Commands — ALM Agent](#commands--alm-agent)
- [Brownfield Mode — D365 CE / Integration / Reporting / Solution Architect](#brownfield-mode--d365-ce--integration--reporting--solution-architect)
- [Running without Claude Code](#running-without-claude-code)
  - [Universal Runner](#universal-runner)
  - [GitHub Copilot](#github-copilot)

---

## Getting Started

Choose the path that matches your tool.

---

### Path A — Claude Code (recommended for full experience)

Claude Code gives you slash commands, automatic constitution loading, and MCP tools for Azure DevOps.

**Step 1 — Unzip the template into your project folder**

```powershell
./scripts/build-templates.ps1
# Produces: dist/AgentTemplate-D365CE.zip, dist/AgentTemplate-Integration.zip, etc.
```

Unzip the template for your domain into your project root:
```
AgentTemplate-D365CE.zip    → MyProject/    (D365 CE / Dataverse)
AgentTemplate-D365FO.zip    → MyProject/    (D365 Finance & Operations)
AgentTemplate-Integration.zip → MyProject/  (Azure Integration)
```

**Step 2 — Open the folder in Claude Code**

```powershell
code MyProject/
```

All slash commands appear automatically in Claude Code. No setup needed to start writing specs.

**Step 3 — Configure the constitution (one-time per project)**

Edit `constitution/10-alm-configuration.md` and set your project name, area path, and iteration path.
For ADO integration also fill in [`alm-configuration.md`](alm-configuration.md) at the repo root.

**Step 4 — Run your first command**

In Claude Code, type:
```
/spec
```
Paste your requirement. The agent asks clarifying questions if needed, then writes
`specs/{feature-name}/spec.md`.

---

### Path B — GitHub Copilot

**Option B1 — GHCP Agent Templates (recommended)**

Deploy a domain-specific agent directly into VS Code Copilot Chat. Each domain gets a dedicated agent in the agent picker and full slash command support — native Copilot experience, no scripts, no Node.js required.

**Step 1 — Copy the GHCP template to your project**

```powershell
# Example for D365 CE — replace d365-ce with your domain
Copy-Item -Recurse ghcptemplates\d365-ce\.github   MyProject\.github
Copy-Item -Recurse templates\d365-ce\constitution  MyProject\constitution
Copy-Item -Recurse templates\d365-ce\doc-templates MyProject\doc-templates
```

Or merge manually: copy `ghcptemplates/{domain}/.github/` into your project root, then `templates/{domain}/constitution/` and `templates/{domain}/doc-templates/`.

**Step 2 — Create output folders**

```powershell
mkdir MyProject\specs, MyProject\plans, MyProject\tasks, MyProject\docs-generated, MyProject\output
```

**Step 3 — Configure (one-time)**

Edit `constitution/10-alm-configuration.md` with your project name, area path, and iteration path.

**Step 4 — Use in Copilot Chat**

Open Copilot Chat (`Ctrl+Alt+I`) → click the agent picker (robot icon) → select your domain agent, then type your request naturally.

Or type `/` and pick a slash command directly, e.g. `/d365-ce-spec customer-loyalty-points`.

**Available GHCP templates:**

| Domain | Template folder | Agent |
|---|---|---|
| D365 Customer Engagement | `ghcptemplates/d365-ce` | D365 CE Agent |
| D365 CE Brownfield | `ghcptemplates/d365-ce-brownfield` | D365 CE Brownfield Agent |
| D365 Finance & Operations | `ghcptemplates/d365-fo` | D365 F&O Agent |
| Azure Integration | `ghcptemplates/integration` | Azure Integration Agent |
| Power Apps | `ghcptemplates/power-apps` | Power Apps Agent |
| Data Migration | `ghcptemplates/data-migration` | Data Migration Agent |
| Reporting | `ghcptemplates/reporting` | Reporting Agent |
| Solution Architect | `ghcptemplates/solution-architect` | Solution Architect Agent |
| Solution Estimate | `ghcptemplates/solution-estimate` | Solution Estimate Agent |
| ALM | `ghcptemplates/alm` | ALM Agent |

See `ghcptemplates/{domain}/README.md` for the full command list, workflow, and deployment notes.

> **Keeping GHCP prompts in sync:** Claude commands (`templates/{domain}/.claude/commands/*.md`) are the source of truth. GHCP prompt files are generated from them — do not edit `.prompt.md` files directly. After updating any Claude command, run:
> ```powershell
> .\scripts\generate-prompts.ps1                      # regenerate all 9 agents (115 prompts)
> .\scripts\generate-prompts.ps1 -AgentName reporting  # regenerate one agent
> ```

---

**Option B2 — Script / Direct Copilot Chat (no template deployment needed)**

| Method | How | Requires |
|---|---|---|
| **Script** | Run `copilot-run.ps1` → paste into Copilot Chat | Node.js on PATH |
| **VS Code Task** | `Ctrl+Shift+P` → Run Task → pick → paste | Node.js on PATH |
| **Direct Copilot Chat** | Ask Copilot to `@workspace`-read the constitution files | Nothing extra |

**Script:**

```powershell
# Windows PowerShell — from repo root
.\scripts\copilot-run.ps1 d365-ce spec customer-loyalty-points
```

The script generates a self-contained prompt with the full constitution embedded and copies it to
your clipboard. Open Copilot Chat (`Ctrl+Alt+I`) → Agent mode (`★`) → paste → Enter.

**Direct Copilot Chat (no Node.js needed):**

```
Run /spec for d365-ce. Feature: customer-loyalty-points.
Read @workspace templates/d365-ce/constitution/CLAUDE.md — those are the agent rules.
Read @workspace templates/d365-ce/.claude/commands/spec.md — follow it exactly.
Write output to specs/customer-loyalty-points/spec.md using the createFile tool.
```

The `.github/copilot-instructions.md` file is automatically loaded by VS Code Copilot as a workspace
system prompt — it contains the full step-by-step instructions for running any command this way.

See [docs/github-copilot-guide.md](docs/github-copilot-guide.md) for all methods, domain + command combinations, workflow order, and troubleshooting.

---

### Path C — Direct API (Claude / OpenAI / Azure OpenAI)

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

The runner loads the constitution and command files, calls the API, and writes the output files
directly to your project folder. See [tools/runner/README.md](tools/runner/README.md).

---

### ADO Integration setup (optional — needed only for Azure DevOps sync)

Edit [`alm-configuration.md`](alm-configuration.md) — set `ado-org-url`, `ado-project`, `area-path`, and `iteration-path`.

Set environment variables (picked up automatically by `.mcp.json`):
```powershell
$env:ADO_ORG_URL = "https://dev.azure.com/your-org"
$env:ADO_PROJECT = "YourProject"
$env:ADO_PAT     = "your-pat"   # never stored in any file
```

Build the MCP server once:
```powershell
cd tools/mcp-server && npm install && npm run build
```

After that, `ado_*` tools are available automatically in every Claude Code session.

---

### Agent Prompt Viewer - Job Aid

A searchable three-panel UI for browsing all agent commands and copying prompts. Open directly in any browser — no install needed.

```bash
open tools/lightweight-reactapp/agent-prompt-viewer.html
```

Pick an agent → pick a command → view rendered or raw prompt and copy to clipboard. All 10 agents and their READMEs are included.

See [tools/lightweight-reactapp/README.md](tools/lightweight-reactapp/README.md) for the full guide.

---

## Available Templates

| Template | Domain | README |
|---|---|---|
| `d365-ce` | Dynamics 365 Customer Engagement — Plugins, PCF Controls, JavaScript Web Resources, Dataverse | [templates/d365-ce/README.md](templates/d365-ce/README.md) |
| `d365-ce-brownfield` | D365 CE Reverse Engineering — reads existing solution artefacts and generates functional, technical, and architecture documentation | [templates/d365-ce-brownfield/README.md](templates/d365-ce-brownfield/README.md) |
| `d365-fo` | Dynamics 365 Finance & Operations — X++ Extensions, Data Entities, Integrations, Security, Workflows, SSRS | [templates/d365-fo/README.md](templates/d365-fo/README.md) |
| `integration` | Azure Integration — Azure Functions, Logic Apps, Service Bus, APIM, Bicep IaC | [templates/integration/README.md](templates/integration/README.md) |
| `power-apps` | Power Platform — Canvas Apps, Model-Driven Apps, Power Automate, Copilot Studio | [templates/power-apps/README.md](templates/power-apps/README.md) |
| `solution-architect` | Cross-template — reads specs and plans from all sibling templates; synthesises into a single solution blueprint with architecture diagrams | [templates/solution-architect/README.md](templates/solution-architect/README.md) |
| `solution-estimate` | Cross-template — produces ROM, structured, and detailed factor-based estimates at any delivery stage; reads outputs from all sibling domain agents | [templates/solution-estimate/README.md](templates/solution-estimate/README.md) |
| `alm-agent` | Azure DevOps integration — creates work items, wiki pages, test hierarchies, and pipeline triggers from domain agent outputs; writes ALM IDs back into all project documents | [tools/alm-agent/README.md](tools/alm-agent/README.md) |
| `runner` | Universal CLI runner — runs any domain agent command against Claude API, OpenAI, or Azure OpenAI without Claude Code; powers the `copilot-run.ps1` script for GitHub Copilot | [tools/runner/README.md](tools/runner/README.md) |
| `lightweight-reactapp` | Agent Prompt Viewer - Job Aid — browse and copy agent prompts in a searchable three-panel UI; works as a React dev server or as a standalone HTML file with no build step | [tools/lightweight-reactapp/README.md](tools/lightweight-reactapp/README.md) |
| `data-migration` | Data Migration / Integration — ADF pipelines, SQL Staging, Dataverse, SFTP; bidirectional (SFTP→Dataverse and Dataverse→SFTP); generalised for any source→staging→target pattern | [templates/data-migration/README.md](templates/data-migration/README.md) |
| `reporting` | Reporting — Power BI interactive reports, SSRS reports, Power BI Paginated reports, datasets, DAX measures, RLS design, workspace ALM | [templates/reporting/README.md](templates/reporting/README.md) |

Each template README contains the full domain-specific guide: what the agent can build, step-by-step command usage, folder structure, and deployment instructions.

> **Brownfield workflow:** Use `d365-ce-brownfield` first to document an existing system, then enable brownfield mode in `d365-ce`, `integration`, or `solution-architect` to develop against it. See the [Brownfield Mode](#brownfield-mode--d365-ce--integration--solution-architect) section below.

> **Note — D365 F&O uses a different process.** The `d365-fo` template follows a document-first workflow with three formal approval gates (FDD APPROVED → TDD APPROVED → PLAN APPROVED) before any implementation begins. The plan is flat — one task per X++ object — with no Feature/Epic/Story hierarchy. See [templates/d365-fo/README.md](templates/d365-fo/README.md) for the full process.

---

### Example — D365 CE feature end to end

**Scenario:** "Add a loyalty points system to our D365 CE customer accounts."

This example shows exactly what you type and what you get back at each step.

---

#### Step 1 — Write the spec

**Claude Code:**
```
/spec customer-loyalty-points
```

**GitHub Copilot:**
```powershell
.\scripts\copilot-run.ps1 d365-ce spec customer-loyalty-points
# → copies prompt to clipboard → paste into Copilot Chat Agent mode
```

**You paste your requirement** (plain language is fine):
```
We need to add a loyalty points system to D365 CE. Customers earn points on every
purchase. Points can be redeemed for discounts. Field agents need a dashboard showing
each customer's current balance. Marketing needs to run point-multiplier campaigns.
```

**What gets written:** `specs/customer-loyalty-points/spec.md`

The spec contains 13 structured sections: Overview, Scope, Actors and Personas,
Business Process, Functional Requirements (FR-001 … FR-NNN), D365 CE Impact Summary
(every entity, plugin, form affected), Business Rules, Acceptance Criteria, and more.
Every FR has a description, trigger, inputs, outputs, D365 impact, and acceptance criteria.

---

#### Step 2 — Review the spec

```
/review customer-loyalty-points       ← Claude Code
.\scripts\copilot-run.ps1 d365-ce review customer-loyalty-points   ← Copilot
```

**What gets written:** `specs/customer-loyalty-points/review.md`

The review checks every constitution rule and reports:
- **BLOCKERs** — e.g. "FR-004 references an Azure Function — out of scope for D365 CE. Use `/split-spec` to separate." or "FR-007 references an ADF pipeline — belongs in the Data Migration agent. Use `/split-spec` to separate."
- **REQUIREDs** — e.g. "Section 9 Open Questions is empty — must state None identified or list questions."
- **RECOMMENDEDs** — best-practice suggestions that don't block
- **Status: APPROVED** or **NEEDS REWORK**

You can only run `/plan` once status is **APPROVED**.

---

#### Step 3 — Generate the plan

```
/plan customer-loyalty-points       ← Claude Code  (requires APPROVED review)
.\scripts\copilot-run.ps1 d365-ce plan customer-loyalty-points   ← Copilot
```

**What gets written:**
- `plans/customer-loyalty-points/plan.md` — full work breakdown: Epic → Feature → User Story → Tasks
- `plans/customer-loyalty-points/work-items.yaml` — machine-readable version for ALM sync

The plan breaks every FR into developer tasks with: component type (Plugin/Schema/Flow/etc.),
affected artefacts, complexity (S/M/L/XL), role (Developer/QA/Functional), and FR references.
Unit test tasks are generated automatically for every plugin, web resource, and flow.

`/plan` also automatically scans all existing plans for shared components. Overlaps are classified as CONFLICT (incompatible changes), SEQUENTIAL (ordering dependency), or SHARED (informational), and surfaced in **Section 4a — Cross-Feature Dependencies**. After writing the plan, `plans/_component-registry.md` is updated so future plans can detect conflicts.

---

#### Step 4 — Generate task cards

```
/clarify customer-loyalty-points    ← resolves ambiguities, sets TASK-READY gate
/task customer-loyalty-points       ← generates one file per task
```

**What gets written:** `tasks/customer-loyalty-points/01-schema-changes.md`, `02-loyalty-plugin.md`, …

Each task card is dev-ready: acceptance criteria, implementation notes, artefact path,
definition of done. Developers pick up a card and know exactly what to build.

---

#### Step 5 — Sync to Azure DevOps (Claude Code + ALM Agent only)

```bash
# In tools/alm-agent (open as separate Claude Code workspace):
/wi-create-bulk d365-ce customer-loyalty-points
# Creates Epic → Features → User Stories → Tasks in ADO, linked hierarchy
# Then writes ADO IDs back into work-items.yaml, plan.md, and every task card
```

---

#### Full workflow at a glance

```
Your requirement (plain text)
        ↓
/spec    → specs/{f}/spec.md               ← write all requirements
/review  → specs/{f}/review.md             ← gate: APPROVED
/plan    → plans/{f}/plan.md               ← write work breakdown
          plans/{f}/work-items.yaml
          plans/_component-registry.md     ← updated with this feature's components
/clarify → plans/{f}/clarify.md            ← gate: TASK-READY
/task    → tasks/{f}/NN-{name}.md          ← dev-ready cards
/validate → updates task card status        ← gate: READY TO IMPLEMENT
/implement → output/{f}/src/               ← generated code + tests
```

Each gate blocks the next command until the previous step meets its quality bar.
The gate status is written into the document — the next command reads it and stops if not met.

---

## Configuration Reference

### `.mcp.json` — MCP Server Wiring

Located at the **repo root**. Read by Claude Code at session startup to register the `ado-alm` MCP server, making `ado_*` tools available in every domain agent session.

```json
{
  "mcpServers": {
    "ado-alm": {
      "command": "node",
      "args": ["tools/mcp-server/dist/index.js"],
      "env": {
        "ADO_ORG_URL": "${ADO_ORG_URL}",
        "ADO_PROJECT": "${ADO_PROJECT}",
        "ADO_PAT": "${ADO_PAT}"
      }
    }
  }
}
```

| Field | Description |
|---|---|
| `mcpServers.ado-alm.command` | Runtime — always `node` |
| `mcpServers.ado-alm.args` | Path to the compiled MCP server entry point (built by `npm run build` in `tools/mcp-server/`) |
| `mcpServers.ado-alm.env.ADO_ORG_URL` | Resolves from the `ADO_ORG_URL` system environment variable — e.g. `https://dev.azure.com/YOUR-ORG` |
| `mcpServers.ado-alm.env.ADO_PROJECT` | Resolves from the `ADO_PROJECT` system environment variable — your ADO project name |
| `mcpServers.ado-alm.env.ADO_PAT` | Resolves from the `ADO_PAT` system environment variable — your Personal Access Token. **Never hardcode this value.** |

> **Do not edit `.mcp.json` directly** to set credentials. Set `ADO_ORG_URL`, `ADO_PROJECT`, and `ADO_PAT` as system environment variables instead. For the ALM agent specifically, you can also set them under `mcpServers.ado-alm.env` in `tools/alm-agent/.claude/settings.json`.

---

### Running the MCP Server Locally

The `ado-alm` MCP server is a **Node.js stdio process** — Claude Code launches it automatically as a child process when you open any project folder. You do not run it manually like a web server.

**How it starts:** Claude Code reads `.mcp.json` (repo root, used by all domain agents) or `.claude/settings.json` (used by the ALM agent directly) and spawns:

```
node tools/mcp-server/dist/index.js
```

with `ADO_ORG_URL`, `ADO_PROJECT`, and `ADO_PAT` injected as environment variables. If any are missing, the server starts but every `ado_*` call returns an authentication error.

**Step 1 — Build (one-time, or after any change to `tools/mcp-server/src/`):**

```powershell
cd tools/mcp-server
npm install
npm run build
# Output: tools/mcp-server/dist/index.js
```

**Step 2 — Set the environment variables:**

| Variable | Description | Example |
|---|---|---|
| `ADO_ORG_URL` | Your Azure DevOps organisation URL | `https://dev.azure.com/my-org` |
| `ADO_PROJECT` | Your ADO project name | `MyProject` |
| `ADO_PAT` | Personal Access Token — never commit this | *(set as env var)* |

**Option A — System environment variables (recommended for all domain agents):**
Set these at machine or user level. `.mcp.json` resolves `${ADO_ORG_URL}`, `${ADO_PROJECT}`, and `${ADO_PAT}` automatically at session startup.

**Option B — Inline in `settings.json` (ALM agent or isolated project):**
Set them directly under `mcpServers.ado-alm.env` in `tools/alm-agent/.claude/settings.json`. Do not commit this file with credentials — add it to `.gitignore`.

**Step 3 — Verify it is running:**
Open any domain agent folder in Claude Code. The `ado-alm` MCP server registers automatically. Confirm it started:
- Check that `ado_*` tools appear in the Claude Code tool panel (MCP section)
- Or run any command — the agent startup check calls `ado_get_work_items_batch` with an empty ID list and prints a warning if the server is unreachable

**Troubleshooting:**

| Symptom | Likely Cause | Fix |
|---|---|---|
| `ado_*` tools not available | Server not built | Run `npm run build` in `tools/mcp-server/` |
| `ado_*` tools not available | Path in `args` is wrong or relative | Use the absolute path to `dist/index.js` in `settings.json` |
| Authentication error on every call | `ADO_PAT` not set or expired | Set / rotate the `ADO_PAT` environment variable |
| 403 on every call | PAT lacks required scopes | Grant: Work Items (Read & Write), Test Plans (Read & Write), Wiki (Read & Write), Pipelines (Read & Execute) |
| Works for domain agents but not ALM agent | ALM agent uses its own `settings.json`, not `.mcp.json` | Set env vars in `tools/alm-agent/.claude/settings.json` under `mcpServers.ado-alm.env` |
| Server started but tools show as disconnected | Stale process from previous session | Reload the Claude Code window to restart the MCP process |

---

### `alm-configuration.md` — Project ALM Settings

Located at the **repo root**. Read by Claude (the AI agent) as a document at the start of every command that interacts with Azure DevOps. This is the single source of truth for work item structure and field mapping across all domain agents.

**Key fields to configure for your project:**

| Section | Field | Description | Example |
|---|---|---|---|
| Azure DevOps Connection | `ado-org-url` | Your ADO organisation URL | `https://dev.azure.com/my-org` |
| Azure DevOps Connection | `ado-project` | ADO project name | `MyProject` |
| Azure DevOps Connection | `api-version` | ADO REST API version (leave as `7.1`) | `7.1` |
| Work Item Defaults | `area-path` | Area path for all created work items | `MyProject\MyTeam` |
| Work Item Defaults | `iteration-path` | Default sprint / iteration | `MyProject\Sprint 1` |
| ALM Tool | `alm-tool` | Target ALM platform | `Azure DevOps` / `Jira` / `Linear` |
| ALM Tool | `process-template` | ADO process template | `Scrum` / `Agile` / `CMMI` |
| Work Item Type Names | `type-epic` | Name of Epic-level work item type | `Epic` |
| Work Item Type Names | `type-feature` | Name of Feature-level work item type | `Feature` |
| Work Item Type Names | `type-story` | Name of Story-level work item type | `User Story` |
| Work Item Type Names | `type-task` | Name of Task-level work item type | `Task` |

**Standard 4-level hierarchy** (used by d365-ce, integration, power-apps, data-migration):

| Level | Agent concept | ALM Type | ID Prefix |
|---|---|---|---|
| 1 — Business Capability | Feature | Epic | EP |
| 2 — Functional Grouping | Epic | Feature | FT |
| 3 — Requirement Unit | User Story | User Story | US |
| 4 — Implementation Item | Task | Task | T |

> **D365 F&O** uses a 2-level override (Requirement/Epic → Object Task) — defined in its own `constitution/10-alm-configuration.md`, not here.

> If `alm-configuration.md` does not exist at the repo root, each agent falls back to its own `constitution/10-alm-configuration.md`.

---

## The Process

### D365 CE / Integration / Power Apps / Reporting (spec-driven)

```
PHASE 1 — DEFINE
  [Unstructured] /spec ──► /review ──[APPROVED]──► /fdd
                  │         │                    └──► /testplan
                  │         └──[BROWNFIELD?]──► /impact ──[IMPACT-ASSESSED]──► continue to /plan
                  └──[MIXED DOMAIN?]──► /split-spec ──► /review (re-run on scoped spec)

  [Structured — from ALM] /spec-alm ──► /review ──[APPROVED]──► (same as above)
  (set requirement-intake: structured in constitution/10-alm-configuration.md)

  [Structured with optional L3]
  Set l3-intake: optional when L3 (User Story) items are not yet defined in the ALM tool.
  /spec-alm accepts L1/L2 input and marks L3 gaps as pending.
  /plan fills the gaps — generating new L3 stories for pending L2 branches — then generates Tasks.
  (set requirement-intake: structured AND l3-intake: optional in constitution/10-alm-configuration.md)

PHASE 2 — DESIGN
  /plan ──► /clarify ──[TASK-READY]──► /tdd
                                     └──► /blueprint

PHASE 3 — BUILD
  /task ──► /validate ──[READY TO IMPLEMENT]──► /implement ──► /document
```

> If `/review` raises a multi-domain BLOCKER, run `/split-spec {feature-name}`. This classifies every FR as CE/PA/FO, Integration, Data Migration, or Reporting, rewrites the spec in place scoped to the current domain, and produces new specs for each domain found: `specs/{feature-name}-integration/spec.md` (Integration agent), `specs/{feature-name}-data-migration/spec.md` (Data Migration agent), `specs/{feature-name}-reporting/spec.md` (Reporting agent). Then re-run `/review` on the scoped spec.

| Gate | Set by | Blocks |
|---|---|---|
| APPROVED | `/review` | `/fdd`, `/testplan`, `/plan` will not run |
| IMPACT-ASSESSED | `/impact` *(brownfield mode only)* | `/plan` will not run |
| TASK-READY | `/clarify` | `/tdd`, `/blueprint`, `/task` will not run |
| READY TO IMPLEMENT | `/validate` | `/implement` will refuse to run |

### D365 F&O (document-first, four phases)

```
PHASE 1 — FUNCTIONAL DESIGN
  /fdd ──► /fdd-review ──[FDD APPROVED]──► /testplan
             │
             └──[MIXED DOMAIN?]──► /split-spec ──► /fdd-review (re-run on scoped FDD)

PHASE 2 — DESIGN
  /tdd ──► /tdd-review ──[TDD APPROVED]──► /blueprint

PHASE 3 — PLANNING
  /plan ──► /plan-review ──[PLAN APPROVED]

PHASE 4 — BUILD
  /implement {req}/{Object-ID} ──► /document
```

> If `/fdd-review` raises a multi-domain BLOCKER, run `/split-spec {requirement-name}`. This updates the FDD to F&O scope and creates domain-scoped specs for each detected domain: `specs/{requirement-name}-integration/spec.md` (Integration agent, if INT FRs), `specs/{requirement-name}-data-migration/spec.md` (Data Migration agent, if ADF/SFTP FRs), and `specs/{requirement-name}-reporting/spec.md` (Reporting agent, if RPT FRs).

| Gate | Set by | Blocks |
|---|---|---|
| FDD APPROVED | `/fdd-review` | `/testplan`, `/tdd` will not run |
| TDD APPROVED | `/tdd-review` | `/blueprint`, `/plan` will not run |
| PLAN APPROVED | `/plan-review` | `/implement` will refuse to run |

The F&O plan is **flat** — every item is one X++ object (EXT-001, DEN-042, INT-022). No Feature/Epic/Story hierarchy. ALM hierarchy is two levels: Requirement/Epic → Object Task.

### Data Migration (ADF pipeline-driven)

Spec-driven workflow for bidirectional data migrations and integrations using Azure Data Factory, SQL Staging, Dataverse, and SFTP.
Supports all directions: SFTP→Dataverse, Dataverse→SFTP, SQL→Dataverse, Dataverse→SQL, SFTP→SQL, SQL→SFTP.

```
PHASE 1 — DEFINE
  [Unstructured] /spec ──► /review ──[APPROVED]──► /mapping   (field mapping document)
                    │                           └──► /pipeline  (ADF pipeline design)
                    │                           └──► /testplan  (test plan and strategy)
                    └──[BROWNFIELD?]──► /impact ──[IMPACT-ASSESSED]──► continue to /plan

  [Structured — from ALM] /spec-alm ──► /review ──[APPROVED]──► (same as above)
  (set requirement-intake: structured in constitution/10-alm-configuration.md)

  [Structured with optional L3]
  Set l3-intake: optional when L3 (User Story) items are not yet defined in the ALM tool.
  /spec-alm accepts L1/L2 input and marks L3 gaps as pending.
  /plan fills the gaps — generating new L3 stories for pending L2 branches — then generates Tasks.
  (set requirement-intake: structured AND l3-intake: optional in constitution/10-alm-configuration.md)

PHASE 2 — DESIGN
  /plan ──► /clarify ──[TASK-READY]──► /tdd
                                     └──► /blueprint

PHASE 3 — BUILD
  /task ──► /validate ──[READY TO IMPLEMENT]──► /implement ──► /document
```

| Gate | Set by | Blocks |
|---|---|---|
| APPROVED | `/review` | `/mapping`, `/pipeline`, `/testplan`, `/plan` will not run |
| IMPACT-ASSESSED | `/impact` *(brownfield mode only)* | `/plan` will not run |
| TASK-READY | `/clarify` | `/tdd`, `/blueprint`, `/task` will not run |
| READY TO IMPLEMENT | `/validate` | `/implement` will refuse to run |

> **Bidirectional:** The same command set and process works for both inbound (SFTP → Dataverse) and outbound (Dataverse → SFTP). Set `migration.direction` in `constitution/10-alm-configuration.md`.

### D365 CE Brownfield (reverse engineering)

Reverse-engineering agent for existing Dynamics 365 CE solutions. Drop solution artefacts into `input/` and generate functional, technical, integration, data migration, reporting, and architecture documentation. Run before enabling brownfield mode in `d365-ce`, `integration`, or `solution-architect`.

```
PHASE 0 — PREPARE (optional)

  [Unstructured artefacts — cloned repo, ZIP extract, shared drive folder]
  /prepare {path} ──► classifies and copies artefacts into input/
                   ──► docs-generated/prepare-report-{YYYY-MM-DD-HHMM}.md

  Skip if populating input/ manually.

PHASE 1 — DISCOVER

  /scan ──► docs-generated/component-inventory.md
            └─ all subsequent commands read this inventory

PHASE 2 — DOCUMENT

  /document entities       ← entity catalogue
  /document forms-views    ← form layouts, tabs, view columns
  /document flows          ← Power Automate flows
  /document security       ← roles, privileges, field security
  /document plugins        ← one file per plugin assembly
  /document web-resources  ← JS functions, events, Xrm API usage
  /document pcf            ← PCF control manifest and lifecycle
  /document custom-apis    ← request/response, binding, implementation
  /document integrations   ← integration topology + Azure Functions + Logic Apps
  /document adf            ← ADF topology + pipelines + dataflows  (handoff to Data Migration agent)
  /document reporting      ← SSRS per-report + Power BI inventory  (SSRS: CE agent; Power BI: Reporting agent)
  /document all            ← runs all of the above in sequence

  Shortcut: /generate ──► /document all ▸ /fdd ▸ /tdd ▸ /blueprint ▸ /index in one pass

PHASE 3 — ARCHITECTURE

  /fdd       ──► docs-generated/functional/functional-overview.md
  /tdd       ──► docs-generated/technical/technical-overview.md
  /blueprint ──► docs-generated/architecture/ (solution-blueprint.md + data-model.md + dependency-map.md)

PHASE 4 — INDEX

  /index ──► docs-generated/00-index.md   (master navigation table with status per document)
```

> No gates — every command runs independently once `input/` is populated. Run `/scan` first, then any order.

### Solution Architect (cross-domain, blueprint synthesis)

Reads specs, plans, FDDs, and TDDs from all sibling templates and synthesises them into a single authoritative architecture document covering all platforms in scope. Run after domain agents have completed at least the spec and plan phases.

```
PHASE 1 — GENERATE

  Reads from all sibling templates (auto-discovered, or use --features):
  ├── d365-ce        specs/{f}/spec.md   plans/{f}/plan.md
  ├── d365-fo        docs/{f}/fdd.md   tdd.md   plans/{f}/plan.md
  ├── integration    specs/{f}/spec.md   plans/{f}/plan.md
  ├── power-apps     specs/{f}/spec.md   plans/{f}/plan.md
  ├── data-migration specs/{f}/spec.md   plans/{f}/plan.md
  └── reporting      specs/{f}/spec.md   plans/{f}/plan.md
                              │
                              ▼
         /solution-blueprint {project}
                              │
                              ▼
          output/{project}/solution-blueprint.md

  [Brownfield? Set brownfield.enabled: true in constitution/10-project-configuration.md]
  d365-ce-brownfield/docs-generated/ ──► incorporated as As-Is layer before synthesis

PHASE 2 — REVIEW

  /solution-review {project} ──[APPROVED]──► output/{project}/solution-review.md
```

| Gate | Set by | Blocks |
|---|---|---|
| APPROVED | `/solution-review` writes `status: APPROVED` in solution-review.md | Blueprint is not authoritative until approved — re-run after any significant architectural change |

> Auto-discovers features from all sibling templates, or use `--features d365-ce:{f1},integration:{f2}` to target specific domains.

### Solution Estimate (cross-domain, progressive estimation)

Runs alongside any delivery domain at any stage. Each level refines the previous: ROM (±40%) → Structured (±20%) → Detailed (±10%). `/estimate-build` always uses the most detailed data available per feature.

```
PHASE 1 — ROM (no prior domain work needed)
  /estimate-rom {project} {input} ──► estimates/{project}/rom-estimate.md   (L1/L2 confidence)

PHASE 2 — STRUCTURED (after /review in any delivery domain)
  /estimate-spec {project} {feature} ──► estimates/{project}/{feature}-spec-estimate.md   (L3/L4)

PHASE 3 — DETAILED (after /clarify or /plan-review in any delivery domain)
  /estimate-plan {project} {feature} ──► estimates/{project}/{feature}-plan-estimate.md   (L4/L5)

  [If new factors proposed in any run:]
  /factors-review {project} ──[FACTORS APPROVED]──► estimates/{project}/factor-review.md

PHASE 4 — BUILD FORMAL DELIVERABLE
  /estimate-build {project} ──► business-req-detail.md
                                module-build-hrs.md
                                module-overall-hrs.md

PHASE 5 — ROLLUP (optional)
  /estimate-rollup {project} ──► rollup-summary.md   (includes L1–L5 confidence pie chart)
```

| Gate | Set by | Blocks |
|---|---|---|
| FACTORS APPROVED | `/factors-review` | `/estimate-build` will not run if new factors are pending |

> Requirement Level (L1–L5) on every inventory row shows estimate confidence: L1 = placeholder, L5 = fully detailed signed-off. The rollup pie chart gives stakeholders an instant read of overall estimate confidence.

---

## Commands

### Commands — D365 CE / Integration / Power Apps / Reporting

| Command | What it does | Output |
|---|---|---|
| `/spec` | Writes a structured functional specification from your plain-language requirement | `specs/{f}/spec.md` |
| `/spec-alm` | Imports L1/L2/L3 work items from an ALM tool and enhances them into a full specification — preserves existing ALM IDs and hierarchy (structured intake mode only — set `requirement-intake: structured` in `constitution/10-alm-configuration.md`). Supports partial L3 input: set `l3-intake: optional` to allow L2 branches with no L3 — `/plan` will generate the missing User Stories. | `specs/{f}/spec.md` |
| `/review` | Validates the spec against the constitution — sets APPROVED or NEEDS REWORK; raises BLOCKER if requirements from another domain are detected | `specs/{f}/review.md` |
| `/impact` | *(brownfield mode only)* Analyses the approved spec against the existing brownfield system — classifies every component as NEW / EXTEND / REPLACE / REFERENCED / CONFLICT; required by `/plan` when `brownfield.enabled: true` | `specs/{f}/impact-analysis.md` |
| `/split-spec` | Splits a mixed spec into domain-scoped specs — classifies every FR as CE/PA, Integration, Data Migration, or Reporting; produces up to four output specs | `specs/{f}/spec.md` (updated) + `specs/{f}-integration/spec.md` (if INT FRs) + `specs/{f}-data-migration/spec.md` (if ADF/SFTP FRs) + `specs/{f}-reporting/spec.md` (if RPT FRs) + `specs/{f}/split-manifest.md` |
| `/fdd` | Generates the Functional Design Document for business stakeholder review | `docs-generated/{f}/functional-design-document.md` |
| `/testplan` | Generates a full test plan with test cases for every functional requirement | `docs-generated/{f}/test-plan-and-strategy.md` |
| `/plan` | Decomposes the spec into Feature → Epic → Story → High-level Tasks | `plans/{f}/plan.md` + `plans/{f}/work-items.yaml` |
| `/clarify` | Reviews every task for readiness — sets TASK-READY or NOT READY | `plans/{f}/clarify.md` |
| `/tdd` | Generates the Technical Design Document for developer and architect review | `docs-generated/{f}/technical-design-document.md` |
| `/blueprint` | Selects an architecture pattern and generates the Solution Blueprint | `docs-generated/{f}/solution-blueprint.md` |
| `/task` | Converts high-level tasks into dev-ready task cards with ACs, test cases, and DoD | `tasks/{f}/NN-{name}.md` |
| `/validate` | Validates every task card before code is written — sets READY TO IMPLEMENT | Updates `validation-status` in each task card |
| `/implement` | Generates production code and tests from a validated task card | `output/{f}/src/` + `output/{f}/tests/` |
| `/document` | Generates operational docs (deployment guide, runbook, release notes, etc.) | `docs-generated/{f}/` |
| `/alm extract {f}` | Builds a full work-item JSON payload ready for the ALM Agent | `output/{f}/alm/extract-{timestamp}.json` |
| `/alm sync {f} ...` | Writes ALM-assigned IDs back into `work-items.yaml` and task card front matter | Updates `work-items.yaml` + task card `alm-id` fields |
| `/alm get {f} {id}` | Returns the current state of a specific work item by its ALM ID | `output/{f}/alm/get-{alm-id}-{date}.json` |
| `/extract testplan {f}` | Extracts the full test plan — all suites and test cases — to JSON (primary ALM import, rich content) + CSV (metadata) + summary MD | `alm-extract/test-plan-extract.json` + `.csv` + `test-plan-summary.md` |
| `/extract testsuites {f} [suite]` | Extracts one or all test suites to JSON (rich content) + CSV (metadata) + summary MD | `alm-extract/suites-extract.json` + `.csv` + `suites-summary.md` |
| `/extract testcases {f} [tc-id]` | Extracts one or all test cases to JSON (rich content) + CSV (metadata) + detail MD | `alm-extract/testcases-extract.json` + `.csv` + `testcases-detail.md` |
| `/alm sync-testplan {f} [TC-ID ALM-ID]` | Writes ALM-assigned IDs back into the test plan reference tables and suite files — bulk via `alm-mapping.csv` or single TC | Updates `test-plan-and-strategy.md` + suite files |

### Commands — D365 F&O (document-first)

| Command | What it does | Output |
|---|---|---|
| `/fdd` | Generates the FDD (18 sections, ★ mandatory) from a plain-language requirement | `docs/{req}/fdd.md` |
| `/fdd-review` | Reviews FDD — sets FDD APPROVED or NEEDS REWORK; raises BLOCKER if integration requirements detected | `docs/{req}/fdd-review.md` |
| `/split-spec` | Splits a mixed F&O FDD into domain-scoped documents — classifies every FR as F&O, Integration, Data Migration, or Reporting; produces up to four output docs | `docs/{req}/fdd.md` (updated) + `specs/{req}-integration/spec.md` (if INT FRs) + `specs/{req}-data-migration/spec.md` (if ADF/SFTP FRs) + `specs/{req}-reporting/spec.md` (if RPT FRs) + `docs/{req}/split-manifest.md` |
| `/testplan` | Generates test strategy and test cases from approved FDD — runs after FDD APPROVED, end of Phase 1 | `docs/{req}/test-plan.md` |
| `/tdd` | Generates the TDD (IT System Design Specification) from approved FDD | `docs/{req}/tdd.md` |
| `/tdd-review` | Reviews TDD — sets TDD APPROVED or NEEDS REWORK | `docs/{req}/tdd-review.md` |
| `/blueprint` | Generates the Solution Blueprint (extension model, data flows, security, integration, risks) from approved TDD | `docs/{req}/solution-blueprint.md` |
| `/plan` | Generates flat object-level plan (one item per X++ object) from approved TDD | `plans/{req}/plan.md` + `plans/{req}/work-items.yaml` |
| `/plan-review` | Reviews plan coverage, Object-IDs, naming, sequencing — sets PLAN APPROVED | `plans/{req}/plan-review.md` |
| `/implement {req}/{Object-ID}` | Implements one X++ object — generates code, impl record, updates tracker | `output/{req}/src/` + `output/{req}/impl-docs/` |
| `/document` | Generates deployment guide, release notes, test evidence, object register | `docs/{req}/` |
| `/alm extract {req}` | Builds JSON payload with 2-level hierarchy (Requirement/Epic + Object Tasks by Object-ID) ready for ALM Agent | `output/{req}/alm/extract-{timestamp}.json` |
| `/alm sync {req} ...` | Writes ALM-assigned IDs back into `work-items.yaml` after ALM Agent creates items | Updates `work-items.yaml` `alm-id` fields |
| `/alm get {req} {id}` | Returns current state of a specific work item including `status` and `impl-doc-path` | `output/{req}/alm/get-{alm-id}-{date}.json` |
| `/extract testplan {req}` | Extracts the full test plan — all suites and test cases — to JSON (primary ALM import, rich content) + CSV (metadata) + summary MD | `alm-extract/test-plan-extract.json` + `.csv` + `test-plan-summary.md` |
| `/extract testsuites {req} [suite]` | Extracts one or all test suites to JSON (rich content) + CSV (metadata) + summary MD | `alm-extract/suites-extract.json` + `.csv` + `suites-summary.md` |
| `/extract testcases {req} [tc-id]` | Extracts one or all test cases to JSON (rich content) + CSV (metadata) + detail MD | `alm-extract/testcases-extract.json` + `.csv` + `testcases-detail.md` |
| `/alm sync-testplan {req} [TC-ID ALM-ID]` | Writes ALM-assigned IDs back into the test plan reference tables and suite files — bulk via `alm-mapping.csv` or single TC | Updates `test-plan.md` + suite files |

### Commands — Data Migration

| Command | What it does | Output |
|---|---|---|
| `/spec {migration-id}` | Writes a 13-section migration specification from plain-language requirements | `specs/{m}/spec.md` |
| `/spec-alm {migration-id}` | Imports and enhances ALM work items (L1/L2/L3) into a migration specification — structured intake mode, preserves ALM IDs. Supports partial L3 input: set `l3-intake: optional` to allow L2 branches with no L3 — `/plan` will generate missing User Stories. | `specs/{m}/spec.md` |
| `/review {migration-id}` | Validates the spec against the constitution — sets APPROVED or CHANGES REQUIRED | `specs/{m}/review.md` |
| `/split-spec {migration-id}` | Splits a mixed Migration spec — classifies every MR as Data Migration, CE, Integration, or Reporting; keeps migration-scoped MRs in place and creates domain-scoped specs for each detected domain; produces up to four output specs | `specs/{m}/spec.md` (updated) + `specs/{m}-ce/spec.md` (if CE FRs) + `specs/{m}-integration/spec.md` (if INT FRs) + `specs/{m}-reporting/spec.md` (if RPT FRs) + `specs/{m}/split-manifest.md` |
| `/impact {migration-id}` | *(brownfield mode only)* Analyses collision risk with existing target data; requires IMPACT-ASSESSED before `/plan` | `specs/{m}/impact-analysis.md` |
| `/mapping {migration-id}` | Generates field mapping document — source schema, target schema, transformation expressions, lookups, derived fields | `docs-generated/{m}/field-mapping.md` |
| `/pipeline {migration-id}` | Generates ADF pipeline design — linked services, datasets, pipelines, data flows, triggers, error routing | `docs-generated/{m}/pipeline-design.md` |
| `/testplan {migration-id}` | Generates test plan with SIT, UAT, performance, and security test cases | `docs-generated/{m}/test-plan-and-strategy.md` |
| `/extract testplan {migration-id}` | Extracts full test plan to ALM-ready JSON (rich content, primary import) + CSV (metadata) + summary MD | `docs-generated/{m}/alm-extract/test-plan-extract.{json,csv}` + `test-plan-summary.md` |
| `/extract testsuites {migration-id} [suite]` | Extracts one or all test suites with full step detail to JSON + CSV + summary MD | `docs-generated/{m}/alm-extract/suites-extract.{json,csv,md}` |
| `/extract testcases {migration-id} [tc-id]` | Extracts one or all test cases with full step detail to JSON + CSV + detail MD | `docs-generated/{m}/alm-extract/testcases-extract.{json,csv}` + `testcases-detail.md` |
| `/plan {migration-id}` | Decomposes migration into Epic → Feature → Story → Task with ADF and SQL component tagging | `plans/{m}/plan.md` + `plans/{m}/work-items.yaml` |
| `/clarify {migration-id}` | Reviews plan for task-readiness — sets TASK-READY or CHANGES REQUIRED | `plans/{m}/clarify.md` |
| `/tdd {migration-id}` | Generates Technical Design Document — architecture, ADF catalogue, SQL schema, data flow design, security | `docs-generated/{m}/technical-design-document.md` |
| `/blueprint {migration-id}` | Generates Solution Blueprint — component map, artefact inventory, design decisions | `docs-generated/{m}/solution-blueprint.md` |
| `/task {migration-id}` | Converts plan into dev-ready task cards for every SQL DDL, SP, ADF artefact, test file, and deploy script | `tasks/{m}/NN-{name}.md` |
| `/validate {migration-id}` | Validates every task card — sets READY TO IMPLEMENT or BLOCKED | Updates `validation-status` in each task card |
| `/implement {migration-id}` | Generates all ADF JSON artefacts, SQL DDL + SPs, ARM template, deploy.ps1, and test data files | `output/{m}/adf/`, `output/{m}/sql/`, `output/{m}/tests/` |
| `/document {migration-id}` | Generates deployment guide, runbook, and release notes | `docs-generated/{m}/deployment-guide.md`, `runbook.md`, `release-notes.md` |
| `/alm extract {migration-id}` | Builds work item JSON extract for ALM import | `output/{m}/alm/extract-{timestamp}.json` |
| `/alm sync {migration-id} {uid} {id}` | Writes ALM IDs back into work-items.yaml and task cards | Updates `work-items.yaml` + task card `alm-id` fields |
| `/alm push-tests {migration-id}` | Creates test plan, suites, and cases in ADO; writes ALM IDs back into test plan document | Updates `test-plan-and-strategy.md` |

### Commands — D365 CE Brownfield

The single documentation agent for all artefacts in a D365 CE project — CE components, ADF pipelines, SSRS reports, and Power BI files.
Run before enabling brownfield mode in the CE, Integration, or Solution Architect agents.

| Command | What it does | Output |
|---|---|---|
| `/prepare {path}` | Classifies and copies artefacts from any directory (repo, ZIP extract) into the standard `input/` layout. Add `--overwrite` to force-update files where the source is newer than the existing `input/` copy. | `docs-generated/prepare-report-{YYYY-MM-DD-HHMM}.md` (timestamped per run) + `docs-generated/prepare-history.md` |
| `/scan` | Inventories all components — entities, plugins, web resources, flows, ADF pipelines, SSRS reports, Power BI files | `docs-generated/component-inventory.md` |
| `/document entities` | Entity catalogue — attributes, relationships, keys | `docs-generated/functional/entity-catalogue.md` |
| `/document forms-views` | Form layout, tabs, fields, views per entity | `docs-generated/functional/forms-and-views.md` |
| `/document flows` | Power Automate flows — triggers, step-by-step logic | `docs-generated/functional/flows.md` |
| `/document security` | Roles, privileges, field security, personas | `docs-generated/functional/security-model.md` |
| `/document plugins` | One file per plugin assembly — triggers, logic, Dataverse calls | `docs-generated/technical/plugins/{AssemblyName}.md` |
| `/document web-resources` | JS functions, events, Xrm API usage per namespace | `docs-generated/technical/web-resources/{namespace}.md` |
| `/document pcf` | PCF control manifest, lifecycle, bindings | `docs-generated/technical/pcf/{ControlName}.md` |
| `/document custom-apis` | Custom API request/response, binding, implementation | `docs-generated/technical/custom-apis.md` |
| `/document integrations` | Integration topology, Azure Functions, Logic Apps | `docs-generated/integrations/` |
| `/document adf` | ADF topology — pipelines, linked services, datasets, dataflows, triggers (handoff to Data Migration agent) | `docs-generated/data-migration/` |
| `/document reporting` | SSRS reports (fully documented, CE-owned) + Power BI inventory (handoff to Reporting agent) | `docs-generated/reporting/` |
| `/document all` | Runs all `/document` sub-commands in sequence | all of the above |
| `/generate` | Runs all document scopes + fdd + tdd + blueprint + index in one shot after `/scan` | all of the above |
| `/fdd` | Functional overview in business language | `docs-generated/functional/functional-overview.md` |
| `/tdd` | Technical overview — patterns, tech debt, risks | `docs-generated/technical/technical-overview.md` |
| `/blueprint` | Solution blueprint + data model + dependency map | `docs-generated/architecture/` (3 files) |
| `/index` | Master navigation index linking all generated documents | `docs-generated/00-index.md` |

### Commands — Solution Architect

| Command | What it does | Output |
|---|---|---|
| `/solution-blueprint {project}` | Auto-discovers specs, plans, and blueprints from all configured domain agents and synthesises a cross-template architecture document with component diagrams, data model, and integration topology | `output/{project}/solution-blueprint.md` |
| `/solution-review {project}` | Validates the solution blueprint against the constitution — sets APPROVED or NEEDS REWORK; includes brownfield baseline check when `brownfield.enabled: true` | `output/{project}/solution-review.md` |

### Commands — Solution Estimate

> Estimates can be run at any stage — ROM before any domain work, spec after `/review`, plan after `/clarify` or `/plan-review`. All three levels feed into a single formal deliverable via `/estimate-build`.

| Command | What it does | Output |
|---|---|---|
| `/estimate-rom {project} {input}` | Generates a Rough Order of Magnitude estimate from any unstructured requirements document or description — no prior domain agent work needed | `estimates/{p}/rom-estimate.md` |
| `/estimate-spec {project} {feature}` | Generates a structured estimate from an approved spec in any domain agent — reads spec.md directly | `estimates/{p}/{f}-spec-estimate.md` |
| `/estimate-plan {project} {feature}` | Generates a detailed estimate from an approved plan in any domain agent — reads plan.md and work-items.yaml | `estimates/{p}/{f}-plan-estimate.md` |
| `/factors-review {project}` | Reviews proposed estimation factors that were identified during an estimate run — sets FACTORS APPROVED gate | `estimates/{p}/factor-review.md` |
| `/estimate-build {project}` | Generates the formal 3-part estimation deliverable using the most detailed estimate available per feature | `estimates/{p}/business-req-detail.md` + `module-build-hrs.md` + `module-overall-hrs.md` |
| `/estimate-rollup {project}` | Generates a cross-feature rollup summary with Requirement Level (L1–L5) confidence pie chart | `estimates/{p}/rollup-summary.md` |

| Gate | Set by | Blocks |
|---|---|---|
| FACTORS APPROVED | `/factors-review` | `/estimate-build` will not run if new factors are pending |

### ALM Agent (Azure DevOps integration)

Bridges local project documents with Azure DevOps. Run after domain agents have generated their extract files. Writes ALM IDs back into **every** project document once work items are created.

```
WORK ITEMS
  Domain agent /alm extract {feature} ──► output/{f}/alm/extract-*.json
  /wi-create-bulk {domain} {feature}  ──► ADO: Epic → Feature → Story → Task (linked)
  /wi-sync {domain} {feature}         ──► work-items.yaml + plan.md + task cards + spec.md updated

WIKI
  /wiki-push {domain} {feature} {doc} ──► ADO wiki page created/updated
  /wiki-pull {wiki-path}              ──► local file updated from wiki
  /wiki-sync {domain} {feature}       ──► all configured docs synced

TEST
  Domain agent /extract testplan {f}  ──► output/{f}/alm/test-plan-extract.json
  /test-create {domain} {feature}     ──► ADO: Test Plan + Suites + Cases (linked)
  /test-sync {domain} {feature}       ──► test-plan-and-strategy.md + suite files updated

SPRINT
  /sprint-assign {domain} {feature} {sprint} ──► all work items assigned to iteration

PIPELINE
  /pipeline-run {pipeline-id} [{branch}]      ──► pipeline triggered, run ID returned
  /pipeline-status {pipeline-id} {run-id}     ──► build status checked

CLEANUP  ⚠ Requires explicit confirmation
  /cleanup-wi {id}                    ──► single work item deleted
  /cleanup-wi-tree {id}               ──► full hierarchy deleted
  /cleanup-test {plan-id}             ──► test plan + all suites + all cases deleted
  /cleanup-suite {plan-id} {suite-id} ──► all test cases in a suite deleted
```

> Configure `ADO_ORG_URL`, `ADO_PROJECT`, and `ADO_PAT` in `tools/alm-agent/.claude/settings.json` under `mcpServers.ado-alm.env`. The PAT is never stored in any other file.

### Commands — ALM Agent

**Work Items**

| Command | Pre-condition | What it does |
|---|---|---|
| `/wi-get {id}` | PAT set | Fetch and display a single work item from ADO |
| `/wi-get-children {epic-id}` | PAT set | Fetch full hierarchy under an Epic recursively |
| `/wi-create {type}` | PAT set | Create a single work item interactively |
| `/wi-create-bulk {domain} {feature}` | Extract file exists | Bulk create full L1→L4 hierarchy with parent links; auto-runs `/wi-sync` |
| `/wi-create-bulk {domain} {feature} --dry-run` | Extract file exists | Preview items that would be created, no API calls |
| `/wi-sync {domain} {feature}` | alm-response exists | Write ALM IDs into work-items.yaml, plan.md, task cards, and spec.md |
| `/wi-status {domain} {feature}` | PAT set | Show sync status and document coverage report |
| `/wi-export {epic-id}` | PAT set | Export full hierarchy to JSON + CSV |

**Wiki**

| Command | Pre-condition | What it does |
|---|---|---|
| `/wiki-push {domain} {feature} {doc}` | Local file exists | Push a single document to ADO wiki (any doc key: spec, fdd, tdd, blueprint, testplan, review, clarify, deployment-guide, release-notes, and domain-specific keys) |
| `/wiki-pull {wiki-path}` | PAT set | Pull ADO wiki page to local file |
| `/wiki-sync {domain} {feature}` | PAT set | Push all sync-enabled docs to wiki in one pass — supports all 8 domains; toggles configured in `constitution/10-alm-configuration.md` |

**Test Plans**

| Command | Pre-condition | What it does |
|---|---|---|
| `/test-create {domain} {feature}` | Test extract exists | Bulk create Test Plan + Suites + Cases; auto-runs `/test-sync` |
| `/test-create {domain} {feature} --dry-run` | Test extract exists | Preview test plan structure, no API calls |
| `/test-create-plan {name}` | PAT set | Create a single Test Plan |
| `/test-create-suite {plan-id} {name}` | PAT set | Create a single Test Suite |
| `/test-create-case {plan-id} {suite-id}` | PAT set | Create a single Test Case interactively |
| `/test-sync {domain} {feature}` | test-response exists | Write test ALM IDs into test plan and suite documents |
| `/test-get {plan-id}` | PAT set | Get Test Plan with all Suites and Cases |

**Sprint and Pipeline**

| Command | Pre-condition | What it does |
|---|---|---|
| `/sprint-assign {domain} {feature} {sprint}` | Work items synced | Bulk assign all work items to an iteration (confirmation required) |
| `/pipeline-run {pipeline-id} [{branch}]` | PAT set | Trigger a pipeline run and return the run ID |
| `/pipeline-status {pipeline-id} {run-id}` | PAT set | Check pipeline run state and result |

**Cleanup ⚠ Destructive**

| Command | Pre-condition | What it does |
|---|---|---|
| `/cleanup-wi {id}` | PAT set | Delete single work item (confirmation required) |
| `/cleanup-wi-tree {id}` | PAT set | Delete full hierarchy root-to-leaf (confirmation required) |
| `/cleanup-test {plan-id}` | PAT set | Delete test plan + all suites + all cases (confirmation required) |
| `/cleanup-suite {plan-id} {suite-id}` | PAT set | Delete all cases in a suite, keep suite (confirmation required) |

---

## Brownfield Mode — D365 CE / Integration / Reporting / Solution Architect

Use when you are **adding features to a system that already exists**, not building from scratch.
The brownfield workflow has five agents that work together:

```
d365-ce-brownfield agent          d365-ce / integration /            solution-architect agent
───────────────────────           power-apps / reporting agent       ────────────────────────
/scan                             Set brownfield.enabled: true       Set brownfield.enabled: true
/document all                     Set docs-path → brownfield         Set docs-path → brownfield
/fdd                              docs-generated/                    docs-generated/
/tdd
/blueprint                        /spec → /review → /impact          /solution-blueprint {project}
/index                            → /plan → ...                       (incorporates as-is baseline)
    └─ docs-generated/ ──────────────────────────────────────────────────────────►
                         (delivery agent reads these docs at every step)
                         (solution-architect reads these docs as As-Is layer)
```

> **Reporting brownfield:** When adding Power BI reports or datasets to an existing reporting estate, enable brownfield mode in the Reporting agent. `/impact` classifies every existing dataset, report, DAX measure set, RLS role, and workspace as NEW / EXTEND / REPLACE / REFERENCED / CONFLICT. Set `brownfield.docs-path` in `constitution/10-alm-configuration.md` to the folder containing your existing reporting inventory docs (`report-inventory.md`, `dataset-catalogue.md`, `measure-catalogue.md`, `rls-catalogue.md`).

### Step-by-step

**1. Run the brownfield agent** on your existing system:

```
[open templates/d365-ce-brownfield in Claude Code]
/scan            ← inventories all components across all solution packages
/document all    ← generates plugin, web resource, entity, flow docs
/fdd             ← functional overview
/tdd             ← technical overview
/blueprint       ← architecture docs and dependency map
/index           ← navigation index
```

**2. Configure the delivery agent** (d365-ce, integration, power-apps, or reporting):

Open `constitution/10-alm-configuration.md` and add:

```
[brownfield]
enabled:   true
docs-path: ../d365-ce-brownfield/docs-generated
```

**3. Run the delivery workflow** with the extra `/impact` step:

```
/spec {feature-name}
/review {feature-name}
/impact {feature-name}      ← classifies every touched component as NEW/EXTEND/REPLACE/CONFLICT
/plan {feature-name}
...
```

Every subsequent command (spec, plan, task, tdd, blueprint, implement) automatically reads the brownfield documentation and adjusts its output — extending existing components correctly, matching established conventions, and flagging anything that would break existing behaviour.

**4. Configure the solution-architect agent** (optional — for cross-template blueprinting):

Open `templates/solution-architect/constitution/10-project-configuration.md` and set:

```
[brownfield]
enabled:   true
docs-path: ../d365-ce-brownfield/docs-generated
```

Then run `/solution-blueprint {project}` as normal. The blueprint will incorporate the existing system as an **As-Is Baseline** layer — showing existing components alongside new additions in the architecture diagrams, marking existing Dataverse entities as `[EXISTING]` in the data model, and adding backward compatibility risks to Section 8.

---

## Running without Claude Code

All domain agents are tool-agnostic. The command and constitution files are plain Markdown —
any AI model can read and follow them. Claude Code provides the best integrated experience
(slash commands, MCP tools, session continuity), but it is not a requirement.

### Universal Runner

`tools/runner/` is a Node.js CLI that loads the constitution and command files for any domain,
calls any model provider, and writes the output files — without Claude Code.

```bash
cd tools/runner && npm install

# Claude API
ANTHROPIC_API_KEY=sk-... node run-agent.js d365-ce spec my-feature

# OpenAI GPT-4o
OPENAI_API_KEY=sk-... node run-agent.js d365-ce spec my-feature --model openai

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://my-instance.openai.azure.com \
AZURE_OPENAI_API_KEY=... \
node run-agent.js data-migration spec sftp-to-dv-accounts --model azure-openai

# Generate a paste-ready prompt file for any chat UI
node run-agent.js d365-ce plan my-feature --output-prompt prompt.md
```

**How it works:** The runner loads `templates/{domain}/constitution/CLAUDE.md`, all constitution
standards files, and the command file for the requested command. It assembles them into a system
prompt + user prompt, calls the model API with streaming, and parses `<file path="...">` blocks
from the response to write output files automatically.

**What is not available vs Claude Code:**

| | Claude Code | Universal Runner |
|---|---|---|
| Slash command auto-discovery | ✅ | CLI invocation |
| Constitution auto-loaded | ✅ | Loaded per call |
| Gate enforcement | ✅ automatic | Enforced in output; not re-checked by runner |
| MCP / ADO tools | ✅ | Not available — files only |
| Session memory | ✅ | Stateless; existing files loaded from disk |

See [tools/runner/README.md](tools/runner/README.md) for full CLI reference.

---

### GitHub Copilot

Three ways to run a command — all produce equivalent output:

| Method | How | Requires |
|---|---|---|
| **Script** | `copilot-run.ps1` → prompt copied to clipboard → paste into Copilot Chat | Node.js on PATH |
| **VS Code Task** | `Ctrl+Shift+P` → Run Task → pick domain/command → paste | Node.js on PATH |
| **Direct Copilot Chat** | Ask Copilot to `@workspace`-read constitution + command files | Nothing extra |

**Script:**
```powershell
.\scripts\copilot-run.ps1 d365-ce spec my-feature
.\scripts\copilot-run.ps1 d365-ce review my-feature
.\scripts\copilot-run.ps1 data-migration spec sftp-to-dv-accounts
```
Open Copilot Chat (`Ctrl+Alt+I`) → Agent mode (`★`) → paste → Enter.

**Direct Copilot Chat:**
```
Run /spec for d365-ce. Feature: my-feature.
Read @workspace templates/d365-ce/constitution/CLAUDE.md
Read @workspace templates/d365-ce/.claude/commands/spec.md
Write output to specs/my-feature/spec.md using the createFile tool.
```
`.github/copilot-instructions.md` is automatically loaded as a workspace system prompt and contains
the full step-by-step instructions for running any command this way.

**Limitations:** MCP/ADO tool calls (`ado_*`) are not available in GitHub Copilot.
Gate enforcement is advisory — check gate file status manually before each gated command.

See [docs/github-copilot-guide.md](docs/github-copilot-guide.md) for all three methods, workflow order, and troubleshooting.
