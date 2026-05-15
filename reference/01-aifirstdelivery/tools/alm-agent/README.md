# ALM Agent

Azure DevOps integration agent for AI First Delivery projects.
Creates, syncs, and manages work items, wiki pages, test assets, sprints, and pipelines in Azure DevOps,
reading inputs from domain agent outputs and writing ALM IDs back into all project documents.

---

## Table of Contents

1. [What Is It](#1-what-is-it)
2. [How It Works](#2-how-it-works)
   - [Setup](#setup)
   - [Typical Flow](#typical-flow)
3. [Command Reference](#command-reference)
4. [Structure and Outputs](#4-structure-and-outputs)

---

## 1. What Is It

The ALM Agent bridges local project documents with Azure DevOps. Domain templates (d365-ce, d365-fo,
integration, data-migration, power-apps) produce structured extract files — this agent takes those files
and creates the corresponding items in Azure DevOps via the `ado-alm` MCP server, then writes the
ADO-assigned IDs back into all source documents.

**Inputs consumed:**

| File | Produced by | Contents |
|---|---|---|
| `output/{feature}/alm/extract-*.json` | Domain agent `/alm extract` | Work items: Epic → Feature → User Story → Task |
| `docs-generated/{feature}/alm-extract/test-plan-extract.json` | Domain agent `/extract testplan` | Test plan: suites + test cases with steps |

**The agent never modifies source files without first confirming the ALM IDs it will write.**

---

## 2. How It Works

### Setup

**Step 1 — Build the MCP server (one-time)**

The `ado-alm` MCP server is a Node.js stdio process launched automatically by Claude Code — you do not run it manually. Build it once, then Claude Code starts it on every session open.

```powershell
cd tools/mcp-server
npm install
npm run build
# Output: tools/mcp-server/dist/index.js
```

Rebuild after any change to `tools/mcp-server/src/`. The output file must exist before Claude Code can start the server.

**Step 2 — Configure `.claude/settings.json`**

Open [.claude/settings.json](.claude/settings.json) and set the credentials directly (the ALM agent uses this file instead of the root `.mcp.json`):

```json
{
  "mcpServers": {
    "ado-alm": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\tools\\mcp-server\\dist\\index.js"],
      "env": {
        "ADO_ORG_URL": "https://dev.azure.com/your-org",
        "ADO_PROJECT": "YourProject",
        "ADO_PAT": "your-personal-access-token"
      }
    }
  }
}
```

> **Path must be absolute.** Relative paths in `args` fail when Claude Code resolves the working directory. Use the full path to `dist/index.js`.
>
> **Do not commit this file with credentials.** Add `tools/alm-agent/.claude/settings.json` to `.gitignore` or use a secrets manager to inject the PAT.

**PAT permissions required:** Work Items (Read & Write), Test Plans (Read & Write), Wiki (Read & Write), Pipelines (Read & Execute)

**Step 3 — Configure project settings**

**Shared ADO settings** (org URL, project, area path, iteration path, work item types) are read from [`../../alm-configuration.md`](../../alm-configuration.md) at the repo root. Edit that file once — it is shared by all agents. If the root file does not exist, the agent falls back to `constitution/10-alm-configuration.md`.

Open [constitution/10-alm-configuration.md](constitution/10-alm-configuration.md) and set only the ALM-agent-specific values:
- `wiki-id` and `wiki-root`
- Domain paths (relative paths to each domain agent root)
- Test plan defaults (if you want to override the root settings)

**Step 4 — Open this folder in Claude Code**

```
code tools/alm-agent
```

All slash commands are immediately available.

**Step 5 — Verify the MCP server started**

After opening in Claude Code, confirm the `ado-alm` server is live:
- `ado_*` tools should appear in the Claude Code tool panel (MCP section)
- Or run `/wi-get 1` — the agent calls `ado_get_work_items_batch` with an empty list as a connectivity check and prints a setup warning if it cannot reach the server

**Troubleshooting:**

| Symptom | Likely Cause | Fix |
|---|---|---|
| `ado_*` tools not available | `dist/index.js` does not exist | Run `npm run build` in `tools/mcp-server/` |
| `ado_*` tools not available | Relative path in `args` | Use the full absolute path to `dist/index.js` |
| Authentication error | `ADO_PAT` not set, expired, or wrong | Set / rotate `ADO_PAT` in `settings.json` → `env` |
| 403 on every call | PAT lacks scopes | Grant all four required permissions (see Step 2) |
| Tools show as disconnected | Stale process | Reload the Claude Code window to restart the MCP process |

> See also the full [MCP Server — Local Setup and Verification](../../README.md#running-the-mcp-server-locally) section in the root README.

### Typical Flow

```
WORK ITEMS
  1. In domain template:    /alm extract {feature}
                            → output/{feature}/alm/extract-*.json

  2. In ALM agent:          /wi-create-bulk {domain} {feature}
                            → ADO: Epic → Feature → User Story → Task (linked)
                            → output/{feature}/alm/alm-response-*.json

  3. In ALM agent:          /wi-sync {domain} {feature}
                            → work-items.yaml, plan.md, task cards, spec.md updated

TEST PLANS
  4. In domain template:    /extract testplan {feature}
                            → docs-generated/{feature}/alm-extract/test-plan-extract.json

  5. In ALM agent:          /test-create {domain} {feature}
                            → ADO: Test Plan + Suites + Cases (linked)
                            → output/{feature}/alm/test-response-*.json

  6. In ALM agent:          /test-sync {domain} {feature}
                            → test-plan-and-strategy.md + suite files updated

WIKI
  7. In ALM agent:          /wiki-sync {domain} {feature}
                            → all enabled documents pushed to ADO wiki

SPRINT
  8. In ALM agent:          /sprint-assign {domain} {feature} {sprint}
                            → all work items assigned to iteration
```

---

## Command Reference

### Work Items

| Command | What it does |
|---|---|
| `/wi-get {id}` | Fetch and display a single work item |
| `/wi-get-children {epic-id}` | Fetch full hierarchy under an Epic |
| `/wi-create {type}` | Create a single work item interactively |
| `/wi-create-bulk {domain} {feature}` | Bulk create full L1→L4 hierarchy from domain extract |
| `/wi-create-bulk {domain} {feature} --dry-run` | Preview items without creating |
| `/wi-sync {domain} {feature}` | Write ADO IDs into work-items.yaml, plan.md, task cards, spec.md |
| `/wi-status {domain} {feature}` | Show sync status for all work items |
| `/wi-export {epic-id}` | Export hierarchy to JSON + CSV |

### Wiki

| Command | What it does |
|---|---|
| `/wiki-push {domain} {feature} {doc}` | Push a single document to ADO wiki (any doc key: spec, fdd, tdd, blueprint, testplan, review, clarify, deployment-guide, etc.) |
| `/wiki-pull {wiki-path}` | Pull a wiki page to a local file |
| `/wiki-sync {domain} {feature}` | Push all sync-enabled docs to ADO wiki in one pass — supports all 8 domains (d365-ce, integration, power-apps, reporting, data-migration, d365-fo, solution-architect, solution-estimate) |

> Sync toggles and domain paths are configured per-project in `constitution/10-alm-configuration.md`. See `wiki-sync.md` in `.claude/commands/` for the full toggle reference and domain applicability matrix.

### Test Plans

| Command | What it does |
|---|---|
| `/test-create {domain} {feature}` | Bulk create Test Plan + Suites + Cases |
| `/test-create {domain} {feature} --dry-run` | Preview test plan without creating |
| `/test-create-plan {name}` | Create a single Test Plan |
| `/test-create-suite {plan-id} {name}` | Create a single Test Suite |
| `/test-create-case {plan-id} {suite-id}` | Create a single Test Case |
| `/test-sync {domain} {feature}` | Write test ALM IDs into test plan documents |
| `/test-get {plan-id}` | Get Test Plan with all Suites and Cases |

### Sprint & Pipeline

| Command | What it does |
|---|---|
| `/sprint-assign {domain} {feature} {sprint}` | Assign all work items to a sprint/iteration |
| `/pipeline-run {pipeline-id} [{branch}]` | Trigger a pipeline run |
| `/pipeline-status {pipeline-id} {run-id}` | Check pipeline run status/result |

### Cleanup ⚠ Destructive — confirmation required

| Command | What it does |
|---|---|
| `/cleanup-wi {id}` | Delete a single work item |
| `/cleanup-wi-tree {id}` | Delete a full work item hierarchy (Epic and all descendants) |
| `/cleanup-test {plan-id}` | Delete a test plan + all suites + all cases |
| `/cleanup-suite {plan-id} {suite-id}` | Delete all test cases under a suite |

---

## 4. Structure and Outputs

```
tools/alm-agent/
├── .claude/
│   ├── commands/
│   │   ├── wi-get.md                ← /wi-get
│   │   ├── wi-get-children.md       ← /wi-get-children
│   │   ├── wi-create.md             ← /wi-create
│   │   ├── wi-create-bulk.md        ← /wi-create-bulk [--dry-run]
│   │   ├── wi-sync.md               ← /wi-sync
│   │   ├── wi-status.md             ← /wi-status
│   │   ├── wi-export.md             ← /wi-export
│   │   ├── wiki-push.md             ← /wiki-push
│   │   ├── wiki-pull.md             ← /wiki-pull
│   │   ├── wiki-sync.md             ← /wiki-sync
│   │   ├── test-create.md           ← /test-create [--dry-run]
│   │   ├── test-create-plan.md      ← /test-create-plan
│   │   ├── test-create-suite.md     ← /test-create-suite
│   │   ├── test-create-case.md      ← /test-create-case
│   │   ├── test-sync.md             ← /test-sync
│   │   ├── test-get.md              ← /test-get
│   │   ├── sprint-assign.md         ← /sprint-assign
│   │   ├── pipeline-run.md          ← /pipeline-run
│   │   ├── pipeline-status.md       ← /pipeline-status
│   │   ├── cleanup-wi.md            ← /cleanup-wi
│   │   ├── cleanup-wi-tree.md       ← /cleanup-wi-tree
│   │   ├── cleanup-test.md          ← /cleanup-test
│   │   └── cleanup-suite.md         ← /cleanup-suite
│   └── settings.json                ← MCP server registration + permissions
├── constitution/
│   ├── 00-index.md                  ← constitution file index and workflow overview
│   ├── 10-alm-configuration.md      ← configure before first use
│   └── CLAUDE.md                    ← auto-loaded agent rules and command reference
├── output/                          ← create/sync result JSON files (gitignored)
└── README.md
```

**Output files written by this agent:**

| File | Written by | Contents |
|---|---|---|
| `output/{feature}/alm/alm-response-*.json` | `/wi-create-bulk` | ADO API responses with assigned work item IDs |
| `output/{feature}/alm/test-response-*.json` | `/test-create` | ADO API responses with assigned test plan/suite/case IDs |
| `work-items.yaml` (in domain agent) | `/wi-sync` | `alm-id` fields populated |
| `plan.md`, `task cards`, `spec.md` (in domain agent) | `/wi-sync` | ALM ID references updated inline |
| `test-plan-and-strategy.md` (in domain agent) | `/test-sync` | ALM ID references updated in TC reference tables |
