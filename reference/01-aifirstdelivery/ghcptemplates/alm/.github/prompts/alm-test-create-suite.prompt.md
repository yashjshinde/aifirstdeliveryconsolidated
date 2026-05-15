---
mode: agent
description: "Create a single Azure DevOps Test Suite under a Test Plan. Triggers on: 'create test suite', 'new test suite', 'test-create-suite'."
---

Create a single Azure DevOps Test Suite under a Test Plan.

## Usage

```
/alm-test-create-suite {plan-id} {name}
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

Next step: Run /alm-test-create-case {plan-id} {id} to add test cases.
```
