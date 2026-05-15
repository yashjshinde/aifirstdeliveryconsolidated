---
mode: agent
description: "Delete all Test Cases under a specific Azure DevOps Test Suite. The suite itself is kept. Requires explicit typed confirmation. Triggers on: 'delete test cases', 'cleanup suite', 'cleanup-suite'."
---

Delete all Test Cases under a specific Azure DevOps Test Suite. The suite itself is kept. Requires explicit confirmation.

## Usage

```
/alm-cleanup-suite {plan-id} {suite-id}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call `ado_get_test_suite_cases`:
   - `plan_id`: {plan-id}
   - `suite_id`: {suite-id}
3. Print the manifest and require explicit confirmation:

```
⚠ CLEANUP — DELETE ALL TEST CASES IN SUITE
═══════════════════════════════════════════════════════════
Plan  : #{plan-id}
Suite : #{suite-id}

Cases to be deleted ({N}):
  #{case-id}  {title}
  #{case-id}  {title}

⚠ The suite itself is NOT deleted — only its test cases.
⚠ PERMANENT — cannot be undone.
Type "DELETE SUITE {suite-id}" to confirm, or anything else to cancel.
```

4. Wait. Proceed only if the user types exactly `DELETE SUITE {suite-id}`.

5. For each test case, call `ado_delete_work_item`:
   - `id`: {case-id}
   - `destroy`: true

6. Print:
```
SUITE CLEANUP COMPLETE
════════════════════════
Suite   : #{suite-id}
Deleted : {N} test cases ✓
Failed  : {N} ✗
```
