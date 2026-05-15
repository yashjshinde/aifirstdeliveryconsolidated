# ALM Configuration — Data Migration

> **Project-wide settings** (ADO connection, work item type names, field mapping, priority mapping,
> status mapping) are defined once in `../../alm-configuration.md`.
> Do not duplicate those settings here — configure only the domain-specific overrides below.

---

## Requirement Intake Mode

```
requirement-intake: structured
```

| Value | When to use |
|---|---|
| `unstructured` | Requirements are plain-language descriptions. Use `/spec` to write the migration specification from scratch. `/plan` generates a full L1/L2/L3 + Task breakdown. |
| `structured` | Migration requirements already exist as L1/L2/L3 work items in your ALM tool. Use `/spec-alm` to enhance existing items into a full specification. `/plan` generates Task-level items only — the L1/L2/L3 hierarchy is NOT recreated. |

Change `requirement-intake` to `structured` when your project team manages the work-item hierarchy
directly in the ALM tool and migration stories arrive pre-broken-down.

---

## L3 Intake Mode

Only applies when `requirement-intake: structured`. Controls whether L3 (User Story) work items are mandatory from the ALM tool or may be absent/partial.

```
l3-intake: optional
```

| Value | When to use |
|---|---|
| `required` | Default. All L3 work items must be provided in the ALM input. `/spec-alm` stops if any L2 has no L3 items. `/plan` generates Task items only — no new L3 created. |
| `optional` | L3 may be absent or partially provided. `/spec-alm` accepts L1/L2 input without L3 and marks gaps as pending. `/plan` generates new L3 stories for any L2 with no ALM coverage, then generates Tasks under all L3s (ALM-provided and generated). |

`l3-intake` is ignored when `requirement-intake: unstructured`.

---

## Default Area and Iteration

Override the root defaults for data migration workstreams if your project uses a dedicated area:

```yaml
defaults:
  area_path: "{project}\\DataMigration"
  iteration_path: "{project}\\DataMigration\\Sprint 1"
  tags: "data-migration"
```

---

## Component Type Tags

Use these tags on User Stories and Tasks to classify the migration component:

| Tag | Component |
|---|---|
| `adf:pipeline` | ADF Pipeline definition |
| `adf:dataset` | ADF Dataset definition |
| `adf:linkedservice` | ADF Linked Service definition |
| `adf:dataflow` | ADF Data Flow definition |
| `adf:trigger` | ADF Trigger definition |
| `sql:schema` | SQL DDL (tables, schemas) |
| `sql:procedure` | SQL Stored Procedure |
| `sql:migration` | SQL migration script |
| `infra:keyvault` | Key Vault secrets configuration |
| `infra:network` | Network / firewall rules |
| `test:sit` | System Integration Test case |
| `test:uat` | UAT test case |
| `doc:mapping` | Field mapping document |
| `doc:pipeline` | Pipeline design document |

---

## Migration Configuration

```yaml
migration:
  # Active migration direction — one of:
  # SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP | SQL_TO_DATAVERSE | DATAVERSE_TO_SQL | SFTP_TO_SQL | SQL_TO_SFTP
  direction: "SFTP_TO_DATAVERSE"

  # Source system identifier
  source_system: "legacy-erp"

  # Target system identifier
  target_system: "dynamics365"

  # Environment identifiers
  environments:
    dev:   "{your-dev-env-url}"
    test:  "{your-test-env-url}"
    prod:  "{your-prod-env-url}"

  # Batch size overrides per entity (leave empty to use defaults)
  batch_overrides: {}

  # Staging database
  staging_db:
    server: "{your-sql-server}.database.windows.net"
    database: "{your-staging-db}"
    schema: "stg"
    error_schema: "err"
    audit_schema: "audit"

  # SFTP server
  sftp:
    host: "{your-sftp-host}"
    port: 22
    username: "{service-account}"

  # ADF instance
  adf:
    resource_group: "{your-resource-group}"
    factory_name: "{your-adf-name}"
    location: "{your-azure-region}"
```

---

## Brownfield Mode

Set `brownfield.enabled: true` when migrating INTO an existing Dataverse environment that already has data.
`docs-path` points to the brownfield agent's `docs-generated/` folder.
Default assumes both template and brownfield agent live under `templates/`.

```yaml
brownfield:
  enabled: false
  docs-path: ../../d365-ce-brownfield/docs-generated
  impact_required: true
```

When brownfield is enabled:
- `/spec` reads the entity catalogue and component inventory from `docs-path` before specifying source-to-target mappings; adds §14 Brownfield Context.
- `/impact` is required before `/plan`; must address: duplicate detection strategy, existing record treatment (skip/update/error), field-level mapping conflicts.
- `/plan` cannot proceed until `/impact` is IMPACT-ASSESSED.
- `/task` reads existing entity docs for fields already in the target Dataverse environment; distinguishes net-new fields from existing ones in the task card.
