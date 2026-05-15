---
agent: alm
sub-area: alm-mapping
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# ALM Mapping — Local Artefacts to ADO / JIRA Types

> How spec / plan / task / test-case content maps onto ADO and JIRA work-item types. Read by `alm_create_work_item` and consumed by `/alm push` per the configured `alm.tool`.

## L1-L4 hierarchy mapping

### ADO

| Tier | ADO type | Notes |
|---|---|---|
| L1 | Epic | One per feature; title = `[{agent-prefix}] {feature-name}` |
| L2 | Feature | One per sub-platform / pattern category per [d365-ce/.claude/commands/plan.md](../../d365-ce/.claude/commands/plan.md) etc. |
| L3 | User Story | One per spec FR-NN; AC text moves into ADO `Acceptance Criteria` HTML field |
| L4 | Task | One per implementation atom (3-8h); object-id (CE) / object-id-prefix (FO) carried in custom field or tags |

### JIRA

| Tier | JIRA type | Notes |
|---|---|---|
| L1 | Initiative | When project uses Portfolio for JIRA; otherwise Epic |
| L2 | Epic | When L1=Initiative; otherwise rolls down: L2 = Story summary group |
| L3 | Story | Per FR; AC text moves into the Story description as a `## Acceptance Criteria` heading |
| L4 | Sub-task | Linked to parent Story; estimate as Story Points or hours per project policy |

Hierarchy declaration lives in `project.config.yaml alm.hierarchy` so adapter dispatch maps the L1-L4 markers locally to the declared external types.

## Field mapping per platform

### ADO field map

| Local field | ADO field | Type | Notes |
|---|---|---|---|
| `title` | `System.Title` | string | Required |
| `description` | `System.Description` | html | Converted from md via `alm_convert_md_to_alm(target: ado)` |
| `acceptanceCriteria` | `Microsoft.VSTS.Common.AcceptanceCriteria` | html | L3 only |
| `state` | `System.State` | enum | Defaulted from `project.config.yaml alm.defaults.state` |
| `priority` | `Microsoft.VSTS.Common.Priority` | int | Mapped per `alm.priorityMap` |
| `severity` | `Microsoft.VSTS.Common.Severity` | enum | Defaulted from `alm.defaults.severity` |
| `iterationPath` | `System.IterationPath` | tree | Defaulted from `alm.defaults.iterationPath` |
| `areaPath` | `System.AreaPath` | tree | Defaulted from `alm.options.ado.areaPath` |
| `tags` | `System.Tags` | semicolon-list | Object-id prefix + feature-id + agent-name tags |
| `estimate` | `Microsoft.VSTS.Scheduling.OriginalEstimate` | decimal | Hours (L4) |
| `assignedTo` | `System.AssignedTo` | identity | Optional |
| `parent` | `System.LinkTypes.Hierarchy-Reverse` | link | Hierarchy parent |

Custom fields (per-project; declared in `traceability.yaml`):
- `Custom.LocalUID` — the local stable id (e.g., `ce-case-management-L4-12`) for diff-detection in `/alm status`
- `Custom.SpecFR` — spec FR-NN reference (L3)
- `Custom.ObjectIdPrefix` — F&O object-id (e.g., `EXT-12`)

### JIRA field map

| Local field | JIRA field | Notes |
|---|---|---|
| `title` | `summary` | Required; max 255 chars |
| `description` | `description` | ADF (Cloud) or wiki markup (Server); converted via `alm_convert_md_to_alm(target: jira-cloud | jira-server)` |
| `acceptanceCriteria` | `customfield_acceptance_criteria` | Project-specific custom field id; declared in `project.config.yaml alm.options.jira.fields.acceptanceCriteria` |
| `state` | `status` | Via JIRA transition (status changes are workflow-driven, not direct sets) |
| `priority` | `priority.name` | "Highest" / "High" / "Medium" / "Low" / "Lowest" mapping via `alm.priorityMap` |
| `iterationPath` (= sprint) | `customfield_sprint` | Project-specific |
| `tags` | `labels` | Object-id prefix + feature-id + agent-name |
| `estimate` | `timetracking.originalEstimate` | "8h" / "1d" string format |
| `assignedTo` | `assignee.accountId` | Cloud uses accountId; Server uses key |
| `parent` | `customfield_epic_link` (Server) / `parent.key` (Cloud) | |
| `localUID` | `customfield_local_uid` | Custom field; declared per project |
| `specFR` | `customfield_spec_fr` | Custom field |
| `objectIdPrefix` | `customfield_object_id` | Custom field |

JIRA flavour (`cloud` vs `server`) declared in `project.config.yaml alm.options.jira.flavour`. Cloud uses ADF; Server uses Confluence-style wiki markup. The `alm_convert_md_to_alm` tool dispatches based on the configured flavour.

## Test case mapping

### ADO

| Local | ADO |
|---|---|
| Test plan (one per project) | `Test Plan` work item |
| Test suite (one per feature) | `Static Test Suite` or `Requirement-based Suite` (when linked to a User Story) |
| Test case | `Test Case` work item |
| Test steps | `Microsoft.VSTS.TCM.Steps` XML field (special format) |

Steps XML format example:
```xml
<steps id="0" last="1">
  <step id="1" type="ValidateStep">
    <parameterizedString isformatted="true">&lt;P&gt;Open the customer form&lt;/P&gt;</parameterizedString>
    <parameterizedString isformatted="true">&lt;P&gt;Form opens displaying empty fields&lt;/P&gt;</parameterizedString>
    <description/>
  </step>
</steps>
```

Handled by `alm_add_steps` and the converter (per [`02-alm-conventions.md § Steps XML`](02-alm-conventions.md)).

### JIRA

JIRA does not have a native test-case construct. Three options:

1. **Xray** add-on: `Test` issue type, manage-test-steps custom field
2. **Zephyr** add-on: similar pattern with different field names
3. **Plain issues**: every TC becomes a separate JIRA Story / Task with steps in the description

Project declares which is used via `project.config.yaml alm.options.jira.test-tool: xray | zephyr | plain`. In v1, `plain` is supported; Xray / Zephyr are deferred ([backlog item](../../../design/backlog.md) — comes via `bk-018` extensions).

## Wiki publishing

### ADO

`project.config.yaml alm.options.ado.wiki.repo: <wiki-name>` — when set, `/alm push wiki` publishes per-feature Wiki pages under `{wiki-repo}/{agent}/{feature}/index.md`.

Each domain agent's `fdd.md` / `tdd.md` / `blueprint.md` are published verbatim (after md→ADO-wiki conversion). Mermaid is preserved as code block + auto-rendered by ADO Wiki.

### JIRA

JIRA Confluence integration when `alm.options.jira.confluence.spaceKey` set. Same pattern: per-feature Confluence pages.

Wiki publishing is OFF-by-default in v1; turned on per project.

## Pipeline triggers

ADO Pipelines: trigger a build via `Microsoft.VSTS.Pipelines` API after a successful `/alm push` (when `alm.options.ado.pipelines.triggerOnPush: <pipeline-id>` set).

JIRA does not natively trigger external pipelines; via `alm.options.jira.webhook.triggerOnPush: <webhook-url>` send a JIRA webhook event.

Pipeline triggers are OFF-by-default in v1.

## See also

- [02-alm-conventions.md](02-alm-conventions.md) (defaults + conflict resolution)
- [design/08-traceability.md](../../../design/08-traceability.md) (`work-items.yaml` + `traceability.yaml` shape)
- [design/11-mcp-server.md § alm + converters](../../../design/11-mcp-server.md)
