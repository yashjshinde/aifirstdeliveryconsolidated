# Architecture Decision Records (ADRs)

> Append-only log of architectural decisions for the spec-driven development consolidated platform. Each ADR captures **one** decision: what was decided, why, what was considered, and what changes because of it.

---

## Conventions

- **Numbering.** Zero-padded four-digit sequence: `0001`, `0002`, … No gaps. Number is assigned at creation and never changes.
- **Filename.** `NNNN-short-kebab-case-title.md` (e.g., `0001-review-scope-spec-only.md`).
- **Status lifecycle.**
  - **proposed** — under discussion, not yet locked
  - **accepted** — decision locked; file is immutable from here on (only `status` and `superseded-by` may change)
  - **superseded** — replaced by a later ADR; the `Superseded by ADR-NNNN` header points forward, but the body remains as historical record
  - **rejected** — proposed and considered but not adopted; kept for the rationale trail
- **Immutability.** Once an ADR reaches `accepted`, the body is frozen. To revise: write a new ADR that supersedes the old one.
- **Master-plan tie-in.** When an ADR corresponds to a master-plan revision (`Rxx`), cite both directions: ADR references `Rxx`, and the `Rxx` entry in the master plan's §26 can cite the ADR.
- **Template.** Use [_template.md](_template.md) as the starting shape for new ADRs.

---

## ADR index

| # | Title | Status | Decided | Affected design docs |
|---|---|---|---|---|
| [ADR-0001](0001-review-scope-spec-only.md) | `/review` scoped to spec only; non-spec checklists consumed inline by generators | accepted | 2026-05-14 | 02, 04, 06, 07, 08, agents/* |
| [ADR-0002](0002-dual-mode-delivery-surfaces.md) | Dual-mode delivery surfaces — Claude+GHCP × standalone+root-unified (4 surfaces) | accepted | 2026-05-14 | 01, 02, 12 |
| [ADR-0003](0003-single-source-of-truth-commands.md) | Commands authored only in `agents/{a}/.claude/commands/` | accepted | 2026-05-14 | 02, 12 |
| [ADR-0004](0004-self-contained-agent-folders.md) | Self-contained agent folders + plugin distribution for portability | accepted | 2026-05-14 | 01, 02, 11, 12 |
| [ADR-0005](0005-d365-ce-multi-file-sub-platform.md) | d365-ce multi-file sub-platform FDD + SW Phoenix shape + form-mockup helper | accepted | 2026-05-14 | 06, agents/d365-ce, agents/solution-architect |
| [ADR-0006](0006-doc-scope-domain-vs-feature.md) | FDD/TDD/blueprint docScope: domain vs feature; config-driven via `agents.yaml` | accepted | 2026-05-14 | 03, 04, 05, 06, 08, agents/* |
| [ADR-0007](0007-brownfield-auto-mode-self-healing.md) | Brownfield auto-mode + self-healing retry loop + gap-log | accepted | 2026-05-14 | 11, agents/brownfield |
| [ADR-0008](0008-brownfield-patterns-and-bindings.md) | Brownfield 9 patterns + ~185 bindings + module-detection | accepted | 2026-05-14 | 11, agents/brownfield |
| [ADR-0009](0009-solution-estimate-consolidated.md) | Solution-estimate consolidated `/estimate` + 103-factor catalogue + 7 phases | accepted | 2026-05-14 | 10, agents/solution-estimate |
| [ADR-0010](0010-templates-agent-owned.md) | Templates and constitution agent-owned; `doc_lint` enforces consistency | accepted | 2026-05-14 | 02, 06, 07, 11 |
| [ADR-0011](0011-publish-pipeline-8-job-model.md) | Publish Pipeline 8-job model + drift checks | accepted | 2026-05-14 | 01, 02, 12 |

---

## Adding a new ADR

1. Copy [_template.md](_template.md) to `NNNN-short-kebab-title.md` (next sequential number).
2. Fill in all sections; set `status: proposed`.
3. Discuss with the user / design reviewers.
4. On approval: change status to `accepted`, set `decided-on` date.
5. Add a row to the index table above.
6. Update affected design docs to cite the new ADR in their frontmatter `adr-refs:`.
7. Log the new ADR in [../../implementation.md](../../implementation.md).
