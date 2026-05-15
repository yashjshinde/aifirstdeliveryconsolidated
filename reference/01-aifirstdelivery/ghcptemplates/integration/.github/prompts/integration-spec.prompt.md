---
mode: agent
description: "Generate an Azure Integration functional specification. Triggers on: 'spec', 'integration spec', 'write spec'."
---

Generate an Azure Integration functional specification from the requirement provided.

## Usage

```
/integration-spec {feature-name}
```

## Steps

1. Read all files in `constitution/` — treat every rule as a hard constraint.

1b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Read `{brownfield.docs-path}/component-inventory.md`
    - Read `{brownfield.docs-path}/integrations/integration-topology.md` (if exists)
    - Read `{brownfield.docs-path}/integrations/azure-functions/` — all function app docs (if exist)
    - Read `{brownfield.docs-path}/integrations/logic-apps/` — all Logic App docs (if exist)
    - For every Azure Function, Logic App, Service Bus topic/queue, schema, or external system mentioned in the requirement, note whether it already exists in the brownfield inventory. This context informs §14 of the spec.
    If `false`: skip.

2. If the requirement is ambiguous or missing key information, ask up to 5 clarifying questions before proceeding. Wait for answers.
3. Determine a `{feature-name}` slug: lowercase, hyphen-separated (e.g., `crm-to-erp-account-sync`).
4. Generate the spec using the template at `specs/_template.md`.
5. Write the output to `specs/{feature-name}/spec.md`.
6. Print a summary: feature name, integration pattern, systems involved, FR count, open questions logged, constitution risks flagged.

---

## How to populate the spec

### Step A — Parse and normalise the input

Accept input in any format (plain text, pasted Excel, Word, CSV, or ADO wi-export JSON). Extract:
- Integration requirements and business rules
- Source and target systems with direction and protocol
- Data entities and field mappings
- SLA, throughput, and availability expectations
- Error handling and retry requirements

Remove duplicates and noise. Do not invent requirements not stated or directly inferrable.

> **HTML input:** If the input contains raw HTML (e.g., from ADO `description` or `acceptanceCriteria` fields via `/wi-export`), normalise before parsing: decode entities (`&lt;`, `&amp;`, `&nbsp;`), preserve table-cell content with ` | ` separators, prefix list items with `- `, strip all remaining tags, collapse whitespace.

### Step B — Identify integration areas

Group requirements into logical **Integration Areas** — each covering one coherent data flow or integration concern (e.g., Account Sync, Order Event Processing, Error and Monitoring). Use domain-relevant naming.

### Step C — Generate each section

**YAML front matter** — set `status: DRAFT`. Do not change the field names; `/integration-review` reads them.

**Section 1 — Overview**
- Business objective and integration type (Event-driven / Request-Response / Scheduled Batch / Hybrid).
- Success criteria: measurable outcomes.

**Section 2 — Systems Involved**
- Every source, target, and intermediary system with direction and protocol.

**Section 3 — Scope**
- In scope: explicit data flows.
- Out of scope: explicit exclusions. Never leave blank.

**Section 4 — Business Process Overview**
- Numbered steps from trigger to completion, including error path.

**Section 5 — Data Flows**
- One sub-section per flow with trigger, source, target, frequency, volume, and field-level data mapping table.

**Section 6 — Functional Requirements**
- Group FRs under integration area headings.
- Number sequentially across all areas: FR-001, FR-002, … — do not reset per area. This numbering is used by `/integration-plan` for ALM fr-refs.
- For every FR, populate all sub-sections:

  | Sub-section | What to write |
  |---|---|
  | **Description** | What the integration must do — clear, implementation-ready |
  | **Trigger** | Event, schedule, or API call that starts this |
  | **Inputs** | Source payload fields or event data |
  | **Outputs** | Records created, messages published, confirmations |
  | **Business Rules** | BR-NNN inline — idempotency, direction, validation rules |
  | **Error Handling** | Retry policy, DLQ behaviour, alert trigger |
  | **Story Decomposition Guidance** | Suggested Actors, User Intent, System Actions, Possible Story Splits |
  | **Dependencies** | Upstream FRs or external systems; downstream FRs that rely on this |
  | **Non-Functional Considerations** | Performance, Security, Scalability, Reliability — specific targets |
  | **Traceability** | Source BR#, requirement ID, or input document reference |

**Section 7 — Non-Functional Requirements**
- Global targets: latency, throughput, availability, data retention, security summary.

**Section 8 — Error and Exception Handling**
- Table covering every error scenario across all flows: source unavailable, target unavailable, invalid payload, duplicate, auth failure.

**Section 9 — Assumptions and Constraints**
- Assumptions: things taken as true not stated in the requirement.
- Constraints: technical or business limits that restrict design choices.

**Section 10 — Open Questions**
- Every ambiguity that could not be resolved by inference.

**Section 11 — Constitution Risks**
- Flag any requirement that conflicts with or stretches a constitution rule.
- Provide a compliant alternative. Write `None identified.` if none.

**Section 12 — Acceptance Criteria**
- Given / When / Then — at least one happy path and one failure/error path per integration area.

**Section 13 — Document Control**
- Date and author populated; version 1.0.

**Section 14 — Traceability Matrix**
- Maps every source reference (BR#, input row) to its integration area and FR-NNN.

**Section 15 — Brownfield Context** *(include only when `brownfield.enabled: true`)*
- Table: Component Type | Name | Brownfield Status | Proposed Action
  - Component types: Azure Function, Logic App, Service Bus Topic/Queue, Message Schema, APIM API, External System
  - Brownfield Status: `EXISTS` (found in inventory) or `NEW` (not found)
  - Proposed Action: `CREATE NEW` | `EXTEND` | `REPLACE` | `REFERENCE ONLY`
- Drawn from the inventory check in step 1b.
- Read by `/integration-impact` and `/integration-plan` — must be populated accurately.
- If no existing components are touched: write "No existing components affected."

---

## Rules

- The spec is **functional only** — no code, no ARM/Bicep, no implementation detail.
- Every functional requirement must be numbered FR-001, FR-002, … sequentially across all areas.
- Identify all systems: source, target, intermediary.
- Identify data flows: what moves, in which direction, at what trigger.
- Identify integration pattern (async/sync, event-driven/scheduled) for each flow.
- Every business rule referenced inline must also appear in the Error Handling or Business Rules sub-section.
- Flag any requirement that conflicts with the constitution as a **Constitution Risk** in Section 11.
- Do not leave Section 10 (Open Questions) or Section 11 (Constitution Risks) empty — write `None identified.` if applicable.
- **AI Notes:** At the end of each major section and each individual FR block, append `> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or risk flagged}`. Write only what is non-obvious — never summarise the section content.
- Write the output to `specs/{feature-name}/spec.md` relative to **this template's root directory** — never relative to the location of the input requirements file, regardless of where the source requirements originate.
