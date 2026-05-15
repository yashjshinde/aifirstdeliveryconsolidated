---
task-id: T-{NNN}
task-title: {Task Title}
feature: {feature-name}
component-type: Plugin | WebResource | PCF | SchemaChange | Flow | Configuration
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

*(Code tasks only — remove this section for Configuration tasks)*

| File | Path | Purpose |
|---|---|---|
| `{FileName}.cs` | `output/{feature}/src/Plugins/` | {What the class does} |
| `{FileName}Tests.cs` | `output/{feature}/tests/Plugins.Tests/` | {What is tested} |

---

## Tests Created

*(Code tasks only)*

| Test file | Framework | Test cases | Coverage focus |
|---|---|---|---|
| `{FileNameTests}.cs` | FakeXrmEasy / Jest | {N} tests | {What scenarios are covered} |

---

## Build Status

*(Code tasks only)*

- [ ] Code compiles without errors
- [ ] All unit tests pass
- [ ] No hardcoded GUIDs or environment-specific values
- [ ] All constitution naming conventions followed

---

## Configuration Steps Completed

*(Configuration tasks only — remove this section for code tasks)*

| Step | Description | Status | Notes / Evidence |
|---|---|---|---|
| 1 | {What was configured} | Done / Manual required | {Value set, location, screenshot ref} |
| 2 | {What was configured} | Done / Manual required | {Value set, location, screenshot ref} |

---

## Settings Applied

*(Configuration tasks only)*

| Setting | Location | Value Applied | Notes |
|---|---|---|---|
| {Setting name} | {Where it was set — portal, file, env variable} | {Value} | {Notes} |

---

## Deviations from Task Card

| Deviation | Reason | Impact on ACs |
|---|---|---|
| {What was different from the task card} | {Why it was necessary} | {Effect on acceptance criteria} |

*(none)*

---

## Manual Steps Required

Steps that cannot be automated and must be completed by the developer or administrator:

| Step | Description | Owner | Notes |
|---|---|---|---|
| 1 | {What must be done manually} | Developer / Admin | {How to do it, what to verify} |

*(none — all steps automated)*

---

## Acceptance Criteria Sign-off

| AC-ID | Criterion | Result | Notes |
|---|---|---|---|
| AC-001 | {Criterion from task card} | PASS / FAIL / PARTIAL | {Notes if not a clean pass} |

---

## Implementation Notes

{Any additional context: decisions made during implementation, alternatives considered, links to related tasks, known limitations, follow-up items.}
