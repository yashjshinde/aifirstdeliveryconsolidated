---
description: Emit handoffs to other agents when the reporting spec depends on CE / F&O / integration changes
agent: reporting
phase: DEFINE
gates: []
---

# /split

> Emit `handoff.v1` per target when the reporting spec requires upstream data engineering (BYOD pipeline, Synapse Link config, virtual entity, CE alternate-key indexes).

## Usage

```
/split [--feature <slug>] [--project <name>] [--targets <comma-separated>]
```

## Common triggers

- Spec requires new CE alternate keys / indexes / FetchXML view → `d365-ce`
- Spec requires BYOD export of F&O entity → `d365-fo`
- Spec requires Synapse Link config / data lake export orchestration → `integration`

## Execution flow

1. Scan spec for cross-agent surface area.
2. Build `handoff.v1` per target; payload = required upstream change list.
3. Validate against `schemas/handoff.v1.json`.
4. Write `projects/{p}/_handoffs/reporting-to-{target}-{feature}.handoff.json`.
5. Mark spec §10 with `<!-- split-emitted: {target} -->`.
6. `currentStates += SPEC_SPLIT`.

## Output

- `projects/{p}/_handoffs/reporting-to-{target}-{feature}.handoff.json`

## See also

- [design/09-orchestration-patterns.md](../../../design/09-orchestration-patterns.md)
- [constitution/03-data-sourcing.md](../../constitution/03-data-sourcing.md)
