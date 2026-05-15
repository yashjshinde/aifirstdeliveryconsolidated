---
adr: 0006
title: FDD/TDD/blueprint docScope — domain for CE/Integration/Reporting, feature for F&O; config-driven via agents.yaml
status: accepted
decided-on: 2026-05-14
design-doc-refs: [03-agent-inventory.md, 04-workflow-gates.md, 05-project-layout.md, 06-templates.md, 08-traceability.md]
---

# ADR-0006 — FDD/TDD/blueprint doc scope: domain vs feature, config-driven

## Status

`accepted` — decided 2026-05-14.

## Context

Per-feature FDDs would force CE/Integration/Reporting to fragment domain-wide artefacts (security model, entity catalog, integration topology, dataset registry) across every feature folder. That's churn: features accumulate naturally but the domain artefacts are project-wide and should accumulate in one place. By contrast, F&O extensions are genuinely discrete per feature — each feature touches one set of object-type changes; per-feature docs map cleanly to that delivery shape and preserve the Microsoft FastTrack pattern proven by years of project use.

The shape of `/fdd`, `/tdd`, and `/blueprint` cannot be a uniform pattern across all 8 agents. A per-agent config knob is required.

## Decision

Each agent declares its `docScope` for FDD, TDD, and blueprint in the registry `agents.yaml`. Two patterns:

| Pattern | docScope value | Target path | Behavior |
|---|---|---|---|
| **Domain** | `domain` | `projects/{p}/{agent}/{doc}.md` | **Bootstrap** from template on first call; **additive update** with `feature-id`-tagged sections + rows on subsequent feature calls |
| **Feature** | `feature` | `projects/{p}/{agent}/features/{f}/{doc}.md` | **Fresh-create** per feature from template; whole-doc review and push |

### Agent assignments

| Agent | docScope.{fdd, tdd, blueprint} | Rationale |
|---|---|---|
| `d365-ce` (fat) | **domain** | Entities/security/forms accumulate naturally project-wide |
| `d365-fo` | **feature** | FastTrack pattern; per-feature object-type changes |
| `integration` (merged) | **domain** | Interfaces + patterns accumulate project-wide |
| `reporting` | **domain** | Datasets / reports / dataflows accumulate project-wide |
| `solution-estimate`, `solution-architect` | n/a (aggregator) | Outputs are project-level by design |
| `brownfield` | feature/asset | Reverse-engineering per artefact |
| `alm` | n/a | Workflow-level ops |

### Spec/plan/test-plan/reviews/tasks: always feature-scoped

These are always per-feature regardless of agent. Only FDD/TDD/blueprint vary by `docScope`.

### Feature-delta tagging inside domain docs

For domain-scoped agents, every section block in the domain doc carries `<!-- feature-id: {feature-slug} -->` as an HTML comment at the top of the block; every table row in domain-doc tables carries a `feature-id` column. Enables:

- `/alm push --feature {f}` — extract only that feature's sections/rows
- `/alm pull --feature {f}` — apply ALM updates only to that feature's sections/rows
- `/fdd --feature {f}` — additive update OR re-run inline self-check (ADR-0001) on just that feature's delta

`doc_lint` enforces the tagging rule on every push.

### Concurrency

Disjoint section-blocks across features don't conflict; appended table rows don't conflict (each row carries its own `feature-id`). If two features genuinely touch the same section, `doc_lint` flags it and the user resolves explicitly. No automatic three-way merge.

## Alternatives considered

- **Uniform feature-scoped for all agents.** Reject — forces CE/Int/Rep to fragment domain artefacts; churn explodes as features add.
- **Uniform domain-scoped for all agents.** Reject — F&O extensions don't accumulate naturally; per-feature FDD/TDD matches the actual delivery shape.
- **No tagging; doc structure infers feature.** Reject — fragile (depends on section naming conventions); `/alm push --feature` can't reliably extract a subset.

## Consequences

**Positive:**
- Each agent picks the doc shape that matches its delivery model.
- Domain docs reduce review burden (one doc per project) while feature tagging preserves per-feature traceability for ALM and reviews.
- F&O preserves its battle-tested FastTrack pattern.

**Negative:**
- `/fdd`/`/tdd`/`/blueprint` now have two execution paths (bootstrap-create vs additive-update). Slightly more complex command implementation; offset by clearer authoring semantics.
- Authors of new agents must choose a docScope per doc type. Default in `_skeleton/` is `domain` (the more common case).

**Affected design docs:** [03-agent-inventory.md](../03-agent-inventory.md), [04-workflow-gates.md](../04-workflow-gates.md), [05-project-layout.md](../05-project-layout.md), [06-templates.md](../06-templates.md), [08-traceability.md](../08-traceability.md), all `agents/*.md` per-agent docs.

## References

- Related ADRs: [ADR-0001](0001-review-scope-spec-only.md) (inline self-check uses feature-id tagging), [ADR-0005](0005-d365-ce-multi-file-sub-platform.md)
