# Constitution — Document Generation Rules

## Workflow Trigger Points

```
/spec  → /review [APPROVED]
              ↓
         /fdd        → docs-generated/{feature}/functional-design-document.md
         /testplan   → docs-generated/{feature}/test-plan-and-strategy.md
              ↓
         /plan  → /clarify [TASK-READY]
                       ↓
                  /tdd        → docs-generated/{feature}/technical-design-document.md
                  /blueprint  → docs-generated/{feature}/solution-blueprint.md
                       ↓
                  /task → /implement → /document (operational docs)
```

## Document Types, Triggers, and Ownership

| Document | Command | Pre-condition | Audience | Template |
|---|---|---|---|---|
| Functional Design Document | `/fdd` | Spec APPROVED | Business / Integration Owner | `doc-templates/fdd-template.md` |
| Test Plan and Strategy | `/testplan` | Spec APPROVED | QA / Dev | `doc-templates/test-plan-template.md` |
| Technical Design Document | `/tdd` | Plan TASK-READY | Architect / Dev | `doc-templates/tdd-template.md` |
| Solution Blueprint | `/blueprint` | Plan TASK-READY | Architect / Tech Lead | `doc-templates/solution-blueprint-template.md` |
| API Contract | `/document` | APIM tasks implemented | Consumer teams | *(inline)* |
| Message Schema | `/document` | Service Bus tasks implemented | Consumer teams | *(inline)* |
| Infrastructure Design | `/document` | IaC tasks implemented | DevOps | *(inline)* |
| Deployment Guide | `/document` | All tasks implemented | DevOps | *(inline)* |
| Runbook | `/document` | All tasks implemented | Ops team | *(inline)* |
| Release Notes | `/document` | All tasks implemented | All stakeholders | *(inline)* |

## Document Language Rules

| Document | Language Level | Schema Names? | Technical Terms? |
|---|---|---|---|
| FDD | Business language | No | No |
| Test Plan | Mixed (testers + devs) | Moderate | Moderate |
| TDD | Technical | Yes | Yes |
| Solution Blueprint | Architectural | Yes | Yes |

## File Naming and Location

- All lowercase, hyphen-separated: `technical-design-document.md`
- Location: `docs-generated/{feature-name}/`
- Required header in every document:
  ```
  feature: {feature-name}
  document-type: {type}
  date: {YYYY-MM-DD}
  status: DRAFT | UNDER REVIEW | APPROVED
  ```

## Diagram Standards

All diagrams in generated documents **must** use Mermaid syntax. ASCII art and plain-text box drawings are prohibited.

- Enclose every diagram in a triple-backtick `mermaid` code fence.
- Every diagram must have a descriptive heading immediately above it.
- Diagrams must be generated in the same pass as their section — never defer or leave placeholders.
- Label all arrows with the interaction type: `"HTTPS POST"`, `"Service Bus trigger"`, `"OData"`, `"Managed Identity"`.
- Use `subgraph` blocks to group Azure resources into logical boundaries (APIM, Functions, Service Bus, Storage).
- Apply `classDef` colour coding: `:::critical` (red) for dead-letter / error paths, `:::warning` (amber) for retry paths, `:::info` (light blue) for external systems.

| Section | Mermaid type | Content |
|---|---|---|
| Integration topology (blueprint §2) | `graph LR` | Source → APIM → Functions → Service Bus → Target |
| Message sequence / async flow | `sequenceDiagram` | Full message path including error/retry/DLQ alternatives |
| Data architecture | `erDiagram` | Message schema entities and field types |
| Security / auth map | `graph LR` | Service-to-service hops with auth method on each arrow |
| Deployment pipeline | `graph LR` | DEV → SIT → UAT → PROD with gate annotations |

```mermaid
%% Standard classDef palette
classDef critical fill:#ef4444,color:#fff,stroke:#b91c1c
classDef warning  fill:#f59e0b,color:#000,stroke:#d97706
classDef info     fill:#93c5fd,color:#000,stroke:#3b82f6
classDef ok       fill:#22c55e,color:#fff,stroke:#15803d
classDef neutral  fill:#f1f5f9,color:#334155,stroke:#94a3b8
```

## Output Code Location Rules

| Code Type | Output Path |
|---|---|
| Azure Functions | `output/{feature}/src/Functions/{FunctionName}/` |
| Logic App workflows | `output/{feature}/src/LogicApps/{WorkflowName}/` |
| APIM policies | `output/{feature}/src/APIM/policies/` |
| Message schemas (JSON Schema) | `output/{feature}/src/Schemas/` |
| Bicep IaC | `output/{feature}/infrastructure/` |
| Unit tests | `output/{feature}/tests/Unit/` |
| Integration tests | `output/{feature}/tests/Integration/` |

**Never** write generated code outside `output/` without explicit user instruction.

## Generated Code Naming

### Azure Functions
```
Class:     {Purpose}Function
Namespace: {OrgPrefix}.Integration.{Domain}.Functions
File:      {Purpose}Function.cs
```

### Logic App Workflows
```
Folder:  {purpose}-workflow/
File:    workflow.json
```

### Message Schemas
```
File: {domain}.{entity}.{action}.schema.json
```
