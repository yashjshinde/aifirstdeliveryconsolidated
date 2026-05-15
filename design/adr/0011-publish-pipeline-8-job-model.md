---
adr: 0011
title: Publish Pipeline performs 8 jobs (mirror, render settings, render plugin, render GHCP, render unified, marketplace, drift check) from a single authored source
status: accepted
decided-on: 2026-05-14
design-doc-refs: [12-publish-pipeline.md, 01-repo-structure.md, 02-agent-skeleton.md]
---

# ADR-0011 — Publish Pipeline 8-job model

## Status

`accepted` — decided 2026-05-14.

## Context

ADR-0002 commits the platform to four delivery surfaces from a single authored source. ADR-0003 places that source in `agents/{a}/.claude/commands/`. ADR-0004 requires that root-level assets (schemas, workflow.yaml) be mirrored into every agent so standalone mode works. ADR-0010 leaves templates and constitution agent-owned (no mirroring there). Plugin distribution (per ADR-0004) requires per-agent `plugin.json` and a root-level `marketplace.json`.

Originally this work was scoped as a single-purpose "transformer" (Claude → GHCP). As the four-surface, plugin-aware, drift-checked design solidified, the scope expanded to a multi-job pipeline.

## Decision

A PowerShell script at `tools/sync/Publish-Agents.ps1` performs **eight jobs**, all idempotent, all drift-checked:

| # | Job | Reads | Writes | Notes |
|---|---|---|---|---|
| 1 | **Mirror root assets** | `schemas/*.v1.json`, `workflow.yaml` | `agents/{a}/schemas/*`, `agents/{a}/workflow.yaml` | Byte-for-byte copy; mirrored files are read-only. |
| 2 | **Render per-agent settings.json** | `tools/sync/settings.template.json`, `agents.yaml` | `agents/{a}/.claude/settings.json` | MCP server path is relative `../../tools/mcp-server/dist/index.js` for standalone mode. |
| 3 | **Render per-agent plugin.json** | `tools/sync/plugin.template.json`, `agents.yaml` | `agents/{a}/.claude-plugin/plugin.json` | Each agent becomes installable as a Claude plugin. |
| 4 | **Render GHCP standalone** | `agents/{a}/.claude/commands/*.md`, `tools/sync/chatmode.template.md` | `agents/{a}/.github/chatmodes/{a}.chatmode.md`, `agents/{a}/.github/prompts/*.prompt.md` | Standalone GHCP — prompts are non-namespaced. |
| 5 | **Render Claude root-unified** | `agents/{a}/.claude/commands/*.md` | `.claude/commands/{a}/*.md` | Root-unified — subfolder = namespace; user invokes `/{agent}:{cmd}`. |
| 6 | **Render GHCP root-unified** | `agents/{a}/.claude/commands/*.md` | `.github/chatmodes/{a}.chatmode.md`, `.github/prompts/{a}-{cmd}.prompt.md` | Root-unified GHCP — prompts namespaced with `{agent}-` prefix. |
| 7 | **Render marketplace.json** | `agents.yaml`, all agents' `plugin.json` | `.claude-plugin/marketplace.json` | Lists all 8 agents as installable plugins. |
| 8 | **Drift check** | All generated outputs | (read-only) | Hashes every generated file; fails build if hash differs from last publish. Hand-edits are caught here. |

### Companion: file-watcher mode

`tools/sync/Watch-Agents.ps1` runs jobs 1–7 incrementally as source files change. Drift check (job 8) only runs in batch mode (CI).

### Authoring inputs (the only files humans edit)

```
agents/{a}/.claude/commands/*.md         # commands (Claude-native; ADR-0003)
agents/{a}/constitution/*.md             # agent-owned (ADR-0010)
agents/{a}/templates/*                   # agent-owned (ADR-0010)
agents/{a}/README.md                     # agent-owned (the only one)
agents.yaml                              # root registry — agent metadata + docScope keys
workflow.yaml                            # root — DAG + transitions
schemas/*.v1.json                        # root — wire contracts
tools/sync/settings.template.json        # canonical settings template
tools/sync/plugin.template.json          # canonical plugin manifest template
tools/sync/chatmode.template.md          # GHCP chatmode wrapper template
```

### Drift-check enforcement

A CI workflow `.github/workflows/check-publish-drift.yml` runs `Publish-Agents.ps1` in check mode on every PR. If any generated file's hash differs from the recomputed value, the CI job fails and lists the drifted files. Forces all authoring through the pipeline.

## Alternatives considered

- **Single transformer (Claude → GHCP only).** Reject — doesn't cover mirror, settings, plugin, marketplace, or drift check. The job grew.
- **One script per job.** Reject — adds orchestration complexity; users would forget to run a job; CI would have to chain N scripts. Single entry script with internal job stages.
- **No drift check; trust authors.** Reject — generated files end up hand-edited eventually; the only sustainable enforcement is a CI gate.
- **Generate-on-demand at command-invocation time.** Reject — requires runtime tooling in both Claude and GHCP; slow; doesn't help GHCP single-agent users who need their `.github/prompts/` materialised.

## Consequences

**Positive:**
- One script, one entry point, eight jobs — easy to reason about and unit-test.
- Drift check catches hand-edits of generated files before they merge.
- Plugin distribution (ADR-0004) automatically published as a side-effect of the same pipeline.

**Negative:**
- 8 jobs means 8 places where things can break. Each job needs its own test coverage.
- Authors must run the publish pipeline (or rely on file-watcher) to update generated surfaces. New contributors discover this when CI fails.
- Generated files are visible in the repo (Claude root-unified commands, GHCP prompts, marketplace.json). Could mislead users into thinking they're authored — mitigated by `DO NOT EDIT` headers in every generated file and CI enforcement.

**Affected design docs:** [12-publish-pipeline.md](../12-publish-pipeline.md), [01-repo-structure.md](../01-repo-structure.md), [02-agent-skeleton.md](../02-agent-skeleton.md).

## References

- Related ADRs: [ADR-0002](0002-dual-mode-delivery-surfaces.md) (the four surfaces this pipeline produces), [ADR-0003](0003-single-source-of-truth-commands.md) (the authored location), [ADR-0004](0004-self-contained-agent-folders.md) (mirror job + plugin distribution), [ADR-0010](0010-templates-agent-owned.md) (no template mirroring)
