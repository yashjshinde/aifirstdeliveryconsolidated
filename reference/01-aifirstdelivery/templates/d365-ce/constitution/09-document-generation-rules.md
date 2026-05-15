# Constitution — Document Generation Rules

## Workflow Trigger Points

```
/spec  → /review [APPROVED]
              ↓
         /fdd        → docs-generated/{feature}/functional-design-document.md
         /testplan   → docs-generated/{feature}/test-plan-and-strategy.md
              ↓
         /plan  → /clarify [TASK-READY]
                       ↓
                  /tdd        → docs-generated/{feature}/technical-design-document.md
                  /blueprint  → docs-generated/{feature}/solution-blueprint.md
                       ↓
                  /task → /implement → /document (operational docs)
```

## Document Types, Triggers, and Ownership

| Document | Command | Pre-condition | Audience | Template |
|---|---|---|---|---|
| Functional Design Document | `/fdd` | Spec APPROVED | Business / BA / UAT | `doc-templates/fdd-template.md` |
| Test Plan and Strategy | `/testplan` | Spec APPROVED | QA / Business | `doc-templates/test-plan-template.md` |
| Technical Design Document | `/tdd` | Plan TASK-READY | Architect / Dev | `doc-templates/tdd-template.md` |
| Solution Blueprint | `/blueprint` | Plan TASK-READY | Architect / Tech Lead | `doc-templates/solution-blueprint-template.md` |
| Plugin Registration | `/document` | All tasks implemented | Admin / Release | *(inline in /document)* |
| Deployment Guide | `/document` | All tasks implemented | DevOps / Release | *(inline in /document)* |
| Release Notes | `/document` | All tasks implemented | All stakeholders | *(inline in /document)* |
| User Guide | `/document` | UI changes present | End Users | *(inline in /document)* |

## Document Language Rules

| Document | Language Level | Use Schema Names? | Use Technical Terms? |
|---|---|---|---|
| FDD | Business language | No (display names only) | No |
| Test Plan | Mixed (testers) | Yes (in test case steps) | Moderate |
| TDD | Technical | Yes | Yes |
| Solution Blueprint | Architectural | Yes | Yes |
| /document outputs | Mixed per doc type | Yes | Yes |

## File Naming and Location

- All lowercase, hyphen-separated
- Location: `docs-generated/{feature-name}/`
- Feature folder name must match `specs/`, `plans/`, `tasks/`, and `output/` exactly
- Document header block required in every document:
  ```
  feature: {feature-name}
  document-type: {type}
  date: {YYYY-MM-DD}
  status: DRAFT | UNDER REVIEW | APPROVED
  ```

## Cross-Reference Rules

- FDD references spec: `See [spec.md](../../specs/{feature}/spec.md) §{N}`
- TDD references FDD: `See [functional-design-document.md](functional-design-document.md) §{N}`
- Blueprint references TDD: `See [technical-design-document.md](technical-design-document.md) §{N}`
- Never duplicate content between documents — link instead

## Diagram Standards

All diagrams in generated documents **must** use Mermaid syntax. ASCII art and plain-text box drawings are prohibited.

- Enclose every diagram in a triple-backtick `mermaid` code fence.
- Every diagram must have a descriptive heading immediately above it.
- Diagrams must be generated in the same pass as their section — never defer or leave placeholders.
- Keep diagrams at architecture level: show systems, components, and data flows — not code details.
- Apply `classDef` colour coding: `:::critical` (red) for security risks, `:::warning` (amber) for tech debt/deprecated, `:::info` (light blue) for external systems.

| Section | Mermaid type | Content |
|---|---|---|
| Component architecture (blueprint §2) | `graph LR` or `graph TD` | Personas → D365 forms → plugins → Dataverse → flows → external |
| Data model / entity relationships | `erDiagram` | Key entities with fields and cardinality |
| Process flow (FDD §5) | `flowchart LR` | Business steps: trigger → actors → outcome |
| Integration topology (TDD §8) | `graph LR` | External systems ↔ D365 CE with auth and direction |
| Security role hierarchy | `graph TD` | Role → privilege → entity |
| Field Service process flow (FDD §5, FS features only) | `flowchart LR` | Case → Work Order → Booking → Mobile → Resolution → Time Entry / Invoice |
| URS scheduling architecture (Blueprint §2, FS features only) | `graph LR` | Requirement → Schedule Assistant / RSO → Bookable Resource → Booking → Schedule Board |
| FS Mobile offline data flow (TDD §8, FS features only) | `graph LR` | Online tables → Offline Profile (≤15 linked) → Mobile DB → Sync engine → Power Platform |

```mermaid
%% Standard classDef palette — use in all diagrams
classDef critical fill:#ef4444,color:#fff,stroke:#b91c1c
classDef warning  fill:#f59e0b,color:#000,stroke:#d97706
classDef info     fill:#93c5fd,color:#000,stroke:#3b82f6
classDef ok       fill:#22c55e,color:#fff,stroke:#15803d
classDef neutral  fill:#f1f5f9,color:#334155,stroke:#94a3b8
```

## Localization Matrix (Multilingual Projects)

When `supported-languages` in `10-alm-configuration.md` lists more than one language, every FDD must include a **Localization Matrix** sub-section under §6 (D365 CE Impact Summary).

The matrix is a single table listing every artefact requiring translation:

| Artefact | Type | Source language | Target languages | Translator / Team | Sign-off date |
|---|---|---|---|---|---|
| `opex_account` form labels | Form labels | en-US | fr-FR, ar-SA | Localization team A | YYYY-MM-DD |
| `opex_BookingConfirmation_*` | Email template | en-US | fr-FR, ar-SA | Localization team A | YYYY-MM-DD |
| Service Task Type "Quarterly Inspection" | Service Task | en-US | fr-FR, ar-SA | SME team | YYYY-MM-DD |
| Knowledge Article — "Pump replacement" | KB Article | en-US | fr-FR, ar-SA | Knowledge team | YYYY-MM-DD |

Artefact types to enumerate:
- Table / column / view / form display labels
- Choice / option set labels
- App module / sitemap labels
- BPF labels
- Email templates (one row per template)
- Power Automate flow user-facing strings
- Plugin user-facing exception messages (key list)
- JS / PCF user-facing strings (key list)
- Dashboard / chart titles
- Service Task Type instructions
- Incident Type description / instructions
- Knowledge Articles in scope

The TDD §8 documents the translation lifecycle for the feature: export schedule, translator team, import gates, pseudo-localization step.

Full multilingual rules: see `15-multilingual-localization.md`.

## Output Code Location Rules

| Code Type | Output Path |
|---|---|
| Plugin classes | `output/{feature}/src/Plugins/{EntityName}/` |
| Plugin common helpers | `output/{feature}/src/Plugins/Common/` |
| PCF controls | `output/{feature}/src/PCF/{ControlName}/` |
| JS web resources | `output/{feature}/src/WebResources/js/` |
| HTML web resources | `output/{feature}/src/WebResources/html/` |
| CSS web resources | `output/{feature}/src/WebResources/css/` |
| Custom workflow activities | `output/{feature}/src/Workflows/` |
| Solution metadata | `output/{feature}/src/Solution/` |
| Unit tests | `output/{feature}/tests/Unit/` |
| Integration tests | `output/{feature}/tests/Integration/` |

**Never** write generated code outside `output/` without explicit user instruction.

## Generated Code Naming

### Plugin Classes
```
ClassName : {Entity}{Pre|Post}{Operation}Plugin
Namespace : {OrgPrefix}.{SolutionName}.Plugins.{EntityName}
File      : {Entity}{Pre|Post}{Operation}Plugin.cs
```

### JavaScript Web Resources
```
File: {prefix}_{entityname}_{formname}_{purpose}.js
```

### PCF Controls
```
Folder    : {PascalCaseName}Control/
Namespace : {OrgPrefix}.PCF.{ControlName}
```
