---
description: Hard gate validating tasks are ready-to-implement (gates TASK_VALIDATED)
agent: integration
phase: BUILD
gates: [TASK_VALIDATED]
---

# /validate

> Validate every L4 task before `/implement`.

## Usage

```
/validate [--approve] [--feature <slug>] [--project <name>] [--task <slug>]
```

## Validation rules

- Estimate within 3-8h
- AC present with unique AC-NN ids
- Dependencies resolve
- TDD cross-reference present in resource catalogue
- Unit-test policy explicit; test suite location specified when `required`
- Idempotency strategy documented per compute resource (Function / Logic App / proc)
- IaC module + parameter file referenced for every Azure resource
- No `<TBD>`
- `doc_lint` passes

## Execution flow

1. Load all task cards.
2. Run rules.
3. Write `projects/{p}/integration/features/{f}/reviews/task-validation.md`.
4. On `--approve` (zero BLOCKERs): flip `gates.TASK_VALIDATED.status=APPROVED`.

## Output

- `projects/{p}/integration/features/{f}/reviews/task-validation.md`

## See also

- [design/04-workflow-gates.md § TASK_VALIDATED](../../../design/04-workflow-gates.md)
