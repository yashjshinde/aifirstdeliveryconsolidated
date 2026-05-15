---
agent: brownfield
sub-area: platforms/reporting
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Platform Rules — reporting (brownfield)

## Accepted input file types

Under `_brownfield/input/reporting/`:

| Input | Format | Notes |
|---|---|---|
| Power BI desktop file | `.pbix` | Binary; preferred analysis via `pbi-tools extract` or PBIP source format |
| Power BI project | `.pbip` folder | Source-format export (PBIR for report, TMDL for dataset) — preferred when available |
| Dataflow definitions | `.json` (Gen1) / `.json` (Gen2 Power Query M) | Exported from Power BI Service or Fabric |
| RDL files | `.rdl` | CE SSRS report definitions; XML-based |
| SSRS subscriptions / snapshots | XML exports from SSRS catalog | When migrating SSRS surface |
| Workspace metadata | Power BI REST API JSON dump | Optional supplementary detail (RLS roles, sensitivity labels, refresh schedule) |
| Theme JSON | `.json` | Power BI report themes |

## Scan strategy

1. For each `.pbix`:
   - If PBIP companion folder present → analyse PBIP (TMDL for dataset; PBIR for report)
   - Else → use `pbi-tools extract <pbix>` to produce a working folder; if not available, inventory-level only + `BLOCKED-BY-BINARY` gap
2. For each `.pbip` folder:
   - Walk `<name>.Dataset/` → tables / columns / measures / RLS roles / OLS perspectives (TMDL files)
   - Walk `<name>.Report/` → pages / visuals / bookmarks (PBIR JSON)
3. For each `.rdl`:
   - Parse XML → datasets (verbatim `<CommandText>` per dataset), parameters, report items, grouping, expressions
4. For workspace metadata JSON: enumerate workspaces + apps + datasets + reports + dashboards
5. For dataflow definitions: enumerate entities + M code per entity

## Module detection signals (reporting side)

No module gating at the reporting platform level — reporting artefacts are always analysed when present.

## Analysis rules

### Power BI datasets

- Tables: name + storage mode (Import / DirectQuery / Dual) + row count if available
- Columns: name + data type + format + hidden + description
- Measures: name + DAX expression (verbatim)
- Relationships: from / to / cardinality / cross-filter direction
- RLS roles: name + DAX filter expression per table
- OLS roles: name + hidden columns per table

### Power BI reports

- Pages: page list with display order
- Visuals: type + bound fields (measures / columns) + slicer / filter state
- Bookmarks: name + page + visual state
- Drill-throughs + drill-up
- Theme reference

### Dataflows (Gen1 / Gen2)

- Entities: schema + M code (verbatim)
- Linked entities (Gen2 lakehouse)
- Refresh policy

### CE SSRS reports (RDL)

- Datasets: name + data source + `<CommandText>` **verbatim** (enforced by `validate_ssrs_sql`)
- Parameters: name + data type + default + visibility
- Report body: groupings + sections (textbox / matrix / tablix / chart hierarchy)
- Expressions: per-cell expression body verbatim when non-trivial

### Subscriptions / snapshots

- Schedule + recipients (mailbox / SharePoint / file share)
- Snapshot retention policy

### Apps + sensitivity labels + workspaces

- Workspace permissions matrix
- App audience + entitled security groups
- Per-artifact sensitivity label

## Cross-references for reporting

- report ↔ dataset (report binds to dataset by id)
- dataset ↔ dataflow (composite-model / staged refresh)
- dataset ↔ source-system (CE entity / F&O data entity / Synapse Link table)
- rls-role ↔ dataset.tables
- app ↔ reports + dashboards in published-set

## SQL handling (CE SSRS specific)

Critical: `<CommandText>` content is quoted verbatim. `validate_ssrs_sql` enforces this — any paraphrasing or summarising of the SQL triggers a retry with the raw SQL re-injected.

## See also

- [04-input-file-types-base.md](../04-input-file-types-base.md)
- [`templates/bindings/reporting/`](../../templates/bindings/reporting/)
- [`templates/scan/reporting.template.md`](../../templates/scan/reporting.template.md)
