---
mode: agent
description: "Generate a D365 F&O solution blueprint from an approved TDD. Triggers on: 'blueprint', 'solution blueprint', 'architecture blueprint'."
---

Generate an X++ Solution Blueprint from an approved TDD. The blueprint is a stakeholder-facing architecture summary — it translates the technical design into a structured document that shows the extension model, module structure, data flows, security model, and integration touchpoints before implementation begins.

## Usage

```
/d365-fo-blueprint {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Check Gate

Read `docs/{requirement-name}/tdd-review.md`.

If status is not `TDD APPROVED`, stop:
```
GATE BLOCKED
════════════
TDD review status is not TDD APPROVED.
Run /d365-fo-tdd-review {requirement-name} and resolve all BLOCKERs before generating the blueprint.
```

## Step 3 — Read Source Documents

1. Read `docs/{requirement-name}/fdd.md` — business context, process flows, security requirements
2. Read `docs/{requirement-name}/tdd.md` — full architecture specification (all §5 sub-sections)

Extract from the TDD:
- All X++ objects by category and type (§5.3–§5.11)
- Extension patterns in use (CoC, table extension, event handler, new class, etc.)
- Data flows: F&O tables → Data Entities → Integration layer
- Security model: roles, duties, privileges, entry points
- Integration touchpoints: inbound (Azure → F&O via Data Entity) and outbound (INT classes → Azure)
- Module structure and dependencies

## Step 4 — Select Architecture Pattern

Analyse the object inventory and TDD architecture sections. Select the dominant pattern and document the rationale.

### Pattern A — Extension-Centric
**Use when:** The requirement extends existing F&O forms, tables, and business logic without new standalone processes.
**Indicators:** Majority of objects are Form Extensions, Table Extensions, or CoC Class Extensions.

### Pattern B — New Process Class
**Use when:** A new end-to-end business process is introduced that F&O does not natively support.
**Indicators:** Multiple New Classes, a new Form, and batch processing; limited use of existing F&O workflows.

### Pattern C — Integration-Centric
**Use when:** The primary purpose is moving data between F&O and an external system (Azure, CE, third-party).
**Indicators:** INT objects dominate; Data Entities in scope for inbound; Interface Logic Classes for outbound.

### Pattern D — Data Entity / OData
**Use when:** External systems read or write F&O data via OData or DMF without real-time sync.
**Indicators:** DEN objects dominate; staged import/export; low real-time requirement.

### Pattern E — Hybrid
**Use when:** The requirement involves extensions to existing processes AND new integration touchpoints.
**Indicators:** Mix of EXT and INT objects; both inbound and outbound data flows.

## Step 5 — Generate Blueprint

Generate `docs/{requirement-name}/solution-blueprint.md` using `doc-templates/solution-blueprint-template.md` as the base.

Populate every section with content derived from the FDD and TDD. Do not leave sections empty — if a section does not apply, write "Not applicable — {reason}".

**Section 1 — Architecture Pattern and Rationale**
- Selected pattern with full justification
- Alternatives considered and why rejected
- Key architectural decisions made in the TDD

**Section 2 — Component Architecture**

Generate a Mermaid `graph TD` diagram showing the X++ object landscape as a top-down hierarchy. Use `subgraph` blocks for F&O layers (UI / Business Logic / Data / Integration). Apply `:::info` to external systems; `:::warning` to ISV CoC conflict risks.

````mermaid
graph TD
  User["👤 {User}"]:::info
  subgraph UI["UI Layer"]
    FormExt["Form Extension\n{FormName}.Extension"]
  end
  subgraph BL["Business Logic"]
    CoC["CoC Class\n{Namespace}_{Class}_Extension"]
    NewClass["New Class\n{Namespace}_{Purpose}"]
  end
  subgraph Data["Data Layer"]
    TableExt["Table Extension\n{TableName}.Extension\n({AVA_NewField})"]
  end
  subgraph Integration["Integration"]
    Entity["Data Entity\n{Namespace}_{Entity}Entity"]
  end
  ExtSys["{External System / Azure}"]:::info
  User --> FormExt
  FormExt -- "event handler" --> CoC
  CoC -- "calls" --> NewClass
  NewClass -- "reads/writes" --> TableExt
  TableExt -- "exposed via" --> Entity
  Entity -- "outbound / OData" --> ExtSys
  classDef info fill:#93c5fd,color:#000,stroke:#3b82f6
  classDef warning fill:#f59e0b,color:#000,stroke:#d97706
````

**Section 3 — Data Architecture**
- Object model: every extended/new table, its new fields, EDT types, Base Enums
- Data flow: where data originates, how it transforms, where it lands (F&O tables, staging tables, external systems)
- Data volume and archiving considerations for new tables

**Section 4 — Security Architecture**
- Security model matrix: Role → Duty → Privilege → Entry Point → Access Level
- SoD (Segregation of Duties) risks and controls from FDD §13
- Integration user scope (if applicable)

**Section 5 — Integration Architecture** (include only if INT objects exist)
- Systems connected, protocols (OData / DMF / Service Bus / Azure Function), direction
- Inbound pattern: Azure → F&O via Data Entity (staging → target table)
- Outbound pattern: F&O → Azure via Interface Logic Class → Service Bus / HTTP
- Authentication (Key Vault, Managed Identity, Service Principal)
- Error handling and retry strategy per integration channel

**Section 6 — Extension Model Decisions**
- For each major extension decision, document: what was extended, why extension was chosen over new object, CoC vs event handler choice, and any performance considerations

**Section 7 — ALM and Deployment Architecture**
- Model structure: which F&O model (`AVA_<Module>`) contains all objects
- Environment pipeline: DEV → TEST → UAT → PROD
- Dependencies on other models or ISV solutions
- Branching strategy per `constitution/04-development-and-alm.md`

**Section 8 — Technical Risks and Mitigations**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CoC chain conflict with ISV | Medium | High | Use event handler instead of CoC for shared methods |
| Data Entity performance on large tables | Low | High | Add pagination and filters to entity query |

**Section 9 — Non-Functional Coverage**
How the design addresses: performance, scalability, availability, maintainability, and testability.

## Step 6 — Write Output

Write:
- `docs/{requirement-name}/solution-blueprint.md`

## Step 7 — Print Completion Report

```
BLUEPRINT COMPLETE
══════════════════
Requirement  : {requirement-name}
Pattern      : Pattern {X} — {name}
Objects      : {N} total  ({EXT: N, INT: N, DEN: N, SEC: N, …})
Risks        : {N} identified
Output       : docs/{requirement-name}/solution-blueprint.md

Next step: /d365-fo-plan {requirement-name}
```
