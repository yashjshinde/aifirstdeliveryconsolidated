---
mode: agent
description: "Generate Reporting operational documentation - deployment guide, data dictionary, asset registry, release notes. Triggers on: 'document', 'operational docs'."
---

Generate operational documentation for a Reporting feature after implementation is complete.

## Usage

```
/reporting-document {feature-name}
```

## Pre-condition Check

1. Check that `tasks/{feature-name}/tracker.md` exists and that the feature is substantially complete (> 80% tasks DONE).
2. Read all files in `constitution/`.

## Steps

3. Read `specs/{feature-name}/spec.md`, `docs-generated/{feature-name}/functional-design-document.md`, and `docs-generated/{feature-name}/technical-design-document.md`.
4. Read all task cards in `tasks/{feature-name}/` and their implementation records in `output/{feature-name}/impl-docs/`.
5. Generate the following documents:

### Document 1 — Data Dictionary
`docs-generated/{feature-name}/data-dictionary.md`

For every table in every dataset:
- Table name, description, storage mode, source system.
- Column inventory: Column Name | Display Name | Data Type | Description | Source Column | Is Hidden | Notes.

For every measure:
- Measure Name | Business Definition | DAX Expression | Format String | Source Table | Notes.

### Document 2 — Deployment Guide
`docs-generated/{feature-name}/deployment-guide.md`

Step-by-step instructions for deploying to each environment:
- Pre-deployment checklist (gateway configured, service principal granted, Key Vault secrets set).
- DEV deployment steps.
- UAT promotion steps (deployment pipeline).
- PROD promotion steps (deployment pipeline + sign-off gate).
- Post-deployment validation steps: verify dataset refresh, verify report renders, verify RLS.
- Rollback procedure.

### Document 3 — Asset Registry
`docs-generated/{feature-name}/asset-registry.md`

| Asset Name | Type | Workspace | Dataset Dependency | Refresh Schedule | Owner | RLS Roles |
|---|---|---|---|---|---|---|
| {ReportName} | Interactive / Paginated / SSRS | {Workspace} | {DatasetName} | {Schedule} | {Owner} | {RLS Role list} |

### Document 4 — Release Notes
`docs-generated/{feature-name}/release-notes.md`

- Feature summary (business language — no DAX, no technical detail).
- New reports added: name, purpose, audience, access path.
- New datasets and data sources.
- RLS roles introduced.
- Known limitations or deferred items.

6. Print completion summary:

```
DOCUMENTATION COMPLETE — {feature-name}
════════════════════════════════════════
Data Dictionary  : docs-generated/{feature-name}/data-dictionary.md
Deployment Guide : docs-generated/{feature-name}/deployment-guide.md
Asset Registry   : docs-generated/{feature-name}/asset-registry.md
Release Notes    : docs-generated/{feature-name}/release-notes.md
```
