Generate a Solution Blueprint for a Reporting feature from a task-ready technical plan.

## Usage

```
/blueprint {feature-name}
```

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`.
2. If status is not `TASK-READY` or `PARTIALLY READY`, stop: "Run /clarify first. Blueprint requires a reviewed plan."

## Steps

3. Read all files in `constitution/`.
4. Read `specs/{feature-name}/spec.md` and `plans/{feature-name}/plan.md`.
5. Determine the architecture pattern from the task inventory (see patterns below).
6. Write to `docs-generated/{feature-name}/solution-blueprint.md`.
7. Print: architecture pattern chosen, key design decisions, risks identified.

## Architecture Pattern Selection

Analyse the task inventory and select the dominant pattern:

### Pattern A — Self-Service Analytics
**Use when:** Power BI interactive reports consumed directly by business users via Power BI Service / Teams.
**Indicators:** Many Report-Interactive tasks; Import mode dataset; business-user personas.

### Pattern B — Operational Reporting (SSRS / Paginated)
**Use when:** Pixel-perfect, print-ready, or scheduled subscription reports.
**Indicators:** Report-SSRS or Report-Paginated tasks; subscription delivery; D365 CE embedding.

### Pattern C — Embedded Reporting
**Use when:** Reports are surfaced within D365 CE, Canvas App, or a portal.
**Indicators:** Embedding configuration tasks; service principal auth; CE or PA integration.

### Pattern D — Enterprise Dataset (Centralised Semantic Model)
**Use when:** Multiple reports consume a single shared certified dataset.
**Indicators:** One DataModel task serving many Report tasks; dataset certification in scope.

### Pattern E — Real-Time / DirectQuery
**Use when:** Data freshness requirement is under 15 minutes and import refresh is insufficient.
**Indicators:** DirectQuery mode; aggregation table tasks; Dataverse live connection.

## Blueprint Sections

### 1. Architecture Pattern and Rationale
- Selected pattern with justification.
- Alternatives considered and why rejected.

### 2. Component Architecture

Generate a Mermaid `graph LR` diagram. Show data source on the left flowing through refresh chain to reports and consumers on the right. Apply `:::info` to external data sources and consumers; `:::warning` to DirectQuery paths (latency risk).

````mermaid
graph LR
  DS["{Data Source\nDataverse / SQL / SFTP}"]:::info
  DF["Dataflow\n{DataflowName}"]
  Dataset["Dataset\n{DatasetName}"]
  RepI["Report (Interactive)\n{ReportName}"]
  RepP["Report (Paginated)\n{ReportName}"]
  Consumer["{Consumer\nPower BI Service / D365 CE}"]:::info
  DS -- "refresh / query" --> DF
  DF --> Dataset
  Dataset --> RepI
  Dataset --> RepP
  RepI --> Consumer
  RepP --> Consumer
  classDef info fill:#93c5fd,color:#000,stroke:#3b82f6
  classDef warning fill:#f59e0b,color:#000,stroke:#d97706
````

### 3. Data Architecture
- Star schema overview: fact tables, dimension tables, relationships.
- Data flow: source → dataflow/ADF → dataset → report → consumer.
- Storage mode decision and justification.
- Data volume and retention considerations.

### 4. Security Architecture
- RLS role structure and filter hierarchy.
- Workspace permission model per environment.
- Embedding authentication approach (service principal details by variable name only).
- Sensitivity label classification.

### 5. Refresh and Pipeline Architecture
- Dataset refresh chain: dataflow → dataset → downstream reports.
- Refresh schedule and failure alerting.
- Deployment pipeline: DEV → UAT → PROD promotion gates.

### 6. ALM Architecture
- Git repository structure for PBIX / TMDL / RDL files.
- CI/CD pipeline stages (validate → deploy DEV → promote UAT → promote PROD).
- Rollback strategy.

### 7. Technical Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DirectQuery latency under peak load | Medium | High | Aggregation tables + query reduction |
| RLS misconfiguration exposing restricted data | Low | Critical | Automated RLS test suite in CI/CD pipeline |

### 8. Non-Functional Requirements Coverage
How the design addresses performance (load time, refresh window), scalability (model size, concurrent users), availability (refresh SLA), and maintainability (TMDL in source control).
