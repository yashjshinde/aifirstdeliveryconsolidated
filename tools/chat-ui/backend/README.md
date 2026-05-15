# chat-ui backend

> Express + Node server. Spawns the `claude` CLI as a subprocess and streams output to the browser. Per [design/13-chat-ui.md](../../../design/13-chat-ui.md).

## Quick start

```pwsh
npm install
npm run dev          # tsx watch -- auto-reloads on src/ changes
# OR
npm run build && npm start
```

Server listens on `http://localhost:5173` by default (override with `PORT`).

## API

All endpoints under `/api/*`.

### Health

- `GET /api/health` → `{ status, repoRoot, time }`

### Projects

- `GET /api/projects` → `{ projects: string[] }`
- `GET /api/projects/:name` → `{ name, config, agentFolders }`

### Agents

- `GET /api/agents` → `{ agents: Array<{ name, version, maturity, base-commands, extra-commands, docScope, description, folderPresent }> }`
- `GET /api/agents/:name/readme` → markdown body
- `GET /api/agents/:name/commands` → `{ commands: string[] }`

### Workflow

- `GET /api/workflow/features?project=p&agent=a` → `{ features: string[] }`
- `GET /api/workflow/status?project=p&agent=a&feature=f` → contents of `.workflow.json`
- `GET /api/workflow/next?project=p&agent=a&feature=f` → `{ eligibleCommands, rationale, gates, currentStates, phase }`

### Docs

- `GET /api/docs/tree?root=<rel>` → `{ root, nodes: TreeNode[] }`
- `GET /api/docs/content?path=<rel>` → `{ path, content, mime }`

### Commands

- `POST /api/commands/run` body `{ agent, command, project?, feature?, args? }` → `{ runId, startedAt, cwd, cli, promptString }`
- `GET /api/commands/runs` → `{ runs: RunSummary[] }`
- `POST /api/commands/:runId/stop` → `{ ok: true }`

### Stream

- `GET /api/stream/:runId` (SSE) → events: `stdout`, `stderr`, `exit`, `error`. JSON payload per event.

## Environment

| Var | Default | Purpose |
|---|---|---|
| `PORT` | `5173` | HTTP port |
| `CHAT_UI_REPO_ROOT` | (auto-discovered) | Override repo root |
| `CLAUDE_CLI` | `claude` | CLI binary on PATH |
| `LOG_LEVEL` | `info` | error / warn / info / debug |

## CLI invocation contract

`POST /api/commands/run` builds a single string of the form:

```
/<agent>:<command> --project <p> --feature <f> [...extra]
```

…and spawns `claude --print "<that string>"` in the working directory (project root when `project` provided; repo root otherwise).

If your local CLI uses a different invocation shape, modify `routes/commands.ts` accordingly.

## Security

- Filesystem access is read-only and scoped to the repo root (`safeRepoPath()` rejects traversal).
- CLI subprocess inherits the user's environment but the working directory is bound to the repo or project root.
- No authentication in v1 — local-only deployment trust model.

## Limitations

- Sequential commands only — no multi-run multiplexing.
- No write endpoints — viewers only. Writes happen via the spawned CLI.
- No persistence — run history kept in-memory; reset on restart.

## See also

- [../README.md](../README.md) — parent overview + architecture diagram
- [../frontend/README.md](../frontend/README.md) — companion React app
- [../../mcp-server/README.md](../../mcp-server/README.md) — note `repo-paths.ts` shape mirrors this
