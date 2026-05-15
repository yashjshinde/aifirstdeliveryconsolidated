# D365 F&O Agent Template

Spec-driven development for Dynamics 365 Finance & Operations using Claude Code.
The process starts with an FDD, not a spec — every document is formally reviewed and approved before the next stage begins.

## Full Workflow

```
PHASE 1 — FUNCTIONAL DESIGN
/fdd        → docs/{req}/fdd.md
/fdd-review → docs/{req}/fdd-review.md          ← FDD APPROVED gate
     ↓
[Mixed domain? Integration or data migration requirements detected in FDD]
/split-spec → docs/{req}/fdd.md (F&O-scoped)
             + specs/{req}-integration/spec.md (Integration agent — if integration FRs exist)
             + specs/{req}-data-migration/spec.md (Data Migration agent — if ADF/SFTP FRs exist)
             + docs/{req}/split-manifest.md
     ↓
/testplan   → docs/{req}/test-plan.md
             └─ ALM export ──────────────────────────────────────────────────
               /extract testplan  → alm-extract/test-plan-extract.{csv,json}
               /extract testsuites [suite] → alm-extract/suites-extract.{csv,json}
               /extract testcases [tc-id] → alm-extract/testcases-extract.{csv,json}
               (import to ALM, create alm-mapping.csv, then:)
               /alm sync-testplan → updates test-plan + suite files with ALM IDs
             ─────────────────────────────────────────────────────────────────

PHASE 2 — DESIGN
/tdd        → docs/{req}/tdd.md
/tdd-review → docs/{req}/tdd-review.md          ← TDD APPROVED gate
/blueprint  → docs/{req}/solution-blueprint.md   ← runs after TDD APPROVED

PHASE 3 — PLANNING
/plan       → plans/{req}/plan.md + plans/{req}/work-items.yaml
/plan-review→ plans/{req}/plan-review.md         ← PLAN APPROVED gate

PHASE 4 — BUILD
/implement  → output/{req}/src/ + output/{req}/impl-docs/
/document   → docs/{req}/ (deployment-guide, release-notes, test-evidence)
```

> `/testplan` requires FDD APPROVED and completes Phase 1 before technical design begins.
> `/blueprint` requires TDD APPROVED and can be run in parallel with `/plan`.

## Command Reference

| Command | Pre-condition | Output |
|---|---|---|
| `/fdd {req}` | None | `docs/{req}/fdd.md` |
| `/fdd-review {req}` | `fdd.md` exists | `docs/{req}/fdd-review.md` |
| `/split-spec {req}` | fdd-review FDD APPROVED + mixed domain detected | `docs/{req}/fdd.md` (F&O-scoped) + `specs/{req}-integration/spec.md` (if INT FRs) + `specs/{req}-data-migration/spec.md` (if DM FRs) + `docs/{req}/split-manifest.md` |
| `/testplan {req}` | fdd-review status = FDD APPROVED | `docs/{req}/test-plan.md` |
| `/tdd {req}` | fdd-review status = FDD APPROVED | `docs/{req}/tdd.md` |
| `/tdd-review {req}` | `tdd.md` exists | `docs/{req}/tdd-review.md` |
| `/blueprint {req}` | tdd-review status = TDD APPROVED | `docs/{req}/solution-blueprint.md` |
| `/plan {req}` | tdd-review status = TDD APPROVED | `plans/{req}/plan.md` + `plans/{req}/work-items.yaml` |
| `/plan-review {req}` | `plan.md` exists | `plans/{req}/plan-review.md` |
| `/implement {req}/{task-id}` | plan-review status = PLAN APPROVED | `output/{req}/src/` + impl-doc |
| `/document {req}` | all tasks DONE | `docs/{req}/` (operational docs) |
| `/alm extract {req}` | `plan.md` exists | `output/{req}/alm/extract-{timestamp}.json` |
| `/alm sync {req} {uid} {id}` | extract run | updates `work-items.yaml` + task `alm-id` |
| `/alm get {req} {alm-id}` | alm-id synced | `output/{req}/alm/get-{alm-id}-{date}.json` |
| `/extract testplan {req}` | testplan exists | `docs/{req}/alm-extract/test-plan-extract.csv` + `.json` + `test-plan-summary.md` |
| `/extract testsuites {req} [suite]` | testplan exists | `docs/{req}/alm-extract/suites-extract.csv` + `.json` + `suites-summary.md` |
| `/extract testcases {req} [tc-id]` | testplan exists | `docs/{req}/alm-extract/testcases-extract.csv` + `.json` + `testcases-detail.md` |
| `/alm sync-testplan {req} [TC-ID ALM-ID]` | `alm-mapping.csv` exists (bulk) or single mode | updates `test-plan.md` + suite files |

## Rules

All commands must read `constitution/` before generating output. The constitution overrides all other instructions.
If `../../alm-configuration.md` exists, read it for ADO connection and work item settings — those values take precedence over any duplicates in `constitution/10-alm-configuration.md`.
All output paths (`docs/`, `plans/`, `tasks/`, `output/`) are relative to this template's root directory — never relative to the location of the input requirements file, regardless of where the source requirements come from.
