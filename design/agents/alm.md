---
title: alm — workflow-level ALM operations over ADO and JIRA
status: live
adr-refs: []
last-reviewed: 2026-05-14
owner: design
---

# alm — ALM agent

> All ALM operations over Azure DevOps and JIRA. Adapters live in MCP (tool-neutral `alm_*` group); this agent owns the **workflows** (parse extract, dry-run, conflict resolution, write-back, file export/import).

## Scope

- Cross-domain work-item synchronisation (push / pull / status)
- Test case management (test plans, suites, cases) round-trip
- Wiki publishing (when used)
- Pipeline triggers (when wired)
- Bidirectional markdown ↔ ALM rich-text conversion (ADO HTML, JIRA Cloud ADF, JIRA Server wiki)
- File export / import for human review (CSV / XLSX / JSON)

## Six commands — action-first, artifact-as-arg

```
/alm push <artifact>     [--create-only|--update-only] [--strategy merge|overwrite|fail-on-conflict] [--dry-run] [--feature <f>] [--suite <slug>]
/alm pull <artifact>     [--overwrite|--fail-on-conflict] [--scope plan|suite|case] [--plan-id <id>] [--dry-run]
/alm export <artifact>   --format csv|xlsx|json --to <path> [--include] [--filter --suite <slug>]
/alm import <artifact>   --from <path> [--format auto|csv|xlsx|json] [--mode upsert|create|update] [--map <mapping.yaml>] [--dry-run]
/alm status [<artifact>] [--feature <f>] [--domain <d>]
/alm cleanup <artifact-id>  --confirm
```

Artifacts: `work-items`, `tests`, `wiki`, `pipeline-trigger`.

### `/alm push` — smart upsert by default

Match by stable ID in `traceability.yaml`; fall back to title search within the parent suite when no ALM ID yet recorded.

| Flag | When you'd use it |
|---|---|
| (default upsert) | Iterative work — re-run after every local change |
| `--create-only` | First-time publication; fail if anything pre-exists |
| `--update-only` | Refreshing existing ALM items; fail if anything new |
| `--strategy merge` (default) | ALM may have fields we don't declare; preserve them |
| `--strategy overwrite` | Replace ALM state — including blanking unspecified fields |
| `--strategy fail-on-conflict` | Abort if ALM was edited since last pull (diff report shown) |
| `--dry-run` | Preview with per-item create/update diff |
| `--suite <slug>` | Incremental — push one suite at a time |
| `--feature <f>` | Required for scoped pushes |

**Conflict detection.** Before each update, pipeline fetches current ALM state and hash-compares. The chosen `--strategy` decides resolution. Hash + last-synced timestamp persist in `traceability.yaml`.

### `/alm export` and `/alm import` — file workflows

Three v1 formats:

- **CSV** — flat, one row per TC; steps in a multi-line cell. Universal, opens in Excel.
- **XLSX** — multi-sheet workbook: `Plan` / `Suites` / `Cases` / `Steps` / `Traceability`. QA-team-friendly.
- **JSON** — programmatic; matches `traceability.yaml` schema; full fidelity for tool-to-tool exchange.

**Out of scope for v1:** ADO test case XML (native ADO bulk-import format), JIRA Xray/Zephyr CSV (deferred to backlog).

**Round-trip flow:**

```
/alm export tests --feature x --format xlsx --to qa-review.xlsx    # send to QA
# QA edits and returns the file
/alm import tests --feature x --from qa-review.xlsx --dry-run      # preview merge
/alm import tests --feature x --from qa-review.xlsx                # update local
/alm push tests --feature x                                        # publish to ALM (smart upsert)
```

Import never writes to ALM directly; local files stay the source of truth until `/alm push`.

### `/alm status` — diff view

```
Test plan: Case Management
  Local: 14 suites, 187 test cases
  ALM:   14 suites, 185 test cases
  Diff:  2 cases local-only (need push)
         0 cases ALM-only
         3 cases differ (last pushed 2026-05-10; local edited)
```

## ALM hierarchy — declared in `project.config.yaml`, not hardcoded

```yaml
alm:
  tool: ado                    # or jira
  hierarchy: [Epic, Feature, "User Story", Task]      # ADO
  # hierarchy: [Initiative, Epic, Story, "Sub-task"]   # JIRA
  priorityMap: { critical: 1, high: 2, medium: 3, low: 4 }
  options:
    ado: { org: "...", project: "...", areaPath: "...", iterationPath: "..." }
    jira: { baseUrl: "...", projectKey: "..." }
```

A single command `/alm pull work-items --feature <f> --levels L1,L2,L3` covers three modes:

- **Option 1 (L1+L2+L3 from ALM):** `--levels L1,L2,L3 --read-only-levels L1,L2,L3` — locks them
- **Option 2 (L1+L2 from ALM, L3 optional):** `--levels L1,L2,L3 --read-only-levels L1,L2`
- **Option 3 (L2 + optional L3):** `--levels L2,L3 --read-only-levels L2`

`read-only-levels` are validated against during `/plan` — agents cannot create or modify items at those levels.

## MCP `alm_*` tool group

Tool-neutral (dispatches to ADO or JIRA adapter based on `project.config.yaml`):

- `alm_create_work_item({type, fields, parent})`
- `alm_bulk_create_work_items({items})`
- `alm_get_work_item({id, expand-children?})`
- `alm_update_work_item({id, fields})`
- `alm_delete_work_item({id})`
- `alm_query({wiql_or_jql})`         — canonical query language abstracted
- `alm_create_test_plan({...})`, `alm_create_test_suite({...})`, `alm_create_test_case({...})`, `alm_add_steps({...})`

## MCP `converters/` module (5 tools)

Bidirectional markdown ↔ ALM rich-text, **first-class**:

- `alm_convert_md_to_alm({md, target: ado|jira-cloud|jira-server, field})` — produces ADO HTML / JIRA ADF / JIRA wiki per field type
- `alm_convert_alm_to_md({content, source})` — reverse, into clean markdown
- `alm_upload_attachment({path, target})` — attaches files
- `alm_render_mermaid({mermaid_src})` — renders Mermaid to PNG; embeds image in ALM + preserves source as code block (lossless round-trip)
- `alm_roundtrip_check({md_before, ado_after})` — verifies content round-trippable; warns if not

**Mermaid default = render-and-attach.** Image embedded in ALM + source preserved as code block below → lossless round-trip.

**Frontmatter & TOC** stripped on push, regenerated on pull.

**Round-trip fidelity** tested both ways: in-memory test corpus on every CI run + occasional sandbox test against real ADO/JIRA.

`/alm push --roundtrip-check` flag warns before push if content isn't round-trippable.

ADO test case "Steps" XML schema and JIRA Xray/Zephyr step schemas handled as separate converter paths.

## Constitution

```
agents/alm/constitution/
├── 00-charter.md
├── 01-alm-mapping.md                  # how local artefacts map to ALM types per platform
└── 02-alm-conventions.md              # field defaults, priority maps, naming
```

## Templates

```
agents/alm/templates/
├── alm-push-report.template.md         # /alm push output (diff + applied changes)
├── alm-pull-report.template.md         # /alm pull output (incoming changes summary)
└── checklists/
    ├── alm-push-review.checklist.md    # consumed inline by /alm push --dry-run
    └── alm-import-review.checklist.md  # consumed inline by /alm import --dry-run
```

ALM doesn't have spec/plan/FDD/TDD outputs — it's a workflow agent. The base 17 commands don't apply; only the 6 ALM-specific commands above.

## docScope

No `docScope` — ALM doesn't produce FDD/TDD/blueprint docs. Operations happen against project-level `work-items.yaml` and per-feature `traceability.yaml`.

## How agents call ALM

Domain agents emit handoffs to `_handoffs/{feature}-alm.handoff.json` via `/alm-extract`. ALM agent reads handoffs, processes them, and updates `work-items.yaml` + ALM. See [09-orchestration-patterns.md](../09-orchestration-patterns.md) Pattern 2 + Pattern 3.

## References

- Cross-references: [11-mcp-server.md](../11-mcp-server.md) (`alm_*` group + `converters/`), [08-traceability.md](../08-traceability.md) (`work-items.yaml`, `traceability.yaml`)
- Backlog: `bk-028` (alm agent design — this doc), `bk-018` (MCP tool group APIs)
