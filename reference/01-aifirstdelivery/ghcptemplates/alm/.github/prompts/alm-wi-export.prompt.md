---
mode: agent
description: "Export the full Azure DevOps work item hierarchy under an Epic to JSON and CSV files. Triggers on: 'export work items', 'wi-export'."
---

Export the full Azure DevOps work item hierarchy under an Epic to JSON and CSV files.

## Usage

```
/alm-wi-export {epic-id} [--max-level N]
```

**`--max-level N`** (optional, default = `4`) — restrict export to hierarchy levels 1–N.
Level mapping is read from `alm-configuration.md` (`type-epic`, `type-feature`, `type-story`, `type-task`):

| Level | Work Item Type |
|---|---|
| 1 | Epic (type-epic) |
| 2 | Feature (type-feature) |
| 3 | Story/PBI (type-story) |
| 4 | Task (type-task) |

Example: `--max-level 3` exports Epic → Feature → Story/PBI only; Tasks are excluded.

## Steps

1. Read `constitution/10-alm-configuration.md` (and `../../alm-configuration.md` if it exists).
   Capture `type-epic`, `type-feature`, `type-story`, `type-task` values.
   Parse `--max-level` from arguments (default `4`). Build an **allowed-types set** from the levels ≤ max-level.

2. Call `ado_run_wiql` to get all descendants recursively:
   ```sql
   SELECT [System.Id] FROM WorkItemLinks
   WHERE [Source].[System.Id] = {epic-id}
     AND [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
   MODE (Recursive)
   ```
   Collect all target IDs plus the epic ID itself.

3. Call `ado_get_work_items_batch` with all collected IDs (batch at 200 max), requesting fields:
   ```
   System.Id
   System.WorkItemType
   System.Title
   System.State
   Microsoft.VSTS.Common.Priority
   System.AreaPath
   System.IterationPath
   Microsoft.VSTS.Scheduling.StoryPoints
   System.Parent
   System.Description
   Microsoft.VSTS.Common.AcceptanceCriteria
   ```

4. Filter items: keep only those whose `System.WorkItemType` is in the allowed-types set.
   If `--max-level 3`, drop all items where type equals the configured `type-task` value.

5. Write JSON to `output/wi-export-{epic-id}-{YYYYMMDD}.json`:
```json
{
  "epic-id": "{epic-id}",
  "exported-date": "{ISO8601}",
  "max-level": {N},
  "work-items": [{
    "id": 0,
    "type": "",
    "title": "",
    "state": "",
    "priority": "",
    "area": "",
    "iteration": "",
    "storyPoints": "",
    "parent": "",
    "description": "",
    "acceptanceCriteria": ""
  }]
}
```
`description` and `acceptanceCriteria` are stored as raw HTML (as returned by ADO).
Omit the field entirely if empty/null rather than writing an empty string.

6. Write CSV to `output/wi-export-{epic-id}-{YYYYMMDD}.csv`:
```
ID,Type,Title,State,Priority,Area,Iteration,StoryPoints,ParentID,Description,AcceptanceCriteria
```
- Strip HTML tags from `Description` and `AcceptanceCriteria` columns to plain text.
- Wrap every field in double-quotes; escape internal double-quotes by doubling them.

7. Print:
```
EXPORT COMPLETE — Epic #{epic-id}
═══════════════════════════════════════════════════
Items   : {N} total  ({type-feature}:{n}  {type-story}:{n}  {type-task}:{n})
Level   : 1–{max-level} (max-level filter applied)
JSON    : output/wi-export-{epic-id}-{date}.json
CSV     : output/wi-export-{epic-id}-{date}.csv
Fields  : id, type, title, state, priority, area, iteration, storyPoints, parent, description, acceptanceCriteria
```
Use the configured type names (e.g. "Product Backlog Item" not "Stories") in the Items line.
If `--max-level` was not specified, omit the "Level" line or show "1–4 (all levels)".
