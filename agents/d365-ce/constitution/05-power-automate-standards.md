---
agent: d365-ce
sub-platform: power-automate
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Power Automate Standards (CE-bound + standalone cloud flows)

> Conventions for Power Automate cloud flows AND desktop flows when CE-bound or standalone. Azure-side Logic Apps live in the `integration` agent's domain — not here.

## Boundary with the integration agent

| Pattern | Owned by |
|---|---|
| Cloud flow triggered by a Dataverse event (entity create/update/delete) with stock connectors | d365-ce (this agent) |
| Cloud flow that orchestrates external systems with custom connectors / on-prem gateway | d365-ce IF the flow is the primary delivery, OR handoff to integration agent if Logic Apps would be more appropriate |
| Logic App (consumption or standard) | integration agent |
| Custom connector definition | integration agent (CE agent consumes it) |
| Desktop flow (UI automation) | d365-ce (this agent) |

When uncertain, the decision rule: if the orchestration is primarily *of Dataverse data*, it's d365-ce. If the orchestration is primarily *between Azure services* or external APIs, it's integration.

## Flow naming + organisation

- **Cloud flow name** pattern: `{publisherPrefix}_{trigger}_{intent}` (e.g., `acme_LeadCreated_AutoAssign`).
- **Solution membership**: every flow lives in the project's CE solution. Never leave a flow in "My flows" (Default environment) for production work.
- **Connection references** (NOT direct connections) for every connector used. Connection references are deployable; connections are not.

## Triggers

- **Dataverse triggers** filter by attribute when the flow only cares about specific column changes. `select` columns: only the ones the flow reads.
- **Recurrence triggers**: declare both the cadence + the timezone. Use `addToTime` rather than hard-coded offsets.
- **HTTP request triggers**: only with `When a HTTP request is received` + authentication; never anonymous.

## Actions

- **Error handling.** Every flow has a `Configure run after` exception path on critical actions. The exception path posts to an error-handling sub-flow (child flow) that logs to a shared error-log table or alerts a queue.
- **Child flows** for cross-flow shared logic (notification dispatch, audit logging). Child flows live in the same solution.
- **Variable initialisation** at top; mutated via `Set variable`. No `Initialize` mid-flow.
- **Compose** for any value that's referenced multiple times — name it descriptively.

## Concurrency

- **Default concurrency control** in `Settings` per Dataverse trigger flow. Limit to 1 for flows that must serialize per record.
- **Apply to each** parallelism: explicit; default to sequential when ordering matters.

## Conditions + switches

- **Comparison values** must be the same data type on both sides. Don't compare a string to a Boolean expression.
- **Switch** preferred over nested If when there are 3+ branches.

## Approvals

- **Approval requestor** is the flow run identity by default (the system user that runs the flow).
- **Approval response timeout** explicit. Document the fallback behaviour for timeouts.

## Performance + reliability

- **Action count** per flow: warning at 50, hard ceiling at 100. Refactor into child flows.
- **Retry policy** on every connector action (default exponential, max 4 retries unless stated otherwise).
- **Run history retention** per environment-level setting (cannot be per-flow).

## Multilingual

- When `project.config.yaml multilingual.crm: true`, any user-visible messages (notifications, approvals, emails) are localised. Translation table lookup at flow time.

## Testing

- Per `project.config.yaml unitTestPolicy.plugin` (Power Automate flows fall under the same testing policy as plugins for v1).
- Test approach: create a Test mode of the flow (cloned in a Test environment). Manually trigger with synthetic data. Document the test scenarios in the test plan.

## FDD section ownership

Power Automate sub-platform pack owns:
- §4.7 Power Automate Flows (CE-bound) — per R19 A5 in [ADR-0005](../../../design/adr/0005-d365-ce-multi-file-sub-platform.md)
- The flow inventory table in §4.7 lists: flow name, trigger, key actions, error path, idempotency note
