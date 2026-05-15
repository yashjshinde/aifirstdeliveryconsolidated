Generate the formal 3-part estimation deliverable from all estimates collected for a project.

## Usage

```
/estimate-build {project}
```

## Pre-condition Check

1. Check that at least one estimate file exists in `estimates/{project}/`:
   `rom-estimate.md`, `*-spec-estimate.md`, or `*-plan-estimate.md`.
   If none found: "No estimates found for project '{project}'. Run `/estimate-rom`, `/estimate-spec`, or `/estimate-plan` first."

2. Check for proposed factors:
   If `estimates/{project}/proposed-factors.md` exists:
   - Read `estimates/{project}/factor-review.md`. Check `status: FACTORS APPROVED`.
   - If not FACTORS APPROVED or file missing: stop — "New factors are pending review. Run `/factors-review {project}` first."

## Steps

3. Read all files in `constitution/`.

4. Collect all estimate files for this project:
   - `estimates/{project}/rom-estimate.md` (if exists)
   - All `estimates/{project}/*-spec-estimate.md` files
   - All `estimates/{project}/*-plan-estimate.md` files

5. For each feature/module, determine the **best available estimate** (use the most detailed):
   - PLAN estimate exists → use plan (most detailed, L4/L5).
   - SPEC estimate exists → use spec (L3/L4).
   - Neither → fall back to ROM data for that module.
   Record the estimation level used per module in the output header.

6. Merge all inventory rows from selected estimates into a consolidated inventory:
   - Group by Module.
   - Within each module, group by Req ID.
   - Preserve all columns including Req Level.
   - If a requirement appears in both spec and plan estimates, use plan rows only.

7. Apply approved custom factors from `estimates/{project}/factor-review.md` (if exists):
   - Use the approved rates for custom factors when recalculating hours.
   - Recalculate affected rows using `constitution/21-factor-rates.md` plus approved custom rates.

8. Generate **Business Req Detail** → `estimates/{project}/business-req-detail.md`:
   - Full consolidated inventory table with all columns including Req Level.
   - One `## Module: {name}` section per module.
   - Footer: Grand Total row showing total counts and total build hours.
   - Follow `doc-templates/business-req-detail-template.md`.

9. Generate **Module Build Hours** → `estimates/{project}/module-build-hrs.md`:
   - One table per module listing ALL factors from `constitution/20-factor-definitions.md` (show zeros for unused factors).
   - Columns: Factor | S (Count) | M (Count) | C (Count) | VC (Count) | S Hrs | M Hrs | C Hrs | VC Hrs | Total Hrs.
   - Grand Summary table at end: Module | Total Build Hrs.
   - Follow `doc-templates/module-build-hrs-template.md`.

10. Generate **Module Overall Hours** → `estimates/{project}/module-overall-hrs.md`:
    - Read phase multipliers from `constitution/22-estimation-rules.md`.
    - Apply: Plan & Design (×0.20), Test Creation (×0.25), Test Execution (×0.35), Dev Fix (×0.35), Deployment (×0.15).
    - Total Project Hrs = Org Build & UT Hrs × 2.30.
    - Summary Notes table (total requirements, rows, modules, build hrs, project hrs).
    - Key Assumptions & Open Questions section — aggregate from all estimate files.
    - Follow `doc-templates/module-overall-hrs-template.md`.

11. Print completion summary:
    - 3 output files generated (list paths).
    - Total Inventory Rows, Total Build Hrs, Total Project Hrs.
    - Estimation level used per module/feature.
    - Requirement Level distribution (L1–L5 counts across all inventory rows).
    - Any custom factors applied.

---

## Rules

- The formal deliverable always uses the most detailed estimate available per feature — never downgrade.
- Phase multipliers must always be sourced from `constitution/22-estimation-rules.md` — never hardcode.
- Approved custom factors from `factor-review.md` take precedence for their specific rows.
- All three output files must be consistent: hours in `business-req-detail.md` must sum to match `module-build-hrs.md` module totals.
- Do not re-run estimates — consolidate only from existing estimate files.
- Brownfield rate adjustments are already applied in the source estimate files — do not re-apply.
