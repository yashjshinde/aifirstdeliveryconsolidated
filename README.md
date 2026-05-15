# Spec-Driven Development Platform — Consolidated

> A spec-driven development workflow for Microsoft Dynamics 365 and Power Platform delivery. Eight domain agents, a single MCP server, file-state-based orchestration, four delivery surfaces (Claude standalone + root-unified, GitHub Copilot standalone + root-unified) generated from one authored source.

## Three-artefact model

```
design/             ← AUTHORITATIVE DESIGN (where the contract lives; self-contained)
  │
  ▼ decisions drive
implementation.md   ← BUILD LOG (append-only; tracks every fix and build action)
                      + the forward-looking 10-phase Implementation Plan
reference/          ← LEGACY (original master plan + ported source bundles; to be removed)
```

| Folder / file | Role | Mutability |
|---|---|---|
| **[design/](design/)** | Per-topic design docs, ADRs, backlog. Each doc carries the substance to build that topic. | Kept up to date; substantive changes → new ADR + log entry |
| **[implementation.md](implementation.md)** | Append-only changelog + Implementation Plan | Plan section revisable; entries append-only |
| **[reference/](reference/)** | Historical master plan + source bundles | Frozen; planned removal |

## Repo layout

```
aifirstdeliveryconsolidated/
├── README.md                         # this file
├── implementation.md                 # build log + Implementation Plan
├── agents.yaml                       # agent registry (versions, commands, docScope)
├── workflow.yaml                     # DAG: phases, states, transitions, hard gates
├── agents/                           # 8 domain agents (built per Phases 5-8)
│   ├── _skeleton/                    # template for new agents
│   ├── d365-ce/   d365-fo/   integration/   reporting/
│   ├── solution-estimate/   solution-architect/
│   ├── brownfield/   alm/
├── constitution/_reference/          # SCAFFOLDING ONLY — starter constitution files for New-Agent.ps1
├── templates/_reference/             # SCAFFOLDING ONLY — starter template files for New-Agent.ps1
├── schemas/                          # versioned JSON schemas
├── tools/
│   ├── mcp-server/                   # single MCP server, modular tool groups
│   ├── sync/                         # publish pipeline (PowerShell)
│   ├── scaffold/                     # New-Project / New-Feature / New-Agent (PowerShell)
│   └── chat-ui/                      # React + Node web client
├── .github/                          # GENERATED — GHCP root-unified surface
├── .claude/                          # GENERATED — Claude root-unified surface
├── .claude-plugin/                   # GENERATED — marketplace.json
├── docs/                             # human-facing project-agnostic
│   ├── architecture.md
│   └── orchestration.md
├── design/                           # authoritative design
└── projects/                         # per-project state
    └── {project-name}/               # created by New-Project.ps1
```

## The eight agents

| # | Agent | Scope |
|---|---|---|
| 1 | **d365-ce** *(fat)* | Model-driven CE + Canvas + Power Pages + PCF + all Power Automate + plugins / JS / BPF / workflows / BPM |
| 2 | **d365-fo** | X++, AOT, DMF, batch, ER, F&O-native SSRS — autonomous; feature-scoped FastTrack pattern |
| 3 | **integration** *(merged)* | Event-driven + batch + data-migration: Functions, Logic Apps, Service Bus, APIM, Event Grid, ADF, SFTP, bulk Dataverse |
| 4 | **reporting** | CE SSRS + Power BI (CE data + BYOD-exposed F&O data) |
| 5 | **solution-estimate** | Aggregator: 103-factor catalogue, 8-value Fitment, 7 phases (×2.76 total), brownfield multipliers, confidence bands |
| 6 | **solution-architect** | Aggregator: unified architecture, cross-agent gap review, clickable HTML solution prototype |
| 7 | **brownfield** | Reverse-engineering: auto-mode self-healing, 9 patterns + ~185 bindings, ~140+ artifact taxonomy |
| 8 | **alm** | Workflow-level ALM over ADO + JIRA, bidirectional md↔ALM rich-text converters, 6 action-first verbs |

See [design/03-agent-inventory.md](design/03-agent-inventory.md) for details and [design/agents/](design/agents/) for per-agent design.

## Workflow phases

```
DEFINE  →  DESIGN  →  BUILD
```

`/review` gates spec → `/clarify` gates plan → `/validate` gates task → `/implement`. Hard gates enforced by reading `.workflow.json` before each command runs. See [design/04-workflow-gates.md](design/04-workflow-gates.md).

## Current build state

The platform is in the middle of its build. Today (per [implementation.md § Implementation Plan](implementation.md)):

| Phase | Status |
|---|---|
| 0 — Pre-build groundwork | ✅ done |
| **1 — Foundation: root assets** | ✅ done (this milestone) |
| 2 — MCP server core | ⏳ ready (begins next) |
| 3 — Scaffold scripts | 🔒 blocked on Phase 2 |
| 4 — Publish pipeline | 🔒 blocked on Phase 3 |
| 5 — BASIC agents (solution-estimate + solution-architect) | 🔒 blocked on Phase 4 |
| 6 — MATURE agents (CE / FO / Int / Rep) | 🔒 blocked on Phase 5 |
| 7 — Brownfield | 🔒 blocked on Phase 6 |
| 8 — ALM | 🔒 blocked on Phase 7 |
| 9 — Chat UI | 🔒 blocked on Phase 8 |
| 10 — Verification + ADR backfill | 🔒 blocked on Phase 9 |

## Where to start

- **Designing or reviewing a decision?** → [design/README.md](design/README.md)
- **Looking for the implementation plan?** → [implementation.md § Implementation Plan](implementation.md)
- **Tracking what's been built?** → [implementation.md § Entries](implementation.md) (append-only)
- **Architecture overview?** → [docs/architecture.md](docs/architecture.md)
- **Orchestration patterns?** → [docs/orchestration.md](docs/orchestration.md)
- **Want to build a new agent?** → see [design/02-agent-skeleton.md](design/02-agent-skeleton.md) (and once `New-Agent.ps1` exists in Phase 3, just run it)
- **Want to scaffold a new project?** → `New-Project.ps1` (delivered in Phase 3)

## Contributing

Every change follows the three-step rule (per [design/README.md](design/README.md)):

1. **Decide → ADR.** Load-bearing changes get an ADR in `design/adr/`.
2. **Document → design doc.** Update the relevant per-topic design doc.
3. **Log → implementation.md.** Append an entry with cross-references.

Generated files (`.github/`, `.claude/commands/`, `.claude-plugin/marketplace.json`, agent `.github/` + `.claude/settings.json` + `.claude-plugin/plugin.json`, `agents/{a}/schemas/`, `agents/{a}/workflow.yaml`) are **read-only**. CI fails on hand-edits.

## License

(TBD)
