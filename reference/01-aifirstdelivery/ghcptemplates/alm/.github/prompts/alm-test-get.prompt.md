---
mode: agent
description: "Get an Azure DevOps Test Plan with all its Suites and Test Cases. Triggers on: 'get test plan', 'view test plan', 'test-get'."
---

Get an Azure DevOps Test Plan with all its Suites and Test Cases.

## Usage

```
/alm-test-get {plan-id}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call MCP tool `ado_get_test_plan`:
   - `plan_id`: {plan-id}
3. For each non-root suite in the result, call `ado_get_test_suite_cases`:
   - `plan_id`: {plan-id}
   - `suite_id`: {suite-id}
4. Print:

```
TEST PLAN — #{plan-id}: {name}
═══════════════════════════════════════════════
State     : {state}

  Suite #{suite-id}: {suite-name}  ({N} test cases)
    #{case-id}  {title}
    #{case-id}  {title}

Total: {N} suites  {N} test cases
```
