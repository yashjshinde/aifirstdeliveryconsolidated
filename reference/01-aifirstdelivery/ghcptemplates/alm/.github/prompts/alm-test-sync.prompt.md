---
mode: agent
description: "Write test ALM IDs back into test plan and suite documents for a domain feature. Triggers on: 'sync test cases', 'write test alm ids', 'test-sync'."
---

Write test ALM IDs back into test plan and suite documents for a domain feature.

## Usage

```
/alm-test-sync {domain} {feature}
```

## Steps

1. Read `constitution/10-alm-configuration.md` — load: domain paths.
2. Locate the latest test response file: `{domain-path}/output/{feature}/alm/test-response-*.json`.
   - If none found: stop with "No test-response file found. Run /alm-test-create {domain} {feature} first."
3. Read the response file. Build maps:
   - `tc-id → alm-id` for all test cases
   - `suite-name → suite-id` for all suites
   - `plan-name → plan-id`

### Update test-plan-and-strategy.md

Read `{domain-path}/docs-generated/{feature}/test-plan-and-strategy.md`.

- Replace `**Plan ALM ID:** *(pending)*` with `**Plan ALM ID:** #{plan-id}`.
- For each suite heading: replace `**Suite ALM ID:** *(pending)*` with `**Suite ALM ID:** #{suite-id}`.
- For each TC row in the reference tables: replace the ALM ID cell with `#{alm-id}`. Add the column if missing.

Write the updated file.

### Update suite files

Map TC ID prefixes to files:
| Prefix | File |
|---|---|
| TC-CRM-SI… | `test-cases/system-integration.md` |
| TC-CRM-UAT… | `test-cases/uat.md` |
| TC-CRM-SEC… | `test-cases/security.md` |
| TC-CRM-R… | `test-cases/regression.md` |

For each file that exists: find each test case card's `| ALM ID | ... |` row and replace with `#{alm-id}`.

Write all updated files.

### Print report

```
TEST SYNC COMPLETE — {feature}
══════════════════════════════════
Plan ID    : #{plan-id}
Test Cases : {N} updated  {N} not found

test-plan-and-strategy.md : {N} IDs updated
system-integration.md     : {N} IDs updated
uat.md                    : {N} IDs updated
```
