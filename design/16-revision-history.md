---
title: Revision History — decisions indexed by ADR
status: live
adr-refs: [ADR-0001, ADR-0002, ADR-0003, ADR-0004, ADR-0005, ADR-0006, ADR-0007, ADR-0008, ADR-0009, ADR-0010, ADR-0011]
last-reviewed: 2026-05-14
owner: design
---

# Revision History

> Source-of-truth for **what was decided when**. Each ADR captures one load-bearing decision. The decisions are listed below in two views: (a) by ADR number, (b) by chronological evolution. Append-only.

## By ADR

| ADR | Title | Status | Decided | Affected design docs |
|---|---|---|---|---|
| [ADR-0001](adr/0001-review-scope-spec-only.md) | `/review` scoped to spec only; non-spec checklists consumed inline by generators | accepted | 2026-05-14 | 02, 04, 06, 07, 08, agents/* |
| [ADR-0002](adr/0002-dual-mode-delivery-surfaces.md) | Dual-mode delivery surfaces — Claude+GHCP × standalone+root-unified | accepted | 2026-05-14 | 01, 02, 12 |
| [ADR-0003](adr/0003-single-source-of-truth-commands.md) | Commands authored only in `agents/{a}/.claude/commands/` | accepted | 2026-05-14 | 02, 12 |
| [ADR-0004](adr/0004-self-contained-agent-folders.md) | Self-contained agent folders; publish pipeline mirrors root assets; plugin distribution for portability | accepted | 2026-05-14 | 01, 02, 11, 12 |
| [ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md) | d365-ce multi-file sub-platform FDD + SW Phoenix shape + form-mockup helper | accepted | 2026-05-14 | 06, agents/d365-ce, agents/solution-architect |
| [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md) | FDD/TDD/blueprint docScope: domain vs feature; config-driven | accepted | 2026-05-14 | 03, 04, 05, 06, 08, agents/* |
| [ADR-0007](adr/0007-brownfield-auto-mode-self-healing.md) | Brownfield auto-mode + self-healing retry loop + gap-log as single review artefact | accepted | 2026-05-14 | 11, agents/brownfield |
| [ADR-0008](adr/0008-brownfield-patterns-and-bindings.md) | Brownfield 9 patterns + ~185 bindings + module-detection | accepted | 2026-05-14 | 11, agents/brownfield |
| [ADR-0009](adr/0009-solution-estimate-consolidated.md) | Solution-estimate consolidated `/estimate` + 103-factor catalogue + 8-value Fitment + 7 phases | accepted | 2026-05-14 | 10, agents/solution-estimate |
| [ADR-0010](adr/0010-templates-agent-owned.md) | Templates and constitution agent-owned; doc_lint enforces consistency | accepted | 2026-05-14 | 02, 06, 07, 11 |
| [ADR-0011](adr/0011-publish-pipeline-8-job-model.md) | Publish Pipeline 8-job model + drift checks | accepted | 2026-05-14 | 01, 02, 12 |

## Decision groupings (architectural themes)

### Authoring + distribution

- ADR-0002 (4 delivery surfaces) + ADR-0003 (single authoring location) + ADR-0011 (publish pipeline 8 jobs) form the "author-once, generate-four-ways, drift-check" triad.
- ADR-0004 (self-contained folders + plugin distribution) makes the resulting agents portable.

### Per-agent contract

- ADR-0010 (templates and constitution agent-owned) — no shared base at runtime.
- ADR-0006 (docScope) — agents declare their doc shape; commands branch on it.
- ADR-0005 (d365-ce multi-file sub-platform) — the CE-specific elaboration of agent-owned templates.

### Workflow + review

- ADR-0001 (review spec-only) — disambiguates `/review` vs `/clarify` / `/validate` / inline-self-check.

### Brownfield

- ADR-0007 (auto-mode + self-healing) — diverges from other agents' human-in-loop review.
- ADR-0008 (patterns + bindings) — the structural mechanism that makes ADR-0007 cover ~140+ artifact types.

### Estimation

- ADR-0009 — consolidates the prior cluster of estimation refinements into one canonical design.

## Chronological evolution (high-level)

A standalone repo started with a "single-surface, single-agent-folder" model. Through iterative design (in consultation with the user), the following structural shifts occurred:

1. **From single-surface to four surfaces.** Recognising both Claude and GHCP user audiences, and both single-agent and full-platform open patterns, the model became four delivery surfaces from a single source (ADR-0002, ADR-0003).
2. **From shared base to agent-owned.** Early models had `templates/_base/` and `constitution/_base/` at root. Reality showed CE and F&O templates share basically no content; agent-owned outright became the model. Cross-agent consistency moved from "shared text" to "code rules in doc_lint" (ADR-0010).
3. **From per-doc human review to spec-only.** Initial design ambiguously suggested `/review` could run on plan / task / FDD / TDD / etc. Workflow DAG showed only spec was actually gated by `/review`. Resolved to spec-only with inline self-checks for byproducts (ADR-0001).
4. **From feature-scoped to mixed-scope FDDs.** Per-feature CE FDDs would churn (entities and security accumulate naturally). Domain-scoped for CE / Int / Rep; feature-scoped for F&O (which has discrete extension changes per feature) (ADR-0006).
5. **From per-template brownfield to patterns + bindings.** Authoring 140+ templates is unmaintainable. 9 reusable patterns + ~185 small YAML bindings became the model (ADR-0008).
6. **From per-doc brownfield review to auto-mode + gap log.** Volume too high for human review per artefact. Self-healing retry loop with deterministic validators in MCP code; gap log is the single review artefact (ADR-0007).
7. **From invented estimation hierarchy to project-tested template.** Early design invented an L1-L5 hierarchy + 19 columns. When pointed at a project-tested template, dropped the inventions and ported verbatim. Then layered on tool-canonical 95-factor catalogue + 8 reintroduced factors + brownfield multipliers + confidence levels + proposed-factors gate (ADR-0009).
8. **From single transformer to 8-job publish pipeline.** Initially scoped as "Claude → GHCP transformer." Scope expanded as four-surface + plugin + drift-check requirements crystallised (ADR-0011).
9. **From templates/constitution mirroring into each agent to mirroring only schemas + workflow.yaml.** Mirroring everything broke the "agent-owned" mental model. Restricted mirroring to wire contracts (schemas + workflow.yaml) which genuinely need to stay in sync (ADR-0004).

## When to add a new ADR

A change qualifies for a new ADR when **any** of the following is true:

- It changes the contract of one or more agents (commands, docScope, templates structure, constitution layering)
- It changes the publish pipeline's job set or the four delivery surfaces
- It changes how MCP tool groups are organised
- It introduces a new orchestration pattern or supersedes one
- It changes the schemas (`schemas/*.v1.json`)
- It changes the workflow DAG (`workflow.yaml`)

Trivial changes (typo fixes, clarifying language, additional examples in a design doc) do not require an ADR — just an `implementation.md` entry.

## Superseding a decision

When a decision changes:

1. Author a new ADR with the new decision, status `proposed`.
2. Reference the prior ADR as `supersedes: ADR-NNNN`.
3. The prior ADR's status changes to `superseded`; its body is preserved (it remains historical record); a `superseded-by: ADR-MMMM` header is added.
4. Update affected design docs.
5. Log the change in `implementation.md`.

Bodies of accepted/superseded ADRs are immutable except for `status` and `superseded-by` / `supersedes` fields.

## References

- All ADRs: [adr/](adr/)
- ADR conventions: [adr/README.md](adr/README.md)
- Cross-references: [00-overview.md](00-overview.md), every design doc citing its driving ADR(s)
