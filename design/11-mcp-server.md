---
title: MCP Server — single server, modular tool groups
status: live
adr-refs: [ADR-0004, ADR-0007, ADR-0008, ADR-0010]
last-reviewed: 2026-05-14
owner: design
---

# MCP Server

> One MCP server (`tools/mcp-server/`) exposes all platform tools, organised into modular tool groups. Agents reference it via their settings.json — relative path for standalone mode (best-effort, [ADR-0004](adr/0004-self-contained-agent-folders.md)), or plugin-managed for portable distribution.

## Layout

```
tools/mcp-server/
├── src/
│   ├── index.ts                      # MCP server entry; registers tool groups
│   ├── groups/
│   │   ├── doc_lint/                 # Universal doc-rule enforcement
│   │   ├── workflow/                 # workflow_next, workflow_status
│   │   ├── handoff/                  # handoff_list, handoff_status, handoff_publish, handoff_list_blueprints
│   │   ├── config_resolve/           # Layered config resolution (project override → agent default)
│   │   ├── alm/                      # alm_* tool group (tool-neutral; dispatches ADO / JIRA)
│   │   ├── converters/               # Bidirectional markdown ↔ ALM rich-text
│   │   ├── brownfield_validators/    # 10 deterministic validators + retry-loop + gap-log writer
│   │   ├── brownfield-engine/        # binding-loader, pattern-renderer, module-detector, extractor, cross-ref, coverage-tracker, pipeline, synthesis-runner
│   │   └── traceability/             # work-items.yaml CRUD + section-ref resolution
│   ├── schemas/                      # JSON schema validators (imports from repo schemas/)
│   └── transports/                   # stdio + http(s) bindings
├── brownfield_validators/
│   └── test-corpus/                  # Anonymised D365 solution for CI
├── package.json
├── tsconfig.json
└── README.md
```

## Tool groups

### `doc_lint`

Per [ADR-0010](adr/0010-templates-agent-owned.md) and [07-doc-rules.md](07-doc-rules.md):

| Tool | Purpose |
|---|---|
| `doc_lint_check(doc, type)` | Validates a doc against universal rules (rules 1-8) and doc-type-specific rules. Returns array of violations with severity (BLOCKER / WARNING). |
| `doc_lint_feature_id_check(domain_doc, feature_id)` | For domain-scoped docs (rules 9 + 10), checks that every section block and table row carries the `feature-id` marker. |
| `doc_lint_coverage_report(test_plan_folder)` | For `/test-plan` outputs, generates `coverage-report.md` by cross-referencing TC → FR mappings. |

### `workflow`

| Tool | Purpose |
|---|---|
| `workflow_status(project, agent, feature)` | Reads `.workflow.json`; returns current phase, gates, dependencies, history. |
| `workflow_next(project)` | Reads every `.workflow.json` across the project; returns ranked list of eligible commands per agent. |
| `workflow_transition(project, agent, feature, command)` | Validates that the command is eligible given current state; writes the new state if transition succeeds. |

### `handoff`

| Tool | Purpose |
|---|---|
| `handoff_publish(project, manifest)` | Writes a handoff manifest to `_handoffs/`. |
| `handoff_list(project)` | Lists open handoffs for the project. |
| `handoff_status(project, agent, feature, artifact)` | Reads the target agent's `.workflow.json`; returns READY / PENDING / IN_PROGRESS. |
| `handoff_list_blueprints(project)` | Returns paths to every agent's `blueprint.md` (domain or feature-scoped, per docScope). Used by aggregator commands. |

### `config_resolve`

| Tool | Purpose |
|---|---|
| `config_resolve(project, agent)` | Resolves the effective config for an agent in a project: agent default → project override (file-level, no merging). Returns merged map + hash for cache invalidation. |

### `alm` *(tool-neutral; dispatches to ADO or JIRA per `project.config.yaml alm.tool`)*

| Tool | Purpose |
|---|---|
| `alm_create_work_item({type, fields, parent})` | Creates a work item |
| `alm_bulk_create_work_items({items})` | Bulk creation |
| `alm_get_work_item({id, expand-children?})` | Reads |
| `alm_update_work_item({id, fields})` | Updates |
| `alm_delete_work_item({id})` | Deletes |
| `alm_query({wiql_or_jql})` | Tool-neutral query (canonical syntax abstracted) |
| `alm_create_test_plan({...})` | Creates a test plan |
| `alm_create_test_suite({...})` | Creates a suite |
| `alm_create_test_case({...})` | Creates a TC |
| `alm_add_steps({tc_id, steps})` | Adds steps to a TC |

### `converters/` (md ↔ ALM rich-text)

Per [agents/alm.md](agents/alm.md):

| Tool | Purpose |
|---|---|
| `alm_convert_md_to_alm({md, target: ado\|jira-cloud\|jira-server, field})` | Markdown → ADO HTML / JIRA ADF / JIRA wiki |
| `alm_convert_alm_to_md({content, source})` | ALM → clean markdown |
| `alm_upload_attachment({path, target})` | File attachment |
| `alm_render_mermaid({mermaid_src})` | Mermaid → PNG + preserves source as code block (lossless round-trip) |
| `alm_roundtrip_check({md_before, ado_after})` | Verifies round-trip fidelity |

### `brownfield_validators` (per [ADR-0007](adr/0007-brownfield-auto-mode-self-healing.md))

10 deterministic validators. See [agents/brownfield.md](agents/brownfield.md) for the full list. Each is a function with input (a doc + scope) and output (array of violations).

| Tool | Purpose |
|---|---|
| `brownfield_validate(doc, scope, binding)` | Runs all validators applicable to the binding; returns violations |
| `brownfield_gap_log_append(project, entry)` | Appends a typed gap entry to `gap-log.json` |
| `brownfield_coverage_tracker_record(project, artifact, status)` | Records `documented` / `gap-logged` / `module-skipped` |

### `brownfield-engine` (per [ADR-0008](adr/0008-brownfield-patterns-and-bindings.md))

| Tool | Purpose |
|---|---|
| `brownfield_binding_load(platform, artifact_type)` | Loads binding YAML |
| `brownfield_pattern_render(pattern, data, cross_refs)` | Renders a pattern with extracted data |
| `brownfield_module_detect(inventory)` | Applies `module-detection.yaml` |
| `brownfield_extract(source_paths, extractors, instance)` | Runs XPath/JSONPath/regex/zip-walker extractors |
| `brownfield_cross_ref(crossRefs, instance, inventory)` | Computes cross-reference tables |
| `brownfield_pipeline_run(project, options)` | Orchestrates the full generation loop |
| `brownfield_synthesis_run(project)` | Runs the 5 synthesis templates after per-artifact pass |
| `brownfield_coverage_report_write(project)` | Emits `coverage-report.md` |

### `traceability`

| Tool | Purpose |
|---|---|
| `traceability_read(project, agent?, feature?)` | Reads `work-items.yaml` partition |
| `traceability_write_alm_ids(project, agent, feature, ids)` | Writes back ALM IDs after `/alm push` |
| `traceability_section_refs_resolve(spec_md, fr_id)` | Returns all places that reference an FR-NN |

## Schema validation

All MCP tools validate inputs against `schemas/*.v1.json` (mirrored into each agent per [ADR-0004](adr/0004-self-contained-agent-folders.md)):

- `handoff.v1.json`
- `alm-extract.v1.json`
- `work-items.v1.json`
- `workflow-state.v1.json`
- `brownfield-inventory.v1.json`
- `brownfield-gap-log.v1.json`
- `project-config.v1.json`

## Agent settings.json (GENERATED per [ADR-0011](adr/0011-publish-pipeline-8-job-model.md))

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings-1.0",
  "mcpServers": {
    "spec-driven-development": {
      "command": "node",
      "args": ["../../tools/mcp-server/dist/index.js"]
    }
  },
  "hooks": {
    "pre-tool-use": [...]   // hard-gate enforcement; see bk-022
  }
}
```

The relative path `../../tools/mcp-server/dist/index.js` makes standalone mode work when the agent folder is inside the consolidated repo. For portable distribution, plugin install manages its own path.

## CI test coverage

Each tool group has:

- Unit tests for individual tools
- Integration tests against the schemas
- For `doc_lint`: a corpus of valid + invalid docs; CI fails if any new rule lets an invalid doc through (or rejects a valid one)
- For `brownfield_validators`: anonymised D365 solution at `tools/mcp-server/brownfield_validators/test-corpus/`; full pipeline runs on every change

## References

- ADRs: [ADR-0004](adr/0004-self-contained-agent-folders.md), [ADR-0007](adr/0007-brownfield-auto-mode-self-healing.md), [ADR-0008](adr/0008-brownfield-patterns-and-bindings.md), [ADR-0010](adr/0010-templates-agent-owned.md), [ADR-0011](adr/0011-publish-pipeline-8-job-model.md)
- Schemas: `schemas/` at repo root
- Cross-references: [04-workflow-gates.md](04-workflow-gates.md), [07-doc-rules.md](07-doc-rules.md), [08-traceability.md](08-traceability.md), [09-orchestration-patterns.md](09-orchestration-patterns.md), [12-publish-pipeline.md](12-publish-pipeline.md), all `agents/*.md` per-agent docs
- Backlog: `bk-018` (MCP tool group detailed APIs)
