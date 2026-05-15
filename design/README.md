# Design — Spec-Driven Development Consolidated Platform

> **The authoritative design** for the spec-driven development consolidated platform. Every load-bearing decision, folder structure, agent contract, schema, and workflow rule lives here. **This folder is self-contained** — readers do not need any other folder in the repo (including `reference/`, which is historical and will be removed) to understand or build the platform.

---

## How the three artefacts relate

```
design/                                     ← AUTHORITATIVE DESIGN (this folder; self-contained)
   │   00-overview          02-agent-skeleton
   │   01-repo-structure    03-agent-inventory      ... and so on
   │   adr/0001..0011       agents/d365-ce.md ... agents/alm.md
   │
   │  decisions drive
   ▼
implementation.md  (root)                   ← BUILD LOG (append-only; tracks every fix and build action)

reference/   (legacy, will be removed)      ← HISTORICAL master plan + ported source materials
```

| Artefact | Role | Mutability |
|---|---|---|
| **`design/` (this folder)** | The contract. Per-topic design docs + ADRs + backlog. Each doc carries the substance needed to build that topic; no doc requires reading another folder. | **Kept up to date.** Edits land in place. Substantive design changes get a new ADR + a corresponding `implementation.md` entry. |
| **[../implementation.md](../implementation.md)** | Append-only changelog. Every edit to `design/` or code change in the repo gets one entry with cross-references. Holds the forward-looking Implementation Plan as well. | **Append-only** for entries. The plan section is revisable. |
| **`reference/`** *(legacy)* | Historical: the original master plan (revisions R1–R34) and ported source bundles (predecessor repo, SW project, Dynamics365AISolution, Excel factor catalogues). | **Frozen.** Will be removed once `design/` migration is verified complete. No new content should be authored here. |

### Three-step rule for every change

1. **Decide → ADR.** Any load-bearing change (new architectural decision, schema change, workflow modification) gets an ADR in `adr/` first. ADRs are immutable once accepted; superseded ADRs link forward to their successor.
2. **Document → design doc.** Update the relevant per-topic design doc (or author a new one). Bump its `last-reviewed` date.
3. **Log → implementation.md.** Append an entry describing what changed, what ADR(s) and design doc(s) were touched, and (if applicable) the code/scaffold action taken.

---

## Folder layout

```
design/
├── README.md                       # this file
├── _template/
│   └── design-doc.template.md      # template for new per-topic design docs
├── 00-overview.md                  # platform context, architecture, principles
├── 01-repo-structure.md            # repo folder layout + configuration model
├── 02-agent-skeleton.md            # per-agent template, dual-mode resolution
├── 03-agent-inventory.md           # 8-agent inventory + docScope assignments
├── 04-workflow-gates.md            # workflow.yaml DAG + .workflow.json + hard gates
├── 05-project-layout.md            # projects/{p}/ structure + scaffolding
├── 06-templates.md                 # template authoring + override semantics + checklist consumption
├── 07-doc-rules.md                 # universal documentation rules (Mermaid, frontmatter, TOC, etc.)
├── 08-traceability.md              # work-items.yaml + feature-id tagging + estimation traceability
├── 09-orchestration-patterns.md    # 4 patterns + handoff manifests + /next discovery
├── 10-aggregators.md               # solution-architect + solution-estimate aggregation flows
├── 11-mcp-server.md                # single MCP server + tool groups + schemas
├── 12-publish-pipeline.md          # 8-job pipeline + drift checks + Claude/GHCP rendering
├── 13-chat-ui.md                   # React + Node + CLI subprocess
├── 14-readme-conventions.md        # per-agent README structure (What / How / Details)
├── 15-verification.md              # E2E verification harness + per-phase checks
├── 16-revision-history.md          # locked design decisions, indexed by ADR
├── agents/
│   ├── d365-ce.md                  # fat agent: model-driven + canvas + pages + PCF + Power Automate
│   ├── d365-fo.md                  # F&O autonomous (X++, AOT, DMF, batch, ER, FastTrack patterns)
│   ├── integration.md              # merged event-driven + batch + data-migration
│   ├── reporting.md                # CE-SSRS + Power BI (CE and BYOD-exposed F&O data)
│   ├── solution-estimate.md        # 103-factor catalogue, 8-value Fitment, 7 phases
│   ├── solution-architect.md       # blueprint + solution-prototype (HTML mockups across agents)
│   ├── brownfield.md               # pattern + binding architecture, auto-mode, ~140+ artifact taxonomy
│   └── alm.md                      # 6 verbs over ADO + JIRA, bidirectional converters
├── adr/
│   ├── README.md                   # ADR index + conventions
│   ├── _template.md                # ADR template
│   ├── 0001-review-scope-spec-only.md
│   ├── 0002-dual-mode-delivery-surfaces.md
│   ├── 0003-single-source-of-truth-commands.md
│   ├── 0004-self-contained-agent-folders.md
│   ├── 0005-d365-ce-multi-file-sub-platform.md
│   ├── 0006-doc-scope-domain-vs-feature.md
│   ├── 0007-brownfield-auto-mode-self-healing.md
│   ├── 0008-brownfield-patterns-and-bindings.md
│   ├── 0009-solution-estimate-consolidated.md
│   ├── 0010-templates-agent-owned.md
│   └── 0011-publish-pipeline-8-job-model.md
├── backlog.md                      # queued topics with status + design-doc links
└── audit-2026-05-14.md             # one-time independent audit (historical reference)
```

---

## Design doc index

| # | Doc | Status | Topic | Last touched |
|---|---|---|---|---|
| — | [README.md](README.md) | live | This file | 2026-05-14 |
| — | [_template/design-doc.template.md](_template/design-doc.template.md) | live | Authoring template | 2026-05-14 |
| **00** | [00-overview.md](00-overview.md) | live | Context, architecture, design principles | 2026-05-14 |
| **01** | [01-repo-structure.md](01-repo-structure.md) | live | Repo folder structure + configuration model | 2026-05-14 |
| **02** | [02-agent-skeleton.md](02-agent-skeleton.md) | live | Per-agent template, dual-mode resolution | 2026-05-14 |
| **03** | [03-agent-inventory.md](03-agent-inventory.md) | live | 8 agents + docScope table | 2026-05-14 |
| **04** | [04-workflow-gates.md](04-workflow-gates.md) | live | workflow.yaml + .workflow.json + hard gates | 2026-05-14 |
| **05** | [05-project-layout.md](05-project-layout.md) | live | Project scaffolding + per-feature layout | 2026-05-14 |
| **06** | [06-templates.md](06-templates.md) | live | Template authoring + override + checklist consumption | 2026-05-14 |
| **07** | [07-doc-rules.md](07-doc-rules.md) | live | Universal doc rules enforced by `doc_lint` | 2026-05-14 |
| **08** | [08-traceability.md](08-traceability.md) | live | work-items.yaml + feature-id tagging | 2026-05-14 |
| **09** | [09-orchestration-patterns.md](09-orchestration-patterns.md) | live | 4 orchestration patterns + handoffs | 2026-05-14 |
| **10** | [10-aggregators.md](10-aggregators.md) | live | Aggregator flows | 2026-05-14 |
| **11** | [11-mcp-server.md](11-mcp-server.md) | live | Single MCP server + tool groups | 2026-05-14 |
| **12** | [12-publish-pipeline.md](12-publish-pipeline.md) | live | 8-job publish pipeline | 2026-05-14 |
| **13** | [13-chat-ui.md](13-chat-ui.md) | live | Chat UI architecture | 2026-05-14 |
| **14** | [14-readme-conventions.md](14-readme-conventions.md) | live | Per-agent README structure | 2026-05-14 |
| **15** | [15-verification.md](15-verification.md) | live | E2E verification harness | 2026-05-14 |
| **16** | [16-revision-history.md](16-revision-history.md) | live | Decision history indexed by ADR | 2026-05-14 |
| **A1** | [agents/d365-ce.md](agents/d365-ce.md) | live | d365-ce (fat) agent design | 2026-05-14 |
| **A2** | [agents/d365-fo.md](agents/d365-fo.md) | live | d365-fo agent design | 2026-05-14 |
| **A3** | [agents/integration.md](agents/integration.md) | live | integration (merged) agent design | 2026-05-14 |
| **A4** | [agents/reporting.md](agents/reporting.md) | live | reporting agent design | 2026-05-14 |
| **A5** | [agents/solution-estimate.md](agents/solution-estimate.md) | live | solution-estimate agent design | 2026-05-14 |
| **A6** | [agents/solution-architect.md](agents/solution-architect.md) | live | solution-architect agent design | 2026-05-14 |
| **A7** | [agents/brownfield.md](agents/brownfield.md) | live | brownfield agent design | 2026-05-14 |
| **A8** | [agents/alm.md](agents/alm.md) | live | alm agent design | 2026-05-14 |
| **ADR-0001** | [adr/0001-review-scope-spec-only.md](adr/0001-review-scope-spec-only.md) | accepted | `/review` spec-only | 2026-05-14 |
| **ADR-0002** | [adr/0002-dual-mode-delivery-surfaces.md](adr/0002-dual-mode-delivery-surfaces.md) | accepted | Four delivery surfaces | 2026-05-14 |
| **ADR-0003** | [adr/0003-single-source-of-truth-commands.md](adr/0003-single-source-of-truth-commands.md) | accepted | Commands authored in Claude-native location only | 2026-05-14 |
| **ADR-0004** | [adr/0004-self-contained-agent-folders.md](adr/0004-self-contained-agent-folders.md) | accepted | Self-contained agent folders + plugin distribution | 2026-05-14 |
| **ADR-0005** | [adr/0005-d365-ce-multi-file-sub-platform.md](adr/0005-d365-ce-multi-file-sub-platform.md) | accepted | d365-ce multi-file sub-platform + SW Phoenix shape | 2026-05-14 |
| **ADR-0006** | [adr/0006-doc-scope-domain-vs-feature.md](adr/0006-doc-scope-domain-vs-feature.md) | accepted | docScope domain vs feature | 2026-05-14 |
| **ADR-0007** | [adr/0007-brownfield-auto-mode-self-healing.md](adr/0007-brownfield-auto-mode-self-healing.md) | accepted | Brownfield auto-mode | 2026-05-14 |
| **ADR-0008** | [adr/0008-brownfield-patterns-and-bindings.md](adr/0008-brownfield-patterns-and-bindings.md) | accepted | Brownfield patterns + bindings | 2026-05-14 |
| **ADR-0009** | [adr/0009-solution-estimate-consolidated.md](adr/0009-solution-estimate-consolidated.md) | accepted | Solution-estimate consolidated `/estimate` | 2026-05-14 |
| **ADR-0010** | [adr/0010-templates-agent-owned.md](adr/0010-templates-agent-owned.md) | accepted | Templates agent-owned; doc_lint enforces consistency | 2026-05-14 |
| **ADR-0011** | [adr/0011-publish-pipeline-8-job-model.md](adr/0011-publish-pipeline-8-job-model.md) | accepted | Publish pipeline 8 jobs | 2026-05-14 |
| — | [backlog.md](backlog.md) | live | Queued topics | 2026-05-14 |
| — | [audit-2026-05-14.md](audit-2026-05-14.md) | live | One-time audit (historical) | 2026-05-14 |

**Statuses:**
- **live** — current source of truth
- **draft** — in flight; do not consume yet
- **accepted** *(ADRs only)* — decision locked; doc immutable
- **superseded** *(ADRs only)* — replaced by a later ADR

---

## Conventions

1. **Frontmatter required** on every design doc:
   ```yaml
   ---
   title: <short title>
   status: live | draft | superseded
   adr-refs: [ADR-0001]
   last-reviewed: 2026-05-14
   owner: design
   ---
   ```
2. **Markdown + Mermaid only.** No PNGs, no draw.io, no proprietary diagram formats.
3. **Cross-link within `design/`** with relative paths. Do **not** link to `reference/` from any design doc — that folder will be removed.
4. **No silent edits.** Every edit to a design doc → matching entry in `implementation.md`.
5. **ADRs are immutable once accepted.** If a decision changes, write a new ADR that supersedes the old one.
6. **Backlog is the queue.** When tackling a queued topic, move it to `in-progress`, create or update the relevant design doc, and update the backlog row when done.

---

## Where to look next

- **Roadmap.** [../implementation.md § Implementation Plan](../implementation.md) — 10-phase build sequence with prerequisites and exit criteria per phase.
- **Decision rationale.** [adr/README.md](adr/README.md) — index of all 11 accepted ADRs.
- **What's queued.** [backlog.md](backlog.md) — 28 items with status, priority, and links to the design doc each tackles.
- **History.** [16-revision-history.md](16-revision-history.md) — the full design-decision log indexed by ADR (the source-of-truth for what was decided when, replacing the legacy R-revision log).
