---
feature: {feature-name}
task-id: {L4-Prefix}-{NNN}
title: {Task Title}
component-type: Plugin | WebResource | PCF | SchemaChange | Flow | Configuration
story-ref: {L3-Prefix}-{NNN}
fr-refs: FR-001, FR-002
complexity: S | M | L | XL
role: Developer | Functional | QA
type: Dev | Config | Flow | Security | Testing | UX
status: TODO | IN PROGRESS | DONE
validation-status: NOT VALIDATED | READY TO IMPLEMENT | NEEDS REWORK | BLOCKED
output-path: output/{feature-name}/src/{ComponentFolder}/
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
- [Context](#context)
- [Pre-requisites](#pre-requisites)
- [D365 CE Specifics](#d365-ce-specifics)
- [Technical Approach](#technical-approach)
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

{Why this task exists. What business problem it solves. Reference the user story and functional requirements.}

**Story ACs covered:** This task contributes to acceptance criteria AC-001, AC-002 of {L3-Prefix}-{NNN}.

---

## Pre-requisites

- [ ] {Dependency task — e.g., "{L4-Prefix}-NNN (schema change for `table_name`) must be DONE"}
- [ ] {Environment state — e.g., "Solution `{prefix}Base` must exist and be published in the Dev environment"}
- [ ] {Access or tooling — e.g., "Developer has System Administrator role in D365 Dev environment"}

---

## D365 CE Specifics

| Field | Value |
|---|---|
| Entity | `{schema_name}` |
| Message | Create / Update / Delete / Custom |
| Stage | Pre-Operation / Post-Operation / Pre-Validation |
| Mode | Synchronous / Asynchronous |
| Rank | {number} |
| Filtering Attributes | `{attr1}`, `{attr2}` *(for Update only)* |
| Pre-Image Required | Yes / No — attributes: `{attr1}` |
| Post-Image Required | Yes / No — attributes: `{attr1}` |

*(Remove rows that don't apply to this component type)*

---

## Technical Approach

Step-by-step implementation guide. Written for a developer who has not seen the spec or plan.

1. {Step 1 — specific action with D365 CE navigation path or code location}
2. {Step 2}
3. {Step 3}
4. {Step 4}

---

## Validation

Quick verification steps to confirm this task is complete and working.

- {Verification step 1 — what to do and what the expected result is; include navigation path or command}
- {Verification step 2}
- {Verification step 3 — include test data or trigger action if applicable}

---

## Acceptance Criteria

| AC-ID | Criterion | Verification Method |
|---|---|---|
| AC-001 | {Testable statement of expected behaviour} | Manual test / Automated test |
| AC-002 | {Testable statement} | {Method} |

---

## Test Cases

| TC-ID | AC-Ref | Description | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|---|
| TC-001 | AC-001 | {Test description} | {Setup required} | {Steps} | {Expected outcome} |
| TC-002 | AC-001 | {Negative test} | {Setup} | {Steps} | {Expected error/behaviour} |

---

## Output Location

All generated files for this task:

```
output/{feature-name}/src/{ComponentFolder}/
  └─ {FileName}.cs / .ts / .js
output/{feature-name}/tests/Unit/{ComponentFolder}/
  └─ {FileNameTests}.cs / .test.ts
```

---

## Definition of Done

- [ ] Code written and saved to correct `output/` path
- [ ] All acceptance criteria verified
- [ ] Validation steps executed and results match expected
- [ ] Unit tests written and passing
- [ ] No constitution rule violated
- [ ] Code reviewed (if pairing)
- [ ] Task card updated: status = DONE
