<!--
Canonical GHCP chatmode template. Rendered by Publish-Agents.ps1 (Jobs 4 + 6) into:
  - agents/{AGENT_NAME}/.github/chatmodes/{AGENT_NAME}.chatmode.md       (standalone GHCP surface)
  - .github/chatmodes/{AGENT_NAME}.chatmode.md                            (root-unified GHCP surface)

Placeholders: solution-estimate, Aggregator: 103-factor catalogue, 8-value Fitment, 7 phases (x2.76 total), brownfield multipliers, confidence bands, proposed-factors gate, - `/estimate`.
See ADR-0002 (four delivery surfaces) and ADR-0011 (publish pipeline).
DO NOT hand-edit any generated copy.
-->

---
description: Aggregator: 103-factor catalogue, 8-value Fitment, 7 phases (x2.76 total), brownfield multipliers, confidence bands, proposed-factors gate
agent: solution-estimate
generated-by: tools/sync/Publish-Agents.ps1
---

# solution-estimate chatmode

> This GHCP chatmode bundles the commands authored at `agents/solution-estimate/.claude/commands/`. The Claude source is the single source of truth (per ADR-0003); this chatmode is a generated projection for GitHub Copilot.

## Commands available

- `/estimate`

## How to invoke

In standalone mode (`.github/prompts/` inside the agent folder), type the prompt name without prefix — e.g., `spec`, `plan`, `clarify`.

In root-unified mode (`.github/prompts/` at repo root), prompts are namespaced — e.g., `solution-estimate-spec`, `solution-estimate-plan`.

## Source

Per [ADR-0003](../../../design/adr/0003-single-source-of-truth-commands.md), every command is authored once at `agents/solution-estimate/.claude/commands/<command>.md`. The publish pipeline renders this chatmode and the matching `.github/prompts/*.prompt.md` files.
