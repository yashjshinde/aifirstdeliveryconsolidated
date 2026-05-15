---
mode: agent
description: "Review a Data Migration spec for completeness and constitution compliance. Triggers on: 'review', 'spec review', 'approve spec'."
---

Validate the Migration Specification against the constitution and gate it for downstream commands.

## Usage

```
/data-migration-review {migration-id}
```

## Pre-condition

`specs/{migration-id}/spec.md` must exist.

## Steps

1. Read ALL files in `constitution/`.
2. Read `specs/{migration-id}/spec.md`.
3. **Multi-Domain Detection — run first, before any other check.**
   Scan the spec for D365 CE / Power Apps or Azure Integration signals. If found, raise a BLOCKER immediately and stop:
   - **D365 CE / Power Apps signals:** "D365 form", "D365 view", "plugin", "business rule on entity", "PCF control", "Canvas App", "Model-Driven App", "Power Automate flow", "Copilot Studio topic", "Power Fx", "delegation"
   - **Azure Integration signals:** "Azure Function", "Service Bus", "APIM", "Logic App", "event-driven pipeline", "inbound webhook", "outbound to external API", "DLQ", "dead-letter", "Bicep"
   - **BLOCKER text (CE / Power Apps):** "This spec contains D365 CE or Power Apps requirements that are out of scope for the Data Migration agent. Run `/data-migration-split-spec {migration-id}` to separate the data migration and CE/Power Apps portions before proceeding. The CE/Power Apps spec must then be handed to the appropriate domain agent."
   - **BLOCKER text (Integration):** "This spec contains Azure Integration requirements that are out of scope for the Data Migration agent. Run `/data-migration-split-spec {migration-id}` to separate the data migration and integration portions before proceeding. The integration spec must then be handed to the Azure Integration agent."
   - Set status to `NEEDS REWORK` and stop.
4. Check `constitution/10-alm-configuration.md` for `brownfield.enabled`.

## Review Checklist

### Structure (FAIL if any missing)

- [ ] All 13 required sections present
- [ ] Direction is one of the supported values in `constitution/01-migration-patterns.md`
- [ ] Source and target systems identified
- [ ] At least one entity / file specified
- [ ] Volume and frequency specified

### Business Completeness (WARN if missing)

- [ ] Business justification provided
- [ ] Stakeholder / requestor identified
- [ ] Out of scope section present and non-empty

### Technical Quality (FAIL if any missing)

- [ ] All listed source fields have a data type
- [ ] Required fields identified
- [ ] Data quality rules specified for each entity
- [ ] Error handling threshold defined
- [ ] Performance NFR specified

### Security (FAIL if any PII/Sensitive fields without controls)

- [ ] All fields classified (PII, Sensitive, Internal, Public)
- [ ] PII fields have masking / encryption requirement
- [ ] Authentication method specified for each connection
- [ ] Key Vault usage confirmed (no hardcoded credentials)

### Direction-Specific Checks

**SFTP_TO_DATAVERSE:**
- [ ] File format (CSV/JSON/XML), encoding, delimiter specified
- [ ] File naming convention documented
- [ ] Alternate key for Dataverse upsert identified
- [ ] File archiving behaviour after processing specified

**DATAVERSE_TO_SFTP:**
- [ ] Delta / incremental filter field specified (or full-extract justified)
- [ ] Output file naming convention documented
- [ ] PII masking / PGP encryption requirement stated

**Brownfield (if enabled):**
- [ ] Existing data volume estimated
- [ ] Duplicate detection strategy specified
- [ ] Existing record treatment documented (skip / update / error)

### Cross-Feature Overlap Check (informational; does not block approval)

- Read `plans/_component-registry.md` if it exists
- Scan migration components (ADF pipeline names, SQL staging table names, Dataverse entity targets) from the spec against the registry
- For each match: log as INFO — record the owning feature, component name, and whether the actions are compatible
- If a CONFLICT is detected (two migrations targeting the same staging table or Dataverse entity with conflicting logic): raise as WARN — "Component {name} is also claimed by plan {other-plan} with action {action}. Resolve before /data-migration-plan to avoid conflicts."
- If no `_component-registry.md` exists or no matches found: note "No cross-feature overlaps detected at spec stage."
- Record findings in the Findings table with severity INFO or WARN

## Severity Levels

| Level | Meaning |
|---|---|
| **FAIL** | Spec cannot proceed — must be corrected before APPROVED |
| **WARN** | Should be addressed; APPROVED WITH COMMENTS if all WARNs are acknowledged |
| **INFO** | Observation for awareness only |

## Output

Write `specs/{migration-id}/review.md`:

```markdown
# Spec Review — {migration-id}

**Date:** {today}
**Reviewer:** Data Migration Agent
**Status:** APPROVED | APPROVED WITH COMMENTS | CHANGES REQUIRED

## Summary

{1-2 sentence summary of the spec quality}

## Findings

| # | Severity | Section | Finding |
|---|---|---|---|
| 1 | FAIL/WARN/INFO | {section} | {description} |

## Decision

**APPROVED** — spec is complete and meets all constitution requirements. Proceed to /data-migration-mapping and /data-migration-pipeline.

-- OR --

**CHANGES REQUIRED** — the following must be fixed before approval:
- {finding 1}
- {finding 2}
```

Print:

```
REVIEW COMPLETE — {migration-id}
════════════════════════════════════════
Status  : APPROVED | CHANGES REQUIRED
FAILs   : {N}
WARNs   : {N}

{If APPROVED:}
Next steps:
  /data-migration-mapping {migration-id}     → field mapping document
  /data-migration-pipeline {migration-id}    → pipeline design document
  /data-migration-testplan {migration-id}    → test plan

{If CHANGES REQUIRED:}
Fix the listed issues and re-run /data-migration-review {migration-id}.
```

**GATE:** No downstream command (`/data-migration-mapping`, `/data-migration-pipeline`, `/data-migration-testplan`, `/data-migration-plan`) may run until this review is APPROVED.

## Rules

- **AI Notes:** In the generated review report, at the end of each finding entry (each BLOCKER, REQUIRED, and RECOMMENDED item), append `> **AI Notes** — {1–2 sentences: reasoning behind the severity classification, the specific rule applied, or the risk if left unresolved}`. Write only what is non-obvious — do not repeat the finding description.