# alm

> Workflow-level ALM operations over Azure DevOps and JIRA. Six action-first commands (push / pull / export / import / status / cleanup) operating on the artefact-as-argument shape. Bidirectional markdown ↔ ALM rich-text via the MCP `converters/` module. No `docScope`, no base 17 commands — this is a workflow agent.

## What

The ALM agent owns all interaction with ADO / JIRA: smart-upsert work-items from local `work-items.yaml` to ALM (`/alm push`), pull ALM state into local (with 3 sourcing modes via `--read-only-levels`), export to CSV / XLSX / JSON for offline QA review (`/alm export`), import edited files back (`/alm import` — local only; never writes ALM directly), diff via `/alm status`, and hard-delete via `/alm cleanup --confirm`. Markdown ↔ ALM rich-text round-trip is first-class: ADO HTML, JIRA Cloud ADF, JIRA Server wiki. Mermaid renders to PNG attachment **and** preserves the source as a fenced code block — lossless round-trip.

This agent does NOT produce specs / plans / FDD / TDD / blueprints (those are domain-agent responsibilities); it consumes the `/alm-extract` handoff manifests they emit. It does NOT reverse-engineer existing solutions (that's `brownfield`).

## How

- **Iterative push** — `/alm push work-items --feature case-management` (default strategy = `merge`; idempotent re-run after every local change)
- **Dry-run preview** — `/alm push work-items --feature case-management --dry-run` (runs the push-review checklist inline; emits a planned-changes report; no ALM writes)
- **Three sourcing modes via pull** — `/alm pull work-items --feature case-management --levels L1,L2,L3 --read-only-levels L1,L2,L3` (Option 1: full ALM ownership)
- **Round-trip with QA** — `/alm export tests --feature case-management --format xlsx --to qa.xlsx` → QA edits → `/alm import tests --from qa.xlsx --dry-run` → `/alm import tests --from qa.xlsx` → `/alm push tests --feature case-management`
- **Switch ALM tools** — change `project.config.yaml alm.tool: ado` to `jira`; same commands keep working (adapter swap). Verified by [§23.5 verification step](../../design/15-verification.md).
- **Cleanup a stale item** — `/alm cleanup ce-case-management-L4-99 --confirm` (refuses cascade or shipped-status without explicit flags)

## Details

- **Constitution** *(agent-owned per [ADR-0010](../../design/adr/0010-templates-agent-owned.md))*:
  - [constitution/00-charter.md](constitution/00-charter.md) — purpose, six commands, no docScope, project-config keys, boundaries
  - [constitution/01-alm-mapping.md](constitution/01-alm-mapping.md) — L1-L4 → ADO / JIRA type maps; field maps; test case mapping; ADO Steps XML; wiki + pipeline-trigger options
  - [constitution/02-alm-conventions.md](constitution/02-alm-conventions.md) — title / tag / priority / state conventions; hash-based conflict detection; Mermaid handling; frontmatter & TOC stripping; attachment policy

- **Templates**:
  - [templates/alm-push-report.template.md](templates/alm-push-report.template.md) — push outcome report (created / updated / conflicts / errors)
  - [templates/alm-pull-report.template.md](templates/alm-pull-report.template.md) — pull outcome report (created locally / replaced / conflicts / local-only)
  - [templates/checklists/alm-push-review.checklist.md](templates/checklists/alm-push-review.checklist.md) — push inline self-check (consumed by `/alm push --dry-run` and pre-push validation)
  - [templates/checklists/alm-import-review.checklist.md](templates/checklists/alm-import-review.checklist.md) — import inline self-check (consumed by `/alm import --dry-run`)

- **Commands** (6 — no base 17): [.claude/commands/](.claude/commands/)
  - `/alm push` — smart upsert with merge / overwrite / fail-on-conflict strategies + dry-run + roundtrip-check
  - `/alm pull` — 3 sourcing modes (`--read-only-levels`) covering Option 1/2/3 from the design
  - `/alm export` — CSV / XLSX / JSON for offline review
  - `/alm import` — read CSV / XLSX / JSON into local (never writes ALM directly)
  - `/alm status` — local vs ALM diff
  - `/alm cleanup` — destructive deletion with `--confirm` safety

- **Schemas consumed**:
  - [schemas/work-items.v1.json](../../schemas/work-items.v1.json) — primary canonical local ledger
  - [schemas/handoff.v1.json](../../schemas/handoff.v1.json) — `_handoffs/*-alm.handoff.json` envelope
  - [schemas/alm-extract.v1.json](../../schemas/alm-extract.v1.json) — handoff payload shape from domain agents

- **MCP tool groups consumed** (queued for code authoring — `bk-018` follow-on):
  - `alm/` — `alm_create_work_item`, `alm_bulk_create_work_items`, `alm_get_work_item`, `alm_update_work_item`, `alm_delete_work_item`, `alm_query`, `alm_create_test_plan`, `alm_create_test_suite`, `alm_create_test_case`, `alm_add_steps` (tool-neutral; dispatches to ADO or JIRA adapter)
  - `converters/` — `alm_convert_md_to_alm`, `alm_convert_alm_to_md`, `alm_upload_attachment`, `alm_render_mermaid`, `alm_roundtrip_check`

- **docScope**: none. ALM doesn't produce FDD/TDD/blueprint.

- **Design doc**: [design/agents/alm.md](../../design/agents/alm.md)
- **Related ADRs**: [ADR-0010](../../design/adr/0010-templates-agent-owned.md), [ADR-0011](../../design/adr/0011-publish-pipeline-8-job-model.md)

## What this agent does NOT do

- Does NOT produce spec / plan / FDD / TDD / blueprint outputs — those belong to domain agents
- Does NOT modify ALM from `/alm import`. Import is local-only; run `/alm push` after to publish
- Does NOT cascade delete in v1 — `/alm cleanup` refuses items with descendants until they're cleaned individually (safety pass on cascade is deferred)
- Does NOT call external CI/CD pipelines automatically. `/alm push pipeline-trigger` only fires when `alm.options.ado.pipelines.triggerOnPush` is configured
- Does NOT manage Wiki content unless `alm.options.ado.wiki.repo` (ADO) or `alm.options.jira.confluence.spaceKey` (JIRA) is set

## ALM tool selection

`project.config.yaml alm.tool: ado | jira` selects the adapter. Switching is a single-config change; no agent / command logic differs.

For JIRA: `alm.options.jira.flavour: cloud | server` further selects ADF vs wiki-markup conversion.

For JIRA test cases: `alm.options.jira.test-tool: xray | zephyr | plain` (v1 supports `plain` only; Xray / Zephyr deferred to `bk-018` follow-on).

## Backlog this agent's content unblocks

- **bk-028** (this agent's design doc + commands + templates) — **closed** with this Phase 8 build
- **bk-018** (MCP `alm_*` tool group APIs + `converters/` module): **partial** — the agent's commands declare the contracts they consume; the MCP tool code is queued for follow-on (similar to Phase 7's brownfield-engine queue). Implementation tracks: ADO REST adapter, JIRA REST adapter (Cloud + Server variants), markdown↔ADO-HTML converter, markdown↔JIRA-ADF converter, markdown↔JIRA-wiki converter, Mermaid renderer (puppeteer/cli-based), XLSX / CSV / JSON export / import helpers.
