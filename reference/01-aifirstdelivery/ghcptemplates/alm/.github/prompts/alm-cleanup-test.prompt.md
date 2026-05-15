---
mode: agent
description: "Delete an Azure DevOps Test Plan and all its Suites and Test Cases. Requires explicit typed confirmation. Triggers on: 'delete test plan', 'cleanup test plan', 'cleanup-test'."
---

Delete an Azure DevOps Test Plan and all its Suites and Test Cases. Requires explicit confirmation.

## Usage

```
/alm-cleanup-test {plan-id}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call `ado_get_test_plan` with `plan_id`: {plan-id} to get all suites.
3. For each non-root suite, call `ado_get_test_suite_cases` to collect all test case IDs.
4. Print the manifest and require explicit confirmation:

```
⚠ CLEANUP — DELETE TEST PLAN
══════════════════════════════════════════════════════════════
Plan  : #{plan-id}  {name}

  Suite #{suite-id}  {suite-name}  ({N} cases)
    Case #{case-id}  {title}

Total: {N} suites  {N} test cases + plan

⚠ PERMANENT — cannot be undone.
Type "DELETE PLAN {plan-id}" to confirm, or anything else to cancel.
```

5. Wait. Proceed only if the user types exactly `DELETE PLAN {plan-id}`.

6. Delete all test case work items first — call `ado_delete_work_item` for each:
   - `id`: {case-id}
   - `destroy`: true

7. Call `ado_delete_test_plan`:
   - `plan_id`: {plan-id}

8. Print:
```
TEST PLAN DELETE COMPLETE
══════════════════════════
Plan #{plan-id}  ✓
Cases deleted : {N} ✓
Failed        : {N} ✗
```
