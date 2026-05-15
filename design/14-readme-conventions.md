---
title: Per-Agent README Conventions — What / How / Details
status: live
adr-refs: []
last-reviewed: 2026-05-14
owner: design
---

# Per-Agent README Conventions

> Every agent's `README.md` follows the same three-section structure for skim-readability and consistency. This is the only SOURCE file at the agent root — everything else is in `commands/`, `constitution/`, `templates/`, or generated.

## The three-section structure

### `What`

One paragraph describing the agent's scope, its outputs, and one sentence about how it relates to other agents (especially for handoff-heavy agents like CE → integration).

Length: 3–6 sentences. No lists.

### `How`

Bullet list of the most common workflows:

- Standard 17-command flow (`/spec → /review → /plan → /clarify → /task → /validate → /implement → /document → /alm-extract`) — or whatever subset the agent uses
- Agent-specific extras (e.g., d365-fo's `/lcs-deploy`)
- Aggregator-specific workflows (e.g., solution-architect's `/solution-blueprint`, `/solution-review`, `/solution-prototype`)
- Brownfield-mode behavior (when applicable)

Each bullet is one line. Sub-bullets only when a step requires multi-step explanation.

### `Details`

Links into the agent's constitution, templates, schemas, and the relevant design folder docs. Format:

- **Constitution:** links to each `constitution/0X-*.md` with a one-line description
- **Templates:** the template tree (a short ASCII tree or bulleted listing)
- **Design docs:** links to `design/agents/{a}.md` (this agent's design doc) plus any cross-cutting design docs that touch this agent
- **ADRs:** links to ADRs that specifically affect this agent

## Example skeleton

```markdown
# d365-ce — fat agent for D365 Customer Engagement + Power Platform

## What

The fat agent. Owns model-driven CE, Canvas apps, Power Pages portal, PCF controls, all
Power Automate, plus plugins / JS web resources / business rules / BPF / classic workflows /
BPM. Domain-scoped FDD / TDD / blueprint. Hands off to the integration agent for Azure
Function fallbacks and cross-system flows.

## How

- `/spec` → `/review` → `/plan` → `/clarify` → `/task` → `/validate` → `/implement` → `/document` → `/alm-extract`
- Multi-file FDD: assembled from sub-platform packs (model-driven / canvas / pages / pcf / power-automate) into a single domain output
- Form mockups: `/fdd` invokes the form-mockup-generator helper for each entity → HTML at `projects/{p}/d365-ce/fdd-assets/mockups/`
- Per-feature delta review: `/fdd --feature {f}` re-runs inline self-check on just that feature's tagged sections + rows

## Details

**Constitution:**
- [00-charter.md](constitution/00-charter.md) — agent scope and boundaries
- [01-model-driven-standards.md](constitution/01-model-driven-standards.md) — entities, forms, plugins, JS, BPF, workflows
- [02-canvas-app-standards.md](constitution/02-canvas-app-standards.md)
- [03-power-pages-standards.md](constitution/03-power-pages-standards.md)
- [04-pcf-standards.md](constitution/04-pcf-standards.md)
- [05-power-automate-standards.md](constitution/05-power-automate-standards.md)
- [06-publisher-and-solution.md](constitution/06-publisher-and-solution.md)
- [07-testing.md](constitution/07-testing.md)
- [08-multilingual.md](constitution/08-multilingual.md)

**Templates:**
```
templates/
├── fdd/{_index, model-driven, canvas, power-pages, pcf, power-automate}.template.md
├── fdd-helpers/form-mockup-generator.prompt.md
├── tdd/...
├── blueprint.template.md
├── test-plan/{index, suite}.template.md
├── spec.template.md
├── plan.template.md
├── review-report.template.md
└── checklists/{spec,plan,fdd,tdd,blueprint,test-plan}-review.checklist.md
```

**Design docs:**
- [Agent design — design/agents/d365-ce.md](../../design/agents/d365-ce.md)
- [Repo structure — design/01-repo-structure.md](../../design/01-repo-structure.md)
- [Workflow & gates — design/04-workflow-gates.md](../../design/04-workflow-gates.md)
- [Templates — design/06-templates.md](../../design/06-templates.md)

**ADRs:**
- [ADR-0005 — d365-ce multi-file sub-platform](../../design/adr/0005-d365-ce-multi-file-sub-platform.md)
- [ADR-0006 — docScope domain vs feature](../../design/adr/0006-doc-scope-domain-vs-feature.md)
- [ADR-0001 — /review spec-only](../../design/adr/0001-review-scope-spec-only.md)
```

## Why this format

- **Scannable.** Three sections, fixed names, predictable headings — a reader unfamiliar with the agent finds what they need in seconds.
- **Onboarding-friendly.** New contributors read `What` to orient, `How` to know what commands to try, `Details` to dig in.
- **Stays in sync.** The links into `constitution/`, `templates/`, and design docs make it obvious when a structural change requires a README update.

## Generation note

Per [12-publish-pipeline.md](12-publish-pipeline.md), the README is **SOURCE** (authored, not generated). The publish pipeline does not regenerate it. Authors maintain it as design changes land.

## References

- Cross-references: [02-agent-skeleton.md](02-agent-skeleton.md), [12-publish-pipeline.md](12-publish-pipeline.md)
