# chat-ui

> Lightweight web UI for the spec-driven development platform. React (Vite) frontend + Node (Express) backend that spawns the `claude` CLI as a subprocess and streams output to the browser.

Per [design/13-chat-ui.md](../../design/13-chat-ui.md).

## What

A browser-based viewer + command-invoker for users without VS Code. Non-developer stakeholders (BAs, PMs, customer reviewers) can:

- Pick a project from `projects/`
- Pick an agent from `agents.yaml`
- See ranked eligible next commands (per `workflow_next` MCP tool) in the Ready pane
- View any markdown doc with Mermaid + quality-self-check rendering
- Run any agent command via the Command Runner; output streams live via SSE
- Drill into solution-estimate aggregator output in the Estimation view

This is **not** a replacement for VS Code — it's a thin viewer + invoker that wraps the existing CLI.

## How

Two processes side-by-side (typically run via `npm run dev` in two terminals):

```
tools/chat-ui/backend/    # Node + Express server on http://localhost:5173
tools/chat-ui/frontend/   # Vite dev server on http://localhost:5174 (proxies /api -> backend)
```

### Quick start

```pwsh
# Install dependencies (first time)
cd tools/chat-ui/backend && npm install
cd ../frontend && npm install

# Start the backend (terminal 1)
cd tools/chat-ui/backend && npm run dev

# Start the frontend (terminal 2)
cd tools/chat-ui/frontend && npm run dev

# Open http://localhost:5174 in a browser
```

### Production build

```pwsh
cd tools/chat-ui/backend && npm run build && npm start
cd tools/chat-ui/frontend && npm run build && npm run preview
```

The backend serves on port 5173 by default (configurable via `PORT` env var). The frontend's Vite dev server proxies `/api/*` to `localhost:5173`.

## Architecture

```
Browser (React + Vite)
       |
   HTTP + SSE
       |
       v
Backend (Express + Node)
   /api/projects           -> list folders under projects/
   /api/agents             -> read agents.yaml
   /api/workflow/next      -> spawn `claude --command /next` and parse
   /api/workflow/status    -> read .workflow.json
   /api/docs               -> read any md/yaml file under projects/
   /api/commands/run       -> POST: spawn `claude --command /<cmd> --args`
   /api/stream/:runId      -> SSE: stream subprocess stdout/stderr live
       |
       v
Local filesystem + claude CLI subprocess
```

## Layout

```
tools/chat-ui/
├── README.md                 (this file)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .gitignore
│   ├── src/
│   │   ├── index.ts          # Express app + middleware setup + route mounting
│   │   ├── routes/
│   │   │   ├── projects.ts   # GET /api/projects
│   │   │   ├── agents.ts     # GET /api/agents
│   │   │   ├── workflow.ts   # GET /api/workflow/next, /api/workflow/status
│   │   │   ├── docs.ts       # GET /api/docs/* + GET /api/docs/tree
│   │   │   ├── commands.ts   # POST /api/commands/run
│   │   │   └── stream.ts     # GET /api/stream/:runId  (SSE)
│   │   └── lib/
│   │       ├── repo-paths.ts # findRepoRoot, repoPath, etc. (mirrors mcp-server/lib/repo-paths.ts shape)
│   │       ├── cli-spawner.ts# Subprocess management with stdout/stderr streaming
│   │       ├── filesystem.ts # Read-only project filesystem access
│   │       └── logger.ts     # Pino-style structured logger
│   └── README.md
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── .gitignore
    ├── src/
    │   ├── main.tsx          # ReactDOM entry
    │   ├── App.tsx           # Top-level layout + routing
    │   ├── index.css         # Base styles
    │   ├── pages/
    │   │   ├── ProjectPicker.tsx
    │   │   ├── AgentPicker.tsx
    │   │   ├── ReadyPane.tsx
    │   │   ├── DocumentViewer.tsx
    │   │   ├── CommandRunner.tsx
    │   │   └── EstimationView.tsx
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   ├── ProjectContext.tsx
    │   │   └── MarkdownView.tsx
    │   └── api/
    │       └── client.ts     # fetch-based REST + SSE client
    └── README.md
```

## Why CLI-as-subprocess

The chat UI doesn't reimplement Claude or the MCP server — it spawns the existing `claude` CLI. Benefits:

- Zero duplication of agent invocation logic
- Authentication / config inherits from the local CLI installation
- Updates to the CLI automatically apply to the chat UI

Tradeoff: the chat UI requires the CLI to be installed locally (`npm install -g @anthropic-ai/claude-code`).

## Auth + Security

- **Local-only deployment (single-user)**: no authentication. The backend trusts that the local user is the legitimate operator (same trust model as VS Code).
- **Hosted deployment**: out of scope for v1; queued for future revision. Hosted requires identity, RBAC, secrets management, and a hosted Claude API key — non-trivial.
- **Filesystem access**: read-only. Writes happen via the spawned CLI, which has full agent-level capability scoped to the user's local checkout.
- **No remote MCP access**: MCP server is invoked via the spawned CLI in the user's local context. The chat UI does not connect to MCP directly.

## Limitations (v1)

- **Sequential commands only**: one command at a time per session. Parallel commands deferred — needs run-management UI to multiplex SSE streams.
- **No write-back of UI-edited docs**: the viewer is read-only. Editing happens in VS Code / direct editor; the chat UI displays the result.
- **No agent/project switching mid-command**: the active subprocess must complete (or be cancelled) before switching context.
- **No persistence**: the chat UI is stateless; refresh resets the UI state. Project / agent / feature selection lives in the URL.

## Configuration

Environment variables (read by backend):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5173` | Backend HTTP port |
| `CHAT_UI_REPO_ROOT` | (auto-discovered) | Override the repo root if backend is run from outside the consolidated repo |
| `CLAUDE_CLI` | `claude` | Path/name of the Claude CLI binary on `PATH` |
| `LOG_LEVEL` | `info` | `error` / `warn` / `info` / `debug` |

## Related design docs

- [design/13-chat-ui.md](../../design/13-chat-ui.md) — this tool's design
- [design/00-overview.md](../../design/00-overview.md) — overall platform context
- [design/09-orchestration-patterns.md](../../design/09-orchestration-patterns.md) — workflow_next semantics
- [design/11-mcp-server.md](../../design/11-mcp-server.md) — MCP server (invoked indirectly via the CLI)

## Backlog

- `bk-019` (Chat UI UX flows): closed by this Phase 9 build (basic flows v1). Polish + hosted-deployment + auth queued.
