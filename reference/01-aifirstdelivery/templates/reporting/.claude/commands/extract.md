Extract test plan, suites, or individual test cases for a Reporting feature into ALM-ready output files. Rich content (markdown, steps as structured arrays) is preserved intact in the JSON output — the primary ALM import artifact.

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
   - Parse each suite reference table: TC ID, ALM ID, Title, Priority, Mapped FR, Context.
   - Note the file link for each suite.

2. Read all four suite files and extract full content with rich formatting intact:
   - `docs-generated/{feature-name}/test-cases/data-accuracy.md`
   - `docs-generated/{feature-name}/test-cases/uat.md`
   - `docs-generated/{feature-name}/test-cases/rls-security.md`
   - `docs-generated/{feature-name}/test-cases/regression.md`

   Each file uses test case cards. For each card extract all header fields and steps.

   **Rich content rule:** Steps, Expected Result, Pre-conditions, Post-conditions, and all multi-line fields must be extracted verbatim — do NOT flatten to a single line. Do NOT strip markdown syntax (`**`, `*`, `` ` ``, `-`, `|` tables, numbered lists, code blocks). Every `\n` in the source must survive unchanged.

   Parse each `# | Action | Expected Result` step row as a `{ step, action, expected }` object.

3. Create `docs-generated/{feature-name}/alm-extract/` if it does not exist.

4. Write `docs-generated/{feature-name}/alm-extract/test-plan-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Feature,Suite ID,Suite Name,TC ID,ALM ID,Title,Priority,Mapped FR,Context,Area Path,Iteration Path,State,Automation Status,Test Type,Step Count
   ```
   - Step Count: total number of step entries (not step content)
   - Enclose fields containing commas or newlines in double quotes

5. Write `docs-generated/{feature-name}/alm-extract/test-plan-extract.json`.
   **Primary ALM import artifact — full rich content preserved.** Structure:
   ```json
   {
     "domain": "Reporting",
     "feature": "{feature-name}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "note": "All text fields contain raw markdown. The ALM Agent must convert markdown to the target tool's rich text format (HTML for Azure DevOps, Atlassian Document Format for Jira) when creating work items.",
     "alm-tool": "{value from constitution/10-alm-configuration.md}",
     "test-suites": [
       {
         "suite-id": "TS-001",
         "suite-name": "Data Accuracy",
         "suite-file": "docs-generated/{feature-name}/test-cases/data-accuracy.md",
         "tc-count": 0,
         "test-cases": [
           {
             "tc-id": "TC-{MODULE}-DA-001",
             "alm-id": null,
             "title": "...",
             "priority": "High",
             "priority-mapped": 2,
             "area-path": "...",
             "iteration-path": "...",
             "state": "Design",
             "automation-status": "Not Automated",
             "test-type": "Data Accuracy",
             "mapped-fr": "FR-001",
             "context": "...",
             "preconditions": "{raw markdown verbatim}",
             "post-conditions": "{raw markdown verbatim}",
             "test-data": "{raw markdown verbatim}",
             "notes": "{raw markdown verbatim}",
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
   - All text fields (`preconditions`, `post-conditions`, `test-data`, `notes`, each `action`, each `expected`) must contain exact markdown from source. Apply only standard JSON string escaping. Never remove markdown syntax.
   - `steps` must be an array of `{ step, action, expected }` objects — never a flat string.
   - `alm-id`: null if not synced; populate from reference table if present.

6. Write `docs-generated/{feature-name}/alm-extract/test-plan-summary.md`.
   - Header block: feature, extraction date, total TC count, total step count
   - One section per suite: suite name, TC count, step count
   - Summary table: `TC ID | Suite | Mapped FR | Title | Priority | Step Count | ALM ID | Status`

7. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Plan
   ════════════════════════════
   Feature      : {feature-name}
   Suites       : 4
     TS-001  Data Accuracy  : {N} TCs, {N} steps
     TS-002  UAT            : {N} TCs, {N} steps
     TS-003  RLS Security   : {N} TCs, {N} steps
     TS-004  Regression     : {N} TCs, {N} steps
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

**suite-name options:** `data-accuracy` | `uat` | `rls-security` | `regression` | `all` (default: `all`)

### Steps

1. Determine which suite(s) to extract. If omitted or `all`, extract all four.

2. For each suite to extract, read the suite file:
   | Argument | File |
   |---|---|
   | `data-accuracy` | `docs-generated/{feature-name}/test-cases/data-accuracy.md` |
   | `uat` | `docs-generated/{feature-name}/test-cases/uat.md` |
   | `rls-security` | `docs-generated/{feature-name}/test-cases/rls-security.md` |
   | `regression` | `docs-generated/{feature-name}/test-cases/regression.md` |

   Also read the matching suite reference table from `docs-generated/{feature-name}/test-plan-and-strategy.md` to pick up current ALM IDs.

3. For each test case card, extract all fields and steps with rich content intact. Parse each `# | Action | Expected Result` step row as a `{ step, action, expected }` object. Preserve markdown in every text field — do not flatten multi-line content.

   **Rich content rule:** Every `\n`, `**`, `*`, `` ` ``, `-`, `|`, numbered-list item in the source must survive unchanged.

4. Create `docs-generated/{feature-name}/alm-extract/` if it does not exist.

5. Write `docs-generated/{feature-name}/alm-extract/suites-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Feature,Suite ID,Suite Name,TC ID,ALM ID,Title,Priority,Mapped FR,Context,State,Step Count
   ```
   Merge ALM IDs from the test plan reference tables where available.

6. Write `docs-generated/{feature-name}/alm-extract/suites-extract.json`.
   **Primary ALM import artifact — full rich content preserved.** Same root structure as `test-plan-extract.json` with `"content-format": "markdown"`. All text fields verbatim markdown. `steps` as array of `{ step, action, expected }` objects.

7. Write `docs-generated/{feature-name}/alm-extract/suites-summary.md`.
   One section per extracted suite: suite name, TC count, step count, and reference table `TC ID | Title | Priority | Mapped FR | Step Count | ALM ID`.

8. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Suites
   ══════════════════════════════
   Feature      : {feature-name}
   Suites       : {list}
   Test Cases   : {N} total
     {suite-name}: {N} TCs, {N} steps
   Total Steps  : {N}
   ALM IDs      : {N} populated / {N} pending
   Output CSV   : docs-generated/{f}/alm-extract/suites-extract.csv  (metadata summary only)
   Output JSON  : docs-generated/{f}/alm-extract/suites-extract.json  (rich content — primary ALM import)
   Output MD    : docs-generated/{f}/alm-extract/suites-summary.md
   ```

---

## Sub-command: testcases

**Purpose:** Extract a single test case or every test case across all suites, with full step detail and rich content intact.

**tc-id:** A single TC ID (e.g., `TC-SALES-DA-001`) or omit to extract every test case from all suites.

### TC ID routing

| Prefix pattern | Suite file |
|---|---|
| …DA… | `data-accuracy.md` |
| …UAT… | `uat.md` |
| …SEC… or …RLS… | `rls-security.md` |
| …R… (regression) | `regression.md` |

If uncertain, scan all suite files.

### Steps

1. Determine scope:
   - If `tc-id` is provided: use the prefix pattern to identify the likely suite file, then confirm. If not found in the expected file, scan all suite files.
   - If omitted: read all suite files.

2. For each matching test case card, extract all fields and steps with rich content intact.

   **Rich content rule:** Do NOT flatten multi-line fields. Do NOT strip markdown syntax. Every `\n`, `**`, `*`, `` ` ``, `-`, `|` in the source must survive unchanged.

3. Cross-reference `docs-generated/{feature-name}/test-plan-and-strategy.md` to pick up any ALM IDs recorded there but not yet in the suite file.

4. Create `docs-generated/{feature-name}/alm-extract/` if it does not exist.

5. Write `docs-generated/{feature-name}/alm-extract/testcases-extract.csv`.
   **Metadata summary only — no step content.** One row per test case. Columns:
   ```
   Domain,Feature,Suite ID,Suite Name,TC ID,ALM ID,Title,Priority,Mapped FR,Context,State,Step Count
   ```

6. Write `docs-generated/{feature-name}/alm-extract/testcases-extract.json`.
   **Primary ALM import artifact — rich content preserved.** Structure:
   ```json
   {
     "domain": "Reporting",
     "feature": "{feature-name}",
     "extracted-date": "{ISO8601 timestamp}",
     "content-format": "markdown",
     "note": "All text fields contain raw markdown. ALM Agent converts to target tool format.",
     "filter": "{tc-id | all}",
     "test-cases": [
       {
         "tc-id": "TC-{MODULE}-DA-001",
         "suite-id": "TS-001",
         "suite-name": "Data Accuracy",
         "alm-id": null,
         "title": "...",
         "priority": "High",
         "priority-mapped": 2,
         "area-path": "...",
         "iteration-path": "...",
         "state": "Design",
         "automation-status": "Not Automated",
         "test-type": "Data Accuracy",
         "mapped-fr": "FR-001",
         "context": "...",
         "preconditions": "{raw markdown verbatim}",
         "post-conditions": "{raw markdown verbatim}",
         "test-data": "{raw markdown verbatim}",
         "notes": "{raw markdown verbatim}",
         "steps": [
           { "step": 1, "action": "{raw markdown verbatim}", "expected": "{raw markdown verbatim}" }
         ],
         "fields": {
           "System.Title": "...",
           "System.AreaPath": "...",
           "System.IterationPath": "...",
           "Microsoft.VSTS.Common.Priority": 2,
           "System.State": "Design",
           "Microsoft.VSTS.TCM.AutomationStatus": "Not Automated",
           "System.Description": "{preconditions markdown}",
           "Microsoft.VSTS.TCM.Steps": "{ALM Agent serialises steps array}"
         }
       }
     ]
   }
   ```
   - `steps` must be an array — never a flat string.
   - All text fields: raw markdown verbatim.

7. Write `docs-generated/{feature-name}/alm-extract/testcases-detail.md`.
   Reproduce each matched test case in full card format (all header fields + full step table). Human-readable review copy before ALM import.

8. If a `tc-id` was given and no matching card was found: stop and report `TC ID {tc-id} not found in any suite file for {feature-name}.`

9. Print the completion report:
   ```
   EXTRACT COMPLETE — Test Cases
   ═════════════════════════════
   Feature      : {feature-name}
   Filter       : {tc-id | all}
   Test Cases   : {N}
     TC-SALES-DA-001   Data Accuracy   3 steps  ALM: 12345
     TC-SALES-UAT-001  UAT             4 steps  ALM: —
     ...
   Total Steps  : {N}
   Output CSV   : docs-generated/{f}/alm-extract/testcases-extract.csv  (metadata summary only)
   Output JSON  : docs-generated/{f}/alm-extract/testcases-extract.json  (rich content — primary ALM import)
   Output Detail: docs-generated/{f}/alm-extract/testcases-detail.md
   ```
