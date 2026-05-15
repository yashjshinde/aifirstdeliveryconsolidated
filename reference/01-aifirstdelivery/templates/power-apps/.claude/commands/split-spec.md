Split a mixed functional specification into domain-scoped specs: one for the Power Apps agent, one for the Azure Integration agent (when event-driven pipeline requirements are present), one for the Data Migration agent (when ADF requirements are present), and one for the Reporting agent (when Power BI or SSRS requirements are present).

## Usage

```
/split-spec {feature-name}
```

## When to Use

Use this command when a functional specification contains requirements from more than one of:
- **Power Apps requirements** — Canvas App screens, Model-Driven App forms/views, Power Automate flows within Power Platform, Copilot Studio topics, Dataverse schema/business rules, connection references, delegation constraints, App Access security, Power Fx logic
- **Integration requirements** — event-driven pipelines, data sync from/to external systems via Azure Functions / Logic Apps / Service Bus / APIM, infrastructure, DLQ/retry/monitoring
- **Data Migration requirements** — ADF pipelines, SFTP file transfer, staging SQL tables, bulk Dataverse upsert via ADF, data flows, file-based batch loads
- **Reporting requirements** — Power BI reports, SSRS reports, Paginated reports, datasets, DAX measures, RLS, Power BI Embedded within Canvas App or MDA, workspace configuration

Do not use this command if the spec is already scoped to a single domain.

---

## Pre-condition Check

1. Read `specs/{feature-name}/spec.md`. If the file does not exist, stop: "No spec found. Run /spec first."
2. Read all files in `constitution/` — classification rules must respect constitution boundaries.

---

## Steps

### Step 1 — Classify every FR

Read the full spec. For each FR-NNN, assign one of four classifications:

| Classification | Criteria |
|---|---|
| **Power Apps** | Entirely within Power Platform — Canvas App screens and controls, MDA forms/views, Power Automate flows triggered from Power Platform or Dataverse, Copilot Studio conversation topics, Dataverse table/column schema, business rules enforced in Dataverse or Canvas App, connection references to standard connectors, delegation constraints, App Access matrix, Power Fx |
| **Integration** | Entirely outside Power Platform — event-driven pipelines, external system sync (inbound or outbound) via Azure Functions / Logic Apps / Service Bus / APIM, infrastructure provisioning, DLQ/retry/monitoring, Bicep |
| **Data Migration** | ADF-based movement of data — SFTP file ingestion, staging SQL tables, bulk Dataverse upsert via ADF data flows, ingest/export/transform pipelines, file-based batch loads, migration schedules |
| **Reporting** | Power BI report design, SSRS reports, Paginated reports, DAX measures, RLS roles, workspace configuration, Power BI Embedded in Canvas App or MDA, subscription delivery |
| **Cross-cutting** | Spans more than one domain — e.g., "ADF pipeline loads data into Dataverse and Canvas App displays it"; "when Canvas App submits a request, an Azure Function is called to process it"; "Power BI report embedded in Canvas App showing Dataverse KPIs" |

**Cross-cutting FR splitting rule:**
For every cross-cutting FR, produce linked child FRs for each domain it spans:
- `FR-NNN-PA`: the Power Apps portion only (what Canvas App/MDA shows, what Dataverse stores, what the Platform-native flow does)
- `FR-NNN-INT`: the Azure integration portion only (what the event-driven pipeline receives, transforms, or delivers)
- `FR-NNN-DM`: the data migration portion only (what the ADF pipeline ingests, stages, or upserts)
- `FR-NNN-RPT`: the Reporting portion only (what the report shows, the dataset, the RLS rule)
Only create child FRs for the domains the FR actually spans. Each child FR must reference the others in its Dependencies field.

---

### Step 2 — Write the Power Apps-scoped spec

Overwrite `specs/{feature-name}/spec.md` with a Power Apps-scoped version:

- Retain the existing front matter; update `scope: Power Apps` and append a note: `split-from: original mixed spec — integration portion at specs/{feature-name}-integration/spec.md`
- Keep all Power Apps-classified FRs unchanged (original FR numbers preserved)
- For cross-cutting FRs: replace with the `-PA` child FR; note `split from FR-NNN — see integration/DM/reporting spec for other portions`
- Remove all non-Power-Apps-classified FRs entirely
- Re-number the retained FRs sequentially (FR-001, FR-002, …); record the original → PA mapping in the manifest
- Update all cross-references to use new numbers
- Update Section 3 (Scope) to reflect Power Apps-only scope
- Update Section 7 (NFR) to remove non-PA NFRs; retain delegation boundary, flow execution SLA, DLP compliance
- Update Section 9 (Assumptions & Constraints) to retain Power Platform constraints (no-personal-connections, delegation limits, DLP)
- Update Section 10 (Open Questions) to retain only Power Apps-relevant questions
- Update Section 12 (Acceptance Criteria) to keep only Power Apps-relevant ACs
- Update Section 14 (Traceability Matrix) to reflect the new FR numbers and classification

---

### Step 3 — Write the Integration-scoped spec

*Only if one or more FRs were classified as Integration or contain a `-INT` child.*

Create `specs/{feature-name}-integration/spec.md` following the Integration agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {feature-name}-integration
domain: integration
status: DRAFT
split-from: specs/{feature-name}/spec.md
pa-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Integration-classified FRs + `-INT` child FRs, renumbered FR-001, FR-002, …
Note: "Dataverse schema changes required for this integration are handled by the Power Apps agent — see Power Apps spec."

---

### Step 4 — Write the Data Migration-scoped spec

*Only if one or more FRs were classified as Data Migration or contain a `-DM` child.*

Create `specs/{feature-name}-data-migration/spec.md` following the Data Migration agent's spec structure.

**YAML front matter:**
```yaml
---
migration: {feature-name}-data-migration
domain: data-migration
status: DRAFT
split-from: specs/{feature-name}/spec.md
pa-spec-ref: specs/{feature-name}/spec.md
direction: SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Data Migration-classified FRs + `-DM` child FRs, renumbered MR-001, MR-002, …
Note: "Delegation constraints and DLP compliance stay in the Power Apps spec even if the data originates from an ADF pipeline."

---

### Step 5 — Write the Reporting-scoped spec

*Only if one or more FRs were classified as Reporting or contain a `-RPT` child.*

Create `specs/{feature-name}-reporting/spec.md` following the Reporting agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {feature-name}-reporting
domain: reporting
status: DRAFT
split-from: specs/{feature-name}/spec.md
pa-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Reporting-classified FRs + `-RPT` child FRs, renumbered FR-001, FR-002, …
Note: "Dataverse data source configuration and Power BI embedding configuration within Canvas App or MDA are handled by the Power Apps agent — see Power Apps spec."

---

### Step 6 — Write the split manifest

Write `specs/{feature-name}/split-manifest.md`:

```markdown
---
original-spec: specs/{feature-name}/spec.md
pa-spec: specs/{feature-name}/spec.md (updated)
integration-spec: specs/{feature-name}-integration/spec.md   ← omit if no INT FRs
data-migration-spec: specs/{feature-name}-data-migration/spec.md   ← omit if no DM FRs
reporting-spec: specs/{feature-name}-reporting/spec.md   ← omit if no RPT FRs
split-date: {YYYY-MM-DD}
split-by: Claude Code (/split-spec)
---

# Split Manifest — {feature-name}

## Summary

Original spec contained {N} FRs: {N} Power Apps, {N} Integration, {N} Data Migration, {N} Reporting, {N} cross-cutting.
Cross-cutting FRs split into child FRs per domain spanned.

## FR Classification

| Original FR | Title | Classification | Power Apps Spec FR | Integration Spec FR | Data Migration MR | Reporting Spec FR |
|---|---|---|---|---|---|---|

## Cross-Cutting FR Splits

### FR-NNN → FR-NNN-PA + FR-NNN-INT / FR-NNN-DM / FR-NNN-RPT

**Power Apps portion:** {What Power Platform handles}
**Integration portion:** {What the Azure pipeline handles}
**Data Migration portion:** {What the ADF pipeline handles}
**Reporting portion:** {What the report/dataset handles}

## Next Steps

- [ ] Power Apps agent: run `/review {feature-name}` to validate the Power Apps spec
- [ ] Integration agent: copy `specs/{feature-name}-integration/` and run `/review {feature-name}-integration`
- [ ] Data Migration agent: copy `specs/{feature-name}-data-migration/` and run `/review {feature-name}-data-migration`
- [ ] Reporting agent: copy `specs/{feature-name}-reporting/` and run `/review {feature-name}-reporting`
- [ ] Ensure cross-cutting FR dependencies are reflected in all plans when `/plan` is run
```

---

### Step 7 — Print summary

```
SPEC SPLIT COMPLETE — {feature-name}
══════════════════════════════════════════════
Original FRs        : {N}
Power Apps spec     : {N} FRs  → specs/{feature-name}/spec.md
Integration spec    : {N} FRs  → specs/{feature-name}-integration/spec.md  ← omitted if 0
Data Migration spec : {N} MRs  → specs/{feature-name}-data-migration/spec.md  ← omitted if 0
Reporting spec      : {N} FRs  → specs/{feature-name}-reporting/spec.md  ← omitted if 0
Cross-cutting       : {N} FRs split across domains
Manifest            : specs/{feature-name}/split-manifest.md

Power Apps Next Step     : /review {feature-name}
Integration Next Step    : /review {feature-name}-integration      ← run in the Integration agent
Data Migration Next Step : /review {feature-name}-data-migration   ← run in the Data Migration agent
Reporting Next Step      : /review {feature-name}-reporting        ← run in the Reporting agent
```

---

## Classification Reference

**Power Apps signals:** "Canvas App", "screen", "gallery", "form", "MDA", "model-driven", "Power Automate flow", "cloud flow", "Copilot Studio", "topic", "Dataverse table", "column", "business rule", "connection reference", "delegation", "Power Fx", "app access", "user sees in app", "lookup", "PCF", "environment variable"

**Integration signals:** "sync from external", "receive from external", "publish to external", "Azure Function", "Service Bus", "APIM", "event-driven", "payload", "retry", "dead-letter", "idempotent", "Logic App", "Bicep", "infrastructure", "latency SLA", "throughput", "external system", "inbound webhook", "outbound call"

**Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "raw table", "ingest pipeline", "data flow", "bulk upsert via ADF", "file-based", "CSV file", "migration schedule", "Dataverse via ADF", "nightly load", "error table", "stage promotion"

**Reporting signals:** "Power BI", "PBIX", "SSRS", "RDL", "Power BI report", "dashboard", "dataset", "dataflow", "DAX", "measure", "KPI", "visual", "paginated report", "RLS", "row-level security", "workspace", "refresh schedule", "subscription", "embedded report", "Power BI tile", "Power BI Embedded"

**Cross-cutting signals:** FR contains signals from more than one domain.

## Rules

- Never drop requirements — every FR must appear in exactly one output spec (or split across multiple).
- Preserve original FR numbers in the Traceability section of all output specs.
- Power Apps spec retains the original file path — downstream commands do not need to change paths.
- Delegation constraints and DLP compliance stay in the Power Apps spec even if data originates from an ADF pipeline.
- Reporting spec only written when at least one FR is classified as Reporting.
- Cross-cutting FRs must have explicit dependency references in all child FRs.
- Do not invent new requirements during the split.
