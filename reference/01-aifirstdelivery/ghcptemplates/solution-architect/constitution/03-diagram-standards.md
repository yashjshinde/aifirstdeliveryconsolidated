# Diagram Standards

## General Rules

- Use Mermaid syntax enclosed in triple-backtick `mermaid` code fences.
- Every diagram must have a descriptive heading immediately above it.
- Diagrams must be generated in the same pass as their section — do not defer.
- Keep diagrams at architecture level: show systems, components, and flows, not code or tasks.
- Apply colour coding using `style` directives to highlight critical paths, warnings, and error states.
- Label all arrows with the interaction type (e.g., `"OData upsert"`, `"Service Bus trigger"`, `"APIM JWT"`, `"pac CLI"`).
- Use `subgraph` blocks to group related components into logical boundaries (tiers, platforms, environments).
- Diagrams must be self-contained and readable without the surrounding prose.
- Mermaid syntax must be valid — validate mentally before outputting.

## Required Diagrams

| Section | Diagram type | Content |
|---|---|---|
| 0. Input Sources | `flowchart LR` | Templates and features that were read; arrows from templates to this blueprint |
| 3.2 Logical Architecture | `flowchart TB` | All tiers: External Systems → Gateway → Integration Processing → Platform → Observability; all actors; labelled flows |
| 3.3 Feature Dependency | `flowchart LR` | All features as nodes; arrows between features that have a cross-template dependency; label each arrow with the dependency type |
| 4.2 Data Architecture | `erDiagram` | All Dataverse entities (OOB and custom) across all input features; key fields; cardinality relationships |
| 4.3 Automation Architecture | `flowchart TD` | End-to-end lifecycle of the primary business process; colour-code: created (blue), closed/complete (green), escalation/warning (amber), error/overdue (red) |
| 4.4 Security Architecture | `flowchart LR` | Three subgraphs: Azure Layer (Key Vault, APIM, Managed Identity), Dataverse/D365 Layer (Roles, FLS, Auditing), Power Platform Layer (Auth, DLP, Connection References); secret injection and auth flows |
| 5.1 Integration Overview | `flowchart LR` | All external systems → platform; dead-letter queue path in red; APIM as gateway; Managed Identity as auth node |
| 5.2 Primary Integration | `sequenceDiagram` | Full message path for the most complex integration; include Key Vault secret resolution; three alternative paths: Success, Failure with retry, All retries exhausted → DLQ → alert |
| 6.1 Environment & Deployment | `flowchart LR` | Dev → SIT → UAT → Prod promotion gates; each environment's Azure and D365/Power Platform resources; CI/CD pipelines as deployers; promotion gate annotations |
| 7 Observability | `flowchart LR` | Four subgraphs: Event Sources → Monitoring Tools → Alerting → Alert Recipients |

## Colour Coding Conventions

| State / Role | Colour |
|---|---|
| Happy path / success | `#22c55e` (green) |
| Warning / escalation | `#f59e0b` (amber) |
| Error / dead-letter / overdue | `#ef4444` (red) |
| External system / actor | `#93c5fd` (light blue) |
| Security component (Key Vault, Managed Identity) | `#a78bfa` (purple) |
| CI/CD pipeline | `#94a3b8` (grey) |
