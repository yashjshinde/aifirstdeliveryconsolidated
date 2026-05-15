---
description: Hard gate validating tasks are ready-to-implement (gates TASK_VALIDATED)
agent: reporting
phase: BUILD
gates: [TASK_VALIDATED]
---

# /validate

> Validate every L4 task before `/implement`.

## Validation rules

- Estimate 3-8h
- AC present + AC-NN unique
- Dependencies resolve
- TDD cross-reference present in per-layer block
- Unit-test policy explicit; data-accuracy test suite location specified when `required`
- For dataset tasks: refresh strategy explicit (Import / DirectQuery / Composite; incremental policy when > 50M rows)
- For RLS tasks: target role list + USERPRINCIPALNAME mapping specified
- For SSRS tasks: data source (FetchXML/SQL) declared
- No `<TBD>`
- `doc_lint` passes

## Usage

```
/validate [--approve] [--feature <slug>] [--project <name>] [--task <slug>]
```

## Execution flow

1. Load all task cards.
2. Run rules.
3. Write `projects/{p}/reporting/features/{f}/reviews/task-validation.md`.
4. On `--approve`: flip `gates.TASK_VALIDATED.status=APPROVED`.

## Output

- `projects/{p}/reporting/features/{f}/reviews/task-validation.md`

## See also

- [design/04-workflow-gates.md § TASK_VALIDATED](../../../design/04-workflow-gates.md)
