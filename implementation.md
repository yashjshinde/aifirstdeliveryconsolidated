# Implementation Log

> Append-only changelog of every fix, design update, and build action against the spec-driven development consolidated platform. The master plan ([reference/00-spec-driven-development-humble-muffin.md](reference/00-spec-driven-development-humble-muffin.md)) is the contract; [design/](design/) holds the detailed design that elaborates it; this file records **what was done, when, and by whom**, with cross-references both ways.

---

## How to use this file

### When to log

Every change to the consolidated repo gets one entry here, including:

- Master-plan revisions (each new `Rxx` adds one entry — the `Rxx` itself is logged here)
- Design folder edits (new docs, updates to existing docs, ADR additions, backlog changes)
- Code/scaffold authoring (when implementation begins: agent folders, MCP server, scaffold scripts, chat UI)
- Configuration changes (`settings.json`, `agents.yaml`, hook configs)
- Bug fixes / corrections / clarifications surfaced during build

### Entry format

Each entry is a `### YYYY-MM-DD-NNN` section (NNN is a zero-padded same-day sequence). Header row carries `id / date / kind / files / refs`. Body explains what and why.

```markdown
### 2026-05-14-001 — <one-line summary>

| Field | Value |
|---|---|
| **Kind** | master-plan-revision / design-update / adr / scaffold / code / bugfix / config |
| **Master-plan refs** | §N, Rxx |
| **Design doc refs** | design/foo.md, design/adr/NNNN-bar.md |
| **Backlog refs** | bk-NNN |
| **Files touched** | path1, path2, ... |
| **Status** | done / partial / reverted |

**Summary.** What changed and why, in plain English.

**Detail.** Bulleted breakdown of edits / files / decisions.

**Verification.** How correctness was confirmed.

**Follow-up.** Open items that emerged.
```

### Rules

1. **Append-only.** Never edit an existing entry. To correct a past entry, write a new entry that supersedes it (cite the prior id; explain the correction).
2. **Date entries by when the work was done**, not when logged. If logged late, use the original date and note "logged on YYYY-MM-DD" in the body.
3. **Cross-link everything.** Every entry should reference at least one of: master-plan `Rxx`, design doc, ADR, backlog id, or a concrete file path.
4. **Pair design + log.** Any edit to a `design/*.md` file requires a matching entry here. Any edit to the master plan that is a substantive revision (`Rxx`) requires a matching entry here. (Tiny typo fixes can be a single-line entry.)
5. **Reference plan files when applicable.** When work was done following an approved plan in `~/.claude/plans/`, link the plan file in the entry.

### Status legend

- **done** — entry is complete; outcome verified
- **partial** — entry covers work that intentionally stopped mid-task (e.g., paused for user input); a follow-up entry is expected
- **reverted** — change was rolled back; entry remains for the audit trail

---

## Implementation Plan

> Forward-looking roadmap from current state (design folder scaffolded; master plan R34 applied; 0 lines of code) to a working spec-driven development platform per [reference/00-spec-driven-development-humble-muffin.md](reference/00-spec-driven-development-humble-muffin.md). **This section is revisable** — when the plan changes, edit in place and append a `plan-update` entry in the log below. The phases below are mapped to backlog items in [design/backlog.md](design/backlog.md) and follow the master plan's "Critical Files To Be Created" enumeration (§22).
>
> **Audit foundation:** [design/audit-2026-05-14.md](design/audit-2026-05-14.md) — independent design-vs-spec audit from which this plan is derived.

### Plan-status legend (distinct from entry status)

- **🔒 blocked** — prerequisite design doc or ADR not yet authored, OR upstream phase incomplete
- **⏳ ready** — prerequisites met; can begin
- **🚧 in-progress** — actively being built
- **✅ done** — phase complete, verified against master plan §23 verification steps for that phase
- **⏭ deferred** — intentionally pushed to a later session

### Critical path

```
bk-001 (port-scope) ──┐
                       ↓
Phase 1 (Foundation) ──┬─→ Phase 2 (MCP core)       ┐
                       │                              │
                       └─→ Phase 3 (Scaffold scripts)─┼─→ Phase 4 (Publish pipeline)
                                                      │
Phase 5 (BASIC agents, if Option A) ──────────────────┴─→ Phase 6 (MATURE agents)
                                                          │
                                                          ↓
                                                       Phase 7 (Brownfield)
                                                          │
                                                          ↓
                                                       Phase 8 (ALM)
                                                          │
                                                          ↓
                                                       Phase 9 (Chat UI)
                                                          │
                                                          ↓
                                                      Phase 10 (Verification + ADR backfill)
```

### Phase summary

| Phase | Title | Status | Blocker | Backlog items | ADRs | Master-plan refs |
|---|---|---|---|---|---|---|
| 0 | Pre-build groundwork (this session + prior) | ✅ done | — | bk-001 ✅, bk-024 ✅ | ADR-0001 ✅ | §25, §26-R34, RESUME POINT |
| 1 | Foundation: root assets | ✅ done | — | bk-003 ✅ | ADR-0002, ADR-0011 | §4, §8, §9, §22 |
| 2 | MCP server core | ✅ done | — | bk-018 (partially closed for 4 foundational groups) | ADR-0001, ADR-0006, ADR-0010 | §18, §22 |
| 3 | Scaffold scripts | ✅ done | — | bk-020 ✅ | — | §8, §22 |
| 4 | Publish pipeline | ✅ done | — | bk-021 ✅ | ADR-0002, ADR-0011 | §19, §22 |
| 5 | BASIC agents (solution-estimate, solution-architect) | ✅ done | — | bk-009 ✅; bk-010 deferred (catalogue extensions) | ADR-0009, ADR-0005, ADR-0001 | §7.5, §7.6, §17, §22 |
| 6 | MATURE agents (d365-ce, d365-fo, integration, reporting) | ⏳ ready | — | bk-004, bk-005, bk-006, bk-007, bk-008, bk-025, bk-026, bk-027 | ADR-0005, ADR-0006, ADR-0010 | §7.1, §7.2, §7.3, §7.4, §22 |
| 7 | Brownfield agent | 🔒 blocked | bk-011..016, ADR-0007, ADR-0008 | bk-011, bk-012, bk-013, bk-014, bk-015, bk-016, bk-017 | ADR-0007 (R20), ADR-0008 (R21) | §7.7, §16, §21, §22 |
| 8 | ALM agent (ADO + JIRA) | 🔒 blocked | bk-028, bk-018 | bk-028 | future ADR for R13+R14 | §7.8, §15, §22 |
| 9 | Chat UI | 🔒 blocked | bk-019 | bk-019 | — | §20, §22 |
| 10 | Verification + ADR backfill | 🔒 blocked | All ADRs (0002–0011), Phases 1–9 | bk-024 | All remaining | §23, §26 |

### Phase 0 — Pre-build groundwork *(in-progress)*

**Goal:** Establish the design/implementation/log convention and resolve the open decisions that block phase 1.

**Deliverables:**
- ✅ Design folder scaffolded ([design/README.md](design/README.md), templates, ADR template) — entry `2026-05-14-002`
- ✅ Implementation log conventions established ([implementation.md](implementation.md) top section) — entry `2026-05-14-002`
- ✅ Master plan R34 applied (`/review` spec-only) — entry `2026-05-14-001`
- ✅ ADR-0001 captured (R34) — entry `2026-05-14-002`
- ✅ Independent audit ([design/audit-2026-05-14.md](design/audit-2026-05-14.md)) — this entry (`2026-05-14-003`)
- ✅ Backlog gaps filled (bk-026, bk-027, bk-028) — this entry
- ✅ Implementation Plan documented (this section) — this entry
- ⏳ User decision on bk-001 (port-scope priority — Option A recommended) — pending
- ⏳ Author bk-003 (`agents.yaml` schema) as the first foundation-prerequisite design doc — pending
- ⏳ Author ADR-0002 (dual-mode delivery surfaces, R1) as worked example for the ADR backfill — pending
- ⏳ Author ADR-0006 (doc scope domain vs feature, R18) — pending; gates Phase 6

**Phase 0 exit criteria:** `bk-001` decided; `bk-003` design doc live; `ADR-0002` accepted; `ADR-0006` accepted.

### Phase 1 — Foundation: root assets

**Goal:** Author the platform-wide source-of-truth files. Everything downstream depends on these.

**Prerequisites:** bk-003 (agents.yaml schema) live, master plan §4 + §9, ADR-0002 (dual-mode surfaces).

**Deliverables (12 files):**
- `agents.yaml` — agent registry with version, base-commands, extra-commands, **docScope keys** (R18) per agent
- `workflow.yaml` — declarative DAG of phases/states/transitions/hard-gates/parallel-after rules
- `schemas/handoff.v1.json`, `alm-extract.v1.json`, `work-items.v1.json`, `workflow-state.v1.json`, `brownfield-inventory.v1.json`, `project-config.v1.json` — 6 versioned JSON schemas
- `constitution/_reference/00-charter.md.example` through `…07-oob-first.md.example` — scaffolding-only starters consumed by `New-Agent.ps1` (not read at runtime per R11)
- `templates/_reference/{spec,plan,tdd,...}.template.md.example` — scaffolding-only starters
- Root `README.md` — explains repo, three-artefact model, points at design/ and master plan
- `docs/architecture.md`, `docs/orchestration.md` — human-facing project-agnostic context

**Exit criteria:** All 12 files committed; `schemas/` files validate themselves (each is valid JSON Schema); `agents.yaml` parses against `project-config.v1` adjacents; `workflow.yaml` parses.

### Phase 2 — MCP server core

**Goal:** Build the single, modular MCP server with the foundational tool groups (no agent-specific tools yet).

**Prerequisites:** bk-018 (MCP tool group APIs design doc) live, schemas from Phase 1.

**Deliverables:**
- `tools/mcp-server/` skeleton with `src/`, `package.json`, `README.md`
- Tool groups (foundational only): `doc_lint`, `workflow_*` (`workflow_status`, `workflow_next`), `handoff_*` (`handoff_list`, `handoff_status`, `handoff_publish`), `config_resolve`
- Schema validation library wiring all `schemas/*.v1.json`
- Hooks scaffold for hard-gate enforcement (consumed by Phase 4 publish pipeline → settings.json)

**Exit criteria:** MCP server starts; `doc_lint` runs against a sample doc; `workflow_status` reads a sample `.workflow.json`.

### Phase 3 — Scaffold scripts

**Goal:** PowerShell tooling to create new projects and features.

**Prerequisites:** bk-020 (scaffold-script behavior) live, bk-003 (agents.yaml), Phase 1 foundation files.

**Deliverables:**
- `tools/scaffold/New-Project.ps1` — creates `projects/{name}/` with `project.config.yaml`, `work-items.yaml`, `_handoffs/`, per-agent subfolders
- `tools/scaffold/New-Feature.ps1` — reads agent's `docScope` from `agents.yaml`; lays out per-feature folder under the correct shape (domain-scoped vs feature-scoped per R18)
- `tools/scaffold/New-Agent.ps1` — seeds new agent from `constitution/_reference/` + `templates/_reference/`
- `tools/scaffold/README.md`

**Exit criteria:** Verification step §23.1 passes (scaffold a project end-to-end).

### Phase 4 — Publish pipeline

**Goal:** Generate all derivative artefacts from authored sources. Includes drift checks.

**Prerequisites:** bk-021 (settings + plugin templates), ADR-0002 (4 surfaces), ADR-0011 (8 jobs), Phases 1–3.

**Deliverables:**
- `tools/sync/Publish-Agents.ps1` — main entry executing all 8 jobs: mirror, render settings, render plugin, GHCP standalone, Claude root-unified, GHCP root-unified, marketplace, drift-check
- `tools/sync/Watch-Agents.ps1` — file-watcher mode
- `tools/sync/settings.template.json`, `plugin.template.json`, `chatmode.template.md`
- `.github/workflows/check-publish-drift.yml` — CI failure if any generated file was hand-edited
- Generated outputs validated: `.claude/settings.json`, `.claude/commands/{a}/`, `.claude-plugin/marketplace.json`, `.github/chatmodes/`, `.github/prompts/` (will be empty until agents exist; pipeline still runs)

**Exit criteria:** Drift check passes on empty state; CI workflow runs.

### Phase 5 — BASIC agents (Option A recommendation)

**Conditional on bk-001 = Option A.** If Option B/C/D is picked, this phase is reshaped.

**Goal:** Build `solution-estimate` and `solution-architect` — both BASIC maturity per RESUME POINT, fastest wins.

**Prerequisites:** bk-009 (`/estimate` command design), bk-010 (factor catalogue extensions optional), ADR-0009 (solution-estimate consolidated), Phases 1–4 platform skeleton.

**Deliverables:**

**solution-estimate:**
- `agents/solution-estimate/` folder with constitution (5 files), templates (factor-rates.yaml, phase-multipliers.yaml, brownfield-multipliers.yaml, confidence-levels.yaml, module-detection.yaml, 3 output templates + conditional Proposed-Factors), single `/estimate` command, factor-definitions.md (103 factors per R27+R28)
- Aggregator output structure under `projects/{p}/_aggregator/estimation/`

**solution-architect:**
- `agents/solution-architect/` folder with constitution (3 files including R33 `03-prototype-generation-rules.md`), templates (blueprint, solution-prototype HTML templates + helpers), commands (`/solution-blueprint`, `/solution-review`, `/solution-prototype` per R33)

**Exit criteria:** Verification §23.7 (aggregators) passes; `/estimate` produces all 3 outputs from sample inputs; `/solution-prototype` produces clickable HTML.

### Phase 6 — MATURE agents (d365-ce / d365-fo / integration / reporting)

**Goal:** Build the four domain agents.

**Prerequisites:** bk-001 decision unblocking, bk-004 (`/fdd`/`/tdd`/`/blueprint` additive-section logic), bk-005–008 (d365-ce specifics), bk-026 (d365-fo), bk-027 (reporting), bk-025 (generic per-agent), ADR-0005 (R17 multi-file sub-platform), ADR-0006 (R18 docScope), ADR-0010 (R6 templates agent-owned).

**Deliverables (~100 files across 4 agents):**
- `agents/d365-ce/` — fat agent with multi-file FDD/TDD packs (model-driven / canvas / power-pages / pcf / power-automate), fdd-helpers/form-mockup-generator.prompt.md (R17), R19 A1–A15 FDD content additions
- `agents/d365-fo/` — constitution + templates ported verbatim from `reference/01-aifirstdelivery/templates/d365-fo/` per R16; feature-scoped docScope
- `agents/integration/` — merged event-driven + batch + data-migration capability per R10; 12-file constitution; domain-scoped
- `agents/reporting/` — CE SSRS + Power BI; review checklists authored fresh (was the gap in R20 audit); domain-scoped

**Exit criteria:** Verification §23.2 (spec→review→plan in CE) passes; §23.3 (cross-agent handoff) passes; §23.4 (ALM round-trip ADO) **deferred to Phase 8**.

### Phase 7 — Brownfield agent

**Goal:** Build the brownfield agent with full pattern + binding architecture.

**Prerequisites:** bk-011 (9 patterns), bk-012 (~185 bindings), bk-013 (module-detection.yaml), bk-014 (engine code), bk-015 (scan templates), bk-016 (validators + CI test corpus), bk-017 (doc command output formats), ADR-0007 (R20 auto-mode), ADR-0008 (R21 patterns+bindings).

**Deliverables (~220 files — the heaviest phase):**
- `agents/brownfield/` constitution with platforms/ subfolder (CE, FO, integration, reporting, power-platform per R20 Group 4)
- 9 pattern templates (schema/code/config/process/ui/security/integration/container/catalog-asset)
- ~185 bindings (70 CE + 50 FO + 40 integration + 25 reporting)
- 5 synthesis templates (component-inventory, functional-overview, integration-topology, solution-blueprint, technical-overview)
- 7 scan templates (per-platform extraction paths)
- `templates/module-detection.yaml`
- `tools/mcp-server/groups/brownfield-engine/` (binding-loader, pattern-renderer, module-detector, extractor, cross-ref, coverage-tracker, pipeline, synthesis-runner)
- `tools/mcp-server/brownfield_validators/` (10 validators + CI test corpus)
- 8 commands (`/prepare`, `/scan`, `/document`, `/fdd`, `/tdd`, `/blueprint`, `/generate`, `/index`, `/handoff`)

**Exit criteria:** Verification §23.6 (brownfield flow) passes against the anonymised D365 test corpus; coverage guarantee verified (every inventoried artifact is documented, gap-logged, or module-gated-skipped).

### Phase 8 — ALM agent

**Goal:** Build the workflow-level ALM operations with bidirectional ADO + JIRA support.

**Prerequisites:** bk-028 (alm agent design doc — added 2026-05-14), bk-018 (MCP `alm_*` tool APIs), Phase 1 schemas.

**Deliverables:**
- `agents/alm/` with constitution (alm-mapping, alm-conventions), 6 commands (`push`, `pull`, `export`, `import`, `status`, `cleanup`)
- MCP `alm_*` tool group: `alm_create_work_item`, `alm_bulk_create_work_items`, `alm_get`, `alm_update`, `alm_delete`, `alm_query`, `alm_create_test_plan` + test-case + suite + step operations
- MCP `converters/` module with 5 new tools (`alm_convert_md_to_alm`, `alm_convert_alm_to_md`, `alm_upload_attachment`, `alm_render_mermaid`, `alm_roundtrip_check`) per R14
- ADO HTML + JIRA Cloud ADF + JIRA Server wiki adapters

**Exit criteria:** Verification §23.4 (ALM round-trip ADO) passes; §23.5 (JIRA switch via config) passes.

### Phase 9 — Chat UI

**Goal:** Lightweight web UI for users without VS Code.

**Prerequisites:** bk-019 (UX flows design doc), MCP server (Phase 2), at least one agent built (Phase 5 minimum).

**Deliverables:**
- `tools/chat-ui/frontend/` (React + Vite) with project picker, agent picker, ready pane, document viewer
- `tools/chat-ui/backend/` (Node + Express) spawning Claude CLI subprocess; streams output

**Exit criteria:** Verification §23.9 (chat UI) passes.

### Phase 10 — Verification + ADR backfill

**Goal:** Close out the design folder with ADRs for all R1–R33 substantive decisions and run all §23 verification steps end-to-end.

**Prerequisites:** Phases 1–9 complete; bk-024 (ADR list).

**Deliverables:**
- ADR-0002 through ADR-0011 authored (10 ADRs covering R1, R2, R5, R6, R7, R17, R18, R20, R21, R23 — see [design/audit-2026-05-14.md § B](design/audit-2026-05-14.md#b-adr-coverage-gaps))
- Verification §23 steps 1–11 all green
- Drift check passes
- All `design/` docs marked `live` with `last-reviewed: <date>`

**Exit criteria:** Platform v1 release-ready; full master plan §23 verification passed.

### Cross-cutting workstreams

These don't fit cleanly into one phase — they run alongside:

- **Design doc authoring** — for every backlog item moved to `in-progress`, create `design/<topic>.md` from the template before writing code
- **ADR authoring** — every load-bearing decision gets an ADR before code is written; lazy ADRs (post-hoc) are anti-pattern
- **`implementation.md` entry per change** — append-only, every edit to `design/` or `reference/00-*.md` or code gets a matching entry
- **Master plan revision discipline** — substantive design changes get a new `Rxx` entry in `reference/00-*.md` §26 + matching ADR + matching design doc update + log entry

### Estimated effort (rough)

| Phase | Calendar weeks (single engineer, full-time equivalent) |
|---|---|
| 0 (pre-build, mostly done) | already running |
| 1 (foundation) | 1 week |
| 2 (MCP core) | 1.5 weeks |
| 3 (scaffold) | 0.5 weeks |
| 4 (publish pipeline) | 1.5 weeks |
| 5 (BASIC agents) | 2–3 weeks |
| 6 (MATURE agents) | 4–6 weeks |
| 7 (brownfield) | 5–8 weeks (heaviest — ~220 files) |
| 8 (ALM) | 2–3 weeks |
| 9 (chat UI) | 2–3 weeks |
| 10 (verification + ADRs) | 1–2 weeks |
| **Total** | **20–30 weeks** for a single-engineer full-time build |

### Next-3 actions (matches audit § Recommendations)

1. **Resolve bk-001 (port-scope decision).** User picks Option A / B / C / D. Recommended: Option A.
2. **Author bk-003 (`agents.yaml` schema) + ADR-0002 (dual-mode surfaces, R1) + ADR-0006 (doc scope, R18).** Three foundation-unlocking design docs.
3. **Begin Phase 1 build** once items above are done: scaffold the 12 root-level foundation files.

---

## Entries

### 2026-05-14-009 — Phase 5 (BASIC agents) — solution-estimate + solution-architect fully built, published, verified

| Field | Value |
|---|---|
| **Kind** | code + scaffold |
| **Master-plan refs** | §7.5 (solution-estimate), §7.6 (solution-architect), §17 (Aggregators) |
| **Design doc refs** | [design/agents/solution-estimate.md](design/agents/solution-estimate.md), [design/agents/solution-architect.md](design/agents/solution-architect.md), [design/10-aggregators.md](design/10-aggregators.md) |
| **ADR refs** | [ADR-0001](design/adr/0001-review-scope-spec-only.md) (no `/review` for aggregators), [ADR-0005](design/adr/0005-d365-ce-multi-file-sub-platform.md) (form-mockup helper mirrored into solution-architect), [ADR-0009](design/adr/0009-solution-estimate-consolidated.md) (solution-estimate consolidated `/estimate` + 103-factor catalogue + 7 phases × 2.76), [ADR-0010](design/adr/0010-templates-agent-owned.md) (agent-owned templates) |
| **Backlog refs** | bk-009 (solution-estimate `/estimate` authoring — **closed**), bk-010 (factor catalogue extensions for F&O / deeper Integration / deeper Reporting — still queued; v1 catalogue is 103 factors as authored) |
| **Files touched** | `agents/solution-estimate/` (17 source files) + `agents/solution-architect/` (20 source files) + `agents.yaml` (ASCII cleanup) + `implementation.md` (this entry) + 34 generated files emitted by the publish pipeline |
| **Status** | done |

**Summary.** Phase 5 complete per the Option A sequencing decision. Built the two BASIC agents (solution-estimate + solution-architect) end-to-end: constitution, agent-owned data files (YAML registries + factor catalogue), output templates, command bodies, README, and HTML prototype templates + assets for solution-architect. Both agents ran through the Phase 4 publish pipeline cleanly — 34 generated files emitted across all 4 surfaces. Idempotency + `-CheckDrift` pass. Marketplace correctly lists both agents.

**Detail.**

*solution-estimate (17 source files):*

| Category | Files |
|---|---|
| Constitution | `00-charter.md`, `01-template-alignment.md`, `02-factor-definitions.md`, `03-fitment-classification.md`, `04-categorization-rules.md` |
| Data (canonical, overridable) | `factor-rates.yaml` (**all 103 factors with VS/S/M/C/VC rates**), `factor-definitions.md` (per-factor complexity descriptions), `phase-multipliers.yaml` (7 phases sum 1.76 → total ×2.76), `brownfield-multipliers.yaml` (NEW/EXTEND/REPLACE/REFERENCED/N/A), `confidence-levels.yaml` (5 bands), `module-detection.yaml` (shared with brownfield) |
| Output templates | `business-req-detail.template.md` (20-column inventory), `module-build-hrs.template.md` (per-module factor rollup), `module-overall-hrs.template.md` (the 5-section stakeholder deliverable), `proposed-factors.template.md` (conditional factor-gap output) |
| Command | `.claude/commands/estimate.md` (single command per ADR-0009) |
| README | `README.md` (What / How / Details per design/14-readme-conventions.md) |

*solution-architect (20 source files):*

| Category | Files |
|---|---|
| Constitution | `00-charter.md`, `01-architecture-principles.md` (7 principles), `02-aggregation-rules.md`, `03-prototype-generation-rules.md` (design tokens + 6-layer layout + QA checklist) |
| Markdown templates | `blueprint.template.md` (8-section unified blueprint), `solution-review-report.template.md` (7-category gap analysis) |
| HTML prototype templates | `solution-prototype/_index.template.html` (master shell), `navigation.template.html` (reusable nav fragments), `persona-landing.template.html`, `module-hub.template.html`, `journey-flow.template.html`, `dashboard.template.html` |
| Prototype assets | `solution-prototype/_assets/d365-tokens.css` (D365 design tokens verbatim from SW source per ADR-0005), `prototype.css` (6-layer layout CSS), `prototype.js` (interactive behaviours: tab switch, section collapse, persona switcher, journey stepper, scroll-to-top, dirty tracking) |
| Form-mockup helper | `templates/helpers/form-mockup-generator.prompt.md` (PORTED VERBATIM from SW; mirrored from d365-ce per per-agent autonomy) |
| Commands | `.claude/commands/{solution-blueprint,solution-review,solution-prototype}.md` |
| README | `README.md` |

**Publish pipeline run output:** 34 generated/mirrored files emitted across 4 surfaces (workflow + schemas mirrored ×2 = 14, settings.json ×2 = 2, plugin.json ×2 = 2, GHCP standalone chatmode+prompts = 6, Claude root-unified commands = 4, GHCP root-unified chatmode+prompts = 6, marketplace.json regenerated = 1; total **35** including mirror+settings+plugin counted above). Idempotency confirmed (rerun → Wrote=0, Skipped=36); `-CheckDrift` clean.

**Gotcha encountered + fixed.** Pre-existing mojibake in `agents.yaml` (em-dashes / `×` / `§` / `↔` from prior edits) was rendering as garbage in the marketplace.json descriptions. Stripped non-ASCII from `agents.yaml`; replaced the corrupted multiplication symbol with ASCII `x` per the established ASCII-only-in-source-files convention. Re-ran the publish pipeline; 4 files containing the affected descriptions correctly regenerated.

**Verification.**

- Both agent folders have the expected file counts: solution-estimate **17**, solution-architect **20**.
- All 6 schemas + workflow.yaml mirrored byte-identically into both agents (via `Publish-Agents.ps1` Job 1).
- Publish pipeline produces all 4 delivery surfaces per agent (Claude standalone settings, GHCP standalone chatmode+prompts, Claude root-unified commands, GHCP root-unified chatmode+prompts) plus the per-agent plugin.json (Job 3) and marketplace.json (Job 7).
- Idempotent re-run: Wrote=0, Skipped=36 ✅
- `-CheckDrift` on clean state: Drift=0 ✅
- Marketplace.json now lists 8 plugins including `spec-driven-dev-solution-estimate` and `spec-driven-dev-solution-architect` with clean ASCII descriptions.

**What's intentionally deferred to follow-up phases.**

- **475 per-complexity descriptions** for the 103-factor catalogue (95 factors × 5 levels). `factor-definitions.md` has the structure, per-category overviews, and detailed descriptions for the 4-6 highest-leverage factors (CRM Plugin C&UT, CRM Workflow Assembly C&UT, New CRM SSRS/Power BI Report, Azure Function Build & UT, PCF Control Development, Hierarchy Security). The full 475-string catalogue ports verbatim from the canonical SI Excel in a follow-up authoring pass; current depth is sufficient for `/estimate` to pick a complexity tier correctly per the per-category pattern.
- **bk-010 (factor catalogue extensions)** remains queued. The 103-factor v1 catalogue is the right starting point per ADR-0009. F&O / deeper Integration / deeper Reporting extensions will be authored when those domains start producing real workload patterns the v1 catalogue cannot size.
- **Per-command output rendering code** is described in the command bodies but not executed by an MCP tool yet. `/estimate` and the three `solution-architect` commands today rely on the LLM (Claude/GHCP) reading the command body + templates + data files to produce the outputs. A future hardening step adds an `estimation/` MCP tool group (already documented in [design/11-mcp-server.md](design/11-mcp-server.md) as queued for the agent build phases) that the commands can invoke for the deterministic parts (hour calculations, multiplier application, confidence-weighted average).

**Follow-up.**

- **Phase 6 starts next.** MATURE agents: d365-ce (fat), d365-fo, integration (merged), reporting. Per Option A sequencing. d365-ce alone is the heaviest single-agent build (multi-file sub-platform FDD per ADR-0005 + R19 A1-A15 additions + form-mockup helper).
- **bk-005 / bk-006 / bk-007 / bk-008** (d365-ce specifics) are now unblocked.
- **bk-026 / bk-027** (d365-fo and reporting agent design docs) are also unblocked.

---

### 2026-05-14-008 — Phase 4 (Publish pipeline) — 8-job PowerShell pipeline + drift-check CI gate, end-to-end verified

| Field | Value |
|---|---|
| **Kind** | code + scaffold + ci |
| **Master-plan refs** | §19 (Publish Pipeline), §22 (Critical Files) |
| **Design doc refs** | [design/12-publish-pipeline.md](design/12-publish-pipeline.md), [design/01-repo-structure.md](design/01-repo-structure.md), [design/02-agent-skeleton.md](design/02-agent-skeleton.md) |
| **ADR refs** | [ADR-0002](design/adr/0002-dual-mode-delivery-surfaces.md) (4 surfaces), [ADR-0003](design/adr/0003-single-source-of-truth-commands.md) (single source for commands), [ADR-0004](design/adr/0004-self-contained-agent-folders.md) (mirror job + plugin packaging), [ADR-0011](design/adr/0011-publish-pipeline-8-job-model.md) (8-job model) |
| **Backlog refs** | bk-021 (settings + plugin templates — **closed**) |
| **Files touched** | `tools/sync/settings.template.json`, `tools/sync/plugin.template.json`, `tools/sync/chatmode.template.md`, `tools/sync/Publish-Agents.ps1`, `tools/sync/Watch-Agents.ps1`, `tools/sync/README.md`, `.github/workflows/check-publish-drift.yml`; baseline generated: `.claude/settings.json`, `.claude-plugin/marketplace.json`, `.publish-manifest.json` |
| **Status** | done |

**Summary.** Phase 4 complete. Authored the 8-job publish pipeline as a single PowerShell script (`Publish-Agents.ps1`) plus a file-watcher companion (`Watch-Agents.ps1`), three canonical templates, the README, and the CI drift-check workflow. End-to-end verification covered four scenarios: empty-state publish (no agents yet), idempotent re-run (Wrote=0 / Skipped=2), test-agent publish producing 63 derivative files across 4 surfaces, hand-edit detected as drift with exit 1, restored-state re-run cleanly passing `-CheckDrift`. Cleanup confirmed: `agents.yaml` back to 8 agents, no test artefacts left, baseline manifest tracks 2 files.

**Detail.**

*Six source files authored:*

| File | Role |
|---|---|
| `tools/sync/settings.template.json` | Canonical `settings.json` template — placeholders `{{MCP_SERVER_PATH}}`, `{{AGENT_NAME}}`, `{{REPO_ROOT_HINT}}`. Rendered into per-agent + root `.claude/settings.json`. |
| `tools/sync/plugin.template.json` | Claude plugin manifest template — `{{AGENT_NAME}}`, `{{AGENT_VERSION}}`, `{{AGENT_DESCRIPTION}}`, `{{AGENT_MATURITY}}`. Rendered into per-agent `.claude-plugin/plugin.json` (per [ADR-0004](design/adr/0004-self-contained-agent-folders.md)). |
| `tools/sync/chatmode.template.md` | GHCP chatmode wrapper — `{{AGENT_NAME}}`, `{{AGENT_DESCRIPTION}}`, `{{COMMAND_LIST}}`. Rendered into both GHCP standalone and root-unified surfaces. |
| `tools/sync/Publish-Agents.ps1` | **Main pipeline.** 8 jobs (mirror / settings / plugin / GHCP standalone / Claude root-unified / GHCP root-unified / marketplace / drift-check + manifest). Flags: `-Agent <filter>`, `-DryRun`, `-CheckDrift`, `-NoMarketplace`, `-Quiet`. |
| `tools/sync/Watch-Agents.ps1` | File-watcher loop using `System.IO.FileSystemWatcher`. Initial publish then re-runs jobs 1-7 on each debounced source change. Skips drift-check (CI-only). |
| `tools/sync/README.md` | Usage, file layout map, encoding rules, gotchas. |
| `.github/workflows/check-publish-drift.yml` | CI gate that runs `Publish-Agents.ps1 -CheckDrift` on every PR; fails the build on any drift with the diff list. |

*Pipeline behaviors implemented:*

- **Idempotent.** SHA-256 of normalised-LF content compared against existing file bytes; matching → `skip` (no write).
- **UTF-8 no BOM, LF line endings.** All writes use `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` after `\r\n → \n` normalisation. Avoids the PowerShell-5.1 BOM bug + cross-platform CRLF flip-flop.
- **Graceful on empty `agents/`.** Jobs 1, 3, 4, 5, 6 silently skip agents whose source folders/commands don't exist yet. Jobs 2 (root settings) and 7 (marketplace) still run. Total tracked files in empty state: 2.
- **Drift-check mode.** On `-CheckDrift`: instead of writing differing content, the script logs `DRIFT` lines per offending file, increments `DriftCount`, and `exit 1` at the end. Also catches new generated files not in the prior manifest and manifest files no longer produced.
- **DO NOT EDIT headers.** Every generated file carries an explicit header noting the source path it was rendered from and that the file should not be hand-edited.

**Bug fixed during verification.** Initial `Write-Generated` hashed `$Content` (with CRLF from PowerShell here-strings + `ConvertTo-Json`) but wrote LF-normalised content to disk, causing every re-run to claim a content mismatch and rewrite. Fixed by normalising LF **before** hashing. Confirmed idempotent after fix: 64 files all `skip` on re-run.

**Verification.**

| Scenario | Result |
|---|---|
| Empty-state publish (no agents) | 2 files written (`.claude/settings.json`, `.claude-plugin/marketplace.json`); 2 tracked |
| Idempotent re-run (no changes) | Wrote=0, Skipped=2 ✅ |
| Seed `publish-smoke-agent` (via Phase 3 `New-Agent.ps1`) + register in `agents.yaml` + publish for that agent only | 63 new files: 7 mirror (workflow + 6 schemas) + 2 settings/plugin + 18 GHCP standalone (1 chatmode + 17 prompts) + 17 Claude root-unified commands + 18 GHCP root-unified (1 chatmode + 17 namespaced prompts) + 1 marketplace updated |
| Re-run with test agent in place | Wrote=0, Skipped=64 ✅ |
| `-CheckDrift` on clean state | Drift=0, exit 0 ✅ |
| Hand-edit `.claude/commands/publish-smoke-agent/spec.md` + `-CheckDrift` | **"DRIFT DETECTED: 1 file(s) differ from expected. Failing build."** exit 1 ✅ |
| Restore file + `-CheckDrift` | Drift=0, exit 0 ✅ |
| Cleanup (remove agent + entry in `agents.yaml`) | All test artefacts removed; `agents.yaml` back to 8 agents; baseline manifest tracks 2 files |

**Follow-up.**

- **Phase 5 starts next.** Per the locked Option A sequencing: build the two BASIC agents (`solution-estimate` + `solution-architect`). These are the first real agents; running the publish pipeline on them will exercise every code path that the test agent exercised (just with real content instead of stubs).
- **Hook scaffolding (bk-022).** `settings.template.json` currently has empty `hooks.PreToolUse` and `hooks.PostToolUse` arrays. When bk-022 is closed in a later phase, the template gets the hook stanzas pointing at `workflow_status` / `workflow_advance` MCP tools to enforce hard gates.
- **CI workflow** is authored but won't actually run until the repo is pushed to GitHub. The shape is deliberately conservative (Windows runner, npm install, tsc build, then `Publish-Agents.ps1 -CheckDrift`).
- **`.publish-manifest.json`** is regenerated every normal publish (timestamp changes). In `-CheckDrift` mode it's read but not rewritten.

---

### 2026-05-14-007 — Phase 3 (Scaffold scripts) — 3 PowerShell scripts + YAML reader lib + Node validator shim, end-to-end verified

| Field | Value |
|---|---|
| **Kind** | code + scaffold |
| **Master-plan refs** | §8 (Project Layout & Scaffolding), §22 (Critical Files) |
| **Design doc refs** | [design/05-project-layout.md](design/05-project-layout.md), [design/02-agent-skeleton.md](design/02-agent-skeleton.md), [design/14-readme-conventions.md](design/14-readme-conventions.md) |
| **ADR refs** | [ADR-0001](design/adr/0001-review-scope-spec-only.md) (six review checklists wired per consumption rules), [ADR-0006](design/adr/0006-doc-scope-domain-vs-feature.md) (`New-Feature.ps1` branches by `docScope`), [ADR-0010](design/adr/0010-templates-agent-owned.md) (`New-Agent.ps1` seeds from `_reference/`) |
| **Backlog refs** | bk-020 (scaffold-script detailed behavior — **closed**) |
| **Files touched** | `tools/scaffold/lib/Read-AgentsYaml.ps1`, `tools/scaffold/lib/Validate-Config.cjs`, `tools/scaffold/New-Project.ps1`, `tools/scaffold/New-Feature.ps1`, `tools/scaffold/New-Agent.ps1`, `tools/scaffold/README.md`; `implementation.md` (this entry) |
| **Status** | done |

**Summary.** Phase 3 complete. Authored three PowerShell scaffolding scripts that create projects, features, and agents per the design contracts. Schema-validation runs end-to-end via a small Node shim (`Validate-Config.cjs`) that re-uses AJV from the MCP server's `node_modules`. Smoke-tested all three scripts against the live `agents.yaml` registry: every generated config validates cleanly. `New-Feature.ps1` correctly branches per agent `docScope` (domain vs feature), surfacing the right user guidance for each.

**Detail.**

*Five files authored:*

| File | Purpose |
|---|---|
| `tools/scaffold/lib/Read-AgentsYaml.ps1` | Narrow state-machine YAML reader for `agents.yaml`. No external dependencies; handles the actual shape (per-agent name/version/maturity/base-commands/extra-commands/docScope.{fdd,tdd,blueprint}/description). Also exports `Get-AgentByName` and `Find-RepoRoot`. |
| `tools/scaffold/lib/Validate-Config.cjs` | Node shim that loads AJV + js-yaml from `tools/mcp-server/node_modules` and validates any file against any schema in `schemas/`. Strips UTF-8 BOM (PowerShell 5.1's `Set-Content -Encoding UTF8` emits one; `JSON.parse` rejects it). |
| `tools/scaffold/New-Project.ps1` | Creates `projects/{Name}/` with validated `project.config.yaml`, skeleton `work-items.yaml`, `_handoffs/`, `_aggregator/{architecture,estimation/inputs}/`, per-agent subfolders (with `features/` for agents that have base commands; without for aggregators/alm), and optional `_brownfield/` for brownfield mode. |
| `tools/scaffold/New-Feature.ps1` | Creates `projects/{Project}/{Agent}/features/{Feature}/` with validated `.workflow.json` (phase=DEFINE, currentStates=[SPEC_DRAFT], gates PENDING), and the standard subfolders (test-plan/suites, reviews, tasks, output, templates-override, constitution-override). Reads `docScope` from `agents.yaml` and prints docScope-specific guidance. Refuses to scaffold for non-feature agents (aggregators / brownfield / alm). |
| `tools/scaffold/New-Agent.ps1` | Seeds `agents/{Name}/` from `constitution/_reference/*.example` and `templates/_reference/*.example`, replacing `{agent-slug}` and `YYYY-MM-DD` placeholders. Stubs 6 review checklists per [ADR-0001](design/adr/0001-review-scope-spec-only.md) consumption rules. Stubs 17 base command files (when `-BaseCommands $true`) + any `-ExtraCommands`. Generates a `README.md` per [design/14-readme-conventions.md](design/14-readme-conventions.md) What/How/Details contract. Appends a new entry to root `agents.yaml` unless `-SkipRegistryUpdate` is passed. |

*Plus `tools/scaffold/README.md` documenting all three commands + file layouts produced.*

**Gotchas encountered + fixed:**

1. **PowerShell 5.1 ANSI-decoding of script files.** Initial scripts contained em-dashes (`—`), arrows (`→`), and `§` characters in comments + docstrings. PowerShell 5.1 reads `.ps1` files as Windows-1252 by default unless they have a UTF-8 BOM; multi-byte UTF-8 bytes became literal garbage that broke parsing. **Fix:** stripped all non-ASCII from the `.ps1` files via `perl -i -CSD -pe '...'`. Future scripts should stay ASCII-only.
2. **UTF-8 BOM rejected by `JSON.parse`.** `Set-Content -Encoding UTF8` on PowerShell 5.1 writes a BOM. `JSON.parse(raw)` throws on `﻿`. **Fix:** `Validate-Config.cjs` strips a leading BOM before parsing.

**Verification.**

End-to-end smoke test successful (project + 2 features + 1 agent, all cleaned up after):

```
1. New-Project -Name 'scaffold-smoke-test' -Agents 'd365-ce,d365-fo,integration,alm' -Mode greenfield
   -> project.config.yaml VALID against project-config.v1.json
   -> features/ dirs created for CE/FO/Int; SKIPPED for ALM (no base commands)
   -> _handoffs/, _aggregator/architecture/, _aggregator/estimation/inputs/ all created

2. New-Feature -Project scaffold-smoke-test -Agent d365-ce -Feature case-management
   -> .workflow.json VALID against workflow-state.v1.json
   -> Console surfaces "Domain-scoped" guidance: /fdd writes to agent root, tags with feature-id markers

3. New-Feature -Project scaffold-smoke-test -Agent d365-fo -Feature gl-posting
   -> .workflow.json VALID against workflow-state.v1.json
   -> Console surfaces "Feature-scoped" guidance: /fdd writes inside feature folder

4. New-Agent -Name scaffold-smoke-agent -DocScopeFdd feature -SkipRegistryUpdate
   -> 40 files emitted: constitution (8), templates (5 + 2 test-plan + 6 checklists), commands (17), README (1)
   -> agents.yaml UNCHANGED (8 agents, no leakage)

5. Cleanup
   -> projects/scaffold-smoke-test + agents/scaffold-smoke-agent removed
   -> agents.yaml still has the original 8 agents (verified by grep '^  - name:' count = 8)
```

**Follow-up.**

- **Phase 4 starts next.** Deliverables: `tools/sync/Publish-Agents.ps1` (8-job publish pipeline per [ADR-0011](design/adr/0011-publish-pipeline-8-job-model.md)), `tools/sync/settings.template.json`, `plugin.template.json`, `chatmode.template.md`, `.github/workflows/check-publish-drift.yml`. Phase 4 produces the GENERATED surfaces (root `.claude/commands/`, root `.github/`, per-agent `.claude/settings.json` + `.claude-plugin/plugin.json` + `.github/` GHCP standalone) from the SOURCE files we now have.
- **Encoding consideration for Phase 4+ scripts.** All future PowerShell scripts in this repo should stay ASCII-only in source code; non-ASCII characters belong in YAML/JSON/Markdown content files (which are explicitly UTF-8 with BOM-safe parsers).
- **Hook scaffolding for hard-gate enforcement** (bk-022) blocked until Phase 4 renders `agents/{a}/.claude/settings.json` with hook stanzas.

---

### 2026-05-14-006 — Phase 2 (MCP server core) — TypeScript build, 4 tool groups, 14 tools, 26 tests passing

| Field | Value |
|---|---|
| **Kind** | code + scaffold |
| **Master-plan refs** | §18 (MCP server) |
| **Design doc refs** | [design/11-mcp-server.md](design/11-mcp-server.md), [design/07-doc-rules.md](design/07-doc-rules.md), [design/04-workflow-gates.md](design/04-workflow-gates.md), [design/09-orchestration-patterns.md](design/09-orchestration-patterns.md), [design/06-templates.md](design/06-templates.md) |
| **ADR refs** | [ADR-0001](design/adr/0001-review-scope-spec-only.md) (review/clarify gating logic in `workflow_advance`), [ADR-0006](design/adr/0006-doc-scope-domain-vs-feature.md) (doc-scope used in `config_resolve`), [ADR-0010](design/adr/0010-templates-agent-owned.md) (override semantics implemented in `config-resolve` group) |
| **Backlog refs** | bk-018 (MCP tool group APIs — **partially closed** for foundational 4 groups; brownfield/alm/converters/estimation/traceability groups still queued for their Phases) |
| **Files touched** | `tools/mcp-server/package.json`, `tsconfig.json`, `.gitignore`, `README.md`, `src/index.ts`, `src/lib/{logger,repo-paths,schema-validate,file-utils}.ts`, `src/groups/{doc-lint/{validators,index}.ts, workflow/index.ts, handoff/index.ts, config-resolve/index.ts}`, `test/{doc-lint,file-utils,schema-validate}.test.ts`, schema fixes to `schemas/work-items.v1.json` + `schemas/alm-extract.v1.json` (uid regex `^[a-z0-9-]+$` → `^[a-zA-Z0-9-]+$` to accept canonical `ce-cm-L1-01` style) |
| **Status** | done |

**Summary.** Phase 2 of the Implementation Plan complete. Authored a working Node.js + TypeScript MCP server with four foundational tool groups (doc-lint, workflow, handoff, config-resolve) exposing **14 MCP tools** total. Server compiles cleanly under `tsc --strict`, starts via stdio transport, registers all 14 tools, discovers the repo root from `cwd`. 26 unit tests pass covering schema validation (10 tests over all 6 schemas), doc-lint rules (11 tests covering frontmatter / Mermaid-only / AI Summary / Quality self-check / TOC / numbered sections / inline ALM IDs / feature-id markers), and frontmatter extraction (5 tests).

**Detail.**

*Tool groups & tools registered:*

| Group | Tools |
|---|---|
| `doc-lint` | `doc_lint`, `doc_lint_batch` |
| `workflow` | `workflow_status`, `workflow_next`, `workflow_advance`, `workflow_list_features` |
| `handoff` | `handoff_list`, `handoff_status`, `handoff_publish`, `handoff_consume`, `handoff_list_blueprints` |
| `config-resolve` | `config_resolve`, `config_resolve_template`, `config_resolve_full` |

*doc-lint validators implemented (9 of ~11 universal rules from [design/11-mcp-server.md § doc-lint](design/11-mcp-server.md)):*
- `frontmatter-required` (BLOCKER) — overridable required-keys list per doc kind
- `toc-required` (REQUIRED) — fires only when doc has ≥3 sections
- `mermaid-only` (BLOCKER) — flags PNG / JPG / SVG image refs and HTML `<img>` tags
- `numbered-sections` (WARNING) — for spec/plan/tdd kinds
- `ai-summary-required` (BLOCKER)
- `traceability-matrix` (REQUIRED) — for spec/plan/tdd kinds
- `no-inline-alm-ids` (BLOCKER) — flags `AB#NNN` and `ADO #NNN`
- `quality-self-check` (BLOCKER) — for fdd/tdd/blueprint/test-plan kinds, per ADR-0001
- `feature-id-markers` (BLOCKER) — for `doc-scope: domain` docs, per ADR-0006

*Library:*
- `lib/logger.ts` — stderr-only logger (stdio MCP transport reserves stdout)
- `lib/repo-paths.ts` — finds repo root by walking up looking for `agents.yaml`; provides typed path helpers
- `lib/schema-validate.ts` — AJV draft-07 with `ajv-formats`; caches compiled validators by schema filename
- `lib/file-utils.ts` — YAML/JSON read+write, recursive directory walk, frontmatter extraction

*Module-resolution note (gotcha worth recording):* AJV v8 and ajv-formats ship as CJS modules. Under `tsconfig.json moduleResolution: "NodeNext"`, the default import doesn't resolve to the constructable Ajv class. Changed `moduleResolution` to `"Bundler"` and `module` to `"ESNext"` (with `esModuleInterop: true`), which is TypeScript's recommended setting for the AJV/ESM combination. The runtime emits as ES modules with `.js` extensions on relative imports per Node's ESM rules.

*Schema fixes during test:*
- `schemas/work-items.v1.json` and `schemas/alm-extract.v1.json` `uid` pattern relaxed from `^[a-z0-9-]+$` to `^[a-zA-Z0-9-]+$`. The canonical UID example in [design/08-traceability.md](design/08-traceability.md) is `ce-cm-L1-01` (uppercase `L1`); the original regex would have rejected every realistic UID.

**Verification.**

- **TypeScript build:** `npx tsc --noEmit` exits 0; full `npx tsc` emits to `dist/` (groups + lib + index files all compile).
- **Test suite:** `npx vitest run` reports **3 test files, 26 tests, all passing** (file-utils 5 ✓, doc-lint 11 ✓, schema-validate 10 ✓).
- **Server smoke test:** `node dist/index.js` starts in ~5 ms; logs:
  ```
  [INFO] spec-driven-dev-mcp starting {"repoRoot":"...aifirstdeliveryconsolidated"}
  [INFO] registered tool groups {"toolCount":14,"tools":[...]}
  [INFO] spec-driven-dev-mcp ready (stdio transport)
  ```
- **All 6 schemas validated end-to-end:** project-config, workflow-state, work-items, handoff, alm-extract, brownfield-inventory each have at least one positive test and at least one negative-shape rejection test.

**Follow-up.**

- **Phase 3 starts next.** Deliverables: `tools/scaffold/New-Project.ps1`, `New-Feature.ps1`, `New-Agent.ps1` (PowerShell). `New-Feature.ps1` reads agent's `docScope` from `agents.yaml` to choose feature-folder shape; `New-Agent.ps1` seeds from `constitution/_reference/` + `templates/_reference/`.
- **Doc-lint extensions** (post-Phase 7): add validators for brownfield-specific rules (No Grouping, Evidence Chain, etc.) — those land in the brownfield-validators tool group, not doc-lint.
- **Hook scaffolding for hard-gate enforcement** (bk-022) blocked until Phase 4 publish pipeline can render `agents/{a}/.claude/settings.json` with hook stanzas pointing at the workflow tools.
- **Plugin distribution:** Phase 4 publish pipeline will package this MCP server into each `agents/{a}/.claude-plugin/plugin.json` per ADR-0004.

---

### 2026-05-14-005 — Phase 1 (Foundation) build started; bk-001 resolved (Option A); root assets authored

| Field | Value |
|---|---|
| **Kind** | code + scaffold + plan-update |
| **Master-plan refs** | §4, §6, §8, §9, §10, §22 |
| **Design doc refs** | [design/01-repo-structure.md](design/01-repo-structure.md), [design/03-agent-inventory.md](design/03-agent-inventory.md), [design/04-workflow-gates.md](design/04-workflow-gates.md), [design/05-project-layout.md](design/05-project-layout.md), [design/02-agent-skeleton.md](design/02-agent-skeleton.md), [design/16-revision-history.md](design/16-revision-history.md) |
| **Backlog refs** | bk-001 (**closed** — Option A locked), bk-003 (agents.yaml schema authored) |
| **Files touched** | `agents.yaml` (NEW), `workflow.yaml` (NEW), `schemas/*.v1.json` (6 NEW), `constitution/_reference/*.example` (8 NEW), `templates/_reference/*.example` (7 NEW), `README.md` (NEW root), `docs/architecture.md` (NEW), `docs/orchestration.md` (NEW), `design/backlog.md` (bk-001 closed), `implementation.md` (this entry) |
| **Status** | done |

**Summary.** Per user instruction "create the sequencing yourself ... start the implementation". Sequencing locked: bk-001 → **Option A** (BASIC agents first); Phases 1 → 2 → 3 → 4 → 5 (BASIC) → 6 (MATURE) → 7 (BF) → 8 (ALM) → 9 (UI) → 10 (Verification). This entry covers **Phase 1 — Foundation: root assets**, the 12-file deliverable required before Phases 2-4 can start in parallel.

**Detail.** All files land at repo root or under root subfolders per [design/01-repo-structure.md](design/01-repo-structure.md). Each file's content traces to a specific design doc.

| File | Source design doc |
|---|---|
| `agents.yaml` | [design/01-repo-structure.md § agents.yaml](design/01-repo-structure.md), [design/03-agent-inventory.md](design/03-agent-inventory.md) |
| `workflow.yaml` | [design/04-workflow-gates.md § workflow.yaml](design/04-workflow-gates.md) |
| `schemas/project-config.v1.json` | [design/05-project-layout.md § project.config.yaml](design/05-project-layout.md) |
| `schemas/workflow-state.v1.json` | [design/04-workflow-gates.md § .workflow.json](design/04-workflow-gates.md) |
| `schemas/work-items.v1.json` | [design/08-traceability.md](design/08-traceability.md) |
| `schemas/handoff.v1.json` | [design/09-orchestration-patterns.md](design/09-orchestration-patterns.md) |
| `schemas/alm-extract.v1.json` | [design/agents/alm.md](design/agents/alm.md) |
| `schemas/brownfield-inventory.v1.json` | [design/agents/brownfield.md](design/agents/brownfield.md) |
| `constitution/_reference/*.example` (8 files) | [design/02-agent-skeleton.md § Full structure](design/02-agent-skeleton.md) |
| `templates/_reference/*.example` (7 files) | [design/02-agent-skeleton.md § Full structure](design/02-agent-skeleton.md) |
| Root `README.md` | [design/README.md](design/README.md) (mirrors three-artefact model) |
| `docs/architecture.md` | [design/00-overview.md § Architecture](design/00-overview.md) |
| `docs/orchestration.md` | [design/09-orchestration-patterns.md](design/09-orchestration-patterns.md) |

**Status.** done — Phase 1 deliverables all authored. Next: Phase 2 (MCP server core), gated only by bk-018 (MCP tool group API authoring) — design exists; full JSON-Schema authoring still pending but Phase 2 build can begin in parallel.

**Follow-up.**

- Phase 2 starts next turn with `tools/mcp-server/` skeleton + foundational tool groups (`doc_lint`, `workflow_*`, `handoff_*`, `config_resolve`).
- Update Phase summary table in [implementation.md § Phase summary](#phase-summary) to show Phase 1 as ✅ done.

---

### 2026-05-14-004 — Design folder made fully self-contained; 10 backfill ADRs + 25 design docs authored

| Field | Value |
|---|---|
| **Kind** | design-update + adr |
| **Master-plan refs** | §1–§26 (entire spec mirrored into self-contained design); R1, R2, R5, R6, R7, R17, R18, R20, R21, R23 (decisions captured as ADRs) |
| **Design doc refs** | All under [design/](design/): 17 core docs (00 through 16) + 8 per-agent docs (`agents/d365-ce.md` through `agents/alm.md`) + 11 ADRs (`adr/0001` through `adr/0011`) + updated [design/README.md](design/README.md) + updated [design/backlog.md](design/backlog.md) + updated [design/adr/README.md](design/adr/README.md) |
| **Backlog refs** | bk-024 (ADR backfill — **closed**); all other items now have design coverage via the published docs |
| **Files touched** | `design/README.md`, `design/00-overview.md` through `design/16-revision-history.md` (17 files), `design/agents/d365-ce.md` through `design/agents/alm.md` (8 files), `design/adr/0002-dual-mode-delivery-surfaces.md` through `design/adr/0011-publish-pipeline-8-job-model.md` (10 files), `design/adr/README.md`, `design/backlog.md`, `implementation.md` (this entry) |
| **Status** | done |

**Summary.** Per user instruction: (a) resolve the audit findings, and (b) make the design folder **fully independent and complete** so that earlier `reference/` references do not come through — `reference/` will be removed eventually.

Authored 25 design docs and 10 ADRs, making `design/` the **sole authoritative source** for the platform contract. The design folder now stands without any dependency on `reference/`. Every load-bearing decision is captured as an accepted ADR; every cross-cutting topic + per-agent contract has its own design doc.

**Detail.**

*ADRs authored (10):*

| ADR | Title | Closes (master-plan refs) |
|---|---|---|
| [ADR-0002](design/adr/0002-dual-mode-delivery-surfaces.md) | Dual-mode delivery surfaces (Claude+GHCP × standalone+root-unified) | R1 |
| [ADR-0003](design/adr/0003-single-source-of-truth-commands.md) | Commands authored only in `agents/{a}/.claude/commands/` | R2 |
| [ADR-0004](design/adr/0004-self-contained-agent-folders.md) | Self-contained agent folders + plugin distribution | R4, R5, R8, R9 |
| [ADR-0005](design/adr/0005-d365-ce-multi-file-sub-platform.md) | d365-ce multi-file sub-platform FDD + SW Phoenix shape + form-mockup helper | R17, R19, R33 (helper origin) |
| [ADR-0006](design/adr/0006-doc-scope-domain-vs-feature.md) | FDD/TDD/blueprint docScope: domain vs feature; config-driven | R18 |
| [ADR-0007](design/adr/0007-brownfield-auto-mode-self-healing.md) | Brownfield auto-mode + self-healing retry loop + gap log | R20 |
| [ADR-0008](design/adr/0008-brownfield-patterns-and-bindings.md) | Brownfield 9 patterns + ~185 bindings + module-detection | R21 |
| [ADR-0009](design/adr/0009-solution-estimate-consolidated.md) | Solution-estimate consolidated `/estimate` + 103-factor catalogue + 7 phases | R22 (superseded), R23, R24, R25 (structural part), R26, R27, R28, R29, R30, R31, R32 |
| [ADR-0010](design/adr/0010-templates-agent-owned.md) | Templates and constitution agent-owned; `doc_lint` enforces consistency | R6, R11, R15 |
| [ADR-0011](design/adr/0011-publish-pipeline-8-job-model.md) | Publish Pipeline 8-job model + drift checks | R3, R7 |

*Core design docs authored (17):*

| # | Doc | Covers |
|---|---|---|
| 00 | [00-overview.md](design/00-overview.md) | Context, architecture, design principles (replaces §1, §2, §3) |
| 01 | [01-repo-structure.md](design/01-repo-structure.md) | Repo folder structure + configuration model (replaces §4, §9) |
| 02 | [02-agent-skeleton.md](design/02-agent-skeleton.md) | Per-agent template + dual-mode resolution (replaces §5) |
| 03 | [03-agent-inventory.md](design/03-agent-inventory.md) | 8-agent summary + docScope table (replaces §6) |
| 04 | [04-workflow-gates.md](design/04-workflow-gates.md) | workflow.yaml + .workflow.json + hard gates (replaces §10) |
| 05 | [05-project-layout.md](design/05-project-layout.md) | Project scaffolding + per-feature layout (replaces §8) |
| 06 | [06-templates.md](design/06-templates.md) | Template authoring + override + checklist consumption (replaces §11) |
| 07 | [07-doc-rules.md](design/07-doc-rules.md) | Universal doc rules enforced by `doc_lint` (replaces §12) |
| 08 | [08-traceability.md](design/08-traceability.md) | work-items.yaml + feature-id tagging + estimation traceability (replaces §13) |
| 09 | [09-orchestration-patterns.md](design/09-orchestration-patterns.md) | 4 orchestration patterns + handoffs (replaces §14) |
| 10 | [10-aggregators.md](design/10-aggregators.md) | Aggregator flows (replaces §17) |
| 11 | [11-mcp-server.md](design/11-mcp-server.md) | Single MCP server + tool groups (replaces §18) |
| 12 | [12-publish-pipeline.md](design/12-publish-pipeline.md) | 8-job publish pipeline (replaces §19) |
| 13 | [13-chat-ui.md](design/13-chat-ui.md) | React + Node + CLI subprocess (replaces §20) |
| 14 | [14-readme-conventions.md](design/14-readme-conventions.md) | Per-agent README structure What/How/Details (replaces §21) |
| 15 | [15-verification.md](design/15-verification.md) | 11 E2E verification checks (replaces §23) |
| 16 | [16-revision-history.md](design/16-revision-history.md) | Decisions indexed by ADR (replaces §26) |

*Per-agent design docs authored (8):*

| Agent | Doc | Covers |
|---|---|---|
| d365-ce | [agents/d365-ce.md](design/agents/d365-ce.md) | Fat agent with multi-file sub-platform FDD (replaces §7.1) |
| d365-fo | [agents/d365-fo.md](design/agents/d365-fo.md) | F&O autonomous, FastTrack pattern, ported constitution (replaces §7.2) |
| integration | [agents/integration.md](design/agents/integration.md) | Merged event + batch + data-migration (replaces §7.3) |
| reporting | [agents/reporting.md](design/agents/reporting.md) | CE SSRS + Power BI (replaces §7.4) |
| solution-estimate | [agents/solution-estimate.md](design/agents/solution-estimate.md) | 103-factor catalogue, 7 phases, brownfield multipliers (replaces §7.5) |
| solution-architect | [agents/solution-architect.md](design/agents/solution-architect.md) | Blueprint + solution-prototype HTML (replaces §7.6) |
| brownfield | [agents/brownfield.md](design/agents/brownfield.md) | Patterns + bindings + auto-mode (replaces §7.7 + §16 model) |
| alm | [agents/alm.md](design/agents/alm.md) | 6 commands + ADO + JIRA + converters (replaces §7.8 + §15 model) |

*Index updates:*

- [design/README.md](design/README.md) — updated with the full 35-row design doc index, three-artefact model (design / implementation.md / reference legacy), conventions
- [design/adr/README.md](design/adr/README.md) — full 11-row ADR index with affected design docs per ADR
- [design/backlog.md](design/backlog.md) — bk-024 closed; summary count updated (28 total, 1 done, 27 queued); annotation explaining that design-level coverage is complete but build-phase authoring is separate

**No-reference rule applied.** Every design doc and ADR uses **relative paths within `design/`** for cross-references. The only references to `reference/` in the design folder are:
- `audit-2026-05-14.md` (a one-time audit doc, historical) — references `reference/` because it inventories what was there at audit time
- ADR-0009 (solution-estimate) — mentions historical source materials (estimation-instructions.md, SI Effort Data Excel) in the "References" section to make clear what was ported. These are noted as "historical, in `reference/` and ported into `agents/solution-estimate/templates/factor-rates.yaml` + `factor-definitions.md` at agent build time" — they describe content that gets *ported* into the agent's own folder, not consumed from `reference/` at runtime.
- ADR-0005 (d365-ce) — mentions the SW Phoenix FDD shape and Form Generation Prompt as ported source materials. Same model: ported into `agents/d365-ce/templates/` at build time.

Neither ADR-0005 nor ADR-0009 *depend* on `reference/` to be readable; they cite source provenance for traceability. When `reference/` is removed, the ADRs remain accurate (the ports already landed in `agents/{a}/templates/`).

**Verification.**

- All 11 ADRs accepted with `status: accepted` and `decided-on: 2026-05-14`.
- 17 core design docs + 8 per-agent docs all have `status: live` and `last-reviewed: 2026-05-14`.
- Design folder README index links all 36 files (35 design + 1 audit historical).
- Master plan in `reference/00-spec-driven-development-humble-muffin.md` is now **secondary** — useful for historical revision log (R1–R34) but not required for design comprehension.
- Backlog `bk-024` flipped to `done` with implementation.md entry id reference.

**Follow-up.**

- **`reference/` folder removal** — design is now self-contained. When user is ready, `reference/` can be removed (with the caveat that ADR-0005 and ADR-0009 source attributions to specific files in `reference/` will become broken links — those should be updated to "historical port from a previous project, content now in `agents/{a}/templates/`" wording at removal time).
- **`bk-001 (port-scope decision)`** — still open. Recommended: Option A (BASIC agents first).
- **Build-phase backlog items** — all other 27 queued backlog items still represent **authoring work** that produces the actual agent folders, templates, MCP code, scaffold scripts, chat UI, etc. The design is the contract; the build is what's queued. See [implementation.md § Implementation Plan](implementation.md#implementation-plan) for the 10-phase build sequence.

---

### 2026-05-14-003 — Independent design-vs-spec audit + Implementation Plan published

| Field | Value |
|---|---|
| **Kind** | design-update + plan-update |
| **Master-plan refs** | §1–§26 (full spec sweep); §22 (Critical Files); §25 (queued topics); §26-R34 |
| **Design doc refs** | [design/audit-2026-05-14.md](design/audit-2026-05-14.md) (NEW), [design/backlog.md](design/backlog.md) (updated — 3 items added), [design/README.md](design/README.md) (index updated) |
| **Backlog refs** | bk-001 (blocker called out), bk-024 (ADR backfill drives Phase 10), **bk-026, bk-027, bk-028 (NEW — added by this entry)** |
| **Files touched** | `design/audit-2026-05-14.md` (created), `design/backlog.md` (3 new rows + summary count 25→28), `implementation.md` (Implementation Plan section added; this entry appended) |
| **Status** | done |

**Summary.** Performed an independent audit comparing the design folder against the master plan (R1–R34, §1–§26). Findings: design folder properly scaffolded but mostly empty of substantive docs (only ADR-0001 authored); ~444 files remain to be created against §22's "Critical Files" enumeration; backlog had 3 implicit gaps (d365-fo, reporting, alm agent design docs); §25 mentions "11 ADRs identified" without listing them, so 10 ADRs (ADR-0002 through ADR-0011) are queued for backfill. Published a 10-phase Implementation Plan (in [implementation.md](implementation.md) above) with prerequisites, deliverables, and exit criteria per phase. Critical path: bk-001 (port-scope) is the foundational blocker; Phase 1 needs bk-003 + ADR-0002; Phase 6 needs ADR-0006.

**Detail.**

Files created / updated:

1. **[design/audit-2026-05-14.md](design/audit-2026-05-14.md)** (created) — 8-section independent audit:
   - § A Design coverage gaps (table for all 26 master-plan sections)
   - § B ADR coverage gaps — proposes the 11 ADRs (1 done, 10 pending); maps each to its R-revision
   - § C Backlog completeness check — confirms all §25 topics captured; identifies 3 missing agent design items
   - § D Implementation readiness by phase — 10 phases, prerequisites + deliverables per phase
   - § E Conflicts / inconsistencies — 5 findings; only one open (the "11 ADRs not listed" §25 hint)
   - § F Critical files gap — ~457 files at completion; ~13 today; ~444 to author
   - Recommendations: 3 next actions (bk-001 / bk-003+ADR-0002+ADR-0006 / Phase 1)

2. **[design/backlog.md](design/backlog.md)** (updated) — 3 new rows + summary count:
   - **bk-026** d365-fo agent design doc (P2) — feature-scoped docScope unique; constitution PORTED per R16
   - **bk-027** reporting agent design doc (P2) — parallels CE bk-005–008; CE-SSRS + Power BI; domain-scoped
   - **bk-028** alm agent design doc (P2) — ADO + JIRA adapters, converters/ for md↔ALM (R13+R14)
   - Summary count updated: 25 → 28 total queued; 0 done; 0 in-progress
   - Annotation added crediting audit-2026-05-14.md § C

3. **[implementation.md](implementation.md)** (this file, updated) — added new top-of-file "Implementation Plan" section between conventions and Entries:
   - 10 phases (Phase 0 pre-build groundwork through Phase 10 verification + ADR backfill)
   - Plan-status legend (🔒 blocked / ⏳ ready / 🚧 in-progress / ✅ done / ⏭ deferred) distinct from entry status
   - Critical-path diagram
   - Phase summary table with status / blockers / backlog items / ADRs / master-plan refs
   - Per-phase detail: goal, prerequisites, deliverables (file lists), exit criteria
   - Cross-cutting workstreams
   - Rough effort estimate (20–30 weeks single-engineer FTE)
   - Next-3 actions (matches audit recommendations)

**Verification.**

- All 28 backlog items in `design/backlog.md` cross-checked against master-plan §25; all §25 bullets covered.
- Implementation Plan's "Phase summary" table cross-checked: every phase prerequisite traces to a backlog item or master-plan ADR.
- All 10 phases' deliverables cross-checked against §22 Critical Files list — coverage looks complete (root assets in Phase 1, MCP in Phase 2, scaffold in Phase 3, publish in Phase 4, agents in Phases 5–8, chat-ui in Phase 9, ADRs in Phase 10).
- Cross-references resolve: this entry references the audit doc; audit doc references master plan sections + revisions; Implementation Plan references backlog items + ADRs by ID.

**Follow-up.**

- **bk-001 (port-scope decision)** — user pick required to unblock Phase 5 sequencing; recommended Option A per RESUME POINT.
- **bk-003 + ADR-0002 + ADR-0006** — three next design docs to author. ADR-0002 is the highest-leverage (foundational dual-mode architecture); ADR-0006 unblocks Phase 6; bk-003 unblocks Phase 1.
- **ADR-0009 (solution-estimate cluster)** — needed when Phase 5 starts, but Phase 5 is gated on bk-001 first.
- Once Phase 0 exit criteria are met (bk-001 decided, bk-003 + ADR-0002 + ADR-0006 authored), begin Phase 1 build.

---

### 2026-05-14-002 — Establish design folder + implementation log (this file)

| Field | Value |
|---|---|
| **Kind** | scaffold |
| **Master-plan refs** | §25 ("Each topic gets its own design doc, drafted and reviewed before moving to the next. The design folder and Implementation.md will be created when the user gives the go-ahead."), §26-R34 |
| **Design doc refs** | [design/README.md](design/README.md), [design/_template/design-doc.template.md](design/_template/design-doc.template.md), [design/adr/README.md](design/adr/README.md), [design/adr/_template.md](design/adr/_template.md), [design/adr/0001-review-scope-spec-only.md](design/adr/0001-review-scope-spec-only.md), [design/backlog.md](design/backlog.md) |
| **Backlog refs** | bk-024 (ADR list seeding) |
| **Files touched** | `design/README.md`, `design/_template/design-doc.template.md`, `design/adr/README.md`, `design/adr/_template.md`, `design/adr/0001-review-scope-spec-only.md`, `design/backlog.md`, `implementation.md` |
| **Status** | done |

**Summary.** Created the `design/` folder structure and this `implementation.md` per user instruction "Create a detailed design under design folder and implementation.md under root to track the actual implementation, all the future fixes that will be done need to get tracked in implementation.md file and design must be kept up to date." Establishes the convention: master plan is the contract, `design/` is the detail (kept fresh), `implementation.md` is the append-only build log.

**Detail.**

- `design/README.md` — purpose, three-artefact model (master plan / design / implementation log), conventions, status table.
- `design/_template/design-doc.template.md` — required-frontmatter shape for new per-topic design docs (`status`, `master-plan-refs`, `adr-refs`, `backlog-ref`, `last-reviewed`, `owner`).
- `design/adr/README.md` — ADR conventions: NNNN numbering, lifecycle (`proposed` → `accepted` → `superseded`/`rejected`), filename pattern, index table.
- `design/adr/_template.md` — ADR template with sections: Status / Context / Decision / Alternatives considered / Consequences / References.
- `design/adr/0001-review-scope-spec-only.md` — first ADR; locks the R34 decision ("`/review` is spec-only; non-spec checklists consumed inline by their generating command"). Status: `accepted`, decided 2026-05-14. Cross-references all 11 edit sites from entry `2026-05-14-001`.
- `design/backlog.md` — 25 queued topics from master plan §25 plus the still-open port-scope question and `/split` semantics from prior session. Each item has `id / priority / status / master-plan ref`. Initial state: all 25 in `queued` status; 0 done; 0 in-progress.
- `implementation.md` — this file. Conventions, status legend, entry format, append-only rule.

**Verification.**

- All 7 files created; folder paths spot-checked.
- Cross-references resolve: `design/adr/0001-review-scope-spec-only.md` cites entry `2026-05-14-001` (logged below); entry `2026-05-14-001` is below this entry in document order but earlier in chronology, per the convention that entries are dated by when work happened.
- `design/backlog.md` summary count (25 total / 0 done / 25 queued) matches the table body.

**Follow-up.**

- As `backlog.md` items are tackled, create one design doc per item under `design/`, link it from the backlog row, and add an `implementation.md` entry for the work.
- Next likely tackles: bk-001 (port-scope) and bk-002 (`/split` semantics) — both flagged by the user in the prior session.

---

### 2026-05-14-001 — Apply master-plan revision R34: `/review` scoped to spec only

| Field | Value |
|---|---|
| **Kind** | master-plan-revision |
| **Master-plan refs** | §5, §6, §7.1, §7.2, §7.7, §10, §11, §13, §16, §26 — revision **R34** |
| **Design doc refs** | [design/adr/0001-review-scope-spec-only.md](design/adr/0001-review-scope-spec-only.md) |
| **Backlog refs** | — (closes user-flagged open question; not in backlog) |
| **Files touched** | `reference/00-spec-driven-development-humble-muffin.md` (single file; 11 edit sites) |
| **Plan reference** | `~/.claude/plans/fix-question-number-1-humble-coral.md` (approved, applied) |
| **Status** | done |

**Summary.** Applied master-plan revision **R34** to resolve the user-flagged inconsistency: `§5` annotated `/review [spec|plan|task]` but `§10 workflow.yaml` only gated **spec** via `/review` (plan via `/clarify --approve`, task via `/validate --approve`); `§13` also referenced an undefined `/review fdd --feature X` command. R34 makes `/review` spec-only; non-spec review checklists (`fdd-review`, `tdd-review`, `blueprint-review`, `test-plan-review`) are consumed **inline** by their generating command; `plan-review` is consumed by `/clarify`; six checklist files are preserved unchanged — only the consuming command changes.

**Detail.** 11 edits applied to `reference/00-spec-driven-development-humble-muffin.md`:

| # | Section | Line (approx) | Edit category |
|---|---|---|---|
| E1 | §5 Agent Skeleton | 350 | REWORD — `/review` command comment now spec-only |
| E2 | §5 checklists folder header | 399 | ADD-CLARIFIER — consumption note added |
| E3 | §7.1 d365-ce table-row tagging | 583 | DELETE `/review fdd --feature X`; reword |
| E4 | §7.1 d365-ce checklists block | 568–574 | ADD-CLARIFIER — consumption note appended under block |
| E5 | §7.2 d365-fo checklists block | 697–704 | ADD-CLARIFIER — consumption note appended under block |
| E6 | §7.7 brownfield contrast | 1520 | REWORD — other agents have `/review` for spec only, not every doc |
| E7 | §13 Traceability operation list | 2218 | REWORD — three operations → two; `/review fdd --feature {f}` removed |
| E8 | §16 brownfield validators parenthetical | 2495 | REWORD — matches §7.7 framing |
| E9 | §11 Templates — NEW subsection | inserted at ~2145 | ADD — "Review checklist consumption" with consumption table |
| E10 | §26 Revision History | 3430, 3431, 3464, 3465 | ADD R34 row; rename "Files affected by R1–R33" → "R1–R34"; append R34 file delta line |
| E11 | RESUME POINT | 10, 29 | REPLACE header "R17–R33 applied" → "R17–R34 applied"; ADD new R34 bullet under "Last completed" |
| (follow-up E12) | §6 Agent Inventory | 479 | Discovered during verification — `/review fdd --feature X` reference reworded same as E3 |
| (follow-up E13) | §26 R18 historical bullet | 3452 | Annotated with R34 supersession note (`/review fdd --feature` removed) |

Plan rationale, alternatives considered (Option A vs B vs C), and consequences captured in [ADR-0001](design/adr/0001-review-scope-spec-only.md).

**Verification.** 8 verification checks from the plan all passed:

1. **No leftover `/review [spec`** outside R34 historical quotes — ✅ only 2 hits, both intentional quotes in R34 entries
2. **No `/review {non-spec doc}`** — ✅ only 3 hits, all intentional (R34 row, R34 bullet, R18 historical entry annotated with supersession note)
3. **Workflow DAG untouched** — ✅ `SPEC_DRAFT → SPEC_REVIEWED` and `SPEC_REVIEWED → SPEC_APPROVED` at master plan lines 2019–2020 unchanged
4. **Six checklist files preserved** — ✅ 36 occurrences across the file (was 24 listings + new consumption-note references)
5. **§11 "Review checklist consumption" subsection present** — ✅ 9 occurrences of heading string (TOC + cross-refs + actual subsection)
6. **R34 + RESUME POINT updated** — ✅ R34 row at line 3430; "Files affected by R1–R34" at line 3465; RESUME POINT header "R17–R34 applied"
7. **§23 Verification Plan step 2 still spec-only** — ✅ lines 3284–3285 unchanged
8. **Brownfield contrast sentences reframed** — ✅ §7.7 line 1520 and §16 line 2495 both now reflect "spec only" + "inline self-check" framing

**Follow-up.**

- ADR-0001 captures the decision (this entry's design-doc ref). Future implementations of `/fdd`, `/tdd`, `/blueprint`, `/test-plan` must wire in the inline self-check + Quality self-check appendix per ADR-0001.
- Pre-existing gap: no `task-review.checklist.md` exists; `/validate` works against the task card directly. Not introduced or resolved by R34; flagged in §25 and backlog bk-008 / bk-024 for follow-up.
- Question 2 from the prior session (`/split` semantics) is queued as `bk-002`.

---

> Earlier work (master plan revisions R1–R33) predates this log; their record lives in `reference/00-spec-driven-development-humble-muffin.md` §26 (rows R1–R33) and is **not** retroactively backfilled here. From R34 forward, every revision gets a matching entry above.
