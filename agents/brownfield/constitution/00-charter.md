---
agent: brownfield
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# brownfield — Charter (Standalone Reverse-Engineering Agent)

## Purpose

Reverse-engineer and document an **existing** D365 / Power Platform solution. Operates auto-mode (no per-doc `/review` — see [ADR-0007](../../../design/adr/0007-brownfield-auto-mode-self-healing.md)) at the volume real legacy systems demand: hundreds of plugins, dozens of flows, dozens of entities, hundreds of JS files.

This is the only agent without `/review` for any artefact. Quality enforcement is **machine-deterministic** via validators in `tools/mcp-server/groups/brownfield_validators/`, with a structured `gap-log.json` as the **single artefact the reviewer reads** (not hundreds of generated docs).

## In scope

- Solution-level scan: enumerate every artifact across CE / F&O / Integration / Reporting / Power Apps / Power Pages / Custom Pages
- Per-artifact documentation rendered from the **9 reusable patterns** + **~185 bindings** (per [ADR-0008](../../../design/adr/0008-brownfield-patterns-and-bindings.md))
- Synthesis: 5 project-level roll-up docs (component-inventory, functional-overview, integration-topology, solution-blueprint, technical-overview)
- Coverage report: every artifact is documented, gap-logged, or module-gated-skipped
- Module detection: silent-skip uninstalled modules (per [`module-detection.yaml`](../templates/module-detection.yaml))

## Out of scope

- Greenfield / feature-driven authoring (handled by `d365-ce`, `d365-fo`, `integration`, `reporting`)
- Effort estimation (handled by `solution-estimate`; brownfield outputs the inventory it consumes)
- ALM round-trip (handled by `alm`)
- Cross-agent unified architecture (handled by `solution-architect`)

## Operating model

### Auto-mode

No `/review` command. `/generate` is the auto pipeline that runs end-to-end. Validators are **machine code** in MCP `brownfield_validators/`:

```
generate_doc(scope, artifact):
  doc = run_template(scope, artifact)
  for attempt in 1..3:
    issues = run_validators(doc, scope)
    if not issues: write(doc); return
    doc = re_attempt_with_focused_prompt(doc, issues)
  log_gap(artifact, residual_issues)
  write(doc with KNOWN_GAP markers)
```

### Pattern + binding architecture

- **9 patterns** (`templates/patterns/*.template.md`) — reusable doc shapes
- **~185 bindings** (`templates/bindings/{platform}/{artifact}.binding.yaml`) — wire each artifact type to a pattern + extractors + cross-refs + validators + output path + optional module gate

### Coverage guarantee

Every artifact in `inventory.json` is **one of**:
1. (a) **Documented** at the depth its binding validators require AND passes them
2. (b) Has a **typed entry** in `gap-log.json`
3. (c) Belongs to a binding whose `requires:` module is **not installed** (silent-skip is correct)

**No artifact is silently dropped.**

## Commands (8 — replaces base 17)

| Command | Purpose |
|---|---|
| `/prepare` | Validate inputs in `_brownfield/input/`; check required source files |
| `/scan` | Build `inventory.json` per platform (uses scan templates) |
| `/document` | Render per-artifact docs from inventory using bindings (heavy step) |
| `/fdd` | Synthesise functional overview |
| `/tdd` | Synthesise technical overview |
| `/blueprint` | Synthesise solution blueprint |
| `/generate` | Full auto pipeline: `/scan` → `/document` → `/fdd`/`/tdd`/`/blueprint` → synthesis + coverage + gap-log |
| `/index` | Generate `docs-generated/00-index.md` master navigation |
| `/handoff` | Publish `_brownfield/{inventory.json, impact-map.json, gap-log.json, coverage-report.md}` so domain agents can consume |

(`/handoff` makes the count effectively 9 — the design doc lists it after the 8 core commands.)

## Constitution layout (10 files)

```
constitution/
├── 00-charter.md                       (this file)
├── 01-architectural-principles.md      Evidence Over Assumption + flagging conventions
├── 02-documentation-standards.md       No Grouping rule (machine-enforced)
├── 03-quality-rules.md                 Zero-tolerance gate (machine-enforced)
├── 04-input-file-types-base.md         Platform-agnostic input rules
└── platforms/
    ├── d365-ce.md                      CE-specific input file types + analysis rules
    ├── d365-fo.md                      AOT XML, deployable packages, X++ extension catalog
    ├── integration.md                  Azure-side: Functions, Logic Apps, ADF, Service Bus, APIM
    ├── reporting.md                    Power BI, SSRS, dataflows
    └── power-platform.md               Canvas, Power Pages, PCF, Custom Pages, Power Automate Desktop
```

## docScope

Brownfield is **per-artefact** (not domain or feature). Outputs accumulate under `projects/{p}/_brownfield/docs-generated/` per `outputPath` declared in each binding. No `docScope` keys in `agents.yaml`.

## Project-level config absorbed from `project.config.yaml`

| Key | Used for |
|---|---|
| `mode: brownfield` | Activates this agent; tells domain agents to consume `_brownfield/inventory.json` via MCP |
| `brownfield.platforms` | Which platforms to scan: `[d365-ce, d365-fo, integration, reporting, power-apps, power-pages, custom-pages]` |
| `brownfield.retry-limit` | Max validator-retry attempts per doc (default 3, per ADR-0007) |
| `brownfield.test-corpus` | Path to anonymised solution for CI verification |

## Customisation inventory

The agent does NOT produce CE / F&O / Integration / Reporting artefacts. It consumes them and emits documentation:

- `inventory.json` (full enumeration)
- `coverage-report.md` (documentation status per artifact)
- `gap-log.{json,md}` (typed gaps)
- Per-artifact docs in the `docs-generated/` tree (per binding `outputPath`)
- 5 synthesis docs (project-level roll-ups)

## Boundaries with adjacent agents

| Boundary | Owned by |
|---|---|
| Reverse-engineering of existing solutions | brownfield (this agent) |
| Greenfield CE / Canvas / Pages / PCF authoring | d365-ce |
| Greenfield F&O authoring | d365-fo |
| Greenfield Azure-side integration | integration |
| Greenfield reporting authoring | reporting |
| Cross-agent unified blueprint over the existing system | solution-architect (consumes brownfield outputs) |
| Effort estimate for the existing system | solution-estimate (consumes brownfield inventory + multipliers) |

## Design references

- Agent design doc: [design/agents/brownfield.md](../../../design/agents/brownfield.md)
- Governing ADRs:
  - [ADR-0007 — Auto-mode + self-healing retry + gap log](../../../design/adr/0007-brownfield-auto-mode-self-healing.md)
  - [ADR-0008 — 9 patterns + ~185 bindings + module-detection](../../../design/adr/0008-brownfield-patterns-and-bindings.md)
  - [ADR-0001 — Review scope spec-only](../../../design/adr/0001-review-scope-spec-only.md) (brownfield's auto-mode is the explicit exception)
  - [ADR-0010 — Templates agent-owned](../../../design/adr/0010-templates-agent-owned.md)
