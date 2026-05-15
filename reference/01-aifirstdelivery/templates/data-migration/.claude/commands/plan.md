Generate the Technical Plan and work item hierarchy for a migration.

## Usage

```
/plan {migration-id}
```

## Pre-condition

- `specs/{migration-id}/review.md` must be **APPROVED**.
- If `brownfield.enabled: true` in `constitution/10-alm-configuration.md`, `specs/{migration-id}/impact-analysis.md` must also be **IMPACT-ASSESSED**.

## Steps

1. Read ALL files in `constitution/`.
2. Read `specs/{migration-id}/spec.md`, `docs-generated/{migration-id}/field-mapping.md`, `docs-generated/{migration-id}/pipeline-design.md`.

2b. **Cross-Feature Dependency Scan** — scan existing migration and feature plans before generating any content:
    - List all subdirectories in `plans/` (skip `_template.md`, `_component-registry.md`)
    - For each subdirectory that has a `plan.md`, read its **Section 2 — Task Inventory** or task tables (Artefacts / Title columns)
    - Read `plans/_component-registry.md` if it exists
    - Extract all Data Migration components claimed by other plans: ADF pipeline names, ADF Data Flow names, SQL staging table names, Dataverse entity names targeted for upsert/delete, Azure Key Vault secret names, Storage container names
    - Compare against this spec's migration scope (entities, pipelines, staging tables) to find shared components
    - Classify each overlap:
      - **CONFLICT** — incompatible change to the same component (e.g., two migrations both truncate the same staging table or write to the same target entity with conflicting field mappings)
      - **SEQUENTIAL** — this migration depends on another plan's component existing first (e.g., this pipeline requires a SQL table or linked service that another plan creates)
      - **SHARED** — both plans reference the same component without conflicting modifications (informational only)
    - Record all findings. If no other `plan.md` exists: note "First migration in this application — no existing plans to scan."
    - Results populate the **Cross-Feature Dependencies** section in the plan output.

3. Decompose the migration into a work item hierarchy.
4. Produce `plans/{migration-id}/plan.md` and `plans/{migration-id}/work-items.yaml`.

## Decomposition Rules

Use the L1→L4 hierarchy:

| Level | ADO Type | Naming |
|---|---|---|
| L1 Epic | Epic | `[DM] {migration-id} — Full Migration` |
| L2 Feature | Feature | `[DM-{entity}] {component-group}` |
| L3 User Story | User Story | `As a {persona}, I need {what} so that {why}` |
| L4 Task | Task | `{verb} {artifact-name}` |

### Standard Feature Breakdown

Generate the following features (include only those applicable to the direction):

1. **Infrastructure Setup** — Key Vault secrets, linked services, SQL schemas
2. **SQL Staging** — Raw table, stage table, error table, audit table DDL; stage promotion SPs
3. **ADF Datasets** — Source and target dataset definitions
4. **ADF Pipelines** — Ingest/Extract/Transform/Export/Notify pipelines
5. **ADF Data Flows** — Mapping and transformation data flows
6. **ADF Triggers** — Schedule and/or event triggers
7. **Test Data** — Test CSV/JSON files, SQL seed data scripts
8. **Deployment** — ARM template export, deploy.ps1, environment parameter files
9. **Documentation** — Deployment guide, runbook, release notes

### User Story Examples

```
As a data engineer, I need the SQL staging schema deployed so the ingest pipeline has a landing zone.
As a data engineer, I need the stage promotion SP so raw records are validated and typed correctly.
As a data engineer, I need the ADF ingest pipeline so files can be moved from SFTP to SQL.
As a QA engineer, I need the happy-path test file so I can validate end-to-end processing.
```

### Estimation Guidelines

| Task Type | Estimate (hours) |
|---|---|
| SQL table DDL (one table) | 1 |
| SQL stored procedure (simple) | 2 |
| SQL stored procedure (complex with validation) | 4–8 |
| ADF Linked Service | 1 |
| ADF Dataset | 1 |
| ADF Pipeline (simple) | 2–4 |
| ADF Pipeline (orchestrator with error routing) | 4–8 |
| ADF Data Flow (≤10 mappings) | 2–4 |
| ADF Data Flow (>10 mappings, lookups, conditionals) | 6–12 |
| ADF Trigger configuration | 1 |
| Test data file creation | 2 |
| ARM template + deploy script | 3 |

---

## plan.md Structure

```markdown
# Technical Plan — {migration-id}

**Version:** 1.0
**Date:** {today}
**Author:** Data Migration Agent
**Status:** DRAFT

## Summary

{3-5 sentence summary of the technical approach}

## Epic

[E001] [DM] {migration-id} — Full Migration

## Features and Stories

### F001 — Infrastructure Setup
**User Stories:**
- US001: As a data engineer, I need SFTP linked service configured...
- US002: As a data engineer, I need SQL staging database with schema...

### F002 — SQL Staging
...

## Cross-Feature Dependencies

| Feature / Plan | Component | Overlap Type | Recommended Action |
|---|---|---|---|
| {feature or "No cross-feature overlaps found."} | {component name} | CONFLICT / SEQUENTIAL / SHARED | {action} |

## Effort Estimate

| Component | Hours |
|---|---|
| SQL Staging | {N}h |
| ADF Artifacts | {N}h |
| Testing | {N}h |
| Deployment | {N}h |
| **Total** | **{N}h** |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {risk} | H/M/L | H/M/L | {action} |

## Open Items

| # | Item | Owner |
|---|---|---|
```

## work-items.yaml Structure

```yaml
migration: {migration-id}
direction: {direction}
generated: {date}

items:
  - uid: E001
    type: Epic
    title: "[DM] {migration-id} — Full Migration"
    tags: "data-migration;{migration-id}"
    alm_id: null

  - uid: F001
    type: Feature
    title: "[DM-{entity}] Infrastructure Setup"
    parent_uid: E001
    tags: "data-migration;infrastructure"
    alm_id: null

  - uid: US001
    type: User Story
    title: "As a data engineer, I need SFTP linked service..."
    parent_uid: F001
    story_points: 2
    tags: "adf:linkedservice"
    acceptance_criteria: |
      - Linked service connects to SFTP without error
      - Connection uses Key Vault secret for credentials
    alm_id: null
    tasks:
      - uid: T001
        type: Task
        title: "Create LS_SFTP_{Env} linked service JSON"
        estimate_hours: 1
        tags: "adf:linkedservice"
        alm_id: null
```

---

## Rules

- Every L4 Task must trace to at least one migration requirement (MR-NNN) from the spec.
- ADF artefact tasks must sequence after their dependent SQL schema tasks.
- **AI Notes:** At the end of each Epic and Feature description block, append `> **AI Notes** — {1–2 sentences: decomposition rationale, architectural decision made, or exception taken}`.

---

## STRUCTURED MODE

*Entered when `requirement-intake: structured` in `constitution/10-alm-configuration.md`
or when the spec front matter contains `intake: structured`.*

In structured mode the L1/L2/L3 work items already exist in the ALM tool.
`/plan` must NOT create new L1/L2/L3 items — it generates **Task-level (L4) items only**,
grouped under their parent L3 ALM IDs as read from `specs/{migration-id}/spec.md` ALM Traceability Matrix.

### What changes in structured mode

| Standard mode | Structured mode |
|---|---|
| Generates L1/L2/L3 + Task items | Generates Task items only |
| Assigns new L1/L2/L3 IDs (E001, F001, US001) | References existing ALM IDs from the spec |
| `work-items.yaml` has 4 levels | `work-items.yaml` has Tasks only; `parent_uid` = existing L3 ALM ID |
| `plan.md` creates L1/L2/L3 headings | `plan.md` uses existing L1/L2/L3 headings from spec ALM Traceability Matrix |

### Structured plan.md structure

```
## {L1-Type}: {L1-ALM-ID} — {L1 Title}

### {L2-Type}: {L2-ALM-ID} — {L2 Title}

#### {L3-Type}: {L3-ALM-ID} — {L3 Title}

**Mapped MRs:** MR-001, MR-002

**Migration Architecture Summary:** {2–3 sentences on which ADF components will be used and why.}
**Data Flow:** {Source} → {Component} → {Target}

##### Tasks

| Task UID | ALM ID | Title | Component Tag | Estimate (hrs) | Dependencies |
|---|---|---|---|---|---|
| T-001 | *(pending)* | Create stg_{entity} staging table | sql:schema | 1 | — |
```

### Structured work-items.yaml

Only Task entries are written. Each task's `parent_uid` holds the existing L3 ALM ID.

```yaml
migration: {migration-id}
direction: {direction}
generated: {date}
intake: structured

items:
  - uid: "{migration-id}-T-001"
    type: Task
    title: "Create stg_{entity} staging table DDL"
    parent_uid: "{existing-L3-ALM-ID}"   # e.g. "US-12345" from Azure DevOps
    source: alm-parent
    estimate_hours: 1
    tags: "sql:schema"
    alm_id: null
    mr_refs:
      - MR-001
```

### Structured plan sections

- **Summary** — note `intake: structured` and source ALM tool; list existing L1/L2/L3 IDs
- **Features and Stories** — headed by existing L1/L2/L3 IDs and titles from the spec; contains only Task tables
- **Effort Estimate** — task-level hours only; no L1/L2/L3 rows
- **Risks** — same as standard
- **Open Items** — same as standard

### Structured mode rules

- **Never** emit Epic, Feature, or User Story entries in `work-items.yaml`
- **Never** assign new E/F/US UIDs — the ALM tool already holds those
- Every Task's `parent_uid` must be an existing L3 ALM ID from the spec's ALM Traceability Matrix
- ADF artefact tasks must still sequence after their dependent SQL schema tasks
- All other plan rules apply: MR traceability, AI Notes

---

### L3-Optional Sub-Mode

*Additionally active when `l3-intake: optional` in `constitution/10-alm-configuration.md`
or when the spec front matter contains `l3-intake: optional`.*

In this sub-mode the spec has one or more L2 branches with no ALM-provided L3 items (marked
`source: pending` in the spec's `alm-ids` YAML front matter, and with Source column value `pending`
in the ALM Traceability Matrix). `/plan` identifies pending branches by reading the Source column
in the matrix — rows where Source = `pending` — then generates new L3 User Stories for those
branches and Tasks under all L3s.

#### What changes

| Structured mode (l3-intake: required) | L3-Optional sub-mode |
|---|---|
| All L3 from ALM — Tasks only in YAML | ALM-provided L3 → Tasks only; pending L2 → new L3 entries + Tasks |
| No new L3 UIDs assigned | New US-NNN UIDs assigned for generated stories |
| plan.md headings reference existing ALM IDs | Generated L3 headings marked `⚑ NEW` |

#### Generating L3 items for pending L2 branches

For each L2 whose Traceability Matrix Source column value is `pending`:
1. Read the L2 title and description to understand the migration scope (entity, direction, component area)
2. Decompose into User Stories in the same data-engineer persona format as standard mode
   (e.g., "As a data engineer, I need {action} so that {value}"). Minimum 1 story per L2.
3. Assign sequential UIDs: US-001, US-002, … (continue from highest existing US UID in `work-items.yaml`, otherwise start at 001)
4. Generate Tasks under each new L3 story — same rules as standard structured mode Tasks
5. Emit both the L3 entries and their nested Task entries in `work-items.yaml`

#### L3-optional additions to work-items.yaml

```yaml
# Generated L3 — not from ALM; parent_uid = existing L2 ALM ID
- uid: "{migration-id}-US-001"
  type: User Story
  title: "As a data engineer, I need {action} so that {value}"
  source: generated          # created by /plan — ALM Agent will push this to ADO
  parent_uid: "{L2-ALM-ID}" # existing ALM L2 ID
  story_points: {N}
  acceptance_criteria: |
    - Given {precondition}, When {action}, Then {outcome}
    - Given {precondition}, When {failure-action}, Then {error-outcome}
  tags: "{relevant-component-tag}"
  alm_id: null
  tasks:
    - uid: "{migration-id}-T-NNN"
      type: Task
      title: "..."
      source: generated-parent   # parent L3 was generated by /plan, not from ALM
      estimate_hours: {N}
      tags: "{component-tag}"
      alm_id: null
      mr_refs:
        - MR-NNN
```

#### plan.md visual distinction for generated L3

```markdown
#### {L3-Type}: US-001 — {Generated Story Title}   ⚑ NEW

> **Source:** Generated by `/plan` — no L3 items were provided for parent {L2-ALM-ID}.
> The ALM Agent (`/wi-create-bulk`) will create this story in the ALM tool.

**Mapped MRs:** {MR-NNN if derivable from L2 scope, otherwise "— (to be assigned after /review)"}
**As a** data engineer, **I need** {action}, **so that** {value}.
**Acceptance Criteria:**
- Given …, When …, Then …
- Given …, When …, Then … (failure path)

##### Tasks
| Task UID | ALM ID | Title | Component Tag | Estimate (hrs) | Dependencies |
```

#### L3-optional mode rules

- ALM-provided L3 items (`source: alm-parent`) follow standard structured mode exactly — Tasks only, `parent_uid` = existing ALM ID
- Generated L3 items (`source: generated`) get full User Story entries in `work-items.yaml` with nested Tasks
- Never overwrite or replace an ALM-provided L3 with generated content
- If `work-items.yaml` already exists, preserve all existing uid and non-null alm_id values; only append new entries for pending L2 branches
- The ALM Agent (`/wi-create-bulk`) handles mixed output: it creates generated L3s as new User Stories in ADO (parented to the L2 ALM ID) and creates Tasks under all L3s
- ADF artefact tasks must still sequence after SQL schema tasks — applies to tasks under both ALM-provided and generated L3s
- All other plan rules apply: MR traceability, AI Notes

---

## Registry Update

After writing `plans/{migration-id}/plan.md` and `plans/{migration-id}/work-items.yaml`, update `plans/_component-registry.md`:
- If the file does not exist, create it with this header row:
  `| Feature | Agent | Component Type | Component Name | Action | Plan Path |`
- For each Data Migration component claimed in this plan (ADF pipelines, ADF Data Flows, SQL staging tables, Dataverse entity targets, Azure Key Vault secrets, Storage containers), add or update one row:
  - **Feature**: `{migration-id}`
  - **Agent**: `data-migration`
  - **Component Type**: ADFPipeline | ADFDataFlow | SQLStagingTable | DataverseEntity | KeyVaultSecret | StorageContainer | LinkedService | Trigger
  - **Component Name**: exact resource name or table name
  - **Action**: NEW | EXTEND | REPLACE
  - **Plan Path**: `plans/{migration-id}/plan.md`
- UPSERT logic: if a row for this migration + component already exists, update it; if it is new, append it
- Never delete or modify rows belonging to other features

## Output

Write `plans/{migration-id}/plan.md` and `plans/{migration-id}/work-items.yaml`.

Print:

```
PLAN WRITTEN — {migration-id}
════════════════════════════════════════
Files     : plans/{migration-id}/plan.md
            plans/{migration-id}/work-items.yaml
Epics     : {N}
Features  : {N}
Stories   : {N}
Tasks     : {N}
Est. Hours: {N}h

Next step: /clarify {migration-id}
```
