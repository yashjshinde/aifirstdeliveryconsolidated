---
mode: agent
description: "Review a D365 F&O TDD for template completeness and FDD traceability. Triggers on: 'tdd-review', 'review tdd', 'approve tdd'."
---

Review a D365 F&O Technical Design Document against the approved FDD and the constitution. Sets TDD APPROVED or NEEDS REWORK — Plan cannot be generated until the TDD is APPROVED.

## Usage

```
/d365-fo-tdd-review {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Load Review Checklist

Read `Prompts/tdd-review/checklist.md`. Apply every criterion.

## Step 3 — Read Documents

Read:
- `docs/{requirement-name}/fdd.md` (the approved baseline)
- `docs/{requirement-name}/tdd.md`

If tdd.md does not exist, stop:
```
ERROR: docs/{requirement-name}/tdd.md not found.
Run /d365-fo-tdd {requirement-name} first.
```

## Step 4 — Conduct Review

### 1. Template Completeness

- All TDD sections present in correct order?
- Document header complete (Project, Doc No., Sign-off table, Version History)?
- Section 1 (Introduction) — Purpose, Objectives, URS ID, L3/L4 process?
- Section 2 (System Overview) — Business purpose, current process, rationale, key decisions, assumptions?
- Section 3 (Glossary) populated?
- Section 4 (Reference Documents) populated?
- Section 5 (Architecture) — sub-sections present for every object in FDD Object Inventory?
- Section 5.12 (Open Items) — all TBDs explicitly listed?
- Quality Checklist present at end?

### 2. FDD Traceability

- Every object in the FDD Object Inventory has a corresponding TDD architecture sub-section?
- Every FDD Form Design entry covered in Section 5.3 (Form Extensions / New Forms)?
- Every FDD Field Mapping entry covered in Section 5.4 (Data Dictionary)?
- Every FDD Business Rule covered in Section 5.6 (Business Logic) pseudocode?
- Every FDD Security Requirement covered in Section 5.9?
- Every FDD Integration Requirement covered in Section 5.11?

### 3. Design Quality and Correctness

- All object names follow AVA naming conventions?
- X++ coding standards from constitution applied (doc-comments, ttsbegin/ttscommit, label references, no prohibited patterns)?
- Extension model used — no overlayering proposed?
- Class/method pseudocode sufficiently detailed for a developer to implement without questions?
- Performance considerations addressed for Complex/Very Complex objects?
- Upgrade compatibility addressed — no hard dependencies on sealed Microsoft classes?

### 4. Security Design

- Custom privileges defined for every new menu item?
- Privileges assigned to duties, duties to roles — no direct privilege-to-user assignment?
- Sensitive data fields identified and flagged?

### 5. Integration Design (if applicable)

- Integration Contract elements present (schema, trigger, frequency, error handling, retry)?
- Authentication via Azure AD service principal — no hardcoded credentials?
- Idempotency addressed?
- Error logging and monitoring defined?

### 6. Open Items Assessment

- All Section 5.12 open items acceptable (TBDs are resolvable before development)?
- No TBD items that would block a developer from implementing?

## Step 5 — Determine Status

- **TDD APPROVED** — no BLOCKERs, every FDD object covered in TDD, all pseudocode present, no unresolvable TBDs
- **NEEDS REWORK** — any BLOCKER, any FDD object missing from TDD, any unresolvable TBD, or naming convention violations

## Step 6 — Write Review Report

Write to `docs/{requirement-name}/tdd-review.md`:

```markdown
---
requirement: {requirement-name}
reviewed-date: {YYYY-MM-DD}
status: TDD APPROVED | NEEDS REWORK
author: Claude Code (/d365-fo-tdd-review)
---

# TDD Review — {requirement-name}

## Status: TDD APPROVED / NEEDS REWORK

## Checklist Summary

| Area | Items | Pass | Fail | Warning |
|---|---|---|---|---|
| Template Completeness | {n} | {n} | {n} | {n} |
| FDD Traceability | {n} | {n} | {n} | {n} |
| Design Quality | {n} | {n} | {n} | {n} |
| Security Design | {n} | {n} | {n} | {n} |
| Integration Design | {n} | {n} | {n} | {n} |

## Blockers *(must fix before Plan can proceed)*

| ID | Section | Issue |
|---|---|---|

## Required *(fix before re-review)*

| ID | Section | Issue |
|---|---|---|

## FDD → TDD Traceability Gaps

| FDD Object | FDD Section | TDD Coverage |
|---|---|---|
| {object} | {section} | Missing / Partial / ✓ |

## Open Items Assessment

| Open Item | Section 5.12 ref | Resolvable before dev? |
|---|---|---|

## Recommendations

- Improvement 1
```

## Step 7 — Print Summary

```
TDD REVIEW COMPLETE — {requirement-name}
════════════════════════════════════════
Status      : TDD APPROVED / NEEDS REWORK
Blockers    : {N}
FDD gaps    : {N} FDD objects not fully covered in TDD
Open Items  : {N} TBDs in Section 5.12
Output      : docs/{requirement-name}/tdd-review.md
```

If TDD APPROVED:
```
GATE PASSED — Plan may now be generated.
Next step: /d365-fo-plan {requirement-name}
```
