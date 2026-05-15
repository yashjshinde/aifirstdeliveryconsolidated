Generate a detailed estimate from an approved plan produced by a domain agent.

## Usage

```
/estimate-plan {project} {feature}
```

`{project}`: estimation project name.
`{feature}`: feature name as used in the domain agent.

## Pre-condition Check

1. Locate the plan. Try domain paths from `constitution/10-project-configuration.md` in this order:
   - `{d365-ce-path}/plans/{feature}/plan.md` + `work-items.yaml`
   - `{integration-path}/plans/{feature}/plan.md` + `work-items.yaml`
   - `{power-apps-path}/plans/{feature}/plan.md` + `work-items.yaml`
   - `{d365-fo-path}/plans/{feature}/plan.md` + `work-items.yaml`
   - `{reporting-path}/plans/{feature}/plan.md` + `work-items.yaml`
   - `{data-migration-path}/plans/{feature}/plan.md` + `work-items.yaml`
   If none found: ask the user for the plan path.

2. Check the plan readiness gate:
   - D365 CE / Integration / Power Apps / Reporting / Data Migration: check `plans/{feature}/clarify.md` for `status: TASK-READY`.
   - D365 F&O: check `plans/{feature}/plan-review.md` for `status: PLAN APPROVED`.
   If neither gate is met: stop — "Plan for '{feature}' is not ready. Run `/clarify` or `/plan-review` in the domain agent first."

2b. **Brownfield Check** — read `brownfield.enabled` in `constitution/10-project-configuration.md`.
    If `true`:
    - Locate `impact-analysis.md` for this feature.
    - Read the `brownfield-action` field stamped on Level-4 tasks in `work-items.yaml`.
    - These per-task classifications drive rate adjustments in step 7b.
    If `false`: skip.

## Steps

3. Read all files in `constitution/`.
4. Read `plan.md` and `work-items.yaml`.

5. Map plan tasks to estimation factors. Use the Level-4 task `component-type` field as the primary signal:

   **D365 CE / Power Apps / Integration component types:**

   | component-type | Factor |
   |---|---|
   | Plugin | CRM Plugin C&UT |
   | WebResource (JS) | Add'l Javascript on Entity |
   | WebResource (HTML) | HTML WebResource |
   | PCF | PCF Control Development |
   | SchemaChange (existing entity) | CRM Existing Entity C&UT |
   | SchemaChange (new entity) | CRM New Entity C&UT |
   | Flow | Power Automate C&UT |
   | Configuration (security) | Security Role |
   | Configuration (app/nav) | Model Driven App Changes |
   | Configuration (other) | CRM Existing Entity C&UT |
   | Integration | Integration or Azure Function Build & UT |

   **Reporting component types:**

   | component-type | Factor |
   |---|---|
   | Dataset | Power BI Dataset (Data Model) |
   | Measure | DAX Measure Set |
   | Report | Power BI Interactive Report |
   | RLS | RLS Design & Implementation |
   | SSRS | Power BI Paginated / SSRS Report |
   | Workspace | Power BI Workspace Setup & ALM |
   | StoredProc | SSRS Stored Procedure |

   For D365 F&O plans: map X++ object-type prefixes to the nearest equivalent factor (e.g., Extension class → CRM Plugin C&UT equivalent; Data Entity → Integration).

   If a task's component-type does not map to any factor: write a proposed factor to `estimates/{project}/proposed-factors.md`.

   Group inventory rows by the L1/L2 plan hierarchy (plan module = estimate module).
   Assign Req ID using the L3/Story ID from the plan (e.g., US-001 → REQ-US-001).

6. Assign **complexity** using the plan task complexity field:
   - S → Simple
   - M → Medium
   - L → Complex
   - XL → Very Complex

7. Assign **Requirement Level** per factor row:
   - L5: task has full acceptance criteria, no open questions in `clarify.md` → fully detailed.
   - L4: task has acceptance criteria but minor clarifications noted → high confidence.
   - L3: linked FR in spec had open questions that remain unresolved.
   - Do NOT assign L1 or L2 in plan mode.

7b. **Brownfield Rate Adjustment** — if `brownfield.enabled: true`:
    Read `brownfield-action` from each Level-4 task in `work-items.yaml`:
    - NEW → standard rate × 1.00
    - EXTEND → standard rate × 0.60
    - REPLACE → standard rate × 1.15
    - REFERENCED → 0 hrs
    - CONFLICT → exclude; document in Open Questions.
    Mark adjusted rows with `[BROWNFIELD: {brownfield-action}]` in Solution/Rationale.
    If `false`: skip.

8. Derive hours: Hours = Count × Rate from `constitution/21-factor-rates.md`.

9. Write `estimates/{project}/{feature}-plan-estimate.md` using the format below.

10. If any factors were proposed: print HALT notice:
    ```
    ⚠ FACTORS PENDING: New factors proposed — see estimates/{project}/proposed-factors.md.
    Run /factors-review {project} before proceeding to /estimate-build.
    ```

11. Print completion summary:
    - Feature, module count, task count, inventory row count
    - Total Build Hrs and Total Project Hrs (Build × 2.30)
    - Requirement Level distribution (L3/L4/L5 counts — L5 is highest for plan mode)
    - Brownfield: enabled/disabled; CONFLICT count if any
    - Proposed factors: list names if any

---

## Plan Estimate File Format

```yaml
---
estimation-level: PLAN
project: {project}
feature: {feature}
source-plan: {path to plan.md}
date: {date}
status: DRAFT
brownfield: {true/false}
factors-status: CLEAN | FACTORS PENDING
---
```

### Section 1 — Estimate Summary

| Item | Value |
|---|---|
| Estimation Level | PLAN |
| Feature | {feature} |
| Source Plan | {path} |
| Total Modules | {n} |
| Total Plan Tasks Analysed | {n} |
| Total Inventory Rows | {n} |
| Total Build Hrs | {n} |
| Total Project Hrs | {n} |
| Confidence | High — L1/L2 requirements from approved plan |

### Section 2 — Requirement Level Distribution

| Level | Count | % |
|---|---:|---:|
| L5 — Fully Detailed | {n} | {%} |
| L4 — High Confidence | {n} | {%} |
| L3 — Medium Confidence | {n} | {%} |

### Section 3 — Estimate Inventory

One table per module:

**Module: {name}**

| Req ID | Module / Feature | Req Title | Priority | Fitment | Type of Integration | Inventory | Req Level | Simple | Medium | Complex | Very Complex | Solution / Rationale | Assumptions / Comments | Open Questions |
|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|

Module total build hrs: **{n} hrs**

### Section 4 — Module Build Hours (Preliminary)

| Factor | S | M | C | VC | S Hrs | M Hrs | C Hrs | VC Hrs | Total Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|

### Section 5 — Brownfield Adjustments *(include only when `brownfield.enabled: true`)*

| Task ID | Component | brownfield-action | Rate Adjustment Applied | Impact |
|---|---|---|---|---|

---

## Rules

- Always read `constitution/20-factor-definitions.md` before assigning any factor.
- Never hardcode hour rates — always multiply from `constitution/21-factor-rates.md`.
- Every Level-4 task in the plan must produce at least one inventory row.
- Use the plan's `component-type` field as the primary factor mapping signal.
- Req Level is derived from plan task readiness and underlying FR clarity.
- Do not generate the formal 3-part deliverable — that is `/estimate-build`'s job.
