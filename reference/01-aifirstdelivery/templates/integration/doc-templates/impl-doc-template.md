---
task-id: T-{NNN}
task-title: {Task Title}
feature: {feature-name}
component-type: Function | LogicApp | ServiceBus | APIM | Bicep | Schema | Configuration
implemented-date: {YYYY-MM-DD}
implemented-by: Claude Code (/implement)
status: COMPLETE | PARTIAL | BLOCKED
---

# Implementation Record — T-{NNN}: {Task Title}

**Feature:** {feature-name}
**Component type:** {component-type}
**Date:** {YYYY-MM-DD}
**Task card:** [tasks/{feature-name}/{task-file}.md](../../tasks/{feature-name}/{task-file}.md)

## Document Control

| Field | Value |
|---|---|
| Task ID | T-{NNN} |
| Feature | {feature-name} |
| Component Type | {component-type} |
| Implemented By | Claude Code (/implement) |
| Date | {YYYY-MM-DD} |
| Status | {COMPLETE \| PARTIAL \| BLOCKED} |

---

## Table of Contents

- [Implementation Summary](#implementation-summary)
- [Files Created](#files-created)
- [Tests Created](#tests-created)
- [Build Status](#build-status)
- [Configuration Steps Completed](#configuration-steps-completed)
- [Settings Applied](#settings-applied)
- [Deviations from Task Card](#deviations-from-task-card)
- [Manual Steps Required](#manual-steps-required)
- [Acceptance Criteria Sign-off](#acceptance-criteria-sign-off)
- [Implementation Notes](#implementation-notes)

---

## Implementation Summary

{2–3 sentences describing what was implemented, what decisions were made, and the overall outcome.}

---

## Files Created

*(Code/IaC tasks only — remove this section for Configuration tasks)*

| File | Path | Purpose |
|---|---|---|
| `{FileName}.cs` | `output/{feature}/src/Functions/` | {What the function does} |
| `{FileName}Tests.cs` | `output/{feature}/tests/Unit/` | {What is tested} |
| `main.bicep` | `output/{feature}/infrastructure/` | {Resources provisioned} |

---

## Tests Created

*(Code tasks only)*

| Test file | Framework | Test cases | Coverage focus |
|---|---|---|---|
| `{FileNameTests}.cs` | xUnit | {N} tests | {Happy path, retry, DLQ, error scenarios} |

---

## Build Status

*(Code/IaC tasks only)*

- [ ] Code compiles without errors
- [ ] All unit tests pass
- [ ] Bicep validates cleanly (`az bicep build`)
- [ ] No hardcoded connection strings or secrets
- [ ] Managed Identity used — no stored credentials
- [ ] All constitution naming conventions followed

---

## Configuration Steps Completed

*(Configuration tasks only — remove this section for code tasks)*

| Step | Description | Status | Notes / Evidence |
|---|---|---|---|
| 1 | {What was configured} | Done / Manual required | {Value set, resource name, portal location} |
| 2 | {What was configured} | Done / Manual required | {Value set, resource name, portal location} |

---

## Settings Applied

*(Configuration tasks only)*

| Setting | Location | Value Applied | Notes |
|---|---|---|---|
| {Setting name} | {Azure portal / Key Vault / App Settings / APIM} | {Value or secret reference} | {Notes} |

---

## Deviations from Task Card

| Deviation | Reason | Impact on ACs |
|---|---|---|
| {What was different} | {Why} | {Effect on acceptance criteria} |

*(none)*

---

## Manual Steps Required

| Step | Description | Owner | Notes |
|---|---|---|---|
| 1 | {What must be done manually} | Developer / Ops | {How to do it} |

*(none — all steps automated)*

---

## Acceptance Criteria Sign-off

| AC-ID | Criterion | Result | Notes |
|---|---|---|---|
| AC-001 | {Criterion} | PASS / FAIL / PARTIAL | {Notes} |

---

## Implementation Notes

{Additional context: decisions made, alternatives considered, links to related tasks, known limitations.}
