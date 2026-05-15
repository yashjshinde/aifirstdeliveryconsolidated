<!-- spec-review.checklist.md - reporting agent. Consumed by /review per ADR-0001. -->

# Spec Review Checklist — reporting

> Authored 2026-05-15. Categories follow Power BI / SSRS authoring guidance per [constitution/02-power-bi-standards.md](../../constitution/02-power-bi-standards.md) and [constitution/01-ce-ssrs-standards.md](../../constitution/01-ce-ssrs-standards.md).

## Categories

### A. Completeness
- [ ] §1 Business context cites the decision the reporting supports (BLOCKER if absent)
- [ ] §2 Personas — at least one with success criteria
- [ ] §3 FRs numbered with ACs
- [ ] §4 NFR — refresh window, dataset size, performance target
- [ ] §5 Reporting layer selected (dataflow / dataset / report / dashboard / app)
- [ ] §6 Data sourcing — authoritative source declared per FR
- [ ] §7 Security — RLS / OLS / sensitivity label

### B. Correctness
- [ ] Authoritative source matches [constitution/03-data-sourcing.md § Source-selection rules](../../constitution/03-data-sourcing.md)
- [ ] Real-time freshness FRs map to DirectQuery / Composite (not Import) per [constitution/04-performance-and-refresh.md § Refresh strategy](../../constitution/04-performance-and-refresh.md)
- [ ] F&O native SSRS items NOT in scope (those belong to d365-fo)

### C. Traceability
- [ ] FR-NN ids unique; AC-NN ids unique per FR
- [ ] Cross-agent dependencies flagged for `/split`

### D. Conventions
- [ ] Workspace + dataset / dataflow / report naming matches [constitution/02-power-bi-standards.md § Naming](../../constitution/02-power-bi-standards.md)
- [ ] Sensitivity label assigned (default `Internal`)
- [ ] Accessibility scope (WCAG AA in / out) explicit
- [ ] Multilingual scope explicit per `project.config.yaml`

### E. Open Questions
- [ ] All OQ-NN have either resolution or explicit defer rationale (REQUIRED if not)

## Severity legend

- **BLOCKER** — fail `/review --approve` until fixed
- **REQUIRED** — fix or accept with `accepted-by` + `accepted-reason`
- **WARNING** — author judgement; capture rationale
