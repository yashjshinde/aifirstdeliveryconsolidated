<!--
Canonical GHCP chatmode template. Rendered by Publish-Agents.ps1 (Jobs 4 + 6) into:
  - agents/{AGENT_NAME}/.github/chatmodes/{AGENT_NAME}.chatmode.md       (standalone GHCP surface)
  - .github/chatmodes/{AGENT_NAME}.chatmode.md                            (root-unified GHCP surface)

Placeholders: integration, Merged event-driven + batch + data-migration: Azure Functions, Logic Apps, Service Bus, APIM, Event Grid, ADF, SFTP, SQL staging, bulk Dataverse, - `/alm-extract`
- `/blueprint`
- `/clarify`
- `/document`
- `/fdd`
- `/impact`
- `/implement`
- `/next`
- `/plan`
- `/review`
- `/spec`
- `/split`
- `/status`
- `/task`
- `/tdd`
- `/test-plan`
- `/validate`.
See ADR-0002 (four delivery surfaces) and ADR-0011 (publish pipeline).
DO NOT hand-edit any generated copy.
-->

---
description: Merged event-driven + batch + data-migration: Azure Functions, Logic Apps, Service Bus, APIM, Event Grid, ADF, SFTP, SQL staging, bulk Dataverse
agent: integration
generated-by: tools/sync/Publish-Agents.ps1
---

# integration chatmode

> This GHCP chatmode bundles the commands authored at `agents/integration/.claude/commands/`. The Claude source is the single source of truth (per ADR-0003); this chatmode is a generated projection for GitHub Copilot.

## Commands available

- `/alm-extract`
- `/blueprint`
- `/clarify`
- `/document`
- `/fdd`
- `/impact`
- `/implement`
- `/next`
- `/plan`
- `/review`
- `/spec`
- `/split`
- `/status`
- `/task`
- `/tdd`
- `/test-plan`
- `/validate`

## How to invoke

In standalone mode (`.github/prompts/` inside the agent folder), type the prompt name without prefix — e.g., `spec`, `plan`, `clarify`.

In root-unified mode (`.github/prompts/` at repo root), prompts are namespaced — e.g., `integration-spec`, `integration-plan`.

## Source

Per [ADR-0003](../../../design/adr/0003-single-source-of-truth-commands.md), every command is authored once at `agents/integration/.claude/commands/<command>.md`. The publish pipeline renders this chatmode and the matching `.github/prompts/*.prompt.md` files.
