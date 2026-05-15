---
title: Design Backlog — Queued Topics
status: live
master-plan-refs: [§25]
last-reviewed: 2026-05-14
owner: design
---

# Design Backlog — Queued Topics

> Topics from master-plan **§25 "Topics Still To Be Detailed"** plus user-flagged open items, queued for dedicated design docs. Each item is one focused topic, tackled one-by-one. When work begins, move the item's `status` to `in-progress`, create a `design/<topic>.md` from [_template/design-doc.template.md](_template/design-doc.template.md), and link it in the **Design doc** column. When stable, flip to `done`.

## Conventions

- **Item id:** `bk-NNN` (zero-padded 3-digit), assigned at creation.
- **Status lifecycle:** `queued` → `in-progress` → `done` (links to the live design doc). `blocked` if external dependency. `dropped` if explicitly cancelled (keep the row + reason; don't delete).
- **Priority:** `P1` (next up) / `P2` (likely-next) / `P3` (later) / `Px` (unprioritised).
- **Master-plan ref:** the §25 bullet or other section that introduced the topic. Empty if user-flagged ad hoc.
- **Adding new items:** append at the bottom; do not renumber. Update count in the summary at top.

## Summary

- **Total items:** 28
- **Done (post-Phase 10):** 18
  - **Phase 0 / 1:** bk-001 (port-scope), bk-003 (agents.yaml schema), bk-024 (ADR backfill — 11 ADRs)
  - **Phase 3 / 4:** bk-020 (scaffold scripts), bk-021 (publish-pipeline templates)
  - **Phase 5:** bk-009 (solution-estimate `/estimate`)
  - **Phase 6:** bk-004 (additive-section logic), bk-005 (d365-ce FDD R19 A1-A15 skeleton), bk-006 (d365-ce TDD multi-file pack), bk-007 (sub-platform pack skeletons), bk-008 (review checklists), bk-025 (per-agent generic), bk-026 (d365-fo), bk-027 (reporting)
  - **Phase 7:** bk-011 (9 pattern templates), bk-013 (module-detection.yaml), bk-015 (7 scan templates), bk-017 (brownfield doc command output formats)
  - **Phase 8:** bk-028 (alm agent design + commands + templates)
  - **Phase 9:** bk-019 (chat UI UX flows + implementation v1)
- **In progress:** 0
- **Queued (post-Phase 10) — coding follow-ons + content polish:**
  - **bk-002** /split semantics design refinement (6 thin spots)
  - **bk-005** d365-ce FDD body content (skeleton ✅; per-feature body authored when real features run /fdd)
  - **bk-007** d365-ce sub-platform pack body content (Canvas / Pages / PCF / PA — skeletons ✅)
  - **bk-008** d365-ce platform-specific review checklists polish (base 6 stubs ✅; specialisation queued)
  - **bk-010** solution-estimate factor catalogue extensions (F&O / deeper Integration / deeper Reporting)
  - **bk-012** brownfield ~167 remaining bindings (18 sample ✅; rest paired with CI test corpus)
  - **bk-014** brownfield-engine MCP TypeScript code (~8 modules)
  - **bk-016** 10 brownfield validators + CI test corpus
  - **bk-018** MCP `alm_*` tool group + `converters/` module (10 + 5 tools); ADO + JIRA Cloud + JIRA Server adapters
  - **bk-022** Hook configurations for hard-gate enforcement
  - **bk-023** /customize-template scaffold helper
- **Blocked / dropped:** 0

*Updated 2026-05-15 post-Phase 10 close-out: all 9 implementation phases complete (Phases 0-9). 18 backlog items closed across the phases; the 10 remaining items are coding follow-ons (MCP `brownfield-engine`, `brownfield_validators`, `alm_*`, `converters/`) and per-agent content polish. The platform v1 release-ready milestone is achieved at the structural / design level; per-agent body content and MCP-layer code are explicitly queued. See [../implementation.md § Phase 10](../implementation.md) and [verification-report-2026-05-15.md](verification-report-2026-05-15.md) for the close-out audit.*

*Updated 2026-05-14 (later, post-Phase-1 build): bk-001 resolved to Option A (BASIC agents first — solution-estimate + solution-architect); bk-003 closed (agents.yaml authored with full registry shape including version, base-commands, extra-commands, docScope per agent; further JSON Schema for the registry itself remains TBD). See [../implementation.md entry 2026-05-14-005](../implementation.md).*

*Updated 2026-05-14 via audit ([audit-2026-05-14.md](audit-2026-05-14.md) § C): added bk-026, bk-027, bk-028 for d365-fo / reporting / alm agent design docs that were previously folded into the generic bk-025.*

*Updated 2026-05-14 (later): authored the full design folder — ADR-0002 through ADR-0011 (10 backfill ADRs); design docs 00 through 16 + 8 per-agent docs under `agents/`. This closes `bk-024` (ADR list). Other backlog items have **design-level coverage** now via the published docs but their detailed authoring work (bk-005 d365-ce FDD body A1-A15, bk-009 solution-estimate /estimate authoring, bk-011-bk-016 brownfield patterns + bindings + engine code, etc.) is still **build-phase work** — design specifies WHAT to build; the agent folders / MCP code / scaffold scripts must still be authored per [../implementation.md § Implementation Plan](../implementation.md).*

---

## Backlog

| ID | Title | Priority | Status | Design doc | Master-plan ref | Notes |
|---|---|---|---|---|---|---|
| bk-001 | Port-scope priority — which agents to build first (Option A/B/C/D from RESUME POINT) | P1 | **done** | [../implementation.md entry 2026-05-14-005](../implementation.md) | RESUME POINT open Q | **Closed 2026-05-14: Option A locked.** Sequence: Phases 1→2→3→4 (foundation, MCP, scaffold, publish) → Phase 5 (solution-estimate + solution-architect BASIC) → Phase 6 (CE/FO/Int/Rep MATURE) → Phase 7 (brownfield) → Phase 8 (alm) → Phase 9 (chat UI) → Phase 10 (verification + final ADRs). |
| bk-002 | `/split` semantics — handoff manifest shape, target-agent feature folder init, multi-target, collision behavior | P1 | queued | [09-orchestration-patterns.md](09-orchestration-patterns.md) (partial; thin spots flagged) | §14 Pattern 2 | Question 2 from user; needs an ADR + design doc fleshing out the 6 thin spots (workflow.json init, skeleton frontmatter, --target flag, template choice, collision behaviour, source spec SPEC_SPLIT marker). |
| bk-003 | `agents.yaml` schema and discovery semantics | P1 | **done** | [01-repo-structure.md § agents.yaml](01-repo-structure.md), [agents.yaml](../agents.yaml) (authored 2026-05-14) | §25 | **Closed 2026-05-14:** `agents.yaml` authored at repo root with all 8 agents declared (version, maturity, base-commands, extra-commands, docScope). Full JSON Schema for the registry itself remains a follow-up (low priority — schema-validation is for project-config and workflow-state in v1). |
| bk-004 | `/fdd`, `/tdd`, `/blueprint` additive-section logic for domain mode | P1 | queued | [04-workflow-gates.md](04-workflow-gates.md), [agents/d365-ce.md](agents/d365-ce.md) (assembly flow) | §25 | Section-block append with `feature-id` HTML-comment markers; table-row append with `feature-id` column; concurrency conflict detection in `doc_lint`. Authoring effort = build-phase. |
| bk-005 | d365-ce `fdd/_index.template.md` body with A1–A15 additions | P2 | queued | [agents/d365-ce.md § Planned content additions](agents/d365-ce.md) | §7.1, §25 | 15 content-shape fixes/additions to the SW Phoenix FDD base. Bodies authored when d365-ce is built. |
| bk-006 | d365-ce TDD multi-file pack (mirrors FDD sub-platform pattern) | P2 | queued | [agents/d365-ce.md](agents/d365-ce.md) (folder shape shown) | §7.1, §25 | Content authoring; placeholders defined. |
| bk-007 | d365-ce Canvas / Power Pages / PCF / Power Automate sub-platform content packs | P2 | queued | [agents/d365-ce.md](agents/d365-ce.md) (folder shape shown) | §7.1, §25 | Placeholder template files defined; bodies to be authored. |
| bk-008 | d365-ce review checklists — `fdd-review.checklist.md` + `tdd-review.checklist.md` authored fresh | P2 | queued | [agents/d365-ce.md](agents/d365-ce.md) + [ADR-0001](adr/0001-review-scope-spec-only.md) (inline consumption) | §7.1, §25 | Consumed inline per ADR-0001. |
| bk-009 | Solution-estimate `/estimate` single command authoring | P1 | **done** | [agents/solution-estimate.md](agents/solution-estimate.md), [ADR-0009](adr/0009-solution-estimate-consolidated.md); agent at `agents/solution-estimate/` (17 source files, 2026-05-14) | §7.5 | **Closed 2026-05-14:** Full agent built — 4 constitution files, 6 data files (incl. 103-factor catalogue with rates), 4 output templates, `/estimate` command, README. End-to-end published via Phase 4 pipeline (4 delivery surfaces). 475 per-complexity descriptions (95×5) deferred for incremental authoring; current depth sufficient for `/estimate` to pick complexity tier per category-pattern guidance. Implementation.md entry `2026-05-14-009`. |
| bk-010 | Solution-estimate factor catalogue extensions (F&O / deeper Integration / deeper Reporting) | P3 | queued | [agents/solution-estimate.md § Aggregation mode](agents/solution-estimate.md), [ADR-0009 § Negative consequences](adr/0009-solution-estimate-consolidated.md) | §7.5 | Each extension adds rows to `factor-definitions.md` + `factor-rates.yaml`. |
| bk-011 | Brownfield 9 pattern templates authoring | P2 | queued | [agents/brownfield.md § Nine patterns](agents/brownfield.md), [ADR-0008](adr/0008-brownfield-patterns-and-bindings.md) | §7.7, §25 | schema-asset, code-asset, config-asset, process-asset, ui-asset, security-asset, integration-asset, container-asset, catalog-asset. |
| bk-012 | Brownfield ~185 bindings authoring | P3 | queued | [agents/brownfield.md § ~185 bindings](agents/brownfield.md), [ADR-0008](adr/0008-brownfield-patterns-and-bindings.md) | §7.7, §25 | ~70 CE + ~50 FO + ~40 integration + ~25 reporting; one YAML per artifact type. |
| bk-013 | Brownfield module-detection rules (`module-detection.yaml`) | P2 | queued | [agents/brownfield.md § Module-detection](agents/brownfield.md) | §7.7, §25 | Customer-service / sales / marketing / field-service / retail signals. Shared with solution-estimate. |
| bk-014 | Brownfield engine code — `tools/mcp-server/groups/brownfield-engine/` | P3 | queued | [agents/brownfield.md § brownfield-engine](agents/brownfield.md), [11-mcp-server.md](11-mcp-server.md), [ADR-0008](adr/0008-brownfield-patterns-and-bindings.md) | §7.7, §25 | binding-loader, pattern-renderer, module-detector, extractor, cross-ref, coverage-tracker, pipeline, synthesis-runner, coverage-report-writer. |
| bk-015 | Brownfield scan templates with full artifact taxonomy | P2 | queued | [agents/brownfield.md § Per-platform scan templates](agents/brownfield.md) | §7.7, §25 | Expand scan templates for d365-ce / d365-fo / integration / reporting / power-apps / power-pages / custom-pages. |
| bk-016 | Brownfield validators authoring + CI test corpus seeding + platform pack bodies | P2 | queued | [agents/brownfield.md § brownfield_validators](agents/brownfield.md), [ADR-0007](adr/0007-brownfield-auto-mode-self-healing.md) | §7.7, §25 | 10 validators with self-heal actions; anonymised D365 solution. |
| bk-017 | Brownfield doc commands — detailed output formats per artifact type | P3 | queued | [agents/brownfield.md](agents/brownfield.md) (output organisation) | §25 | Per-artifact-type output schemas. |
| bk-018 | MCP tool group detailed APIs (signatures, schemas, error contracts) | P2 | queued | [11-mcp-server.md](11-mcp-server.md) (high-level shape) | §18, §25 | All tool groups documented; full JSON-Schema authoring + error contracts pending. |
| bk-019 | Chat UI UX flows (project picker, agent picker, ready pane, document viewer) | P3 | queued | [13-chat-ui.md](13-chat-ui.md) | §20, §25 | React frontend + Node backend; CLI subprocess invocation. |
| bk-020 | `New-Project` / `New-Feature` / `New-Agent` scaffold scripts — detailed behavior | P2 | **done** | [05-project-layout.md](05-project-layout.md), [02-agent-skeleton.md](02-agent-skeleton.md); scripts at `tools/scaffold/` (authored 2026-05-14) | §8, §25 | **Closed 2026-05-14:** 3 PowerShell scripts + shared YAML reader + Node validator shim; all generated configs validate against v1 schemas; end-to-end smoke-test passed (project + 2 features across both docScopes + agent skeleton with 40 files). Implementation.md entry `2026-05-14-007`. |
| bk-021 | `settings.template.json` and `plugin.template.json` schemas | P2 | **done** | [12-publish-pipeline.md](12-publish-pipeline.md), [ADR-0011](adr/0011-publish-pipeline-8-job-model.md); templates at `tools/sync/` (authored 2026-05-14) | §19, §25 | **Closed 2026-05-14:** 3 templates (`settings.template.json`, `plugin.template.json`, `chatmode.template.md`) + `Publish-Agents.ps1` (8 jobs) + `Watch-Agents.ps1` + CI drift-check workflow. End-to-end verified: empty-state, idempotent, drift detection, full 4-surface generation for a test agent. Implementation.md entry `2026-05-14-008`. |
| bk-022 | Hook configurations for hard-gate enforcement | P2 | queued | [11-mcp-server.md § Hook configurations](11-mcp-server.md), [04-workflow-gates.md](04-workflow-gates.md) | §25 | Pre/post-tool-use hooks enforcing `.workflow.json` gates. |
| bk-023 | `/customize-template <type>` scaffold helper | P3 | queued | [06-templates.md](06-templates.md), [01-repo-structure.md § Drift detection](01-repo-structure.md) | §11, §25 | Copies agent default into project's `templates-override/`. |
| bk-024 | ADR list for the design folder (initial set of 11 ADRs identified in §25) | P2 | **done** | All 11 ADRs in [adr/](adr/) | §25 | ADR-0001 through ADR-0011 authored 2026-05-14. See [16-revision-history.md](16-revision-history.md) for the chronological view. |
| bk-025 | Per-agent constitution module breakdowns + template detailed contents (one design doc per agent, 8 agents) | P2 | queued | — | §25 | One design doc per agent: `design/d365-ce.md`, `design/d365-fo.md`, …, `design/alm.md`. Specific agents extracted as bk-005–008 (CE), bk-026 (FO), bk-027 (Rep), bk-028 (ALM); bk-025 remains the umbrella for solution-estimate / solution-architect / integration / brownfield design docs. |
| bk-026 | d365-fo agent design doc — constitution + templates breakdown | P2 | queued | — | §7.2, §25, R16 | Feature-scoped `docScope` is unique to F&O. Constitution PORTED from `aifirstdelivery/templates/d365-fo/` per R16; templates carry FastTrack conventions (★ markers, Object-ID prefixes, BLOCKER/REQUIRED/WARNING). Added 2026-05-14 per audit. |
| bk-027 | reporting agent design doc — constitution + templates + review checklists | P2 | queued | — | §7.4, §25 | Parallels bk-005–008 for CE. CE-SSRS + Power BI sub-modules. Domain-scoped per R18. Added 2026-05-14 per audit. |
| bk-028 | alm agent design doc — ADO + JIRA adapters, round-trip, converters/ | P2 | queued | — | §7.8, §15, §25, R13+R14 | 6 commands (push/pull/export/import/status/cleanup), `alm_*` MCP tools, ADO+JIRA adapters, md↔ALM rich-text conversion (R14). Added 2026-05-14 per audit. |

---

## Resolved (moved out of backlog)

When an item flips to `done`, leave its row in the table above with `done` status and link to the design doc + ADR(s) that closed it, **and** record a one-line entry here for the audit trail.

- **bk-024** — ADR list (initial 11) — closed 2026-05-14 — design docs: [adr/0001](adr/0001-review-scope-spec-only.md) through [adr/0011](adr/0011-publish-pipeline-8-job-model.md) — implementation.md entry `2026-05-14-004`
- **bk-001** — Port-scope priority — closed 2026-05-14 — Option A locked: BASIC agents (solution-estimate + solution-architect) build before MATURE merges; brownfield + ALM after. Implementation.md entry `2026-05-14-005`.
- **bk-003** — `agents.yaml` schema and discovery — closed 2026-05-14 — `agents.yaml` authored at repo root with all 8 agents; consumption by `New-Feature.ps1` + dispatch by `/fdd /tdd /blueprint` per `docScope` keys documented in [design/01-repo-structure.md § agents.yaml](01-repo-structure.md). Implementation.md entry `2026-05-14-005`.
- **bk-020** — Scaffold scripts — closed 2026-05-14 — `tools/scaffold/{New-Project,New-Feature,New-Agent}.ps1` + `lib/Read-AgentsYaml.ps1` + `lib/Validate-Config.cjs` + README; all configs validate against v1 schemas; end-to-end smoke test passed. Implementation.md entry `2026-05-14-007`.
- **bk-021** — Publish pipeline templates — closed 2026-05-14 — `tools/sync/{settings,plugin,chatmode}.template.*` + `Publish-Agents.ps1` (8 jobs, idempotent, drift-checked) + `Watch-Agents.ps1` + README + CI workflow `.github/workflows/check-publish-drift.yml`. End-to-end verified: empty-state publish, idempotent re-run, full 4-surface generation for test agent, hand-edit drift detection (exit 1), restore-and-pass. Implementation.md entry `2026-05-14-008`.
- **bk-009** — Solution-estimate `/estimate` authoring — closed 2026-05-14 — full agent built at `agents/solution-estimate/` (17 source files); also built `agents/solution-architect/` (20 source files) per the Phase 5 Option A sequencing. Both ran through the publish pipeline producing 34 generated/mirrored files across all 4 delivery surfaces. Implementation.md entry `2026-05-14-009`.
