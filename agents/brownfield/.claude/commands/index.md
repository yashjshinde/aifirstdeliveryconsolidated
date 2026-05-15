---
description: Generate docs-generated/00-index.md master navigation
agent: brownfield
phase: SYNTHESIS
gates: []
---

# /index

> Generate the master navigation file `docs-generated/00-index.md` linking to every emitted doc + synthesis output + gap-log + coverage report.

## Usage

```
/index [--project <name>]
```

## Pre-conditions

- `/document` has run (per-artifact docs exist)
- `/fdd` / `/tdd` / `/blueprint` have run (synthesis docs exist)

## Execution flow

1. Walk `docs-generated/**.md`
2. Group by top-level folder + category
3. Render the index with sections:
   - **Synthesis** — functional-overview, technical-overview, solution-blueprint, integration-topology, inventory
   - **Reviewer artefacts** — coverage-report, gap-log
   - **Per-platform technical docs** — collapsible per platform per category
   - **Module-gated sections** — only when module detected
4. Validate `validate_no_grouping` (every doc linked individually; no "...and 12 more")
5. Write `_brownfield/docs-generated/00-index.md`

## Output

- `projects/{p}/_brownfield/docs-generated/00-index.md`

## See also

- [`templates/synthesis/component-inventory.template.md`](../../templates/synthesis/component-inventory.template.md) (uses similar grouping logic)
