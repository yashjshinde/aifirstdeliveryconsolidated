# Reporting Agent Template

Spec-driven development template for Power BI, SSRS, and Paginated Reports using Claude Code.

## Full Workflow

```
/spec       → specs/{feature}/spec.md          (functional requirements)
/spec-alm   → specs/{feature}/spec.md          (structured intake — preserves L1/L2/L3 ALM IDs)
/review     → specs/{feature}/review.md        ← APPROVED gate
     ↓
[Mixed domain? CE, Integration, or Data Migration requirements detected in spec]
/split-spec → specs/{feature}/spec.md (Reporting-scoped)
             + specs/{feature}-ce/spec.md (CE agent — if D365 CE embedding/plugin FRs exist)
             + specs/{feature}-integration/spec.md (Integration agent — if event-driven pipeline FRs exist)
             + specs/{feature}-data-migration/spec.md (Data Migration agent — if ADF/SFTP FRs exist)
             + specs/{feature}/split-manifest.md
     ↓
[brownfield mode only]
/impact     → specs/{feature}/impact-analysis.md  ← IMPACT-ASSESSED (required by /plan when brownfield.enabled)
     ↓
/fdd        → docs-generated/{feature}/functional-design-document.md
/testplan   → docs-generated/{feature}/test-plan-and-strategy.md
             └─ ALM export ──────────────────────────────────────────────────
               /extract testplan  → alm-extract/test-plan-extract.{csv,json}
               /extract testsuites [suite] → alm-extract/suites-extract.{csv,json}
               /extract testcases [tc-id] → alm-extract/testcases-extract.{csv,json}
               (import to ALM, create alm-mapping.csv, then:)
               /alm sync-testplan → updates test-plan + suite files with ALM IDs
             ─────────────────────────────────────────────────────────────────
     ↓
/plan       → plans/{feature}/plan.md           (technical breakdown)
/clarify    → plans/{feature}/clarify.md       ← TASK-READY gate
     ↓
/tdd        → docs-generated/{feature}/technical-design-document.md
/blueprint  → docs-generated/{feature}/solution-blueprint.md
     ↓
/task       → tasks/{feature}/NN-{name}.md      (dev-ready task cards)
/validate   → updates validation-status on each task card  ← READY TO IMPLEMENT gate
     ↓
/implement  → output/{feature}/                 (PBIX, RDL, deployment assets)
/document   → docs-generated/{feature}/         (deployment guide, data dictionary, release notes)
```

## Command Reference

| Command | Pre-condition | Output |
|---|---|---|
| `/spec` | None | `specs/{f}/spec.md` |
| `/spec-alm` | `requirement-intake: structured` in constitution | `specs/{f}/spec.md` (structured — preserves L1/L2/L3 ALM IDs) |
| `/review` | spec.md exists | `specs/{f}/review.md` |
| `/split-spec` | review APPROVED + mixed domain detected | `specs/{f}/spec.md` (Reporting-scoped) + `specs/{f}-ce/spec.md` (if CE FRs) + `specs/{f}-integration/spec.md` (if INT FRs) + `specs/{f}-data-migration/spec.md` (if DM FRs) + `specs/{f}/split-manifest.md` |
| `/impact` | review APPROVED + brownfield.enabled | `specs/{f}/impact-analysis.md` |
| `/fdd` | review APPROVED | `docs-generated/{f}/functional-design-document.md` |
| `/testplan` | review APPROVED | `docs-generated/{f}/test-plan-and-strategy.md` |
| `/plan` | review APPROVED | `plans/{f}/plan.md` + `plans/{f}/work-items.yaml` |
| `/clarify` | plan.md exists | `plans/{f}/clarify.md` |
| `/tdd` | clarify TASK-READY | `docs-generated/{f}/technical-design-document.md` |
| `/blueprint` | clarify TASK-READY | `docs-generated/{f}/solution-blueprint.md` |
| `/task` | clarify TASK-READY | `tasks/{f}/NN-{name}.md` |
| `/validate` | TDD + Blueprint exist | updates `validation-status` in each task card |
| `/implement` | validation-status = READY TO IMPLEMENT | `output/{f}/` |
| `/document` | implement complete | `docs-generated/{f}/` (operational docs) |
| `/alm extract {f}` | plan.md exists | `output/{f}/alm/extract-{timestamp}.json` |
| `/alm sync {f} {uid} {id}` | extract run, ALM IDs known | updates `work-items.yaml` + task card `alm-id` fields |
| `/alm get {f} {alm-id}` | alm-id synced | `output/{f}/alm/get-{alm-id}-{date}.json` |
| `/extract testplan {f}` | testplan exists | `docs-generated/{f}/alm-extract/test-plan-extract.csv` + `.json` + `test-plan-summary.md` |
| `/extract testsuites {f} [suite]` | testplan exists | `docs-generated/{f}/alm-extract/suites-extract.csv` + `.json` + `suites-summary.md` |
| `/extract testcases {f} [tc-id]` | testplan exists | `docs-generated/{f}/alm-extract/testcases-extract.csv` + `.json` + `testcases-detail.md` |
| `/alm sync-testplan {f} [TC-ID ALM-ID]` | `alm-mapping.csv` exists (bulk) or single mode | updates `test-plan-and-strategy.md` + suite files |

## Folder Conventions

- Specs: `specs/{feature-name}/`
- Plans: `plans/{feature-name}/`
- Tasks: `tasks/{feature-name}/`
- Generated Assets: `output/{feature-name}/`
- Documents: `docs-generated/{feature-name}/`
- Doc Templates: `doc-templates/`

## Rules

All commands must read `constitution/` before generating output. The constitution overrides all other instructions.
If `../../alm-configuration.md` exists, read it for ADO connection and work item settings — those values take precedence over any duplicates in `constitution/10-alm-configuration.md`.
All output paths (`specs/`, `plans/`, `tasks/`, `docs-generated/`, `output/`) are relative to this template's root directory — never relative to the location of the input requirements file, regardless of where the source requirements come from.
