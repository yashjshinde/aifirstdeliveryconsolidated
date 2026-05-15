---
feature: {feature-name}
date: {YYYY-MM-DD}
status: DRAFT | NEEDS REWORK | APPROVED
reviewed-by: Claude Code (/review)
---

# Spec Review — {Feature Display Name}

## Document Control

| Field | Value |
|---|---|
| Feature | {feature-name} |
| Reviewed By | Claude Code (/review) |
| Review Date | {YYYY-MM-DD} |
| Status | {DRAFT \| NEEDS REWORK \| APPROVED} |
| Version | 1.0 |

---

## Table of Contents

- [Verdict](#verdict)
- [Constitution Violations (BLOCKER)](#constitution-violations-blocker)
- [Missing Information (REQUIRED)](#missing-information-required)
- [Best Practice Gaps (RECOMMENDED)](#best-practice-gaps-recommended)
- [Clarification Questions (QUESTION)](#clarification-questions-question)
- [Summary](#summary)

---

## Verdict

**Status: {DRAFT | NEEDS REWORK | APPROVED}**

> APPROVED = zero BLOCKERs, zero REQUIREDs.
> NEEDS REWORK = one or more BLOCKERs or REQUIREDs present.

---

## Constitution Violations (BLOCKER)

> Must be resolved before /plan can proceed.

| ID | Constitution Rule | Spec Section | Issue | Required Action |
|---|---|---|---|---|
| BL-001 | {Rule ref e.g. 01-solution-design §Publisher} | §{N} | {What violates the rule} | {What must change} |

*(none — if no blockers)*

---

## Missing Information (REQUIRED)

> The plan cannot be written without this information.

| ID | Gap | Spec Section | Why It Blocks Planning |
|---|---|---|---|
| RQ-001 | {Missing detail} | §{N} | {Why a technical decision cannot be made without it} |

*(none — if no required gaps)*

---

## Best Practice Gaps (RECOMMENDED)

> Should be addressed but does not block planning.

| ID | Recommendation | Spec Section | Rationale |
|---|---|---|---|
| RC-001 | {Recommendation} | §{N} | {Why this matters} |

---

## Clarification Questions (QUESTION)

> Needs business input — does not block planning but may affect implementation.

| ID | Question | Spec Section | Impact if Unresolved |
|---|---|---|---|
| QS-001 | {Question} | §{N} | {What gets assumed if not answered} |

---

## Summary

| Category | Count |
|---|---|
| BLOCKER | {n} |
| REQUIRED | {n} |
| RECOMMENDED | {n} |
| QUESTION | {n} |
