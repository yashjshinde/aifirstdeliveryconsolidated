---
adr: 0004
title: Self-contained agent folders — publish pipeline mirrors root assets into each agent; plugin distribution for portability
status: accepted
decided-on: 2026-05-14
design-doc-refs: [02-agent-skeleton.md, 01-repo-structure.md, 12-publish-pipeline.md]
---

# ADR-0004 — Self-contained agent folders + plugin distribution

## Status

`accepted` — decided 2026-05-14.

## Context

ADR-0002 requires that opening an isolated agent folder (e.g., `agents/d365-ce/`) in VS Code, with no repo context, must produce a fully functional agent. Three concrete constraints arise:

1. **No parent-path reads.** A standalone agent cannot read `../../schemas/`, `../../workflow.yaml`, or any other repo-root asset, because the user may have copied just the agent folder onto a different machine.
2. **MCP server access.** The MCP server lives at `tools/mcp-server/` (repo root). Agents reference it via relative path in their `.claude/settings.json`. If the folder is copied elsewhere, the relative path breaks.
3. **Portable distribution.** Users want to share or install agents without cloning the whole repo.

## Decision

Three parts:

### (a) Each agent folder is fully self-contained at the source level

The Publish Pipeline (ADR-0011) **mirrors** the following root assets into every agent folder as read-only copies:

| Root asset | Mirrored to |
|---|---|
| `schemas/*.v1.json` | `agents/{a}/schemas/*.v1.json` |
| `workflow.yaml` | `agents/{a}/workflow.yaml` |

Agents author their own `constitution/` and `templates/` outright (ADR-0010) — no mirroring needed there.

Mirrored files are **drift-checked**: hand-edits to the mirrored copy fail CI. The source-of-truth stays at repo root.

### (b) MCP path constraint, documented and accepted

| Standalone mode | settings.json points to | Works? |
|---|---|---|
| Agent folder inside the consolidated repo | `../../tools/mcp-server/dist/index.js` | yes |
| Agent folder copied to a different location | Same relative path — broken | no |
| Root-unified | `./tools/mcp-server/dist/index.js` | yes |
| **Plugin install from marketplace** | Plugin manages its own path | **yes — recommended for portability** |

Pure folder-copy is best-effort. Plugin install is the supported portable path.

### (c) Each agent is also packaged as a Claude plugin

The Publish Pipeline generates `.claude-plugin/plugin.json` in every agent folder. Root carries `.claude-plugin/marketplace.json` listing all 8 agents. Users install via `/plugin install` from the marketplace; plugin install manages its own MCP server path.

## Alternatives considered

- **Agent reads parent paths via `../../constitution/_base/`.** Reject — breaks standalone mode the moment the folder is copied off-disk.
- **No portable distribution; only run from the cloned repo.** Reject — limits adoption and prevents sharing individual agents.
- **Bundle MCP server inside each agent folder.** Reject — multiplies disk footprint by 8 and creates 8 versions of the MCP server to maintain.

## Consequences

**Positive:**
- Standalone agents work in isolation (read-only mirrored copies + agent-owned constitution and templates).
- Drift detection prevents silent divergence between root source and agent mirrors.
- Plugin distribution gives users a portable form factor.

**Negative:**
- Mirroring duplicates schemas and `workflow.yaml` into 8 places — disk overhead, ~150 KB per agent, ~1.2 MB across the repo.
- Folder-copy portability is intentionally not supported beyond best-effort.
- Plugin packaging is part of the publish pipeline's responsibility; failing to publish means agents are non-portable.

**Affected design docs:** [02-agent-skeleton.md](../02-agent-skeleton.md), [01-repo-structure.md](../01-repo-structure.md), [12-publish-pipeline.md](../12-publish-pipeline.md).

## References

- Related ADRs: [ADR-0002](0002-dual-mode-delivery-surfaces.md), [ADR-0010](0010-templates-agent-owned.md), [ADR-0011](0011-publish-pipeline-8-job-model.md)
