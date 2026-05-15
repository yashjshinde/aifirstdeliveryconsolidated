---
feature: f721-site-management-functional-location-360-view
date: 2026-05-08
status: PARTIALLY READY
reviewed-by: Claude Code (/clarify)
parent-epic-id: "454"
feature-alm-id: "721"
plan-ref: plans/f721-site-management-functional-location-360-view/plan.md
spec-ref: specs/f721-site-management-functional-location-360-view/spec.md
---

# Plan Clarification Report — Site Management - Functional Location 360 View

## Verdict: PARTIALLY READY

| Status counts | |
|---|---|
| Total tasks | 6 |
| READY | 0 |
| QUESTION (proceed; tracked) | 6 |
| BLOCKED (must resolve before /task) | 0 |

> **Verdict rule:**
> - **TASK-READY** — every task READY.
> - **PARTIALLY READY** — at least one QUESTION, no BLOCKERs. `/task` proceeds; flagged tasks carry the assumption note.
> - **NOT READY** — at least one BLOCKER. `/task` skips BLOCKED tasks and warns.

---

## Task Readiness Assessment

| Task ID | Title | Status | Issues |
|---|---|---|---|
| T-001 | Clone `Functional Location — Main` form and configure 360 layout | QUESTION | See Questions section |
| T-002 | Add sub-grids: Contacts, Assets, Cases, Work Orders, Invoices | QUESTION | See Questions section |
| T-003 | Configure parent FL lookup and hierarchy view | QUESTION | See Questions section |
| T-004 | Localization — register per-culture RESX / Web Resources for all user-facing strings | QUESTION | See Questions section |
| T-005 | Translation export from Dev → CI commit (per Constitution §07 Translation CI) | QUESTION | See Questions section |
| T-006 | System / UAT test execution per `docs-generated/{f}/test-cases/` | QUESTION | See Questions section |

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
| QS-001 | T-001 | Form / view layout requires OPEX wireframe sign-off (per Constitution §10 CR-001 + Solution Blueprint §3.4). | Sign-off obtained before /task generation. If absent at /task time, layout-specific Tasks will be deferred. |
| QS-002 | T-002 | Form / view layout requires OPEX wireframe sign-off (per Constitution §10 CR-001 + Solution Blueprint §3.4). | Sign-off obtained before /task generation. If absent at /task time, layout-specific Tasks will be deferred. |
| QS-003 | T-003 | Form / view layout requires OPEX wireframe sign-off (per Constitution §10 CR-001 + Solution Blueprint §3.4). | Sign-off obtained before /task generation. If absent at /task time, layout-specific Tasks will be deferred. |
| QS-004 | T-004 | supported-languages list (per `constitution/10-alm-configuration.md`) currently is en-US only. If multi-language is intended at first ship, confirm the language set before generating RESX scaffolding. | Multi-language-ready posture (Constitution §15) — generate RESX skeleton for en-US only at /implement; additional languages added later as a config event. |
| QS-005 | T-005 | supported-languages list (per `constitution/10-alm-configuration.md`) currently is en-US only. If multi-language is intended at first ship, confirm the language set before generating RESX scaffolding. | Multi-language-ready posture (Constitution §15) — generate RESX skeleton for en-US only at /implement; additional languages added later as a config event. |
| QS-006 | T-006 | Test environment readiness — does Test environment have upstream Fusion → D365 sync data populated to a representative volume? | Test data fixture (per Test Plan §6) is loaded; Fusion sync features 463/464/546/575 are live in Test. |

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
- `/tdd f721-site-management-functional-location-360-view` — should answer the schema-detail QUESTIONs.
- `/task f721-site-management-functional-location-360-view` — generates cards; QUESTIONs are embedded as caveats.
- Resolve QS items before /implement so developers do not have to default.

---

> **AI Notes (clarify-level)** — Plan was generated from spec authored under `intake: structured` + `l3-intake: optional`. PBIs and Tasks are ⚑ NEW (generated by /plan); the ALM Agent will create them in ADO under the existing Feature ALM ID. This clarify report is the gate between /plan and /tdd / /task — it surfaces ambiguity that would otherwise force developers to assume.
