---
mode: agent
description: "Analyse brownfield impact of a migration spec on existing solution components. Triggers on: 'impact', 'impact analysis', 'brownfield impact'."
---

Analyse the impact of migrating data INTO an existing system (brownfield mode only).

## Usage

```
/data-migration-impact {migration-id}
```

## Pre-condition

- `specs/{migration-id}/review.md` must be **APPROVED**.
- `brownfield.enabled: true` must be set in `constitution/10-alm-configuration.md`.

## When to Use

Run `/data-migration-impact` when migrating data into a Dataverse environment (or other target) that already contains data.
Skip this command for greenfield targets or for one-way export flows (Dataverse → SFTP).

## Steps

1. Read ALL files in `constitution/`.
2. Verify brownfield is enabled — if not, print: "Brownfield mode is disabled. `/data-migration-impact` is not required. Proceed to `/data-migration-plan`."
3. Read spec and field mapping.

3b. **Existing ADF Artefact Resolution** — for every ADF pipeline, data flow, or linked service referenced in the spec, locate the actual file in `input/adf/` using these lookup patterns:

   | Component Type | Lookup Pattern |
   |---|---|
   | ADF Pipeline | `input/adf/pipelines/{PipelineName}.json` |
   | ADF Data Flow | `input/adf/dataflows/{DataflowName}.json` |
   | ADF Linked Service | `input/adf/linkedServices/{LinkedServiceName}.json` |
   | ADF Dataset | `input/adf/datasets/{DatasetName}.json` |

   For each component:
   - If file **found**: classify as `EXTEND` (existing artefact will be modified) and record `source-file: {relative-path}`.
   - If file **not found**: classify as `NEW` (artefact does not yet exist).
   - If file found but spec intent contradicts the existing definition: classify as `CONFLICT` and add to Open Questions.

   Record findings in Section 8 of `impact-analysis.md` (see output structure below).

4. Generate `specs/{migration-id}/impact-analysis.md`.

## impact-analysis.md Structure

### Header

```markdown
# Impact Analysis — {migration-id}

**Version:** 1.0
**Date:** {today}
**Author:** Data Migration Agent
**Status:** DRAFT
**Gate:** *(pending IMPACT-ASSESSED)*
```

### Section 1 — Existing Data Summary

| Entity | Estimated Existing Records | Active Records | Last Modified Date Range |
|---|---|---|---|
| {entity} | {N} | {N} | {date range} |

### Section 2 — Collision Analysis

For each entity being written to:

| Risk | Description | Likelihood | Impact |
|---|---|---|---|
| Duplicate key collision | Inbound record matches existing alternate key | {H/M/L} | Data overwrite |
| Null overwrite | Inbound null would clear populated field | {H/M/L} | Data loss |
| Status conflict | Inbound sets record active when existing is inactive | {H/M/L} | Business impact |
| Relationship breakage | Lookup field references a GUID that no longer exists | {H/M/L} | Referential integrity |

### Section 3 — Duplicate Detection Strategy

Describe how the migration will handle records that already exist in the target:

| Strategy | Description | Recommended For |
|---|---|---|
| **Skip** | If alternate key exists, skip the inbound record | Read-only protection of existing data |
| **Update** | If alternate key exists, update all mapped fields | Full refresh migrations |
| **Merge** | Update only non-null inbound fields, preserve existing non-null | Partial enrichment |
| **Error** | If alternate key exists, write to error table | Strict validation mode |

**Chosen strategy:** {strategy} — **justification:** {reason from spec or business requirement}

### Section 4 — Existing Data Treatment

| Existing Record State | Inbound Record | Action |
|---|---|---|
| Active | Active | {Update / Skip / Merge} |
| Active | Inactive | {Update / Skip / Error} |
| Inactive | Active | {Reactivate / Skip / Error} |
| Not found | Any | Create new record |

### Section 5 — Pre-Migration Data Snapshot

Recommend a backup / snapshot before running the migration:
- [ ] Export target entity to CSV via `/data-migration-implement` export variant before first ingest run
- [ ] Store snapshot in `output/{migration-id}/pre-migration-snapshot/`
- [ ] Verify record count before and after migration

### Section 6 — Rollback Plan

If the migration corrupts existing data:
1. Identify affected records via `stg.{entity}_stage` where `run_id = '{runId}'`
2. Restore from pre-migration snapshot (manual re-import or SP-based restoration)
3. Document restoration procedure here

### Section 8 — Existing ADF Artefacts

*(Populated by Step 3b. Omit this section if no existing ADF artefacts were found in `input/adf/`.)*

| Component Type | Name | Action | Source File | Change Description |
|---|---|---|---|---|
| Pipeline | {PipelineName} | EXTEND / NEW / CONFLICT | `input/adf/pipelines/{name}.json` | {what changes} |
| Data Flow | {DataflowName} | EXTEND / NEW | `input/adf/dataflows/{name}.json` | {what changes} |
| Linked Service | {LinkedServiceName} | EXTEND / NEW | `input/adf/linkedServices/{name}.json` | {what changes} |

*If none: No existing ADF artefacts found in `input/adf/`. All ADF components will be created as NEW.*

---

### Section 7 — Approval

```
IMPACT-ASSESSED: This analysis has been reviewed and the migration approach is approved.
Signed: {approver name / role}
Date: {date}
```

---

## Gate

The analysis is IMPACT-ASSESSED when the approver writes `IMPACT-ASSESSED` explicitly at the bottom of the document (or confirms via `/data-migration-review` of the impact analysis).

Print:

```
IMPACT ANALYSIS WRITTEN — {migration-id}
════════════════════════════════════════
File      : specs/{migration-id}/impact-analysis.md
Status    : DRAFT

Review this document and add "IMPACT-ASSESSED" when approved.
Once IMPACT-ASSESSED, proceed to /data-migration-plan {migration-id}.
```
