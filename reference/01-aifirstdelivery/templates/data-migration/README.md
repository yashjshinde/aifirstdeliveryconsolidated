# Data Migration Agent Template

Spec-driven data migration and integration template for Azure Data Factory using Claude Code.
This template turns Claude Code into a structured delivery agent that takes a data migration or integration requirement
from plain-language description to production-ready ADF pipelines, SQL staging schemas, and Dataverse/SFTP artefacts —
following your project's constitution rules at every step.

Supports bidirectional patterns:
- **SFTP → Dataverse** — ingest files from SFTP, stage in SQL, load into Dataverse
- **Dataverse → SFTP** — extract from Dataverse, stage in SQL, export to SFTP file
- **SQL → Dataverse**, **Dataverse → SQL**, **SFTP → SQL**, **SQL → SFTP** — all configurable

---

## Table of Contents

- [1. What Is It](#1-what-is-it)
- [2. How It Works](#2-how-it-works)
  - [Phase 1 — Define the Requirement](#phase-1--define-the-requirement)
    - [/spec](#spec--write-the-migration-specification)
    - [/spec-alm](#spec-alm--import-and-enhance-alm-work-items)
    - [/review](#review--validate-the-spec-against-the-constitution)
    - [/split-spec](#split-spec--split-a-mixed-migration--ce--integration-spec)
    - [/impact](#impact--brownfield-impact-analysis)
    - [/mapping](#mapping--generate-the-field-mapping-document)
    - [/pipeline](#pipeline--generate-the-adf-pipeline-design)
    - [/testplan](#testplan--generate-the-test-plan-and-strategy)
    - [/extract testplan](#extract-testplan--extract-test-plan-to-alm-ready-files)
    - [/extract testsuites](#extract-testsuites--extract-one-or-all-test-suites)
    - [/extract testcases](#extract-testcases--extract-one-or-all-test-cases)
    - [/alm push-tests](#alm-push-tests--create-test-plan-in-azure-devops)
  - [Phase 2 — Design the Technical Solution](#phase-2--design-the-technical-solution)
    - [/plan](#plan--generate-the-technical-plan)
    - [/clarify](#clarify--review-the-plan-for-task-readiness)
    - [/tdd](#tdd--generate-the-technical-design-document)
    - [/blueprint](#blueprint--generate-the-solution-blueprint)
  - [Phase 3 — Build](#phase-3--build)
    - [/task](#task--generate-dev-ready-task-cards)
    - [/validate](#validate--validate-tasks-before-implementation)
    - [/implement](#implement--generate-artefacts-and-code)
    - [/document](#document--generate-operational-documentation)
    - [/alm](#alm--synchronise-work-items-with-azure-devops)
- [Brownfield Mode](#brownfield-mode)
- [3. Structure and Outputs](#3-structure-and-outputs)
- [Configuration](#configuration)

---

## 1. What Is It

### Artefacts the agent can build

| Artefact | What is generated |
|---|---|
| ADF Linked Services | JSON definitions for SFTP, SQL, Dataverse, Key Vault |
| ADF Datasets | Source and target dataset JSON with parameters |
| ADF Data Flows | Mapping data flows with derivations, lookups, type casts |
| ADF Pipelines | Ingest, Transform, Extract, Export, Orchestrator, Notify pipelines |
| ADF Triggers | Schedule and storage-event trigger JSON |
| ARM Template | Full ARM template + parameter files + `deploy.ps1` |
| SQL DDL | Raw, stage, error, audit, reference tables (idempotent scripts) |
| SQL Stored Procedures | Stage promotion SP with validation + error routing |
| Test Data Files | CSV/JSON test files for happy path, partial, all-invalid, empty, volume |
| Test Scripts | PowerShell SFTP deposit script, SQL validation queries |

### Documents the agent generates

| Document | When | Audience |
|---|---|---|
| Field Mapping | After spec is APPROVED | Developer, BA, architect |
| Pipeline Design | After spec is APPROVED | Developer, architect |
| Test Plan and Strategy | After spec is APPROVED | QA, BA |
| Technical Design Document | After plan is TASK-READY | Solution architect, tech lead |
| Solution Blueprint | After plan is TASK-READY | Solution architect |
| Deployment Guide | After implementation | Ops, release manager |
| Runbook | After implementation | Ops team |
| Release Notes | After implementation | Stakeholders |

---

## 2. How It Works

### The process

```
PHASE 1 — DEFINE

  [Plain-language requirement]
  /spec ──► /review ──[APPROVED]──► /mapping
                │         │       └──► /pipeline
                │         │       └──► /testplan
                │         └──[MIXED DOMAIN?]──► /split-spec ──► /review (re-run on scoped spec)
                └──[BROWNFIELD?]──► /impact ──[IMPACT-ASSESSED]──► continue to /plan

  [Structured intake — L1/L2/L3 from ALM tool]
  /spec-alm ──► /review ──[APPROVED]──► (same as above)
  (set requirement-intake: structured in constitution/10-alm-configuration.md)

  [Structured intake — L1/L2 from ALM, L3 optional]
  /spec-alm accepts L1/L2 input; marks L2 branches with no L3 as pending.
  /plan generates missing L3 User Stories for pending branches, then Tasks.
  (set requirement-intake: structured AND l3-intake: optional in constitution/10-alm-configuration.md)

PHASE 2 — DESIGN

  /plan ──► /clarify ──[TASK-READY]──► /tdd
            ↳ auto-scans for cross-migration conflicts; updates _component-registry.md
                                     └──► /blueprint

PHASE 3 — BUILD

  /task ──► /validate ──[READY TO IMPLEMENT]──► /implement ──► /document
```

### Gates

| Gate | Set by | What it blocks |
|---|---|---|
| **APPROVED** | `/review` | `/mapping`, `/pipeline`, `/testplan`, `/plan` |
| **IMPACT-ASSESSED** | `/impact` *(brownfield only)* | `/plan` |
| **TASK-READY** | `/clarify` | `/tdd`, `/blueprint`, `/task` |
| **READY TO IMPLEMENT** | `/validate` | `/implement` |

---

### Phase 1 — Define the Requirement

#### /spec — Write the Migration Specification

```
/spec {migration-id}
```

Generates a 13-section migration specification covering: direction, source and target system descriptions,
data volume and frequency, field scope, data quality rules, error handling, security and compliance,
non-functional requirements, dependencies, and out of scope.

**Output:** `specs/{migration-id}/spec.md`

---

#### /spec-alm — Import and Enhance ALM Work Items

```
/spec-alm {migration-id}
```

Use when migration requirements already exist as L1/L2/L3 work items in Azure DevOps, Jira, or a similar tool.
Instead of writing a migration spec from scratch, this command imports your existing hierarchy, preserves
all ALM IDs, and enhances each L3 item with MR-NNN migration requirements, acceptance criteria,
ADF/SQL/Dataverse impact analysis, and data mapping hints.

**Pre-requisite:** Set `requirement-intake: structured` in `constitution/10-alm-configuration.md`.

```
/spec-alm sftp-to-dv-accounts

Paste your ALM work items:
EP-001 | L1 | Epic     | SFTP to Dataverse Account Load  | Load account data from partner SFTP
FT-001 | L2 | Feature  | Ingest pipeline                 | Read CSV, stage in SQL, write to DV
US-001 | L3 | Story    | Daily account file ingestion     | As a data engineer, I need...
```

**Effect on `/plan`:** When the spec has `intake: structured`, `/plan` maps Tasks to existing L3 ALM IDs — the L1/L2/L3 hierarchy is NOT recreated.

**Output:** `specs/{migration-id}/spec.md`

---

##### L3-Optional Mode — when User Stories are not yet defined in ALM

Set `l3-intake: optional` in `constitution/10-alm-configuration.md` when your team has defined L1 (Epic) and L2 (Feature) work items in the ALM tool but has not yet broken them down into L3 (User Story) items, or when only some L2 branches have L3 stories.

```
/spec-alm sftp-to-dv-accounts

Paste your ALM work items (no L3 for FT-002):
EP-001 | L1 | Epic     | SFTP to Dataverse Account Load  | Load account data from partner SFTP
FT-001 | L2 | Feature  | Ingest pipeline                 | Read CSV, stage in SQL, write to DV
US-001 | L3 | Story    | Daily account file ingestion     | As a data engineer, I need...
FT-002 | L2 | Feature  | Error handling and alerting     | DLQ, retry, ops notifications
(no L3 items provided for FT-002)
```

**What `/spec-alm` does:**
- Enhances US-001 as normal — generates MR-NNN requirements, acceptance criteria, impact analysis
- Marks FT-002 as pending in the spec front matter (`source: pending`) and adds a placeholder block in §6
- Tags the ALM Traceability Matrix row for FT-002 as `pending`

**What `/plan` then does (l3-optional sub-mode):**
- For US-001 (source: alm): generates Tasks only — maps to the existing L3 ALM ID
- For FT-002 (source: pending): generates new User Story items (US-NNN) by decomposing the L2 scope, then generates Tasks under those stories
- Writes generated User Stories to `work-items.yaml` with `source: generated` — the ALM Agent will create these in ADO parented to FT-002

| Configuration | Behaviour |
|---|---|
| `l3-intake: required` (default) | All L2 must have L3 in the input — stops with an error if any L2 has no L3 |
| `l3-intake: optional` | L3 may be absent; spec marks gaps as pending; `/plan` generates missing stories |

---

#### /review — Validate the Spec Against the Constitution

```
/review {migration-id}
```

Evaluates the spec against `constitution/` rules. Checks structure, technical quality, security classification,
and direction-specific requirements. Sets APPROVED or CHANGES REQUIRED.

> **Multi-domain detection:** `/review` scans for D365 CE, Power Apps, and Azure Integration signals (forms, plugins, Canvas App, Azure Function, Service Bus, APIM) before any other check. If found, it raises a BLOCKER and directs you to run `/split-spec` first. This keeps data migration specs focused on ADF pipelines, staging, and file/Dataverse movement only.

**GATE — APPROVED:** Blocks `/mapping`, `/pipeline`, `/testplan`, and `/plan` until passed.

**Output:** `specs/{migration-id}/review.md`

---

#### /split-spec — Split a Mixed Migration + CE / Integration Spec

```
/split-spec {migration-id}
```

Use when a migration spec contains Data Migration requirements (ADF pipelines, SQL staging, SFTP, Dataverse bulk load) alongside D365 CE / Power Apps requirements (forms, views, plugins, Canvas App, MDA) or Azure Integration requirements (Azure Functions, Service Bus, APIM, event-driven pipelines).

> **Note:** `/split-spec` is typically run in the CE, Power Apps, or F&O agent to produce the data migration spec. If the data migration spec received here still contains CE, Integration, or Reporting signals, run `/split-spec {migration-id}` here to extract them.

- Keeps migration-scoped MRs in `specs/{migration-id}/spec.md`
- Creates a CE / Power Apps-scoped spec at `specs/{migration-id}-ce/spec.md` ready for the domain agent
- Creates an Integration-scoped spec at `specs/{migration-id}-integration/spec.md` ready for the Azure Integration agent — only if Integration FRs are present
- Creates a Reporting-scoped spec at `specs/{migration-id}-reporting/spec.md` ready for the Reporting agent — only if Reporting FRs are present
- Splits cross-cutting requirements into linked child requirements per domain spanned
- Writes `specs/{migration-id}/split-manifest.md` with the full classification table

**Output:** `specs/{migration-id}/spec.md` (updated) + domain-scoped specs (CE/INT as applicable) + `specs/{migration-id}/split-manifest.md`

---

#### /impact — Brownfield Impact Analysis

```
/impact {migration-id}
```

*(Only available when `brownfield.enabled: true` in `constitution/10-alm-configuration.md`)*

Analyses collision risk with existing data in the target system. Documents duplicate detection strategy,
existing record treatment, and rollback approach.

**GATE — IMPACT-ASSESSED:** Blocks `/plan` until passed.

**Output:** `specs/{migration-id}/impact-analysis.md`

---

#### /mapping — Generate the Field Mapping Document

```
/mapping {migration-id}
```

Generates a detailed field mapping document: source schema, target schema, transformation expressions,
lookup / reference tables, derived fields, fields not migrated, and ADF Data Flow expression summary.

**Pre-condition:** Review must be APPROVED.

**Output:** `docs-generated/{migration-id}/field-mapping.md`

---

#### /pipeline — Generate the ADF Pipeline Design

```
/pipeline {migration-id}
```

Generates the ADF pipeline design: architecture diagram (Mermaid), linked service catalogue, dataset catalogue,
pipeline catalogue, data flow catalogue, parameter definitions, trigger configuration, activity detail,
error routing, monitoring, and deployment steps.

**Pre-condition:** Review must be APPROVED.

**Output:** `docs-generated/{migration-id}/pipeline-design.md`

---

#### /testplan — Generate the Test Plan and Strategy

```
/testplan {migration-id}
```

Generates a full test plan covering: SIT (system integration), UAT (business acceptance), performance,
security, and regression suites. Minimum test cases for every standard scenario.

**Pre-condition:** Review must be APPROVED.

**Output:** `docs-generated/{migration-id}/test-plan-and-strategy.md`

---

#### /extract testplan — Extract Test Plan to ALM-Ready Files

```
/extract testplan {migration-id}
```

Reads the test plan document and writes ALM-ready output. The JSON file is the primary ALM import artifact with full rich content (steps as `{ step, action, expected }` arrays) preserved. The CSV carries metadata only.

**Output:**
- `docs-generated/{m}/alm-extract/test-plan-extract.json` — **primary ALM import**: full rich content
- `docs-generated/{m}/alm-extract/test-plan-extract.csv` — metadata summary only
- `docs-generated/{m}/alm-extract/test-plan-summary.md` — human-readable review copy

---

#### /extract testsuites — Extract One or All Test Suites

```
/extract testsuites {migration-id}
/extract testsuites {migration-id} {suite}   ← sit | uat | perf | sec | reg
```

**Output:**
- `docs-generated/{m}/alm-extract/suites-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{m}/alm-extract/suites-extract.csv` — metadata summary only
- `docs-generated/{m}/alm-extract/suites-summary.md`

---

#### /extract testcases — Extract One or All Test Cases

```
/extract testcases {migration-id}
/extract testcases {migration-id} TC-DM-SIT-01
```

**Output:**
- `docs-generated/{m}/alm-extract/testcases-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{m}/alm-extract/testcases-extract.csv` — metadata summary only
- `docs-generated/{m}/alm-extract/testcases-detail.md` — full formatted blocks for human review

---

#### /alm push-tests — Create Test Plan in Azure DevOps

```
/alm push-tests {migration-id}
```

Creates the full test plan, suites, and test cases in ADO using MCP tools, then writes the ALM-assigned IDs
back into `test-plan-and-strategy.md`.

**Output:** ADO test plan created; `test-plan-and-strategy.md` updated with Plan ID, Suite IDs, TC IDs.

---

### Phase 2 — Design the Technical Solution

#### /plan — Generate the Technical Plan

```
/plan {migration-id}
```

Decomposes the migration into a work item hierarchy: Epic → Feature → User Story → Task.
Standard features: Infrastructure, SQL Staging, ADF Datasets, ADF Pipelines, ADF Data Flows,
Triggers, Testing, Deployment, Documentation.

**Cross-feature scan:** `/plan` automatically scans existing plans for shared Data Migration components (ADF pipelines, SQL tables, Dataverse entity targets, linked services) and surfaces overlaps in a **Cross-Feature Dependencies** section. It also updates `plans/_component-registry.md` after generation.

**Output:** `plans/{migration-id}/plan.md` + `plans/{migration-id}/work-items.yaml`

---

#### /clarify — Review the Plan for Task-Readiness

```
/clarify {migration-id}
```

Reviews every user story and task against the task-readiness rubric: technical coverage
(SQL + ADF + testing + deploy), security coverage (Key Vault, network, PII masking),
and traceability (acceptance criteria, component tags).

**GATE — TASK-READY:** Blocks `/tdd`, `/blueprint`, and `/task` until passed.

**Output:** `plans/{migration-id}/clarify.md`

---

#### /tdd — Generate the Technical Design Document

```
/tdd {migration-id}
```

Generates the TDD: architecture diagram, Azure resource list, ADF component catalogue (linked services,
datasets, data flows, pipelines, triggers), SQL schema design, stored procedure design,
data flow transformation design, security design, error handling design, deployment design.

**Output:** `docs-generated/{migration-id}/technical-design-document.md`

---

#### /blueprint — Generate the Solution Blueprint

```
/blueprint {migration-id}
```

Generates the Solution Blueprint: component map (Mermaid), ADF artefact inventory, SQL artefact inventory,
test artefact inventory, design decisions table, constraints and assumptions, delivery checklist.

**Output:** `docs-generated/{migration-id}/solution-blueprint.md`

---

### Phase 3 — Build

#### /task — Generate Dev-Ready Task Cards

```
/task {migration-id}
```

Converts `work-items.yaml` into individual task cards — one file per task.
Cards for: SQL schema DDL, stored procedures, ADF linked services, datasets, data flows, pipelines, triggers,
test data files, test scripts, ARM template, deploy script, and documentation tasks.

**Output:** `tasks/{migration-id}/NN-{name}.md` (one file per task)

---

#### /validate — Validate Tasks Before Implementation

```
/validate {migration-id}
```

Validates every task card: output file path, component tags, acceptance criteria, implementation notes.
Type-specific checks: SQL DDL has required columns and idempotency, SPs have TRY/CATCH, ADF definitions
have retry policies and no hardcoded credentials.

Sets each card to **READY TO IMPLEMENT** or **BLOCKED: {reason}**.

**GATE — READY TO IMPLEMENT:** All cards must pass before `/implement` runs.

---

#### /implement — Generate Artefacts and Code

```
/implement {migration-id} [{task-uid}]
```

Generates all artefacts in the correct order:
1. SQL schemas (DDL)
2. SQL staging tables and error tables
3. SQL stored procedures
4. ADF linked service JSON
5. ADF dataset JSON
6. ADF data flow JSON
7. ADF pipeline JSON (Notify → Ingest/Extract → Transform/Export → Orchestrator)
8. ADF trigger JSON
9. ARM template + parameter files + `deploy.ps1`
10. Test data CSV/JSON files
11. Test scripts (PowerShell SFTP, SQL validation)

**Output:** `output/{migration-id}/adf/`, `output/{migration-id}/sql/`, `output/{migration-id}/tests/`

---

#### /document — Generate Operational Documentation

```
/document {migration-id}
```

Generates three documents:
- **Deployment Guide** — pre-deployment checklist, Key Vault setup, SQL and ADF deployment steps, smoke test, trigger enable procedure
- **Runbook** — monitoring, normal run behaviour, incident response playbook, manual re-run commands, error triage queries
- **Release Notes** — component summary, known issues, next steps

**Output:** `docs-generated/{migration-id}/deployment-guide.md`, `runbook.md`, `release-notes.md`

---

#### /alm — Synchronise Work Items with Azure DevOps

```
/alm extract {migration-id}
/alm sync {migration-id} {uid} {alm-id}
/alm sync-all {migration-id}
/alm get {migration-id} {alm-id}
/alm push-tests {migration-id}
```

- **extract** — builds a JSON extract of all work items for ADO import
- **sync** / **sync-all** — writes ADO-assigned IDs back into `work-items.yaml` and task cards
- **get** — fetches a work item from ADO
- **push-tests** — creates the full test plan + suites + test cases in ADO and writes ALM IDs back into the test plan document

**Output:** `output/{migration-id}/alm/`

---

## Brownfield Mode

Set `brownfield.enabled: true` in `constitution/10-alm-configuration.md` when migrating INTO a target that already contains data.

**Additional step required between `/review` and `/plan`:**

```
/review ──[APPROVED]──► /impact ──[IMPACT-ASSESSED]──► /plan
```

The impact analysis covers:
- Existing data volume estimate per entity
- Collision risk analysis (duplicate key, null overwrite, status conflict, lookup breakage)
- Duplicate detection strategy (Skip / Update / Merge / Error)
- Existing record treatment matrix
- Pre-migration snapshot recommendation
- Rollback plan

---

## Command Reference

| Command | Pre-condition | Output |
|---|---|---|
| `/spec {m}` | None | `specs/{m}/spec.md` |
| `/spec-alm {m}` | `requirement-intake: structured` in constitution | `specs/{m}/spec.md` (structured intake — preserves ALM IDs; set `l3-intake: optional` to allow partial L3 input, `/plan` generates missing stories) |
| `/review {m}` | spec.md exists | `specs/{m}/review.md` |
| `/split-spec {m}` | spec.md exists | `specs/{m}/spec.md` (migration-scoped) + domain-scoped specs (CE/INT/RPT as applicable) + split-manifest.md |
| `/impact {m}` | review APPROVED + brownfield.enabled | `specs/{m}/impact-analysis.md` |
| `/mapping {m}` | review APPROVED | `docs-generated/{m}/field-mapping.md` |
| `/pipeline {m}` | review APPROVED | `docs-generated/{m}/pipeline-design.md` |
| `/testplan {m}` | review APPROVED | `docs-generated/{m}/test-plan-and-strategy.md` |
| `/extract testplan {m}` | testplan exists | `alm-extract/test-plan-extract.{json,csv}` + `test-plan-summary.md` |
| `/extract testsuites {m} [suite]` | testplan exists | `alm-extract/suites-extract.{json,csv}` + `suites-summary.md` |
| `/extract testcases {m} [tc-id]` | testplan exists | `alm-extract/testcases-extract.{json,csv}` + `testcases-detail.md` |
| `/plan {m}` | review APPROVED (+impact-assessed if brownfield) | `plans/{m}/plan.md` + `work-items.yaml` (structured mode: Tasks only for ALM-provided L3; l3-optional: also generates new L3 stories for pending L2 branches) |
| `/clarify {m}` | plan.md exists | `plans/{m}/clarify.md` |
| `/tdd {m}` | clarify TASK-READY | `docs-generated/{m}/technical-design-document.md` |
| `/blueprint {m}` | clarify TASK-READY | `docs-generated/{m}/solution-blueprint.md` |
| `/task {m}` | clarify TASK-READY | `tasks/{m}/NN-{name}.md` |
| `/validate {m}` | task cards exist | Updates `validation-status` in each card |
| `/implement {m}` | all cards READY TO IMPLEMENT | `output/{m}/adf/`, `sql/`, `tests/` |
| `/document {m}` | implement complete | `docs-generated/{m}/` (deployment-guide, runbook, release-notes) |
| `/alm extract {m}` | plan.md exists | `output/{m}/alm/extract-{timestamp}.json` |
| `/alm sync {m} {uid} {id}` | extract run, ADO IDs known | Updates `work-items.yaml` + task card alm-id fields |
| `/alm push-tests {m}` | testplan exists | Creates ADO test plan/suites/cases; updates test-plan-and-strategy.md |

---

## 3. Structure and Outputs

```
templates/data-migration/
  .claude/
    commands/
      spec.md             ← /spec
      spec-alm.md         ← /spec-alm (structured intake)
      review.md           ← /review
      split-spec.md       ← /split-spec (mixed Migration + CE/PA/INT spec)
      impact.md           ← /impact (brownfield)
      mapping.md          ← /mapping
      pipeline.md         ← /pipeline
      testplan.md         ← /testplan
      extract.md          ← /extract testplan | testsuites | testcases
      plan.md             ← /plan
      clarify.md          ← /clarify
      tdd.md              ← /tdd
      blueprint.md        ← /blueprint
      task.md             ← /task
      validate.md         ← /validate
      implement.md        ← /implement
      document.md         ← /document
      alm.md              ← /alm

  constitution/
    CLAUDE.md             ← agent workflow, gates, naming, MCP tools
    00-index.md
    01-migration-patterns.md   ← SFTP↔DV, SQL↔DV, stage architecture, pipeline naming
    02-adf-standards.md        ← linked service, dataset, pipeline, data flow standards
    03-sql-staging-standards.md ← raw/stage/error/audit DDL, SP standards
    04-dataverse-standards.md  ← auth, entity mapping, batch size, throttling
    05-sftp-standards.md       ← file naming, folder structure, formats, encryption
    06-security-standards.md   ← Key Vault, RBAC, PII, network, audit
    07-error-handling.md       ← retry, dead-letter, partial success, alerting
    08-testing-standards.md    ← test levels, validation rules, test data management
    09-document-generation-rules.md
    10-alm-configuration.md    ← ADO org/project, direction, environments, staging DB, SFTP, ADF

  doc-templates/
    spec-template.md
    field-mapping-template.md
    test-plan-template.md

  Prompts/
    review/checklist.md
    clarify/readiness-rubric.md

  specs/           ← generated: spec.md, review.md, impact-analysis.md
  plans/           ← generated: plan.md, work-items.yaml, clarify.md
  tasks/           ← generated: NN-{name}.md task cards
  output/          ← generated: adf/, sql/, tests/, alm/
  docs-generated/  ← generated: all documents
```

---

## Configuration

### 1. Set ADO connection and work item settings (repo root — shared)

Edit [`../../alm-configuration.md`](../../alm-configuration.md) at the repo root:

```
ado-org-url:    https://dev.azure.com/your-org
ado-project:    YourProject
area-path:      YourProject\YourTeam
iteration-path: YourProject\Sprint 1
```

This file is shared across all agents. The migration agent reads it automatically and falls back to `constitution/10-alm-configuration.md` if the root file is not present.

### 2. Set MCP server credentials

The MCP server (`ado-alm`) uses `ADO_ORG_URL`, `ADO_PROJECT`, and `ADO_PAT` environment variables. Two ways to set them:

- **System environment variables** — picked up automatically by `.mcp.json` at the repo root for in-session MCP calls (e.g., `/alm push-tests`):
  ```powershell
  $env:ADO_ORG_URL = "https://dev.azure.com/your-org"
  $env:ADO_PROJECT = "YourProject"
  $env:ADO_PAT     = "your-personal-access-token"
  ```
- **ALM agent settings** — for the dedicated ALM agent workspace, set them in `tools/alm-agent/.claude/settings.json` under `mcpServers.ado-alm.env`. The PAT is never stored in any documentation file.

### 3. Set the migration direction

Edit `constitution/10-alm-configuration.md`:

```yaml
migration:
  direction: "SFTP_TO_DATAVERSE"    # or DATAVERSE_TO_SFTP, SQL_TO_DATAVERSE, etc.
  source_system: "legacy-erp"
  target_system: "dynamics365"
```

### 4. Configure environments

```yaml
migration:
  environments:
    dev:  "https://yourorgdev.crm4.dynamics.com"
    test: "https://yourorgtest.crm4.dynamics.com"
    prod: "https://yourorgrpod.crm4.dynamics.com"
  staging_db:
    server: "your-server.database.windows.net"
    database: "YourStagingDB"
  sftp:
    host: "sftp.yourserver.com"
    port: 22
  adf:
    resource_group: "rg-your-project"
    factory_name: "adf-your-project"
    location: "australiaeast"
```

### 5. Start your first migration

```
/spec sftp-to-dv-accounts
```

Describe your migration requirement. Follow the gate sequence — each gate tells you exactly what to fix before proceeding.
