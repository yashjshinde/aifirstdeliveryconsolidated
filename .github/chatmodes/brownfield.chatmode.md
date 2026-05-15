<!--
Canonical GHCP chatmode template. Rendered by Publish-Agents.ps1 (Jobs 4 + 6) into:
  - agents/{AGENT_NAME}/.github/chatmodes/{AGENT_NAME}.chatmode.md       (standalone GHCP surface)
  - .github/chatmodes/{AGENT_NAME}.chatmode.md                            (root-unified GHCP surface)

Placeholders: brownfield, Standalone reverse-engineering agent: auto-mode self-healing loop, 9 patterns + ~185 bindings, ~140+ artifact taxonomy coverage, - `brownfield-blueprint`
- `brownfield-document`
- `brownfield-fdd`
- `brownfield-generate`
- `brownfield-handoff`
- `brownfield-index`
- `brownfield-prepare`
- `brownfield-scan`
- `brownfield-tdd`.
See ADR-0002 (four delivery surfaces) and ADR-0011 (publish pipeline).
DO NOT hand-edit any generated copy.
-->

---
description: Standalone reverse-engineering agent: auto-mode self-healing loop, 9 patterns + ~185 bindings, ~140+ artifact taxonomy coverage
agent: brownfield
generated-by: tools/sync/Publish-Agents.ps1
---

# brownfield chatmode

> This GHCP chatmode bundles the commands authored at `agents/brownfield/.claude/commands/`. The Claude source is the single source of truth (per ADR-0003); this chatmode is a generated projection for GitHub Copilot.

## Commands available

- `brownfield-blueprint`
- `brownfield-document`
- `brownfield-fdd`
- `brownfield-generate`
- `brownfield-handoff`
- `brownfield-index`
- `brownfield-prepare`
- `brownfield-scan`
- `brownfield-tdd`

## How to invoke

In standalone mode (`.github/prompts/` inside the agent folder), type the prompt name without prefix — e.g., `spec`, `plan`, `clarify`.

In root-unified mode (`.github/prompts/` at repo root), prompts are namespaced — e.g., `brownfield-spec`, `brownfield-plan`.

## Source

Per [ADR-0003](../../../design/adr/0003-single-source-of-truth-commands.md), every command is authored once at `agents/brownfield/.claude/commands/<command>.md`. The publish pipeline renders this chatmode and the matching `.github/prompts/*.prompt.md` files.
