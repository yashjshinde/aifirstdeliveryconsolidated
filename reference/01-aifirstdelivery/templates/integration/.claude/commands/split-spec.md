Split a mixed functional specification into domain-scoped specs: one for the Azure Integration agent, one for the D365 CE / Power Apps / F&O agent (when platform requirements are present), one for the Data Migration agent (when ADF/SFTP requirements are present), and one for the Reporting agent (when Power BI or SSRS requirements are present).

## Usage

```
/split-spec {feature-name}
```

## When to Use

Use this command when a functional specification contains requirements from more than one of:
- **Integration requirements** — event-driven pipelines, data sync from/to external systems, Azure Function logic, Service Bus flows, APIM governance, Bicep IaC, infrastructure
- **CE / PA / F&O requirements** — forms, views, plugins, business rules, security roles, PCF controls, user interactions within D365 CE / Power Apps / D365 F&O
- **Data Migration requirements** — ADF pipelines, SFTP file transfer, staging SQL tables, bulk Dataverse / F&O upsert via ADF, data flows, file-based batch loads
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
| **Integration** | Entirely outside platform UI — event-driven data pipelines, external system sync (inbound or outbound), Azure Function / Logic App logic, Service Bus message processing, APIM governance, infrastructure provisioning, DLQ/retry/monitoring |
| **CE / PA / F&O** | Entirely within D365 CE / Power Apps / D365 F&O — form/view design, plugin behaviour, business rules on entities, security role access, PCF controls, D365-native process flows, Canvas App screens, MDA forms, X++ extensions |
| **Data Migration** | ADF-based movement of data — SFTP file ingestion, staging SQL tables, bulk Dataverse / F&O upsert via ADF data flows, ingest/export/transform pipelines, file-based batch loads, migration schedules |
| **Reporting** | Power BI report design, SSRS reports, Paginated reports, DAX measures, RLS roles, workspace configuration, Power BI Embedded, subscription delivery |
| **Cross-cutting** | Spans more than one domain — e.g., "when payload arrives from external system, display it on the Account form"; "when user closes SR in D365, publish event to external system"; "ADF loads data which a Power BI report displays" |

**Cross-cutting FR splitting rule:**
For every cross-cutting FR, produce linked child FRs for each domain it spans:
- `FR-NNN-INT`: the integration portion only (what the pipeline receives, transforms, or sends)
- `FR-NNN-CE`: the CE/PA/F&O portion only (what the platform shows, enforces, or triggers)
- `FR-NNN-DM`: the data migration portion only (what the ADF pipeline ingests, stages, or upserts)
- `FR-NNN-RPT`: the Reporting portion only (what the report shows, the dataset, the RLS rule)
Only create child FRs for the domains the FR actually spans. Each child FR must reference the others in its Dependencies field.

---

### Step 2 — Write the Integration-scoped spec

Overwrite `specs/{feature-name}/spec.md` with an Integration-scoped version:

- Retain the existing front matter; update `scope: Integration` and append: `split-from: original mixed spec — CE/PA/F&O portion at specs/{feature-name}-ce/spec.md`
- Keep all Integration-classified FRs unchanged (original FR numbers preserved)
- For cross-cutting FRs: replace with the `-INT` child FR; note `split from FR-NNN — see CE/DM/RPT spec for other portions`
- Remove all non-Integration-classified FRs entirely
- Re-number the retained FRs sequentially (FR-001, FR-002, …); record the original → INT mapping in the manifest
- Update Section 3 (Scope) to reflect Integration-only scope
- Update NFR, Assumptions, Open Questions to remove non-integration content
- Add note: "CE/PA/F&O configuration, Data Migration, and Reporting required for this integration are handled by their respective agents."

---

### Step 3 — Write the CE/PA/F&O-scoped spec

*Only if one or more FRs were classified as CE/PA/F&O or contain a `-CE` child.*

Create `specs/{feature-name}-ce/spec.md` following the relevant platform agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {feature-name}-ce
domain: d365-ce   # or power-apps or d365-fo as appropriate
status: DRAFT
split-from: specs/{feature-name}/spec.md
integration-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all CE-classified FRs + `-CE` child FRs, renumbered FR-001, FR-002, …
Note: "Integration pipeline changes required for this CE feature are handled by the Integration agent — see integration spec."

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
integration-spec-ref: specs/{feature-name}/spec.md
direction: SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Data Migration-classified FRs + `-DM` child FRs, renumbered MR-001, MR-002, …
Note: "Integration pipeline events that trigger or consume this migration are handled by the Integration agent."

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
integration-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Reporting-classified FRs + `-RPT` child FRs, renumbered FR-001, FR-002, …
Note: "Integration data feeds required for this reporting feature are handled by the Integration agent — see integration spec."

---

### Step 6 — Write the split manifest

Write `specs/{feature-name}/split-manifest.md`:

```markdown
---
original-spec: specs/{feature-name}/spec.md
integration-spec: specs/{feature-name}/spec.md (updated)
ce-spec: specs/{feature-name}-ce/spec.md   ← omit if no CE FRs
data-migration-spec: specs/{feature-name}-data-migration/spec.md   ← omit if no DM FRs
reporting-spec: specs/{feature-name}-reporting/spec.md   ← omit if no RPT FRs
split-date: {YYYY-MM-DD}
split-by: Claude Code (/split-spec)
---

# Split Manifest — {feature-name}

## Summary

Original spec contained {N} FRs: {N} Integration, {N} CE/PA/F&O, {N} Data Migration, {N} Reporting, {N} cross-cutting.
Cross-cutting FRs split into child FRs per domain spanned.

## FR Classification

| Original FR | Title | Classification | Integration Spec FR | CE Spec FR | Data Migration MR | Reporting Spec FR |
|---|---|---|---|---|---|---|

## Cross-Cutting FR Splits

### FR-NNN → FR-NNN-INT + FR-NNN-CE / FR-NNN-DM / FR-NNN-RPT

**Integration portion:** {What the pipeline handles}
**CE/PA/F&O portion:** {What the platform handles}
**Data Migration portion:** {What the ADF pipeline handles}
**Reporting portion:** {What the report/dataset handles}

## Next Steps

- [ ] Integration agent: run `/review {feature-name}` to validate the integration spec
- [ ] CE/PA/F&O agent: copy `specs/{feature-name}-ce/` and run `/review {feature-name}-ce`
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
Integration spec    : {N} FRs  → specs/{feature-name}/spec.md
CE/PA/F&O spec      : {N} FRs  → specs/{feature-name}-ce/spec.md  ← omitted if 0
Data Migration spec : {N} MRs  → specs/{feature-name}-data-migration/spec.md  ← omitted if 0
Reporting spec      : {N} FRs  → specs/{feature-name}-reporting/spec.md  ← omitted if 0
Cross-cutting       : {N} FRs split across domains
Manifest            : specs/{feature-name}/split-manifest.md

Integration Next Step    : /review {feature-name}
CE/PA/F&O Next Step      : /review {feature-name}-ce           ← run in the CE/PA/F&O agent
Data Migration Next Step : /review {feature-name}-data-migration  ← run in the Data Migration agent
Reporting Next Step      : /review {feature-name}-reporting    ← run in the Reporting agent
```

---

## Classification Reference

**Integration signals:** "sync from", "receive from", "publish to", "pipeline", "event-driven", "payload", "retry", "dead-letter", "idempotent", "upsert via API", "Azure Function", "Service Bus", "APIM", "Bicep", "infrastructure", "latency SLA", "throughput"

**CE / PA / F&O signals:** "display", "form", "view", "user sees", "plugin", "business rule on {entity}", "security role", "D365 UI", "PCF", "lookup", "field on Account/Contact/Case", "Canvas App screen", "MDA form", "X++ class", "F&O table", "Dataverse table"

**Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "raw table", "ingest pipeline", "data flow", "bulk upsert via ADF", "file-based", "CSV file", "migration schedule", "nightly load", "error table"

**Reporting signals:** "Power BI", "PBIX", "SSRS", "RDL", "report", "dashboard", "dataset", "dataflow", "DAX", "measure", "KPI", "visual", "paginated", "RLS", "row-level security", "workspace", "refresh schedule", "subscription", "embedded report", "Power BI Embedded"

**Cross-cutting signals:** FR contains signals from more than one domain.

## Rules

- Never drop requirements — every FR must appear in exactly one output spec (or split across multiple).
- Preserve original FR numbers in the Traceability section of all output specs.
- Integration spec retains the original file path — downstream commands do not need to change paths.
- CE spec uses `{feature-name}-ce`, Data Migration uses `{feature-name}-data-migration`, Reporting uses `{feature-name}-reporting`.
- Data Migration spec only written when at least one FR is classified as Data Migration.
- Reporting spec only written when at least one FR is classified as Reporting.
- Cross-cutting FRs must have explicit dependency references in all child FRs.
- Do not invent new requirements during the split.
