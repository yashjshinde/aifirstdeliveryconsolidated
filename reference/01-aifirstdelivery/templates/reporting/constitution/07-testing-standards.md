# Testing Standards — Reporting

## 1. Test Categories

| Category | What It Tests | Who Runs It |
|---|---|---|
| Data accuracy | Report figures match source system | Developer + Data Engineer |
| Visual regression | Report layout unchanged after change | Developer |
| RLS validation | Each role sees correct filtered data | Developer + QA |
| Performance | Report loads within NFR targets | Developer |
| UAT | Business users validate output against requirements | Business Analyst + Business Users |
| Export validation | PDF/Excel/CSV export renders correctly | QA |

## 2. Data Accuracy Testing

For every measure in the report:
1. Run the measure query directly against the source data.
2. Compare the report value to the source query result.
3. Document the test: Measure Name | Source Query | Expected Value | Report Value | Pass/Fail.

Discrepancies must be resolved before UAT. Tolerance for aggregated values: ±0.01% (floating point rounding only).

## 3. RLS Validation Testing

For every RLS role defined in the spec:
1. Identify a test user assigned to that role.
2. Use Power BI Desktop "View as role" to simulate the filter.
3. Verify that only permitted rows appear — check edge cases (boundary BU, no-data scenario).
4. Document: Role Name | Test User | Filter Applied | Records Visible | Expected | Pass/Fail.

RLS test must cover:
- Happy path: user sees their permitted data.
- Exclusion path: user does NOT see another user's restricted data.
- Empty state: user with no matching records sees an empty report, not an error.

## 4. Performance Testing

Test report load time against the NFR targets in `constitution/09-nfr-targets.md`:
- Measure time from report open to all visuals rendered (not just page load).
- Test with a realistic filter applied (not the all-data default).
- Test with DirectQuery reports under load: simulate 10 concurrent users.
- Record: Report Name | Mode | Filter Applied | Load Time | Target | Pass/Fail.

Flag any report exceeding the target as ⚠ PERFORMANCE RISK before UAT.

## 5. Visual Regression Testing

After any change to a published report:
1. Capture a screenshot of each page before the change.
2. Deploy the change.
3. Compare screenshots — flag any unintended layout change.

Tooling: Power BI REST API screenshot capture, or manual screenshot comparison for small reports.

## 6. UAT Checklist

Business users must sign off the following for each report:
- [ ] All required KPIs are present and correctly labelled.
- [ ] Filters and slicers work as expected.
- [ ] Drill-through and drill-down navigate correctly.
- [ ] Export to PDF/Excel produces correct output.
- [ ] Data matches the agreed source of truth (spot-check at least 10 rows).
- [ ] Report loads within acceptable time.
- [ ] RLS: user sees only their permitted data.
- [ ] No error messages or blank visuals for normal data ranges.

## 7. SSRS-Specific Testing

- Run every report with boundary parameter values: empty date range, single-record result, maximum-record result.
- Verify page breaks do not split related rows mid-group.
- Verify headers repeat correctly on multi-page output.
- Verify subscription delivery: trigger a manual subscription delivery and confirm receipt.
- Verify pre-filtering in D365 CE: open report from an entity record and confirm pre-filter is applied.
