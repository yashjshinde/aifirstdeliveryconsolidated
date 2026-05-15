---
mode: agent
description: "Generate a Solution Blueprint for a Power Platform feature from a task-ready plan, selecting the correct architecture pattern. Triggers on: 'blueprint', 'solution blueprint', 'generate blueprint'."
---

Generate a Solution Blueprint for a Power Platform feature from a task-ready plan.

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`. If not `TASK-READY` or `PARTIALLY READY`, stop.

## Steps

2. Read all files in `constitution/`.

2b. If `brownfield.enabled: true` in `constitution/10-alm-configuration.md`, read as baseline:
    - `{brownfield.docs-path}/architecture/solution-blueprint.md` — existing architecture blueprint
    - `{brownfield.docs-path}/architecture/dependency-map.md` — existing component dependency map
    Use this to add a §9 Brownfield Architecture Delta section to the blueprint showing
    what is existing vs new, and ensuring the chosen pattern is consistent with the established one.

3. Read `specs/{feature-name}/spec.md` and `plans/{feature-name}/plan.md`.
4. Determine architecture pattern from task inventory.
5. Generate Blueprint using `doc-templates/solution-blueprint-template.md`.
6. Write to `docs-generated/{feature-name}/solution-blueprint.md`.
7. Print: pattern chosen, key decisions, risks.

## Architecture Pattern Selection

### Pattern A — Canvas-First
**Use when:** Custom UX, mobile scenarios, non-standard navigation, embedded scenarios.
**Stack:** Canvas App → Dataverse → Power Automate (background)
**Indicators:** Many canvas app screen tasks, mobile requirement, offline requirement.

### Pattern B — Model-Driven-First
**Use when:** Data-centric, standard CRUD, complex security model, large datasets.
**Stack:** Model-Driven App → Dataverse → Power Automate + Plugins
**Indicators:** Many MDA form/view tasks, security matrix complexity, standard navigation.

### Pattern C — Hybrid (Canvas + MDA)
**Use when:** Need both custom UX for some personas and standard data management for others.
**Stack:** Canvas App (user-facing) + MDA (admin/power-user) → shared Dataverse
**Indicators:** Multiple persona types with very different UX needs.

### Pattern D — Copilot-Augmented
**Use when:** Conversational entry point, Teams integration, self-service queries, guided processes.
**Stack:** Copilot Studio → Power Automate → Dataverse / External Systems
**Indicators:** Copilot topic tasks in plan, Teams deployment, natural language interaction.

### Pattern E — Automation-Heavy
**Use when:** Feature is primarily process automation with minimal custom UI.
**Stack:** Power Automate (complex flows) → Dataverse → External Systems; minimal app UI.
**Indicators:** Flow tasks dominate the plan; UI changes are minor.

## What the Blueprint Must Cover

### 1. Architecture Pattern and Rationale

### 2. Component Architecture

Generate a Mermaid `graph LR` diagram. Show each persona and their app entry point. Use `subgraph` for Dataverse. Apply `:::info` to personas and external systems; `:::warning` to delegation-limited operations.

````mermaid
graph LR
  PersonaA["👤 {Persona A}"]:::info
  PersonaB["👤 {Persona B}"]:::info
  Canvas["Canvas App\n{AppName}"]
  MDA["Model-Driven App\n{AppName}"]
  subgraph DV["Dataverse"]
    Entity1["{xyz_entity1}"]
    Entity2["{xyz_entity2}"]
  end
  Flow["Flow\n{FlowName}"]
  Approver["👤 Approver (Teams)"]:::info
  PersonaA --> Canvas
  PersonaB --> MDA
  Canvas --> Entity1
  MDA --> Entity1
  MDA --> Entity2
  Canvas --> Flow
  Flow --> Approver
  classDef info fill:#93c5fd,color:#000,stroke:#3b82f6
  classDef warning fill:#f59e0b,color:#000,stroke:#d97706
````

### 3. Data Architecture
- Key entities and relationships
- Data volume and delegation considerations
- Offline data sync (if canvas offline required)

### 4. Security Architecture
- Authentication: Azure AD for all apps
- Security role structure: how roles map to personas
- Row-level security approach
- App sharing model (Azure AD groups)

### 5. Integration Architecture (if applicable)
- External connectors used
- Direction and trigger
- Connection references required

### 6. ALM Architecture
- Environment strategy
- Solution structure and dependencies
- Pipeline stages
- Connection reference and environment variable management

### 7. Power Platform CoE Alignment
- Compliance with CoE Starter Kit policies
- DLP policy impact (which connectors used, which tier)
- Licensing tier required per user persona

### 8. Technical Risks and Mitigations
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Delegation limit on canvas gallery | High | Medium | Server-side view filter, paginate |
| Premium connector licensing cost | Medium | High | Review alternatives, confirm budget |
