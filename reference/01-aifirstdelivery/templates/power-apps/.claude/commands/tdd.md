Generate a Technical Design Document (TDD) for a Power Platform feature from a task-ready plan.

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`. If not `TASK-READY` or `PARTIALLY READY`, stop.

## Steps

2. Read all files in `constitution/`.

2b. If `brownfield.enabled: true` in `constitution/10-alm-configuration.md`, read as baseline:
    - `{brownfield.docs-path}/technical/technical-overview.md` — existing technical architecture
    - `{brownfield.docs-path}/architecture/solution-blueprint.md` — existing solution blueprint
    - `{brownfield.docs-path}/architecture/dependency-map.md` — existing component dependencies
    - `{brownfield.docs-path}/functional/entity-catalogue.md` — existing Dataverse schema
    Use this to add **Brownfield Baseline** callout boxes in each component section
    describing the existing state before this feature's changes are applied.

3. Read `specs/{feature-name}/spec.md` and `plans/{feature-name}/plan.md`.
4. Generate TDD using `doc-templates/tdd-template.md`.
5. Write to `docs-generated/{feature-name}/technical-design-document.md`.
6. Print: components specified, open decisions flagged.

## What the TDD Must Cover

### Technical Architecture Overview
- Which Power Platform components are used and why (Canvas vs MDA vs Flow vs Copilot)
- Architecture decisions with constitution rule references
- Component interaction — Mermaid `graph LR` showing user → app → flow → Dataverse → external

### Dataverse Schema Design (Technical)
For each table: schema name, display name, ownership, columns (schema, type, length, required, description), relationships, keys.

### Canvas App Technical Specifications
For each screen:
- Screen name, data source bindings
- Named formulas used: name, formula, purpose
- Collections: name, ClearCollect formula, scope
- Variables: name (gbl_/local_), initial value, where set/read
- Delegation analysis: Filter/Sort expressions and their delegation status
- Control inventory: name, type, key properties

### Power Automate Flow Technical Specifications
For each flow:
- Trigger: type, entity/event, filter conditions
- Action sequence table: | Step | Action Type | Connector | Connection Reference | Purpose |
- Error scope: trigger condition (Failed/TimedOut/Skipped), action taken
- Retry policy on external connectors
- Environment variables consumed
- Outputs produced (if child flow)

### Model-Driven App Technical Specifications
For each form: field list with schema names, section placement, Business Rule list.
For each view: schema name, columns, filter (FetchXML), sort.
For each Business Rule: scope, condition expression, action(s).

### Copilot Studio Technical Specifications
For each topic:
- Trigger phrases list
- Node-by-node breakdown: question, variable set, condition, action
- Variables: name, type, scope, source
- Power Automate action called: flow name, inputs, outputs
- Escalation: trigger condition, target channel

### Security Technical Design
- Security role matrix: role name → table → privilege → level
- Connection references: name, connector, service account
- App sharing: Azure AD groups per app per role
- Key Vault references: list every secret and the Environment Variable (Secret type) name used
- Managed Identity: identify which connectors support Managed Identity and which require a service principal app registration
- Audit Configuration: table listing every custom table and column with audit enabled, audit level, and business justification

### Solution and ALM Design
- Solution name, publisher, components
- Connection reference list
- Environment variable list: name, type, default, environment-specific values

## Rules

- Reference constitution rule for every technical decision
- Flag **Delegation Warning** for every non-delegable operation
- Flag **Technical Risk** with mitigation
