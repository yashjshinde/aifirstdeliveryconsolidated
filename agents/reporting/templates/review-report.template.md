---
review-target: "{spec|plan|fdd|tdd|blueprint|test-plan|task-validation}"
feature-id: "{feature-slug}"
agent: reporting
generated-by: "{/review|/clarify|/fdd|/tdd|/blueprint|/test-plan|/validate}"
verdict: "{APPROVED|REJECTED|PENDING}"
generated-at: "<populated at run time>"
---

# Review report — {target} — {feature-slug}

> Generated against the matching checklist in `templates/checklists/`.

## Summary

- Total findings: NN
- BLOCKER: NN
- REQUIRED: NN (accepted: NN)
- WARNING: NN

Verdict: **{APPROVED|REJECTED|PENDING}**

## Findings

| ID | Category | Severity | Finding | Location | Accepted by | Acceptance reason |
|---|---|---|---|---|---|---|

## Acceptance log

(Per accepted REQUIRED — rationale captured for audit.)

## Gate transition

(When the caller is `--approve`.)
