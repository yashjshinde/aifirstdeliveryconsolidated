---
requirement: {requirement-name}
document-type: Test Cases — {Suite Name}
suite: {unit | sit-functional | sit-integration | uat | security | performance}
date: {YYYY-MM-DD}
version: 1.0
test-plan-ref: docs/{requirement-name}/test-plan.md
author: Claude Code (/testplan)
---

# Test Cases — {Suite Name}: {Requirement Display Name}

> **Back to Test Plan:** [test-plan.md](../test-plan.md)

---

## Suite Summary

| TC-ID | ALM ID | Rule-ID / Ref | Description | Priority |
|---|---|---|---|---|
| TC-{TYPE}001 | *(pending)* | BR-001 | {title} | {Critical\|High\|Medium} |

**Total:** {n} test cases — Critical: {n} \| High: {n} \| Medium: {n}

---

## Test Cases

| TC-ID | ALM ID | Rule-ID / Ref | Type | Description | Pre-conditions | Steps | Expected Result | Priority | Environment | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-001 | *(pending)* | BR-001 | {Type} | {description} | {setup} | {numbered steps} | {expected outcome} | High | TEST | Not Run |

---

### Column reference by suite type

**X++ Unit Tests:** `TC-ID | ALM ID | Class / Method | Test Scenario | Expected Assertion | Priority`

**SIT — Functional:** `TC-ID | ALM ID | Rule-ID / Form Ref | Description | Pre-conditions | Steps | Expected Result | Priority | Environment | Status`

**SIT — Integration:** `TC-ID | ALM ID | Entity / Interface | Direction | Description | Pre-conditions | Steps | Expected Result | Priority | Status`

**UAT:** `TC-ID | ALM ID | Rule-ID / FR Ref | Business Scenario | Steps (plain language) | Expected Business Outcome | Priority`

**Security:** `TC-ID | ALM ID | Role | Form / Menu Item | Expected Access | Actual (fill in) | Priority`

**Performance:** `TC-ID | ALM ID | Object | Scenario | Load / Volume | SLA Target | Tool | Priority`
