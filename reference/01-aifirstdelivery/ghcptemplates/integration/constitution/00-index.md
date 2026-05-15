# Azure Integration Constitution — Index

Every agent command MUST read all files in this folder before generating any output.
These rules are non-negotiable constraints, not suggestions.

## Files

| File | Covers |
|---|---|
| 00-architectural-principles.md | Event-driven, stateless, idempotency, IaC, loose coupling, observability |
| 01-integration-patterns.md | When to use Service Bus, Functions, Logic Apps, APIM |
| 02-azure-service-bus.md | Topics, queues, retry, DLQ, message schema |
| 03-azure-functions.md | Function design, triggers, bindings, error handling |
| 04-logic-apps.md | Workflow standards, connector usage, error handling |
| 05-api-management.md | API design, policies, versioning, security |
| 06-error-handling.md | Retry policies, dead-letter, alerting, idempotency |
| 07-security.md | Managed identity, Key Vault, network isolation |
| 08-devops-alm.md | Branching, IaC, pipeline standards |
| 09-document-generation-rules.md | When and how to generate documents and code |
| 10-alm-configuration.md | ALM tool, work item hierarchy, field mapping, priority/status value maps |
| 11-nfr-targets.md | API latency, async throughput, availability, DLQ SLA, error rate targets |

## How to Use

At the start of every command prompt include:
> "Read all files in constitution/ before proceeding. Treat every rule as a hard constraint.
>  If a user request conflicts with the constitution, flag it and propose a compliant alternative."
