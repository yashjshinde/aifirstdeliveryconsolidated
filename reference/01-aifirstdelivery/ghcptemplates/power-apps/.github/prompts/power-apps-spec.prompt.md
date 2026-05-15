---
mode: agent
description: "Generate a Power Platform functional specification — Canvas Apps, Model-Driven Apps, Power Automate, Copilot Studio. Triggers on: 'spec', 'power apps spec', 'write spec'."
---

Generate a Power Platform functional specification from the requirement provided.

## Usage

```
/power-apps-spec {feature-name}
```

## Steps

1. Read all files in `constitution/` — treat every rule as a hard constraint.

1b. Check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`, read the following brownfield docs (skip silently if absent):
    - `{brownfield.docs-path}/component-inventory.md` — existing component list
    - `{brownfield.docs-path}/functional/entity-catalogue.md` — existing Dataverse tables and columns
    - `{brownfield.docs-path}/functional/flows.md` — existing Power Automate flows
    Use this to identify which components the new spec will touch and pre-classify them for §15.

2. If the requirement is ambiguous or missing key information, ask up to 5 clarifying questions before proceeding. Wait for answers.
3. Determine a `{feature-name}` slug: lowercase, hyphen-separated (e.g., `customer-request-tracker`).
4. Generate the spec using `specs/_template.md`.
5. Write to `specs/{feature-name}/spec.md`.
6. Print summary: feature name, Power Platform components in scope, modules identified, FR count, open questions logged, constitution risks flagged.

---

## How to populate the spec

### Step A — Parse and normalise the input

Accept input in any format (plain text, pasted Excel, Word, CSV, or ADO wi-export JSON). Extract:
- Functional requirements and business rules
- Personas and actors with app access needs
- Data entities and relationships
- Power Platform components needed (Canvas App, Model-Driven App, Power Automate, Copilot Studio, Dataverse)
- Delegation risks if large data volumes mentioned
- DLP or governance constraints

Remove duplicates and noise. Do not invent requirements not stated or directly inferrable.

> **HTML input:** If the input contains raw HTML (e.g., from ADO `description` or `acceptanceCriteria` fields via `/wi-export`), normalise before parsing: decode entities (`&lt;`, `&amp;`, `&nbsp;`), preserve table-cell content with ` | ` separators, prefix list items with `- `, strip all remaining tags, collapse whitespace.

### Step B — Identify modules

Group requirements into logical **Modules** — each covering a cohesive capability (e.g., Request Submission, Approval Workflow, Admin Configuration, Copilot Self-Service). Use domain-relevant naming.

### Step C — Generate each section

**YAML front matter** — set `status: DRAFT`. Do not change the field names; `/power-apps-review` reads them.

**Section 1 — Overview**
- Business objective: one paragraph on what and why.
- Power Platform components in scope.
- Success criteria: measurable outcomes.

**Section 2 — Scope**
- In scope: explicit list.
- Out of scope: explicit exclusions. Never leave blank.

**Section 3 — Actors and Personas**
- Every persona with role, D365 security role, and which app they access.

**Section 4 — Business Process Overview**
- Numbered steps describing the end-to-end workflow across all modules.
- Include app interactions, flow triggers, Copilot topic entries, and decision points.

**Section 5 — Functional Requirements**
- Group FRs under module headings.
- Number sequentially across all modules: FR-001, FR-002, … — do not reset per module. This numbering is used by `/power-apps-plan` for ALM fr-refs.
- For every FR, populate all sub-sections:

  | Sub-section | What to write |
  |---|---|
  | **Description** | What the system must do — clear, implementation-ready |
  | **Trigger** | User action (button, submit) or system event (record created, scheduled) |
  | **Inputs** | Data entered, record fields read, or trigger payload |
  | **Outputs** | Records created/updated, notifications, screen navigation |
  | **Business Rules** | BR-NNN inline — condition, action, delegation-safe pattern notes |
  | **Component** | Canvas App / Model-Driven App / Power Automate / Copilot Studio / Dataverse Schema |
  | **Story Decomposition Guidance** | Suggested Actors, User Intent, System Actions, Possible Story Splits |
  | **Dependencies** | Upstream FRs or data sources; downstream FRs that rely on this |
  | **Non-Functional Considerations** | Performance, Security, Scalability, Reliability — specific to Power Platform |
  | **Traceability** | Source BR#, requirement ID, or input document reference |

**Section 6 — Power Platform Impact Summary**
- Consolidated table of every component: Canvas Apps, MDA forms/views, flows, Dataverse tables, Copilot topics, security roles.
- Use schema names for tables (`prefix_tablename`). Read by `/power-apps-plan` for component-type identification.

**Section 7 — Business Rules**
- Consolidated table: BR-NNN, description, enforcement point (Business Rule / Flow / Canvas Formula / Plugin).
- Every BR referenced inline in Section 5 must appear here.

**Section 8 — Data Considerations**
- Delegation risk: any large-dataset filter that may not delegate — identify column and table.
- Data volume: estimated record counts for key tables.
- Sensitive data: PII, financial, or restricted fields — drives security role and column-level security.

**Section 9 — Assumptions and Constraints**
- Assumptions: things taken as true not stated in the requirement.
- Constraints: DLP policy limits, offline requirements, mobile support, accessibility.

**Section 10 — Open Questions**
- Every ambiguity that could not be resolved by inference.

**Section 11 — Constitution Risks**
- Flag any requirement that conflicts with or stretches a constitution rule.
- Provide a compliant alternative. Write `None identified.` if none.

**Section 12 — Acceptance Criteria**
- Given / When / Then — at least one positive and one negative/error path per module.

**Section 13 — Document Control**
- Date and author populated; version 1.0.

**Section 14 — Traceability Matrix**
- Maps every source reference (BR#, input row) to its module and FR-NNN.

**Section 15 — Brownfield Context** *(include only when `brownfield.enabled: true`; omit section entirely if greenfield)*
- Table of every component touched by this spec:

  | Component Type | Name | Brownfield Status | Proposed Action |
  |---|---|---|---|
  | Dataverse Table | {schema} | EXISTS / NEW | EXTEND / CREATE NEW / REFERENCE ONLY |
  | Canvas App | {app-name} | EXISTS / NEW | EXTEND / CREATE NEW |
  | Power Automate Flow | {flow-name} | EXISTS / NEW | EXTEND / CREATE NEW / REPLACE |
  | Model-Driven App | {app-name} | EXISTS / NEW | EXTEND / CREATE NEW |
  | Copilot Studio Agent | {agent-name} | EXISTS / NEW | EXTEND / CREATE NEW |
  | Security Role | {role-name} | EXISTS / NEW | EXTEND / CREATE NEW |

- Component types: Dataverse Table, Canvas App, Power Automate Flow, Model-Driven App, Copilot Studio Agent, Security Role
- Status: `EXISTS` (found in brownfield inventory) or `NEW` (not in brownfield inventory)
- Action: `CREATE NEW`, `EXTEND`, `REPLACE`, or `REFERENCE ONLY`

---

## Rules

- Functional only — no formulas, no flow definitions, no technical decisions.
- Every requirement must be numbered FR-001, FR-002, … sequentially across all modules.
- Identify which Power Platform components are needed per FR.
- Identify all personas with their security roles and app access.
- Flag delegation risks if large data volumes are mentioned.
- Every business rule referenced inline must also appear in Section 7 with an enforcement point.
- Flag any constitution risk with a compliant alternative in Section 11.
- Do not leave Section 10 (Open Questions) or Section 11 (Constitution Risks) empty — write `None identified.` if applicable.
- **AI Notes:** At the end of each major section and each individual FR block, append `> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or risk flagged}`. Write only what is non-obvious — never summarise the section content.
- Write the output to `specs/{feature-name}/spec.md` relative to **this template's root directory** — never relative to the location of the input requirements file, regardless of where the source requirements originate.
