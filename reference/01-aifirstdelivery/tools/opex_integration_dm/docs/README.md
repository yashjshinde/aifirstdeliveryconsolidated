# Opex Integration Framework — Documentation

User-facing documentation for analysts, engineers, and operators. For the architectural rationale read [`../reference/architectural-spec.md`](../reference/architectural-spec.md); for implementer-level depth read [`../detailed-design/`](../detailed-design/).

## Doc map by role

### **Mapping analyst** — author the source-to-target mapping
1. [Getting started](getting-started.md) — five-minute orientation.
2. [Authoring mappings](authoring-mappings.md) — Excel workbook conventions, alias files, what `validate-config` will complain about.

### **ADF engineer / build team** — implement and deploy
1. [Getting started](getting-started.md) — what the framework gives you.
2. [Tool reference](tool-reference.md) — every CLI command for `validate-config`, `excel_to_json`, `dataflow-codegen`.
3. [Deployment guide](deployment.md) — Phase 0 prereqs through one-command publish.
4. [Authoring waves](authoring-waves.md) — composing multiple entities into a scheduled load.

### **Operations / on-call**
1. [Operations guide](operations.md) — daily monitoring, manual runs, reprocess.
2. [Troubleshooting](troubleshooting.md) — top failure modes with diagnostic queries.

### **Dataverse admin** — prepare the target environment
1. [Deployment guide §Phase 0](deployment.md#phase-0--prerequisites) — the custom schema list you create once per environment.
2. [Architectural spec §8](../reference/architectural-spec.md) — the source-of-truth list of custom entities, attributes, option sets, and N:N relationships.

## Doc index

| File | Audience | Length |
| --- | --- | --- |
| [getting-started.md](getting-started.md) | All | Short |
| [authoring-mappings.md](authoring-mappings.md) | Analyst | Medium |
| [authoring-waves.md](authoring-waves.md) | Engineer | Medium |
| [tool-reference.md](tool-reference.md) | Engineer | Medium |
| [deployment.md](deployment.md) | Engineer + DV admin | Long |
| [operations.md](operations.md) | Ops | Medium |
| [troubleshooting.md](troubleshooting.md) | Ops + Engineer | Medium |

## Related (outside this folder)

| Where | What |
| --- | --- |
| [`../README.md`](../README.md) | Repository root — top-level project overview |
| [`../implementation.md`](../implementation.md) | Live build tracker; tick boxes as Phase 0 prereqs close |
| [`../reference/architectural-spec.md`](../reference/architectural-spec.md) | Architectural / functional specification — the why |
| [`../detailed-design/`](../detailed-design/) | Implementer-level design — JSON schemas, ADF pipeline DAGs, error catalog |
| (n/a) | The three Python tools — all docs are in [`tool-reference.md`](tool-reference.md) |
| (n/a) | Bicep + deploy script — all docs are in [`deployment.md`](deployment.md) |

## Conventions used across these docs

- **Commands** are shown for Windows PowerShell (the project's primary environment). Most have a near-identical bash form; substitute `py -3` with `python3`.
- **Paths** are written relative to the repo root unless noted.
- **`<placeholders>`** in angle brackets are values you fill in.
- **Inline-code names** like `pl_wave_orchestrator` map to a real file (here, `adf/pipelines/pl_wave_orchestrator.json`).
- **Section refs** like *spec §3.2.6* point to numbered sections of `reference/architectural-spec.md`.
