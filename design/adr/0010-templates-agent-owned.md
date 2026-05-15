---
adr: 0010
title: Templates and constitution are agent-owned; cross-agent consistency enforced by doc_lint code, not shared text
status: accepted
decided-on: 2026-05-14
design-doc-refs: [06-templates.md, 02-agent-skeleton.md, 11-mcp-server.md]
---

# ADR-0010 — Templates and constitution are agent-owned

## Status

`accepted` — decided 2026-05-14.

## Context

Two reasonable architectures exist for managing per-agent templates and constitution:

1. **Shared base + agent delta** — a `templates/_base/` and `constitution/_base/` at repo root hold platform-universal content; agents inherit + override. Promises drift prevention through shared text.
2. **Agent-owned outright** — each agent fully owns its `templates/` and `constitution/`. Promises clean autonomy at the cost of duplicated boilerplate.

The shared-base approach sounded appealing but doesn't survive contact with reality:

- A CE FDD and an F&O FDD have **basically no overlap**. CE's FDD covers entities, forms, BPFs, business rules, security roles. F&O's FDD covers extension classes, AOT objects, data entities, DMF, ER configurations. A "shared base" template would either be (a) empty, or (b) so generic it provides no actual structure.
- Cross-agent consistency that matters (Mermaid for diagrams, frontmatter, TOC, AI Summary, traceability matrix, no inline ALM IDs) is **mechanical** — it can be enforced by code, not by hoping authors copy shared text.
- A shared base creates an asymmetry with the publish pipeline: standalone agents (per ADR-0004) can't read parent paths, so the base would have to be mirrored into every agent anyway — at which point "shared" is just "copy-pasted".

## Decision

Three parts:

### (a) Agents own templates and constitution outright

```
agents/{a}/
├── constitution/
│   ├── 00-charter.md             # agent purpose, scope, boundaries
│   ├── 01-doc-rules.md           # how this agent generates docs
│   ├── 02-nfr.md                 # NFR shape + platform-specific targets
│   ├── 03-security.md            # security baseline
│   ├── 04-testing.md             # testing standards
│   ├── 05-alm.md                 # ALM mapping
│   └── ...                       # sub-domain modules per agent
└── templates/
    ├── spec.template.md
    ├── plan.template.md
    ├── fdd.template.md           # platform-shaped (CE FastTrack, F&O FastTrack, etc.)
    ├── tdd.template.md
    ├── blueprint.template.md
    ├── test-plan/
    │   ├── index.template.md
    │   └── suite.template.md
    ├── task.template.md
    ├── review-report.template.md
    └── checklists/                # per ADR-0001: spec consumed by /review, others inline by generators
        ├── spec-review.checklist.md
        ├── plan-review.checklist.md
        ├── fdd-review.checklist.md
        ├── tdd-review.checklist.md
        ├── blueprint-review.checklist.md
        └── test-plan-review.checklist.md
```

No `templates/_base/` and no `constitution/_base/` at runtime. The agent's local files are the only ones read.

### (b) Project-level overrides — two-layer file-level resolution; no merging

```
1. projects/{p}/{a}/templates-override/{type}.template.md            ← project override (if present)
2. agents/{a}/templates/{type}.template.md                            ← agent default (fallback)
```

Same pattern for constitution. **First match wins. No merging, no conditionals, no Handlebars, no flags.** If a project wants a different TDD format, it drops one file in `templates-override/`. Drift between agent updates and project overrides detected by `doc_lint` (warns when override's `based-on-template-version` frontmatter falls behind the agent's current version).

### (c) Cross-agent consistency enforced by MCP `doc_lint`

Universal rules that every agent's docs must satisfy live as code in `tools/mcp-server/groups/doc_lint/`:

| Rule | Enforced by |
|---|---|
| Frontmatter present with required keys (feature-id, agent, phase, schema-version) | `doc_lint` |
| Auto-generated TOC at top of multi-section docs | `doc_lint` |
| Mermaid for all diagrams (no PNG, no draw.io) | `doc_lint` |
| Numbered sections (FR-NN, TS-NN, TC-NN) for cross-reference | `doc_lint` |
| AI Summary section at top | `doc_lint` |
| Traceability matrix at bottom (for spec/plan/tdd) | `doc_lint` |
| No inline ALM IDs (section IDs only) | `doc_lint` |
| Quality self-check appendix on FDD/TDD/blueprint/test-plan outputs | `doc_lint` (per ADR-0001) |
| `feature-id` HTML-comment markers on domain-doc section blocks | `doc_lint` (per ADR-0006) |
| `feature-id` column on domain-doc table rows | `doc_lint` (per ADR-0006) |

Each agent's own `constitution/01-doc-rules.md` describes these rules in its own words for human guidance, but **the rule is the code**.

### Scaffolding starter: `_reference/`

Two folders at repo root are scaffolding-only — used by `New-Agent.ps1` to seed a new agent, never read at runtime:

- `constitution/_reference/00-charter.md.example` through `05-alm.md.example` — starter content
- `templates/_reference/spec.template.md.example` through `task.template.md.example` — generic skeletons

`New-Agent.ps1` copies these into the new agent's `constitution/` and `templates/` and the author edits from there.

## Alternatives considered

- **Shared `templates/_base/` + agent delta with override semantics.** Reject — CE and F&O share basically no template content; a "base" would be either empty or so generic it provides no shape. Creates mirroring overhead under ADR-0004 (standalone agents need everything self-contained).
- **Shared `constitution/_base/` with agent overlay.** Reject — same asymmetry as templates. Universal rules belong in `doc_lint` code, not in shared text that can drift.
- **Project overrides with merge / Handlebars / conditional logic.** Reject — every flag and conditional inside a template is a maintenance trap. File-level "first match wins" is dramatically simpler and covers the actual project-customization patterns we see.

## Consequences

**Positive:**
- Each agent's `templates/` and `constitution/` are self-contained — change one, no risk to other agents.
- Cross-agent consistency is mechanically enforced by `doc_lint` (deterministic, fast, unit-tested) rather than relying on authors to copy shared text.
- Standalone-mode story (ADR-0004) stays clean — no parent-path mirroring for templates/constitution.

**Negative:**
- Each new agent must author its own constitution and templates from scratch (helped by `_reference/` starters via `New-Agent.ps1`). Real authoring effort, no shared shortcut.
- The 6 universal doc rules are encoded in code — must be unit-tested and CI-enforced. Bugs in `doc_lint` would let inconsistencies through.
- Project overrides have no merge story — projects must fully replace a template, not partially modify it. Slightly more work for customisers; offset by zero merge-conflict surface area.

**Affected design docs:** [06-templates.md](../06-templates.md), [02-agent-skeleton.md](../02-agent-skeleton.md), [11-mcp-server.md](../11-mcp-server.md).

## References

- Related ADRs: [ADR-0001](0001-review-scope-spec-only.md) (checklist consumption rules), [ADR-0004](0004-self-contained-agent-folders.md) (standalone mode), [ADR-0006](0006-doc-scope-domain-vs-feature.md) (domain vs feature scope)
