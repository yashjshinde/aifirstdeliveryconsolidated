<!--
Canonical GHCP chatmode template. Rendered by Publish-Agents.ps1 (Jobs 4 + 6) into:
  - agents/{AGENT_NAME}/.github/chatmodes/{AGENT_NAME}.chatmode.md       (standalone GHCP surface)
  - .github/chatmodes/{AGENT_NAME}.chatmode.md                            (root-unified GHCP surface)

Placeholders: {{AGENT_NAME}}, {{AGENT_DESCRIPTION}}, {{COMMAND_LIST}}.
See ADR-0002 (four delivery surfaces) and ADR-0011 (publish pipeline).
DO NOT hand-edit any generated copy.
-->

---
description: {{AGENT_DESCRIPTION}}
agent: {{AGENT_NAME}}
generated-by: tools/sync/Publish-Agents.ps1
---

# {{AGENT_NAME}} chatmode

> This GHCP chatmode bundles the commands authored at `agents/{{AGENT_NAME}}/.claude/commands/`. The Claude source is the single source of truth (per ADR-0003); this chatmode is a generated projection for GitHub Copilot.

## Commands available

{{COMMAND_LIST}}

## How to invoke

In standalone mode (`.github/prompts/` inside the agent folder), type the prompt name without prefix — e.g., `spec`, `plan`, `clarify`.

In root-unified mode (`.github/prompts/` at repo root), prompts are namespaced — e.g., `{{AGENT_NAME}}-spec`, `{{AGENT_NAME}}-plan`.

## Source

Per [ADR-0003](../../../design/adr/0003-single-source-of-truth-commands.md), every command is authored once at `agents/{{AGENT_NAME}}/.claude/commands/<command>.md`. The publish pipeline renders this chatmode and the matching `.github/prompts/*.prompt.md` files.
