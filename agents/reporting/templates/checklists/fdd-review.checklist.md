<!-- fdd-review.checklist.md - reporting agent. Consumed INLINE by /fdd per ADR-0001. -->

# FDD Inline Self-Check — reporting

> BLOCKER findings fail the write. REQUIREDs need acceptance notes inline.

## Categories

### A. Completeness
- [ ] Every in-scope report / dataset / dataflow has a row in the catalogue
- [ ] Per-report structural section present with `<!-- feature-id: {slug} -->` marker
- [ ] §NFR mapping per feature populated

### B. Data sourcing correctness
- [ ] Authoritative source declared per dataset / dataflow (no inferred source)
- [ ] Source matches [constitution/03-data-sourcing.md § Source-selection rules](../../constitution/03-data-sourcing.md)

### C. Security
- [ ] RLS coverage explicit per dataset (no "TBD" on RLS)
- [ ] OLS perspective declared when PII / financial columns exist
- [ ] Sensitivity label assigned per artefact

### D. Performance + refresh
- [ ] Refresh window / mode (Import / DirectQuery / Composite / Incremental) declared per dataset
- [ ] Dataset size estimate (≤ 1 GB compressed default; Premium override justified)
- [ ] Visual render time NFR set per page (≤ 3 s for default page; ≤ 5 s for detail)

### E. Accessibility + multilingual
- [ ] Accessibility (WCAG AA) explicit per report (in / out)
- [ ] Multilingual scope per dataset (translations strategy declared when `multilingual.reports: true`)

### F. Cross-references
- [ ] Cross-agent handoffs in `_handoffs/` exist for every data-sourcing dependency on integration / d365-ce / d365-fo
- [ ] Spec FR-NN → FDD section traceability matrix present

## Severity legend

- **BLOCKER** — fail the write
- **REQUIRED** — fix or accept with rationale
- **WARNING** — author judgement
