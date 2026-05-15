Delete a single Azure DevOps work item. Requires explicit confirmation.

## Usage

```
/cleanup-wi {id}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call `ado_get_work_item` with `id`: {id} to show what will be deleted.
3. Print the manifest and require explicit confirmation:

```
⚠ CLEANUP — DELETE WORK ITEM
═══════════════════════════════════════════════════════════
ID    : {id}
Type  : {type}
Title : {title}
State : {state}

This action is PERMANENT and cannot be undone.
Type "DELETE {id}" to confirm, or anything else to cancel.
```

4. Wait for user input. Proceed only if the user types exactly `DELETE {id}`.

5. Call MCP tool `ado_delete_work_item`:
   - `id`: {id}
   - `destroy`: true

6. Print:
```
DELETED — Work Item #{id}: {title}
```

Or if cancelled: `Cancelled. Work item #{id} was NOT deleted.`
