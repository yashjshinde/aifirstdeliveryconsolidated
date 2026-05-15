---
applyTo: "specs/**,plans/**,tasks/**,output/**,docs-generated/**"
description: "Reporting constitution rules — auto-injected when editing reporting delivery artifacts. Enforces star-schema design, RLS requirements, DAX standards, sensitivity labels, WCAG AA, credential management, canvas size, embedding security, brownfield KPI table format, and test task naming."
---

# Reporting Constitution — Always-On Rules

These rules apply to ALL Reporting delivery artifacts. They are hard constraints, not suggestions. Every command must read `constitution/` before generating output.

---

## 1. Report Type Selection

| Use Case | Report Type |
|---|---|
| Self-service analytics, dashboards, interactive exploration | Power BI Interactive (.pbix) |
| Pixel-perfect, print-ready, structured output | Power BI Paginated Report (SSRS engine) |
| Operational reports embedded in D365 CE | SSRS (.rdl) — Fetch XML data source |
| Scheduled email delivery of formatted reports | Power BI Paginated or SSRS subscription |
| KPI tiles embedded in Canvas/Model-Driven App | Power BI Embedded (service principal) |

**Never** use Power BI interactive reports as a substitute for pixel-perfect documents.
**Never** use SSRS for exploratory analytics dashboards.

---

## 2. Data Model Standards

### Star Schema is Mandatory
- Fact tables: transactional, high row count, numeric measures, foreign keys only.
- Dimension tables: descriptive, low-to-medium row count, all filter/group-by attributes.
- **Never** use a flat denormalised table as the sole dataset table.
- Snowflake schemas are **not permitted** — flatten dimensions at the data model layer.

### Date Dimension — Mandatory
- Every dataset must contain a single `Date` dimension table marked as a Date Table.
- Contiguous date range: minimum 5 years back, 2 years forward.
- Columns: Date, Year, Quarter, Month, Month Number, Week, Day, Day of Week, Is Weekend, Is Working Day, Financial Year (if applicable).
- **Never** use date columns from fact tables directly in slicers.

### Relationship Design
- All relationships must be **single-direction** (one-to-many) unless bidirectional is explicitly justified in writing.
- Bidirectional relationships must be flagged: `⚠ PERFORMANCE RISK — bidirectional justified because {reason}`.
- Role-playing dimensions must use **inactive relationships** activated via `USERELATIONSHIP()` — not separate dimension copies.

### Storage Mode
| Scenario | Mode |
|---|---|
| Data < 1 GB, daily refresh sufficient | Import (preferred) |
| Real-time required, data > 1 GB | DirectQuery — flag ⚠ PERFORMANCE RISK if table > 50M rows |
| Large live fact + cached dimensions | Composite |

**DirectQuery requires explicit NFR justification and sign-off** — never use by default.

### Credentials — Never in PBIX
- All data source credentials stored in Azure Key Vault or Power BI gateway credential store — **never** in the PBIX file.
- Dataverse/D365 connections: use Power BI Dataverse connector with service principal authentication.
- SQL connections: named service account with read-only access.
- SFTP/file sources: use a certified dataflow to stage data first.

---

## 3. DAX Standards

### Measure Principles
- **Single Source of Truth** — all reusable measures in a dedicated `_Measures` table — **never** duplicate.
- **Never** define measures inline in a visual — always define as named model measures.
- Measure naming: `[Measure Name]` in Title Case — no underscores.
- Use explicit `CALCULATE()` wrappers when filters are modified — never rely on implicit filter context.
- Use `VAR` blocks for any expression used more than once.

### Required Measures (every dataset)
- A count measure for each fact table: `[{FactTable} Count]`.
- A last-refresh measure: `[Last Refresh UTC]`.

### Forbidden DAX Patterns
- `COUNTROWS(FILTER(...))` — replace with `CALCULATE(COUNTROWS(...), <filter>)`.
- `SUMX` over a large table where `SUM` on a pre-aggregated column suffices.
- Time intelligence functions on a non-marked Date table.
- `ALL()` without a documented reason in a measure comment.
- Circular dependencies — always validate before publishing.

---

## 4. Canvas and Layout Standards

### Canvas Size
- Interactive dashboards: **1280 × 720 px** (16:9).
- Detailed interactive reports: **1280 × 960 px**.
- Any deviation from these sizes requires written justification in the spec.
- Maximum 8 visuals per report page.
- Every page must have a title, last-refresh timestamp, and filter context label.

### Accessibility — WCAG AA Mandatory
- All charts must pass **WCAG AA contrast ratio (4.5:1 minimum)**.
- This applies to all interactive and embedded reports.
- Do not use colour alone to convey meaning — include labels or patterns.
- Tooltips must be informative — **never** show raw IDs or GUIDs to end users.

### Visual Standards
| Visual Type | Restrictions |
|---|---|
| Bar/Column chart | Max 20 categories without scrolling |
| Line chart | Always show data labels on final point |
| Card/KPI visual | Always include comparison period |
| Table/Matrix | Max 15 columns visible without horizontal scroll |
| Map visual | Must have data classification label; no PII on maps |
| Custom visual (AppSource) | Certified by Microsoft only — **no uncertified visuals** |
| AI visuals (Q&A, Decomp. Tree) | Exploratory reports only — not permitted in operational dashboards |

### Artefact Naming Conventions
| Artefact | Convention | Example |
|---|---|---|
| PBIX file | `{Project}-{Domain}-{ReportName}.pbix` | `Proj-Sales-PipelineDashboard.pbix` |
| Dataset | `{Project}-{Domain}-Dataset` | `Proj-Sales-Dataset` |
| Dataflow | `{Project}-{Domain}-Dataflow` | `Proj-Sales-Dataflow` |
| RDL file | `{Project}_{ReportName}.rdl` | `Proj_AccountStatement.rdl` |
| Measure | `[Measure Name]` Title Case | `[Total Revenue YTD]` |
| Table | PascalCase, singular noun | `SalesOrder`, `CustomerAccount` |
| Workspace | `{Project}-{Environment}` | `SalesProject-DEV` |

---

## 5. Security Standards

### RLS is Mandatory
- Every report connecting to D365 entity data or sensitive data **must** implement Row Level Security.
- A spec without RLS coverage is a **BLOCKER** at `/reporting-review`.
- Every RLS role must have a **named test user** identified in the spec.
- RLS table format: `Role Name | Filter Applied | User Group | Test User`.

### Sensitivity Labels — Mandatory on All Reports
Apply Microsoft Purview sensitivity labels:
- **Public**: aggregated KPIs with no PII, non-restricted data.
- **Internal**: internal business metrics not for external sharing.
- **Confidential**: personal data, financial records, or commercially sensitive data.
- **Highly Confidential**: legal/regulatory restricted data (GDPR special categories, financial audit).

**All reports containing D365 CE entity data** must be classified as **Confidential** minimum unless the data owner confirms otherwise.

A missing sensitivity label is a **BLOCKER** at `/reporting-review`.

### Embedding Security
- Reports embedded in D365 CE or Power Apps must use **service principal** authentication — **never** personal OAuth.
- Service principal must have Viewer access to workspace and Build access to dataset.
- Embedding tokens must **not** be stored client-side or in browser local storage.
- Power BI Embedded capacity must be in the same tenant as the data.

### Workspace Permissions
| Role | Who Gets It |
|---|---|
| Admin | Service principal for ALM pipeline + designated workspace admins only |
| Member | Report developers and data engineers |
| Contributor | CI/CD service account |
| Viewer | Business users |

Never grant Admin to individual user accounts in PROD workspace — use security groups.

---

## 6. SSRS and Paginated Report Standards

- Every report must use a **shared data source** — not embedded credentials.
- Datasets must use **stored procedures or parameterised queries** — no inline ad hoc SQL.
- Stored procedure names: `usp_Report_{ReportName}_{Purpose}`.
- D365 CE SSRS reports must use Fetch XML data source type — not direct SQL.
- Enable pre-filtering on all D365 CE SSRS reports.
- Every parameter must have descriptive labels — never expose technical field names.
- Parameters ordered: date range → primary entity filter → secondary filters → display options.
- Reports must support export to **PDF** (mandatory) and **Excel** (mandatory).

---

## 7. Incremental Refresh

Enable incremental refresh when:
- Fact table > 10M rows, AND
- A reliable `Date` column is available for partitioning.

Default configuration: 3 years archive + 7 days incremental window.
Flag datasets with fact tables > 10M rows that lack incremental refresh as **REQUIRED** in `/reporting-review`.

---

## 8. DevOps and ALM

- All `.pbix` files committed to Git under `output/{feature}/reports/`.
- All `.rdl` files committed to Git under `output/{feature}/rdl/`.
- All stored procedures committed under `output/{feature}/sql/`.
- **Never** publish PBIX directly from Desktop to PROD — always use the deployment pipeline.
- Three-stage deployment: **DEV → UAT → PROD** via Power BI deployment pipeline.
- Promotion DEV → UAT: requires spec APPROVED + FDD complete.
- Promotion UAT → PROD: requires test plan executed + UAT sign-off.
- Connection strings must be parameterised — **never** hardcoded.

---

## 9. Testing Standards

### Mandatory Paired Test Tasks
For every **Measure** task: generate a paired data-accuracy test task.
- Name: `TEST-{parent-task-id}-data-accuracy`
- Checks: tolerance ≤ ±0.01% against source system.

For every **RLS** task: generate a paired RLS validation test task.
- Name: `TEST-{parent-task-id}-rls-validation`
- Covers: happy path, exclusion path, and empty-state scenarios.

For every **Report-Interactive** or **Report-SSRS** task: generate a paired visual/render test task.
- Name: `TEST-{parent-task-id}-visual-render`
- Covers: page load time, cross-filter, drill-through, and export validation.

### NFR Performance Targets
| Metric | Target |
|---|---|
| Interactive report page load (Import) | < 3 seconds |
| Interactive report page load (DirectQuery) | < 5 seconds |
| Paginated/SSRS report render | < 10 seconds |
| Dataset refresh (< 500k rows) | < 15 minutes |
| DAX query response (single visual) | < 1 second (95th percentile) |

---

## 10. Brownfield Mode Rules

When `brownfield.enabled: true` in `constitution/10-alm-configuration.md`:

### Required Reading (every command)
Read ALL of the following before generating output — the `docs-path` points to the brownfield agent's `docs-generated/` ROOT folder:

```
{docs-path}/component-inventory.md
{docs-path}/functional/entity-catalogue.md        ← PRIMARY source for entity/attribute names
{docs-path}/functional/functional-overview.md
{docs-path}/functional/security-model.md
{docs-path}/architecture/data-model.md
{docs-path}/architecture/solution-blueprint.md
{docs-path}/reporting/reporting-inventory.md
{docs-path}/reporting/ssrs/{ReportName}.md        (all files in reporting/ssrs/)
{docs-path}/reporting/power-bi/{ReportName}.md    (all files in reporting/power-bi/)
```

### KPI Mapping Table Format
All spec KPIs in §5 must use this **6-column format**:

| KPI | Logic | Table Name | Field Names / Filters Applied | Display Format | Remarks |

All §15 Brownfield Context KPI rows must use this **7-column format** (adds Action):

| FR | KPI | Logic | Table Name | Field Names / Filters Applied | Action | Remarks |

Action values: **NEW** | **EXTEND** | **REPLACE** | **REFERENCED**.

### Brownfield Annotation Rules
- Every Level-4 task annotated with brownfield-action: NEW | EXTEND | REPLACE | REFERENCED.
- EXTEND tasks: list which existing fields/measures are **REUSED** vs which are **net-new additions**.
- REPLACE tasks: name the specific existing artefact being superseded.
- Do **not** plan build tasks for components already in the brownfield estate without justification.

---

## 11. Document Generation Rules

### AI Notes — Mandatory
At the end of each major section and each FR/measure block, append:
`> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or risk flagged}.`
Write only what is non-obvious — never summarise section content.

### Completeness
- Every report in the catalogue must be fully documented — no truncation.
- Every measure must appear with business definition (FDD) and DAX expression (TDD).
- Every RLS role must appear in both FDD (business description) and TDD (DAX filter expression).
- Flag any FR not fully addressed as a **Design Gap** — do not silently omit.

### Traceability
- Every Level-4 task must trace to at least one FR-NNN.
- Every generated document must link design decisions back to FR-NNN from the approved spec.

### Flagging Conventions
```
⚠ NEEDS REVIEW          Cannot determine intent from requirement
⚠ PERFORMANCE RISK      DirectQuery on large table without aggregation
⚠ RLS MISSING           Report surfaces restricted data with no RLS defined
⚠ CERTIFIED DATASET     Must use existing certified dataset — do not duplicate
*(inferred)*             Derived from context, not stated explicitly
*(assumed)*              Assumed value — must be confirmed before build
```

---

## 12. Implementation Sequence — Phase Rules

- **Phase 1**: DataModel + Dataflow tasks + workspace/gateway configuration — must come before all other tasks.
- **Phase 2**: Measure + RLS tasks — must come before any report build task that uses them.
- **Phase 3**: Report build tasks — after data model and measures are complete.
- **Phase 4**: Testing + Deployment tasks — after report build is complete. Refresh schedule and deployment pipeline configuration also in Phase 4.
