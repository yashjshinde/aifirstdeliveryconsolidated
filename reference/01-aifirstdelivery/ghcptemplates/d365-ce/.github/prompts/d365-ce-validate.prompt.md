---
mode: agent
description: "Validate D365 CE task cards before implementation. Use when the user wants to gate-check task cards before a developer starts work. Triggers on: 'validate tasks', 'validate feature', 'check task cards', 'validation report'."
---

Validate one or more task cards for D365 CE before implementation begins.

## Usage

- `/d365-ce-validate {feature-name}` — validates ALL task cards for a feature
- `/d365-ce-validate {feature-name}/{task-file}` — validates a single task card

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
- [ ] `component-type` is set to exactly one valid type
- [ ] `output-path` is defined and matches `output/{feature}/src/` convention
- [ ] `story-ref` and `fr-refs` are populated
- [ ] Technical Approach section has numbered steps (not vague statements)
- [ ] Acceptance Criteria: all ACs are numbered AC-NNN and are testable (specific, measurable)
- [ ] Each AC has at least one corresponding test case in the Test Cases table
- [ ] Definition of Done checklist is complete and non-empty

### Check 2 — D365 CE Specifics (BLOCKER for applicable component type)

**Plugin tasks:**
- [ ] Entity schema name specified
- [ ] Message specified (Create / Update / Delete / custom action name)
- [ ] Stage specified (Pre-Operation / Post-Operation / Pre-Validation)
- [ ] Mode specified (Synchronous / Asynchronous)
- [ ] Rank specified
- [ ] Filtering attributes listed (for Update message)
- [ ] Pre/Post image requirement stated with attribute list

**Web Resource (JS) tasks:**
- [ ] File name follows `{prefix}_{entity}_{form}_{purpose}.js`
- [ ] Entity, form name, and event (OnLoad/OnChange/OnSave) specified
- [ ] Function name specified

**PCF tasks:**
- [ ] Bound column and entity specified
- [ ] Control type (field/dataset) specified

**Schema Change tasks:**
- [ ] Table schema name, column schema name, data type, required/optional all present
- [ ] Description provided for new columns

### Check 3 — TDD Alignment (REQUIRED)
- [ ] Task's component name/class matches what is defined in the TDD
- [ ] Plugin registration details in task card match TDD §Plugin Specifications
- [ ] Output path in task card matches TDD §Solution and ALM Design component list
- [ ] Security role requirements in task match TDD §Security Technical Design
- [ ] If task produces a new table/column: matches TDD §Dataverse Schema Design

### Check 4 — Blueprint Alignment (REQUIRED)
- [ ] Task's component type is consistent with the selected architecture pattern in the Blueprint
- [ ] No task introduces a component type that contradicts the chosen pattern
  - e.g., if Pattern B (Flow-Centric) was selected, a synchronous plugin for business logic is a BLOCKER

### Check 5 — Dependency Readiness (BLOCKER if unmet)
- [ ] All task dependencies listed in the plan are either DONE or also being validated in this batch
- [ ] Schema change tasks that other tasks depend on are sequenced first

### Check 6 — Constitution Compliance (BLOCKER if any fail)
- [ ] Plugin class naming follows `{Entity}{Pre|Post}{Operation}Plugin`
- [ ] No static variables planned
- [ ] No hardcoded GUIDs or connection strings in approach
- [ ] JS approach uses `executionContext` not `Xrm.Page`
- [ ] Test approach references FakeXrmEasy for plugin tests, Jest for JS/PCF

## Validation Status Values

- `READY TO IMPLEMENT` — all checks pass; `/d365-ce-implement` may proceed
- `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs found; task card must be updated before implementing
- `BLOCKED` — depends on an incomplete task; cannot start yet

## Validation Report Format

```
VALIDATION REPORT — {feature-name}
════════════════════════════════════════
Task {L4-Prefix}-001: {Title}
  Status: READY TO IMPLEMENT
  ✓ All checks passed

Task {L4-Prefix}-002: {Title}
  Status: NEEDS REWORK
  ✗ [BLOCKER] Plugin message not specified (Check 2 — Plugin tasks)
  ✗ [REQUIRED] TDD §3 defines class as AccountPostCreatePlugin but task says AccountPreCreate (Check 3)

Task {L4-Prefix}-003: {Title}
  Status: BLOCKED
  ✗ [BLOCKER] Depends on {L4-Prefix}-002 which is NEEDS REWORK

────────────────────────────────────────
SUMMARY
  READY TO IMPLEMENT : 1
  NEEDS REWORK       : 1
  BLOCKED            : 1

ACTION: Fix issues in {L4-Prefix}-002, then re-run /d365-ce-validate before running /d365-ce-implement.
```

## Rules

- `/d365-ce-implement` will refuse to execute a task unless its `validation-status` is `READY TO IMPLEMENT`
- Re-run `/d365-ce-validate` after fixing a task card — it will re-check and update the status
- A task card that was READY TO IMPLEMENT must be re-validated if the TDD or Blueprint changes after validation
- **AI Notes:** In the generated validation report, at the end of each task's validation block, append `> **AI Notes** — {1–2 sentences: key compliance decision made, the constitution rule applied, or the risk if this task proceeds without resolving the noted issue}`. Write only what is non-obvious.