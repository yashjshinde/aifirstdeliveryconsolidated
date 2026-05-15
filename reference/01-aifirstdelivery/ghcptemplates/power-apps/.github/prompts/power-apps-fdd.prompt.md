---
mode: agent
description: "Generate a Functional Design Document for a Power Platform feature from an approved functional specification. Triggers on: 'fdd', 'functional design', 'functional design document'."
---

Generate a Functional Design Document (FDD) for a Power Platform feature from an approved functional specification.

## Pre-condition Check

1. Read `specs/{feature-name}/review.md`. If status is not `APPROVED`, stop: "Run /power-apps-review first and resolve all BLOCKERs before generating the FDD."

## Steps

2. Read all files in `constitution/`.
3. Read `specs/{feature-name}/spec.md` in full.
4. Generate the FDD using the template at `doc-templates/fdd-template.md`. Every section in the template is mandatory — populate all of them. Do not remove or skip any section.
5. Write to `docs-generated/{feature-name}/functional-design-document.md`.
6. Print the completion report:

```
FDD COMPLETE
════════════
Feature      : {feature-name}
Artefacts    : {N} objects in Artefact Inventory (§5)
Modules      : {N} modules documented (§6)
FRs          : {N} functional requirements across all modules
Screens/Forms: {N} screen / form designs in §9
Flows        : {N} automation flows in §11
Env Vars     : {N} environment variables in §8
Test Cases   : {N} test cases in §20
Gaps         : {N} FDD Gaps logged in §21
Output       : docs-generated/{feature-name}/functional-design-document.md

Next step: /fdd-review {feature-name}
```

## Operating Principles

- Do NOT invent requirements or modify scope — only transform the spec into structured FDD format.
- Maintain strict traceability: Module → FR → Object-ID → Acceptance Criteria → Test Case.
- Use business language throughout — no Power Fx formulas, no connector action names, no environment resource names.
- Every section must reference back to FR-NNN where applicable.
- Flag any functional gap discovered during elaboration as an **FDD Gap** in §21.
- Ensure clarity for makers, developers, testers, and business stakeholders.

## Content Guidance per Section

**§1 Document Control:** Version 1.0, Initial Draft. §1.2 Approvals: Business Owner, IT Lead, Solution Architect, Project Manager, Quality Assurance — all Pending. §1.3 Distribution List: populate from spec stakeholders using `Name | Role | Organisation | Copy Type`. §1.4 Related Documents: link the spec, constitution, any architecture decisions, and dependent integration FDDs.

**§2 Introduction:** §2.1 Purpose covers which Power Platform components (Canvas App, MDA, Flows, Copilot Studio) are in scope. §2.2 Scope lists each module by number with a one-line description and references the spec version and FR range. §2.3 Definitions includes Power Platform-specific terms: delegation, connection reference, DLP, EV (Environment Variable), CR (Connection Reference), ALM.

**§3 System Overview:**
- §3.1 High-Level Overview — what the solution does, which components are involved, data sources, business problem solved. No formula or connector detail.
- §3.2 Personas — `Persona | Role Description | Primary Modules | Licence Tier`. Include system actors (automated flows). Licence Tier must be Standard or Premium — identify Premium drivers (Dataverse / custom connector).
- §3.3 Key Design Decisions — every significant platform choice: `Decision | Option A | Option B | Selected | Rationale`. Cover app type (Canvas vs MDA), data source (Dataverse vs SharePoint), delegation strategy for large tables, notification delivery method. Capture why alternatives were not chosen.
- §3.4 System Configuration & Prerequisites — four structured subsections: System Configuration table (`Configuration Area | Setting | Required Value | Notes`), Dataverse Tables & Columns (`Entity | Schema Name | Prerequisite | Owner | Notes`), Connection References & DLP (`Connection Reference | Connector | DLP Tier | Exception Required | Owner`), User & Licence Readiness (`Item | Description`), FDD/FR Dependencies (`Dependency | FDD/FR Reference | Required Before`).

**§4 Business Process:**
- §4.2 Process Flow — use the structured Step Table (`Step | Description | Actor | App/Screen | Happy Path Outcome | Exception/Error Path`) with minimum 5 steps. Add a Decision Points table (`Decision Point | Condition | Path A | Path B`) for any conditional routing or approval logic. Textual narrative is optional for complex branching not captured in the table.

**★ §5 Object & Artefact Inventory:** This section is mandatory — do not leave it empty or with placeholder-only rows. List every Power Platform component to be created or modified. Use Object-ID prefixes from the constitution. Columns: `Object-ID | Object Name | Category | Object Type | App/Scope | Complexity | FR Reference | Notes`. Object types include: Canvas App, Model-Driven App, Custom Table, Custom Column, Cloud Flow (Automated/Scheduled/Instant), Copilot Studio Agent, Copilot Topic, Environment Variable, Connection Reference, Custom Connector. Complexity: Simple < 1 day, Medium 1–3 days, Complex > 3 days.

**§6 Functional Design:** One 6.X block per module. Mandatory 6-subsection structure:
- 6.X.1 Module Overview — scope, components (Canvas/MDA/Flow/Copilot), personas, Object-IDs involved, dependencies on other modules
- 6.X.2 FRs — every FR with Delivery Mechanism (Canvas App Screen / MDA Form / Cloud Flow / Copilot Topic / Dataverse Business Rule / Custom Table), Inputs, Outputs, Business Rules (note delegation risk if FR involves large-table filtering or sorting), Dependencies
- 6.X.3 Functional Logic — narrative of how FRs work together; no Power Fx
- 6.X.4 Validation & Error Handling — table: `Validation ID | Trigger | Condition | Action | Error/Warning Message (exact text) | Delegation Risk`. Flag delegation risk Yes/No with mitigation if Yes. "Accept the limit" is not a valid mitigation.
- 6.X.5 Acceptance Criteria — Given/When/Then, minimum one per FR, at least one validation failure AC and one flow error AC per module
- 6.X.6 Traceability — FR Reference → Requirement Title → BR# → AC Ref

**§7 Data Considerations:**
- §7.1 Key Entities — `Entity (Display Name) | Schema Name | Description | Source | Direction`
- §7.2 Data Flow Summary — bullet list of data flows: source → mechanism → target
- §7.3 Data Dependencies — prerequisites between entities and connection references
- §7.4 Calculated & Rollup Fields — `Field | Schema Name | Entity | Type | Formula/Source Fields | Recalculation Trigger`. State "N/A" if none.

**§8 Environment Variables:** All configurable values, endpoints, feature flags, and thresholds must use Environment Variables — never hardcode. Columns: `Object-ID | Schema Name | Display Name | Type | Default Value | Used By (FR/Flow/App) | Notes`. Secret type must reference Key Vault — never store raw value.

**§9 Screen / Form Designs:** One sub-section per Canvas App screen or MDA form. For Canvas screens: Field Mapping table (`Schema Name | Display Name | Data Type | Length | Required | Default Value | Input Control | Visibility Rule`), Actions/Buttons table (`Button Label | Object-ID (Flow) | Available To | Condition | What Happens`), Navigation table, Delegation Notes (mandatory if screen filters/sorts > 500 records). For MDA forms: Field Mapping, Tab/Section Layout. State "N/A" if no screens or forms in scope.

**§10 User Journey Maps:** One journey per persona covering the end-to-end experience. Step table: `Step | User Action | App/Flow Response | Screen/Component | Notes/Edge Cases`. Include success outcome, failure/edge case, and FR references. State "N/A" if no user journey is applicable.

**§11 Automation Flows:** One block per flow. Mandatory fields: Object-ID, Type (Automated/Scheduled/Instant), Trigger (business language), Async/Sync, Expected Volume/Frequency, FR Reference. Trigger Configuration table for column filters, OData conditions, recurrence, and run-as identity. Process Steps (numbered). Error Handling/DLQ table: `Scenario | Retry | DLQ/Fallback | User Notification`. What the user sees/receives. Connection References only — no personal connections. State "N/A" if no flows.

**§12 Email / Notification Templates:** One block per email or Teams notification. Properties table: Trigger/Scenario, From, To, Subject, FR Reference. Body Summary with dynamic tokens table `Dynamic Token | Source Table | Source Field Schema Name | Fallback if Null`. For Teams Adaptive Cards: Channel/Target, Trigger, Recipient, Key Content. State "N/A" if no email or notification templates.

**§13 Copilot Topics:** Include only if the spec contains Copilot Studio requirements. One block per topic: Object-ID, parent Agent, Intent, Authentication Required, FR Reference, minimum 5 sample utterances, Knowledge Sources table, Conversation Flow table (Turn | Speaker | Message | Variables Set), Actions/Flows Triggered table, Escalation table, Fallback Topic. State "N/A" if no Copilot topics.

**§14 Business Rules:** Structured table: `Rule ID | Applies To | Object-ID | Condition | Action | Enforcement | User Message`. Enforcement: Client (Canvas App formula), Server (Dataverse Business Rule / Flow), or Both. Include exact user message text.

**§15 Security and Access Design:**
- §15.1 App Access Matrix — Canvas App / MDA / Copilot / Power Automate access per persona
- §15.2 Record-Level Access — Dataverse security role privileges per entity per persona (Create/Read/Write/Delete/Append/AppendTo). Required for every Dataverse table used by MDA or Flow.
- §15.3 Field-Level Security — PII, financial, or credential columns: `Field | Schema Name | Entity | Readable By | Editable By | Business Justification`. State "N/A" if none.
- §15.4 Canvas App Sharing Model — `App Name | Object-ID | Sharing Method | Group/Role | Co-owner Required | Notes`. State "N/A" if none.
- §15.5 Licence Requirements — `Persona | Count | Required Licence | Driver | Notes`. Identify Premium drivers explicitly.
- §15.6 Data Visibility Constraints — records users can and cannot see; gallery filter rules
- §15.7 DLP and Connection References — Connection References table (`Object-ID | Schema Name | Connector | Connector Tier | Auth Method | DLP Exception Required | Owner Per Environment`). DLP Impact table (`Connector | Current DLP Tier | Required Tier | Exception Request Needed | Risk if Blocked`).
- §15.8 Audit Logging Requirements — Dataverse entities with PII/financial/compliance data: `Entity | Schema Name | Columns Audited | Retention Period | Business Justification`. State "N/A" if none.

**§16 Non-Functional Requirements:** Use the pre-filled performance baselines from the template (Canvas screen < 3s, MDA form < 2s, sync flow < 5s). Add feature-specific targets for async flow execution, gallery delegation limits, and integration message loss. Use "TBC in refinement" where not yet defined. Do not remove pre-filled rows.

**§17 Assumptions & Constraints:** §17.1 Assumptions as structured table: `ID | Assumption | Owner | Impact if Wrong`. §17.2 Constraints as structured table: `ID | Constraint | Source | Affected FR(s)`. Source options: Constitution / Platform / Legal / Business.

**§18 Out of Scope:** Table with Module, Out of Scope Item, and Rationale columns. Draw from spec; flag new items as FDD Gaps in §21.

**§19 Risks & Dependencies:** §19.1 Key Risks: `Risk ID | Description | Probability | Impact | Owner | Mitigation`. Always include delegation risk and DLP policy risk rows. §19.2 External Dependencies: `Dependency | Owner | Required By (FR-NNN) | Risk Level`.

**§20 Functional Testing:** Minimum one positive and one negative test case per business rule. TC table: `TC # | Test Case Title | Type | Precondition | Steps | Expected Result | FR Reference | AC Reference`. Include at least one delegation boundary test for any screen that filters large tables. State test data requirements and test environment.

**§21 Functional Gap Log:** `Gap ID | Description | Impact | Priority | Owner | Target Resolution | Status`. Every gap discovered during FDD elaboration must appear here. Gaps must be resolved before the FDD is approved. State "none" only if genuinely gap-free.

**§22 Additional Specifications:** Supplementary requirements not covered elsewhere — localisation, accessibility (WCAG 2.1 AA for Canvas Apps), offline/mobile-offline configuration, Teams embedding, Power BI embedded reports, custom connector throttling. State "N/A" if none apply.

**Appendix A — Full Traceability Matrix:** `FR Reference | Requirement Title | Module | Object-ID(s) | BR # | AC Reference | TC Reference`. Every FR-NNN from the spec must appear at least once.

## Rules

- FDD uses business language — no Power Fx formulas, no connector action names, no environment resource names.
- Every FR from the spec must appear in §6.
- Every business requirement must appear in Appendix A.
- §5 Object & Artefact Inventory must be completed before §6 — it drives the scope of what is designed.
- Delegation risks must have a documented mitigation — "accept the limit" is never valid.
- Licence Tier must be specified for every persona — identify Premium drivers.
- Flag any functional gap as an FDD Gap in §21 — do not silently omit ambiguous requirements.
