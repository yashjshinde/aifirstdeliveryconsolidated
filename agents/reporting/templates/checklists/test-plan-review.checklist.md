<!-- test-plan-review.checklist.md - reporting agent. Consumed INLINE by /test-plan per ADR-0001. -->

# Test Plan Inline Self-Check — reporting

> BLOCKER findings fail the write.

## Categories

### A. Suite coverage
- [ ] At least one suite per spec FR
- [ ] Every dataset has a data-accuracy suite (reconciliation against authoritative source)
- [ ] Every dataset with RLS has an RLS suite covering all defined roles
- [ ] Every report with > 3 pages has a navigation suite
- [ ] Refresh suite present per dataset (duration ≤ target; partition slice verified)
- [ ] Performance suite covers visual-render NFR

### B. Accessibility
- [ ] WCAG AA suite present when accessibility is in scope
- [ ] Multilingual suite present when `multilingual.reports: true`

### C. Test data
- [ ] Pre-conditions explicit per suite (environment, sample data set, user role)
- [ ] Test data references stable (not relying on PROD volatile rows)

### D. Traceability
- [ ] index.md cross-references every suite to its FR(s)
- [ ] Each test case carries TC-NN id; unique across suites

## Severity legend

- **BLOCKER** — fail the write
- **REQUIRED** — fix or accept with rationale
- **WARNING** — author judgement
