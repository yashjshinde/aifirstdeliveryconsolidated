---
mode: agent
description: "Review and approve proposed estimation factors before build deliverable is generated. Triggers on: 'factors-review', 'approve factors', 'factor review'."
---

Review and approve proposed estimation factors that were identified during an estimate run.
Sets the FACTORS APPROVED gate required by `/solution-estimate-estimate-build` when new factors are pending.

## Usage

```
/solution-estimate-factors-review {project}
```

## Pre-condition Check

1. Check `estimates/{project}/proposed-factors.md` exists.
   If not: "No proposed factors found for project '{project}'. Run `/solution-estimate-estimate-rom`, `/solution-estimate-estimate-spec`, or `/solution-estimate-estimate-plan` first."

## Steps

2. Read all files in `constitution/`, including `20-factor-definitions.md` and `21-factor-rates.md`.
3. Read `estimates/{project}/proposed-factors.md`.

4. For each proposed factor, evaluate in this order:

   **a. Check for existing mapping:**
   Does this factor map to an existing factor in `constitution/20-factor-definitions.md`?
   - If yes: mark status REMAPPED. State exactly which existing factor to use and why.
   - Prefer remapping over creating a new factor.

   **b. Evaluate as a new factor (only if no mapping found):**
   Approve if ALL of the following are true:
   - It represents a genuinely distinct delivery activity not absorbed by any existing factor.
   - The S/M/C/VC complexity descriptions are coherent, non-overlapping, and escalate consistently.
   - The proposed rates are consistent with comparable existing factors (e.g., a new custom report factor should be in the range of Excel Report rates).
   - Mark status APPROVED or REJECTED with clear reasoning.

   **c. If APPROVED:** provide the finalised definition:
   - Factor name following the naming convention: `{Platform/Technology} {Deliverable/Activity} {Stage}`
   - Finalized S/M/C/VC descriptions
   - Recommended hour rates (S/M/C/VC)

5. Write `estimates/{project}/factor-review.md` with all verdicts.

6. Resolution:
   - If ALL proposed factors are APPROVED or REMAPPED:
     - Append approved new factors to `constitution/20-factor-definitions.md`.
     - Append approved new factor rates to `constitution/21-factor-rates.md`.
     - Set `status: FACTORS APPROVED` in `estimates/{project}/factor-review.md`.
   - If any factor remains REJECTED and cannot be remapped:
     - Set `status: FACTORS PENDING` in `factor-review.md`.
     - Print: "BLOCKED: {n} factor(s) were rejected. Update `estimates/{project}/proposed-factors.md` with revised definitions and re-run `/solution-estimate-factors-review {project}`."

7. Print completion summary:
   - Proposed factors reviewed: {n}
   - APPROVED: {n} (list factor names)
   - REMAPPED: {n} (list: proposed name → existing factor)
   - REJECTED: {n} (list factor names)
   - Overall status: FACTORS APPROVED / FACTORS PENDING

---

## factor-review.md Format

```yaml
---
project: {project}
date: {date}
status: FACTORS APPROVED | FACTORS PENDING
reviewed-count: {n}
approved: {n}
remapped: {n}
rejected: {n}
---
```

## Factor Verdicts

### {Proposed Factor Name}

| Field | Value |
|---|---|
| Trigger Requirement | {Req ID — Req Title from proposed-factors.md} |
| Proposed Rationale | {copied from proposed-factors.md} |
| **Verdict** | APPROVED / REMAPPED / REJECTED |
| **Reasoning** | {explanation} |
| **If REMAPPED** | Use existing factor: **{existing factor name}** |

#### Approved Definition *(only if APPROVED)*

**Final Factor Name:** {name}

| Complexity | Description |
|---|---|
| Simple | {description} |
| Medium | {description} |
| Complex | {description} |
| Very Complex | {description} |

**Hour Rates:** Simple = {n} hrs | Medium = {n} hrs | Complex = {n} hrs | Very Complex = {n} hrs

---

## Rules

- Be conservative: only approve factors that genuinely cannot be absorbed into existing ones.
- When remapping, state the exact existing factor name from `constitution/20-factor-definitions.md`.
- Approved factor names must follow the naming convention of existing factors.
- Do not approve factors with overlapping scope — merge into nearest existing factor instead.
- Only set FACTORS APPROVED when ALL proposed factors are either APPROVED or REMAPPED (none REJECTED).
