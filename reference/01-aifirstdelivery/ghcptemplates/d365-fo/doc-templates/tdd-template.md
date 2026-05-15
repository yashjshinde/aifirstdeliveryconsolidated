# Technical Design Specification — D365 F&O (IT System Design Specification)

You are a Technical Design Specification author for a D365 Finance & Operations implementation.
Produce a complete TDS that strictly follows the IT System Design Specification structure below.

**Rules:**
- Preserve all section numbers and headings exactly
- For every table, produce a Markdown table with the same columns
- Use `<TBD>` for unknown values — never leave a section blank
- Add all unknowns to Section 5.12 Issues / Open Items
- Every method in Section 5.6 / 5.7 must have a pseudocode block
- Every major design element must reference its FDS section
- Object names must follow naming convention (see `constitution/03-extension-coding-standards.md`)
- Apply the Section Behaviour Rules below to every section without exception

---

## Quick Reference — Naming Patterns

> **Set your project prefix** in `constitution/03-extension-coding-standards.md`. Replace `[PREFIX]` throughout with the project-specific prefix (e.g. `AVA`, `HGL`, `HCN`).

| Object Type | Pattern | Example |
|---|---|---|
| Solution / Project | `[PREFIX]_<FDDFileName>` | `AVA_SalesManagement` |
| Event Handler | `[PREFIX]<Object><Type>_EventHandler` | `AVASalesTableDbt_EventHandler` |
| Metadata Extension | `<Object>.[PREFIX]Extension` | `SalesTable.AVAExtension` |
| Code Extension (CoC) | `[PREFIX]<Object><Type>_Extension` | `AVASalesTableDbt_Extension` |
| New Table / Form / Class | `[PREFIX]<Module><Process>` | `AVAGoldenTaxTable` |
| New Enum / EDT | `[PREFIX]<Module><Process>` | `AVAGoldenTaxType` |

**Type abbreviations:** `Dbt` (Table) · `Frm` (Form) · `Cls` (Class) · `Map` · `DE` (Data Entity) · `DS` (DataSource) · `Fld` (Field) · `Ctrl` (Control)

---

## Section Behaviour Rules

Apply these rules to every section when generating the TDS:

| Scenario | Required behaviour |
|---|---|
| **Main section always present** | Every numbered main section (1–9) must appear in the output regardless of whether content exists. Never skip a main section heading. |
| **Sub-section has data** | Show the sub-section heading and all its content. |
| **Sub-section has no data / not applicable** | Show the sub-section heading, then write a single line: `Not Applicable` — no tables, no placeholder rows. |
| **Table has data** | Render the full table with all populated rows. |
| **Table has no data** | Do **not** render the table. Write `Not Applicable` in its place. |
| **`<TBD>` values** | Use `<TBD>` for unknown values. Log each to §5.12 Issues / Open Items. |

**Summary rule:** Always show every main section. Write `Not Applicable` (never leave blank, never write N/A, never insert empty table rows) whenever a section or table has nothing to report.

---

## Content Depth Rules for Section 2

| Sub-section | Minimum content requirement |
|---|---|
| **2.1.1 Current business process** | Describe the **full end-to-end As-Is process** in D365 F&O standard. Include: (a) standard process steps in sequence, (b) what the user does at each step, (c) what system validation exists or is missing, (d) the compliance/business gap. Use bullet points per step. If the FDS has separate flows, document each as a separate numbered sub-list. Never summarise in a single sentence. |
| **2.1.2 Rationale for customisation** | Explain **why standard D365 F&O is insufficient**. Include: (a) specific standard limitation, (b) business/regulatory risk, (c) chosen approach, (d) rejected alternatives (workflow, Power Automate, manual SOP) with reasons. Minimum 3–5 sentences. |
| **2.1.3 Key Technical Decisions** | **Numbered items** with: Decision, Options considered, Selected approach, Rationale, Risk / Mitigation. Cover: (a) extension pattern, (b) data storage, (c) validation mechanism, (d) cross-company / data entity decisions. |
| **2.1.4 Assumptions and Dependencies** | **Two separate numbered lists**. Assumptions: feature enablement, legal entity config, master data, process ownership. Dependencies: FDS ref, URS ref, other FDDs, environment, config prerequisites. Each item a complete sentence. |

**Enforcement rule:** Extract and expand FDS process flows, field mappings, validations, and business logic into these sub-sections — never single-line summaries. Content must be sufficient for a developer to understand full business context without the FDS.

---

## Document Header

**Document Name:** IT — System Design Specification
**Project Name:** `<ProjectName>`
**Document No.:** `<DocNo>`
**IT Validation No.:** `<ValidationNo>`
**Version:** `<Version>`

### Sign-off

| Role | Name and Title | Date | Signature |
|---|---|---|---|
| Author: Project Leader / Tech Lead | `<TBD>` | `<TBD>` | |
| Review & approval: Technical Lead / Project Lead (Optional) | `<TBD>` | `<TBD>` | |
| Review & approval: Validation Responsible | `<TBD>` | `<TBD>` | |
| Review & approval: Senior Manager, IT | `<TBD>` | `<TBD>` | |

### Version History

| Version | Change Request Number | Initiator(s) | Date | Change Description |
|---|---|---|---|---|
| 00 | `<CR/MOC ID>` | `<TBD>` | `<YYYY-MM-DD>` | New Release |

---

## Table of Contents

- [Document Header](#document-header)
- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Objectives](#12-objectives)
- [2. System Overview](#2-system-overview)
  - [2.1 Business Purpose and Intended Use](#21-business-purpose-and-intended-use)
    - [2.1.1 Current Business Process](#211-current-business-process)
    - [2.1.2 Rationale for Customisation](#212-rationale-for-customisation)
    - [2.1.3 Key Technical Decisions](#213-key-technical-decisions)
    - [2.1.4 Assumptions and Dependencies](#214-assumptions-and-dependencies)
- [3. Glossary](#3-glossary)
- [4. Reference Documents](#4-reference-documents)
- [5. Architecture](#5-architecture)
  - [5.1 Development Environments](#51-development-environments)
  - [5.2 Presentation Layers](#52-presentation-layers)
  - [5.3 Updates to Form](#53-updates-to-form)
  - [5.4 Updates to Data Dictionary](#54-updates-to-data-dictionary)
  - [5.5 SSRS Reports](#55-ssrs-reports)
  - [5.6 Updates to Business Logic and Batch Jobs](#56-updates-to-business-logic-and-batch-jobs)
  - [5.7 Updates to Interface Logic](#57-updates-to-interface-logic)
  - [5.8 Business Process and Workflow](#58-business-process-and-workflow)
  - [5.9 Security and Configuration Design](#59-security-and-configuration-design)
  - [5.10 Label Files](#510-label-files)
  - [5.11 Interface Configuration / Design](#511-interface-configuration--design)
  - [5.12 Issues / Open Items](#512-issues--open-items)
  - [5.13 Authentication](#513-authentication)
  - [5.14 Data Encryption](#514-data-encryption)
- [6. System Configuration Specification](#6-system-configuration-specification)
- [7. Data Interfacing: End-to-End Steps and Operational Status](#7-data-interfacing-end-to-end-steps-and-operational-status)
- [8. Initialising of Data](#8-initialising-of-data)
- [9. Overall or Additional Design Specifications](#9-overall-or-additional-design-specifications)
- [Quality Checklist](#quality-checklist)

---

# 1. Introduction

## 1.1 Purpose

Describe the purpose of this TDS and what technical solution it covers.

## 1.2 Objectives

List the measurable technical objectives (design coverage, traceability, compliance).

**URS ID:** `<URS-ID (ADO Work Item ID)>`
**L3/L4 Process:** `<Process Group NNN: Process Name>`

---

# 2. System Overview

## 2.1 Business Purpose and Intended Use

Describe the overall solution scope and what it delivers technically.

### 2.1.1 Current Business Process

Describe the current (as-is) process and its limitations following the Content Depth Rules above. Reference FDS §3.2.

### 2.1.2 Rationale for Customisation

Explain why standard D365 F&O configuration is insufficient and customisation is justified following the Content Depth Rules above. Reference FDS §3.4.

### 2.1.3 Key Technical Decisions

| # | Decision | Options Considered | Selected Approach | Rationale | Risk / Mitigation |
|---|---|---|---|---|---|
| 1 | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

### 2.1.4 Assumptions and Dependencies

**Assumptions:**
1. `<TBD>`

**Dependencies:**
1. `<Other FDDs / integrations / environments / data this TDS depends on>`

---

# 3. Glossary

| Term | Definition |
|---|---|
| `<Term>` | `<Definition>` |

---

# 4. Reference Documents

| Document Name | Document Reference |
|---|---|
| FDS | `<FDS document number / path>` |
| URS | `<URS document number / path>` |
| ADO Work Item | `<ADO ID>` |
| DA List | `<TBD>` |
| SSRS Report Layout Rules | `<TBD>` |
| QA Tracker | `<TBD>` |
| Naming Rules | `constitution/03-extension-coding-standards.md` |
| Common Function FDD | `<TBD>` |
| Constitution | `constitution/` |

---

# 5. Architecture

## 5.1 Development Environments

| Environment | Platform Version | Purpose | Notes |
|---|---|---|---|
| DEV (Tier-1) | D365 FO `<version>` | Development and unit test | Developer self-service |
| Build (Tier-2) | D365 FO `<version>` | Build validation | Pipeline |
| UAT / SIT | D365 FO `<version>` | SIT and UAT | Pipeline deployment |
| PROD | D365 FO `<version>` | Production | Change-controlled |

## 5.2 Presentation Layers

Describe VS project structure, model/package name, and namespace. Include screenshot of project in Visual Studio. Naming rules for project creation in VS must be followed.

| Layer | VS Project | Model / Package | Namespace |
|---|---|---|---|
| Application | `[PREFIX]_<FDDFileName>` | `<ModelName>` | `<Namespace>` |

---

## 5.3 Updates to Form

### 5.3.1 Forms — Form Extensions

*Repeat the following sub-section for each Form Extension. Write `Not Applicable` if no form extensions are required.*

---

#### Form Extension: `<FormName>.[PREFIX]Extension`

*(Object-ID: EXT-NNN — FDS §6.2.1)*

**Overview:** `<What this extension adds or changes and why>`

**Data Sources:**

| Name | Table | Join Source | Link Type | Allow Edit | Allow Create | Insert at End | Insert If Empty |
|---|---|---|---|---|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | Yes/No | Yes/No | Yes/No | Yes/No |

**Action on Form Data Source Events (Validate, JumpRef, etc.):**

*Create Event Handler class for Data Source field events.*

| Field Name | Event / Method Name | Event Handler Class |
|---|---|---|
| `<TBD>` | `<TBD>` | `[PREFIX]<Form>Frm_EventHandler` |

**Design Controls:**

*Specify form design changes: new Tab, TabPage, Group, Grid, Button etc. Attach expected form design mockup.*

| Design Control Type | Parent | Control Name | Data Source | Caption | Auto Declaration | Configuration Key | Visible |
|---|---|---|---|---|---|---|---|
| `<Field\|Button\|Group>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | Yes/No | `<TBD>` | Yes/No |

**Action on Form Design Control Events (Lookup, Modify, Validate, Clicked, etc.):**

*Create Event Handler class for Form control events.*

| Control Name | Event / Method Name | Event Handler Class |
|---|---|---|
| `<TBD>` | `<TBD>` | `[PREFIX]<Form>Frm_EventHandler` |

---

*(Repeat sub-section for each additional form extension)*

---

### 5.3.2 Forms — New Forms

*Write `Not Applicable` if no new forms are required. Repeat Data Sources, Design Controls, and Event tables from §5.3.1 for each new form. Prefix name with `[PREFIX]<Module><Process>`.*

---

### 5.3.3 Menu Items — Menu Item Extensions

*Write `Not Applicable` if no menu item extensions are required.*

| Menu Item Name | Type | Object | Label | Extension Purpose |
|---|---|---|---|---|
| `<MenuItemName>.[PREFIX]Extension` | Display / Action / Output | `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.3.4 Menu Items — New Menu Items

*Write `Not Applicable` if no new menu items are required.*

| Menu Item Name | Type | Label | Object Type | Object | Configuration Key | Navigation Path |
|---|---|---|---|---|---|---|
| `[PREFIX]<Name>` | Display / Action / Output | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.3.5 Menu — Menu Extensions

*Write `Not Applicable` if no menu extensions are required.*

| Menu Name | Extension Name | Menu Items Added |
|---|---|---|
| `<TBD>` | `<MenuName>.[PREFIX]Extension` | `<TBD>` |

---

### 5.3.6 Menu — New Menus

*Write `Not Applicable` if no new menus are required.*

| Menu Name | Label | Set Company | Module | Menu Items |
|---|---|---|---|---|
| `[PREFIX]<Name>` | `<TBD>` | Yes/No | `<TBD>` | `<TBD>` |

---

## 5.4 Updates to Data Dictionary

### 5.4.1 Base Enums — Base Enum Extensions

*Write `Not Applicable` if no base enum extensions are required.*

| Enum Extension Name | Base Enum Value | Name | Label | Configuration Key |
|---|---|---|---|---|
| `<EnumName>.[PREFIX]Extension` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.4.2 Base Enums — New Base Enums

*Write `Not Applicable` if no new base enums are required.*

| Name | Base Enum Value | Label | Configuration Key |
|---|---|---|---|
| `[PREFIX]<Name>` | `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.4.3 Extended Data Types — New EDTs

*Write `Not Applicable` if no new EDTs are required.*

| Name | Type | Label | String Size | Configuration Key | Help Text | Enum Type |
|---|---|---|---|---|---|---|
| `[PREFIX]<Name>` | String / Enum / Int / Real | `<TBD>` | `<N or N/A>` | `<TBD>` | `<TBD>` | `<EnumName or N/A>` |

---

### 5.4.4 Queries — Query Extensions

*Write `Not Applicable` if no query extensions are required.*

| Query Extension Name | Extension Purpose | Data Source Added | Range Added |
|---|---|---|---|
| `<QueryName>.[PREFIX]Extension` | `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.4.5 Queries — New Queries

*Write `Not Applicable` if no new queries are required.*

| Query Name | Label | Data Source | Join Mode | Dynamic Fields | Range | Group By | Relations |
|---|---|---|---|---|---|---|---|
| `[PREFIX]<Name>` | `<TBD>` | `<TBD>` | `<TBD>` | Yes/No | `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.4.6 Views — View Extensions

*Write `Not Applicable` if no view extensions are required.*

| View Extension Name | Extension Purpose | Fields Added |
|---|---|---|
| `<ViewName>.[PREFIX]Extension` | `<TBD>` | `<TBD>` |

---

### 5.4.7 Views — New Views

*Write `Not Applicable` if no new views are required.*

| View Name | Label | Data Source | Dynamic Fields | Fields |
|---|---|---|---|---|
| `[PREFIX]<Name>` | `<TBD>` | `<TBD>` | Yes/No | `<TBD>` |

---

### 5.4.8 Data Entities — Data Entity Extensions

*Write `Not Applicable` if no data entity extensions are required.*

*(Object-ID: DEN-NNN — FDS §6.2.6)*

| Data Entity | Field | Change | Staging Table |
|---|---|---|---|
| `<EntityName>` | `<FieldName>` | `<e.g., Add field mapping>` | `<TBD>` |

Extension approach: `<Describe how the extension maps to the underlying table data source.>`

---

### 5.4.9 Data Entities — New Data Entities

*Write `Not Applicable` if no new data entities are required.*

*(Object-ID: DEN-NNN)*

| Attribute | Value |
|---|---|
| Name | `[PREFIX]<Name>_Entity` |
| Label | `<TBD>` |
| Entity Category | `<TBD>` |
| Data Management Enabled | Yes / No |
| Data Management Staging Table | `<TBD>` |
| Is Public | Yes / No |
| Public Collection Name | `<TBD>` |
| Public Entity Name | `<TBD>` |

| Data Source | Table | Join Mode | Ranges | Relations | Data Entity Field | Method |
|---|---|---|---|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.4.10 Tables — Table Extensions

*Repeat the following sub-section for each table extension. Write `Not Applicable` if no table extensions are required.*

---

#### Table Extension: `<TableName>.[PREFIX]Extension`

*(Object-ID: EXT-NNN — FDS Field Mapping §6.2.1)*

| Attribute | Value |
|---|---|
| Name | `<TableName>.[PREFIX]Extension` |
| Country / Region Code | N/A |
| Created By / Created Date Time | `<System>` |
| Form Ref | `<Form name this table is surfaced on>` |
| Modified By / Modified Date Time | `<System>` |

**Fields Added:**

| Name | Type | Extended Data Type | Allow Edit | Allow Edit on Create | Mandatory |
|---|---|---|---|---|---|
| `<FieldName>` | `<Enum / String / Int / Real / Date>` | `<EDT Name>` | Yes / No / Conditional | Yes / No | Yes / No |

**Field Groups:**

| Group Name | Label | Fields |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

**Indexes:**

| Index Name | Allow Duplicates | Alternate Key | Fields |
|---|---|---|---|
| `<TBD>` | Yes / No | Yes / No | `<TBD>` |

**Methods / Event Handlers:**

| Name | Description |
|---|---|
| Pre-Event Handler | Copy event handlers to class `[PREFIX]<Table>Dbt_EventHandler` |
| Post-Event Handler | Copy event handlers to class `[PREFIX]<Table>Dbt_EventHandler` |

**Relations:**

*(Describe all table relations here)*

---

*(Repeat sub-section for each additional table extension)*

---

### 5.4.11 Tables — New Tables

*Write `Not Applicable` if no new tables are required.*

*(Object-ID: EXT-NNN)*

#### Table: `[PREFIX]<TableName>`

| Attribute | Value |
|---|---|
| Name | `[PREFIX]<TableName>` |
| Label | `<TBD>` |
| Table Group | `<TBD>` |
| Cache Lookup | `<TBD>` |
| Replacement Key | `<TBD>` |
| Configuration Key | `<TBD>` |
| Primary Index | `<TBD>` |
| Title Field(s) | `<TBD>` |

**Fields:**

| Name | Type | Extended Data Type | Allow Edit | Allow Edit on Create | Mandatory |
|---|---|---|---|---|---|
| `<FieldName>` | `<TBD>` | `<TBD>` | Yes / No | Yes / No | Yes / No |

**Field Groups:**

| Group Name | Label | Fields |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

**Indexes:**

| Index Name | Allow Duplicates | Alternate Key | Fields |
|---|---|---|---|
| `<TBD>` | Yes / No | Yes / No | `<TBD>` |

**Methods:**

| Name | Signature / Description |
|---|---|
| `<TBD>` | `<TBD>` |

**Relations:**

*(Describe all table relations here)*

---

## 5.5 SSRS Reports

*Write `Not Applicable` if no SSRS reports are in scope.*

*(Object-ID: OPR-NNN or BDC-NNN)*

### 5.5.1 `[PREFIX]<ReportName>_Report`

Overview of SSRS report.

| Attribute | Value |
|---|---|
| Name | `[PREFIX]<Name>_Report` |
| Data Source Type | `<FetchXML / SQL / OData>` |
| Dataset Name | `<TBD>` |
| Query / RDP Class | `<TBD>` |
| Design Type | Precision / Auto |

---

## 5.6 Updates to Business Logic and Batch Jobs

*One sub-section per business logic or batch job class. Write `Not Applicable` if not applicable.*

### Class Summary

| Class Name | Purpose | Object Type |
|---|---|---|
| `[PREFIX]<ClassName>` | `<Purpose>` | New Class / CoC Extension / Event Handler / Batch Job |

---

### 5.6.1 Class: `[PREFIX]<ClassName>` / `[PREFIX]<ClassName>Cls_Extension`

*(Object-ID: EXT-NNN — FDS §6.2)*

| Property | Value |
|---|---|
| Class Name | `<TBD>` |
| Purpose | `<TBD>` |
| Object Type | New Class / Class Extension (CoC) / Event Handler / Batch Job |
| Base Class | `<TBD or RunBase for batch>` |
| Interfaces Implemented | `<TBD>` |
| Other References and Dependencies | `<Other objects this class uses>` |

#### Methods

*(Repeat the following block for each method)*

##### Method: `<methodName>`

- **Related FDS Flow:** §`<N.N>`
- **Summary:** `<What this method does>`
- **Parameters:** `<paramName (type) — purpose; flag ref/out/ByRef if applicable>`
- **Return:** `<type — description>`
- **Exception Handling:** `<What is caught, what is thrown, error message text>`
- **Pseudocode:**

```text
// pseudo-code
1. ...
2. ...
3. if <condition>
   a. throw error "<Exact error message text from FDS>"
4. ttsbegin
5.   <database write>
6. ttscommit
```

---

*(Repeat §5.6.1 sub-section for each additional class)*

---

## 5.7 Updates to Interface Logic

*Write `Not Applicable` if no integration classes are in scope.*

### 5.7.1 Class: `[PREFIX]<IntegrationClassName>`

*(Object-ID: INT-NNN — FDS §6.2.3)*

*(Repeat class metadata and method specification pattern from §5.6.1.)*

---

## 5.8 Business Process and Workflow

*Write `Not Applicable` if no workflow changes are in scope.*

*(Object-ID: WFL-NNN)*

Overview of workflow scope and trigger.

### 5.8.1 Workflow Categories — New Workflow Category

| Field | Value |
|---|---|
| Name | `[PREFIX]<Module>_<Name>_Workflow` |
| Label | `<TBD>` |
| Help Text | `<TBD>` |
| Module | `<TBD>` |

---

### 5.8.2 Workflow Approvals — New Workflow Approval

| Field | Value |
|---|---|
| Name | `<TBD>` |
| Label | `<TBD>` |
| Help Text | `<TBD>` |
| Canceled Event Handler | `<TBD>` |
| Delegate Menu Item | `<TBD>` |
| Document | `<TBD>` |
| Document Menu Item | `<TBD>` |
| Document Preview Field Group | `<TBD>` |
| Resubmit Menu Item | `<TBD>` |
| Started Event Handler | `<TBD>` |
| Work Item Created Event Handler | `<TBD>` |

**Outcomes — Approve**

| Action Menu Item | Event Handler |
|---|---|
| `<TBD>` | `<TBD>` |

**Outcomes — Deny**

| Action Menu Item | Event Handler |
|---|---|
| `<TBD>` | `<TBD>` |

**Outcomes — Reject**

| Action Menu Item | Event Handler |
|---|---|
| `<TBD>` | `<TBD>` |

**Outcomes — Request Change**

| Action Menu Item | Event Handler |
|---|---|
| `<TBD>` | `<TBD>` |

---

### 5.8.3 Workflow Types — New Workflow Type

| Field | Value |
|---|---|
| Name | `<TBD>` |
| Label | `<TBD>` |
| Help Text | `<TBD>` |
| Cancel Menu Item | `<TBD>` |
| Cancel Event Handler | `<TBD>` |
| Category | `<TBD>` |
| Completed Event Handler | `<TBD>` |
| Config Data Change Event Handler | `<TBD>` |
| Document | `<TBD>` |
| Document Menu Item | `<TBD>` |
| Started Event Handler | `<TBD>` |
| Submit to Workflow Menu Item | `<TBD>` |

**Supported Elements**

| Element Name | Type |
|---|---|
| `<TBD>` | `<TBD>` |

**Line Item Workflow**

| Field | Value |
|---|---|
| Label | `<TBD>` |
| Help Text | `<TBD>` |

---

## 5.9 Security and Configuration Design

*(Object-ID: EXT-NNN for Privilege/Duty, SEC-NNN for Roles)*

### 5.9.1 Overview

Describe security model impact: which roles are affected, what new access is granted, and any SoD risks. Reference FDS §6.4.

### 5.9.2 Security Privileges

*Write `Not Applicable` if no new privileges are required.*

| Field | Value |
|---|---|
| Name | `[PREFIX]<Name>_Privilege` |
| Label | `<TBD>` |

**Entry Points**

| Entry Point | Object Type | Object Name | Access Level |
|---|---|---|---|
| `<TBD>` | Form / Table / Report | `<TBD>` | View / Maintain / Full Control |

---

### 5.9.3 Security Duties

*Write `Not Applicable` if no new duties are required.*

| Field | Value |
|---|---|
| Name | `[PREFIX]<Name>_Duty` |
| Label | `<TBD>` |

**Privileges**

| Privilege Name |
|---|
| `<TBD>` |

---

## 5.10 Label Files

*Add a row for every new label introduced. Write `Not Applicable` if no new labels are required.*

| Language | Label File ID | Label ID | Text |
|---|---|---|---|
| EN | `<LabelFileID>` | `@<LabelFile>:<LabelID>` | `<English label text>` |

*(Add additional rows for each supported language)*

---

## 5.11 Interface Configuration / Design

*Write `Not Applicable` if no external interfaces are in scope.*

*(Object-ID: INT-NNN)*

### 5.11.1 Overview

| Field | Value |
|---|---|
| Source | `<TBD>` |
| Target | `<TBD>` |
| Integration Type | `<TBD>` |
| Integration Direction | Inbound / Outbound / Bidirectional |
| Pull or Push | `<TBD>` |
| Trigger Event | `<TBD>` |
| Triggered By | `<TBD>` |
| Data Format | JSON / XML / Flat File |
| Sample File | `<TBD>` |
| Response Type | `<TBD>` |
| Frequency | `<TBD>` |
| Schedule Time | `<TBD>` |
| Expected Data Volume | `<TBD>` |
| Expected Payload Size | `<TBD>` |

---

### 5.11.2 Azure Resources

**Logic Apps**

*Middleware components created per environment under the appropriate resource group.*

| Name | Direction | Middleware Type | Resource Group |
|---|---|---|---|
| `<TBD>` | Inbound / Outbound | Azure Logic App | `<TBD>` |

**Function Apps**

| Function Name | Purpose | Methods |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

**Data Factory**

| Pipeline Name | Lookup Activity | Data Flow | Copy Data Activity | Azure Function | Notes |
|---|---|---|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` | `<TBD>` |

**Storage Account / Data Lake**

| Name | Setting | Value |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.11.3 Configuration

**Azure Key Vault**

| Key Vault Name | Secret Name | Configuration Details |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

**App Registration**

| App Registration Name | Client ID | Purpose |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

**Global Settings**

| Setting | Value | Comments |
|---|---|---|
| ConnectionString | TBD | `<TBD>` |

---

### 5.11.4 Authentication and Authorisation

**Authentication**

*App registrations or service accounts will be created per environment.*

| Component | Authentication Mechanism | App Registration | Purpose |
|---|---|---|---|
| `<TBD>` | Azure AD Service Principal | `<TBD>` | `<TBD>` |

**Authorisation**

| Component | Authorised User / Group | Comments |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

---

### 5.11.5 Error Handling and Logging

**Error Handling & Notifications**

| Scenario | Error Code | Error Description | Notify? | Steps to Rectify |
|---|---|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` | Yes / No | `<TBD>` |

**Monitoring and Logging**

| Component | Monitoring | Logging |
|---|---|---|
| `<TBD>` | `<TBD>` | `<TBD>` |

---

## 5.12 Issues / Open Items

List all TBDs, open decisions, and blockers discovered during design.

| ID | Description | Section | Owner | Target Date | Status |
|---|---|---|---|---|---|
| OI-001 | `<TBD>` | `<5.N>` | `<TBD>` | `<TBD>` | Open |

---

## 5.13 Authentication

Describe authentication mechanism for the solution. If standard D365 F&O authentication applies with no additional requirements, state: "Standard D365 F&O authentication. No additional authentication mechanisms introduced."

`<Description or N/A>`

---

## 5.14 Data Encryption

Describe data encryption requirements. If standard D365 F&O encryption at rest and in transit applies with no additional requirements, state: "Standard D365 F&O encryption at rest and in transit. No additional encryption requirements introduced."

`<Description or N/A>`

---

# 6. System Configuration Specification

## 6.1 Production Environment Configuration

Describe infrastructure / runtime configuration or reference controlled infrastructure documentation.

`<TBD — reference program infrastructure document>`

## 6.2 Validation Environment Configuration

Describe validation environment specifics (applicable if GxP / CSV validation is in scope).

`<TBD — reference program infrastructure document>`

---

# 7. Data Interfacing: End-to-End Steps and Operational Status

Describe the end-to-end data flow and monitoring checkpoints for each integration. State "Not Applicable" if no external interfaces are in scope.

`<Not Applicable or integration flow description>`

---

# 8. Initialising of Data

Describe initial data load, cutover approach, backfill requirements, and reconciliation method. Note any records that must be backfilled before the solution can be enabled in production.

`<TBD or Not Applicable>`

---

# 9. Overall or Additional Design Specifications

Add any project-specific design elements not covered above (e.g., localisation, batch recurrence configuration, print management setup).

`<TBD or Not Applicable>`

---

## Quality Checklist

### Formatting
- [ ] All tables properly formatted
- [ ] All headings numbered correctly
- [ ] Version History table filled
- [ ] Sign-off table present
- [ ] Reference Documents table completed with URLs / paths

### Content Completeness
- [ ] All mandatory main sections (1–9) present — none skipped
- [ ] All TBDs logged to §5.12 Issues / Open Items
- [ ] Sections / sub-sections with no data show `Not Applicable` — not blank, not empty table
- [ ] No empty tables rendered anywhere in the document
- [ ] Screenshots included where required (§5.2 Presentation Layers, §5.3 Form Design mockups)

### Section-by-Section
- [ ] §1.2 URS ID and L3/L4 Process populated
- [ ] §2.1.1 Current Business Process — full end-to-end As-Is, not a single sentence
- [ ] §2.1.2 Rationale — specific limitation + rejected alternatives documented
- [ ] §2.1.3 Key Technical Decisions — numbered, each has Decision / Options / Rationale / Risk
- [ ] §2.1.4 Assumptions and Dependencies — two separate numbered lists
- [ ] §5.3.1 Form Extensions — all 4 sub-tables per extension (Data Sources, DS Events, Design Controls, Control Events)
- [ ] §5.3.2 New Forms — same 4 sub-tables per form
- [ ] §5.3.3–§5.3.6 Menu Items and Menus — all required fields populated or `Not Applicable`
- [ ] §5.4.1–§5.4.2 Base Enums — Name + enum values table
- [ ] §5.4.3 EDTs — 7-column table complete
- [ ] §5.4.4–§5.4.5 Queries — Data source details populated
- [ ] §5.4.6–§5.4.7 Views — Data source details populated
- [ ] §5.4.8 Data Entity Extensions — Field + Change + Staging Table columns complete
- [ ] §5.4.9 New Data Entities — header metadata + data source table both populated
- [ ] §5.4.10 Table Extensions — Fields, Field Groups, Indexes, Methods (Pre/Post handlers), Relations
- [ ] §5.4.11 New Tables — all attribute metadata + Fields, Field Groups, Indexes, Methods, Relations
- [ ] §5.5 SSRS Reports — Name, Data Source Type, Dataset, Query/RDP, Design Type
- [ ] §5.6 / §5.7 Classes — full method blocks with FDS Flow, Summary, Parameters, Exception Handling, Return, Pseudocode
- [ ] §5.8.1 Workflow Categories — Name, Label, Help Text, Module
- [ ] §5.8.2 Workflow Approvals — all 11 metadata fields + 4 Outcome blocks (Approve / Deny / Reject / Request Change)
- [ ] §5.8.3 Workflow Types — all 12 metadata fields + Supported Elements + Line Item Workflow
- [ ] §5.9.1 Security Overview — present and references FDS §6.4
- [ ] §5.9.2 Security Privileges — Name/Label + Entry Points table
- [ ] §5.9.3 Security Duties — Name/Label + Privileges table
- [ ] §5.10 Label Files — Language, Label File ID, Label ID, Text for all new labels
- [ ] §5.11.1 Interface Overview — all 14 fields populated
- [ ] §5.11.2 Azure Resources — Logic Apps, Function Apps, Data Factory, Storage Account (all applicable)
- [ ] §5.11.3 Configuration — Key Vault, App Registration, Global Settings
- [ ] §5.11.4 Authentication + Authorisation tables
- [ ] §5.11.5 Error Handling scenarios + Monitoring / Logging table
- [ ] §5.12 Issues — all open items captured with ID, owner, target date
- [ ] §5.13 Authentication — stated or "Standard D365 F&O"
- [ ] §5.14 Data Encryption — stated or "Standard D365 F&O"
- [ ] §6–§9 — populated or `Not Applicable`

### Naming Conventions
- [ ] Correct project prefix used throughout (from `constitution/03-extension-coding-standards.md`)
- [ ] Solution / Project: `[PREFIX]_<FDDFileName>`
- [ ] Event Handlers: `[PREFIX]<ObjectName><TypeAbb>_EventHandler`
- [ ] Metadata Extensions: `Object.[PREFIX]Extension`
- [ ] Code Extensions (CoC): `[PREFIX]<ObjectName><TypeAbb>_Extension`
- [ ] New Tables / Forms / Classes / Enums / EDTs: `[PREFIX]<ModuleName><ProcessName>` (no underscore)
- [ ] Table fields: no prefix, standard D365 naming
- [ ] Table methods: camelCase starting with lowercase
- [ ] Type abbreviations correct: Dbt · Frm · Cls · Map · DE · DS · Fld · Ctrl
- [ ] No spaces in object names (PascalCase)
- [ ] Consistent prefix throughout entire solution

### Technical Accuracy
- [ ] All technical specifications complete and accurate
- [ ] All table structures properly defined
- [ ] All relationships and dependencies documented
- [ ] Event Handler classes properly specified
- [ ] Extension patterns correctly applied (CoC vs Event Handler)
- [ ] Interface specifications complete (if applicable)
- [ ] Security and workflow configurations detailed (if applicable)
- [ ] No prohibited X++ patterns used
- [ ] Performance considerations addressed for Complex / Very Complex objects
