---
description: Read .workflow.json and suggest the next command for this feature
agent: d365-fo
phase: utility
gates: []
---

# /next

> Utility command. Reads `.workflow.json`, evaluates eligible commands per `workflow.yaml`, prints the recommendation.

## Usage

```
/next [--feature <slug>] [--project <name>]
```

## Inputs

- `projects/{p}/d365-fo/features/{f}/.workflow.json`
- `agents/d365-fo/workflow.yaml` (mirrored)

## Execution flow

1. Load `.workflow.json`.
2. Call `workflow_next` MCP tool.
3. Print best-next command, parallel-eligible commands, and PENDING gates.
4. No writes.

## Output

- Console only.

## See also

- [workflow.yaml](../../workflow.yaml)
- [design/11-mcp-server.md § workflow_next](../../../design/11-mcp-server.md)
