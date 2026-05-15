# integration

> Merged event-driven + batch + data-migration. Azure Functions, Logic Apps, Service Bus, APIM, Event Grid, ADF, SFTP, SQL staging, bulk Dataverse.

## What

(One paragraph describing the agent's scope: artifact types it owns + boundaries with adjacent agents. Edit before first use.)

## How

- **New feature**: `/spec --feature <slug> --source fresh` -> `/review --approve` -> `/plan` -> `/clarify --approve` -> `/task` -> `/validate --approve` -> `/implement` -> `/document` -> `/alm-extract`

## Details

- Constitution: [constitution/00-charter.md](constitution/00-charter.md), [constitution/01-doc-rules.md](constitution/01-doc-rules.md), and sibling files
- Templates: [templates/](templates/)
- Commands: [.claude/commands/](.claude/commands/)
- Design doc: `design/agents/integration.md` (author when stable)
- Related ADRs: ADR-0001 (review scope), ADR-0006 (docScope: fdd=domain / tdd=domain / blueprint=domain), ADR-0010 (agent-owned constitution + templates)
