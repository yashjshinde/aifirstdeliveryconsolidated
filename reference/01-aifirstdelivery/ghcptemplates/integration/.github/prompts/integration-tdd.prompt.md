---
mode: agent
description: "Generate an Azure Integration Technical Design Document — Function specs, Logic App specs, message schemas. Triggers on: 'tdd', 'technical design'."
---

Generate a Technical Design Document (TDD) for an Azure Integration feature from a task-ready plan.

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`. If not `TASK-READY` or `PARTIALLY READY`, stop.

## Steps

2. Read all files in `constitution/`.

2b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Read all available brownfield architecture docs:
      - `{brownfield.docs-path}/technical/technical-overview.md`
      - `{brownfield.docs-path}/architecture/solution-blueprint.md`
      - `{brownfield.docs-path}/architecture/dependency-map.md`
      - `{brownfield.docs-path}/integrations/integration-topology.md`
    - The existing architecture is the baseline. For each section of the TDD that touches an existing component, add a **Brownfield Baseline** callout: one or two sentences on the current state before this feature's changes.
    - All new technical decisions must explicitly state whether they extend, align with, or deliberately depart from established patterns. Departures require a justification referencing the constitution or the impact analysis.
    If `false`: skip.

3. Read `specs/{feature-name}/spec.md` and `plans/{feature-name}/plan.md`.
4. Generate TDD using `doc-templates/tdd-template.md`.
5. Write to `docs-generated/{feature-name}/technical-design-document.md`.
6. Print: components specified, open decisions flagged.

## What the TDD Must Cover

### Technical Architecture Overview
- Architecture pattern and justification (event-driven / request-response / hybrid / batch)
- Component interaction diagram — Mermaid `graph LR` showing trigger → processing → target flow
- Technology choices with constitution rule references

### Azure Function Specifications
For each function:
- Class name, namespace, trigger type and binding configuration
- Input/output bindings
- Business logic description (inputs consumed, outputs produced)
- Error handling: retry policy, DLQ action, exception logging
- Managed Identity role: identity → role → resource
- Timeout setting

### Logic App Workflow Specifications
For each workflow:
- Name, trigger type, schedule/event
- Action sequence with renamed labels
- Error scope: actions and notification target
- Retry policy on each connector action
- Parameters and environment variables consumed

### Message Schema Definitions
For each Service Bus topic/queue:
- Full JSON Schema (embed in TDD)
- Header envelope fields
- Payload fields with type, required, description, example value
- Schema versioning strategy

### API Contract Specifications (if APIM in scope)
- Full OpenAPI 3.0 spec (embed or reference)
- Authentication mechanism per operation
- Rate limit policy per product/operation
- Error response shape

### Infrastructure Design
- Azure resource list: name, type, SKU, region
- VNet / subnet topology
- Private Endpoints: which resources, which subnets
- Managed Identity assignments table: identity → role → resource

### Security Technical Design
- Authentication: every service-to-service auth mapped
- Key Vault secrets: name, purpose, rotation period
- Network rules: inbound/outbound restrictions per resource

### Monitoring and Observability Design
- Application Insights: what is instrumented
- Alert rules: condition, threshold, action group — thresholds must align with `11-nfr-targets.md` (DLQ SLA, error rate, latency p95)
- Dashboard: key metrics to display
- Runbook references per alert

## Rules

- Reference constitution rule for every technical decision
- Flag **Technical Risk** with likelihood, impact, mitigation
- Flag **Constitution Exception** with formal justification
