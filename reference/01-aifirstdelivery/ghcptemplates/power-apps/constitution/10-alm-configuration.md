# ALM Configuration — Power Apps

> **Project-wide settings** (ADO connection, area path, iteration path, work item type names,
> field mapping, priority mapping, status mapping) are defined once in `../../alm-configuration.md`.
> Do not duplicate those settings here — configure only the domain-specific overrides below.

---

## Requirement Intake Mode

```
requirement-intake: unstructured
```

| Value | When to use |
|---|---|
| `unstructured` | Requirements are plain-language descriptions. Use `/spec` to write the functional specification from scratch. `/plan` generates a full L1/L2/L3 + Task breakdown. |
| `structured` | Requirements already exist as L1/L2/L3 work items in your ALM tool. Use `/spec-alm` to enhance existing items into a full specification. `/plan` generates Task-level items only — the L1/L2/L3 hierarchy is NOT recreated. |

Change `requirement-intake` to `structured` when your project team manages the work-item hierarchy
directly in the ALM tool and requirements arrive pre-broken-down.

---

## L3 Intake Mode

Only applies when `requirement-intake: structured`. Controls whether L3 (User Story) work items are mandatory from the ALM tool or may be absent/partial.

```
l3-intake: required
```

| Value | When to use |
|---|---|
| `required` | Default. All L3 work items must be provided in the ALM input. `/spec-alm` stops if any L2 has no L3 items. `/plan` generates Task items only — no new L3 created. |
| `optional` | L3 may be absent or partially provided. `/spec-alm` accepts L1/L2 input without L3 and marks gaps as pending. `/plan` generates new L3 stories for any L2 with no ALM coverage, then generates Tasks under all L3s (ALM-provided and generated). |

`l3-intake` is ignored when `requirement-intake: unstructured`.

---

## Brownfield Mode

Enable when adding features to a Power Platform system that already exists and has been documented
by the `d365-ce-brownfield` agent.

```
[brownfield]
enabled:   false
docs-path: ../../d365-ce-brownfield/docs-generated
```

| Setting | Default | Description |
|---|---|---|
| `enabled` | `false` | Set to `true` to activate brownfield mode |
| `docs-path` | `../../d365-ce-brownfield/docs-generated` | Path to the brownfield agent's `docs-generated/` output folder |

When `brownfield.enabled: true`:
- `/spec` generates §15 Brownfield Context classifying every component as EXISTS or NEW
- `/review` checks §15 is present if existing components are touched
- `/impact` becomes required before `/plan` — classifies components as NEW/EXTEND/REPLACE/REFERENCED/CONFLICT
- `/plan` reads `impact-analysis.md` and stamps `brownfield-action` on every task
- `/task`, `/tdd`, `/blueprint`, `/implement` read existing component docs before generating output
