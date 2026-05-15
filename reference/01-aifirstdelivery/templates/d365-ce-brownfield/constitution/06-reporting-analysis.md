# Reporting Analysis Rules

This file defines how the CE Brownfield agent documents reporting artifacts found in `input/reporting/`. Documentation follows Reporting agent standards. SSRS reports (`.rdl`) are D365 CE Reporting Services reports — they are **fully in scope** for the CE brownfield agent. Power BI artifacts are documented as-found; the Reporting agent is the implementation owner.

---

## Principle

The CE Brownfield agent is the **single documentation agent** for all artifacts. Reporting artifacts are documented here for completeness and traceability. The resulting documentation (`docs-generated/reporting/`) is:
- For SSRS reports: CE-native artifacts, fully documented and handed to the CE implementation agent.
- For Power BI reports: a handoff package for the Reporting agent's implementation work.

---

## Artifact Detection Signatures

| File/Pattern | Component Type | Domain Owner |
|---|---|---|
| `*.rdl`, `*.rdlc` | SSRS / Paginated report definition | CE agent (CE Reporting Services) |
| `*.rds` | SSRS shared data source | CE agent |
| `*.pbix` | Power BI Desktop report | Reporting agent |
| `*.json` matching Power BI dataset schema | Power BI dataset | Reporting agent |
| `*.pbit` | Power BI template file | Reporting agent |

---

## SSRS / RDL Documentation Rules

SSRS reports are CE Reporting Services reports — they are deployed to D365 CE and run in the context of the D365 CE user. Document them fully.

### For each `.rdl` file:

1. **Report Name** — derived from the RDL `Report` root element or file name.
2. **Data Sources** — `DataSource` elements: name, connection type (FetchXML / SQL / OData), connection string (masked if credentials present).
3. **Dataset Queries** — `DataSet` elements: name, query text (FetchXML or SQL stored procedure call), parameters.
4. **Report Parameters** — `ReportParameter` elements: name, data type, prompt text, default value, available values source.
5. **Report Items** — top-level visual elements: Tablix (table/matrix), TextBox, Subreport, Chart, Image.
   - For Tablix: number of columns, row groups, column groups, sort order.
   - For Subreport: referenced subreport name and parameter passing.
6. **Grouping and Sorting** — primary group expression; sort column and direction.
7. **Export Formats** — infer from report structure: typically PDF, Excel, Word.
8. **D365 CE Integration** — check if pre-filtering is enabled (look for `EnablePrefiltering="1"` in the DataSet query or report properties).
9. **Security** — which D365 CE security role grants access to this report (infer from report category or document note if not determinable).

### Flagging for SSRS

```
⚠ NEEDS REVIEW         Cannot determine the business purpose from file name alone
⚠ HARD-CODED CREDS     Connection string contains username/password
⚠ NO PRE-FILTERING     D365 CE report does not enable pre-filtering — users cannot apply additional filters
⚠ INLINE SQL           Report uses inline SQL instead of a stored procedure — maintenance risk
*(inferred)*            Business purpose inferred from report name or dataset query
*(from: filename.rdl)*  Content sourced from the RDL file
```

---

## Power BI (.pbix) Documentation Rules

Power BI binary files cannot be fully parsed without Power BI tooling. Document at an inventory level with what is determinable from the file and any accompanying metadata.

### What to Document for Each .pbix

1. **File Name** — use as the report name.
2. **File Size** — note as a proxy for dataset complexity.
3. **Metadata** — if a `.pbit` (template) or a companion `.json` exists, extract:
   - Report pages (tab names)
   - Data model table names (from model.json if present)
   - Measure names (if accessible)
4. **Inferred Data Sources** — from file naming conventions (e.g., `SalesReport-Dataverse.pbix` → Dataverse source *(inferred)*).
5. **Access Location** — where the file was found in the input folder.

### Flagging for Power BI

```
⚠ BINARY ONLY   .pbix file found but no .pbit or metadata JSON — limited extraction possible
*(inferred)*     Data source or report purpose inferred from file name
```

---

## Output Structure

```
docs-generated/reporting/
├── reporting-inventory.md         ← summary of all reports found
├── ssrs/{ReportName}.md           ← per-report detail for SSRS/RDL files
└── power-bi/{ReportName}.md       ← per-report inventory for Power BI files
```

### reporting-inventory.md Structure

```markdown
# Reporting Inventory

## SSRS / Paginated Reports (CE Reporting Services)

| Report Name | File | Data Source Type | Parameters | Pre-Filtering | Export Formats | Domain Owner |
|---|---|---|---|---|---|---|

## Power BI Reports

| Report Name | File | Size | Inferred Data Source | Notes | Domain Owner |
|---|---|---|---|---|---|
```

---

## Handoff Notes

At the top of `docs-generated/reporting/reporting-inventory.md`:

> **SSRS Reports:** These are D365 CE Reporting Services reports. Documentation is complete. The **CE implementation agent** is the owner for these reports — include them in the CE spec and plan.
>
> **Power BI Reports:** These reports were found in the solution. Documentation is a best-effort inventory based on available metadata. The **Reporting agent** is the implementation owner — provide this document as input to the Reporting agent's `/spec` workflow.
