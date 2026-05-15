---
mode: agent
description: "Generate the solution blueprint — architecture overview, data model, dependency map, and impact map. Triggers on: 'blueprint', 'solution blueprint', 'architecture blueprint'."
---

# /d365-ce-brownfield-blueprint — Generate Solution Architecture Blueprint

Produce an Architecture Blueprint synthesising the full project into a coherent architectural narrative.
Also generates a Data Model and Dependency Map.

## Usage

```
/d365-ce-brownfield-blueprint
```

## Pre-condition Check

1. Read `docs-generated/component-inventory.md`.
   If it does not exist, stop: "Run `/d365-ce-brownfield-scan` first."
2. Read `docs-generated/technical/technical-overview.md` if it exists.
3. Read `docs-generated/functional/functional-overview.md` if it exists.
4. Read all integration docs in `docs-generated/integrations/` if they exist.
5. Read all files in `input/documents/` for any architecture documents provided.

## Steps

6. Read all files in `constitution/`.
7. Determine the dominant architecture pattern (see pattern selection below).
8. Generate four documents:
   - `docs-generated/architecture/solution-blueprint.md`
   - `docs-generated/architecture/data-model.md`
   - `docs-generated/architecture/dependency-map.md`
   - `docs-generated/architecture/impact-map.md`
9. Print completion report.

## Architecture Pattern Classification

Analyse all components across all solution packages and classify the dominant pattern.

### Pattern A — Plugin-Centric
Indicators: 5+ plugin steps, synchronous validation, data manipulation on save.

### Pattern B — Flow-Centric
Indicators: 5+ Power Automate flows, approval workflows, notifications, scheduled jobs.

### Pattern C — Hybrid (Plugin + Flow)
Indicators: Plugins for synchronous integrity; Flows for async orchestration. Clear SLA separation.

### Pattern D — UI-Extension Heavy
Indicators: 5+ web resources, 2+ PCF controls, client-side logic dominant.

### Pattern E — Integration-Centric
Indicators: Azure Functions or Logic Apps dominant; D365 CE primarily acts as System of Record.

### Pattern F — Configuration-Heavy
Indicators: Minimal custom code; mostly OOB features configured (BPFs, standard flows, views).

## What the Blueprint Must Cover

### §1 Architecture Overview
- Identified pattern(s) with justification referencing specific component evidence
- Solution package landscape — what each package contains and why it is separated
- Key architectural decisions evidenced in the implementation

### §2 Component Architecture Diagram

Generate a Mermaid `graph TD` diagram showing the four layers. Apply `classDef` colour coding for critical/warning components.

````mermaid
graph TD
  subgraph UI["UI Layer"]
    F["Forms — {N} main forms / {N} entities"]
    PCF["PCF Controls — {list names}"]
    WR["Web Resources — {list namespace groups}"]
  end
  subgraph LOGIC["Business Logic"]
    PL["Plugins (Sync) — {list assemblies} · {N} steps"]
    PA["Power Automate (Async) — {N} flows"]
    CW["Classic Workflows — {N} ⚠ deprecated"]
  end
  subgraph DATA["Data Layer"]
    CT["Custom Tables — {N}"]
    OOB["Extended OOB — {list}"]
  end
  subgraph INT["Integration"]
    AF["Azure Functions — {list}"]
    LA["Logic Apps — {list}"]
    CA["Custom Actions / Connectors — {list}"]
  end
  UI --> LOGIC
  LOGIC --> DATA
  LOGIC --> INT
  INT --> EXT1["{External System A}"]
  INT --> EXT2["{External System B}"]
  classDef warning fill:#ffaa00,color:#000,stroke:#cc7700
  classDef info fill:#0066cc,color:#fff,stroke:#004499
  class CW warning
  class EXT1,EXT2 info
````

### §3 Solution Package Structure
Table: Package Name | Version | Component Types | Depends On | Deployment Order
Infer dependencies from: plugin assemblies that reference entity schema names from another package; flows that use environment variables defined in another package.

### §4 Data Architecture
Entity relationship map, key data flows, master vs transactional data classification.

### §5 Integration Architecture
Topology diagram with all external systems, direction, technology, auth method, frequency.

Generate a Mermaid `graph LR` integration topology. Place D365 CE in the centre; external systems on the periphery. Use `:::info` for external systems and `:::warning`/`:::critical` for auth or security risks.

````mermaid
graph LR
  D365["D365 CE\n(AIC PACES)"]
  SysA["{External System A}"]:::info
  SysB["{External System B}"]:::info
  SysC["{External System C}"]:::info
  SysA -- "{direction} · {technology} · {auth}" --> D365
  D365 -- "{direction} · {technology} · {auth}" --> SysB
  D365 <-- "{bidirectional} · {technology}" --> SysC
  classDef info fill:#0066cc,color:#fff,stroke:#004499
  classDef warning fill:#ffaa00,color:#000,stroke:#cc7700
  classDef critical fill:#ff4d4d,color:#fff,stroke:#cc0000
````

### §6 Security Architecture
Authentication model per actor type; role hierarchy; data isolation model.

### §7 Non-Functional Profile
| Characteristic | Assessment | Evidence |
|---|---|---|
| Performance | {assessment} | {specific components} |
| Scalability | {assessment} | {patterns observed} |
| Maintainability | {assessment} | {code quality signals} |
| Upgrade Risk | {assessment} | {flagged items} |
| Security | {assessment} | {flagged items} |

### §8 Architectural Findings

Ranked by severity — **Critical** / **High** / **Medium** / **Informational**:
| Severity | # | Component | Package | Finding | Recommendation |

---

## data-model.md Content

- Entity relationship map — use a Mermaid `erDiagram` covering the core domain entities (omit reference/lookup tables). Show relationship cardinality and key field names.
- Relationship table: Parent | Relationship Name | Child | Type | Cascade Delete
- Primary keys, alternate keys, polymorphic lookups
- Sensitive data fields table

````mermaid
erDiagram
  ENTITY_A {
    guid id PK
    string name
    lookup foreign_id FK
  }
  ENTITY_B {
    guid id PK
    string field
  }
  ENTITY_A ||--o{ ENTITY_B : "relationship-name"
````

---

## dependency-map.md Content

For each component, what it depends on and what depends on it.
Track cross-package dependencies explicitly.

Include a Mermaid `graph LR` package dependency diagram at the top of the file. Nodes = solution packages; arrows = depends-on direction. Apply `:::warning` to packages with orphaned components.

````mermaid
graph LR
  PKG_A["Package A\n(foundation)"]
  PKG_B["Package B"]
  PKG_C["Package C"]:::warning
  PKG_B --> PKG_A
  PKG_C --> PKG_A
  classDef warning fill:#ffaa00,color:#000,stroke:#cc7700
````

Then the full component dependency table:

| Component | Type | Package | Depends On | Depended On By |
|---|---|---|---|---|

Flag `⚠ CIRCULAR DEPENDENCY` and `⚠ ORPHANED` (no references from any component).

---

## impact-map.md Content

> **Purpose:** The impact map is a developer reference for change-request scoping. It answers "if I change entity/field X, what will break?" without requiring the developer to read through all other documentation files.

This document is organised entity-by-entity. For each custom entity, aggregate all references across plugins, flows, JS, and forms.

### Header

```markdown
# Component Impact Map
> Use this map to scope the blast radius of any change before implementing it.
> Entity sections list every plugin, flow, and JS file that touches that entity.
> Field sections (within each entity) list every component that reads or writes a specific field.
```

### Per-Entity Impact Block

For every custom entity, produce the following block. Read the data from the already-generated component docs (`docs-generated/technical/plugins/`, `docs-generated/functional/flows.md`, `docs-generated/technical/web-resources/`).

```markdown
---
### {Entity Display Name} (`{schema_name}`)

#### Plugin Steps (in execution order)
| Stage | Rank | Plugin Class | Message | Filtering Attributes | Mode |
|---|---|---|---|---|---|
| PreValidation | 1 | AICPACESPlugin.ClinicValidation | Update | aic_status, aic_hsgstatus | Sync |
| PreOperation | 1 | AICPACESPlugin.ClinicEnrolment | Create | (all) | Sync |
| PostOperation | 1 | AICPACESPlugin.AuditLog | Update | (all) | Async |

#### Flows Triggered on This Entity
| Flow Name | Trigger | Filter Condition | Package |
|---|---|---|---|
| Notify ICM on HSG Enrolment | Record Updated | aic_status = Enrolled (100000003) | AICPACESPowerAutomates |
| Update Partner on Enrolment | Record Created | (none — fires on all creates) | AICPACESPowerAutomates |

#### JavaScript Files Registered on Forms
| Form Name | JS File | Events Handled |
|---|---|---|
| Clinic Main Form | pub_aic_clinic_form.js | OnLoad, aic_status OnChange, OnSave |
| Clinic Quick Create | pub_aic_clinic_quickcreate.js | OnLoad |

#### High-Touch Fields (referenced by 2+ components)
For each field that is referenced by more than one component (plugin filtering attribute, flow trigger filter, or JS attribute access), list the touching components:

| Field | Schema Name | Touched By |
|---|---|---|
| Status | aic_status | Plugin: ClinicValidation (filtering attr) · Plugin: ClinicEnrolment (reads in Execute) · Flow: Notify ICM (trigger filter) · JS: pub_aic_clinic_form.js → onStatusChange (reads + sets visibility) |
| HSG Status | aic_hsgstatus | Plugin: ClinicValidation (filtering attr) · JS: pub_aic_clinic_form.js → onHsgStatusChange |
| Submit Date | aic_submitdate | Plugin: ClinicEnrolment (writes) · JS: pub_aic_clinic_form.js → onLoad (sets visibility) |
```

### Coverage

Produce an entity impact block for:
- Every custom entity that has at least one plugin step, flow trigger, or JS file reference
- All OOB entities extended with custom fields that are referenced by plugins or flows (contact, account, incident, systemuser)

Entities with no plugin steps, no flow triggers, and no JS references (pure reference/config entities) may be listed in a summary table at the end:

```markdown
### Entities with No Active Component References
| Entity | Schema Name | Notes |
|---|---|---|
| HSG Region | aic_hsgregion | Read-only lookup — no plugins, flows, or JS reference it directly |
```

### Field Change Impact Summary Table

After all entity blocks, produce a single aggregated table of the top 30 most-referenced fields across all entities (ranked by number of touching components). This gives developers the quickest view of high-risk fields.

```markdown
## High-Risk Field Change Index
Fields with the most component dependencies — changes here have the widest blast radius.

| Rank | Entity | Field | Schema Name | Touching Components | Risk |
|---|---|---|---|---|---|
| 1 | Clinic | Status | aic_status | 3 plugins + 4 flows + 2 JS functions | High |
| 2 | Case | Status Reason | statuscode | 2 plugins + 6 flows + 1 JS function | High |
```

## Completion Report

```
BLUEPRINT COMPLETE
══════════════════
Project   : {project-name}
Pattern   : {Pattern X} — {name}
Packages  : {N} solution packages analysed

Findings  : {N} Critical  {N} High  {N} Medium  {N} Informational
Orphaned  : {N} components
Circular  : {N} dependencies
Impact Map: {N} entities mapped  |  {N} high-touch fields identified

Files written:
  docs-generated/architecture/solution-blueprint.md
  docs-generated/architecture/data-model.md
  docs-generated/architecture/dependency-map.md
  docs-generated/architecture/impact-map.md

Next step: /d365-ce-brownfield-index
```
