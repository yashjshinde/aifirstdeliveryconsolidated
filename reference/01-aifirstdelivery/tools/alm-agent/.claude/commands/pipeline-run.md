Trigger an Azure DevOps pipeline run and return the run ID.

## Usage

```
/pipeline-run {pipeline-id} [{branch}]
```

## Steps

1. Read `constitution/10-alm-configuration.md`.
2. If `{pipeline-id}` is not a number, call `ado_pipeline_list` first to find the pipeline by name.
3. Call MCP tool `ado_pipeline_run`:
   - `pipeline_id`: {pipeline-id}
   - `branch`: {branch} (optional — defaults to pipeline's default branch)

4. Print:

```
PIPELINE TRIGGERED
═════════════════════════════════
Pipeline : #{pipeline-id}
Run ID   : {runId}
Run Name : {name}
State    : {state}
Branch   : {branch}
URL      : {url}

To check status: /pipeline-status {pipeline-id} {runId}
```
