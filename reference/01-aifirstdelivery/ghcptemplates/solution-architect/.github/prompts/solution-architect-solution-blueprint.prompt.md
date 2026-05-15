---
mode: agent
description: "Generate a cross-platform solution blueprint synthesising all domain agent artefacts — D365 CE, D365 F&O, Power Apps, Integration, Data Migration, Reporting. Triggers on: 'solution-blueprint', 'cross-platform blueprint', 'architecture blueprint'."
---

Produce a cross-template Solution Blueprint for a project by discovering and reading specs, plans,
and per-feature blueprints from all configured sibling template folders, then synthesising them into
a single authoritative architecture document.

## Usage

```
/solution-architect-solution-blueprint {project-name}
/solution-architect-solution-blueprint {project-name} --features d365-ce:{f1},d365-fo:{f2},integration:{f3},power-apps:{f4}
```

If `--features` is omitted the command auto-discovers features from all sibling templates.

---

## Step 1 — Load Constitution

Read every file in `constitution/` before doing anything else. The constitution overrides all other instructions.

---

## Step 2 — Discover Inputs

### If `--features` provided

Parse the comma-separated list. Each entry is `{template}:{feature-name}`.
Valid template names: `d365-ce`, `d365-fo`, `integration`, `power-apps`, `data-migration`, `reporting`.

### If no `--features` argument

Auto-discover by scanning each sibling template's primary artefact folder:

- `../d365-ce/specs/` — each subdirectory that contains `spec.md`
- `../d365-fo/docs/` — each subdirectory that contains `fdd.md`  *(D365 F&O uses docs/, not specs/)*
- `../integration/specs/` — each subdirectory that contains `spec.md`
- `../power-apps/specs/` — each subdirectory that contains `spec.md`
- `../data-migration/specs/` — each subdirectory that contains `spec.md`
- `../reporting/specs/` — each subdirectory that contains `spec.md`

### Confirm discovered inputs

Print before proceeding:

```
INPUTS DISCOVERED
═════════════════
D365 CE features     : {list or "none"}
D365 F&O features    : {list or "none"}
Integration features : {list or "none"}
Power Apps features  : {list or "none"}
Data Migration       : {list or "none"}
Reporting features   : {list or "none"}
Total features       : {N}

Proceeding with generation...
```

---

## Step 2b — Load Brownfield Baseline (conditional)

Read `constitution/10-project-configuration.md`.

If `brownfield.enabled: true`:

Read the following files from `{docs-path}/` (skip silently if absent):

1. `component-inventory.md` — existing component types and counts
2. `entity-catalogue.md` — existing Dataverse entities and columns
3. `technical-overview.md` — existing technical architecture
4. `solution-blueprint.md` — existing solution blueprint
5. `dependency-map.md` — existing component dependencies
6. `integration-topology.md` — existing integration topology

Print after reading:

```
BROWNFIELD BASELINE DISCOVERED
═══════════════════════════════
Source        : {docs-path}
Component inventory : {found / not found}
Entity catalogue    : {found / not found}
Technical overview  : {found / not found}
Solution blueprint  : {found / not found}
Dependency map      : {found / not found}
Integration topology: {found / not found}
```

If `brownfield.enabled: false` or `constitution/10-project-configuration.md` is absent, skip this step entirely.

---

## Step 3 — Read Feature Artefacts

### D365 CE, Integration, Power Apps, Data Migration, and Reporting features

For each feature, read in order (skip silently if absent):

1. `../{template}/specs/{feature}/spec.md`
2. `../{template}/plans/{feature}/plan.md`
3. `../{template}/plans/{feature}/work-items.yaml`
4. `../{template}/docs-generated/{feature}/technical-design-document.md`
5. `../{template}/docs-generated/{feature}/solution-blueprint.md`

### D365 F&O features  *(different artefact paths)*

For each d365-fo feature, read in order (skip silently if absent):

1. `../d365-fo/docs/{feature}/fdd.md`          — replaces spec.md
2. `../d365-fo/docs/{feature}/tdd.md`           — replaces TDD
3. `../d365-fo/docs/{feature}/test-plan.md`     — test strategy and cases
4. `../d365-fo/plans/{feature}/plan.md`
5. `../d365-fo/plans/{feature}/work-items.yaml`

As you read, build an internal feature registry entry for each feature:

| Field | Source |
|---|---|
| Template | folder name |
| Feature name | folder name |
| Scope summary | spec.md or fdd.md — business objective |
| Key requirements | spec.md FR list or fdd.md business rules |
| Component types | plan.md — object types (D365 F&O: EXT/DEN/INT categories) |
| Integration touchpoints | spec.md / fdd.md — external systems named |
| Cross-template dependencies | identified during synthesis in Step 4 |

---

## Step 4 — Read Cross-Cutting Constitution Files

Read the following from sibling template constitutions (skip if absent):

| File | Used for |
|---|---|
| `../d365-ce/constitution/01-solution-design.md` | Publisher prefix, D365 solution name, namespace |
| `../d365-ce/constitution/07-devops-alm.md` | D365 CE pipeline strategy |
| `../d365-fo/constitution/01-governance-and-objects.md` | D365 F&O model name, module codes, AVA prefix |
| `../d365-fo/constitution/04-development-and-alm.md` | D365 F&O pipeline strategy, environment names |
| `../integration/constitution/01-integration-patterns.md` | Azure resource naming prefix, region |
| `../integration/constitution/07-security.md` | Managed Identity name pattern, Key Vault name |
| `../integration/constitution/08-devops-alm.md` | Azure pipeline strategy |
| `../power-apps/constitution/04-dataverse-schema.md` | Publisher prefix, Dataverse solution name |
| `../power-apps/constitution/07-devops-alm.md` | Power Platform pipeline strategy |
| `../reporting/constitution/10-alm-configuration.md` | Workspace prefix, SSRS server URL, workspace naming pattern |
| `../reporting/constitution/06-devops-alm.md` | Power BI deployment pipeline strategy, sensitivity label policy |
| `../data-migration/constitution/10-alm-configuration.md` | ADF resource prefix, SQL staging schema, environment names |

These values feed into the naming, security, and ALM sections of the blueprint.

---

## Step 5 — Synthesise Cross-Template Dependencies

Before generating, identify explicit dependency points between templates:

**D365 CE / Power Apps (Dataverse-based):**
- Dataverse tables written by a D365 CE plugin **and** read by a Canvas App or Power Automate flow
- Events published by a D365 CE plugin or flow that trigger an Azure Integration component
- Azure Functions called via APIM from a Power Automate flow or Canvas App
- Shared Dataverse schema referenced by both D365 CE and Power Apps features

**D365 F&O (separate platform — connected via Integration layer):**
- D365 F&O outbound INT objects (interface classes) publishing to Azure Service Bus or calling Azure Functions
- Azure Integration components (Logic Apps / Functions) writing back to D365 F&O via Data Entities (OData / DMF)
- D365 F&O data exposed to Power BI via Analytical Reports (ANR) or exported via Data Entities
- D365 F&O business events subscribed to by Power Automate (via Business Events endpoint)
- Shared master data (customers, vendors, products) flowing between D365 F&O and D365 CE via Integration middleware

**Cross-platform:**
- Azure infrastructure provisioned by the Integration template that D365 F&O interface classes depend on (Key Vault, Service Bus, APIM)

**Reporting (Power BI / SSRS):**
- Power BI datasets consuming Dataverse tables written by D365 CE plugins or flows
- Power BI datasets fed by ADF staging tables (Data Migration → Reporting dependency)
- SSRS reports reading D365 CE Dataverse via FetchXML (CE → Reporting dependency)
- RLS roles in Power BI mapping to D365 CE / D365 F&O security roles
- D365 F&O data exposed to Power BI via Data Entities or Azure Data Lake

Record each dependency as:

```
DEPENDENCY: {source-template}/{feature} → {target-template}/{feature}
TYPE: Schema shared | Event published | API called | Data consumed | Master data synced
```

These must be reflected in the Feature Dependency Diagram (Section 3.3) and the Integration Architecture (Section 5).

---

## Step 6 — Generate the Solution Blueprint

Use `doc-templates/solution-blueprint-template.md` as the structure guide. Generate ALL sections and ALL mandatory Mermaid diagrams in a single pass — do not defer any section or diagram.

**Synthesis rules:**

- Deduplicate shared Dataverse tables — if the same table appears in multiple features, document it once with its full column and relationship set
- Merge integration patterns across templates — do not list them per-feature; synthesise into a unified Integration Architecture
- Show every cross-template dependency identified in Step 5 in at least one diagram
- Traceability (Section 10) must include every FR from every input spec — cross-feature, cross-template

**Additional rules when brownfield baseline was loaded (Step 2b):**

- Section 0 must include a **Brownfield Baseline Sources** subsection — table listing each brownfield doc read and whether it was found
- Section 3.2 Logical Architecture diagram must visually differentiate existing components (from the brownfield baseline) from new components being added — use the colour coding conventions in `constitution/03-diagram-standards.md`; existing components: grey (`fill:#ccc`); new components: the standard colours for their tier
- Section 4.2 Data Architecture must note existing Dataverse entities from `entity-catalogue.md` that are referenced or extended by the new features — mark them as `[EXISTING]` rather than documenting them as new
- Section 5 Integration Architecture must note existing integration patterns from `integration-topology.md` that the new features depend on or extend — do not re-document them in full; cross-reference with a note "Existing — see brownfield baseline"
- Section 8 Risks must include at least one backward compatibility risk entry covering the existing system (e.g., schema changes to existing entities, breaking changes to existing integration endpoints, or extension conflicts)

**Constitution constraints apply throughout:**

- Stay at architecture level — no code, no task steps, no formula snippets
- Every MANDATORY diagram must be generated inline — not in a follow-up response
- Mermaid syntax must be valid — validate mentally before outputting
- Naming must be consistent with the publisher prefix and resource prefix read from the sibling constitutions

---

## Step 7 — Write Output

Write the generated blueprint to:

```
output/{project-name}/solution-blueprint.md
```

Create the `output/{project-name}/` directory if it does not exist.
If the file already exists, overwrite it — this is a regeneration.

---

## Step 8 — Print Completion Report

```
SOLUTION BLUEPRINT COMPLETE
════════════════════════════
Project      : {project-name}
Features     : {N} total  (D365 CE:{n}  D365 F&O:{n}  Integration:{n}  Power Apps:{n}  Data Migration:{n}  Reporting:{n})
Brownfield   : {enabled — baseline read from {docs-path} | disabled}
Dependencies : {N} cross-template dependencies identified
Sections     : 10 sections generated
Diagrams     : {N} Mermaid diagrams embedded
Output       : output/{project-name}/solution-blueprint.md

Next steps:
  /solution-architect-solution-review {project-name}  ← validate the blueprint against the constitution
```
