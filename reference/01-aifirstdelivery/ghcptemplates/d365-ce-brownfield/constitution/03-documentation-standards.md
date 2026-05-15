# Documentation Standards

## Tone and Audience

Each document has a primary audience. Match tone to audience:

| Document | Primary Audience | Tone |
|---|---|---|
| Functional Overview (`/fdd`) | Business stakeholders, Product Owners | Plain English, no jargon, no schema names |
| Entity Catalogue | Developers, Data analysts | Technical, precise schema names, full attribute list |
| Plugin docs | Developers | Technical, include code excerpts |
| Web Resource docs | Developers | Technical, include function signatures |
| PCF docs | Developers, Solution Architects | Technical |
| Flows | Business analysts, Developers | Mixed — describe business purpose first, then mechanics |
| Security Model | Security Officer, Architects | Technical for privilege matrix; business language for persona descriptions |
| Architecture Blueprint | Architects, Tech Leads | Technical architecture language |
| Integration Topology | Integration architects | Technical, include endpoints and auth |

---

## CRITICAL QUALITY RULE — No Grouping

> **Every component must be documented individually in its own section.**

The following patterns are STRICTLY PROHIBITED:

| Prohibited Pattern | Why Prohibited |
|---|---|
| "Other Entity Scripts (~38 additional JS files) follow the same pattern" | Leaves 38 files undocumented |
| "Remaining flows follow the same pattern as above" | Leaves flows undocumented |
| "Similar entities: [list of 12 names]" with no individual sections | Entities have no field documentation |
| "See entity above for structure" | Copy-paste documentation is not documentation |
| Count-only tables (name + count with no detail) | Counts are inventory, not documentation |

**If a component exists in the input, it must have its own section with all required fields filled in.**
The only exception is binary-only artefacts (DLLs with no source) — these are documented with registration metadata only and explicitly flagged.

---

## Minimum Content Standards per Component Type

### Entity (Custom)
Each entity section MUST contain:
- Schema name, display name, solution package source
- Business purpose (one paragraph explaining what this entity represents and why it exists)
- Full field data dictionary: every custom field with schema name, type, required level, description/purpose
- Status/Status Reason values (all of them, with business meaning)
- Relationships: N:1 lookups listed with target entity and purpose
- Cross-references: which plugins fire on this entity, which flows trigger on it, which forms display it

### Entity (OOB Extended)
Each OOB entity section MUST contain:
- Explanation of why the standard entity is used (business context)
- Custom fields added (schema name, type, purpose)
- Standard fields customised (renamed, made required, etc.)
- No documentation needed for unchanged OOB fields

### Plugin Class
Each plugin class MUST contain:
- Registered steps (entity, message, stage, mode, filtering attributes)
- Business purpose summary
- For each Execute() method: context extraction variables, decision logic as if-then conditions, all Dataverse operations (entity + fields), all external HTTP calls (URL, method, auth), all error/exception messages
- Code excerpt of the key decision logic (truncated to `max-snippet-lines` per `constitution/10-project-configuration.md`)

### JavaScript File
Each JS file MUST contain:
- Form it is registered on and event type (OnLoad, OnChange, OnSave, Ribbon button)
- For EVERY function in the file: trigger event, fields read, fields written, Xrm API calls, custom action/API calls, business purpose
- Deprecated API usage flags
- Dependency map: other JS files or libraries it depends on

### Power Automate Flow
Each flow MUST contain:
- Display name, flow type (automated/instant/scheduled), trigger entity/event, exact filter condition (if any)
- Numbered action sequence: action number, action type, what it does, fields involved
- Error handling and compensation steps
- Business purpose and downstream effects
- Trigger conditions that distinguish it from similar flows

### Classic Workflow
Each workflow entry in the summary table MUST include: name, primary entity, trigger event, activated status, brief description of what it does.

### Security Role
Each role MUST contain:
- Role name and persona description (who holds this role)
- Privilege matrix covering ALL custom entities and key OOB entities: Create / Read / Write / Delete / Append / Append To columns with depth codes (None / User / BU / Parent BU / Org)
- Field security profiles attached to the role (if any)
- Special miscellaneous privileges (e.g., Go Mobile, Export to Excel)

### SSRS Report
Each report MUST contain:
- Report name, data source name
- For each dataset: dataset name, full SQL `CommandText` extracted verbatim from the RDL, parameters it accepts
- Report parameters (name, type, default, prompt label)
- Column/field mapping: which dataset fields map to which report columns or text boxes
- Business purpose and intended audience

### Custom API
Each Custom API MUST contain:
- Unique name, binding type, entity (if bound)
- Full input parameter list: name, type, required, description
- Full output response property list: name, type, description
- Which plugin class implements it
- Invocation example (JSON request body)

### Integration Endpoint (Azure Function / Logic App)
Each endpoint MUST contain:
- Function/workflow name, trigger type, HTTP method (if applicable), URL pattern
- Input payload schema (field names, types, required/optional)
- Output payload schema or response structure
- Auth pattern classification
- Error handling assessment

---

## Feature Domain Grouping

When a scope contains more than 10 components of the same type, group them under **feature domain headings** before listing individual components. Feature domains represent cohesive business capabilities (e.g. "HSG Onboarding Lifecycle", "PCN Clinic-Doctor Relationships", "Case Management").

**Rules:**
- Feature domain headings are `##` level; individual components are `###` level beneath them
- Every component must still have its own `###` section with all required fields — domain grouping is organisational only
- A component that spans multiple domains is documented under its primary domain and cross-referenced from others
- Include a domain summary paragraph (2–4 sentences) explaining the business capability before the first component in that domain

---

## Heading Hierarchy

Use consistent heading levels:
```
# Document Title
## §1 Section Name  (or Feature Domain Name)
### §1.1 Subsection  (or Individual Component Name)
#### Detail sub-section (e.g. Field Dictionary, Plugin Steps, Action Sequence)
```

---

## Tables

All tables must have a header row and at least one data row.
If a table would be empty, write: *No items of this type found in the solution.*

Required columns per table type:

**Entity field dictionary:** Schema Name | Display Name | Type | Required Level | Description / Business Purpose
**Plugin step table:** Plugin Class | Entity | Message | Stage | Mode | Filtering Attributes
**Web resource table:** Schema Name | Type | Purpose | Forms Used On
**Flow table:** Display Name | Type | Trigger | Primary Entity | Purpose
**Security role privilege table:** Entity | Create | Read | Write | Delete | Append | Append To
**JS function table:** Function Name | Trigger | Fields Read | Fields Written | Xrm Calls | Purpose

---

## Diagram Standards

All diagrams in generated documents **must** use Mermaid syntax.

- Enclose every diagram in a triple-backtick `mermaid` code fence — never use ASCII art or plain-text box drawings.
- Every diagram must have a descriptive heading (`###` or `####`) immediately above its code fence.
- Diagrams must be generated in the same pass as their section — do not defer or leave placeholders.
- Keep diagrams at architecture level: show systems, components, and flows — not code details or task lists.
- Apply colour coding using `style` or `classDef` directives to highlight critical paths, warnings (amber), and error/security states (red).

### Diagram Type by Section

| Section | Mermaid Type | Notes |
|---|---|---|
| Solution / component architecture overview | `graph TD` | Layer boxes top-to-bottom: UI → Logic → Data → Integration |
| Integration topology | `graph LR` | External systems left/right, D365 in centre |
| Business process / workflow | `flowchart LR` or `flowchart TD` | Show trigger → steps → outcome |
| Entity relationships | `erDiagram` | Key entities only — omit reference/lookup tables |
| Package dependencies | `graph LR` | Nodes = packages, arrows = depends-on |
| Data flow (staging → promotion) | `sequenceDiagram` | Show system actors and message sequence |
| Security role hierarchy | `graph TD` | Nodes = roles, arrows = inherits / grants |

### Colour Coding Conventions

```mermaid
%% Use these classDef colours consistently across all diagrams
classDef critical fill:#ff4d4d,color:#fff,stroke:#cc0000
classDef warning  fill:#ffaa00,color:#000,stroke:#cc7700
classDef info     fill:#0066cc,color:#fff,stroke:#004499
classDef ok       fill:#00aa55,color:#fff,stroke:#007733
classDef neutral  fill:#f0f0f0,color:#333,stroke:#999
```

Apply `:::critical` to security risks, hardcoded credentials, missing pre-filtering.
Apply `:::warning` to deprecated technology, tech debt, environment-specific values.
Apply `:::info` to external systems and integration endpoints.

---

## Code Excerpts

When including code:
- Use fenced code blocks with language specifier (` ```csharp `, ` ```javascript `, ` ```typescript `, ` ```json `)
- Truncate at `max-snippet-lines` (from `constitution/10-project-configuration.md`) — add `// ... (truncated)` comment
- Always include the function/method signature on the first excerpt line
- For JS: include the function declaration, not just the body
- For SSRS: include full SQL `CommandText` — do not truncate SQL queries

---

## Completeness Rules

- Every custom entity must appear in the entity catalogue — no omissions
- Every plugin class must appear in the plugin documentation — no omissions
- Every JavaScript file must be documented individually — no omissions
- Every Power Automate flow must be documented individually — no omissions
- Every SSRS report must have its SQL extracted — no omissions
- If a field, function, or step cannot be documented (e.g. binary-only DLL with no source), write:
  > Source not available — documented from solution XML registration metadata only.

---

## Traceability

Where possible, link observations back to source:
- "Registered as Pre-Operation step on the `account` entity (source: `solution/PluginAssemblies/MyAssembly.xml`)"
- "Field `pub_taxcode` is marked RequiredForSave in the solution XML"
- "SQL from dataset `DS_ClinicList` in `ClinicListing.rdl`"

---

## Gap Flagging

Never silently omit or guess. When something cannot be determined:
```
> ⚠ NEEDS REVIEW — {what could not be determined and why}
```

Collect all such flags in a "Documentation Gaps" section at the end of each document.

---

## Version and Status

Every generated document must begin with a metadata block:
```markdown
| Property | Value |
|---|---|
| Solution | {solution-name} {version} |
| Generated | {date} |
| Status | DRAFT — for review |
| Source artefacts | {list input types used} |
```
