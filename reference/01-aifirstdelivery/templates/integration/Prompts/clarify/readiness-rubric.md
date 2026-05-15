# Task Readiness Rubric — Azure Integration

For each high-level task in the plan, evaluate every criterion below.
A single BLOCKER fails the task. Multiple QUESTIONs do not block but must be listed.

## Component Type (BLOCKER if missing)
- Is the component type explicitly stated? (Azure Function / Logic App / Service Bus / APIM Policy / Bicep IaC / Schema)
- Is there exactly one component type per task, or is the task too broad?

## Azure Integration Artefact Specificity (BLOCKER if missing)
- For **Azure Function**: Is the trigger type (ServiceBusTrigger, HttpTrigger, TimerTrigger, BlobTrigger) specified? Is the function app name derivable?
- For **Logic App**: Is the workflow name, trigger (Request/SB/Recurrence), and target connector specified?
- For **Service Bus**: Is the namespace, topic/queue name, subscription name (if topic), and message schema reference specified?
- For **APIM Policy**: Is the API name, operation (or all-operations), and policy scope (inbound/outbound/backend) specified?
- For **Bicep IaC**: Are all Azure resource types, SKU/tier, and naming convention derivable from `constitution/01-integration-patterns.md`?
- For **Schema**: Is the JSON Schema file path, message type, and owning component specified?

## Connection and Identity (BLOCKER if missing)
- Is the authentication method specified? (Managed Identity / API Key / OAuth / connection string)
- If Managed Identity: is the target resource and required RBAC role named?
- Are Key Vault references required? If so, is the secret naming convention clear?

## Error and Retry Strategy (REQUIRED)
- Is the retry policy specified, or does the task explicitly defer to `constitution/06-error-handling.md`?
- For Service Bus consumers: is DLQ handling addressed?
- For HTTP-facing components: is the RFC 7807 error shape mandated?

## Functional Requirement Traceability (REQUIRED)
- Does the task reference at least one FR-NNN from the spec?

## Dependency Clarity (REQUIRED)
- Are all task dependencies listed?
- Are there any implicit dependencies not listed? (e.g., Service Bus namespace must exist before Function can bind to it; Bicep module must run before Function is deployed)
- Is infrastructure (Bicep) sequenced before application code that depends on it?

## Ambiguity Check (QUESTION level if any found)
- Would a developer need to make any assumption to start this task?
- Are there conditional branches not described? (e.g., "if message is a retry, then...")
- Are idempotency requirements clear?
- Are there any terms that could be interpreted more than one way?

## Complexity Check
- Is the task XL? If so, recommend splitting into subtasks of M or L.
- A task is XL if it touches more than 2 artefacts or would take more than 2 days.

## Output Location (BLOCKER if missing)
- Is the output path in `output/{feature}/src/` or `output/{feature}/infrastructure/` derivable from the task description?
