---
title: Traceability — work-items.yaml, feature-id tagging, estimation traceability
status: live
adr-refs: [ADR-0006, ADR-0009]
last-reviewed: 2026-05-14
owner: design
---

# Traceability

> Single source of truth for ALM linkage per project lives in `work-items.yaml`, partitioned by agent + feature. Domain-scoped docs add a second mechanism: `feature-id` tagging inside the doc itself so per-feature operations work without parsing the whole document.

## `work-items.yaml` (schema `work-items.v1.json`)

One file per project, partitioned by agent. Single ALM source of truth.

```yaml
schemaVersion: "1.0"
project: acme-d365
agents:
  d365-ce:
    features:
      case-management:
        L1:
          - uid: ce-cm-L1-01
            title: "Case Management Implementation"
            alm-type: Epic
            alm-id: 12345
            section-refs: []
        L2:
          - uid: ce-cm-L2-01
            parent: ce-cm-L1-01
            title: "Case Creation"
            alm-type: Feature
            alm-id: 12346
            section-refs: [FR-01, FR-02]
        L3:
          - uid: ce-cm-L3-01
            parent: ce-cm-L2-01
            title: "Create case from email"
            alm-type: "User Story"
            alm-id: 12347
            section-refs: [FR-01]
        L4:
          - uid: ce-cm-L4-01
            parent: ce-cm-L3-01
            title: "Plugin: parse email subject for category"
            alm-type: Task
            alm-id: 12348
            section-refs: [FR-01]
            task-card: tasks/01-parse-email-plugin.md
            output-path: output/plugins/EmailParse/
  integration:
    features:
      case-management:
        L1: [...]
        L2: [...]
```

### Hierarchy is project-config-driven, not hardcoded

Per [agents/alm.md](agents/alm.md), `alm.hierarchy` in `project.config.yaml` declares the project's hierarchy:

- ADO: `[Epic, Feature, "User Story", Task]`
- JIRA: `[Initiative, Epic, Story, "Sub-task"]`

Levels `L1`/`L2`/`L3`/`L4` in `work-items.yaml` map to the configured types.

### Single source for ALM IDs

ALM IDs (`alm-id: 12348`) live **only** in `work-items.yaml`. Markdown documents carry only stable section IDs (FR-NN, TS-NN, TC-NN). `doc_lint` rule 7 ([07-doc-rules.md](07-doc-rules.md)) enforces this.

This prevents dual-write drift. Pulling fresh ALM IDs from `/alm pull` updates `work-items.yaml`; markdown is unchanged.

## Section-level `feature-id` tagging inside domain-scoped docs

Per [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md):

For agents with `docScope = domain` (CE / Integration / Reporting), every section block in the domain FDD / TDD / blueprint carries:

```markdown
<!-- feature-id: case-management -->
### §4.1.3 Case form layout
...
```

Every table row in domain-doc tables carries a `feature-id` column:

```markdown
| Rule ID | Entity | Trigger | Description | feature-id |
|---|---|---|---|---|
| BR-01 | Case | onChange:status | Auto-assign owner | case-management |
| BR-02 | Lead | onLoad | Default source | lead-qualification |
```

### Two operations enabled

- **`/alm push --feature {f}`** — extract sections + table rows tagged with `{f}`, push only those to ADO/JIRA
- **`/alm pull --feature {f}`** — when ALM updates come back, apply them only to `{f}`'s sections/rows

(Feature-delta FDD/TDD inline self-check at `/fdd --feature X` time uses the same feature-id tagging — see [06-templates.md](06-templates.md) Review checklist consumption.)

`work-items.yaml` itself remains feature-partitioned (no change). The `feature-id` tagging is the runtime mechanism that makes the section/row → feature mapping discoverable **inside** the domain doc.

`doc_lint` rules 9 + 10 enforce the tagging on every push.

## Estimation traceability (different model)

Per [agents/solution-estimate.md](agents/solution-estimate.md) and [ADR-0009](adr/0009-solution-estimate-consolidated.md):

Solution-estimate does **not** use `work-items.yaml`. Its traceability is via the **Req ID column** on every inventory row, which links back to the source requirement document. Plus three columns added for full traceability:

| Column | Purpose |
|---|---|
| **Req ID** | Internal requirement identifier (`REQ-001` / `US-123`) |
| **Categorization (L1 > L2 > L3 > L4 > L5)** | Estimation hierarchy path on every row |
| **Source** | Where the requirement is documented in our project (file + section) |
| **Original Req Ref** | Pointer back to system-of-record (JIRA / ADO / customer's own register / deep link) |

The L1-L5 here is the **estimation hierarchy** (Solution → Module → Capability → Feature → Inventory Factor), distinct from `work-items.yaml`'s L1-L4 (ALM hierarchy). Both schemas are documented in their respective agents' design docs.

## Cross-agent dependency declarations

Per [09-orchestration-patterns.md](09-orchestration-patterns.md), Pattern 3 (cross-agent dependencies):

Plan files declare dependencies in their frontmatter:

```yaml
---
feature-id: case-management
agent: d365-ce
requires:
  - { agent: integration, feature: case-management, artifact: blueprint, status: required }
  - { agent: reporting, feature: case-management, artifact: spec, status: optional }
---
```

`/clarify` calls `MCP handoff_status` and fails if a `required` dependency isn't READY (unless `--accept-pending-dep` is passed).

## References

- ADRs: [ADR-0006](adr/0006-doc-scope-domain-vs-feature.md), [ADR-0009](adr/0009-solution-estimate-consolidated.md)
- Schemas: `schemas/work-items.v1.json`
- Cross-references: [04-workflow-gates.md](04-workflow-gates.md), [06-templates.md](06-templates.md), [07-doc-rules.md](07-doc-rules.md), [09-orchestration-patterns.md](09-orchestration-patterns.md), [agents/alm.md](agents/alm.md), [agents/solution-estimate.md](agents/solution-estimate.md)
