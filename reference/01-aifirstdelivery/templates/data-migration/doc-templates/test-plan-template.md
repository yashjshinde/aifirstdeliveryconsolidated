# Test Plan and Strategy — {migration-id}

**Version:** 1.0
**Date:** {date}
**Author:** Data Migration Agent
**Status:** DRAFT
**Plan ALM ID:** *(pending)*

---

## 1. Overview

| Field | Value |
|---|---|
| Migration | {migration-id} |
| Direction | {direction} |
| Entity | {entity} |
| Test Scope | End-to-end pipeline, data quality, security, performance |

---

## 2. Test Strategy

| Level | Scope | Owner | Environment | Pass Criteria |
|---|---|---|---|---|
| Unit | SP logic, data flow transforms | Developer | Dev | All SPs execute without error |
| Component | Single ADF pipeline with test data | Developer | Dev | Happy path + error path pass |
| SIT | Full migration flow | QA | Test | All TC-DM-SIT pass |
| UAT | Business data validation | Business Analyst | Test | All TC-DM-UAT pass, BA sign-off |
| Performance | Volume test | QA/Ops | Test | Benchmarks met |
| Regression | Re-run after changes | QA | Test | No regressions |

---

## 3. Test Suites

### Suite: DM-SIT — System Integration Tests
**Suite ALM ID:** *(pending)*
End-to-end pipeline validation using test data files.

### Suite: DM-UAT — User Acceptance Tests
**Suite ALM ID:** *(pending)*
Business data validation — field values correct in target.

### Suite: DM-PERF — Performance Tests
**Suite ALM ID:** *(pending)*
Volume and throughput benchmarks.

### Suite: DM-SEC — Security Tests
**Suite ALM ID:** *(pending)*
Authentication, PII handling, encryption verification.

### Suite: DM-REG — Regression Tests
**Suite ALM ID:** *(pending)*
Re-run after any change to pipelines, SPs, or mappings.

---

## 4. Test Cases

### DM-SIT Suite

---

#### TC-DM-SIT-01 — Happy path end-to-end

**Direction:** {direction}
**Entity:** {entity}
**ALM ID:** *(pending)*

**Pre-conditions:**
- Test file `{entity}_test_happy_{YYYYMMDD}.csv` uploaded to `{sftp-path}`
- Staging tables empty for test run_id

**Steps:**
1. Trigger `PL_ORCH_{Entity}` manually with `batchDate = {today}`
2. Wait for pipeline completion
3. Query `audit.migration_run` for run status
4. Query `stg.{entity}_stage` for record counts
5. Verify records in target system

**Expected Results:**
- Pipeline run status = Succeeded
- `audit.migration_run`: status = 'SUCCESS', error_records = 0
- `stg.{entity}_stage`: all records validation_status = 'VALID'
- Source file moved to archive folder
- Target system contains expected records

---

#### TC-DM-SIT-02 — Empty file handling

**ALM ID:** *(pending)*

**Pre-conditions:** Empty CSV (header only) uploaded

**Steps:**
1. Trigger pipeline with empty test file
2. Monitor pipeline run

**Expected Results:**
- Pipeline completes (Succeeded or with PARTIAL)
- `audit.migration_run`: total_records = 0, status = 'SUCCESS'
- No error records created

---

#### TC-DM-SIT-03 — Partial success (mixed valid/invalid records)

**ALM ID:** *(pending)*

**Pre-conditions:** `{entity}_test_partial_{date}.csv` uploaded (80% valid, 20% invalid)

**Expected Results:**
- Valid records written to target
- Invalid records in `err.{entity}` with correct error_code
- `audit.migration_run`: status = 'PARTIAL'

---

#### TC-DM-SIT-04 — All invalid records

**ALM ID:** *(pending)*

**Expected Results:**
- No records written to target
- All records in `err.{entity}`
- `audit.migration_run`: status = 'PARTIAL', success_records = 0

---

#### TC-DM-SIT-05 — File not found

**ALM ID:** *(pending)*

**Expected Results:**
- Pipeline completes with appropriate status
- Alert sent to notification channel

---

#### TC-DM-SIT-06 — Duplicate alternate key (upsert)

**ALM ID:** *(pending)*

**Expected Results:**
- Last record in file wins (upsert behaviour)
- No duplicate records in target

---

#### TC-DM-SIT-07 — Idempotent re-run

**ALM ID:** *(pending)*

**Pre-conditions:** TC-DM-SIT-01 has already run successfully

**Steps:**
1. Re-run pipeline with same `batchDate` and same file (re-upload from archive)

**Expected Results:**
- Same result as first run
- No additional records created in target (upsert, not insert)

---

#### TC-DM-SIT-08 — Large volume performance

**ALM ID:** *(pending)*

**Pre-conditions:** `{entity}_test_volume_{date}.csv` (10,000+ records) uploaded

**Expected Results:**
- Pipeline completes within {N} minutes (benchmark from constitution/08)
- All records processed correctly

---

### DM-UAT Suite

---

#### TC-DM-UAT-01 — Field value accuracy

**ALM ID:** *(pending)*

**Pre-conditions:** Known test data with specific field values

**Expected Results:**
- Each target field contains the exact value from the mapping (or derived value per field-mapping.md)

---

#### TC-DM-UAT-02 — Required fields populated

**ALM ID:** *(pending)*

**Expected Results:**
- All required target fields populated in every successfully migrated record

---

#### TC-DM-UAT-03 — Lookup fields resolved correctly

**ALM ID:** *(pending)*

**Expected Results:**
- Lookup fields contain the resolved display value (not the raw source code)

---

#### TC-DM-UAT-04 — Audit log accuracy

**ALM ID:** *(pending)*

**Expected Results:**
- `audit.migration_run` row created with accurate record counts, timestamps, and status

---

### DM-SEC Suite

---

#### TC-DM-SEC-01 — PII not visible in ADF logs

**ALM ID:** *(pending)*

**Steps:**
1. Run pipeline with PII-containing test data
2. Check ADF activity run output in Monitor

**Expected Results:**
- PII field values not visible in activity output (secureOutput = true)

---

#### TC-DM-SEC-02 — Credential not in ADF config

**ALM ID:** *(pending)*

**Steps:**
1. Inspect ADF linked service definitions
2. Inspect pipeline parameter definitions

**Expected Results:**
- No plaintext credentials, connection strings, or private keys in any ADF artefact

---

## 5. Test Data Requirements

| File | Purpose | Location |
|---|---|---|
| `{entity}_test_happy_{date}.csv` | Happy path — 50 valid records | `output/{migration-id}/tests/data/` |
| `{entity}_test_partial_{date}.csv` | Partial success | `output/{migration-id}/tests/data/` |
| `{entity}_test_allinvalid_{date}.csv` | All invalid | `output/{migration-id}/tests/data/` |
| `{entity}_test_empty_{date}.csv` | Empty file | `output/{migration-id}/tests/data/` |
| `{entity}_test_volume_{date}.csv` | 10,000+ records | `output/{migration-id}/tests/data/` |

---

## 6. Entry and Exit Criteria

### SIT Entry
- [ ] ADF artefacts deployed to test environment
- [ ] SQL staging schema deployed
- [ ] Test data files available on test SFTP server
- [ ] Linked service connectivity verified

### SIT Exit
- [ ] All TC-DM-SIT pass
- [ ] Performance benchmarks met
- [ ] Zero FAIL-severity open defects

### UAT Entry
- [ ] SIT exit criteria met
- [ ] Business analyst briefed on test data and expected results

### UAT Exit
- [ ] All TC-DM-UAT pass
- [ ] Business sign-off document signed

---

## 7. Defect Management

Defects logged as Bugs in ADO.
Priority 1 and 2 bugs block go-live sign-off.
