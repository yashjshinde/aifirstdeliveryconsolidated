---
agent: reporting
sub-area: power-bi
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Power BI Standards

## Workspace + capacity

- One workspace per project (or per business area when multi-project).
- Premium capacity (P1/F-SKU) when datasets > 1 GB or RLS / incremental refresh / paginated reports are in scope.
- Sensitivity labels applied to every dataset + report (default `Internal`; `Confidential` for PII / financial detail).

## Naming

- Workspace: `ws-{project}-{env}` (e.g., `ws-acme-d365-prod`)
- Dataset: `ds-{domain}` (e.g., `ds-customer`, `ds-finance`)
- Dataflow: `df-{source-system}-{entity}` (e.g., `df-dataverse-account`)
- Report: `rep-{purpose}` (e.g., `rep-customer-aging`)
- Dashboard: `dash-{persona}-{purpose}`
- App: `app-{audience}` (e.g., `app-sales-team`)

## Modeling

- **Star schema** preferred; snowflake only when conformed dimensions cannot consolidate.
- Tables: PascalCase, singular (`Customer`, `Sale`, not `Customers`).
- Columns: PascalCase with spaces removed in source; display-name uses spaces.
- Measures: explicit naming, `Total Sales`, `Open Cases (90d)`.
- Calculation groups for time intelligence (avoid duplicating `YTD`, `QTD`, `MTD` measures per fact).

## Dataset modes

| Mode | When |
|---|---|
| Import | Default for ≤ 1 GB datasets needing fast UX |
| DirectQuery | Real-time freshness required AND source is performant |
| Composite | Import dims + DirectQuery facts for high-cardinality detail |
| Live Connection | Centralised model in a different workspace; consumer reports |

## RLS

- Roles defined per security model (region / branch / team).
- USERPRINCIPALNAME() bound to a security-mapping table on the dataset.
- Tested in Desktop with "View as" before publish.

## OLS

- Hide-by-default for any column carrying PII / financial detail; expose via OLS roles.
- OLS roles never overlap with RLS roles (different concerns; documented in TDD).

## Performance

Per [04-performance-and-refresh.md](04-performance-and-refresh.md):

- Refresh time target ≤ 30 min for any dataset
- Dataset size ≤ 1 GB compressed (Premium overrides for larger; document the override)
- Query reduction settings ON for slicers in DirectQuery composite models

## Bookmarks + navigation

- Reports with ≥ 3 pages MUST have a top-level navigation bookmark group
- Bookmarks named PascalCase (`Overview`, `DetailByRegion`, `Drillthrough`)

## Themes

- Project theme JSON committed under `output/reports/power-bi/themes/{project}.theme.json`
- WCAG AA contrast minimum

## App publishing

- `app-` prefix; audience scoped to a security group (no public link sharing)
- App release notes maintained per release in the app description

## See also

- [01-ce-ssrs-standards.md](01-ce-ssrs-standards.md)
- [03-data-sourcing.md](03-data-sourcing.md)
- [04-performance-and-refresh.md](04-performance-and-refresh.md)
- [05-multilingual.md](05-multilingual.md)
