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
| Functional Design Document | `/fdd` | Spec APPROVED | Business / BA | `doc-templates/fdd-template.md` |
| Test Plan and Strategy | `/testplan` | Spec APPROVED | QA / Business | `doc-templates/test-plan-template.md` |
| Technical Design Document | `/tdd` | Plan TASK-READY | Architect / Dev | `doc-templates/tdd-template.md` |
| Solution Blueprint | `/blueprint` | Plan TASK-READY | Architect | `doc-templates/solution-blueprint-template.md` |
| App Design | `/document` | Canvas tasks implemented | Dev / UX | *(inline)* |
| Flow Documentation | `/document` | Flow tasks implemented | Admin / DevOps | *(inline)* |
| Copilot Design | `/document` | Copilot tasks implemented | Conversation Designer | *(inline)* |
| Deployment Guide | `/document` | All tasks implemented | Release Engineer | *(inline)* |
| User Guide | `/document` | UI changes present | End Users | *(inline)* |
| Release Notes | `/document` | All tasks implemented | All stakeholders | *(inline)* |

## Document Language Rules

| Document | Language Level | Schema Names? | Technical Terms? |
|---|---|---|---|
| FDD | Business language | No (display names) | No |
| Test Plan | Mixed | Moderate | Moderate |
| TDD | Technical | Yes | Yes |
| Solution Blueprint | Architectural | Yes | Yes |

## File Naming and Location

- All lowercase, hyphen-separated
- Location: `docs-generated/{feature-name}/`
- Required header in every document:
  ```
  feature: {feature-name}
  document-type: {type}
  date: {YYYY-MM-DD}
  status: DRAFT | UNDER REVIEW | APPROVED
  ```

## Output Code / Artefact Location Rules

| Artefact Type | Output Path |
|---|---|
| Canvas app formula exports | `output/{feature}/src/CanvasApps/{AppName}/` |
| Power Automate flow exports | `output/{feature}/src/Flows/{FlowName}/` |
| Copilot topic definitions | `output/{feature}/src/CopilotStudio/{TopicName}/` |
| Dataverse schema descriptions | `output/{feature}/src/DataverseSchema/` |
| Solution source (unpacked) | `output/{feature}/src/Solution/` |

**Never** write generated artefacts outside `output/` without explicit user instruction.

## Diagram Standards

All diagrams in generated documents **must** use Mermaid syntax. ASCII art and plain-text box drawings are prohibited.

- Enclose every diagram in a triple-backtick `mermaid` code fence.
- Every diagram must have a descriptive heading immediately above it.
- Diagrams must be generated in the same pass as their section — never defer or leave placeholders.
- Keep diagrams at architecture level: show personas, apps, Dataverse tables, flows, and external systems.
- Apply `classDef` colour coding: `:::critical` (red) for security risks, `:::warning` (amber) for delegation limits or deprecated patterns, `:::info` (light blue) for external systems and consumers.

| Section | Mermaid type | Content |
|---|---|---|
| Component architecture (blueprint §2) | `graph LR` | Personas → Canvas/MDA Apps → Dataverse → Flows → External |
| Data model / entity relationships | `erDiagram` | Key Dataverse tables with fields and cardinality |
| Process flow (FDD §5) | `flowchart LR` | Business steps: trigger → actors → approval → outcome |
| Security role structure | `graph TD` | Azure AD groups → App shares → Dataverse roles → Row-level security |
| Deployment pipeline | `graph LR` | DEV → UAT → PROD with solution export/import gates |

```mermaid
%% Standard classDef palette
classDef critical fill:#ef4444,color:#fff,stroke:#b91c1c
classDef warning  fill:#f59e0b,color:#000,stroke:#d97706
classDef info     fill:#93c5fd,color:#000,stroke:#3b82f6
classDef ok       fill:#22c55e,color:#fff,stroke:#15803d
classDef neutral  fill:#f1f5f9,color:#334155,stroke:#94a3b8
```

## Delegation Warning Rule

Any document or code that performs a non-delegable operation must include a visible warning:
```
⚠️ DELEGATION WARNING: This filter/sort is not delegable.
   Impact: Only the first {row limit} records will be processed.
   Mitigation: {Approach taken}
```
