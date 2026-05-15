---
adr: NNNN
title: <decision title — verb-noun phrasing preferred (e.g., "Adopt MCP for ALM adapters")>
status: proposed                      # proposed | accepted | superseded | rejected
decided-on:                           # YYYY-MM-DD when status flipped to accepted/rejected
superseded-by:                        # ADR-NNNN if this ADR is later replaced
supersedes:                           # ADR-NNNN if this ADR replaces an earlier one
master-plan-refs: []                  # e.g., [§5, §7.1, §26-R34]
design-doc-refs: []                   # design/*.md files that this ADR governs
---

# ADR-NNNN — <Title>

## Status

`proposed` / `accepted` (decided YYYY-MM-DD) / `superseded by ADR-NNNN` / `rejected`

## Context

What problem prompted this decision? What forces are at play (constraints, prior decisions, user requirements)?  Cite the master-plan section(s) the decision affects.

## Decision

One paragraph stating the decision in active voice. Be concrete: name files, commands, schemas, or contracts where applicable.

## Alternatives considered

Bulleted list of options that were on the table and **rejected**, with a one-line reason for each rejection.

- **Option B — <name>:** <rejection reason>
- **Option C — <name>:** <rejection reason>

## Consequences

What changes because of this decision?

- **Positive:** what improves
- **Negative:** what we accept as a cost
- **Affected files / artefacts:** master-plan sections, design docs, future code paths

## References

- Master plan: §N.M, §N+1 (revision Rxx)
- Related ADRs: ADR-NNNN
- Design docs: design/<file>.md
- Implementation log entries: [implementation.md](../../implementation.md) entry IDs
