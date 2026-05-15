Generate operational and release documentation for a completed D365 F&O requirement. Reads all implemented artefacts and produces deployment guide, release notes, test evidence summary, and object register extract.

## Usage

```
/document {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Read Context

Read:
- `docs/{requirement-name}/fdd.md`
- `docs/{requirement-name}/tdd.md`
- `plans/{requirement-name}/plan.md`
- All impl-docs in `output/{requirement-name}/impl-docs/`
- `tasks/{requirement-name}/tracker.md`

## Step 3 — Generate Documents

Generate only the documents applicable to the objects implemented:

### Deployment Guide (`docs/{requirement-name}/deployment-guide.md`)

Must include:
- Environment-by-environment deployment sequence (DEV → TEST → UAT → PROD)
- Step-by-step object deployment for each environment:
  - X++ deployable package build and deploy instructions
  - Security role import/configuration steps
  - Workflow configuration steps (per environment)
  - Data entity import if applicable
  - Integration configuration (connection strings via Key Vault, App Registration setup)
- Post-deployment validation checks per object
- Rollback instructions

### Release Notes (`docs/{requirement-name}/release-notes.md`)

Must include:
- Version number and deployment date
- List of objects: Object-ID, Object Name, Category, Change Summary
- Known issues and workarounds
- Rollback instructions

### Test Evidence Summary (`docs/{requirement-name}/test-evidence-summary.md`)

Must include:
- Per-object test result summary from impl-docs
- AC coverage table (AC-ID, Object-ID, Pass/Fail/Partial)
- Outstanding defects or deferred items
- Sign-off status (unit test, SIT readiness)

### Object Register Extract (`docs/{requirement-name}/object-register.md`)

One row per object matching the Object Register format from the constitution:

| Object-ID | Category | Object Name | Business Req Ref | Complexity | Owner | Status | Environment |
|---|---|---|---|---|---|---|---|

## Step 4 — Print Completion Report

```
DOCUMENT COMPLETE
══════════════════
Requirement : {requirement-name}
Objects     : {N} objects documented
Documents   : deployment-guide.md, release-notes.md, test-evidence-summary.md, object-register.md
Output      : docs/{requirement-name}/
```
