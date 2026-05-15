---
task-id: "{object-id}"
feature-id: "{feature-slug}"
agent: d365-fo
plan-l3-uid: "{fo-feature-L3-NN}"
object-id-prefix: "{EXT|BDC|OPR|INT|DEN|SEC|WFL}"
object-type: "{class|table-ext|form-ext|data-entity|dmf|er-config|security-role|workflow|service-class|batch-job}"
estimate-hours: 4
unit-test: "{required|optional|none}"
dependencies: []
implementation-status: pending
documentation-status: pending
---

# Task — [{object-id}] {Object name}

> Detailed L4 task for an F&O AOT object. Authored by `/task`; validated by `/validate`; executed by `/implement`. Filename uses the object-id prefix (e.g., `EXT-12.task.md`).

## Description

Describe the single AOT object change for this task. Stay within 3-8h budget — if larger, split.

## Acceptance criteria

- AC-01 {observable outcome — e.g., new method signature, table-extension column exists with field-group binding}
- AC-02 ...

## Inputs

- Spec FR-NN reference (anchor link)
- TDD §5 row for `{object-id}` (anchor link)
- Existing model + dependent base model versions
- Source data (when DEN-NN — entity sample CSV path)

## Outputs

- AOT source file(s) under `output/{object-type}/{object-id}-{name}.{ext}`
- Solution / model XML diffs
- DMF / ER package fragments (when applicable)

## Implementation steps

1. ...
2. ...
3. ...

## Test coverage

- **required** — X++ unit-test class location: `output/test/{object-id}Tests.xpp`
- **optional** — note any tests authored opportunistically
- **none** — rationale (e.g., declarative ER config)

## Dependencies

- Upstream task object-ids
- Cross-agent handoffs (e.g., integration / d365-ce virtual entity)

## Definition of done

- [ ] AC-01..N satisfied
- [ ] X++ best-practice analyzer clean (no BLOCKERs)
- [ ] `unit-test` policy satisfied
- [ ] `doc_lint` passes
- [ ] `implementation-status: done`
