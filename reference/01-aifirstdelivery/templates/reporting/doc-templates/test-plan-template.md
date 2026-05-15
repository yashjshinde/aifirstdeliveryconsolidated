---
feature: {feature-name}
document-type: Test Plan and Strategy
date: {YYYY-MM-DD}
status: DRAFT | UNDER REVIEW | APPROVED
version: 1.0
spec-ref: specs/{feature-name}/spec.md
author: Claude Code (/testplan)
approver: {QA Lead / Test Manager}
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
| BI Lead | | | | Pending |
| QA Lead | | | | Pending |
| Project Manager | | | | Pending |

---

## Table of Contents

- [1. Test Strategy](#1-test-strategy)
- [2. Test Suite Structure](#2-test-suite-structure)
- [3. Test Scope](#3-test-scope)
- [4. Test Environments](#4-test-environments)
- [5. Test Cases](#5-test-cases)
  - [5.1 Data Accuracy Tests](#51-data-accuracy-tests)
  - [5.2 UAT Test Cases](#52-uat-test-cases)
  - [5.3 RLS Security Tests](#53-rls-security-tests)
  - [5.4 Regression Tests](#54-regression-tests)
- [6. Test Data Requirements](#6-test-data-requirements)
- [7. Entry and Exit Criteria](#7-entry-and-exit-criteria)
- [8. Defect Management](#8-defect-management)
- [9. Roles and Responsibilities](#9-roles-and-responsibilities)
- [10. Test Deliverables](#10-test-deliverables)
- [11. Non-Functional Test Coverage](#11-non-functional-test-coverage)
- [12. Traceability Matrix](#12-traceability-matrix)
- [13. Test Execution Summary](#13-test-execution-summary)

---

## 1. Test Strategy

### Approach
Risk-based testing prioritised by business impact and data correctness. Data accuracy tests are run first — reports are only valid if the underlying numbers are correct. RLS tests are mandatory before UAT promotion.

### Test Types

| Type | Purpose | Suite |
|---|---|---|
| Data Accuracy | Validate KPIs, measures, and aggregations against source data | TS-001 |
| UAT | Business users validate report usability, layout, and interactions | TS-002 |
| RLS Security | Validate row-level security — each role sees only permitted data | TS-003 |
| Regression | Protect existing reports/datasets from unintended changes | TS-004 |

---

## 2. Test Suite Structure

| Suite ID | Suite Name | File | TC Count | Assigned To |
|---|---|---|---|---|
| TS-001 | Data Accuracy | [data-accuracy.md](test-cases/data-accuracy.md) | {n} | QA Engineer |
| TS-002 | UAT | [uat.md](test-cases/uat.md) | {n} | Business User / BA |
| TS-003 | RLS Security | [rls-security.md](test-cases/rls-security.md) | {n} | QA Engineer |
| TS-004 | Regression | [regression.md](test-cases/regression.md) | {n} | QA Engineer |

---

## 3. Test Scope

### In Scope

- {All Power BI reports listed in the Report Catalogue}
- {Dataset measures and calculated columns}
- {RLS roles — all personas defined in the spec}
- {Refresh schedule and incremental refresh}

### Out of Scope

- {Power BI Service administration (capacity configuration)}
- {Source system data quality (owned by upstream team)}
- {Performance testing at > {N} concurrent users (covered by NFR test)}

---

## 4. Test Environments

| Environment | Purpose | Dataset Refresh | Access |
|---|---|---|---|
| DEV | Developer testing — data accuracy and measure validation | Manual | BI team |
| UAT | Business acceptance — full test suite execution | Scheduled | QA, BA, Business users |
| PROD | Smoke test post-deployment | Scheduled | QA (read-only) |

---

## 5. Test Cases

### 5.1 Data Accuracy Tests

See [test-cases/data-accuracy.md](test-cases/data-accuracy.md) for full test case cards.

| TC ID | ALM ID | Title | Priority | Mapped FR |
|---|---|---|---|---|
| TC-{MODULE}-DA-001 | *(pending)* | {Total Revenue measure matches source} | 1 | FR-001 |
| TC-{MODULE}-DA-002 | *(pending)* | {YTD Revenue calculation correct} | 1 | FR-002 |

### 5.2 UAT Test Cases

See [test-cases/uat.md](test-cases/uat.md) for full test case cards.

| TC ID | ALM ID | Title | Priority | Mapped FR |
|---|---|---|---|---|
| TC-{MODULE}-UAT-001 | *(pending)* | {Sales Manager can view all regions} | 1 | FR-003 |
| TC-{MODULE}-UAT-002 | *(pending)* | {Date slicer filters all visuals correctly} | 2 | FR-004 |

### 5.3 RLS Security Tests

See [test-cases/rls-security.md](test-cases/rls-security.md) for full test case cards.

| TC ID | ALM ID | Title | Priority | Mapped FR |
|---|---|---|---|---|
| TC-{MODULE}-RLS-001 | *(pending)* | {Sales Rep sees only own opportunities} | 1 | FR-005 |
| TC-{MODULE}-RLS-002 | *(pending)* | {Territory Manager sees assigned territory data only} | 1 | FR-005 |

### 5.4 Regression Tests

See [test-cases/regression.md](test-cases/regression.md) for full test case cards.

| TC ID | ALM ID | Title | Priority | Mapped FR |
|---|---|---|---|---|
| TC-{MODULE}-R-001 | *(pending)* | {Existing reports unaffected by dataset schema change} | 2 | — |

---

## 6. Test Data Requirements

| Dataset | Required Records | Notes |
|---|---|---|
| {Opportunity} | {Min 100 records across 3 territories, 5 reps, 12 months} | {Seed in UAT environment before testing} |
| {User accounts} | {1 per RLS role (Sales Rep, Territory Manager, Executive)} | {Named test users with known UPN} |
| {Territory mapping} | {3 territories with assigned users} | {Required for RLS Territory Manager role test} |

---

## 7. Entry and Exit Criteria

### Entry Criteria

| Level | Entry Condition |
|---|---|
| Data Accuracy | Dataset deployed to UAT; source data seeded |
| UAT | Data accuracy tests passed; reports published to UAT workspace |
| RLS Security | Reports published; test user accounts provisioned with correct RLS roles |
| Regression | All new features deployed; existing reports verified accessible |

### Exit Criteria

| Level | Exit Condition |
|---|---|
| Data Accuracy | All P1 test cases PASS; P2 defects logged and triaged |
| UAT | Business sign-off received; no P1 or P2 open defects |
| RLS Security | All RLS test cases PASS (100% mandatory) |
| Regression | No regression defects; existing reports render correctly |

---

## 8. Defect Management

| Severity | Definition | Response |
|---|---|---|
| P1 — Critical | Wrong numbers; data not loading; RLS bypass | Fix before UAT promotion |
| P2 — High | Missing visual; interaction broken; refresh failing | Fix within sprint |
| P3 — Medium | Layout issue; label formatting; minor UX | Fix or accept as known issue |
| P4 — Low | Cosmetic; typo; colour inconsistency | Backlog |

---

## 9. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| BI Developer | Fix defects; deploy fixes to UAT |
| QA Engineer | Execute data accuracy, RLS, regression tests; log defects |
| Business User / BA | Execute UAT test cases; sign off |
| BI Lead | Review and approve test plan; release sign-off |

---

## 10. Test Deliverables

| Deliverable | Location |
|---|---|
| Test Plan | `docs-generated/{feature}/test-plan-and-strategy.md` |
| Data Accuracy suite | `docs-generated/{feature}/test-cases/data-accuracy.md` |
| UAT suite | `docs-generated/{feature}/test-cases/uat.md` |
| RLS Security suite | `docs-generated/{feature}/test-cases/rls-security.md` |
| Regression suite | `docs-generated/{feature}/test-cases/regression.md` |
| ALM extract (JSON) | `docs-generated/{feature}/alm-extract/test-plan-extract.json` |
| ALM extract (CSV) | `docs-generated/{feature}/alm-extract/test-plan-extract.csv` |

---

## 11. Non-Functional Test Coverage

| NFR | Test Approach | Pass Criteria |
|---|---|---|
| Dashboard load time | Measure load time in UAT (Chrome DevTools / Performance Analyzer) | < 3 seconds |
| Paginated report render | Time end-to-end render in UAT | < 10 seconds |
| Data refresh | Verify scheduled refresh completes | Completes by 07:00 UTC daily |
| Concurrent users | Verify {N} simultaneous report views do not degrade performance | No timeout errors |

---

## 12. Traceability Matrix

| FR | FR Title | Data Accuracy | UAT | RLS Security | Regression |
|---|---|---|---|---|---|
| FR-001 | {Total Revenue} | TC-{M}-DA-001 | TC-{M}-UAT-001 | — | TC-{M}-R-001 |
| FR-005 | {Territory RLS} | — | — | TC-{M}-RLS-001, TC-{M}-RLS-002 | — |

---

## 13. Test Execution Summary

*(Completed after test execution — populated during testing)*

| Suite | Total | PASS | FAIL | BLOCKED | SKIP |
|---|---|---|---|---|---|
| Data Accuracy | | | | | |
| UAT | | | | | |
| RLS Security | | | | | |
| Regression | | | | | |
| **Total** | | | | | |
