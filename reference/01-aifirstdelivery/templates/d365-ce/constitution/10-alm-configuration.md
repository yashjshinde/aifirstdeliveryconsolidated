# ALM Configuration — D365 CE

> **Project-wide settings** (ADO connection, area path, iteration path, work item type names,
> field mapping, priority mapping, status mapping) are defined once in `../../alm-configuration.md`.
> Do not duplicate those settings here — configure only the domain-specific overrides below.

---

## Requirement Intake Mode

```
requirement-intake: structured
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
l3-intake: optional
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
| `enabled` | Set `true` when adding features to an existing D365 CE implementation |
| `docs-path` | Relative path from this template folder to the brownfield agent's `docs-generated/` folder |

When `enabled: true`, commands behave as follows:

| Command | Brownfield behaviour |
|---|---|
| `/spec` | Reads component inventory and entity catalogue; adds §14 Brownfield Context to the spec |
| `/review` | Checks that §14 is populated when the spec touches existing components |
| `/impact` *(new)* | Produces a full impact analysis — classifies every component as NEW / EXTEND / REPLACE / REFERENCED / CONFLICT |
| `/plan` | Requires `impact-analysis.md`; annotates each task with `brownfield-action`; adds §8 Brownfield Impact |
| `/task` | Reads existing component docs for EXTEND/REPLACE components; adds Existing System section to task cards |
| `/tdd` | Reads existing architecture docs as baseline; new design references established patterns |
| `/blueprint` | Reads existing blueprint as baseline; adds §9 Brownfield Architecture Delta |
| `/implement` | Reads existing component docs before generating code; matches established conventions |

The `docs-path` is relative to the root of this template folder.
Example: if both agents live under `templates/`, set `docs-path: ../d365-ce-brownfield/docs-generated`.

---

## Supported Languages (Multilingual)

The set of languages this project supports. The constitution enforces a **multi-language ready** posture — code is authored to support multiple languages even when only `default-language` is initially shipped.

```
default-language:    en-US
supported-languages: en-US
```

| Key | Description |
|---|---|
| `default-language` | The base language for the project. Always `en-US` unless explicitly documented and approved. Source-of-truth for schema labels, root Knowledge Articles, root email templates. |
| `supported-languages` | Comma-separated list of all languages the project supports. Must include `default-language`. Every non-Dev environment provisions exactly this set via [Power Platform → Languages](https://learn.microsoft.com/en-us/power-platform/admin/enable-languages). |

**Examples:**

Single-language project (still authored multi-language ready):
```
default-language:    en-US
supported-languages: en-US
```

Multi-language project (en-US + French + Arabic — RTL):
```
default-language:    en-US
supported-languages: en-US, fr-FR, ar-SA
```

**Rules:**
- Adding a language is a deployment event — requires translation pass, UAT sign-off, CI export of new translation file. See `15-multilingual-localization.md` §3.
- Removing a language requires a release with explicit data-impact analysis (existing localized records, KB articles, email templates).
- If `supported-languages` includes any RTL language (`ar-*`, `he-*`, `fa-*`, `ur-*`), all PCF and HTML web resources must be RTL-safe per `05-pcf-standards.md` and `15-multilingual-localization.md` §9.
- Mobile offline DB grows ~10% per additional language pack — verify against the 1 GB ceiling in `11-nfr-targets.md` and `13-field-service-scheduling-and-mobile.md`.

Full rules: see `15-multilingual-localization.md`.
