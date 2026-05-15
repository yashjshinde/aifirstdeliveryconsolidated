---
mode: agent
description: "Split a mixed-domain D365 F&O FDD into domain-scoped specs for Integration and Data Migration agents. Triggers on: 'split-spec', 'split fdd', 'mixed domain'."
---

Split a mixed Functional Design Document into domain-scoped documents: one for the D365 F&O agent, one for the Azure Integration agent (when event-driven pipeline requirements are present), one for the Data Migration agent (when ADF requirements are present), and one for the Reporting agent (when Power BI or SSRS requirements are present).

## Usage

```
/d365-fo-split-spec {requirement-name}
```

## When to Use

Use this command when an FDD contains requirements from more than one of:
- **D365 F&O requirements** — X++ extensions, AX forms, F&O tables/EDT/enums, batch jobs, F&O security (duties/privileges/roles), SSRS reports that are F&O-native, Data Entities (when used internally), F&O workflows, FinOps-native process automation, menu items
- **Integration requirements** — event-driven pipelines, data sync via Azure Functions / Logic Apps / Service Bus / APIM, infrastructure provisioning, DLQ/retry/monitoring, Bicep, Data Entities exposed as an integration surface to external systems
- **Data Migration requirements** — ADF pipelines, SFTP file transfer, staging SQL tables, bulk F&O/Dataverse upsert via ADF, data flows, file-based batch loads
- **Reporting requirements** — Power BI reports, Power BI Paginated reports, cross-F&O SSRS reports not embedded natively in F&O, datasets, DAX measures, RLS, workspace configuration

Do not use this command if the FDD is already scoped to a single domain.

---

## Pre-condition Check

1. Read `docs/{requirement-name}/fdd.md`. If the file does not exist, stop: "No FDD found. Run /d365-fo-fdd first."
2. Read all files in `constitution/` — classification rules must respect constitution boundaries.

---

## Steps

### Step 1 — Classify every FR / Object

Read the full FDD. For each FR and each Object in the Object Inventory, assign one of four classifications:

| Classification | Criteria |
|---|---|
| **F&O** | Entirely within D365 F&O — X++ classes/tables/forms, EDT/enum definitions, batch jobs, F&O-native SSRS reports, F&O-native workflows, security duties/privileges/roles, menu items, data entities consumed internally by F&O forms or processes |
| **Integration** | Entirely outside D365 F&O — event-driven data pipelines, external system sync via Azure Functions / Logic Apps / Service Bus / APIM, infrastructure provisioning, DLQ/retry/monitoring, Bicep — including Data Entities whose primary consumer is an external system |
| **Data Migration** | ADF-based movement of data — SFTP file ingestion, staging SQL tables, bulk F&O/Dataverse upsert via ADF data flows, ingest/export/transform pipelines, file-based batch loads, migration schedules |
| **Reporting** | Power BI report design, Power BI Paginated reports, cross-F&O SSRS reports not embedded natively, DAX measures, RLS roles, workspace configuration, Power BI Embedded, subscription delivery |
| **Cross-cutting** | Spans more than one domain — e.g., "Data Entity receives SFTP payload via ADF and triggers F&O business logic"; "when user posts a journal in F&O, an event is published via Service Bus"; "F&O data is surfaced in a Power BI report"; "nightly ADF pipeline loads records into F&O via Data Entity" |

**Cross-cutting FR splitting rule:**
For every cross-cutting FR, produce linked child FRs for each domain it spans:
- `FR-NNN-FO`: the F&O portion only (what D365 F&O stores, validates, enforces, or triggers internally)
- `FR-NNN-INT`: the Azure integration portion only (what the event-driven pipeline receives, transforms, or delivers)
- `FR-NNN-DM`: the data migration portion only (what the ADF pipeline ingests, stages, or upserts)
- `FR-NNN-RPT`: the Reporting portion only (what the report shows, the dataset, the RLS rule)
Only create child FRs for the domains the FR actually spans. Each child FR must reference the others in its Dependencies field.

---

### Step 2 — Write the F&O-scoped FDD

Overwrite `docs/{requirement-name}/fdd.md` with an F&O-scoped version:

- Retain the existing front matter; update `scope: F&O` and append a note: `split-from: original mixed FDD — integration portion at specs/{requirement-name}-integration/spec.md`
- **Object Inventory:** Remove all objects whose primary purpose is integration infrastructure. Retain Data Entities that serve F&O internal consumption.
- **Form Design, Field Mapping, Business Rules:** Keep all F&O sections unchanged.
- For cross-cutting FRs: replace with the `-FO` child FR; note `split from FR-NNN — see integration/DM/reporting spec for other portions`
- Remove all non-F&O-classified FRs entirely
- Re-number the retained FRs sequentially; record the original → FO mapping in the manifest
- Update Scope, NFRs, Assumptions to reflect F&O-only scope

---

### Step 3 — Write the Integration-scoped spec

*Only if one or more FRs were classified as Integration or contain a `-INT` child.*

Create `specs/{requirement-name}-integration/spec.md` following the Integration agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {requirement-name}-integration
domain: integration
status: DRAFT
split-from: docs/{requirement-name}/fdd.md
fo-fdd-ref: docs/{requirement-name}/fdd.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/d365-fo-split-spec)
---
```

Include: all Integration-classified FRs + `-INT` child FRs, renumbered FR-001, FR-002, …
Note: "D365 F&O schema changes and Data Entity definitions required for this integration are handled by the F&O agent — see F&O FDD."

---

### Step 4 — Write the Data Migration-scoped spec

*Only if one or more FRs were classified as Data Migration or contain a `-DM` child.*

Create `specs/{requirement-name}-data-migration/spec.md` following the Data Migration agent's spec structure.

**YAML front matter:**
```yaml
---
migration: {requirement-name}-data-migration
domain: data-migration
status: DRAFT
split-from: docs/{requirement-name}/fdd.md
fo-fdd-ref: docs/{requirement-name}/fdd.md
direction: SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/d365-fo-split-spec)
---
```

Include: all Data Migration-classified FRs + `-DM` child FRs, renumbered MR-001, MR-002, …
Note: "F&O agent owns the Data Entity schema definition; ADF pipeline (Data Migration agent) owns the ingest contract."

---

### Step 5 — Write the Reporting-scoped spec

*Only if one or more FRs were classified as Reporting or contain a `-RPT` child.*

Create `specs/{requirement-name}-reporting/spec.md` following the Reporting agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {requirement-name}-reporting
domain: reporting
status: DRAFT
split-from: docs/{requirement-name}/fdd.md
fo-fdd-ref: docs/{requirement-name}/fdd.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/d365-fo-split-spec)
---
```

Include: all Reporting-classified FRs + `-RPT` child FRs, renumbered FR-001, FR-002, …
Note: "F&O Data Entity definitions that serve as the reporting data source are handled by the F&O agent — see F&O FDD."

---

### Step 6 — Write the split manifest

Write `docs/{requirement-name}/split-manifest.md`:

```markdown
---
original-fdd: docs/{requirement-name}/fdd.md
fo-fdd: docs/{requirement-name}/fdd.md (updated)
integration-spec: specs/{requirement-name}-integration/spec.md   ← omit if no INT FRs
data-migration-spec: specs/{requirement-name}-data-migration/spec.md   ← omit if no DM FRs
reporting-spec: specs/{requirement-name}-reporting/spec.md   ← omit if no RPT FRs
split-date: {YYYY-MM-DD}
split-by: Claude Code (/d365-fo-split-spec)
---

# Split Manifest — {requirement-name}

## Summary

Original FDD contained {N} FRs: {N} F&O, {N} Integration, {N} Data Migration, {N} Reporting, {N} cross-cutting.
Cross-cutting FRs split into child FRs per domain spanned.

## FR Classification

| Original FR | Title | Classification | F&O FDD FR | Integration Spec FR | Data Migration MR | Reporting Spec FR |
|---|---|---|---|---|---|---|

## Object Inventory Split

| Object | Category | Classification | Notes |
|---|---|---|---|

## Cross-Cutting FR Splits

### FR-NNN → FR-NNN-FO + FR-NNN-INT / FR-NNN-DM / FR-NNN-RPT

**F&O portion:** {What D365 F&O handles}
**Integration portion:** {What the Azure pipeline handles}
**Data Migration portion:** {What the ADF pipeline handles}
**Reporting portion:** {What the report/dataset handles}

## Next Steps

- [ ] F&O agent: run `/d365-fo-fdd-review {requirement-name}` to validate the F&O FDD
- [ ] Integration agent: copy `specs/{requirement-name}-integration/` and run `/review {requirement-name}-integration`
- [ ] Data Migration agent: copy `specs/{requirement-name}-data-migration/` and run `/review {requirement-name}-data-migration`
- [ ] Reporting agent: copy `specs/{requirement-name}-reporting/` and run `/review {requirement-name}-reporting`
- [ ] Confirm Data Entity ownership: F&O agent owns schema; ADF pipeline (Data Migration agent) owns ingest contract
```

---

### Step 7 — Print summary

```
FDD SPLIT COMPLETE — {requirement-name}
══════════════════════════════════════════════
Original FRs        : {N}
F&O FDD             : {N} FRs  → docs/{requirement-name}/fdd.md
Integration spec    : {N} FRs  → specs/{requirement-name}-integration/spec.md  ← omitted if 0
Data Migration spec : {N} MRs  → specs/{requirement-name}-data-migration/spec.md  ← omitted if 0
Reporting spec      : {N} FRs  → specs/{requirement-name}-reporting/spec.md  ← omitted if 0
Cross-cutting       : {N} FRs split across domains
Manifest            : docs/{requirement-name}/split-manifest.md

F&O Next Step            : /d365-fo-fdd-review {requirement-name}
Integration Next Step    : /review {requirement-name}-integration      ← run in the Integration agent
Data Migration Next Step : /review {requirement-name}-data-migration   ← run in the Data Migration agent
Reporting Next Step      : /review {requirement-name}-reporting        ← run in the Reporting agent
```

---

## Classification Reference

**F&O signals:** "X++ class", "table", "EDT", "enum", "form", "menu item", "batch job", "F&O-native SSRS", "F&O workflow", "duty", "privilege", "security role", "Data Entity consumed by F&O", "field on {TableName}", "validation in F&O", "posting logic", "ledger", "FinOps", "One Version", "extension", "CoC"

**Integration signals:** "sync from external", "receive from external", "publish to external", "Azure Function", "Service Bus", "APIM", "event-driven", "payload", "retry", "dead-letter", "idempotent", "Logic App", "Bicep", "infrastructure", "inbound webhook", "outbound notification", "external system"

**Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "raw table", "ingest pipeline", "data flow", "bulk upsert via ADF", "file-based", "CSV file", "migration schedule", "load via Data Entity from ADF", "nightly load", "error table"

**Reporting signals:** "Power BI", "PBIX", "cross-system SSRS", "RDL", "Power BI report", "dashboard", "dataset", "dataflow", "DAX", "measure", "KPI", "visual", "paginated report", "RLS", "row-level security", "workspace", "refresh schedule", "subscription", "embedded report", "Power BI Embedded"

**Cross-cutting signals:** FR contains signals from more than one domain.

## Rules

- Never drop requirements — every FR must appear in exactly one output document (or split across multiple).
- Preserve original FR numbers in the Traceability section of all output documents.
- F&O FDD retains the original file path — downstream commands (`/d365-fo-fdd-review`, `/d365-fo-tdd`, `/d365-fo-plan`) do not need to change paths.
- Data Entity ownership: F&O agent owns schema definition; Data Migration agent (ADF) owns ingest contract; Integration agent owns event-driven consumption contract.
- Reporting spec only written when at least one FR is classified as Reporting.
- Cross-cutting FRs must have explicit dependency references in all child FRs.
- Do not invent new requirements during the split.
