---
agent: alm
sub-area: alm-conventions
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# ALM Conventions — Defaults, Conflict Resolution, Naming

## Title conventions

### Per tier

- **L1 Epic** title: `[{agent-prefix}] {feature-name}`
  - Examples: `[CE] Case Management`, `[FO] GL Posting Acceleration`, `[INT] Customer Sync to Service Bus`
- **L2 Feature** title: `[{agent-prefix}] {feature-name} — {capability}`
  - Examples: `[CE] Case Management — model-driven`, `[INT] Customer Sync — event-driven`
- **L3 User Story** title: `[{agent-prefix}-{feature}-FR-NN] {short title}`
  - Examples: `[CE-case-management-FR-01] Create case from email channel`
- **L4 Task** title (CE / Reporting / Integration): `[{resource-kind}] {resource-name} — {action}`
  - Examples: `[plugin] CreateCaseFromEmail — implement Execute method`, `[fn] customer-create — implement POST handler`
- **L4 Task** title (F&O): `[{object-id}] {object-name} — {action}`
  - Examples: `[EXT-12] SalesPostingHandler — CoC method run`, `[DEN-04] CustomerDataEntity — add field`

Mandatory prefix gives at-a-glance grouping in any ALM board view.

## Tag conventions

Every L1-L4 carries these tags / labels:

- `agent:{agent-name}` — e.g., `agent:d365-ce`
- `feature:{feature-slug}` — e.g., `feature:case-management`
- `tier:L1` / `tier:L2` / `tier:L3` / `tier:L4`
- `local-uid:{local-stable-id}` — e.g., `local-uid:ce-case-management-L4-12`
- Object-id (F&O): `object-id:EXT-12`

Tags drive ALM filtering: e.g., `agent:d365-ce AND tier:L4 AND feature:case-management` → all L4 tasks for one feature.

## Priority mapping

Default `alm.priorityMap` per `project.config.yaml`:

```yaml
priorityMap:
  critical: 1
  high:     2
  medium:   3
  low:      4
```

Local spec uses string priorities (`critical / high / medium / low`); ALM gets the int. JIRA reverses the integer-to-name map: 1→Highest, 2→High, 3→Medium, 4→Low.

## State mapping

### ADO state machine

| Local state | ADO state |
|---|---|
| draft | New |
| ready | Active |
| in-progress | Active (with `Assigned To` set) |
| done | Resolved (when QA-pending) → Closed (after acceptance) |
| reverted | Removed |

### JIRA workflow

Project-specific; declared as a `state-map: { ... }` in `project.config.yaml alm.options.jira.state-map`. JIRA changes state via *transitions* (the transition id, not the target state name) — adapter resolves transition automatically when target name + source name match the workflow.

## Conflict resolution

### Hash-based change detection

Each ALM work item that originated locally carries a custom field `Custom.LocalUID` storing the local stable id. Each push records in local `traceability.yaml`:

```yaml
- localUID: ce-case-management-L4-12
  almId: 47892
  lastPushedAt: "2026-05-14T10:30:00Z"
  pushedHash: "a3f5d8...."   # sha256 of local content at push time
  pulledHash: "a3f5d8...."   # sha256 of ALM content immediately after push (round-trip)
```

Before `/alm push --strategy fail-on-conflict`:
1. Fetch current ALM state for `almId`
2. Compute hash of fetched state
3. Compare against `pulledHash` recorded at last push
4. If `currentAlmHash != pulledHash`, ALM has been edited externally → abort, surface diff in push-report

`--strategy merge` (default) merges: local-changed fields overwrite ALM; ALM-changed fields not declared locally are preserved. ALM-changed fields declared locally (but with same value as last push) stay ALM's value (the user clearly intended a remote change).

`--strategy overwrite` replaces ALM state entirely with local; unspecified fields cleared.

## ADO Steps XML — the trickiest converter

ADO Test Case steps live in `Microsoft.VSTS.TCM.Steps` XML field. Each step has an action and expected result, both HTML-formatted with `<P>` tags. The converter:

1. Read local `test-plan/{suite}.suite.md` per [test-plan-suite template](../../d365-ce/templates/test-plan/suite.template.md)
2. For each test case, find its step list (numbered markdown list under `Steps:` heading)
3. For each step, split into action + expected result on the `→` marker (or use `**Expected:**` heading)
4. Wrap both in `<P>...</P>` HTML escape
5. Emit the XML using the `<steps id="0" last="N">` structure
6. Validate XML against ADO's schema (rejected at API level otherwise)

Stored procedure: `alm_add_steps({tc_id, steps: [...]})` performs the conversion.

## Mermaid handling — lossless round-trip

Per [design/agents/alm.md § Mermaid](../../../design/agents/alm.md):

1. Find each ```` ```mermaid ```` block in source markdown
2. Render to PNG via `alm_render_mermaid({mermaid_src})`
3. Upload PNG as attachment via `alm_upload_attachment({path, target})`
4. In the converted ALM body, emit:
   ```html
   <img src="{attachment-url}" alt="rendered mermaid"/>
   <pre><code class="mermaid">{original-mermaid-source}</code></pre>
   ```
5. On `/alm pull`, the converter inverts: discard the `<img>`, recover the source from `<pre><code class="mermaid">...`

The `<pre><code class="mermaid">` block is the round-trip anchor — drops the rendered image but preserves the source.

## Frontmatter & TOC handling

- **Strip on push**: agent YAML frontmatter is metadata for the spec authoring system, not relevant to ALM. Strip the `---...---` block.
- **Strip TOC**: auto-generated TOC blocks (`<!-- TOC -->...<!-- /TOC -->`) are tooling artefacts; strip on push.
- **Regenerate on pull**: when pulling back into the local artefact, prepend the agent's expected frontmatter and let `doc_lint` regenerate the TOC.

The `alm_roundtrip_check` tool validates: strip frontmatter + TOC, push, pull, re-strip and compare; surfaces any non-round-trippable content with a warning.

## Attachment policy

- **Images** referenced from spec / plan are uploaded as ALM attachments; markdown `![alt](path.png)` becomes `<img src="{alm-attachment-url}" alt="alt"/>` in ALM body.
- **Code files** referenced from `output/` are uploaded only on `/alm push --include-output`; default-off (output is in source control, not ALM).
- **PDFs / Word / Excel** referenced in test cases (test data files) are always uploaded.

## Idempotency

- `/alm push` is idempotent on no-change local: zero ALM writes, push-report shows `0 created, 0 updated`.
- `/alm pull` is idempotent on no-change ALM: zero local writes.
- `/alm export` is idempotent on no-change local + no-change format: identical output file.

## Pagination + bulk

- `alm_query` enforces server-side paging; results streamed. Local rebuilding always full-fetches affected work-item tree.
- `alm_bulk_create_work_items` batches up to 200 work items per API call (ADO limit); auto-splits larger batches.

## Audit + reporting

Every `/alm <command>` invocation writes a report under:
- `projects/{p}/alm-reports/{command}-{ts}.md`

Reports rotate at 30-day expiry by default; configurable via `project.config.yaml alm.report-retention-days`.

## Error envelopes

ALM API errors surface in reports with:
- Original local artefact reference
- ALM API call attempted
- ALM error message + correlation id
- Suggested resolution (when standard error pattern recognised — e.g., "missing required field X")

## See also

- [01-alm-mapping.md](01-alm-mapping.md) (per-platform field maps)
- [design/08-traceability.md](../../../design/08-traceability.md)
