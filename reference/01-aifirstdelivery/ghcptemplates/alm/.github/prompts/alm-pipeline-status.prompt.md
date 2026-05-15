---
mode: agent
description: "Check the status and result of an Azure DevOps pipeline run. Triggers on: 'pipeline status', 'check pipeline', 'pipeline-status'."
---

Check the status and result of an Azure DevOps pipeline run.

## Usage

```
/alm-pipeline-status {pipeline-id} {run-id}
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. Call MCP tool `ado_pipeline_get_run`:
   - `pipeline_id`: {pipeline-id}
   - `run_id`: {run-id}

3. Print:

```
PIPELINE RUN STATUS
═════════════════════════════════
Pipeline : #{pipeline-id}
Run      : #{run-id}  {name}
State    : {state}        (inProgress | completed | canceling)
Result   : {result}       (succeeded | failed | canceled | — if in progress)
Started  : {createdDate}
Finished : {finishedDate}  (or "still running")
URL      : {url}
```

4. If the run failed, suggest: "Run /alm-wi-status {domain} {feature} to check if implementation work items need updating."
