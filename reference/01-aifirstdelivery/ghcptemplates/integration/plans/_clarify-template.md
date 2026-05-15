---
feature: {feature-name}
date: {YYYY-MM-DD}
status: NOT READY | PARTIALLY READY | TASK-READY
reviewed-by: Claude Code (/clarify)
---

# Plan Clarification Report — {Feature Display Name}

## Verdict: {NOT READY | PARTIALLY READY | TASK-READY}

---

## Task Readiness Assessment

| Task ID | Title | Status | Issues |
|---|---|---|---|
| {L4-Prefix}-001 | {Title} | READY | — |
| {L4-Prefix}-002 | {Title} | BLOCKED | See BL-001 |
| {L4-Prefix}-003 | {Title} | QUESTION | See QS-001 |

---

## Blockers (must resolve before /task)

| ID | Task | Issue | Required Information |
|---|---|---|---|
| BL-001 | {L4-Prefix}-XXX | {Ambiguity} | {Decision needed} |

*(none)*

---

## Questions (can proceed; flagged in task card)

| ID | Task | Question | Assumption if Unanswered |
|---|---|---|---|
| QS-001 | {L4-Prefix}-XXX | {Question} | {What will be assumed} |

---

## Dependency Risks

| Risk | Tasks Affected | Mitigation |
|---|---|---|
| {Risk} | {L4-Prefix}-XXX | {How to handle} |

---

## Split Recommendations

| Task ID | Reason | Suggested Subtasks |
|---|---|---|
| {L4-Prefix}-XXX | XL complexity | {Subtask 1}, {Subtask 2} |

*(none)*
