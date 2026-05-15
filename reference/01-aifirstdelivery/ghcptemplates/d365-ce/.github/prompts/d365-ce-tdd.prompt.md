---
mode: agent
description: "Generate a Technical Design Document (TDD) for a D365 CE feature. Use when the user wants a TDD from a task-ready plan. Triggers on: 'TDD', 'technical design document', 'generate TDD', 'technical design'."
---

Generate a Technical Design Document (TDD) for a D365 CE feature from a task-ready technical plan.

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`.
2. If status is not `TASK-READY` or `PARTIALLY READY`, stop: "Run /d365-ce-clarify first. TDD requires a reviewed technical plan."

## Steps

3. Read all files in `constitution/`.

3b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Read all available brownfield architecture docs:
      - `{brownfield.docs-path}/technical/technical-overview.md`
      - `{brownfield.docs-path}/architecture/solution-blueprint.md`
      - `{brownfield.docs-path}/architecture/data-model.md`
      - `{brownfield.docs-path}/architecture/dependency-map.md`
    - The existing architecture is the baseline. For each section of the TDD that touches an existing component, add a **Brownfield Baseline** callout: one or two sentences on the current state before this feature's changes.
    - All new technical decisions must explicitly state whether they extend, align with, or deliberately depart from established patterns. Departures require a justification referencing the constitution or the impact analysis.
    If `false`: skip.

4. Read `specs/{feature-name}/spec.md` and `plans/{feature-name}/plan.md` in full.
5. Generate the TDD using `doc-templates/tdd-template.md`.
6. Write to `docs-generated/{feature-name}/technical-design-document.md`.
7. Print summary: components designed, open technical decisions flagged, review required.

## What the TDD Must Cover

### Technical Architecture Overview
- Which D365 CE extension points are used and why (plugin vs flow vs Business Rule vs JS)
- Architecture decisions with justification referenced to constitution rules
- Component interaction diagram — Mermaid `graph LR` showing data/event flows between all extension points

### Dataverse Schema Design (Technical)
For each new or modified table:
- Schema name, display name, ownership type
- All columns: schema name, display name, type, length/precision, required, description
- Relationships: schema name, type, cascade behaviour
- Keys and alternate keys

### Plugin Technical Specifications
For each plugin:
- Class name, namespace, assembly name
- Registration: entity, message, stage (Pre/Post/PreValidation), mode, rank, filtering attributes
- Pre-image: included attributes
- Post-image: included attributes
- Logic description: inputs consumed, outputs produced, Dataverse calls made
- Error handling: user-facing messages, technical log detail

### JavaScript Technical Specifications
For each web resource:
- File name, schema name, type
- Event registrations: entity, form, event, function name
- Functions: name, parameters, purpose, dependencies (attributes read/written)

### PCF Control Technical Specifications
For each control:
- Control name, namespace, type (field/dataset)
- Manifest properties (bound, input)
- Lifecycle method summary
- External dependencies

### Security Technical Design
- Security roles: name, privilege matrix (table × CRUD × level)
- Field security profiles: name, column, read/update rules
- Application user: name, required privileges
- Key Vault references: list every secret and the Key Vault URI / Environment Variable name used
- Managed Identity: identify which service connections use Managed Identity and which require an app registration
- Audit Configuration: table listing every custom table and column with audit enabled, the audit level (Create/Update/Delete), and the business justification

### Solution and ALM Design
- Solution name, publisher, components included
- Dependent solutions
- Environment variable definitions: name, type, default value

### Integration Technical Design (if applicable)
- Outbound: endpoint, auth method, payload schema, retry policy
- Inbound: trigger, message format, validation rules

## Rules

- Reference constitution rules by filename and section for every design decision
- Flag any **Technical Risk** with mitigation approach
- Flag any **Constitution Exception** with formal justification
