---
mode: agent
description: "Validate Azure Integration task cards before implementation. Triggers on: 'validate', 'task validation'."
---

Validate one or more task cards for Azure Integration before implementation begins.

## Usage

- `/integration-validate {feature-name}` — validates ALL task cards for a feature
- `/integration-validate {feature-name}/{task-file}` — validates a single task card

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
- [ ] `component-type` is exactly one of: Function | LogicApp | ServiceBus | APIM | Bicep | Schema | Configuration
- [ ] `output-path` defined and matches `output/{feature}/src/` or `output/{feature}/infrastructure/`
- [ ] `fr-refs` populated
- [ ] Technical Approach has numbered steps
- [ ] All ACs are numbered AC-NNN and testable
- [ ] Each AC has at least one test case (including an error/DLQ scenario)
- [ ] Definition of Done is complete

### Check 2 — Azure Integration Specifics (BLOCKER for applicable type)

**Azure Function tasks:**
- [ ] Trigger type specified (HttpTrigger / ServiceBusTrigger / TimerTrigger)
- [ ] Trigger binding config specified (queue/topic name, route, schedule)
- [ ] Managed Identity role specified: identity → role → resource
- [ ] Retry policy specified (retries, backoff, DLQ or throw)
- [ ] Timeout value specified
- [ ] CorrelationId logging stated in approach

**Service Bus tasks:**
- [ ] Queue or Topic name specified
- [ ] Message schema reference specified (must match `output/{feature}/src/Schemas/`)
- [ ] Max delivery count stated
- [ ] DLQ handling described

**Logic App tasks:**
- [ ] Workflow name follows `{purpose}-workflow` convention
- [ ] Trigger specified
- [ ] Retry policy on external connector actions stated
- [ ] Error scope (Configure run after) described

**APIM tasks:**
- [ ] API name and version specified
- [ ] Authentication mechanism stated
- [ ] Rate limit policy specified
- [ ] Error normalisation policy stated

**Bicep IaC tasks:**
- [ ] Resource name, type, and SKU specified
- [ ] Managed Identity role assignment included in scope
- [ ] Parameter names defined for environment-specific values

**Schema tasks:**
- [ ] JSON Schema file path in `output/{feature}/src/Schemas/` specified
- [ ] Required envelope fields (`messageId`, `correlationId`, `eventType`, `schemaVersion`) present
- [ ] All payload fields have type, required flag, and description

### Check 3 — TDD Alignment (REQUIRED)
- [ ] Function class name matches TDD §Azure Function Specifications
- [ ] Trigger config matches TDD
- [ ] Managed Identity role matches TDD §Infrastructure Design §Managed Identity Role Assignments
- [ ] Message schema structure matches TDD §Message Schema Definitions
- [ ] Resource names match TDD §Infrastructure Design §Azure Resources

### Check 4 — Blueprint Alignment (REQUIRED)
- [ ] Component type consistent with selected architecture pattern
  - e.g., if Pattern A (Event-Driven), HTTP-triggered functions for business logic (not APIM-only) is a mismatch
- [ ] Resilience approach (retry, DLQ) consistent with Blueprint §Resilience Architecture

### Check 5 — Dependency Readiness (BLOCKER)
- [ ] Bicep IaC tasks are sequenced before application code tasks that need those resources
- [ ] Schema tasks are sequenced before Function tasks that consume those schemas

### Check 6 — Constitution Compliance (BLOCKER)
- [ ] Managed Identity used — no connection strings or secrets in approach
- [ ] Idempotency mechanism described for any message consumer
- [ ] Timeout values explicit — no reliance on defaults
- [ ] No `async void` patterns described

## Validation Status Values

- `READY TO IMPLEMENT` — all checks pass
- `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs
- `BLOCKED` — dependency not met

## Validation Report Format

```
VALIDATION REPORT — {feature-name}
════════════════════════════════════════
Task {L4-Prefix}-001: {Title}
  Status: READY TO IMPLEMENT ✓

Task {L4-Prefix}-002: {Title}
  Status: NEEDS REWORK
  ✗ [BLOCKER] Managed Identity role not specified (Check 2 — Function tasks)
  ✗ [REQUIRED] TDD §2 defines retry as 3×exponential but task says "retry on failure" (Check 3)

────────────────────────────────────────
SUMMARY
  READY TO IMPLEMENT : 1 / 2
  NEEDS REWORK       : 1 / 2

ACTION: Fix issues in {L4-Prefix}-002, then re-run /integration-validate.
```

## Rules

- `/integration-implement` will refuse a task unless `validation-status` = `READY TO IMPLEMENT`
- Re-validate if TDD or Blueprint changes after initial validation
- **AI Notes:** In the generated validation report, at the end of each task's validation block, append `> **AI Notes** — {1–2 sentences: key compliance decision made, the constitution rule applied, or the risk if this task proceeds without resolving the noted issue}`. Write only what is non-obvious.