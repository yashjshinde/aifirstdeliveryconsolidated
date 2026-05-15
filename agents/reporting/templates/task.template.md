---
task-id: "{task-slug}"
feature-id: "{feature-slug}"
agent: reporting
plan-l3-uid: "{rep-feature-L3-NN}"
layer: "{dataflow|dataset|report|dashboard|app|security|data-sourcing}"
artefact-name: "{artefact-slug}"
estimate-hours: 4
unit-test: "{required|optional|none}"
dependencies: []
implementation-status: pending
documentation-status: pending
---

# Task — [{layer}] {artefact-name} — {action}

> L4 task card for a single reporting artefact. Authored by `/task`; validated by `/validate`; executed by `/implement`.

## Description

Scope: one reporting artefact (dataflow / dataset / report / dashboard / app / RLS role / theme / connection). 3-8h budget.

## Acceptance criteria

- AC-01 ...
- AC-02 ...

## Inputs

- Spec FR reference
- TDD §{N} per-layer block reference
- Source data path / schema reference
- RLS role list (when relevant)

## Outputs

- Files under `output/{layer}/{artefact-name}.{ext}`
- (when dataset) refresh schedule entry
- (when report) page list + drill-throughs

## Implementation steps

1. ...
2. ...

## Test coverage

- **required** — data-accuracy / RLS / refresh test suites with file path
- **optional** — cosmetic / theme changes
- **none** — rationale

## Dependencies

- Upstream task slugs (dataset before report; dataflow before dataset)
- Cross-agent handoffs (data-sourcing dependencies on integration / d365-ce / d365-fo)

## Definition of done

- [ ] ACs satisfied
- [ ] Power BI Analyzer / SSRS lint clean
- [ ] `unit-test` policy satisfied
- [ ] Sensitivity label assigned
- [ ] Refresh tested
- [ ] `doc_lint` passes
- [ ] `implementation-status: done`
