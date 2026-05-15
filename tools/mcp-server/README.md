# Spec-Driven Development MCP Server

> Single MCP server with modular tool groups serving all eight agents. Built per [design/11-mcp-server.md](../../design/11-mcp-server.md).

## Quick start

```bash
cd tools/mcp-server
npm install
npm run build
npm start
```

Standalone CLI registration: each agent's `.claude/settings.json` references this server via relative path (`../../tools/mcp-server/dist/index.js`). Root-unified registration: `.claude/settings.json` references `./tools/mcp-server/dist/index.js`. Plugin install bundles the server with the plugin.

## Tool groups

| Group | Purpose | Status |
|---|---|---|
| `doc_lint` | Universal doc rules enforcement (frontmatter, TOC, Mermaid-only, AI Summary, traceability) | Phase 2 ✅ |
| `workflow` | DAG navigation: `workflow_status`, `workflow_next`, `workflow_advance` | Phase 2 ✅ |
| `handoff` | Cross-agent coordination: `handoff_list`, `handoff_status`, `handoff_publish`, `handoff_consume` | Phase 2 ✅ |
| `config-resolve` | Two-layer override resolution for constitution + templates | Phase 2 ✅ |
| `alm` | Tool-neutral ADO + JIRA dispatchers | Phase 8 (queued) |
| `converters` | Bidirectional md ↔ ALM rich-text | Phase 8 (queued) |
| `traceability` | `work-items.yaml` read/write | Phase 6 (queued) |
| `estimation` | Factor catalogue + multiplier helpers | Phase 5 (queued) |
| `brownfield-validators` | 10 deterministic validators | Phase 7 (queued) |
| `brownfield-engine` | Pattern + binding orchestration | Phase 7 (queued) |

## Architecture

- **One process, modular groups.** Each group lives in `src/groups/<group-name>/` and is registered into a single MCP server.
- **Schema-validated I/O.** All tools accept JSON Schema-validated inputs (Zod schemas at the SDK boundary); state files validated against `schemas/*.v1.json` via AJV.
- **Filesystem-as-state.** No database. Reads `agents.yaml`, `workflow.yaml`, `projects/{p}/project.config.yaml`, `.workflow.json`, `work-items.yaml`, `_handoffs/`.

See [design/11-mcp-server.md](../../design/11-mcp-server.md) for the full design.

## Repository discovery

The server discovers the repo root by walking up from `process.cwd()` looking for `agents.yaml`. All paths are relative to that root.

## Testing

```bash
npm test
```

Unit tests in `test/` per tool group. CI test corpus for brownfield validators lives at `brownfield_validators/test-corpus/` (added in Phase 7).

## Logging

Stderr-only (stdio MCP transport reserves stdout for JSON-RPC). Set `LOG_LEVEL=debug|info|warn|error` (default: `info`).
