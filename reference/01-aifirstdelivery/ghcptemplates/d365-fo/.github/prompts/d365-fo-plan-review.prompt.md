---
mode: agent
description: "Review a D365 F&O implementation plan for coverage and sequencing. Triggers on: 'plan-review', 'review plan', 'approve plan'."
---

Review the implementation plan against the approved TDD and constitution standards. Sets PLAN APPROVED or NEEDS REWORK — implementation cannot begin until the plan is APPROVED.

## Usage

```
/d365-fo-plan-review {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Read Documents

Read:
- `docs/{requirement-name}/tdd.md` (the approved TDD)
- `plans/{requirement-name}/plan.md`

If plan.md does not exist, stop:
```
ERROR: plans/{requirement-name}/plan.md not found.
Run /d365-fo-plan {requirement-name} first.
```

## Step 3 — Conduct Review

### 1. Coverage — every TDD object accounted for?

Extract all objects from TDD Section 5. Verify each has a corresponding row in the plan:
- Section 5.3: Form Extensions and New Forms
- Section 5.4: Data Dictionary objects (Base Enums, EDTs, Queries, Views, Data Entities, Tables)
- Section 5.5: SSRS Reports
- Section 5.6: Business Logic Classes
- Section 5.7: Interface Logic Classes
- Section 5.8: Workflows
- Section 5.9: Security objects (Privileges, Duties)
- Section 5.10: Label Files
- Section 5.11: Integration components

Flag any TDD object missing from the plan as a BLOCKER.

### 2. Object-ID and Naming

- Every object has a correctly formatted Object-ID (e.g., EXT-001, DEN-042)?
- Object names follow AVA naming conventions from constitution/03-extension-coding-standards.md?
- Object types match the 32-type catalogue?
- Module codes match approved list from constitution/01-governance-and-objects.md?

### 3. Complexity and Effort

- Complexity assigned for every object?
- Very Complex objects have a note that Solution Architect estimation review is required?
- T-shirt sizes consistent with complexity definitions?

### 4. Dependency Sequencing

- EDTs/Enums before Table/Form Extensions that reference them?
- Security Privileges before Duties; Duties before Roles?
- New Tables before Classes that query them?
- Integration classes after Data Entities they depend on?
- Circular dependencies identified and flagged?

### 5. work-items.yaml

- `plans/{requirement-name}/work-items.yaml` exists?
- Every plan object has a corresponding work item with `uid` set and `alm-id: null`?
- Level hierarchy correct (Requirement/Epic at Level 1; objects at Level 2)?

### 6. Cross-Feature Overlap Check (informational; does not block PLAN APPROVED)

- Read `plans/_component-registry.md` if it exists
- Scan all X++ objects in this plan's Object Summary table against the registry (Table Extensions, Form Extensions, Data Entities, Business Logic Classes, Security objects)
- For each match: log as INFORMATIONAL — record the owning feature, object name, and whether the actions are compatible
- If a CONFLICT is detected (two features claiming the same object with incompatible changes): raise as a BLOCKER — "Object {name} is also claimed by feature {other-feature}. Resolve the overlap before implementation begins."
- If no `_component-registry.md` exists or no matches found: note "No cross-feature overlaps detected."
- Record findings in the review report under a **Cross-Feature Overlaps** section

## Step 4 — Determine Status

- **PLAN APPROVED** — all TDD objects covered, Object-IDs correct, complexity assigned, sequencing valid, work-items.yaml present
- **NEEDS REWORK** — any BLOCKER (missing TDD object, naming violation, invalid dependency), or work-items.yaml missing

## Step 5 — Update plan.md Status

If PLAN APPROVED, update the `status` field in `plans/{requirement-name}/plan.md` front matter from `PENDING REVIEW` to `PLAN APPROVED`.

## Step 6 — Write Review Report

Write to `plans/{requirement-name}/plan-review.md`:

```markdown
---
requirement: {requirement-name}
reviewed-date: {YYYY-MM-DD}
status: PLAN APPROVED | NEEDS REWORK
author: Claude Code (/d365-fo-plan-review)
---

# Plan Review — {requirement-name}

## Status: PLAN APPROVED / NEEDS REWORK

## Coverage Check

| TDD Object | Section | Plan Row | Status |
|---|---|---|---|
| {object} | 5.x.x | EXT-001 | ✓ / MISSING |

## Blockers

| ID | Issue |
|---|---|

## Naming Violations

| Object-ID | Current Name | Required Pattern | Correction |
|---|---|---|---|

## Sequencing Issues

| Object-ID | Depends On | Issue |
|---|---|---|

## Summary

Total objects: {N}
Covered: {N} ✓
Missing: {N} ✗
Naming violations: {N}
Sequencing issues: {N}
```

## Step 7 — Print Summary

```
PLAN REVIEW COMPLETE — {requirement-name}
═════════════════════════════════════════
Status          : PLAN APPROVED / NEEDS REWORK
Coverage        : {N}/{N} TDD objects accounted for
Blockers        : {N}
Cross-feature   : CLEAR / {N} overlaps — {summary if any}
Output          : plans/{requirement-name}/plan-review.md
```

If PLAN APPROVED:
```
GATE PASSED — Implementation may now begin.
Next step: /d365-fo-implement {requirement-name}/{Object-ID}
```
