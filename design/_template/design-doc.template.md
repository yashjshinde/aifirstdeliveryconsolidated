---
title: <short title in title case>
status: draft                              # draft | live | superseded
master-plan-refs: []                       # e.g., [§5, §7.1, §26-R34]
adr-refs: []                               # e.g., [ADR-0001]
backlog-ref:                               # e.g., backlog.md item id (#bk-007) if this doc tackles a queued topic
last-reviewed: YYYY-MM-DD
owner: design
---

# <Title>

> One-sentence summary of what this doc covers and why it exists.

## Context

What's the design problem? What constraints apply? Where does the master plan leave off?

Link to the master-plan section(s) this doc elaborates: `§N.M` in [reference/00-spec-driven-development-humble-muffin.md](../../reference/00-spec-driven-development-humble-muffin.md#L<line>).

## Decisions

For each material decision, state:
- **Decision:** one sentence.
- **Why:** the rationale (alternatives considered, trade-offs).
- **Implications:** what else changes because of this decision.

Reference any ADRs that lock the decision: `ADR-NNNN`.

## Detailed design

The body of the design — folder structure, file shapes, schemas, command surfaces, validation rules, examples. Use Mermaid for diagrams (master plan §12 rule 1).

## Open questions

Numbered list of unresolved items. Each entry should describe what blocks the resolution and what would unblock it. Move resolved items into `## Decisions` with a date marker.

## References

- Master plan: §N.M, §N+1
- ADRs: ADR-NNNN, ADR-NNNN
- Backlog item: #bk-NNN
- Other design docs in this folder

---

**Change discipline.** Every edit to this file → append an entry in [../../implementation.md](../../implementation.md) with date, file path, summary, and links to any matching master-plan revision (Rxx) or ADR.
