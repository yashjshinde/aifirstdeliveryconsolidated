# D365 CE Brownfield Agent

Reverse-engineering and documentation agent for existing Dynamics 365 Customer Engagement solutions.
Reads source artefacts from `input/` and produces structured documentation in `docs-generated/`.

## Workflow

```
PHASE 0 — PREPARE (optional — for unstructured repos)
  /prepare {path}  ──►  copies artefacts into input/ + docs-generated/prepare-report.md
                       ↓
PHASE 1 — DISCOVER
  /scan  ──►  docs-generated/component-inventory.md
                       ↓
PHASE 2 — DOCUMENT
  /document {scope}
  Scope: entities | forms-views | security | flows | plugins | web-resources | pcf | custom-apis | integrations | adf | reporting | all

  — OR —

  /generate  ──►  runs all document scopes + fdd + tdd + blueprint + index in one shot
                       ↓
PHASE 3 — SYNTHESISE  (skip if using /generate)
  /fdd        → docs-generated/functional/functional-overview.md
  /tdd        → docs-generated/technical/technical-overview.md
  /blueprint  → docs-generated/architecture/ (solution-blueprint.md, data-model.md, dependency-map.md)
                       ↓
PHASE 4 — NAVIGATE  (skip if using /generate)
  /index      → docs-generated/00-index.md
```

## Command Reference

| Command | Output |
|---|---|
| `/prepare {path}` | Copies artefacts from `{path}` into `input/`; `docs-generated/prepare-report.md` |
| `/scan` | `docs-generated/component-inventory.md` |
| `/document entities` | `docs-generated/functional/entity-catalogue.md` |
| `/document forms-views` | `docs-generated/functional/forms-and-views.md` |
| `/document flows` | `docs-generated/functional/flows.md` |
| `/document security` | `docs-generated/functional/security-model.md` |
| `/document plugins` | `docs-generated/technical/plugins/{AssemblyName}.md` |
| `/document web-resources` | `docs-generated/technical/web-resources/{namespace}.md` |
| `/document pcf` | `docs-generated/technical/pcf/{ControlName}.md` |
| `/document custom-apis` | `docs-generated/technical/custom-apis.md` |
| `/document integrations` | `docs-generated/integrations/` (topology + per-resource files) |
| `/document adf` | `docs-generated/data-migration/` (adf-topology.md + per-pipeline + per-dataflow files) |
| `/document reporting` | `docs-generated/reporting/` (reporting-inventory.md + ssrs/ + power-bi/) |
| `/document all` | all of the above |
| `/generate` | Runs `/document all` + `/fdd` + `/tdd` + `/blueprint` + `/index` in one shot |
| `/fdd` | `docs-generated/functional/functional-overview.md` |
| `/tdd` | `docs-generated/technical/technical-overview.md` |
| `/blueprint` | `docs-generated/architecture/` (3 files) |
| `/index` | `docs-generated/00-index.md` |

## Input Folder Convention

```
input/
├── src/                          ← single codebase for the entire project
│   ├── plugins/                  ← C# plugin source (one subfolder per assembly)
│   ├── web-resources/            ← JS/TS source files
│   └── pcf/                      ← PCF TypeScript controls (one subfolder per control)
├── solutions/                    ← multiple D365 solution unzips
│   ├── Entities/                 ← e.g. entities/schema-only solution unzip
│   │   ├── solution.xml
│   │   └── Entities/
│   ├── WebResources/             ← e.g. web resources solution unzip
│   │   ├── solution.xml
│   │   └── WebResources/
│   ├── Plugins/                  ← e.g. plugin registration solution unzip
│   │   ├── solution.xml
│   │   └── PluginAssemblies/
│   ├── Flows/                    ← e.g. flows solution unzip
│   │   ├── solution.xml
│   │   └── Workflows/
│   └── Security/                 ← e.g. security roles solution unzip
│       ├── solution.xml
│       └── Other/
├── integrations/
│   ├── azure-functions/          ← Function App source
│   └── logic-apps/               ← Logic App JSON definitions
├── adf/                          ← Azure Data Factory export (flat or subfoldered)
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
└── documents/                    ← Existing docs (.md or .txt only)
```

Each subfolder under `input/solutions/` is one unzipped D365 solution ZIP.
The agent iterates **all** subfolders in `input/solutions/*/` and aggregates components across them.
Every component in the inventory is tagged with the name of the solution package it came from.

## Output Folder Convention

```
docs-generated/
├── 00-index.md                              ← /index
├── component-inventory.md                   ← /scan
├── functional/
│   ├── functional-overview.md              ← /fdd
│   ├── entity-catalogue.md                 ← /document entities
│   ├── forms-and-views.md                  ← /document forms-views
│   ├── flows.md                            ← /document flows
│   └── security-model.md                   ← /document security
├── technical/
│   ├── technical-overview.md               ← /tdd  (incl. §12 Developer Event Trace)
│   ├── plugins/{AssemblyName}.md           ← /document plugins
│   ├── web-resources/{namespace}.md        ← /document web-resources
│   ├── pcf/{ControlName}.md               ← /document pcf
│   └── custom-apis.md                      ← /document custom-apis
├── integrations/
│   ├── integration-topology.md             ← /document integrations
│   ├── azure-functions/{App}.md
│   └── logic-apps/{Workflow}.md
├── data-migration/                          ← /document adf
│   ├── adf-topology.md
│   ├── pipelines/{Name}.md
│   └── dataflows/{Name}.md
├── reporting/                               ← /document reporting
│   ├── reporting-inventory.md
│   ├── ssrs/{ReportName}.md
│   └── power-bi/{ReportName}.md
└── architecture/
    ├── solution-blueprint.md               ← /blueprint
    ├── data-model.md
    ├── dependency-map.md
    └── impact-map.md                       ← /blueprint  (developer change-request reference)
```

## Rules

- Always read `constitution/` before any command.
- Never modify files in `input/` — it is read-only.
- Scan `input/src/` once as the single codebase; iterate `input/solutions/*/` for all D365 configuration.
- Tag every component with the name of the `input/solutions/{PackageName}/` folder it came from.
- If a source file cannot be interpreted, document what was found and flag it as `⚠ NEEDS REVIEW`.
- Infer intent from code and configuration — do not invent behaviour not evidenced in the artefacts.
- When source and XML conflict, prefer the source code as ground truth.
- Cross-reference plugin class names against registration XML across all solution packages.
- Cross-reference web resource JS files against WebResources schema names across all solution packages.
- This agent is the **single documentation agent** for ALL artifacts in the solution — ADF, SSRS, and Power BI are documented here alongside CE components.
- ADF artifacts (`input/adf/`) are documented using the rules in `constitution/05-adf-analysis.md`; implementation is owned by the Data Migration agent.
- SSRS/RDL artifacts are CE Reporting Services reports — document them fully as CE-native components; implementation is owned by the CE implementation agent.
- Power BI artifacts are documented at inventory level; implementation is owned by the Reporting agent.
- Apply `constitution/06-reporting-analysis.md` for all reporting artifact documentation.
