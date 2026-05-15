---
mode: agent
description: "Generate a Solution Blueprint for a D365 CE feature. Use when the user wants an architecture blueprint from a task-ready plan. Triggers on: 'blueprint', 'solution blueprint', 'architecture blueprint', 'generate blueprint'."
---

Generate a Solution Blueprint for a D365 CE feature from a task-ready technical plan.

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`.
2. If status is not `TASK-READY` or `PARTIALLY READY`, stop: "Run /d365-ce-clarify first. Blueprint requires a reviewed plan."

## Steps

3. Read all files in `constitution/`.

3b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Read `{brownfield.docs-path}/architecture/solution-blueprint.md` if it exists.
    - Read `{brownfield.docs-path}/architecture/dependency-map.md` if it exists.
    - The existing blueprint is the baseline. The new blueprint must:
      (a) identify which existing architecture patterns the feature follows;
      (b) call out any deliberate departures with justification;
      (c) show how the new components integrate into the existing component topology.
    If `false`: skip.

4. Read `specs/{feature-name}/spec.md` and `plans/{feature-name}/plan.md`.
5. Determine the architecture pattern from the task inventory (see patterns below).
6. Generate the Blueprint using `doc-templates/solution-blueprint-template.md`.
7. Write to `docs-generated/{feature-name}/solution-blueprint.md`.
8. Print: architecture pattern chosen, key design decisions, risks identified.

## Architecture Pattern Selection

Analyse the task inventory and select the dominant pattern. Document the rationale.

### Pattern A — Plugin-Centric
**Use when:** Business logic must be synchronous, transactional, or runs before/after Dataverse operations.
**Indicators:** Many plugin tasks, synchronous validation, data manipulation on save.

### Pattern B — Flow-Centric
**Use when:** Logic is process-oriented, involves approvals, notifications, or multi-step automation that can be async.
**Indicators:** Many Power Automate tasks, approval workflows, notifications, scheduled jobs.

### Pattern C — Hybrid (Plugin + Flow)
**Use when:** Some logic requires synchronous server-side control (plugins) AND some requires async orchestration (flows).
**Indicators:** Mix of plugin tasks and flow tasks; different SLA requirements per process.

### Pattern D — UI-Extension Heavy
**Use when:** Primary value is in customised user experience — forms, PCF controls, JS behaviours.
**Indicators:** Many PCF and web resource tasks; limited server-side logic.

### Pattern E — Integration-Centric
**Use when:** Feature primarily moves data between D365 CE and external systems.
**Indicators:** Integration tasks dominate; Service Bus or HTTP connectors in scope.

## What the Blueprint Must Cover

### 1. Architecture Pattern and Rationale
- Selected pattern with justification
- Alternatives considered and why rejected

### 2. Component Architecture

Generate a Mermaid `graph LR` diagram. Show personas on the left, D365 CE components in the centre, and external systems on the right. Apply `:::info` to external systems and personas; `:::warning` to deprecated components.

````mermaid
graph LR
  User["👤 {Persona}"]:::info
  Form["D365 CE Form\n{EntityName}"]
  Plugin["Plugin\n{PluginClassName}"]
  DV["Dataverse\n{xyz_entity}"]
  Flow["Flow\n{FlowName}"]
  Ext["{External System}"]:::info
  User --> Form
  Form --> Plugin
  Plugin --> DV
  Plugin --> Flow
  Flow -- "{protocol}" --> Ext
  classDef info fill:#93c5fd,color:#000,stroke:#3b82f6
  classDef warning fill:#f59e0b,color:#000,stroke:#d97706
````

### 3. Data Architecture
- Entity relationship overview (key entities and their associations)
- Data flow: where data originates, transforms, and lands
- Data volume and retention considerations

### 4. Security Architecture
- Authentication model (who accesses what)
- Privilege model summary (role → table → level)
- Integration user and access scope

### 5. Integration Architecture (if applicable)
- Systems connected, protocols used, direction
- Async vs sync per integration channel
- Error and retry strategy

### 6. ALM Architecture
- Environment strategy for this feature
- Solution structure (which solution, dependencies)
- Deployment pipeline stages

### 7. Technical Risks and Mitigations
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Plugin execution timeout on large datasets | Medium | High | Async mode + batch processing |

### 8. Non-Functional Requirements Coverage
How the design addresses: performance, scalability, availability, maintainability

### 9. Brownfield Architecture Delta *(include only when `brownfield.enabled: true`)*
- Before/after component topology: existing components (from brownfield blueprint) annotated with what changes (EXTEND / REPLACE) and what is new (NEW)
- Pattern consistency: does this feature follow the established architecture pattern or introduce a new one? If new, provide justification.
- Net additions: list every new component not present in the brownfield system
