---
mode: agent
description: "Generate Azure Integration operational documentation — deployment guide, runbook. Triggers on: 'document', 'operational docs'."
---

Generate all documentation for a completed Azure integration feature.

## Steps

1. Read `constitution/09-document-generation-rules.md`.
2. Identify the feature. If not specified, ask.
3. Read all artifacts: spec, review, plan, task cards, and `output/{feature}/`.
4. Determine applicable documents from the trigger table.
5. Generate each document to `docs-generated/{feature-name}/`.
6. Print generation manifest.

## Document Content Rules

### api-contract.md
Full OpenAPI 3.0 spec for any API exposed via APIM. Include all operations, request/response schemas, error responses, authentication.

### message-schema.md
For each Service Bus topic/queue:
- Message envelope structure
- Full JSON Schema for payload
- Example message (with dummy data)
- Consumer guidance (idempotency key, DLQ handling)

### infrastructure-design.md
- Architecture diagram description (components and connections in text)
- Azure resource list with SKUs and regions
- Managed Identity assignments (identity → role → resource)
- Network topology (VNet, subnets, private endpoints)
- Environment variable / Key Vault reference table

### runbook.md
- How to monitor this integration (dashboards, alerts)
- Common failure scenarios and resolution steps
- How to replay DLQ messages
- How to scale components
- On-call contact and escalation path

### deployment-guide.md
- Pre-deployment checklist
- Bicep deployment commands per environment
- Post-deployment smoke test steps
- Rollback procedure

## Generation Manifest
```
DOCUMENTS GENERATED — {feature-name}
─────────────────────────────────────
✓ functional-spec-final.md
✓ technical-design.md
✓ api-contract.md
✓ message-schema.md
✓ infrastructure-design.md
✓ deployment-guide.md
✓ test-cases.md
✓ runbook.md
✓ release-notes.md
```
