Extract test plan, suites, or individual test cases for a D365 F&O requirement into ALM-ready output files. Rich content (markdown, X++ code blocks, steps as structured arrays) is preserved intact in the JSON output — the primary ALM import artifact.

## Usage

```
/extract testplan  {requirement-name}
/extract testsuites {requirement-name} [suite-name]
/extract testcases  {requirement-name} [tc-id]
```

Read the first argument after `/extract` to determine the sub-command, then follow the matching section.

---

## Sub-command: testplan

**Purpose:** Read the full test plan and all suite files, then write ALM-ready output. Every TC ID is the stable unique identifier used to sync ALM IDs back.

### Steps

1. Read `docs/{requirement-name}/test-plan.md`.
   - Extract plan metadata: requirement name, version, generated date.
   - Parse each suite reference table (§3.1–§3.6): TC ID, ALM ID, Rule-ID/Ref, Description, Role, Object, Scenario, SLA Target, Priority.
   - Note whether the Performance suite (§3.6) is present or marked as omitted.
   - Note the file link for each suite.

2. Read all suite files that are present and extract full content with rich formatting intact:
   - `docs/{requirement-name}/test-cases/unit.md`
   - `docs/{requirement-name}/test-cases/sit-functional.md`
   - `docs/{requirement-name}/test-cases/sit-integration.md`
   - `docs/{requirement-name}/test-cases/uat.md`
   - `docs/{requirement-name}/test-cases/security.md`
   - `docs/{requirement-name}/test-cases/performance.md` *(skip if absent)*

   Each file uses a markdown table. For each row extract all columns: TC ID, ALM ID, Rule-ID/Ref, suite-specific context column (Class/Method / Entity/Interface / Role / Object), Description/Business Scenario, Pre-conditions, Steps, Expected Result / Assertion, Priority, Environment, Status, and any additional suite-specific columns (Load/Volume, SLA Target).

   **Rich content rule:** Steps, Expected Result, Pre-conditions, and all multi-line fields must be extracted verbatim — do NOT flatten to a single line. Do NOT strip markdown syntax (`**`, `*`, `` ` ``, `-`, `|` tables, numbered lists, code blocks, X++ snippets). Every `\n` in the source must survive unchanged.

   Parse the Steps cell content into a `{ step, action, expected }` array wherever the cell contains numbered or sequenced step lines.

3. Create `docs/{requirement-name}/alm-extract/` if it does not exist.

4. Write `docs/{requirement-name}/alm-extract/test-plan-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Requirement,Suite ID,Suite Name,TC ID,ALM ID,Rule-ID/Ref,Description,Priority,Context,Environment,Status,Step Count
   ```
   - Context: Class/Method for Unit; Entity/Interface for SIT-Integration; Role for Security; Object for Performance
   - Step Count: total number of step entries (not the step text)
   - Enclose fields containing commas or newlines in double quotes

5. Write `docs/{requirement-name}/alm-extract/test-plan-extract.json`.
   **Primary ALM import artifact — full rich content preserved.** Structure:
   ```json
   {
     "domain": "D365 F&O",
     "requirement": "{requirement-name}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "note": "All text fields contain raw markdown. The ALM Agent must convert markdown to the target tool's rich text format (HTML for Azure DevOps, Atlassian Document Format for Jira) when creating work items.",
     "alm-tool": "{value from constitution/10-alm-configuration.md}",
     "test-suites": [
       {
         "suite-id": "TS-001",
         "suite-name": "X++ Unit Tests",
         "suite-file": "docs/{requirement-name}/test-cases/unit.md",
         "tc-count": 0,
         "test-cases": [
           {
             "tc-id": "TC-U001",
             "alm-id": null,
             "title": "{description}",
             "rule-id-ref": "BR-VAL-001",
             "priority": "High",
             "priority-mapped": 2,
             "context": "{Class/Method}",
             "environment": "DEV",
             "status": "Pending",
             "state": "Design",
             "automation-status": "Not Automated",
             "preconditions": "{raw markdown verbatim — bullet lists and tables preserved}",
             "steps": [
               {
                 "step": 1,
                 "action": "{raw markdown verbatim — X++ code blocks preserved}",
                 "expected": "{raw markdown verbatim — assertion details preserved}"
               }
             ],
             "fields": {
               "System.Title": "{description}",
               "Microsoft.VSTS.Common.Priority": 2,
               "System.State": "Design",
               "Microsoft.VSTS.TCM.AutomationStatus": "Not Automated",
               "System.Description": "{rule-id-ref + preconditions as markdown — ALM Agent converts to HTML}",
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
   - All text fields (`preconditions`, each `action`, each `expected`, description, notes) must contain exact markdown text from the source file. Apply only standard JSON string escaping. Never remove markdown syntax including X++ code blocks (` ```xpp ``` `).
   - `steps` must be an array of `{ step, action, expected }` objects — never a flat string. If a cell contains a narrative paragraph, wrap as `[{ "step": 1, "action": "{full text}", "expected": "{expected}" }]`.
   - `alm-id`: null if not synced; populate from reference table if present.

6. Write `docs/{requirement-name}/alm-extract/test-plan-summary.md`.
   - Header block: requirement, extraction date, total TC count, total step count
   - One section per suite: suite name, TC count, step count
   - Summary table: `TC ID | Suite | Rule-ID/Ref | Description | Priority | Step Count | ALM ID | Status`

7. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Plan
   ════════════════════════════
   Requirement  : {requirement-name}
   Suites       : {N}
     TS-001  X++ Unit Tests         : {N} TCs, {N} steps
     TS-002  SIT — Functional       : {N} TCs, {N} steps
     TS-003  SIT — Integration      : {N} TCs, {N} steps
     TS-004  UAT                    : {N} TCs, {N} steps
     TS-005  Security               : {N} TCs, {N} steps
     TS-006  Performance            : {N} TCs, {N} steps  (if present)
   Total TCs    : {N}
   Total Steps  : {N}
   ALM IDs      : {N} populated / {N} pending sync
   Output CSV   : docs/{req}/alm-extract/test-plan-extract.csv  (metadata summary only)
   Output JSON  : docs/{req}/alm-extract/test-plan-extract.json  (rich content — primary ALM import)
   Output MD    : docs/{req}/alm-extract/test-plan-summary.md
   Next step: /alm sync-testplan {req}  (after creating test cases in ALM)
   ```

---

## Sub-command: testsuites

**Purpose:** Extract one or all test suites with full step detail and rich content intact.

**suite-name options:** `unit` | `sit-functional` | `sit-integration` | `uat` | `security` | `performance` | `all` (default: `all`)

### Steps

1. Determine which suite(s) to extract. If omitted or `all`, extract all suites that have files present.

2. For each suite to extract, read the suite file:
   | Argument | File |
   |---|---|
   | `unit` | `docs/{requirement-name}/test-cases/unit.md` |
   | `sit-functional` | `docs/{requirement-name}/test-cases/sit-functional.md` |
   | `sit-integration` | `docs/{requirement-name}/test-cases/sit-integration.md` |
   | `uat` | `docs/{requirement-name}/test-cases/uat.md` |
   | `security` | `docs/{requirement-name}/test-cases/security.md` |
   | `performance` | `docs/{requirement-name}/test-cases/performance.md` |

   If a file does not exist (e.g., `performance.md` when Performance is out of scope), skip it and note in the report.
   Also read the matching reference table from `docs/{requirement-name}/test-plan.md` to pick up current ALM IDs.

3. For each test case row, extract all columns with rich content intact. Parse the Steps cell into a `{ step, action, expected }` array. Preserve markdown in every text field including X++ code blocks.

   **Rich content rule:** Every `\n`, `**`, `*`, `` ` ``, `-`, `|`, numbered-list item in the source must survive unchanged.

4. Create `docs/{requirement-name}/alm-extract/` if it does not exist.

5. Write `docs/{requirement-name}/alm-extract/suites-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Requirement,Suite ID,Suite Name,TC ID,ALM ID,Rule-ID/Ref,Description,Priority,Context,Environment,Status,Step Count
   ```
   Merge ALM IDs from the test plan reference tables where available.

6. Write `docs/{requirement-name}/alm-extract/suites-extract.json`.
   **Primary ALM import artifact — full rich content preserved.** Same root structure as `test-plan-extract.json` with `"content-format": "markdown"`. All text fields verbatim markdown including X++ code blocks. `steps` as array of `{ step, action, expected }` objects.

7. Write `docs/{requirement-name}/alm-extract/suites-summary.md`.
   One section per extracted suite: suite name, TC count, step count, and reference table `TC ID | Rule-ID/Ref | Description | Priority | Step Count | ALM ID | Status`.

8. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Suites
   ══════════════════════════════
   Requirement  : {requirement-name}
   Suites       : {list}
   Test Cases   : {N} total
     {suite-name}: {N} TCs, {N} steps
   Skipped      : {any suite requested but file absent}
   Total Steps  : {N}
   ALM IDs      : {N} populated / {N} pending
   Output CSV   : docs/{req}/alm-extract/suites-extract.csv  (metadata summary only)
   Output JSON  : docs/{req}/alm-extract/suites-extract.json  (rich content — primary ALM import)
   Output MD    : docs/{req}/alm-extract/suites-summary.md
   ```

---

## Sub-command: testcases

**Purpose:** Extract a single test case or every test case across all suites, with full step detail and rich content intact.

**tc-id:** A single TC ID (e.g., `TC-U001`, `TC-SF003`) or omit to extract every test case from all suites.

### TC ID routing

| Prefix | Suite file |
|---|---|
| TC-U… | `unit.md` |
| TC-SF… | `sit-functional.md` |
| TC-SI… | `sit-integration.md` |
| TC-UAT… | `uat.md` |
| TC-SEC… | `security.md` |
| TC-P… | `performance.md` |

### Steps

1. Determine scope:
   - If `tc-id` is provided: use the prefix to identify the likely suite file. If not found, scan all suite files.
   - If omitted: read all suite files that are present.

2. For each matching test case row, extract all columns with rich content intact including X++ code blocks.

   **Rich content rule:** Do NOT flatten multi-line fields. Do NOT strip markdown syntax. Every `\n` in the source must survive unchanged.

   Parse the Steps cell into a `{ step, action, expected }` array. If the cell is a narrative paragraph, wrap as a single-item array.

3. Cross-reference `docs/{requirement-name}/test-plan.md` to pick up any ALM IDs recorded there but not yet in the suite file.

4. Create `docs/{requirement-name}/alm-extract/` if it does not exist.

5. Write `docs/{requirement-name}/alm-extract/testcases-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Requirement,Suite ID,Suite Name,TC ID,ALM ID,Rule-ID/Ref,Description,Priority,Context,Environment,Status,Step Count
   ```

6. Write `docs/{requirement-name}/alm-extract/testcases-extract.json`.
   **Primary ALM import artifact — rich content preserved.** Structure:
   ```json
   {
     "domain": "D365 F&O",
     "requirement": "{requirement-name}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "note": "All text fields contain raw markdown. ALM Agent converts to target tool format.",
     "filter": "{tc-id | all}",
     "test-cases": [
       {
         "tc-id": "TC-U001",
         "suite-id": "TS-001",
         "suite-name": "X++ Unit Tests",
         "alm-id": null,
         "title": "{description}",
         "rule-id-ref": "BR-VAL-001",
         "priority": "High",
         "priority-mapped": 2,
         "context": "{Class/Method}",
         "environment": "DEV",
         "status": "Pending",
         "state": "Design",
         "automation-status": "Not Automated",
         "preconditions": "{raw markdown verbatim — bullet lists and tables preserved}",
         "steps": [
           { "step": 1, "action": "{raw markdown verbatim — X++ code blocks preserved}", "expected": "{raw markdown verbatim}" }
         ],
         "fields": {
           "System.Title": "{description}",
           "Microsoft.VSTS.Common.Priority": 2,
           "System.State": "Design",
           "Microsoft.VSTS.TCM.AutomationStatus": "Not Automated",
           "System.Description": "{rule-id-ref + preconditions as markdown — ALM Agent converts to HTML}",
           "Microsoft.VSTS.TCM.Steps": "{ALM Agent serialises steps array into tool-specific format}"
         }
       }
     ]
   }
   ```
   - `steps` must be an array — never a flat string.
   - All text fields: raw markdown verbatim including X++ code blocks.

7. Write `docs/{requirement-name}/alm-extract/testcases-detail.md`.
   Reproduce each matched test case in full format (all fields + full step table). Human-readable review copy before ALM import.

8. If a `tc-id` was given and no matching row was found: stop and report `TC ID {tc-id} not found in any suite file for {requirement-name}.`

9. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Cases
   ═════════════════════════════
   Requirement  : {requirement-name}
   Filter       : {tc-id | all}
   Test Cases   : {N}
     TC-U001    X++ Unit         3 steps  ALM: —
     TC-SF001   SIT-Functional   4 steps  ALM: 12345
     ...
   Total Steps  : {N}
   Output CSV   : docs/{req}/alm-extract/testcases-extract.csv  (metadata summary only)
   Output JSON  : docs/{req}/alm-extract/testcases-extract.json  (rich content — primary ALM import)
   Output Detail: docs/{req}/alm-extract/testcases-detail.md
   ```
