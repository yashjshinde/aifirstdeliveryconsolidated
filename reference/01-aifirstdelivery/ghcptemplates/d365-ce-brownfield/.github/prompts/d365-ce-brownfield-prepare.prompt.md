---
mode: agent
description: "Normalise an unstructured D365 CE repository into the standard input/ layout for scanning. Triggers on: 'prepare', 'normalise artefacts', 'prepare input'."
---

# /d365-ce-brownfield-prepare — Normalise an Unstructured Repository into the Standard `input/` Layout

Inspect a directory of unstructured artefacts and copy files into the correct `input/` subfolders
so the agent can run `/d365-ce-brownfield-scan` and subsequent commands.

## Usage

```
/d365-ce-brownfield-prepare {path}
/d365-ce-brownfield-prepare {path} --overwrite
```

`{path}` is the absolute or relative path to the source directory (e.g. a cloned repo, a downloaded ZIP extract, or a shared drive folder).

`--overwrite` — when present, files that already exist in `input/` and whose source copy is newer are overwritten instead of flagged. Use this when re-running after source files have been updated and you want to pick up all changes automatically.

## Behaviour

- **Copy, not move** — original files at `{path}` are never modified or deleted.
- **Best-effort inference** — file type is determined from extension, JSON schema, and XML root element. Files that cannot be confidently classified are copied to `input/documents/` and flagged.
- **Cross-type files** — a file that matches multiple categories is placed in the most specific category and flagged `⚠ CROSS-TYPE` in the report.
- **ZIP files** — D365 solution ZIPs are detected and extracted into `input/solutions/{ZipName}/` automatically. Non-solution ZIPs are noted in the report as `⚠ NEEDS MANUAL EXTRACT`.
- **Duplicates** — if a file already exists in the target `input/` location:
  - If the source file is **newer** than the existing `input/` copy:
    - Without `--overwrite` → flag as `⚠ ALREADY EXISTS — SOURCE IS NEWER — re-run with --overwrite to pick up the update` (do not overwrite automatically).
    - With `--overwrite` → overwrite the existing `input/` copy and note as `↺ OVERWRITTEN — source was newer`.
  - If the source file is same age or older → note as `⚠ ALREADY EXISTS — skipped` (regardless of `--overwrite`).
- **Incremental use** — `/d365-ce-brownfield-prepare` can be called multiple times on different source paths to build up `input/` incrementally. Each run adds new files; files already present in `input/` are never overwritten. Run `/d365-ce-brownfield-scan` only after all `/d365-ce-brownfield-prepare` calls are complete.

---

## Steps

### 1. Read Constitution

Read all files in `constitution/` before proceeding.

### 2. Validate Source Path

Check that `{path}` exists and is a directory.
If not found, stop: "`{path}` does not exist or is not a directory."

If `{path}` appears to already be an `input/` folder (contains `solutions/` or `src/`), warn:
> "This looks like an already-prepared `input/` folder. Run `/d365-ce-brownfield-scan` instead."

### 3. Walk Source Directory

Recursively enumerate all files in `{path}`. For each file, determine its category using the rules below.

#### Classification Rules (apply in order; use first match)

| Priority | Signal | Target `input/` folder |
|---|---|---|
| 1 | File is a `.zip` with a `solution.xml` entry inside | Extract to `input/solutions/{ZipBaseName}/` |
| 2 | File is a `.zip` (unknown contents) | Note as `⚠ NEEDS MANUAL EXTRACT` — do not copy |
| 3 | File is `solution.xml` and parent folder has `Entities/` or `PluginAssemblies/` or `Workflows/` siblings | Copy entire parent folder to `input/solutions/{ParentFolderName}/` |
| 4 | File path contains `Entities/` and filename is `Entity.xml` or `attribute.xml` or relationship XML | Copy entire containing solution folder to `input/solutions/{SolutionFolderName}/` |
| 5 | File is `.cs` and contains `IPlugin` or `CrmPluginRegistration` | Copy to `input/src/plugins/{AssemblyFolderName}/` |
| 6 | File is `.cs` (other C#) | Copy to `input/src/plugins/{AssemblyFolderName}/` |
| 7 | File is `.js` or `.ts` and path contains `web-resources` or `webresources` | Copy to `input/src/web-resources/` (preserving subfolder structure) |
| 8 | File is `ControlManifest.Input.xml` or `index.ts` and parent is a PCF control folder | Copy entire control folder to `input/src/pcf/{ControlFolderName}/` |
| 9 | File is `function.json` or has `[Function("...")]` pattern and is `.cs` or `.py` | Copy containing function app folder to `input/integrations/azure-functions/{AppFolderName}/` |
| 10 | File is `.json` with `definition.triggers` and `definition.actions` at root | Copy to `input/integrations/logic-apps/` |
| 11 | File is `.json` and `$schema` contains `pipeline` or root has `"type": "pipeline"` | Copy to `input/adf/pipelines/` |
| 12 | File is `.json` and `properties.type` matches linked service types (`AzureSqlDatabase`, `SftpServer`, `AzureDataLakeStorage`, `AzureBlob`, `Dataverse`, `CosmosDb`, `SftpServer`) | Copy to `input/adf/linkedServices/` |
| 13 | File is `.json` and `properties.type` matches dataset types (`AzureSqlTable`, `DelimitedText`, `Json`, `Parquet`, `Binary`) | Copy to `input/adf/datasets/` |
| 14 | File is `.json` and `properties.type` = `MappingDataFlow` or path contains `dataflow` | Copy to `input/adf/dataflows/` |
| 15 | File is `.json` and `properties.type` matches trigger types (`ScheduleTrigger`, `TumblingWindowTrigger`, `BlobEventsTrigger`, `CustomEventsTrigger`) | Copy to `input/adf/triggers/` |
| 16 | File is `.rdl` or `.rdlc` (SSRS report definition) | Copy to `input/reporting/` |
| 17 | File is `.rds` (SSRS shared data source) | Copy to `input/reporting/` |
| 18 | File is `.pbix` or `.pbit` (Power BI) | Copy to `input/reporting/` |
| 19 | File is `.md` or `.txt` | Copy to `input/documents/` |
| 20 | File is `.csproj`, `.sln`, `package.json`, `*.config` | Copy alongside its owner (if owner was classified); otherwise copy to `input/documents/` and flag `⚠ SUPPORT FILE` |
| 21 | No match | Copy to `input/documents/` and flag `⚠ UNCLASSIFIED` |

**Cross-type rule:** If a file matches two or more rules at priorities 5–20, place it in the highest-priority match and flag `⚠ CROSS-TYPE — also matched: {other category}`.

**ADF flat export:** Some ADF exports are a single folder of mixed JSON files without `pipelines/`, `linkedServices/` subfolders. After applying rules 11–15, if more than 3 ADF JSON files were found at the same flat level, note in the report: "ADF export appears flat — files classified individually into `input/adf/{subfolder}/`."

### 4. Copy Files

Copy each classified file (or folder) to its target location under `input/`.
- Create target directories as needed.
- For solution folder copies (rules 3–4): copy the entire folder tree rooted at the solution folder.
- For PCF and function app copies: copy the entire control / app folder tree.
- Preserve original file names — do not rename.
- Apply duplicate logic from the Behaviour section: skip same-age/older duplicates; overwrite newer files only when `--overwrite` is set.

### 5. Extract ZIP Solutions (rule 1)

For each D365 solution ZIP detected:
- Extract the ZIP to `input/solutions/{ZipBaseName}/`.
- Verify extraction succeeded (check for `solution.xml` at root of extracted folder).
- If extraction fails, note as `⚠ EXTRACTION FAILED` and leave the ZIP in `input/documents/`.

### 6. Write Prepare Report

Write `docs-generated/prepare-report-{YYYY-MM-DD-HHMM}.md` (timestamped so each run is preserved):

```markdown
# Prepare Report

**Source path:** {path}
**Prepared at:** {timestamp}

## Summary

| Category | Files Copied | Folders Copied | Skipped | Flagged |
|---|---|---|---|---|
| D365 Solutions | | | | |
| Plugin Source | | | | |
| Web Resources | | | | |
| PCF Controls | | | | |
| Azure Functions | | | | |
| Logic Apps | | | | |
| ADF Pipelines | | | | |
| ADF Linked Services | | | | |
| ADF Datasets | | | | |
| ADF Dataflows | | | | |
| ADF Triggers | | | | |
| SSRS Reports | | | | |
| Power BI | | | | |
| Documents | | | | |
| Unclassified | | | | |

## File Classification Detail

| Source File | Target Location | Notes |
|---|---|---|
| {relative path from source} | {input/... path} | {flag or blank} |

## Items Requiring Attention

| File | Issue | Action Required |
|---|---|---|
| {file} | ⚠ NEEDS MANUAL EXTRACT — ZIP contents unknown | Extract manually into `input/solutions/{name}/` or `input/integrations/` as appropriate |
| {file} | ⚠ UNCLASSIFIED — could not determine artifact type | Review and move to the correct `input/` subfolder manually |
| {file} | ⚠ CROSS-TYPE — also matched: {other} | Verify placement is correct |
| {file} | ⚠ ALREADY EXISTS — skipped | File already present in `input/` and source is same age or older; no action needed |
| {file} | ⚠ ALREADY EXISTS — SOURCE IS NEWER | Re-run with `--overwrite` to pick up the update, or delete `{input-path}` and re-run /d365-ce-brownfield-prepare |
| {file} | ↺ OVERWRITTEN — source was newer | File overwritten because `--overwrite` was set |
| {file} | ⚠ EXTRACTION FAILED | ZIP could not be extracted; copy manually |

## Multi-Domain Artifacts Detected

{List any ADF, SSRS, or Power BI artifacts found, with a note about their documentation and implementation ownership}

Example:
- **ADF artifacts** found: {N} pipelines, {N} linked services, {N} datasets — copied to `input/adf/`. Run `/d365-ce-brownfield-document adf` after `/d365-ce-brownfield-scan`. Implementation owner: Data Migration agent.
- **SSRS reports** found: {N} .rdl files — copied to `input/reporting/`. These are D365 CE Reporting Services reports. Run `/d365-ce-brownfield-document reporting` after `/d365-ce-brownfield-scan`.
- **Power BI files** found: {N} .pbix files — copied to `input/reporting/`. Run `/d365-ce-brownfield-document reporting` after `/d365-ce-brownfield-scan`. Implementation owner: Reporting agent.
```

### 6b. Update Prepare History

Append one entry to `docs-generated/prepare-history.md` (create if absent):

```markdown
| {YYYY-MM-DD HH:MM} | {source path} | {N files copied} | {N files skipped} | {N flags raised} | [Report](prepare-report-{YYYY-MM-DD-HHMM}.md) |
```

The history file header (written once on creation):
```markdown
# Prepare History

| Timestamp | Source Path | Files Copied | Files Skipped | Flags Raised | Report |
|---|---|---|---|---|---|
```

### 7. Completion Report

```
PREPARE COMPLETE
════════════════
Source          : {path}
Files found     : {N total}
Files copied    : {N}
Folders copied  : {N}
ZIPs extracted  : {N}
Overwritten     : {N}  (--overwrite was set; source was newer)
Skipped         : {N}  (already existed — same age or older)
Flagged         : {N}  items need attention  (including {N} SOURCE IS NEWER — re-run with --overwrite)

Multi-domain artifacts:
  ADF pipelines   : {N found}
  SSRS reports    : {N found}
  Power BI files  : {N found}

Report          : docs-generated/prepare-report-{YYYY-MM-DD-HHMM}.md
History         : docs-generated/prepare-history.md

Next steps:
  /d365-ce-brownfield-scan    — build the component inventory from the prepared input/
  (or run /d365-ce-brownfield-prepare {another-path} again to add more artefacts before scanning)
```
