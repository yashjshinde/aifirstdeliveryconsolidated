---
description: Synthesise functional overview from per-artifact docs
agent: brownfield
phase: SYNTHESIS
gates: []
---

# /fdd

> Synthesis step. Reads `inventory.json` + per-process docs + module detection results; emits `docs-generated/functional/functional-overview.md` per [`templates/synthesis/functional-overview.template.md`](../../templates/synthesis/functional-overview.template.md).

## Usage

```
/fdd [--project <name>]
```

## Pre-conditions

- `/scan` has emitted `inventory.json`
- `/document` has emitted per-process docs (classic-workflow, bpf, flow, business-rule, business-event)

## Inputs

- `_brownfield/inventory.json`
- `_brownfield/docs-generated/technical/processes/**`
- `_brownfield/docs-generated/technical/code/**` (for cross-link)
- `templates/synthesis/functional-overview.template.md`

## Execution flow

1. Load inventory + per-process docs
2. Group processes by detected module (per `detectedModules[]`)
3. Infer personas from security roles + Power Pages web roles (heuristic; clearly marked **(inferred)**)
4. Build §3 capabilities-by-module table from module detection + relevant artefact counts
5. Build §4 end-to-end process narratives by tracing: trigger entity → BPF → workflow → flow → business-event → response
6. Build §5 per-process index linking to each process doc
7. Build §6 business-events catalogue from `business-event` artefacts
8. Module-gated sections (§7 customer-service / §8 sales / §9 marketing): include only when module detected
9. Run global validators on the synthesised doc (`validate_evidence_chain`, `validate_no_grouping`)
10. Write `_brownfield/docs-generated/functional/functional-overview.md`

## Output

- `projects/{p}/_brownfield/docs-generated/functional/functional-overview.md`

## See also

- [`templates/synthesis/functional-overview.template.md`](../../templates/synthesis/functional-overview.template.md)
- [`templates/module-detection.yaml`](../../templates/module-detection.yaml)
