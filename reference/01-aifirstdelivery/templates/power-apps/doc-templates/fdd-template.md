---
feature: {feature-name}
document-type: Functional Design Document
date: {YYYY-MM-DD}
status: DRAFT | UNDER REVIEW | APPROVED
version: 1.0
spec-ref: specs/{feature-name}/spec.md
author: Claude Code (/fdd)
---

# Functional Design Document — {Feature Display Name}

**Project:** {Project Name}
**Based On:** Functional Specification v1.0
**Governed By:** Solution Constitution – Power Platform
**Version:** 1.0
**Status:** Draft for Review

> Sections marked **★** are mandatory for technical design and build. Do not leave any ★ section empty or with placeholder-only content.

---

## Table of Contents

- [1. Document Control](#1-document-control)
  - [1.1 Version History](#11-version-history)
  - [1.2 Approvals](#12-approvals)
  - [1.3 Distribution List](#13-distribution-list)
  - [1.4 Related Documents](#14-related-documents)
- [2. Introduction](#2-introduction)
  - [2.1 Purpose](#21-purpose)
  - [2.2 Scope](#22-scope)
  - [2.3 Definitions & Acronyms](#23-definitions--acronyms)
- [3. System Overview](#3-system-overview)
  - [3.1 High-Level Overview](#31-high-level-overview)
  - [3.2 Personas](#32-personas)
  - [3.3 Key Design Decisions](#33-key-design-decisions)
  - [3.4 System Configuration & Prerequisites](#34-system-configuration--prerequisites)
- [4. Business Process](#4-business-process)
  - [4.1 Process Overview](#41-process-overview)
  - [4.2 Process Flow](#42-process-flow)
- [★ 5. Object & Artefact Inventory](#-5-object--artefact-inventory)
- [6. Functional Design](#6-functional-design)
  - [6.1 Module: {Name}](#61-module-name)
  - *(Repeat 6.X for each module)*
- [7. Data Considerations](#7-data-considerations)
  - [7.1 Key Entities](#71-key-entities)
  - [7.2 Data Flow Summary](#72-data-flow-summary)
  - [7.3 Data Dependencies](#73-data-dependencies)
  - [7.4 Calculated & Rollup Fields](#74-calculated--rollup-fields)
- [8. Environment Variables](#8-environment-variables)
- [9. Screen / Form Designs (Functional)](#9-screen--form-designs-functional)
- [10. User Journey Maps](#10-user-journey-maps)
- [11. Automation Flows (Functional Description)](#11-automation-flows-functional-description)
- [12. Email / Notification Templates](#12-email--notification-templates)
- [13. Copilot Topics](#13-copilot-topics)
- [14. Business Rules](#14-business-rules)
- [15. Security and Access Design](#15-security-and-access-design)
  - [15.1 App Access Matrix](#151-app-access-matrix)
  - [15.2 Record-Level Access (Dataverse Security Roles)](#152-record-level-access-dataverse-security-roles)
  - [15.3 Field-Level Security](#153-field-level-security)
  - [15.4 Canvas App Sharing Model](#154-canvas-app-sharing-model)
  - [15.5 Licence Requirements](#155-licence-requirements)
  - [15.6 Data Visibility Constraints](#156-data-visibility-constraints)
  - [15.7 DLP and Connection References](#157-dlp-and-connection-references)
  - [15.8 Audit Logging Requirements](#158-audit-logging-requirements)
- [16. Non-Functional Requirements](#16-non-functional-requirements)
- [17. Assumptions & Constraints](#17-assumptions--constraints)
  - [17.1 Assumptions](#171-assumptions)
  - [17.2 Constraints](#172-constraints)
- [18. Out of Scope](#18-out-of-scope)
- [19. Risks & Dependencies](#19-risks--dependencies)
  - [19.1 Key Risks](#191-key-risks)
  - [19.2 External Dependencies](#192-external-dependencies)
- [20. Functional Testing](#20-functional-testing)
- [21. Functional Gap Log](#21-functional-gap-log)
- [22. Additional Specifications](#22-additional-specifications)
- [Appendix A — Full Traceability Matrix](#appendix-a--full-traceability-matrix)

---

## 1. Document Control

### 1.1 Version History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/fdd) | Initial Draft – converted from Functional Specification v1.0 |

### 1.2 Approvals

| Role | Name | Signature | Date | Status |
|---|---|---|---|---|
| Business Owner | | | | Pending |
| IT Lead | | | | Pending |
| Solution Architect | | | | Pending |
| Project Manager | | | | Pending |
| Quality Assurance | | | | Pending |

### 1.3 Distribution List

| Name | Role | Organisation | Copy Type |
|---|---|---|---|
| {Name} | {Role} | {Org} | Author / Reviewer / Approver / Informed |

### 1.4 Related Documents

| Document | Version | Location |
|---|---|---|
| Functional Specification | 1.0 | [spec.md](../../specs/{feature-name}/spec.md) |
| Solution Constitution – Power Platform | Current | `constitution/` |
| {Architecture Decision Record} | {Version} | {Path} |
| {Integration Design Document} | {Version} | {Path} |

---

## 2. Introduction

### 2.1 Purpose

{One paragraph: what Power Platform components this FDD covers, who it is for (makers, developers, testers, business stakeholders), and that it is the authoritative reference for solution build and UAT.}

### 2.2 Scope

{Summarise overall scope. List each module by number and name with a one-line description. Reference the spec version and FR range covered.}

- **Module 1:** {Module Name} — {one-line description}
- **Module 2:** {Module Name} — {one-line description}

### 2.3 Definitions & Acronyms

| Term / Acronym | Definition |
|---|---|
| FR | Functional Requirement |
| FDD | Functional Design Document |
| MDA | Model-Driven App |
| Power Fx | Formula language for Canvas Apps |
| Connection Reference | Named connector reference used by Flows — not a personal connection |
| Delegation | Ability of a connector to push query processing to the data source |
| DLP | Data Loss Prevention policy |
| EV | Environment Variable — solution component holding configuration values |
| CR | Connection Reference — solution component holding a named connector |
| ALM | Application Lifecycle Management |
| {Term} | {Definition} |

---

## 3. System Overview

### 3.1 High-Level Overview

{Two to three paragraphs: what the solution does, which Power Platform components are involved (Canvas App, MDA, Flows, Copilot Studio), the data sources used, and what business problem is solved. No technical resource names.}

### 3.2 Personas

| Persona | Role Description | Primary Modules | Licence Tier |
|---|---|---|---|
| {Persona} | {What this actor does in the solution} | {Module numbers} | Standard / Premium |
| System (Flow) | {Automated Power Automate process} | {Module numbers} | Premium (per-flow / per-user) |

---

### 3.3 Key Design Decisions

Document every significant platform choice. Capture options considered so future reviewers understand why alternatives were not chosen.

| Decision | Option A | Option B | Selected | Rationale |
|---|---|---|---|---|
| {e.g., App type for field workers} | Canvas App (mobile-optimised) | Model-Driven App | Option A | Offline support needed; MDA not offline-capable without additional config |
| {e.g., Data source} | Dataverse | SharePoint List | Option A | Complex relationships and security roles require Dataverse; SP lacks row-level security |
| {e.g., Delegation strategy for large table} | Server-side view (pre-filtered) | Client-side filter with delegation warning | Option A | Table > 500 records — delegation limit would truncate results |
| {e.g., Notification delivery} | Power Automate email action | Teams adaptive card via Flow | Option B | Users operate primarily in Teams; email not monitored in real time |

---

### 3.4 System Configuration & Prerequisites

List everything that must be in place before this feature can be built or tested.

**System Configuration**

| Configuration Area | Setting / Parameter | Required Value | Notes |
|---|---|---|---|
| {e.g., Power Platform Environment} | {Managed Environment / Dataverse enabled} | {Enabled} | {Required for solution import} |
| {e.g., Teams integration} | {Power Apps Teams app pinned} | {Pinned for target personas} | |

**Dataverse Tables & Columns**

| Entity (Display Name) | Schema Name | Prerequisite | Owner | Notes |
|---|---|---|---|---|
| {Entity} | `{prefix}_entityname` | {Must exist before build / will be created in this feature} | {Team / Role} | |

**Connection References & DLP**

| Connection Reference | Connector | DLP Tier | Exception Required | Owner |
|---|---|---|---|---|
| `{OrgPrefix} {ServiceName} Connection` | {Connector name} | Business / Non-Business | Yes / No | {Admin role} |

**User & Licence Readiness**

| Item | Description |
|---|---|
| {Licence} | {Premium Power Apps licence assigned to {Persona} before UAT} |
| {Security role} | {Must be created and assigned before testing} |

**FDD / FR Dependencies**

| Dependency | FDD / FR Reference | Required Before |
|---|---|---|
| {e.g., Dataverse schema provisioned by another team} | {FDD-NNN / FR-NNN} | {Object-ID or milestone} |

---

## 4. Business Process

### 4.1 Process Overview

{One paragraph describing the end-to-end user journey and automation this feature supports.}

### 4.2 Process Flow

**Step Table**

| Step | Description | Actor | App / Screen | Happy Path Outcome | Exception / Error Path |
|---|---|---|---|---|---|
| 1 | {Action} | {Persona} | {App — Screen name} | {Expected outcome} | {Error path — FR-NNN} |
| 2 | {Decision} | {Persona} | {App — Screen name} | {Yes path} | {No path} |
| 3 | {Automated response} | System (Flow) | Background | {Outcome — record created, email sent} | {DLQ / alert — FR-NNN} |

**Decision Points**

| Decision Point | Condition | Path A | Path B |
|---|---|---|---|
| {e.g., Approval required?} | {Record value ≥ threshold} | {Route to approver — Step 4} | {Auto-approve — Step 6} |

**Textual narrative** *(optional — add where the table alone is insufficient)*

{Numbered step sequence with FR-NNN references for complex branching not captured in the table above.}

---

## ★ 5. Object & Artefact Inventory

**This section is mandatory for technical design generation. Every Power Platform component to be created or modified must be listed before build begins.**

Use Object-ID prefixes from the Solution Constitution. Mark as "provisional" — final IDs assigned in the technical design.

| Object-ID | Object Name | Category | Object Type | App / Scope | Complexity | FR Reference | Notes |
|---|---|---|---|---|---|---|---|
| PA-001 | `{AppName}` | New Development | Canvas App | {Environment} | Complex | FR-NNN | Mobile / Tablet / Web |
| PA-002 | `{AppName}` | New Development | Model-Driven App | {Environment} | Medium | FR-NNN | |
| PA-003 | `{prefix}_TableName` | New Development | Custom Table (Dataverse) | Global | Medium | FR-NNN | |
| PA-004 | `{prefix}_ColumnName` | New Development | Custom Column (Dataverse) | {Entity} | Simple | FR-NNN | |
| PA-005 | `{FlowName}` | New Development | Cloud Flow — Automated | {Trigger entity} | Medium | FR-NNN | |
| PA-006 | `{FlowName}` | New Development | Cloud Flow — Scheduled | Recurrence | Simple | FR-NNN | |
| PA-007 | `{FlowName}` | New Development | Cloud Flow — Instant | Button / App | Simple | FR-NNN | |
| PA-008 | `{AgentName}` | New Development | Copilot Studio Agent | {Channel} | Complex | FR-NNN | |
| PA-009 | `{TopicName}` | New Development | Copilot Topic | {Agent} | Medium | FR-NNN | |
| PA-010 | `{prefix}_{EnvVarName}` | New Development | Environment Variable | Solution | Simple | FR-NNN | |
| PA-011 | `{OrgPrefix} {Service} Connection` | New Development | Connection Reference | Solution | Simple | FR-NNN | |
| PA-012 | `{ConnectorName}` | New Development | Custom Connector | Solution | Complex | FR-NNN | |

**Complexity guide:** Simple = < 1 day; Medium = 1–3 days; Complex = > 3 days.

---

## 6. Functional Design

{This section contains one sub-section per module. Repeat block 6.X for each module in scope.}

---

### 6.1 Module: {Module Name}

#### 6.1.1 Module Overview

{One paragraph: module scope, purpose, which personas interact with it, which Power Platform components deliver it (Canvas App / MDA / Flow / Copilot), and which other modules it depends on.}

---

#### 6.1.2 Functional Requirements

##### FR-NNN: {Requirement Title}

**Description:** {From spec — do not modify}

**Delivery Mechanism:** Canvas App Screen / Model-Driven App Form / Cloud Flow (Automated / Scheduled / Instant) / Copilot Topic / Dataverse Business Rule / Custom Table / Custom Column / Power BI

**Inputs:**
- {User action, form field, trigger event, or data source}

**Outputs:**
- {Records created/updated, notifications sent, screens shown, flow outcomes}

**Business Rules:**
- {Rule 1 — delegation-safe data operations, mandatory fields, conditional logic}
- {Rule 2}

**Dependencies:**
- Upstream: {FR or data entity that must exist first}
- Downstream: {FR or module that depends on this}

---

*(Repeat FR-NNN block for each functional requirement in this module)*

---

#### 6.1.3 Functional Logic

{Narrative: how all FRs in this module work together. What triggers the process, how the app or flow responds, what the business outcome is. Reference each FR-NNN. Business language only — no Power Fx formulas or flow action names.}

#### 6.1.4 Validation & Error Handling

| Validation ID | Trigger | Condition | Action | Error / Warning Message | Delegation Risk |
|---|---|---|---|---|---|
| VAL-001 | {On submit / On field change / On trigger} | {Condition} | {Block / Warn / Allow} | `"{Exact message text}"` | Yes / No — {if Yes, describe mitigation} |

#### 6.1.5 Acceptance Criteria

- **Given** {precondition}, **When** {user action or trigger}, **Then** {expected outcome} *(FR-NNN)*
- **Given** {invalid input}, **When** {user submits}, **Then** {validation message shown} *(FR-NNN)*

#### 6.1.6 Traceability

| FR Reference | Requirement Title | BR # | Acceptance Criteria Ref |
|---|---|---|---|
| FR-NNN | {Title} | BR-# | AC-1.1, AC-1.2 |

---

*(Repeat Section 6.X block for each module)*

---

## 7. Data Considerations

### 7.1 Key Entities

| Entity (Display Name) | Schema Name | Description | Source | Direction |
|---|---|---|---|---|
| {Entity} | `{prefix}_entityname` | {Purpose} | {Dataverse-native / SharePoint / External system} | {Source → App / App-native} |

### 7.2 Data Flow Summary

- {Data flow 1: source → mechanism → target — e.g., External system → Custom Connector → Dataverse table}
- {Data flow 2}

### 7.3 Data Dependencies

- {Entity A records must exist before Entity B can be associated}
- {Connection Reference must be authorised before FR-NNN flow can activate}

### 7.4 Calculated & Rollup Fields

*State "N/A" if no calculated or rollup fields are in scope.*

| Field (Display Name) | Schema Name | Entity | Type | Formula / Source Fields | Recalculation Trigger |
|---|---|---|---|---|---|
| {Display Name} | `{prefix}_fieldname` | {Entity} | Calculated / Rollup | {Formula or source columns} | {On save / Hourly / Daily} |

---

## 8. Environment Variables

All configurable values, endpoints, feature flags, and thresholds must use Environment Variables — never hardcode environment-specific values in app formulas or flow actions (see Constitution).

| Object-ID | Schema Name | Display Name | Type | Default Value | Used By (FR / Flow / App) | Notes |
|---|---|---|---|---|---|---|
| PA-{NNN} | `{prefix}_{ConfigKeyName}` | {Display Name} | String / Number / Boolean / JSON / Secret | {Value or blank} | {FR-NNN / Flow name / App name} | {Secret type must reference Key Vault — never store raw value} |

---

## 9. Screen / Form Designs (Functional)

*Repeat the relevant sub-section for each Canvas App screen or MDA form in scope.*

---

### Canvas App Screen: `{ScreenName}` — {App Name}

**Purpose:** {What the user achieves on this screen.}
**Object-ID:** PA-{NNN} (see §5)
**Accessed by:** {Persona(s)} via {navigation path / deep link}
**App Form Factor:** Phone / Tablet / Web

**Field Mapping**

| Schema Name | Display Name | Data Type | Length | Required | Default Value | Input Control | Visibility Rule |
|---|---|---|---|---|---|---|---|
| `{prefix}_fieldname` | {Display Name} | {Text / Number / Date / Lookup / OptionSet / Boolean} | {N or N/A} | Yes / No / Conditional | {Value or blank} | Text input / Dropdown / Date picker / Lookup / Toggle | Always / When {condition} |

**Actions / Buttons**

| Button Label | Object-ID (Flow) | Available To | Condition | What Happens |
|---|---|---|---|---|
| {Label} | PA-{NNN} | {Persona} | Always / When {condition} | {Action — navigates to / triggers flow / saves record} |

**Navigation**

| Action | Destination Screen | Notes |
|---|---|---|
| Back | {Previous screen} | |
| Save (success) | {Next screen} | |
| Cancel | {Screen} | Discard changes |

**Delegation Notes:** {If any Filter / Sort / Search on this screen touches > 500 records, describe the delegation boundary, the affected formula, and the mitigation — e.g., server-side view, pre-filtered collection, explicit limit.}

---

### Model-Driven App Form: {Entity} — {Form Name} ({Main / Quick Create / Card})

**Purpose:** {Who uses this form and for what.}
**Object-ID:** PA-{NNN} (see §5)

**Field Mapping**

| Schema Name | Display Name | Data Type | Length | Required | Default Value | Editable | Visibility Rule |
|---|---|---|---|---|---|---|---|
| `{prefix}_fieldname` | {Display Name} | {Text / Lookup / OptionSet / DateTime / Int / Decimal / Boolean} | {N or N/A} | Yes / No / Conditional | {Value or blank} | Yes / Read-only / No | Always / When {condition} |

**Tab / Section Layout**

| Tab / Section | Field Display Name | Required | Editable | Visibility Rule |
|---|---|---|---|---|
| {Tab} / {Section} | {Field} | Yes / No | Yes / Read-only / No | Always / When {condition} |

---

*(Repeat sub-section for each additional screen or form)*

---

## 10. User Journey Maps

### Journey: {Journey Name} — Persona: {Persona}

| Step | User Action | App / Flow Response | Screen / Component | Notes / Edge Cases |
|---|---|---|---|---|
| 1 | {What user does} | {What app shows or does} | {Screen name} | {Design note} |
| 2 | | | | |

**Success outcome:** {What has been achieved when the journey completes successfully}
**Failure / edge case:** {What happens if something goes wrong and how the user recovers}
**FR References:** FR-NNN, FR-NNN

---

## 11. Automation Flows (Functional Description)

*Repeat for each flow in scope. State "N/A" if no flows are required.*

---

### Flow: {Flow Display Name}

**Object-ID:** PA-{NNN} (see §5)
**Type:** Automated / Scheduled / Instant
**Trigger:** {Business event in plain language — e.g., "When a new Service Request record is created in Dataverse"}
**Async / Sync:** Async / Sync (must complete ≤ 5 seconds if triggered synchronously)
**Expected Volume / Frequency:** {N executions per day / hour / event}
**FR Reference:** FR-NNN

**Trigger Configuration**

| Property | Value |
|---|---|
| Column Filter (Automated — trigger only when changed) | {Comma-separated display names — or "All" with justification} |
| Filter Rows (OData / FetchXML condition) | {Condition in plain language — or "None"} |
| Recurrence (Scheduled) | {Every N hours / minutes / days at {time}} |
| Run As / Connection Owner | {Service account role — no personal connections} |

**Process Steps**

1. {Step 1 in plain language}
2. {Step 2}
3. If {condition}: {action A}; Otherwise: {action B}
4. {Final step — record updated / email sent / notification triggered}

**Error Handling / DLQ**

| Scenario | Retry | DLQ / Fallback | User Notification |
|---|---|---|---|
| Transient failure (service unavailable) | Up to 3× with backoff | {Route to error log table / dead-letter queue} | {No user impact / Alert to admin} |
| Permanent failure (bad data / validation error) | None | {Log to `{prefix}_flow_error` table} | {Notification to {Persona}} |

**What the user sees / receives:** {Email summary, Teams notification, record update, confirmation screen, or nothing}

---

*(Repeat Flow sub-section for each additional flow)*

---

## 12. Email / Notification Templates

*State "N/A" if no automated emails, Teams messages, or push notifications are in scope.*

---

### Email Template: {Template Name}

| Property | Value |
|---|---|
| Trigger / Scenario | {Business event that fires this — references flow in §11} |
| From | {System service account / shared mailbox} |
| To | {Recipient role or dynamic field value — e.g., record owner email} |
| Subject | {Subject line with dynamic tokens in plain language} |
| FR Reference | FR-NNN |

**Body Summary:** {Key content — list dynamic fields used in {braces}}

| Dynamic Token | Source Table | Source Field Schema Name | Fallback if Null |
|---|---|---|---|
| `{SR Number}` | `{prefix}_servicerequest` | `{prefix}_name` | "(no reference)" |

---

### Teams Adaptive Card / Push Notification: {Notification Name}

| Property | Value |
|---|---|
| Channel / Target | {Teams channel / personal chat / push via Power Apps} |
| Trigger | {Business event — references flow in §11} |
| Recipient(s) | {Role / dynamic field} |
| Key Content | {Summary of card content — title, body fields, action buttons} |
| FR Reference | FR-NNN |

---

*(Repeat sub-sections for each additional template or notification)*

---

## 13. Copilot Topics

*State "N/A" if no Copilot Studio agent or topics are in scope.*

---

### Topic: {Topic Display Name}

**Object-ID:** PA-{NNN} (see §5)
**Agent:** {Parent Copilot Studio agent name}
**Intent:** {What the user is trying to achieve}
**Authentication Required:** Yes (Azure AD) / No (Anonymous)
**FR Reference:** FR-NNN

**Sample Utterances:** {Phrase 1} | {Phrase 2} | {Phrase 3} | {Phrase 4} | {Phrase 5}

**Knowledge Sources**

| Source Type | Name / Description | Scope / Filter | Notes |
|---|---|---|---|
| Dataverse Table | {Entity display name} | {Filter — e.g., Active records only} | {What the topic searches or retrieves} |
| SharePoint / File | {File or site name} | {Folder or library} | {Used for FAQ / document retrieval} |
| Custom API / Flow | {Action name} | N/A | {When topic invokes a flow or Custom API} |

**Conversation Flow**

| Turn | Speaker | Message | Variables Set |
|---|---|---|---|
| 1 | User | {Sample utterance} | — |
| 2 | Bot | {Clarifying question} | `{varName}` = {value captured} |
| 3 | User | {Reply} | — |
| 4 | Bot | {Retrieves data / confirms action} | `{varResult}` = {outcome} |
| 5 | Bot | {Final response with dynamic content} | — |

**Actions / Flows Triggered from Topic**

| Action | Flow / Custom API | Object-ID | Trigger Condition | Output Used |
|---|---|---|---|---|
| {e.g., Create Service Request} | {Flow display name} | PA-{NNN} | {When user confirms intent} | {Confirmation number returned to user} |

**Escalation**

| Condition | Destination |
|---|---|
| {User requests human agent / topic confidence < threshold} | {Teams live agent queue / {channel name}} |
| {Topic cannot resolve after N turns} | {Fallback topic name} |

**Fallback Topic:** {Topic name — or "System Fallback" if using default}

---

*(Repeat Topic sub-section for each additional Copilot topic)*

---

## 14. Business Rules

| Rule ID | Applies To | Object-ID | Condition | Action | Enforcement | User Message |
|---|---|---|---|---|---|---|
| BR-001 | {Canvas Screen / MDA Form / Flow} | PA-{NNN} | {Condition in plain language} | {Show error / Hide field / Set value / Block save} | Client / Server / Both | {Exact message text} |

---

## 15. Security and Access Design

### 15.1 App Access Matrix

| Persona | Canvas App | Model-Driven App | Copilot | Power Automate |
|---|---|---|---|---|
| {Persona} | Full / Read-only / No access | Full / Read-only / No access | Yes / No | Can trigger / No |

### 15.2 Record-Level Access (Dataverse Security Roles)

*Required for every Dataverse table used by a Model-Driven App or Flow. State "N/A" for Canvas Apps with SharePoint-only data.*

| Persona | Entity (Display Name) | Create | Read | Write | Delete | Append | AppendTo |
|---|---|---|---|---|---|---|---|
| {Persona} | {Entity} | ✓ / — | ✓ / BU / Org | ✓ / — | ✓ / — | ✓ / — | ✓ / — |

### 15.3 Field-Level Security

*State "N/A" if no field-level security is required. Apply for PII, financial, or credential columns.*

| Field (Display Name) | Schema Name | Entity | Readable By | Editable By | Business Justification |
|---|---|---|---|---|---|
| {Field} | `{prefix}_fieldname` | {Entity} | {Role(s)} | {Role(s)} | {Why restricted} |

### 15.4 Canvas App Sharing Model

*State "N/A" if no Canvas Apps are in scope.*

| App Name | Object-ID | Sharing Method | Group / Role | Co-owner Required | Notes |
|---|---|---|---|---|---|
| {App Name} | PA-{NNN} | Azure AD Security Group / Per-user / Org-wide | {Group name or role} | Yes / No | {Any sharing restrictions} |

### 15.5 Licence Requirements

| Persona | Count | Required Licence | Driver | Notes |
|---|---|---|---|---|
| {Persona} | {N users} | Power Apps Premium / Standard | {Dataverse / Custom Connector access} | {Justification if Premium needed} |
| System (Flow) | {N flows} | Power Automate per-flow / per-user | {Premium connector used} | |

### 15.6 Data Visibility Constraints

- {Constraint 1 — e.g., users see only records where Owner = themselves}
- {Constraint 2 — e.g., Inactive records excluded from all gallery views}

### 15.7 DLP and Connection References

**Connection References**

| Object-ID | Schema Name | Connector | Connector Tier | Auth Method | DLP Exception Required | Owner Per Environment |
|---|---|---|---|---|---|---|
| PA-{NNN} | `{OrgPrefix}_{ServiceName}_CR` | {Connector display name} | Business / Non-Business / Blocked | OAuth / Managed Identity / API Key | Yes / No | {Admin role — must authorise before flow activation} |

**DLP Impact**

| Connector | Current DLP Tier | Required Tier | Exception Request Needed | Risk if Blocked |
|---|---|---|---|---|
| {Connector} | {Business / Non-Business} | {Business} | Yes / No | {Flow / App feature that breaks if blocked} |

### 15.8 Audit Logging Requirements

All Dataverse tables containing PII, financial, or compliance-relevant data must have audit enabled.

| Entity (Display Name) | Schema Name | Columns Audited | Retention Period | Business Justification |
|---|---|---|---|---|
| {Entity} | `{prefix}_entityname` | All / {Column list} | 7 years / 1 year | {PII / financial / compliance} |

---

## 16. Non-Functional Requirements

| Category | Requirement | Target / Measure |
|---|---|---|
| Performance | Canvas App screen load | < 3 seconds on target device / network |
| Performance | MDA form load | < 2 seconds |
| Performance | Flow execution time (sync / instant) | < 5 seconds end-to-end |
| Performance | Flow execution time (async / automated) | < {N} minutes for expected volume |
| Scalability | Gallery / view record volume | Delegation-safe up to {N} records; flag if table > 500 rows with client-side filter |
| Reliability | Flow retry on transient failure | Up to 3 retries with exponential backoff; alert on final failure |
| Reliability | Integration message loss | Zero — DLQ handling required for all async flows |
| Availability | Production uptime | ≥ 99.9% monthly |
| Security | Authentication | Azure AD / Entra ID — no anonymous access unless explicitly approved |
| Security | Connections | Connection References only — no personal connections in solution flows |
| Security | Secret management | Environment Variables of type Secret referencing Key Vault — no raw secrets in formulas or flow actions |
| Accessibility | Canvas App | WCAG 2.1 AA — {confirm if accessibility compliance is required} |

---

## 17. Assumptions & Constraints

### 17.1 Assumptions

| ID | Assumption | Owner | Impact if Wrong |
|---|---|---|---|
| A-001 | Dataverse tables required by this feature are provisioned before build begins | {Team / Role} | Build cannot start; {FR-NNN} blocked |
| A-002 | Connection References are created and authorised before flows are activated | Power Platform Admin | Flows cannot be activated; {FR-NNN} blocked |
| A-003 | {Assumption 3} | {Owner} | {Impact} |

### 17.2 Constraints

| ID | Constraint | Source | Affected FR(s) |
|---|---|---|---|
| C-001 | Delegation limit — large-table operations must remain within delegation-safe boundaries | Platform | {FR-NNN} |
| C-002 | No personal connections — all flows must use Connection References | Constitution | All flow FRs |
| C-003 | {Constraint 3} | {Constitution / Legal / Platform} | {FR-NNN} |

---

## 18. Out of Scope

| Module | Out of Scope Item | Rationale |
|---|---|---|
| {Module} | {Excluded item — drawn from spec out-of-scope section} | {Why excluded} |

---

## 19. Risks & Dependencies

### 19.1 Key Risks

| Risk ID | Description | Probability | Impact | Owner | Mitigation |
|---|---|---|---|---|---|
| R-001 | Delegation limit reached on large table — gallery truncates results | High / Medium / Low | High / Medium / Low | {Owner role} | {Server-side view / pre-filtered collection / explicit Top N} |
| R-002 | DLP policy blocks required connector before exception is approved | High / Medium / Low | High / Medium / Low | Power Platform Admin | {Raise exception request at project kick-off; identify fallback connector} |
| R-003 | {Risk description} | High / Medium / Low | High / Medium / Low | {Owner} | {Mitigation} |

### 19.2 External Dependencies

| Dependency | Owner | Required By (FR-NNN) | Risk Level |
|---|---|---|---|
| {Dataverse schema provisioned} | {Team} | {FR-NNN} | High / Medium / Low |
| {Connection Reference authorised} | Power Platform Admin | {FR-NNN} | High / Medium / Low |
| {DLP exception approved} | Security / Governance team | {FR-NNN} | High / Medium / Low |

---

## 20. Functional Testing

Minimum: one positive and one negative test case per business rule. Reference FR-NNN and Acceptance Criteria from §6.x.5.

| TC # | Test Case Title | Type | Precondition | Steps | Expected Result | FR Reference | AC Reference |
|---|---|---|---|---|---|---|---|
| TC-001 | {Verify {positive scenario}} | Positive | {App open; user signed in as {Persona}; test record exists} | {1. Navigate to screen; 2. Enter values; 3. Tap Save} | {Record saved; success screen shown; downstream record created} | FR-NNN | AC-1.1 |
| TC-002 | {Verify {negative / error scenario}} | Negative | {App open; user signed in as {Persona}} | {1. Navigate to screen; 2. Leave required field blank; 3. Tap Save} | {Validation message shown: "{Exact text}"; record not saved} | FR-NNN | AC-1.2 |
| TC-003 | {Verify delegation boundary not breached} | Non-functional | {Table contains > {N} records} | {1. Open gallery screen; 2. Apply filter} | {All matching records returned; no truncation} | FR-NNN | — |

**Test data requirements:** {Describe seed records, personas, and environment configuration needed before UAT begins.}
**Test environment:** {Which Power Platform environment — Dev / Test / UAT — and any pre-activation steps for flows and Copilot.}

---

## 21. Functional Gap Log

| Gap ID | Description | Impact | Priority | Owner | Target Resolution | Status |
|---|---|---|---|---|---|---|
| FG-001 | {Gap identified during FDD elaboration} | {Business impact} | High / Medium / Low | {Stakeholder} | {YYYY-MM-DD} | Open |

*(none — if no gaps)*

---

## 22. Additional Specifications

{Any supplementary information not covered by the sections above — e.g., localisation / multi-language requirements, accessibility (WCAG 2.1 AA compliance for Canvas Apps), offline / mobile-offline configuration, Microsoft Teams embedding setup, Power BI embedded report configuration, or custom connector throttling limits.}

---

## Appendix A — Full Traceability Matrix

| FR Reference | Requirement Title | Module | Object-ID(s) | BR # | AC Reference | TC Reference |
|---|---|---|---|---|---|---|
| FR-NNN | {Title} | {Module Name} | PA-{NNN} | BR-# | AC-1.1, AC-1.2 | TC-001 |
