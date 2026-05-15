---
feature: {feature-name}
document-type: Test Cases — {Suite Name}
suite: {system-integration | uat | security | regression}
date: {YYYY-MM-DD}
version: 1.0
test-plan-ref: docs-generated/{feature-name}/test-plan-and-strategy.md
author: Claude Code (/testplan)
---

# Test Cases — {Suite Name}: {Feature Display Name}

> **Back to Test Plan:** [test-plan-and-strategy.md](../test-plan-and-strategy.md)

---

## Suite Summary

| TC ID | ALM ID | Title | Priority | Mapped FR | User Story |
|---|---|---|---|---|---|
| TC-{MODULE}-{NNN} | *(pending)* | {title} | {1\|2\|3} | FR-{NNN} | US-{NNN} |

**Total:** {n} test cases — P1: {n} \| P2: {n} \| P3: {n}

---

## Test Case Cards

---

### TC-{MODULE}-{NNN}: {Test Case Title}

| Field | Value |
|---|---|
| **TC ID** | TC-{MODULE}-{NNN} |
| **ALM ID** | *(pending — set by `/alm sync`)* |
| **Area Path** | {project}\{Feature}\{Suite} |
| **Iteration Path** | {project}\Sprint {N} |
| **Priority** | {1 \| 2 \| 3 \| 4} |
| **Assigned To** | {QA Engineer \| Business User} |
| **State** | Design |
| **Automation** | Manual |
| **Test Type** | {System \| Integration \| UAT \| Security \| Regression} |
| **Mapped FR** | FR-{NNN} |
| **User Story** | US-{NNN} |

**Preconditions:**
- {Prerequisite 1 — e.g., Solution deployed to Test environment (managed)}
- {Prerequisite 2 — e.g., Test data seeded: {specific records and values}}
- {Prerequisite 3 — e.g., User logged in as: {Persona / Security Role}}

**Test Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | {Action} | {Expected result} |
| 2 | {Action} | {Expected result} |
| 3 | {Action} | {Expected result} |

**Post-conditions:**
- {What must be true after the test completes}

**Test Data:**
- {Entity}: {field} = {specific value}

**Notes:**
- {SLA targets from `constitution/11-nfr-targets.md` where applicable}
- {Cross-test dependencies or ordering constraints}

---

*(Repeat card for each test case in this suite)*
