---
description: Emit handoff for the ALM agent (alm-extract.v1 payload)
agent: integration
phase: BUILD
gates: []
---

# /alm-extract

> Emit a `handoff.v1` (payload validated against `alm-extract.v1`) for the `alm` agent.

## Usage

```
/alm-extract [--feature <slug>] [--project <name>]
```

## Inputs

- `projects/{p}/integration/features/{f}/plan.md`
- `projects/{p}/integration/features/{f}/tasks/*.task.md`
- `projects/{p}/integration/features/{f}/test-plan/**`
- `projects/{p}/integration/features/{f}/spec.md`

## ID strategy

- L1 Epic uid: `int-{feature-slug}-L1-01`
- L2 uid: `int-{feature-slug}-L2-NN` per pattern category (event-driven / batch / data-migration / iac / observability)
- L3 uid: `int-{feature-slug}-L3-NN` per FR
- L4 uid: `int-{feature-slug}-L4-NN` per task

## Execution flow

1. Build L1-L4 tree.
2. Attach ACs to L3.
3. Attach test cases to L4.
4. Build `alm-extract.v1` payload; wrap in `handoff.v1` envelope.
5. Validate against schemas.
6. Write `projects/{p}/_handoffs/integration-to-alm-{feature}.handoff.json`.

## Output

- `projects/{p}/_handoffs/integration-to-alm-{feature}.handoff.json`

## See also

- [schemas/alm-extract.v1.json](../../schemas/alm-extract.v1.json)
- [design/agents/alm.md](../../../design/agents/alm.md)
