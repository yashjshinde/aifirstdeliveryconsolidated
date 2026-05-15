Assign all work items for a domain feature to an Azure DevOps iteration (sprint).

## Usage

```
/sprint-assign {domain} {feature} {sprint}
```

## Steps

1. Read `constitution/10-alm-configuration.md` — load: project, domain paths.
2. Optionally call `ado_get_iterations` to verify `{sprint}` is a valid path.
3. Resolve the full iteration path: if `{sprint}` contains a backslash, use as-is; otherwise prepend the project name: `{project}\{sprint}`.
4. Read `{domain-path}/plans/{feature}/work-items.yaml`. Collect all `alm-id` values that are set.
   - If none: stop with "No ALM IDs found. Run /wi-create-bulk first."

5. Print the manifest and wait for confirmation:
```
SPRINT ASSIGN — {feature}
══════════════════════════
Sprint : {resolved-path}
Items  : {N} work items  [{ids listed}]

Proceed? (yes/no)
```

6. On confirmation, call MCP tool `ado_batch_update_field`:
   - `ids`: all alm-ids
   - `field`: `System.IterationPath`
   - `value`: {resolved-path}

7. Print:
```
SPRINT ASSIGN COMPLETE
════════════════════════════════
Sprint  : {resolved-path}
Updated : {N} ✓
Failed  : {N} ✗
```
