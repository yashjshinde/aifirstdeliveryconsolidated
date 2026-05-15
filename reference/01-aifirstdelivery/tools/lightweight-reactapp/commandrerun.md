You are helping me maintain a lightweight React app called **Agent Prompt Viewer - Job Aid** located at `tools/lightweight-reactapp/` inside this repo. Read this entire file before making any changes.

---

## What the app does

Displays all agent prompts from the repo, organised by agent, so developers can browse and copy prompts into any AI tool. It has two outputs:

1. **React dev server** — run `npm run dev` (auto-runs `generate-data` first, serves on `localhost:5173`)
2. **Standalone HTML** — run `npm run build-html` (writes `agent-prompt-viewer.html`, no build tool needed — open directly in a browser)

---

## Folder structure

```
tools/lightweight-reactapp/
├── .gitignore                        (ignores node_modules, dist, src/data/agents-data.js)
├── agent-prompt-viewer.html          (standalone HTML — no npm needed, open in browser)
├── commandrerun.md                   (this file — paste into AI session to update the app)
├── index.html                        (Vite entry)
├── package.json                      (react 18, marked 9, vite 8, @vitejs/plugin-react)
├── vite.config.js
├── scripts/
│   ├── generate-data.js              (reads all agent .md files → src/data/agents-data.js)
│   └── build-html.js                 (reads agents + App.css → agent-prompt-viewer.html)
└── src/
    ├── App.jsx                       (3-panel layout + search)
    ├── App.css                       (all styles)
    ├── main.jsx
    ├── data/agents-data.js           (auto-generated — do not edit)
    └── components/
        ├── AgentPanel.jsx            (left panel — agent list with colour-coded icons)
        ├── CommandPanel.jsx          (middle panel — README + command list per agent)
        └── PromptPanel.jsx           (right panel — Rendered / Raw tabs)
```

---

## Agents (10 total)

Loaded from `templates/{id}/.claude/commands/*.md` plus `templates/{id}/README.md`, except `alm-agent` which comes from `tools/alm-agent/`.

| ID                  | Display Name                  | Colour              |
|---------------------|-------------------------------|---------------------|
| d365-ce             | D365 Customer Engagement      | blue   #0078d4      |
| d365-ce-brownfield  | D365 CE Brownfield            | brown  #8B4513      |
| d365-fo             | D365 Finance & Operations     | purple #5c2d91      |
| integration         | Azure Integration             | orange #d83b01      |
| power-apps          | Power Apps                    | purple #742774      |
| data-migration      | Data Migration                | green  #107c10      |
| reporting           | Reporting                     | amber  #c47a00      |
| solution-architect  | Solution Architect            | dark blue #003a6c   |
| solution-estimate   | Solution Estimate             | teal   #006b6b      |
| alm-agent           | ALM Agent                     | red    #b91c1c      |

---

## UI behaviour

- **Left panel** — agent list; colour-coded left border; shows command count (README excluded from count)
- **Middle panel** — README entry (📖) pinned at top with a divider, then `/commands` listed below
- **Right panel** — 2 view tabs per command:
  - `Rendered` — markdown rendered via marked.js
  - `Raw` — plain pre-formatted text
- **Search bar** — filters agents and commands by name and content
- **Copy buttons** — copy button on every view

---

## npm scripts

| Script                    | What it does                                      |
|---------------------------|---------------------------------------------------|
| `npm run generate-data`   | Writes `src/data/agents-data.js`                  |
| `npm run build-html`      | Writes `agent-prompt-viewer.html`                 |
| `npm run dev`             | Runs generate-data then starts the Vite dev server |
| `npm run build`           | Runs generate-data then Vite production build     |

> **Install note:** use `npm install --legacy-peer-deps` if you hit peer dependency conflicts.

---

## Critical rule — keep build-html.js in sync

`scripts/build-html.js` contains a full duplicate of all JSX components written as `React.createElement` calls (no JSX, no Babel) so the standalone HTML works without a build tool.

**Whenever you change a `.jsx` component, you must also update the matching `React.createElement` code inside `build-html.js`.**

### Regex escaping inside the appJs template literal

The entire React app is embedded as a template literal string inside `build-html.js`. This means any JavaScript written inside that template literal must double-escape backslashes so they survive into the generated HTML:

| You want in the output JS | Write in the template literal |
|---------------------------|-------------------------------|
| `\s` (whitespace)         | `\\s`                         |
| `\w` (word char)          | `\\w`                         |
| `\d` (digit)              | `\\d`                         |
| `\1` (backreference)      | `\\1`                         |
| `\/` (escaped slash in regex) | `\\/`                     |

> **Why:** The `appJs` string is a template literal in an ESM file (strict mode). Unrecognised escape sequences like `\s` silently drop the backslash — producing `/s/g` instead of `/\s/g`. Octal escapes like `\1` throw a `SyntaxError` outright. Always double-escape inside the template literal.

> **Slash in regex:** A literal `/` inside a regex pattern (e.g. `<\/h\1>`) must be written as `<\\/h\\1>` in the template literal, otherwise the unescaped `/` terminates the regex literal early and breaks the script.

### Steps to regenerate agent-prompt-viewer.html

After making any change (component logic, styles, or data):

```bash
cd tools/lightweight-reactapp
node scripts/build-html.js
```

Or via npm:

```bash
npm run build-html
```

Open `agent-prompt-viewer.html` directly in a browser — no server needed. If the page is blank, open DevTools → Console to find the JavaScript error.

---

## What I need you to change

[DESCRIBE YOUR CHANGE HERE]
