---
title: Verification Plan — E2E checks
status: live
adr-refs: []
last-reviewed: 2026-05-14
owner: design
---

# Verification Plan

> End-to-end checks executed once implementation begins. Each check exercises one or more pieces of the platform; together they validate that the design works as specified. The checks are designed to run **incrementally** — early phases produce checks 1–3, later phases produce 4–11.

## 11 verification checks

### V1 — Scaffold a project end-to-end (Phase 3)

```powershell
.\tools\scaffold\New-Project.ps1 -Name "test-d365" -Agents d365-ce,integration,alm
```

Confirm:

- `projects/test-d365/project.config.yaml` created with sensible defaults
- `projects/test-d365/work-items.yaml` created with empty agent partitions
- `projects/test-d365/_handoffs/` directory created
- `projects/test-d365/d365-ce/`, `integration/`, `alm/` subfolders created with the correct `docScope` shape (CE+Int domain; ALM no docScope)

### V2 — Generate spec → review → plan in CE agent (Phases 5/6)

```
/spec --feature case-management --source fresh
```

Confirm `spec.md` with frontmatter, TOC, AI Summary, traceability matrix.

```
/review
```

Confirm `reviews/spec-review.md`. Run again with `--approve` and confirm `.workflow.json` shows `SPEC_APPROVED`.

Try `/plan` without `/review --approve`: confirm hard-gate refusal with a clear error message.

Run `/plan` after approval → confirm L1–L4 work breakdown referencing `project.config.yaml alm.hierarchy` terms.

### V3 — Cross-agent handoff (Phase 6)

In CE: draft a spec with integration components.

```
/split
```

Confirm:

- `projects/test-d365/_handoffs/case-management-integration.handoff.json` created (validates against `handoff.v1.json`)
- Skeleton spec at `projects/test-d365/integration/features/case-management/spec.md`
- `.workflow.json` initialised in the new feature with `phase: DEFINE`, `currentStates: [SPEC_DRAFT]`, `parent-handoff` reference

```
/next
```

Confirm output suggests integration agent's `/spec` as an eligible command.

### V4 — ALM round-trip ADO (Phase 8)

In CE:

```
/alm-extract case-management
```

Confirm extract JSON validates against `alm-extract.v1.json`.

In ALM agent:

```
/alm push work-items --feature case-management --dry-run
```

Confirm preview output shows planned creates/updates.

```
/alm push work-items --feature case-management
```

Confirm:

- IDs written into `work-items.yaml` under the correct agent + feature partition
- Markdown stays clean (no inline ALM IDs — `doc_lint` rule 7)
- ADO contains the expected work items at each level

### V5 — JIRA switch via config (Phase 8)

Change `project.config.yaml`:

```yaml
alm:
  tool: jira
  hierarchy: [Initiative, Epic, Story, "Sub-task"]
  options:
    jira: { baseUrl: "...", projectKey: "..." }
```

Re-run `/alm push work-items --feature case-management` → confirm:

- JIRA adapter used (no code change required)
- Work items created in JIRA with the configured hierarchy
- `alm-type` values in `work-items.yaml` updated to match JIRA terms

### V6 — Brownfield flow (Phase 7)

Place a small anonymised legacy D365 solution in `projects/test-bf/_brownfield/input/raw/`.

```
/prepare      # validate inputs
/scan         # build inventory.json
```

Confirm `inventory.json` validates against `brownfield-inventory.v1.json`.

```
/generate
```

Confirm:

- Per-artifact docs render under `_brownfield/docs-generated/` per their bindings
- Module-detection runs (e.g., if no customer-service entities present, SLA/queue/routing bindings are silent-skipped)
- Validators run inline; failures trigger retry loop
- `gap-log.json` populated with typed entries for any artefacts that genuinely couldn't be documented
- `coverage-report.md` shows every inventoried artifact is documented OR gap-logged OR module-skipped

Switch a domain agent project to `mode: brownfield`; run `/impact` → confirm impact report references brownfield IDs.

### V7 — Aggregators (Phase 5)

With CE and Integration plans approved, run:

```
/solution-blueprint
```

Confirm:

- Unified Mermaid architecture renders (C4-L1 + L2 + per-agent L3)
- Cross-references to each agent's blueprint resolve

```
/solution-review
```

Confirm cross-agent gap report flags any inconsistencies (e.g., entity-name mismatches, NFR conflicts).

```
/solution-prototype
```

Confirm clickable HTML produced at `projects/{p}/_aggregator/architecture/solution-prototype/`. Open `index.html` in browser; verify navigation, persona-switcher, journey-stepper all work.

```
/estimate
```

Confirm 3 markdown outputs + conditional 4th. Verify Confidence Band ±X% header is auto-derived from inventory rows. Verify Brownfield Status column populated correctly when `mode: brownfield`.

### V8 — Publish pipeline + drift check (Phase 4)

```powershell
.\tools\sync\Publish-Agents.ps1
```

Confirm all 8 jobs complete: mirror, render settings, render plugin, GHCP standalone, Claude root-unified, GHCP root-unified, marketplace, drift-check.

Modify a command in `agents/d365-ce/.claude/commands/spec.md`. Re-run pipeline. Confirm generated outputs (Claude root-unified, GHCP standalone, GHCP root-unified) all update.

Hand-edit a generated file at `.claude/commands/d365-ce/spec.md`. Run `Publish-Agents.ps1 -CheckOnly` → confirm CI-style failure with the drifted file listed.

### V9 — Chat UI (Phase 9)

Start backend (`npm run dev` in `tools/chat-ui/backend`), frontend (Vite).

Pick a project → pick agent → invoke a command → confirm CLI subprocess invoked and output streamed.

Confirm "Ready" pane updates after gate transitions.

### V10 — MCP tools (Phases 2 + ongoing)

From any agent session, invoke:

- `workflow_status` — confirm response validates against `workflow-state.v1.json`
- `workflow_next` — confirm ranked list per agent
- `handoff_list` — confirm list of open handoffs
- `traceability_read` — confirm `work-items.yaml` partition returned
- `brownfield_query` — confirm inventory query works (when brownfield project exists)
- `alm_query` — confirm canonical query language abstracted (works with both ADO and JIRA)

### V11 — Constitution and template layering (Phase 4 + ongoing)

Modify `agents/d365-ce/constitution/02-nfr.md`. Run any command in CE → confirm cache invalidated and new content read.

Add an override at `projects/test-d365/d365-ce/constitution-override/02-nfr.md`. Confirm overlay wins for that project.

Add an override at `projects/test-d365/d365-ce/templates-override/fdd.template.md`. Run `/fdd` → confirm the override template is used instead of the agent's default.

Set the override frontmatter `based-on-template-version` to an old version → confirm `doc_lint` warns that the override has drifted.

## Verification cadence

| Phase | Checks to run after phase completion |
|---|---|
| 1 (Foundation) | V11 partial (constitution + templates exist; layering not testable yet) |
| 2 (MCP core) | V10 (MCP tools respond) |
| 3 (Scaffold) | V1 |
| 4 (Publish pipeline) | V8, V11 full |
| 5 (BASIC agents) | V7 partial (/estimate, /solution-blueprint with stub data) |
| 6 (MATURE agents) | V2, V3, V7 full |
| 7 (Brownfield) | V6 |
| 8 (ALM) | V4, V5 |
| 9 (Chat UI) | V9 |
| 10 (Verification + ADR backfill) | All 11 re-run end-to-end |

## CI integration

All 11 checks should be automated where possible:

- V1, V2, V3, V7, V8, V11 — scriptable; run in CI on every PR
- V4, V5 — require ADO/JIRA sandbox access; nightly CI
- V6 — runs against the bundled anonymised D365 test corpus; every PR
- V9 — requires browser automation (Playwright); nightly
- V10 — runs as part of MCP tool unit tests; every PR

Drift checks (V8 partial) run on every PR via `.github/workflows/check-publish-drift.yml`.

## References

- Cross-references: [11-mcp-server.md](11-mcp-server.md), [12-publish-pipeline.md](12-publish-pipeline.md), [agents/brownfield.md](agents/brownfield.md), [agents/alm.md](agents/alm.md), [agents/solution-architect.md](agents/solution-architect.md), [agents/solution-estimate.md](agents/solution-estimate.md), [13-chat-ui.md](13-chat-ui.md)
- Implementation phases: [../implementation.md § Implementation Plan](../implementation.md)
