# Testing Standards

## Test Levels

| Level | Focus | Who Runs | When |
|---|---|---|---|
| **Unit** | Individual stored procedures, data flow transformations in isolation | Developer | During implementation |
| **Component** | Single ADF pipeline end-to-end with test data | Developer / QA | During implementation |
| **System Integration (SIT)** | Full migration flow: source → staging → target | QA | Before UAT |
| **UAT** | Business validation of migrated data against acceptance criteria | Business analyst / data owner | After SIT passes |
| **Performance** | Volume test with production-scale data | QA / Ops | Before go-live |
| **Regression** | Re-run SIT and component tests after any change | QA | After each change |

---

## Test Data Management

### Inbound Tests (SFTP → Dataverse)

For each test scenario, prepare a test file:

| Scenario | File Name Pattern | Contents |
|---|---|---|
| Happy path | `{entity}_test_happy_{YYYYMMDD}.csv` | 10–50 valid records covering all field types |
| Partial success | `{entity}_test_partial_{YYYYMMDD}.csv` | Mix of valid and invalid records |
| All invalid | `{entity}_test_allinvalid_{YYYYMMDD}.csv` | Records failing every validation rule |
| Empty file | `{entity}_test_empty_{YYYYMMDD}.csv` | Header row only |
| Large volume | `{entity}_test_volume_{YYYYMMDD}.csv` | 10 000+ records for performance testing |
| Duplicate keys | `{entity}_test_duplicate_{YYYYMMDD}.csv` | Multiple rows with same alternate key |

Store test files in `output/{migration}/tests/data/`.

### Outbound Tests (Dataverse → SFTP)

Set up test Dataverse records:
- 10–20 records covering all exported fields
- Include records with null optional fields
- Include records modified within and outside the delta window

---

## Validation Rules

Every field mapping must have documented acceptance criteria:

| Validation Type | Test |
|---|---|
| Required field | Source record with empty required field → goes to error table |
| Data type | Source with non-numeric value for numeric field → error table |
| Length constraint | Source value exceeding max length → truncated or error (document choice) |
| Lookup/reference | Source code not in reference table → error table with `VAL_LOOKUP_NOT_FOUND` |
| Date format | Source date in wrong format → parse or error (document choice) |
| Alternate key uniqueness | Duplicate alternate key in same batch → upsert last-wins or error (document choice) |
| Business rule | Custom rules per migration (document in field mapping) |

---

## Test Case Structure

Each test case card must include:

```
TC-DM-{MigrationCode}-{NN}

Title: {plain-language description}
Direction: SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP
Entity: {entity name}

Pre-conditions:
- {list of required setup steps}

Test Data:
- {file or Dataverse records to use}

Steps:
1. {action}
2. {action}

Expected Results:
- {N} records in stg.{entity}_stage with validation_status = 'VALID'
- {N} records in err.{entity} with error_code = {code}
- {N} records created/updated in Dataverse entity {entity}
- audit.migration_run status = {SUCCESS|PARTIAL|FAILED}
- Source file archived to /incoming/{entity}/archive/

ALM ID: *(pending)*
```

---

## Performance Benchmarks

| Volume | Expected Duration |
|---|---|
| 1 000 records | < 5 minutes |
| 10 000 records | < 15 minutes |
| 100 000 records | < 60 minutes |
| 1 000 000 records | < 4 hours |

If benchmarks are not met, document the bottleneck (Dataverse write throttle, SFTP bandwidth, SQL I/O) and mitigation.

---

## Test Environment Requirements

- Dedicated ADF instance for test (separate from production).
- SQL Staging database: dev/test instance with masking.
- Dataverse: sandbox environment (not production).
- SFTP: test server with identical folder structure to production.
- Key Vault: separate dev/test Key Vault with test-environment secrets.

---

## Test Artefacts

Stored in `output/{migration}/tests/`:

```
tests/
  data/             ← test CSV/JSON files
  results/          ← test run output (record counts, audit entries)
  scripts/          ← SQL validation queries, PowerShell SFTP deposit scripts
  test-plan.md      ← summary linked from docs-generated/{migration}/test-plan-and-strategy.md
```
