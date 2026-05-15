# /tdd — Generate Technical Overview Document

Produce a Technical Overview Document from the project inventory and component documentation.
Describes how the system is built — for developers, architects, and support engineers.

## Usage

```
/tdd
```

## Pre-condition Check

1. Read `docs-generated/component-inventory.md`.
   If it does not exist, stop: "Run `/scan` first."
2. Read all available docs from `docs-generated/technical/`.
3. Read all files in `input/documents/` — existing technical docs take priority for design intent.

## Steps

4. Read all files in `constitution/`.
5. Generate the Technical Overview Document using `doc-templates/technical-overview-template.md`.
6. Write to `docs-generated/technical/technical-overview.md`.
7. Print completion report.

## What the Document Must Cover

### §1 Document Control
Project name, solution packages included (with versions), publisher prefix, date generated.
Status: DRAFT.

### §2 Solution Architecture Overview
- Solution packages: list all packages in `input/solutions/`, their versions, and primary component types
- Deployment dependency order inferred from cross-package entity/plugin references
- Technology stack: extension points used (Plugin, JS, PCF, Flow, Classic WF, Custom API, Azure Function, Logic App)
- Architecture diagram — generate a Mermaid `graph TD` with four layer subgraphs (UI / Logic / Data / Integration). Apply `classDef warning` to deprecated components (classic workflows). See constitution/03-documentation-standards.md for colour conventions.

### §3 Data Architecture
- All custom entities with schema name, ownership, source package
- Key relationships with cascade behaviours
- Alternate keys and their purpose
- Environment variables with names and types

### §4 Plugin Architecture
- All assemblies across all solution packages with isolation mode
- Registered steps table: Assembly | Class | Entity | Message | Stage | Mode | Rank | Filtering Attributes | Source Package
- Patterns: depth checking, pre/post image usage, external calls
- Cross-reference result: matched vs source-only vs registration-only
- **Plugin execution order per entity/message/stage** — for every entity+message+stage combination that has 2 or more plugin steps, produce a ranked execution table:

```
#### Execution Order: pub_clinic — Update — PreOperation
| Rank | Plugin Class | Filtering Attributes | Mode | Purpose Summary |
|---|---|---|---|---|
| 1 | AICPACESPlugin.ClinicValidation | aic_status, aic_hsgstatus | Sync | Validates status transition rules |
| 2 | AICPACESPlugin.ClinicAudit | (all fields) | Sync | Writes audit log record |
```

This table is the authoritative sequence a developer must understand before adding a new plugin step or modifying an existing one on a given entity/message/stage. Flag any two steps with the same rank as `⚠ EXECUTION ORDER AMBIGUOUS — rank collision`.

### §5 JavaScript Architecture
- All JS web resource groups with namespace conventions
- Event registration patterns (legacy vs modern Xrm API)
- WebApi usage patterns
- Cross-reference result: matched vs source-only vs registration-only
- Deprecated API usage inventory

### §6 PCF Control Architecture
Each control: type, manifest properties summary, external dependencies, browser/mobile notes.

### §7 Power Automate Architecture
- Connection references across all solution packages
- Premium connectors used
- Child flow dependencies
- Error handling patterns

### §8 Integration Architecture
- Integration topology — generate a Mermaid `graph LR` diagram. D365 CE in centre; external systems as nodes with arrows labelled by direction, technology, and auth. Apply `:::critical` to any hardcoded credentials or missing auth.
- Azure Function and Logic App authentication patterns
- Hard-coded credentials flagged as `⚠ SECURITY RISK`

### §9 Security Architecture (Technical)
- Role privilege matrix for all custom entities (aggregated across all packages)
- Field security profiles
- Application user roles identified

### §10 Solution Package Deployment Design
- All packages listed in recommended deployment order
- Inter-package dependencies (e.g. Plugins package depends on Entities package)
- Managed vs unmanaged evidence per package

### §11 Technical Debt and Upgrade Risks
All flagged items consolidated:
| Component | Package | Risk Type | Description | Recommendation |

---

### §12 Developer Event Trace

> **Purpose:** This section is for developers handling change requests. It answers "what technical components fire when X happens?" for each major business process. It connects components that are documented individually in other sections into a complete end-to-end sequence.

#### How to build this section

1. Read `docs-generated/functional/flows.md`, `docs-generated/technical/plugins/`, `docs-generated/functional/forms-and-views.md`, `docs-generated/functional/entity-catalogue.md`.
2. Identify the major business processes from flow/plugin names, entity relationships, and document names in `input/documents/`. Typical processes in a D365 CE health/social care system: Clinic Onboarding, Clinic Enrolment, Change Request, Suspension, Withdrawal, Case Creation, Case Assignment, Client Referral, Partner Onboarding.
3. For each process, trace every technical component that fires from the triggering user action through to all downstream side effects.

#### Developer Event Trace format (one subsection per process)

```
### Process: {Business Process Name}
**Trigger:** {User action — e.g. "User clicks Submit on the HSG Enrolment form" or "Scheduled flow fires at 8AM daily"}
**Primary entity:** {schema name}

#### Technical Component Sequence

| # | Layer | Component | Fires When | What It Does |
|---|---|---|---|---|
| 1 | JS | pub_hsgclinic_form.js → onLoad() | Form opens | Sets aic_submitdate visibility; populates PCN name from lookup |
| 2 | JS | pub_hsgclinic_form.js → onStatusChange() | aic_status OnChange | Makes aic_reason required if status = Withdrawn; calls aic_ValidationRuleCheck |
| 3 | Plugin | AICPACESPlugin.HSGClinicValidation | PreValidation · pub_hsgclinic · Update | Throws if required fields missing; validates NRIC checksum |
| 4 | Plugin | AICPACESPlugin.HSGClinicEnrolment | PreOperation · pub_hsgclinic · Update | Sets aic_enrolmentdate; creates pub_hsgenrolment record |
| 5 | DB | Dataverse commit | — | Record saved to database |
| 6 | Plugin | AICPACESPlugin.HSGAuditLog | PostOperation (sync) · pub_hsgclinic · Update | Writes audit trail to pub_auditlog |
| 7 | Flow | Notify ICM on HSG Enrolment | pub_hsgclinic Created · status = Enrolled | Sends email to ICM inbox; posts Teams notification |
| 8 | Flow | Update Partner Record on Enrolment | pub_hsgclinic Created · status = Enrolled | Updates linked account.aic_hsgstatus to Active |
```

Include a Mermaid sequence diagram for each process showing system actors and the component sequence:

````mermaid
sequenceDiagram
  actor User
  participant Form as Form (JS)
  participant CRM as D365 Platform
  participant Plugin as Plugin Layer
  participant Flow as Power Automate
  participant Email as Exchange

  User->>Form: Clicks Submit (aic_status → Enrolled)
  Form->>CRM: OnSave → aic_ValidationRuleCheck (custom action)
  CRM->>Plugin: PreValidation — HSGClinicValidation
  Plugin-->>CRM: Pass / Throw error
  CRM->>Plugin: PreOperation — HSGClinicEnrolment
  Plugin->>CRM: Create pub_hsgenrolment record
  CRM->>CRM: DB Commit
  CRM->>Plugin: PostOperation — HSGAuditLog
  CRM->>Flow: Trigger: Notify ICM on HSG Enrolment
  Flow->>Email: Send email to ICM
````

#### Coverage requirement

Produce a Developer Event Trace for **every** major business process. A process is "major" if:
- It has a named Power Automate flow as its primary trigger, OR
- It has 2 or more plugin steps on the same entity/message, OR
- It has a dedicated form with registered JS OnSave handler

If a business process cannot be fully traced (e.g. some steps are in binary-only plugins), document what is known and flag: `⚠ PARTIAL TRACE — binary plugin step N cannot be introspected`.

#### Code comment extraction

While reading plugin and JS source files for the trace, extract all developer-left notes:
- `// TODO:` — planned work not yet done
- `// HACK:` / `// WORKAROUND:` — known fragile implementation
- `// NOTE:` / `// IMPORTANT:` — context that surprised the original developer
- `// TEMP:` / `// REMOVE:` — code that should have been removed

Collect these in a subsection:

```
### §12.N Code Comments Requiring Attention
| File | Line Approx | Comment | Risk |
|---|---|---|---|
| AICPACESPlugin.ClinicEnrolment.cs | Execute() | // HACK: Status must be reset before ICM call or ICM returns 409 | Integration risk |
| pub_hsgclinic_form.js | onStatusChange | // TODO: Replace with server-side validation — currently duplicates plugin | Tech debt |
```

---

## Operating Principles

- Reference specific file names, class names, and schema names — this document is for developers.
- Track which solution package each component came from.
- Flag all deprecated API usage, unsupported patterns, security concerns.

## Completion Report

```
TDD COMPLETE
════════════
Project        : {project-name}
Packages       : {N} solution packages documented
Assemblies     : {N} ({N} steps)  |  Web Resources: {N}  |  PCF: {N}
Flows          : {N}  |  Azure Functions: {N}  |  Logic Apps: {N}
Tech Debt      : {N} items  |  Security Risks: {N} items
Event Traces   : {N} business processes traced end-to-end
Code Comments  : {N} TODO/HACK/WORKAROUND items surfaced
Output         : docs-generated/technical/technical-overview.md

Next step: /blueprint
```
