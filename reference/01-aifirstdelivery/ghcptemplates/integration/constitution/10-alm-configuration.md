# ALM Configuration — Azure Integration

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

Enables awareness of an existing, already-implemented system when generating specs, plans, and tasks.
When enabled, every generative command reads the brownfield documentation folder before producing output
and makes decisions in the context of what already exists.

```
[brownfield]
enabled:   false
docs-path: ../../d365-ce-brownfield/docs-generated
```

| Key | Description |
|---|---|
| `enabled` | Set `true` when adding features to an existing integration implementation |
| `docs-path` | Relative path from this template folder to the brownfield agent's `docs-generated/` folder |

When `enabled: true`, commands behave as follows:

| Command | Brownfield behaviour |
|---|---|
| `/spec` | Reads integration topology and component inventory; adds §14 Brownfield Context to the spec |
| `/review` | Checks that §14 is populated when the spec touches existing components |
| `/impact` *(new)* | Produces a full impact analysis — classifies every component as NEW / EXTEND / REPLACE / REFERENCED / CONFLICT |
| `/plan` | Requires `impact-analysis.md`; annotates each task with `brownfield-action`; adds §8 Brownfield Impact |
| `/task` | Reads existing component docs for EXTEND/REPLACE components; adds Existing System section to task cards |
| `/tdd` | Reads existing architecture docs as baseline; new design references established patterns |
| `/blueprint` | Reads existing blueprint as baseline; adds §9 Brownfield Architecture Delta |
| `/implement` | Reads existing component docs before generating code; matches established conventions |

The `docs-path` is relative to the root of this template folder.
Example: if both agents live under `templates/`, set `docs-path: ../d365-ce-brownfield/docs-generated`.
