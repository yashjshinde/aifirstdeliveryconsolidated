---
title: Publish Pipeline — 8-job model
status: live
adr-refs: [ADR-0002, ADR-0003, ADR-0004, ADR-0010, ADR-0011]
last-reviewed: 2026-05-14
owner: design
---

# Publish Pipeline

> PowerShell script at `tools/sync/Publish-Agents.ps1` that performs **eight jobs** from a single authored source. See [ADR-0011](adr/0011-publish-pipeline-8-job-model.md) for the rationale.

## The eight jobs

| # | Job | Reads | Writes | Drift-checked? |
|---|---|---|---|---|
| 1 | **Mirror root assets** | `schemas/*.v1.json`, `workflow.yaml` | `agents/{a}/schemas/*`, `agents/{a}/workflow.yaml` | Yes |
| 2 | **Render per-agent settings.json** | `tools/sync/settings.template.json`, `agents.yaml` | `agents/{a}/.claude/settings.json` | Yes |
| 3 | **Render per-agent plugin.json** | `tools/sync/plugin.template.json`, `agents.yaml` | `agents/{a}/.claude-plugin/plugin.json` | Yes |
| 4 | **Render GHCP standalone** | `agents/{a}/.claude/commands/*.md`, `tools/sync/chatmode.template.md` | `agents/{a}/.github/chatmodes/{a}.chatmode.md`, `agents/{a}/.github/prompts/*.prompt.md` | Yes |
| 5 | **Render Claude root-unified** | `agents/{a}/.claude/commands/*.md` | `.claude/commands/{a}/*.md` (namespaced subfolders) | Yes |
| 6 | **Render GHCP root-unified** | `agents/{a}/.claude/commands/*.md` | `.github/chatmodes/{a}.chatmode.md`, `.github/prompts/{a}-{cmd}.prompt.md` (namespaced prefix) | Yes |
| 7 | **Render marketplace.json** | `agents.yaml`, all agents' `plugin.json` | `.claude-plugin/marketplace.json` | Yes |
| 8 | **Drift check** | All MIRRORED + GENERATED outputs | (read-only) | — |

## Layout

```
tools/sync/
├── Publish-Agents.ps1                  # main entry — executes all 8 jobs
├── Watch-Agents.ps1                    # file-watcher mode — incremental jobs 1-7 only
├── settings.template.json              # canonical settings template for jobs 2 + (root settings)
├── plugin.template.json                # canonical plugin manifest template for job 3
├── chatmode.template.md                # GHCP chatmode wrapper for jobs 4 + 6
└── README.md
```

## Authoring inputs (only files humans edit)

```
agents/{a}/.claude/commands/*.md         # commands (Claude-native; ADR-0003)
agents/{a}/constitution/*.md             # agent-owned (ADR-0010)
agents/{a}/templates/**                  # agent-owned (ADR-0010)
agents/{a}/README.md                     # agent-owned
agents.yaml                              # root registry — agent metadata + docScope keys
workflow.yaml                            # root — DAG + transitions
schemas/*.v1.json                        # root — wire contracts
tools/sync/settings.template.json        # canonical settings template
tools/sync/plugin.template.json          # canonical plugin manifest template
tools/sync/chatmode.template.md          # GHCP chatmode wrapper template
```

## Generated outputs (read-only; drift-checked)

```
agents/{a}/.claude/settings.json         # job 2
agents/{a}/.claude-plugin/plugin.json    # job 3
agents/{a}/.github/chatmodes/*.md        # job 4
agents/{a}/.github/prompts/*.prompt.md   # job 4
agents/{a}/schemas/*.json                # job 1 (mirrored from root)
agents/{a}/workflow.yaml                 # job 1 (mirrored from root)
.claude/commands/{a}/*.md                # job 5
.claude/settings.json                    # job 2 (root-level variant)
.github/chatmodes/*.md                   # job 6
.github/prompts/{a}-*.prompt.md          # job 6
.claude-plugin/marketplace.json          # job 7
```

## Drift check (job 8)

Hashes every MIRRORED and GENERATED file. Fails the build if the recomputed hash differs from the last-published value (stored in a `.publish-state.json` cache in `tools/sync/`).

CI workflow at `.github/workflows/check-publish-drift.yml`:

```yaml
name: Check Publish Drift
on: [pull_request, push]
jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - shell: pwsh
        run: |
          ./tools/sync/Publish-Agents.ps1 -CheckOnly
          if ($LASTEXITCODE -ne 0) { Write-Error "Drift detected; run Publish-Agents.ps1 locally and commit." ; exit 1 }
```

## Render rules

### Claude root-unified (job 5)

Source: `agents/{a}/.claude/commands/spec.md`
Output: `.claude/commands/{a}/spec.md` (subfolder = namespace)
User invokes: `/{a}:spec` (e.g., `/d365-ce:spec`)

Body and frontmatter are transformed:

- Add prefix to title: `# {a} — Spec` (was `# Spec`)
- Replace single-agent context with multi-agent context (path-relative references in command body become root-absolute)

### GHCP standalone (job 4)

Source: `agents/{a}/.claude/commands/spec.md`
Output: `agents/{a}/.github/prompts/spec.prompt.md`
User invokes in VS Code Copilot: `spec` (no namespace, since the user opened just `agents/{a}/`)

Plus a chatmode wrapper at `agents/{a}/.github/chatmodes/{a}.chatmode.md` registering the agent's chatmode.

### GHCP root-unified (job 6)

Source: `agents/{a}/.claude/commands/spec.md`
Output: `.github/prompts/{a}-spec.prompt.md` (namespaced prefix)
User invokes: `{a}-spec` (e.g., `d365-ce-spec`)

Plus a chatmode wrapper at `.github/chatmodes/{a}.chatmode.md` (one per agent, listing the agent's namespaced prompts).

### Marketplace (job 7)

Schema follows Claude Code plugin marketplace specification. Lists all 8 agents as installable plugins; each entry includes the agent's name, version, description, and reference to its `agents/{a}/.claude-plugin/plugin.json`.

## Watch mode

`Watch-Agents.ps1` runs the file-watcher pattern: monitors source files via `FileSystemWatcher`, queues incremental jobs (1–7 only), runs them on a debounce. Drift check (job 8) is batch-mode only.

Useful during active authoring — saves running `Publish-Agents.ps1` manually after every edit.

## Failure modes and recovery

- **Drift detected:** CI fails. Author runs `Publish-Agents.ps1` locally and commits the regenerated files.
- **Source file deleted:** corresponding generated files are deleted by the pipeline. Drift check would fail if generated files exist without sources.
- **Template change:** changing `settings.template.json` triggers re-render of every agent's `settings.json` on the next run.
- **Schema change:** changing a `schemas/*.json` file triggers re-mirror on the next run; all agents pick up the new schema.

## Plugin distribution

Per [ADR-0004](adr/0004-self-contained-agent-folders.md), each agent's `plugin.json` (generated in job 3) makes it installable as a Claude plugin. The marketplace (job 7) provides the index. Users install via `/plugin install` from the marketplace. Plugin install manages the MCP server path — the only fully portable form factor.

## References

- ADRs: [ADR-0002](adr/0002-dual-mode-delivery-surfaces.md), [ADR-0003](adr/0003-single-source-of-truth-commands.md), [ADR-0004](adr/0004-self-contained-agent-folders.md), [ADR-0010](adr/0010-templates-agent-owned.md), [ADR-0011](adr/0011-publish-pipeline-8-job-model.md)
- Cross-references: [01-repo-structure.md](01-repo-structure.md), [02-agent-skeleton.md](02-agent-skeleton.md), [11-mcp-server.md](11-mcp-server.md)
- Backlog: `bk-021` (settings + plugin templates)
