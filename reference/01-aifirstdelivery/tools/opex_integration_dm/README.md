# Opex Integration Framework

A **configurable, metadata-driven integration and data-migration framework** that moves data between SFTP-hosted CSV/Excel files and Microsoft Dataverse / Dynamics 365, built on **Azure Data Factory (ADF)**.

Direction-agnostic (inbound + outbound), entity-agnostic (onboard a new entity = a new JSON config), wave-aware (multi-entity dependency ordering with shared run identity).

## Where to start

| Your role | Start here |
| --- | --- |
| **First-time visitor** | [`docs/getting-started.md`](docs/getting-started.md) |
| **Mapping analyst** | [`docs/authoring-mappings.md`](docs/authoring-mappings.md) |
| **ADF engineer / build team** | [`docs/tool-reference.md`](docs/tool-reference.md) → [`docs/deployment.md`](docs/deployment.md) |
| **Operations / on-call** | [`docs/operations.md`](docs/operations.md) → [`docs/troubleshooting.md`](docs/troubleshooting.md) |
| **Dataverse admin** | [`docs/deployment.md` §Phase 0](docs/deployment.md#phase-0--prerequisites) |
| **Framework maintainer** | [`detailed-design/`](detailed-design/) + [`implementation.md`](implementation.md) |

Full doc index: [`docs/README.md`](docs/README.md). Build progress and bug log: [`implementation.md`](implementation.md).

## Project state

- **Build status:** Phases 1–3, 5, 6 complete. Phase 4 (verification) runs after Azure deploy. Phase 0 (prereqs) is real-world admin work.
- **Tests:** 34/34 passing across `validate-config`, `excel_to_json`, `dataflow-codegen`.
- **Artifacts:** ~50 files across `adf/`, `config/`, `infra/`, `tools/`, all JSON-valid.
