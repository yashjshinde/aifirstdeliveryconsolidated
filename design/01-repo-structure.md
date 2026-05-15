---
title: Repository Structure & Configuration Model
status: live
adr-refs: [ADR-0002, ADR-0003, ADR-0004, ADR-0010, ADR-0011]
last-reviewed: 2026-05-14
owner: design
---

# Repository Structure & Configuration Model

## Canonical root layout

```
aifirstdeliveryconsolidated/
├── README.md                              # entry README; explains the repo
├── implementation.md                      # build log (append-only) + Implementation Plan
├── agents.yaml                            # agent registry — name, version, commands, docScope
├── workflow.yaml                          # declarative DAG of phases, gates, transitions
├── agents/
│   ├── _skeleton/                         # canonical template for new agents
│   │   ├── .claude/commands/              # base command set (17 verbs + utility)
│   │   ├── constitution/                  # placeholder
│   │   ├── templates/                     # placeholder
│   │   └── README.md
│   ├── d365-ce/                           # see design/agents/d365-ce.md
│   ├── d365-fo/                           # see design/agents/d365-fo.md
│   ├── integration/                       # see design/agents/integration.md
│   ├── reporting/                         # see design/agents/reporting.md
│   ├── solution-estimate/                 # see design/agents/solution-estimate.md
│   ├── solution-architect/                # see design/agents/solution-architect.md
│   ├── brownfield/                        # see design/agents/brownfield.md
│   └── alm/                               # see design/agents/alm.md
├── constitution/
│   └── _reference/                        # SCAFFOLDING ONLY — used by New-Agent.ps1
│       ├── 00-charter.md.example
│       ├── 01-doc-rules.md.example
│       ├── 02-nfr.md.example
│       ├── 03-security.md.example
│       ├── 04-testing.md.example
│       ├── 05-alm.md.example
│       └── ...
├── templates/
│   └── _reference/                        # SCAFFOLDING ONLY — used by New-Agent.ps1
│       ├── spec.template.md.example
│       ├── plan.template.md.example
│       ├── tdd.template.md.example
│       └── ...
├── schemas/                               # versioned JSON Schemas
│   ├── handoff.v1.json
│   ├── alm-extract.v1.json
│   ├── work-items.v1.json
│   ├── workflow-state.v1.json
│   ├── brownfield-inventory.v1.json
│   └── project-config.v1.json
├── tools/
│   ├── mcp-server/                        # single, modular MCP server
│   ├── sync/                              # publish pipeline (PowerShell)
│   │   ├── Publish-Agents.ps1
│   │   ├── Watch-Agents.ps1
│   │   ├── settings.template.json
│   │   ├── plugin.template.json
│   │   └── chatmode.template.md
│   ├── scaffold/                          # project / feature / agent scaffolding
│   │   ├── New-Project.ps1
│   │   ├── New-Feature.ps1
│   │   └── New-Agent.ps1
│   └── chat-ui/                           # React + Node web client
│       ├── frontend/
│       └── backend/
├── .github/                               # ROOT-UNIFIED GHCP — all GENERATED
│   ├── chatmodes/                         # one per agent — DO NOT EDIT
│   ├── prompts/                           # one per agent-command — DO NOT EDIT
│   └── workflows/
│       └── check-publish-drift.yml        # CI: fails on hand-edited generated files
├── .claude/                               # ROOT-UNIFIED CLAUDE — all GENERATED
│   ├── commands/
│   │   ├── d365-ce/                       # invoked as /d365-ce:spec etc.
│   │   ├── d365-fo/
│   │   └── ... (8 agents)
│   └── settings.json                      # GENERATED — MCP registration + hooks
├── .claude-plugin/
│   └── marketplace.json                   # GENERATED — lists all 8 agents
├── docs/                                  # human-facing project-agnostic docs
│   ├── architecture.md
│   └── orchestration.md
├── design/                                # AUTHORITATIVE DESIGN (this folder)
│   ├── README.md
│   ├── 00-overview.md through 16-revision-history.md
│   ├── agents/                            # 8 per-agent design docs
│   ├── adr/                               # 11 Architecture Decision Records
│   ├── backlog.md
│   └── audit-2026-05-14.md
└── projects/
    └── {project-name}/                    # per-project state (see 05-project-layout.md)
```

## File category markers

Three categories of files inside the repo (see also [02-agent-skeleton.md](02-agent-skeleton.md)):

| Marker | Edited by | Authority | Examples |
|---|---|---|---|
| **SOURCE** | Authors, by hand | The source-of-truth file | `agents/{a}/.claude/commands/*.md`, `agents/{a}/constitution/*.md`, `agents/{a}/templates/**`, `agents.yaml`, `workflow.yaml`, `schemas/*.json` |
| **MIRRORED** | Publish pipeline | Read-only copy of a root source | `agents/{a}/schemas/*`, `agents/{a}/workflow.yaml` |
| **GENERATED** | Publish pipeline | Read-only derivative | `.github/**`, `.claude/commands/**`, `.claude/settings.json`, `agents/{a}/.github/**`, `agents/{a}/.claude/settings.json`, `agents/{a}/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` |

CI drift check (job 8 in [12-publish-pipeline.md](12-publish-pipeline.md)) fails the build if any MIRRORED or GENERATED file is hand-edited.

## Configuration model

### Two layers, file-level resolution. First match wins. No merging.

#### Constitution

```
1. projects/{p}/{a}/constitution-override/0X-*.md     ← project override (if --project passed)
2. agents/{a}/constitution/0X-*.md                     ← agent default
```

#### Templates

```
1. projects/{p}/{a}/templates-override/{type}.template.md     ← project override (if present)
2. agents/{a}/templates/{type}.template.md                     ← agent default
```

If neither layer exists for a doc type, the command fails with a clear error rather than silently generating an empty doc.

**No shared `_base` at runtime.** Universal rules (Mermaid, frontmatter, TOC, AI Summary, traceability, no inline ALM IDs, feature-id tagging, quality self-check appendix) are enforced by code in MCP `doc_lint`. See [ADR-0010](adr/0010-templates-agent-owned.md).

### Drift detection on overrides

When a project override exists, `doc_lint` checks the override's frontmatter `based-on-template-version` against the agent's current template version and warns if behind. Customizers can refresh by copying the agent's default into the override or by running `/customize-template <type>` (helper queued in backlog).

### `agents.yaml` (root registry)

Declares each agent's metadata and the `docScope` for FDD/TDD/blueprint per [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md):

```yaml
version: 1
agents:
  - name: d365-ce
    version: 1.0.0
    base-commands: true
    extra-commands: []
    docScope: { fdd: domain, tdd: domain, blueprint: domain }

  - name: d365-fo
    version: 1.0.0
    base-commands: true
    extra-commands: [lcs-deploy, dmf-package]
    docScope: { fdd: feature, tdd: feature, blueprint: feature }

  - name: integration
    version: 1.0.0
    base-commands: true
    extra-commands: []
    docScope: { fdd: domain, tdd: domain, blueprint: domain }

  - name: reporting
    version: 1.0.0
    base-commands: true
    extra-commands: []
    docScope: { fdd: domain, tdd: domain, blueprint: domain }

  - name: solution-estimate
    version: 1.0.0
    base-commands: false
    extra-commands: [estimate]
    docScope: {}                            # aggregator; no docScope

  - name: solution-architect
    version: 1.0.0
    base-commands: false
    extra-commands: [solution-blueprint, solution-review, solution-prototype]
    docScope: {}                            # aggregator

  - name: brownfield
    version: 1.0.0
    base-commands: false
    extra-commands: [prepare, scan, document, fdd, tdd, blueprint, generate, index, handoff]
    docScope: {}                            # per-artefact, not domain/feature

  - name: alm
    version: 1.0.0
    base-commands: false
    extra-commands: [push, pull, export, import, status, cleanup]
    docScope: {}
```

### `project.config.yaml` (per-project, in `projects/{p}/`)

One file controls everything project-wide. Validated against `schemas/project-config.v1.json`.

```yaml
name: acme-d365
description: "ACME D365 CE rollout — phase 1"
mode: greenfield                          # or 'brownfield'
brownfieldPath: projects/acme-d365/_brownfield

agents-enabled: [d365-ce, integration, reporting, solution-architect, alm]

prefixes:
  publisher: acme
  solutionName: AcmeCore
  schemaPrefix: acme

multilingual:                             # per-channel
  crm: false
  portal: true
  canvas: false
  reports: true
  defaultLanguage: en-US
  supportedLanguages: [en-US, fr-FR, ja-JP]

oobOverrides:
  businessRules: prefer-js
  complexPlugin: prefer-azure-function

unitTestPolicy:
  plugin: required
  js: required
  pcf: required
  canvas: optional
  portal: required
  ssrs: optional
  power-bi: optional

nfr:
  responseTimeMsP95: 2000
  availability: 99.5
  errorRate: 0.5

alm:
  tool: ado                               # or 'jira'
  hierarchy: [Epic, Feature, "User Story", Task]
  syncOnApprove: true
  readOnlyLevels: []

estimation: { ... }                       # see agents/solution-estimate.md
```

## Personas reading this folder

| Persona | Where they start |
|---|---|
| New developer joining the project | [00-overview.md](00-overview.md) → [03-agent-inventory.md](03-agent-inventory.md) |
| Implementer building a specific agent | `agents/{a}.md` + relevant ADRs cited there |
| Reviewer evaluating a design change | [adr/README.md](adr/README.md) for the index, then the specific ADR |
| Project lead picking up after a pause | [../implementation.md](../implementation.md) for plan + recent entries |
| Builder authoring a new agent | [02-agent-skeleton.md](02-agent-skeleton.md) + run `New-Agent.ps1` |

## References

- ADRs: [ADR-0002](adr/0002-dual-mode-delivery-surfaces.md), [ADR-0003](adr/0003-single-source-of-truth-commands.md), [ADR-0004](adr/0004-self-contained-agent-folders.md), [ADR-0010](adr/0010-templates-agent-owned.md), [ADR-0011](adr/0011-publish-pipeline-8-job-model.md)
- Cross-references: [02-agent-skeleton.md](02-agent-skeleton.md), [05-project-layout.md](05-project-layout.md), [12-publish-pipeline.md](12-publish-pipeline.md)
