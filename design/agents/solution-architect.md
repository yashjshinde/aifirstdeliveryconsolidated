---
title: solution-architect — unified architecture, cross-agent review, clickable HTML prototype
status: live
adr-refs: [ADR-0005]
last-reviewed: 2026-05-14
owner: design
---

# solution-architect — aggregator

> Reads `blueprint.md` and `tdd.md` from every domain agent for a project and produces (1) a unified architecture diagram, (2) a cross-agent gap analysis, and (3) an interactive HTML solution prototype showcasing the UX across the entire solution.

## Three commands

```
/solution-blueprint
/solution-review
/solution-prototype [--persona <name>] [--module <name>] [--journey <name>] [--include forms|navigation|dashboards|all]
```

### `/solution-blueprint`

Produces the unified solution architecture:

- **System context (C4-L1)** — Mermaid showing actors + the consolidated solution + external systems
- **Container diagram (C4-L2)** — major containers (CE / F&O / Integration layer / Reporting / Identity)
- **Component diagram per agent (C4-L3)** — references each agent's blueprint
- **ADR list (cross-agent)** — surfaces architectural decisions affecting multiple agents
- **Brownfield mode** — enhances the existing architecture diagram from `_brownfield/docs/`

Reads:
- `projects/{p}/d365-ce/blueprint.md` (domain — accumulated across CE features)
- `projects/{p}/d365-fo/features/*/blueprint.md` (feature — F&O per-feature blueprints aggregated)
- `projects/{p}/integration/blueprint.md` (domain)
- `projects/{p}/reporting/blueprint.md` (domain)

Output: `projects/{p}/_aggregator/architecture/solution-blueprint.md`.

### `/solution-review`

Cross-agent consistency checks. Identifies entity references that don't match, NFR conflicts, integration contracts that don't reconcile, and other gaps. Example findings:

- "CE plan references entity `Account` but integration plan defines `acme_account` — mismatch"
- "NFR P95 response time differs: CE says 2000ms, integration says 5000ms"
- "Integration plan promises Logic App at endpoint X but CE plan expects Function at endpoint Y"

Output: `projects/{p}/_aggregator/architecture/solution-review-report.md`.

### `/solution-prototype` *(see [ADR-0005](../adr/0005-d365-ce-multi-file-sub-platform.md))*

Generates a **clickable HTML prototype** of the entire solution. Stakeholder-demo / sales-time deliverable. Aggregates UX inputs from every domain agent.

```
projects/{p}/_aggregator/architecture/solution-prototype/
├── index.html                          # Master shell — navigation tree + welcome
├── assets/
│   ├── d365-tokens.css                # D365 design tokens (Segoe UI, ~30 hex colors)
│   ├── prototype.css                  # Cross-page layout (top nav, sidebar, breadcrumbs)
│   └── prototype.js                   # Interactive behaviors
├── personas/
│   ├── sales-rep.html
│   ├── service-manager.html
│   └── ... (one per persona detected from project.config.yaml or spec.md)
├── modules/
│   ├── sales-hub.html
│   ├── service-hub.html
│   └── ... (one per module from agents-enabled)
├── forms/
│   ├── lead.html                      # Per-entity form mockup
│   ├── opportunity.html
│   └── ... (via form-mockup-generator helper)
├── dashboards/
│   ├── sales-pipeline.html
│   └── ...
├── journeys/
│   ├── lead-to-quote.html              # Multi-screen cross-module journey
│   ├── case-to-resolution.html
│   └── ...
└── README.md                          # How to view + walkthrough script
```

Input sources (aggregated):

- **Personas** — from `project.config.yaml personas:` list or auto-detected from spec.md persona sections
- **Modules** — from `project.config.yaml agents-enabled`
- **Entities** — from each domain agent's FDD §7 Entity Model
- **Apps** — from `agents/d365-ce/...` model-driven app definitions + Canvas + Power Pages
- **Journeys** — extracted from spec.md user scenarios across all agents

**Helper:** `agents/solution-architect/templates/helpers/form-mockup-generator.prompt.md` — PORTED VERBATIM from the SW project's D365 Form Generation Prompt (mirrors d365-ce's copy per per-agent autonomy). Same prompt; different containing pipeline.

**Templates:** `agents/solution-architect/templates/solution-prototype/{_index, navigation, persona-landing, module-hub, journey-flow, dashboard}.template.html` plus `_assets/`.

### Brownfield mode

When `project.config.yaml mode: brownfield`, prototype includes side-by-side "as-is vs to-be" views per screen:

- **As-is forms** — generated from brownfield inventory (current customizations)
- **To-be forms** — generated from domain agents' approved FDDs

## Constitution

```
agents/solution-architect/constitution/
├── 00-charter.md
├── 01-architecture-principles.md
├── 02-aggregation-rules.md
└── 03-prototype-generation-rules.md         # design token enforcement, persona/journey extraction, brownfield as-is-to-be rules
```

## Templates

```
agents/solution-architect/templates/
├── blueprint.template.md                    # solution-blueprint output template
├── solution-review-report.template.md       # solution-review output template
├── helpers/
│   └── form-mockup-generator.prompt.md      # PORTED VERBATIM (mirrors d365-ce per per-agent autonomy)
├── solution-prototype/
│   ├── _index.template.html
│   ├── navigation.template.html
│   ├── persona-landing.template.html        # per-persona day-1 view
│   ├── module-hub.template.html             # Sales Hub / Service Hub etc.
│   ├── journey-flow.template.html           # multi-screen cross-module journeys
│   ├── dashboard.template.html
│   └── _assets/
│       ├── d365-tokens.css
│       ├── prototype.css
│       └── prototype.js
└── checklists/                              # consumed inline by /solution-blueprint, /solution-review, /solution-prototype per ADR-0001
    ├── solution-blueprint-review.checklist.md
    ├── solution-review.checklist.md
    └── solution-prototype-review.checklist.md
```

## Design tokens (ported from SW prompt)

- `--nav-bg: #1b2a4a`
- `--blue: #0078d4`, `--blue-hover: #106ebe`
- `--surface: #ffffff`, `--bg: #f3f2f1`, `--border: #e1dfdd`
- `--text-primary: #1f1f1f`
- Segoe UI typography scale
- 6-layer layout: top nav fixed 46px + sidebar 200px + command bar 44px + record header + tab bar + scrollable body

## QA checklist (extended for cross-page consistency)

- All visual fidelity checks from the SW form-generation prompt
- Navigation works across all pages
- Persona switcher updates persona-specific content
- Module switcher updates module-specific content
- Journey stepper advances correctly
- Design tokens consistent across all pages

## Required JS behaviors

- Tab switching, section collapse/expand, scroll-to-top, dirty tracking, save feedback
- Solution-prototype-specific: persona switcher, module switcher, journey stepper

## docScope

Aggregator — no `docScope` keys. All outputs are project-level under `projects/{p}/_aggregator/architecture/`.

## References

- ADRs: [ADR-0005](../adr/0005-d365-ce-multi-file-sub-platform.md) (form-mockup helper origin)
- Cross-references: [10-aggregators.md](../10-aggregators.md), [agents/d365-ce.md](d365-ce.md) (sibling copy of form-mockup helper)
- Backlog: `bk-025` (per-agent generic)
