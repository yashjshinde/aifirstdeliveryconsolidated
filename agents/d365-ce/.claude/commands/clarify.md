---
description: Plan-approval gate using plan-review.checklist.md (hard gate PLAN_CLARIFIED)
agent: d365-ce
phase: DESIGN
gates: [PLAN_CLARIFIED]
---

# /clarify

> Plan-approval gate. Resolves Open Questions, fills `<TBD>` markers, validates plan completeness against [templates/checklists/plan-review.checklist.md](../../templates/checklists/plan-review.checklist.md). Flipping `gates.PLAN_CLARIFIED` to APPROVED unlocks `/task`.

## Usage

```
/clarify [--approve] [--feature <slug>] [--project <name>]
```

- Bare `/clarify` runs the checklist + reports findings; does not flip the gate.
- `/clarify --approve` requires zero BLOCKERs (and acceptances on REQUIREDs) before transitioning the gate.

## Inputs

- `projects/{p}/d365-ce/features/{f}/plan.md` (must exist)
- `projects/{p}/d365-ce/features/{f}/spec.md` (Open Questions roll-up)
- [templates/checklists/plan-review.checklist.md](../../templates/checklists/plan-review.checklist.md)

## Execution flow

1. Resolve feature; assert plan.md exists.
2. Run `doc_lint` on plan.md.
3. For each checklist category, evaluate plan completeness:
   - **OQ resolution** — every spec OQ-NN has resolution in plan.md or accepted as DEFERRED
   - **L1-L4 completeness** — every L3 has at least one L4 placeholder; every L4 fits 3-8h target window
   - **Cross-agent handoffs** — every spec dependency on integration/reporting/d365-fo is reflected in a handoff manifest
   - **NFR coverage** — every NFR target from spec §4 maps to a plan L2 or L3
4. Write `projects/{p}/d365-ce/features/{f}/reviews/plan-review.md` with findings + verdict.
5. Update `.workflow.json`: `currentStates` += `PLAN_REVIEWED` (post-checklist run; not part of workflow.yaml but logged in history).
6. When `--approve`:
   - Zero BLOCKERs required.
   - All REQUIREDs must have acceptance notes.
   - Flip `gates.PLAN_CLARIFIED.status` to APPROVED; fill ts + by.
   - `currentStates` += `PLAN_CLARIFIED`; remove `PLAN_DRAFT`.

## Output

- `projects/{p}/d365-ce/features/{f}/reviews/plan-review.md`
- `.workflow.json` updated

## See also

- [ADR-0001 — Review scope: spec only](../../../design/adr/0001-review-scope-spec-only.md) (plan-review is gated; spec/plan are the only two checklists that gate workflow transitions)
- [templates/checklists/plan-review.checklist.md](../../templates/checklists/plan-review.checklist.md)
- [design/04-workflow-gates.md § PLAN_CLARIFIED](../../../design/04-workflow-gates.md)
