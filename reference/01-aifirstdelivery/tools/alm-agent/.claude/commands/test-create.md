Bulk-create a full Azure DevOps test hierarchy (Test Plan + Suites + Cases) from a domain agent test extract.

## Usage

```
/test-create {domain} {feature}
/test-create {domain} {feature} --dry-run
```

## Steps

### 1. Read Configuration
Read `constitution/10-alm-configuration.md` — load: area-path, iteration-path, domain paths, test-plan-naming.

### 2. Locate the Extract File
Read `{domain-path}/output/{feature}/alm/test-plan-extract.json`.
- If not found: stop with "Test extract not found. Run `/extract testplan {feature}` in the {domain} agent first."

### 3. Parse the Extract
The extract structure:
```json
{
  "plan-name": "...",
  "suites": [{ "suite-name": "...", "test-cases": [{ "tc-id": "...", "title": "...", "steps": [...] }] }]
}
```

### 4. Dry Run (if --dry-run)
Print a summary and stop — do NOT call any MCP tools:

```
TEST PLAN PREVIEW — {feature}  [DRY RUN]
══════════════════════════════════════════
Plan : {plan-name}

  Suite: {suite 1 name}  ({N} test cases)
  Suite: {suite 2 name}  ({N} test cases)

Total: {N} suites, {N} test cases

Run /test-create {domain} {feature} to create in ADO.
```

### 5. Create in ADO
Call MCP tool `ado_bulk_create_test_suite`:
- `plan_name`: extract's `plan-name`
- `area_path`: from constitution
- `iteration`: from constitution
- `suites`: map each suite — `name` from `suite-name`, `test_cases` from `test-cases` (map `tc_id` from `tc-id`, include `title`, `steps`, `priority`)

### 6. Save the Result
The tool returns `{ planId, rootSuiteId, suiteMap, tcMap }`.

Write test response to `{domain-path}/output/{feature}/alm/test-response-{YYYYMMDD-HHmmss}.json`:
```json
{
  "feature": "{feature}",
  "plan-id": "{planId}",
  "plan-name": "{plan-name}",
  "created-date": "{ISO8601}",
  "suites": [{ "suite-id": "{id}", "suite-name": "{name}", "test-cases": [{ "tc-id": "...", "alm-id": "..." }] }]
}
```

### 7. Report

```
TEST CREATE COMPLETE — {feature}
════════════════════════════════
Plan     : #{planId}  {plan-name}
URL      : https://dev.azure.com/{org}/{project}/_testPlans/define?planId={planId}

  Suite                         Test Cases
  {suite-name}                  {N}
  ...

Total: {N} test cases created
```

### 8. Auto-sync
Automatically run `/test-sync {domain} {feature}`.
