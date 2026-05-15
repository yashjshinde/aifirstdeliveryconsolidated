---
title: Templates — authoring, override semantics, checklist consumption
status: live
adr-refs: [ADR-0010, ADR-0001, ADR-0005]
last-reviewed: 2026-05-14
owner: design
---

# Templates — Document Shape

> Each agent owns all of its templates outright. There is no shared `templates/_base/` at runtime. Cross-agent consistency comes from **rules enforced by code in MCP `doc_lint`** ([ADR-0010](adr/0010-templates-agent-owned.md)), not from sharing template content.

## Where templates live

- **SOURCE (agent-owned, no layering):** `agents/{a}/templates/{type}.template.md` — the only template read at runtime
- **SCAFFOLDING ONLY (not runtime):** `templates/_reference/{type}.template.md.example` — starter copied by `New-Agent.ps1`; never read after seed

## Required doc shape (enforced by `doc_lint`)

Every template must satisfy:

- YAML frontmatter with required keys: `feature-id`, `agent`, `phase`, `schema-version`
- Auto-generated TOC at top of every multi-section doc
- Mermaid for all diagrams (no PNG, no draw.io)
- Numbered sections (FR-NN, TS-NN, TC-NN) for cross-reference
- AI Summary section at top of every generated doc
- Traceability matrix at bottom (for spec / plan / tdd)

The *shape* (frontmatter, TOC, AI Summary, traceability) is universal; the *content* is platform-specific.

## Project-level override (file-level, no merging)

Per [01-repo-structure.md](01-repo-structure.md):

```
1. projects/{p}/{a}/templates-override/{type}.template.md     ← if present
2. agents/{a}/templates/{type}.template.md                     ← agent default
```

First match wins. No merging. No Handlebars. No conditionals. No flags. If a project wants a different TDD format, it drops one file in `templates-override/`.

If neither layer exists, the command fails with a clear error rather than silently emitting an empty doc.

### Drift detection

`doc_lint` warns when an override's frontmatter `based-on-template-version` falls behind the agent's current template version. Customizers can refresh by copying the agent's default into the override or by running `/customize-template <type>` (queued in [backlog.md](backlog.md) as `bk-023`).

## Standard templates per agent

| Template | Purpose |
|---|---|
| `spec.template.md` | Feature specification |
| `plan.template.md` | Work breakdown |
| `fdd.template.md` | Functional Design Document (platform-shaped — e.g., CE FastTrack, F&O FastTrack) |
| `tdd.template.md` | Technical Design Document |
| `blueprint.template.md` | Architecture blueprint |
| `test-plan/index.template.md` + `test-plan/suite.template.md` | Multi-doc test plan (see "Test plan" below) |
| `task.template.md` | L4 task card |
| `review-report.template.md` | Review report shape |
| `checklists/{spec,plan,fdd,tdd,blueprint,test-plan}-review.checklist.md` | Six checklists; consumed per [ADR-0001](adr/0001-review-scope-spec-only.md) |

## Spec template sections

1. Header (TOC auto-rendered)
2. **AI Summary** (why this spec exists — required)
3. Business context
4. Personas (numbered)
5. Functional requirements (numbered FR-NN, with sub-bullets)
6. Non-functional requirements (per NFR shape from agent's `02-nfr.md` constitution)
7. Multilingual considerations (per `project.config.yaml`)
8. Out-of-scope explicitly
9. Open questions
10. Cross-feature impact (read from existing specs in project)
11. Traceability matrix (FR-NN → persona, NFR, related-features)
12. Frontmatter: `{ feature-id, agent, source: fresh|alm, alm-level-locks: [...] }`

## Plan template sections

1. Header + TOC
2. Work breakdown by L1/L2/L3/L4 (terminology from `project.config.yaml alm.hierarchy`)
3. Per-L4: high-level technical approach (detailed in /task later)
4. Inventory: what artefacts (plugins, JS, ADF pipelines, etc.) — pulled from agent's `customization-inventory.md`
5. OOB-first decision log (for each requirement: OOB, config, or customization, and why)
6. Risks
7. Dependencies on other agents (handoff manifests referenced)
8. Traceability (L4 → FR-NN)

## TDD template — platform-shaped per agent

- **D365 CE:** FastTrack TDD format (per [agents/d365-ce.md](agents/d365-ce.md), multi-file sub-platform pack)
- **D365 F&O:** F&O TDD format (X++ heavy, ★ markers, Object-ID prefixes)
- **Integration:** Azure Architecture Center patterns
- **Reporting:** dataset + report layout sections

## FDD specifics — d365-ce uses multi-file sub-platform assembly

Per [ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md) and [agents/d365-ce.md](agents/d365-ce.md), the CE FDD is composed from **multi-file sub-platform source templates** (model-driven / canvas / power-pages / pcf / power-automate) assembled into a single output using the SW Phoenix shape as the master skeleton.

The companion **Form Mockup Generator** helper produces pixel-accurate interactive D365 form HTML mockups (one per entity) at `projects/{p}/d365-ce/fdd-assets/mockups/`. Linked from §4.5 of the FDD markdown.

This pattern is d365-ce-specific. Other agents may adopt similar sub-platform splits but it is not required.

## Test plan — multi-document (one command, folder output)

`/test-plan` is a single command that produces a **folder**, not a single file. A feature can easily have hundreds of test cases; one monolithic markdown is unmanageable.

```
projects/{p}/{a}/{f}/test-plan/
├── index.md                    # top-level: strategy, suite list, coverage summary, traceability matrix
├── suites/
│   ├── 01-{suite-slug}.md     # one file per suite — ALL test cases for that suite (no auto sub-split)
│   ├── 02-{suite-slug}.md
│   └── NN-{suite-slug}.md
├── coverage-report.md          # AUTO-GENERATED by doc_lint; not hand-edited
└── traceability.yaml           # machine-readable: TC → FR → ALM ID
```

### `index.md` template

- Frontmatter: `{ feature-id, agent, alm-target, schema-version }`
- AI Summary (why this plan)
- Test strategy (scope in/out, approach)
- Suite index table: `# | slug | description | TC count | priority`
- Coverage summary by category (functional, negative mandatory; security/multilingual/perf/etc. optional per `project.config.yaml`)
- Traceability matrix (FR-NN → suites covering → TC count)
- ALM target info

### `suites/NN-{slug}.md` template

One file per suite, holds all its test cases regardless of count. Each TC has:

- **Stable ID:** `S01-TC-001` — suite prefix `S{NN}` + `TC-{NNN}`
- Title, description, preconditions, test data
- Numbered steps with **Action + Expected + Data**
- Priority (1-4 from `project.config.yaml priorityMap`), test type, automated Y/N, owner, tags
- Traceability `TC → FR-NN`

ADO/JIRA-export-ready fields on every TC: priority, area path, iteration, owner, automated, test type, tags.

### `coverage-report.md` — auto-generated, read-only

Generated by **MCP `doc_lint`** on every `/test-plan` run.

- Coverage matrix: each FR-NN → list of TCs covering it (by category)
- Coverage gaps (FRs with zero TCs) — fail `doc_lint` unless `--waive-coverage` was used at generation

Hand-editing fails the drift check.

### `traceability.yaml` — wire format for ALM sync

Schema: `{ planId?, suites: [{ suiteId?, slug, testCases: [{ tcId, frRefs: [], almId? }] }] }`.

- `/alm push tests` writes back `planId`, `suiteId`, `almId` after pushing to ADO/JIRA
- `/alm pull tests` reads to detect new/changed TCs for delta updates

### Mandatory test category coverage

- **Mandatory** (always required, enforced by `doc_lint`): Functional + Negative
- **Optional** (per `project.config.yaml`): Security, Multilingual, Performance, Accessibility, E2E, Regression

Override: `/test-plan --waive-coverage` (logged loudly; surfaces in `/status`).

## Review checklist consumption (per [ADR-0001](adr/0001-review-scope-spec-only.md))

Six checklists live in `agents/{a}/templates/checklists/`. **Not all invoked the same way:**

| Checklist | Consumed by | When |
|---|---|---|
| `spec-review.checklist.md` | `/review` | Spec-approval gate (SPEC_REVIEWED → SPEC_APPROVED) |
| `plan-review.checklist.md` | `/clarify` | Plan-approval gate (PLAN_DRAFT → PLAN_CLARIFIED) |
| `fdd-review.checklist.md` | `/fdd` (inline self-check) | At generation time, applied to the produced FDD before write |
| `tdd-review.checklist.md` | `/tdd` (inline self-check) | Same — applied at generation time |
| `blueprint-review.checklist.md` | `/blueprint` (inline self-check) | Same |
| `test-plan-review.checklist.md` | `/test-plan` (inline self-check) | Same; complements `coverage-report.md` |

Only `/review` and `/clarify` write a standalone report file (`reviews/spec-review.md`, `reviews/clarify-report.md`). Inline self-checks fold their classified findings (BLOCKER / REQUIRED / WARNING) into a **Quality self-check** appendix at the bottom of the generated doc. `doc_lint` enforces presence of that appendix and fails writes on BLOCKER findings.

Task validation continues to use `/validate` against the task card; there is no `task-review.checklist.md` (pre-existing gap, flagged in [backlog.md](backlog.md)).

For domain-scoped docs (CE / Integration / Reporting per [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md)), the inline self-check evaluates only the **feature-delta** — rows and sections tagged with the current `feature-id` (see [08-traceability.md](08-traceability.md)).

## References

- ADRs: [ADR-0010](adr/0010-templates-agent-owned.md), [ADR-0001](adr/0001-review-scope-spec-only.md), [ADR-0005](adr/0005-d365-ce-multi-file-sub-platform.md), [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md)
- Cross-references: [02-agent-skeleton.md](02-agent-skeleton.md), [07-doc-rules.md](07-doc-rules.md), [11-mcp-server.md](11-mcp-server.md) (`doc_lint`), [08-traceability.md](08-traceability.md)
- Backlog: `bk-023` (`/customize-template` helper)
