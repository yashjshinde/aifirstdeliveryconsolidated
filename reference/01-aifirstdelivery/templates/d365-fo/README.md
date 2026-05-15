# D365 F&O Agent Template

Document-driven development for Dynamics 365 Finance & Operations using Claude Code.
This template turns Claude Code into a structured delivery agent that takes a plain-language requirement
to production-ready X++ code through four phases — each with a formal approval gate before the next begins.

## Table of Contents

- [1. What Is It](#1-what-is-it)
- [2. How It Works](#2-how-it-works)
  - [Process Overview](#process-overview)
  - [Approval Gates](#approval-gates)
- [3. Commands](#3-commands)
  - [Phase 1 — Functional Design](#phase-1--functional-design)
    - [/fdd](#fdd--write-the-functional-design-document)
    - [/fdd-review](#fdd-review--review-the-fdd)
    - [/split-spec](#split-spec--split-a-mixed-fo--integration--data-migration-fdd)
    - [/testplan](#testplan--generate-the-test-plan)
    - [/extract testplan](#extract-testplan--extract-test-plan-to-alm-ready-files)
    - [/extract testsuites](#extract-testsuites--extract-one-or-all-test-suites)
    - [/extract testcases](#extract-testcases--extract-one-or-all-test-cases)
    - [/alm sync-testplan](#alm-sync-testplan--sync-alm-ids-back-to-test-files)
  - [Phase 2 — Design](#phase-2--design)
    - [/tdd](#tdd--generate-the-technical-design-document)
    - [/tdd-review](#tdd-review--review-the-tdd)
    - [/blueprint](#blueprint--generate-the-solution-blueprint)
  - [Phase 3 — Planning](#phase-3--planning)
    - [/plan](#plan--generate-the-implementation-plan)
    - [/plan-review](#plan-review--review-the-plan)
  - [Phase 4 — Build](#phase-4--build)
    - [/implement](#implement--implement-a-single-object)
    - [/document](#document--generate-operational-documentation)
    - [/alm](#alm--synchronise-with-your-alm-tool)
- [4. Structure and Outputs](#4-structure-and-outputs)
- [5. Configuration](#5-configuration)

---

## 1. What Is It

### Objects the agent can build

| Category (Prefix) | Object Types |
|---|---|
| Extensions `EXT` | Form Extension, Table Extension, Class Extension (CoC), New Class, New Table, New Form, Event Handler Class, Batch Class |
| Data Entities `DEN` | Data Entity Extension, New Data Entity |
| Security `SEC` | Security Privilege, Security Duty, New Security Role |
| Workflows `WFL` | Workflow Category, Workflow Approval, Workflow Type |
| Business Documents `BDC` | GER Configuration, SSRS Business Document |
| Operational Reports `OPR` | SSRS Operational Report |
| Integrations `INT` | Interface Logic Class, Azure Resource Configuration |
| Power Platform `PPL` | Power Automate Flow, Canvas App |

All objects follow the AVA naming convention (`AVA_<Module>_<Name>` or `<Base>.Extension`).

### Documents the agent generates

| Document | Phase | Audience |
|---|---|---|
| Functional Design Document (FDD) | 1 — Functional Design | Business Stakeholder, BA, Functional Lead |
| FDD Review Report | 1 | Solution Architect |
| Test Plan and Strategy | 1 — Functional Design | QA Engineer, BA, Business User |
| Technical Design Document (TDD) | 2 — Design | Tech Lead, Solution Architect |
| TDD Review Report | 2 | Tech Lead |
| Solution Blueprint | 2 | Solution Architect, Tech Lead, Project Manager |
| Implementation Plan | 3 — Planning | Project Manager, Development Team |
| Plan Review Report | 3 | Tech Lead |
| Deployment Guide | 4 — Build | Release Manager, Operations |
| Release Notes | 4 | Stakeholders |
| Test Evidence Summary | 4 | QA, Validation Team |
| Object Register | 4 | Solution Architect, Change Management |

---

## 2. How It Works

### Process Overview

The D365 F&O process is document-first. No implementation starts without three formal approvals. Run the commands in this order:

```
PHASE 1 — FUNCTIONAL DESIGN
  /fdd ──► /fdd-review ──[FDD APPROVED]──► /testplan
             │
             └──[MIXED DOMAIN?]──► /split-spec ──► /fdd-review (re-run on scoped FDD)

PHASE 2 — DESIGN
  /tdd ──► /tdd-review ──[TDD APPROVED]──► /blueprint

PHASE 3 — PLANNING
  /plan ──► /plan-review ──[PLAN APPROVED]
            ↳ auto-scans for cross-feature conflicts; updates _component-registry.md

PHASE 4 — BUILD
  /implement {req}/{Object-ID} ──► /document
```

### Approval Gates

| Gate | Set by | Blocks |
|---|---|---|
| **FDD APPROVED** | `/fdd-review` | `/testplan`, `/tdd` will not run |
| **TDD APPROVED** | `/tdd-review` | `/blueprint`, `/plan` will not run |
| **PLAN APPROVED** | `/plan-review` | `/implement` will refuse to run |

If a gate returns **NEEDS REWORK**: fix the issues in the document and re-run the review command.

---

## 3. Commands

### Phase 1 — Functional Design

#### `/fdd` — Write the Functional Design Document

Takes your requirement in plain language and produces a structured FDD following the mandated 18-section template.

```
/fdd

Example:
"We need to add a quality validation status to purchase order lines.
 QA Inspectors set Pass / Fail / Hold on each line.
 A Fail status must block goods receipt posting.
 Finance needs a report of all Fail lines by vendor."
```

**Output:** `docs/{req}/fdd.md`

The FDD has five **★ mandatory sections** — without these, TDD cannot be generated:

| ★ Section | What it covers | Gates |
|---|---|---|
| §6 Object Inventory | Every D365 F&O object with category, type, complexity | TDD architecture sub-sections |
| §9 Form Design | Tab/group/field detail for every form in scope | TDD §5.3 |
| §10 Field Mapping | Source → D365 table.field → EDT → validation | TDD §5.4 |
| §11 Business Rules and Validations | Rule-ID, trigger, condition, exact error text, severity | TDD §5.6 pseudocode + Test Plan |
| §13 Security Requirements | Roles, menu items, privileges, SoD | TDD §5.9 |

---

#### `/fdd-review` — Review the FDD

Reviews the FDD from a Senior D365 F&O Solution Architect perspective.

```
/fdd-review qms-po-validation
```

**Output:** `docs/{req}/fdd-review.md`

Findings are classified as BLOCKER, REQUIRED, or WARNING. Once all BLOCKERs are resolved, status is set to **FDD APPROVED** and the test plan and technical design can begin.

> **Multi-domain detection:** `/fdd-review` scans for Azure Integration signals (Azure Function, Service Bus, APIM, DLQ, event-driven pipelines, Bicep, external system sync) and Data Migration signals (ADF, SFTP, staging tables, ingest pipelines) as Review Category 0 before all other checks. If found, it raises a BLOCKER and directs you to run `/split-spec` first. This keeps the F&O FDD focused on X++ objects; integration infrastructure belongs in the Integration agent and ADF-based data movement belongs in the Data Migration agent.

---

#### `/split-spec` — Split a Mixed F&O + Integration + Data Migration FDD

Use when an FDD contains D365 F&O requirements (X++ objects, forms, tables, batch jobs, security duties, SSRS), Azure Integration requirements (Azure Functions, Service Bus, APIM, Data Entities used as an external integration surface), and/or Data Migration requirements (ADF pipelines, SFTP, SQL staging). `/fdd-review` will surface any mixed-domain content as a BLOCKER automatically.

```
/split-spec qms-po-validation
```

What it does:
1. Classifies every FR and every Object Inventory entry as F&O / Integration / Data Migration / Reporting / Cross-cutting
2. Rewrites `docs/{requirement-name}/fdd.md` scoped to D365 F&O only — Data Entity schema stays in the F&O FDD; the external consumption contract moves to the integration spec
3. Creates `specs/{requirement-name}-integration/spec.md` in Integration agent format — ready to copy into the Integration agent workspace
4. Creates `specs/{requirement-name}-data-migration/spec.md` in Data Migration agent format — only when one or more FRs are classified as Data Migration
5. Creates `specs/{requirement-name}-reporting/spec.md` in Reporting agent format — only when one or more FRs are classified as Reporting (Power BI reports, SSRS reports, datasets)
6. Writes `docs/{requirement-name}/split-manifest.md` with the FR classification table, Object Inventory split, cross-cutting split details, and next-steps checklist

Cross-cutting FRs are split into child FRs per domain spanned: `FR-NNN-FO` (F&O portion), `FR-NNN-INT` (integration portion), `FR-NNN-DM` (data migration portion) — each referencing the others in Dependencies. Data Entity ownership is explicit: F&O agent owns schema; ADF pipeline (Data Migration agent) owns the ingest contract.

Output:
```
docs/{requirement-name}/fdd.md                            ← updated: F&O-scoped
specs/{requirement-name}-integration/spec.md              ← new: Integration agent spec
specs/{requirement-name}-data-migration/spec.md           ← new: Data Migration agent spec (if DM FRs exist)
specs/{requirement-name}-reporting/spec.md                ← new: Reporting agent spec (if RPT FRs exist)
docs/{requirement-name}/split-manifest.md                 ← FR and object classification + next steps
```

After running `/split-spec`, re-run `/fdd-review {requirement-name}` on the now-scoped F&O FDD.

---

#### `/testplan` — Generate the Test Plan

Writes test cases from every FDD business rule, form, and security requirement — while the functional design is fresh, before any technical design is locked. This lets QA and business review coverage independently of the technical team.

```
/testplan qms-po-validation
```

**Pre-condition:** FDD APPROVED

**Output:**
- `docs/{req}/test-plan.md` — strategy, scope, reference tables, traceability matrix
- `docs/{req}/test-cases/unit.md` — X++ Unit test cases
- `docs/{req}/test-cases/sit-functional.md` — SIT Functional test cases
- `docs/{req}/test-cases/sit-integration.md` — SIT Integration test cases
- `docs/{req}/test-cases/uat.md` — UAT test cases
- `docs/{req}/test-cases/security.md` — Security test cases
- `docs/{req}/test-cases/performance.md` — Performance test cases *(omitted if no Complex/XL objects)*

| Test Type | Source in FDD | Minimum Coverage |
|---|---|---|
| X++ Unit Tests | §11 business rules | 1 per method in logic classes |
| SIT — Functional | §11 business rules | 2 per Rule-ID (positive + negative) |
| SIT — Integration | §14 integration requirements | 1 per integration endpoint |
| UAT | §11 and §9 form design | All high-priority rules |
| Security | §13 security requirements | 1 per role |
| Performance | Complex / Very Complex objects | Where applicable |
| Regression | Existing functionality | Standard regression suite |

Also generates: test data requirements, environment strategy (DEV / TEST / UAT), entry/exit criteria per phase, defect severity definitions, traceability matrix (TC-ID → Rule-ID → FDD section).

> **Note on unit test code:** Test case *documentation* (TC-001…) is written here. Runnable SysTestCase X++ *code* is generated later by `/implement` when each business logic class is built.

---

#### `/extract testplan` — Extract Test Plan to ALM-Ready Files

Reads the test plan and all suite files, then writes ALM-ready output. The JSON file is the primary ALM import artifact — all content preserved as raw markdown including X++ code blocks. The CSV carries metadata only. Every TC ID is the stable unique identifier used to sync ALM IDs back.

```
/extract testplan qms-po-validation
```

Output:
- `docs/{req}/alm-extract/test-plan-extract.json` — **primary ALM import**: full rich content, steps as `{ step, action, expected }` array
- `docs/{req}/alm-extract/test-plan-extract.csv` — metadata summary only (Step Count, no step content)
- `docs/{req}/alm-extract/test-plan-summary.md` — human-readable review copy

---

#### `/extract testsuites` — Extract One or All Test Suites

Extracts one or all test suites with full step detail and rich content intact including X++ code blocks.

```
/extract testsuites qms-po-validation
/extract testsuites qms-po-validation sit-functional
```

Suite options: `unit` | `sit-functional` | `sit-integration` | `uat` | `security` | `performance` | `all` (default)

Output:
- `docs/{req}/alm-extract/suites-extract.json` — **primary ALM import**: rich content preserved
- `docs/{req}/alm-extract/suites-extract.csv` — metadata summary only
- `docs/{req}/alm-extract/suites-summary.md`

---

#### `/extract testcases` — Extract One or All Test Cases

Extracts a single test case or every test case across all suites, with full step detail and rich content intact.

```
/extract testcases qms-po-validation
/extract testcases qms-po-validation TC-SF003
```

Output:
- `docs/{req}/alm-extract/testcases-extract.json` — **primary ALM import**: rich content preserved
- `docs/{req}/alm-extract/testcases-extract.csv` — metadata summary only
- `docs/{req}/alm-extract/testcases-detail.md` — full formatted blocks for human review

---

#### `/alm sync-testplan` — Sync ALM IDs Back to Test Files

After creating test cases in ALM (which assigns ALM IDs), write the IDs back into the test plan reference tables and suite files. Supports bulk sync from a CSV mapping file or a single TC update.

```
# Bulk — reads docs/{req}/alm-extract/alm-mapping.csv
/alm sync-testplan qms-po-validation

# Single
/alm sync-testplan qms-po-validation TC-SF003 12346
```

Mapping file format:
```
TC ID,ALM ID
TC-U001,12344
TC-SF001,12348
```

Updates both the main `test-plan.md` reference tables and the individual suite files.

---

### Phase 2 — Design

#### `/tdd` — Generate the Technical Design Document

Produces the full IT System Design Specification. Every object in the FDD Object Inventory gets a dedicated architecture sub-section.

```
/tdd qms-po-validation
```

**Output:** `docs/{req}/tdd.md`

| TDD Section | Coverage |
|---|---|
| §5.3 Forms | Data source tables, design controls, event handler wiring |
| §5.4 Data Dictionary | Base Enums, EDTs, Table Extensions, New Tables, Data Entities |
| §5.5 SSRS Reports | Report metadata, RDP class, dataset |
| §5.6 Business Logic | Class metadata + every method with pseudocode |
| §5.7 Interface Logic | Integration class specs |
| §5.8 Workflows | Workflow category, approval, and type configuration |
| §5.9 Security | Privileges with entry points, Duties with privilege assignments |
| §5.10 Label Files | Label file name, language, IDs |
| §5.11 Interface Config | Azure resources, authentication, error handling, Key Vault |
| §5.12 Open Items | All TBDs tracked |

---

#### `/tdd-review` — Review the TDD

Validates TDD completeness, FDD traceability, design quality, security design, and integration design.

```
/tdd-review qms-po-validation
```

**Output:** `docs/{req}/tdd-review.md`

- **BLOCKER** — every FDD object must have a TDD sub-section; every business rule must have pseudocode
- **REQUIRED** — naming, coding standards, security design gaps
- **WARNING** — performance considerations for Complex/Very Complex objects
- **Status: TDD APPROVED / NEEDS REWORK**

---

#### `/blueprint` — Generate the Solution Blueprint

Produces a stakeholder-facing architecture summary from the approved TDD. The blueprint shows the extension model, component architecture, data flows, security model, and integration patterns — giving architects, leads, and the project manager a consolidated view before implementation begins.

```
/blueprint qms-po-validation
```

**Pre-condition:** TDD APPROVED (can run in parallel with `/plan`)

**Output:** `docs/{req}/solution-blueprint.md`

The blueprint selects an architecture pattern and documents:

| Section | Content |
|---|---|
| §1 Architecture Pattern | Selected pattern (A–E) with rationale; alternatives rejected |
| §2 Component Architecture | Text diagram: forms → event handlers → classes → tables → data entities |
| §3 Data Architecture | Object model, field-level data flow, volume considerations |
| §4 Security Architecture | Role → Duty → Privilege → Entry Point matrix; SoD risks |
| §5 Integration Architecture | Inbound/outbound patterns, protocols, auth, error handling |
| §6 Extension Model Decisions | CoC vs event handler choices; extension vs new object |
| §7 ALM and Deployment | Model structure, environment pipeline, branching strategy |
| §8 Technical Risks | Risk register with likelihood, impact, and mitigations |
| §9 Non-Functional Coverage | Performance, scalability, availability, maintainability, testability |

**Architecture patterns:**

| Pattern | Use when |
|---|---|
| A — Extension-Centric | Primarily Form/Table/CoC extensions on existing objects |
| B — New Process Class | New end-to-end process: new classes, new forms, batch jobs |
| C — Integration-Centric | Primary purpose is F&O ↔ external system data movement |
| D — Data Entity / OData | External read/write via OData or DMF; no real-time sync |
| E — Hybrid | Mix of extensions and integration touchpoints |

---

### Phase 3 — Planning

#### `/plan` — Generate the Implementation Plan

Extracts every X++ object from TDD §5 and creates one plan item per object. The plan is **flat** — no Feature/Epic/Story hierarchy. Every item is directly implementable.

```
/plan qms-po-validation
```

**Output:** `plans/{req}/plan.md` + `plans/{req}/work-items.yaml`

Each plan item records:

| Field | Example |
|---|---|
| Object-ID | `EXT-001` |
| Object Category / Type | `Extensions / Table Extension` |
| Module | `PO` |
| Complexity / T-shirt | `Simple / S` |
| Story Points | `1` |
| FDD Rules | `BR-001, BR-002` |
| FDD / TDD Reference | `§10 / §5.4.4` |
| Depends On | `—` or `EXT-001` |

**Sequencing rules applied automatically:**

1. Base Enums and EDTs → before Table Extensions that reference them
2. New Tables → before Classes and Form Extensions that use them
3. Security Privileges → Duties → Roles
4. Table Extensions → Data Entities built on them
5. Data Entities → Integration classes that transport them

**Cross-feature scan:** `/plan` automatically scans existing plans in `plans/` for shared X++ objects (Table Extensions, Form Extensions, Data Entities, Classes, Security objects) and surfaces overlaps in a **Cross-Feature Dependencies** section. It also updates `plans/_component-registry.md` after generation.

---

#### `/plan-review` — Review the Plan

Validates coverage, Object-ID format, naming conventions, complexity assignments, and dependency sequencing.

```
/plan-review qms-po-validation
```

**Output:** `plans/{req}/plan-review.md`
**Status: PLAN APPROVED / NEEDS REWORK**

---

### Phase 4 — Build

#### `/implement` — Implement a Single Object

Reads the plan item and TDD architecture sub-section for one Object-ID. Generates X++ code or configuration, writes a SysTestCase unit test class (for logic objects), creates an implementation record, and updates the tracker. Will not run without PLAN APPROVED.

**Cross-feature pre-requisite check (Step 3b):** Before generating any artefact, `/implement` reads `plans/_component-registry.md` and the plan's Cross-Feature Dependencies section for this object:
- **SEQUENTIAL dependency not met** → hard stop with a message naming which object from which requirement must be completed first
- **CONFLICT detected** → proceeds but prepends a `⚠ CONFLICT WARNING` block to the implementation record

```
/implement qms-po-validation/EXT-001
/implement qms-po-validation/EXT-003
/implement qms-po-validation/INT-022
```

**What is generated per object type:**

| Object Category | X++ Code | Unit Tests | Config / Docs |
|---|---|---|---|
| Form Extension | `.Extension` object (data source, controls, events) | — | — |
| Table Extension | `.Extension` object (fields, groups, indexes, relations) | — | — |
| New Class | Full class (doc-comment, all methods, ttsbegin/ttscommit) | `{Class}_Test.xpp` (SysTestCase) | — |
| Class Extension (CoC) | `_Extension` class (`next` call, pre/post logic) | `{Class}_Extension_Test.xpp` | — |
| Event Handler Class | Full class (all pre/post event handler methods) | `{Class}_Test.xpp` | — |
| Batch Class | `RunBase` extension (`run()`, `dialog()`, `getFromDialog()`) | `{Class}_Test.xpp` | — |
| New Table | Full table (fields, groups, primary index, methods) | — | — |
| New Form | Full form (data sources, design controls, events) | — | — |
| Data Entity | Entity class, field mappings, staging table | — | — |
| Security | — | — | Privilege/Duty/Role XML + Role Definition Sheet |
| Workflow | — | — | Workflow configuration spec |
| SSRS Report | RDP class | — | Report design notes |
| Integration (INT) | Interface class | — | `integration-config.md` |
| Configuration only | — | — | Step-by-step config instructions |

**SysTestCase unit tests** — generated for every business logic class, with one test method per pseudocode branch from the TDD, covering the positive path and at least one negative/error path.

**On every `/implement` run:**

1. Sets object status to `IN PROGRESS` in `plan.md`
2. Creates `tasks/{req}/tracker.md` on first run (updated on subsequent runs)
3. Generates the artefact(s) listed above
4. Writes an implementation record at `output/{req}/impl-docs/{Object-ID}-{slug}-impl.md`
5. Sets status to `DONE` with `impl-doc-path`
6. Updates the tracker (completion percentage)

**Implementation tracker** (`tasks/{req}/tracker.md`):

```
# Implementation Tracker — QMS PO Validation

Progress: 38% (3 of 8 objects done)

| Object-ID | Object Name             | Type            | Status      | Impl Doc           |
| EXT-001   | PurchLine.Extension     | Table Extension | DONE        | [impl](output/...) |
| EXT-002   | AVA_QMS_QualityStatus   | Base Enum       | DONE        | [impl](output/...) |
| EXT-003   | AVA_PO_QualityValidator | New Class       | IN PROGRESS | —                  |
| EXT-004   | PurchLineForm.Extension | Form Extension  | Not Started | —                  |
```

---

#### `/document` — Generate Operational Documentation

```
/document qms-po-validation
```

**Output:**

```
docs/qms-po-validation/deployment-guide.md       ← per-environment deployment steps
docs/qms-po-validation/release-notes.md
docs/qms-po-validation/test-evidence-summary.md
docs/qms-po-validation/object-register.md        ← all objects with IDs and modules
```

---

#### `/alm` — Synchronise with Your ALM Tool

Links the flat object plan to Azure DevOps, Jira, or any ALM tool via a two-level hierarchy:
**Level 1** — Requirement / Epic (one per FDD) | **Level 2** — Object Task (one per Object-ID).

Configure the ALM tool, field mapping, and status values in `constitution/10-alm-configuration.md` before first use.

**`/alm extract {req}`** — Build the work-item JSON payload for ALM creation.

```
/alm extract qms-po-validation
```

Reads `work-items.yaml`, assigns stable UIDs, and writes a JSON payload with both levels, field names mapped to your ALM tool's API (e.g. `System.Title`), story points (XS=0.5, S=1, M=3, L=8, XL=20), and Object-ID metadata.

Output: `output/{req}/alm/extract-{timestamp}.json`

**`/alm sync {req} ...`** — Write ALM-assigned IDs back into the project.

```
/alm sync qms-po-validation qms-po-validation-EXT-001 42301
/alm sync qms-po-validation --file output/qms-po-validation/alm/alm-response.json
```

Updates `work-items.yaml` `alm-id` fields. The UID is the stable correlation key — never overwritten.

**`/alm get {req} {alm-id}`** — Retrieve current state of a work item.

```
/alm get qms-po-validation 42301
```

Output: `output/{req}/alm/get-{alm-id}-{date}.json`

---

## 4. Structure and Outputs

### Folder structure

```
d365-fo/
│
├── .claude/
│   ├── commands/                         ← 13 slash commands
│   │   ├── fdd.md                        ← /fdd
│   │   ├── fdd-review.md                 ← /fdd-review  [FDD APPROVED gate]
│   │   ├── split-spec.md                 ← /split-spec  [run if FDD contains integration requirements]
│   │   ├── testplan.md                   ← /testplan
│   │   ├── tdd.md                        ← /tdd
│   │   ├── tdd-review.md                 ← /tdd-review  [TDD APPROVED gate]
│   │   ├── blueprint.md                  ← /blueprint  [after TDD APPROVED]
│   │   ├── plan.md                       ← /plan
│   │   ├── plan-review.md                ← /plan-review  [PLAN APPROVED gate]
│   │   ├── implement.md                  ← /implement {req}/{Object-ID}
│   │   ├── document.md                   ← /document
│   │   ├── alm.md                        ← /alm extract | sync | sync-testplan | get
│   │   └── extract.md                    ← /extract testplan | testsuites | testcases
│   └── settings.json
│
├── constitution/                         ← Rules every command reads before generating
│   ├── CLAUDE.md                         ← Auto-loaded; full command reference
│   ├── 00-index.md
│   ├── 01-governance-and-objects.md      ← Object categories, IDs, RACI, complexity sizing
│   ├── 02-object-type-standards.md       ← Standards per category (DEN, SEC, INT, WFL…)
│   ├── 03-extension-coding-standards.md  ← 32-type catalogue, X++ rules, prohibited patterns
│   ├── 04-development-and-alm.md         ← Environments, ADO standards, branching
│   ├── 05-documentation-and-change.md    ← Mandatory artefacts, change control, sign-offs
│   └── 10-alm-configuration.md          ← ALM tool, field mapping, priority/status maps
│
├── doc-templates/
│   ├── fdd-template.md                   ← 18-section FDD (★ mandatory sections marked)
│   ├── tdd-template.md                   ← IT System Design Specification
│   ├── test-plan-template.md             ← Test plan with full test case table
│   ├── solution-blueprint-template.md    ← Solution Blueprint (9 sections)
│   └── impl-doc-template.md             ← Implementation record per object
│
├── Prompts/
│   ├── fdd-review/checklist.md          ← 6-category FDD review criteria
│   ├── tdd-review/checklist.md          ← 6-category TDD review criteria
│   └── plan/hierarchy.md               ← Flat plan rules, sizing, sequencing
│
├── docs/{requirement-name}/
│   ├── fdd.md                           ← /fdd
│   ├── fdd-review.md                    ← /fdd-review
│   ├── test-plan.md                     ← /testplan (reference tables + links)
│   ├── test-cases/                      ← /testplan (full test case tables)
│   │   ├── unit.md
│   │   ├── sit-functional.md
│   │   ├── sit-integration.md
│   │   ├── uat.md
│   │   ├── security.md
│   │   └── performance.md
│   ├── alm-extract/                     ← /extract testplan, /extract testsuites, /extract testcases
│   │   ├── test-plan-extract.json       ← /extract testplan  (primary ALM import — rich content)
│   │   ├── test-plan-extract.csv        ← /extract testplan  (metadata summary only)
│   │   ├── test-plan-summary.md         ← /extract testplan
│   │   ├── suites-extract.json          ← /extract testsuites  (primary ALM import — rich content)
│   │   ├── suites-extract.csv           ← /extract testsuites  (metadata summary only)
│   │   ├── suites-summary.md            ← /extract testsuites
│   │   ├── testcases-extract.json       ← /extract testcases  (primary ALM import — rich content)
│   │   ├── testcases-extract.csv        ← /extract testcases  (metadata summary only)
│   │   ├── testcases-detail.md          ← /extract testcases
│   │   └── alm-mapping.csv              ← created manually; input to /alm sync-testplan
│   ├── tdd.md                           ← /tdd
│   ├── tdd-review.md                    ← /tdd-review
│   ├── solution-blueprint.md            ← /blueprint
│   ├── deployment-guide.md              ← /document
│   ├── release-notes.md                 ← /document
│   ├── test-evidence-summary.md         ← /document
│   └── object-register.md              ← /document
│
├── plans/{requirement-name}/
│   ├── plan.md                          ← /plan (flat, one section per Object-ID)
│   ├── work-items.yaml                  ← /plan  →  input to /alm extract
│   └── plan-review.md                  ← /plan-review
│
├── tasks/{requirement-name}/
│   ├── {Object-ID}-{slug}.md           ← Task card per object
│   └── tracker.md                      ← Created/updated by /implement
│
└── output/{requirement-name}/
    ├── alm/
    │   ├── extract-{timestamp}.json    ← /alm extract
    │   └── get-{alm-id}-{date}.json   ← /alm get
    ├── impl-docs/
    │   └── {Object-ID}-{slug}-impl.md ← One per object
    ├── tests/
    │   └── {ClassName}_Test.xpp       ← SysTestCase unit tests (logic objects only)
    └── src/
        ├── FormExtensions/
        ├── TableExtensions/
        ├── Classes/
        ├── Tables/
        ├── Forms/
        ├── DataEntities/
        ├── Security/
        ├── Workflows/
        ├── Reports/
        ├── Integration/
        └── Config/
```

### Artefact map

| Artefact | Created by | Location |
|---|---|---|
| Functional Design Document | `/fdd` | `docs/{req}/fdd.md` |
| FDD Review Report | `/fdd-review` | `docs/{req}/fdd-review.md` |
| F&O-scoped FDD (after split) | `/split-spec` | `docs/{req}/fdd.md` (updated) |
| Integration spec (after split) | `/split-spec` | `specs/{req}-integration/spec.md` |
| Data Migration spec (after split) | `/split-spec` | `specs/{req}-data-migration/spec.md` *(only if DM FRs present)* |
| Reporting spec (after split) | `/split-spec` | `specs/{req}-reporting/spec.md` *(only if RPT FRs present)* |
| Split manifest | `/split-spec` | `docs/{req}/split-manifest.md` |
| Test Plan and Strategy | `/testplan` | `docs/{req}/test-plan.md` |
| Test Cases — X++ Unit | `/testplan` | `docs/{req}/test-cases/unit.md` |
| Test Cases — SIT Functional | `/testplan` | `docs/{req}/test-cases/sit-functional.md` |
| Test Cases — SIT Integration | `/testplan` | `docs/{req}/test-cases/sit-integration.md` |
| Test Cases — UAT | `/testplan` | `docs/{req}/test-cases/uat.md` |
| Test Cases — Security | `/testplan` | `docs/{req}/test-cases/security.md` |
| Test Cases — Performance | `/testplan` | `docs/{req}/test-cases/performance.md` |
| Test Plan Extract (JSON — primary ALM import) | `/extract testplan` | `docs/{req}/alm-extract/test-plan-extract.json` |
| Test Plan Extract (CSV — metadata only) | `/extract testplan` | `docs/{req}/alm-extract/test-plan-extract.csv` |
| Test Plan Summary (MD) | `/extract testplan` | `docs/{req}/alm-extract/test-plan-summary.md` |
| Test Suites Extract (JSON — primary ALM import) | `/extract testsuites` | `docs/{req}/alm-extract/suites-extract.json` |
| Test Suites Extract (CSV — metadata only) | `/extract testsuites` | `docs/{req}/alm-extract/suites-extract.csv` |
| Test Suites Summary (MD) | `/extract testsuites` | `docs/{req}/alm-extract/suites-summary.md` |
| Test Cases Extract (JSON — primary ALM import) | `/extract testcases` | `docs/{req}/alm-extract/testcases-extract.json` |
| Test Cases Extract (CSV — metadata only) | `/extract testcases` | `docs/{req}/alm-extract/testcases-extract.csv` |
| Test Cases Detail (MD) | `/extract testcases` | `docs/{req}/alm-extract/testcases-detail.md` |
| Technical Design Document | `/tdd` | `docs/{req}/tdd.md` |
| TDD Review Report | `/tdd-review` | `docs/{req}/tdd-review.md` |
| Solution Blueprint | `/blueprint` | `docs/{req}/solution-blueprint.md` |
| Implementation Plan | `/plan` | `plans/{req}/plan.md` |
| Work Item Breakdown (YAML) | `/plan` | `plans/{req}/work-items.yaml` |
| Plan Review Report | `/plan-review` | `plans/{req}/plan-review.md` |
| X++ Source (per object) | `/implement` | `output/{req}/src/{Type}/{Name}.xpp` |
| SysTestCase Unit Tests | `/implement` | `output/{req}/tests/{Name}_Test.xpp` |
| Integration Config | `/implement` | `output/{req}/src/Integration/{Name}/integration-config.md` |
| Implementation Record | `/implement` | `output/{req}/impl-docs/{Object-ID}-{slug}-impl.md` |
| Implementation Tracker | `/implement` | `tasks/{req}/tracker.md` |
| Deployment Guide | `/document` | `docs/{req}/deployment-guide.md` |
| Release Notes | `/document` | `docs/{req}/release-notes.md` |
| Test Evidence Summary | `/document` | `docs/{req}/test-evidence-summary.md` |
| Object Register | `/document` | `docs/{req}/object-register.md` |
| ALM Work-item Extract | `/alm extract` | `output/{req}/alm/extract-{timestamp}.json` |
| ALM Work-item Get | `/alm get` | `output/{req}/alm/get-{alm-id}-{date}.json` |

### ALM Work Item Hierarchy

D365 F&O uses a flat two-level hierarchy — there is no Feature or User Story layer.

```
Level 1 — Requirement / Epic   (one per FDD requirement)
  └── Level 2 — Object Task    (one per Object-ID)
        EXT-001, EXT-002, DEN-042, INT-022 …
```

Object-ID prefixes:

| Prefix | Category |
|---|---|
| `EXT` | Extensions — Forms, Tables, Classes, Batch, Events |
| `DEN` | Data Entities |
| `SEC` | Security Roles |
| `WFL` | Workflows |
| `BDC` | Business Documents |
| `OPR` | Operational Reports |
| `ANR` | Analytical Reports |
| `INT` | Integrations |
| `PPL` | Power Platform |
| `RET` | Retail Extensions |

### Deploying the Output

**Prerequisites:** D365 F&O DEV environment, Visual Studio with D365 tools, Azure DevOps pipeline per `constitution/04-development-and-alm.md`.

| Step | Action |
|---|---|
| 1 | In Visual Studio, add all `.xpp` files to the project under model `AVA_<Module>`. Build. Resolve all warnings. |
| 2 | Run SysTestCase unit tests in DEV. All assertions must pass before committing. |
| 3 | Commit with branch `feature/{Object-ID}-{short-description}`. Include Object-ID in commit message. |
| 4 | Pipeline deploys to TEST automatically on merge to main. QA runs SIT test cases from the test plan. |
| 5 | Business and QA sign off in UAT. Capture evidence in `test-evidence-summary.md`. |
| 6 | Obtain all five sign-offs per `constitution/05-documentation-and-change.md`. Deploy to PROD. |

---

## 5. Configuration

Before first use, update these files in `constitution/`:

| File | What to set |
|---|---|
| `01-governance-and-objects.md` | Model name (`AVA_<Module>`), namespace, module codes, environment versions |
| `03-extension-coding-standards.md` | Confirm AVA prefix matches your project's naming convention |
| `04-development-and-alm.md` | Model deployment pipeline, environment promotion, branching strategy. ADO org URL and project are read from `../../alm-configuration.md` at the repo root. |
| `10-alm-configuration.md` | D365 F&O-specific override only: 2-level ALM hierarchy (Requirement/Epic → Object Task, no Feature/User Story). ADO connection, field mapping, and priority/status maps are read from `../../alm-configuration.md` at the repo root (fallback: set them here if the root file does not exist). |
