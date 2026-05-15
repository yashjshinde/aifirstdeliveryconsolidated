# Constitution Index — Data Migration Agent

This directory contains all binding rules for the Data Migration agent.
All commands must read every file listed here before generating output.

| File | Topic | Priority |
|---|---|---|
| `CLAUDE.md` | Agent workflow, gates, folder conventions, naming, MCP tools | Critical |
| `00-index.md` | This index | Reference |
| `01-migration-patterns.md` | Ingest/Transform/Export patterns, direction matrix | Critical |
| `02-adf-standards.md` | ADF pipeline, dataset, linked service, data flow standards | Critical |
| `03-sql-staging-standards.md` | SQL staging schema, stored procedures, error tables | Critical |
| `04-dataverse-standards.md` | Dataverse connector, entity mapping, batch size, throttling | Critical |
| `05-sftp-standards.md` | SFTP connection, file naming, archiving, PGP encryption | Critical |
| `06-security-standards.md` | Key Vault, managed identity, data masking, audit | Critical |
| `07-error-handling.md` | Retry policy, dead-letter, alerting, compensation | High |
| `08-testing-standards.md` | Test levels, data validation rules, test data management | High |
| `09-document-generation-rules.md` | Document formatting, section requirements, approvals | Medium |
| `10-alm-configuration.md` | ADO org/project settings, work-item hierarchy, field mappings | Critical |

## Constitution Override Order

Later files in this list can extend but not contradict earlier ones.
If a conflict exists, `CLAUDE.md` > numbered files in ascending order.
