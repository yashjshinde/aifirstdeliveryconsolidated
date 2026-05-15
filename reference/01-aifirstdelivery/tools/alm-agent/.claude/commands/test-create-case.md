Create a single Azure DevOps Test Case and add it to a Test Suite.

## Usage

```
/test-create-case {plan-id} {suite-id}
```

## Steps

1. Read `constitution/10-alm-configuration.md` — load: area-path.
2. Prompt the user for:
   - **Title** (required)
   - **Steps** — list of Action / Expected Result pairs
   - **Priority** (1–4, default 2)

3. Call MCP tool `ado_create_test_case`:
   - `title`: {title}
   - `steps`: [{step, action, expected}]
   - `area_path`: from constitution
   - `priority`: {priority}

4. Call MCP tool `ado_add_test_case_to_suite`:
   - `plan_id`: {plan-id}
   - `suite_id`: {suite-id}
   - `test_case_ids`: [{case-id}]

5. Print:

```
CREATED — Test Case
════════════════════
Plan ID  : {plan-id}
Suite ID : {suite-id}
Case ID  : {case-id}
Title    : {title}
URL      : {url}
```
