# Reporting Agent Template

Spec-driven development template for **Power BI reports, SSRS reports, and Power BI Paginated Reports** using Claude Code.

This agent takes a reporting requirement from a natural language description all the way to documented, deployment-ready assets — datasets, measures, RLS configurations, RDL specifications, and operational documentation.

---

## Table of Contents

- [1. What Is It](#1-what-is-it)
- [2. How It Works](#2-how-it-works)
  - [The process](#the-process)
  - [Gates](#gates)
  - [Phase 1 — Define the Requirement](#phase-1--define-the-requirement)
    - [/spec](#spec--write-the-functional-specification)
    - [/spec-alm](#spec-alm--import-and-enhance-alm-work-items)
    - [/review](#review--validate-the-spec-against-the-constitution)
    - [/split-spec](#split-spec--split-a-mixed-reporting--ce--integration--data-migration-spec)
    - [/fdd](#fdd--generate-the-functional-design-document)
    - [/testplan](#testplan--generate-the-test-plan-and-strategy)
    - [/extract testplan](#extract-testplan--extract-test-plan-to-alm-ready-files)
    - [/extract testsuites](#extract-testsuites--extract-one-or-all-test-suites)
    - [/extract testcases](#extract-testcases--extract-one-or-all-test-cases)
    - [/alm sync-testplan](#alm-sync-testplan--sync-alm-ids-back-to-test-files)
  - [Phase 2 — Design the Technical Solution](#phase-2--design-the-technical-solution)
    - [/plan](#plan--generate-the-technical-plan)
    - [/clarify](#clarify--review-the-plan-for-task-readiness)
    - [/tdd](#tdd--generate-the-technical-design-document)
    - [/blueprint](#blueprint--generate-the-solution-blueprint)
  - [Phase 3 — Build](#phase-3--build)
    - [/task](#task--generate-dev-ready-task-cards)
    - [/validate](#validate--validate-tasks-before-implementation)
    - [/implement](#implement--generate-assets-and-track-progress)
    - [/document](#document--generate-operational-documentation)
    - [/alm](#alm--synchronise-work-items-with-your-alm-tool)
- [Brownfield Mode](#brownfield-mode)
- [3. Structure and Outputs](#3-structure-and-outputs)
- [Configuration](#configuration)

---

## 1. What Is It

### The problem it solves

Each reporting requirement — a Power BI sales dashboard, an SSRS invoice report, a composite dataset — needs a spec, a data model design, RLS rules, test cases, and deployment assets. Without a structured process, requirements are vague, RLS gaps are discovered late, and datasets are rebuilt from scratch on each project.

This template enforces a consistent, gate-driven workflow for every reporting feature — from plain-language requirement to reviewed, tested, and documented deliverables.

### Generated documents

| Document | When | Audience |
|---|---|---|
| Functional Design Document | After spec is APPROVED | Business stakeholder, BA, UAT team |
| Test Plan and Strategy | After spec is APPROVED | QA, BA — covers all FR test cases |
| Technical Design Document | After plan is TASK-READY | Solution Architect, BI Lead |
| Solution Blueprint | After plan is TASK-READY | Solution Architect |
| Deployment Guide | After implementation | Ops, release manager |
| Data Dictionary | After implementation | Business users, data consumers |
| Release Notes | After implementation | Stakeholders |

### Supported report types

| Type | Description | Tooling |
|---|---|---|
| **Power BI Interactive** | Self-service analytics dashboards and reports | Power BI Desktop / Service |
| **Power BI Paginated** | Pixel-perfect, print-ready documents | Power BI Report Builder (SSRS engine) |
| **SSRS** | Operational reports embedded in D365 CE, subscription delivery | SQL Server Reporting Services |

---

## 2. How It Works

### The process

```
PHASE 1 — DEFINE

  [Unstructured intake — plain-language requirement]
  /spec ──► /review ──[APPROVED]──► /fdd
             │         │           └──► /testplan
             │         └──[BROWNFIELD?]──► /impact ──[IMPACT-ASSESSED]──► (continue to /plan)
             └──[MIXED DOMAIN?]──► /split-spec ──► /review (re-run on scoped spec)

  [Structured intake — L1/L2/L3 from ALM tool]
  /spec-alm ──► /review ──[APPROVED]──► /fdd
                                      └──► /testplan

  [Structured intake — L3 optional]
  Set l3-intake: optional when L3 items are not yet defined in the ALM tool.
  /spec-alm accepts L1/L2 input; L2 branches without L3 are marked pending.
  /plan generates missing L3 User Stories for pending branches, then Tasks under all L3s.
  (set requirement-intake: structured AND l3-intake: optional in constitution/10-alm-configuration.md)

  Configure intake mode in constitution/10-alm-configuration.md
  (requirement-intake: unstructured | structured)
  (l3-intake: required [default] | optional)

PHASE 2 — DESIGN
  /plan ──► /clarify ──[TASK-READY]──► /tdd
                                     └──► /blueprint

            ↳ auto-scans for cross-feature conflicts; updates _component-registry.md

  In structured mode /plan generates Task items only — L1/L2/L3 are not recreated.
  In L3-optional mode /plan also generates new L3 User Stories for pending L2 branches.

PHASE 3 — BUILD
  /task ──► /validate ──[READY TO IMPLEMENT]──► /implement ──► /document
```

### Gates

| Gate | Set by | Blocks |
|---|---|---|
| APPROVED | `/review` writes `status: APPROVED` in review.md | `/fdd`, `/testplan`, `/plan` will not run |
| IMPACT-ASSESSED | `/impact` writes `status: IMPACT-ASSESSED` in impact-analysis.md | `/plan` will not run *(brownfield mode only)* |
| TASK-READY | `/clarify` writes `status: TASK-READY` in clarify.md | `/tdd`, `/blueprint`, `/task` will not run |
| READY TO IMPLEMENT | `/validate` writes `validation-status: READY TO IMPLEMENT` in each task card | `/implement` will refuse to run |

---

### Phase 1 — Define the Requirement

#### `/spec` — Write the Functional Specification

Takes your reporting requirement in plain language and produces a structured functional specification.

```
/spec

Example description:
"We need a Power BI sales dashboard showing revenue by region, product, and rep.
 It must filter by date range and territory.
 Sales Managers see all regions; Sales Reps see only their territory.
 Data comes from D365 CE Dataverse — Opportunity and Account entities."
```

Output: `specs/{feature-name}/spec.md`

Contains:
- Business objective and success criteria
- In-scope / out-of-scope
- Actors, personas, and security roles
- Report catalogue (report name, type, workspace, sensitivity label, environment naming)
- Numbered functional requirements (FR-001, FR-002, …) each with:
  - Report type, target audience, canvas size, data sources (including stored proc name for SSRS)
  - RLS roles with named test users
  - Accessibility requirements (WCAG AA)
  - Embedding scenarios (service principal required)
  - Export/delivery requirements (subscription details, schedule, format)
  - KPIs in **6-column format**: `KPI | Logic | Table Name | Field Names / Filters Applied | Display Format | Remarks`
- §6 Report Impact Summary with Sensitivity Label column
- Business rules (BR-NNN)
- §8 Data Model Requirements (star schema, date dimension columns, relationship direction rules)
- §8a Dataflow Dependencies (dataflow-to-dataset dependencies, incremental refresh, refresh sequencing)
- §9 Assumptions and Constraints (credential storage per data source, capacity tier, 3-year row growth per fact table)
- §14 Traceability Matrix with ALM Epic/Feature/Story ID columns
- §15 Brownfield Context *(brownfield mode only)* — **7-column format**: `FR | KPI | Logic | Table Name | Field Names / Filters Applied | Action | Remarks`
- Open questions

---

#### `/spec-alm` — Import and Enhance ALM Work Items

Use when your requirements already exist as L1/L2/L3 work items in Azure DevOps, Jira, or a similar tool.
Instead of writing a spec from scratch, this command imports your existing hierarchy, preserves all ALM IDs,
and enhances each L3 item with FR-NNN requirements, acceptance criteria, Reporting impact, and business rules.

**Pre-requisite:** Set `requirement-intake: structured` in `constitution/10-alm-configuration.md`.

```
/spec-alm

Paste or describe your ALM work items, e.g.:
EP-001 | L1 | Feature  | Sales Reporting          | Power BI sales performance reporting suite
FT-001 | L2 | Epic     | Revenue Dashboard        | Dashboard showing revenue by region and product
US-001 | L3 | Story    | Revenue by region visual | As a Sales Manager, I want to see revenue by region...
US-002 | L3 | Story    | Territory RLS            | As a Sales Rep, I want to see only my territory data...
```

Output: `specs/{feature-name}/spec.md`

Contains:
- YAML front matter with `intake: structured` and all L1/L2/L3 ALM IDs
- Section 5 organised by L1 → L2 → L3, each L3 enhanced with FR-NNN requirements
- Original ALM work item descriptions preserved verbatim before each enhancement
- Consolidated business rules (BR-NNN), Reporting impact (datasets, measures, RLS roles), open questions, constitution risks
- §13 ALM Traceability Matrix: L3-ALM-ID → FR-NNN — used by `/plan` in structured mode

**Effect on `/plan`:** When the spec has `intake: structured`, `/plan` reads the existing L3 ALM IDs
from §13 and generates Task-level items only. The L1/L2/L3 hierarchy is NOT recreated — tasks are
parented directly to your existing work items.

##### L3-Optional Mode

When `l3-intake: optional` is set in `constitution/10-alm-configuration.md`, L3 work items do not need
to be fully populated in your ALM input. This is useful when the L1/L2 hierarchy is defined but User
Stories are not yet written.

| Configuration | Behaviour |
|---|---|
| `l3-intake: required` *(default)* | All L2 branches must have at least one L3 item. `/spec-alm` stops if any L2 has no L3. |
| `l3-intake: optional` | L3 may be absent or partial. `/spec-alm` marks gaps as pending. `/plan` generates new L3 User Stories for pending L2 branches, then Tasks under all L3s. |

**What `/spec-alm` does in L3-optional mode:**
- ALM-provided L3 items are enhanced as normal (FR-NNN requirements, acceptance criteria, Reporting impact)
- L2 branches with no L3 items get a pending placeholder block in §5 of the spec
- The ALM Traceability Matrix (§13) gains a **Source** column: `alm` for provided L3s, `pending` for gaps

---

#### `/review` — Validate the Spec Against the Constitution

Checks the spec against all Reporting constitution rules. Assigns APPROVED or NEEDS REWORK.

```
/review sales-performance-dashboard
```

Output: `specs/{feature-name}/review.md`

Contains:
- BLOCKER — constitution violations (must resolve before approval)
- REQUIRED — missing information (must resolve before `/plan`)
- ADVISORY — best practice gaps
- **Status: APPROVED / REQUIRES CHANGES**

**Category 0 — Multi-Domain Detection** (CE / Integration / Data Migration signals → BLOCKER):
> `/review` scans for CE signals (D365 entity embedding, plugin-triggered refresh, security role mapping), Integration signals (Azure Function feed, Service Bus event), and Data Migration signals (ADF pipeline, SFTP staging table) before any other check. If found, it raises a BLOCKER and directs you to run `/split-spec` first.

**New BLOCKER checks (beyond RLS missing):**
- KPI table does not have all 6 columns including Display Format
- RLS role present in spec but named test user is missing
- Sensitivity label column absent from §6 Report Impact Summary
- Report sourcing D365 entity data not classified as Confidential minimum
- Embedding scenario specified without service principal authentication
- Date dimension table absent from dataset
- Bidirectional relationship proposed without justification

**New REQUIRED checks:**
- §8a Dataflow Dependencies not present
- Canvas size deviation without justification
- Accessibility requirements missing for interactive/embedded reports
- Incremental refresh not addressed for datasets with fact tables > 10M rows
- §15 Brownfield Context absent when brownfield.enabled = true
- §15 EXTEND rows missing explicit delta description

Status is `APPROVED` only when BLOCKER count = 0. REQUIRED items do not block approval but must be resolved before `/plan`.

If REQUIRES CHANGES: fix the issues in spec.md and re-run `/review`.

---

#### `/split-spec` — Split a Mixed Reporting + CE / Integration / Data Migration Spec

Use when a spec contains Reporting requirements alongside D365 CE, Integration, or Data Migration requirements. `/review` will surface any mixed-domain content as a BLOCKER automatically.

```
/split-spec sales-performance-dashboard
```

What it does:
1. Classifies every FR as Reporting / CE / Integration / Data Migration / Cross-cutting
2. Rewrites `specs/{feature-name}/spec.md` scoped to Reporting only
3. Creates `specs/{feature-name}-ce/spec.md` in CE agent format — for CE embedding, plugin triggers, or security role provisioning
4. Creates `specs/{feature-name}-integration/spec.md` in Integration agent format — only when event-driven pipeline FRs exist
5. Creates `specs/{feature-name}-data-migration/spec.md` in Data Migration agent format — only when ADF/SFTP FRs exist
6. Writes `specs/{feature-name}/split-manifest.md` with the FR mapping and next-steps checklist

Output:
```
specs/{feature-name}/spec.md                            ← updated: Reporting-scoped
specs/{feature-name}-ce/spec.md                         ← new: CE agent spec (if CE FRs exist)
specs/{feature-name}-integration/spec.md                ← new: Integration agent spec (if INT FRs exist)
specs/{feature-name}-data-migration/spec.md             ← new: Data Migration agent spec (if DM FRs exist)
specs/{feature-name}/split-manifest.md                  ← FR classification table + next steps
```

After running `/split-spec`, re-run `/review {feature-name}` on the now-scoped Reporting spec.

---

#### `/fdd` — Generate the Functional Design Document

Expands the approved spec into a full FDD in business language.

```
/fdd sales-performance-dashboard
```

Output: `docs-generated/{feature}/functional-design-document.md`

Contains:
- Report catalogue with mockup descriptions (visual layout, key metrics, filter controls per report)
- RLS design (role definitions, filter expressions in plain language, test scenarios)
- Data source mapping (source entities/tables → dataset tables → report visuals)
- Business rules detail
- Data refresh schedule and strategy
- Functional gap log

Reviewed by: Business stakeholder, Product Owner, BA — before technical work begins.

---

#### `/testplan` — Generate the Test Plan and Strategy

Reads every FR in the spec and generates a complete test plan with test cases for each requirement.

```
/testplan sales-performance-dashboard
```

Output:
- `docs-generated/{feature}/test-plan-and-strategy.md` — strategy, scope, reference tables, traceability matrix
- `docs-generated/{feature}/test-cases/data-accuracy.md` — data accuracy and measure validation test cases
- `docs-generated/{feature}/test-cases/uat.md` — UAT test cases (Business User assigned)
- `docs-generated/{feature}/test-cases/rls-security.md` — one test per RLS role (happy path + exclusion path + empty state)
- `docs-generated/{feature}/test-cases/regression.md` — regression test cases

Contains:
- Test strategy (risk-based)
- Test types: Data Accuracy, UAT, RLS Security, Regression
- Full test case cards per suite in separate files
- Test data requirements (date ranges, sample records, DAX expected values)
- Entry and exit criteria per test level
- Defect severity definitions

Functional test cases are written here — before any technical planning — so QA and business can review coverage early.

---

#### `/extract testplan` — Extract Test Plan to ALM-Ready Files

Reads the test plan and all suite files, then writes ALM-ready output. The JSON file is the primary ALM import artifact — all test case content is preserved as raw markdown. The CSV carries metadata only.

```
/extract testplan sales-performance-dashboard
```

Output:
- `docs-generated/{feature}/alm-extract/test-plan-extract.json` — **primary ALM import**: full rich content, steps as `{ step, action, expected }` array, `content-format: "markdown"`
- `docs-generated/{feature}/alm-extract/test-plan-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/test-plan-summary.md` — human-readable review copy with suite breakdown

---

#### `/extract testsuites` — Extract One or All Test Suites

Extracts one or all test suites with full step detail and rich content intact.

```
/extract testsuites sales-performance-dashboard
/extract testsuites sales-performance-dashboard rls-security
```

Suite options: `data-accuracy` | `uat` | `rls-security` | `regression` | `all` (default)

Output:
- `docs-generated/{feature}/alm-extract/suites-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{feature}/alm-extract/suites-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/suites-summary.md`

---

#### `/extract testcases` — Extract One or All Test Cases

Extracts a single test case or every test case across all suites, with full step detail and rich content intact.

```
/extract testcases sales-performance-dashboard
/extract testcases sales-performance-dashboard TC-SALES-DA-003
```

Output:
- `docs-generated/{feature}/alm-extract/testcases-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{feature}/alm-extract/testcases-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/testcases-detail.md` — full formatted cards for human review

---

#### `/alm sync-testplan` — Sync ALM IDs Back to Test Files

After creating test cases in ALM (which assigns ALM IDs), write the IDs back into the test plan reference tables and suite files.

```
# Bulk — reads docs-generated/{feature}/alm-extract/alm-mapping.csv
/alm sync-testplan sales-performance-dashboard

# Single
/alm sync-testplan sales-performance-dashboard TC-SALES-DA-001 12344
```

Mapping file format:
```
TC ID,ALM ID
TC-SALES-DA-001,12344
TC-SALES-UAT-001,12348
TC-SALES-SEC-001,12350
```

Updates both the main `test-plan-and-strategy.md` reference tables and the individual suite files.

---

### Phase 2 — Design the Technical Solution

#### `/plan` — Generate the Technical Plan

Decomposes the approved spec into Epic → Feature → User Story → Task hierarchy.

```
/plan sales-performance-dashboard
```

Output: `plans/{feature}/plan.md` + `plans/{feature}/work-items.yaml`

Contains:
- Epic and Feature structure
- User Stories (As a … I want … so that …)
- High-level tasks — component type (Dataset/Measure/Report/RLS/SSRS/Workspace), dependencies, complexity (S/M/L/XL)
- Full task inventory table
- Constitution exception requests

Tasks at this stage are WHAT to build — no DAX code, no schema DDL.

Each Task (L4) is annotated with:
- Component type: Dataset | DataModel | Measure | RLS | Report-Interactive | Report-Paginated | Report-SSRS | Dataflow | Configuration | Deployment | Testing
- Role: Developer | BI Developer | Data Engineer | QA | Functional
- Complexity: S | M | L | XL
- Brownfield action *(brownfield mode only)*: NEW | EXTEND | REPLACE | REFERENCED

**Mandatory paired test tasks are auto-generated:**
- Every Measure task → `TEST-{id}-data-accuracy` (tolerance ≤ ±0.01%)
- Every RLS task → `TEST-{id}-rls-validation` (happy path + exclusion + empty state)
- Every Report-Interactive or Report-SSRS task → `TEST-{id}-visual-render` (page load + cross-filter + drill-through)

**Implementation phases:**
- Phase 1: DataModel + Dataflow + workspace/gateway configuration (data foundation first)
- Phase 2: Measure + RLS tasks (semantic layer)
- Phase 3: Report build tasks (visual layer)
- Phase 4: Testing + deployment pipeline configuration + refresh schedule configuration

**Structured mode:** When the spec has `intake: structured`, `/plan` generates Task items only — the L1/L2/L3 hierarchy is not recreated.

**L3-optional mode:** When `l3-intake: optional` is also set, `/plan` first generates new L3 User Stories for any L2 branches marked pending in the spec, then generates Tasks under all L3s.

**Cross-feature scan:** `/plan` automatically scans existing plans for shared Reporting components (Power BI datasets, reports, SSRS reports, DAX measures, RLS roles, Dataflows, workspaces) and surfaces overlaps in **Section 4a — Cross-Feature Dependencies**. It also updates `plans/_component-registry.md` after generation.

---

#### `/clarify` — Review the Plan for Task Readiness

Evaluates every task against the Reporting task readiness rubric. Flags tasks too ambiguous for a dev-ready card.

```
/clarify sales-performance-dashboard
```

Output: `plans/{feature}/clarify.md`

Contains:
- Per-task status: READY / BLOCKED / QUESTION
- Blockers: missing dataset name, storage mode, RLS role definition, or measure formula intent
- Questions with assumed answers if left unanswered
- Dependency risks (dataset must exist before report references it; RLS must be defined before workspace publish)
- **Status: TASK-READY / PARTIALLY READY / NOT READY**

---

#### `/tdd` — Generate the Technical Design Document

Produces the full TDD covering star schema design, DAX measure catalogue, RLS expressions, and deployment configuration.

```
/tdd sales-performance-dashboard
```

Output: `docs-generated/{feature}/technical-design-document.md`

Contains:
- Architecture decisions with constitution rule references
- Star schema diagram (fact/dimension tables, relationships, storage mode decisions)
- Full DAX measure catalogue (measure name, table, expression, format string, description)
- RLS role definitions (DAX filter expressions per role, test user mapping)
- SSRS stored procedure specifications (parameters, joins, result sets) *(if SSRS reports present)*
- Workspace and deployment pipeline design
- Technical risks and mitigations

Reviewed by: Solution Architect, BI Lead — before task cards are written.

---

#### `/blueprint` — Generate the Solution Blueprint

Selects an architecture pattern and produces a high-level blueprint.

```
/blueprint sales-performance-dashboard
```

Output: `docs-generated/{feature}/solution-blueprint.md`

Patterns available for Reporting:
- **Import Dataset** — full import mode; scheduled refresh; best for moderate data volumes
- **DirectQuery** — live query to source; no refresh needed; subject to performance constraints
- **Composite Model** — import for aggregations + DirectQuery for detail; best for large datasets
- **SSRS Embedded** — report rendered inside D365 CE; SSRS server required
- **Paginated Report (PBRS)** — Power BI paginated; pixel-perfect print/export

Contains:
- Pattern selected with rationale and alternatives rejected
- Data flow diagram (source → dataset → reports → users)
- Security architecture (RLS design, workspace permissions, sensitivity labels)
- ALM and deployment strategy
- Technical risks table

Reviewed by: Solution Architect — before implementation begins.

---

### Phase 3 — Build

#### `/task` — Generate Dev-Ready Task Cards

Converts every high-level task into a standalone task card a BI developer can implement without asking questions.

```
/task sales-performance-dashboard
```

Output:
```
tasks/{feature}/01-dataset-star-schema.md
tasks/{feature}/02-sales-revenue-measures.md
tasks/{feature}/03-rls-territory-roles.md
tasks/{feature}/04-revenue-by-region-report.md
tasks/{feature}/05-ssrs-invoice-sp.md
...
```

Each task card contains:
- Component type (Dataset / Measure / Report / RLS / SSRS / Workspace), FR refs, complexity, output path
- `validation-status: NOT VALIDATED`
- Context — why this task exists
- Dataset tasks: table definitions, relationships, storage mode, incremental refresh config
- Measure tasks: DAX expression, format string, table, description, hidden/visible
- RLS tasks: role name, DAX filter per table, test user
- Report tasks: page layout, visuals, filters, slicers, bookmarks
- SSRS tasks: stored procedure spec, parameters, data source
- Acceptance criteria (AC-001, …) — testable statements
- Test cases — one per AC minimum
- Definition of Done checklist

---

#### `/validate` — Validate Tasks Before Implementation

Final gate before assets are built. Sets `validation-status` on every task card.

```
/validate sales-performance-dashboard           ← all tasks for a feature
/validate sales-performance-dashboard/03-*.md   ← single task
```

What is checked:

| Check | Reporting specifics |
|---|---|
| Completeness | ACs testable, test cases exist, output path defined |
| Dataset tasks | Storage mode specified, date table identified, relationship cardinality set |
| Measure tasks | DAX expression intent clear, format string specified, parent table named |
| RLS tasks | DAX filter expression complete, all roles covered, test user identified |
| TDD alignment | Table names, measure names, RLS role names match TDD |
| Blueprint alignment | Storage mode consistent with chosen architecture pattern |
| Dependency order | Dataset before measures; dataset and RLS before reports; workspace before deployment |
| Constitution | Naming conventions, star schema rules, sensitivity label policy |

Each task card is updated to `READY TO IMPLEMENT`, `NEEDS REWORK`, or `BLOCKED`.

---

#### `/implement` — Generate Assets and Track Progress

Reads a validated task card, generates all BI assets and scripts, produces a task-level implementation record, and updates the feature tracker. Refuses to run if `validation-status` is not `READY TO IMPLEMENT`.

```
/implement sales-performance-dashboard/01-dataset-star-schema.md
/implement sales-performance-dashboard/02-sales-revenue-measures.md
/implement sales-performance-dashboard/03-rls-territory-roles.md
```

**What is generated per component type:**

| Component | Asset generated | Implementation record |
|---|---|---|
| Dataset | TMDL files (model.tmdl, tables/*.tmdl, relationships.tmdl) | Tables created, relationships defined, refresh configured, AC sign-off |
| Measure Set | DAX measure file (.dax) per table | Measures written, format strings set, AC sign-off |
| RLS Role | RLS definition file (.tmdl or JSON) | Roles defined, DAX filter expressions, AC sign-off |
| Power BI Report | Report spec (page layout, visuals, filters in Markdown) | Pages defined, visuals mapped to measures, AC sign-off |
| Paginated Report | RDL spec (parameters, dataset query, layout sections) | RDL sections defined, parameters documented, AC sign-off |
| SSRS Stored Proc | SQL script (CREATE PROCEDURE) | Proc written, parameters documented, AC sign-off |
| Workspace | Deployment configuration (workspace settings, pipeline stages) | Workspaces documented, pipeline config, AC sign-off |

**Implementation tracker** (`tasks/{feature}/tracker.md`) — created on first `/implement` run, updated on every subsequent run.

---

#### `/document` — Generate Operational Documentation

Reads all artefacts for a completed feature and generates release documents.

```
/document sales-performance-dashboard
```

Output:
```
docs-generated/{feature}/data-dictionary.md       ← table/column/measure definitions for business users
docs-generated/{feature}/deployment-guide.md      ← workspace setup, pipeline stages, publish steps, SSRS deploy
docs-generated/{feature}/asset-registry.md        ← inventory of all PBIX, TMDL, RDL, SQL artefacts
docs-generated/{feature}/release-notes.md         ← what was built and why
```

---

#### `/alm` — Synchronise Work Items with Your ALM Tool

Manages the link between this project's work breakdown and an external ALM tool. Configure the tool, hierarchy, and field mapping in `constitution/10-alm-configuration.md` before running this command.

Four sub-commands:

**`extract`** — Build the full work-item payload so an external ALM Agent can create items with correct parent-child links.

```
/alm extract sales-performance-dashboard
```

Reads `plans/{feature}/work-items.yaml`, assigns stable UIDs, and writes a JSON payload with all four hierarchy levels.

Output: `output/{feature}/alm/extract-{YYYYMMDD-HHmmss}.json`

**`sync`** — Write the ALM-assigned IDs back into the project after the ALM Agent has created the work items.

```
# Single item
/alm sync sales-performance-dashboard sales-performance-dashboard-T-001 12345

# Bulk file
/alm sync sales-performance-dashboard --file output/sales-performance-dashboard/alm/alm-response.json
```

Updates `work-items.yaml` with `alm-id` values. For Task-level items also updates `alm-id` in the matching task card.

**`get`** — Retrieve the current full state of a specific work item by its ALM ID.

```
/alm get sales-performance-dashboard 12345
```

Output: `output/{feature}/alm/get-{alm-id}-{YYYYMMDD}.json`

**`sync-testplan`** — Write test-case ALM IDs back into the test plan and suite files after the test management tool has created them.

```
# Bulk
/alm sync-testplan sales-performance-dashboard

# Single
/alm sync-testplan sales-performance-dashboard TC-SALES-DA-001 12344
```

---

## Brownfield Mode

Use brownfield mode when adding to or extending an **existing reporting environment** — Power BI workspaces, datasets, measures, RLS roles, or SSRS reports that are already in production.

Brownfield mode requires an existing D365 CE brownfield agent output. The CE Brownfield agent generates its documentation in a `docs-generated/` folder with a well-known structure containing entity catalogues, data models, security models, and reporting artefacts.

### How to enable

**Step 1 — Run the D365 CE Brownfield agent** to generate the brownfield documentation in its `docs-generated/` folder. This is the source of truth for all existing entities, attributes, and reporting artefacts.

**Step 2 — Enable brownfield mode** in `constitution/10-alm-configuration.md`, pointing `docs-path` to the brownfield agent's `docs-generated/` **ROOT** folder (not a subfolder):

```yaml
brownfield:
  enabled: true
  docs-path: ../d365-ce-brownfield/docs-generated
```

**Step 3 — Run the additional `/impact` command** after `/review` and before `/plan`:

```
/spec sales-performance-dashboard
/review sales-performance-dashboard
/impact sales-performance-dashboard          ← brownfield mode only
/plan sales-performance-dashboard
```

### Documents read in brownfield mode

Every command reads the FULL brownfield documentation set before generating output:

| Document | Path | Purpose |
|---|---|---|
| Solution overview | `{docs-path}/component-inventory.md` | Component counts and package breakdown |
| **Entity catalogue** | `{docs-path}/functional/entity-catalogue.md` | **Primary source** — all D365/Dataverse entities with attributes, field names, and data types |
| Functional overview | `{docs-path}/functional/functional-overview.md` | Business process context |
| Security model | `{docs-path}/functional/security-model.md` | Existing security roles and access patterns |
| Data model | `{docs-path}/architecture/data-model.md` | Entity relationships and cardinality |
| Solution blueprint | `{docs-path}/architecture/solution-blueprint.md` | Solution architecture |
| Reporting inventory | `{docs-path}/reporting/reporting-inventory.md` | Existing reports, data sources, workspaces |
| SSRS reports | `{docs-path}/reporting/ssrs/{ReportName}.md` | Per-SSRS-report detail (fields, parameters, queries) |
| Power BI reports | `{docs-path}/reporting/power-bi/{ReportName}.md` | Per-Power-BI-report inventory |

This ensures KPIs and attributes are mapped to **existing D365 entity names and field names** from `entity-catalogue.md` rather than invented new.

### The `/impact` command

Reads the approved spec against the full brownfield documentation set and classifies every component the feature will touch:

| Classification | Meaning |
|---|---|
| `NEW` | Does not exist in the brownfield system — create from scratch |
| `EXTEND` | Exists; new capability added (new measure, new report page, new RLS role, new column) |
| `REPLACE` | Exists; logic substantially rewritten |
| `REFERENCED` | Exists and consumed but its definition does not change |
| `CONFLICT` | Exists but the spec's intent contradicts the current behaviour — needs resolution |

Output: `specs/{feature}/impact-analysis.md` (status: IMPACT-ASSESSED)

`/plan` reads this file in brownfield mode and stamps every task with `brownfield-action`, so developers know exactly what they are modifying vs creating.

### What changes in each command

| Command | Brownfield behaviour |
|---|---|
| `/spec` | Reads ALL brownfield docs above; maps KPIs and attributes to existing D365 entities/fields from entity-catalogue.md; adds §15 Brownfield Context with 7-column field-level mapping table |
| `/review` | Checks §15 is present and populated for any FR that touches an existing entity or report |
| `/impact` | Reads ALL brownfield docs; full impact analysis — NEW / EXTEND / REPLACE / REFERENCED / CONFLICT classification |
| `/plan` | Requires impact-analysis.md; reads ALL brownfield docs; stamps `brownfield-action` on every task; lists REUSED vs net-new fields |
| `/tdd` | Reads ALL brownfield docs; uses entity-catalogue and data-model as baseline; extends existing _Measures table rather than duplicating |
| `/task` | Reads ALL brownfield docs; populates Existing Fields from entity-catalogue; Technical Approach cites exact field names from brownfield inventory |
| `/blueprint` | Reads existing workspace/deployment docs as baseline; adds §9 Brownfield Architecture Delta |
| `/implement` | Reads existing component doc before generating assets; extension safety enforced |

---

## 3. Structure and Outputs

### Folder structure

```
reporting/
│
├── .claude/
│   ├── commands/               ← The 22 slash commands (alm has 4 sub-commands; extract has 3)
│   └── settings.json           ← Write permissions scoped to output folders
│
├── constitution/               ← Non-negotiable Reporting rules every command follows
│   ├── 00-index.md
│   ├── 00-architectural-principles.md     ← Report type selection, inference rules, flagging conventions
│   ├── 01-report-design-standards.md      ← Layout, visual standards, naming conventions
│   ├── 02-data-model-standards.md         ← Star schema, storage modes, date table, relationship design
│   ├── 03-power-bi-standards.md           ← DAX standards, workspace organisation, publishing rules
│   ├── 04-ssrs-paginated-standards.md     ← RDL design, parameters, shared data sources, subscriptions
│   ├── 05-security-standards.md           ← RLS patterns, workspace permissions, sensitivity labels
│   ├── 06-devops-alm.md                   ← Deployment pipeline, source control, CI/CD, rollback
│   ├── 07-testing-standards.md            ← Data accuracy, RLS validation, UAT, performance
│   ├── 08-document-generation-rules.md    ← Output paths and format rules for all generated documents
│   ├── 09-nfr-targets.md                  ← Default performance, availability, and data freshness targets
│   ├── 10-alm-configuration.md            ← ALM tool, work item hierarchy, field mapping, brownfield config
│   └── CLAUDE.md                          ← Auto-loaded by Claude Code; full command reference
│
├── specs/{feature}/
│   ├── spec.md                            ← Written by /spec or /spec-alm
│   ├── review.md                          ← Written by /review (APPROVED / NEEDS REWORK)
│   ├── impact-analysis.md                 ← Written by /impact (IMPACT-ASSESSED) — brownfield mode only
│   └── split-manifest.md                  ← Written by /split-spec
│
├── plans/{feature}/
│   ├── plan.md                            ← Written by /plan
│   ├── work-items.yaml                    ← Written by /plan; consumed by /alm extract
│   └── clarify.md                         ← Written by /clarify (TASK-READY / NOT READY)
│
├── tasks/{feature}/
│   ├── NN-{task-name}.md                  ← Written by /task; validation-status set by /validate
│   └── tracker.md                         ← Created/updated by /implement; tracks all task statuses
│
├── output/{feature}/
│   ├── alm/
│   │   ├── extract-{timestamp}.json       ← Written by /alm extract; consumed by ALM Agent
│   │   └── get-{alm-id}-{date}.json       ← Written by /alm get
│   ├── impl-docs/
│   │   └── T-NNN-{task-name}-impl.md      ← AC sign-off, assets created, manual steps, deviations
│   ├── datasets/{dataset-name}/           ← TMDL files (model.tmdl, tables/, relationships.tmdl)
│   ├── measures/{table-name}.dax          ← DAX measure files
│   ├── rls/{role-name}.tmdl               ← RLS role definitions
│   ├── reports/{report-name}-spec.md      ← Power BI report specifications
│   ├── rdl/{report-name}-spec.md          ← Paginated / SSRS RDL specifications
│   └── sql/{proc-name}.sql               ← SSRS stored procedures
│
└── docs-generated/{feature}/
    ├── functional-design-document.md      ← /fdd
    ├── technical-design-document.md       ← /tdd
    ├── solution-blueprint.md              ← /blueprint
    ├── test-plan-and-strategy.md          ← /testplan (reference tables + links)
    ├── test-cases/                        ← /testplan (full test case cards)
    │   ├── data-accuracy.md
    │   ├── uat.md
    │   ├── rls-security.md
    │   └── regression.md
    ├── alm-extract/                       ← /extract testplan, /extract testsuites, /extract testcases
    │   ├── test-plan-extract.json         ← /extract testplan  (primary ALM import — rich content)
    │   ├── test-plan-extract.csv          ← /extract testplan  (metadata summary only)
    │   ├── test-plan-summary.md           ← /extract testplan
    │   ├── suites-extract.json            ← /extract testsuites  (primary ALM import — rich content)
    │   ├── suites-extract.csv             ← /extract testsuites  (metadata summary only)
    │   ├── suites-summary.md              ← /extract testsuites
    │   ├── testcases-extract.json         ← /extract testcases  (primary ALM import — rich content)
    │   ├── testcases-extract.csv          ← /extract testcases  (metadata summary only)
    │   ├── testcases-detail.md            ← /extract testcases
    │   └── alm-mapping.csv               ← created manually; input to /alm sync-testplan
    ├── data-dictionary.md                 ← /document
    ├── asset-registry.md                  ← /document
    ├── deployment-guide.md                ← /document
    └── release-notes.md                   ← /document
```

### Artifact map

| Artifact | Created by | Location |
|---|---|---|
| Functional Specification | `/spec` or `/spec-alm` | `specs/{f}/spec.md` |
| Spec Review Report | `/review` | `specs/{f}/review.md` |
| Impact Analysis | `/impact` | `specs/{f}/impact-analysis.md` *(brownfield mode only)* |
| Reporting-scoped spec (after split) | `/split-spec` | `specs/{f}/spec.md` (updated) |
| CE spec (after split) | `/split-spec` | `specs/{f}-ce/spec.md` *(if CE FRs present)* |
| Integration spec (after split) | `/split-spec` | `specs/{f}-integration/spec.md` *(if INT FRs present)* |
| Data Migration spec (after split) | `/split-spec` | `specs/{f}-data-migration/spec.md` *(if DM FRs present)* |
| Split manifest | `/split-spec` | `specs/{f}/split-manifest.md` |
| Functional Design Document | `/fdd` | `docs-generated/{f}/functional-design-document.md` |
| Test Plan and Strategy | `/testplan` | `docs-generated/{f}/test-plan-and-strategy.md` |
| Test Cases — Data Accuracy | `/testplan` | `docs-generated/{f}/test-cases/data-accuracy.md` |
| Test Cases — UAT | `/testplan` | `docs-generated/{f}/test-cases/uat.md` |
| Test Cases — RLS Security | `/testplan` | `docs-generated/{f}/test-cases/rls-security.md` |
| Test Cases — Regression | `/testplan` | `docs-generated/{f}/test-cases/regression.md` |
| Test Plan Extract (JSON — primary ALM import) | `/extract testplan` | `docs-generated/{f}/alm-extract/test-plan-extract.json` |
| Test Plan Extract (CSV — metadata only) | `/extract testplan` | `docs-generated/{f}/alm-extract/test-plan-extract.csv` |
| Test Plan Summary (MD) | `/extract testplan` | `docs-generated/{f}/alm-extract/test-plan-summary.md` |
| Test Suites Extract (JSON — primary ALM import) | `/extract testsuites` | `docs-generated/{f}/alm-extract/suites-extract.json` |
| Test Suites Extract (CSV — metadata only) | `/extract testsuites` | `docs-generated/{f}/alm-extract/suites-extract.csv` |
| Test Suites Summary (MD) | `/extract testsuites` | `docs-generated/{f}/alm-extract/suites-summary.md` |
| Test Cases Extract (JSON — primary ALM import) | `/extract testcases` | `docs-generated/{f}/alm-extract/testcases-extract.json` |
| Test Cases Extract (CSV — metadata only) | `/extract testcases` | `docs-generated/{f}/alm-extract/testcases-extract.csv` |
| Test Cases Detail (MD) | `/extract testcases` | `docs-generated/{f}/alm-extract/testcases-detail.md` |
| Technical Plan | `/plan` | `plans/{f}/plan.md` |
| Work Item Breakdown | `/plan` | `plans/{f}/work-items.yaml` |
| Task Readiness Report | `/clarify` | `plans/{f}/clarify.md` |
| Technical Design Document | `/tdd` | `docs-generated/{f}/technical-design-document.md` |
| Solution Blueprint | `/blueprint` | `docs-generated/{f}/solution-blueprint.md` |
| Task Cards | `/task` | `tasks/{f}/NN-{name}.md` |
| Implementation Records | `/implement` | `output/{f}/impl-docs/T-NNN-{name}-impl.md` |
| Dataset (TMDL) | `/implement` | `output/{f}/datasets/{dataset}/` |
| DAX Measures | `/implement` | `output/{f}/measures/{table}.dax` |
| RLS Definitions | `/implement` | `output/{f}/rls/{role}.tmdl` |
| Report Specs | `/implement` | `output/{f}/reports/{report}-spec.md` |
| RDL / Paginated Specs | `/implement` | `output/{f}/rdl/{report}-spec.md` |
| SQL Stored Procedures | `/implement` | `output/{f}/sql/{proc}.sql` |
| Data Dictionary | `/document` | `docs-generated/{f}/data-dictionary.md` |
| Asset Registry | `/document` | `docs-generated/{f}/asset-registry.md` |
| Deployment Guide | `/document` | `docs-generated/{f}/deployment-guide.md` |
| Release Notes | `/document` | `docs-generated/{f}/release-notes.md` |

---

## Configuration

Before first use:

1. Copy this template directory to your project workspace.
2. Configure `constitution/10-alm-configuration.md`:
   - Set `project.name` and `project.workspace-prefix`
   - Set ADO organisation, project, area path, and iteration path
   - Enable `ssrs` section if SSRS reports are in scope
   - Set `requirement-intake: structured` if using `/spec-alm`
   - Set `brownfield.enabled: true` and `brownfield.docs-path` if adding to an existing reporting environment
3. Optionally configure `../../alm-configuration.md` at the project root — this takes precedence over the template configuration.
4. Run `/spec {feature-name}` (unstructured) or `/spec-alm {feature-name}` (structured) with your reporting requirement.

### Related Agents

| Agent | Relationship |
|---|---|
| **D365 CE** | Provides D365 entity data as report data source; handles CE embedding of reports |
| **Power Apps** | Provides Dataverse as report data source; handles Canvas App / MDA embedding |
| **Integration** | Provides event-driven data feeds that land in the reporting dataset |
| **Data Migration** | Provides ADF-staged SQL data consumed by reporting datasets |
| **Solution Architect** | Uses this agent's output as part of cross-domain solution blueprint |
| **Solution Estimate** | Reads `specs/{f}/spec.md` and `plans/{f}/plan.md` to generate factor-based estimates for Reporting features |
