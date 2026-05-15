Review the Technical Plan for task-readiness and gate it for downstream commands.

## Usage

```
/clarify {migration-id}
```

## Pre-condition

`plans/{migration-id}/plan.md` and `plans/{migration-id}/work-items.yaml` must exist.

## Steps

1. Read ALL files in `constitution/`.
2. Read `plans/{migration-id}/plan.md` and `plans/{migration-id}/work-items.yaml`.
3. Read `specs/{migration-id}/spec.md` and `docs-generated/{migration-id}/field-mapping.md`.
4. Evaluate against the checklist below.
5. Write `plans/{migration-id}/clarify.md`.

## Task-Readiness Checklist

### Completeness (FAIL if any missing)

- [ ] All entities from the spec have at least one Feature in the plan
- [ ] Every Feature has at least one User Story
- [ ] Every User Story has at least one Task
- [ ] All standard Feature groups (Infrastructure, SQL Staging, ADF Datasets, ADF Pipelines, ADF Data Flows, Triggers, Testing, Deployment, Documentation) are represented
- [ ] All tasks in work-items.yaml have `estimate_hours`
- [ ] Total effort estimate present in plan.md

### Traceability (WARN if any missing)

- [ ] Every User Story has acceptance criteria
- [ ] Every Task has a tag from the `component type tags` table in `constitution/10-alm-configuration.md`
- [ ] All open items in field-mapping.md and pipeline-design.md are represented as tasks or explicitly deferred

### Technical Coverage (FAIL if any missing)

- [ ] SQL raw table task exists for each entity
- [ ] SQL stage promotion SP task exists for each entity
- [ ] SQL error table task exists for each entity
- [ ] ADF Ingest or Extract pipeline task exists
- [ ] ADF Transform or Export pipeline task exists
- [ ] ADF Orchestrator pipeline task exists
- [ ] ADF Notify pipeline task exists
- [ ] ADF Data Flow task exists for each entity with mapping
- [ ] Trigger configuration task exists
- [ ] Test data file task exists
- [ ] ARM template + deploy script task exists
- [ ] Deployment guide task exists
- [ ] Runbook task exists

### Security Coverage (FAIL if any missing)

- [ ] Key Vault secret setup task exists for each linked service
- [ ] Task exists for SFTP IP whitelisting / firewall rule configuration
- [ ] Task exists for SQL Private Endpoint or firewall rule (if required by spec)
- [ ] PII masking task exists if spec flags PII fields

## clarify.md Structure

```markdown
# Clarify Review — {migration-id}

**Date:** {today}
**Reviewer:** Data Migration Agent
**Status:** TASK-READY | CHANGES REQUIRED

## Summary

{1-2 sentence assessment}

## Findings

| # | Severity | Area | Finding |
|---|---|---|---|
| 1 | FAIL/WARN/INFO | {area} | {description} |

## Decision

**TASK-READY** — plan is complete and all tasks are well-defined. Proceed to /tdd, /blueprint, /task.

-- OR --

**CHANGES REQUIRED** — address the following before proceeding:
- {item}
```

Print:

```
CLARIFY COMPLETE — {migration-id}
════════════════════════════════════════
Status    : TASK-READY | CHANGES REQUIRED
FAILs     : {N}
WARNs     : {N}

{If TASK-READY:}
Next steps:
  /tdd {migration-id}       → technical design document
  /blueprint {migration-id} → solution blueprint
  /task {migration-id}      → dev-ready task cards

{If CHANGES REQUIRED:}
Fix the listed issues and re-run /clarify {migration-id}.
```

**GATE:** `/tdd`, `/blueprint`, and `/task` may not run until this review is **TASK-READY**.

## Rules

- **AI Notes:** In the generated clarify report, at the end of each BLOCKER and QUESTION finding entry, append `> **AI Notes** — {1–2 sentences: key ambiguity identified, the assumption a developer would make if unresolved, or rationale for the readiness verdict on this task}`. Write only what is non-obvious.