# Data Model Standards

## 1. Star Schema is Mandatory

All Power BI datasets must follow a star schema:
- **Fact tables**: transactional, high row count, numeric measures, foreign keys only.
- **Dimension tables**: descriptive, low-to-medium row count, all filter/group-by attributes.
- **Bridge tables**: only for many-to-many relationships — document the business justification.
- Snowflake schemas are not permitted. Flatten dimensions at the data model layer.

Never use a flat denormalised table as the sole dataset table. This makes RLS, measures, and performance unmanageable.

## 2. Storage Mode Selection

| Scenario | Recommended Mode | Rationale |
|---|---|---|
| Data volume < 1 GB, daily refresh sufficient | Import | Best performance; full DAX support |
| Real-time data required, data volume > 1 GB | DirectQuery | Live data at query cost; avoid for complex DAX |
| Mix of large live tables + small dimensions | Composite (Mixed) | Live fact + cached dimensions; requires careful design |
| Power BI Embedded, ISV scenario | Import preferred | Predictable performance; DirectQuery adds per-query latency |

Flag any DirectQuery model with tables > 50M rows as ⚠ PERFORMANCE RISK — requires aggregation tables.

## 3. Relationship Design

- All relationships must be single-direction (one-to-many) unless bidirectional is explicitly justified and documented.
- Bidirectional relationships must be flagged with a comment explaining why.
- Role-playing dimensions (e.g., Order Date, Ship Date, Due Date from a single Date table) must use inactive relationships activated via `USERELATIONSHIP()` in measures — not separate copies of the dimension.
- A single `Date` dimension table is mandatory for all time-based analysis. Never use date columns from fact tables directly in slicers.

## 4. Date Table Requirements

Every dataset must contain a single `Date` dimension table:
- Contiguous date range: minimum 5 years back, 2 years forward from current date.
- Marked as a Date Table in Power BI.
- Columns: Date, Year, Quarter, Month, Month Number, Week, Day, Day of Week, Is Weekend, Is Working Day, Financial Year (if applicable), Financial Quarter (if applicable).
- No gaps in the date sequence.

## 5. Table and Column Naming

- Table names: PascalCase, singular noun, no spaces (`SalesOrder`, `ProductCategory`).
- Column names: Title Case with spaces (`Order Date`, `Customer Name`).
- Measure table: create a dedicated measure table named `_Measures` (prefix underscore to sort to top). All measures live here — not in fact or dimension tables.
- Hidden columns: columns used only for relationships or RLS should be hidden from report view.

## 6. Measures vs Calculated Columns

- **Measures**: all aggregations and KPIs must be measures. Never use a calculated column where a measure is sufficient.
- **Calculated columns**: only for values that are genuinely row-context dependent and cannot be computed in the source query (e.g., text concatenation for display labels).
- Avoid calculated columns on large fact tables — they inflate model size.

## 7. Data Source Connection

- All data source credentials must be stored in a Key Vault or Power BI gateway credential store — never in the PBIX file.
- Dataverse / D365 CE connections: use the Power BI Dataverse connector with service principal authentication.
- SQL connections: use a named service account with read-only access to the reporting database.
- SFTP / file sources: use a certified dataflow to stage data before connecting the dataset.

## 8. Model Size Limits

| Threshold | Action Required |
|---|---|
| Dataset > 1 GB (Import) | Investigate column pruning, aggregation tables, or move to Composite mode |
| Dataset > 10 GB | Premium capacity or Fabric required — flag as ⚠ PERFORMANCE RISK |
| Single table > 100M rows (DirectQuery) | Aggregation table mandatory |
| Calculated column on table > 10M rows | Flag as ⚠ PERFORMANCE RISK — push calculation to source |
