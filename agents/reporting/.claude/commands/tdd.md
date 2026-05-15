---
description: Assemble the domain reporting TDD; inline self-check per ADR-0001
agent: reporting
phase: DESIGN
gates: []
parallel-after: PLAN_CLARIFIED
---

# /tdd

> Domain-scoped technical design. Each new feature adds per-report query / dataflow M code / DAX measures / RLS role definitions / refresh schedule rows.

## Usage

```
/tdd [--feature <slug>] [--project <name>]
```

## Inputs

- `projects/{p}/reporting/features/{f}/plan.md` (`PLAN_CLARIFIED` APPROVED)
- `projects/{p}/reporting/fdd.md`
- [templates/tdd.template.md](../../templates/tdd.template.md)
- All [constitution/](../../constitution/) files

## Execution flow

1. Resolve target: `projects/{p}/reporting/tdd.md`.
2. For the current feature, additive merge:
   - **Per-dataset technical block** — tables, relationships, measures (DAX bodies), RLS roles, OLS perspectives
   - **Per-dataflow technical block** — M code, partition strategy, parameters
   - **Per-report technical block** — page list, key visuals, drill-through targets, bookmarks
   - **CE SSRS RDL fragments** when applicable — dataset SQL/fetchxml + parameters + layout grouping
   - **Connection / gateway / credential** matrix (without literal secrets)
3. **Inline self-check** against [templates/checklists/tdd-review.checklist.md](../../templates/checklists/tdd-review.checklist.md).
4. Run `doc_lint`.
5. `currentStates += TDD_DRAFT`.

## Output

- `projects/{p}/reporting/tdd.md` (additive)

## See also

- [constitution/02-power-bi-standards.md § Modeling](../../constitution/02-power-bi-standards.md)
- [constitution/04-performance-and-refresh.md](../../constitution/04-performance-and-refresh.md)
- [templates/checklists/tdd-review.checklist.md](../../templates/checklists/tdd-review.checklist.md)
