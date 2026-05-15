---
mode: agent
description: "Show the sync status between local project documents and Azure DevOps for a domain feature. Triggers on: 'work item status', 'sync status', 'wi-status'."
---

Show the sync status between local project documents and Azure DevOps for a domain feature.

## Usage

```
/alm-wi-status {domain} {feature}
```

## Steps

1. Read `constitution/10-alm-configuration.md` — load: domain paths.
2. Read `{domain-path}/plans/{feature}/work-items.yaml`.

### Local status check

For each item in work-items.yaml, classify:
- `SYNCED`  — `alm-id` is set
- `PENDING` — `alm-id` is null or missing
- `NO-UID`  — `uid` is missing (extract not run)

### ADO status check (for synced items)

Call MCP tool `ado_get_work_items_batch`:
- `ids`: all alm-ids that are set
- `fields`: `["System.Id","System.Title","System.State","System.WorkItemType"]`

Compare ADO state with local `status` field. Flag mismatches.

### Document sync check

- **plan.md** — scan for `*(pending)*` (un-synced items remain)
- **spec.md Section 13** — check if "ALM Work Item IDs" column exists
- **task cards** — scan for any task card with missing `alm-id` front matter

### Print report

```
STATUS — {feature}
══════════════════════════════════════════════════════
Domain     : {domain}

Local Sync:
  SYNCED   : {N} items
  PENDING  : {N} items  ← run /alm-wi-create-bulk to create
  NO-UID   : {N} items  ← run /alm extract in domain agent first

ADO State (synced items):
  MATCH    : {N} items
  MISMATCH : {N} items
    {uid}  local={status}  ado={state}

Document Sync:
  plan.md          : {OK | {N} pending items}
  spec.md Sec 13   : {OK | column missing | {N} FRs unpopulated}
  task cards       : {OK | {N} missing alm-id}

Pending items:
  {uid}  [{type}]  {title}
```
