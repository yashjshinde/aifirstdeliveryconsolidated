# Constitution — Power Automate Standards

## Flow Types
- Use **Automated cloud flows** for event-triggered processes (record create/update, HTTP)
- Use **Scheduled flows** for batch and periodic processing
- Use **Instant flows** for user-triggered actions from apps or buttons
- Do not use Desktop flows for processes that can be done via API/connector

## Naming
- Flow name: `{Trigger} — {Action} — {Domain}` (e.g., `Account Created — Notify Sales Manager — CRM`)
- Action names inside flows: rename every action to a descriptive label — never leave default names like `Apply to each 2`

## Error Handling
- Every flow must have a **Configure run after** with Failed/Skipped on critical actions
- Use a dedicated `Error Handler` scope with:
  - Send notification or create a task for the operations team
  - Log error details to a Dataverse table or Application Insights
- Never leave a flow with no error handling — silent failures are not acceptable

## Connector Usage
- Use **Premium connectors** only where justified — document the business justification
- Prefer Dataverse connector over legacy Common Data Service connector
- Use HTTP connector for custom APIs — configure timeout and retry explicitly
- Never store credentials in flow actions — use connection references

## Connection References
- All flows must use **connection references** — not personal connections
- Connection reference name: `{OrgPrefix} {ServiceName} Connection`
- Connection references must be in the solution

## Performance
- Avoid `Apply to each` on large collections — use `Select` + `Filter` where possible
- Use **Parallel branch** for independent operations
- Set concurrency on `Apply to each` deliberately (default 1 is often a bottleneck)

## Child Flows
- Extract reusable logic into **child flows** (solution-aware, callable)
- Child flow name: `{OrgPrefix} — {Purpose} [Child]`
- Child flows must be in the same solution as the parent

## Governance
- All production flows must be owned by a service account, not a personal user
- Every flow must have a description explaining its purpose and trigger
