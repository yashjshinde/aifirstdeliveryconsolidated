---
mode: agent
description: "Generate a structured estimate (±20% confidence) from an approved spec. Triggers on: 'estimate-spec', 'structured estimate'."
---

Generate a structured estimate from an approved functional specification produced by a domain agent.

## Usage

```
/solution-estimate-estimate-spec {project} {feature}
```

`{project}`: estimation project name.
`{feature}`: feature name as used in the domain agent (e.g., `account-loyalty-points`).

## Pre-condition Check

1. Locate the spec. Try domain paths from `constitution/10-project-configuration.md` in this order:
   - `{d365-ce-path}/specs/{feature}/spec.md`
   - `{integration-path}/specs/{feature}/spec.md`
   - `{power-apps-path}/specs/{feature}/spec.md`
   - `{d365-fo-path}/docs/{feature}/fdd.md`
   - `{reporting-path}/specs/{feature}/spec.md`
   - `{data-migration-path}/specs/{feature}/spec.md`
   If none found: ask the user for the spec path.

2. Check `status: APPROVED` in the spec front matter.
   If not APPROVED: stop — "Spec for '{feature}' is not APPROVED. Run `/review` in the domain agent first and resolve all BLOCKERs."

2b. **Brownfield Check** — read `brownfield.enabled` in `constitution/10-project-configuration.md`.
    If `true`:
    - Locate `impact-analysis.md` in the same folder as the spec.
    - Check `status: IMPACT-ASSESSED` in impact-analysis.md.
      If not present: stop — "Brownfield mode is enabled. Run `/impact {feature}` in the domain agent first."
    - Read impact-analysis.md — load the classification (NEW / EXTEND / REPLACE / REFERENCED / CONFLICT) for every component.
    If `false`: skip.

## Steps

3. Read all files in `constitution/`.
4. Read the spec.

5. For each functional requirement (FR-NNN) in the spec:
   - Identify the module it belongs to (from spec Section 5 headings).
   - Assign a Req ID matching the FR: FR-001 → REQ-001.
   - Identify the factor(s) needed to deliver this FR — read `constitution/20-factor-definitions.md`.
   - A single FR may produce multiple inventory rows (one per factor required).
   - For the "Type of Integration" column: read from spec; set NA if not integration-related.
   - If a required factor is not in `constitution/20-factor-definitions.md`:
     - Write it to `estimates/{project}/proposed-factors.md`.
     - Mark the row `[FACTOR PENDING]` in the Inventory column and continue.

6. Assign **complexity** per factor row using spec detail:
   - FR with 1–2 business rules, narrow entity scope → Simple/Medium.
   - FR with 3+ business rules, cross-entity, integration trigger, or complex conditions → Complex/Very Complex.
   - Use the "D365 CE Impact" or equivalent section of the FR as the primary signal.

7. Assign **Requirement Level** per factor row:
   - L4: FR fully described, acceptance criteria present, no open questions → high confidence.
   - L3: FR has open questions or ambiguous scope in spec Section 9 → medium confidence.
   - L2: FR is incomplete, depends on unresolved external decisions → low confidence.
   - Do NOT assign L1 or L5 in spec mode.

7b. **Brownfield Rate Adjustment** — if `brownfield.enabled: true`:
    For each factor row, look up the component in impact-analysis.md classifications:
    - NEW → standard rate × 1.00
    - EXTEND → standard rate × 0.60
    - REPLACE → standard rate × 1.15
    - REFERENCED → 0 hrs (no build work)
    - CONFLICT → exclude row; add to Open Questions: "CONFLICT on {component} — resolve before estimating."
    Mark adjusted rows with `[BROWNFIELD: {classification}]` in Solution/Rationale.
    If `false`: skip.

8. Derive hours: Hours = Count × Rate from `constitution/21-factor-rates.md`.

9. Write `estimates/{project}/{feature}-spec-estimate.md` using the format below.

10. If any factors were proposed: print HALT notice:
    ```
    ⚠ FACTORS PENDING: New factors proposed — see estimates/{project}/proposed-factors.md.
    Run /solution-estimate-factors-review {project} before proceeding to /solution-estimate-estimate-build.
    ```

11. Print completion summary:
    - Feature, module count, FR count, inventory row count
    - Total Build Hrs and Total Project Hrs (Build × 2.30)
    - Requirement Level distribution (L2/L3/L4 counts — L4 is highest for spec mode)
    - Open questions count
    - Brownfield: enabled/disabled; CONFLICT count if any
    - Proposed factors: list names if any

---

## Spec Estimate File Format

```yaml
---
estimation-level: SPEC
project: {project}
feature: {feature}
source-spec: {path to spec.md or fdd.md}
date: {date}
status: DRAFT
brownfield: {true/false}
factors-status: CLEAN | FACTORS PENDING
---
```

### Section 1 — Estimate Summary

| Item | Value |
|---|---|
| Estimation Level | SPEC |
| Feature | {feature} |
| Source Spec | {path} |
| Total Modules | {n} |
| Total FRs Analysed | {n} |
| Total Inventory Rows | {n} |
| Total Build Hrs | {n} |
| Total Project Hrs | {n} |
| Confidence | Medium — L2/L3 requirements from approved spec; refines after `/solution-estimate-estimate-plan` (±10%) |

### Section 2 — Requirement Level Distribution

| Level | Count | % |
|---|---:|---:|
| L4 — High Confidence | {n} | {%} |
| L3 — Medium Confidence | {n} | {%} |
| L2 — Low Confidence | {n} | {%} |

### Section 3 — Estimate Inventory

One table per module (matching spec module names):

**Module: {name}**

| Req ID | Module / Feature | Req Title | Priority | Fitment | Type of Integration | Inventory | Req Level | Simple | Medium | Complex | Very Complex | Solution / Rationale | Assumptions / Comments | Open Questions |
|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|

Module total build hrs: **{n} hrs**

### Section 4 — Module Build Hours (Preliminary)

| Factor | S | M | C | VC | S Hrs | M Hrs | C Hrs | VC Hrs | Total Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|

### Section 5 — Open Questions

All open questions from FR analysis (from spec Section 9 and any new questions raised during estimation).

### Section 6 — Brownfield Adjustments *(include only when `brownfield.enabled: true`)*

| Component | Classification | Rate Adjustment Applied | Impact |
|---|---|---|---|

---

## Rules

- Always read `constitution/20-factor-definitions.md` before assigning any factor.
- Never hardcode hour rates — always multiply from `constitution/21-factor-rates.md`.
- Every FR from the spec must produce at least one inventory row.
- Req Level is set per FR completeness, not per factor complexity.
- CONFLICT-classified components are excluded from hours but must be documented in Open Questions.
- Do not generate the formal 3-part deliverable — that is `/solution-estimate-estimate-build`'s job.
