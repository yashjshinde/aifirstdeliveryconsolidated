# Azure Integration Agent Template

Spec-driven development for Azure Integration using Claude Code.
This template turns Claude Code into a structured delivery agent that takes an integration requirement
from plain-language description to production-ready Azure Functions, Logic Apps, Service Bus schemas,
APIM policies, and Bicep IaC — following your project's constitution rules at every step.

---

## Table of Contents

- [1. What Is It](#1-what-is-it)
- [2. How It Works](#2-how-it-works)
  - [Phase 1 — Define the Requirement](#phase-1--define-the-requirement)
    - [/spec](#spec--write-the-functional-specification)
    - [/spec-alm](#spec-alm--import-and-enhance-alm-work-items)
    - [/review](#review--validate-the-spec-against-the-constitution)
    - [/split-spec](#split-spec--split-a-mixed-integration--ce--power-apps-spec)
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
- [3. Structure and Outputs](#3-structure-and-outputs)
- [Brownfield Mode](#brownfield-mode)
- [Configuration](#configuration)

---

## 1. What Is It

### Components the agent can build

| Component | What is generated | Tests |
|---|---|---|
| Azure Function | C# isolated worker function, trigger binding, `ILogger` structured logging, correlation ID, Managed Identity client, Polly retry | xUnit test class — mocked logger and dependencies |
| Logic App Workflow | `workflow.json` with trigger, actions, error scope, retry policies on all connectors; `workflow-description.md` | — (tested via integration test) |
| Service Bus Schema | JSON Schema file + C# DTO class matching the message envelope (header + payload) | — |
| APIM Policy | Policy XML — JWT auth check, rate limit, correlation ID header injection, RFC 7807 error normalisation | — |
| Bicep IaC | Resource module, role assignments for Managed Identity, `@secure()` parameter file | — |

### Documents the agent generates

| Document | When | Audience |
|---|---|---|
| Functional Design Document | After spec is APPROVED | Business stakeholder, BA, integration architect |
| Test Plan and Strategy | After spec is APPROVED | QA — covers contract, integration, and perf test cases |
| Technical Design Document | After plan is TASK-READY | Solution Architect, Tech Lead |
| Solution Blueprint | After plan is TASK-READY | Solution Architect |
| API Contract | After implementation | Consumers of the API |
| Message Schema | After implementation | Teams producing or consuming Service Bus messages |
| Runbook | After implementation | Ops team — monitoring, DLQ handling, retry procedures |
| Deployment Guide | After implementation | Release manager |

---

## 2. How It Works

### The process

```
PHASE 1 — DEFINE
  [Unstructured intake — plain-language requirement]
  /spec ──► /review ──[APPROVED]──► /fdd
             │         │           └──► /testplan
             │         └──[BROWNFIELD?]──► /impact ──[IMPACT-ASSESSED]──► (continue to /plan)
             └──[PRE-SCOPED SPEC?]──► (copy spec folder from CE/Power Apps agent, run /review)

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
"When an order is placed in the e-commerce system, an order-created event must be published
 to Service Bus. A downstream Azure Function picks this up, enriches with customer data from
 D365, and calls the fulfilment API. Failed messages go to DLQ with alerting."
```

Output: `specs/{feature-name}/spec.md`

Contains:
- Business objective and success criteria
- In-scope / out-of-scope
- Actors and systems involved
- Numbered functional requirements (FR-001, FR-002, …)
- Integration interface summary (producers, consumers, protocols)
- Business rules and SLA expectations
- Open questions and constitution risks flagged

---

#### `/spec-alm` — Import and Enhance ALM Work Items

Use when your requirements already exist as L1/L2/L3 work items in Azure DevOps, Jira, or a similar tool.
Instead of writing an integration spec from scratch, this command imports your existing hierarchy, preserves
all ALM IDs, and enhances each L3 item with FR-NNN requirements, acceptance criteria, error handling, and
Azure Integration impact.

**Pre-requisite:** Set `requirement-intake: structured` in `constitution/10-alm-configuration.md`.

```
/spec-alm

Paste or describe your ALM work items, e.g.:
EP-001 | L1 | Feature  | CRM to ERP Integration      | Sync account data between systems
FT-001 | L2 | Epic     | Account Sync Flow            | Real-time account created/updated sync
US-001 | L3 | Story    | Account Created event        | As an ops user, I want new CRM accounts...
US-002 | L3 | Story    | Account Updated event        | As an ops user, I want account changes...
```

Output: `specs/{feature-name}/spec.md`

Contains:
- YAML front matter with `intake: structured` and all L1/L2/L3 ALM IDs
- Section 5 organised by L1 → L2 → L3, each L3 enhanced with FR-NNN requirements and error handling
- Original ALM work item descriptions preserved verbatim before each enhancement
- Non-functional requirements, error scenarios, constitution risks
- §13 ALM Traceability Matrix: L3-ALM-ID → FR-NNN — used by `/plan` in structured mode

**Effect on `/plan`:** When the spec has `intake: structured`, `/plan` reads the existing L3 ALM IDs
from §13 and generates Task-level items only. The L1/L2/L3 hierarchy is NOT recreated.

##### L3-Optional Mode

When `l3-intake: optional` is set in `constitution/10-alm-configuration.md`, L3 work items do not need
to be fully populated in your ALM input. This is useful when the L1/L2 hierarchy is defined but User
Stories are not yet written.

| Configuration | Behaviour |
|---|---|
| `l3-intake: required` *(default)* | All L2 branches must have at least one L3 item. `/spec-alm` stops if any L2 has no L3. |
| `l3-intake: optional` | L3 may be absent or partial. `/spec-alm` marks gaps as pending. `/plan` generates new L3 User Stories for pending L2 branches, then Tasks under all L3s. |

**What `/spec-alm` does in L3-optional mode:**
- ALM-provided L3 items are enhanced as normal (FR-NNN requirements, acceptance criteria, Azure Integration impact)
- L2 branches with no L3 items get a pending placeholder block in §5 of the spec
- The ALM Traceability Matrix (§13) gains a **Source** column: `alm` for provided L3s, `pending` for gaps

**What `/plan` does in L3-optional mode:**
- For each ALM-provided L3 → generates Task items only (same as `l3-intake: required`)
- For each pending L2 → generates new User Story items (marked `⚑ NEW`) then Tasks under them
- Generated User Stories are pushed to ADO by `/wi-create-bulk` (ALM Agent), parented to the L2 ALM ID

**Example input with partial L3:**
```
EP-001 | L1 | Epic    | CRM to ERP Integration  | Sync account data between systems
FT-001 | L2 | Feature | Account Sync Flow        | Real-time account created/updated sync
FT-002 | L2 | Feature | Error Handling           | DLQ alerting and retry (no L3 yet)
US-001 | L3 | Story   | Account Created event    | As an ops user, I want new CRM accounts synced...
```
US-001 under FT-001 is enhanced normally. FT-002 is marked pending — `/plan` generates User Stories for it.

---

#### `/review` — Validate the Spec Against the Constitution

Checks the spec against all Azure Integration constitution rules. Assigns APPROVED or NEEDS REWORK.

```
/review order-event-processor
```

Output: `specs/{feature-name}/review.md`

Contains:
- BLOCKER — constitution violations (e.g., no retry strategy defined, hardcoded connection string, missing Managed Identity)
- REQUIRED — missing information that blocks planning
- RECOMMENDED — best practice gaps (e.g., idempotency not addressed)
- QUESTION — needs clarification from integration architect or business
- **Status: APPROVED / NEEDS REWORK**

> **Multi-domain detection:** `/review` scans for D365 CE, Power Apps, and Data Migration signals (forms, plugins, Canvas App, MDA, Copilot Studio, delegation, ADF, SFTP, staging tables) before any other check. If found, it raises a BLOCKER directing you to run `/split-spec` in the CE, Power Apps, or F&O agent first, then copy the pre-scoped integration spec here. This keeps integration specs free of UI, platform-specific, and ADF-based data movement content.

If NEEDS REWORK: fix the issues in spec.md and re-run `/review`.

> **Receiving a spec from `/split-spec`:** If another domain's agent ran `/split-spec`, it placed a pre-scoped integration spec at `specs/{feature-name}-integration/spec.md`. Copy that folder into this workspace as `specs/{feature-name}/`, then run `/review {feature-name}` — no `/spec` needed. The spec is already in Integration agent format.

---

#### `/split-spec` — Split a Mixed Integration + CE / Power Apps Spec

Use when `/review` raises a multi-domain BLOCKER because the spec contains both integration requirements and D365 CE, Power Apps, or Data Migration requirements. The `/split-spec` command is run in the **originating domain agent** (CE, Power Apps, or F&O) — not here. The Integration agent receives the pre-scoped integration spec that `/split-spec` produces.

**If this spec itself is mixed** (contains CE, Power Apps, F&O, ADF/SFTP, or Reporting signals alongside integration requirements): run `/split-spec {feature-name}` here. It will:
1. Classify every FR as Integration, CE/PA/FO, Data Migration, Reporting, or Cross-cutting
2. Keep Integration-scoped content in the current spec file (path unchanged — no downstream commands need updating)
3. Create the CE / Power Apps / F&O scoped spec in the appropriate domain agent format
4. Create `specs/{feature-name}-data-migration/spec.md` for any ADF/SFTP/staging FRs — only if Data Migration FRs exist
5. Create `specs/{feature-name}-reporting/spec.md` for any Power BI / SSRS / dataset FRs — only if Reporting FRs exist
6. Produce `specs/{feature-name}/split-manifest.md` with the full FR classification and next-steps checklist

```
After split:
  Integration agent:    /review {feature-name}                ← re-run on the scoped integration spec
  CE/PA/FO agent:       /review or /fdd-review {feature-name} ← run in the domain agent workspace
  Data Migration agent: /review {feature-name}-data-migration ← run in the Data Migration agent workspace
```

---

#### `/fdd` — Generate the Functional Design Document

Expands the approved spec into a full FDD written in business and integration-architect language.

```
/fdd order-event-processor
```

Output: `docs-generated/{feature}/functional-design-document.md`

Contains:
- Integration interface catalogue (source system, target system, protocol, trigger, frequency)
- Data mapping — source fields → target fields with transformation rules
- Business process flows with decision points and failure paths
- SLA and NFR requirements
- Security and data classification summary
- Functional gap log

Reviewed by: Business stakeholder, Integration Architect — before technical work begins.

---

#### `/testplan` — Generate the Test Plan and Strategy

Reads every FR in the spec and generates a complete test plan with test cases for each requirement.

```
/testplan order-event-processor
```

Output:
- `docs-generated/{feature}/test-plan-and-strategy.md` — strategy, scope, reference tables, traceability matrix
- `docs-generated/{feature}/test-cases/contract.md` — Contract / Schema test cases
- `docs-generated/{feature}/test-cases/integration.md` — Integration / End-to-End test cases
- `docs-generated/{feature}/test-cases/performance.md` — Performance test cases
- `docs-generated/{feature}/test-cases/security.md` — Security test cases
- `docs-generated/{feature}/test-cases/chaos.md` — Chaos / Resilience test cases
- `docs-generated/{feature}/test-cases/uat.md` — UAT test cases

Contains:
- Test strategy (contract-first, risk-based)
- Test types: Contract (message schema), Integration (end-to-end flow), Performance (throughput), Security (auth/authz), Chaos/Resilience, UAT
- Full test case detail in per-suite files — keeps the main document readable at any scale
- Test data requirements and stub/mock strategy
- Entry and exit criteria per test level

Functional test cases are written here — before any technical work — so QA and architects can review coverage early.

---

#### `/extract testplan` — Extract Test Plan to ALM-Ready Files

Reads the test plan and all suite files, then writes ALM-ready output. The JSON file is the primary ALM import artifact with full rich content preserved. The CSV carries metadata only. Every TC ID is the stable unique identifier used to sync ALM IDs back.

```
/extract testplan order-event-processor
```

Output:
- `docs-generated/{feature}/alm-extract/test-plan-extract.json` — **primary ALM import**: full rich content, steps as `{ step, action, expected }` array
- `docs-generated/{feature}/alm-extract/test-plan-extract.csv` — metadata summary only (Step Count, no step content)
- `docs-generated/{feature}/alm-extract/test-plan-summary.md` — human-readable review copy

---

#### `/extract testsuites` — Extract One or All Test Suites

Extracts one or all test suites with full step detail and rich content intact.

```
/extract testsuites order-event-processor
/extract testsuites order-event-processor contract
```

Suite options: `contract` | `integration` | `performance` | `security` | `chaos` | `uat` | `all` (default)

Output:
- `docs-generated/{feature}/alm-extract/suites-extract.json` — **primary ALM import**: rich content preserved
- `docs-generated/{feature}/alm-extract/suites-extract.csv` — metadata summary only
- `docs-generated/{feature}/alm-extract/suites-summary.md`

---

#### `/extract testcases` — Extract One or All Test Cases

Extracts a single test case or every test case across all suites, with full step detail and rich content intact.

```
/extract testcases order-event-processor
/extract testcases order-event-processor TC-I003
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
/alm sync-testplan order-event-processor

# Single
/alm sync-testplan order-event-processor TC-I003 12346
```

Mapping file format:
```
TC ID,ALM ID
TC-C001,12344
TC-I001,12348
```

Updates both the main `test-plan-and-strategy.md` reference tables and the individual suite files.

---

### Phase 2 — Design the Technical Solution

#### `/plan` — Generate the Technical Plan

Decomposes the approved spec into Feature → Epic → User Story → High-level Task hierarchy.

```
/plan order-event-processor
```

Output: `plans/{feature}/plan.md`

Contains:
- Feature and Epic structure
- User Stories (As a … I want … so that …)
- High-level tasks — component type (Function/Logic App/Bicep/Schema/APIM), trigger type, dependencies, complexity (S/M/L/XL)
- Full task inventory table
- Constitution exception requests

Tasks at this stage are WHAT to build — no code yet.

**Structured mode:** When the spec has `intake: structured`, `/plan` generates Task items only — the
L1/L2/L3 hierarchy is not recreated. Tasks are parented directly to existing ALM work items.

**L3-optional mode:** When `l3-intake: optional` is also set, `/plan` first generates new L3 User
Stories for any L2 branches marked pending in the spec, then generates Tasks under all L3s (both
ALM-provided and generated). Generated stories are marked `⚑ NEW` in `plan.md` and pushed to ADO
by the ALM Agent (`/wi-create-bulk`).

**Cross-feature scan:** `/plan` automatically scans existing plans for shared Integration components (Azure Functions, Logic Apps, Service Bus topics/queues, APIM policies, Bicep resources) and surfaces overlaps in **Section 4a — Cross-Feature Dependencies**. It also updates `plans/_component-registry.md` after generation.

---

#### `/clarify` — Review the Plan for Task Readiness

Evaluates every task against the Azure Integration readiness rubric. Flags tasks too ambiguous for a dev-ready card.

```
/clarify order-event-processor
```

Output: `plans/{feature}/clarify.md`

Contains:
- Per-task status: READY / BLOCKED / QUESTION
- Blockers: missing trigger type, connection/identity not named, retry strategy undefined
- Questions with assumed answers if left unanswered
- Dependency risks (Bicep must run before Function deployment; schema must exist before Function binds to it)
- Split recommendations for XL tasks
- **Status: TASK-READY / PARTIALLY READY / NOT READY**

---

#### `/tdd` — Generate the Technical Design Document

Produces the full TDD covering function specs, workflow specs, schema design, infrastructure, and security.

```
/tdd order-event-processor
```

Output: `docs-generated/{feature}/technical-design-document.md`

Contains:
- Architecture decisions with constitution rule references
- Component interaction diagram (trigger → function → Service Bus → downstream)
- Azure Function specs (class name, trigger binding, input/output bindings, retry policy, error handling)
- Logic App workflow specs (trigger, actions, connector configuration, error scope)
- Service Bus topology (namespace, topic, subscriptions, DLQ, session requirements)
- APIM API design (operations, request/response schemas, policy specs)
- Bicep IaC design (resources, naming, SKU, Managed Identity role assignments)
- Security design (Managed Identity, Key Vault references, Private Endpoints)
- Technical risks and mitigations

Reviewed by: Solution Architect, Tech Lead — before task cards are written.

---

#### `/blueprint` — Generate the Solution Blueprint

Selects an architecture pattern and produces a high-level blueprint.

```
/blueprint order-event-processor
```

Output: `docs-generated/{feature}/solution-blueprint.md`

Patterns available for Azure Integration:
- **Event-Driven (Service Bus + Functions)** — async, decoupled, high-throughput
- **Request-Response (APIM + Functions)** — synchronous API integration
- **Orchestration (Logic Apps Standard)** — complex multi-step workflows with human approval
- **Hybrid** — APIM for external interface, Service Bus for internal async processing
- **Fan-out/Fan-in** — one source triggers parallel downstream processing

Contains:
- Pattern selected with rationale and alternatives rejected
- Component topology diagram (Mermaid `graph LR`)
- Resilience design (retry, DLQ, circuit breaker, idempotency)
- Security architecture (Managed Identity, Key Vault, Private Endpoints, RBAC)
- ALM architecture (Bicep pipeline, environment promotion strategy)
- Technical risks table

Reviewed by: Solution Architect — before implementation begins.

---

### Phase 3 — Build

#### `/task` — Generate Dev-Ready Task Cards

Converts every high-level task into a standalone task card a developer can implement without asking questions.

```
/task order-event-processor
```

Output:
```
tasks/{feature}/01-bicep-infrastructure.md
tasks/{feature}/02-service-bus-schema.md
tasks/{feature}/03-order-created-function.md
tasks/{feature}/04-apim-policy.md
...
```

Each task card contains:
- Component type, trigger type, FR refs, complexity, output path
- `validation-status: NOT VALIDATED`
- Context — why this task exists
- Azure specifics: trigger binding, connection/identity, retry config, DLQ handling, correlation ID
- Technical approach — numbered step-by-step
- Acceptance criteria (AC-001, …) — testable statements
- Test cases — one per AC minimum
- Definition of Done checklist

---

#### `/validate` — Validate Tasks Before Implementation

Final gate before code is written. Sets `validation-status` on every task card.

```
/validate order-event-processor           ← all tasks for a feature
/validate order-event-processor/03-*.md   ← single task
```

What is checked:

| Check | Azure Integration specifics |
|---|---|
| Completeness | ACs testable, test cases exist, output path defined |
| Component specifics | Trigger type named, Managed Identity role named, Key Vault secret name specified |
| Schema specifics | JSON Schema path matches Schemas/ output; C# DTO namespace correct |
| TDD alignment | Function class name, trigger binding, output paths match TDD |
| Blueprint alignment | Component type consistent with chosen pattern |
| Dependency order | Bicep before Function deployment; schema before Function that binds to it |
| Constitution | No hardcoded connection strings, Managed Identity used, RFC 7807 error shape enforced |

Each task card is updated to `READY TO IMPLEMENT`, `NEEDS REWORK`, or `BLOCKED`.

---

#### `/implement` — Generate Code and Track Progress

Reads a validated task card, generates all code and IaC, produces a task-level implementation record, and updates the feature tracker. Refuses to run if `validation-status` is not `READY TO IMPLEMENT`.

```
/implement order-event-processor/01-bicep-infrastructure.md
/implement order-event-processor/02-service-bus-schema.md
/implement order-event-processor/03-order-created-function.md
```

On every run, `/implement`:
1. Sets `status: IN PROGRESS` on the task card at the start
2. Creates `tasks/{feature}/tracker.md` on first run (updated on every subsequent run)
3. Generates the code, IaC, or configuration artifact
4. Generates an implementation record at `output/{feature}/impl-docs/`
5. Sets `status: DONE` and `impl-doc-path` on the task card
6. Updates the tracker with DONE status, impl-doc link, and completion percentage

**What is generated per component type:**

| Component | Code / artifact | Tests | Implementation record |
|---|---|---|---|
| Azure Function | `{FunctionName}.cs`, `Program.cs` | `{FunctionName}Tests.cs` (xUnit) | Files created, build status, AC sign-off |
| Logic App | `workflow.json`, `parameters.json`, `workflow-description.md` | — | Files created, AC sign-off |
| Service Bus Schema | `{MessageName}.schema.json`, `{MessageName}Dto.cs` | — | Schema items listed, AC sign-off |
| APIM Policy | `policy.xml`, `openapi.yaml` | — | Files created, AC sign-off |
| Bicep IaC | `main.bicep`, `{resource}.bicep`, `main.{env}.bicepparam` | — | Files created, build status, AC sign-off |
| Configuration | — | — | Config steps completed, settings applied, manual steps, AC sign-off |

**Implementation tracker** and **implementation record** work the same as described in the D365 CE template — one tracker per feature updated after each task, one implementation record per task covering artifacts, deviations, manual steps, and AC sign-off.

---

#### `/document` — Generate Operational Documentation

Reads all artefacts for a completed feature and generates release and operational documents.

```
/document order-event-processor
```

Output (only documents applicable to the feature):
```
docs-generated/{feature}/api-contract.md        ← OpenAPI contract for consumers
docs-generated/{feature}/message-schema.md      ← Service Bus message envelope + payload spec
docs-generated/{feature}/runbook.md             ← DLQ monitoring, retry procedures, alerts
docs-generated/{feature}/deployment-guide.md    ← Bicep deployment sequence, environment promotion
docs-generated/{feature}/release-notes.md       ← What changed and why
```

---

#### `/alm` — Synchronise Work Items with Your ALM Tool

Manages the link between this project's work breakdown and an external ALM tool (Azure DevOps, Jira, etc.). Configure the tool, hierarchy, and field mapping in `constitution/10-alm-configuration.md` before running this command.

Three sub-commands:

**`extract`** — Build the full work-item payload so an external ALM Agent can create items with correct parent-child links and field values.

```
/alm extract order-event-processor
```

Reads `plans/{feature}/work-items.yaml`, assigns stable UIDs to any items that lack one, and writes a JSON payload containing all four hierarchy levels with mapped field names (e.g., `System.Title`, `Microsoft.VSTS.Common.AcceptanceCriteria`), priority integers, status strings, parent UIDs, and children UIDs.

Output: `output/{feature}/alm/extract-{YYYYMMDD-HHmmss}.json`

**`sync`** — Write the ALM-assigned IDs back into the project after the ALM Agent has created the work items.

Single item:
```
/alm sync order-event-processor order-event-processor-T-001 12345
```

Bulk file (sent by the ALM Agent):
```
/alm sync order-event-processor --file output/order-event-processor/alm/alm-response.json
```

Updates `work-items.yaml` with `alm-id` values. For Task-level items also updates `alm-id` in the matching task card front matter. The UID is the stable correlation key and never changes.

**`get`** — Retrieve the current full state of a specific work item by its ALM ID.

```
/alm get order-event-processor 12345
```

Returns the work item's current state including `validation-status` and `impl-doc-path` for Task-level items — so the ALM Agent can push the latest progress back into your tool.

Output: `output/{feature}/alm/get-{alm-id}-{YYYYMMDD}.json`

---

## 3. Structure and Outputs

### Folder structure

```
integration/
│
├── .claude/
│   ├── commands/               ← The 17 slash commands
│   └── settings.json           ← Write permissions scoped to output folders
│
├── constitution/               ← Non-negotiable Azure Integration rules every command follows
│   ├── 00-index.md
│   ├── 01-integration-patterns.md     ← Pattern selection, resource naming, environment tagging
│   ├── 02-azure-service-bus.md        ← Topic/queue topology, message envelope, DLQ, idempotency
│   ├── 03-azure-functions.md          ← Isolated worker, trigger rules, ILogger, Polly
│   ├── 04-logic-apps.md               ← Standard tier, workflow naming, Configure run after
│   ├── 05-api-management.md           ← OpenAPI 3.0, versioning, JWT, rate limiting, RFC 7807
│   ├── 06-error-handling.md           ← Retry policy, circuit breaker, DLQ, idempotency
│   ├── 07-security.md                 ← Managed Identity, Key Vault, Private Endpoints, RBAC
│   ├── 08-devops-alm.md               ← Bicep IaC, pipeline structure, environment promotion
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
│   ├── clarify/readiness-rubric.md    ← Azure Integration task readiness criteria
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
│   │   ├── Functions/                 ← C# Azure Function project
│   │   ├── LogicApps/                 ← workflow.json + parameters.json
│   │   ├── APIM/                      ← policy XML + OpenAPI spec
│   │   └── Schemas/                   ← JSON Schema files + C# DTO classes
│   ├── infrastructure/                ← Bicep modules + parameter files
│   └── tests/
│       ├── Unit/                      ← xUnit function tests
│       └── Integration/               ← Integration test project
│
└── docs-generated/{feature}/
    ├── functional-design-document.md  ← /fdd
    ├── test-plan-and-strategy.md      ← /testplan (reference tables + links)
    ├── test-cases/                    ← /testplan (full test case tables)
    │   ├── contract.md
    │   ├── integration.md
    │   ├── performance.md
    │   ├── security.md
    │   ├── chaos.md
    │   └── uat.md
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
    ├── api-contract.md                ← /document
    ├── message-schema.md              ← /document
    ├── runbook.md                     ← /document
    └── deployment-guide.md            ← /document
```

### Artifact map

| Artifact | Created by | Location |
|---|---|---|
| Functional Specification | `/spec` | `specs/{f}/spec.md` |
| Spec Review Report | `/review` | `specs/{f}/review.md` |
| Split Manifest | `/split-spec` | `specs/{f}/split-manifest.md` + domain-scoped specs (CE/PA/FO/DM/RPT as applicable) |
| Impact Analysis | `/impact` | `specs/{f}/impact-analysis.md` *(brownfield mode only)* |
| Functional Design Document | `/fdd` | `docs-generated/{f}/functional-design-document.md` |
| Test Plan and Strategy | `/testplan` | `docs-generated/{f}/test-plan-and-strategy.md` |
| Test Cases — Contract | `/testplan` | `docs-generated/{f}/test-cases/contract.md` |
| Test Cases — Integration | `/testplan` | `docs-generated/{f}/test-cases/integration.md` |
| Test Cases — Performance | `/testplan` | `docs-generated/{f}/test-cases/performance.md` |
| Test Cases — Security | `/testplan` | `docs-generated/{f}/test-cases/security.md` |
| Test Cases — Chaos | `/testplan` | `docs-generated/{f}/test-cases/chaos.md` |
| Test Cases — UAT | `/testplan` | `docs-generated/{f}/test-cases/uat.md` |
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
| Azure Function code + tests | `/implement` | `output/{f}/src/Functions/` + `output/{f}/tests/Unit/` |
| Logic App workflow | `/implement` | `output/{f}/src/LogicApps/` |
| APIM policy + OpenAPI | `/implement` | `output/{f}/src/APIM/` |
| Service Bus schema + DTO | `/implement` | `output/{f}/src/Schemas/` |
| Bicep IaC | `/implement` | `output/{f}/infrastructure/` |
| Implementation record (per task) | `/implement` | `output/{f}/impl-docs/T-NNN-{name}-impl.md` |
| Implementation tracker (per feature) | `/implement` | `tasks/{f}/tracker.md` |
| Operational docs | `/document` | `docs-generated/{f}/` |
| ALM work-item extract | `/alm extract` | `output/{f}/alm/extract-{timestamp}.json` |
| ALM work-item get | `/alm get` | `output/{f}/alm/get-{alm-id}-{date}.json` |

### Deploying the output

**Prerequisites:**
- Azure subscription and resource group provisioned per environment
- Managed Identity enabled on Function App and Logic App (created by Bicep)
- Key Vault populated with secrets named per `constitution/07-security.md`
- `az` CLI, `func` CLI, and .NET SDK installed

**Step 1 — Deploy infrastructure first (Bicep)**

Always deploy Bicep before application code. It provisions the Function App, Logic App, Service Bus namespace, APIM, and Key Vault.

```bash
az deployment group create \
  --resource-group rg-yourproject-dev \
  --template-file output/{feature}/infrastructure/main.bicep \
  --parameters output/{feature}/infrastructure/main.dev.bicepparam
```

**Step 2 — Deploy Azure Function**

```bash
cd output/{feature}/src/Functions
dotnet publish -c Release
func azure functionapp publish <your-function-app-name> --dotnet-isolated
```

**Step 3 — Deploy Logic App workflow**

```bash
az logicapp deployment source config-zip \
  --name <logic-app-name> \
  --resource-group rg-yourproject-dev \
  --src output/{feature}/src/LogicApps/workflow.zip
```

Or copy `workflow.json` and `parameters.json` directly to the Logic App Standard's `/site/wwwroot/{workflow-name}/` via Kudu or Azure portal.

**Step 4 — Deploy APIM policy**

```bash
az apim api policy create \
  --resource-group rg-yourproject-dev \
  --service-name <apim-name> \
  --api-id <api-id> \
  --policy-format xml \
  --value @output/{feature}/src/APIM/policy.xml
```

**Step 5 — Register Service Bus schema (if using Schema Registry)**

```bash
az servicebus namespace schema-registry create \
  --resource-group rg-yourproject-dev \
  --namespace-name <sb-namespace> \
  --name <schema-name> \
  --serialization-type Json \
  --schema-compatibility Forward
```

**Step 6 — Promote to higher environments**

Re-run Bicep with the target environment's parameter file, then re-deploy application code:

```bash
az deployment group create \
  --resource-group rg-yourproject-uat \
  --template-file output/{feature}/infrastructure/main.bicep \
  --parameters output/{feature}/infrastructure/main.uat.bicepparam
```

---

## Brownfield Mode

Use brownfield mode when adding new capabilities to an **integration layer that already exists** — Function Apps already deployed, Logic App workflows already running, Service Bus topics and schemas already in production. The agent reads the existing system's documentation before every step and makes decisions (extend vs replace, backwards-compatible schema changes, Managed Identity RBAC additions) based on what is already there.

### How to enable

**Step 1 — Generate brownfield documentation** using the `d365-ce-brownfield` agent (or equivalent brownfield documentation for your integration layer). It produces a `docs-generated/` folder containing the integration topology, Azure Function docs, Logic App docs, component inventory, and architecture docs.

**Step 2 — Enable brownfield mode** in `constitution/10-alm-configuration.md`:

```
[brownfield]
enabled:   true
docs-path: ../../d365-ce-brownfield/docs-generated
```

**Step 3 — Run the additional `/impact` command** after `/review` and before `/plan`:

```
/spec order-event-processor
/review order-event-processor
/impact order-event-processor           ← brownfield mode only
/plan order-event-processor
```

### The `/impact` command

Reads the approved spec against the brownfield component inventory and classifies every Azure resource and integration component the feature will touch:

| Classification | Meaning |
|---|---|
| `NEW` | Does not exist — create from scratch (new Function, new Logic App, new Service Bus topic) |
| `EXTEND` | Exists; new capability being added (new trigger binding, new message type, new API operation) |
| `REPLACE` | Exists; substantially rewritten |
| `REFERENCED` | Exists and consumed but its definition does not change |
| `CONFLICT` | Exists but the spec's intent contradicts current behaviour — resolution needed |

Output: `specs/{feature}/impact-analysis.md` (status: IMPACT-ASSESSED)

The impact analysis includes a **Schema Compatibility** section — for any modified message schema, it documents whether the change is backwards-compatible and what action existing consumers must take. `/plan` reads this file and stamps every task with `brownfield-action`.

### What changes in each command

| Command | Brownfield behaviour |
|---|---|
| `/spec` | Reads existing integration topology and inventory; adds §15 Brownfield Context |
| `/review` | Checks §15 is present and FRs describe the *delta* not just the end state |
| `/impact` | Full impact analysis — classifies Functions, Logic Apps, Service Bus resources, schemas, APIM |
| `/plan` | Requires impact-analysis.md; stamps `brownfield-action` on every task; adds §8 Brownfield Impact |
| `/task` | Reads existing component doc for EXTEND/REPLACE tasks; adds Existing System section |
| `/tdd` | Reads existing architecture as baseline; adds Brownfield Baseline callouts |
| `/blueprint` | Reads existing blueprint; adds §9 Brownfield Architecture Delta with schema versioning impact |
| `/implement` | Reads existing component doc before generating code; extension safety enforced (no breaking binding changes) |

---

## Configuration

Before first use, update the following files in `constitution/`:

| File | What to set |
|---|---|
| `01-integration-patterns.md` | Resource naming prefix (e.g., `proj-dev-`), Azure region, project tag value |
| `07-security.md` | Key Vault name, Managed Identity name pattern, Private Endpoint subnet names |
| `08-devops-alm.md` | Bicep pipeline structure, service connection name, environment names. ADO org URL and project are read from `../../alm-configuration.md` at the repo root. |
| `10-alm-configuration.md` | Domain-specific settings: `requirement-intake` (`unstructured` \| `structured`), `l3-intake` (`required` \| `optional`), and `[brownfield]` block if adding features to an existing integration layer. ADO connection, work item hierarchy, and field mapping are read from `../../alm-configuration.md` at the repo root (fallback: set them here if the root file does not exist). |
