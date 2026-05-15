# Power Apps Agent Template

Spec-driven development for Power Platform using Claude Code.
This template turns Claude Code into a structured delivery agent that takes a Power Platform requirement
from plain-language description to production-ready Canvas Apps, Power Automate Flows, Copilot Studio
agents, Model-Driven Apps, and Dataverse Schema — following your project's constitution rules at every step.

## Table of Contents

- [1. What Is It](#1-what-is-it)
- [2. How It Works](#2-how-it-works)
  - [Phase 1 — Define the Requirement](#phase-1--define-the-requirement)
    - [/spec](#spec--write-the-functional-specification)
    - [/spec-alm](#spec-alm--import-and-enhance-alm-work-items)
    - [/review](#review--validate-the-spec-against-the-constitution)
    - [/split-spec](#split-spec--split-a-mixed-power-apps--integration--data-migration-spec)
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
    - [/implement](#implement--generate-artifacts-and-track-progress)
    - [/document](#document--generate-operational-documentation)
    - [/alm](#alm--synchronise-work-items-with-your-alm-tool)
- [3. Structure and Outputs](#3-structure-and-outputs)
- [Brownfield Mode](#brownfield-mode)
- [Configuration](#configuration)

---

## 1. What Is It

### Components the agent can build

| Component | What is generated | How to import |
|---|---|---|
| Canvas App | Power Fx formulas per screen as annotated YAML exports, named collections/variables, delegation warnings flagged | Power Apps Studio or solution import |
| Power Automate Flow | Flow definition JSON — renamed actions, error handling scope, connection references documented | `pac flow import` or solution import |
| Copilot Studio Agent | Topic YAML/JSON — trigger phrases, question nodes, branching, variables, escalation to human agent | Copilot Studio portal or `pac copilot` |
| Model-Driven App | Schema change description, Business Rule conditions/actions spec, view column/filter/sort spec | Maker Portal or solution import |
| Dataverse Schema | `schema-change.md` — tables, columns, relationships, delegation-safe column types, option sets | Maker Portal or `pac dataverse` CLI |

### Documents the agent generates

| Document | When | Audience |
|---|---|---|
| Functional Design Document | After spec is APPROVED | Business stakeholder, BA, UAT team |
| Test Plan and Strategy | After spec is APPROVED | QA — Canvas, flow, security, UAT test cases |
| Technical Design Document | After plan is TASK-READY | Solution Architect, Tech Lead |
| Solution Blueprint | After plan is TASK-READY | Solution Architect |
| App Design Document | After implementation | Stakeholders, support team |
| Flow Documentation | After implementation | Support team maintaining flows |
| Deployment Guide | After implementation | Release manager |
| User Guide | After implementation (if UI changes) | End users |

---

## 2. How It Works

### The process

```
PHASE 1 — DEFINE
  [Unstructured intake — plain-language requirement]
  /spec ──► /review ──[APPROVED]──► /fdd
             │         │           └──► /testplan
             │         └──[BROWNFIELD?]──► /impact ──[IMPACT-ASSESSED]──► continue to /plan
             └──[MIXED DOMAIN?]──► /split-spec ──► /review (re-run on scoped spec)

  [Structured intake — L1/L2/L3 from ALM tool]
  /spec-alm ──► /review ──[APPROVED]──► (same as above)

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
| IMPACT-ASSESSED | `/impact` *(brownfield mode only)* | `/plan` will not run |
| TASK-READY | `/clarify` writes `status: TASK-READY` in clarify.md | `/tdd`, `/blueprint`, `/task` will not run |
| READY TO IMPLEMENT | `/validate` writes `validation-status: READY TO IMPLEMENT` in each task card | `/implement` will refuse to run |

---

### Phase 1 — Define the Requirement

#### `/spec` — Write the Functional Specification

Takes your requirement in plain language and produces a structured functional specification.

```
/spec

Example description:
"Customer service agents need a canvas app to log and track customer requests.
 They enter request type, description, and urgency. A Power Automate flow notifies
 the assigned team via Teams. A Copilot Studio agent on the portal lets customers
 check their request status."
```

Output: `specs/{feature-name}/spec.md`

Contains:
- Business objective and success criteria
- In-scope / out-of-scope
- Actors, personas, and Power Platform security roles
- Numbered functional requirements (FR-001, FR-002, …)
- Power Platform impact summary (Canvas App screens, flows, Copilot topics, Dataverse tables)
- Business rules and open questions
- DLP policy risks and CoE alignment notes flagged

---

#### `/spec-alm` — Import and Enhance ALM Work Items

Use when your requirements already exist as L1/L2/L3 work items in Azure DevOps, Jira, or a similar tool.
Instead of writing a Power Platform spec from scratch, this command imports your existing hierarchy,
preserves all ALM IDs, and enhances each L3 item with FR-NNN requirements, acceptance criteria,
Power Platform component identification, delegation risk flags, and business rules.

**Pre-requisite:** Set `requirement-intake: structured` in `constitution/10-alm-configuration.md`.

```
/spec-alm

Paste or describe your ALM work items, e.g.:
EP-001 | L1 | Feature  | Customer Request Tracker     | Track and manage customer requests
FT-001 | L2 | Epic     | Request Submission           | Allow customers to submit requests via app
US-001 | L3 | Story    | New request form             | As a customer, I want to submit a request...
US-002 | L3 | Story    | Request status view          | As a customer, I want to track my requests...
```

Output: `specs/{feature-name}/spec.md`

Contains:
- YAML front matter with `intake: structured` and all L1/L2/L3 ALM IDs
- Section 5 organised by L1 → L2 → L3, each L3 enhanced with FR-NNN requirements and component identification
- Original ALM work item descriptions preserved verbatim before each enhancement
- Delegation risks, data considerations, constitution risks flagged
- §14 ALM Traceability Matrix: L3-ALM-ID → FR-NNN — used by `/plan` in structured mode

**Effect on `/plan`:** When the spec has `intake: structured`, `/plan` reads the existing L3 ALM IDs
from §14 and generates Task-level items only. The L1/L2/L3 hierarchy is NOT recreated.

##### L3-Optional Mode

When `l3-intake: optional` is set in `constitution/10-alm-configuration.md`, L3 work items do not need
to be fully populated in your ALM input. This is useful when the L1/L2 hierarchy is defined but User
Stories are not yet written.

| Configuration | Behaviour |
|---|---|
| `l3-intake: required` *(default)* | All L2 branches must have at least one L3 item. `/spec-alm` stops if any L2 has no L3. |
| `l3-intake: optional` | L3 may be absent or partial. `/spec-alm` marks gaps as pending. `/plan` generates new L3 User Stories for pending L2 branches, then Tasks under all L3s. |

**What `/spec-alm` does in L3-optional mode:**
- ALM-provided L3 items are enhanced as normal (FR-NNN requirements, acceptance criteria, Power Platform component identification)
- L2 branches with no L3 items get a pending placeholder block in §5 of the spec
- The ALM Traceability Matrix (§14) gains a **Source** column: `alm` for provided L3s, `pending` for gaps

**What `/plan` does in L3-optional mode:**
- For each ALM-provided L3 → generates Task items only (same as `l3-intake: required`)
- For each pending L2 → generates new User Story items (marked `⚑ NEW`) then Tasks under them
- Generated User Stories are pushed to ADO by `/wi-create-bulk` (ALM Agent), parented to the L2 ALM ID

**Example input with partial L3:**
```
EP-001 | L1 | Epic    | Customer Request Tracker  | Track and manage customer requests
FT-001 | L2 | Feature | Request Submission        | Allow submission via canvas app
FT-002 | L2 | Feature | Notifications             | Teams notifications for new requests (no L3 yet)
US-001 | L3 | Story   | New request form          | As a customer, I want to submit a request...
```
US-001 under FT-001 is enhanced normally. FT-002 is marked pending — `/plan` generates User Stories for it.

---

#### `/review` — Validate the Spec Against the Constitution

Checks the spec against all Power Platform constitution rules. Assigns APPROVED or NEEDS REWORK.

```
/review customer-request-tracker
```

Output: `specs/{feature-name}/review.md`

Contains:
- BLOCKER — constitution violations (e.g., delegation-unsafe filter on large table, missing connection reference, no escalation path in Copilot topic)
- REQUIRED — missing information that blocks planning
- RECOMMENDED — best practice gaps (e.g., no error handling scope on flow)
- QUESTION — needs clarification from business or CoE
- **Status: APPROVED / NEEDS REWORK**

> **Multi-domain detection:** `/review` scans for Azure Integration signals (Azure Function, Service Bus, APIM, DLQ, event-driven pipelines from external systems) and Data Migration signals (ADF, SFTP, staging tables, ingest pipelines) before any other check. If found, it raises a BLOCKER and directs you to run `/split-spec` first. This prevents Power Platform tasks being mixed with Azure infrastructure or data migration work in the same plan.

If NEEDS REWORK: fix the issues in spec.md and re-run `/review`.

---

#### `/split-spec` — Split a Mixed Power Apps + Integration + Data Migration Spec

Use when a spec contains Power Platform requirements (Canvas App, MDA, Power Automate within Platform, Copilot Studio, Dataverse), Azure Integration requirements (Azure Functions, Service Bus, APIM, external system sync), and/or Data Migration requirements (ADF pipelines, SFTP, SQL staging). `/review` will surface any mixed-domain content as a BLOCKER automatically.

```
/split-spec customer-request-tracker
```

What it does:
1. Classifies every FR as Power Apps / Integration / Data Migration / Reporting / Cross-cutting
2. Rewrites `specs/{feature-name}/spec.md` scoped to Power Platform only (delegation constraints and DLP compliance stay in this spec even if data originates from an ADF pipeline)
3. Creates `specs/{feature-name}-integration/spec.md` in Integration agent format — ready to copy into the Integration agent workspace
4. Creates `specs/{feature-name}-data-migration/spec.md` in Data Migration agent format — only when one or more FRs are classified as Data Migration
5. Creates `specs/{feature-name}-reporting/spec.md` in Reporting agent format — only when one or more FRs are classified as Reporting (Power BI reports, SSRS reports, datasets)
6. Writes `specs/{feature-name}/split-manifest.md` with the FR mapping, cross-cutting split details, and next-steps checklist

Cross-cutting FRs are split into child FRs per domain spanned: `FR-NNN-PA` (Power Apps portion), `FR-NNN-INT` (integration portion), `FR-NNN-DM` (data migration portion) — each referencing the others in Dependencies.

Output:
```
specs/{feature-name}/spec.md                            ← updated: Power Apps-scoped
specs/{feature-name}-integration/spec.md                ← new: Integration agent spec
specs/{feature-name}-data-migration/spec.md             ← new: Data Migration agent spec (if DM FRs exist)
specs/{feature-name}-reporting/spec.md                  ← new: Reporting agent spec (if RPT FRs exist)
specs/{feature-name}/split-manifest.md                  ← FR classification table + next steps
```

After running `/split-spec`, re-run `/review {feature-name}` on the now-scoped Power Apps spec.

---

#### `/fdd` — Generate the Functional Design Document

Expands the approved spec into a full FDD in business language.

```
/fdd customer-request-tracker
```

Output: `docs-generated/{feature}/functional-design-document.md`

Contains:
- Business process flows with decision points
- Screen-by-screen specifications (Canvas App) or form/view specifications (Model-Driven)
- Copilot Studio topic dialogue flows
- Power Automate flow business description (trigger → actions → outcomes)
- Dataverse table and column specifications (business language)
- Security access matrix (who can view/create/edit/delete)
- Functional gap log

Reviewed by: Business stakeholder, Product Owner, BA — before technical work begins.

---

#### `/testplan` — Generate the Test Plan and Strategy

Reads every FR in the spec and generates a complete test plan with test cases for each requirement.

```
/testplan customer-request-tracker
```

Output:
- `docs-generated/{feature}/test-plan-and-strategy.md` — strategy, scope, reference tables, traceability matrix
- `docs-generated/{feature}/test-cases/canvas.md` — Canvas App test cases
- `docs-generated/{feature}/test-cases/model-driven.md` — Model-Driven App test cases
- `docs-generated/{feature}/test-cases/flow.md` — Power Automate Flow test cases
- `docs-generated/{feature}/test-cases/copilot.md` — Copilot Studio test cases *(omitted if not in scope)*
- `docs-generated/{feature}/test-cases/security.md` — Security test cases
- `docs-generated/{feature}/test-cases/uat.md` — UAT test cases
- `docs-generated/{feature}/test-cases/regression.md` — Regression test cases

Contains:
- Test strategy (risk-based)
- Test types: Canvas, Model-Driven, Flow, Copilot, Security, UAT, Regression
- Full test case detail in per-suite files — keeps the main document readable at any scale
- Test data requirements
- Entry and exit criteria per test level

Functional test cases are written here — before any technical planning — so QA and business can review coverage early.

---

#### `/extract testplan` — Extract Test Plan to ALM-Ready Files

Reads the test plan and all suite files, then writes ALM-ready output. The JSON file is the primary ALM import artifact with full rich content preserved. The CSV carries metadata only. Every TC ID is the stable unique identifier used to sync ALM IDs back.

```
/extract testplan customer-request-tracker
```

Output:
- `docs-generated/{feature}/alm-extract/test-plan-extract.json` — **primary ALM import**: full rich content, steps as `{ step, action, expected }` array
- `docs-generated/{feature}/alm-extract/test-plan-extract.csv` — metadata summary only (Step Count, no step content)
- `docs-generated/{feature}/alm-extract/test-plan-summary.md` — human-readable review copy

---

#### `/extract testsuites` — Extract One or All Test Suites

Extracts one or all test suites with full step detail and rich content intact.

```
/extract testsuites customer-request-tracker
/extract testsuites customer-request-tracker flow
```

Suite options: `canvas` | `model-driven` | `flow` | `copilot` | `security` | `uat` | `regression` | `all` (default)

Output:
- `docs-generated/{feature}/alm-extract/suites-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{feature}/alm-extract/suites-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/suites-summary.md`

---

#### `/extract testcases` — Extract One or All Test Cases

Extracts a single test case or every test case across all suites, with full step detail and rich content intact.

```
/extract testcases customer-request-tracker
/extract testcases customer-request-tracker TC-FL003
```

Output:
- `docs-generated/{feature}/alm-extract/testcases-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{feature}/alm-extract/testcases-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/testcases-detail.md` — full formatted blocks for human review

---

#### `/alm sync-testplan` — Sync ALM IDs Back to Test Files

After creating test cases in ALM (which assigns ALM IDs), write the IDs back into the test plan reference tables and suite files. Supports bulk sync from a CSV mapping file or a single TC update.

```
# Bulk — reads docs-generated/{feature}/alm-extract/alm-mapping.csv
/alm sync-testplan customer-request-tracker

# Single
/alm sync-testplan customer-request-tracker TC-FL003 12346
```

Mapping file format:
```
TC ID,ALM ID
TC-CA001,12344
TC-FL001,12348
```

Updates both the main `test-plan-and-strategy.md` reference tables and the individual suite files.

---

### Phase 2 — Design the Technical Solution

#### `/plan` — Generate the Technical Plan

Decomposes the approved spec into Feature → Epic → User Story → High-level Task hierarchy.

```
/plan customer-request-tracker
```

Output: `plans/{feature}/plan.md`

Contains:
- Feature and Epic structure
- User Stories (As a … I want … so that …)
- High-level tasks — component type (Canvas/Flow/Copilot/MDA/Schema), screen/topic/table name, dependencies, complexity (S/M/L/XL)
- Full task inventory table
- Constitution exception requests

Tasks at this stage are WHAT to build — no formulas, no flow actions.

**Structured mode:** When the spec has `intake: structured`, `/plan` generates Task items only — the
L1/L2/L3 hierarchy is not recreated. Tasks are parented directly to existing ALM work items.

**L3-optional mode:** When `l3-intake: optional` is also set, `/plan` first generates new L3 User
Stories for any L2 branches marked pending in the spec, then generates Tasks under all L3s (both
ALM-provided and generated). Generated stories are marked `⚑ NEW` in `plan.md` and pushed to ADO
by the ALM Agent (`/wi-create-bulk`).

**Cross-feature scan:** `/plan` automatically scans existing plans for shared Power Platform components (Dataverse tables, Canvas App screens, MDA forms/views, flows, Copilot topics, Security Roles) and surfaces overlaps in **Section 4a — Cross-Feature Dependencies**. It also updates `plans/_component-registry.md` after generation.

---

#### `/clarify` — Review the Plan for Task Readiness

Evaluates every task against the Power Platform readiness rubric. Flags tasks too ambiguous for a dev-ready card.

```
/clarify customer-request-tracker
```

Output: `plans/{feature}/clarify.md`

Contains:
- Per-task status: READY / BLOCKED / QUESTION
- Blockers: delegation-unsafe column used as filter, connection reference not named, Copilot topic trigger phrases missing
- Questions with assumed answers if left unanswered
- Dependency risks (schema before Canvas App that reads it; schema before flow that creates records)
- Split recommendations for XL tasks
- **Status: TASK-READY / PARTIALLY READY / NOT READY**

---

#### `/tdd` — Generate the Technical Design Document

Produces the full TDD covering Power Fx specs, flow specs, Copilot Studio design, schema, and ALM.

```
/tdd customer-request-tracker
```

Output: `docs-generated/{feature}/technical-design-document.md`

Contains:
- Architecture decisions with constitution rule references
- Component interaction diagram (canvas app → Dataverse → flow → Teams/Copilot)
- Canvas App technical specs (screen names, navigation, named formulas, collections, variables, delegation analysis)
- Power Automate flow specs (trigger, actions, connection references, error handling, child flows)
- Copilot Studio specs (topic names, trigger phrases, entities, variables, actions called, escalation)
- Dataverse schema design (table/column schema names, types, delegation-safe patterns, relationships)
- Security role matrix and column-level security profiles
- Solution ALM design (connection references, environment variables, dependencies)
- Technical risks and mitigations

Reviewed by: Solution Architect, Tech Lead — before task cards are written.

---

#### `/blueprint` — Generate the Solution Blueprint

Selects an architecture pattern and produces a high-level blueprint.

```
/blueprint customer-request-tracker
```

Output: `docs-generated/{feature}/solution-blueprint.md`

Patterns available for Power Platform:
- **Canvas-First** — Canvas App as primary user interface, Dataverse as data store
- **Model-Driven-First** — Model-Driven App for complex data-centric scenarios
- **Copilot-Led** — Copilot Studio as primary interaction channel, backed by flows and Dataverse
- **Flow-Orchestrated** — Power Automate drives business process, apps as lightweight front ends
- **Hybrid** — Canvas for custom UX, Model-Driven for admin/back-office, Copilot for self-service

Contains:
- Pattern selected with rationale and alternatives rejected
- Component architecture diagram (Mermaid `graph LR`)
- Dataverse design (tables, relationships, delegation strategy)
- Security architecture (Azure AD groups, DLP impact, column security)
- CoE alignment and licensing notes
- ALM architecture (pac CLI, environment strategy, connection reference management)
- Technical risks table

Reviewed by: Solution Architect — before implementation begins.

---

### Phase 3 — Build

#### `/task` — Generate Dev-Ready Task Cards

Converts every high-level task into a standalone task card a developer can implement without asking questions.

```
/task customer-request-tracker
```

Output:
```
tasks/{feature}/01-dataverse-schema.md
tasks/{feature}/02-canvas-app-request-form.md
tasks/{feature}/03-notify-team-flow.md
tasks/{feature}/04-copilot-status-check-topic.md
...
```

Each task card contains:
- Component type, screen/topic/table name, FR refs, complexity, output path
- `validation-status: NOT VALIDATED`
- Context — why this task exists
- Power Platform specifics: screen names, named formula names, connection reference names, trigger type, topic trigger phrases, variable names
- Technical approach — numbered step-by-step
- Acceptance criteria (AC-001, …) — testable statements
- Test cases — one per AC minimum
- Definition of Done checklist

---

#### `/validate` — Validate Tasks Before Implementation

Final gate before any artifacts are generated. Sets `validation-status` on every task card.

```
/validate customer-request-tracker           ← all tasks for a feature
/validate customer-request-tracker/02-*.md   ← single task
```

What is checked:

| Check | Power Platform specifics |
|---|---|
| Completeness | ACs testable, test cases exist, output path defined |
| Canvas specifics | Screen name follows `scr{Purpose}` convention, delegation-safe filter confirmed, connection reference named |
| Flow specifics | Connection reference named, trigger type specified, error handling scope present |
| Copilot specifics | Trigger phrases listed, escalation path defined, variables follow `gbl_`/`tp_` naming |
| TDD alignment | Screen names, formula names, flow names, topic names match TDD |
| Blueprint alignment | Component type consistent with chosen pattern |
| Dependency order | Schema before Canvas App and flows that read/write it |
| Constitution | No hardcoded environment URLs, no `Navigate()` without screen name constant, DLP-safe connectors only |

Each task card is updated to `READY TO IMPLEMENT`, `NEEDS REWORK`, or `BLOCKED`.

---

#### `/implement` — Generate Artifacts and Track Progress

Reads a validated task card, generates all Power Platform artifacts, produces a task-level implementation record, and updates the feature tracker. Refuses to run if `validation-status` is not `READY TO IMPLEMENT`.

```
/implement customer-request-tracker/01-dataverse-schema.md
/implement customer-request-tracker/02-canvas-app-request-form.md
/implement customer-request-tracker/03-notify-team-flow.md
/implement customer-request-tracker/04-copilot-status-check-topic.md
```

On every run, `/implement`:
1. Sets `status: IN PROGRESS` on the task card at the start
2. Creates `tasks/{feature}/tracker.md` on first run (updated on every subsequent run)
3. Generates the artifact or documents configuration steps
4. Generates an implementation record at `output/{feature}/impl-docs/`
5. Sets `status: DONE` and `impl-doc-path` on the task card
6. Updates the tracker with DONE status, impl-doc link, and completion percentage

**What is generated per component type:**

| Component | Artifact | Implementation record |
|---|---|---|
| Canvas App | Power Fx YAML per screen, delegation warnings commented | Artifacts created, delegation status, connection refs used, AC sign-off |
| Power Automate Flow | `{flow-name}.json` (pac-compatible), connection references listed | Artifacts created, connection refs, DLP impact, AC sign-off |
| Copilot Studio Topic | `{topic-name}.yaml` — trigger phrases, nodes, branching, variables, actions | Artifacts created, AC sign-off |
| Model-Driven App | `schema-change.md`, Business Rule spec, view spec | Artifacts created, AC sign-off |
| Dataverse Schema | `schema-change.md` — tables, columns, types, relationships | Artifacts created, manual steps, AC sign-off |
| Security Role | Security role specification document | Config steps completed, settings applied, AC sign-off |
| Configuration | — | Config steps completed, settings applied, manual steps, AC sign-off |

**Implementation tracker** and **implementation record** work the same as described in the D365 CE template — one tracker per feature updated after each task, one implementation record per task covering artifacts or config steps, deviations, manual steps, and AC sign-off.

---

#### `/document` — Generate Operational Documentation

Reads all artefacts for a completed feature and generates release and operational documents.

```
/document customer-request-tracker
```

Output (only documents applicable to the feature):
```
docs-generated/{feature}/app-design.md           ← Canvas/MDA screen map, navigation, UX decisions
docs-generated/{feature}/flow-documentation.md   ← Flow descriptions, trigger, actions, error handling
docs-generated/{feature}/deployment-guide.md     ← Solution export, import, connection reference setup
docs-generated/{feature}/user-guide.md           ← End-user instructions for the app and Copilot
docs-generated/{feature}/release-notes.md        ← What changed and why
```

---

#### `/alm` — Synchronise Work Items with Your ALM Tool

Manages the link between this project's work breakdown and an external ALM tool (Azure DevOps, Jira, etc.). Configure the tool, hierarchy, and field mapping in `constitution/10-alm-configuration.md` before running this command.

Three sub-commands:

**`extract`** — Build the full work-item payload so an external ALM Agent can create items with correct parent-child links and field values.

```
/alm extract customer-request-tracker
```

Reads `plans/{feature}/work-items.yaml`, assigns stable UIDs to any items that lack one, and writes a JSON payload containing all four hierarchy levels with mapped field names (e.g., `System.Title`, `Microsoft.VSTS.Common.AcceptanceCriteria`), priority integers, status strings, parent UIDs, and children UIDs.

Output: `output/{feature}/alm/extract-{YYYYMMDD-HHmmss}.json`

**`sync`** — Write the ALM-assigned IDs back into the project after the ALM Agent has created the work items.

Single item:
```
/alm sync customer-request-tracker customer-request-tracker-T-001 12345
```

Bulk file (sent by the ALM Agent):
```
/alm sync customer-request-tracker --file output/customer-request-tracker/alm/alm-response.json
```

Updates `work-items.yaml` with `alm-id` values. For Task-level items also updates `alm-id` in the matching task card front matter. The UID is the stable correlation key and never changes.

**`get`** — Retrieve the current full state of a specific work item by its ALM ID.

```
/alm get customer-request-tracker 12345
```

Returns the work item's current state including `validation-status` and `impl-doc-path` for Task-level items — so the ALM Agent can push the latest progress back into your tool.

Output: `output/{feature}/alm/get-{alm-id}-{YYYYMMDD}.json`

---

## 3. Structure and Outputs

### Folder structure

```
power-apps/
│
├── .claude/
│   ├── commands/               ← The 17 slash commands
│   └── settings.json           ← Write permissions scoped to output folders
│
├── constitution/               ← Non-negotiable Power Platform rules every command follows
│   ├── 00-index.md
│   ├── 01-canvas-apps.md              ← Screen naming, control naming, delegation, accessibility
│   ├── 02-model-driven-apps.md        ← Form naming, Business Rules scope, no OOB modification
│   ├── 03-power-automate.md           ← Flow naming, action renaming, error handling, connection refs
│   ├── 04-dataverse-schema.md         ← Table/column naming, publisher prefix, delegation-safe types
│   ├── 05-copilot-studio.md           ← Topic design, entity rules, variable naming, escalation
│   ├── 06-security-model.md           ← Azure AD auth, Azure AD groups for sharing, DLP impact
│   ├── 07-devops-alm.md               ← Personal dev environments, pac CLI, connection references
│   ├── 08-testing-standards.md        ← Canvas test studio, flow test, Copilot test requirements
│   ├── 09-document-generation-rules.md ← Output paths for artifacts and docs
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
│   ├── clarify/readiness-rubric.md    ← Power Platform task readiness criteria
│   └── plan/hierarchy.md              ← Feature/Epic/Story/Task definitions
│
├── specs/{feature}/
│   ├── spec.md                        ← Written by /spec
│   ├── review.md                      ← Written by /review (APPROVED / NEEDS REWORK)
│   └── impact-analysis.md             ← Written by /impact (IMPACT-ASSESSED — brownfield only)
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
│   ├── impl-docs/                     ← One implementation record per task (artifact + config)
│   │   └── T-NNN-{task-name}-impl.md ← AC sign-off, artifacts created, manual steps, deviations
│   └── src/
│       ├── CanvasApps/                ← Power Fx YAML formula exports per screen
│       ├── Flows/                     ← Flow definition JSON (pac-compatible)
│       ├── CopilotStudio/             ← Topic YAML definitions
│       ├── DataverseSchema/           ← schema-change.md
│       └── ModelDrivenApps/           ← schema, Business Rule, view specs
│
└── docs-generated/{feature}/
    ├── functional-design-document.md  ← /fdd
    ├── test-plan-and-strategy.md      ← /testplan (reference tables + links)
    ├── test-cases/                    ← /testplan (full test case tables)
    │   ├── canvas.md
    │   ├── model-driven.md
    │   ├── flow.md
    │   ├── copilot.md
    │   ├── security.md
    │   ├── uat.md
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
    ├── app-design.md                  ← /document
    ├── flow-documentation.md          ← /document
    ├── deployment-guide.md            ← /document
    ├── user-guide.md                  ← /document (if UI changes)
    └── release-notes.md               ← /document
```

### Artifact map

| Artifact | Created by | Location |
|---|---|---|
| Functional Specification | `/spec` | `specs/{f}/spec.md` |
| Spec Review Report | `/review` | `specs/{f}/review.md` |
| Impact Analysis | `/impact` *(brownfield only)* | `specs/{f}/impact-analysis.md` |
| Power Apps-scoped spec (after split) | `/split-spec` | `specs/{f}/spec.md` (updated) |
| Integration spec (after split) | `/split-spec` | `specs/{f}-integration/spec.md` |
| Data Migration spec (after split) | `/split-spec` | `specs/{f}-data-migration/spec.md` *(only if DM FRs present)* |
| Reporting spec (after split) | `/split-spec` | `specs/{f}-reporting/spec.md` *(only if RPT FRs present)* |
| Split manifest | `/split-spec` | `specs/{f}/split-manifest.md` |
| Functional Design Document | `/fdd` | `docs-generated/{f}/functional-design-document.md` |
| Test Plan and Strategy | `/testplan` | `docs-generated/{f}/test-plan-and-strategy.md` |
| Test Cases — Canvas | `/testplan` | `docs-generated/{f}/test-cases/canvas.md` |
| Test Cases — Model-Driven | `/testplan` | `docs-generated/{f}/test-cases/model-driven.md` |
| Test Cases — Flow | `/testplan` | `docs-generated/{f}/test-cases/flow.md` |
| Test Cases — Copilot | `/testplan` | `docs-generated/{f}/test-cases/copilot.md` |
| Test Cases — Security | `/testplan` | `docs-generated/{f}/test-cases/security.md` |
| Test Cases — UAT | `/testplan` | `docs-generated/{f}/test-cases/uat.md` |
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
| Canvas App formulas | `/implement` | `output/{f}/src/CanvasApps/` |
| Power Automate flow JSON | `/implement` | `output/{f}/src/Flows/` |
| Copilot Studio topic YAML | `/implement` | `output/{f}/src/CopilotStudio/` |
| Dataverse schema description | `/implement` | `output/{f}/src/DataverseSchema/schema-change.md` |
| Implementation record (per task) | `/implement` | `output/{f}/impl-docs/T-NNN-{name}-impl.md` |
| Implementation tracker (per feature) | `/implement` | `tasks/{f}/tracker.md` |
| Operational docs | `/document` | `docs-generated/{f}/` |
| ALM work-item extract | `/alm extract` | `output/{f}/alm/extract-{timestamp}.json` |
| ALM work-item get | `/alm get` | `output/{f}/alm/get-{alm-id}-{date}.json` |

### Deploying the output

**Prerequisites:**
- Power Platform environment provisioned — personal dev environment for build, shared for UAT and prod
- Publisher prefix and solution name configured in `constitution/04-dataverse-schema.md`
- An unmanaged solution created in the dev environment
- Connection references created in each target environment before flow import
- `pac` CLI (Power Platform CLI) installed

**Step 1 — Apply schema changes first**

Create tables, columns, relationships, and option sets from `schema-change.md` in Maker Portal before any Canvas App, flow, or Copilot topic that depends on them. Or via pac CLI:

```powershell
pac dataverse create-table --environment <env-id> \
  --display-name "Customer Request" --schema-name xyz_customerrequest
```

**Step 2 — Add Canvas App formulas**

Paste the Power Fx YAML from `output/{feature}/src/CanvasApps/` into Power Apps Studio per screen. Or import via solution:

```powershell
pac solution import \
  --path output/{feature}/src/CanvasApps/solution.zip \
  --environment <env-id> --activate-plugins
```

**Step 3 — Import Power Automate flows**

```powershell
pac flow import \
  --environment <env-id> \
  --path output/{feature}/src/Flows/{flow-name}.json
```

After import, open each flow in the portal and wire connection references to the environment's named connections.

**Step 4 — Import Copilot Studio topics**

```powershell
pac copilot import \
  --environment <env-id> \
  --path output/{feature}/src/CopilotStudio/topics/
```

Or open Copilot Studio → Import topic → select the YAML file. After import, set any environment variables the agent uses.

**Step 5 — Add all components to your solution and export as managed**

```powershell
pac solution export \
  --path dist/{feature}-managed.zip \
  --name {SolutionName} \
  --managed \
  --environment <dev-env-id>
```

**Step 6 — Promote to UAT and Production**

```powershell
pac solution import \
  --path dist/{feature}-managed.zip \
  --environment <uat-env-id> \
  --activate-plugins
```

After import, update connection references in the target environment. Verify flows are turned on and Copilot topics are published.

---

## Brownfield Mode

Use when adding features to a Power Platform system that already exists and has been documented
by the `d365-ce-brownfield` agent.

### Enable brownfield mode

Open `constitution/10-alm-configuration.md` and set:

```ini
[brownfield]
enabled:   true
docs-path: ../../d365-ce-brownfield/docs-generated
```

### What changes when enabled

| Command | Brownfield behaviour |
|---|---|
| `/spec` | Reads existing component inventory; generates §15 Brownfield Context classifying each component as EXISTS/NEW |
| `/review` | Checks §15 is present when existing components are referenced |
| `/impact` | **Required before `/plan`** — classifies every component as NEW / EXTEND / REPLACE / REFERENCED / CONFLICT; writes `specs/{f}/impact-analysis.md` |
| `/plan` | Gates on `impact-analysis.md` (IMPACT-ASSESSED); stamps `brownfield-action` on every task |
| `/task` | Reads existing component docs for EXTEND/REPLACE tasks; adds Existing System section to each card |
| `/tdd` | Reads existing architecture docs as baseline; adds Brownfield Baseline callouts per component section |
| `/blueprint` | Reads existing blueprint and dependency map; adds §9 Brownfield Architecture Delta |
| `/implement` | Reads existing component naming conventions; enforces EXTEND must not rename existing artefacts |

### Run the brownfield agent first

```
[open templates/d365-ce-brownfield in Claude Code]
/scan
/document all
/fdd
/tdd
/blueprint
/index
```

### Then run the delivery workflow with `/impact`

```
/spec {feature-name}
/review {feature-name}
/impact {feature-name}     ← classifies every component: NEW/EXTEND/REPLACE/REFERENCED/CONFLICT
/plan {feature-name}
/clarify {feature-name}
/tdd {feature-name}
/blueprint {feature-name}
/task {feature-name}
/validate {feature-name}
/implement {feature-name}/{task-card}
```

---

## Configuration

Before first use, update the following files in `constitution/`:

| File | What to set |
|---|---|
| `04-dataverse-schema.md` | Publisher prefix (e.g., `xyz`), solution unique name, solution display name |
| `06-security-model.md` | Azure AD group names used for app sharing, DLP policy name |
| `07-devops-alm.md` | Environment strategy (dev/uat/prod GUIDs), pac auth profile name |
| `10-alm-configuration.md` | Domain-specific settings: `requirement-intake` (`unstructured` \| `structured`), `l3-intake` (`required` \| `optional`), and `[brownfield]` block if adding features to an existing Power Platform system. ADO connection, work item hierarchy, and field mapping are read from `../../alm-configuration.md` at the repo root (fallback: set them here if the root file does not exist). |

**ADO / ALM setup:** ADO org URL, project name, area path, and iteration path are configured once in [`../../alm-configuration.md`](../../alm-configuration.md) at the repo root and shared across all agents. The MCP server credentials (`ADO_ORG_URL`, `ADO_PROJECT`, `ADO_PAT`) are set as system environment variables (used by `.mcp.json`) or in `tools/alm-agent/.claude/settings.json`. See the root [README.md](../../README.md) for the full setup walkthrough.
