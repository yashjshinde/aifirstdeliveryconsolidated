---
feature: {feature-name}
document-type: Test Plan and Strategy
date: {YYYY-MM-DD}
status: DRAFT | UNDER REVIEW | APPROVED
version: 1.0
spec-ref: specs/{feature-name}/spec.md
author: Claude Code (/testplan)
approver: {QA Lead}
---

# Test Plan and Strategy — {Feature Display Name}

---

## Document Control

### Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/testplan) | Initial draft |

### Approvals

| Role | Name | Signature | Date | Status |
|---|---|---|---|---|
| Business Owner | | | | Pending |
| IT Lead | | | | Pending |
| Solution Architect | | | | Pending |
| Project Manager | | | | Pending |

---

## Table of Contents

- [1. Test Strategy](#1-test-strategy)
- [2. Test Scope](#2-test-scope)
- [3. Test Types and Cases](#3-test-types-and-cases)
  - [3.1 Canvas App Tests](#31-canvas-app-tests-power-apps-test-studio)
  - [3.2 Model-Driven App Tests](#32-model-driven-app-tests)
  - [3.3 Power Automate Flow Tests](#33-power-automate-flow-tests)
  - [3.4 Copilot Studio Tests](#34-copilot-studio-tests)
  - [3.5 Security Tests](#35-security-tests)
  - [3.6 UAT Test Cases](#36-uat-test-cases)
  - [3.7 Regression Tests](#37-regression-tests)
- [4. Test Data Requirements](#4-test-data-requirements)
- [5. Test Environments](#5-test-environments)
- [6. Exit Criteria](#6-exit-criteria)
- [7. Test Suite Structure](#7-test-suite-structure)
- [8. Test Deliverables](#8-test-deliverables)
- [9. Non-Functional Test Coverage](#9-non-functional-test-coverage)
- [10. Traceability Matrix](#10-traceability-matrix)
- [11. Test Execution Summary](#11-test-execution-summary)

---

## 1. Test Strategy

Risk-based: prioritise by user-facing impact, data integrity, and delegation boundary risks.
Key risk areas: canvas delegation failures, flow silent failures, security role misconfiguration.

---

## 2. Test Scope

### In Scope
| FR Reference | Component | Test Types |
|---|---|---|
| FR-001 | `{ScreenName}` | Canvas, Security, UAT |
| FR-002 | `{FlowName}` | Flow Happy, Flow Error |

### Out of Scope
- Power Platform infrastructure (Microsoft responsibility)
- Dataverse replication to Azure SQL (platform feature)

### Constraints
- Test Studio requires Power Apps Premium licence
- Delegation boundary tests require > 500 test records

---

## 3. Test Types and Cases

> Full test case tables are maintained in separate files under `docs-generated/{feature-name}/test-cases/`.
> Each section below is a reference index for that suite. Click the file link to view all test case detail.

### 3.1 Canvas App Tests

**File:** [test-cases/canvas.md](test-cases/canvas.md)

| TC-ID | ALM ID | FR Ref | Screen | Scenario | Priority |
|---|---|---|---|---|---|
| TC-CA001 | *(pending)* | FR-001 | `{scrName}` | {Scenario title} | Critical |

### 3.2 Model-Driven App Tests

**File:** [test-cases/model-driven.md](test-cases/model-driven.md)

| TC-ID | ALM ID | FR Ref | Form / View | Scenario | Priority |
|---|---|---|---|---|---|
| TC-MD001 | *(pending)* | FR-002 | `{Entity} — {Form}` | {Scenario title} | Critical |

### 3.3 Power Automate Flow Tests

**File:** [test-cases/flow.md](test-cases/flow.md)

| TC-ID | ALM ID | FR Ref | Flow | Scenario | Priority |
|---|---|---|---|---|---|
| TC-FL001 | *(pending)* | FR-003 | `{FlowName}` | {Scenario title} | Critical |

### 3.4 Copilot Studio Tests *(if applicable)*

**File:** [test-cases/copilot.md](test-cases/copilot.md)

| TC-ID | ALM ID | Topic | Scenario | Priority |
|---|---|---|---|---|
| TC-CO001 | *(pending)* | `{TopicName}` | {Scenario title} | Critical |

### 3.5 Security Tests

**File:** [test-cases/security.md](test-cases/security.md)

| TC-ID | ALM ID | Persona | Role | What Is Tested | Priority |
|---|---|---|---|---|---|
| TC-SEC001 | *(pending)* | {Persona} | {Role} | {Test title} | Critical |

### 3.6 UAT Test Cases

**File:** [test-cases/uat.md](test-cases/uat.md)

| TC-ID | ALM ID | FR Ref | Persona | Description | Priority |
|---|---|---|---|---|---|
| TC-U001 | *(pending)* | FR-001 | {Persona} | {Description} | Critical |

### 3.7 Regression Tests

**File:** [test-cases/regression.md](test-cases/regression.md)

| TC-ID | ALM ID | Existing Feature | Risk | Priority |
|---|---|---|---|---|
| TC-R001 | *(pending)* | {Existing screen/flow} | {Risk} | High |

---

## 4. Test Data Requirements

| Data Item | Entity | Quantity | Notes |
|---|---|---|---|
| Active records for gallery | {Entity} | 600+ | Needed for delegation boundary test |
| Test users per persona | SystemUser | {N} | One per security role |
| Synthetic PII | Contact | 20 | Anonymised names and emails |

---

## 5. Test Environments

| Type | Environment | Solution Type |
|---|---|---|
| Component | Developer env | Unmanaged |
| Integration | Test environment | Managed |
| UAT | UAT environment | Managed, business-user access |

---

## 6. Exit Criteria

| Level | Criteria |
|---|---|
| Canvas / MDA | Test Studio: 100% pass; 0 delegation failures |
| Flow | All happy + error path tests pass |
| Security | All personas tested, 0 unauthorised access |
| Accessibility | 0 WCAG 2.1 AA failures |
| UAT | Business sign-off, 0 Critical/High defects |

---

## 7. Test Suite Structure

| Component | Test Type | Est. Cases | Critical | High | Medium |
|---|---|---|---|---|---|
| Canvas App | Canvas | {n} | {n} | {n} | {n} |
| Model-Driven App | MDA | {n} | {n} | {n} | {n} |
| Power Automate | Flow | {n} | {n} | {n} | {n} |
| Copilot Studio | Copilot | {n} | {n} | {n} | {n} |
| Security | Security | {n} | {n} | {n} | {n} |
| UAT | UAT | {n} | {n} | {n} | {n} |
| Regression | Regression | {n} | {n} | {n} | {n} |
| **Total** | | **{n}** | **{n}** | **{n}** | **{n}** |

---

## 8. Test Deliverables

| Deliverable | Owner | Milestone |
|---|---|---|
| Test Plan (this document) | QA Lead | Before testing begins |
| Test Cases by component | QA Engineer | Before test execution |
| Test Execution Report (per sprint) | QA Engineer | After each sprint |
| Defect Report and Metrics | QA Lead | Weekly during testing |
| Traceability Matrix (FR → TC) | QA Lead | Before UAT |
| UAT Sign-Off Document | Business User | End of UAT |
| Accessibility Test Results | QA Engineer | Before UAT |
| Security Test Results | QA Engineer | Before UAT |

---

## 9. Non-Functional Test Coverage

| NFR Category | Test Approach | Tool / Method | Acceptance Criteria |
|---|---|---|---|
| Performance | Canvas screen load, flow duration, delegation boundary | Power Apps Monitor + Azure Load Testing | Per `constitution/11-nfr-targets.md` |
| Scalability | Gallery with > 500 records; delegation boundary behaviour | Manual with seeded data | No delegation failures; correct records returned |
| Security | Role-based access per security matrix, field masking | Manual per persona | No unauthorised records or screens accessible |
| Reliability | Flow failure, connector timeout, error handling | Fault injection in editor | Error handled gracefully; ops notified |
| Usability | UAT feedback on navigation and error messages | UAT execution | 90%+ task completion without assistance; < 5 critical usability defects |
| Accessibility | Keyboard navigation, screen reader, colour contrast | Manual + axe tool | 0 WCAG 2.1 AA failures |

---

## 10. Traceability Matrix

| FR Reference | FR Title | Component | Test Case IDs | Test Types | Priority |
|---|---|---|---|---|---|
| FR-001 | {title} | `{ScreenName}` | TC-CA001, TC-SEC001, TC-U001 | Canvas, Security, UAT | Critical |
| FR-002 | {title} | `{FlowName}` | TC-FL001, TC-FL002 | Flow-Happy, Flow-Error | High |

*(Every FR-NNN must appear at least once)*

---

## 11. Test Execution Summary

| Component | Total | Passed | Failed | Blocked | Not Run | Pass % |
|---|---|---|---|---|---|---|
| Canvas App | {n} | 0 | 0 | 0 | {n} | 0% |
| Model-Driven App | {n} | 0 | 0 | 0 | {n} | 0% |
| Power Automate | {n} | 0 | 0 | 0 | {n} | 0% |
| Copilot Studio | {n} | 0 | 0 | 0 | {n} | 0% |
| Security | {n} | 0 | 0 | 0 | {n} | 0% |
| UAT | {n} | 0 | 0 | 0 | {n} | 0% |
| Regression | {n} | 0 | 0 | 0 | {n} | 0% |
| **Total** | **{n}** | **0** | **0** | **0** | **{n}** | **0%** |

*(Updated by QA Engineer after each test execution cycle)*
