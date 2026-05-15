Manage ALM work item synchronisation for a feature.
Reads plans/{feature}/work-items.yaml and constitution/10-alm-configuration.md.

## Usage

```
/alm extract {feature-name}
/alm sync    {feature-name} {uid} {alm-id}
/alm sync    {feature-name} --file {path-to-alm-response.json}
/alm get     {feature-name} {alm-id}
```

Read the first argument after `/alm` to determine the sub-command, then follow the matching section.

---

## Sub-command: extract

**Purpose:** Produce a structured JSON payload of all work items so the ALM Agent can create them in the configured tool with correct parent-child links.

### Steps

1. Read `constitution/10-alm-configuration.md` — load: alm-tool, hierarchy type names, field-mapping, priority-mapping, status-mapping.
2. Read `plans/{feature-name}/work-items.yaml`.
3. For any item that is missing a `uid`: assign `uid = "{feature-name}-{item-id}"` and write the updated work-items.yaml before continuing.
4. Build the extract payload (structure below).
5. Write to `output/{feature-name}/alm/extract-{YYYYMMDD-HHmmss}.json`.
6. Print: item counts by level, output file path, and the instruction:
   ```
   EXTRACT COMPLETE
   ════════════════
   Feature  : {feature-name}
   Items    : {N} total  (L1:{n}  L2:{n}  L3:{n}  L4:{n})
   Output   : output/{feature}/alm/extract-{timestamp}.json
   Next step: Pass this file to the ALM Agent to create work items.
              The ALM Agent must call  /alm sync {feature-name} --file {response.json}
              once work items are created, to write ALM IDs back into this project.
   ```

### Extract payload structure

```json
{
  "feature": "{feature-name}",
  "alm-tool": "{alm-tool}",
  "extracted-date": "{ISO8601 timestamp}",
  "content-format": "markdown",
  "note": "All description and acceptance-criteria fields contain raw markdown. The ALM Agent must convert markdown to the target tool's rich text format (HTML for Azure DevOps, Atlassian Document Format for Jira) when creating work items.",
  "field-mapping": {
    "title": "System.Title",
    "description": "System.Description",
    "acceptance-criteria": "Microsoft.VSTS.Common.AcceptanceCriteria",
    "priority": "Microsoft.VSTS.Common.Priority",
    "story-points": "Microsoft.VSTS.Scheduling.StoryPoints",
    "status": "System.State",
    "parent": "System.Parent"
  },
  "work-items": [
    {
      "uid": "{feature-name}-{L1-Prefix}-001",
      "alm-id": null,
      "alm-type": "{L1-Type}",
      "level": 1,
      "title": "{title}",
      "description": "{description}",
      "priority": "High",
      "priority-mapped": 1,
      "status": "TODO",
      "status-mapped": "New",
      "parent-uid": null,
      "children-uids": ["{feature-name}-{L2-Prefix}-001"],
      "fields": {
        "System.Title": "{title}",
        "System.Description": "{description}",
        "Microsoft.VSTS.Common.Priority": 1,
        "System.State": "New"
      }
    },
    {
      "uid": "{feature-name}-{L2-Prefix}-001",
      "alm-id": null,
      "alm-type": "{L2-Type}",
      "level": 2,
      "title": "{title}",
      "description": "{description}",
      "priority": "High",
      "priority-mapped": 1,
      "status": "TODO",
      "status-mapped": "New",
      "parent-uid": "{feature-name}-{L1-Prefix}-001",
      "children-uids": ["{feature-name}-{L3-Prefix}-001"],
      "fields": {
        "System.Title": "{title}",
        "System.Description": "{description}",
        "Microsoft.VSTS.Common.Priority": 1,
        "System.State": "New"
      }
    },
    {
      "uid": "{feature-name}-{L3-Prefix}-001",
      "alm-id": null,
      "alm-type": "{L3-Type}",
      "level": 3,
      "title": "{title}",
      "description": "{As a... I want... So that...}",
      "acceptance-criteria": ["AC-001: ...", "AC-002: ..."],
      "story-points": 3,
      "priority": "High",
      "priority-mapped": 1,
      "status": "TODO",
      "status-mapped": "New",
      "parent-uid": "{feature-name}-{L2-Prefix}-001",
      "children-uids": ["{feature-name}-{L4-Prefix}-001"],
      "fields": {
        "System.Title": "{title}",
        "System.Description": "{As a... I want... So that...}",
        "Microsoft.VSTS.Common.AcceptanceCriteria": "AC-001: ...\nAC-002: ...",
        "Microsoft.VSTS.Scheduling.StoryPoints": 3,
        "Microsoft.VSTS.Common.Priority": 1,
        "System.State": "New"
      }
    },
    {
      "uid": "{feature-name}-{L4-Prefix}-001",
      "alm-id": null,
      "alm-type": "{L4-Type}",
      "level": 4,
      "title": "{title}",
      "description": "{description}",
      "acceptance-criteria": ["AC-001: ..."],
      "component-type": "{component-type}",
      "complexity": "M",
      "priority": "High",
      "priority-mapped": 1,
      "status": "TODO",
      "status-mapped": "New",
      "validation-status": "NOT VALIDATED",
      "impl-doc-path": null,
      "parent-uid": "{feature-name}-{L3-Prefix}-001",
      "children-uids": [],
      "fields": {
        "System.Title": "{title}",
        "System.Description": "{description}",
        "Microsoft.VSTS.Common.AcceptanceCriteria": "AC-001: ...",
        "Microsoft.VSTS.Common.Priority": 1,
        "System.State": "New"
      }
    }
  ]
}
```

Rules:
- Include **all items at all four levels** in work-items, ordered Level 1 → 2 → 3 → 4.
- `parent-uid` must be the uid string of the parent item (not the item id). `null` for Level 1 items.
- `fields` must use the exact API field names from `constitution/10-alm-configuration.md` field-mapping.
- `priority-mapped` and `status-mapped` must use the value maps from `constitution/10-alm-configuration.md`.
- Level 4 items must also include `validation-status` and `impl-doc-path`.
- **Rich content:** All `description` and `acceptance-criteria` values must contain the full markdown text verbatim from the source YAML — do NOT flatten multi-line content or strip markdown syntax (`**`, `*`, `` ` ``, `-`, numbered lists, tables). The ALM Agent converts markdown to the target tool's rich text format.

---

## Sub-command: sync

**Purpose:** Accept ALM IDs returned by the ALM Agent and write them back into work-items.yaml and task card front matter.

### Input formats

**Single item (inline):**
```
/alm sync account-loyalty-points account-loyalty-points-T-001 12345
```

**Bulk file** (sent by the ALM Agent after creating all work items):
```
/alm sync account-loyalty-points --file output/account-loyalty-points/alm/alm-response.json
```

The ALM Agent's response file format:
```json
{
  "feature": "{feature-name}",
  "synced-items": [
    { "uid": "{feature-name}-{L1-Prefix}-001", "alm-id": "10001" },
    { "uid": "{feature-name}-{L2-Prefix}-001", "alm-id": "10002" },
    { "uid": "{feature-name}-{L3-Prefix}-001", "alm-id": "10003" },
    { "uid": "{feature-name}-{L4-Prefix}-001", "alm-id": "10004" }
  ]
}
```

### Steps

1. Read `plans/{feature-name}/work-items.yaml`.
2. Read `plans/{feature-name}/plan.md`.
3. For each uid → alm-id pair:
   a. Find the matching item in work-items.yaml by `uid` and set `alm-id: {alm-id}`.
   b. Update plan.md:
      - For Level 1 / 2 / 3 items: find the heading line containing the item ID (e.g., `{L1-Prefix}-001 —`) and replace `**ALM ID:** *(pending)*` on the following line with `**ALM ID:** {alm-id}`.
      - For Level 4 items: find the task row in the `##### Tasks` table where the first cell equals the task ID and replace `*(pending)*` in the ALM ID column with `{alm-id}`. Also update the matching row in the `# 2. Task Inventory` table.
   c. If the item is Level 4 ({L4-Type}): also find the matching task card in `tasks/{feature-name}/` by `task-id` (the item's `id` field, e.g., {L4-Prefix}-001) and set `alm-id: {alm-id}` in the task card front matter.
4. Update `specs/{feature-name}/spec.md` Section 13 Traceability Matrix with ALM Work Item IDs:
   - Read `specs/{feature-name}/spec.md`.
   - Build a FR → ALM IDs map from the updated work-items.yaml: for each item where `alm-id` is now set and `fr-refs` is non-empty, add the `alm-id` to each referenced FR's list.
   - Locate Section 13. Find the traceability matrix header row (contains `| FR ID |`).
   - If the header does not contain an `ALM Work Item IDs` column, add it as the last column (update header row and separator row).
   - For each FR data row: populate the ALM Work Item IDs cell with comma-separated `#{alm-id}` values from the map. Use `—` if no work items reference this FR.
   - Write the updated spec.md.
   - If `specs/{feature-name}/spec.md` does not exist, skip this step and note it in the sync report.
5. Write the updated work-items.yaml, plan.md, and spec.md.
6. Print sync report:

```
SYNC COMPLETE — {feature-name}
════════════════════════════════
Updated : {N} items
Skipped : {N} items (uid not found)

  {uid}  →  alm-id: {alm-id}  ✓
  {uid}  →  NOT FOUND  ✗

work-items.yaml updated.
plan.md ALM IDs updated.
Task cards updated: {list of task card files updated}.
spec.md Section 13 updated: {N} FRs populated with ALM Work Item IDs.
```

---

## Sub-command: sync-testplan

**Purpose:** Sync ALM IDs returned from the test management tool back into the test plan reference tables and suite files. Supports bulk sync from a CSV mapping file or a single TC update.

### Usage

```
/alm sync-testplan {feature-name}
/alm sync-testplan {feature-name} {TC-ID} {ALM-ID}
```

### Input — Bulk mode

Reads `docs-generated/{feature-name}/alm-extract/alm-mapping.csv`.

Required format:
```
TC ID,ALM ID
TC-CA001,12345
TC-FL001,12346
TC-SEC001,12350
```

If the file does not exist, stop: `alm-mapping.csv not found at docs-generated/{feature-name}/alm-extract/alm-mapping.csv. Create it with columns TC ID,ALM ID then re-run.`

### Input — Single mode

Updates one test case directly.
Example: `/alm sync-testplan my-feature TC-CA001 12345`

### Steps (both modes)

For each TC ID → ALM ID pair:

**A. Update the main test plan** (`docs-generated/{feature-name}/test-plan-and-strategy.md`):
- Scan §3.1–§3.7 reference tables.
- Find the row where the TC ID column matches.
- Replace the ALM ID column value with the new ALM ID.
- Record as "not found" if not present in any table — do not fail.

**B. Update the suite file** — use the TC ID prefix to identify the target file:
| Prefix | File |
|---|---|
| TC-CA… | `docs-generated/{feature-name}/test-cases/canvas.md` |
| TC-MD… | `docs-generated/{feature-name}/test-cases/model-driven.md` |
| TC-FL… | `docs-generated/{feature-name}/test-cases/flow.md` |
| TC-CO… | `docs-generated/{feature-name}/test-cases/copilot.md` |
| TC-SEC… | `docs-generated/{feature-name}/test-cases/security.md` |
| TC-U… | `docs-generated/{feature-name}/test-cases/uat.md` |
| TC-R… | `docs-generated/{feature-name}/test-cases/regression.md` |

- In the table row where TC ID matches, replace the ALM ID column value.
- If the prefix is ambiguous or TC ID not found in the expected file, scan all suite files.

**Do not modify any content other than the ALM ID column values.**

Write all changed files after processing all mappings.

### Completion report

```
ALM SYNC COMPLETE — Test Plan
══════════════════════════════
Feature      : {feature-name}
Mode         : Bulk (alm-mapping.csv) / Single
Processed    : {N} TC IDs

Updated successfully:
  TC-CA001  →  12345   test-plan ✓   canvas.md ✓
  TC-FL001  →  12346   test-plan ✓   flow.md ✓
  TC-SEC001 →  12350   test-plan ✓   security.md ✓

Not found (in mapping but not in files):
  {TC-ID}  — check TC ID spelling or re-run /extract testplan to verify

Files written:
  docs-generated/{feature-name}/test-plan-and-strategy.md
  docs-generated/{feature-name}/test-cases/{suite}.md
```

---

## Sub-command: get

**Purpose:** Return the current full state of a specific work item by its ALM ID. Used by the ALM Agent to push the latest status and progress back into the tool.

### Steps

```
/alm get account-loyalty-points 10004
```

1. Read `plans/{feature-name}/work-items.yaml`.
2. Find the item where `alm-id = {alm-id}`. If not found, stop:
   ```
   ERROR: No work item with alm-id "{alm-id}" found in plans/{feature-name}/work-items.yaml.
   Run /alm sync first to ensure ALM IDs have been written.
   ```
3. If the item is Level 4 ({L4-Type}): read the matching task card from `tasks/{feature-name}/` to get the current `status`, `validation-status`, and `impl-doc-path`.
4. Build the get payload (same structure as the extract payload, single item).
   - For Level 4: include `status`, `validation-status`, `impl-doc-path` from the task card.
   - Map `status` and `priority` through the value maps from `constitution/10-alm-configuration.md`.
5. Write to `output/{feature-name}/alm/get-{alm-id}-{YYYYMMDD}.json`.
6. Print:

```
GET COMPLETE
════════════
ALM ID    : {alm-id}
UID       : {uid}
Type      : {alm-type}
Title     : {title}
Status    : {status} → {status-mapped}
Output    : output/{feature}/alm/get-{alm-id}-{date}.json
```
