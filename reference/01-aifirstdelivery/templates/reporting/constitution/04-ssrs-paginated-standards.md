# SSRS and Paginated Report Standards

## 1. Scope

This file covers:
- **SSRS Reports** (`.rdl`) deployed to D365 CE Reporting Services — operational reports embedded in D365 CE.
- **Power BI Paginated Reports** (`.rdl`) deployed to Power BI Premium/Fabric — pixel-perfect documents.

Both share the same `.rdl` file format and Report Builder tooling. The deployment target differs.

## 2. Report Structure

### Mandatory Report Sections

| Section | Content |
|---|---|
| Report Header | Report title, run date/time, applied parameter values, company logo |
| Report Body | Data regions (tables, matrices, lists) with grouping and sorting |
| Report Footer | Page number (Page N of M), data source name, classification label, contact |

### Parameter Design Rules
- Parameters must be ordered: date range → primary entity filter → secondary filters → display options.
- All date parameters must default to the current period (today, current month, current quarter — as appropriate).
- Multi-value parameters are permitted; "Select All" must be the default.
- Parameters must have descriptive labels — never expose technical field names to users.
- Cascading parameters are permitted for entity hierarchies (e.g., Region → Territory → Account).

## 3. Data Source and Dataset Design

- Each report must use a **shared data source** — not an embedded data source. Credentials are managed centrally.
- Datasets must use stored procedures or parameterised queries — no inline ad hoc SQL.
- Stored procedure names: `usp_Report_{ReportName}_{Purpose}` — e.g., `usp_Report_AccountStatement_Main`.
- Datasets must include only the columns used by the report — no `SELECT *`.
- Row-level filtering must be applied at the SQL/stored procedure level — not in the report filter expression.

## 4. Layout and Formatting

- Use tablix (table/matrix) data regions for structured data.
- Fixed-width columns: all column widths must be explicitly set — no auto-width.
- Text boxes: all text boxes must have overflow set to GrowDownOnly — never Overflow (clips content).
- Page breaks: use group-level page breaks; avoid orphaned rows at page boundaries.
- Colour: use named colour constants from the shared colour palette in the report design — never hard-code hex.
- Conditional formatting: document every conditional format expression in the report spec.

## 5. Grouping and Sorting

- Group rows must use a consistent group expression matching the parameter or filter.
- Sort order must be documented: default sort column, direction, and user-overridable sort (if applicable).
- Running totals and subtotals must use `RunningValue()` or group aggregates — not calculated fields.

## 6. D365 CE Integration (SSRS)

- Reports deployed to D365 CE must use the Fetch XML data source type — not direct SQL.
- Fetch XML queries must be generated from Advanced Find or the CRM SDK — not hand-crafted.
- Pre-filtering: enable pre-filtering on all D365 CE SSRS reports so user can apply additional filters from the entity record.
- Report categories: assign to the correct D365 CE report category (Account, Contact, Case, etc.).
- Security: D365 CE report access is controlled by security roles — document the required role in the spec.

## 7. Subscriptions and Delivery

- Subscriptions must be documented: recipient list, schedule, format (PDF / Excel), parameters applied.
- Data-driven subscriptions are permitted for reports where the recipient list is stored in Dataverse.
- Subscription credentials must use a service account — never a personal account.

## 8. Export Format Support

Every SSRS/Paginated report must support export to:
- PDF (mandatory)
- Excel (mandatory)
- Word (optional — only if explicitly required)
- CSV (optional — data extract reports only)

If a format is not supported due to layout complexity (e.g., merged cells prevent clean Excel export), document the limitation in the spec.
