<!--
reporting.template.md - SCAN TEMPLATE for the reporting platform.
Consumed by /scan. Drives brownfield-engine/extractor.ts.
-->
---
platform: reporting
scan-version: 1.0.0
consumed-by: brownfield-engine/extractor.ts
last-reviewed: 2026-05-15
---

# Scan Template — reporting

## Pre-flight (`/prepare`)

- `_brownfield/input/reporting/` exists
- At least one `.pbix` / `.pbip` / `.rdl` / workspace metadata JSON

## Extraction walk (`/scan`)

### Step 1 — PBIX / PBIP walk

For each `.pbix`:
- If companion `.pbip` folder present → use PBIP source-format
- Else → `pbi-tools extract <pbix>` to a working folder (if available); else inventory-level only + `BLOCKED-BY-BINARY` gap

For each PBIP folder:

```
<name>.Dataset/                              -> pbi-dataset
  model.tmdl                                 -> tables / columns / measures (TMDL parser)
  database.tmdl                              -> dataset properties
  tables/*.tmdl                              -> per-table TMDL
<name>.Report/
  report.json                                -> pbi-report
  pages/*.json                               -> page list, visual list
```

Walk RLS roles from TMDL: `roles[].filter` per table -> `pbi-rls-role` per role.
Walk OLS perspectives from TMDL: `perspectives[]` -> `pbi-ols-rule`.

### Step 2 — RDL walk (CE SSRS)

For each `.rdl`:

```
parse: <DataSets>/<DataSet>/<Query>/<CommandText>    -> verbatim SQL
parse: <ReportParameters>/<ReportParameter>          -> parameter list
parse: <Body>/<ReportItems>/                         -> report structure (Tablix / Matrix / Chart hierarchy)
```

Emit `ssrs-report` per RDL. Per-dataset SQL captured verbatim (enforced by `validate_ssrs_sql`).

### Step 3 — Workspace metadata

For each workspace JSON dump:

```
parse: workspace.{id,name,type,state}            -> pbi-workspace
parse: workspace.datasets[]                      -> attach to dataset artefacts (when matched by id)
parse: workspace.reports[]                       -> attach to report artefacts
parse: workspace.dashboards[]                    -> pbi-dashboard
parse: workspace.apps[]                          -> pbi-app
parse: workspace.dataflows[]                     -> pbi-dataflow-gen1 / -gen2 (by API kind)
parse: workspace.paginated-reports[]             -> pbi-paginated-report
```

### Step 4 — Dataflow walk

For each dataflow definition:

```
parse: pq:document/section/items[]/source[]      -> M source code (verbatim) per entity
parse: dataflow.{name,description,refresh-schedule} -> dataflow metadata
```

Distinguish Gen1 vs Gen2 by file shape: Gen1 emits `<name>.json` with `pq` document; Gen2 emits Power Query M project format under a folder.

### Step 5 — SSRS subscriptions + snapshots

```
walk: subscriptions XML export                  -> ssrs-subscription
walk: snapshots metadata                        -> ssrs-snapshot
```

### Step 6 — Composite-model + Incremental-refresh policies

```
parse: dataset.tmdl for `dataAccessOptions.incrementalRefresh: true` -> incremental-refresh-policy
parse: dataset references multiple data sources -> composite-model when DirectQuery + Import mixed
```

### Step 7 — Sensitivity labels + Data gateways

```
parse: workspace dump for sensitivity labels per artefact -> sensitivity-label
parse: workspace dump for gateway clusters             -> data-gateway
```

### Step 8 — Synapse Link config

```
walk: Synapse Link config JSON (when exported)  -> synapse-link-config
```

### Step 9 — Validate inventory coverage

`validate_inventory_coverage` against `inventory.platforms.reporting`.

## Output schema

Conforms to [`schemas/brownfield-inventory.v1.json`](../../../schemas/brownfield-inventory.v1.json).

## See also

- [`constitution/platforms/reporting.md`](../../constitution/platforms/reporting.md)
- [`templates/bindings/reporting/`](../bindings/reporting/)
