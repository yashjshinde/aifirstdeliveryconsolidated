Generate the Test Plan and Strategy for a migration.

## Usage

```
/testplan {migration-id}
```

## Pre-condition

`specs/{migration-id}/review.md` must be **APPROVED**.

## Steps

1. Read ALL files in `constitution/` — especially `08-testing-standards.md`.
2. Verify review is APPROVED.
3. Read `specs/{migration-id}/spec.md`.
4. Read `docs-generated/{migration-id}/field-mapping.md` if it exists.
5. Generate `docs-generated/{migration-id}/test-plan-and-strategy.md`.

## test-plan-and-strategy.md Structure

### Header

```markdown
# Test Plan and Strategy — {migration-id}

**Version:** 1.0
**Date:** {today}
**Author:** Data Migration Agent
**Status:** DRAFT
**Plan ALM ID:** *(pending)*

---
```

### Section 1 — Overview

Direction, entity, scope of testing.

### Section 2 — Test Strategy

| Level | Scope | Owner | Environment | Criteria |
|---|---|---|---|---|
| Unit | SP logic, data flow transforms | Developer | Dev | All SPs pass with test data |
| Component | Single pipeline end-to-end | Developer | Dev | Happy path + error path |
| SIT | Full migration flow | QA | Test | All TC-DM-SIT pass |
| UAT | Business data validation | Business Analyst | Test | All TC-DM-UAT pass |
| Performance | Volume test | QA/Ops | Test | Benchmark targets met |
| Regression | Re-run after changes | QA | Test | No regressions |

### Section 3 — Test Suites

For each suite, provide:
```
Suite: {Suite Name}
Suite ALM ID: *(pending)*
Description: {purpose}
```

Standard suites:
- **DM-SIT — System Integration Tests** (pipeline end-to-end)
- **DM-UAT — User Acceptance Tests** (business validation)
- **DM-PERF — Performance Tests** (volume / throughput)
- **DM-SEC — Security Tests** (auth, encryption, masking)
- **DM-REG — Regression Tests** (change-safety)

### Section 4 — Test Cases

For each test case, generate a full card following `constitution/08-testing-standards.md`:

Minimum test cases:

**DM-SIT Suite:**
- TC-DM-SIT-01: Happy path — valid file processed end-to-end
- TC-DM-SIT-02: Empty file handling
- TC-DM-SIT-03: Partial success — mix of valid and invalid records
- TC-DM-SIT-04: All invalid records — pipeline completes with PARTIAL status
- TC-DM-SIT-05: File not found — pipeline handles gracefully
- TC-DM-SIT-06: Duplicate alternate key — upsert last-wins behaviour
- TC-DM-SIT-07: Re-run idempotency — same run_id produces same result
- TC-DM-SIT-08: Source system unavailable — retry and alerting
- TC-DM-SIT-09: Large file (>10K records) — pipeline completes in time window
- TC-DM-SIT-10: Archive — processed file moved to archive folder

**DM-UAT Suite:**
- TC-DM-UAT-01: All mapped fields appear correctly in target with correct values
- TC-DM-UAT-02: Required fields are populated
- TC-DM-UAT-03: Lookup/reference fields resolve correctly
- TC-DM-UAT-04: Date fields formatted correctly in target
- TC-DM-UAT-05: Audit log record created for each run
- TC-DM-UAT-06: Error table populated with correct error codes for invalid records

**DM-SEC Suite:**
- TC-DM-SEC-01: Unauthenticated access to SFTP returns connection failure
- TC-DM-SEC-02: PII fields not visible in ADF activity logs
- TC-DM-SEC-03: Key Vault secret accessed (not stored in ADF parameter)

**Additional test cases** as needed for specific business rules from the spec (Section 8 — Data Quality Rules).

### Section 5 — Test Data Requirements

| File / Dataset | Purpose | Location |
|---|---|---|
| `{entity}_test_happy_{date}.csv` | Happy path | `output/{migration-id}/tests/data/` |
| `{entity}_test_partial_{date}.csv` | Partial success | `output/{migration-id}/tests/data/` |
| `{entity}_test_allinvalid_{date}.csv` | All invalid | `output/{migration-id}/tests/data/` |
| `{entity}_test_empty_{date}.csv` | Empty file | `output/{migration-id}/tests/data/` |
| Dataverse seed records | UAT setup | Manually inserted into test environment |

### Section 6 — Entry and Exit Criteria

**Entry (before SIT):**
- ADF pipelines deployed to test environment
- SQL staging tables and SPs deployed
- Test data files available on test SFTP
- Linked services connectivity verified

**Exit (after SIT):**
- All TC-DM-SIT pass
- No FAIL severity open defects
- Performance benchmarks met

**Entry (before UAT):**
- SIT exit criteria met

**Exit (after UAT):**
- All TC-DM-UAT pass
- Business sign-off obtained

### Section 7 — Defect Management

Defects logged as Bugs in ADO linked to the test case.
Priority 1 and 2 defects block go-live.

---

## Output

Write `docs-generated/{migration-id}/test-plan-and-strategy.md`.

Print:

```
TEST PLAN WRITTEN — {migration-id}
════════════════════════════════════════
File        : docs-generated/{migration-id}/test-plan-and-strategy.md
Suites      : {N}
Test Cases  : {N} total ({N} SIT, {N} UAT, {N} SEC)

Next step: /plan {migration-id}
```
