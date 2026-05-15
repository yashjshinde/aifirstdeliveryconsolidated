---
description: Plan-approval gate (hard gate PLAN_CLARIFIED) using plan-review.checklist.md
agent: reporting
phase: DESIGN
gates: [PLAN_CLARIFIED]
---

# /clarify

> Resolve Open Items + `<TBD>` markers; flip `gates.PLAN_CLARIFIED` to APPROVED.

## Usage

```
/clarify [--approve] [--feature <slug>] [--project <name>]
```

## Execution flow

1. Run `doc_lint` on plan.md.
2. Evaluate each checklist category:
   - L1-L4 completeness
   - Per-layer coverage (every L4 belongs to one of: dataflow / dataset / report / dashboard / app / security / data-sourcing)
   - RLS policy resolved per FR
   - Refresh strategy resolved per dataset
   - Cross-agent handoffs registered
   - Multilingual scope explicit
3. Write `projects/{p}/reporting/features/{f}/reviews/plan-review.md`.
4. On `--approve`: flip `gates.PLAN_CLARIFIED.status=APPROVED`.

## Output

- `projects/{p}/reporting/features/{f}/reviews/plan-review.md`

## See also

- [ADR-0001](../../../design/adr/0001-review-scope-spec-only.md)
- [templates/checklists/plan-review.checklist.md](../../templates/checklists/plan-review.checklist.md)
