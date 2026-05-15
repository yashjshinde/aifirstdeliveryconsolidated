# D365 CE Brownfield Agent

Reverse-engineering and documentation agent for existing Dynamics 365 Customer Engagement solutions.
Drop your solution artefacts into `input/` and generate comprehensive documentation in four phases.

---

## Table of Contents

1. [What Is It](#1-what-is-it)
2. [How It Works](#2-how-it-works)
   - [Phase 1 — Discovery](#phase-1--discovery)
   - [Phase 2 — Component Documentation](#phase-2--component-documentation)
   - [Phase 3 — Architecture](#phase-3--architecture)
   - [Phase 4 — Navigation Index](#phase-4--navigation-index)
3. [Command Reference](#command-reference)
4. [Structure and Outputs](#4-structure-and-outputs)
   - [Input Folder](#input-folder)
   - [Output Folder](#output-folder)
   - [Template Folder](#template-folder)
5. [Configuration](#configuration)
6. [Flagging Conventions](#flagging-conventions)

---

## 1. What Is It

The D365 CE Brownfield Agent is the **single documentation agent** for all artefacts in a Dynamics 365 CE project.
It reads solution packages, source code, ADF pipelines, SSRS reports, and Power BI files, then generates
human-readable documentation across five categories:

| Category | Documents Produced |
|---|---|
| **Discovery** | Component Inventory — full catalogue of all artefacts across all solution packages |
| **Functional** | Functional Overview, Entity Catalogue, Forms & Views, Power Automate Flows, Security Model |
| **Technical** | Technical Overview, Plugin docs (per assembly), Web Resource docs, PCF Control docs, Custom API docs |
| **Integration** | Integration Topology, Azure Functions (per App), Logic Apps (per Workflow) |
| **Data Migration** | ADF Topology, Pipeline docs (per pipeline), Data Flow docs — handoff to Data Migration agent |
| **Reporting** | Reporting Inventory, SSRS/RDL docs (per report), Power BI inventory — SSRS owned by CE agent; Power BI handoff to Reporting agent |
| **Architecture** | Solution Blueprint, Data Model, Dependency Map |

**Single documentation responsibility:** This agent documents everything. Implementation ownership is separate:
- SSRS reports → CE implementation agent (D365 CE Reporting Services)
- ADF pipelines → Data Migration agent
- Power BI reports → Reporting agent

The agent has no gates — every command can run independently once `input/` is populated. Run `/scan` first
to build the component inventory that all other commands reference.

---

## 2. How It Works

### The process

```
PHASE 0 — PREPARE (optional)

  [Unstructured artefacts — cloned repo, ZIP extract, shared drive folder]
  /prepare {path} ──► classifies and copies artefacts into input/ ──► prepare-report.md

  Skip if populating input/ manually.

PHASE 1 — DISCOVER

  /scan ──► component-inventory.md
            └─ all subsequent commands read this inventory

PHASE 2 — DOCUMENT

  /document entities       ← entity catalogue
  /document forms-views    ← form layouts, tabs, view columns
  /document flows          ← Power Automate flows
  /document security       ← roles, privileges, field security
  /document plugins        ← one file per plugin assembly
  /document web-resources  ← JS functions, events, Xrm API usage
  /document pcf            ← PCF control manifest and lifecycle
  /document custom-apis    ← request/response, binding, implementation
  /document integrations   ← integration topology + Azure Functions + Logic Apps
  /document adf            ← ADF topology + pipelines + dataflows  (handoff to Data Migration agent)
  /document reporting      ← SSRS per-report + Power BI inventory  (SSRS: CE agent; Power BI: Reporting agent)
  /document all            ← runs all of the above in sequence

  Shortcut: /generate ──► /document all ▸ /fdd ▸ /tdd ▸ /blueprint ▸ /index in one pass

PHASE 3 — ARCHITECTURE

  /fdd       ──► functional-overview.md          (business language synthesis)
  /tdd       ──► technical-overview.md           (patterns, tech debt, risks)
  /blueprint ──► solution-blueprint.md + data-model.md + dependency-map.md

PHASE 4 — INDEX

  /index ──► 00-index.md   (master navigation table with status per document)
```

> No gates — every command runs independently once `input/` is populated. `/scan` first, then any order.

---

### Re-running Commands and Version Safety

> **Overwrite risk:** Every command in this agent **overwrites its output file(s) completely** on re-run. There is no merge or diff — the previous file is replaced. This includes `component-inventory.md`, all `/document` outputs, `/fdd`, `/tdd`, `/blueprint`, and `/index`.
>
> **Do not hand-edit generated files.** Any manual changes made to files in `docs-generated/` will be permanently lost the next time the generating command is re-run. Treat all files in `docs-generated/` as build artefacts — regenerate, don't edit.

**Versioning — `/scan` auto-archives before overwriting:**

`/scan` is the most critical command because all other commands depend on the inventory it produces.
Before overwriting `component-inventory.md`, `/scan` automatically archives the previous copy to:

```
docs-generated/history/component-inventory-{YYYY-MM-DD-HHMM}.md
```

This gives you a full audit trail of every scan run. Re-runs of `/document`, `/fdd`, `/tdd`, `/blueprint`, and `/index` do **not** auto-archive — use `git` to track versions of those files.

**Recommended practice:**

1. Commit `docs-generated/` to git after each meaningful run — this is your primary version history.
2. Re-run `/scan` freely — the previous inventory is always preserved in `docs-generated/history/`.
3. Never re-run commands mid-review without committing first.

---

## Command Reference

| Command | What it does | Output |
|---|---|---|
| `/prepare {path}` | Classifies and copies artefacts from any directory into `input/` | `docs-generated/prepare-report.md` |
| `/scan` | Builds component inventory from all input artefacts (CE, ADF, SSRS, Power BI) | `docs-generated/component-inventory.md` |
| `/document entities` | Documents all entities, attributes, and relationships | `docs-generated/functional/entity-catalogue.md` |
| `/document forms-views` | Documents form layouts, tabs, fields, views | `docs-generated/functional/forms-and-views.md` |
| `/document flows` | Documents Power Automate flows step by step | `docs-generated/functional/flows.md` |
| `/document security` | Documents roles, privileges, field security, personas | `docs-generated/functional/security-model.md` |
| `/document plugins` | Documents each plugin assembly — triggers, logic, Dataverse calls | `docs-generated/technical/plugins/{AssemblyName}.md` |
| `/document web-resources` | Documents JS functions, events, Xrm API usage per namespace | `docs-generated/technical/web-resources/{namespace}.md` |
| `/document pcf` | Documents PCF control manifest, lifecycle, bindings | `docs-generated/technical/pcf/{ControlName}.md` |
| `/document custom-apis` | Documents Custom API request/response, binding, implementation | `docs-generated/technical/custom-apis.md` |
| `/document integrations` | Documents integration topology, Azure Functions, Logic Apps | `docs-generated/integrations/` (topology + per-resource files) |
| `/document adf` | Documents ADF pipelines, linked services, datasets, dataflows, triggers | `docs-generated/data-migration/` (topology + per-pipeline files) |
| `/document reporting` | Documents SSRS reports fully; Power BI at inventory level | `docs-generated/reporting/` (inventory + ssrs/ + power-bi/) |
| `/document all` | Runs all `/document` sub-commands in sequence | all of the above |
| `/generate` | Runs all document scopes + fdd + tdd + blueprint + index in one shot | all of the above |
| `/fdd` | Functional overview in business language | `docs-generated/functional/functional-overview.md` |
| `/tdd` | Technical overview — patterns, tech debt, risks | `docs-generated/technical/technical-overview.md` |
| `/blueprint` | Solution blueprint + data model + dependency map | `docs-generated/architecture/` (3 files) |
| `/index` | Master navigation index linking all generated documents | `docs-generated/00-index.md` |

---

## 4. Structure and Outputs

### Input Folder

Place your project artefacts under `input/` using this structure:

```
input/
├── src/                          ← single codebase for the entire project
│   ├── plugins/                  ← C# plugin source (one subfolder per assembly)
│   │   ├── MyPlugin.Core/
│   │   │   ├── AccountPlugin.cs
│   │   │   └── ContactPlugin.cs
│   │   └── MyPlugin.Integration/
│   │       └── ServiceBusPlugin.cs
│   ├── web-resources/            ← JS/TS source files
│   │   ├── pub_account_form.js
│   │   └── pub_contact_form.js
│   └── pcf/                      ← PCF TypeScript controls
│       └── MyRatingControl/
│           ├── ControlManifest.Input.xml
│           └── index.ts
├── solutions/                    ← one subfolder per unzipped D365 solution ZIP
│   ├── Entities/
│   │   ├── solution.xml
│   │   └── Entities/
│   ├── WebResources/
│   │   ├── solution.xml
│   │   └── WebResources/
│   ├── Plugins/
│   │   ├── solution.xml
│   │   └── PluginAssemblies/
│   ├── Flows/
│   │   ├── solution.xml
│   │   └── Workflows/
│   └── Security/
│       ├── solution.xml
│       └── Other/
├── integrations/
│   ├── azure-functions/          ← Function App source
│   └── logic-apps/               ← Logic App JSON definitions
├── adf/                          ← Azure Data Factory export
│   ├── pipelines/                ← pipeline JSON files
│   ├── linkedServices/           ← linked service JSON files
│   ├── datasets/                 ← dataset JSON files
│   ├── dataflows/                ← data flow JSON files
│   └── triggers/                 ← trigger JSON files
├── reporting/                    ← SSRS reports and Power BI files
│   ├── *.rdl                     ← SSRS report definitions (D365 CE Reporting Services)
│   ├── *.rdlc                    ← local SSRS report definitions
│   ├── *.rds                     ← SSRS shared data sources
│   ├── *.pbix                    ← Power BI Desktop reports
│   └── *.pbit                    ← Power BI template files
└── documents/                    ← existing docs (.md or .txt only)
```

You do not need all input types. The agent skips missing folders gracefully and flags what is unavailable.

### Output Folder

```
docs-generated/
├── 00-index.md                              ← /index
├── component-inventory.md                   ← /scan  (previous versions archived to history/)
├── history/
│   └── component-inventory-{YYYY-MM-DD-HHMM}.md   ← auto-archived by /scan before each overwrite
├── functional/
│   ├── functional-overview.md              ← /fdd
│   ├── entity-catalogue.md                 ← /document entities
│   ├── forms-and-views.md                  ← /document forms-views
│   ├── flows.md                            ← /document flows
│   └── security-model.md                   ← /document security
├── technical/
│   ├── technical-overview.md               ← /tdd
│   ├── plugins/{AssemblyName}.md           ← /document plugins
│   ├── web-resources/{namespace}.md        ← /document web-resources
│   ├── pcf/{ControlName}.md               ← /document pcf
│   └── custom-apis.md                      ← /document custom-apis
├── integrations/
│   ├── integration-topology.md             ← /document integrations
│   ├── azure-functions/{App}.md
│   └── logic-apps/{Workflow}.md
├── data-migration/                          ← /document adf  (handoff to Data Migration agent)
│   ├── adf-topology.md
│   ├── pipelines/{Name}.md
│   └── dataflows/{Name}.md
├── reporting/                               ← /document reporting
│   ├── reporting-inventory.md              ← SSRS: CE agent owner; Power BI: Reporting agent owner
│   ├── ssrs/{ReportName}.md               ← fully documented SSRS reports
│   └── power-bi/{ReportName}.md           ← Power BI inventory (handoff to Reporting agent)
└── architecture/
    ├── solution-blueprint.md               ← /blueprint
    ├── data-model.md
    └── dependency-map.md
```

### Template Folder

```
d365-ce-brownfield/
├── .claude/
│   ├── commands/
│   │   ├── prepare.md          ← /prepare {path}
│   │   ├── scan.md             ← /scan
│   │   ├── document.md         ← /document {scope}
│   │   ├── generate.md         ← /generate
│   │   ├── fdd.md              ← /fdd
│   │   ├── tdd.md              ← /tdd
│   │   ├── blueprint.md        ← /blueprint
│   │   └── index.md            ← /index
│   └── settings.json
├── constitution/
│   ├── CLAUDE.md                        ← agent instructions and folder conventions
│   ├── 00-architectural-principles.md
│   ├── 01-input-file-types.md           ← how to read each file type (CE + ADF + SSRS + Power BI)
│   ├── 02-analysis-rules.md             ← inference and detection rules
│   ├── 03-documentation-standards.md   ← tone, tables, flagging conventions
│   ├── 04-integration-analysis.md       ← Azure Functions + Logic Apps rules
│   ├── 05-adf-analysis.md              ← ADF pipeline/linked service/dataset/dataflow documentation rules
│   ├── 06-reporting-analysis.md        ← SSRS/RDL and Power BI documentation rules
│   └── 10-project-configuration.md      ← configure before first use
├── doc-templates/
│   ├── component-inventory-template.md
│   ├── entity-catalogue-template.md
│   ├── functional-overview-template.md
│   ├── technical-overview-template.md
│   ├── plugin-doc-template.md
│   ├── integration-topology-template.md
│   └── solution-blueprint-template.md
├── input/                               ← place your artefacts here
└── docs-generated/                      ← all output goes here
```

---

## Configuration

Open `constitution/10-project-configuration.md` and fill in the `[project]` block:

| Setting | Description |
|---|---|
| `project-name` | Human-readable project name |
| `publisher-prefix` | D365 publisher prefix (e.g. `pub`) |
| `modules` | List of business modules in scope |
| `integration-targets` | External systems integrated with D365 |
| `input-available.*` | Set to `false` for any input type you have not populated |

Then open in Claude Code and either:

1. **Manual input:** Populate `input/` using the folder structure above, then run `/scan`.
2. **Auto-prepare:** Point to your existing repo or file dump with `/prepare {path}` — the agent classifies and copies artefacts into `input/` automatically — then run `/scan`.

After `/scan`, run `/generate` to produce all documentation in one shot, or run individual `/document` commands.

---

## Flagging Conventions

### CE / General

| Marker | Meaning |
|---|---|
| `⚠ NEEDS REVIEW` | Could not be interpreted from available artefacts |
| `⚠ UPGRADE RISK` | Likely to break on a D365 platform upgrade |
| `⚠ SECURITY RISK` | Security concern — review before production use |
| `⚠ TECHNICAL DEBT` | Deprecated API or known anti-pattern |
| `⚠ ORPHANED` | No references from other components — candidate for removal |
| `⚠ BINARY ONLY` | Plugin DLL found in solution but no C# source available |
| `⚠ SOURCE ONLY` | C# class or JS file found in `src/` but no registration in any solution package |
| `*(inferred)*` | Not explicit in artefacts — derived from context |
| `*(from: filename)*` | Content sourced from a provided document |

### ADF

| Marker | Meaning |
|---|---|
| `⚠ ORPHANED PIPELINE` | Pipeline found with no trigger referencing it |
| `⚠ NO ERROR HANDLING` | Pipeline has no IfCondition or Try/Catch around failure-prone steps |
| `⚠ SECURITY RISK` | Basic auth on linked service; hard-coded credentials detected |

### SSRS / Reporting

| Marker | Meaning |
|---|---|
| `⚠ NO PRE-FILTERING` | D365 CE report does not enable pre-filtering |
| `⚠ INLINE SQL` | Report uses inline SQL instead of a stored procedure — maintenance risk |
| `⚠ HARD-CODED CREDS` | Connection string contains username/password |
| `⚠ BINARY ONLY` | `.pbix` file found but no `.pbit` or metadata JSON — limited extraction possible |
