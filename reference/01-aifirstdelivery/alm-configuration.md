# ALM Configuration

Single source of truth for Azure DevOps connection and work item settings across the entire project.
Configure this file once. All domain agents and the ALM agent read it automatically.

> **PAT is never stored here.** Set `ADO_PAT` in `tools/alm-agent/.claude/settings.json`
> under `mcpServers.ado-alm.env`. Domain agents use `${ADO_PAT}` from `.mcp.json` at the root.

---

## Azure DevOps Connection

```
ado-org-url:    https://dev.azure.com/opexcorp
ado-project:    IS - D365 Avanade Team
api-version:    7.1
```

## Work Item Defaults

```
area-path:       IS - D365 Avanade\IS - D365 Avanade Team
iteration-path:  IS - D365 Avanade\Discovery
```

## ALM Tool

```
alm-tool:         Azure DevOps    # Options: Azure DevOps | Jira | Linear | Custom
process-template: Scrum  with sub template Avanade Delivery v3.0     # Options: Scrum | Agile | CMMI
```

## Work Item Type Names

```
type-epic:      Epic
type-feature:   Feature
type-story:     Product Backlog Item
type-task:      Task
```

## Standard Work Item Hierarchy (4-level)

Used by d365-ce, integration, power-apps, data-migration, and reporting.
D365 F&O uses a 2-level override — defined in its own constitution file.

| Level | Agent concept | ALM Type | ID Prefix |
|---|---|---|---|
| 1 — Business Capability | Feature | Epic | EP |
| 2 — Functional Grouping | Epic | Feature | FT |
| 3 — Requirement Unit | User Story | Product Backlog Item | PBI |
| 4 — Implementation Item | Task | Task | T |

**Azure DevOps Scrum / Agile:** Epic → Feature → Product Backlog Item → Task
**Jira Software:** Epic → Story → Subtask *(use 3 levels; remove Level 2)*
**Linear:** Cycle → Issue → Sub-issue *(adjust type names accordingly)*

## Field Mapping

### Azure DevOps

| Attribute | ADO field name |
|---|---|
| `title` | `System.Title` |
| `description` | `System.Description` |
| `acceptance-criteria` | `Microsoft.VSTS.Common.AcceptanceCriteria` |
| `priority` | `Microsoft.VSTS.Common.Priority` |
| `story-points` | `Microsoft.VSTS.Scheduling.StoryPoints` |
| `status` | `System.State` |
| `parent` | `System.Parent` |
| `component-type` | `Custom.ComponentType` *(optional — create custom field or omit)* |
| `complexity` | `Custom.Complexity` *(optional — create custom field or omit)* |
| `fr-refs` | `Custom.FunctionalRequirements` *(optional — create custom field or omit)* |

### Jira (if applicable)

| Attribute | Jira field name |
|---|---|
| `title` | `summary` |
| `description` | `description` |
| `acceptance-criteria` | `customfield_10016` *(adjust to your Jira instance)* |
| `priority` | `priority.name` |
| `story-points` | `story_points` |
| `status` | `status.name` |
| `parent` | `parent.key` |

## Priority Mapping

| Agent priority | Azure DevOps | Jira |
|---|---|---|
| `High` | `1` | `High` |
| `Medium` | `2` | `Medium` |
| `Low` | `3` | `Low` |

## Status Mapping

| Agent status | Azure DevOps (Scrum) | Azure DevOps (Agile) | Jira |
|---|---|---|---|
| `TODO` | `New` | `New` | `To Do` |
| `IN PROGRESS` | `Active` | `Active` | `In Progress` |
| `DONE` | `Done` | `Closed` | `Done` |
| `BLOCKED` | `Blocked` | `Resolved` | `Blocked` |
| `NOT VALIDATED` | `New` | `New` | `To Do` |
