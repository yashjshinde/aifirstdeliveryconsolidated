---
description: Reconcile FDD/TDD/blueprint with actuals from /implement
agent: d365-fo
phase: BUILD
gates: []
---

# /document

> Post-implement reconcile. Updates feature `fdd.md` / `tdd.md` / `blueprint.md` to reflect what was actually built — final object names, deployable-package layout, CoC ordering, ALM build #, security set effective.

## Usage

```
/document [--feature <slug>] [--project <name>]
```

## Inputs

- `projects/{p}/d365-fo/features/{f}/output/**`
- `projects/{p}/d365-fo/features/{f}/{fdd,tdd,blueprint}.md`
- Task cards

## Execution flow

1. Parse implementation artefacts (X++ source for class names / CoC binding / ext targets; XML for security; ER config XML; DMF project XML).
2. Update TDD §5 rows with actual object names + final schema.
3. Update task cards `documentation-status: done`.
4. Append per-feature entry to FDD §11 Implementation Log (if §11 absent in template, append it).
5. Run `doc_lint` on updated docs.
6. `currentStates += DOCUMENTED`; remove `IMPLEMENTED`.

## Output

- Updated `fdd.md`, `tdd.md`, `blueprint.md`
- Task cards
- `.workflow.json` updated

## See also

- [design/04-workflow-gates.md § DOCUMENTED](../../../design/04-workflow-gates.md)
