# brownfield

> Standalone reverse-engineering agent for existing D365 / Power Platform solutions. **Only agent without `/review`** — operates auto-mode with self-healing validator retry + gap log as the single review artefact (per [ADR-0007](../../design/adr/0007-brownfield-auto-mode-self-healing.md)). Pattern + binding architecture: 9 reusable patterns + ~185 bindings (per [ADR-0008](../../design/adr/0008-brownfield-patterns-and-bindings.md)).

## What

The brownfield agent enumerates and documents an existing solution at scale. It walks `_brownfield/input/` for solution exports / deployable packages / ARM templates / PBIX files / Power Apps source / Power Pages exports, emits `inventory.json` enumerating every artefact across CE / FO / Integration / Reporting / Power Apps / Power Pages / Custom Pages, then renders per-artifact docs from the 9 patterns + ~185 bindings, plus 5 project-level synthesis docs (component-inventory / functional-overview / integration-topology / solution-blueprint / technical-overview). The retry-and-gap-log loop ensures every artefact is either documented + validated OR captured in `gap-log.json` with a typed reason — never silently dropped.

This agent does NOT design new features (`d365-ce` / `d365-fo` / `integration` / `reporting`), produce unified cross-agent architecture (`solution-architect` consumes the brownfield blueprint), estimate effort (`solution-estimate` consumes the inventory + multipliers), or push to ADO/JIRA (`alm` consumes gap-log blockers as candidate work items).

## How

- **Full auto pipeline** — `/prepare` -> `/generate` (= `/scan` -> `/document` -> `/fdd` -> `/tdd` -> `/blueprint` -> `/index` -> coverage report + gap log + `/handoff`). End-to-end on a typical D365 solution: hours, not days.
- **Partial run** — useful while iterating on bindings or validators: `/scan` only, or `/document --platform d365-ce --artifact-type plugin --instance MyPlugin`.
- **Handoff to downstream** — `/handoff` publishes `_brownfield/{inventory.json, gap-log.json, coverage-report.md, impact-map.json}` so domain agents can run `/impact` against it during feature planning when `project.config.yaml mode: brownfield`.
- **Adding a new artefact type** — author a new `templates/bindings/{platform}/{artifact-type}.binding.yaml` (~30 lines) wiring source paths + extractors + cross-refs + validators + outputPath. No new template required unless a genuinely new shape family emerges.

## Details

- **Constitution** *(agent-owned per [ADR-0010](../../design/adr/0010-templates-agent-owned.md))*:
  - [constitution/00-charter.md](constitution/00-charter.md)
  - [constitution/01-architectural-principles.md](constitution/01-architectural-principles.md) (Evidence Over Assumption + 5 principles)
  - [constitution/02-documentation-standards.md](constitution/02-documentation-standards.md) (No Grouping rule)
  - [constitution/03-quality-rules.md](constitution/03-quality-rules.md) (10 validators with self-heal actions)
  - [constitution/04-input-file-types-base.md](constitution/04-input-file-types-base.md)
  - Per-platform: [platforms/d365-ce.md](constitution/platforms/d365-ce.md), [platforms/d365-fo.md](constitution/platforms/d365-fo.md), [platforms/integration.md](constitution/platforms/integration.md), [platforms/reporting.md](constitution/platforms/reporting.md), [platforms/power-platform.md](constitution/platforms/power-platform.md)

- **Templates** *(agent-owned)*:
  - 9 patterns: [templates/patterns/](templates/patterns/) — schema-asset / code-asset / config-asset / process-asset / ui-asset / security-asset / integration-asset / container-asset / catalog-asset
  - ~185 bindings (sample authored; full set in `bk-012`): [templates/bindings/d365-ce/](templates/bindings/d365-ce/) (8 sample), [d365-fo/](templates/bindings/d365-fo/) (3 sample), [integration/](templates/bindings/integration/) (3 sample), [reporting/](templates/bindings/reporting/) (3 sample)
  - 5 synthesis: [templates/synthesis/](templates/synthesis/) — component-inventory / functional-overview / integration-topology / solution-blueprint / technical-overview
  - 7 scan templates: [templates/scan/](templates/scan/) — per-platform extraction walks
  - [templates/module-detection.yaml](templates/module-detection.yaml) — module detection rules (shared with solution-estimate)

- **Commands** (8, replacing the base 17): [.claude/commands/](.claude/commands/) — `/prepare`, `/scan`, `/document`, `/fdd`, `/tdd`, `/blueprint`, `/generate`, `/index`, `/handoff`

- **Schemas consumed**:
  - [schemas/brownfield-inventory.v1.json](../../schemas/brownfield-inventory.v1.json) (output of `/scan`)
  - [schemas/brownfield-gap-log.v1.json](../../schemas/brownfield-gap-log.v1.json) (output of `/generate`)
  - [schemas/handoff.v1.json](../../schemas/handoff.v1.json) (output of `/handoff`)

- **MCP tool groups consumed** (queued — see `bk-014` / `bk-016`):
  - `brownfield-engine/` — binding-loader, pattern-renderer, module-detector, extractor, cross-ref, coverage-tracker, pipeline, synthesis-runner
  - `brownfield_validators/` — 10 deterministic validators with self-heal actions + anonymised CI test corpus

- **docScope**: per-artefact (not domain or feature). No `docScope` keys in `agents.yaml`.

- **Design doc**: [design/agents/brownfield.md](../../design/agents/brownfield.md)
- **Related ADRs**: [ADR-0007](../../design/adr/0007-brownfield-auto-mode-self-healing.md), [ADR-0008](../../design/adr/0008-brownfield-patterns-and-bindings.md), [ADR-0001](../../design/adr/0001-review-scope-spec-only.md), [ADR-0010](../../design/adr/0010-templates-agent-owned.md)

## What this agent does NOT do

- Does NOT skip artefacts silently. Every artefact in inventory is documented, gap-logged, or module-gated-skipped — `validate_inventory_coverage` enforces this.
- Does NOT paraphrase verbatim source content (SQL, plugin Execute body, X++ method body, Power Fx formula). `validate_ssrs_sql` / `validate_plugin_logic` / `validate_evidence_chain` enforce verbatim quotation where validators require evidence.
- Does NOT author per-doc human review. `/review` is the missing command (per ADR-0007). The retry-and-gap-log loop is the quality gate; the reviewer reads `gap-log.md` instead.
- Does NOT consume project.config.yaml `mode: greenfield` — when the project is greenfield, this agent is unused (and the domain agents read `_brownfield/inventory.json` only when present).

## Backlog this agent's content unblocks

- **bk-011** (9 pattern templates) — **closed** with this Phase 7 build
- **bk-013** (module-detection.yaml) — **closed**
- **bk-015** (scan templates with full artifact taxonomy) — **closed** for the 7 platforms; per-binding scan details ride along with `bk-012`
- **bk-017** (doc command output formats) — **closed** for the 8 commands authored
- **bk-012** (~185 bindings authoring) — **partial**: 18 sample bindings authored as exemplars; the remaining ~167 bindings are queued for follow-on authoring (each is a ~30-line YAML, authored against real source samples from the CI test corpus). Adding new bindings is the dominant work in `bk-012`.
- **bk-014** (brownfield-engine MCP code) — queued. Design-level guidance complete in [design/agents/brownfield.md § brownfield-engine](../../design/agents/brownfield.md) and per-command execution flows. Coding is a substantial follow-on effort.
- **bk-016** (10 validators + CI test corpus) — queued. Each validator's contract is specified in [constitution/03-quality-rules.md](constitution/03-quality-rules.md) and [ADR-0007](../../design/adr/0007-brownfield-auto-mode-self-healing.md); the implementation + test corpus authoring follows.

## Operating model recap

```
/prepare (pre-flight)
     |
     v
/scan -> inventory.json
     |
     v
/document -> per-artifact docs + gap-log entries
     |   (binding-driven; 9 patterns; module-gated; retry up to 3; gap-log on exhaustion)
     v
/fdd /tdd /blueprint -> synthesis docs (5 of them)
     |
     v
/index -> 00-index.md
     |
     v
/handoff -> publishes _brownfield/* for downstream domain agents

Reviewer reads: gap-log.md + coverage-report.md.
```
