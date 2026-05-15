---
feature: {feature-name}
task-id: {L4-Prefix}-{NNN}
title: {Task Title}
component-type: CanvasApp | ModelDrivenApp | Flow | CopilotTopic | DataverseSchema | SecurityRole | Configuration
story-ref: {L3-Prefix}-{NNN}
fr-refs: FR-001, FR-002
complexity: S | M | L | XL
role: Developer | Functional | QA
type: Dev | Config | Flow | Security | Testing | UX
status: TODO | IN PROGRESS | DONE
validation-status: NOT VALIDATED | READY TO IMPLEMENT | NEEDS REWORK | BLOCKED
output-path: output/{feature-name}/src/{folder}/
impl-doc-path: — (set by /implement)
alm-type: {L4-Type}
alm-parent-ref: {L3-Prefix}-{NNN}
alm-id: null
priority: High | Medium | Low
author: Claude Code (/task)
---

# {L4-Type} {L4-Prefix}-{NNN} — {Task Title}

## Table of Contents

- [Plan Reference](#plan-reference)
- [Document Control](#document-control)
- [Context](#context)
- [Pre-requisites](#pre-requisites)
- [Power Platform Specifics](#power-platform-specifics)
- [Technical Approach](#technical-approach)
- [Canvas App Formulas](#canvas-app-formulas)
- [Validation](#validation)
- [Acceptance Criteria](#acceptance-criteria)
- [Test Cases](#test-cases)
- [Output Location](#output-location)
- [Definition of Done](#definition-of-done)

---

## Plan Reference

| Field | Value |
|---|---|
| **{L3-Type}** | {L3-Prefix}-{NNN} — {Story title} |
| **{L2-Type}** | {L2-Prefix}-{NNN} — {Feature title} |
| **{L1-Type}** | {L1-Prefix}-{NNN} — {Epic title} |
| **Functional Requirements** | FR-001, FR-002 |
| **Related Tasks** | {L4-Prefix}-NNN *(depends on)*, {L4-Prefix}-NNN *(follow-on)* |

---

## Document Control

| Field | Value |
|---|---|
| Task ID | {L4-Prefix}-{NNN} |
| Feature | {feature-name} |
| Author | Claude Code (/task) |
| Created | {YYYY-MM-DD} |
| Status | {TODO \| IN PROGRESS \| DONE} |
| Validation | {NOT VALIDATED \| READY TO IMPLEMENT \| NEEDS REWORK \| BLOCKED} |

---

## Context

{Why this task exists and what it delivers for the user story.}

**Story ACs covered:** This task contributes to acceptance criteria AC-001, AC-002 of {L3-Prefix}-{NNN}.

---

## Pre-requisites

- [ ] {Dependency task — e.g., "{L4-Prefix}-NNN (DataverseSchema for `{prefix}_tablename`) must be DONE and published"}
- [ ] {Solution state — e.g., "Solution `{prefix}Base` must be imported and active in the Dev environment"}
- [ ] {Access or tooling — e.g., "Maker has System Customizer role in the Dev Power Platform environment"}

---

## Power Platform Specifics

| Field | Value |
|---|---|
| Component | Canvas App / Model-Driven App / Flow / Copilot Topic |
| App / Flow / Topic Name | `{name}` |
| Screen / Form / Topic | `{name}` |
| Data Source / Table | `{prefix}_{tablename}` |
| Trigger (Flows) | {Automated / Scheduled / Instant / HTTP} |
| Connection Reference (Flows) | `{OrgPrefix} {ServiceName} Connection` |
| Delegation Risk | Yes / No — {detail and mitigation if yes} |

*(Remove rows that don't apply to this component type)*

---

## Technical Approach

Step-by-step implementation guide. Written for a maker/developer who has not seen the spec or plan.

1. {Step 1 — specific action with Maker Portal navigation path or pac CLI command}
2. {Step 2}
3. {Step 3}
4. {Step 4}

---

## Canvas App Formulas *(if Canvas App task)*

Key formulas to implement:

```powerfx
// {Purpose}
ClearCollect(col{Name}, Filter({prefix}_{table}, StatusCode = 1));
```

---

## Validation

Quick verification steps to confirm this task is complete and working.

- {Verification step 1 — what to do and what the expected result is; include Maker Portal path or Test Studio navigation}
- {Verification step 2 — e.g., "Run Test Studio suite `{TestSuiteName}`; all tests pass"}
- {Verification step 3 — e.g., "Trigger flow with test record; verify run history shows Success"}

---

## Acceptance Criteria

| AC-ID | Criterion | Verification Method |
|---|---|---|
| AC-001 | {Testable statement of expected behaviour} | Test Studio / Manual / Flow test |
| AC-002 | {Testable statement} | {Method} |

---

## Test Cases

| TC-ID | AC-Ref | Description | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|---|
| TC-001 | AC-001 | {Happy path} | {Setup} | {Steps} | {Outcome} |
| TC-002 | AC-001 | {Delegation/error edge case} | {Setup} | {Steps} | {Outcome} |

---

## Output Location

All generated files for this task:

```
output/{feature-name}/src/{folder}/
  └─ {FileName}.yaml / .json / schema-change.md
```

---

## Definition of Done

- [ ] Artefact created/modified per technical approach and saved to correct `output/` path
- [ ] All acceptance criteria verified
- [ ] Validation steps executed and results match expected
- [ ] Delegation risks addressed or mitigation documented
- [ ] Connection references created (if flow task)
- [ ] No constitution rule violated (publisher prefix on schema names, no personal connections)
- [ ] Task card updated: status = DONE
