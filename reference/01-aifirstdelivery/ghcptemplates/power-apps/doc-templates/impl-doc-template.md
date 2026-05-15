---
task-id: T-{NNN}
task-title: {Task Title}
feature: {feature-name}
component-type: CanvasApp | ModelDrivenApp | Flow | CopilotTopic | DataverseSchema | SecurityRole | Configuration
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
- [Artifacts Created](#artifacts-created)
- [Power Platform Specifics](#power-platform-specifics)
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

## Artifacts Created

*(Artifact tasks only — remove this section for Configuration tasks)*

| File | Path | Purpose |
|---|---|---|
| `{screen-name}.yaml` | `output/{feature}/src/CanvasApps/` | {What screen/formulas were generated} |
| `{flow-name}.json` | `output/{feature}/src/Flows/` | {What the flow does} |
| `{topic-name}.yaml` | `output/{feature}/src/CopilotStudio/` | {What topic/dialogue was generated} |
| `schema-change.md` | `output/{feature}/src/DataverseSchema/` | {Tables/columns created} |

---

## Power Platform Specifics

*(Artifact tasks only)*

| Item | Detail |
|---|---|
| Delegation-safe | Yes / No — {if No, explain workaround or accepted risk} |
| Connection references used | {List of connection reference names} |
| Environment variables used | {List of env variable names} |
| DLP policy impact | None / {What connectors are used and their DLP tier} |

---

## Configuration Steps Completed

*(Configuration tasks only — remove this section for artifact tasks)*

| Step | Description | Status | Notes / Evidence |
|---|---|---|---|
| 1 | {What was configured} | Done / Manual required | {Value, portal location, screenshot ref} |
| 2 | {What was configured} | Done / Manual required | {Value, portal location, screenshot ref} |

---

## Settings Applied

*(Configuration tasks only)*

| Setting | Location | Value Applied | Notes |
|---|---|---|---|
| {Setting name} | {Maker Portal / Admin Center / Copilot Studio / pac CLI} | {Value} | {Notes} |

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
| 1 | {What must be done manually} | Maker / Admin | {How to do it, what to verify after} |

*(none — all steps automated)*

---

## Acceptance Criteria Sign-off

| AC-ID | Criterion | Result | Notes |
|---|---|---|---|
| AC-001 | {Criterion} | PASS / FAIL / PARTIAL | {Notes} |

---

## Implementation Notes

{Additional context: Power Fx delegation decisions, connection reference setup notes, Copilot Studio publish status, known limitations, follow-up items.}
