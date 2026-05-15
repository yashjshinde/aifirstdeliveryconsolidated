Create a single Azure DevOps Test Suite under a Test Plan.

## Usage

```
/test-create-suite {plan-id} {name}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call MCP tool `ado_create_test_suite`:
   - `plan_id`: {plan-id}
   - `name`: {name}
   - `parent_suite_id`: omit (tool defaults to root suite)

3. Print:

```
CREATED — Test Suite
═════════════════════
Plan ID  : {plan-id}
Suite ID : {id}
Name     : {name}

Next step: Run /test-create-case {plan-id} {id} to add test cases.
```
