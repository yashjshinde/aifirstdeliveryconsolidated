# Plan Hierarchy Definitions — Data Migration

Use these definitions when decomposing a migration spec into the plan hierarchy.

## Epic (L1)
The top-level deliverable. Corresponds to one migration scenario end-to-end.
Format: `[DM] {migration-id} — Full Migration`
Example: `[DM] sftp-to-dv-accounts — Full Migration`

## Feature (L2)
A major technical workstream within the epic.
A feature groups work items that share a deployment unit or technical layer.
A feature should be completable in one sprint cycle.
Standard features:
- Infrastructure Setup
- SQL Staging
- ADF Datasets
- ADF Pipelines
- ADF Data Flows
- ADF Triggers
- Test Data
- Deployment
- Documentation

## User Story (L3)
A single unit of data engineering value, written from a persona's perspective.
Format: "As a {persona}, I need {what} so that {why}."
A story should be implementable within one to three engineer-days.
Personas: data engineer, QA engineer, ops engineer, business analyst.

Examples:
- "As a data engineer, I need the SQL staging schema deployed so the ingest pipeline has a landing zone."
- "As a data engineer, I need the stage promotion stored procedure so raw records are validated and typed correctly before target load."
- "As a QA engineer, I need the happy-path test file so I can validate end-to-end processing."

## Task (L4)
A discrete technical unit of work that produces exactly one migration artefact.
A task maps to one output file (SQL script, ADF JSON, test data file, etc.).
A task should be implementable by one engineer without mid-task collaboration dependencies.

## Artefact Types for Data Migration Tasks

| Type | When to Use |
|---|---|
| SQL DDL | New staging, error, audit, or dimension table |
| SQL Stored Procedure | Stage promotion, error routing, idempotent transformation |
| ADF Linked Service | Connection to SFTP, SQL, Dataverse, Key Vault |
| ADF Dataset | Source file, staging table, target entity dataset |
| ADF Data Flow | Field mapping, data type casting, lookup, conditional split |
| ADF Pipeline | Ingest, transform, export, notify, orchestrator pipelines |
| ADF Trigger | Schedule trigger or storage event trigger |
| Test Data File | CSV/JSON test input covering happy path and edge cases |
| ARM Template | Deployable resource definition for ADF, Key Vault |
| Deploy Script | PowerShell/Bicep deployment automation |
| Documentation | Deployment guide, runbook, release notes |

## Standard Implementation Sequence

1. SQL schema and tables (raw → stage → error → audit)
2. SQL stored procedures
3. ADF Linked Services
4. ADF Datasets (source → staging → target)
5. ADF Data Flows
6. ADF Pipelines (Notify → Ingest/Extract → Transform/Export → Orchestrator)
7. ADF Triggers
8. Test data files and scripts
9. ARM template and deploy script
10. Documentation
