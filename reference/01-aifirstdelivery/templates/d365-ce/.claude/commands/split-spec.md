Split a mixed functional specification into domain-scoped specs: one for the D365 CE agent, one for the Azure Integration agent (when event-driven pipeline requirements are present), one for the Data Migration agent (when ADF/SFTP requirements are present), and one for the Reporting agent (when Power BI or SSRS requirements are present).

## Usage

```
/split-spec {feature-name}
```

## When to Use

Use this command when a functional specification contains requirements from more than one of:
- **D365 CE requirements** — forms, views, plugins, business rules, security roles, PCF controls, user interactions within D365
- **Integration requirements** — event-driven pipelines, data sync via Azure Functions / Logic Apps / Service Bus / APIM, infrastructure provisioning
- **Data Migration requirements** — ADF pipelines, SFTP file transfer, staging SQL tables, bulk Dataverse upsert via ADF, data flows, file-based batch loads
- **Reporting requirements** — Power BI reports, SSRS reports, Paginated reports, datasets, DAX measures, RLS, Power BI Embedded, workspace configuration

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
| **CE** | Entirely within D365 CE — form/view design, plugin behaviour, business rules on D365 entities, security role access, PCF controls, D365-native process flows, dashboard/chart within D365 |
| **Integration** | Entirely outside D365 UI — event-driven data pipelines, external system sync (inbound or outbound) via Azure Functions / Logic Apps / Service Bus / APIM, infrastructure provisioning, DLQ/retry/monitoring |
| **Data Migration** | ADF-based movement of data — SFTP file ingestion, staging SQL tables, bulk Dataverse upsert via ADF data flows, ingest/export/transform pipelines, file-based batch loads, migration schedules |
| **Reporting** | Power BI report design, SSRS reports, Paginated reports, DAX measures, RLS roles, workspace configuration, Power BI Embedded, subscription delivery, report embedding in D365 CE or Canvas App |
| **Cross-cutting** | Spans more than one domain — e.g., "system receives payload from SFTP via ADF and displays it on the Account form"; "when user closes SR in D365, an event is published via Service Bus"; "ADF loads data which a Power BI report displays"; "SSRS report embedded in D365 CE form" |

**Cross-cutting FR splitting rule:**
For every cross-cutting FR, produce linked child FRs for each domain it spans:
- `FR-NNN-CE`: the CE portion only (what D365 shows, enforces, or triggers)
- `FR-NNN-INT`: the Azure integration portion only (what the event-driven pipeline receives, transforms, or delivers)
- `FR-NNN-DM`: the data migration portion only (what the ADF pipeline ingests, stages, or upserts)
- `FR-NNN-RPT`: the Reporting portion only (what the report shows, the dataset, the RLS rule)
Only create child FRs for the domains the FR actually spans. Each child FR must reference the others in its Dependencies field.

---

### Step 2 — Write the CE-scoped spec

Overwrite `specs/{feature-name}/spec.md` with a CE-scoped version:

- Retain the existing front matter; update `scope: CE` and append a note: `split-from: original mixed spec — integration portion at specs/{feature-name}-integration/spec.md`
- Keep all CE-classified FRs unchanged (original FR numbers preserved)
- For cross-cutting FRs: replace with the `-CE` child FR; note `split from FR-NNN — see integration/data-migration/reporting spec for other portions`
- Remove all non-CE-classified FRs entirely
- Re-number the retained FRs sequentially (FR-001, FR-002, …); record the original → CE number mapping in the split manifest
- Update all cross-references to use new numbers
- Update Section 3 (Scope) to reflect CE-only scope
- Update Section 7 (NFR), Section 9 (Assumptions & Constraints), Section 10 (Open Questions) to remove non-CE content
- Update Section 12 (Acceptance Criteria) to keep only CE-relevant ACs
- Update Section 14 (Traceability Matrix) to reflect new FR numbers and classification

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
ce-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Integration-classified FRs + `-INT` child FRs, renumbered FR-001, FR-002, …
Add note: "D365 CE schema changes required for this integration are handled by the CE agent — see CE spec."

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
ce-spec-ref: specs/{feature-name}/spec.md
direction: SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Data Migration-classified FRs + `-DM` child FRs, renumbered MR-001, MR-002, …
Add note: "D365 CE schema changes required for this migration are handled by the CE agent — see CE spec."

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
ce-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Reporting-classified FRs + `-RPT` child FRs, renumbered FR-001, FR-002, …
Add note: "D365 CE data source configuration and any report embedding in D365 CE forms are handled by the CE agent — see CE spec."

---

### Step 6 — Write the split manifest

Write `specs/{feature-name}/split-manifest.md`:

```markdown
---
original-spec: specs/{feature-name}/spec.md
ce-spec: specs/{feature-name}/spec.md (updated)
integration-spec: specs/{feature-name}-integration/spec.md   ← omit if no INT FRs
data-migration-spec: specs/{feature-name}-data-migration/spec.md   ← omit if no DM FRs
reporting-spec: specs/{feature-name}-reporting/spec.md   ← omit if no RPT FRs
split-date: {YYYY-MM-DD}
split-by: Claude Code (/split-spec)
---

# Split Manifest — {feature-name}

## Summary

Original spec contained {N} FRs: {N} CE, {N} Integration, {N} Data Migration, {N} Reporting, {N} cross-cutting.
Cross-cutting FRs split into child FRs per domain spanned.

## FR Classification

| Original FR | Title | Classification | CE Spec FR | Integration Spec FR | Data Migration MR | Reporting Spec FR |
|---|---|---|---|---|---|---|

## Cross-Cutting FR Splits

### FR-NNN → FR-NNN-CE + FR-NNN-INT / FR-NNN-DM / FR-NNN-RPT

**CE portion:** {What D365 CE handles — display, enforcement, trigger}
**Integration portion:** {What the Azure pipeline handles — receipt, transform, delivery}
**Data Migration portion:** {What the ADF pipeline handles — ingest, stage, upsert}
**Reporting portion:** {What the report/dataset handles — display, measure, RLS}

## Next Steps

- [ ] CE agent: run `/review {feature-name}` to validate the CE spec
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
CE spec             : {N} FRs  → specs/{feature-name}/spec.md
Integration spec    : {N} FRs  → specs/{feature-name}-integration/spec.md  ← omitted if 0
Data Migration spec : {N} MRs  → specs/{feature-name}-data-migration/spec.md  ← omitted if 0
Reporting spec      : {N} FRs  → specs/{feature-name}-reporting/spec.md  ← omitted if 0
Cross-cutting       : {N} FRs split across domains
Manifest            : specs/{feature-name}/split-manifest.md

CE Next Step             : /review {feature-name}
Integration Next Step    : /review {feature-name}-integration      ← run in the Integration agent
Data Migration Next Step : /review {feature-name}-data-migration   ← run in the Data Migration agent
Reporting Next Step      : /review {feature-name}-reporting        ← run in the Reporting agent
```

---

## Classification Reference

**CE signals:** "display", "form", "view", "user sees", "plugin", "business rule on {entity}", "security role", "D365 UI", "PCF", "dashboard", "chart", "lookup", "field on Account/Contact/Case"

**Integration signals:** "sync from external", "receive from external", "publish to external", "event-driven", "payload", "retry", "dead-letter", "idempotent", "Azure Function", "Service Bus", "APIM", "Logic App", "Bicep", "infrastructure", "latency SLA", "throughput", "inbound webhook", "outbound notification"

**Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "raw table", "ingest pipeline", "data flow", "bulk upsert via ADF", "file-based", "CSV file", "migration schedule", "Dataverse via ADF", "nightly load", "error table", "stage promotion"

**Reporting signals:** "Power BI", "PBIX", "SSRS", "RDL", "report", "dashboard", "dataset", "dataflow", "DAX", "measure", "KPI", "visual", "chart in Power BI", "paginated", "RLS", "row-level security", "workspace", "deployment pipeline", "refresh schedule", "subscription", "embedded report", "Power BI Embedded"

**Cross-cutting signals:** FR contains signals from more than one domain — e.g., "SFTP file is ingested via ADF and displayed on the Account form" (CE+DM); "when user closes SR in D365 an event is published to Service Bus" (CE+INT); "ADF loads records that trigger a plugin" (CE+DM); "Power BI report embedded in D365 CE form showing case history" (CE+RPT)

## Rules

- Never drop requirements — every FR must appear in exactly one output spec (or split across multiple for cross-cutting FRs).
- Preserve original FR numbers in the Traceability section of all output specs.
- CE spec retains the original file path — downstream commands (`/review`, `/plan`) do not need to change paths.
- Integration spec uses `{feature-name}-integration` as the feature slug.
- Data Migration spec uses `{feature-name}-data-migration`; requirements are renumbered MR-001, MR-002, …
- Reporting spec uses `{feature-name}-reporting` as the feature slug.
- Data Migration spec is only written when at least one FR is classified as Data Migration.
- Reporting spec is only written when at least one FR is classified as Reporting.
- Cross-cutting FRs must have explicit dependency references in all child FRs.
- Do not invent new requirements during the split.
