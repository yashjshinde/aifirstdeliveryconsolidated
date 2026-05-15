# Constitution — Architectural Principles

These principles apply to every Azure Integration solution. Every command must enforce them before generating any design, code, or infrastructure output.

## 1 — Event-Driven by Default

Prefer asynchronous, event-driven communication over synchronous request-response where the caller does not need an immediate answer.

Rules:
- Use Service Bus topics/queues for all cross-system data propagation
- Use synchronous HTTP (APIM/Functions) only when the caller blocks on the response (e.g., real-time API lookups)
- Justify any synchronous integration in the TDD — the default assumption is async
- Events decouple producers from consumers; adding a new consumer must not require changes to the producer

## 2 — Stateless Components

Functions and Logic Apps must hold no in-memory or file-system state between executions.

Rules:
- All state lives in Service Bus, Storage, Dataverse, or a database — never in a Function's memory across invocations
- Do not use static variables or singleton patterns that persist state between trigger invocations
- Durable Functions are the exception — use only for long-running orchestration, and document the reason

## 3 — Idempotency First

Every message handler, function, and flow step must produce the same outcome if executed more than once with the same input.

Rules:
- Check for existing records before creating — use a correlation ID, alternate key, or deduplication property
- Use `upsert` patterns rather than blind create
- Service Bus sessions or deduplication IDs must be used where message ordering or deduplication is required
- Document the idempotency mechanism in the TDD for every handler that writes to a target system

## 4 — Infrastructure as Code

Every Azure resource must be defined in Bicep or Terraform — never created via the portal only.

Rules:
- All resources in `infrastructure/` with separate parameter files per environment
- No manual resource creation in Test, UAT, or Production — all via CD pipeline
- Alert rules, dashboard templates, and diagnostic settings are infrastructure — version-control them
- Refer to `08-devops-alm.md` for IaC folder structure and pipeline standards

## 5 — Loose Coupling

No component may call another internal component directly without a platform broker.

Rules:
- No direct HTTP calls between Azure Functions without going through Service Bus or APIM
- No direct database queries across system boundaries — use published APIs or event streams
- External-facing APIs must go through APIM — no direct Function URL exposure to consumers
- Dependency on a specific deployment of another component is a design smell — flag it as a Technical Risk

## 6 — Observability by Design

Logging, metrics, and alerting are designed in from the start — not added after deployment.

Rules:
- Every function and logic app step emits structured logs to Application Insights
- Correlation IDs propagated through every message and API call
- Every async flow has a completion metric (success count, failure count, processing duration)
- Alert rules defined in Bicep alongside the resource they monitor
- Refer to `06-error-handling.md` for alerting and DLQ monitoring standards
