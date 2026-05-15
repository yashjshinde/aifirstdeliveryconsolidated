---
mode: agent
description: "Validate Power Platform task cards before implementation. Triggers on: 'validate', 'task validation'."
---

Validate one or more task cards for Power Platform before implementation begins.

## Usage

- `/power-apps-validate {feature-name}` — validates ALL task cards for a feature
- `/power-apps-validate {feature-name}/{task-file}` — validates a single task card

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`. If not TASK-READY or PARTIALLY READY, stop.
2. Read `docs-generated/{feature-name}/technical-design-document.md` (TDD) — required for alignment.
3. Read `docs-generated/{feature-name}/solution-blueprint.md` (Blueprint) — required for pattern alignment.

## Steps

4. Read all files in `constitution/`.
5. For each task card, run all checks below.
6. Update `validation-status` in the task card front matter.
7. Print the validation report.

## Validation Checks

### Check 1 — Task Card Completeness (BLOCKER if any fail)
- [ ] `component-type` is exactly one of: CanvasApp | ModelDrivenApp | Flow | CopilotTopic | DataverseSchema | SecurityRole | Configuration
- [ ] `output-path` defined and matches `output/{feature}/src/`
- [ ] `fr-refs` populated
- [ ] Technical Approach has numbered steps
- [ ] All ACs are numbered AC-NNN and testable (not vague like "works correctly")
- [ ] Each AC has at least one test case
- [ ] Definition of Done is complete

### Check 2 — Power Platform Specifics (BLOCKER for applicable type)

**Canvas App tasks:**
- [ ] Screen name follows `scr{Purpose}` convention
- [ ] Data source / Dataverse table specified
- [ ] Delegation analysis present for any Filter, Sort, or Search operation
- [ ] Key formulas described in Technical Approach (not just "add a gallery")
- [ ] Any `Set()` / `ClearCollect()` variable named with `gbl_` or `col` prefix

**Power Automate Flow tasks:**
- [ ] Trigger type specified (Automated / Scheduled / Instant)
- [ ] Dataverse table or event specified
- [ ] Connection Reference name specified — not a personal connection
- [ ] Error handling scope described
- [ ] Flow run-as identity stated (service account)

**Model-Driven App tasks:**
- [ ] Form name follows `{Entity} — {Purpose}` convention
- [ ] Entity schema name specified
- [ ] Business Rules: condition and action described in task

**Copilot Topic tasks:**
- [ ] Topic name specified
- [ ] Minimum 3 trigger phrase examples listed
- [ ] Power Automate flow name specified if data access required
- [ ] Escalation condition described

**Schema tasks:**
- [ ] Table schema name `{prefix}_tablename` all lowercase
- [ ] All new columns: schema name, type, required/optional, description
- [ ] Relationship cascade behaviour stated

**Security Role tasks:**
- [ ] Role name follows `{SolutionName} — {Module} {Level}` convention
- [ ] Privilege level (User/BU/Org/None) stated per table

### Check 3 — TDD Alignment (REQUIRED)
- [ ] Screen/flow/topic name matches TDD §Canvas App / Flow / Copilot Specifications
- [ ] Formula or action approach aligns with TDD
- [ ] Schema column names match TDD §Dataverse Schema Design
- [ ] Connection reference name matches TDD §Security Technical Design
- [ ] Delegation notes consistent with TDD §Canvas App §Delegation Analysis

### Check 4 — Blueprint Alignment (REQUIRED)
- [ ] Component type consistent with selected architecture pattern
  - e.g., if Pattern B (MDA-First), a canvas screen for the same data is a constitution risk unless justified
- [ ] DLP policy: any connector introduced is in the allowed tier per Blueprint §DLP Policy Impact

### Check 5 — Dependency Readiness (BLOCKER)
- [ ] Schema tasks scheduled before app/flow tasks that use those tables
- [ ] Connection reference tasks before flow tasks that need them
- [ ] Security role tasks before app-sharing tasks

### Check 6 — Constitution Compliance (BLOCKER)
- [ ] No `Xrm.Page` referenced (N/A for canvas, blocker for MDA JS)
- [ ] No personal connections — connection references used
- [ ] No `alert()` / `confirm()` — Xrm.Navigation used
- [ ] All delegation-unsafe operations have a mitigation in the task

## Validation Status Values

- `READY TO IMPLEMENT` — all checks pass
- `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs found
- `BLOCKED` — dependency not met

## Validation Report Format

```
VALIDATION REPORT — {feature-name}
════════════════════════════════════════
Task {L4-Prefix}-001: {Title}
  Status: READY TO IMPLEMENT ✓

Task {L4-Prefix}-002: {Title}
  Status: NEEDS REWORK
  ✗ [BLOCKER] Flow connection reference not specified — personal connection risk (Check 2)
  ✗ [BLOCKER] Delegation not assessed for Filter on xyz_customerprofile (Check 2)
  ✗ [REQUIRED] TDD §Canvas App shows gbl_CurrentAccount but task uses locCurrentAccount (Check 3)

Task {L4-Prefix}-003: {Title}
  Status: BLOCKED
  ✗ [BLOCKER] Depends on {L4-Prefix}-002 (schema change) which is NEEDS REWORK

────────────────────────────────────────
SUMMARY
  READY TO IMPLEMENT : 1 / 3
  NEEDS REWORK       : 1 / 3
  BLOCKED            : 1 / 3

ACTION: Fix {L4-Prefix}-002, re-run /power-apps-validate, then proceed with /power-apps-implement {L4-Prefix}-001.
```

## Rules

- `/power-apps-implement` will refuse a task unless `validation-status` = `READY TO IMPLEMENT`
- Re-validate if TDD or Blueprint changes after initial validation
- Delegation warnings in task cards must have a mitigation — "accept the limit" is not a mitigation
- **AI Notes:** In the generated validation report, at the end of each task's validation block, append `> **AI Notes** — {1–2 sentences: key compliance decision made, the constitution rule applied, or the risk if this task proceeds without resolving the noted issue}`. Write only what is non-obvious.