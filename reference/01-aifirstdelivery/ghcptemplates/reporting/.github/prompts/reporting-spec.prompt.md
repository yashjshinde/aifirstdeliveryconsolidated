---
mode: agent
description: "Generate a Reporting functional specification - Power BI, SSRS, or Paginated Reports. Triggers on: 'spec', 'report spec', 'write spec'."
---

Generate a Reporting functional specification from the requirement provided.

## Usage

```
/reporting-spec {feature-name}
```

## Steps

1. Read all files in `constitution/` — treat every rule as a hard constraint.

1a. Check `constitution/10-alm-configuration.md` — read `brownfield.enabled` and `brownfield.docs-path`.
    If `brownfield.enabled: true`, read ALL of the following from `{brownfield.docs-path}` before generating any output:

    **Solution overview:**
    - `component-inventory.md` — solution component counts and package breakdown
    - `00-index.md` (if exists) — index of all generated documents

    **Functional documentation — primary source for entity and attribute mapping:**
    - `functional/entity-catalogue.md` (if exists) — all D365/Dataverse entities with their attributes,
      field names, data types, and optionset values; **use this as the primary reference when mapping
      KPIs and data attributes to existing D365 fields — do not invent field names that already exist here**
    - `functional/functional-overview.md` (if exists) — business process context and solution purpose
    - `functional/security-model.md` (if exists) — existing security roles and access patterns

    **Architecture:**
    - `architecture/data-model.md` (if exists) — entity relationships, cardinality, and join keys
    - `architecture/solution-blueprint.md` (if exists) — solution architecture and component dependencies

    **Reporting artefacts:**
    - `reporting/reporting-inventory.md` (if exists) — existing reports, data sources, workspaces
    - All files in `reporting/ssrs/` (if exists) — per-SSRS-report detail: field lists, parameters, queries
    - All files in `reporting/power-bi/` (if exists) — per-Power-BI-report inventory

    Use this knowledge throughout the spec: when naming KPIs and mapping attributes to data sources,
    prefer existing D365 entity names, attribute names, and report names over inventing new ones.
    Reference exact names from the brownfield inventory so that §8 Data Model Requirements and §15
    Brownfield Context are populated with accurate field-level mappings.

2. If the requirement is ambiguous or missing key information, ask up to 5 clarifying questions before proceeding. Wait for answers.
3. Determine a `{feature-name}` slug: lowercase, hyphen-separated (e.g., `sales-pipeline-dashboard`).
4. Generate the spec using the template at `specs/_template.md` as the authoritative output structure.
5. Write the output to `specs/{feature-name}/spec.md`.
6. Print a summary: feature name, reports identified, FR count, open questions logged, constitution risks flagged.

---

## How to populate the spec

### Step A — Parse and normalise the input

Accept input in any format (plain text, pasted Excel, Word, CSV, or ADO wi-export JSON). Extract:
- Report requirements and business questions the reports must answer
- Personas and consumer audiences
- Data sources and entities required
- Refresh frequency and data freshness expectations
- Security and access requirements (who can see what)
- Export and delivery requirements (subscriptions, scheduled email, embedding)

Remove duplicates and noise. Do not invent requirements not stated or directly inferrable.

> **HTML input:** If the input contains raw HTML (e.g., from ADO `description` or `acceptanceCriteria` fields via `/wi-export`), normalise before parsing: decode entities (`&lt;`, `&amp;`, `&nbsp;`), preserve table-cell content with ` | ` separators, prefix list items with `- `, strip all remaining tags, collapse whitespace.

### Step B — Identify report modules

Group requirements into logical **Modules** — each representing a cohesive reporting domain (e.g., Sales Analytics, Customer Service Reports, Finance Dashboards). Use business-domain naming.

### Step C — Generate each section

**YAML front matter** — set `status: DRAFT`. Do not change field names; `/reporting-review` reads them.

**Section 1 — Overview**
- Business objective: one paragraph on what reporting problem is being solved and why.
- Success criteria: measurable outcomes (e.g., "All account managers can view their pipeline KPIs without requesting manual extracts").

**Section 2 — Scope**
- In scope: explicit list of reports, datasets, and report types.
- Out of scope: explicit exclusions. Never leave this blank.

**Section 3 — Report Catalogue**
- One row per report:

| Report Name | Report Type | Target Audience | Data Source | Refresh Schedule | RLS Required |
|---|---|---|---|---|---|
| {Name} | Power BI Interactive / Paginated / SSRS | {Personas} | {Source} | {Schedule} | Yes / No |

**Section 4 — Business Process Overview**
- Numbered steps describing how reports are consumed in the business workflow.
- Include: who creates/publishes the report, who consumes it, how they access it (portal, D365 CE, Canvas App, email subscription), and what decisions they make with it.

**Section 5 — Functional Requirements**
- Group FRs under module headings.
- Number sequentially across all modules: FR-001, FR-002, … — do not reset per module.
- For every FR, populate all sub-sections:

  | Sub-section | What to write |
  |---|---|
  | **Description** | What the report must show — clear, business-language description |
  | **Report Type** | Power BI Interactive \| Power BI Paginated \| SSRS |
  | **Target Audience** | Personas and security roles who consume this report |
  | **Data Sources** | D365 CE entities, Dataverse tables, SQL tables, or other sources. For SSRS: include stored procedure name if known. Note any pre-filtering at source (e.g., active records only, date range, organisation unit). |
  | **Key Measures and KPIs** | Use the table below for every KPI — no DAX (that belongs in the TDD): |

  | KPI | Logic | Table Name | Field Names / Filters Applied | Display Format | Remarks |
  |---|---|---|---|---|---|
  | {KPI name} | {Business calculation logic — plain language} | {Source table from entity-catalogue} | {Exact field names and filter conditions} | {Currency \| % \| Integer \| Decimal N dp} | {Rounding rule, ⚠ NEW, assumptions} |

  In brownfield mode: **Table Name** and **Field Names** must use exact names from `functional/entity-catalogue.md` or reporting docs — ⚠ NEW if no match exists. In brownfield mode also add: **Action** (REUSED \| EXTEND \| NEW) and **Delta** columns — these feed §15 directly. |
  | **Filters and Slicers** | Available filters; default filter values; cross-filter behaviour between visuals |
  | **Visuals / Layout** | Page list with purpose; key visual types per page; drill-through targets |
  | **Canvas Size** | Width × Height. Default: 1280×720 px (dashboard/interactive) or 1280×960 px (detailed/paginated). Justify any deviation. |
  | **Accessibility** | WCAG AA compliance required: contrast ratio ≥ 4.5:1 for all chart elements; alt-text on key visuals; tooltip text for KPI cards. Note keyboard-navigation needs if report is embedded in model-driven app or Teams. |
  | **RLS Requirements** | Roles, DAX filter logic (plain language), and a named test user for each role. If none: write "No RLS — report is fully open". Any FR sourcing D365 entity data without RLS must be flagged ⚠ RLS MISSING in §11. |
  | **Embedding Scenarios** | If this report is embedded: list each scenario (D365 CE model-driven form \| Canvas App \| Teams tab \| External portal). For each: authentication method (service principal / user identity), cross-tenant requirements, and token refresh approach. Write "Not embedded" if applicable. |
  | **Refresh Schedule** | Frequency and timing. Reference constitution defaults from `10-alm-configuration.md` (e.g., daily 06:00 UTC). Incremental refresh required? Write "Yes — fact > 10M rows" or "No". |
  | **Export / Delivery** | Export formats (PDF, Excel, CSV). Subscription details: frequency, distribution list or group, trigger condition (scheduled / on refresh / manual), attachment format. Write "No subscription" if not required. |
  | **Business Rules** | BR-NNN inline — calculations, aggregation rules, conditional logic |
  | **Story Decomposition Guidance** | Suggested Actors, User Intent, System Actions, Possible Story Splits |
  | **Dependencies** | Upstream FRs, data source availability, dataset FRs, dataflow dependencies |
  | **Non-Functional Considerations** | Performance: page load target (default < 3 sec interactive, < 10 sec paginated). Data volume estimate. Concurrent user count. Sensitivity label classification: Public \| Internal \| Confidential \| Highly Confidential (Confidential minimum for any D365 entity data). |
  | **Traceability** | Source requirement ID or business request reference |

**Section 6 — Report Impact Summary**
- Consolidated table of every report, dataset, and data source across all modules.
- Columns: Report Name | Module | Type | Dataset | Data Sources | RLS | Sensitivity Label | Workspace.
- **Sensitivity Label:** Public | Internal | Confidential | Highly Confidential. Any report sourcing D365 entity data must be Confidential minimum.
- **Workspace:** Use `{project.name}-DEV` / `-UAT` / `-PROD` naming from `constitution/10-alm-configuration.md`.

**Section 7 — Business Rules**
- Consolidated table: BR-NNN, description, report/measure where applied.
- Every BR referenced inline in Section 5 must appear here.

**Section 8 — Data Model Requirements**
- For each dataset: list required tables (fact and dimension), key relationships, storage mode (Import / DirectQuery / Composite).
- If data from multiple sources must be joined: document the join key and business justification.
- **Relationships:** All relationships must be single-direction unless bi-directional is explicitly justified. Role-playing dimensions (e.g., Order Date vs Ship Date from the same Date table) must be noted — USERELATIONSHIP() will be required in the TDD.
- **Date dimension:** Every dataset must include a Date dimension table. List at minimum: Date, Year, Quarter, Month, Month Name, Week, Financial Quarter, Financial Year. Flag if a fiscal calendar is required.
- Flag any data not yet available in a form suitable for reporting as ⚠ NEEDS REVIEW.
- *(Brownfield mode)* Cross-reference every required table against `functional/entity-catalogue.md` and `architecture/data-model.md`. Mark each table: **REUSED** (exists, unchanged), **EXTEND** (exists, needs new columns), or **NEW** (must be created). Use exact entity and field names from the brownfield inventory.

**Section 8a — Data Transformation and Staging**
- For each dataset that requires transformation before loading: list required dataflows, transformation steps, and the source-to-destination field mapping summary (detail belongs in the TDD).
- **Dataflow dependencies:** List which dataflows must complete before the dataset refresh runs.
- **Incremental refresh:** Required if any fact table exceeds 10M rows or will grow to it within 12 months. State: archive window (years), incremental window (days), partitioning column (must be a date/datetime field).
- **Refresh sequencing:** If multiple datasets exist, list the required refresh order and any cross-dataset dependencies.
- Write "No dataflow dependencies" if the dataset connects directly to the source.

**Section 9 — Assumptions and Constraints**
- Assumptions: data availability, source system access, gateway configuration, environment readiness (DEV/UAT/PROD workspaces exist).
- Constraints: Power BI capacity tier (Pro / Premium Per User / Premium P-SKU), delegation limits, SSRS server version, data volume, model size limits (flag if expected > 1 GB).
- **Credential management:** All data source credentials must be stored in Azure Key Vault or the Power BI gateway credential store — no hardcoded credentials in PBIX or RDL files. State the credential storage approach for each data source.
- **Scalability:** State expected row growth over 3 years for each fact table; note if Premium capacity is required for large models or high concurrency (> 200 concurrent users).

**Section 10 — Open Questions**
- Every ambiguity that could not be resolved by inference.
- Status: Open for all questions raised here.

**Section 11 — Constitution Risks**
- Flag any requirement that conflicts with or stretches a constitution rule.
- Provide a compliant alternative for each risk.
- If none: write `None identified.`

**Section 12 — Acceptance Criteria**
- Given / When / Then scenarios — at least one positive and one negative path per module.
- Include an RLS acceptance criterion for every module that has RLS requirements.

**Section 13 — Document Control**
- Date and author populated; version 1.0.

**Section 14 — Traceability Matrix**
- Maps every source reference (business request, requirement ID) to its module and FR-NNN.
- If `/reporting-spec-alm` was used (structured intake): also include the L1/L2/L3 ALM IDs from the intake document, linking each FR-NNN to its parent Epic, Feature, and User Story IDs.

| Source Ref | Description | Module | FR-NNN | ALM Epic | ALM Feature | ALM Story |
|---|---|---|---|---|---|---|
| {REQ-NNN or document section} | {Brief description} | {Module} | FR-NNN | {EP-NNN or —} | {FT-NNN or —} | {US-NNN or —} |

**Section 15 — Brownfield Context** *(generated only when `brownfield.enabled: true`)*
- KPI and attribute mapping table for every FR that references an existing report, entity, or field.
  Table Name and Field Names must use exact names from `functional/entity-catalogue.md` and reporting docs:

  | FR | KPI / Attribute | Logic | Table Name | Field Names / Filters Applied | Action | Remarks |
  |---|---|---|---|---|---|---|
  | FR-NNN | {KPI or attribute name} | {Business calculation — plain language} | {Exact table from entity-catalogue} | {Exact field names and filter conditions} | REUSED \| EXTEND \| NEW | {Delta description or ⚠ flag} |

- **REUSED** — table and fields exist and are consumed unchanged; no schema change required.
- **EXTEND** — table or field exists but needs a new column, updated filter, or additional join; describe the delta in Remarks.
- **NEW** — no equivalent exists in `functional/entity-catalogue.md` or reporting docs; confirm absence before marking.
- For every EXTEND row: Remarks must state the specific change (e.g., "Add `new_field_name` column to `table_name`").
- For every NEW row: Remarks must confirm that no synonym or alias exists in the brownfield inventory.
- If `brownfield.enabled: false` or brownfield docs are absent: write `Not applicable — greenfield deployment.`

---

## Rules

- The spec is **functional only** — no DAX, no SQL, no PBIX implementation detail.
- Every functional requirement must be numbered FR-001, FR-002, … sequentially across all modules.
- Every business rule referenced inline must also appear in Section 7 with the report/measure it applies to.
- Flag any requirement that conflicts with the constitution as a **Constitution Risk** in Section 11.
- Do not invent requirements — only document what was stated or can be directly inferred.
- Do not leave Section 11 (Constitution Risks) or Section 10 (Open Questions) empty — write `None identified.` if applicable.
- Any report surfacing D365 entity data without an RLS requirement must be flagged as ⚠ RLS MISSING in Section 11.
- **AI Notes:** At the end of each major section and each individual FR block, append `> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or risk flagged}`. Write only what is non-obvious — never summarise the section content.
- Write the output to `specs/{feature-name}/spec.md` relative to **this template's root directory** — never relative to the location of the input requirements file, regardless of where the source requirements originate.
