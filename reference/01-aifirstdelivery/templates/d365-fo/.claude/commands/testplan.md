Generate a Test Plan and Strategy for a D365 F&O requirement from an approved FDD. Produces a complete test strategy with test cases for every business rule, form, and security requirement. Runs after FDD APPROVED as the final step of Phase 1 — before any technical design begins.

## Usage

```
/testplan {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Check Gate

Read `docs/{requirement-name}/fdd-review.md`.

If status is not `FDD APPROVED`, stop:
```
GATE BLOCKED
════════════
FDD review status is not FDD APPROVED.
Run /fdd-review {requirement-name} first.
```

## Step 3 — Read FDD

Read `docs/{requirement-name}/fdd.md` in full.

Extract from:
- §6 Object Inventory — all objects in scope (complexity drives test depth)
- §9 Form Design — every form and control to be tested
- §10 Field Mapping — validation rules, mandatory fields, defaults to verify
- §11 Business Rules and Validations — every Rule-ID with condition, action, error message, severity
- §12 Error Handling — every error scenario
- §13 Security Requirements — roles, menu items, privileges

## Step 4 — Generate Test Plan

Use `doc-templates/test-plan-template.md` as the structure. Generate all sections in a single pass.

### Test Strategy

- Approach: risk-based testing prioritised by business impact and object complexity
- Testing must start in DEV (unit / SIT), progress to TEST (SIT), then UAT
- Performance testing required for any Complex (L) or Very Complex (XL) object
- No UAT sign-off without all Critical and High defects resolved

### Test Types for D365 F&O

| Type | What to Test | Environment | Tool / Method |
|---|---|---|---|
| X++ Unit Test | Business logic class methods in isolation — each pseudocode path | DEV | `SysTestCase` framework (X++ unit tests) |
| SIT — Functional | End-to-end process flow per FDD §5, form interactions, field validations | TEST | Manual + test scripts |
| SIT — Integration | Data entity import/export, interface class inbound/outbound flows | TEST | DMF, DIXF, Postman |
| UAT | FDD business scenarios from business user perspective | UAT | Manual — business users |
| Security | Role-based access — which roles can access which forms, fields, and menu items | UAT | Manual per persona |
| Performance | Batch class throughput, large-dataset queries, report render time | TEST | Performance SDK / manual load |
| Regression | Existing D365 F&O functionality not broken by extensions | TEST | Existing regression suite |

### Test Coverage Rules

- Minimum 2 test cases per Rule-ID in FDD §11 (positive + negative path)
- Minimum 1 test case per form in FDD §9 (UI validation)
- 1 test case per security role in FDD §13
- 1 test case per error scenario in FDD §12
- For Complex / Very Complex objects: add performance test cases

### Test Cases Table

Generate a complete `| TC-ID | Rule/FR Ref | Type | Description | Pre-conditions | Steps | Expected Result | Priority | Environment |` table.

Format:
```
| TC-001 | BR-001 | SIT — Functional | Positive: {happy path description} | {setup required} | {numbered steps} | {expected outcome} | High | TEST |
| TC-002 | BR-001 | SIT — Functional | Negative: {error condition} | {setup} | {steps that trigger error} | Error message: "{exact text from FDD}" | High | TEST |
```

Assign TC-IDs sequentially (TC-001, TC-002, …). Group by Rule-ID. Include a row for every Rule-ID, every form, every security requirement, and every error scenario.

Include an `ALM ID` column in every test case table, initialised to `*(pending — set by /alm sync)*` for all rows.

### Test Data Requirements

For each test case grouping, list the master data, transactional data, and configuration that must exist before the test can run:

| Data Item | Type | Where to Create | Notes |
|---|---|---|---|
| `<data item>` | Master / Transactional / Configuration | `<D365 screen>` | `<any constraints>` |

Include a statement on sensitive data (PII, financial data) and how it is handled in non-PROD environments.

### Test Environment Strategy

| Test Type | Environment | Who Executes | Entry Criteria | Exit Criteria |
|---|---|---|---|---|
| X++ Unit Tests | DEV | Developer | Code compiles | All assertions pass, no exceptions |
| SIT — Functional | TEST | QA / Developer | SIT deployment complete | All High test cases pass |
| SIT — Integration | TEST | QA / Integration team | Integration config deployed | Data flows correctly end-to-end |
| UAT | UAT | Business users | UAT deployment, test data loaded | Business sign-off; no Critical/High open |
| Security Testing | UAT | QA | UAT deployment | All roles tested; no unauthorised access |
| Performance | TEST | Developer / QA | Performance harness configured | Meets SLA defined in FDD or TDD |

### Defect Severity Definitions

| Severity | Definition | Resolution Required Before |
|---|---|---|
| Critical | System crash, data corruption, security breach, blocking all users | SIT exit |
| High | Core business rule fails, incorrect data posted, blocking key users | UAT exit |
| Medium | Incorrect UI behaviour, non-blocking business rule failure | UAT exit |
| Low | Cosmetic, label, or minor UX issue | Next release (if accepted) |

### Roles and Responsibilities

| Role | Responsibility |
|---|---|
| Developer | X++ unit tests; SIT defect resolution |
| QA Engineer | SIT and regression test execution; defect logging |
| Integration Team | SIT integration test execution |
| Business Analyst | UAT test scenario preparation; business user coordination |
| Business User | UAT execution and sign-off |
| Technical Lead | Performance test oversight; defect severity escalation |

### Test Deliverables
After generating test cases, instruct the user that the following deliverables must be produced:

| Deliverable | Owner | Milestone |
|---|---|---|
| Test Plan (this document) | QA Lead | Before testing begins |
| Test Cases (all Rule-IDs covered) | QA Engineer | Before SIT |
| SIT Execution Report | QA Engineer | After each SIT cycle |
| Defect Report and Metrics | QA Lead | Weekly during testing |
| Traceability Matrix (Rule-ID → TC) | QA Lead | Before UAT |
| UAT Sign-Off Document | Business Lead | End of UAT |
| Performance Test Results | QA Engineer | Before UAT |
| Security Test Results | QA Engineer | Before UAT |

### NFR Test Coverage
Populate the NFR Test Coverage section using the FDD's performance SLAs and `constitution/11-nfr-targets.md`. Include at minimum: Performance, Security, Reliability, Usability.

### Test Suite Structure
After generating all test cases, count by phase and populate the Test Suite Structure table with estimated totals.

### Test Execution Summary
Initialise the Test Execution Summary table with totals per phase (X++ Unit, SIT-Functional, SIT-Integration, UAT, Security) and zero pass counts.

## Step 5 — Write Output

Generate all test cases in memory, grouped into suites before writing any file:
- X++ Unit Tests
- SIT — Functional
- SIT — Integration
- UAT
- Security
- Performance *(only if Complex or Very Complex objects exist in §6 of the FDD)*

Write the per-suite test case files using `doc-templates/test-case-suite-template.md`:
- `docs/{requirement-name}/test-cases/unit.md`
- `docs/{requirement-name}/test-cases/sit-functional.md`
- `docs/{requirement-name}/test-cases/sit-integration.md`
- `docs/{requirement-name}/test-cases/uat.md`
- `docs/{requirement-name}/test-cases/security.md`
- `docs/{requirement-name}/test-cases/performance.md` *(omit if no Complex/XL objects)*

Each file starts with a Suite Summary table, then the full test case detail table.

Write the main plan document:
- `docs/{requirement-name}/test-plan.md`
- §3 contains reference tables only (TC-ID, ALM ID, Rule-ID, Description, Priority) — no full detail rows.
- Each §3 subsection includes the relative file link, e.g., `[test-cases/sit-functional.md](test-cases/sit-functional.md)`.
- Populate the Traceability Matrix (§9) and Test Execution Summary (§12) from the generated test cases.

## Step 6 — Print Summary

```
TEST PLAN COMPLETE — {requirement-name}
════════════════════════════════════════
Test Cases : {N} total  (Unit:{n}  SIT-Functional:{n}  SIT-Integration:{n}  UAT:{n}  Security:{n}  Performance:{n})
Rule-IDs   : {N} covered
Forms      : {N} covered
Security   : {N} role scenarios covered
Files generated:
  docs/{requirement-name}/test-plan.md
  docs/{requirement-name}/test-cases/unit.md                ({n} cases)
  docs/{requirement-name}/test-cases/sit-functional.md      ({n} cases)
  docs/{requirement-name}/test-cases/sit-integration.md     ({n} cases)
  docs/{requirement-name}/test-cases/uat.md                 ({n} cases)
  docs/{requirement-name}/test-cases/security.md            ({n} cases)
  docs/{requirement-name}/test-cases/performance.md         ({n} cases / omitted)

Next step  : /tdd {requirement-name}  (if not already run)
```
