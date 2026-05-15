---
adr: 0001
title: /review is spec-only; non-spec checklists consumed inline by their generating command
status: accepted
decided-on: 2026-05-14
superseded-by:
supersedes:
master-plan-refs: [§5, §7.1, §7.2, §7.7, §10, §11, §13, §16, §26-R34]
design-doc-refs: []
---

# ADR-0001 — `/review` is spec-only; non-spec checklists consumed inline by their generating command

## Status

`accepted` — decided 2026-05-14 (matches master-plan revision **R34**).

## Context

During Resume of the consolidated design, an inconsistency was surfaced in the master plan ([reference/00-spec-driven-development-humble-muffin.md](../../reference/00-spec-driven-development-humble-muffin.md)):

- **§5 line 350** annotated the agent skeleton command file as `review.md # /review [spec|plan|task]` — implying three doc types.
- **§10 workflow.yaml** at lines 2019–2020 only used `/review` for the **spec** gate transitions: `SPEC_DRAFT → SPEC_REVIEWED: /review` and `SPEC_REVIEWED → SPEC_APPROVED: /review --approve`. Plan was already gated by `/clarify --approve` (line 2025); task by `/validate --approve` (line 2029).
- **§13 line 2218** referenced `/review fdd --feature {f}` for feature-delta FDD review — a command with no definition anywhere else in the spec.
- **§5 line 399** listed six review checklists (`spec-review`, `plan-review`, `fdd-review`, `tdd-review`, `blueprint-review`, `test-plan-review`) implying all six are consumed by `/review` — but only `spec-review` had a workflow-gated invocation.
- **§7.7 line 1520 and §16 line 2495** contrasted brownfield's auto-mode against "CE / F&O / Integration / Reporting which keep human-in-loop review" — phrasing that implies non-brownfield agents have human review on every doc type.

The user flagged this in [reference/instruction.md](../../reference/instruction.md): *"in spec you have mentioned review [spec|plan|task] review must only run on spec? Kindly check and update."*

## Decision

`/review` is **spec-only**. It is the human-gated approval command for the spec phase, and only the spec phase. Concretely:

- `/review` produces `reviews/spec-review.md` (consumes `spec-review.checklist.md`).
- `/review --approve` transitions `SPEC_REVIEWED → SPEC_APPROVED`.
- **Plan** continues to be gated by `/clarify --approve` (consumes `plan-review.checklist.md`).
- **Task** continues to be gated by `/validate --approve` (no checklist file — pre-existing gap; flagged in §25 for follow-up).
- **FDD / TDD / blueprint / test-plan** have **no separate `/review` invocation**. Their checklists (`fdd-review.checklist.md`, `tdd-review.checklist.md`, `blueprint-review.checklist.md`, `test-plan-review.checklist.md`) are consumed **inline** by their generating command (`/fdd`, `/tdd`, `/blueprint`, `/test-plan`) as a self-check at end of generation; findings fold into a "Quality self-check" appendix at the bottom of the produced doc. `doc_lint` enforces the appendix's presence and surfaces BLOCKER findings as failed writes.
- **All six checklist files** are preserved on disk at `agents/{a}/templates/checklists/` — only the consuming command changes.
- For domain-scoped docs (CE / Integration / Reporting per R18), the inline self-check evaluates only the **feature-delta** tagged with the current `feature-id` (via §13's HTML-comment markers + row-level `feature-id` columns).
- The `reviews/` folder under each feature keeps three artefacts only: `spec-review.md` (from `/review`), `clarify-report.md` (from `/clarify`), `validate-report.md` (from `/validate`). No `fdd-review.md` / `tdd-review.md` / etc. files.

## Alternatives considered

- **Option B — Advisory `/review {doc}` for byproducts.** `/review` would gate the spec, but `/review fdd|tdd|blueprint|test-plan` would still exist as an advisory (non-gating) invocation producing a standalone report. *Rejected* because it (a) doubles the command surface without a workflow purpose, (b) creates two ways to invoke the same checklist (during generation vs after), (c) preserves the original ambiguity rather than resolving it.
- **Option C — Collapse `/clarify` and `/validate` into `/review`.** A universal `/review` would gate every doc type (spec, plan, task, FDD, TDD, blueprint, test-plan). *Rejected* because (a) `/clarify` and `/validate` carry domain semantics beyond pure review (clarification rounds, validation against task-card structure) that aren't captured by "review", (b) the workflow DAG would need restructuring across three phases, (c) the verb specificity (`clarify` for plan, `validate` for task) is intentional disambiguation.

## Consequences

**Positive:**
- The master plan is internally consistent: `/review` appears exactly where the workflow DAG uses it.
- Mechanical doc quality (frontmatter, TOC, AI Summary, traceability, multi-suite coverage) lives where it's produced, enforced by `doc_lint` + per-doc-type checklist. No "wait, did someone run `/review fdd`?" question.
- User review burden concentrates on the three meaningful gates (spec / plan-clarify / task-validate), not on every byproduct.

**Negative:**
- The inline self-check pattern is new and needs to be authored when each of `/fdd`, `/tdd`, `/blueprint`, `/test-plan` is built — adds a small implementation overhead per command (re-read the checklist post-generation, format findings, write the appendix).
- Pre-existing `task-review.checklist.md` gap is now explicit and visible (task is gated by `/validate` against the task card directly; no checklist file exists). Flagged for follow-up.

**Affected files / artefacts:**

| Artefact | What changed |
|---|---|
| Master plan §5 line 350 | `/review [spec\|plan\|task]` → `/review — spec only; gates SPEC_REVIEWED → SPEC_APPROVED (plan via /clarify, task via /validate)` |
| Master plan §5 line 399 | Checklists folder header annotated with consumption note (R34) |
| Master plan §6 line 479 | `/review fdd --feature X` reference replaced with `/fdd`'s inline self-check |
| Master plan §7.1 line 583 | `/review fdd --feature X` reference dropped from d365-ce table-row tagging description |
| Master plan §7.1 d365-ce checklists block (lines 568–574) | Consumption note appended |
| Master plan §7.2 d365-fo checklists block (lines 697–704) | Consumption note appended |
| Master plan §7.7 line 1520 | Brownfield contrast reworded — other agents have `/review` for **spec only**, not every doc type |
| Master plan §11 (new subsection after d365-ce paragraph at line 2135) | New *Review checklist consumption* subsection with consumption table |
| Master plan §13 line 2218 | Three feature-delta operations → two (drop `/review fdd --feature {f}`); inline self-check note added |
| Master plan §16 line 2495 | Machine-validators parenthetical reworded |
| Master plan §26 line 3430 | New R34 row added to revision history |
| Master plan §26 "Files affected by R1–R33" → renamed "Files affected by R1–R34"; R34 file delta line appended; §13 R18 historical bullet annotated with R34 supersession note (lines 3431, 3452, 3464) |
| Master plan RESUME POINT (lines 10, 29) | Header `R17–R33 applied` → `R17–R34 applied`; new R34 bullet under "Last completed" |

11 distinct edits applied to a single file: [reference/00-spec-driven-development-humble-muffin.md](../../reference/00-spec-driven-development-humble-muffin.md). All edits documented in [implementation.md entry 2026-05-14-001](../../implementation.md).

## References

- Master plan revision: **R34** at [reference/00-spec-driven-development-humble-muffin.md §26](../../reference/00-spec-driven-development-humble-muffin.md#L3430)
- Inline-check subsection: [§11 Review checklist consumption](../../reference/00-spec-driven-development-humble-muffin.md#L2145)
- Plan file (preserved): [C:\Users\preeti.gupta\.claude\plans\fix-question-number-1-humble-coral.md](C:\Users\preeti.gupta\.claude\plans\fix-question-number-1-humble-coral.md)
- Original user instruction surfacing the inconsistency: [reference/instruction.md](../../reference/instruction.md)
- Implementation log: [../../implementation.md](../../implementation.md) → entry `2026-05-14-001`
