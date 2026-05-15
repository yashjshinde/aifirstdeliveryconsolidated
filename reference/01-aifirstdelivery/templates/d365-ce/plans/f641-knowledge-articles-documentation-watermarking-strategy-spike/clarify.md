---
feature: f641-knowledge-articles-documentation-watermarking-strategy-spike
date: 2026-05-08
status: PARTIALLY READY
reviewed-by: Claude Code (/clarify)
parent-epic-id: "459"
feature-alm-id: "641"
plan-ref: plans/f641-knowledge-articles-documentation-watermarking-strategy-spike/plan.md
spec-ref: specs/f641-knowledge-articles-documentation-watermarking-strategy-spike/spec.md
---

# Plan Clarification Report — Knowledge Articles - Documentation Watermarking Strategy - SPIKE

## Verdict: PARTIALLY READY

| Status counts | |
|---|---|
| Total tasks | 12 |
| READY | 0 |
| QUESTION (proceed; tracked) | 12 |
| BLOCKED (must resolve before /task) | 0 |

> **Verdict rule:**
> - **TASK-READY** — every task READY.
> - **PARTIALLY READY** — at least one QUESTION, no BLOCKERs. `/task` proceeds; flagged tasks carry the assumption note.
> - **NOT READY** — at least one BLOCKER. `/task` skips BLOCKED tasks and warns.

---

## Task Readiness Assessment

| Task ID | Title | Status | Issues |
|---|---|---|---|
| T-001 | Configure Knowledge Article versioning + IsRootArticle / Related Articles linkage | QUESTION | See Questions section |
| T-002 | Enable column-level audit on Knowledge Article governance fields | QUESTION | See Questions section |
| T-003 | Configure Knowledge Search settings to respect user language (Constitution §15) | QUESTION | See Questions section |
| T-004 | Localization — register per-culture RESX / Web Resources for all user-facing strings | QUESTION | See Questions section |
| T-005 | Translation export from Dev → CI commit (per Constitution §07 Translation CI) | QUESTION | See Questions section |
| T-006 | System / UAT test execution per `docs-generated/{f}/test-cases/` | QUESTION | See Questions section |
| T-007 | Configure Knowledge Article versioning + IsRootArticle / Related Articles linkage | QUESTION | See Questions section |
| T-008 | Enable column-level audit on Knowledge Article governance fields | QUESTION | See Questions section |
| T-009 | Configure Knowledge Search settings to respect user language (Constitution §15) | QUESTION | See Questions section |
| T-010 | Localization — register per-culture RESX / Web Resources for all user-facing strings | QUESTION | See Questions section |
| T-011 | Translation export from Dev → CI commit (per Constitution §07 Translation CI) | QUESTION | See Questions section |
| T-012 | System / UAT test execution per `docs-generated/{f}/test-cases/` | QUESTION | See Questions section |

---

## Blockers (must resolve before /task)

| ID | Task | Issue | Required Information |
|---|---|---|---|
| _(none)_ | _–_ | _–_ | _–_ |

> **AI Notes** — No BLOCKER-level ambiguity detected. Tasks can proceed to /task with the QUESTIONs below acknowledged.

---

## Questions (can proceed; flagged in task card)

| ID | Task | Question | Assumption if Unanswered |
|---|---|---|---|
| QS-001 | T-001 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-002 | T-002 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-003 | T-003 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-004 | T-004 | supported-languages list (per `constitution/10-alm-configuration.md`) currently is en-US only. If multi-language is intended at first ship, confirm the language set before generating RESX scaffolding. | Multi-language-ready posture (Constitution §15) — generate RESX skeleton for en-US only at /implement; additional languages added later as a config event. |
| QS-005 | T-004 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-006 | T-005 | supported-languages list (per `constitution/10-alm-configuration.md`) currently is en-US only. If multi-language is intended at first ship, confirm the language set before generating RESX scaffolding. | Multi-language-ready posture (Constitution §15) — generate RESX skeleton for en-US only at /implement; additional languages added later as a config event. |
| QS-007 | T-005 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-008 | T-006 | Test environment readiness — does Test environment have upstream Fusion → D365 sync data populated to a representative volume? | Test data fixture (per Test Plan §6) is loaded; Fusion sync features 463/464/546/575 are live in Test. |
| QS-009 | T-006 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-010 | T-007 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-011 | T-008 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-012 | T-009 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-013 | T-010 | supported-languages list (per `constitution/10-alm-configuration.md`) currently is en-US only. If multi-language is intended at first ship, confirm the language set before generating RESX scaffolding. | Multi-language-ready posture (Constitution §15) — generate RESX skeleton for en-US only at /implement; additional languages added later as a config event. |
| QS-014 | T-010 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-015 | T-011 | supported-languages list (per `constitution/10-alm-configuration.md`) currently is en-US only. If multi-language is intended at first ship, confirm the language set before generating RESX scaffolding. | Multi-language-ready posture (Constitution §15) — generate RESX skeleton for en-US only at /implement; additional languages added later as a config event. |
| QS-016 | T-011 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |
| QS-017 | T-012 | Test environment readiness — does Test environment have upstream Fusion → D365 sync data populated to a representative volume? | Test data fixture (per Test Plan §6) is loaded; Fusion sync features 463/464/546/575 are live in Test. |
| QS-018 | T-012 | f641 is explicitly a SPIKE per the ALM source. Output is a research finding / recommendation, not deliverable code. Confirm /task should treat SPIKE outcomes as documentation-only deliverables. | All tasks in this plan produce documentation / decision recommendations rather than D365 customisations. /task will emit research-task cards instead of dev-ready cards. |

> **AI Notes** — Most QUESTIONs at this stage are deliberate planning gaps (e.g., schema data type deferred to /tdd; wireframe sign-off pending; multi-language scope still en-US only). They do not block /task but each carries a documented assumption that will be embedded in the generated task card.

---

## Dependency Risks

| Risk | Tasks Affected | Mitigation |
|---|---|---|
| Upstream Fusion → D365 sync (Features 463 / 464 / 546 / 575) not live in target environment | All tasks in this plan | Blocker on /implement; verify sync features are deployed before this feature's /task cards are picked up. |
| OPEX wireframe sign-off pending for form / 360-view / layout work | All Configuration tasks touching forms or views | Hold /task generation for layout tasks until wireframes are signed off. |
| Translation file pipeline not configured in CI (per Constitution §07) | Localization + Translation export tasks | Configure `pac solution export-translation` step in the release pipeline before Phase 4. |
| FS / URS / RSO solution version drift | Tasks touching `msdyn_*` entities | Pin FS / URS / RSO versions in CI per Constitution §07; re-validate in Test before each release. |
| Multi-domain leakage (this feature accidentally absorbs ADF / SFTP work that belongs to data-migration agent) | All schema-style tasks | /review BLOCKER catches this; if a Task starts referencing ADF/SFTP, escalate to /split-spec. |

---

## Split Recommendations

| Task ID | Reason | Suggested Subtasks |
|---|---|---|
| _(none — all tasks are S or M complexity per the plan)_ | _–_ | _–_ |

---

## Next Step

QUESTIONs are present but no BLOCKERs. Proceed with caution:
- `/tdd f641-knowledge-articles-documentation-watermarking-strategy-spike` — should answer the schema-detail QUESTIONs.
- `/task f641-knowledge-articles-documentation-watermarking-strategy-spike` — generates cards; QUESTIONs are embedded as caveats.
- Resolve QS items before /implement so developers do not have to default.

---

> **AI Notes (clarify-level)** — Plan was generated from spec authored under `intake: structured` + `l3-intake: optional`. PBIs and Tasks are ⚑ NEW (generated by /plan); the ALM Agent will create them in ADO under the existing Feature ALM ID. This clarify report is the gate between /plan and /tdd / /task — it surfaces ambiguity that would otherwise force developers to assume.
