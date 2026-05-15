# Power BI Standards

## 1. DAX Standards

### Measure Formatting
- All measures must use explicit `CALCULATE()` wrappers when filters are modified — never rely on implicit filter context changes.
- Measures must include a `VAR` block for any expression used more than once.
- Every measure must be formatted using DAX Formatter conventions (line breaks after each function argument).
- Measure names must be unique across the model. Prefix with business area if needed: `[Sales Total Revenue]`, `[HR Headcount Active]`.

### Forbidden Patterns
- `COUNTROWS(FILTER(...))` — replace with `CALCULATE(COUNTROWS(...), <filter>)`.
- `SUMX` over a large table where `SUM` over a pre-aggregated column suffices.
- Time intelligence functions on a non-marked Date table.
- `ALL()` without a clear reason documented in a measure comment.
- Circular dependencies — always validate before publishing.

### Required Measures (every dataset)
Every dataset must define at minimum:
- A count measure for each fact table: `[{FactTable} Count]`
- A last-refresh measure: `[Last Refresh UTC]` using `MAX('Date'[Date])` or a dedicated refresh metadata table.

## 2. Workspace Organisation

### Workspace Naming
`{Project}-{Environment}` — e.g., `SalesProject-DEV`, `SalesProject-UAT`, `SalesProject-PROD`.

### Workspace Structure
Each project uses three workspaces (DEV / UAT / PROD). Deployment pipelines connect them in order.

### Dataset Certification
- Datasets promoted to UAT must be flagged as **Promoted**.
- Datasets released to PROD must be flagged as **Certified** by the data owner.
- Reports must reference certified datasets — never embed data directly in a PBIX if a shared dataset exists.

## 3. Dataflow Standards

- Use dataflows for data transformation and staging that is reused across multiple datasets.
- Dataflows must be in a dedicated workspace separate from report workspaces.
- Dataflow refresh must complete before dataset refresh — configure dependency refresh in Power BI Service.
- Incremental refresh: enable for all dataflow tables > 5M rows with a stable date column.

## 4. Report Publishing and Embedding

### Publishing Rules
- Never publish PBIX directly from Power BI Desktop in production — always use the deployment pipeline.
- PBIX files must be stored in source control (Git). Use `.pbix` for small reports; for large models use Tabular Model Definition Language (TMDL) files committed to Git.
- Connection strings must be parameterised — never hardcoded.

### Embedding in D365 CE / Power Apps
- Use Power BI visual in Model-Driven App forms/dashboards — requires Dataverse connector.
- Canvas App embedding: use Power BI tile control — report must be published to a workspace the app service principal can access.
- Never embed a report that uses personal OAuth credentials — always use service principal.

## 5. Incremental Refresh

Enable incremental refresh when:
- Fact table > 10M rows, AND
- A reliable `Date` column is available for partitioning.

Configure: 3 years archive + 7 days incremental window (adjust to project requirements in `10-alm-configuration.md`).

## 6. Performance Optimisation Rules

| Rule | Detail |
|---|---|
| Avoid high-cardinality columns in visuals | Never use GUID or raw ID fields as slicer or filter targets |
| Reduce model columns | Import only columns used by visuals or measures — no "just in case" columns |
| Use aggregation tables for large DirectQuery fact tables | Define aggregation at Month/Category level minimum |
| Disable auto date/time | Turn off Power BI Desktop auto date/time — use the explicit Date dimension |
| Reduce cross-filter complexity | Limit bidirectional relationships; prefer explicit `CROSSFILTER()` in measures |
