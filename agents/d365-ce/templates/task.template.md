---
task-id: "{task-slug}"
feature-id: "{feature-slug}"
agent: d365-ce
plan-l3-uid: "{ce-feature-L3-NN}"
object-type: "{plugin|js|pcf|canvas|page|pa-flow|entity|view|workflow|bpf|security-role|web-resource}"
estimate-hours: 4
unit-test: "{required|optional|none}"
dependencies: []
implementation-status: pending
documentation-status: pending
---

# Task — {Task title}

> Detailed L4 task card. Authored by `/task`; validated by `/validate`; executed by `/implement`.

## Description

What this task does, scoped to a single artefact. Keep it within 3-8h target window — if larger, split.

## Acceptance criteria

- AC-01 {first observable outcome}
- AC-02 {second outcome}
- AC-NN ...

## Inputs

- Spec FR-NN reference (link to spec.md anchor)
- TDD §{N.M} reference (link to tdd.md anchor)
- Existing artefacts to extend (file paths, schema names)
- Source data (e.g., entity reference data import)

## Outputs

- File(s) to create / modify under `projects/{p}/d365-ce/features/{f}/output/{type}/`
- Schema names introduced (per `project.config.yaml prefixes.publisher`)
- Solution components added (entity / column / form / plugin step / etc.)

## Implementation steps (≤ 8h budget)

1. ...
2. ...
3. ...

## Test coverage

Per `unit-test` frontmatter value:

- **required** — list test class / fixture / suite that must exist before this task is "done"
- **optional** — note any tests authored opportunistically
- **none** — record rationale (e.g., declarative-only change)

## Dependencies

- Upstream tasks (must complete first)
- Cross-agent handoffs (must be READY in `.workflow.json dependencies`)

## Definition of done

- [ ] All ACs satisfied
- [ ] Output artefacts under `output/` and named per [constitution/01-model-driven-standards.md § Naming](../constitution/01-model-driven-standards.md)
- [ ] `unit-test` policy satisfied
- [ ] Task card `implementation-status: done`
- [ ] Doc-lint passes on the task file
