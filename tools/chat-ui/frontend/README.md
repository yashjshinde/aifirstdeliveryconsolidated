# chat-ui frontend

> Vite + React + TypeScript frontend. Talks to the backend at `/api/*` (proxied during dev). Per [design/13-chat-ui.md](../../../design/13-chat-ui.md).

## Quick start

```pwsh
npm install
npm run dev          # http://localhost:5174 (proxies /api -> http://localhost:5173)
```

The backend must be running separately (`tools/chat-ui/backend npm run dev`).

## Pages

| Route | File | Purpose |
|---|---|---|
| `/` | [`src/pages/ProjectPicker.tsx`](src/pages/ProjectPicker.tsx) | Pick a project from `projects/` |
| `/agents` | [`src/pages/AgentPicker.tsx`](src/pages/AgentPicker.tsx) | Pick an agent + peek README |
| `/ready` | [`src/pages/ReadyPane.tsx`](src/pages/ReadyPane.tsx) | Eligible commands for the active feature |
| `/docs` | [`src/pages/DocumentViewer.tsx`](src/pages/DocumentViewer.tsx) | Browse + view any markdown doc with Mermaid rendering |
| `/run` | [`src/pages/CommandRunner.tsx`](src/pages/CommandRunner.tsx) | Run a command; live stdout/stderr via SSE |
| `/estimation` | [`src/pages/EstimationView.tsx`](src/pages/EstimationView.tsx) | Solution-estimate aggregator output viewer |

## Components

- [`src/components/Layout.tsx`](src/components/Layout.tsx) - header + nav + context pills
- [`src/components/ProjectContext.tsx`](src/components/ProjectContext.tsx) - active `project`/`agent`/`feature` state
- [`src/components/MarkdownView.tsx`](src/components/MarkdownView.tsx) - markdown rendering with frontmatter collapse + Mermaid + DOMPurify sanitisation

## API client

[`src/api/client.ts`](src/api/client.ts) - typed wrappers for every backend endpoint plus an SSE helper (`openStream`).

## State strategy

- In-memory context (React Context) for active project/agent/feature; resets on full page refresh.
- `sessionStorage` for the one-way "run this command" handoff from ReadyPane to CommandRunner.
- No persistent client state in v1 - URL routing covers navigation history.

## Mermaid + sanitisation

- `marked` parses markdown
- `DOMPurify` sanitises the resulting HTML (config allows `pre`/`code`/`class`)
- After insertion, `mermaid.render()` swaps every `pre code.language-mermaid` with the rendered SVG; original source is preserved as a `pre code` block when render fails

## Build

```pwsh
npm run build    # tsc -b && vite build -- output to dist/
npm run preview  # serve dist/ on 5174
```

## Limitations

- Sequential commands only (one Run pane at a time)
- No write endpoints; editing happens in VS Code, viewer is read-only
- No auth - local trust model
- No persistence - refresh resets the UI state

## See also

- [../README.md](../README.md) - parent overview
- [../backend/README.md](../backend/README.md) - companion backend
- [design/13-chat-ui.md](../../../design/13-chat-ui.md) - design doc
