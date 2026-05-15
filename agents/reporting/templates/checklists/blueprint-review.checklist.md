<!-- blueprint-review.checklist.md - reporting agent. Consumed INLINE by /blueprint per ADR-0001. -->

# Blueprint Inline Self-Check — reporting

> BLOCKER findings fail the write.

## Categories

### A. Topology
- [ ] Reporting topology flowchart (sources → dataflows → datasets → reports → apps) covers every in-scope artefact
- [ ] Lineage matrix links every visual to its source table column
- [ ] Mermaid-only diagrams (no PNG/JPG references)

### B. Refresh choreography
- [ ] Daily / weekly schedules captured per dataset
- [ ] Dependent dataflow chains explicit (source dataflow → derived dataflow → dataset)
- [ ] Blackouts captured per `project.config.yaml reporting.dataset.refresh.windows`

### C. Security topology
- [ ] Workspace permissions matrix present
- [ ] RLS roles + USERPRINCIPALNAME mapping declared
- [ ] OLS perspectives declared
- [ ] Sensitivity labels per artefact

### D. Cross-references
- [ ] Cross-agent integration points referenced via handoff manifests
- [ ] ADR citations present where significant decisions (composite model, Premium-only feature, gateway choice) are made

## Severity legend

- **BLOCKER** — fail the write
- **REQUIRED** — fix or accept with rationale
- **WARNING** — author judgement
