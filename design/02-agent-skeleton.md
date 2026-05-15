---
title: Agent Skeleton — Per-Agent Folder Contract
status: live
adr-refs: [ADR-0002, ADR-0003, ADR-0004, ADR-0010, ADR-0011]
last-reviewed: 2026-05-14
owner: design
---

# Agent Skeleton — Per-Agent Folder Contract

> Every agent folder follows the structure described here. New agents are seeded via `New-Agent.ps1` (queued in [backlog.md](backlog.md)) which copies `agents/_skeleton/` and the `_reference/` starters from repo root.

## Self-contained agent folder

Per [ADR-0004](adr/0004-self-contained-agent-folders.md), each agent folder works in isolation. The Publish Pipeline mirrors root assets (`schemas/`, `workflow.yaml`) into each agent. Templates and constitution are agent-owned (no mirroring) per [ADR-0010](adr/0010-templates-agent-owned.md).

## Full structure

```
agents/{agent-name}/
├── .claude/                                  # CLAUDE SURFACE
│   ├── commands/                             # SOURCE — Claude-native authoring location
│   │   ├── spec.md                           # /spec [--source fresh|alm] [--feature <name>]
│   │   ├── review.md                         # /review — spec only (per ADR-0001)
│   │   ├── split.md                          # /split — emits handoffs for mixed-domain specs
│   │   ├── impact.md                         # /impact — brownfield + cross-feature analysis
│   │   ├── fdd.md                            # /fdd — parallel after spec approved
│   │   ├── test-plan.md                      # /test-plan
│   │   ├── plan.md                           # /plan
│   │   ├── clarify.md                        # /clarify — gates plan (PLAN_DRAFT → PLAN_CLARIFIED)
│   │   ├── tdd.md                            # /tdd
│   │   ├── blueprint.md                      # /blueprint
│   │   ├── task.md                           # /task
│   │   ├── validate.md                       # /validate — gates task (TASK_DRAFT → TASK_VALIDATED)
│   │   ├── implement.md                      # /implement
│   │   ├── document.md                       # /document
│   │   ├── alm-extract.md                    # /alm-extract — emits handoff for ALM agent
│   │   ├── next.md                           # /next — reads .workflow.json, suggests next cmd
│   │   └── status.md                         # /status — phase/gate report
│   └── settings.json                         # GENERATED — MCP registration
├── .claude-plugin/
│   └── plugin.json                           # GENERATED — installable as Claude plugin
├── .github/                                  # GHCP SURFACE (standalone) — all GENERATED
│   ├── chatmodes/
│   │   └── {agent}.chatmode.md
│   └── prompts/                              # non-namespaced prompts (invoked as "spec", etc.)
│       ├── spec.prompt.md
│       └── ...
├── constitution/                             # SOURCE — fully agent-owned (per ADR-0010)
│   ├── 00-charter.md                         # agent purpose, scope, boundaries
│   ├── 01-doc-rules.md                       # how this agent generates docs
│   ├── 02-nfr.md                             # NFR shape and platform-specific targets
│   ├── 03-security.md                        # security baseline
│   ├── 04-testing.md                         # testing standards
│   ├── 05-alm.md                             # ALM mapping for this domain
│   ├── 06-multilingual.md                    # multilingual scope for sub-domains
│   ├── 07-oob-first.md                       # OOB-first decision tree
│   ├── 08-customization-inventory.md         # what this agent can produce
│   └── ...                                   # sub-domain modules per agent
├── templates/                                # SOURCE — agent-owned outright
│   ├── spec.template.md
│   ├── plan.template.md
│   ├── fdd.template.md                       # platform-shaped
│   ├── tdd.template.md                       # platform-shaped
│   ├── blueprint.template.md
│   ├── test-plan/
│   │   ├── index.template.md
│   │   └── suite.template.md
│   ├── task.template.md
│   ├── review-report.template.md
│   └── checklists/                           # six checklists; consumed per ADR-0001
│       ├── spec-review.checklist.md          #   consumed by /review
│       ├── plan-review.checklist.md          #   consumed by /clarify
│       ├── fdd-review.checklist.md           #   consumed inline by /fdd
│       ├── tdd-review.checklist.md           #   consumed inline by /tdd
│       ├── blueprint-review.checklist.md     #   consumed inline by /blueprint
│       └── test-plan-review.checklist.md     #   consumed inline by /test-plan
├── schemas/                                  # MIRRORED from root schemas/
│   ├── handoff.v1.json
│   ├── alm-extract.v1.json
│   ├── work-items.v1.json
│   ├── workflow-state.v1.json
│   ├── brownfield-inventory.v1.json
│   └── project-config.v1.json
├── workflow.yaml                             # MIRRORED from root workflow.yaml
└── README.md                                 # SOURCE — What / How / Details
```

## File category markers (recap)

Per [01-repo-structure.md](01-repo-structure.md):

| Marker | Authority | Examples within this folder |
|---|---|---|
| **SOURCE** | Owned by agent author | `.claude/commands/*.md`, `constitution/*.md`, `templates/**`, `README.md` |
| **MIRRORED** | Read-only copy of root source; drift-checked | `schemas/*`, `workflow.yaml` |
| **GENERATED** | Read-only derivative; drift-checked | `.github/**`, `.claude/settings.json`, `.claude-plugin/plugin.json` |

## Base 17 commands

Every agent that opts into base commands (`agents.yaml` → `base-commands: true`) gets these 17 in its `.claude/commands/`:

| Command | Purpose | Phase | Gate? |
|---|---|---|---|
| `/spec` | Draft the spec from RFP / requirements / ALM extract | DEFINE | — |
| `/review` | Spec-only review against `spec-review.checklist.md` | DEFINE | Gates SPEC_APPROVED |
| `/split` | Emit handoffs to other agents for mixed-domain specs | DEFINE | Optional |
| `/impact` | Brownfield + cross-feature impact analysis | DEFINE | — |
| `/fdd` | Generate FDD; inline self-check against `fdd-review.checklist.md` (per ADR-0001) | DESIGN | — |
| `/test-plan` | Multi-doc test plan folder; inline self-check | DESIGN | — |
| `/plan` | Work breakdown by L1–L4 | DESIGN | — |
| `/clarify` | Plan-approval against `plan-review.checklist.md` | DESIGN | Gates PLAN_CLARIFIED |
| `/tdd` | Technical design; inline self-check | DESIGN | — |
| `/blueprint` | Architecture blueprint; inline self-check | DESIGN | — |
| `/task` | Detail L4 work items | BUILD | — |
| `/validate` | Task validation against task card | BUILD | Gates TASK_VALIDATED |
| `/implement` | Drive implementation | BUILD | — |
| `/document` | Update docs from implementation | BUILD | — |
| `/alm-extract` | Emit handoff for ALM agent | BUILD | — |
| `/next` | Read `.workflow.json`, suggest next command | utility | — |
| `/status` | Phase + gate matrix + dependencies | utility | — |

Agents may declare additional commands in `agents.yaml` → `extra-commands`. For example, d365-fo adds `/lcs-deploy` and `/dmf-package`; brownfield replaces the base set with `/prepare`, `/scan`, `/document`, `/fdd`, `/tdd`, `/blueprint`, `/generate`, `/index`, `/handoff`.

## Constitution and template resolution at runtime

Per [01-repo-structure.md](01-repo-structure.md) and [ADR-0010](adr/0010-templates-agent-owned.md):

**Two layers, file-level resolution. First match wins. No merging.**

1. `projects/{p}/{a}/constitution-override/0X-*.md` — if `--project <name>` is passed
2. `agents/{a}/constitution/0X-*.md` — agent default

Same pattern for templates.

If a file exists at the project level, it fully replaces the agent's version. If it doesn't, the agent's version is used. No conditionals, no patching, no flags.

Standalone mode without `--project` reads only the agent layer. Standalone with `--project <name>` reads `../../projects/{name}/{a}/constitution-override/` (works only when the agent folder is inside the consolidated repo).

## MCP server path trade-off

| Standalone mode | `settings.json` points to | Works? |
|---|---|---|
| Agent folder inside the consolidated repo | `../../tools/mcp-server/dist/index.js` | yes |
| Agent folder copied elsewhere | Same relative path — broken | no — install as a plugin |
| Root-unified | `./tools/mcp-server/dist/index.js` | yes |
| Plugin install from marketplace | Plugin manages its own path | yes |

Plugin mode is the supported "truly portable" path. Pure folder-copy is best-effort.

## Per-agent README structure (What / How / Details)

Every agent's `README.md` follows the same three-section structure for skim-readability:

- **What** — one-paragraph description of the agent's scope and outputs
- **How** — bullet list of the most common workflows (spec → plan → task → implement, plus agent-specific extras)
- **Details** — links into the agent's constitution, templates, and the relevant design folder docs

See [14-readme-conventions.md](14-readme-conventions.md) for the full README contract.

## References

- ADRs: [ADR-0002](adr/0002-dual-mode-delivery-surfaces.md), [ADR-0003](adr/0003-single-source-of-truth-commands.md), [ADR-0004](adr/0004-self-contained-agent-folders.md), [ADR-0010](adr/0010-templates-agent-owned.md), [ADR-0011](adr/0011-publish-pipeline-8-job-model.md)
- Per-agent details: [agents/](agents/)
- Cross-references: [01-repo-structure.md](01-repo-structure.md), [04-workflow-gates.md](04-workflow-gates.md), [06-templates.md](06-templates.md), [12-publish-pipeline.md](12-publish-pipeline.md), [14-readme-conventions.md](14-readme-conventions.md)
