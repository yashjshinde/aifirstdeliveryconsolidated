<!--
form-mockup-generator.prompt.md
PORTED VERBATIM from the SW project's D365 Form Generation Prompt per ADR-0005.
Mirrored from agents/d365-ce/templates/fdd-helpers/form-mockup-generator.prompt.md.
Both copies stay in lockstep per the per-agent autonomy principle (ADR-0010).
-->

# D365 Form Mockup Generator

> Helper prompt that produces a pixel-accurate interactive HTML mockup of a D365 form. Output is a single `forms/{entity}.html` file. Consumed by `/solution-prototype` (one invocation per entity in scope) and by `agents/d365-ce`'s `/fdd` (one invocation per entity in the FDD §4.1 wireframes).

## What the prompt produces

A single self-contained HTML file with:
- Inline `<style>` linking to the shared `assets/d365-tokens.css` and `assets/prototype.css`
- Inline `<script>` linking to the shared `assets/prototype.js`
- 6-layer layout (top nav 46px / sidebar 200px / command bar 44px / record header / tab bar / scrollable body)
- Form rendered with:
  - Alternating field-row background (zebra)
  - Collapsible sections (one per FDD §4 sub-section for the entity)
  - Sub-grids for related entities
  - Timeline pane (right side)
  - Status pills using `--status-*` tokens
  - Save button in the command bar (greyed until dirty-state)

## Required inputs

When invoking this helper, supply:

- `entity-name` (logical name, e.g., `acme_lead`)
- `entity-display-name` (e.g., "Lead")
- `entity-fields` (array of { name, displayName, type, required, defaultValue?, options? })
- `entity-sections` (array of { name, fields, collapsed-by-default })
- `related-entities` (array of { name, parent-field-on-this-entity, sub-grid? })
- `bpf` (optional — array of stage names if entity has a BPF)
- `tabs` (optional — array of { name, sections } if entity has multiple tabs)

These inputs come from the FDD §4 (UI Design / Forms) and §7 (Entity Model).

## Prompt body (the actual instructions to the LLM)

```
You are generating a pixel-accurate HTML mockup of a D365 Customer Engagement form for the
entity '{entity-display-name}' (logical: '{entity-name}').

Use the following D365 design tokens defined in assets/d365-tokens.css:
- Top nav: #1b2a4a background, white text, 46px high, fixed top
- Sidebar: #faf9f8 background, 200px wide, left-anchored
- Command bar: #f3f2f1 background, 44px high
- Surface: #ffffff
- Borders: #e1dfdd
- Primary blue: #0078d4 (hover: #106ebe)
- Text primary: #1f1f1f, secondary: #605e5c
- Status active: #107c10, pending: #797775, error: #a4262c, warning: #ffaa44
- Font: "Segoe UI", system fallback
- Font size: 14px base, 20px h1, 12px small

Render the 6 layers in order:
1. Top nav (fixed; brand "D365 - {project-name}" left, persona-switcher + user avatar right)
2. Sidebar (module navigation: Sales / Service / Marketing / ... — current module highlighted)
3. Command bar (New, Save (greyed until dirty), Save & Close, Refresh, Process, Delete, ...)
4. Record header (entity display name as h1, key fields summary, status pill, BPF horizontal bar if applicable)
5. Tab bar (one per tab in inputs.tabs, current tab underlined in --blue)
6. Scrollable body:
   - For each section in inputs.entity-sections:
     - Section header (clickable to collapse/expand; chevron icon)
     - Field grid (2-column responsive; alternating row background using
       'background: var(--surface)' on odd rows and 'background: var(--bg)' on even rows)
     - Each field rendered per its type:
       * text: <input type="text" value="{defaultValue or placeholder}" />
       * lookup: <select> with options; first option is "(select)"
       * datetime: <input type="datetime-local" />
       * boolean: two-option pill toggle (Yes / No)
       * money: <input type="number" /> with currency suffix
       * picklist: <select> with options
   - For each related-entity sub-grid: render a sub-grid component (table with rows of related records)
   - Right side: Timeline pane (200-280px wide) showing chronological activities (notes, emails, tasks)

Required interactive behaviours (link to assets/prototype.js):
- Tab switching: clicking a tab in the tab bar shows that tab's sections
- Section collapse: clicking a section header toggles its content
- Dirty tracking: any input change enables the Save button
- Save feedback: clicking Save flashes a toast "Saved" for 2s
- Scroll-to-top: after page scrolls past 200px, show a circular button bottom-right

QA checklist (run before write):
- All design tokens referenced via var(--*); no hardcoded hex colours in inline styles
- 6-layer layout present in the documented order
- Every field in inputs.entity-fields is rendered exactly once
- BPF (if present) renders as a horizontal stage bar above the record header
- Sub-grids render for every related-entity
- Timeline pane is on the right side
- Save button is visually distinct when dirty vs not-dirty
- Page is keyboard-navigable (Tab moves through inputs in DOM order)
- No <img> tags (we use inline SVG for icons)

Output: a complete, self-contained HTML file. No external scripts/styles other than the
three assets/ files. The file should open and render correctly in any modern browser when
served from solution-prototype/forms/{entity}.html.
```

## Source attribution

PORTED VERBATIM from the SW project's `D365_Form_Generation_Prompt.md` per ADR-0005. Same content as the d365-ce agent's copy at `agents/d365-ce/templates/fdd-helpers/form-mockup-generator.prompt.md`.
