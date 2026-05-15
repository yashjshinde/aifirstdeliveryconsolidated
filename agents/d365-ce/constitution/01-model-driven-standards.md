---
agent: d365-ce
sub-platform: model-driven
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Model-Driven CE Standards

> Conventions for model-driven Dataverse work: entities, forms, views, plugins, JS web resources, BPF, classic workflows, business rules. Authored per the SW Phoenix FDD shape captured in [agents/d365-ce.md](../../../design/agents/d365-ce.md) and [ADR-0005](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md).

## Entities (tables)

- **Schema-name prefix.** Every new table uses `project.config.yaml prefixes.schemaPrefix` (e.g., `acme_`). NEVER reuse a prefix that exists in another solution layer.
- **Primary name field.** Always `<prefix>_name` (string, 100 chars) unless a stronger candidate exists.
- **Ownership.** User-or-team-owned by default. Org-owned only for reference data (justified in FDD §7).
- **Activities-enabled.** Off by default. On only when activities (notes / tasks / emails) are part of the requirement.
- **Auditing.** On for any field carrying PII / financial / regulated data per `constitution/03-security.md` (this agent — see below).

## Forms

- **Main form per role.** A separate main form per security role only when the requirements call for role-targeted layout. Otherwise: one main form per entity.
- **Mobile / Quick Create / Quick View** forms only when the requirement calls for them.
- **Form load JS** registered in `OnLoad` and on each tab/section as needed.
- **No hard-coded GUIDs.** Use `getServerUrl()` / `getEntityName()` / etc.

## Views

- **Public / personal / system views.** System views OOB-first. Custom views only when stock views miss a column or filter.
- **Default columns.** Always include the primary name + at least one timestamp column (`createdon` or `modifiedon`).

## Plugins

- **Registration mode.** Sync only when needed for the transactional integrity; async otherwise.
- **Pre vs Post.** Pre-validation only when a hard validation is needed; otherwise Post-operation.
- **Step filtering.** Specify target attributes (`PrimaryEntityName.attributes`) — never register on all-attribute changes.
- **Plugin context.** Always read `IPluginExecutionContext`. NEVER hard-code message names; switch on `context.MessageName`.
- **Service references.** Get `IOrganizationService` from `IServiceProvider` — never instantiate directly.
- **Tracing.** `ITracingService` for every entry / exit / decision branch.
- **Idempotency.** Plugins must be idempotent OR explicitly idempotent-safe (single-row CRUD against `Target` only).
- **Unit tests via FakeXrmEasy.** Per `project.config.yaml unitTestPolicy.plugin: required` (default).

## JavaScript web resources

- **One JS file per entity** named `<prefix>_<entity>.js`. Single file holds all `OnLoad` / `OnSave` / control-level handlers for that entity.
- **No inline functions.** Every handler is a named function so the form designer can wire it.
- **`Xrm.WebApi`** for server-side reads; never use deprecated `Xrm.Page` accessors (use `formContext`).
- **Strict mode** at top of every JS file.
- **Unit tests** per `unitTestPolicy.js: required` (default) — typically Jest with a mocked Xrm shim.

## Business Process Flows (BPF)

- **One BPF per business process**, not per entity.
- **Stages map to spec FRs.** Each stage name corresponds to an FR in the spec.
- **Process Argument.** Used only for cross-process linkage; document in FDD §4.6.

## Business Rules

- **Form-side only.** Business rules attached to a form (not entity-scope) by default — unless server-side enforcement is genuinely needed.
- **OOB-first decision** per `project.config.yaml oobOverrides.businessRules`:
  - `prefer-business-rule`: use a business rule whenever the logic fits the designer's expressivity
  - `prefer-js`: prefer JS for anything beyond simple field hide/show

## Classic workflows

- **Real-time** only when transactional integrity demands; otherwise background.
- **Async** background for long-running processes.
- **Workflow scope** must always be set; `Organization` only when truly cross-user.

## OOB-first rule for complex plugins

When a requirement is "complex" by the agent's judgement (cross-system data flow, async batch, long-running computation), check `project.config.yaml oobOverrides.complexPlugin`:

- `prefer-plugin`: build it as a CE plugin
- `prefer-azure-function`: emit a `handoff.v1` to the `integration` agent (artifactType: `plan-dependency`) and reference the future Function as `requires:` in the CE plan

## FDD section ownership

Per the SW Phoenix shape, the model-driven sub-platform owns these FDD sections (assembled into `fdd.md` per the `/fdd` flow in [ADR-0005](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md)):

- §4.1 Forms wireframes (HTML mockups via the form-mockup-generator helper)
- §4.2 Validation rules (table-shaped; appended per feature)
- §4.3 Business Process Flows
- §4.4 Views (table-shaped; appended per feature)
- §4.5 Form mockups gallery (links to `fdd-assets/mockups/{entity-form}.html`)
- §4.6 Process Definitions (BPFs, workflows, business rules per R19 A4)
- §4.7 Power Automate Flows (CE-bound; per R19 A5)
- §4.8 Plugins / JS / Custom WF Activities scope listing (per R19 A6)
- §6 Security (privilege matrix, audit, hierarchy security)
- §7 Entity Model (per-entity field tables, alternate keys, BPF binding)
- §8 Reference Data
