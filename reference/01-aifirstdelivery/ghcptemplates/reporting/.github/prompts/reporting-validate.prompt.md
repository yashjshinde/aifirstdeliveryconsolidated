---
mode: agent
description: "Validate Reporting task cards before implementation. Triggers on: 'validate', 'task validation'."
---

Validate one or more Reporting task cards before implementation begins.

## Usage

- `/reporting-validate {feature-name}` — validates ALL task cards for a feature
- `/reporting-validate {feature-name}/{task-file}` — validates a single task card

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`. If not TASK-READY or PARTIALLY READY, stop.
2. Read `docs-generated/{feature-name}/technical-design-document.md` (TDD) — required for alignment check.
3. Read `docs-generated/{feature-name}/solution-blueprint.md` (Blueprint) — required for pattern alignment.

## Steps

4. Read all files in `constitution/`.
5. For each task card to validate, run all checks below.
6. Write validation result back into the task card — update the `validation-status` field in the front matter.
7. Print a validation report for all tasks checked.

## Validation Checks

### Check 1 — Task Card Completeness (BLOCKER if any fail)
- [ ] `component-type` is set to exactly one valid type (Dataset / DataModel / Measure / RLS / Report-Interactive / Report-Paginated / Report-SSRS / Dataflow / Configuration / Deployment / Testing)
- [ ] `output-path` is defined and matches `output/{feature}/` convention
- [ ] `story-ref` and `fr-refs` are populated
- [ ] Technical Approach section has numbered steps (not vague statements)
- [ ] Acceptance Criteria: all ACs are numbered AC-NNN and are testable
- [ ] Each AC has at least one corresponding test case
- [ ] Definition of Done checklist is complete and non-empty

### Check 2 — Reporting Specifics (BLOCKER for applicable component type)

**Measure tasks:**
- [ ] Measure name matches DAX convention (Title Case, no underscores)
- [ ] Business definition is clear enough to write DAX without guessing
- [ ] Source table is identified
- [ ] Format string specified

**RLS tasks:**
- [ ] Role name specified
- [ ] Filter logic clearly described in plain language
- [ ] User group / Azure AD group identified
- [ ] Test user identified for validation

**Report-Interactive / Report-Paginated tasks:**
- [ ] PBIX filename specified
- [ ] Dataset/data source specified
- [ ] Page list documented
- [ ] Workspace specified

**Report-SSRS tasks:**
- [ ] RDL filename specified
- [ ] Stored procedure name specified
- [ ] Parameters listed
- [ ] Data source name specified

**Dataset / DataModel tasks:**
- [ ] Storage mode specified (Import / DirectQuery / Composite)
- [ ] Table list documented
- [ ] Key relationships described

### Check 3 — TDD Alignment (REQUIRED)
- [ ] Measure name in task card matches the TDD §5 Measure Catalogue exactly
- [ ] RLS role name and filter in task card matches TDD §6 RLS Technical Design
- [ ] SSRS stored procedure name matches TDD §7
- [ ] Dataset storage mode matches TDD §3 Data Model Design

### Check 4 — Blueprint Alignment (REQUIRED)
- [ ] Task's component type is consistent with the selected architecture pattern

### Check 5 — Constitution Compliance (BLOCKER if any fail)
- [ ] Measure naming follows Title Case convention
- [ ] No hardcoded connection strings or credentials in Technical Approach
- [ ] No `COUNTROWS(FILTER(...))` planned — must use `CALCULATE(COUNTROWS(...))`
- [ ] No bidirectional relationships without documented justification
- [ ] DirectQuery task on table > 50M rows has aggregation table dependency

## Validation Status Values

- `READY TO IMPLEMENT` — all checks pass
- `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs found
- `BLOCKED` — depends on an incomplete task

## Validation Report

```
VALIDATION REPORT — {feature-name}
════════════════════════════════════════
Task T-001: {Title}
  Status: READY TO IMPLEMENT
  ✓ All checks passed

Task T-002: {Title}
  Status: NEEDS REWORK
  ✗ [BLOCKER] RLS user group not identified (Check 2 — RLS tasks)

────────────────────────────────────────
SUMMARY
  READY TO IMPLEMENT : {N}
  NEEDS REWORK       : {N}
  BLOCKED            : {N}
```

## Rules

- **AI Notes:** In the generated validation report, at the end of each task's validation block, append `> **AI Notes** — {1–2 sentences: key compliance decision made, the constitution rule applied, or the risk if this task proceeds without resolving the noted issue}`. Write only what is non-obvious.