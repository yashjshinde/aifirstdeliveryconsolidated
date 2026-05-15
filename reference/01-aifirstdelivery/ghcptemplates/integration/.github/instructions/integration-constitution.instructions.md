---
applyTo: "specs/**,plans/**,tasks/**,output/**,docs-generated/**"
description: "Azure Integration constitution rules — auto-injected when editing integration delivery artifacts. Enforces event-driven patterns, IaC requirements, security standards, and observability."
---

# Azure Integration Constitution — Always-On Rules

These rules apply to ALL Azure Integration delivery artifacts. They are hard constraints, not suggestions.

## Architectural Principles

- **Event-Driven by Default** — prefer async Service Bus messaging over synchronous HTTP where the use case allows
- **Stateless Components** — all state in Dataverse, Storage, or Service Bus — never in Azure Function memory
- **Idempotency First** — every message handler and API endpoint must be safe to call multiple times with the same input
- **Infrastructure as Code** — all Azure resources defined in Bicep — portal deployments are a constitution violation
- **Observability by Design** — structured logging, Application Insights, and distributed tracing from day one

## Security

- All secrets in Azure Key Vault — accessed via Managed Identity — never hardcoded
- TLS 1.2 minimum for all outbound HTTP calls
- API Management required for any externally exposed endpoint
- Service-to-service authentication via Managed Identity or Azure AD service principal — no shared keys

## Azure Functions

- All Functions must be isolated-process (not in-process)
- No `Thread.Sleep` in synchronous paths
- All outbound HTTP: HttpClientFactory (not new HttpClient()), timeout set, retry with exponential backoff
- Structured logging only — `ILogger<T>` — no Console.WriteLine

## Logic Apps

- All actions must be renamed descriptively — no default names
- Error handling: configure run-after on all terminal actions
- No inline secrets — all connections via connection references

## Error Handling

- All messages that fail processing go to a dead-letter queue — never silently discarded
- Retry policy: maximum 3 retries with exponential backoff + jitter
- Failed messages alert operations team via configured notification channel

## Testing

- Azure Functions: xUnit + Moq, minimum 80% coverage
- Integration tests: against real Service Bus with test namespaces
- All Bicep templates: validate in CI before merge
