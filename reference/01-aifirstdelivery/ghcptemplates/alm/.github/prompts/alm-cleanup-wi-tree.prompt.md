---
mode: agent
description: "Delete a full work item hierarchy (Epic and all descendants). Requires explicit typed confirmation. Triggers on: 'delete work item tree', 'cleanup hierarchy', 'cleanup-wi-tree'."
---

Delete a full work item hierarchy (Epic and all descendants). Requires explicit confirmation.

## Usage

```
/alm-cleanup-wi-tree {id}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call `ado_run_wiql` to get all descendants recursively.
3. Call `ado_get_work_items_batch` to get titles and types for all IDs.
4. Print the full manifest and require explicit confirmation:

```
⚠ CLEANUP — DELETE WORK ITEM TREE
═══════════════════════════════════════════════════════════
Root : #{id} [{type}] {title}

Tree ({N} items):
  #{id}  [Epic]       {title}
    #{id}  [Feature]    {title}
      #{id}  [User Story] {title}
        #{id}  [Task]       {title}

⚠ PERMANENT — cannot be undone.
Type "DELETE TREE {id}" to confirm, or anything else to cancel.
```

5. Wait for user input. Proceed only if the user types exactly `DELETE TREE {id}`.

6. Delete bottom-up (deepest level first). For each ID in reverse level order, call `ado_delete_work_item`:
   - `id`: {item-id}
   - `destroy`: true

7. Print:
```
TREE DELETE COMPLETE
═════════════════════════
Root    : #{id} {title}
Deleted : {N} items ✓
Failed  : {N} items ✗
```
