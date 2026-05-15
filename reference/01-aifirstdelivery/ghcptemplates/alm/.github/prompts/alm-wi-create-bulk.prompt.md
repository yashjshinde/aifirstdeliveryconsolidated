---
mode: agent
description: "Bulk-create a full work item hierarchy in Azure DevOps from a domain agent extract file, then write ALM IDs back into all project documents. Triggers on: 'bulk create work items', 'create work items from extract', 'wi-create-bulk'."
---

Bulk-create a full work item hierarchy in Azure DevOps from a domain agent extract file, then write ALM IDs back into all project documents.

## Usage

```
/alm-wi-create-bulk {domain} {feature}
/alm-wi-create-bulk {domain} {feature} --dry-run
```

## Steps

### 1. Read Configuration
Read `constitution/10-alm-configuration.md` — load: area-path, iteration-path, domain paths.

### 2. Locate the Extract File
Locate the latest extract file: `{domain-path}/output/{feature}/alm/extract-*.json` (most recent by filename timestamp).
- If none found: stop with "No extract file found. Run `/alm extract {feature}` in the {domain} agent first."

### 3. Parse the Extract
Read the extract JSON. Load the `work-items` array. Build the items list ordered L1 → L2 → L3 → L4. Map each item:
- `ref`: item's `uid`
- `parentRef`: item's `parent-uid` (null for L1)
- `type`: item's `alm-type`
- `title`: item's `title`
- `description`: item's `description`
- `acceptance_criteria`: item's `acceptance-criteria` (join array with `\n` if array)
- `priority`: item's `priority-mapped`
- `story_points`: item's `story-points` (if present)
- `area_path`: from constitution (or item override if present)
- `iteration_path`: from constitution

### 4. Dry Run (if --dry-run)
Print the items as a table and stop — do NOT call any MCP tools:

```
WORK ITEMS PREVIEW — {feature}  [DRY RUN]
══════════════════════════════════════════
  Ref    Type         Title                   Parent
  L1-001 Epic         {title}                 —
  L2-001 Feature      {title}                 L1-001
  L3-001 User Story   {title}                 L2-001
  L4-001 Task         {title}                 L3-001

Total: {N} items (Epics:{n}  Features:{n}  Stories:{n}  Tasks:{n})

Run /alm-wi-create-bulk {domain} {feature} to create in ADO.
```

### 5. Create in ADO
Call MCP tool `ado_bulk_create_work_items`:
- `items`: the mapped items array

### 6. Save the Result
The tool returns `{ created, failed, items: [{ref, id, title, url}], errors }`.
Write the ALM response file to `{domain-path}/output/{feature}/alm/alm-response-{YYYYMMDD-HHmmss}.json`:

```json
{
  "feature": "{feature}",
  "domain": "{domain}",
  "created-date": "{ISO8601}",
  "synced-items": [
    { "uid": "{ref}", "alm-id": "{id}", "type": "{type}", "title": "{title}" }
  ]
}
```

### 7. Report

```
BULK CREATE COMPLETE — {feature}
════════════════════════════════
Domain  : {domain}
Created : {N} work items  {failed} failed

  #{id}  [Epic]       {title}
    #{id}  [Feature]    {title}
      #{id}  [User Story] {title}
        #{id}  [Task]       {title}

Response: {domain-path}/output/{feature}/alm/alm-response-{timestamp}.json
```

### 8. Auto-sync
Automatically run `/alm-wi-sync {domain} {feature}` to write ALM IDs into all local documents.

## Error Handling
- If `ado_bulk_create_work_items` fails on an item: report which item failed and list items already created with their IDs.
- If ADO returns 401/403: tell user to check ADO credentials in `.claude/settings.json` under `mcpServers.ado-alm.env`.
