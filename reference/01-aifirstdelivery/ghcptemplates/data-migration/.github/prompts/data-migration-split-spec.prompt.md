---
mode: agent
description: "Split a mixed-domain migration spec into domain-scoped specs. Triggers on: 'split-spec', 'split spec', 'mixed domain'."
---

Split a mixed functional specification into domain-scoped specs: one for the Data Migration agent, one for the D365 CE / Power Apps agent (when CE/PA requirements are present), one for the Azure Integration agent (when event-driven pipeline requirements are present), and one for the Reporting agent (when Power BI or SSRS requirements are present).

## Usage

```
/data-migration-split-spec {migration-id}
```

## When to Use

Use this command when a migration specification contains requirements from more than one of:
- **Data Migration requirements** — ADF pipelines, SQL staging, SFTP file handling, Dataverse bulk upsert via pipeline, data transformation, field mapping, ARM template, SQL DDL
- **D365 CE requirements** — forms, views, plugins, business rules enforced within D365 UI, PCF controls, security roles, D365-native process flows, post-load validation logic within CE
- **Integration requirements** — event-driven pipelines, data sync via Azure Functions / Service Bus / APIM, infrastructure provisioning, DLQ/retry/monitoring
- **Reporting requirements** — Power BI reports, SSRS reports, Paginated reports, datasets showing migrated data, RLS, workspace configuration

Do not use this command if the spec is already scoped to a single domain.

---

## Pre-condition Check

1. Read `specs/{migration-id}/spec.md`. If the file does not exist, stop: "No spec found. Run /data-migration-spec first."
2. Read all files in `constitution/` — classification rules must respect constitution boundaries.

---

## Steps

### Step 1 — Classify every MR

Read the full spec. For each MR-NNN, assign one of four classifications:

| Classification | Criteria |
|---|---|
| **Migration** | Entirely outside D365 UI — ADF pipeline logic, SFTP file ingest/export, SQL staging (raw/stage/error/audit tables), stored procedures, data transformation, field mapping, ARM template, Key Vault secrets, ADF triggers, Dataverse bulk upsert via ADF Data Flow |
| **CE** | Entirely within D365 CE — form/view design, plugin behaviour, business rules on D365 entities enforced in the UI, security role access, PCF controls, D365-native flows, dashboard/reporting within D365 |
| **Integration** | Entirely outside both D365 UI and ADF — event-driven pipelines, external system sync via Azure Functions / Service Bus / APIM, infrastructure provisioning |
| **Reporting** | Power BI report design, SSRS reports, Paginated reports, datasets that consume migrated data, DAX measures, RLS roles, workspace configuration, subscription delivery |
| **Cross-cutting** | Spans more than one domain — e.g., "when records are loaded into Dataverse by ADF, a plugin fires to validate them"; "after bulk load, a Power BI report shows migration summary"; "ADF pipeline publishes event to Service Bus on completion" |

**Cross-cutting MR splitting rule:**
For every cross-cutting MR, produce linked child requirements for each domain it spans:
- `MR-NNN-MIG`: the migration portion only (what ADF loads, transforms, or delivers)
- `MR-NNN-CE`: the CE portion only (what D365 shows, enforces, or triggers after load)
- `MR-NNN-INT`: the integration portion only (what the event-driven pipeline receives or sends)
- `MR-NNN-RPT`: the Reporting portion only (what the report shows, the dataset, the RLS rule)
Each child must reference the others in its Dependencies field.

---

### Step 2 — Write the Migration-scoped spec

Overwrite `specs/{migration-id}/spec.md` with a Migration-scoped version:

- Retain the existing front matter; update `scope: DataMigration` and append: `split-from: original mixed spec — CE portion at specs/{migration-id}-ce/spec.md`
- Keep all Migration-classified MRs unchanged (original MR numbers preserved)
- For cross-cutting MRs: replace with the `-MIG` child MR; note `split from MR-NNN — see CE/integration/reporting spec for other portions`
- Remove all non-Migration-classified MRs entirely
- Re-number the retained MRs sequentially (MR-001, MR-002, …); record the original → MIG mapping in the manifest
- Update Section 3 (Scope) to reflect Migration-only scope
- Update NFR, Assumptions, Open Questions to remove non-migration content
- Add note: "CE, Integration, and Reporting portions of this migration are handled by their respective agents."

---

### Step 3 — Write the CE-scoped spec

*Only if one or more MRs were classified as CE or contain a `-CE` child.*

Create `specs/{migration-id}-ce/spec.md` following the D365 CE agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {migration-id}-ce
domain: d365-ce
status: DRAFT
split-from: specs/{migration-id}/spec.md
migration-spec-ref: specs/{migration-id}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/data-migration-split-spec)
---
```

Include: all CE-classified MRs + `-CE` child MRs (renumbered FR-001, FR-002, … using FR prefix in CE spec).
Note: "ADF pipeline changes required for this CE feature are handled by the Data Migration agent — see migration spec."

---

### Step 4 — Write the Integration-scoped spec

*Only if one or more MRs were classified as Integration or contain a `-INT` child.*

Create `specs/{migration-id}-integration/spec.md` following the Integration agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {migration-id}-integration
domain: integration
status: DRAFT
split-from: specs/{migration-id}/spec.md
migration-spec-ref: specs/{migration-id}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/data-migration-split-spec)
---
```

Include: all Integration-classified MRs + `-INT` child MRs, renumbered FR-001, FR-002, …
Note: "ADF pipeline logic is handled by the Data Migration agent; this spec covers only the event-driven integration layer."

---

### Step 5 — Write the Reporting-scoped spec

*Only if one or more MRs were classified as Reporting or contain a `-RPT` child.*

Create `specs/{migration-id}-reporting/spec.md` following the Reporting agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {migration-id}-reporting
domain: reporting
status: DRAFT
split-from: specs/{migration-id}/spec.md
migration-spec-ref: specs/{migration-id}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/data-migration-split-spec)
---
```

Include: all Reporting-classified MRs + `-RPT` child MRs, renumbered FR-001, FR-002, …
Note: "Migrated data staged in SQL by ADF is the data source for these reports — the Data Migration agent owns the staging schema."

---

### Step 6 — Write the split manifest

Write `specs/{migration-id}/split-manifest.md`:

```markdown
---
original-spec: specs/{migration-id}/spec.md
migration-spec: specs/{migration-id}/spec.md (updated)
ce-spec: specs/{migration-id}-ce/spec.md   ← omit if no CE MRs
integration-spec: specs/{migration-id}-integration/spec.md   ← omit if no INT MRs
reporting-spec: specs/{migration-id}-reporting/spec.md   ← omit if no RPT MRs
split-date: {YYYY-MM-DD}
split-by: Claude Code (/data-migration-split-spec)
---

# Split Manifest — {migration-id}

## Summary

Original spec contained {N} MRs: {N} Migration, {N} CE, {N} Integration, {N} Reporting, {N} cross-cutting.
Cross-cutting MRs split into child requirements per domain spanned.

## MR Classification

| Original MR | Title | Classification | Migration Spec MR | CE Spec FR | Integration Spec FR | Reporting Spec FR |
|---|---|---|---|---|---|---|

## Cross-Cutting MR Splits

### MR-NNN → MR-NNN-MIG + MR-NNN-CE / MR-NNN-INT / MR-NNN-RPT

**Migration portion:** {What ADF loads, transforms, or delivers}
**CE portion:** {What D365 CE shows, enforces, or triggers after load}
**Integration portion:** {What the event-driven pipeline handles}
**Reporting portion:** {What the report/dataset handles}

## Next Steps

- [ ] Data Migration agent: run `/data-migration-review {migration-id}` to validate the migration spec
- [ ] CE agent: copy `specs/{migration-id}-ce/` and run `/data-migration-review {migration-id}-ce`
- [ ] Integration agent: copy `specs/{migration-id}-integration/` and run `/data-migration-review {migration-id}-integration`
- [ ] Reporting agent: copy `specs/{migration-id}-reporting/` and run `/data-migration-review {migration-id}-reporting`
- [ ] Ensure cross-cutting MR dependencies are reflected in all plans when `/data-migration-plan` is run
```

---

### Step 7 — Print summary

```
SPEC SPLIT COMPLETE — {migration-id}
══════════════════════════════════════════════
Original MRs        : {N}
Migration spec      : {N} MRs  → specs/{migration-id}/spec.md
CE spec             : {N} FRs  → specs/{migration-id}-ce/spec.md  ← omitted if 0
Integration spec    : {N} FRs  → specs/{migration-id}-integration/spec.md  ← omitted if 0
Reporting spec      : {N} FRs  → specs/{migration-id}-reporting/spec.md  ← omitted if 0
Cross-cutting       : {N} MRs split across domains
Manifest            : specs/{migration-id}/split-manifest.md

Migration Next Step      : /data-migration-review {migration-id}
CE Next Step             : /data-migration-review {migration-id}-ce            ← run in the D365 CE agent
Integration Next Step    : /data-migration-review {migration-id}-integration   ← run in the Integration agent
Reporting Next Step      : /data-migration-review {migration-id}-reporting     ← run in the Reporting agent
```

---

## Classification Reference

**Migration signals:** "ADF pipeline", "staging table", "stg_", "SFTP", "file ingest", "file export", "data load", "bulk upsert via ADF", "data flow", "linked service", "dataset", "SQL DDL", "stored procedure", "ARM template", "Key Vault secret", "schedule trigger", "event trigger", "retry policy", "dead-letter", "data transformation", "field mapping"

**CE signals:** "D365 form", "view", "user sees", "plugin", "business rule on {entity}", "security role", "D365 UI", "PCF", "dashboard", "chart", "lookup", "field on Account/Contact/Case", "real-time workflow", "Power Automate from D365"

**Integration signals:** "Azure Function", "Service Bus", "APIM", "Logic App", "event-driven", "inbound webhook", "outbound notification", "external system", "payload", "infrastructure"

**Reporting signals:** "Power BI", "PBIX", "SSRS", "RDL", "report", "dashboard", "dataset", "DAX", "measure", "KPI", "visual", "paginated", "RLS", "row-level security", "workspace", "refresh schedule", "migration summary report", "Power BI Embedded"

**Cross-cutting signals:** MR contains signals from more than one domain.

## Rules

- Never drop requirements — every MR must appear in exactly one output spec (or split across multiple).
- Preserve original MR numbers in the Traceability section of all output specs.
- Migration spec retains the original file path — downstream commands (`/data-migration-review`, `/data-migration-mapping`, `/data-migration-pipeline`, `/data-migration-plan`) do not need to change paths.
- CE spec uses `{migration-id}-ce` as the feature slug and uses FR- prefix (not MR-).
- Reporting spec uses `{migration-id}-reporting` as the feature slug and uses FR- prefix.
- Cross-cutting MRs must have explicit dependency references in all child requirements.
- Do not invent new requirements during the split.
