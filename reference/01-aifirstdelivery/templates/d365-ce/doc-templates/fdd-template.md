---
feature: {feature-name}
document-type: Functional Design Document
date: {YYYY-MM-DD}
status: DRAFT | UNDER REVIEW | APPROVED
version: 1.0
spec-ref: specs/{feature-name}/spec.md
author: {Author Name}
---

# Functional Design Document — {Feature Display Name}

**Project:** {Project Name}
**Based On:** Functional Specification v1.0 — see [spec.md](../../specs/{feature-name}/spec.md)
**Governed By:** Solution Constitution – Dynamics 365 CE
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
- [8. Integration Overview](#8-integration-overview)
- [9. Security Considerations](#9-security-considerations)
  - [9.1 Role-Based Access Control](#91-role-based-access-control)
  - [9.2 Field-Level Security](#92-field-level-security)
  - [9.3 Data Visibility Constraints](#93-data-visibility-constraints)
  - [9.4 Audit Logging Requirements](#94-audit-logging-requirements)
  - [9.5 Secret Management](#95-secret-management)
- [10. D365 CE Specifics](#10-d365-ce-specifics)
  - [10.1 Form and View Specifications](#101-form-and-view-specifications)
  - [10.2 Business Rules](#102-business-rules)
  - [10.3 Security Matrix (Detailed Privileges)](#103-security-matrix-detailed-privileges)
  - [10.4 Environment Variables](#104-environment-variables)
  - [10.5 Automation (Flows / Workflows)](#105-automation-flows--workflows)
  - [10.6 Plugins / Custom Code](#106-plugins--custom-code)
  - [10.7 Email / Notification Templates](#107-email--notification-templates)
  - [10.8 Reports / Dashboards](#108-reports--dashboards)
  - [10.9 Ribbon / Command Bar](#109-ribbon--command-bar)
  - [10.10 Duplicate Detection Rules](#1010-duplicate-detection-rules)
- [11. Non-Functional Requirements](#11-non-functional-requirements)
- [12. Assumptions & Constraints](#12-assumptions--constraints)
  - [12.1 Assumptions](#121-assumptions)
  - [12.2 Constraints](#122-constraints)
- [13. Out of Scope](#13-out-of-scope)
- [14. Risks & Dependencies](#14-risks--dependencies)
  - [14.1 Key Risks](#141-key-risks)
  - [14.2 External Dependencies](#142-external-dependencies)
- [15. Functional Testing](#15-functional-testing)
- [16. Functional Gap Log](#16-functional-gap-log)
- [17. Additional Specifications](#17-additional-specifications)
- [Appendix A — Full Traceability Matrix](#appendix-a--full-traceability-matrix)
- [Appendix B — Field Mapping Reference](#appendix-b--field-mapping-reference)

---

## 1. Document Control

### 1.1 Version History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | {Author Name} | Initial Draft – converted from Functional Specification v1.0 |

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
| Solution Constitution – D365 CE | Current | `constitution/` |
| {Architecture Decision Record} | {Version} | {Path} |
| {Integration Design Document} | {Version} | {Path} |

---

## 2. Introduction

### 2.1 Purpose

{One paragraph: what this FDD covers, who it is for (developers, testers, business stakeholders), and that it is the authoritative reference for solution build, configuration, and acceptance testing. Cross-references: see [spec.md](../../specs/{feature-name}/spec.md) for the approved functional requirements this document elaborates.}

### 2.2 Scope

{Summarise overall scope. List each module by number and name with a one-line description. Reference the spec version and the FR range covered (e.g., FR-001 through FR-015 from Functional Specification v1.0).}

- **Module 1:** {Module Name} — {one-line description}
- **Module 2:** {Module Name} — {one-line description}

### 2.3 Definitions & Acronyms

| Term / Acronym | Definition |
|---|---|
| D365 CE | Microsoft Dynamics 365 Customer Engagement |
| FR | Functional Requirement |
| FDD | Functional Design Document |
| AC | Acceptance Criteria |
| BR | Business Rule |
| UAT | User Acceptance Testing |
| DLQ | Dead-Letter Queue |
| SoD | Segregation of Duties |
| PCF | PowerApps Component Framework |
| OOB | Out of the Box (standard platform behaviour) |
| {Term} | {Definition} |

---

## 3. System Overview

### 3.1 High-Level Overview

{Two to three paragraphs: what the solution does, which systems are involved, the authoritative source(s) of data, and what D365 CE is responsible for. No technical implementation detail.}

### 3.2 Personas

| Persona | Role Description | Primary Modules |
|---|---|---|
| {Persona} | {What this actor does in the solution} | {Module numbers} |
| System | {Automated processes} | {Module numbers} |

---

### 3.3 Key Design Decisions

Document every significant choice made during design — configuration vs. customisation, OOB vs. custom, platform approach. Capture options considered so future reviewers understand why an alternative was not chosen.

| Decision | Option A | Option B | Selected | Rationale |
|---|---|---|---|---|
| {e.g., Approval routing} | {Power Automate Approval} | {Classic Workflow} | {Option A} | {Reason — async, supports Teams notifications, Constitution §11 async preference} |
| {e.g., Field storage} | {Custom column on Account} | {New custom table} | {Option B} | {Reason — cardinality requires 1:N} |

---

### 3.4 System Configuration & Prerequisites

List everything that must be in place before this feature can be built or tested.

**System Configuration**

| Configuration Area | Setting / Parameter | Required Value | Notes |
|---|---|---|---|
| {e.g., Organisation Settings} | {Parameter name} | {Required value} | {Reason or dependency} |
| {e.g., Power Platform Environment} | {Feature flag / solution layer} | {Enabled / value} | |

**Master Data & Reference Data**

| Entity | Prerequisite Records | Owner | Notes |
|---|---|---|---|
| {Entity} | {Records that must exist — e.g., Account types, lookup values} | {Team / Role} | |

**User & Role Readiness**

| Item | Description |
|---|---|
| {Security role} | {Must be created and assigned to named users before UAT} |

**FDD / FR Dependencies**

| Dependency | FDD / FR Reference | Required Before |
|---|---|---|
| {e.g., Account entity customisation complete} | {FDD-NNN / FR-NNN} | {Object-ID or milestone} |

---

## 4. Business Process

### 4.1 Process Overview

**As-Is (Current State):** {One paragraph describing the current process pain point or gap this feature addresses.}

**To-Be (Future State):** {One paragraph describing the end-to-end business process this feature delivers.}

### 4.2 Process Flow

**Step Table**

| Step | Description | Actor | D365 Form / Screen | Happy Path Outcome | Exception / Error Path |
|---|---|---|---|---|---|
| 1 | {Action} | {Persona} | {Form name} | {Expected outcome} | {Error path — FR-NNN} |
| 2 | {Decision} | {Persona} | {Form name} | {Yes path} | {No path} |
| 3 | {System response} | System | {Automated} | {Outcome} | {DLQ / alert} |

**Decision Points**

| Decision Point | Condition | Path A | Path B |
|---|---|---|---|
| {e.g., Credit check result} | {Credit score ≥ threshold} | {Proceed to approval — Step 4} | {Route to manual review — Step 5} |

**Textual narrative** *(optional — add where step table alone is insufficient)*

{Numbered step sequence with FR-NNN references for complex branching not captured in the table above.}

---

## ★ 5. Object & Artefact Inventory

**This section is mandatory for technical design generation. Every D365 CE object to be created or modified must be listed before build begins.**

Use Object-ID prefixes from the Solution Constitution. Mark as "provisional" — final IDs are assigned in the technical design.

| Object-ID | Object Name | Category | Object Type | Entity / Scope | Complexity | FR Reference | Notes |
|---|---|---|---|---|---|---|---|
| CE-001 | `{prefix}_TableName` | New Development | Custom Table | Global | Medium | FR-NNN | |
| CE-002 | `{prefix}_ColumnName` | New Development | Custom Column | {Entity} | Simple | FR-NNN | |
| CE-003 | `{prefix}_PluginName` | New Development | Plugin | {Entity} — {Message} | Complex | FR-NNN | |
| CE-004 | `{prefix}_FlowName` | New Development | Power Automate Cloud Flow | {Trigger entity} | Medium | FR-NNN | |
| CE-005 | `{prefix}_FormName` | New Development | Model-Driven Form | {Entity} | Simple | FR-NNN | Clone of OOB form |
| CE-006 | `{prefix}_ViewName` | New Development | View | {Entity} | Simple | FR-NNN | |
| CE-007 | `{EntityName}` | Extension | Form Extension | {Entity} — {Form} | Simple | FR-NNN | |
| CE-008 | `{prefix}_WebResourceName` | New Development | Web Resource (JS) | {Entity / Global} | Medium | FR-NNN | |

**Complexity guide:** Simple = < 1 day; Medium = 1–3 days; Complex = > 3 days.

---

## 6. Functional Design

{This section contains one sub-section per module. Repeat block 6.X for each module in scope.}

---

### 6.1 Module: {Module Name}

#### 6.1.1 Module Overview

{One paragraph: module scope, purpose, which personas interact with it, and which other modules it depends on.}

---

#### 6.1.2 Functional Requirements

##### FR-NNN: {Requirement Title}

**Description:** {From spec — do not modify. See [spec.md](../../specs/{feature-name}/spec.md) §{N}}

**Delivery Mechanism:** OOB Configuration / Business Rule / Power Automate Flow / Plugin / Custom Column / Custom Table / Web Resource / PCF Control

**Inputs:**
- {Input 1}
- {Input 2}

**Outputs:**
- {Output 1}
- {Output 2}

**Business Rules:**
- {Rule 1 — independently verifiable}
- {Rule 2}

**Dependencies:**
- Upstream: {FR or system that must exist first}
- Downstream: {FR or module that depends on this}

---

*(Repeat FR-NNN block for each functional requirement in this module)*

---

#### 6.1.3 Functional Logic

{Narrative paragraph(s): how all FRs in this module work together. Trigger → processing → outcome. Reference each FR-NNN inline. Business-level logic only — no implementation detail.}

#### 6.1.4 Validation & Error Handling

| Validation ID | Trigger | Condition | Action | Error / Warning Message | Severity |
|---|---|---|---|---|---|
| VAL-001 | {On save / On field change / On button click} | {Condition} | {Block / Warn / Allow} | `"{Exact message text}"` | Error / Warning |

#### 6.1.5 Acceptance Criteria

- **Given** {precondition}, **When** {action}, **Then** {expected outcome} *(FR-NNN)*
- **Given** {precondition}, **When** {action}, **Then** {expected outcome} *(FR-NNN)*

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
| {Entity} | `{prefix}_entityname` | {Purpose} | {Origin system or D365-native} | {Source → D365 / D365-native} |

### 7.2 Data Flow Summary

- {Data flow 1: source → transport mechanism → target}
- {Data flow 2}

### 7.3 Data Dependencies

- {Entity A records must exist before Entity B can be associated}
- {Record X must be created before FR-NNN can execute}

### 7.4 Calculated & Rollup Fields

*State "N/A" if no calculated or rollup fields are in scope.*

| Field (Display Name) | Schema Name | Entity | Type | Formula / Source Fields | Recalculation Trigger | Notes |
|---|---|---|---|---|---|---|
| {Display Name} | `{prefix}_fieldname` | {Entity} | Calculated / Rollup | {Formula or source columns} | {On save / Hourly / Daily} | |

---

## 8. Integration Overview

{Short paragraph: any data that must never flow in a given direction and the governance rule that enforces it. Integration failures must not block core CE operations — document the degradation behaviour for each integration below.}

*Repeat the sub-section below for each integration in scope. State "N/A" if no integrations are in scope.*

---

### Integration: {Integration Name}

**Direction:** Inbound / Outbound / Bidirectional
**Mechanism:** {Business-level description — no resource names}
**Trigger:** {Business event}
**Target Entity:** {D365 entity}
**Error Handling / DLQ Strategy:** {Retry policy / DLQ / graceful degradation behaviour}

#### Field Mapping

| Source Field | Source System | Target Field | Target System | Data Type | Transformation / Rule |
|---|---|---|---|---|---|
| {Field} | {System} | {Field} | {System} | {Type} | {Mapping rule or N/A} |

#### Parameters

| Parameter | Value / Description |
|---|---|
| Frequency | Real-time / Scheduled ({interval}) / On-demand |
| Auth Mechanism | {OAuth / Managed Identity / Key Vault secret — no raw credentials} |
| Volume Estimate | {N} records / {period} |

#### Validation

{Validation applied to inbound/outbound data — mandatory fields, format checks, rejection behaviour.}

#### Error Handling

| Error Scenario | System Response | Notification Mechanism |
|---|---|---|
| {Scenario} | `"{Exact message or log entry}"` | DLQ / Alert / Email / Infolog |

---

*(Repeat Integration sub-section for each additional integration)*

---

## 9. Security Considerations

### 9.1 Role-Based Access Control

| Role | Access Level | Key Restrictions |
|---|---|---|
| {Role / Persona} | {Summary: Create/Edit SR, Read-only on Account, etc.} | {What this role cannot do} |

**Segregation of Duties (SoD)**

Identify any SoD conflicts created or mitigated by this feature.

| Conflict ID | Role A | Role B | Conflicting Privilege | SoD Risk | Mitigation |
|---|---|---|---|---|---|
| SoD-001 | {Role} | {Role} | {Privilege — e.g., both can approve and create} | High / Medium / Low | {Mitigation — e.g., separate security roles, approval workflow} |

### 9.2 Field-Level Security

| Field (Display Name) | Entity | Readable By | Editable By | Business Justification |
|---|---|---|---|---|
| {Field} | {Entity} | {Role(s)} | {Role(s)} | {Why restricted} |

### 9.3 Data Visibility Constraints

- {Constraint 1 — e.g., non-customer accounts excluded from standard views}
- {Constraint 2}

### 9.4 Audit Logging Requirements

All custom tables containing PII, financial, or compliance-relevant data must have audit enabled. Retention: 7 years for PII/financial tables, 1 year for operational tables (see Constitution §06).

| Entity (Display Name) | Columns Audited | Retention Period | Business Justification |
|---|---|---|---|
| {Entity} | All / {Column list} | 7 years / 1 year | {Reason — PII / financial / compliance} |

### 9.5 Secret Management

All secrets, API keys, and connection strings must be stored in Azure Key Vault. Environment Variables of type Secret must reference Key Vault — never store raw values in Dataverse (see Constitution §06).

| Secret / Config Value | Type | Key Vault Reference | Used By |
|---|---|---|---|
| {e.g., Integration API Key} | Secret | {Key Vault secret name} | {FR-NNN / Integration name} |

---

## 10. D365 CE Specifics

### 10.1 Form and View Specifications

> **Note:** All forms must be clones of the OOB form — never modify a system form directly (Constitution §01).

*Repeat the sub-section below for each form in scope. State "N/A" for variants (Quick Create, Card, Mobile) if not required.*

---

#### Form: {Entity} — {Form Name} ({Main / Quick Create / Card / Mobile})

**Purpose:** {Who uses this form and for what.}
**Object-ID:** CE-{NNN} (see §5)

**Field Mapping**

| Schema Name | Display Name | Data Type | Length | Required | Default Value | Editable | Visibility Rule |
|---|---|---|---|---|---|---|---|
| `{prefix}_fieldname` | {Display Name} | {String / Lookup / OptionSet / DateTime / Int / Decimal / Boolean} | {N or N/A} | Yes / No / Conditional | {Value or blank} | Yes / Read-only / No | Always / When {condition} |

**Tab / Section Layout**

| Tab / Section | Field Display Name | Required | Editable | Visibility Rule |
|---|---|---|---|---|
| {Tab} / {Section} | {Field} | Yes / No | Yes / Read-only / No | Always / When {condition} |

**Buttons / Actions**

| Button Label | Visible To | Condition | Action |
|---|---|---|---|
| {Label} | {Persona} | {Always / When {condition}} | {Description} |

---

#### View: {Entity} — {View Name}

**Purpose:** {Who uses this view and for what.}
**Default Filter:** {Plain language}
**Columns:** {Field 1}, {Field 2}, {Field 3}
**Default Sort:** {Field}, {Ascending / Descending}

---

### 10.2 Business Rules

| Rule ID | Rule Name | Applies To | Condition | Action | Enforcement | User Message |
|---|---|---|---|---|---|---|
| BR-001 | {Name} | {Entity / Form} | {Condition in plain language} | {Show error / Hide field / Set value} | Client / Server / Both | {Exact message text} |

---

### 10.3 Security Matrix (Detailed Privileges)

| Persona | Entity | Create | Read | Write | Delete | Append | AppendTo | Share | Assign |
|---|---|---|---|---|---|---|---|---|---|
| {Persona} | {Entity} | ✓ / — | ✓ / BU / Org | ✓ / — | ✓ / — | ✓ / — | ✓ / — | ✓ / — | ✓ / — |

---

### 10.4 Environment Variables

All configurable values, connection strings, and URLs must use Environment Variables — never hardcode environment-specific values (Constitution §01).

| Schema Name | Display Name | Type | Default Value | Used By (FR / Integration) |
|---|---|---|---|---|
| `{prefix}_ConfigKeyName` | {Display Name} | String / JSON / Secret | {Value or blank} | {FR-NNN / Integration name} |

---

### 10.5 Automation (Flows / Workflows)

| Automation Name | Object-ID | Type | Trigger | Async / Sync | Steps (Summary) | FR Reference |
|---|---|---|---|---|---|---|
| {Name} | CE-{NNN} | Power Automate / Classic Workflow / Business Process Flow | {Trigger event} | Async / Sync (≤ 5s end-to-end) | {Step summary} | FR-NNN |

{Note any automation that runs synchronously — these must complete within 5 seconds end-to-end per Constitution §11. Async flows must implement DLQ handling; failures must not block core CE operations.}

---

### 10.6 Plugins / Custom Code

*Repeat the sub-section below for each plugin, custom action, web resource, or PCF control in scope. State "N/A" if no custom code is required.*

---

#### Plugin / Code: {Name}

**Object-ID:** CE-{NNN} (see §5)
**Type:** Plugin / Custom Action / Web Resource (JS) / PCF Control

| Property | Value |
|---|---|
| Entity | {Entity schema name} |
| Message | {Create / Update / Delete / custom message} |
| Stage | Pre-Validation / Pre-Operation / Post-Operation |
| Execution Mode | Synchronous / Asynchronous |
| Filtering Attributes | {Comma-separated schema names, or "All"} |
| Run As | Calling User / System |

**Business Logic**

{What this code enforces or computes. Trigger → processing → outcome. Reference FR-NNN inline.}

**Inputs**

| Attribute / Parameter | Source | Description |
|---|---|---|
| {Schema name} | Target entity / Input parameter | {Purpose} |

**Outputs / Side Effects**

| Attribute / Parameter | Target | Description |
|---|---|---|
| {Schema name} | Target entity / Output parameter / Child record | {What is set or created} |

**Error Handling**

| Error Scenario | System Response | User Message |
|---|---|---|
| {Scenario} | {Throw InvalidPluginExecutionException / log to DLQ} | `"{Exact message text}"` |

---

*(Repeat Plugin / Code sub-section for each additional custom code object)*

---

### 10.7 Email / Notification Templates

*State "N/A" if no automated emails or notifications are in scope.*

| Template Name | Trigger / Scenario | Recipient(s) | From | Subject | Body Summary | FR Reference |
|---|---|---|---|---|---|---|
| {Name} | {Business event that fires this} | {Role / field value} | {System queue / user} | {Subject line} | {Key content — tokens in {braces}} | FR-NNN |

**Alert Rules** *(if using D365 CE system alerts)*

| Alert Name | Entity | Condition | Recipients | Delivery | FR Reference |
|---|---|---|---|---|---|
| {Name} | {Entity} | {Condition} | {Role / user} | Email / In-app / Both | FR-NNN |

---

### 10.8 Reports / Dashboards

*State "N/A" if no reports or dashboards are in scope.*

*Repeat the sub-section below for each report or dashboard.*

---

#### Report / Dashboard: {Name} ({SSRS / Power BI / System Chart / System Dashboard})

**Purpose:** {Who uses this and for what decision.}
**Object-ID:** CE-{NNN} (see §5)
**Access:** {Persona(s) / Security role(s)}

**Filters / Parameters**

| Parameter | Data Type | Mandatory | Default | Description |
|---|---|---|---|---|
| {Parameter} | {Type} | Yes / No | {Default} | {Purpose} |

**Columns / Visualisations**

| Field / Visual | Source Entity / Field | Data Type | Aggregation | Notes |
|---|---|---|---|---|
| {Column or chart element} | {Entity.Field} | {Type} | {Sum / Count / N/A} | |

**Distribution / Access**

{How this report is accessed — menu item, embedded on form, shared dashboard, etc.}

---

*(Repeat Report / Dashboard sub-section for each additional report)*

---

### 10.9 Ribbon / Command Bar

*State "N/A" if no ribbon or command bar customisations are in scope.*

| Button Label | Object-ID | Entity / Form | Location | Visible To | Enable Condition | Action | FR Reference |
|---|---|---|---|---|---|---|---|
| {Label} | CE-{NNN} | {Entity} — {Form / View / All} | Form command bar / View command bar / Sub-grid | {Persona / Role} | {Always / When {condition}} | {JavaScript function / Power Automate / Navigate} | FR-NNN |

---

### 10.10 Duplicate Detection Rules

*State "N/A" if no duplicate detection rules are in scope.*

| Rule Name | Entity | Match Criteria | Condition | Action on Duplicate Found | FR Reference |
|---|---|---|---|---|---|
| {Rule Name} | {Entity} | {Field(s) — e.g., Email (Exact Match), Full Name (Similar)} | {Active records only / All records} | {Warn user / Block save} | FR-NNN |

---

## 11. Non-Functional Requirements

Baseline targets are defined in Constitution §11. Flag any deviation as a Constitution Risk with a justified exception.

| Category | Requirement | Target / Measure |
|---|---|---|
| Performance | Form load — {entity name} | ≤ 2 seconds (Constitution §11) |
| Performance | Form save (synchronous plugin chain) | ≤ 3 seconds (Constitution §11) |
| Performance | Synchronous plugin execution | ≤ 2 seconds (Constitution §11) |
| Performance | Integration latency (sync flow) | ≤ 5 seconds end-to-end (Constitution §11) |
| Scalability | Record volume per year | {N}+ records/year; flag if > 1 million rows |
| Availability | Production uptime | ≥ 99.9% monthly (Constitution §11) |
| Availability | Graceful degradation on integration failure | Integration failures must not block core CE operations |
| Reliability | Unhandled plugin exception rate | < 0.1% of executions |
| Reliability | Integration message loss | Zero — DLQ handling required for all async flows |
| Security | Authentication | Azure AD / Entra ID — no basic auth |
| Security | Secret management | Azure Key Vault only — no secrets in solution or code |
| Security | Audit coverage | All PII and financial tables have audit enabled |

---

## 12. Assumptions & Constraints

### 12.1 Assumptions

| ID | Assumption | Owner | Impact if Wrong |
|---|---|---|---|
| A-001 | {Condition the solution depends on being true} | {Role} | {What breaks and which FR is affected} |

### 12.2 Constraints

| ID | Constraint | Source | Affected FR(s) |
|---|---|---|---|
| C-001 | {Hard boundary on the solution} | {Constitution / Legal / Platform} | FR-NNN |

---

## 13. Out of Scope

| Module | Out of Scope Item | Rationale |
|---|---|---|
| {Module} | {Excluded item — drawn from spec out-of-scope section} | {Why excluded} |

---

## 14. Risks & Dependencies

### 14.1 Key Risks

| Risk ID | Description | Probability | Impact | Owner | Mitigation |
|---|---|---|---|---|---|
| R-001 | {Risk description} | High / Medium / Low | High / Medium / Low | {Owner role} | {Mitigation action} |

### 14.2 External Dependencies

| Dependency | Owner | Required By (FR-NNN) | Risk Level |
|---|---|---|---|
| {Dependency — e.g., upstream system readiness} | {Team / Role} | {FR-NNN} | High / Medium / Low |

---

## 15. Functional Testing

Minimum: one positive and one negative test case per business rule. Full test plan generated separately. Reference FR-NNN and Acceptance Criteria from §6.x.5.

| TC # | Test Case Title | Type | Precondition | Steps | Expected Result | FR Reference | AC Reference |
|---|---|---|---|---|---|---|---|
| TC-001 | {Verify {positive scenario}} | Positive | {Setup state} | {1. Action; 2. Action} | {Expected outcome} | FR-NNN | AC-1.1 |
| TC-002 | {Verify {negative / error scenario}} | Negative | {Setup state} | {1. Action; 2. Action} | {Error message or blocked action} | FR-NNN | AC-1.2 |

{Note any test data requirements, environment dependencies, or personas that must be provisioned before UAT can begin.}

---

## 16. Functional Gap Log

| Gap ID | Description | Impact | Priority | Owner | Target Resolution | Status |
|---|---|---|---|---|---|---|
| FG-001 | {Gap identified during FDD elaboration} | {Business impact} | High / Medium / Low | {Stakeholder} | {YYYY-MM-DD} | Open |

*(none — if no gaps)*

---

## 17. Additional Specifications

{Any supplementary information not covered by the sections above — e.g., localisation requirements, portal / external access requirements, mobile offline configuration, print template setup, Teams integration specifics, or accessibility requirements.}

---

## Appendix A — Full Traceability Matrix

| FR Reference | Requirement Title | Module | Object-ID(s) | BR # | AC Reference | TC Reference |
|---|---|---|---|---|---|---|
| FR-NNN | {Title} | {Module Name} | CE-{NNN} | BR-# | AC-1.1, AC-1.2 | TC-001 |

---

## Appendix B — Field Mapping Reference

Consolidated field mapping across all entities in scope. Derived from §10.1 form specs. Authoritative for developers and testers.

| Entity (Display Name) | Schema Name | Field (Display Name) | Schema Name | Data Type | Length | Required | Default Value | FR Reference |
|---|---|---|---|---|---|---|---|---|
| {Entity} | `{prefix}_entityname` | {Field} | `{prefix}_fieldname` | {Type} | {N or N/A} | Yes / No | {Value or blank} | FR-NNN |
