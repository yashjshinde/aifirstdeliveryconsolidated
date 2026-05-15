Get all work items in the hierarchy under an Epic, recursively.

## Usage

```
/wi-get-children {epic-id}
```

## Steps

1. Read `constitution/10-alm-configuration.md` — load: project name.
2. Call MCP tool `ado_run_wiql`:
   - `query`: `SELECT [System.Id] FROM WorkItemLinks WHERE [Source].[System.Id] = {epic-id} AND [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward' MODE (Recursive)`
3. Extract all target IDs from the WIQL result.
4. Call MCP tool `ado_get_work_items_batch`:
   - `ids`: all collected IDs (in batches of 200 if needed)
5. Build a parent → children map from the `parent` field on each item.
6. Print as a tree:

```
HIERARCHY — Epic #{epic-id}: {title}
════════════════════════════════════════════
  #{id} [Feature] {title}  ({state})
    #{id} [User Story] {title}  ({state})
      #{id} [Task] {title}  ({state})

Total: {N} items  (Features:{n}  Stories:{n}  Tasks:{n})
```

7. If no children found, print: `Epic #{epic-id} has no child work items.`
