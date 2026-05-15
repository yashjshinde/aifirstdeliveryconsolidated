---
mode: agent
description: "Get a single Azure DevOps work item by ID and display its full details. Triggers on: 'get work item', 'fetch work item', 'wi-get'."
---

Get a single Azure DevOps work item by ID and print its full details.

## Usage

```
/alm-wi-get {id}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call MCP tool `ado_get_work_item`:
   - `id`: {id}
3. Print the returned fields in a readable format:

```
WORK ITEM — #{id}
════════════════════════════════════════
Type        : {type}
Title       : {title}
State       : {state}
Priority    : {priority}
Story Points: {storyPoints}
Area        : {areaPath}
Iteration   : {iterationPath}
Assigned    : {assignedTo}
URL         : {url}

Relations ({N}):
  → {rel} : #{id}
```

4. If the tool returns an error, print: `ERROR: {error.message}`
