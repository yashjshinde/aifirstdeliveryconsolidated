---
description: Spec-only review against spec-review.checklist.md; gates SPEC_APPROVED (ADR-0001)
agent: integration
phase: DEFINE
gates: [SPEC_APPROVED]
---

# /review

> Spec-only gate per [ADR-0001](../../../design/adr/0001-review-scope-spec-only.md). FDD/TDD/blueprint/test-plan run inline self-check.

## Usage

```
/review [--approve] [--feature <slug>] [--project <name>]
```

## Inputs

- `projects/{p}/integration/features/{f}/spec.md` (doc_lint clean)
- [templates/checklists/spec-review.checklist.md](../../templates/checklists/spec-review.checklist.md)

## Execution flow

1. Run `doc_lint` on spec.md.
2. Evaluate each checklist category.
3. Write `projects/{p}/integration/features/{f}/reviews/spec-review.md`.
4. On `--approve`: zero BLOCKERs + REQUIREDs accepted → `gates.SPEC_APPROVED.status=APPROVED`.

## Integration-specific spec checks

- Pattern selection matches catalogue in [constitution/01-event-driven-patterns.md](../../constitution/01-event-driven-patterns.md) and [constitution/02-batch-patterns.md](../../constitution/02-batch-patterns.md)
- NFR targets aligned with [constitution/12-observability-and-nfr.md](../../constitution/12-observability-and-nfr.md) defaults; project override declared
- Idempotency strategy explicit per FR
- Security model (auth, secrets, network) specified for every external surface

## Output

- `projects/{p}/integration/features/{f}/reviews/spec-review.md`

## See also

- [ADR-0001](../../../design/adr/0001-review-scope-spec-only.md)
- [templates/checklists/spec-review.checklist.md](../../templates/checklists/spec-review.checklist.md)
