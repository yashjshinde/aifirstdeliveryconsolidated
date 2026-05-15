---
description: Detail L4 task cards (3-8h target) for integration resources
agent: integration
phase: BUILD
gates: []
---

# /task

> Detail L4 task cards. One file per L4 at `projects/{p}/integration/features/{f}/tasks/{slug}.task.md`. Filename uses resource-kind prefix (e.g., `fn-customer-create.task.md`, `adf-customer-load.task.md`, `bicep-service-bus.task.md`).

## Usage

```
/task [--feature <slug>] [--project <name>] [--task <slug>]
```

## Inputs

- `projects/{p}/integration/features/{f}/plan.md` (`PLAN_CLARIFIED` APPROVED)
- `projects/{p}/integration/tdd.md`
- [templates/task.template.md](../../templates/task.template.md)

## Execution flow

1. Enumerate L4 placeholders from plan.md.
2. For each L4:
   - Map to TDD resource catalogue row
   - Author task with:
     - Title: `[{resource-kind}] {resource-name} — {action}` (e.g., `[fn] customer-create — implement POST handler`)
     - Estimate (3-8h)
     - Inputs (TDD section, schema definitions, secrets)
     - Outputs (artefact paths under `output/`, IaC module additions)
     - Test policy (`unit-test: required` for compute resources; `none` for IaC-only)
     - Dependencies
3. `currentStates += TASK_DRAFT`; `gate TASK_VALIDATED.status=PENDING`.

## Output

- `projects/{p}/integration/features/{f}/tasks/{slug}.task.md`

## See also

- [templates/task.template.md](../../templates/task.template.md)
- [constitution/03-azure-functions-standards.md](../../constitution/03-azure-functions-standards.md)
- [design/agents/alm.md](../../../design/agents/alm.md)
