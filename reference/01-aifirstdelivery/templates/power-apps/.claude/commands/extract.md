Extract test plan, suites, or individual test cases for a Power Apps feature into ALM-ready output files. Rich content (markdown, steps as structured arrays) is preserved intact in the JSON output — the primary ALM import artifact.

## Usage

```
/extract testplan  {feature-name}
/extract testsuites {feature-name} [suite-name]
/extract testcases  {feature-name} [tc-id]
```

Read the first argument after `/extract` to determine the sub-command, then follow the matching section.

---

## Sub-command: testplan

**Purpose:** Read the full test plan and all suite files, then write ALM-ready output. Every TC ID is the stable unique identifier used to sync ALM IDs back.

### Steps

1. Read `docs-generated/{feature-name}/test-plan-and-strategy.md`.
   - Extract plan metadata: feature name, version, generated date.
   - Parse each suite reference table (§3.1–§3.7): TC ID, ALM ID, and the suite-specific columns.
   - Note the file link for each suite and whether the Copilot suite (§3.4 / `copilot.md`) is present.

2. Read all suite files that exist and extract full content with rich formatting intact:
   - `docs-generated/{feature-name}/test-cases/canvas.md`
   - `docs-generated/{feature-name}/test-cases/model-driven.md`
   - `docs-generated/{feature-name}/test-cases/flow.md`
   - `docs-generated/{feature-name}/test-cases/copilot.md` *(skip if absent)*
   - `docs-generated/{feature-name}/test-cases/security.md`
   - `docs-generated/{feature-name}/test-cases/uat.md`
   - `docs-generated/{feature-name}/test-cases/regression.md`

   Each file uses a markdown table. For each row extract all columns: TC ID, ALM ID, FR Ref, Screen/Form/Flow/Topic (suite-specific), Scenario, Steps, Expected Result, Priority, and any additional suite-specific columns.

   **Rich content rule:** Steps, Expected Result, and all multi-line fields must be extracted verbatim — do NOT flatten to a single line. Do NOT strip markdown syntax (`**`, `*`, `` ` ``, `-`, `|` tables, numbered lists, code blocks). Every `\n` in the source must survive unchanged.

   Parse the Steps cell into a `{ step, action, expected }` array wherever the cell contains numbered or bulleted step lines.

3. Create `docs-generated/{feature-name}/alm-extract/` if it does not exist.

4. Write `docs-generated/{feature-name}/alm-extract/test-plan-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Feature,Suite ID,Suite Name,TC ID,ALM ID,FR Ref,Component,Scenario,Priority,Context,State,Step Count
   ```
   - Component: Screen / Form / Flow / Topic / Persona / Existing Feature (suite-specific)
   - Step Count: total number of step entries (not step content)
   - Enclose fields containing commas or newlines in double quotes

5. Write `docs-generated/{feature-name}/alm-extract/test-plan-extract.json`.
   **Primary ALM import artifact — full rich content preserved.** Structure:
   ```json
   {
     "domain": "Power Apps",
     "feature": "{feature-name}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "note": "All text fields contain raw markdown. The ALM Agent must convert markdown to the target tool's rich text format (HTML for Azure DevOps, Atlassian Document Format for Jira) when creating work items.",
     "alm-tool": "{value from constitution/10-alm-configuration.md}",
     "test-suites": [
       {
         "suite-id": "TS-001",
         "suite-name": "Canvas App",
         "suite-file": "docs-generated/{feature-name}/test-cases/canvas.md",
         "tc-count": 0,
         "test-cases": [
           {
             "tc-id": "TC-CA001",
             "alm-id": null,
             "title": "{scenario}",
             "priority": "High",
             "priority-mapped": 2,
             "fr-ref": "FR-001",
             "component": "{screen or form name}",
             "context": "{Role / Risk / additional column value}",
             "state": "Design",
             "automation-status": "Not Automated",
             "preconditions": "{raw markdown verbatim}",
             "steps": [
               {
                 "step": 1,
                 "action": "{raw markdown verbatim}",
                 "expected": "{raw markdown verbatim}"
               }
             ],
             "fields": {
               "System.Title": "{scenario}",
               "Microsoft.VSTS.Common.Priority": 2,
               "System.State": "Design",
               "Microsoft.VSTS.TCM.AutomationStatus": "Not Automated",
               "System.Description": "{component + fr-ref + preconditions as markdown — ALM Agent converts to HTML}",
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
   - All text fields (`preconditions`, each `action`, each `expected`, scenario, notes) must contain exact markdown text from source. Apply only standard JSON string escaping. Never remove markdown syntax.
   - `steps` must be an array of `{ step, action, expected }` objects — never a flat string. If a cell contains a narrative paragraph, wrap as `[{ "step": 1, "action": "{full text}", "expected": "{expected}" }]`.
   - `alm-id`: null if not synced; populate from reference table if present.

6. Write `docs-generated/{feature-name}/alm-extract/test-plan-summary.md`.
   - Header block: feature, extraction date, total TC count, total step count
   - One section per suite: suite name, TC count, step count
   - Summary table: `TC ID | Suite | Component | Scenario | Priority | Step Count | ALM ID`

7. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Plan
   ════════════════════════════
   Feature      : {feature-name}
   Suites       : {N} (copilot {present/omitted})
     TS-001  Canvas App             : {N} TCs, {N} steps
     TS-002  Model-Driven App       : {N} TCs, {N} steps
     TS-003  Power Automate Flows   : {N} TCs, {N} steps
     TS-004  Copilot Studio         : {N} TCs, {N} steps  (if present)
     TS-005  Security               : {N} TCs, {N} steps
     TS-006  UAT                    : {N} TCs, {N} steps
     TS-007  Regression             : {N} TCs, {N} steps
   Total TCs    : {N}
   Total Steps  : {N}
   ALM IDs      : {N} populated / {N} pending sync
   Output CSV   : docs-generated/{f}/alm-extract/test-plan-extract.csv  (metadata summary only)
   Output JSON  : docs-generated/{f}/alm-extract/test-plan-extract.json  (rich content — primary ALM import)
   Output MD    : docs-generated/{f}/alm-extract/test-plan-summary.md
   Next step: /alm sync-testplan {f}  (after creating test cases in ALM)
   ```

---

## Sub-command: testsuites

**Purpose:** Extract one or all test suites with full step detail and rich content intact.

**suite-name options:** `canvas` | `model-driven` | `flow` | `copilot` | `security` | `uat` | `regression` | `all` (default: `all`)

### Steps

1. Determine which suite(s) to extract. If omitted or `all`, extract all suites that have files present.

2. For each suite to extract, read the suite file:
   | Argument | File |
   |---|---|
   | `canvas` | `docs-generated/{feature-name}/test-cases/canvas.md` |
   | `model-driven` | `docs-generated/{feature-name}/test-cases/model-driven.md` |
   | `flow` | `docs-generated/{feature-name}/test-cases/flow.md` |
   | `copilot` | `docs-generated/{feature-name}/test-cases/copilot.md` |
   | `security` | `docs-generated/{feature-name}/test-cases/security.md` |
   | `uat` | `docs-generated/{feature-name}/test-cases/uat.md` |
   | `regression` | `docs-generated/{feature-name}/test-cases/regression.md` |

   If a file does not exist (e.g., `copilot.md` when Copilot is out of scope), skip it and note in the report.
   Also read the matching reference table from `docs-generated/{feature-name}/test-plan-and-strategy.md` to pick up current ALM IDs.

3. For each test case row, extract all columns with rich content intact. Parse the Steps cell into a `{ step, action, expected }` array. Preserve markdown in every text field.

   **Rich content rule:** Every `\n`, `**`, `*`, `` ` ``, `-`, `|`, numbered-list item in the source must survive unchanged.

4. Create `docs-generated/{feature-name}/alm-extract/` if it does not exist.

5. Write `docs-generated/{feature-name}/alm-extract/suites-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Feature,Suite ID,Suite Name,TC ID,ALM ID,FR Ref,Component,Scenario,Priority,Context,State,Step Count
   ```
   Merge ALM IDs from the test plan reference tables where available.

6. Write `docs-generated/{feature-name}/alm-extract/suites-extract.json`.
   **Primary ALM import artifact — full rich content preserved.** Same root structure as `test-plan-extract.json` with `"content-format": "markdown"`. All text fields verbatim markdown. `steps` as array of `{ step, action, expected }` objects.

7. Write `docs-generated/{feature-name}/alm-extract/suites-summary.md`.
   One section per extracted suite: suite name, TC count, step count, and reference table `TC ID | Component | Scenario | Priority | Step Count | ALM ID`.

8. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Suites
   ══════════════════════════════
   Feature      : {feature-name}
   Suites       : {list}
   Test Cases   : {N} total
     {suite-name}: {N} TCs, {N} steps
   Skipped      : {any suite requested but file absent}
   Total Steps  : {N}
   ALM IDs      : {N} populated / {N} pending
   Output CSV   : docs-generated/{f}/alm-extract/suites-extract.csv  (metadata summary only)
   Output JSON  : docs-generated/{f}/alm-extract/suites-extract.json  (rich content — primary ALM import)
   Output MD    : docs-generated/{f}/alm-extract/suites-summary.md
   ```

---

## Sub-command: testcases

**Purpose:** Extract a single test case or every test case across all suites, with full step detail and rich content intact.

**tc-id:** A single TC ID (e.g., `TC-CA001`, `TC-FL002`) or omit to extract every test case from all suites.

### TC ID routing

| Prefix | Suite file |
|---|---|
| TC-CA… | `canvas.md` |
| TC-MD… | `model-driven.md` |
| TC-FL… | `flow.md` |
| TC-CO… | `copilot.md` |
| TC-SEC… | `security.md` |
| TC-U… | `uat.md` |
| TC-R… | `regression.md` |

### Steps

1. Determine scope:
   - If `tc-id` is provided: use the prefix to identify the likely suite file. If not found in the expected file, scan all suite files.
   - If omitted: read all suite files that are present.

2. For each matching test case row, extract all columns with rich content intact.

   **Rich content rule:** Do NOT flatten multi-line fields. Do NOT strip markdown syntax. Every `\n` in the source must survive unchanged.

   Parse the Steps cell into a `{ step, action, expected }` array. If the cell is a narrative paragraph, wrap as a single-item array.

3. Cross-reference `docs-generated/{feature-name}/test-plan-and-strategy.md` to pick up any ALM IDs recorded there but not yet in the suite file.

4. Create `docs-generated/{feature-name}/alm-extract/` if it does not exist.

5. Write `docs-generated/{feature-name}/alm-extract/testcases-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Feature,Suite ID,Suite Name,TC ID,ALM ID,FR Ref,Component,Scenario,Priority,Context,State,Step Count
   ```

6. Write `docs-generated/{feature-name}/alm-extract/testcases-extract.json`.
   **Primary ALM import artifact — rich content preserved.** Structure:
   ```json
   {
     "domain": "Power Apps",
     "feature": "{feature-name}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "note": "All text fields contain raw markdown. ALM Agent converts to target tool format.",
     "filter": "{tc-id | all}",
     "test-cases": [
       {
         "tc-id": "TC-CA001",
         "suite-id": "TS-001",
         "suite-name": "Canvas App",
         "alm-id": null,
         "title": "{scenario}",
         "priority": "High",
         "priority-mapped": 2,
         "fr-ref": "FR-001",
         "component": "{screen or form name}",
         "context": "{Role / Risk / additional column value}",
         "state": "Design",
         "automation-status": "Not Automated",
         "preconditions": "{raw markdown verbatim}",
         "steps": [
           { "step": 1, "action": "{raw markdown verbatim}", "expected": "{raw markdown verbatim}" }
         ],
         "fields": {
           "System.Title": "{scenario}",
           "Microsoft.VSTS.Common.Priority": 2,
           "System.State": "Design",
           "Microsoft.VSTS.TCM.AutomationStatus": "Not Automated",
           "System.Description": "{component + fr-ref + preconditions as markdown — ALM Agent converts to HTML}",
           "Microsoft.VSTS.TCM.Steps": "{ALM Agent serialises steps array into tool-specific format}"
         }
       }
     ]
   }
   ```
   - `steps` must be an array — never a flat string.
   - All text fields: raw markdown verbatim.

7. Write `docs-generated/{feature-name}/alm-extract/testcases-detail.md`.
   Reproduce each matched test case in full format (all fields + full step table). Human-readable review copy before ALM import.

8. If a `tc-id` was given and no matching row was found: stop and report `TC ID {tc-id} not found in any suite file for {feature-name}.`

9. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Cases
   ═════════════════════════════
   Feature      : {feature-name}
   Filter       : {tc-id | all}
   Test Cases   : {N}
     TC-CA001  Canvas App       3 steps  ALM: 12345
     TC-FL001  Flow             4 steps  ALM: —
     ...
   Total Steps  : {N}
   Output CSV   : docs-generated/{f}/alm-extract/testcases-extract.csv  (metadata summary only)
   Output JSON  : docs-generated/{f}/alm-extract/testcases-extract.json  (rich content — primary ALM import)
   Output Detail: docs-generated/{f}/alm-extract/testcases-detail.md
   ```
