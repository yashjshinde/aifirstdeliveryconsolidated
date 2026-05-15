# Publish Pipeline

> Per [ADR-0011](../../design/adr/0011-publish-pipeline-8-job-model.md). One PowerShell script (`Publish-Agents.ps1`) performs 8 idempotent, drift-checked jobs that produce every derivative surface from the authored sources. Built per [design/12-publish-pipeline.md](../../design/12-publish-pipeline.md).

## Three entry points

| Command | Purpose |
|---|---|
| [Publish-Agents.ps1](Publish-Agents.ps1) | Run the full 8-job pipeline (or filter with `-Agent`, dry-run with `-DryRun`) |
| [Watch-Agents.ps1](Watch-Agents.ps1) | File-watcher developer loop — re-runs Jobs 1-7 when authored sources change |
| `Publish-Agents.ps1 -CheckDrift` | CI gate — fails if any generated/mirrored file has been hand-edited |

## The 8 jobs

| # | Job | Reads | Writes |
|---|---|---|---|
| 1 | Mirror root assets | `schemas/*.v1.json`, `workflow.yaml` | `agents/{a}/schemas/*`, `agents/{a}/workflow.yaml` (byte-for-byte) |
| 2 | Render per-agent + root `settings.json` | [settings.template.json](settings.template.json), `agents.yaml` | `agents/{a}/.claude/settings.json`, `.claude/settings.json` (MCP server path adjusted per surface) |
| 3 | Render per-agent `plugin.json` | [plugin.template.json](plugin.template.json), `agents.yaml` | `agents/{a}/.claude-plugin/plugin.json` |
| 4 | Render GHCP standalone | `agents/{a}/.claude/commands/*.md`, [chatmode.template.md](chatmode.template.md) | `agents/{a}/.github/chatmodes/{a}.chatmode.md`, `agents/{a}/.github/prompts/<cmd>.prompt.md` |
| 5 | Render Claude root-unified | `agents/{a}/.claude/commands/*.md` | `.claude/commands/{a}/<cmd>.md` (invoked as `/{a}:<cmd>`) |
| 6 | Render GHCP root-unified | `agents/{a}/.claude/commands/*.md`, [chatmode.template.md](chatmode.template.md) | `.github/chatmodes/{a}.chatmode.md`, `.github/prompts/{a}-<cmd>.prompt.md` |
| 7 | Render marketplace.json | All `plugin.json` files + `agents.yaml` | `.claude-plugin/marketplace.json` (lists all 8 agents) |
| 8 | Drift check + manifest | All outputs from jobs 1-7 | `.publish-manifest.json` (SHA-256 per file); compares to existing in `-CheckDrift` mode |

## Behavior

- **Idempotent.** Re-running with no source changes writes 0 files (everything `skip`s on hash match).
- **UTF-8 no BOM, LF line endings.** All generated files are UTF-8 without BOM with `\n` newlines (so `JSON.parse` and `js-yaml` both work; cross-platform diff-friendly).
- **DO NOT EDIT headers** are written into every generated file. Hand-edits are caught by `-CheckDrift` in CI.
- **Graceful on empty `agents/`.** Phase 4 ran before Phase 5+ created any agents; the pipeline cleanly handles the no-agents-yet state by mirroring nothing and skipping Jobs 4-6 for absent command folders. It still renders `.claude/settings.json` at the root and `marketplace.json`.

## Quick reference

```powershell
# Full publish (typical local-dev run)
.\tools\sync\Publish-Agents.ps1

# Filter to one agent
.\tools\sync\Publish-Agents.ps1 -Agent d365-ce

# See what would change without writing
.\tools\sync\Publish-Agents.ps1 -DryRun

# CI gate: fail if any generated file has been hand-edited
.\tools\sync\Publish-Agents.ps1 -CheckDrift

# Developer loop: re-runs as you edit
.\tools\sync\Watch-Agents.ps1
```

## What goes where

```
SOURCE (humans edit):
  agents.yaml                            <- registry
  workflow.yaml                          <- DAG
  schemas/*.v1.json                      <- wire contracts
  tools/sync/*.template.*                <- canonical templates
  agents/{a}/.claude/commands/*.md       <- commands (ADR-0003)
  agents/{a}/constitution/*.md           <- agent-owned (ADR-0010)
  agents/{a}/templates/**                <- agent-owned (ADR-0010)
  agents/{a}/README.md                   <- agent-owned

MIRRORED (Job 1; copy from source):
  agents/{a}/schemas/*
  agents/{a}/workflow.yaml

GENERATED (Jobs 2-7; rendered from templates + commands):
  agents/{a}/.claude/settings.json
  agents/{a}/.claude-plugin/plugin.json
  agents/{a}/.github/chatmodes/{a}.chatmode.md
  agents/{a}/.github/prompts/<cmd>.prompt.md
  .claude/settings.json
  .claude/commands/{a}/<cmd>.md
  .github/chatmodes/{a}.chatmode.md
  .github/prompts/{a}-<cmd>.prompt.md
  .claude-plugin/marketplace.json
  .publish-manifest.json                  <- Job 8 output
```

## Drift check

The drift check (Job 8) lives in CI at [.github/workflows/check-publish-drift.yml](../../.github/workflows/check-publish-drift.yml). On every PR:

1. Checkout the branch
2. Install Node + npm
3. `cd tools/mcp-server && npm install` (so the validator shim's deps are available — unused by Job 8 itself but ensures the pipeline can run end-to-end)
4. Run `pwsh -File tools/sync/Publish-Agents.ps1 -CheckDrift`

If any generated file has been hand-edited, modified outside the pipeline, or is missing relative to the manifest, CI fails with a clear list of drifted paths.

## Encoding rules for generated content

Generated files are written via `[System.IO.File]::WriteAllText` with `new UTF8Encoding($false)` (no BOM). All line endings normalised to `\n`. This avoids two specific failure modes encountered during Phase 3 development:

1. **PowerShell 5.1 `Set-Content -Encoding UTF8` adds a BOM** that `JSON.parse` rejects.
2. **CRLF line endings** flip the SHA-256 hash on Windows vs Linux, causing false-positive drift in CI.

## What this pipeline does NOT do

- It does not author command bodies. That's the agent author's job (in `agents/{a}/.claude/commands/*.md`).
- It does not run agent commands. That's Claude/GHCP at the user's keyboard.
- It does not push to ALM. That's the `alm` agent (Phase 8).
- It does not validate spec / plan / TDD content. That's `doc_lint` in the MCP server (Phase 2 ✓).

## Source

- ADR: [ADR-0002 (4 surfaces)](../../design/adr/0002-dual-mode-delivery-surfaces.md), [ADR-0003 (single source)](../../design/adr/0003-single-source-of-truth-commands.md), [ADR-0004 (self-contained agents + plugin)](../../design/adr/0004-self-contained-agent-folders.md), [ADR-0011 (8-job model)](../../design/adr/0011-publish-pipeline-8-job-model.md)
- Design: [design/12-publish-pipeline.md](../../design/12-publish-pipeline.md), [design/01-repo-structure.md](../../design/01-repo-structure.md), [design/02-agent-skeleton.md](../../design/02-agent-skeleton.md)
- Backlog: bk-021 (settings + plugin templates) — closed by this Phase
