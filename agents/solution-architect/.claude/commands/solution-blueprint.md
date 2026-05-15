---
description: Aggregate per-agent blueprints into a single cross-agent C4-style unified blueprint.
agent: solution-architect
---

# /solution-blueprint

> Synthesise the cross-agent unified architecture from per-agent `blueprint.md` files. Per [constitution/01-architecture-principles.md](../../constitution/01-architecture-principles.md) and [02-aggregation-rules.md](../../constitution/02-aggregation-rules.md).

## Usage

```
/solution-blueprint [--project <name>]
```

Bare `/solution-blueprint` operates on the project resolved from `cwd` (walks up to the nearest `projects/{p}/`). Pass `--project <name>` to target a specific project explicitly.

## Inputs

Reads per-agent blueprints by walking [02-aggregation-rules.md § Source discovery](../../constitution/02-aggregation-rules.md):

| Agent | Source path |
|---|---|
| d365-ce | `projects/{p}/d365-ce/blueprint.md` |
| d365-fo | `projects/{p}/d365-fo/features/*/blueprint.md` (per-feature; aggregated) |
| integration | `projects/{p}/integration/blueprint.md` |
| reporting | `projects/{p}/reporting/blueprint.md` |
| Brownfield (when applicable) | `projects/{p}/_brownfield/docs-generated/architecture/solution-blueprint.md` |

If a domain agent is in `project.config.yaml agents-enabled` but its blueprint.md is missing, log a Typed Gap of category `MISSING-UPSTREAM` and continue.

## Execution flow

1. Resolve project + read `project.config.yaml`.
2. For each agent in `agents-enabled`, discover its blueprint.md source path.
3. For each source blueprint, extract:
   - Actors + external systems
   - Containers + components
   - ADRs cited
   - NFR targets per component
   - Integration contracts (cross-agent dependencies)
4. Synthesise:
   - System Context Mermaid (C4-L1)
   - Containers Mermaid (C4-L2)
   - Per-agent Components Mermaid (C4-L3) — one diagram per agent
   - Reconciled NFR matrix
   - Cross-agent integration contracts table
   - Aggregated ADR list
5. Validate per [01-architecture-principles.md](../../constitution/01-architecture-principles.md) Principles 1, 4, 5.
6. **Brownfield mode**: render side-by-side as-is + to-be sections.
7. Render [templates/blueprint.template.md](../../templates/blueprint.template.md) with substituted content.
8. Quality self-check inline; BLOCKER findings fail the write.
9. Write output to `projects/{p}/_aggregator/architecture/solution-blueprint.md`.
10. (Optional) emit a `handoff.v1` with `targetAgent: alm` + `artifactType: blueprint-aggregate` so the alm agent can extract architectural-decision Epics into ADO/JIRA.

## Output

- `projects/{p}/_aggregator/architecture/solution-blueprint.md` (always)

## Idempotency

Re-running with no changes to source blueprints produces an identical output (content-hash compared; no-op write). The publish pipeline's drift-check semantics apply to this output the same way (per ADR-0011).

## See also

- [constitution/01-architecture-principles.md](../../constitution/01-architecture-principles.md)
- [constitution/02-aggregation-rules.md](../../constitution/02-aggregation-rules.md)
- [templates/blueprint.template.md](../../templates/blueprint.template.md)
- [design/agents/solution-architect.md](../../../design/agents/solution-architect.md)
