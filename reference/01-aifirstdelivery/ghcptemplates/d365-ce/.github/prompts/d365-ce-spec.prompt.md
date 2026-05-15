---
mode: agent
description: "Generate a D365 CE functional specification. Use when a user provides a business requirement and wants a structured spec written to specs/{feature}/spec.md. Triggers on: 'spec', 'write spec', 'functional spec', 'functional requirement'."
---

Generate a Dynamics 365 CE functional specification from the requirement provided.

## Usage

```
/d365-ce-spec {feature-name}
```

## Steps

1. Read all files in `constitution/` — treat every rule as a hard constraint.

1b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Read `{brownfield.docs-path}/component-inventory.md`
    - Read `{brownfield.docs-path}/functional/entity-catalogue.md` (if exists)
    - Read `{brownfield.docs-path}/functional/flows.md` (if exists)
    - For every entity, plugin, flow, or form mentioned in the incoming requirement, note whether it already exists in the brownfield inventory. This context informs §14 of the spec.
    If `false`: skip.

2. If the requirement is ambiguous or missing key information, ask up to 5 clarifying questions before proceeding. Wait for answers.
3. Determine a `{feature-name}` slug: lowercase, hyphen-separated (e.g., `account-loyalty-points`).
4. Generate the spec using the template at `specs/_template.md`.
5. Write the output to `specs/{feature-name}/spec.md`.
6. Print a summary: feature name, modules identified, FR count, open questions logged, constitution risks flagged.

---

## How to populate the spec

### Step A — Parse and normalise the input

Accept input in any format (plain text, pasted Excel, Word, CSV, or ADO wi-export JSON). Extract:
- Functional requirements and business rules
- Personas and actors
- Inputs, outputs, and data entities
- Integration points and external systems
- Non-functional expectations (SLAs, performance, security)

Remove duplicates and noise. Resolve ambiguity using enterprise best practices — but do not invent requirements not stated or directly inferrable.

> **HTML input:** If the input contains raw HTML (e.g., from ADO `description` or `acceptanceCriteria` fields via `/wi-export`), normalise before parsing: decode entities (`&lt;`, `&amp;`, `&nbsp;`), preserve table-cell content with ` | ` separators, prefix list items with `- `, strip all remaining tags, collapse whitespace.

### Step B — Identify modules

Group requirements into logical **Modules** — each representing a cohesive business capability (e.g., Customer Management, Integration Layer, Dispatch Management). Use domain-relevant naming.

### Step C — Generate each section

**YAML front matter** — set `status: DRAFT`. Do not change the field names; `/d365-ce-review` reads them.

**Section 1 — Overview**
- Business objective: one paragraph on what and why.
- Success criteria: measurable outcomes.

**Section 2 — Scope**
- In scope: explicit list.
- Out of scope: explicit exclusions. Never leave this blank.

**Section 3 — Actors and Personas**
- List every persona with their role and the D365 CE security role they map to.

**Section 4 — Business Process Overview**
- Numbered steps describing the end-to-end workflow across all modules.
- Include system interactions and decision points.

**Section 5 — Functional Requirements**
- Group FRs under module headings.
- Number sequentially across all modules: FR-001, FR-002, … — do not reset per module. This numbering is used by `/d365-ce-plan` for ALM fr-refs.
- For every FR, populate all sub-sections:

  | Sub-section | What to write |
  |---|---|
  | **Description** | What the system must do — clear, implementation-ready language |
  | **Trigger** | User action, system event, or integration event that starts this |
  | **Inputs** | Data or actions entering this requirement |
  | **Outputs** | Records created, fields updated, notifications sent |
  | **Business Rules** | BR-NNN inline — condition, action, error message where applicable |
  | **D365 CE Impact** | Every entity, form, view, plugin, flow, PCF affected |
  | **Story Decomposition Guidance** | Suggested Actors, User Intent, System Actions, Possible Story Splits |
  | **Dependencies** | Upstream FRs or external systems; downstream FRs that rely on this |
  | **Non-Functional Considerations** | Performance, Security, Scalability, Reliability — specific, not generic |
  | **Traceability** | Source BR#, requirement ID, or input document reference |

**Section 6 — D365 CE Impact Summary**
- Consolidated table of every component across all modules: tables, forms, plugins, flows, security roles.
- Use schema names for entities (`prefix_tablename`). This table is read by `/d365-ce-plan` for component-type identification.

**Section 7 — Business Rules**
- Consolidated table: BR-NNN, description, enforcement point (Plugin / Flow / Form Script / Business Rule).
- Every BR referenced inline in Section 5 must appear here.

**Section 8 — Assumptions and Constraints**
- Assumptions: things taken as true that are not stated in the requirement.
- Constraints: technical or business limits that restrict design choices.

**Section 9 — Open Questions**
- Every ambiguity that could not be resolved by inference.
- Status: Open for all questions raised here.

**Section 10 — Constitution Risks**
- Flag any requirement that conflicts with or stretches a constitution rule.
- Provide a compliant alternative for each risk.
- If none: write `None identified.`

**Section 11 — Acceptance Criteria**
- Given / When / Then scenarios — at least one positive and one negative path per module.
- These are functional acceptance tests, not unit tests.

**Section 12 — Document Control**
- Date and author populated; version 1.0.

**Section 13 — Traceability Matrix**
- Maps every source reference (BR#, input row) to its module and FR-NNN.
- If no source references exist, omit this section.

**Section 14 — Brownfield Context** *(include only when `brownfield.enabled: true`)*
- Table: Component Type | Name / Schema Name | Brownfield Status | Proposed Action
  - Brownfield Status: `EXISTS` (found in inventory, note the source package) or `NEW` (not found)
  - Proposed Action: `CREATE NEW` | `EXTEND` | `REPLACE` | `REFERENCE ONLY`
- Drawn from the inventory check in step 1b.
- Read by `/d365-ce-impact` and `/d365-ce-plan` — must be populated accurately.
- If no existing components are touched: write "No existing components affected."

---

## Rules

- The spec is **functional only** — no technical decisions, no code, no implementation detail.
- Every functional requirement must be numbered FR-001, FR-002, … sequentially across all modules.
- Every D365 CE entity/table referenced must use schema names where known.
- Every business rule referenced inline must also appear in Section 7 with an enforcement point.
- Flag any requirement that conflicts with the constitution as a **Constitution Risk** in Section 10.
- Do not invent requirements — only document what was stated or can be directly inferred.
- Do not leave Section 10 (Constitution Risks) or Section 9 (Open Questions) empty — write `None identified.` if applicable.
- **AI Notes:** At the end of each major section and each individual FR block, append `> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or risk flagged}`. Write only what is non-obvious — never summarise the section content.
- Write the output to `specs/{feature-name}/spec.md` relative to **this template's root directory** — never relative to the location of the input requirements file, regardless of where the source requirements originate.
