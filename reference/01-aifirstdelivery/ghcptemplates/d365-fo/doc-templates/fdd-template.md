# Functional Design Specification — D365 F&O

All sections marked ★ are **mandatory** and must be fully populated. These sections are required for TDD generation and plan creation. Do not leave any ★ section empty or with placeholder-only content.

---

## Document Header

| Field | Value |
|---|---|
| Project Name | `<ProjectName>` |
| Document Number | `<DocNo>` |
| Version | v0.1 |
| Status | DRAFT |
| Author | `<Author>` |
| Functional Lead | `<TBD>` |
| Solution Architect | `<TBD>` |
| Module(s) | `<Module codes>` |
| Requirement / URS Reference | `<URS-ID>` |

### Version History

| Version | Change Request Number | Initiator(s) | Date | Change Description |
|---|---|---|---|---|
| 0.1 | `<CR-ID or N/A>` | `<Author>` | `<YYYY-MM-DD>` | Initial draft |

### Sign-off

| Role | Name and Title | Signature | Date |
|---|---|---|---|
| Author | `<TBD>` | | |
| Review and Approval — Technical Lead / Project Lead | `<TBD>` | | |
| Validation Responsible | `<TBD>` | | |
| `<Additional approvals if any>` | `<TBD>` | | |

---

## Table of Contents

- [Document Header](#document-header)
- [1. Objective](#1-objective)
- [2. Scope](#2-scope)
- [3. System Overview](#3-system-overview)
  - [3.1 Pre-requisitions](#31-pre-requisitions)
  - [3.2 System Flow and Architecture](#32-system-flow-and-architecture)
  - [3.3 System Configuration Information](#33-system-configuration-information)
  - [3.4 Key Design Decisions](#34-key-design-decisions)
- [4. Actors and Personas](#4-actors-and-personas)
- [★ 5. Object Inventory](#-5-object-inventory)
- [★ 6. Process Details / Functional Design Specifications](#-6-process-details--functional-design-specifications)
  - [6.1 Overview of Proposed Solution](#61-overview-of-proposed-solution)
  - [★ 6.2 Design](#-62-design)
    - [★ 6.2.1 Forms](#-621-forms)
    - [6.2.2 Reports — SSRS / ER / Power BI](#622-reports--ssrs--er--power-bi)
    - [6.2.3 Integrations](#623-integrations)
    - [6.2.4 Batch Jobs](#624-batch-jobs)
    - [6.2.5 Workflows](#625-workflows)
    - [6.2.6 Data Entities](#626-data-entities)
  - [6.3 Email Templates](#63-email-templates)
  - [★ 6.4 Security Roles](#-64-security-roles)
  - [6.5 Assumptions and Dependencies](#65-assumptions-and-dependencies)
  - [6.6 Functional Testing](#66-functional-testing)
- [7. Non-Functional Requirements](#7-non-functional-requirements)
- [8. Risks and Dependencies](#8-risks-and-dependencies)
- [9. Reference Documents](#9-reference-documents)
- [10. Glossary](#10-glossary)
- [11. Additional Specifications](#11-additional-specifications)
- [Appendix A — Full Traceability Matrix](#appendix-a--full-traceability-matrix)

---

## 1. Objective

Describe the business problem or gap being addressed. Reference the URS/RSD.

**Business Objective:** What the solution must achieve from a business perspective. Measurable outcomes where possible.

---

## 2. Scope

### Requirement Coverage

| Work Stream | ADO ID / URS ID | L3/L4 Process Name | Requirement Title | Requirement Description |
|---|---|---|---|---|
| `<WorkStream>` | `<ADO-ID / URS-ID>` | `<Process Group NNN: Process Name>` | `<Requirement Title>` | `<Brief description>` |

### In Scope
- `<Modules, processes, legal entities, user types>`

### Out of Scope
- `<Explicitly excluded items with rationale>`

### Assumptions
- `<List each assumption clearly>`

---

## 3. System Overview

### 3.1 Pre-requisitions

List everything that must be in place before this requirement can be implemented or tested:

- **System configuration:** `<Parameters, setup tables, feature flags that must be enabled>`
- **Master data:** `<Records, reference data that must exist>`
- **User and role readiness:** `<Roles, access, and identified users>`
- **Dependencies on other requirements or FDDs:** `<FDD cross-references>`

### 3.2 System Flow and Architecture

Describe the As-Is and To-Be process flows. Reference the process steps in §6.2.

**As-Is process:**
`<What happens today — what tools are used, what the pain points are>`

**To-Be process:**
`<What happens after this requirement is implemented>`

| Step | Description | Actor | D365 Screen / Form | Happy Path Outcome | Exception / Error Path |
|---|---|---|---|---|---|
| 1 | `<Step>` | `<Actor>` | `<Form/Screen>` | `<Outcome>` | `<Error path>` |

**Decision Points:**

| Decision Point | Condition | Path A | Path B |
|---|---|---|---|
| `<Decision>` | `<Condition>` | `<Path A>` | `<Path B>` |

### 3.3 System Configuration Information

List all D365 F&O parameter or setup configuration required before implementation or testing:

| Configuration Area | Navigation Path | Setting / Parameter | Value / Description |
|---|---|---|---|
| `<Area>` | `<Module > Setup > ...>` | `<Parameter name>` | `<Required value or description>` |

### 3.4 Key Design Decisions

| Decision | Option A | Option B | Selected | Rationale |
|---|---|---|---|---|
| `<Decision>` | `<Option A>` | `<Option B>` | `<Selected>` | `<Rationale>` |

---

## 4. Actors and Personas

| Persona | D365 F&O Role | Legal Entity | Key Interaction |
|---|---|---|---|
| `<Persona>` | `<D365 FO role>` | `<ECM / Commercial / Manufacturing>` | `<What they do in this process>` |

---

## ★ 5. Object Inventory

**This section is mandatory for TDD generation. Every D365 F&O object to be created or modified must be listed.**

| Object-ID (provisional) | Object Name | Category | Object Type | Module | Legal Entity | Complexity Estimate | Notes |
|---|---|---|---|---|---|---|---|
| EXT-001 | `<FormName>.Extension` | Extensions | Form Extension | `<Module>` | All | Simple | |
| EXT-002 | `AVA_<Name>` | New Development | New Class | `<Module>` | ECM | Medium | |

Use Object-ID prefixes from the constitution. Mark as "provisional" — final IDs assigned in the plan.

---

## ★ 6. Process Details / Functional Design Specifications

### 6.1 Overview of Proposed Solution

Describe at a high level the proposed solution — what is being built, which objects are involved, and how they interact to satisfy the requirement.

`<Overview paragraph>`

---

### ★ 6.2 Design

---

#### ★ 6.2.1 Forms

*Repeat the subsection below for each form or form extension in scope. If a section is not applicable (N/A), state "N/A" — do not omit the heading.*

---

##### Form: {FormName} ({New Form | Form Extension})

**Navigation path:** `<Module > Menu item > Form>`

---

###### Business Logic

Describe the business logic enforced by or through this form. Explain what the form controls, what validations are triggered, and what system actions result from user interactions.

`<Business logic description>`

---

###### GUI Form

List all navigation paths where this form is accessed. Include screenshots or wireframe references if available.

| Context | Navigation Path |
|---|---|
| `<Company / Context>` | `<Module > Sub-menu > Form>` |

---

###### Field Mapping

| Field Name | Label | Table | Data Type | Length | Mandatory | Default Value | Description |
|---|---|---|---|---|---|---|---|
| `<FieldName>` | `<Caption shown on form>` | `<D365Table>` | `<String / Enum / Date / Int / Real>` | `<N or N/A>` | Yes / No / Conditional | `<default or blank>` | `<Business purpose, editable conditions, cross-company behaviour>` |

---

###### Validation

| Validation ID | Trigger | Condition | Action | Error / Warning Message | Severity | D365 Implementation |
|---|---|---|---|---|---|---|
| VAL-001 | `<On save / On approve / On button click>` | `<Condition>` | `<Block / Warn / Allow>` | `"<Exact message text>"` | Error / Warning | `<Form / Table / Class method>` |

---

###### Functional Flow

Describe the step-by-step functional flow for this form. Reference the system flow diagram in §3.2 where applicable.

`<Functional flow description or numbered steps>`

---

###### Error Handling

| Error Scenario | Error Message | Notification Mechanism |
|---|---|---|
| `<Scenario description>` | `"<Exact message text>"` | Pop-up / Infolog / Email / None |

---

*(Repeat Form subsection for each additional form)*

---

#### 6.2.2 Reports — SSRS / ER / Power BI

*Repeat the subsection below for each report in scope. State "N/A" if no reports are in scope.*

---

##### Report: {ReportName} ({SSRS | ER | Power BI})

###### Report Layout

| Property | Value |
|---|---|
| Page Margin | `<N/A or value>` |
| Page Size | `<A4 / Letter / N/A>` |
| Orientation | `<Portrait / Landscape / N/A>` |
| File Type | `<PDF / Excel / N/A>` |
| Report Font | `<Font name / N/A>` |
| Page Number | `<Yes / No>` |
| Date / Time | `<Yes / No>` |

###### Field Mapping

| Field No. | Field Name | Report Column Name | Table | Data Type | Length | Mandatory | Default Value | Business Logic |
|---|---|---|---|---|---|---|---|---|
| 1 | `<FieldName>` | `<Column caption>` | `<Table>` | `<Type>` | `<N>` | Yes/No | `<value>` | `<Logic>` |

###### Report Parameters

| Parameter Name | Data Type | Mandatory | Default | Description |
|---|---|---|---|---|
| `<ParameterName>` | `<Type>` | Yes/No | `<default>` | `<Purpose>` |

###### Validation

`<Validation rules for report data or parameters>`

###### Functional Flow

`<How the report is triggered, generated, and distributed>`

###### Error Handling

| Error Scenario | Error Message | Notification Mechanism |
|---|---|---|
| `<Scenario>` | `"<Message>"` | Pop-up / Infolog / N/A |

---

*(Repeat Report subsection for each additional report)*

---

#### 6.2.3 Integrations

*Repeat the subsection below for each integration in scope. State "N/A" if no integrations are in scope.*

---

##### Integration: {IntegrationName}

###### Business Logic

`<What data is exchanged, direction, trigger, and governance rules>`

###### Field Mapping

| Source Field | Source System | Target Field | Target System | Data Type | Transformation |
|---|---|---|---|---|---|
| `<Field>` | `<System>` | `<Field>` | `<System>` | `<Type>` | `<Mapping rule or N/A>` |

###### Parameters

| Parameter | Value / Description |
|---|---|
| Direction | Inbound / Outbound / Bidirectional |
| Trigger | `<Schedule / Event / Manual>` |
| Frequency | `<Real-time / Batch / On-demand>` |
| Error handling | `<DLQ / Retry / Alert>` |

###### Validation

`<Validation applied to integration data>`

###### Functional Flow

`<End-to-end data flow description>`

###### Error Handling

| Error Scenario | Error Message | Notification Mechanism |
|---|---|---|
| `<Scenario>` | `"<Message>"` | Infolog / Alert / Email / N/A |

---

*(Repeat Integration subsection for each additional integration)*

---

#### 6.2.4 Batch Jobs

*Repeat the subsection below for each batch job in scope. State "N/A" if no batch jobs are in scope.*

---

##### Batch Job: {BatchJobName}

###### Business Logic

`<What the batch job does, when it runs, and what records it processes>`

###### Parameters

| Parameter | Data Type | Mandatory | Default | Description |
|---|---|---|---|---|
| `<ParameterName>` | `<Type>` | Yes/No | `<default>` | `<Purpose>` |

###### Functional Flow

`<Step-by-step description of batch job execution>`

###### Error Handling

| Error Scenario | Error Message | Notification Mechanism |
|---|---|---|
| `<Scenario>` | `"<Message>"` | Infolog / Batch log / Alert |

---

*(Repeat Batch Job subsection for each additional batch job)*

---

#### 6.2.5 Workflows

*Repeat the subsection below for each workflow in scope. State "N/A" if no workflows are in scope.*

---

##### Workflow: {WorkflowName}

###### Business Logic

`<What the workflow governs, who approves, and what triggers it>`

###### Workflow Parameter GUI

`<Configuration path and parameter description>`

###### Validation — Approve / Cancelled / Rejected Actions

| Action | Condition | System Behaviour |
|---|---|---|
| Approve | `<Condition>` | `<What happens on approval>` |
| Reject | `<Condition>` | `<What happens on rejection>` |
| Cancel | `<Condition>` | `<What happens on cancel>` |

###### Functional Flow

`<End-to-end workflow routing description>`

###### Error Handling

| Error Scenario | Error Message | Notification Mechanism |
|---|---|---|
| `<Scenario>` | `"<Message>"` | Pop-up / Email / Infolog |

---

*(Repeat Workflow subsection for each additional workflow)*

---

#### 6.2.6 Data Entities

*List every standard or custom data entity that is extended or used for data migration / integration in this requirement. State "N/A" if not applicable.*

###### Business Logic

`<Why these entities are extended and how they are used (DMF, OData, integration)>`

###### Entity Extensions

| No. | Data Entity Name | Field Name | Data Type | Mandatory | Remarks |
|---|---|---|---|---|---|
| 1 | `<Entity name>` | `<Field name>` | `<Type>` | Yes/No | `<e.g., optional field added for CCR reference>` |

###### Validation

`<Any validation applied during entity import/export>`

---

### 6.3 Email Templates

*Repeat for each automated email in scope. State "N/A" if not applicable.*

| Property | Value |
|---|---|
| Scenario | `<When this email is triggered>` |
| Trigger | `<Event or action>` |
| From | `<System account or role>` |
| To | `<Recipient role or address>` |
| Subject | `<Subject line template>` |
| Content | `<Body content description>` |

---

### ★ 6.4 Security Roles

**This section is mandatory. All security changes must be specified here.**

| Forms / Jobs | D365 FO Standard User Role | Access Type | Description |
|---|---|---|---|
| `<Form name — navigation path>` | `<RoleName>` | Edit / Read-only / No access | `<What users in this role can do>` |

**SoD (Segregation of Duties) risks:** `<Identify any SoD conflicts created or mitigated>`

---

### 6.5 Assumptions and Dependencies

| ID | Type | Description |
|---|---|---|
| A-001 | Assumption | `<Assumption statement>` |
| D-001 | Dependency | `<Dependency on another FDD, configuration, or external system>` |

---

### 6.6 Functional Testing

Minimum: one positive and one negative test case per business rule. Full test plan generated separately by `/testplan`.

| No. | Test Case | Expected Result |
|---|---|---|
| 1 | `<Scenario — e.g., Verify {condition}>` | `<Expected outcome>` |
| 2 | `<Negative scenario — e.g., Verify {error condition}>` | `<Error message or blocked action>` |

---

## 7. Non-Functional Requirements

| Category | Requirement | Target / Measure |
|---|---|---|
| Performance | `<Form load — form name>` | < `<N>` seconds |
| Performance | `<Batch job execution time>` | < `<N>` minutes for `<N>` records |
| Scalability | `<Transaction volume>` | `<N>`+ transactions/day |
| Reliability | `<Error recovery>` | `<Description>` |
| Security | `<Role separation / SoD>` | `<Standard>` |

---

## 8. Risks and Dependencies

### 8.1 Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| `<Risk description>` | High / Medium / Low | `<Mitigation action>` |

### 8.2 External Dependencies

| Dependency | Owner | Required By | Risk Level |
|---|---|---|---|
| `<e.g., master data availability, upstream FDD approval>` | `<Team / Role>` | `<Object-ID or URS ref>` | High / Medium / Low |

---

## 9. Reference Documents

| Document Type | Document / Link |
|---|---|
| Business Requirement / URS | `<link or ID>` |
| Related FDDs | `<link or ID>` |
| Process documentation | `<link or ID>` |

---

## 10. Glossary

| Term / Abbreviation | Definition |
|---|---|
| N/A | Not applicable — a process or requirement not in scope for D365 F&O |
| ADO ID | Azure DevOps work item ID — updated once URS items are created in DevOps |
| D365 FO | Microsoft Dynamics 365 Finance and Operations |
| FDS | Functional Design Specification |
| TDS | Technical Design Specification |
| URS | User Requirement Specification |
| ECM | Engineering Change Management |
| `<Term>` | `<Definition>` |

---

## 11. Additional Specifications

`<Any supplementary information not covered by the sections above — e.g., localisation requirements, print management setup, batch recurrence rules>`

---

## Appendix A — Full Traceability Matrix

| URS / ADO ID | Requirement Title | Object-ID(s) | Validation ID(s) | Security Role(s) |
|---|---|---|---|---|
| `<URS-ID / ADO-ID>` | `<Requirement Title>` | `<EXT-001, DEN-042>` | `<VAL-001, VAL-002>` | `<RoleName>` |
