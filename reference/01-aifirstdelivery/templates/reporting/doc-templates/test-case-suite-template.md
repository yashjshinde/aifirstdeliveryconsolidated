---
feature: {feature-name}
document-type: Test Cases — {Suite Name}
suite: {data-accuracy | uat | rls-security | regression}
date: {YYYY-MM-DD}
version: 1.0
test-plan-ref: docs-generated/{feature-name}/test-plan-and-strategy.md
author: Claude Code (/testplan)
---

# Test Cases — {Suite Name}: {Feature Display Name}

> **Back to Test Plan:** [test-plan-and-strategy.md](../test-plan-and-strategy.md)

---

## Suite Summary

| TC ID | ALM ID | Title | Priority | Mapped FR | Assigned To |
|---|---|---|---|---|---|
| TC-{MODULE}-{TYPE}-{NNN} | *(pending)* | {title} | {1\|2\|3} | FR-{NNN} | {QA Engineer \| Business User} |

**Total:** {n} test cases — P1: {n} \| P2: {n} \| P3: {n}

> **TC ID convention:**
> - Data Accuracy: `TC-{MODULE}-DA-{NNN}`
> - UAT: `TC-{MODULE}-UAT-{NNN}`
> - RLS Security: `TC-{MODULE}-RLS-{NNN}`
> - Regression: `TC-{MODULE}-R-{NNN}`
> MODULE = 2–4 letter code from spec headings (e.g., SALES, INV, HR)

---

## Test Case Cards

---

### TC-{MODULE}-{TYPE}-{NNN}: {Test Case Title}

| Field | Value |
|---|---|
| **TC ID** | TC-{MODULE}-{TYPE}-{NNN} |
| **ALM ID** | *(pending — set by `/alm sync-testplan`)* |
| **Suite** | {Data Accuracy \| UAT \| RLS Security \| Regression} |
| **Area Path** | {project}\{Feature}\{Suite} |
| **Iteration Path** | {project}\Sprint {N} |
| **Priority** | {1 \| 2 \| 3 \| 4} |
| **Assigned To** | {QA Engineer \| Business User} |
| **State** | Design |
| **Automation** | Manual |
| **Test Type** | {Data Accuracy \| UAT \| RLS Security \| Regression} |
| **Mapped FR** | FR-{NNN} |
| **User Story** | US-{NNN} |

**Preconditions:**
- {Dataset deployed to UAT workspace and refresh completed}
- {Test data seeded: {specific records, values, date range}}
- {User logged in as: {Persona / RLS Role — e.g., Sales Rep with UPN test.rep@contoso.com}}

**Test Steps:**

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | {Navigate to Power BI workspace and open {Report Name}} | {Report opens without error; loading time < 3 seconds} |
| 2 | {Apply date slicer: {date range}} | {All visuals update to reflect the selected date range} |
| 3 | {Verify {KPI / measure / visual} value} | {Value matches {source query / expected result: {value}}} |

**Post-conditions:**
- {Report returns to default state on next load}
- {No errors in Power BI Performance Analyzer}

**Test Data:**

| Field | Value |
|---|---|
| {Date Range} | {2025-01-01 to 2025-12-31} |
| {Expected Total Revenue} | {£1,234,567.00 — from source query: `SELECT SUM(revenue) FROM fact_opportunity WHERE ...`} |
| {User UPN} | {test.salesrep@contoso.com} |

**Notes / Special Conditions:**
{Any known limitations, browser requirements, or environment-specific notes.}

---

*(Repeat card block for each test case in this suite)*
