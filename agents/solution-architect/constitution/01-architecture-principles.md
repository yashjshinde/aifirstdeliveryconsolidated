---
agent: solution-architect
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Architecture Principles

> The cross-agent architecture principles this agent enforces when synthesising the unified blueprint.

## Principle 1 — One source of truth per concern

Every architectural concern (e.g., authentication, data storage, integration pattern, identity federation) is owned by exactly ONE agent's blueprint. The unified blueprint REFERENCES the owning agent's blueprint; it does not duplicate.

Examples:
- CE security model → owned by `d365-ce/blueprint.md` §6
- Azure Function call patterns → owned by `integration/blueprint.md`
- Power BI dataset architecture → owned by `reporting/blueprint.md`

When two agents claim ownership of the same concern, the unified blueprint flags it as a gap (logged by `/solution-review`).

## Principle 2 — C4-style layered architecture

The unified blueprint uses C4 levels per [https://c4model.com](https://c4model.com):

- **Level 1 — System Context**: actors + the consolidated solution + external systems. One Mermaid diagram per project.
- **Level 2 — Containers**: major deployable units (Dataverse, F&O AOS, Azure Function App, Service Bus, Power BI Workspace, etc.). One diagram per project.
- **Level 3 — Components per agent**: detailed inside each container. Multiple diagrams; one per agent (CE, FO, Integration, Reporting).
- Level 4 (Code) is intentionally NOT rendered at the cross-agent level; it's per-component detail in each agent's TDD.

## Principle 3 — Mermaid only for diagrams

All cross-agent architecture diagrams MUST use Mermaid. No exceptions. Enforced by `doc_lint` (mermaid-only rule) on `solution-blueprint.md`.

The HTML prototype is exempt — it is HTML / CSS / JS, not a doc-lint-governed Markdown file.

## Principle 4 — NFR alignment across agents

Each agent's NFR section declares targets specific to that agent's stack (CE P95 response, F&O batch throughput, integration latency, Power BI refresh window). The unified blueprint's NFR section is a **reconciled** matrix:

- Each NFR target on a per-component basis
- Conflicts surfaced ("CE says P95 < 2s; integration says < 5s for the same end-to-end journey")
- A single end-to-end NFR target for cross-agent journeys (e.g., "Lead-to-Quote end-to-end: < 8s P95 — sum of CE 2s + integration 3s + CE 3s")

## Principle 5 — Integration contracts are explicit

Every cross-agent dependency is documented as a contract:

- Source agent + artefact (entity / event / API)
- Target agent + consumption pattern
- Data schema (reference to the owning agent's TDD §)
- SLA + retry policy

`/solution-review` flags any cross-agent reference where the consumer's stated contract doesn't match the producer's declared schema.

## Principle 6 — As-is vs to-be in brownfield mode

When `project.config.yaml mode: brownfield`, every architecture artefact in this agent's outputs renders side-by-side as-is + to-be:

- `solution-blueprint.md` shows the existing architecture (from `_brownfield/docs-generated/architecture/`) alongside the planned additions
- `solution-prototype/` includes as-is screen captures (where available) next to to-be HTML mockups

## Principle 7 — No work-item generation here

This agent produces architecture artefacts and a prototype. It does NOT push to ADO / JIRA. The `alm` agent owns work-item lifecycle. When stakeholders want the architecture decisions reflected as ADO Epics / Features, `alm` consumes a handoff produced by `/alm-extract` in one of the domain agents — not from this aggregator.
