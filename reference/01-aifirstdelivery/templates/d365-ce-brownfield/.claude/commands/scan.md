# /scan — Discover and Catalogue All Project Components

Read all artefacts from `input/` and produce a single unified component inventory for the project.
This is the foundation command — all other commands depend on it.

The project has one codebase (`input/src/`) and multiple D365 solution packages (`input/solutions/*/`).
The scan aggregates across all solution packages into one coherent project view.

## Usage

```
/scan
```

## Steps

### 1. Read Configuration
Read all files in `constitution/`. Note `publisher-prefix`, `project-name`, and `input-available` flags from `constitution/10-project-configuration.md`.

### 2. Verify Input
Check `input/` exists and contains at least one of: `src/`, `solutions/`, `integrations/`, `documents/`.
If empty, stop:
> "No artefacts found in `input/`. See README for the expected folder structure."

### 3. Scan Solution Packages (`input/solutions/`)

`input/solutions/` contains one subfolder per D365 solution ZIP that has been unzipped.
Each subfolder may contain any combination of: `Entities/`, `WebResources/`, `Workflows/`, `PluginAssemblies/`, `Other/`.

For each subfolder in `input/solutions/` (alphabetical order):
- Read `solution.xml` — note solution name, version, publisher
- Scan all component subdirectories present:
  - **`Entities/*/Entity.xml`** — entity logical name, display name, ownership
  - **`Entities/*/Attributes/*.xml`** — all attributes per entity
  - **`Entities/*/Relationships/*.xml`** — relationships and cascade behaviours
  - **`Entities/*/Forms/*.xml`** — form names and types
  - **`Entities/*/Views/*.xml`** — view names, columns, filters
  - **`WebResources/*`** — schema name, type, description attribute
  - **`Workflows/*.json`** — flow name, trigger type, primary entity
  - **`Workflows/*.xaml`** — classic workflow name, trigger, entity
  - **`PluginAssemblies/*.xml`** — assembly name, registered steps (entity, message, stage, mode, filtering attributes, images)
  - **`Other/`** — environment variables, connection references, custom APIs, security roles

Tag every discovered component with its **source package** (the solution subfolder name). This is used for traceability and deployment ordering.

### 4. Scan Plugin Source (`input/src/plugins/`)

Walk all `.cs` files recursively:
- Find classes implementing `IPlugin` — note class name, namespace
- Find `[CrmPluginRegistration]` attributes — extract step metadata
- Read `Execute` method body — summarise logic, Dataverse calls, external calls
- List NuGet packages from `*.csproj` files

**Cross-reference:** for each plugin class found in source, look for a matching registration in the solution packages (step 3). Note if registration exists but source is missing, or source exists but no registration found — flag both cases.

### 5. Scan Web Resource Source (`input/src/web-resources/`)

Walk all `.js`, `.html`, `.css` files recursively:
- For JS: extract function names, event handler patterns, `Xrm.WebApi` calls, `formContext` usage, `Xrm.Page` usage (flag deprecated), external `fetch`/HTTP calls
- For HTML: identify purpose, embedded scripts

**Cross-reference:** match each JS file to its registered web resource schema name from solution packages.

### 6. Scan PCF Controls (`input/src/pcf/`)

For each control folder:
- Read `ControlManifest.Input.xml` — control name, namespace, type, properties
- Read `index.ts` — init, updateView, getOutputs signatures
- Read `package.json` — external dependencies

### 7. Scan Azure Functions (`input/integrations/azure-functions/`)

For each function app folder:
- List function names and trigger types (`HttpTrigger`, `ServiceBusTrigger`, `TimerTrigger`)
- Extract route/queue/topic, bindings, auth level
- Note NuGet/npm dependencies

### 8. Scan Logic Apps (`input/integrations/logic-apps/`)

For each `.json` file:
- Workflow name, trigger type, action list, connectors used, D365 CE connector operations

### 9. Scan ADF Artifacts (`input/adf/`)

If `input/adf/` exists:
- **`pipelines/*.json`** — pipeline name, number of activities, inferred direction (source type → sink type)
- **`linkedServices/*.json`** — service name, type, connection target, auth method
- **`datasets/*.json`** — dataset name, type, linked service, table/file path
- **`dataflows/*.json`** or **`dataflow/*.json`** — data flow name, source count, sink count
- **`triggers/*.json`** — trigger name, type (schedule / blob event / custom event), pipelines triggered, schedule expression

Also scan the root of `input/adf/` and all subfolders for JSON files matching `"$schema"` containing `"pipeline"`, `"linkedService"`, `"dataset"`, `"dataflow"`, or `"trigger"` to catch flat exports.

Flag `Basic` auth on any linked service: `⚠ SECURITY RISK — should use managed identity`.
Flag pipelines with no trigger: `⚠ ORPHANED PIPELINE`.

Note: documentation follows rules in `constitution/05-adf-analysis.md`.

### 10. Scan Reporting Artifacts (`input/reporting/`)

If `input/reporting/` exists:
- **`*.rdl`**, **`*.rdlc`** — SSRS report name (from `<Report>` root or file name), data source type (FetchXML / SQL / OData), whether pre-filtering is enabled, number of datasets and parameters
- **`*.rds`** — shared data source name and provider type
- **`*.pbix`** — file name, file size
- **`*.pbit`** — file name; if parseable as ZIP, extract page names and table names

Flag RDL files with inline SQL: `⚠ INLINE SQL`.
Flag RDL files without pre-filtering: `⚠ NO PRE-FILTERING`.
Flag `.pbix` files with no companion `.pbit` or metadata JSON: `⚠ BINARY ONLY`.

Note: SSRS/RDL files are D365 CE Reporting Services reports and are fully in scope for this agent. Power BI files are documented at inventory level; implementation is owned by the Reporting agent. Documentation follows rules in `constitution/06-reporting-analysis.md`.

### 11. Scan Existing Documents (`input/documents/`)

List every file with a one-line purpose summary (read first 5 lines to infer purpose).

### 12. Build Cross-Reference Map

After scanning all sources, build:

**Plugin cross-reference:**
| Class Name | Source File | Registration Found In | Status |
| AccountPlugin | src/plugins/AccountPlugin.cs | solutions/Plugins/ | ✓ Matched |
| OrphanPlugin | src/plugins/OrphanPlugin.cs | — | ⚠ SOURCE ONLY — no registration |
| GhostPlugin | — | solutions/Plugins/ | ⚠ REGISTRATION ONLY — no source |

**Web resource cross-reference:**
| Schema Name | Source File | Registered In | Status |
| pub_/js/account_form.js | src/web-resources/account_form.js | solutions/WebResources/ | ✓ Matched |

### 13. Archive Previous Inventory

Before writing the new inventory, check if `docs-generated/component-inventory.md` already exists.

- If it **does not exist** — skip this step.
- If it **does exist** — copy it to `docs-generated/history/component-inventory-{YYYY-MM-DD-HHMM}.md` (create the `history/` folder if absent). Do not delete the original yet — it will be overwritten in the next step.

This preserves a timestamped copy of every previous scan so re-runs are non-destructive.

### 14. Write Component Inventory

Write `docs-generated/component-inventory.md` using `doc-templates/component-inventory-template.md`.

The inventory must include a **Source Package** column on every component table row, showing which solution subfolder the component came from.

Add a **Solution Packages** section listing all packages scanned, their versions, and component counts.

Flag any file that could not be parsed as `⚠ NEEDS REVIEW — {reason}`.

### 15. Completion Report

```
SCAN COMPLETE
═════════════
Project         : {project-name}
Publisher       : {publisher-name}  [{publisher-prefix}]
Previous scan   : {archived to docs-generated/history/component-inventory-{YYYY-MM-DD-HHMM}.md | none — first run}

Solution packages scanned: {N}
  {package-1}  v{version}  —  {N} entities, {N} web resources, {N} flows
  {package-2}  v{version}  —  {N} plugin steps
  {package-3}  v{version}  —  {N} security roles, {N} env variables

Totals:
  Entities        : {N}  ({N} custom, {N} OOB extended)
  Attributes      : {N} custom attributes across {N} entities
  Relationships   : {N}
  Forms           : {N}
  Views           : {N}
  Plugin Steps    : {N} across {N} assemblies
  Web Resources   : {N}  ({N} JS, {N} HTML, {N} other)
  PCF Controls    : {N}
  Power Automate  : {N} flows
  Classic WFs     : {N}
  Custom APIs     : {N}
  Security Roles  : {N}
  Env Variables   : {N}
  Azure Functions : {N}
  Logic Apps      : {N}
  ADF Pipelines   : {N}  |  Linked Services: {N}  |  Datasets: {N}  |  Dataflows: {N}  |  Triggers: {N}
  SSRS Reports    : {N}  ({N} .rdl, {N} .rdlc, {N} .rds shared data sources)
  Power BI        : {N}  ({N} .pbix, {N} .pbit)
  Existing Docs   : {N}

Cross-reference:
  Plugins matched       : {N}  |  Source-only: {N}  |  Registration-only: {N}
  Web resources matched : {N}  |  Source-only: {N}  |  Registration-only: {N}

Needs Review    : {N} items flagged
Output          : docs-generated/component-inventory.md

Suggested next steps:
  /document all          — generate all component documentation (includes adf + reporting)
  /document adf          — ADF pipeline documentation only
  /document reporting    — SSRS and Power BI documentation only
  /fdd                   — functional overview
  /tdd                   — technical overview
  /blueprint             — architecture blueprint
  /generate              — run full documentation pipeline in one shot
```
