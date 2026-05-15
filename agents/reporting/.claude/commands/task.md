---
description: Detail L4 task cards (3-8h target) for reporting artefacts
agent: reporting
phase: BUILD
gates: []
---

# /task

> Detail L4 task cards. One file per L4 at `projects/{p}/reporting/features/{f}/tasks/{slug}.task.md`. Filename uses layer prefix (e.g., `ds-customer.task.md`, `rep-aging.task.md`, `df-dataverse-account.task.md`).

## Usage

```
/task [--feature <slug>] [--project <name>] [--task <slug>]
```

## Execution flow

1. Enumerate L4 placeholders from plan.md.
2. For each L4:
   - Map to TDD per-layer technical block
   - Author task with:
     - Title: `[{layer}] {artefact-name} — {action}` (e.g., `[ds] customer — add fact-sale table with date relationship`)
     - Estimate (3-8h)
     - Inputs (source data path, schema reference, RLS role)
     - Outputs (PBIT/PBIX/RDL/JSON files under `output/`)
     - Test policy (`required` for dataset accuracy; `optional` for purely cosmetic report changes)
     - Dependencies
3. `currentStates += TASK_DRAFT`; `gate TASK_VALIDATED.status=PENDING`.

## Output

- `projects/{p}/reporting/features/{f}/tasks/{slug}.task.md`

## See also

- [templates/task.template.md](../../templates/task.template.md)
- [constitution/02-power-bi-standards.md](../../constitution/02-power-bi-standards.md)
- [design/agents/alm.md](../../../design/agents/alm.md)
