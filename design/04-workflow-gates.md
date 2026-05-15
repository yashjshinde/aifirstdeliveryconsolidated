---
title: Workflow & Gates — workflow.yaml DAG, .workflow.json state, hard gates, doc-scope branching
status: live
adr-refs: [ADR-0001, ADR-0006]
last-reviewed: 2026-05-14
owner: design
---

# Workflow & Gates

> The platform's authoring workflow is a declarative DAG. Each agent reads `workflow.yaml` (mirrored from repo root into each agent folder) for the rules, and each feature carries `.workflow.json` for its current state. Commands enforce hard gates by reading the state file before executing.

## Three phases

```
DEFINE  →  DESIGN  →  BUILD
```

| Phase | Purpose |
|---|---|
| DEFINE | Agree on what the feature is. Spec drafted, reviewed, approved (optionally split for mixed-domain). |
| DESIGN | Plan the work + produce FDD, TDD, blueprint, test-plan. Clarify the plan. |
| BUILD | Detail tasks → validate → implement → document → emit ALM handoff. |

## `workflow.yaml` (declarative DAG)

```yaml
version: 1
phases:
  - name: DEFINE
    states:
      - SPEC_DRAFT
      - SPEC_REVIEWED          # gate
      - SPEC_APPROVED          # hard gate
      - SPEC_SPLIT             # optional, conditional
  - name: DESIGN
    states:
      - PLAN_DRAFT
      - PLAN_CLARIFIED         # hard gate
      - TDD_DRAFT              # parallel-eligible
      - BLUEPRINT_DRAFT        # parallel-eligible
      - FDD_DRAFT              # parallel after SPEC_APPROVED
      - TEST_PLAN_DRAFT        # parallel after SPEC_APPROVED
  - name: BUILD
    states:
      - TASK_DRAFT
      - TASK_VALIDATED         # hard gate
      - IMPLEMENTING
      - IMPLEMENTED
      - DOCUMENTED

transitions:
  SPEC_DRAFT -> SPEC_REVIEWED: command=/review
  SPEC_REVIEWED -> SPEC_APPROVED: command=/review --approve
  SPEC_APPROVED -> SPEC_SPLIT: command=/split           # optional
  SPEC_APPROVED -> PLAN_DRAFT: command=/plan
  SPEC_APPROVED -> FDD_DRAFT: command=/fdd              # parallel
  SPEC_APPROVED -> TEST_PLAN_DRAFT: command=/test-plan  # parallel
  PLAN_DRAFT -> PLAN_CLARIFIED: command=/clarify --approve
  PLAN_CLARIFIED -> TASK_DRAFT: command=/task           # task can start before TDD/blueprint
  PLAN_CLARIFIED -> TDD_DRAFT: command=/tdd
  PLAN_CLARIFIED -> BLUEPRINT_DRAFT: command=/blueprint
  TASK_DRAFT -> TASK_VALIDATED: command=/validate --approve
  TASK_VALIDATED -> IMPLEMENTING: command=/implement
  IMPLEMENTING -> IMPLEMENTED: command=/implement --complete
  IMPLEMENTED -> DOCUMENTED: command=/document

hard-gates:
  - SPEC_APPROVED               # required before /plan
  - PLAN_CLARIFIED              # required before /task
  - TASK_VALIDATED              # required before /implement

parallel-after:
  SPEC_APPROVED: [FDD_DRAFT, TEST_PLAN_DRAFT, PLAN_DRAFT]
  PLAN_CLARIFIED: [TDD_DRAFT, BLUEPRINT_DRAFT, TASK_DRAFT]
```

## `.workflow.json` per feature (schema `workflow-state.v1`)

One file per feature, lives at `projects/{p}/{agent}/features/{f}/.workflow.json`. Validated against `schemas/workflow-state.v1.json`.

```json
{
  "schemaVersion": "1.0",
  "project": "acme-d365",
  "agent": "d365-ce",
  "feature": "case-management",
  "phase": "DESIGN",
  "currentStates": ["PLAN_CLARIFIED", "TDD_DRAFT"],
  "gates": {
    "SPEC_APPROVED": { "status": "APPROVED", "ts": "2026-05-13T14:22:00Z", "by": "user" },
    "PLAN_CLARIFIED": { "status": "APPROVED", "ts": "2026-05-14T09:15:00Z", "by": "user" },
    "TASK_VALIDATED": { "status": "PENDING" }
  },
  "dependencies": [
    { "agent": "integration", "feature": "case-management", "artifact": "blueprint", "status": "READY" }
  ],
  "history": [
    { "command": "/spec --source fresh", "ts": "...", "result": "ok" },
    { "command": "/review --approve", "ts": "...", "result": "ok" },
    { "command": "/plan", "ts": "...", "result": "ok" },
    { "command": "/clarify --approve", "ts": "...", "result": "ok" }
  ]
}
```

## Gate enforcement

Every command first reads `.workflow.json`. If the required upstream gate is not `APPROVED`, the command **refuses** with a clear error and a suggested next action.

Override: `--force-skip-gate` flag — logged loudly in `.workflow.json` history; surfaces in `/status` output.

## Doc-scope branching for `/fdd`, `/tdd`, `/blueprint`

Per [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md), three commands branch their target-path resolution based on `agents.yaml` `docScope`:

| docScope | Target path | Behavior |
|---|---|---|
| `domain` | `projects/{p}/{agent}/{doc}.md` | **Bootstrap** from template on first call; **additive update** with `feature-id`-tagged sections + rows on subsequent feature calls. The inline self-check ([ADR-0001](adr/0001-review-scope-spec-only.md)) evaluates only the feature delta. |
| `feature` | `projects/{p}/{agent}/features/{f}/{doc}.md` | **Fresh-create** per feature from template; whole-doc review. |

The workflow gates (SPEC_APPROVED → FDD_DRAFT, PLAN_CLARIFIED → TDD_DRAFT, etc.) are unchanged. Branching is internal to the command's file-resolution logic, not visible in the gate DAG.

## Review scope — spec only (per [ADR-0001](adr/0001-review-scope-spec-only.md))

`/review` is the spec gating command. Plan is gated by `/clarify --approve`; task by `/validate --approve`. The four byproduct doc types (FDD / TDD / blueprint / test-plan) have **no separate `/review` invocation**; their checklists are consumed inline by their generating command (`/fdd`, `/tdd`, `/blueprint`, `/test-plan` self-check at end of generation). `plan-review.checklist.md` is consumed by `/clarify`.

Findings from inline self-checks fold into a "Quality self-check" appendix at the bottom of the generated doc. `doc_lint` enforces the appendix's presence and fails the write on BLOCKER findings.

## `/next` and `/status`

- **`/next`** — reads `.workflow.json` + `workflow.yaml`; computes eligible transitions; prints them as a numbered list with the matching command.
- **`/status`** — shows current phase, gate matrix, dependencies status, recent history.

MCP equivalents `workflow_next`, `workflow_status` are used by the chat UI (per [13-chat-ui.md](13-chat-ui.md)).

## Parallel execution

Some commands can run in parallel after a gate. E.g., after SPEC_APPROVED, `/fdd`, `/test-plan`, and `/plan` are all eligible. Per `parallel-after` in `workflow.yaml`. The chat UI's "Ready" pane (and `/next` CLI output) surface multiple eligible commands when this is the case.

## Hooks for hard-gate enforcement (queued)

Per backlog item bk-022, Claude hooks (pre-tool-use / post-tool-use) will enforce hard gates programmatically at the harness level — preventing accidental skip even with `--force-skip-gate` unless explicitly authorised. Hook configurations live in the rendered `agents/{a}/.claude/settings.json` (GENERATED).

## References

- ADRs: [ADR-0001](adr/0001-review-scope-spec-only.md) (review scope), [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md) (docScope branching)
- Schemas: `schemas/workflow-state.v1.json` (validates `.workflow.json`)
- Cross-references: [02-agent-skeleton.md](02-agent-skeleton.md), [06-templates.md](06-templates.md), [08-traceability.md](08-traceability.md)
