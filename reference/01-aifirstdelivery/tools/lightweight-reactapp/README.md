# Agent Prompt Viewer - Job Aid

A lightweight browser tool for browsing and copying agent prompts from this repo into any AI tool.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Quick Start](#quick-start)
- [Two Output Modes](#two-output-modes)
- [UI Overview](#ui-overview)
- [Agents](#agents)
- [Folder Structure](#folder-structure)
- [npm Scripts](#npm-scripts)
- [Adding a New Agent](#adding-a-new-agent)
- [Maintenance](#maintenance)

---

## What It Does

Reads every command file (`*.md`) from each agent's `.claude/commands/` folder and each agent's `README.md`, then presents them in a searchable three-panel interface. For each command you can view the rendered markdown or the raw text, with a copy button on every view.

No back-end, no login. Open the standalone HTML file directly in a browser.

---

## Quick Start

**Option A — Standalone HTML (no install needed)**

```bash
open tools/lightweight-reactapp/agent-prompt-viewer.html
```

Just open the file in any browser. No npm, no server.

**Option B — React dev server**

```bash
cd tools/lightweight-reactapp
npm install --legacy-peer-deps
npm run dev
```

Opens on `http://localhost:5173`. Data is regenerated automatically on every `dev` start.

---

## Two Output Modes

| Mode | Command | URL / File | Notes |
|---|---|---|---|
| React dev server | `npm run dev` | `http://localhost:5173` | Hot reload; runs `generate-data` first |
| Standalone HTML | `npm run build-html` | `agent-prompt-viewer.html` | Single self-contained file; no npm needed |

The standalone HTML embeds all agent data and the full React app as vanilla JS — no build tool or server required to open it.

---

## UI Overview

```
┌─────────────────┬──────────────────────┬──────────────────────────────┐
│   Agents        │   Commands           │   Prompt Viewer              │
│                 │                      │                              │
│ 🔷 D365 CE      │  📖 README           │  [ Rendered | Raw ]          │
│ 🟤 CE Brownfld  │  ──────────────────  │                              │
│ 🟣 D365 F&O     │  /spec               │  Rendered markdown, or       │
│ 🔶 Integration  │  /review             │  raw text.                   │
│ 💜 Power Apps   │  /plan               │                              │
│ 🟢 Data Mig     │  /tdd                │  Copy button on every view.  │
│ 📊 Reporting    │  /implement          │                              │
│ 🔵 Sol Architect│  ...                 │                              │
│ 🔹 Sol Estimate │                      │                              │
│ 🔴 ALM Agent    │                      │                              │
└─────────────────┴──────────────────────┴──────────────────────────────┘
         ↑ Search bar filters all three panels simultaneously
```

### Right panel tabs

| Tab | Content |
|---|---|
| **Rendered** | Markdown rendered via marked.js; anchor links scroll within the panel |
| **Raw** | Plain pre-formatted text; copy button copies the exact file content |

---

## Agents

10 agents are loaded. Delivery domain agents come from `templates/{id}/`; the ALM agent comes from `tools/alm-agent/`.

| ID | Display Name | Colour |
|---|---|---|
| `d365-ce` | D365 Customer Engagement | blue `#0078d4` |
| `d365-ce-brownfield` | D365 CE Brownfield | brown `#8B4513` |
| `d365-fo` | D365 Finance & Operations | purple `#5c2d91` |
| `integration` | Azure Integration | orange `#d83b01` |
| `power-apps` | Power Apps | purple `#742774` |
| `data-migration` | Data Migration | green `#107c10` |
| `reporting` | Reporting | amber `#c47a00` |
| `solution-architect` | Solution Architect | dark blue `#003a6c` |
| `solution-estimate` | Solution Estimate | teal `#006b6b` |
| `alm-agent` | ALM Agent | red `#b91c1c` |

For each agent the app loads:
- `templates/{id}/README.md` → shown as the pinned **📖 README** entry
- `templates/{id}/.claude/commands/*.md` → shown as individual `/command` entries

---

## Folder Structure

```
tools/lightweight-reactapp/
├── README.md                         ← this file
├── commandrerun.md                   ← AI session seed — paste into Claude/Copilot to update the app
├── agent-prompt-viewer.html          ← standalone output (regenerate with npm run build-html)
├── index.html                        ← Vite entry point
├── package.json
├── vite.config.js
├── scripts/
│   ├── generate-data.js              ← reads agent .md files → src/data/agents-data.js
│   └── build-html.js                 ← bundles agents + styles → agent-prompt-viewer.html
└── src/
    ├── App.jsx                       ← 3-panel layout + search
    ├── App.css                       ← all styles
    ├── main.jsx
    ├── data/
    │   └── agents-data.js            ← auto-generated; do not edit manually
    └── components/
        ├── AgentPanel.jsx            ← left panel — colour-coded agent list
        ├── CommandPanel.jsx          ← middle panel — README + command list
        └── PromptPanel.jsx           ← right panel — Rendered / Raw tabs
```

> `src/data/agents-data.js` and `node_modules/` are git-ignored. `agent-prompt-viewer.html` is committed so users can open it without npm.

---

## npm Scripts

| Script | What it does |
|---|---|
| `npm run generate-data` | Reads all agent `.md` files and writes `src/data/agents-data.js` |
| `npm run build-html` | Reads agents + `App.css` and writes `agent-prompt-viewer.html` |
| `npm run dev` | Runs `generate-data` then starts the Vite dev server on port 5173 |
| `npm run build` | Runs `generate-data` then produces a Vite production build in `dist/` |

---

## Adding a New Agent

When a new agent template is added to the repo:

**1. `scripts/generate-data.js`** — add an entry to `AGENT_DEFS`:

```js
{ id: 'my-agent', name: 'My Agent', description: 'Short description',
  commandsDir: join(repoRoot, 'templates', 'my-agent', '.claude', 'commands') },
```

**2. `src/components/AgentPanel.jsx`** — add a colour and icon to `AGENT_META`:

```js
'my-agent': { color: '#hex', icon: '🔣' },
```

**3. `scripts/build-html.js`** — add the same entry to the embedded `AGENT_META` inside the `appJs` template literal (same object, around line 80):

```js
'my-agent': { color: '#hex', icon: '🔣' },
```

> `build-html.js` contains a full vanilla-JS duplicate of all React components so the standalone HTML works without a build tool. Whenever a `.jsx` component changes, the matching `React.createElement` code in `build-html.js` must also be updated.

**4. Regenerate the standalone HTML:**

```bash
npm run build-html
```

---

## Maintenance

`commandrerun.md` is a session-initialisation document. Paste it into a Claude Code or GitHub Copilot Chat session to give the AI full context about the app before asking it to make changes. It covers the critical double-escaping rules required when editing `build-html.js`.
