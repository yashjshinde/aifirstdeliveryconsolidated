---
description: Generate the feature FDD; inline self-check per ADR-0001
agent: d365-fo
phase: DESIGN
gates: []
parallel-after: SPEC_APPROVED
---

# /fdd

> Generate the feature-scoped FDD per [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md). F&O FDDs live under `projects/{p}/d365-fo/features/{f}/fdd.md` (one per feature — distinct from CE's domain-scoped pattern).

## Usage

```
/fdd [--feature <slug>] [--project <name>]
```

## Inputs

- `projects/{p}/d365-fo/features/{f}/spec.md` (`SPEC_APPROVED` APPROVED)
- [templates/fdd.template.md](../../templates/fdd.template.md)
- `project.config.yaml`

## Execution flow

1. Render `templates/fdd.template.md` into `projects/{p}/d365-fo/features/{f}/fdd.md`.
2. FDD content (ported FastTrack-pattern):
   - §1 Business context (current process — end-to-end, never a single sentence per [constitution/06-documentation-and-change.md](../../constitution/06-documentation-and-change.md))
   - §2 Future process
   - §3 FRs mapped to F&O object-types
   - §4 Object inventory using object-id prefixes (EXT/BDC/OPR/INT/DEN/SEC/WFL)
   - §5 NFR mapping per FR
   - §6 Multilingual, security, audit
   - §7 Cross-agent dependencies
3. **Inline self-check** against [templates/checklists/fdd-review.checklist.md](../../templates/checklists/fdd-review.checklist.md). BLOCKERs fail the write.
4. Run `doc_lint`.
5. `currentStates += FDD_DRAFT`.

## F&O-specific FDD rules

- ★ markers on mandatory sections (gate downstream `/tdd`)
- "Not Applicable" explicit; no blank sections
- Object-id prefixes used consistently
- `<TBD>` count surfaces in §1.5

## Output

- `projects/{p}/d365-fo/features/{f}/fdd.md`

## See also

- [templates/fdd.template.md](../../templates/fdd.template.md)
- [templates/checklists/fdd-review.checklist.md](../../templates/checklists/fdd-review.checklist.md)
- [constitution/06-documentation-and-change.md](../../constitution/06-documentation-and-change.md)
- [design/agents/d365-fo.md](../../../design/agents/d365-fo.md)
