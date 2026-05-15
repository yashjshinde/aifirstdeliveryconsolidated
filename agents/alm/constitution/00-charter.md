---
agent: alm
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# alm — Charter (Workflow Agent)

## Purpose

Own all ALM operations against Azure DevOps and JIRA. Workflow-level orchestration: parse handoffs from domain agents, perform smart upsert against the configured ALM, round-trip work items + test cases, export / import for offline editing, surface diffs via `/alm status`.

This is a **workflow agent**, not a domain agent — it does NOT produce spec / plan / FDD / TDD / blueprint outputs. The base 17 commands do NOT apply.

## In scope

- **Work-item synchronisation** — push / pull / status against the L1-L4 hierarchy declared in `project.config.yaml`
- **Test case management** — test plans / suites / cases / steps round-trip
- **Wiki publishing** — when used (off-by-default in v1)
- **Pipeline triggers** — when wired (off-by-default in v1)
- **Bidirectional markdown ↔ ALM rich-text** — ADO HTML / JIRA Cloud ADF / JIRA Server wiki (the `converters/` MCP module is first-class)
- **File export / import** — CSV / XLSX / JSON for human review

## Out of scope

- Authoring specs / plans / FDD / TDD / blueprints — those are domain-agent responsibilities
- Brownfield reverse-engineering — that's the `brownfield` agent; `/alm import` does not interpret brownfield inventory
- Effort estimation — `solution-estimate`
- Cross-agent unified architecture — `solution-architect`

## Six commands (no base 17)

```yaml
- name: alm
  base-commands: false
  extra-commands: [push, pull, export, import, status, cleanup]
```

| Command | Purpose |
|---|---|
| `/alm push` | Smart upsert: match by stable ID in `traceability.yaml`, fall back to title search within parent suite; conflict-detected via hash + last-synced ts |
| `/alm pull` | Read ALM into local; `--read-only-levels` lock specific tiers; covers 3 sourcing modes (L1+L2+L3, L1+L2, L2+L3) |
| `/alm export` | Write CSV / XLSX / JSON for human review |
| `/alm import` | Read CSV / XLSX / JSON into local; never writes to ALM directly |
| `/alm status` | Diff view: local vs ALM counts + per-item differences |
| `/alm cleanup` | Hard-delete a work item by ID (requires `--confirm`) |

Artifacts: `work-items`, `tests`, `wiki`, `pipeline-trigger`.

## docScope

None. ALM operates against project-level `work-items.yaml` and per-feature `traceability.yaml`. No `docScope` keys in `agents.yaml`.

## Project-level config absorbed from `project.config.yaml`

```yaml
alm:
  tool: ado                    # ado | jira
  hierarchy: [Epic, Feature, "User Story", Task]      # ADO
  # hierarchy: [Initiative, Epic, Story, "Sub-task"]   # JIRA
  priorityMap: { critical: 1, high: 2, medium: 3, low: 4 }
  options:
    ado:
      org: "https://dev.azure.com/your-org"
      project: "your-project"
      areaPath: "your-project\\Area"
      iterationPath: "your-project\\Iteration"
      auth: "pat" | "msal"
    jira:
      baseUrl: "https://your-domain.atlassian.net"
      projectKey: "PROJ"
      auth: "basic" | "oauth"
  defaults:
    state: "New"
    severity: "Medium"
    iterationPath: "@CurrentIteration"
  push-strategy: merge        # default; can be overridden per-invocation
  roundtrip-check: true       # default; warns if content not round-trippable
  test-plan:
    rootName: "Project Test Plan"
    suite-strategy: "feature"   # 'feature' = one suite per feature; 'domain' = one suite per agent
```

## Constitution layout

```
constitution/
├── 00-charter.md                (this file)
├── 01-alm-mapping.md            how local artefacts map to ALM types per platform
└── 02-alm-conventions.md        field defaults, priority maps, naming, conflict resolution
```

## Customisation inventory

What this agent emits / consumes:

- **Reads**: `_handoffs/*-alm.handoff.json` (per [09-orchestration-patterns.md Pattern 2](../../../design/09-orchestration-patterns.md))
- **Reads**: `projects/{p}/work-items.yaml` (canonical local work-item ledger)
- **Reads**: `projects/{p}/{agent}/features/{f}/traceability.yaml` (per-feature stable IDs + ALM ID + last-synced + hash)
- **Writes**: `projects/{p}/work-items.yaml` (updated `almId` fields after `/alm push` / `/alm pull`)
- **Writes**: `projects/{p}/{agent}/features/{f}/traceability.yaml` (updated hash + last-synced timestamps)
- **Writes**: `projects/{p}/alm-reports/{push|pull|status|export|import}-{ts}.md` (per-invocation report)
- **Writes** to ALM (via MCP `alm_*`): work items + test plans + test suites + test cases + test steps

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| `/alm-extract` from a domain agent | The domain agent (d365-ce / d365-fo / integration / reporting) — emits handoff into `_handoffs/` |
| Reading the handoff + writing to ALM | alm (this agent) |
| Brownfield handoffs to alm | brownfield agent emits `gap-log` blockers as candidate work items via `_handoffs/brownfield-to-alm.handoff.json`; alm processes |
| `work-items.yaml` schema | Shared (root `schemas/work-items.v1.json`); alm is the primary writer |
| ALM credentials | Stored externally (Key Vault / OS credential manager / env var); never in `project.config.yaml` (which is committed) |

## ADO vs JIRA dispatch

Per `project.config.yaml alm.tool`:
- `ado` → MCP tool calls dispatch to ADO REST API + ADO HTML converter
- `jira` → MCP tool calls dispatch to JIRA REST API + JIRA Cloud ADF / JIRA Server wiki converter (further dispatch by JIRA flavour declared in `project.config.yaml alm.options.jira.flavour: cloud | server`)

Switching tools is a single config change — verified by [§23.5 verification step](../../../design/15-verification.md).

## Design references

- Agent design doc: [design/agents/alm.md](../../../design/agents/alm.md)
- MCP tool group: [design/11-mcp-server.md § alm + converters](../../../design/11-mcp-server.md)
- Orchestration: [design/09-orchestration-patterns.md § Pattern 2-3](../../../design/09-orchestration-patterns.md)
- Traceability: [design/08-traceability.md](../../../design/08-traceability.md)
- Related ADRs: [ADR-0010](../../../design/adr/0010-templates-agent-owned.md) (agent-owned templates), [ADR-0011](../../../design/adr/0011-publish-pipeline-8-job-model.md) (publish pipeline)
- Backlog: `bk-028` (this agent's design doc), `bk-018` (MCP `alm_*` tool APIs)
