---
agent: solution-architect
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Aggregation Rules

> How `/solution-blueprint` and `/solution-review` walk per-agent outputs to produce cross-agent aggregations.

## Source discovery

The agent discovers per-agent outputs by walking the standard layout per [design/05-project-layout.md](../../../design/05-project-layout.md):

| Agent | docScope (per [ADR-0006](../../../design/adr/0006-doc-scope-domain-vs-feature.md)) | Where to look |
|---|---|---|
| `d365-ce` | domain | `projects/{p}/d365-ce/blueprint.md`, `projects/{p}/d365-ce/tdd.md`, `projects/{p}/d365-ce/fdd.md` |
| `d365-fo` | feature | `projects/{p}/d365-fo/features/*/blueprint.md`, `tdd.md`, `fdd.md` |
| `integration` | domain | `projects/{p}/integration/blueprint.md`, `tdd.md`, `fdd.md` |
| `reporting` | domain | `projects/{p}/reporting/blueprint.md`, `tdd.md`, `fdd.md` |
| Other domain agents (future) | per their `docScope` | per layout |
| Brownfield (when mode: brownfield) | n/a | `projects/{p}/_brownfield/docs-generated/architecture/solution-blueprint.md` |

The agent reads `agents.yaml` to get the registry + `docScope` keys, then resolves source paths per the table above.

If a domain agent is in the project's `agents-enabled` list but its blueprint.md does not exist yet, log a Typed Gap of category `MISSING-UPSTREAM` and continue with the agents that DO have outputs.

## `/solution-blueprint` synthesis

1. Read every agent's blueprint.md (paths above).
2. Extract:
   - Actors + external systems → System Context
   - Containers (Dataverse / F&O AOS / Function App / Service Bus / Power BI Workspace / external endpoints)
   - Components (entities / plugins / Logic Apps / pipelines / datasets per agent)
   - ADRs cited by each agent's blueprint
   - NFR targets per component
   - Integration contracts (cross-agent dependencies)
3. Synthesise:
   - One System Context Mermaid (C4-L1)
   - One Containers Mermaid (C4-L2)
   - One Components Mermaid per agent (C4-L3) — references each agent's blueprint
   - Reconciled NFR matrix
   - Cross-agent integration contracts table
   - Aggregated ADR list
4. Validate per [01-architecture-principles.md](01-architecture-principles.md) Principles 1, 4, 5.
5. Brownfield mode: also render side-by-side as-is sections from `_brownfield/docs-generated/architecture/`.
6. Output: `projects/{p}/_aggregator/architecture/solution-blueprint.md`.

## `/solution-review` gap analysis

This command produces a structured **gap report**. Categories:

| Category | What it checks |
|---|---|
| `ENTITY-MISMATCH` | An integration TDD references entity `Account` but the CE TDD defines `acme_account` — schema name mismatch |
| `NFR-CONFLICT` | Two agents declare different targets for the same end-to-end NFR |
| `INTEGRATION-CONTRACT-DRIFT` | Consumer's expected schema differs from producer's declared schema |
| `MISSING-UPSTREAM` | A domain agent declared in `agents-enabled` has no blueprint.md yet |
| `OWNERSHIP-CONFLICT` | Two agents claim ownership of the same architectural concern (Principle 1 violation) |
| `ORPHAN-COMPONENT` | A component in one agent's blueprint is not referenced by any cross-agent contract OR not produced by any other component (likely a documentation gap) |
| `UNRECONCILED-ADR` | Two agents cite contradictory ADRs without an overriding cross-agent ADR resolving the conflict |

Each finding has: ID, category, agent(s) involved, file paths + line numbers, severity (BLOCKER / WARNING / INFO), suggested resolution.

Output: `projects/{p}/_aggregator/architecture/solution-review-report.md`.

`/solution-review` does NOT block any downstream command — its purpose is to make gaps visible. Resolution is by the affected agent(s) owning the inconsistency.

## `/solution-prototype` aggregation

Detailed in [03-prototype-generation-rules.md](03-prototype-generation-rules.md). Brief summary:

1. Read personas from `projects/{p}/project.config.yaml personas:`. Fall back to extracting from spec.md persona sections.
2. Read modules from `agents-enabled` + each domain agent's FDD §3 (User Scenarios).
3. Read entities from domain agents' FDD §7 (Entity Model).
4. Read journeys from spec.md user scenarios across all agents.
5. Render HTML pages from the templates in `templates/solution-prototype/` (master shell + per-persona + per-module + per-form + dashboard + per-journey).
6. For each entity, invoke `templates/helpers/form-mockup-generator.prompt.md` to render the per-entity form HTML.
7. Output: `projects/{p}/_aggregator/architecture/solution-prototype/` (folder).

## Incremental vs full regeneration

All three commands are **idempotent** with content-hash skip (same model as the publish pipeline). Re-running `/solution-blueprint` after a single agent's blueprint.md changes will only rewrite if the synthesis differs.

`/solution-prototype` is more aggressive: it regenerates every page on every run (HTML mockups depend on the design tokens; a token change touches every page). Use `--persona <name>` / `--module <name>` / `--journey <name>` flags to scope down.
