# Getting started

A 5-minute orientation. After this you know what the framework does and where to look next.

## What this is

A metadata-driven integration framework on **Azure Data Factory**. You author the source-to-target mapping in a structured Excel workbook (or JSON directly); the framework moves data between **SFTP files** and **Microsoft Dataverse / Dynamics 365** in either direction, with type validation, dedup, lookup resolution, N:N association, and multi-entity dependency ordering.

You **never** edit pipeline code to onboard a new entity — you add a new JSON config and the pipelines pick it up.

## The 30-second mental model

```
   .xlsx workbook          (analyst edits this)
        │
        │ excel-to-json          (Python CLI)
        ▼
   /config/entities/*.json
   /config/waves/*.json
   /config/aliases/*.json
        │
        │ validate-config         (Python CLI; CI gate)
        │ dataflow-codegen        (Python CLI; emits ADF Data Flow ARM JSON)
        ▼
   /adf/  + /config/  + /infra/
        │
        │ infra/deploy.ps1        (Bicep + ADF publish in one command)
        ▼
   Running Azure Data Factory with scheduled waves
```

The three Python tools run locally with no Azure subscription required. Deployment is one PowerShell command.

## Tour of the repo

| Folder | What's inside |
| --- | --- |
| [`/config/`](../config/) | Live framework configuration — the entity mappings, wave definitions, alias files, and JSON Schemas they validate against |
| [`/adf/`](../adf/) | Azure Data Factory artifacts — 16 pipelines, 5 datasets, 4 linked services, 4 data flows, 1 trigger |
| [`/tools/`](../tools/) | Three Python packages: `excel_to_json`, `validate-config`, `dataflow-codegen` |
| [`/infra/`](../infra/) | Bicep modules + `deploy.ps1` for provisioning + publishing |
| [`/detailed-design/`](../detailed-design/) | Implementer-level design (read once when you start building, reference later) |
| [`/reference/`](../reference/) | Architectural spec + original requirements docs + estimation workbook |
| [`/docs/`](.) | User-facing documentation (you are here) |
| [`/implementation.md`](../implementation.md) | Live build tracker — phase status, bug log, open questions |

## First 15 minutes — install + verify

```powershell
# from repo root

# 1. Install the three Python tools (one-time, ~30s)
py -3 -m pip install -e tools/validate-config
py -3 -m pip install -e tools/excel_to_json
py -3 -m pip install -e tools/dataflow-codegen

# 2. Verify configs are valid
py -3 -m validate_config config
# Expected: 0 error(s), 7 warning(s)

# 3. Regenerate the ADF Data Flows from configs (proves the codegen works)
py -3 -m dataflow_codegen --config-root config --out-dir adf/dataflows/generated
# Expected: wrote 3 files

# 4. Inspect the generated artifacts
Get-ChildItem adf -Recurse -Filter *.json | Measure-Object | Select-Object Count
# Expected: 23 (linked services + datasets + dataflows + pipelines + trigger)
```

If all four steps succeed, the framework is functional locally. The Azure deployment is the next chapter — see [deployment.md](deployment.md).

## What to read next

Pick by role:

- **You're an analyst:** [authoring-mappings.md](authoring-mappings.md).
- **You're an engineer:** [tool-reference.md](tool-reference.md) → [deployment.md](deployment.md).
- **You're on-call:** [operations.md](operations.md) → [troubleshooting.md](troubleshooting.md).
- **You're the Dataverse admin:** [deployment.md §Phase 0](deployment.md#phase-0--prerequisites).
- **You're the framework maintainer:** [`../detailed-design/`](../detailed-design/) plus the audit at the bottom of [`../implementation.md`](../implementation.md).

## When in doubt

The single source of architectural truth is [`../reference/architectural-spec.md`](../reference/architectural-spec.md). Every doc in this folder is meant to be a practical lens onto that spec — if the docs and the spec ever disagree, the spec is canonical and the doc is a bug.
