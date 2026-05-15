# ADO ALM MCP Server

An MCP (Model Context Protocol) server that exposes Azure DevOps REST APIs as typed tools for Claude Code agents.
Built on the `@modelcontextprotocol/sdk`. Supports two transport modes:

| Mode | When to use |
|---|---|
| **stdio** (default) | Claude Code spawns the server as a child process — zero setup |
| **HTTP/SSE** | Server runs independently; Claude Code connects to it over HTTP |

---

## Tools Exposed

### Work Items

| Tool | Description |
|---|---|
| `ado_create_work_item` | Create a single work item (Epic, Feature, User Story, Task, Bug) |
| `ado_bulk_create_work_items` | Bulk create a full L1→L4 hierarchy with parent-child linking in one call |
| `ado_get_work_item` | Fetch a single work item by ID |
| `ado_get_work_items_batch` | Fetch up to 200 work items by ID list |
| `ado_update_work_item` | Update one or more fields on an existing work item |
| `ado_batch_update_field` | Set the same field value on multiple work items (e.g. sprint assignment) |
| `ado_delete_work_item` | Delete a work item; pass `destroy: true` for permanent deletion |
| `ado_workitem_add_comment` | Add a comment to a work item |
| `ado_workitem_get_comments` | Get all comments on a work item |
| `ado_workitem_get_history` | Get the full revision history of a work item |

### Queries

| Tool | Description |
|---|---|
| `ado_run_wiql` | Run a WIQL query — used for recursive hierarchy traversal |
| `ado_get_work_items_by_title` | Search work items by title substring |
| `ado_get_area_paths` | List all area paths in the project |
| `ado_get_iterations` | List all iteration/sprint paths |

### Wiki

| Tool | Description |
|---|---|
| `ado_wiki_list_wikis` | List all wikis in the project |
| `ado_wiki_push` | Create or update a wiki page (upsert by path) |
| `ado_wiki_pull` | Get the content of a wiki page by path |
| `ado_wiki_list_pages` | List all pages under a given wiki path |

### Test Plans

| Tool | Description |
|---|---|
| `ado_create_test_plan` | Create a test plan |
| `ado_create_test_suite` | Create a static test suite within a plan |
| `ado_create_test_case` | Create a test case with structured action/expected steps |
| `ado_add_test_case_to_suite` | Add one or more test cases to a suite |
| `ado_get_test_plan` | Get test plan details including all suites |
| `ado_get_test_suite_cases` | Get all test cases in a suite |
| `ado_bulk_create_test_suite` | Create a full plan + suites + test cases in one call |
| `ado_delete_test_plan` | Delete a test plan |
| `ado_delete_test_suite` | Delete a test suite |

### Pipelines

| Tool | Description |
|---|---|
| `ado_pipeline_list` | List all pipelines in the project |
| `ado_pipeline_run` | Trigger a pipeline run (optional branch override) |
| `ado_pipeline_get_run` | Get the status and result of a pipeline run |
| `ado_pipeline_list_runs` | List recent runs for a given pipeline |

### Repositories & Pull Requests

| Tool | Description |
|---|---|
| `ado_repo_list` | List all Git repositories in the project |
| `ado_repo_create_pr` | Create a Pull Request |
| `ado_repo_get_pr` | Get PR status, state, and reviewer decisions |
| `ado_workitem_link_to_pr` | Link a work item to a PR (Development section) |

---

## Prerequisites

- Node.js ≥ 18
- An Azure DevOps Personal Access Token (PAT) — see [PAT scopes](#pat-scopes) below

---

## Build

```powershell
cd tools/mcp-server
npm install
npm run build   # compiles TypeScript → dist/
```

The compiled output lands in `dist/`. You only need to rebuild after editing TypeScript source files.

---

## Configuration

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ADO_ORG_URL` | Yes | — | Azure DevOps org URL — `https://dev.azure.com/your-org` |
| `ADO_PROJECT` | Yes | — | Project name |
| `ADO_PAT` | Yes | — | Personal Access Token |
| `MCP_TRANSPORT` | No | `stdio` | Transport mode — `stdio` or `http` |
| `PORT` | No | `3000` | HTTP port (only used when `MCP_TRANSPORT=http`) |

### PAT scopes

| Scope | Permission | Used by |
|---|---|---|
| Work Items | Read & Write | All `ado_*_work_item*` tools |
| Test Plans | Read & Write | All `ado_*_test_*` tools |
| Wiki | Read & Write | All `ado_wiki_*` tools |
| Build (Pipelines) | Read & Execute | All `ado_pipeline_*` tools |
| Code | Read | `ado_repo_*` and `ado_workitem_link_to_pr` |

---

## Running the Server

### Option A — stdio (Claude Code spawns the process)

This is the default and requires no extra setup. Claude Code starts the server automatically when an agent session opens. Skip to [Registering with Claude Code](#registering-with-claude-code) and use the stdio snippet.

### Option B — HTTP/SSE (server runs independently)

Use this when you want the server running before Claude Code connects — for example, to share one server across multiple agent sessions, keep it running in a terminal, or connect from a remote machine.

**Step 1 — set environment variables**

PowerShell:
```powershell
$env:ADO_ORG_URL  = "https://dev.azure.com/your-org"
$env:ADO_PROJECT  = "YourProject"
$env:ADO_PAT      = "your-personal-access-token"
$env:MCP_TRANSPORT = "http"
$env:PORT          = "3000"   # optional, default is 3000
```

bash / WSL:
```bash
export ADO_ORG_URL="https://dev.azure.com/your-org"
export ADO_PROJECT="YourProject"
export ADO_PAT="your-personal-access-token"
export MCP_TRANSPORT="http"
export PORT="3000"
```

**Step 2 — start the server**

From the compiled build (recommended for production):
```powershell
cd tools/mcp-server
npm start
```

Without building first (development):
```powershell
cd tools/mcp-server
npm run dev
```

You should see:
```
[ado-alm mcp] HTTP/SSE server listening on http://localhost:3000
[ado-alm mcp]   SSE      : GET  http://localhost:3000/sse
[ado-alm mcp]   Messages : POST http://localhost:3000/messages
[ado-alm mcp]   Health   : GET  http://localhost:3000/health
```

**Step 3 — verify**

```powershell
curl http://localhost:3000/health
# → {"status":"ok","transport":"http/sse","version":"1.1.0","connected":false}
```

`connected` becomes `true` once Claude Code opens an SSE connection.

**Step 4 — register with Claude Code** using the SSE snippet below.

---

## Registering with Claude Code

Add one of the following blocks to the agent's `.claude/settings.json`.

### stdio (Claude Code manages the process)

```json
{
  "mcpServers": {
    "ado-alm": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\tools\\mcp-server\\dist\\index.js"],
      "env": {
        "ADO_ORG_URL":    "https://dev.azure.com/your-org",
        "ADO_PROJECT":    "YourProject",
        "ADO_PAT":        "your-personal-access-token"
      }
    }
  }
}
```

### HTTP/SSE (connect to already-running server)

```json
{
  "mcpServers": {
    "ado-alm": {
      "type": "sse",
      "url": "http://localhost:3000/sse"
    }
  }
}
```

> When using SSE mode the credentials are supplied via environment variables when the server is started (Step 1 above), not in `settings.json`.

---

## Source Structure

```
src/
├── index.ts              ← entry point — stdio or HTTP/SSE transport based on MCP_TRANSPORT
├── tools/
│   ├── work-items.ts     ← CRUD, bulk create, batch update, delete, comments, history
│   ├── queries.ts        ← WIQL, area paths, iteration paths, title search
│   ├── wiki.ts           ← wiki push, pull, list wikis, list pages
│   ├── test-plans.ts     ← test plan/suite/case create, get, bulk create, delete
│   ├── pipelines.ts      ← pipeline list, run, get run, list runs
│   └── repositories.ts   ← repo list, create PR, get PR, link work item to PR
├── types/
│   └── index.ts          ← shared TypeScript interfaces (WorkItem, TestCase, Suite, etc.)
└── utils/
    └── ado-client.ts     ← Axios client factory, markdown→HTML converter, steps XML builder
```

---

## How It Works

**stdio mode (default)**
```
Claude Code agent
      │  spawns process + stdio pipe
      ▼
tools/mcp-server/dist/index.js
      │  Azure DevOps REST API (axios, PAT auth)
      ▼
Azure DevOps
```

**HTTP/SSE mode**
```
Claude Code agent
      │  GET /sse  (Server-Sent Events stream)
      │  POST /messages  (JSON-RPC requests)
      ▼
tools/mcp-server/dist/index.js  (Express HTTP server, port 3000)
      │  Azure DevOps REST API (axios, PAT auth)
      ▼
Azure DevOps
```

Each tool module registers its tools with the MCP SDK server instance. The `ado-client.ts` utility builds an authenticated Axios instance from the environment variables and provides helpers for converting markdown descriptions to HTML (for ADO rich-text fields) and for building the XML `steps` structure that ADO test cases require.
