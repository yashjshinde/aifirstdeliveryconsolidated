# Project Configuration

This file is **optional**. If you leave it blank, the agent infers everything it can from the artefacts
in `input/` and flags anything it cannot determine as `⚠ NEEDS REVIEW`.

Fill in only the fields that the artefacts cannot supply — in particular `modules` and
`integration-targets`, which give the agent business context it cannot derive from code alone.

---

## Auto-detected (no config needed)

| Field | Where the agent reads it |
|---|---|
| Publisher prefix | `solution.xml` → `<customizationprefix>` |
| Publisher name | `solution.xml` → `<Publisher>/<LocalizedNames>` |
| Solution version | `solution.xml` → `<Version>` |
| Solution display name | `solution.xml` → `<LocalizedNames>` |
| What input is available | Checks whether each `input/` subfolder exists |
| Plugin assemblies | `input/solutions/*/PluginAssemblies/` |
| Web resources | `input/solutions/*/WebResources/` |
| Entities | `input/solutions/*/Entities/` |
| Flows | `input/solutions/*/Workflows/` |
| Security roles | `input/solutions/*/Other/` |

---

## Optional Project Block

Add this block only for fields the agent cannot infer. All keys are optional.

```
[project]
project-name:          My D365 CE Project
environment-type:      Production
d365-version:          9.2
region:                UK
org-url:               https://myorg.crm11.dynamics.com
include-code-snippets: true
max-snippet-lines:     40
flag-upgrade-risks:    true
modules:
  - Contact Management
  - Case Handling
  - Policy Administration
integration-targets:
  - name: ERP System
    type: Bidirectional
    protocol: Azure Service Bus
  - name: Email Platform
    type: Outbound
    protocol: REST/HTTP
```

---

## Field Reference

| Key | Default if omitted | Description |
|---|---|---|
| `project-name` | Inferred from `solution.xml` unique name | Human-readable project name for document titles |
| `environment-type` | `Production` | Production / UAT / Dev |
| `d365-version` | `9.2` | D365 CE version for upgrade risk assessment |
| `region` | *(omitted from docs)* | Region / data residency note |
| `org-url` | *(omitted from docs)* | D365 CE org URL |
| `include-code-snippets` | `true` | Embed code excerpts in technical docs |
| `max-snippet-lines` | `40` | Max lines per code excerpt |
| `flag-upgrade-risks` | `true` | Add ⚠ markers on upgrade-risk patterns |
| `modules` | Entities grouped alphabetically | Business module names; used to group entities in output |
| `integration-targets` | Discovered from plugin/flow HTTP calls | Provides business names for external systems |

---

## Notes on Solution Packages

The agent reads `input/solutions/*/solution.xml` to discover all solution packages in the project.
Each subfolder under `input/solutions/` should be one unzipped D365 solution ZIP.
The folder name becomes the **package label** used throughout the generated documentation.

Recommended naming for solution package folders:

```
input/solutions/
├── Entities/        ← schema/entity-only solution
├── Plugins/         ← plugin registration solution
├── WebResources/    ← web resource solution
├── Flows/           ← Power Automate flow solution
└── Security/        ← security role solution
```

You may use any folder name — the agent reads `solution.xml` for the canonical display name and version.
