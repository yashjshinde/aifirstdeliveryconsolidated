# Opex Integration Framework — Detailed Design

Implementer-ready design for the integration framework specified in the architectural spec:
[../reference/architectural-spec.md](../reference/architectural-spec.md)

## Documents in this folder

| File | Covers | Primary audience |
| --- | --- | --- |
| [01-config-schemas.md](01-config-schemas.md) | JSON Schemas for every config file (project, entity-mapping, wave, alias-file); the rule catalog enforced by `tools/validate-config`. | Mapping authors, validate-config implementer |
| [02-pipelines-and-dataflows.md](02-pipelines-and-dataflows.md) | Every ADF pipeline as an activity DAG with parameter contracts, expressions, and retry policy; every Mapping Data Flow with its expression library per transform type. | ADF engineer |
| [03-error-model-and-runbook.md](03-error-model-and-runbook.md) | Error code catalog with severities; error-row schemas for every sidecar parquet; retry/backoff semantics; restart-from-checkpoint procedure; operations runbook for common failure scenarios. | Build team + Ops on-call |

## Out of scope this iteration

- **Deployment / Bicep / CI-CD pipelines** — covered in a future doc once the build team is ready.
- **Network topology and resource provisioning** (Key Vault, ADLS, ADF instance, SHIR) — assumed to exist; only the integration-framework consumers are designed here.
- **Power BI dashboards** over `/audit/run_history.parquet` — operational nice-to-have, not in critical path.
- **Multi-tenant / multi-environment config isolation** beyond what `_project.json` allows.

## Conventions used in all three docs

| Convention | Value |
| --- | --- |
| **JSON Schema dialect** | draft 2020-12 (`$schema: "https://json-schema.org/draft/2020-12/schema"`) |
| **ADF artifact format** | `Microsoft.DataFactory/factories/{...}` ARM resource, API version `2018-06-01` |
| **Linked-service references** | `{ "referenceName": "ls_xxx", "type": "LinkedServiceReference" }` |
| **Parameter binding** | `@pipeline().parameters.X`, `@activity('Step').output.Y`, `@dataset().Z` |
| **`runId`** | The ADF `pipeline().RunId` string (GUID); the cross-pipeline correlation key |
| **`waveRunId`** | Same shape; generated once by `pl_wave_orchestrator` and propagated to each child entity orchestrator |
| **Time** | All stored timestamps are UTC ISO-8601 (`yyyy-MM-ddTHH:mm:ssZ`) |
| **Paths** | ADLS Gen2 paths are absolute from the integration container root, e.g. `/raw/customer/<runId>/data.parquet` |
| **Encoding** | UTF-8 without BOM for all JSON files |
| **Line endings** | LF in source-controlled artifacts; CRLF tolerated in CSV file deliveries |

## Cross-references to the architectural spec

The three docs reference spec sections as **§N.M.P**. Section map at the time of writing:

| Spec section | Subject |
| --- | --- |
| §2 | Config model overview (entity mapping shape) |
| §3 | Transform library + lookup deep-dive + alias / synonym handling |
| §4 | Per-entity pipelines (catalog + intent) |
| §5 | Multi-entity wave orchestration |
| §6 | Operational concerns (retry, notifications, checkpoint) |
| §10 | Verification plan |
| §12 | Bidirectional considerations |

The detailed design **does not duplicate** the architectural intent — it only specifies the implementation. If a passage assumes context, read the spec section first.

## Reading order for a new implementer

1. Skim the **architectural spec** §1, §2, §3 (one-time orientation, ~30 min).
2. Read **01-config-schemas.md** end-to-end — every other doc references the schemas it defines.
3. Read **02-pipelines-and-dataflows.md** along with the schemas open in another tab; parameter names and expression bindings only make sense together.
4. Read **03-error-model-and-runbook.md** when you start coding the error-handling paths and again when first taking the system on-call.

## File status

| Doc | Status | Last revised |
| --- | --- | --- |
| README.md | Initial draft | 2026-05-13 |
| 01-config-schemas.md | Initial draft | 2026-05-13 |
| 02-pipelines-and-dataflows.md | Initial draft | 2026-05-13 |
| 03-error-model-and-runbook.md | Initial draft | 2026-05-13 |
