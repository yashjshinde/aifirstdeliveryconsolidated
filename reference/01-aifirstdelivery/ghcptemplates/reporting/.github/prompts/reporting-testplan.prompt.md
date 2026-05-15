---
mode: agent
description: "Generate a Reporting test plan - Data Accuracy, UAT, RLS Security, Regression. Triggers on: 'testplan', 'test plan'."
---

Generate a Test Plan and Strategy for a Reporting feature from an approved functional specification.

## Usage

```
/reporting-testplan {feature-name}
```

## Pre-condition Check

1. Read `specs/{feature-name}/review.md`.
2. If status is not `APPROVED`, stop: "Run /reporting-review first. Test planning requires an approved spec."

## Steps

3. Read `constitution/07-testing-standards.md`, `constitution/09-nfr-targets.md`, and `constitution/08-document-generation-rules.md`.
4. Read `specs/{feature-name}/spec.md` in full — extract: FR list, Report Catalogue, RLS roles, Business Rules, Personas.
5. Read `plans/{feature-name}/plan.md` if it exists — extract User Story references. If not, set all US-NNN fields to `*(pending — run /reporting-plan first)*`.
6. Derive module codes from spec module headings (2–4 uppercase letters, e.g., `SALES` for Sales Reports, `RLS` for Security).

7. Generate all test case cards grouped into four suites:
   - `docs-generated/{feature-name}/test-cases/data-accuracy.md` — data accuracy and measure validation
   - `docs-generated/{feature-name}/test-cases/uat.md` — UAT scenarios for business users
   - `docs-generated/{feature-name}/test-cases/rls-security.md` — one test per RLS role (happy path + exclusion path + empty state)
   - `docs-generated/{feature-name}/test-cases/regression.md` — regression test cases

8. Write the main plan document to `docs-generated/{feature-name}/test-plan-and-strategy.md`.

9. Print summary:
   ```
   TEST PLAN COMPLETE — {feature-name}
   ════════════════════════════════════
   Reports      : {N} reports covered
   FRs          : {N} requirements covered
   RLS Roles    : {N} roles tested
   Cases        : {total} (P1:{n} P2:{n} P3:{n})
   Files generated:
     docs-generated/{feature-name}/test-plan-and-strategy.md
     docs-generated/{feature-name}/test-cases/data-accuracy.md    ({n} cases)
     docs-generated/{feature-name}/test-cases/uat.md              ({n} cases)
     docs-generated/{feature-name}/test-cases/rls-security.md     ({n} cases)
     docs-generated/{feature-name}/test-cases/regression.md       ({n} cases)
   ```

## Test Types for Reporting

| Type | What to Test | Who Runs It |
|---|---|---|
| Data Accuracy | Report values match source system; measure correctness | Developer + Data Engineer |
| RLS / Security | Each role sees correct data; no role sees another's data; empty state | Developer + QA |
| UAT | Business users validate KPIs, filters, navigation, export | Business Users |
| Performance | Report load time against NFR targets; refresh window | Developer |
| Regression | Existing reports unaffected by dataset schema changes | QA |

## Test Case Card Format

```
### TC-{MODULE}-{NNN}: {Title}

| Field | Value |
|---|---|
| **TC ID** | TC-{MODULE}-{NNN} |
| **ALM ID** | *(pending — set by /reporting-alm sync)* |
| **Priority** | {1 \| 2 \| 3} |
| **Assigned To** | {BI Developer \| QA Engineer \| Business User} |
| **Test Type** | {Data Accuracy \| RLS \| UAT \| Performance \| Regression} |
| **Mapped FR** | FR-{NNN} |
| **Report** | {Report name} |
| **Measure / Role** | {Measure name or RLS role name} |

**Preconditions:**
- {prerequisite}

**Test Steps:**
| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | {action} | {expected result} |

**Post-conditions:**
- {what must be true after the test}

**Test Data:**
- {specific values, date ranges, or data set reference}
```

## Coverage Requirements

- Minimum 2 test cases per FR: 1 × Data Accuracy (happy path) + 1 × Negative.
- Each RLS role → 3 test cases: happy path + exclusion path + empty state.
- Each Business Rule → 1 × Negative test verifying the rule/calculation fires correctly.
- Each report page → 1 × UAT scenario validating the visuals and filters.
- Performance: 1 test per report measuring load time against `constitution/09-nfr-targets.md`.
