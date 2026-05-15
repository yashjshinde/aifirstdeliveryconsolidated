---
object-id: "{EXT-001}"
object-category: "{Extensions}"
object-type: "{Table Extension}"
object-name: "{technical name, e.g. CustTable.Extension}"
module: "{module code}"
requirement: "{requirement-name}"
fdd-ref: "{FDD section, e.g. Section 10}"
tdd-ref: "{TDD section, e.g. Section 5.4.4}"
fr-refs: []             # FDD Rule-IDs this object implements, e.g. [BR-001, BR-002]
complexity: "{Simple}"
t-shirt: "{S}"
story-points: 1         # XS=0.5  S=1  M=3  L=8  XL=20
depends-on: []
priority: 2
status: "Not Started"   # Not Started | In Progress | Done | Blocked
impl-doc-path: null
alm-id: null
uid: "{requirement-name}-{Object-ID}"
---

# {Object-ID} — {Object Name}

**Requirement:** {requirement-name}
**Category / Type:** {object-category} / {object-type}
**Module:** {module code}
**Complexity:** {complexity} ({t-shirt})
**FDD Ref:** {FDD section} | **TDD Ref:** {TDD section}
**Depends On:** {Object-IDs or "—"}

## Table of Contents

- [Context](#context)
- [Implementation Approach](#implementation-approach)
- [X++ Coding Standards Checklist](#x-coding-standards-checklist)
- [Acceptance Criteria](#acceptance-criteria)
- [Test Cases](#test-cases)
- [Definition of Done](#definition-of-done)

---

## Document Control

| Field | Value |
|---|---|
| Object-ID | {Object-ID} |
| Requirement | {requirement-name} |
| Author | Claude Code (/plan) |
| Created | {YYYY-MM-DD} |
| Status | Not Started \| IN PROGRESS \| DONE |

---

## Context

_Why this object exists. Which FDD business rule or form design drives it. One or two sentences._

`<TBD>`

---

## Implementation Approach

_Step-by-step technical implementation guide derived from the TDD architecture sub-section. A developer should be able to complete this task without reading the full TDD._

1. `<TBD>`
2. `<TBD>`

### Object-Type Specifics

_Fill in the section relevant to this object's type. Delete unused sections._

#### For Table Extension / New Table

| Field Name | Type | EDT | Allow Edit | Mandatory |
|---|---|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

#### For Form Extension / New Form

| Control Name | Type | Parent | Data Source | Caption |
|---|---|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

#### For New Class / Class Extension (CoC)

| Method | Signature | Purpose |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

#### For Security (Privilege / Duty)

| Entry Point | Object Type | Object Name | Access Level |
|---|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

---

## X++ Coding Standards Checklist

_Verify before marking DONE._

- [ ] XML doc-comment on class and all public methods
- [ ] `ttsbegin` / `ttscommit` on all database writes with rollback on error
- [ ] No hardcoded string literals — all user-facing text uses label references
- [ ] No hardcoded `DataAreaId` — use `curExt()` or the record's company
- [ ] WHERE clauses on indexed fields only
- [ ] AVA naming convention applied (`AVA_<Module>_<Name>` or `<BaseObject>.Extension`)
- [ ] No prohibited patterns (swallowed exceptions, `sleep()` in sync paths, `throw` without message)

---

## Acceptance Criteria

| AC-ID | Criterion | Test Steps | Expected Result |
|---|---|---|---|
| AC-001 | `<Testable statement from FDD business rule or form design>` | `<Steps to verify>` | `<What success looks like>` |
| AC-002 | `<TBD>` | `<TBD>` | `<TBD>` |

---

## Test Cases

*Linked from test-plan.md. Minimum 2 per Rule-ID (positive + negative). Add X++ unit test case refs for business logic objects.*

| TC-ID | Rule-ID / Ref | Type | Description | Expected Result |
|---|---|---|---|---|
| TC-001 | BR-001 | SIT — Functional | `<positive scenario>` | `<expected outcome>` |
| TC-002 | BR-001 | SIT — Functional | `<negative — error fires>` | `Error: "<exact message>"` |

<!-- GENERATOR: For New Class / CoC / Event Handler / Batch Class objects, also add:
     `| TC-NNN | BR-001 | X++ Unit Test | {method name} — {test scenario} | All assertions pass |` -->

---

## Definition of Done

- [ ] X++ compiles without errors or warnings
- [ ] All acceptance criteria passed (positive + negative paths)
- [ ] Implementation record written at `output/{req}/impl-docs/{Object-ID}-{slug}-impl.md`
- [ ] Plan status updated to DONE
- [ ] Tracker updated
- [ ] No deviations from TDD (or deviations documented in impl-doc)
