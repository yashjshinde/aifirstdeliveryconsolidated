---
feature: {feature-name}
task-id: {L4-Prefix}-{NNN}
title: {Task Title}
component-type: Function | LogicApp | ServiceBus | APIM | Bicep | Schema | Configuration
story-ref: {L3-Prefix}-{NNN}
fr-refs: FR-001, FR-002
complexity: S | M | L | XL
role: Developer | Functional | QA
type: Dev | Config | Integration | Security | Testing | DevOps
status: TODO | IN PROGRESS | DONE
validation-status: NOT VALIDATED | READY TO IMPLEMENT | NEEDS REWORK | BLOCKED
output-path: output/{feature-name}/src/{folder}/ OR output/{feature-name}/infrastructure/
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
- [Azure Specifics](#azure-specifics)
- [Message Schema](#message-schema)
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

{Why this task exists. What integration problem it solves. Reference the user story and functional requirements.}

**Story ACs covered:** This task contributes to acceptance criteria AC-001, AC-002 of {L3-Prefix}-{NNN}.

---

## Pre-requisites

- [ ] {Dependency task — e.g., "{L4-Prefix}-NNN (Bicep module for `servicebus-namespace`) must be DONE and resources provisioned"}
- [ ] {Infrastructure state — e.g., "Service Bus namespace `{name}` must exist in the Dev resource group"}
- [ ] {Access or tooling — e.g., "Developer has Contributor role on the integration resource group"}

---

## Azure Specifics

| Field | Value |
|---|---|
| Resource Type | {Function App / Service Bus / Logic App / APIM} |
| Resource Name | `{resource-name}` |
| Trigger | {HTTP / ServiceBusTrigger / TimerTrigger / EventGridTrigger} |
| Managed Identity | System-assigned / User-assigned: `{identity-name}` |
| RBAC Role Required | `{role-name}` on `{resource}` |
| Retry Policy | {e.g., 3 retries, exponential backoff 2s–30s} |
| Timeout | {e.g., 30s for outbound HTTP} |
| Error Handling | {Throw to DLQ / Return 4xx / Retry} |

*(Remove rows that don't apply to this component type)*

---

## Message Schema *(if Service Bus or Schema task)*

```json
{
  "messageId": "string (guid)",
  "correlationId": "string (guid)",
  "source": "string",
  "eventType": "string (domain.entity.action)",
  "timestamp": "string (ISO8601)",
  "schemaVersion": "string",
  "payload": {
    // domain-specific fields
  }
}
```

---

## Technical Approach

Step-by-step implementation guide. Written for a developer who has not seen the spec or plan.

1. {Step 1 — specific action with resource name, trigger config, or portal path}
2. {Step 2}
3. {Step 3}
4. {Step 4}

---

## Validation

Quick verification steps to confirm this task is complete and working.

- {Verification step 1 — what to do and what the expected result is; include Azure portal path or CLI command}
- {Verification step 2 — e.g., "Send test message to queue; verify Function App log shows `[INFO] Message processed: correlationId={guid}`"}
- {Verification step 3 — include error/DLQ trigger if applicable}

---

## Acceptance Criteria

| AC-ID | Criterion | Verification Method |
|---|---|---|
| AC-001 | {Testable statement of expected behaviour} | Automated test / Manual smoke test |
| AC-002 | {Error/DLQ scenario — e.g., "On third retry failure, message moves to DLQ"} | Integration test |

---

## Test Cases

| TC-ID | AC-Ref | Description | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|---|
| TC-001 | AC-001 | {Happy path} | {Setup} | {Steps} | {Outcome} |
| TC-002 | AC-001 | {Failure/retry scenario} | {Setup} | {Steps} | {DLQ / error response} |

---

## Output Location

All generated files for this task:

```
output/{feature-name}/src/{folder}/
  └─ {FileName}.cs / workflow.json / policy.xml
output/{feature-name}/infrastructure/
  └─ {resource}.bicep
output/{feature-name}/tests/Unit/
  └─ {FileNameTests}.cs
```

---

## Definition of Done

- [ ] Code/IaC written to correct `output/` path
- [ ] All acceptance criteria verified
- [ ] Validation steps executed and results match expected
- [ ] Unit/integration tests written and passing
- [ ] Managed Identity role assignment documented
- [ ] No hardcoded connection strings or secrets
- [ ] No constitution rule violated
- [ ] Task card updated: status = DONE
