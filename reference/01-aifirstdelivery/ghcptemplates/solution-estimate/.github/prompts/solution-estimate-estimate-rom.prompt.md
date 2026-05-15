---
mode: agent
description: "Generate a ROM estimate (±40% confidence) from unstructured requirements. Triggers on: 'estimate-rom', 'rough order of magnitude', 'rom estimate'."
---

Generate a Rough Order of Magnitude (ROM) estimate from an unstructured requirements document or description.

## Usage

```
/solution-estimate-estimate-rom {project} {input}
```

`{input}`: path to a requirements file (e.g., `requirements/HLR-sheet.md`) or plain-language requirements pasted inline.
If no input is provided, ask the user for requirements content before proceeding.

## Steps

1. Read all files in `constitution/` — treat every rule as a hard constraint.

1b. **Brownfield Check** — read `brownfield.enabled` in `constitution/10-project-configuration.md`.
    If `true`:
    - Read `{brownfield.docs-path}/component-inventory.md`
    - Read `{brownfield.docs-path}/functional/entity-catalogue.md` (if exists)
    - Note all existing components; this context informs brownfield rate adjustments in step 6b.
    If `false`: skip.

2. Read the input. Accept any format: markdown, plain text, pasted Excel/table content, Word export.
   Extract the raw requirements — do not interpret or restructure yet.

3. Parse requirements into structured form:
   - Group requirements into **Modules** by business capability (e.g., "Customer Management", "Integration Layer").
   - Assign provisional Req IDs: ROM-001, ROM-002, … sequentially across all modules.
   - For each requirement identify: Req Title, Priority (High/Medium/Low), Fitment (Integration / Configuration / Customization / Report), Type of Integration (Batch/Real-time/API — set NA if not applicable).

4. For each requirement, identify the estimation **factor(s)** required to deliver it.
   - Read `constitution/20-factor-definitions.md` — match each deliverable to a defined factor.
   - One requirement may need multiple factors, producing one inventory row per factor.
   - If a requirement needs a factor not in `constitution/20-factor-definitions.md`:
     - Write it to `estimates/{project}/proposed-factors.md` using the format below.
     - Mark the inventory row with `[FACTOR PENDING]` in the Inventory column and continue.

5. For each factor row, assign **complexity** (Simple / Medium / Complex / Very Complex).
   ROM input is unstructured — apply these defaults:
   - When in doubt between Simple and Medium: assign Medium.
   - When in doubt between Medium and Complex: assign Complex.
   - Only assign Very Complex for clearly large-scale or novel requirements.

6. Assign **Requirement Level** per factor row:
   - Default: L2 (unstructured source, low confidence).
   - Downgrade to L1 if the requirement is a title only with no supporting detail.
   - Do NOT assign L3, L4, or L5 in ROM mode.

6b. **Brownfield Rate Adjustment** — if `brownfield.enabled: true`:
    For each factor row, check whether the target component exists in the brownfield component inventory:
    - Not in inventory → classification NEW → standard rate.
    - Exists in inventory → apply adjustments from `constitution/22-estimation-rules.md`:
      EXTEND: 60% of standard rate; REPLACE: standard rate × 1.15; REFERENCED: 0 hrs.
    - Mark adjusted rows with `[BROWNFIELD: {classification}]` in the Solution/Rationale column.
    If `false`: skip.

7. Derive hours: Hours = Count × Rate from `constitution/21-factor-rates.md`.

8. Write `estimates/{project}/rom-estimate.md` using the format below.

9. If any factors were proposed in step 4, print at the end:
   ```
   ⚠ FACTORS PENDING: New factors were proposed — see estimates/{project}/proposed-factors.md.
   Run /solution-estimate-factors-review {project} before proceeding to /solution-estimate-estimate-build.
   ```

10. Print completion summary:
    - Total modules, total requirements, total inventory rows
    - Grand Total Build Hrs and Total Project Hrs (Build × 2.30)
    - Requirement Level distribution (L1 count, L2 count)
    - Open questions count
    - Brownfield: enabled/disabled
    - Proposed factors: list names if any

---

## ROM Estimate File Format

```yaml
---
estimation-level: ROM
project: {project}
date: {date}
status: DRAFT
brownfield: {true/false}
factors-status: CLEAN | FACTORS PENDING
---
```

### Section 1 — ROM Summary

| Item | Value |
|---|---|
| Estimation Level | ROM |
| Input Source | {file path or "inline description"} |
| Total Modules | {n} |
| Total Requirements | {n} |
| Total Inventory Rows | {n} |
| Total Build Hrs (rough) | {n} |
| Total Project Hrs (rough) | {n} |
| Confidence | Low — L4/L5 requirements; estimate refines after `/solution-estimate-estimate-spec` (±20%) or `/solution-estimate-estimate-plan` (±10%) |

> **ROM Uncertainty:** This estimate is ±40% due to unstructured input.

### Section 2 — Requirement Level Distribution

| Level | Count | % |
|---|---:|---:|
| L1 — Placeholder | {n} | {%} |
| L2 — Low Confidence | {n} | {%} |

### Section 3 — Module Summaries

One table per module:

**Module: {name}**

| Req ID | Module / Feature | Req Title | Priority | Fitment | Type of Integration | Inventory | Req Level | Simple | Medium | Complex | Very Complex | Solution / Rationale | Assumptions / Comments | Open Questions |
|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|

Module total build hrs: **{n} hrs**

### Section 4 — Open Questions

All unresolved questions from requirements parsing.

### Section 5 — Key Assumptions

All assumptions made during estimation.

---

## proposed-factors.md Format

```markdown
# Proposed Factors

## {Factor Name}

- **Proposed by**: /solution-estimate-estimate-rom {project}
- **Trigger requirement**: {Req ID} — {Req Title}
- **Rationale**: Why this factor is needed and why it does not map to an existing factor in 20-factor-definitions.md.
- **Suggested complexity descriptions**:
  - Simple: ...
  - Medium: ...
  - Complex: ...
  - Very Complex: ...
- **Suggested rates (hrs)**: S={n}, M={n}, C={n}, VC={n}
- **Status**: PENDING
```

---

## Rules

- Always read `constitution/20-factor-definitions.md` before assigning any factor.
- Never hardcode hour rates — always multiply from `constitution/21-factor-rates.md`.
- ROM estimates are always L1 or L2 — never assign L3/L4/L5.
- If a requirement cannot be mapped to any factor, write a proposed factor rather than skipping the row.
- Do not generate the formal 3-part deliverable — that is `/solution-estimate-estimate-build`'s job.
