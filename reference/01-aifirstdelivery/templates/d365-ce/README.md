# D365 CE Agent Template

Spec-driven development for Dynamics 365 Customer Engagement using Claude Code.
This template turns Claude Code into a structured delivery agent that takes a D365 CE requirement
from plain-language description to production-ready Plugins, PCF Controls, JavaScript Web Resources,
and Dataverse Schema — following your project's constitution rules at every step.

---

## Table of Contents

- [1. What Is It](#1-what-is-it)
- [2. How It Works](#2-how-it-works)
  - [Phase 1 — Define the Requirement](#phase-1--define-the-requirement)
    - [/spec](#spec--write-the-functional-specification)
    - [/spec-alm](#spec-alm--import-and-enhance-alm-work-items)
    - [/review](#review--validate-the-spec-against-the-constitution)
    - [/split-spec](#split-spec--split-a-mixed-ce--integration--data-migration-spec)
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
    - [/implement](#implement--generate-code-and-track-progress)
    - [/document](#document--generate-operational-documentation)
    - [/alm](#alm--synchronise-work-items-with-your-alm-tool)
- [Brownfield Mode](#brownfield-mode)
- [3. Structure and Outputs](#3-structure-and-outputs)
- [Configuration](#configuration)

---

## 1. What Is It

### Components the agent can build

| Component | What is generated | Tests |
|---|---|---|
| Plugin | C# class implementing `IPlugin`, `Execute` method, tracing, early-bound types, null guards, error handling | FakeXrmEasy unit tests — happy path, validation failure, edge cases |
| JavaScript Web Resource | Namespaced JS module, `executionContext` pattern, `OnLoad`/`OnChange`/`OnSave` handlers, async/await | Jest tests with Xrm mock |
| PCF Control | TypeScript control, `ControlManifest.Input.xml`, full lifecycle (`init`, `updateView`, `getOutputs`, `destroy`) | Jest tests with mocked `ComponentFramework.Context` |
| Dataverse Schema | `schema-change.md` — tables, columns, data types, relationships, required flags, lookup targets | — (applied via Maker Portal or pac CLI) |

### Documents the agent generates

| Document | When | Audience |
|---|---|---|
| Functional Design Document | After spec is APPROVED | Business stakeholder, BA, UAT team |
| Test Plan and Strategy | After spec is APPROVED | QA, BA — covers all FR test cases |
| Technical Design Document | After plan is TASK-READY | Solution Architect, Tech Lead |
| Solution Blueprint | After plan is TASK-READY | Solution Architect |
| Deployment Guide | After implementation | Ops, release manager |
| Plugin Registration steps | After implementation | Developer deploying to environment |
| Release Notes | After implementation | Stakeholders |

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

Takes your requirement in plain language and produces a structured functional specification.

```
/spec

Example description:
"We need to track loyalty points on the Account record.
 Sales reps enter points manually (0–99999).
 When points are saved, a Pre-Create plugin must validate the range.
 The Sales Manager should receive an email on save."
```

Output: `specs/{feature-name}/spec.md`

Contains:
- Business objective and success criteria
- In-scope / out-of-scope
- Actors, personas, and D365 security roles
- Numbered functional requirements (FR-001, FR-002, …)
- Business rules
- D365 CE impact summary (entities, forms, plugins, flows affected)
- Open questions and constitution risks flagged

---

#### `/spec-alm` — Import and Enhance ALM Work Items

Use when your requirements already exist as L1/L2/L3 work items in Azure DevOps, Jira, or a similar tool.
Instead of writing a spec from scratch, this command imports your existing hierarchy, preserves all ALM IDs,
and enhances each L3 item with FR-NNN requirements, acceptance criteria, D365 CE impact, and business rules.

**Pre-requisite:** Set `requirement-intake: structured` in `constitution/10-alm-configuration.md`.

```
/spec-alm

Paste or describe your ALM work items, e.g.:
EP-001 | L1 | Feature  | Account Management       | Manage customer accounts in D365 CE
FT-001 | L2 | Epic     | Account Creation         | Allow users to create new account records
US-001 | L3 | Story    | Create Account form      | As a Sales Rep, I want to create an account...
US-002 | L3 | Story    | Account validation rules | As a Sales Manager, I want mandatory fields...
```

Output: `specs/{feature-name}/spec.md`

Contains:
- YAML front matter with `intake: structured` and all L1/L2/L3 ALM IDs
- Section 5 organised by L1 → L2 → L3, each L3 enhanced with FR-NNN requirements
- Original ALM work item descriptions preserved verbatim before each enhancement
- Consolidated business rules (BR-NNN), D365 CE impact, open questions, constitution risks
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
- ALM-provided L3 items are enhanced as normal (FR-NNN requirements, acceptance criteria, D365 CE impact)
- L2 branches with no L3 items get a pending placeholder block in §5 of the spec
- The ALM Traceability Matrix (§13) gains a **Source** column: `alm` for provided L3s, `pending` for gaps

**What `/plan` does in L3-optional mode:**
- For each ALM-provided L3 → generates Task items only (same as `l3-intake: required`)
- For each pending L2 → generates new User Story items (marked `⚑ NEW`) then Tasks under them
- Generated User Stories are pushed to ADO by `/wi-create-bulk` (ALM Agent), parented to the L2 ALM ID

**Example input with partial L3:**
```
EP-001 | L1 | Epic    | Account Management  | Manage accounts in D365 CE
FT-001 | L2 | Feature | Account Creation    | Create new account records
FT-002 | L2 | Feature | Account Validation  | Validation rules for accounts (no L3 yet)
US-001 | L3 | Story   | Create Account form | As a Sales Rep, I want to create an account...
```
US-001 under FT-001 is enhanced normally. FT-002 is marked pending — `/plan` generates User Stories for it.

---

#### `/review` — Validate the Spec Against the Constitution

Checks the spec against all D365 CE constitution rules. Assigns APPROVED or NEEDS REWORK.

```
/review account-loyalty-points
```

Output: `specs/{feature-name}/review.md`

Contains:
- BLOCKER — constitution violations (e.g., plugin registered without stage, hardcoded GUID)
- REQUIRED — missing information that blocks planning
- RECOMMENDED — best practice gaps
- QUESTION — needs stakeholder clarification
- **Status: APPROVED / NEEDS REWORK**

> **Multi-domain detection:** `/review` scans for Azure Integration signals (Azure Function, Service Bus, APIM, DLQ, event-driven pipelines) and Data Migration signals (ADF, SFTP, staging tables, ingest pipelines) before any other check. If found, it raises a BLOCKER and directs you to run `/split-spec` first. This prevents CE tasks being mixed with integration or data migration work in the same plan.

If NEEDS REWORK: fix the issues in spec.md and re-run `/review`.

---

#### `/split-spec` — Split a Mixed CE + Integration + Data Migration Spec

Use when a spec contains D365 CE requirements (forms, plugins, business rules), Azure Integration requirements (Azure Functions, Service Bus, APIM), and/or Data Migration requirements (ADF pipelines, SFTP, SQL staging). `/review` will surface any mixed-domain content as a BLOCKER automatically.

```
/split-spec account-loyalty-points
```

What it does:
1. Classifies every FR as CE / Integration / Data Migration / Reporting / Cross-cutting
2. Rewrites `specs/{feature-name}/spec.md` scoped to D365 CE only
3. Creates `specs/{feature-name}-integration/spec.md` in Integration agent format — ready to copy into the Integration agent workspace
4. Creates `specs/{feature-name}-data-migration/spec.md` in Data Migration agent format — only when one or more FRs are classified as Data Migration
5. Creates `specs/{feature-name}-reporting/spec.md` in Reporting agent format — only when one or more FRs are classified as Reporting (Power BI reports, SSRS reports, datasets)
6. Writes `specs/{feature-name}/split-manifest.md` with the FR mapping, cross-cutting split details, and next-steps checklist

Cross-cutting FRs are split into child FRs per domain spanned: `FR-NNN-CE` (CE portion), `FR-NNN-INT` (integration portion), `FR-NNN-DM` (data migration portion) — each referencing the others in Dependencies.

Output:
```
specs/{feature-name}/spec.md                            ← updated: CE-scoped
specs/{feature-name}-integration/spec.md                ← new: Integration agent spec
specs/{feature-name}-data-migration/spec.md             ← new: Data Migration agent spec (if DM FRs exist)
specs/{feature-name}-reporting/spec.md                  ← new: Reporting agent spec (if RPT FRs exist)
specs/{feature-name}/split-manifest.md                  ← FR classification table + next steps
```

After running `/split-spec`, re-run `/review {feature-name}` on the now-scoped CE spec.

---

#### `/fdd` — Generate the Functional Design Document

Expands the approved spec into a full FDD in business language.

```
/fdd account-loyalty-points
```

Output: `docs-generated/{feature}/functional-design-document.md`

Contains:
- Business process flows with decision points
- Detailed functional requirements — user interaction and system response
- Entity, form, view specifications
- Business rules detail
- Security access matrix (which roles can do what)
- Functional gap log

Reviewed by: Business stakeholder, Product Owner, BA — before technical work begins.

---

#### `/testplan` — Generate the Test Plan and Strategy

Reads every FR in the spec and generates a complete test plan with test cases for each requirement.

```
/testplan account-loyalty-points
```

Output:
- `docs-generated/{feature}/test-plan-and-strategy.md` — strategy, scope, reference tables, traceability matrix
- `docs-generated/{feature}/test-cases/system-integration.md` — System and Integration test case cards
- `docs-generated/{feature}/test-cases/uat.md` — UAT test case cards (Business User assigned)
- `docs-generated/{feature}/test-cases/security.md` — Security test case cards (one per security role)
- `docs-generated/{feature}/test-cases/regression.md` — Regression test case cards

Contains:
- Test strategy (risk-based)
- Test types: Integration, System, UAT, Security, Regression
- Full test case cards per suite in separate files — keeps the main document readable at any scale
- Test data requirements
- Entry and exit criteria per test level
- Defect severity definitions

Functional test cases are written here — before any technical planning — so QA and business can review coverage early.

---

#### `/extract testplan` — Extract Test Plan to ALM-Ready Files

Reads the test plan and all suite files, then writes ALM-ready output. The JSON file is the primary ALM import artifact — all test case content is preserved as raw markdown (rich text, multi-line steps, code blocks). The CSV carries metadata only. Every TC ID is the stable unique identifier used to sync ALM IDs back after the ALM tool creates the work items.

```
/extract testplan account-loyalty-points
```

Output:
- `docs-generated/{feature}/alm-extract/test-plan-extract.json` — **primary ALM import**: full rich content, steps as `{ step, action, expected }` array, `content-format: "markdown"`
- `docs-generated/{feature}/alm-extract/test-plan-extract.csv` — metadata summary only (Step Count, no step content)
- `docs-generated/{feature}/alm-extract/test-plan-summary.md` — human-readable review copy with suite breakdown

---

#### `/extract testsuites` — Extract One or All Test Suites

Extracts one or all test suites with full step detail and rich content intact. Useful when you want to import a single suite into ALM without re-processing the entire plan.

```
/extract testsuites account-loyalty-points
/extract testsuites account-loyalty-points uat
```

Suite options: `system-integration` | `uat` | `security` | `regression` | `all` (default)

Output:
- `docs-generated/{feature}/alm-extract/suites-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{feature}/alm-extract/suites-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/suites-summary.md`

---

#### `/extract testcases` — Extract One or All Test Cases

Extracts a single test case or every test case across all suites, with full step detail and rich content intact.

```
/extract testcases account-loyalty-points
/extract testcases account-loyalty-points TC-CRM-SI-003
```

Output:
- `docs-generated/{feature}/alm-extract/testcases-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{feature}/alm-extract/testcases-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/testcases-detail.md` — full formatted cards for human review

---

#### `/alm sync-testplan` — Sync ALM IDs Back to Test Files

After creating test cases in ALM (which assigns ALM IDs), write the IDs back into the test plan reference tables and suite files. Supports bulk sync from a CSV mapping file or a single TC update.

```
# Bulk — reads docs-generated/{feature}/alm-extract/alm-mapping.csv
/alm sync-testplan account-loyalty-points

# Single
/alm sync-testplan account-loyalty-points TC-CRM-SI-003 12346
```

Mapping file format:
```
TC ID,ALM ID
TC-CRM-SI-001,12344
TC-CRM-UAT-001,12348
```

Updates both the main `test-plan-and-strategy.md` reference tables and the individual suite files.

---

### Phase 2 — Design the Technical Solution

#### `/plan` — Generate the Technical Plan

Decomposes the approved spec into Feature → Epic → User Story → High-level Task hierarchy.

```
/plan account-loyalty-points
```

Output: `plans/{feature}/plan.md`

Contains:
- Feature and Epic structure
- User Stories (As a … I want … so that …)
- High-level tasks — component type (Plugin/JS/PCF/Schema), entity, message, stage, dependencies, complexity (S/M/L/XL)
- Full task inventory table
- Constitution exception requests

Tasks at this stage are WHAT to build — no code, no formulas.

**Structured mode:** When the spec has `intake: structured`, `/plan` generates Task items only — the
L1/L2/L3 hierarchy is not recreated. Tasks are parented directly to existing ALM work items.

**L3-optional mode:** When `l3-intake: optional` is also set, `/plan` first generates new L3 User
Stories for any L2 branches marked pending in the spec, then generates Tasks under all L3s (both
ALM-provided and generated). Generated stories are marked `⚑ NEW` in `plan.md` and pushed to ADO
by the ALM Agent (`/wi-create-bulk`).

**Cross-feature scan:** `/plan` automatically scans all existing plans in `plans/` for shared D365 CE components (entities, plugins, flows, security roles) before generating its output. Overlaps are classified as CONFLICT, SEQUENTIAL, or SHARED and surfaced in **Section 4a — Cross-Feature Dependencies**. After writing the plan, `/plan` updates `plans/_component-registry.md` with this feature's components so future plans can detect conflicts.

---

#### `/clarify` — Review the Plan for Task Readiness

Evaluates every task against the D365 CE readiness rubric. Flags tasks too ambiguous for a dev-ready card.

```
/clarify account-loyalty-points
```

Output: `plans/{feature}/clarify.md`

Contains:
- Per-task status: READY / BLOCKED / QUESTION
- Blockers: missing entity name, message, stage, or trigger
- Questions with assumed answers if left unanswered
- Dependency risks (schema must exist before plugin references it)
- Split recommendations for XL tasks
- **Status: TASK-READY / PARTIALLY READY / NOT READY**

---

#### `/tdd` — Generate the Technical Design Document

Produces the full TDD covering plugin specs, schema design, JS/PCF specs, security, and ALM.

```
/tdd account-loyalty-points
```

Output: `docs-generated/{feature}/technical-design-document.md`

Contains:
- Architecture decisions with constitution rule references
- Component interaction diagram
- Dataverse schema design (table/column schema names, types, relationships)
- Plugin technical specs (class name, namespace, registration: entity/message/stage/rank, logic, error messages)
- JavaScript and PCF technical specs
- Security role matrix and field security profiles
- Solution and ALM design (solution components, environment variables, dependencies)
- Technical risks and mitigations

Reviewed by: Solution Architect, Tech Lead — before task cards are written.

---

#### `/blueprint` — Generate the Solution Blueprint

Selects an architecture pattern and produces a high-level blueprint.

```
/blueprint account-loyalty-points
```

Output: `docs-generated/{feature}/solution-blueprint.md`

Patterns available for D365 CE:
- **Plugin-Centric** — business logic enforced server-side via synchronous plugins
- **Flow-Centric** — Power Automate drives orchestration, minimal plugins
- **Hybrid** — plugin for validation, flow for notifications and integrations
- **UI-Extension Heavy** — PCF and JS drive the user experience
- **Integration-Centric** — D365 as data source, external system drives logic

Contains:
- Pattern selected with rationale and alternatives rejected
- Component architecture diagram (Mermaid `graph LR`)
- D365 CE extension point decisions table
- Data, security, integration, ALM, and NFR coverage sections
- Technical risks table

Reviewed by: Solution Architect — before implementation begins.

---

### Phase 3 — Build

#### `/task` — Generate Dev-Ready Task Cards

Converts every high-level task into a standalone task card a developer can implement without asking questions.

```
/task account-loyalty-points
```

Output:
```
tasks/{feature}/01-schema-change.md
tasks/{feature}/02-account-pre-create-plugin.md
tasks/{feature}/03-loyalty-points-js-validation.md
...
```

Each task card contains:
- Component type (Plugin / JS / PCF / Schema), entity, message, stage, FR refs, complexity, output path
- `validation-status: NOT VALIDATED`
- Context — why this task exists
- Plugin specifics: namespace, class name, registration (entity/message/stage/rank/filtering attributes)
- JS specifics: form name, event, fields accessed
- PCF specifics: target entity, bound column, manifest attributes
- Technical approach — numbered step-by-step
- Acceptance criteria (AC-001, …) — testable statements
- Test cases — one per AC minimum
- Definition of Done checklist

---

#### `/validate` — Validate Tasks Before Implementation

Final gate before code is written. Sets `validation-status` on every task card.

```
/validate account-loyalty-points           ← all tasks for a feature
/validate account-loyalty-points/02-*.md   ← single task
```

What is checked:

| Check | D365 CE specifics |
|---|---|
| Completeness | ACs testable, test cases exist, output path defined |
| Plugin specifics | Stage (Pre/Post/PreValidation), message, entity, execution rank all set |
| JS specifics | Form name, event type, executionContext usage correct |
| TDD alignment | Class names, namespaces, output paths match TDD |
| Blueprint alignment | Component type consistent with chosen pattern |
| Dependency order | Schema tasks before any plugin or JS that references those columns |
| Constitution | No hardcoded GUIDs, publisher prefix on all schema names, no unsupported API usage |

Each task card is updated to `READY TO IMPLEMENT`, `NEEDS REWORK`, or `BLOCKED`.

Example report:
```
VALIDATION REPORT — account-loyalty-points
══════════════════════════════════════════
T-001: Dataverse schema change      READY TO IMPLEMENT ✓
T-002: AccountPreCreatePlugin       NEEDS REWORK
  ✗ [BLOCKER] Execution rank not specified
  ✗ [REQUIRED] Class name in task (AccountPlugin) differs from TDD (LoyaltyPointsPlugin)
T-003: Loyalty points JS validation READY TO IMPLEMENT ✓

SUMMARY  READY: 2  NEEDS REWORK: 1  BLOCKED: 0
ACTION: Fix T-002 then re-run /validate.
```

---

#### `/implement` — Generate Code and Track Progress

Reads a validated task card, generates all code and tests, produces a task-level implementation record, and updates the feature tracker. Refuses to run if `validation-status` is not `READY TO IMPLEMENT`.

```
/implement account-loyalty-points/01-schema-change.md
/implement account-loyalty-points/02-account-pre-create-plugin.md
/implement account-loyalty-points/03-loyalty-points-js-validation.md
```

On every run, `/implement`:
1. Sets `status: IN PROGRESS` on the task card at the start
2. Creates `tasks/{feature}/tracker.md` on first run (updated on every subsequent run)
3. Generates the code or configuration artifact
4. Generates an implementation record at `output/{feature}/impl-docs/`
5. Sets `status: DONE` and `impl-doc-path` on the task card
6. Updates the tracker with DONE status, impl-doc link, and completion percentage

**What is generated per component type:**

| Component | Code / artifact | Tests | Implementation record |
|---|---|---|---|
| Plugin | `{Namespace}/{ClassName}.cs` | `{ClassName}Tests.cs` (FakeXrmEasy) | Files created, build status, AC sign-off |
| JavaScript Web Resource | `{publisher}_{EntityName}.js` | `{EntityName}.test.js` (Jest) | Files created, build status, AC sign-off |
| PCF Control | `index.ts`, `ControlManifest.Input.xml` | `{ControlName}.test.ts` | Files created, build status, AC sign-off |
| Schema Change | `schema-change.md` | — | Schema items listed, manual steps, AC sign-off |
| Configuration | — | — | Config steps completed, settings applied, manual steps, AC sign-off |

**Implementation tracker** (`tasks/{feature}/tracker.md`):

```
# Implementation Tracker — Account Loyalty Points

## Progress Summary
Total: 3  Done: 2  In Progress: 0  TODO: 1  Blocked: 0
Completion: 67% (2 of 3 tasks done)

## Task Status
| Task ID | Title               | Type        | Status | Impl Doc             |
| T-001   | Dataverse schema    | SchemaChange| DONE   | [impl](output/...)   |
| T-002   | PreCreate plugin    | Plugin      | DONE   | [impl](output/...)   |
| T-003   | JS validation       | WebResource | TODO   | —                    |

## Implementation Log
| Date       | Task ID | Title            | Event              |
| 2026-04-25 | T-001   | Dataverse schema | Status → IN PROGRESS |
| 2026-04-25 | T-001   | Dataverse schema | Status → DONE      |
```

**Implementation record** (`output/{feature}/impl-docs/T-NNN-{name}-impl.md`):

Generated for every task — code tasks and configuration tasks alike. Contains:
- Implementation summary
- Files created (code tasks) or configuration steps completed (config tasks)
- Settings applied (config tasks)
- Build status (code tasks)
- Deviations from the task card
- Manual steps still required
- Acceptance criteria sign-off (PASS / FAIL / PARTIAL per AC)

---

#### `/document` — Generate Operational Documentation

Reads all artefacts for a completed feature and generates release documents.

```
/document account-loyalty-points
```

Output (only documents applicable to the feature):
```
docs-generated/{feature}/plugin-registration.md    ← step-by-step Plugin Registration Tool guide
docs-generated/{feature}/deployment-guide.md       ← solution export, import, and ALM steps
docs-generated/{feature}/release-notes.md          ← what changed and why
docs-generated/{feature}/user-guide.md             ← if UI changes were made (forms, views, PCF)
```

---

#### `/alm` — Synchronise Work Items with Your ALM Tool

Manages the link between this project's work breakdown and an external ALM tool (Azure DevOps, Jira, etc.). Configure the tool, hierarchy, and field mapping in `constitution/10-alm-configuration.md` before running this command.

Four sub-commands:

**`extract`** — Build the full work-item payload so an external ALM Agent can create items with correct parent-child links and field values.

```
/alm extract account-loyalty-points
```

Reads `plans/{feature}/work-items.yaml`, assigns stable UIDs to any items that lack one, and writes a JSON payload containing all four hierarchy levels with mapped field names (e.g., `System.Title`, `Microsoft.VSTS.Common.AcceptanceCriteria`), priority integers, status strings, parent UIDs, and children UIDs.

Output: `output/{feature}/alm/extract-{YYYYMMDD-HHmmss}.json`

**`sync`** — Write the ALM-assigned IDs back into the project after the ALM Agent has created the work items.

Single item:
```
/alm sync account-loyalty-points account-loyalty-points-T-001 12345
```

Bulk file (sent by the ALM Agent):
```
/alm sync account-loyalty-points --file output/account-loyalty-points/alm/alm-response.json
```

Updates `work-items.yaml` with `alm-id` values. For Task-level items also updates `alm-id` in the matching task card front matter. The UID is the stable correlation key and never changes.

**`get`** — Retrieve the current full state of a specific work item by its ALM ID.

```
/alm get account-loyalty-points 12345
```

Returns the work item's current state including `validation-status` and `impl-doc-path` for Task-level items — so the ALM Agent can push the latest progress back into your tool.

Output: `output/{feature}/alm/get-{alm-id}-{YYYYMMDD}.json`

**`sync-testplan`** — Write test-case ALM IDs back into the test plan and suite files after the test management tool has created them.

Bulk (from `alm-mapping.csv`):
```
/alm sync-testplan account-loyalty-points
```

Single:
```
/alm sync-testplan account-loyalty-points TC-CRM-SI-001 12344
```

Updates both `test-plan-and-strategy.md` reference tables and the matching suite files. Uses TC ID prefix routing to target the correct suite file.

---

---

## Brownfield Mode

Use brownfield mode when adding features to a **D365 CE system that already exists** — plugins already registered, entities already customised, flows already running. The agent reads the existing system's documentation before every step and makes decisions (extend vs replace, avoid name collisions, match existing conventions) based on what is already there.

### How to enable

**Step 1 — Generate brownfield documentation** using the `d365-ce-brownfield` agent.
Point it at your existing solution files and source code. It produces a `docs-generated/` folder containing the component inventory, entity catalogue, plugin docs, web resource docs, and architecture docs.

**Step 2 — Enable brownfield mode** in `constitution/10-alm-configuration.md`:

```
[brownfield]
enabled:   true
docs-path: ../../d365-ce-brownfield/docs-generated
```

Set `docs-path` to the relative path from this agent folder to the brownfield agent's `docs-generated/` folder.

**Step 3 — Run the additional `/impact` command** after `/review` and before `/plan`:

```
/spec account-loyalty-points
/review account-loyalty-points
/impact account-loyalty-points          ← brownfield mode only
/plan account-loyalty-points
```

### The `/impact` command

Reads the approved spec against the brownfield component inventory and classifies every component the feature will touch:

| Classification | Meaning |
|---|---|
| `NEW` | Does not exist in the brownfield system — create from scratch |
| `EXTEND` | Exists; new capability being added (new plugin step, new column, new flow branch) |
| `REPLACE` | Exists; logic substantially rewritten |
| `REFERENCED` | Exists and consumed but its definition does not change |
| `CONFLICT` | Exists but the spec's intent contradicts the current behaviour — needs resolution |

Output: `specs/{feature}/impact-analysis.md` (status: IMPACT-ASSESSED)

`/plan` reads this file in brownfield mode and stamps every task with `brownfield-action`, ensuring developers know exactly what they are modifying vs creating. The plan also gains **Section 8 — Brownfield Impact** summarising all affected components with risk ratings.

### What changes in each command

| Command | Brownfield behaviour |
|---|---|
| `/spec` | Reads existing inventory; adds §14 Brownfield Context (component × status × proposed action) |
| `/review` | Checks §14 is present and FRs describe the *delta* not just the end state |
| `/impact` | Full impact analysis — NEW / EXTEND / REPLACE / REFERENCED / CONFLICT classification |
| `/plan` | Requires impact-analysis.md; stamps `brownfield-action` on every task; adds §8 Brownfield Impact |
| `/task` | Reads existing component doc for EXTEND/REPLACE tasks; adds Existing System section to each card |
| `/tdd` | Reads existing architecture as baseline; adds Brownfield Baseline callouts |
| `/blueprint` | Reads existing blueprint; adds §9 Brownfield Architecture Delta |
| `/implement` | Reads existing component doc before generating code; extension safety enforced |

---

## 3. Structure and Outputs

### Folder structure

```
d365-ce/
│
├── .claude/
│   ├── commands/               ← The 17 slash commands (alm has 4 sub-commands; extract has 3)
│   └── settings.json           ← Write permissions scoped to output folders
│
├── constitution/               ← Non-negotiable D365 CE rules every command follows
│   ├── 00-index.md
│   ├── 01-solution-design.md          ← Publisher prefix, solution name, naming conventions
│   ├── 02-plugin-standards.md         ← IPlugin pattern, registration rules, error handling
│   ├── 03-dataverse-schema.md         ← Table/column naming, data types, relationships
│   ├── 04-javascript-standards.md     ← Namespace pattern, Xrm API usage, event handlers
│   ├── 05-pcf-standards.md            ← PCF lifecycle, manifest, test requirements
│   ├── 06-security-model.md           ← Security roles, field security, record sharing
│   ├── 07-devops-alm.md               ← Solution ALM, environment variables, pipeline
│   ├── 08-testing-standards.md        ← FakeXrmEasy, Jest, test naming, coverage
│   ├── 09-document-generation-rules.md ← Output paths for code and docs
│   ├── 10-alm-configuration.md        ← ALM tool, work item hierarchy, field mapping, priority/status maps
│   └── CLAUDE.md                      ← Auto-loaded by Claude Code; full command reference
│
├── doc-templates/
│   ├── fdd-template.md
│   ├── tdd-template.md
│   ├── solution-blueprint-template.md
│   └── test-plan-template.md
│
├── Prompts/
│   ├── review/checklist.md            ← Constitution checks for /review
│   ├── clarify/readiness-rubric.md    ← D365 CE task readiness criteria
│   └── plan/hierarchy.md              ← Feature/Epic/Story/Task definitions
│
├── specs/{feature}/
│   ├── spec.md                        ← Written by /spec
│   ├── review.md                      ← Written by /review (APPROVED / NEEDS REWORK)
│   └── impact-analysis.md             ← Written by /impact (IMPACT-ASSESSED) — brownfield mode only
│
├── plans/{feature}/
│   ├── plan.md                        ← Written by /plan
│   ├── work-items.yaml                ← Written by /plan; consumed by /alm extract
│   └── clarify.md                     ← Written by /clarify (TASK-READY / NOT READY)
│
├── tasks/{feature}/
│   ├── NN-{task-name}.md              ← Written by /task; validation-status set by /validate
│   └── tracker.md                     ← Created/updated by /implement; tracks all task statuses
│
├── output/{feature}/
│   ├── alm/                           ← ALM sync artefacts
│   │   ├── extract-{timestamp}.json  ← Written by /alm extract; consumed by ALM Agent
│   │   └── get-{alm-id}-{date}.json  ← Written by /alm get; pushed back to ALM tool
│   ├── impl-docs/                     ← One implementation record per task (code + config)
│   │   └── T-NNN-{task-name}-impl.md ← AC sign-off, files created, manual steps, deviations
│   ├── src/
│   │   ├── Plugins/                   ← C# plugin classes
│   │   ├── WebResources/              ← JavaScript files
│   │   ├── PCF/                       ← TypeScript PCF project
│   │   └── SchemaChanges/             ← schema-change.md
│   └── tests/
│       ├── Plugins.Tests/             ← FakeXrmEasy test project
│       └── WebResources.Tests/        ← Jest test files
│
└── docs-generated/{feature}/
    ├── functional-design-document.md  ← /fdd
    ├── test-plan-and-strategy.md      ← /testplan (reference tables + links)
    ├── test-cases/                    ← /testplan (full test case cards)
    │   ├── system-integration.md
    │   ├── uat.md
    │   ├── security.md
    │   └── regression.md
    ├── alm-extract/                   ← /extract testplan, /extract testsuites, /extract testcases
    │   ├── test-plan-extract.json     ← /extract testplan  (primary ALM import — rich content)
    │   ├── test-plan-extract.csv      ← /extract testplan  (metadata summary only)
    │   ├── test-plan-summary.md       ← /extract testplan
    │   ├── suites-extract.json        ← /extract testsuites  (primary ALM import — rich content)
    │   ├── suites-extract.csv         ← /extract testsuites  (metadata summary only)
    │   ├── suites-summary.md          ← /extract testsuites
    │   ├── testcases-extract.json     ← /extract testcases  (primary ALM import — rich content)
    │   ├── testcases-extract.csv      ← /extract testcases  (metadata summary only)
    │   ├── testcases-detail.md        ← /extract testcases
    │   └── alm-mapping.csv            ← created manually; input to /alm sync-testplan
    ├── technical-design-document.md   ← /tdd
    ├── solution-blueprint.md          ← /blueprint
    ├── plugin-registration.md         ← /document
    ├── deployment-guide.md            ← /document
    └── release-notes.md               ← /document
```

### Artifact map

| Artifact | Created by | Location |
|---|---|---|
| Functional Specification | `/spec` | `specs/{f}/spec.md` |
| Spec Review Report | `/review` | `specs/{f}/review.md` |
| Impact Analysis | `/impact` | `specs/{f}/impact-analysis.md` *(brownfield mode only)* |
| CE-scoped spec (after split) | `/split-spec` | `specs/{f}/spec.md` (updated) |
| Integration spec (after split) | `/split-spec` | `specs/{f}-integration/spec.md` |
| Data Migration spec (after split) | `/split-spec` | `specs/{f}-data-migration/spec.md` *(only if DM FRs present)* |
| Reporting spec (after split) | `/split-spec` | `specs/{f}-reporting/spec.md` *(only if RPT FRs present)* |
| Split manifest | `/split-spec` | `specs/{f}/split-manifest.md` |
| Functional Design Document | `/fdd` | `docs-generated/{f}/functional-design-document.md` |
| Test Plan and Strategy | `/testplan` | `docs-generated/{f}/test-plan-and-strategy.md` |
| Test Cases — System/Integration | `/testplan` | `docs-generated/{f}/test-cases/system-integration.md` |
| Test Cases — UAT | `/testplan` | `docs-generated/{f}/test-cases/uat.md` |
| Test Cases — Security | `/testplan` | `docs-generated/{f}/test-cases/security.md` |
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
| Plan Clarification Report | `/clarify` | `plans/{f}/clarify.md` |
| Technical Design Document | `/tdd` | `docs-generated/{f}/technical-design-document.md` |
| Solution Blueprint | `/blueprint` | `docs-generated/{f}/solution-blueprint.md` |
| Task Cards | `/task` | `tasks/{f}/NN-{name}.md` |
| Plugin C# code + tests | `/implement` | `output/{f}/src/Plugins/` + `output/{f}/tests/Plugins.Tests/` |
| JavaScript + tests | `/implement` | `output/{f}/src/WebResources/` + `output/{f}/tests/WebResources.Tests/` |
| PCF TypeScript + tests | `/implement` | `output/{f}/src/PCF/` |
| Schema change description | `/implement` | `output/{f}/src/SchemaChanges/schema-change.md` |
| Implementation record (per task) | `/implement` | `output/{f}/impl-docs/T-NNN-{name}-impl.md` |
| Implementation tracker (per feature) | `/implement` | `tasks/{f}/tracker.md` |
| Operational docs | `/document` | `docs-generated/{f}/` |
| ALM work-item extract | `/alm extract` | `output/{f}/alm/extract-{timestamp}.json` |
| ALM work-item get | `/alm get` | `output/{f}/alm/get-{alm-id}-{date}.json` |

### Deploying the output

**Prerequisites:**
- D365 CE / Dataverse environment provisioned
- Publisher prefix and org prefix configured in `constitution/01-solution-design.md`
- An unmanaged solution created in the dev environment
- `pac` CLI (Power Platform CLI) installed, or Plugin Registration Tool available

**Step 1 — Apply schema changes first**

Open `schema-change.md` and create each table, column, and relationship in Maker Portal before any plugin or JS that depends on it is deployed. Or use the pac CLI:

```powershell
# Example: create a column via pac (table must exist first)
pac dataverse create-attribute --environment <env-id> --entity account --display-name "Loyalty Points" --schema-name xyz_loyaltypoints --type integer
```

**Step 2 — Build and register plugins**

```powershell
cd output/{feature}/src/Plugins
dotnet build -c Release

# Option A: Plugin Registration Tool
# Connect to org → Register Assembly → Create Step (entity, message, stage, rank, filtering attributes) → Add to solution

# Option B: pac CLI
pac plugin push --pluginFile bin/Release/net462/YourPlugin.dll
```

**Step 3 — Deploy JavaScript web resources**

```powershell
pac solution add-reference --path output/{feature}/src/WebResources/
pac solution import --path YourSolution.zip --activate-plugins
```

**Step 4 — Deploy PCF control**

```powershell
cd output/{feature}/src/PCF/YourControl
npm install && npm run build
pac pcf push --publisher-prefix xyz
```

**Step 5 — Add all components to solution and export as managed**

```powershell
pac solution export --path dist/YourSolution.zip --name YourSolution --managed
```

**Step 6 — Promote to higher environments**

```powershell
pac solution import --path dist/YourSolution.zip --environment <uat-env-id> --activate-plugins
```

---

## Configuration

Before first use, update the following files in `constitution/`:

| File | What to set |
|---|---|
| `01-solution-design.md` | Publisher prefix (e.g., `xyz`), solution unique name, solution display name |
| `02-plugin-standards.md` | Organisation namespace prefix for C# classes (e.g., `Contoso.D365`) |
| `09-document-generation-rules.md` | Confirm org prefix matches `01-solution-design.md` |
| `10-alm-configuration.md` | Domain-specific settings: `requirement-intake` (`unstructured` \| `structured`), `l3-intake` (`required` \| `optional`), and `[brownfield]` block if adding features to an existing system. ADO connection, work item hierarchy, and field mapping are read from `../../alm-configuration.md` at the repo root (fallback: set them here if the root file does not exist). |
