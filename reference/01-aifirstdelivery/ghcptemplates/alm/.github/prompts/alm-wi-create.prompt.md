---
mode: agent
description: "Create a single Azure DevOps work item interactively. Triggers on: 'create work item', 'new work item', 'wi-create'."
---

Create a single Azure DevOps work item interactively.

## Usage

```
/alm-wi-create {type}
```

Where `{type}` is one of: Epic, Feature, User Story, Task (or the names configured in `constitution/10-alm-configuration.md`).

## Steps

1. Read `constitution/10-alm-configuration.md` — load: area-path, iteration-path.
2. Optionally call `ado_get_iterations` to show available sprints if the user hasn't specified one.
3. Prompt the user for:
   - **Title** (required)
   - **Description** (optional — markdown supported)
   - **Acceptance Criteria** (optional — for User Story and Task)
   - **Parent ID** (optional — ADO ID of parent work item)
   - **Priority** (1–4, default 2)
   - **Story Points** (optional)
   - **Area Path** (default from constitution)
   - **Iteration Path** (default from constitution)

4. Call MCP tool `ado_create_work_item`:
   - `type`: {type}
   - `title`: {title}
   - `description`: {description}
   - `acceptance_criteria`: {acceptance-criteria}
   - `area_path`: {area-path}
   - `iteration_path`: {iteration-path}
   - `parent_id`: {parent-id} (if provided)
   - `priority`: {priority}
   - `story_points`: {story-points} (if provided)

5. Print:

```
CREATED — {type}
════════════════
ADO ID  : {id}
Title   : {title}
State   : New
Parent  : #{parent-id}  (if provided)
URL     : {url}
```
