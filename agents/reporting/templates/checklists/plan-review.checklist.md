<!-- plan-review.checklist.md - reporting agent. Consumed by /clarify per ADR-0001. -->

# Plan Review Checklist — reporting

> Consumed by `/clarify`. BLOCKER findings prevent gate transition to PLAN_CLARIFIED.

## Categories

### A. Hierarchy
- [ ] L1 Epic present
- [ ] L2 Capabilities cover every in-scope layer (dataflow / dataset / report / dashboard / app / security / data-sourcing)
- [ ] Every L3 maps to a spec FR-NN
- [ ] Every L3 has at least one L4 placeholder
- [ ] Every L4 estimate fits 3-8h window

### B. Per-layer correctness
- [ ] Refresh strategy declared per dataset L4 (Import / DirectQuery / Composite / Incremental)
- [ ] RLS policy resolved per dataset L4
- [ ] Source connection resolved per dataflow L4
- [ ] Sensitivity label assigned per report / dashboard / app

### C. Open Items
- [ ] All `<TBD>` markers resolved or accepted as DEFERRED with rationale
- [ ] All spec OQ-NN have plan-level resolution

### D. Cross-agent
- [ ] Every data-sourcing dependency in spec has a corresponding `_handoffs/reporting-to-{target}-*.handoff.json`
- [ ] Cross-agent dependency status tracked in `.workflow.json dependencies[]`

### E. NFR coverage
- [ ] Every spec NFR target has a corresponding L4 or constitution reference
- [ ] Performance NFR per page mapped to a verification task in test-plan

## Severity legend

- **BLOCKER** — fail `/clarify --approve`
- **REQUIRED** — fix or accept with rationale
- **WARNING** — author judgement
