---
task-id: "{task-slug}"
feature-id: "{feature-slug}"
agent: integration
plan-l3-uid: "{int-feature-L3-NN}"
resource-kind: "{fn|la|sb|eg|apim|adf|sql|sftp|bicep|test|observability}"
resource-name: "{resource-slug}"
estimate-hours: 4
unit-test: "{required|optional|none}"
dependencies: []
implementation-status: pending
documentation-status: pending
---

# Task — [{resource-kind}] {resource-name} — {action}

> L4 task card for a single integration resource. Authored by `/task`; validated by `/validate`; executed by `/implement`.

## Description

Scope: one resource (Function / Logic App / topic / queue / ADF pipeline / SQL proc / Bicep module / test suite). 3-8h budget — split if larger.

## Acceptance criteria

- AC-01 {observable outcome}
- AC-02 ...

## Inputs

- Spec FR reference
- TDD §{N} row reference (resource catalogue)
- Schema definitions / payload contracts
- Secret URIs (Key Vault references, never literal secrets)

## Outputs

- Files under `output/{resource-kind}/{resource-name}/...`
- Bicep module reference
- Test file location

## Implementation steps

1. ...
2. ...

## Test coverage

- **required** — test suite file path + framework
- **optional** — opportunistic tests noted
- **none** — rationale (e.g., IaC-only task)

## Idempotency strategy

- Compute resources: explicit `messageId` / `runId` / cache key + state table
- IaC: `what-if` diff non-destructive without `--approved-by`
- Pipeline / proc: re-runnable with same `LoadRunId`

## Dependencies

- Upstream task slugs
- Cross-agent handoffs

## Definition of done

- [ ] ACs satisfied
- [ ] Lint clean per kind
- [ ] `unit-test` policy satisfied
- [ ] Idempotency strategy documented in TDD
- [ ] `doc_lint` passes
- [ ] `implementation-status: done`
