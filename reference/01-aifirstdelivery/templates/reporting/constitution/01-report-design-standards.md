# Report Design Standards

## 1. Layout Principles

### Power BI Interactive Reports
- Canvas size: 1280 × 720 px (16:9) for dashboards; 1280 × 960 px for detailed reports.
- Maximum 8 visuals per report page. Consolidate KPIs to a summary page.
- Every page must have a title, last-refresh timestamp, and filter context label.
- Use bookmarks for navigation between views; avoid excessive tabs (max 8 tabs per report).
- Tooltips must be informative — never show raw IDs or GUID fields to end users.

### Power BI Paginated Reports
- Use A4 or Letter page size unless the report is explicitly a wide-format ledger.
- Header must contain: report title, run date/time, applied filters, page number (Page N of M).
- Footer must contain: data source, classification label, contact email.
- Group headers must repeat on page break. No orphaned group rows.
- Subreports are permitted; nested subreports (subreport within a subreport) are not.

### SSRS Reports
- Follow the Paginated standards above.
- Report parameters must be ordered: date range first, then entity filters, then optional filters.
- Default values must be set for all parameters where possible.
- Reports must support export to PDF and Excel. Word export is optional.

## 2. Visual Standards (Power BI)

| Visual Type | Permitted Use | Restrictions |
|---|---|---|
| Bar / Column chart | Comparisons across categories | Max 20 categories without scrolling |
| Line chart | Trends over time | Always show data labels on final point |
| Card / KPI visual | Single metric summary | Always include comparison period |
| Table / Matrix | Detailed data with drill | Max 15 columns visible without horizontal scroll |
| Scatter chart | Correlation analysis | Must label axes clearly |
| Map visual | Geographic distribution | Must have data classification label; no PII on maps |
| Custom visual (AppSource) | Approved list only | Must be certified by Microsoft — no uncertified visuals |
| AI visuals (Q&A, Decomposition Tree) | Exploratory reports only | Not permitted in operational/production dashboards |

## 3. Naming Conventions

| Artefact | Convention | Example |
|---|---|---|
| Report file (PBIX) | `{Project}-{Domain}-{ReportName}.pbix` | `Proj-Sales-PipelineDashboard.pbix` |
| Dataset / Semantic model | `{Project}-{Domain}-Dataset` | `Proj-Sales-Dataset` |
| Dataflow | `{Project}-{Domain}-Dataflow` | `Proj-Sales-Dataflow` |
| RDL file | `{Project}_{ReportName}.rdl` | `Proj_AccountStatement.rdl` |
| Measure | `[Measure Name]` with Title Case, no underscores | `[Total Revenue YTD]` |
| Calculated column | descriptive name, no abbreviations | `Customer Full Name` |
| Table (imported) | PascalCase, singular noun | `SalesOrder`, `CustomerAccount` |

## 4. Colour and Branding

- Use the project theme JSON file (`output/{feature}/theme.json`) for all Power BI reports.
- If no project theme exists, use the Microsoft default Fluent theme.
- Never hard-code hex colours in individual visuals — always use theme colours.
- Accessibility: all charts must pass WCAG AA contrast ratio (4.5:1 minimum).

## 5. Report Documentation Requirement

Every report in the catalogue must be documented with:
- Report name, type, and purpose
- Target audience and personas
- Data sources and refresh schedule
- Complete list of pages/tabs with purpose
- All measures and their business definitions
- Filter and slicer inventory
- RLS roles and rules
- Export formats supported
