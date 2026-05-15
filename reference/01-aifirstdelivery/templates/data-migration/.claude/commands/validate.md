Validate all task cards for implementation readiness and set validation status.

## Usage

```
/validate {migration-id}
```

## Pre-condition

Task cards must exist in `tasks/{migration-id}/`.

## Steps

1. Read ALL files in `constitution/`.
2. Glob all `tasks/{migration-id}/*.md`.
3. For each task card, run the validation checklist.
4. Update the `**Validation Status:**` field in each card.
5. Print the summary report.

## Validation Checklist (per task card)

### Structure (FAIL if any missing)

- [ ] `**Output File:**` is specified and the path follows constitution conventions
- [ ] `**Tags:**` contains at least one tag from the component type table
- [ ] `**Estimate:**` is a number of hours
- [ ] `## Acceptance Criteria` has at least 2 checkboxes
- [ ] `## Implementation Notes` is present

### Technical Completeness

**SQL DDL tasks (FAIL if any missing):**
- [ ] Schema name is `stg`, `err`, `audit`, or `ref` (not `dbo`)
- [ ] Primary key defined
- [ ] `run_id` column present on raw and stage tables
- [ ] `loaded_at` or `created_at` audit column present
- [ ] Script is idempotent (IF NOT EXISTS pattern)

**SQL SP tasks (FAIL if any missing):**
- [ ] SP in `stg` or `err` schema (not `dbo`)
- [ ] Parameters `@RunId` and `@BatchDate` present
- [ ] TRY/CATCH with THROW required
- [ ] Idempotency statement in notes

**ADF Linked Service tasks (FAIL if any missing):**
- [ ] Key Vault secret names specified
- [ ] Authentication method stated
- [ ] No hardcoded credentials

**ADF Pipeline tasks (FAIL if any missing):**
- [ ] Parameters section includes `runId`, `environment`, `batchDate`
- [ ] Retry policy stated
- [ ] `onFailure` routing mentioned

**ADF Data Flow tasks (FAIL if any missing):**
- [ ] Source dataset named
- [ ] Sink dataset named
- [ ] At least one transformation step described

**Test data tasks (FAIL if any missing):**
- [ ] Record count specified
- [ ] Scenario covered stated
- [ ] File path follows `output/{m}/tests/data/` convention

### Security (FAIL if any violation)

- [ ] No task card contains a hardcoded credential, IP address, or connection string
- [ ] PII fields in data flow tasks are marked with `secureOutput: true` note

## Validation Status Values

| Status | Meaning |
|---|---|
| `READY TO IMPLEMENT` | All checks pass |
| `BLOCKED: {reason}` | One or more FAIL checks — must be fixed |

## Output

For each task card, update the line:
```
**Validation Status:** *(pending)*
```
to either:
```
**Validation Status:** READY TO IMPLEMENT
```
or:
```
**Validation Status:** BLOCKED: {comma-separated list of failing checks}
```

Print:

```
VALIDATION COMPLETE — {migration-id}
════════════════════════════════════════
Total Tasks         : {N}
READY TO IMPLEMENT  : {N}
BLOCKED             : {N}

{If any BLOCKED:}
Blocked tasks:
  {filename}: {reason}

{If all READY:}
All tasks are READY TO IMPLEMENT.
Next step: /implement {migration-id}
```

**GATE:** `/implement` may not run until ALL tasks are **READY TO IMPLEMENT**.

## Rules

- **AI Notes:** In the generated validation report, at the end of each task's validation block, append `> **AI Notes** — {1–2 sentences: key compliance decision made, the constitution rule applied, or the risk if this task proceeds without resolving the noted issue}`. Write only what is non-obvious.