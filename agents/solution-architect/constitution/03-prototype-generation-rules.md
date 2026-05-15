---
agent: solution-architect
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Prototype Generation Rules

> Rules `/solution-prototype` enforces when rendering the clickable HTML solution prototype. Output is HTML / CSS / JS — `doc_lint` rules do NOT apply; this file IS the QA contract for the prototype output.

## Output structure

```
projects/{p}/_aggregator/architecture/solution-prototype/
├── index.html                      # Master shell with top nav + sidebar + welcome
├── README.md                       # Walkthrough script + how to view
├── assets/
│   ├── d365-tokens.css            # D365 design tokens (Segoe UI, ~30 hex colors)
│   ├── prototype.css              # Cross-page layout (top nav 46px, sidebar 200px, etc.)
│   └── prototype.js               # Interactive behaviours
├── personas/                       # one .html per persona detected
│   ├── sales-rep.html
│   └── ...
├── modules/                        # one .html per module (Sales Hub, Service Hub, etc.)
│   ├── sales-hub.html
│   └── ...
├── forms/                          # one .html per entity (via form-mockup helper)
│   ├── lead.html
│   └── ...
├── dashboards/
│   ├── sales-pipeline.html
│   └── ...
└── journeys/                       # multi-screen cross-module journeys
    ├── lead-to-quote.html
    └── ...
```

## Design tokens (verbatim from the SW source per ADR-0005)

Pinned in `assets/d365-tokens.css`. Same tokens used by the d365-ce form-mockup-generator helper (consistency across both agents):

```css
:root {
  /* Layout */
  --nav-bg:           #1b2a4a;
  --nav-fg:           #ffffff;
  --sidebar-bg:       #faf9f8;
  --command-bar-bg:   #f3f2f1;
  --record-header-bg: #ffffff;
  --bg:               #f3f2f1;
  --surface:          #ffffff;
  --border:           #e1dfdd;

  /* Brand */
  --blue:             #0078d4;
  --blue-hover:       #106ebe;
  --blue-pressed:     #005a9e;

  /* Text */
  --text-primary:     #1f1f1f;
  --text-secondary:   #605e5c;
  --text-disabled:    #a19f9d;
  --text-on-primary:  #ffffff;

  /* Status */
  --status-active:    #107c10;
  --status-pending:   #797775;
  --status-error:     #a4262c;
  --status-warning:   #ffaa44;

  /* Typography */
  --font-family-base: "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-size-base:   14px;
  --font-size-small:  12px;
  --font-size-h1:     20px;
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
}
```

## 6-layer layout (verbatim from SW source)

Every page renders these layers in this stacking order:

1. **Top nav** — fixed, 46px high, full width, `--nav-bg`
2. **Sidebar** — 200px wide, left-anchored, `--sidebar-bg`; module navigation
3. **Command bar** — 44px high, above the body content, `--command-bar-bg`; primary actions (New / Save / Refresh / ...)
4. **Record header** — variable height; entity name + key fields + status
5. **Tab bar** — below the record header; per-form tabs
6. **Scrollable body** — fills remaining vertical space

## Form mockup behaviour (via the helper)

The per-entity `.html` files under `forms/` are rendered by the form-mockup-generator prompt at `templates/helpers/form-mockup-generator.prompt.md` (PORTED VERBATIM from the SW source per ADR-0005). The helper produces:

- Field rows with alternating background (zebra pattern)
- Collapsible sections (per FDD §4)
- Timeline pane (per CE convention)
- Sub-grids for related-entity views
- Status pills using `--status-*` tokens
- Save / dirty-tracking indicators in the command bar
- Scroll-to-top button after page scrolls past 200px

## Required interactive JS behaviours

Every page wires these via `assets/prototype.js`:

- Tab switching within record forms
- Section collapse / expand
- Persona switcher (in top nav)
- Module switcher (in sidebar)
- Journey stepper (on journeys/ pages)
- Scroll-to-top button
- Dirty-state tracking on form fields → enables the Save button

## QA checklist (this file IS the contract)

`/solution-prototype` runs this checklist after generation; any BLOCKER fails the write.

- [ ] **Design tokens consistent across all pages.** All `assets/*.css` files reference the same `--*` token names defined in `d365-tokens.css`. No hardcoded hex colours in the per-page CSS.
- [ ] **6-layer layout intact.** Every `.html` page has the top nav, sidebar, command bar, record header, tab bar, scrollable body in the correct order.
- [ ] **Mermaid is NOT used.** This is an HTML prototype, not a Markdown doc. Diagrams should be HTML / CSS — Mermaid blocks fail QA.
- [ ] **Persona switcher works on every page.** Clicking it updates persona-specific content (name, role, recent activity, key tiles).
- [ ] **Module switcher works on every page.** Clicking it navigates to the module hub.
- [ ] **Journey stepper advances correctly.** Each step has Previous / Next; the active step is visually distinct.
- [ ] **All cross-page links resolve.** No broken `<a href>` to non-existent pages.
- [ ] **Per-entity form mockups present.** One `forms/{entity}.html` per entity declared in any agent's FDD §7.
- [ ] **Accessibility — keyboard navigation works.** All interactive elements reachable via Tab; visible focus states.
- [ ] **Brownfield mode** (when applicable): every page renders side-by-side as-is + to-be views with a clear visual delimiter.

## Source attribution

The form-mockup helper at `templates/helpers/form-mockup-generator.prompt.md` is PORTED VERBATIM from the SW source per ADR-0005. The same helper is mirrored in `agents/d365-ce/templates/fdd-helpers/`. Both copies stay in lockstep; updates to one must be applied to the other (or, ideally, the helper is sourced from a single canonical location in a future refactor).
