<!-- tdd-review.checklist.md - reporting agent. Consumed INLINE by /tdd per ADR-0001. -->

# TDD Inline Self-Check — reporting

> BLOCKER findings fail the write.

## Categories

### A. Dataset technical correctness
- [ ] Star-schema (or composite) explicit; columns + relationships + cardinality declared
- [ ] DAX measures: variables used; no early `FILTER(table, ...)` patterns; time intelligence via calculation groups
- [ ] RLS roles defined with USERPRINCIPALNAME mapping table referenced
- [ ] OLS perspective defined for hidden columns

### B. Dataflow technical correctness
- [ ] Source connection + linked-service / gateway / credential declared (NO literal secrets)
- [ ] Partition strategy + incremental refresh policy explicit when > 50M rows
- [ ] M code patterns follow Power Query best practice (folding preserved; column references after rename)

### C. Report technical correctness
- [ ] Page list + drill-throughs + bookmarks declared
- [ ] Theme JSON reference
- [ ] Accessibility verified (alt-text on every meaningful visual, contrast WCAG AA, tab order)

### D. CE SSRS technical correctness
- [ ] FetchXML or pre-filtered SQL declared per dataset
- [ ] Parameters + defaults declared
- [ ] Layout grouping + page sizing declared

### E. Cross-references
- [ ] Every TDD resource row links back to its plan L4 + spec FR
- [ ] Cross-agent dependencies cite the corresponding `_handoffs/` manifest

### F. Open items
- [ ] `<TBD>` count surfaces in §Open Items roll-up

## Severity legend

- **BLOCKER** — fail the write
- **REQUIRED** — fix or accept with rationale
- **WARNING** — author judgement
