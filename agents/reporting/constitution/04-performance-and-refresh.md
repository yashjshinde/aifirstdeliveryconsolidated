---
agent: reporting
sub-area: performance-and-refresh
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Performance and Refresh Standards

## Dataset size targets

- Compressed Import dataset ≤ 1 GB (default).
- Premium overrides documented in TDD with justification.
- Large model (>10 GB) requires Premium per User minimum P1 capacity.

## Refresh strategy

| Pattern | When |
|---|---|
| **Scheduled refresh** | Default; 1-8 refreshes/day per Premium; per `project.config.yaml reporting.dataset.refresh.frequency` |
| **Incremental refresh** | Dataset > 50 M rows OR refresh window > 30 min |
| **DirectQuery** | Real-time required; user count < 100 concurrent |
| **Composite** | Mix of fresh (DQ) facts with stable (Import) dims |

## Incremental refresh policy

- `RangeStart` / `RangeEnd` parameters present in M code
- Partition: store ~24 months of historical; refresh last 7 days
- Detect data changes ENABLED to skip already-refreshed partitions
- Sample dataset to test before publish

## Refresh windows + blackouts

- Default refresh: Mon-Fri 06:00 + 12:00 + 18:00 (per `project.config.yaml reporting.dataset.refresh.frequency`)
- Blackouts per `project.config.yaml reporting.dataset.refresh.windows` (e.g., quarter-end close, year-end cutover)
- Failures alert via Power BI Service email + Teams webhook

## Query reduction settings

For DirectQuery + composite:

- Slicer / filter "Apply" buttons ON
- Single-page filter pane (avoid per-visual filter cards)
- Drill-through pages explicit (do not require full-page DirectQuery scan)

## Aggregations

- For multi-billion-row tables, define dual storage mode + agg tables
- Agg tables refreshed incrementally; user-facing visuals hit agg first

## Monitoring

- Per-dataset refresh history dashboard (operations team)
- Alerts:
  - `refreshDurationMin > targetRefreshDurationMin * 1.5` for 2 consecutive refreshes
  - `refreshOutcome = failed` (instant alert)
  - `dataset size > target * 0.9` (weekly)

## DAX hygiene

- Avoid early-evaluation in measures (no `FILTER(table, ...)` when `CALCULATE(..., column = X)` works)
- Variables (`VAR`) used for repeated sub-expressions
- Time-intelligence via calculation groups; never duplicated per-measure
- `IFERROR` only at the final user-facing wrap; never on intermediate calcs

## See also

- [02-power-bi-standards.md](02-power-bi-standards.md)
- [03-data-sourcing.md](03-data-sourcing.md)
