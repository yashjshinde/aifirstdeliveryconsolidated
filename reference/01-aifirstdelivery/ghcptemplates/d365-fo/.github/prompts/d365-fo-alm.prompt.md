---
mode: agent
description: "Manage Azure DevOps work item synchronisation for D365 F&O — extract, sync, and get work items. Triggers on: 'alm', 'sync work items', 'alm extract'."
---

Manage ALM work item synchronisation for a D365 F&O requirement.
Reads `plans/{req}/work-items.yaml` and `constitution/10-alm-configuration.md`.

The D365 F&O ALM hierarchy is **flat — two levels only**:
- Level 1 — Requirement / Epic  (one per FDD requirement)
- Level 2 — Object Task         (one per Object-ID: EXT-001, DEN-042, INT-022, …)

## Usage

```
/d365-fo-alm extract {requirement-name}
/d365-fo-alm sync    {requirement-name} {uid} {alm-id}
/d365-fo-alm sync    {requirement-name} --file {path-to-alm-response.json}
/d365-fo-alm get     {requirement-name} {alm-id}
```

Read the first argument after `/d365-fo-alm` to determine the sub-command, then follow the matching section.

---

## Sub-command: extract

**Purpose:** Produce a structured JSON payload of all work items so the ALM Agent can create them in the configured tool with correct parent-child links.

### Steps

1. Read `constitution/10-alm-configuration.md` — load: alm-tool, hierarchy type names, field-mapping, priority-mapping, status-mapping.
2. Read `plans/{requirement-name}/work-items.yaml`.
3. For any item missing a `uid`: assign `uid = "{requirement-name}-{object-id}"` and write the updated work-items.yaml before continuing.
4. Build the extract payload (structure below).
5. Write to `output/{requirement-name}/d365-fo-alm/extract-{YYYYMMDD-HHmmss}.json`.
6. Print:

```
EXTRACT COMPLETE
════════════════
Requirement : {requirement-name}
Items       : {N} total  (L1:{n}  L2:{n})
Output      : output/{requirement-name}/d365-fo-alm/extract-{timestamp}.json
Next step   : Pass this file to the ALM Agent to create work items.
              The ALM Agent must call  /d365-fo-alm sync {requirement-name} --file {response.json}
              once work items are created, to write ALM IDs back into this project.
```

### Extract payload structure

```json
{
  "requirement": "{requirement-name}",
  "alm-tool": "{alm-tool}",
  "extracted-date": "{ISO8601 timestamp}",
  "hierarchy": "2-level: Requirement/Epic → Object Task",
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
      "uid": "{requirement-name}-L1",
      "alm-id": null,
      "alm-type": "Epic",
      "level": 1,
      "title": "{requirement display name}",
      "description": "{description from work-items.yaml}",
      "priority": "High",
      "priority-mapped": 1,
      "status": "To Do",
      "status-mapped": "New",
      "parent-uid": null,
      "children-uids": ["{requirement-name}-EXT-001", "{requirement-name}-EXT-002"],
      "fields": {
        "System.Title": "{title}",
        "System.Description": "{description}",
        "Microsoft.VSTS.Common.Priority": 1,
        "System.State": "New"
      }
    },
    {
      "uid": "{requirement-name}-EXT-001",
      "alm-id": null,
      "alm-type": "Task",
      "level": 2,
      "object-id": "EXT-001",
      "object-category": "Extensions",
      "object-type": "Table Extension",
      "object-name": "{technical name}",
      "module": "{module code}",
      "complexity": "Simple",
      "t-shirt": "S",
      "story-points": 1,
      "fdd-ref": "Section 10",
      "tdd-ref": "Section 5.4.4",
      "depends-on": [],
      "title": "EXT-001 — {ObjectName}: {description}",
      "description": "{description}",
      "acceptance-criteria": ["AC-001: ...", "AC-002: ..."],
      "priority": "High",
      "priority-mapped": 1,
      "status": "Not Started",
      "status-mapped": "New",
      "impl-doc-path": null,
      "parent-uid": "{requirement-name}-L1",
      "children-uids": [],
      "fields": {
        "System.Title": "EXT-001 — {ObjectName}: {description}",
        "System.Description": "{description}\n\nObject-ID: EXT-001\nObject Type: Table Extension\nModule: {module}\nFDD Ref: Section 10\nTDD Ref: Section 5.4.4",
        "Microsoft.VSTS.Common.AcceptanceCriteria": "AC-001: ...\nAC-002: ...",
        "Microsoft.VSTS.Scheduling.StoryPoints": 1,
        "Microsoft.VSTS.Common.Priority": 1,
        "System.State": "New"
      }
    }
  ]
}
```

**Rules:**
- Include all items at both levels, ordered Level 1 first then Level 2.
- `parent-uid` must be the uid string of the parent item. `null` for Level 1.
- `fields` must use the exact API field names from `constitution/10-alm-configuration.md`.
- `priority-mapped` and `status-mapped` must use the value maps from the constitution.
- Level 2 Object Task items must include: `object-id`, `object-category`, `object-type`, `object-name`, `module`, `complexity`, `t-shirt`, `story-points`, `fdd-ref`, `tdd-ref`, `depends-on`, `impl-doc-path`.
- `story-points` should be estimated from complexity: XS=0.5, S=1, M=3, L=8, XL=20.
- **Rich content:** All `description` and `acceptance-criteria` values must contain the full markdown text verbatim from the source YAML — do NOT flatten multi-line content or strip markdown syntax (`**`, `*`, `` ` ``, `-`, numbered lists, tables, X++ code blocks). The ALM Agent converts markdown to the target tool's rich text format.

---

## Sub-command: sync

**Purpose:** Accept ALM IDs returned by the ALM Agent and write them back into work-items.yaml.

### Input formats

**Single item (inline):**
```
/d365-fo-alm sync qms-po-validation qms-po-validation-EXT-001 42301
```

**Bulk file** (sent by the ALM Agent after creating all work items):
```
/d365-fo-alm sync qms-po-validation --file output/qms-po-validation/alm/alm-response.json
```

The ALM Agent's response file format:
```json
{
  "requirement": "{requirement-name}",
  "synced-items": [
    { "uid": "{requirement-name}-L1",     "alm-id": "10001" },
    { "uid": "{requirement-name}-EXT-001","alm-id": "10002" },
    { "uid": "{requirement-name}-EXT-002","alm-id": "10003" }
  ]
}
```

### Steps

1. Read `plans/{requirement-name}/work-items.yaml`.
2. Read `plans/{requirement-name}/plan.md`.
3. For each uid → alm-id pair:
   a. Find the matching item in work-items.yaml by `uid` and set `alm-id: {alm-id}`.
   b. Update plan.md:
      - For the Level 1 (Epic) item: replace `**ALM ID (Epic):** *(pending)*` with `**ALM ID (Epic):** {alm-id}`.
      - For Level 2 (Object Task) items: find the Object Summary table row where Object-ID matches and replace `*(pending)*` in the ALM ID column with `{alm-id}`. Also find the matching `### {Object-ID} —` detail section and replace `| **ALM ID** | *(pending)* |` with `| **ALM ID** | {alm-id} |`.
4. Update `docs-generated/{requirement-name}/fdd.md` Object Summary table with ALM Work Item IDs:
   - Read `docs-generated/{requirement-name}/fdd.md`.
   - Locate the Object Summary table (contains columns Object-ID, Object Name, Category, etc.).
   - If the table does not contain an `ALM ID` column, add it as the last column (update header row and separator row).
   - For each Object-ID row in the table: look up the matching work item in the updated work-items.yaml by `object-id` field and populate the ALM ID cell with `#{alm-id}`. Use `—` if the object has no matching work item.
   - Write the updated fdd.md.
   - If `docs-generated/{requirement-name}/fdd.md` does not exist, skip this step and note it in the sync report.
5. Write the updated work-items.yaml, plan.md, and fdd.md.
6. Print sync report:

```
SYNC COMPLETE — {requirement-name}
════════════════════════════════════
Updated : {N} items
Skipped : {N} items (uid not found)

  {uid}  →  alm-id: {alm-id}  ✓
  {uid}  →  NOT FOUND  ✗

work-items.yaml updated.
plan.md ALM IDs updated.
fdd.md Object Summary ALM IDs updated: {N} objects populated.
```

**Rule:** Never overwrite a non-null `alm-id`. If a uid already has an alm-id set, skip and report as skipped (not as an error).

---

## Sub-command: sync-testplan

**Purpose:** Sync ALM IDs returned from the test management tool back into the test plan reference tables and suite files. Supports bulk sync from a CSV mapping file or a single TC update.

### Usage

```
/d365-fo-alm sync-testplan {requirement-name}
/d365-fo-alm sync-testplan {requirement-name} {TC-ID} {ALM-ID}
```

### Input — Bulk mode

Reads `docs/{requirement-name}/alm-extract/alm-mapping.csv`.

Required format:
```
TC ID,ALM ID
TC-U001,12345
TC-SF001,12346
TC-SEC001,12350
```

If the file does not exist, stop: `alm-mapping.csv not found at docs/{requirement-name}/alm-extract/alm-mapping.csv. Create it with columns TC ID,ALM ID then re-run.`

### Input — Single mode

Updates one test case directly.
Example: `/d365-fo-alm sync-testplan my-requirement TC-SF001 12346`

### Steps (both modes)

For each TC ID → ALM ID pair:

**A. Update the main test plan** (`docs/{requirement-name}/test-plan.md`):
- Scan §3.1–§3.6 reference tables.
- Find the row where the TC ID column matches.
- Replace the ALM ID column value with the new ALM ID.
- Record as "not found" if not present in any table — do not fail.

**B. Update the suite file** — use the TC ID prefix to identify the target file:
| Prefix | File |
|---|---|
| TC-U… | `docs/{requirement-name}/test-cases/unit.md` |
| TC-SF… | `docs/{requirement-name}/test-cases/sit-functional.md` |
| TC-SI… | `docs/{requirement-name}/test-cases/sit-integration.md` |
| TC-UAT… | `docs/{requirement-name}/test-cases/uat.md` |
| TC-SEC… | `docs/{requirement-name}/test-cases/security.md` |
| TC-P… | `docs/{requirement-name}/test-cases/performance.md` |

- In the table row where TC ID matches, replace the ALM ID column value.
- If the prefix is ambiguous or TC ID not found in the expected file, scan all suite files.

**Do not modify any content other than the ALM ID column values.**

Write all changed files after processing all mappings.

### Completion report

```
ALM SYNC COMPLETE — Test Plan
══════════════════════════════
Requirement  : {requirement-name}
Mode         : Bulk (alm-mapping.csv) / Single
Processed    : {N} TC IDs

Updated successfully:
  TC-U001   →  12345   test-plan ✓   unit.md ✓
  TC-SF001  →  12346   test-plan ✓   sit-functional.md ✓
  TC-SEC001 →  12350   test-plan ✓   security.md ✓

Not found (in mapping but not in files):
  {TC-ID}  — check TC ID spelling or re-run /d365-fo-extract testplan to verify

Files written:
  docs/{requirement-name}/test-plan.md
  docs/{requirement-name}/test-cases/{suite}.md
```

---

## Sub-command: get

**Purpose:** Return the current full state of a specific work item by its ALM ID. Used by the ALM Agent to push the latest status and progress back into your ALM tool.

### Steps

```
/d365-fo-alm get qms-po-validation 42301
```

1. Read `plans/{requirement-name}/work-items.yaml`.
2. Find the item where `alm-id = {alm-id}`. If not found, stop:
   ```
   ERROR: No work item with alm-id "{alm-id}" found in plans/{requirement-name}/work-items.yaml.
   Run /d365-fo-alm sync first to ensure ALM IDs have been written.
   ```
3. Read the current `status` and `impl-doc-path` from work-items.yaml for this item.
4. If a task card exists at `tasks/{requirement-name}/{Object-ID}-*.md`, also read it for the latest `status`.
5. Build the get payload (single item, same structure as extract payload).
   - Include current `status`, `impl-doc-path`.
   - Map `status` and `priority` through the value maps from `constitution/10-alm-configuration.md`.
6. Write to `output/{requirement-name}/d365-fo-alm/get-{alm-id}-{YYYYMMDD}.json`.
7. Print:

```
GET COMPLETE
════════════
ALM ID    : {alm-id}
UID       : {uid}
Object-ID : {object-id}
Type      : {alm-type}
Title     : {title}
Status    : {status} → {status-mapped}
Impl Doc  : {impl-doc-path or "not yet created"}
Output    : output/{requirement-name}/d365-fo-alm/get-{alm-id}-{date}.json
```
