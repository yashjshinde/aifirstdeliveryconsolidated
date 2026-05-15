---
mode: agent
description: "Extract Data Migration test plan, suites, and cases to ALM-ready formats. Triggers on: 'extract', 'extract testplan', 'export test cases'."
---

Extract test plan, suites, or individual test cases for a data migration into ALM-ready output files. Rich content (markdown, steps as structured arrays) is preserved intact in the JSON output — the primary ALM import artifact.

## Usage

```
/data-migration-extract testplan  {migration-id}
/data-migration-extract testsuites {migration-id} [suite-name]
/data-migration-extract testcases  {migration-id} [tc-id]
```

Read the first argument after `/data-migration-extract` to determine the sub-command, then follow the matching section.

---

## Sub-command: testplan

**Purpose:** Read the full test plan and all suite sections, then write ALM-ready output. Every TC ID is the stable unique identifier used to sync ALM IDs back.

### Steps

1. Read `docs-generated/{migration-id}/test-plan-and-strategy.md`.
   - Extract plan metadata: migration ID, direction, version, generated date.
   - Parse each suite section and extract: TC ID, ALM ID, Title, Pre-conditions, Steps, Expected Results, Priority.
   - Note all five standard suites: DM-SIT, DM-UAT, DM-PERF, DM-SEC, DM-REG.

2. Extract full test case cards for all suites from the test plan document.

   **Rich content rule:** Steps, Expected Results, Pre-conditions, Test Data, and all multi-line fields must be extracted verbatim — do NOT flatten to a single line. Do NOT strip markdown syntax (`**`, `*`, `` ` ``, `-`, `|` tables, numbered lists). Every `\n` in the source must survive unchanged.

   Parse each step item as a `{ step, action, expected }` object.

3. Create `docs-generated/{migration-id}/alm-extract/` if it does not exist.

4. Write `docs-generated/{migration-id}/alm-extract/test-plan-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Migration,Suite ID,Suite Name,TC ID,ALM ID,Title,Direction,Priority,Area Path,Iteration Path,State,Step Count
   ```
   - Step Count: total number of step entries
   - Enclose fields containing commas or newlines in double quotes

5. Write `docs-generated/{migration-id}/alm-extract/test-plan-extract.json`.
   **Primary ALM import artifact — full rich content preserved.** Structure:
   ```json
   {
     "domain": "Data Migration",
     "migration": "{migration-id}",
     "direction": "{direction}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "note": "All text fields contain raw markdown. The ALM Agent must convert markdown to the target tool's rich text format (HTML for Azure DevOps) when creating work items.",
     "alm-tool": "{value from constitution/10-alm-configuration.md}",
     "test-suites": [
       {
         "suite-id": "DM-SIT",
         "suite-name": "System Integration Tests",
         "tc-count": 0,
         "test-cases": [
           {
             "tc-id": "TC-DM-SIT-01",
             "alm-id": null,
             "title": "...",
             "priority": "High",
             "priority-mapped": 2,
             "direction": "{direction}",
             "entity": "{entity}",
             "area-path": "...",
             "iteration-path": "...",
             "state": "Design",
             "automation-status": "Not Automated",
             "test-type": "System",
             "preconditions": "{raw markdown verbatim}",
             "test-data": "{raw markdown verbatim}",
             "steps": [
               {
                 "step": 1,
                 "action": "{raw markdown verbatim}",
                 "expected": "{raw markdown verbatim}"
               }
             ],
             "fields": {
               "System.Title": "...",
               "System.AreaPath": "...",
               "System.IterationPath": "...",
               "Microsoft.VSTS.Common.Priority": 2,
               "System.State": "Design",
               "Microsoft.VSTS.TCM.AutomationStatus": "Not Automated",
               "System.Description": "{preconditions markdown — ALM Agent converts to HTML}",
               "Microsoft.VSTS.TCM.Steps": "{ALM Agent serialises steps array into tool-specific format}"
             }
           }
         ]
       }
     ]
   }
   ```

   **JSON generation rules:**
   - `content-format: "markdown"` is mandatory on the root object.
   - All text fields must contain exact markdown from source.
   - `steps` must be an array of `{ step, action, expected }` objects — never a flat string.
   - `alm-id`: null if not synced; populate from plan if present.

6. Write `docs-generated/{migration-id}/alm-extract/test-plan-summary.md`.
   - Header block: migration, direction, extraction date, total TC count, total step count
   - One section per suite: suite name, TC count, step count
   - Summary table: `TC ID | Suite | Title | Priority | Step Count | ALM ID | Status`

7. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Plan
   ════════════════════════════
   Migration    : {migration-id}
   Direction    : {direction}
   Suites       : {N}
     DM-SIT  System Integration : {N} TCs, {N} steps
     DM-UAT  UAT                : {N} TCs, {N} steps
     DM-PERF Performance        : {N} TCs, {N} steps
     DM-SEC  Security           : {N} TCs, {N} steps
     DM-REG  Regression         : {N} TCs, {N} steps
   Total TCs    : {N}
   Total Steps  : {N}
   ALM IDs      : {N} populated / {N} pending sync
   Output CSV   : docs-generated/{m}/alm-extract/test-plan-extract.csv  (metadata summary only)
   Output JSON  : docs-generated/{m}/alm-extract/test-plan-extract.json  (rich content — primary ALM import)
   Output MD    : docs-generated/{m}/alm-extract/test-plan-summary.md
   Next step: /data-migration-alm push-tests {m}  (creates test plan in ADO) or /data-migration-alm sync-tests {m} (after manual import)
   ```

---

## Sub-command: testsuites

**Purpose:** Extract one or all test suites with full step detail and rich content intact.

**suite-name options:** `sit` | `uat` | `perf` | `sec` | `reg` | `all` (default: `all`)

### Steps

1. Determine which suite(s) to extract.

2. For each suite, read the matching sections from `docs-generated/{migration-id}/test-plan-and-strategy.md`:

   | Argument | Suite Name | TC ID Prefix |
   |---|---|---|
   | `sit` | System Integration Tests | TC-DM-SIT |
   | `uat` | User Acceptance Tests | TC-DM-UAT |
   | `perf` | Performance Tests | TC-DM-PERF |
   | `sec` | Security Tests | TC-DM-SEC |
   | `reg` | Regression Tests | TC-DM-REG |

3. For each test case, extract all fields and steps with rich content intact. Parse each step as `{ step, action, expected }`. Preserve markdown in every text field.

4. Create `docs-generated/{migration-id}/alm-extract/` if it does not exist.

5. Write `docs-generated/{migration-id}/alm-extract/suites-extract.csv` (metadata only).

6. Write `docs-generated/{migration-id}/alm-extract/suites-extract.json` (full rich content, same root structure as test-plan-extract.json).

7. Write `docs-generated/{migration-id}/alm-extract/suites-summary.md`.
   One section per extracted suite with TC reference table.

8. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Suites
   ══════════════════════════════
   Migration    : {migration-id}
   Suites       : {list}
   Test Cases   : {N} total
   Total Steps  : {N}
   ALM IDs      : {N} populated / {N} pending
   Output CSV   : docs-generated/{m}/alm-extract/suites-extract.csv
   Output JSON  : docs-generated/{m}/alm-extract/suites-extract.json
   Output MD    : docs-generated/{m}/alm-extract/suites-summary.md
   ```

---

## Sub-command: testcases

**Purpose:** Extract a single test case or every test case across all suites, with full step detail and rich content intact.

**tc-id:** A single TC ID (e.g., `TC-DM-SIT-01`) or omit to extract every test case from all suites.

### TC ID routing

| Prefix | Suite |
|---|---|
| TC-DM-SIT… | System Integration |
| TC-DM-UAT… | User Acceptance |
| TC-DM-PERF… | Performance |
| TC-DM-SEC… | Security |
| TC-DM-REG… | Regression |

### Steps

1. Determine scope:
   - If `tc-id` is provided: use the prefix to identify the suite section, then confirm.
   - If omitted: read all suite sections from the test plan document.

2. For each matching test case, extract all fields and steps with rich content intact.

3. Create `docs-generated/{migration-id}/alm-extract/` if it does not exist.

4. Write `docs-generated/{migration-id}/alm-extract/testcases-extract.csv` (metadata only).

5. Write `docs-generated/{migration-id}/alm-extract/testcases-extract.json` (rich content preserved):
   ```json
   {
     "domain": "Data Migration",
     "migration": "{migration-id}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "filter": "{tc-id | all}",
     "test-cases": [ ... ]
   }
   ```

6. Write `docs-generated/{migration-id}/alm-extract/testcases-detail.md`.
   Reproduce each matched test case in full card format. Human-readable review copy before ALM import.

7. If a `tc-id` was given and no matching card was found: stop and report `TC ID {tc-id} not found in test plan for {migration-id}.`

8. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Cases
   ═════════════════════════════
   Migration    : {migration-id}
   Filter       : {tc-id | all}
   Test Cases   : {N}
     TC-DM-SIT-01  SIT   3 steps  ALM: —
     TC-DM-UAT-01  UAT   4 steps  ALM: —
   Total Steps  : {N}
   Output CSV   : docs-generated/{m}/alm-extract/testcases-extract.csv
   Output JSON  : docs-generated/{m}/alm-extract/testcases-extract.json
   Output Detail: docs-generated/{m}/alm-extract/testcases-detail.md
   ```
