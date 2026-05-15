---
adr: 0005
title: d365-ce multi-file sub-platform FDD + SW Phoenix shape + form-mockup helper
status: accepted
decided-on: 2026-05-14
design-doc-refs: [agents/d365-ce.md, 06-templates.md]
---

# ADR-0005 — d365-ce multi-file sub-platform FDD + SW Phoenix shape + form-mockup generator

## Status

`accepted` — decided 2026-05-14.

## Context

The `d365-ce` agent is the "fat agent" — it owns every Power Platform sub-domain on the Customer Engagement side (model-driven, Canvas apps, Power Pages portal, PCF controls, Power Automate, plus plugins / JS / business rules / BPF / workflows / BPM). A single monolithic FDD template trying to cover all five sub-domains would be unmaintainable; a wholly separated template per sub-domain loses the cross-sub-domain context that reviewers actually need.

A reference D365 CE project (the "SW Phoenix FDD") provides a battle-tested 12-section FDD shape (Intro → Process → User Scenarios → UI Design (Forms / Validation / BPF / Views / Mockups) → Reports → Security → Entity Model → Reference Data → Appendices) that's been refined across real customer rollouts. The same project also includes a separate prompt that generates pixel-accurate interactive HTML form mockups (D365 design tokens, alternating field rows, timeline, subgrids, status pills, save/dirty behaviors) — proven to accelerate stakeholder review.

## Decision

Three parts:

### (a) Multi-file sub-platform template tree assembled by `/fdd`

```
agents/d365-ce/templates/fdd/
├── _index.template.md            # SW Phoenix master skeleton (12 sections)
├── model-driven.template.md      # §4 forms/views/validation/BPF + §7 entity field tables
├── canvas.template.md            # Canvas screens, Power Fx, connectors
├── power-pages.template.md       # Portal pages, web roles, table permissions
├── pcf.template.md               # PCF control I/O, lifecycle, manifest
└── power-automate.template.md    # Cloud flow triggers, actions, error handling
```

`/fdd` reads `project.config.yaml` for in-scope sub-platforms, loads matching files, merges into the `_index` slots. **No template-internal flags or conditionals** — inclusion is by file presence + config scope.

### (b) SW Phoenix shape adopted as `_index.template.md`

The 12-section structure is adopted verbatim as the master skeleton. Authoring of bodies (the actual section content) is queued; the skeleton ships immediately.

### (c) Form-Mockup Generator ported verbatim as helper

```
agents/d365-ce/templates/fdd-helpers/
└── form-mockup-generator.prompt.md   # Verbatim port of SW project's D365 Form Generation Prompt
```

It's a **helper**, not a template, because its output is interactive HTML (D365 design tokens, ~30 hex colors, Segoe UI typography, alternating field rows, timeline, subgrids, save/dirty behaviors, scroll-to-top, QA checklist). `doc_lint` markdown rules don't apply. Output lands at `projects/{p}/d365-ce/fdd-assets/mockups/{entity-form}.html` per entity (organized by entity since entities are domain-level).

### Planned content additions on top of SW base

The SW base has known gaps. Fifteen additions are committed for the template body (authored when the agent is built — queued in [backlog.md](../backlog.md) as bk-005):

| # | Action | Target file |
|---|---|---|
| A1 | Fix §4.2 duplication in SW source | `fdd/_index.template.md` |
| A2 | Add §1.4 Out-of-Scope + §1.5 Open Questions roll-up | `fdd/_index.template.md` |
| A3 | Add §2.3 Cross-Agent Dependencies | `fdd/_index.template.md` |
| A4 | Add §4.6 Process Definitions (BPFs, workflows, business rules) | `fdd/model-driven.template.md` |
| A5 | Add §4.7 Power Automate Flows (CE-bound) | `fdd/model-driven.template.md` |
| A6 | Add §4.8 Plugins / JS / Custom WF Activities (scope listing) | `fdd/model-driven.template.md` |
| A7 | Add §4.9 Templates (Email / Word / Excel / Mail-merge) | `fdd/model-driven.template.md` |
| A8 | Add §5.4 NFR Mapping per Feature | `fdd/_index.template.md` |
| A9 | Beef up §6 Security (Privilege matrix, Audit, Hierarchy security) | `fdd/model-driven.template.md` |
| A10 | Beef up §7 Entity Model (Alternate keys, Plugin registrations, BPF binding, etc.) | `fdd/model-driven.template.md` |
| A11 | Add §8.2 OOB-first Decision Log | `fdd/_index.template.md` |
| A12 | Add §9 Multilingual Considerations | `fdd/_index.template.md` |
| A13 | Drop SW §9-12 stubs; add §10 Handoffs to Other Agents | `fdd/_index.template.md` |
| A14 | Add Appendix D: Glossary | `fdd/_index.template.md` |
| A15 | Author Canvas / Pages / PCF / PA sub-platform packs | sub-platform files |

## Alternatives considered

- **Monolithic FDD template.** Reject — unmaintainable across 5 sub-domains; reviewers would skim sections that don't apply.
- **One agent per sub-platform.** Reject — CE / Canvas / Pages / PCF / Power Automate are tightly intertwined in real CE projects; splitting them creates handoff overhead between artificial agent boundaries.
- **HTML mockup as a `.template.md` doc.** Reject — output is HTML, not markdown; doc_lint rules (frontmatter, TOC, Mermaid-only) don't apply. Keeping helpers in a separate `fdd-helpers/` folder maintains a clean boundary.

## Consequences

**Positive:**
- Each sub-platform's authoring/maintenance is independent (canvas authors edit `canvas.template.md` without touching model-driven).
- FDD output is a single reviewable document (matches SW's monolithic review style with TOC).
- Form mockups give stakeholders a tangible UX artifact alongside the markdown spec.

**Negative:**
- 5 sub-platform files + 1 helper + 1 index = 7 source files for d365-ce FDD alone. Plus checklists, plus TDD multi-file pack (same pattern), plus blueprint/test-plan/spec/plan/review-report. Authoring overhead is real.
- Form-mockup helper produces project-specific HTML that doc_lint doesn't validate. Quality enforcement falls on the prompt's QA checklist + manual review.

**Affected design docs:** [agents/d365-ce.md](../agents/d365-ce.md), [06-templates.md](../06-templates.md).

## References

- Design docs: [agents/d365-ce.md](../agents/d365-ce.md)
- Related ADRs: [ADR-0006](0006-doc-scope-domain-vs-feature.md) (doc scope), [ADR-0010](0010-templates-agent-owned.md) (agent-owned templates)
- Source materials (ported from `reference/02-sw-project/`): SW Phoenix FDD shape; D365 Form Generation Prompt
