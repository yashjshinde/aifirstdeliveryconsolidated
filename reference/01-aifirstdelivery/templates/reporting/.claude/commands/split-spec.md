Split a mixed reporting specification into domain-scoped specs: one for the Reporting agent, one for the Azure Integration agent (when event-driven pipeline requirements are present), one for the D365 CE agent (when CE embedding/plugin requirements are present), and one for the Data Migration agent (when ADF/SFTP requirements are present).

## Usage

```
/split-spec {feature-name}
```

## When to Use

Use this command when a reporting specification contains requirements from more than one of:
- **Reporting requirements** — Power BI reports, SSRS reports, Paginated reports, datasets, dataflows, RLS, workspace configuration, DAX measures
- **Integration requirements** — event-driven pipelines, data feeds from external systems via Azure Functions / Service Bus / APIM, infrastructure provisioning
- **CE requirements** — D365 CE embedding, plugin-triggered report refresh, D365 CE security role mapping to RLS, Canvas App / MDA embedding
- **Data Migration requirements** — ADF pipelines staging data for reports, SFTP file ingestion, SQL staging tables feeding Power BI datasets

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
| **Reporting** | Entirely within the reporting layer — Power BI report design, dataset/dataflow, DAX measures, RLS, workspace config, SSRS report, Paginated report, report embedding config, subscription delivery |
| **Integration** | Entirely outside the reporting layer — event-driven data pipelines, external system sync via Azure Functions / Service Bus / APIM, infrastructure provisioning, DLQ/retry |
| **CE** | Entirely within D365 CE — embedding report in D365 CE form/dashboard, security role to RLS role mapping enforced in D365, plugin triggering report refresh, D365-native process flows |
| **Data Migration** | ADF-based movement of data — SFTP file ingestion, staging SQL tables, bulk upsert via ADF data flows feeding the reporting dataset, nightly loads |
| **Cross-cutting** | Spans more than one domain — e.g., "ADF loads data into SQL staging and Power BI dataset refreshes from it"; "D365 CE plugin publishes an event which triggers dataset refresh via Azure Function"; "SSRS report embedded in D365 CE with CE security role controlling access" |

**Cross-cutting FR splitting rule:**
For every cross-cutting FR, produce linked child FRs for each domain it spans:
- `FR-NNN-RPT`: the Reporting portion only (what the report shows, the dataset, the RLS rule)
- `FR-NNN-INT`: the Integration portion only (what the event-driven pipeline does)
- `FR-NNN-CE`: the CE portion only (what D365 CE enforces, embeds, or triggers)
- `FR-NNN-DM`: the Data Migration portion only (what the ADF pipeline ingests or stages)
Only create child FRs for the domains the FR actually spans. Each child FR must reference the others in its Dependencies field.

---

### Step 2 — Write the Reporting-scoped spec

Overwrite `specs/{feature-name}/spec.md` with a Reporting-scoped version:

- Retain the existing front matter; update `scope: Reporting` and append a note: `split-from: original mixed spec`
- Keep all Reporting-classified FRs unchanged (original FR numbers preserved)
- For cross-cutting FRs: replace with the `-RPT` child FR; note `split from FR-NNN — see integration/CE/data-migration spec for other portions`
- Remove all non-Reporting-classified FRs entirely
- Re-number the retained FRs sequentially (FR-001, FR-002, …); record the original → RPT number mapping in the split manifest
- Update all cross-references to use new numbers
- Update Section 3 (Report Catalogue), Section 8 (Data Model Requirements), and Section 11 (Constitution Risks) to reflect Reporting-only scope
- Add note: "Integration, CE, and Data Migration portions of this feature are handled by their respective agents — see split manifest."

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
rpt-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Integration-classified FRs + `-INT` child FRs, renumbered FR-001, FR-002, …
Add note: "Reporting layer configuration required for this integration is handled by the Reporting agent — see Reporting spec."

---

### Step 4 — Write the CE-scoped spec

*Only if one or more FRs were classified as CE or contain a `-CE` child.*

Create `specs/{feature-name}-ce/spec.md` following the D365 CE agent's spec structure.

**YAML front matter:**
```yaml
---
feature: {feature-name}-ce
domain: d365-ce
status: DRAFT
split-from: specs/{feature-name}/spec.md
rpt-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all CE-classified FRs + `-CE` child FRs, renumbered FR-001, FR-002, …
Add note: "Reporting layer changes required for this CE feature are handled by the Reporting agent — see Reporting spec."

---

### Step 5 — Write the Data Migration-scoped spec

*Only if one or more FRs were classified as Data Migration or contain a `-DM` child.*

Create `specs/{feature-name}-data-migration/spec.md` following the Data Migration agent's spec structure.

**YAML front matter:**
```yaml
---
migration: {feature-name}-data-migration
domain: data-migration
status: DRAFT
split-from: specs/{feature-name}/spec.md
rpt-spec-ref: specs/{feature-name}/spec.md
version: 1.0
date: {YYYY-MM-DD}
author: Claude Code (/split-spec)
---
```

Include: all Data Migration-classified FRs + `-DM` child FRs, renumbered MR-001, MR-002, …
Add note: "Power BI dataset configuration required for this migration is handled by the Reporting agent — see Reporting spec."

---

### Step 6 — Write the split manifest

Write `specs/{feature-name}/split-manifest.md`:

```markdown
---
original-spec: specs/{feature-name}/spec.md
rpt-spec: specs/{feature-name}/spec.md (updated)
integration-spec: specs/{feature-name}-integration/spec.md   ← omit if no INT FRs
ce-spec: specs/{feature-name}-ce/spec.md                     ← omit if no CE FRs
data-migration-spec: specs/{feature-name}-data-migration/spec.md  ← omit if no DM FRs
split-date: {YYYY-MM-DD}
split-by: Claude Code (/split-spec)
---

# Split Manifest — {feature-name}

## Summary

Original spec contained {N} FRs: {N} Reporting, {N} Integration, {N} CE, {N} Data Migration, {N} cross-cutting.
Cross-cutting FRs split into child FRs per domain spanned.

## FR Classification

| Original FR | Title | Classification | Reporting Spec FR | Integration Spec FR | CE Spec FR | Data Migration MR |
|---|---|---|---|---|---|---|

## Cross-Cutting FR Splits

### FR-NNN → FR-NNN-RPT + FR-NNN-INT / FR-NNN-CE / FR-NNN-DM

**Reporting portion (FR-NNN in Reporting spec):** {What the report/dataset handles}
**Integration portion (FR-NNN in Integration spec):** {What the Azure pipeline handles}
**CE portion (FR-NNN in CE spec):** {What D365 CE handles}
**Data Migration portion (MR-NNN in Data Migration spec):** {What the ADF pipeline handles}

## Next Steps

- [ ] Reporting agent: run `/review {feature-name}` to validate the Reporting spec
- [ ] Integration agent: copy `specs/{feature-name}-integration/` and run `/review {feature-name}-integration`
- [ ] CE agent: copy `specs/{feature-name}-ce/` and run `/review {feature-name}-ce`
- [ ] Data Migration agent: copy `specs/{feature-name}-data-migration/` and run `/review {feature-name}-data-migration`
- [ ] Ensure cross-cutting FR dependencies are reflected in all plans when `/plan` is run
```

---

### Step 7 — Print summary

```
SPEC SPLIT COMPLETE — {feature-name}
══════════════════════════════════════════════
Original FRs        : {N}
Reporting spec      : {N} FRs  → specs/{feature-name}/spec.md
Integration spec    : {N} FRs  → specs/{feature-name}-integration/spec.md  ← omitted if 0
CE spec             : {N} FRs  → specs/{feature-name}-ce/spec.md           ← omitted if 0
Data Migration spec : {N} MRs  → specs/{feature-name}-data-migration/spec.md  ← omitted if 0
Cross-cutting       : {N} FRs split across domains
Manifest            : specs/{feature-name}/split-manifest.md

Reporting Next Step      : /review {feature-name}
Integration Next Step    : /review {feature-name}-integration   ← run in the Integration agent
CE Next Step             : /review {feature-name}-ce            ← run in the D365 CE agent
Data Migration Next Step : /review {feature-name}-data-migration ← run in the Data Migration agent
```

---

## Classification Reference

**Reporting signals:** "Power BI", "PBIX", "SSRS", "RDL", "report", "dashboard", "dataset", "dataflow", "measure", "KPI", "DAX", "visual", "chart", "paginated", "RLS", "row-level security", "workspace", "deployment pipeline", "refresh schedule", "subscription", "embedded report", "Power BI Embedded"

**Integration signals:** "Azure Function", "Service Bus", "APIM", "Logic App", "event-driven", "payload", "retry", "dead-letter", "Bicep", "infrastructure", "inbound webhook", "outbound notification", "external system sync"

**CE signals:** "D365 form", "D365 CE", "view", "plugin", "D365 security role", "D365 UI", "PCF", "canvas app screen", "model-driven app", "embed in D365"

**Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "ingest pipeline", "bulk upsert via ADF", "file-based", "nightly load", "data flow", "stage promotion"

## Rules

- Never drop requirements — every FR must appear in exactly one output spec (or split across multiple).
- Preserve original FR numbers in the Traceability section of all output specs.
- Reporting spec retains the original file path — downstream commands do not need to change paths.
- Cross-cutting FRs must have explicit dependency references in all child FRs.
- Do not invent new requirements during the split.
