---
title: Documentation Rules — universal rules enforced by `doc_lint`
status: live
adr-refs: [ADR-0010, ADR-0001, ADR-0006]
last-reviewed: 2026-05-14
owner: design
---

# Documentation Rules

> Cross-agent consistency comes from **rules enforced by code** in MCP `doc_lint`, not from sharing template content. Each agent's own `constitution/01-doc-rules.md` describes the rules in its own words; the rule itself is the code.

## The eight universal rules

| # | Rule | Enforced by `doc_lint` |
|---|---|---|
| 1 | **Diagrams = Mermaid only** (flowchart, sequenceDiagram, classDiagram, erDiagram, stateDiagram, C4-style with `flowchart`) | Yes — fails on PNG / draw.io references / inline SVG |
| 2 | **Frontmatter required** with: `feature-id`, `agent`, `phase`, `schema-version`, `gates-passed` | Yes |
| 3 | **TOC auto-generated** at top of every multi-section doc | Yes — generated, not hand-authored |
| 4 | **Numbered sections** for cross-reference: `FR-NN` (spec functional requirements), `TS-NN` (TDD technical sections), `TC-NNN` (test cases) | Yes |
| 5 | **Traceability matrix at bottom** of spec, plan, TDD | Yes |
| 6 | **AI Summary section** at the top of every generated doc | Yes — required by user goal 1 (explainability) |
| 7 | **No inline ALM IDs** — section IDs only; mapping lives in `work-items.yaml` | Yes — fails on inline `#12345` patterns |
| 8 | **Quality self-check appendix** at bottom of FDD/TDD/blueprint/test-plan (per [ADR-0001](adr/0001-review-scope-spec-only.md)) | Yes — fails the write on BLOCKER findings |

Plus two domain-doc-specific rules per [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md):

| # | Rule | Enforced by `doc_lint` |
|---|---|---|
| 9 | **`feature-id` HTML-comment markers** on every section block in domain-scoped FDDs/TDDs/blueprints | Yes |
| 10 | **`feature-id` column** on every table row in domain-doc tables | Yes |

## Why rules-as-code, not rules-as-shared-text

Sharing rule text across agents (the "shared base" model) creates two failure modes:

1. **Drift through copy-paste.** Agents that don't refresh stay on old versions of the shared text; agents that customize drift from the base in invisible ways.
2. **Untestable.** Markdown rules in prose cannot be unit-tested. Code rules can — and are.

`doc_lint` lives in `tools/mcp-server/groups/doc_lint/` and is exposed as an MCP tool. Each rule is a function with input (a doc), output (a list of violations), and a test corpus. CI runs `doc_lint` against every generated doc and fails the build if violations appear.

## How `doc_lint` integrates with commands

- **Every `/spec`, `/plan`, `/fdd`, `/tdd`, `/blueprint`, `/test-plan` call** runs `doc_lint` on its output before writing the file.
- BLOCKER findings prevent the write — the user sees an error with the specific violations.
- WARNING findings are logged into the doc's Quality self-check appendix.

## How agents describe these rules to authors

Each agent's `constitution/01-doc-rules.md` lists the universal rules **in its own words** as guidance for authors. The constitution is not the source of truth — the code is. Constitution language is for human readers; if it disagrees with code, the code wins and the constitution is updated.

## Domain-specific doc rules (additive, per agent)

Agents may add rules in their own constitution. Examples:

- **d365-fo `constitution/06-documentation-and-change.md`** — mandates `★` markers on FDD sections that gate `/tdd`, requires Object-ID prefixes (EXT-NNN, BDC-NNN, etc.), enforces "Content Depth Rules" (e.g., "current business process must be full end-to-end, never a single sentence")
- **d365-ce `constitution/00-charter.md` + sub-platform standards** — FDD must reference form mockups under `fdd-assets/mockups/` for every entity in §4.5
- **brownfield `constitution/02-documentation-standards.md`** — No Grouping rule ("Other X (~N more)" patterns fail validation); enforced as machine code in `brownfield_validators/`

Agent-specific rules are enforced by the agent's own commands, supported by `doc_lint` extension points.

## Project-level constitution overrides

Per [01-repo-structure.md](01-repo-structure.md):

```
1. projects/{p}/{a}/constitution-override/0X-*.md      ← if --project passed
2. agents/{a}/constitution/0X-*.md                      ← agent default
```

A project can override the agent's doc rules per-file. Common case: a customer mandates an additional frontmatter key (e.g., `classification: confidential`) — the project overrides `01-doc-rules.md` to add it.

## References

- ADRs: [ADR-0010](adr/0010-templates-agent-owned.md) (`doc_lint` instead of shared text), [ADR-0001](adr/0001-review-scope-spec-only.md) (Quality self-check appendix), [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md) (feature-id tagging in domain docs)
- Cross-references: [11-mcp-server.md](11-mcp-server.md) (`doc_lint` tool group), [06-templates.md](06-templates.md), [08-traceability.md](08-traceability.md)
