# Documentation Standards and Change Control

## Mandatory Artefacts per Object Category

| Artefact | DEN | SEC | PPL | RET | WFL | BDC | ANR | OPR | INT | EXT |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Business Requirement (backlog) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| FDD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| TDD | ✓* | — | ✓* | ✓ | ✓* | ✓* | — | ✓* | ✓ | ✓ |
| Field Mapping Specification | ✓ | — | — | — | — | — | — | — | ✓ | — |
| Integration Contract | — | — | — | — | — | — | — | — | ✓ | — |
| Role Definition Sheet | — | ✓ | — | — | — | — | — | — | — | — |
| Workflow Design Document | — | — | — | — | ✓ | — | — | — | — | — |
| Report Specification | — | — | — | — | — | — | ✓ | ✓ | — | — |
| Retail Extension Design Document | — | — | — | ✓ | — | — | — | — | — | — |
| Extension Object Inventory | — | — | — | — | — | — | — | — | — | ✓ |
| Test Cases | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| UAT Sign-off Record | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*TDD required for Complex and Very Complex objects only. Very Simple, Simple, and Medium may combine FDD+TDD.

## Document Versioning

All documents must follow semantic versioning:
- **v0.x** — Draft (not approved)
- **v1.0** — First approved baseline
- **v1.x** — Minor updates within same scope
- **v2.0** — Major revision / scope change

Every document must include a revision history table: version, date, author, change summary.

## Change Control

### Scope Change Process

Any request to add, remove, or materially alter an object after FDD baseline is approved is a **scope change**:

1. Requestor raises a Change Request (CR) in ADO with business justification
2. Functional Lead assesses business impact and priority
3. Technical Lead assesses development effort and risk
4. Solution Architect approves or rejects
5. If approved: Object Register updated; sprint plan revised

Changes to in-flight objects without an approved CR are prohibited. "Verbal approvals" have no standing.

### Production Deployment Approval

All Production deployments require:
- QA Lead sign-off (all exit criteria met)
- Functional Lead / Business Owner sign-off (UAT passed)
- Technical Lead sign-off (no outstanding critical code review findings)
- Solution Architect approval (deployment plan reviewed)
- Change Advisory Board (CAB) approval if applicable

Emergency hotfixes must obtain Solution Architect approval and be retrospectively submitted to CAB within 2 business days.

## Diagram Standards

All diagrams in generated documents **must** use Mermaid syntax. ASCII art and plain-text box drawings are prohibited.

- Enclose every diagram in a triple-backtick `mermaid` code fence.
- Every diagram must have a descriptive heading immediately above it.
- Diagrams must be generated in the same pass as their section — never defer or leave placeholders.
- Keep diagrams at architecture level: show X++ object hierarchy, data flows, integration touchpoints, and security model — not line-by-line code.
- Apply `classDef` colour coding: `:::critical` (red) for overlayering risks or security violations, `:::warning` (amber) for ISV conflict risks or deprecated patterns, `:::info` (light blue) for external systems.

| Section | Mermaid type | Content |
|---|---|---|
| Component architecture (blueprint §2) | `graph TD` | User → Form Extensions → CoC Classes → Tables → Data Entities → External |
| Data architecture | `erDiagram` | Extended/new tables with new fields and EDT types |
| Integration topology | `graph LR` | F&O ↔ Azure (Service Bus / HTTP) with auth method |
| Security model | `graph TD` | Role → Duty → Privilege → Entry Point |
| Deployment pipeline | `graph LR` | DEV → TEST → UAT → PROD with gate annotations |

```mermaid
%% Standard classDef palette
classDef critical fill:#ef4444,color:#fff,stroke:#b91c1c
classDef warning  fill:#f59e0b,color:#000,stroke:#d97706
classDef info     fill:#93c5fd,color:#000,stroke:#3b82f6
classDef ok       fill:#22c55e,color:#fff,stroke:#15803d
classDef neutral  fill:#f1f5f9,color:#334155,stroke:#94a3b8
```

## Non-Negotiable Principles

These rules admit **no exceptions** without explicit written approval from Solution Architect and Programme Director:

1. **No overlayering.** Standard Microsoft objects must never be modified. Extensions only.
2. **No direct database access.** All data access through X++ patterns or approved OData/custom service APIs.
3. **No hardcoded credentials.** Passwords, connection strings, API keys never in source code or source-controlled config.
4. **No unreviewed code in non-DEV environments.** Every object deployed beyond DEV must have a completed code review on record.
5. **No undocumented integrations.** Every integration must have a signed-off Integration Contract before going live.
6. **No unreconciled data migrations.** Data migration to UAT or Production must have a completed reconciliation report signed by the Data Migration Lead.
7. **No shadow deployments.** Nothing deployed to PROD outside the approved pipeline and change control process.
8. **No personal credentials in service connections.** All automated connections must use dedicated service accounts or service principals.
9. **No unnamed extension objects.** Every extension object must follow naming conventions. Unnamed or default-named objects prohibited in non-DEV environments.
