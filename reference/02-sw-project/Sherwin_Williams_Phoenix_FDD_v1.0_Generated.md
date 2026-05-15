# Functional Design Document (FDD)
# Sherwin-Williams Phoenix CRM Implementation
# Microsoft Dynamics 365 Customer Engagement

---

## Document Information

| Property | Value |
|---|---|
| Document Title | Functional Design Document - Sherwin-Williams Phoenix CRM Implementation |
| Project Name | Phoenix - Dynamics 365 CRM Rollout |
| Document Version | 0.1 |
| Authors | TBD |
| Status | Draft |
| Last Updated | March 11, 2026 |
| Location | TBD |

---

## History

| Version | Date | Modified By | Description of Changes |
|---|---|---|---|
| 0.1 | March 11, 2026 | Business Analyst | Initial Draft |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

---

## Document Review and Sign-off

| Role | Name | Signature | Date |
|---|---|---|---|
| Business Analyst | TBD | TBD | TBD |
| Technical Lead | TBD | TBD | TBD |
| Business Stakeholder | TBD | TBD | TBD |
| Project Manager | TBD | TBD | TBD |

---

## Document References

| Reference # | Document Title | Location | Version |
|---|---|---|---|
| REF-001 | SW PHX - D365 Data Model - In Progress.xlsx | SharePoint | Latest |
| REF-002 | Sherwin_ITR1 Stories | Jira/SharePoint | 10-Mar-2026 |
| REF-003 | TBD | TBD | TBD |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Functional System Process Design](#2-functional-system-process-design)
3. [User Scenarios](#3-user-scenarios)
4. [User Interface Design](#4-user-interface-design)
5. [Reports and Dashboards](#5-reports-and-dashboards)
6. [Application Security](#6-application-security)
7. [Entity Model](#7-entity-model)
8. [Solution Reference Data](#8-solution-reference-data)

---

## 1. Introduction

### 1.1 Document Purpose

This Functional Design Document (FDD) provides detailed functional specifications for the Sherwin-Williams Phoenix CRM implementation using Microsoft Dynamics 365 Customer Engagement platform and serves as the primary reference for development, configuration, and testing teams to understand the business requirements and system behavior expected in the solution.

### 1.2 Project Background

Sherwin-Williams is implementing a Microsoft Dynamics 365 CRM solution as part of the Phoenix program to modernize and consolidate sales operations across multiple business units including Performance Coatings Group (PCG) and Consumer Brands Group (CBG). The implementation will support account management, contact management, territory management, and opportunities tracking for sales representatives and managers across various divisions and regions. The scope of integration with existing ERP systems and domain sources is still under review with the integration team, and the go-live date is yet to be finalized pending completion of iteration planning sessions and stakeholder sign-off on core requirements.

---

## 2. Functional System Process Design

### 2.1 High-Level System Process

The Phoenix CRM solution enables sales teams to manage the complete customer lifecycle from lead capture and qualification through account management, contact relationship tracking, opportunity pursuit, quote management, and activity management. The system supports both integrated accounts from ERP/domain systems and manually-created records for prospects and non-ERP customers, with distinct workflows and validation rules for each. Key processes include lead onboarding and qualification, account creation and categorization, contact management, opportunity management, quote management, activity tracking, and account hierarchy visualization.

**Key Business Process Flows:**

The following end-to-end business process flows are documented with detailed process diagrams (refer to Key_Business_Process_Flows.md for visual diagrams):

1. **Lead Management Process Flow** - Lead creation through qualification/disqualification
2. **Opportunity Management Process Flow** - Opportunity creation through close (won/lost)
3. **Quote Management Process Flow** - Quote creation, approval, and finalization
4. **Case Management Process Flow** - Customer service case handling (Future Iteration)
5. **Quality Investigation Process Flow** - Product quality issue investigation (Future Iteration)
6. **Settlement Process Flow** - Financial settlement processing (Future Iteration)

*Note: Case Management, Quality Investigation, and Settlement processes are documented for reference but are out of scope for Iteration 1. Focus for current iteration is on Sales processes (Lead, Opportunity, Quote).*

**High-Level Process Flow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Lead      │────>│  Account &  │────>│ Opportunity │────>│    Quote    │
│  Creation   │     │   Contact   │     │  Creation   │     │  Creation   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │                    │
      v                    v                    v                    v
  Qualify/            Manage              Sales Process          Close/Win
 Disqualify          Activities            (BPF Stages)
```

### 2.2 Detailed System Processes

#### 2.2.1 **Lead Management** Process

**Process Summary**

Leads enter the CRM system through multiple channels including web forms, manual entry by sales reps, campaign responses, and external integrations, then progress through qualification stages tracked via Business Process Flow before conversion to Account, Contact, and optionally Opportunity records. Sales reps assess lead quality, log qualification activities, and either qualify the lead to create an Account/Contact or disqualify with a reason code.

**Process Diagram**

Refer to **Key_Business_Process_Flows.md - Section 1: Lead Management Process Flow** for detailed process diagram showing:
- Lead creation channels (Web Form, Manual Entry, Integration, Campaign)
- Lead qualification activities and Business Process Flow stages
- Qualification decision point (Qualify vs Disqualify)
- Account and Contact creation on qualification
- Optional Opportunity creation
- Lead status updates and activity tracking per PHX-1354, PHX-357

**Expected Input**

- Web form submission with lead details (PHX-1354)
- Manual lead entry by sales rep (PHX-84, PHX-92)
- Lead Source value from master data
- Lead qualification activities (calls, emails, tasks) (PHX-1354, PHX-99)
- Disqualification reason if lead is not viable (PHX-112)

**Expected Output**

- Lead record created in D365 with Status = Active (PHX-357)
- Activity history logged against lead record (PHX-1354, PHX-99, PHX-381)
- Lead qualified → Account + Contact created (PHX-84)
- Lead disqualified → Status changed with reason code (PHX-112)
- Duplicate detection warnings if potential duplicates found (PHX-71)

**Steps**

| Step # | Step Description | Actor | System Action |
|---|---|---|---|
| 1 | Lead data received from web form OR Sales Rep navigates to Leads area and clicks "+ New Lead" | Integration / Sales Rep | System receives lead data or displays blank Lead form |
| 2 | Sales Rep completes required fields (Topic, Last Name, Company Name, Email) | Sales Rep | System validates required fields per PHX-362 pattern |
| 3 | Sales Rep logs qualification activities (calls, meetings, tasks) on Lead record | Sales Rep | Activities created and tracked in Activity Timeline per PHX-1354, PHX-99 |
| 4 | Sales Rep progresses Lead through BPF stages (Qualify → Research) | Sales Rep | BPF advances; Status updated per PHX-357 |
| 5 | Sales Rep clicks "Qualify" button to convert Lead OR "Disqualify" button to mark unviable | Sales Rep | System displays either Qualify form (creates Account/Contact) or Disqualify dialog (requires reason) per PHX-112 |
| 6 | Lead qualification completes → Account and Contact created in D365 | System | Account record created per PHX-84; Contact record created per PHX-92; Lead Status = Qualified |

**Alternative Process / Exceptions**

- **Exception 1**: Duplicate lead detected based on Email + Company Name matching — system displays warning dialog with potential duplicates; user can proceed or cancel per PHX-71, PHX-91
- **Exception 2**: Required field missing on lead creation — system displays error message and prevents save per PHX-362
- **Exception 3**: Disqualify without reason — system requires Status Reason selection before disqualification can complete per PHX-112

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What is the exact duplicate detection matching logic for Lead Email and Company Name fields? | TBD | TBD |
| 2 | Should duplicate detection run on save (synchronous) or as a background process (asynchronous)? | TBD | TBD |
| 3 | What are the complete BPF stages and steps for Lead Qualification Process? Only Qualify and Research mentioned in template. | TBD | TBD |

---

#### 2.2.2 **Account On-Boarding** Process

**Process Summary**

Accounts enter the CRM system via two primary paths: integration from domain/ERP systems for existing customers with active transactions (PHX-88) or manual creation by sales reps for prospects and non-ERP accounts that require quoting capabilities (PHX-84). Both integrated and non-integrated accounts follow distinct data validation and field population rules based on account record type (PHX-76).

**Process Diagram**

*[Process Diagram – To Be Inserted]*

**Expected Input**

- Domain/ERP system account payload (integrated accounts) including Account Number, Account Name, Address, Division, Territory Assignment
- Manual data entry from Sales Rep (non-integrated accounts) including Company Name, Contact Information, Classification
- Account Source master data indicating origin system
- Data Source master data indicating integrated vs non-integrated status

**Expected Output**

- Account record created in D365 with appropriate Account Record Type (Integrated / Non-Integrated)
- Account Status set to Active by default
- Owner populated from territory assignment (integrated) or manual assignment (non-integrated)
- Data Source field populated indicating origin
- Account views refreshed to include new record

**Steps**

| Step # | Step Description | Actor | System Action |
|---|---|---|---|
| 1 | Account data received from integration payload OR Sales Rep navigates to Account area and clicks "+ New Account" | Integration Service / Sales Rep | System receives account data or displays blank Account form |
| 2 | System validates required fields based on Account Record Type and populates Account Number (integrated only) | System | Required field validation fires; Account Number populated for integrated accounts; remains blank for manual |
| 3 | Sales Rep completes required fields (Account Name, Classification, Segmentation, etc.) OR integration payload populates fields | Sales Rep / Integration Service | System populates fields from payload or user input |
| 4 | Account saved | Sales Rep / System | Account record committed to database; Account Status = Active; Owner assigned based on territory or user session |

**Alternative Process / Exceptions**

- **Exception 1**: Duplicate Account detected — system should flag potential duplicate based on Account Name and Address matching logic (duplicate detection rules TBD)
- **Exception 2**: Required field missing on manual account creation — system displays error message and prevents save until required fields populated
- **Exception 3**: Integration payload contains invalid or null data for required field — error logged to integration monitoring dashboard; account creation fails and requires data correction at source

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What is the exact duplicate detection matching logic for Account Name and Address fields? | TBD | TBD |
| 2 | Should duplicate detection run on save or as a background process? | TBD | TBD |
| 3 | What business rules determine territory assignment for manually created accounts? | TBD | TBD |

---

#### 2.2.3 **Contact Management** Process

**Process Summary**

Contacts are created and managed as relationship records under Account entities, serving as key decision-makers, influencers, and stakeholders in customer organizations. Sales reps create Contact records manually during lead qualification or account management activities, designate Primary Contacts for each Account, track training enrollment status for CBG business units, and manage Contact lifecycle states including activation, deactivation, and deletion (PHX-92, PHX-93, PHX-94, PHX-368, PHX-366, PHX-362).

**Process Diagram**

*[Process Diagram – To Be Inserted]*

**Expected Input**

- Contact First Name, Last Name (required) (PHX-362)
- Parent Account relationship (required) (PHX-92)
- Email Address (required for primary contacts) (PHX-362)
- Phone Number (PHX-362)
- Primary Contact flag (boolean) (PHX-368)
- Training Enrollment flag (boolean – CBG specific) (PHX-366)
- Contact Status (Active/Inactive) (PHX-369)

**Expected Output**

- Contact record created in D365 under parent Account (PHX-92)
- Contact appears on Account's "Contacts" subgrid
- Only one Contact marked as Primary per Account (PHX-368)
- Contact Status set to Active by default (PHX-369)
- Duplicate detection warnings if potential duplicates found (PHX-91)

**Steps**

| Step # | Step Description | Actor | System Action |
|---|---|---|---|
| 1 | Sales Rep navigates to Account record and clicks "+ New Contact" on Contacts subgrid OR qualifies Lead to create Contact | Sales Rep | System displays blank Contact form with Parent Account pre-populated |
| 2 | Sales Rep completes required fields (First Name, Last Name, Email, Phone) | Sales Rep | System validates required fields per PHX-362 |
| 3 | Sales Rep checks "Primary Contact" checkbox if this Contact is main decision-maker | Sales Rep | System validates only one Primary Contact per Account per PHX-368 |
| 4 | Sales Rep checks "Training Enrollment" if Contact is enrolled in CBG training programs | Sales Rep | System saves flag per PHX-366 |
| 5 | Sales Rep clicks "Save" button | Sales Rep | System runs duplicate detection on Email + Last Name per PHX-91 |
| 6 | Contact record created; appears in Account Contacts subgrid | System | Contact Status = Active per PHX-369 |

**Alternative Process / Exceptions**

- **Exception 1**: Duplicate Contact detected based on Email + Last Name matching — system displays warning dialog with potential duplicates; user can proceed or cancel per PHX-91
- **Exception 2**: User attempts to mark second Contact as Primary when another Primary Contact already exists for Account — system displays error message "Only one Primary Contact allowed per Account" per PHX-368
- **Exception 3**: Required field missing on Contact creation — system displays error message and prevents save per PHX-362

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Should the system automatically unmark existing Primary Contact when a new Contact is marked Primary, or should it prevent marking until user manually unmarks the old Primary? | TBD | TBD |
| 2 | What are the complete business rules for Training Enrollment flag? Is it editable by all users or only specific roles? | TBD | TBD |
| 3 | Should Contact deactivation cascade from parent Account deactivation automatically per PHX-86? | TBD | TBD |

---

#### 2.2.4 **Activity Management** Process

**Process Summary**

Activities (Tasks, Phone Calls, Appointments, Emails) are core to tracking sales interactions and customer engagement across Leads, Accounts, Contacts, and Opportunities. Sales reps create and update activities to log customer interactions, schedule follow-ups, and maintain engagement history visible in Activity Timeline controls on entity forms (PHX-99, PHX-69, PHX-381, PHX-1354).

**Process Diagram**

*[Process Diagram – To Be Inserted]*

**Expected Input**

- Activity Type (Task, Phone Call, Appointment, Email) (PHX-99)
- Subject (required) (PHX-99)
- Due Date/Time (required for Tasks and Appointments) (PHX-99)
- Regarding entity (Lead, Account, Contact, Opportunity) (PHX-1354)
- Activity Status (Open, Completed, Cancelled) (PHX-381)
- Description/Notes (PHX-99)

**Expected Output**

- Activity record created in D365 (PHX-99)
- Activity appears in Activity Timeline of related entity (Lead, Account, Contact, Opportunity) (PHX-1354)
- Activity Status set to Open by default (PHX-381)
- Activity reflected in Sales Rep's "My Activities" view

**Steps**

| Step # | Step Description | Actor | System Action |
|---|---|---|---|
| 1 | Sales Rep navigates to entity record (Lead/Account/Contact/Opportunity) and clicks "+ New Activity" button on Timeline control | Sales Rep | System displays Activity Quick Create form |
| 2 | Sales Rep selects Activity Type (Task, Phone Call, Appointment, Email) | Sales Rep | System displays type-specific fields |
| 3 | Sales Rep completes required fields (Subject, Due Date, Description) | Sales Rep | System validates required fields per PHX-99 |
| 4 | Sales Rep clicks "Save" button | Sales Rep | Activity record created with Status = Open per PHX-381 |
| 5 | Activity appears in entity's Activity Timeline | System | Timeline refreshed to show new activity per PHX-1354 |
| 6 | Sales Rep completes activity by clicking "Mark Complete" button OR updates Status to Completed | Sales Rep | Activity Status changes to Completed per PHX-381; Actual Duration populated |

**Alternative Process / Exceptions**

- **Exception 1**: Required field missing on Activity creation — system displays error message and prevents save per PHX-99
- **Exception 2**: User attempts to mark Activity as Completed without updating Actual Duration — system auto-populates Actual Duration based on Due Date and Completed Date
- **Exception 3**: Activity created without Regarding entity — activity saved but not related to any Lead/Account/Contact/Opportunity (orphan activity)

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What is the complete list of standard Activity Types for Sherwin-Williams? Are custom activity types required? | TBD | TBD |
| 2 | Should Activity Status values be standardized across all activity types per PHX-381, or can they vary by type? | TBD | TBD |
| 3 | What field-level security is required for Activities? Can all sales roles view all activities or only those they own? | TBD | TBD |

---

#### 2.2.5 **Account Deactivation and Lifecycle Management** Process

**Process Summary**

Accounts progress through lifecycle states (Active/Inactive) based on business conditions including manual deactivation by sales reps, integration status updates from ERP systems, and automated compliance rules. Account deactivation can trigger cascading deactivation of related Contact records to maintain data integrity (PHX-85, PHX-86, PHX-88, PHX-79).

**Process Diagram**

*[Process Diagram – To Be Inserted]*

**Expected Input**

- Account Status change request (manual or integration-driven) (PHX-85, PHX-88)
- Status Reason value (e.g., "Out of Business", "Duplicate", "Consolidated") (PHX-85)
- Integration account status payload from ERP (PHX-88)
- Business rule: cascade deactivation to Contacts (Y/N) (PHX-86)

**Expected Output**

- Account Status changed to Inactive (PHX-85)
- Account Status Reason populated (PHX-85)
- Status Change Date captured in system (PHX-79)
- Related Contacts deactivated if cascade rule applies (PHX-86)
- Account excluded from "My Active Accounts" view; appears in "My Inactive Accounts" view (PHX-79)

**Steps**

| Step # | Step Description | Actor | System Action |
|---|---|---|---|
| 1 | Sales Rep navigates to Account record and clicks "Deactivate" button OR integration payload updates Account Status = Inactive | Sales Rep / Integration Service | System displays Deactivate Account dialog requesting Status Reason |
| 2 | Sales Rep selects Status Reason from dropdown (e.g., "Out of Business") | Sales Rep | System validates Status Reason required per PHX-85 |
| 3 | Sales Rep confirms deactivation | Sales Rep | System changes Account Status = Inactive; updates Status Reason; logs timestamp per PHX-79 |
| 4 | System evaluates cascading deactivation rule for Contacts | System | If Account was manually created (not integrated), system deactivates all related Contacts per PHX-86 |
| 5 | Account excluded from active views; appears in inactive views | System | "My Active Accounts" view excludes record; "My Inactive Accounts" view includes record per PHX-79 |

**Alternative Process / Exceptions**

- **Exception 1**: User attempts to deactivate Account without selecting Status Reason — system displays error message "Status Reason is required" per PHX-85
- **Exception 2**: Account has open Opportunities — system displays warning "Deactivating this Account will not close related Opportunities. Please close Opportunities manually before deactivating."
- **Exception 3**: Integrated Account status updated from ERP to Inactive — system updates CRM Account Status to match; does NOT cascade to Contacts per PHX-86 (cascade only applies to manually created accounts)

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What are the complete Status Reason values for Account Inactive status? | TBD | TBD |
| 2 | Should Account Reactivation be allowed? If yes, should it reactivate previously deactivated Contacts? | TBD | TBD |
| 3 | Should deactivation cascade to Opportunities (mark as Lost) and Quotes (mark as Cancelled)? | TBD | TBD |

---

#### 2.2.6 **Opportunity Management** Process

**Process Summary**

Opportunities represent potential sales deals associated with Accounts and are managed through a structured sales process with defined stages from qualification through close (won or lost). Sales reps create Opportunity records when qualified leads or existing customers show purchase intent, progress opportunities through Business Process Flow stages (Qualify, Develop, Propose, Close), generate quotes, and ultimately close opportunities as Won (with actual revenue captured) or Lost (with reason code documented). The process supports pipeline visibility, revenue forecasting, and win/loss analysis (PHX-1608, PHX-1570).

**Process Diagram**

Refer to **Key_Business_Process_Flows.md - Section 2: Opportunity Management Process Flow** for detailed process diagram showing:
- Opportunity creation from qualified Lead or existing Account
- Business Process Flow stages: Qualify → Develop → Propose → Close
- Stakeholder management (Primary Contact and additional decision makers)
- Quote generation from Opportunity
- Pipeline stage progression with probability updates
- Close as Won (capture actual revenue) or Close as Lost (capture loss reason)
- Integration points with Quote Management process

**Expected Input**

- Parent Account (required) - Opportunity must be associated with Account
- Primary Contact (optional) - Key decision maker for the opportunity
- Opportunity Topic/Name (required)
- Estimated Revenue (optional) - Potential deal value
- Estimated Close Date (required) - Expected close timeframe
- Currency (required) - Default to organization base currency; supports multi-currency per PHX-1514, PHX-1963
- Sales Stage (required) - Current stage in sales process

**Expected Output**

- Opportunity record created in D365 with Status = Open
- Opportunity appears in sales pipeline views and reports
- Business Process Flow initiated with first stage active
- Opportunity can generate Quote records (1:N relationship)
- On Close as Won: Status = Won, Actual Revenue populated, Actual Close Date captured
- On Close as Lost: Status = Lost, Status Reason selected (Out-Sold, Canceled, etc.)

**Steps**

| Step # | Step Description | Actor | System Action |
|---|---|---|---|
| 1 | Sales Rep navigates to Opportunities area and clicks "+ New Opportunity" OR converts qualified Lead to Opportunity | Sales Rep | System displays blank Opportunity form or pre-populates from Lead data |
| 2 | Sales Rep completes required fields (Topic, Parent Account, Estimated Close Date) | Sales Rep | System validates required fields; BPF bar appears at top of form |
| 3 | Sales Rep progresses through BPF stages (Qualify → Develop → Propose → Close) | Sales Rep | BPF advances; Sales Stage field updates; Probability may auto-update based on stage |
| 4 | Sales Rep generates Quote from Opportunity by clicking "Create Quote" button | Sales Rep | System creates Quote record linked to Opportunity; navigates to Quote form |
| 5 | Sales Rep clicks "Close as Won" button when deal is secured | Sales Rep | System displays Close Opportunity dialog requesting Actual Revenue and Actual Close Date |
| 6 | Opportunity Status changes to Won; marked as closed | System | Opportunity excluded from Open Opportunities view; included in Won Opportunities view and revenue reports |

**Alternative Process / Exceptions**

- **Exception 1**: Sales Rep clicks "Close as Lost" — system displays Close Opportunity dialog requesting Status Reason (Out-Sold, Canceled, Lost to Competitor, No Decision)
- **Exception 2**: User attempts to close Opportunity without completing all required BPF stages — system displays warning but allows user to proceed (BPF is advisory, not enforcing)
- **Exception 3**: Opportunity has open Quotes — system displays informational message "This Opportunity has active Quotes. Closing the Opportunity will not automatically close Quotes."

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What are the complete BPF stages for Opportunity Sales Process? Template shows Qualify, Develop, Propose, Close. (Refer to Key_Business_Process_Flows.md) | TBD | TBD |
| 2 | Should Probability auto-update based on Sales Stage, or is it manually entered? | TBD | TBD |
| 3 | What are the complete Status Reason values for Lost opportunities? | TBD | TBD |
| 4 | Should closing Opportunity as Lost automatically close related Quotes? | TBD | TBD |

---

#### 2.2.7 **Quote Management** Process

**Process Summary**

Quotes represent formal price quotations generated for Opportunities or directly for Accounts (for non-opportunity-based quoting scenarios). Sales reps create Quote records with product/service line items, apply pricing and discounts, submit quotes for approval if required, activate quotes to share with customers, and track quote outcomes (Won, Closed, or Revised). The quote process integrates with product catalog, pricing rules, discount structures, and approval workflows. Quotes can be generated as PDF documents for customer distribution (PHX-1619, PHX-1573).

**Process Diagram**

Refer to **Key_Business_Process_Flows.md - Section 3: Quote Management Process Flow** for detailed process diagram showing:
- Quote creation from Opportunity or directly from Account
- Quote line item configuration (Products, Quantity, Pricing, Discounts)
- Draft → Active → Won/Closed status progression
- Approval workflow (if quote amount exceeds threshold)
- Quote activation and PDF generation for customer delivery
- Quote acceptance (Won) or rejection (Closed)
- Quote revision process (create new quote version)
- Integration with Opportunity close process

**Expected Input**

- Account (required) - Quote must be associated with Account
- Opportunity (optional) - Quote can be linked to Opportunity or standalone
- Contact (optional) - Primary Contact receiving the quote
- Quote Name (required) - Often auto-generated
- Currency (required) - Default to organization base currency; supports multi-currency per PHX-1514, PHX-1963
- Product line items (Quote Products) - Products/services, quantities, unit prices, discounts
- Effective From / Effective To dates (optional) - Quote validity period

**Expected Output**

- Quote record created in D365 with Status = Draft
- Quote Products (line items) added to quote
- Total Amount calculated automatically from line items
- Quote PDF document generated on activation
- On Activate: Status = Active, quote becomes read-only except for status changes
- On Close as Won: Status = Won, Opportunity (if linked) can be closed as Won
- On Close: Status = Closed (rejected or cancelled)

**Steps**

| Step # | Step Description | Actor | System Action |
|---|---|---|---|
| 1 | Sales Rep navigates to Opportunity record and clicks "Create Quote" button OR creates Quote directly from Quotes area | Sales Rep | System displays blank Quote form with Account and Opportunity pre-populated (if from Opportunity) |
| 2 | Sales Rep completes Quote header fields (Name, Effective dates) | Sales Rep | System validates required fields |
| 3 | Sales Rep adds Quote Products (line items) by clicking "+ Add Product" | Sales Rep | System displays Product search dialog; sales rep selects products and enters quantity, unit price, discount |
| 4 | System calculates Total Amount based on quote line items | System | Total Amount = Sum(Line Item Amounts) - Total Discount + Freight + Tax |
| 5 | Sales Rep clicks "Activate Quote" button to finalize quote | Sales Rep | System validates quote completeness; changes Status = Active; quote becomes read-only; generates PDF document |
| 6 | Sales Rep shares Quote PDF with customer via email or in-person | Sales Rep | Manual step; Activity (Email) logged in D365 |
| 7 | Customer accepts quote - Sales Rep clicks "Close as Won" OR Customer rejects - Sales Rep clicks "Close" | Sales Rep | System updates Quote Status = Won or Closed; won quotes can trigger Opportunity close as Won |

**Alternative Process / Exceptions**

- **Exception 1**: Quote requires approval (amount exceeds threshold) — system routes quote through approval workflow before activation; Sales Manager reviews and approves/rejects
- **Exception 2**: Customer requests changes to quote — Sales Rep revises quote by creating new Quote record (new version) linked to same Opportunity or by editing Draft quote before activation
- **Exception 3**: Quote expires (current date > Effective To date) — system displays warning; sales rep must extend Effective To date or create new quote

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What are the approval thresholds for Quote approval workflow? (e.g., quotes over $100k require manager approval) | TBD | TBD |
| 2 | How is quote versioning handled? System-generated version numbers or manual naming convention? | TBD | TBD |
| 3 | Should quote PDF generation be automatic on Activate or manual button click? | TBD | TBD |
| 4 | What product catalog integration is required for Quote line items? Is product pricing pulled from price lists? | TBD | TBD |

---

## 3. User Scenarios

### 3.1 User Scenario 1 – Create a Non-Integrated Account and Capture Categorization Fields

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Account Creation |
| User Role/Actor | Sales Representative |
| Type | Manual with system interface |
| Interfaces involved | D365 CRM, TBD (integration source system) |

**Narrative**

A Sales Representative receives information about a new prospect or existing customer who is not yet in the ERP system but requires a quote or relationship tracking in CRM. The rep navigates to the Accounts area in Dynamics 365 and clicks the "+ New" button to open a blank Account form. The system presents the Account Main Form with all fields editable since this is a non-integrated account. The rep enters the Account Name which is a required field, then selects values from the Classification lookup (options include End-User, Coil Coater, Direct Dealer, Architect) and the Segmentation lookup (options include Highway Maintenance, OEM Extrusion, Heavy Truck, Commercial Designer). Both Classification and Segmentation are driven by configurable master tables so the available options may vary by division or business unit. The rep completes additional fields as needed such as address, contact information, and territory assignment, then clicks Save. The system validates that all required fields are populated, commits the record to the database, and sets the Account Status to Active with the Data Source field left blank (indicating non-integrated origin).

*Note: The behavior when a duplicate Account Name is entered is TBD pending duplicate detection configuration.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-2855 | Account Categorization Fields (Non-Integrated) - W1 | When: Creating/Updating the Account record | Then: User should be able to select any value from the Classification (Config Table) and Segmentation (Config Table) look-ups based on the mentioned list: Classification (Config table): End-User, Coil Coater, Direct Dealer, Architect. Segmentation (Config Table): Highway Maintenance, OEM Extrusion, Heavy Truck, Commercial Designer. | List of values in the config tables are configurable as per Master tables. | PHX-2855 |
| FR-PHX-2546 | Account (Non-Integrated) - Data Source Tracking Field - W1 | When: they are on the account form/account view | Then: they should be able to see an "Data Source" as read only. Data Source: Non-integrated Accounts: Read-only and blank | `Missing` | PHX-2546 |
| FR-PHX-2377 | Account - Master Tables - Classification, Segmentation, Account Source, Data Source | Need master tables for Classification, Segmentation, Account Source, Data Source & Column as "Name" | Need master tables created with Name column | This story has an integration component from a data perspective that will come from the Customer and Reference Integration. But the Tables and CRM work can be completed beforehand. | PHX-2377 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-2855 | Account Categorization Fields (Non-Integrated) - W1 | PHX-23: 3.3 Account Management |
| PHX-2546 | Account (Non-Integrated) - Data Source Tracking Field - W1 | PHX-23: 3.3 Account Management |
| PHX-2377 | Account - Master Tables - Classification, Segmentation, Account Source, Data Source | PHX-23: 3.3 Account Management |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Classification and Segmentation option set values are still incomplete in the data model — full value lists must be provided before development. | TBD | TBD |
| 2 | Should Classification and Segmentation values be filtered by Division or Business Unit, or visible to all users? | TBD | TBD |

---

### 3.2 User Scenario 2 – View Account List and Filter by Status

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Account Views |
| User Role/Actor | Sales Representative / Sales Manager |
| Type | System interface navigation |
| Interfaces involved | D365 CRM |

**Narrative**

A Sales Representative or Sales Manager needs to review a list of Accounts to prioritize follow-up activities or analyze account portfolio. The user navigates to the Accounts area in Dynamics 365 which displays the default "My Active Accounts" view showing all Active accounts owned by the current user. The view includes columns for Account Name, Account Type, Owner, Status Reason, and other key fields. The user can switch to "All Accounts" view to see accounts across all owners (subject to security permissions) or "My Inactive Accounts" view to see accounts with Status Reason = Inactive. The views support inline filtering and sorting to further refine the list based on specific criteria.

*Note: Custom views and advanced filtering logic are still being defined with the business team.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-2589 | Account Views - W1 | When: they navigate to the Account area of CRM | Then: they are able to see Account views: My Inactive Accounts, All Accounts, My Active Accounts | Views should display accounts based on filter criteria defined in List views Accounts.xlsx | PHX-2589 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-2589 | Account Views - W1 | PHX-23: 3.3 Account Management |

---

### 3.3 User Scenario 3 – Qualify Lead and Create Account/Contact

| Field | Value |
|---|---|
| Business Process/Area/Category | Lead Management - Lead Qualification |
| User Role/Actor | Sales Representative |
| Type | Manual with system interface |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative has nurtured a lead through the qualification process by logging calls, emails, and meetings in the activity timeline (PHX-1354). When the rep determines the lead meets qualification criteria (budget confirmed, decision maker identified, timeline established), they click the "Qualify" button on the Lead form. Then the system displays a confirmation dialog showing which records will be created (Account and Contact are selected by default; Opportunity is optional). The rep confirms qualification. Then the system creates a new Account record populated with the lead's Company Name field, creates a new Contact record under that Account populated with the lead's First Name, Last Name, Email, and Phone fields, marks the lead Status as "Qualified" (PHX-357), and navigates the user to the newly created Account form. The contact is automatically marked as Primary Contact on the Account (PHX-368). The rep can now continue managing the customer relationship through the Account record with all lead activities carried forward to the Account's activity timeline (PHX-1354).

*Note: Business rules for automatic opportunity creation on lead qualification are TBD.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-84 | Manual Account Creation from Lead Qualification - W1 | When: Sales Rep clicks "Qualify" on Lead record | Then: System creates Account and Contact from Lead data; Lead Status changes to Qualified | Duplicate detection should run on Account Name and Contact Email before creation per PHX-71, PHX-91 | PHX-84 |
| FR-PHX-92 | Contact Creation - W1 | When: Sales Rep creates new Contact on Account OR qualifies Lead | Then: System creates Contact record with required fields (First Name, Last Name, Email) under parent Account | Contact cannot be created without parent Account relationship per PHX-92 | PHX-92 |
| FR-PHX-357 | Lead Status - W1 | When: Sales Rep qualifies or disqualifies Lead | Then: System updates Lead Status field (Active/Qualified/Disqualified) | Lead Status must be updated on qualification/disqualification per PHX-357 | PHX-357 |
| FR-PHX-1354 | Activity History on Leads - W1 | When: Sales Rep logs activities (calls, emails, tasks) on Lead record | Then: Activities appear in Lead Activity Timeline and transfer to Account/Contact on qualification | Activity history must be visible on Lead form and preserved on qualification per PHX-1354 | PHX-1354 |
| FR-PHX-368 | Primary Contact - W1 | When: Sales Rep creates first Contact on Account OR qualifies Lead | Then: System marks Contact as Primary Contact; only one Primary Contact allowed per Account | If second Contact marked Primary, system should unmark previous Primary Contact per PHX-368 | PHX-368 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-84 | Manual Account Creation | PHX-23: 3.3 Account Management |
| PHX-92 | Contact Creation | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-357 | Lead Status | PHX-174: 4.4 Lead Management |
| PHX-1354 | Activity History on Leads | PHX-174: 4.4 Lead Management |
| PHX-368 | Primary Contact | PHX-152: 3.3 Account Management - Manage Contacts |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Should Opportunity be automatically created on Lead Qualification for specific Lead Sources or Classifications? | TBD | TBD |
| 2 | What happens to Lead activities if multiple Contacts are created from a single Lead? Are activities related to all Contacts or only Primary? | TBD | TBD |

---

### 3.4 User Scenario 4 – Create Contact and Manage Primary Contact Flag

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Contact Management |
| User Role/Actor | Sales Representative |
| Type | Manual with system interface |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative is viewing an existing Account record. When the rep clicks the "+ New Contact" button on the Contacts subgrid of the Account form, then the system displays a Quick Create Contact form with the Parent Account field pre-populated. The rep enters the Contact's First Name (required), Last Name (required), Email Address (required per PHX-362), Phone Number, and Job Title. If this is the first Contact being created for this Account, the rep checks the "Primary Contact" checkbox to designate this contact as the main decision maker (PHX-368). If this Contact is enrolled in CBG training programs, the rep checks the "Training Enrollment" checkbox (PHX-366). The rep clicks Save. Then the system runs duplicate detection logic comparing the Email Address and Last Name fields against existing Contacts (PHX-91). If a potential duplicate is found, the system displays a warning dialog showing the matching Contact record and asks the rep to confirm whether to proceed with creating a new Contact or navigate to the existing Contact. If no duplicates are found, the system creates the Contact with Status = Active (PHX-369) and displays a success notification. The Contact now appears in the Account's Contacts subgrid and can be set as the Primary Contact for quote and opportunity associations.

*Note: Business rules for managing multiple Primary Contacts (automatic unmarking vs. validation error) are TBD.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-92 | Contact Creation - W1 | When: Sales Rep clicks "+ New Contact" on Account | Then: System displays Contact form with Parent Account pre-populated; requires First Name, Last Name, Email | Contact cannot be saved without Parent Account; Email must be valid format per PHX-362 | PHX-92 |
| FR-PHX-368 | Primary Contact - W1 | When: Sales Rep marks Contact as "Primary Contact" | Then: System validates only one Primary Contact per Account; if second Primary flagged, system either auto-unmarks previous OR displays error | Only one Primary Contact allowed per Account per PHX-368 | PHX-368 |
| FR-PHX-362 | Required Contact Fields - W1 | When: Sales Rep attempts to save Contact | Then: System validates required fields: First Name, Last Name, Email Address | System prevents save if required fields missing per PHX-362 | PHX-362 |
| FR-PHX-366 | Training Enrollment Flag (CBG Specific) - W1 | When: Sales Rep creates/updates Contact | Then: System displays "Training Enrollment" checkbox field for CBG business unit users | Training Enrollment field is boolean; default value is No/False per PHX-366 | PHX-366 |
| FR-PHX-91 | Duplicate Contact Detection - W1 | When: Sales Rep saves Contact | Then: System runs duplicate detection on Email Address + Last Name; displays warning if matches found | Duplicate detection runs synchronously on save; user can proceed or cancel per PHX-91 | PHX-91 |
| FR-PHX-369 | Contact Status - W1 | When: Contact record is created or updated | Then: System tracks Contact Status field (Active/Inactive) | New Contacts default to Active status per PHX-369 | PHX-369 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-92 | Contact Creation | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-368 | Primary Contact | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-362 | Required Contact Fields | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-366 | Training Enrollment Flag (CBG Specific) | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-91 | Duplicate Contact Detection | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-369 | Contact Status | PHX-152: 3.3 Account Management - Manage Contacts |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What is the exact duplicate detection matching logic? Email exact match + Last Name exact match, or fuzzy matching? | TBD | TBD |
| 2 | Should Primary Contact flag be required (always one Primary) or optional (can be zero Primary Contacts)? | TBD | TBD |
| 3 | What security roles can edit the Training Enrollment field? All sales roles or only CBG managers? | TBD | TBD |

---

### 3.5 User Scenario 5 – Log Activity and Track Activity Status

| Field | Value |
|---|---|
| Business Process/Area/Category | Activity Management - Activity Creation and Tracking |
| User Role/Actor | Sales Representative |
| Type | Manual with system interface |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative is managing a customer Account and needs to log a phone call with the customer. When the rep navigates to the Account record and clicks the "+ New Activity" button in the Activity Timeline control, then the system displays an Activity Quick Create form with a dropdown to select Activity Type (Task, Phone Call, Appointment, Email) per PHX-99. The rep selects "Phone Call" as the Activity Type. Then the system displays Phone Call-specific fields including Subject (required), Phone Number, Direction (Incoming/Outgoing), and Duration. The rep enters "Follow-up on Q3 pricing inquiry" as the Subject, selects Direction = Outgoing, enters the customer's phone number, and adds notes in the Description field. The rep leaves the Status field as "Open" (default) per PHX-381. The rep clicks Save. Then the system creates the Phone Call activity record with Status = Open and displays it at the top of the Account's Activity Timeline per PHX-1354. After completing the phone call, the rep navigates back to the Account, opens the Phone Call activity from the timeline, updates the Actual Duration to 15 minutes, changes the Status to "Completed" per PHX-381, and clicks Save. The system timestamps the Completed Date and moves the activity to the "Closed Activities" section of the timeline.

*Note: Activity status standardization rules and status reason values are still being defined per PHX-69.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-99 | Activity Creation and Update - W1 | When: Sales Rep clicks "+ New Activity" on entity record | Then: System displays Activity Quick Create form with Activity Type dropdown (Task, Phone Call, Appointment, Email); requires Subject field | Activity must be related to a Regarding entity (Account, Contact, Lead, Opportunity) per PHX-99 | PHX-99 |
| FR-PHX-381 | Activity Status - W1 | When: Sales Rep creates or updates Activity | Then: System tracks Activity Status field (Open, Completed, Cancelled) | New activities default to Open status; Status change to Completed requires Actual Duration per PHX-381 | PHX-381 |
| FR-PHX-1354 | Activity History on Leads - W1 | When: Sales Rep views entity record (Lead, Account, Contact, Opportunity) | Then: Activity Timeline control displays all related activities sorted by date descending | Activity Timeline shows both Open and Closed activities per PHX-1354 | PHX-1354 |
| FR-PHX-69 | Activity Management Standardization - W1 | When: System is configured | Then: Activity types, status values, and status reasons are standardized across all entities | Activity Status values must be consistent across all activity types per PHX-69 | PHX-69 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-99 | Activity Creation and Update | PHX-153: 3.3 Account Management - Manage Activities |
| PHX-381 | Activity Status | PHX-153: 3.3 Account Management - Manage Activities |
| PHX-1354 | Activity History on Leads | PHX-174: 4.4 Lead Management |
| PHX-69 | Activity Management Standardization | PHX-153: 3.3 Account Management - Manage Activities |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What are the complete Activity Status Reason values for each Activity Status? (e.g., Completed - Made Contact, Completed - Left Voicemail, Completed - No Answer) | TBD | TBD |
| 2 | Should Activity Duration be required for Completed Phone Calls and Appointments? | TBD | TBD |
| 3 | Are custom Activity Types required beyond standard email, phone call, task, appointment? | TBD | TBD |

---

### 3.6 User Scenario 6 – Search for Account by Fields

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Account Search |
| User Role/Actor | Sales Representative / Sales Manager |
| Type | System interface navigation |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative needs to find an existing Account to update information or create an opportunity. When the rep navigates to the Accounts area and clicks in the "Search" box at the top of the view, then the system enables Quick Find search functionality. The rep can enter account search criteria such as Account Name, Account Number, City, State, or Postal Code per PHX-82. The rep enters "Acme Corp" and presses Enter. Then the system searches across all searchable Account fields using wildcarded matching (*Acme Corp*) and returns a list of matching Account records in the view. The results display Account Name, Account Number, City, State, Owner, and Status. The rep can click on an Account from the search results to open the full Account form. If no results are found, the system displays a "No records found" message and the rep can refine the search or create a new Account.

*Note: Advanced search functionality using filters and Quick Find configuration are TBD.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-82 | Account Search by Fields - W1 | When: Sales Rep enters search text in Accounts Quick Find box | Then: System searches Account Name, Account Number, Address fields and returns matching records | Search uses wildcarded matching; minimum 3 characters may be required for performance per PHX-82 | PHX-82 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-82 | Account Search by Fields | PHX-23: 3.3 Account Management |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What is the complete list of searchable Account fields for Quick Find? Should it include Email, Phone, Owner Name? | TBD | TBD |
| 2 | Should Quick Find search be case-insensitive and support partial matching (wildcards)? | TBD | TBD |
| 3 | What is the performance requirement for search response time? | TBD | TBD |

---

### 3.7 User Scenario 7 – Detect Duplicate Account and Prevent Creation

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Duplicate Detection |
| User Role/Actor | Sales Representative |
| Type | System validation |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative is creating a new Account manually. When the rep enters "Acme Corporation" as the Account Name, "100 Main Street" as the Billing Street address, and clicks Save, then the system runs duplicate detection rules synchronously before committing the record per PHX-71. The duplicate detection rule compares the Account Name and Billing Street fields against all existing active Account records using fuzzy matching logic (e.g., "Acme Corp" matches "Acme Corporation", "100 Main St" matches "100 Main Street"). If a potential duplicate is detected, the system displays a "Duplicate Records Found" dialog showing the matching Account record(s) with fields such as Account Name, Address, Owner, and Created Date. The dialog presents two options: "Ignore and Save" (proceed with creating the duplicate record) or "Cancel" (return to the form without saving). If the rep selects "Cancel", they can navigate to the existing Account record from the duplicate dialog. If the rep selects "Ignore and Save", the system creates the new Account despite the duplicate warning. If no duplicates are detected, the system creates the Account normally and displays a success notification.

*Note: Exact duplicate detection matching rules and field combinations are TBD.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-71 | Duplicate Detection and Handling - W1 | When: Sales Rep saves Account record | Then: System runs duplicate detection rule on Account Name + Address fields; displays warning dialog if matches found | Duplicate detection uses fuzzy matching per PHX-71; user can proceed or cancel | PHX-71 |
| FR-PHX-91 | Duplicate Contact Detection - W1 | When: Sales Rep saves Contact record | Then: System runs duplicate detection rule on Email + Last Name fields; displays warning dialog if matches found | Duplicate detection for Contacts uses Email + Last Name per PHX-91; user can proceed or cancel | PHX-91 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-71 | Duplicate Detection and Handling | PHX-23: 3.3 Account Management |
| PHX-91 | Duplicate Contact Detection | PHX-152: 3.3 Account Management - Manage Contacts |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What is the exact fuzzy matching logic for duplicate detection? Should it ignore case, punctuation, abbreviations? | TBD | TBD |
| 2 | Should duplicate detection run only on Active records or also Inactive records? | TBD | TBD |
| 3 | Can users with certain security roles bypass duplicate detection warnings? | TBD | TBD |

---

### 3.8 User Scenario 8 – View Account Hierarchy and Identify Parent Relationships

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Account Hierarchy Visualization |
| User Role/Actor | Sales Representative / Sales Manager |
| Type | System interface navigation |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative is viewing a child Account record that is part of a corporate hierarchy (e.g., "Acme Corp - Chicago Branch"). When the rep opens the Account form, then the system displays hierarchy relationship fields in the Account Information section including "Parent Account" (immediate parent) and "Ultimate Parent Account" (top-level parent) per PHX-89. The Parent Account field shows "Acme Corp - Midwest Region" as a clickable hyperlink. The Ultimate Parent Account field shows "Acme Corporation" as a clickable hyperlink. The rep can click on the Parent Account hyperlink to navigate to the parent Account record and view its details, or click on Ultimate Parent Account to navigate directly to the top of the hierarchy. Additionally, the rep can click on the "Accounts" subgrid on the Parent Account form to view all child Accounts in the hierarchy per PHX-65. The system provides a visual hierarchy chart control showing the full account hierarchy structure with parent-child relationships, allowing the rep to quickly understand the corporate structure and navigate between related accounts.

*Note: Hierarchy visualization control implementation and configuration are TBD.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-89 | Account Hierarchy Relationship Identifiers - W1 | When: Sales Rep views Account form | Then: System displays Parent Account and Ultimate Parent Account lookup fields | Parent Account and Ultimate Parent Account are lookup fields to Account entity per PHX-89 | PHX-89 |
| FR-PHX-65 | Account Hierarchy Visualization - W1 | When: Sales Rep clicks "Hierarchy" button on Account form OR views Accounts subgrid on parent Account | Then: System displays hierarchy chart control showing parent-child relationships | Hierarchy control shows multi-level relationships per PHX-65 | PHX-65 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-89 | Account Hierarchy Relationship Identifiers | PHX-23: 3.3 Account Management |
| PHX-65 | Account Hierarchy Visualization | PHX-23: 3.3 Account Management |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | How many levels of hierarchy should the system support? Is there a maximum depth? | TBD | TBD |
| 2 | Should hierarchy visualization be a separate page, embedded control on form, or both? | TBD | TBD |
| 3 | Should hierarchy be filtered by Business Unit or visible across all BUs? | TBD | TBD |

---

### 3.9 User Scenario 9 – Deactivate Account and Cascade to Contacts

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Account Deactivation |
| User Role/Actor | Sales Representative / Sales Manager |
| Type | Manual with system automation |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative determines that an Account is no longer active due to the business closing operations. When the rep navigates to the Account record and clicks the "Deactivate" button in the command bar, then the system displays a "Deactivate Account" confirmation dialog requesting the Status Reason (e.g., "Out of Business", "Duplicate", "Consolidated", "No Longer a Customer") per PHX-85. The rep selects "Out of Business" and clicks "Deactivate". Then the system changes the Account Status to "Inactive", updates the Status Reason to "Out of Business", and logs the deactivation timestamp per PHX-79. Additionally, the system evaluates whether this Account was manually created (non-integrated). If the Account Record Type = "Non Integrated", the system automatically deactivates all related Contact records associated with this Account per PHX-86 (cascading deactivation). If the Account Record Type = "Integrated", the system does NOT deactivate related Contacts because integrated Account status is managed by the source ERP system. The Account is then excluded from the "My Active Accounts" view and appears in the "My Inactive Accounts" view. The rep can later reactivate the Account if needed by clicking "Activate" on the inactive Account record.

*Note: Cascading deactivation rules for Opportunities and Quotes are TBD.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-85 | Manually Created Account Deactivation - W1 | When: Sales Rep clicks "Deactivate" on Account | Then: System displays dialog requiring Status Reason selection; Account Status changes to Inactive | Status Reason is required for deactivation per PHX-85 | PHX-85 |
| FR-PHX-86 | Account to Contact Deactivation - W1 | When: System deactivates non-integrated Account | Then: System automatically deactivates all related Contacts | Cascading deactivation only applies to non-integrated accounts per PHX-86 | PHX-86 |
| FR-PHX-79 | CRM Account Status Change - View - W1 | When: Account Status changes to Inactive | Then: Account excluded from "My Active Accounts" view; appears in "My Inactive Accounts" view | Status change timestamp captured per PHX-79 | PHX-79 |
| FR-PHX-88 | Integration Account Status - W1 | When: Integration updates Account Status from ERP | Then: System updates CRM Account Status to match ERP status; does NOT cascade deactivation to Contacts | Integration-driven status changes do not trigger cascade per PHX-88 | PHX-88 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-85 | Manually Created Account Deactivation | PHX-23: 3.3 Account Management |
| PHX-86 | Account to Contact Deactivation | PHX-23: 3.3 Account Management |
| PHX-79 | CRM Account Status Change - View | PHX-23: 3.3 Account Management |
| PHX-88 | Integration Account Status | PHX-23: 3.3 Account Management |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What are the complete Status Reason values for Inactive status? | TBD | TBD |
| 2 | Should Account reactivation also reactivate previously deactivated Contacts? | TBD | TBD |
| 3 | Should deactivation cascade to Opportunities (mark as Lost) and Quotes (mark as Cancelled)? | TBD | TBD |

---

### 3.10 User Scenario 10 – Disqualify Lead with Reason

| Field | Value |
|---|---|
| Business Process/Area/Category | Lead Management - Lead Disqualification |
| User Role/Actor | Sales Representative |
| Type | Manual with system interface |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative has determined that a Lead is not a viable opportunity after initial qualification activities. When the rep navigates to the Lead record and clicks the "Disqualify" button in the command bar, then the system displays a "Disqualify Lead" dialog requesting the Status Reason (e.g., "No Longer Interested", "Lost to Competitor", "Cancelled", "Cannot Contact") per PHX-112. The rep selects "No Longer Interested" as the Status Reason and optionally enters additional notes in a Description field. The rep clicks "Disqualify". Then the system updates the Lead Status to "Disqualified", sets the Status Reason to "No Longer Interested", and logs the disqualification timestamp per PHX-357. The Lead record remains in the system for reporting and analytics purposes but is excluded from active Lead views. The Lead cannot be qualified after disqualification without first reactivating it. All activities logged on the Lead during the qualification process remain accessible in the Activity Timeline per PHX-1354.

*Note: Lead reactivation workflow and permissions are TBD.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-112 | Disqualify Lead with Reason - W1 | When: Sales Rep clicks "Disqualify" on Lead | Then: System displays dialog requiring Status Reason selection; Lead Status changes to Disqualified | Status Reason is required for disqualification per PHX-112 | PHX-112 |
| FR-PHX-357 | Lead Status - W1 | When: Lead is created, qualified, or disqualified | Then: System tracks Lead Status field (Active, Qualified, Disqualified) | Lead Status must be updated on qualification/disqualification per PHX-357 | PHX-357 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-112 | Disqualify Lead with Reason | PHX-174: 4.4 Lead Management |
| PHX-357 | Lead Status | PHX-174: 4.4 Lead Management |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What are the complete Status Reason values for Disqualified Lead status? | TBD | TBD |
| 2 | Can disqualified Leads be reactivated? If yes, what is the workflow? | TBD | TBD |
| 3 | Should disqualified Leads be automatically deleted after a retention period? | TBD | TBD |

---

### 3.11 User Scenario 11 – Deactivate Contact

| Field | Value |
|---|---|
| Business Process/Area/Category | Account Management - Contact Management |
| User Role/Actor | Sales Representative |
| Type | Manual with system interface |
| Interfaces involved | D365 CRM |

**Narrative**

Given a Sales Representative is managing Contacts for an Account and determines that a Contact is no longer active (e.g., the person has left the company or changed roles). When the rep navigates to the Contact record and clicks the "Deactivate" button in the command bar, then the system displays a "Deactivate Contact" confirmation dialog per PHX-93. The rep clicks "Deactivate". Then the system changes the Contact Status to "Inactive" per PHX-369 and logs the deactivation timestamp. The Contact is excluded from active Contact views but remains in the system for historical reporting. If the deactivated Contact was previously marked as Primary Contact for the Account (per PHX-368), the system displays a warning notification that the Account no longer has a Primary Contact and suggests the rep designate a new Primary Contact. The rep can later reactivate the Contact if needed by clicking "Activate" on the inactive Contact record.

*Note: Contact hard delete functionality is defined in PHX-94 but is distinct from deactivation.*

**Functional Requirements**

| Functional Req No. | Description | Step-by-step user interactions | Expected system behaviour | Edge cases and validation rules | Related User Story # |
|---|---|---|---|---|---|
| FR-PHX-93 | Contact Deactivation - W1 | When: Sales Rep clicks "Deactivate" on Contact | Then: System changes Contact Status to Inactive; Contact excluded from active views | Deactivated Contacts remain in system for historical reporting per PHX-93 | PHX-93 |
| FR-PHX-369 | Contact Status - W1 | When: Contact Status changes | Then: System tracks Contact Status field (Active/Inactive) | Contact Status determines visibility in views per PHX-369 | PHX-369 |
| FR-PHX-94 | Contact Deletion (Hard Delete) - W1 | When: Sales Rep (with appropriate permissions) clicks "Delete" on Contact | Then: System hard deletes Contact record permanently | Hard delete is distinct from deactivation; requires elevated permissions per PHX-94 | PHX-94 |

**Related User Stories**

| Story ID | Story Title | Parent Feature |
|---|---|---|
| PHX-93 | Contact Deactivation | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-369 | Contact Status | PHX-152: 3.3 Account Management - Manage Contacts |
| PHX-94 | Contact Deletion (Hard Delete) | PHX-152: 3.3 Account Management - Manage Contacts |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What security roles have permission to hard delete Contacts per PHX-94? | TBD | TBD |
| 2 | Should the system prevent deactivation of Primary Contacts or just display a warning? | TBD | TBD |
| 3 | Should Contact reactivation reset the Primary Contact flag? | TBD | TBD |

---

## 4. User Interface Design

### 4.1 Forms Wireframes

#### 4.1.1 **Account** Entity Form

**Form Metadata**

| Field | Value |
|---|---|
| Form Name | Account Main Form |
| Description | Main form used to capture and manage Account information |
| Form Type | Main |
| Form Security | Missing – to be confirmed with security team |

**Header**

*[Header fields – Account Name (required), Owner (required), Account Type, Status Reason (read-only)]*

**Tab 1 – General**

Fields drawn from the Account sheet of the Data Dictionary:

- **Account Information Section**:
  - Account Name (Text) – Required
  - Account Number (Text) – Required for integrated accounts, blank for non-integrated (PHX-81)
  - Account Type (Choice) – Optional: Key, Opportunity, Existing, Prospect, New, Lost (PHX-76)
  - Account Record Type (Choice) – Required: Integrated, Non Integrated (PHX-84)
  - Classification (Lookup to Classification Table) – TBD requirement (PHX-2855, PHX-2377)
  - Segmentation (Lookup to Segmentation Table) – TBD requirement (PHX-2855, PHX-2377)
  - Parent Account (Lookup to Account) – Optional: Immediate parent in hierarchy (PHX-89)
  - Ultimate Parent Account (Lookup to Account) – Optional: Top-level parent in hierarchy (PHX-89)
  - No. of Employees (Whole Number) – Optional
  
- **Address Section**:
  - Billing Street (Text) – Required (integrated), Optional (non-integrated) (PHX-81)
  - Street 2 (Text) – Optional
  - Street 3 (Text) – Optional
  - Billing City (Text) – Required (integrated), Optional (non-integrated)
  - Billing State/Province (Text) – Required (integrated), Optional (non-integrated)
  - Billing Zip/Postal Code (Text) – Required (integrated), Optional (non-integrated)
  - Billing Country (Text) – Required (integrated), Optional (non-integrated)
  - Address 1: County (Text) – Required (integrated), Optional (non-integrated)

- **Contact Information Section**:
  - Account Phone (Text) – Required
  - Account Fax (Text) – Optional
  - Email (Text) – Required

**Tab 2 – Account Status**

- Account Status (Choice) – Optional
- Status Reason (Choice) – Required if Account Status = Inactive, otherwise Optional
- At Risk (Two Options: Yes/No) – Optional
- At Risk Reason (Choice) – Required if At Risk = True
- At Risk Comments (Multi-line Text) – Optional
- Inactive Date (Date) – Optional
- Inactive Reason Description (Multi-line Text) – Optional

**Footer**

*[Footer – Created By, Created On, Modified By, Modified On (all read-only system fields)]*

### 4.2 Related Business and Validation Rules

| Rule Name | Entity | Field | Event | Business Logic/Automation | Related Form |
|---|---|---|---|---|---|
| Require Account Name on Save | Account | Account Name | On Save | If Account Name is null or empty, display error message "Account Name is required" and prevent save per PHX-81 | Account Main Form |
| Auto-populate Data Source for Non-Integrated Accounts | Account | Data Source | On Create | When Account Record Type = "Non Integrated", set Data Source = blank (read-only) per PHX-2546 | Account Main Form |
| Validate Email Format | Account | Email | On Save | If Email field is not empty and does not match valid email format (contains @), display error message and prevent save | Account Main Form |
| Require At Risk Reason when At Risk = Yes | Account | At Risk Reason | On Save | If At Risk = Yes and At Risk Reason is null, display error message "At Risk Reason is required when account is marked as At Risk" and prevent save | Account Main Form |
| Require Status Reason when Account Status = Inactive | Account | Status Reason | On Save | If Account Status = Inactive and Status Reason is null, display error message and prevent save per PHX-85, PHX-79 | Account Main Form |
| Duplicate Detection - Account | Account | Account Name, Address | On Save | Run duplicate detection rule matching Account Name (fuzzy) + Billing Street (fuzzy); display warning dialog with potential duplicates per PHX-71 | Account Main Form |
| Cascade Deactivation to Contacts | Account | Status | On Update | When Account Status changed to Inactive AND Account Record Type = "Non Integrated", automatically deactivate all related Contact records per PHX-86 | Account Main Form |
| Integration Account Status Sync | Account | Status | On Integration Update | When Account Status updated from ERP integration, update CRM Account Status to match; do NOT cascade deactivation per PHX-88 | N/A (Integration) |
| Require Contact First Name | Contact | First Name | On Save | If First Name is null or empty, display error message "First Name is required" and prevent save per PHX-362 | Contact Main Form |
| Require Contact Last Name | Contact | Last Name | On Save | If Last Name is null or empty, display error message "Last Name is required" and prevent save per PHX-362 | Contact Main Form |
| Require Contact Email | Contact | Email | On Save | If Email is null or empty, display error message "Email Address is required" and prevent save per PHX-362 | Contact Main Form |
| Validate Contact Email Format | Contact | Email | On Save | If Email does not match valid email format, display error message and prevent save per PHX-362 | Contact Main Form |
| Enforce Single Primary Contact per Account | Contact | Primary Contact Flag | On Save | When Primary Contact flag set to True, validate that no other Contact for the same Account has Primary Contact = True; if duplicate Primary found, display error "Only one Primary Contact allowed per Account" per PHX-368 | Contact Main Form |
| Duplicate Detection - Contact | Contact | Email, Last Name | On Save | Run duplicate detection rule matching Email (exact) + Last Name (fuzzy); display warning dialog with potential duplicates per PHX-91 | Contact Main Form |
| Set Default Contact Status | Contact | Status | On Create | When new Contact created, set Status = Active by default per PHX-369 | Contact Main Form |
| Require Lead Topic | Lead | Topic | On Save | If Topic (Subject) is null or empty, display error message "Topic is required" and prevent save | Lead Main Form |
| Require Lead Last Name | Lead | Last Name | On Save | If Last Name is null or empty, display error message "Last Name is required" and prevent save | Lead Main Form |
| Require Lead Company Name | Lead | Company Name | On Save | If Company Name is null or empty, display error message "Company Name is required" and prevent save | Lead Main Form |
| Set Default Lead Status | Lead | Status | On Create | When new Lead created, set Status = Active by default per PHX-357 | Lead Main Form |
| Update Lead Status on Qualification | Lead | Status | On Qualify | When Lead is qualified, set Status = Qualified per PHX-357; create Account and Contact records per PHX-84, PHX-92 | Lead Main Form |
| Require Disqualification Reason | Lead | Status Reason | On Disqualify | When Lead is disqualified, require Status Reason selection (e.g., "No Longer Interested", "Lost to Competitor"); set Status = Disqualified per PHX-112 | Lead Main Form |
| Require Activity Subject | Activity | Subject | On Save | If Subject is null or empty, display error message "Subject is required" and prevent save per PHX-99 | Activity Quick Create Form |
| Set Default Activity Status | Activity | Status | On Create | When new Activity created, set Status = Open by default per PHX-381 | Activity Quick Create Form |
| Update Activity Status on Completion | Activity | Status | On Mark Complete | When Activity marked as Complete, set Status = Completed and populate Completed Date per PHX-381 | Activity Form |
| Require Actual Duration on Activity Completion | Activity | Actual Duration | On Save | If Activity Status = Completed and Actual Duration is null, auto-calculate duration or display warning per PHX-381 | Activity Form |
| Account Search Quick Find | Account | Multiple | On Search | Enable Quick Find search across Account Name, Account Number, Billing City, Billing State, Billing Zip fields with wildcarded matching per PHX-82 | Account List View |
| Require Account Type Identifier | Account | Account Type | On Create | Populate Account Type field (Key, Opportunity, Existing, Prospect, New, Lost) based on business rules TBD per PHX-76 | Account Main Form |
| Track Account Source | Account | Account Source | On Create | Populate Account Source from sw_accountsource master table indicating lead source or origin per PHX-75 | Account Main Form |
| Identify Additional Account Fields | Account | Custom Fields | On Form Load | Display additional custom Account fields per business requirements per PHX-354 (specific fields TBD) | Account Main Form |
| Transfer Lead Activities on Qualification | Lead | Activities | On Qualify | When Lead qualified to Account/Contact, transfer all Lead Activity records to newly created Account and Contact per PHX-1354 | Lead Main Form |

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Should Account Number be system-generated for non-integrated accounts or remain blank until ERP conversion? | TBD | TBD |
| 2 | Are there additional validation rules required for address fields (e.g., Zip Code format by country)? | TBD | TBD |
| 3 | For Primary Contact validation rule, should system auto-unmark existing Primary when new Primary is set, or prevent marking until user manually unmarks old Primary? | TBD | TBD |
| 4 | What are the complete Activity types and status values for standardization per PHX-69? | TBD | TBD |
| 5 | Should Account Type (PHX-76) be auto-populated by workflow rules or require manual selection? | TBD | TBD |

---

#### 4.1.2 **Contact** Entity Form

**Form Metadata**

| Field | Value |
|---|---|
| Form Name | Contact Main Form |
| Description | Main form used to capture and manage Contact information for Account relationships |
| Form Type | Main |
| Form Security | Missing – to be confirmed with security team |

**Header**

*[Header fields – Full Name (read-only composite of First + Last Name), Owner, Parent Account (required), Status (read-only)]*

**Tab 1 – General**

Fields drawn from Contact requirements (PHX-362, PHX-368, PHX-366, PHX-369):

- **Contact Information Section**:
  - First Name (Text) – Required (PHX-362)
  - Middle Name (Text) – Optional
  - Last Name (Text) – Required (PHX-362)
  - Job Title (Text) – Optional
  - Parent Account (Lookup to Account) – Required (PHX-92)
  - Email (Text) – Required; validated for email format (PHX-362)
  - Business Phone (Text) – Optional
  - Mobile Phone (Text) – Optional
  - Primary Contact (Boolean) – Optional; only one Primary per Account (PHX-368)
  - Training Enrollment (Boolean) – Optional; CBG-specific flag (PHX-366)
  
- **Address Section**:
  - Street 1 (Text) – Optional
  - Street 2 (Text) – Optional
  - City (Text) – Optional
  - State/Province (Text) – Optional
  - Zip/Postal Code (Text) – Optional
  - Country (Text) – Optional

**Tab 2 – Related**

- **Opportunities Subgrid** – Shows Opportunities where this Contact is a stakeholder
- **Quotes Subgrid** – Shows Quotes associated with this Contact

**Tab 3 – Timeline**

- **Activity Timeline Control** – Shows all activities (Tasks, Phone Calls, Appointments, Emails, Notes) related to this Contact per PHX-99, PHX-381

**Footer**

*[Footer – Created By, Created On, Modified By, Modified On (all read-only system fields)]*

**Form Behavior Rules**

- When Primary Contact checkbox is checked, system validates that no other Contact for the same Parent Account has Primary Contact = True per PHX-368
- On save, system runs duplicate detection based on Email + Last Name per PHX-91
- Status field defaults to Active on creation per PHX-369

---

#### 4.1.3 **Lead** Entity Form

**Form Metadata**

| Field | Value |
|---|---|
| Form Name | Lead Main Form |
| Description | Main form used to capture and manage Lead information during qualification process |
| Form Type | Main |
| Form Security | Missing – to be confirmed with security team |

**Header**

*[Header fields – Topic (required), Owner (required), Lead Source, Status (read-only)]*

**Tab 1 – General**

Fields drawn from Lead requirements (PHX-1354, PHX-357, PHX-112, PHX-84):

- **Lead Information Section**:
  - Topic (Subject) (Text) – Required
  - First Name (Text) – Required
  - Middle Name (Text) – Optional
  - Last Name (Text) – Required
  - Company Name (Text) – Required
  - Job Title (Text) – Optional
  - Lead Source (Choice) – Optional: Web, Referral, Campaign, Trade Show, etc.
  - Lead Status (Choice) – Read-only: Active, Qualified, Disqualified (PHX-357)
  
- **Contact Information Section**:
  - Email (Text) – Required
  - Business Phone (Text) – Optional
  - Mobile Phone (Text) – Optional
  
- **Address Section**:
  - Street 1 (Text) – Optional
  - City (Text) – Optional
  - State/Province (Text) – Optional
  - Zip/Postal Code (Text) – Optional
  - Country (Text) – Optional

**Tab 2 – Details**

- Budget Amount (Currency) – Optional
- Purchase Timeframe (Text) – Optional
- Decision Maker Identified (Boolean) – Optional
- Qualification Notes (Multi-line Text) – Optional

**Tab 3 – Timeline**

- **Activity Timeline Control** – Shows all activities (Tasks, Phone Calls, Appointments, Emails, Notes) related to this Lead per PHX-1354
- Activities logged on Lead are transferred to Account/Contact upon Lead qualification per PHX-1354

**Footer**

*[Footer – Created By, Created On, Modified By, Modified On (all read-only system fields)]*

**Form Behavior Rules**

- When "Qualify" button clicked, system creates Account and Contact records from Lead data per PHX-84, PHX-92; changes Lead Status to Qualified per PHX-357; transfers activities to new Account/Contact per PHX-1354
- When "Disqualify" button clicked, system displays dialog requiring Status Reason selection per PHX-112; changes Lead Status to Disqualified per PHX-357
- On save, system runs duplicate detection based on Email + Company Name per PHX-71

---

#### 4.1.4 **Opportunity** Entity Form

**Form Metadata**

| Field | Value |
|---|---|
| Form Name | Opportunity Main Form |
| Description | Main form used to capture and manage sales opportunities for customer accounts |
| Form Type | Main |
| Form Security | Missing – to be confirmed with security team |

**Header**

*[Header fields – Topic (required), Owner (required), Estimated Revenue, Estimated Close Date, Status (read-only)]*

**Tab 1 – Opportunity**

Fields drawn from Opportunity requirements (PHX-1608, PHX-1570):

- **Opportunity Information Section**:
  - Topic (Text) – Required
  - Parent Account (Lookup to Account) – Required
  - Primary Contact (Lookup to Contact) – Optional
  - Currency (Lookup to Currency) – Required; default to organization base currency (PHX-1514, PHX-1963)
  - Estimated Revenue (Currency) – Optional
  - Estimated Close Date (Date Only) – Required
  - Probability (Whole Number - %) – Optional; 0-100%
  - Owner (Lookup to User) – Required; defaults to current user
  
- **Sales Process Section**:
  - Sales Stage (Choice) – Required: Qualify, Develop, Propose, Close
  - Status (State) – System: Open, Won, Lost
  - Status Reason (Status) – Required on Won/Lost: Won (Completed), Lost (Canceled, Out-Sold/Lost to Competitor)
  - Actual Revenue (Currency) – Required when Status = Won
  - Actual Close Date (Date Only) – Populated when Status = Won or Lost

**Tab 2 – Quote Lines**

- **Quotes Subgrid** – Shows all Quote records associated with this Opportunity (per PHX-1619, PHX-1573)

**Tab 3 – Stakeholders**

- **Opportunity Contacts Subgrid** – Shows additional Contact stakeholders beyond Primary Contact

**Tab 4 – Timeline**

- **Activity Timeline Control** – Shows all activities (Tasks, Phone Calls, Appointments, Emails, Notes) related to this Opportunity

**Footer**

*[Footer – Created By, Created On, Modified By, Modified On (all read-only system fields)]*

**Form Behavior Rules**

- When Status changes to Won, system requires Actual Revenue and Actual Close Date to be populated
- When Status changes to Lost, system requires Status Reason selection
- Estimated Close Date must be today or future date (cannot be past date for Open opportunities)

---

#### 4.1.5 **Quote** Entity Form

**Form Metadata**

| Field | Value |
|---|---|
| Form Name | Quote Main Form |
| Description | Main form used to capture and manage price quotations for opportunities and accounts |
| Form Type | Main |
| Form Security | Missing – to be confirmed with security team |

**Header**

*[Header fields – Name (required), Account (required), Total Amount (calculated), Status (read-only)]*

**Tab 1 – Summary**

Fields drawn from Quote requirements (PHX-1619, PHX-1573):

- **Quote Information Section**:
  - Name (Text) – Required; often auto-generated from naming convention
  - Account (Lookup to Account) – Required
  - Opportunity (Lookup to Opportunity) – Optional; quotes can be created without Opportunity
  - Contact (Lookup to Contact) – Optional; defaults to Primary Contact if available
  - Currency (Lookup to Currency) – Required; default to organization base currency (PHX-1514, PHX-1963)
  - Effective From (Date Only) – Optional; quote valid from date
  - Effective To (Date Only) – Optional; quote expiration date
  - Status (State) – System: Draft, Active, Won, Closed
  - Status Reason (Status) – Required on status changes
  
- **Pricing Information Section**:
  - Total Amount (Currency) – Calculated (read-only); sum of all quote line items
  - Total Discount (Currency) – Optional; manual discount amount
  - Freight Amount (Currency) – Optional
  - Total Tax (Currency) – Calculated based on tax rules
  - Total Amount (After Tax) (Currency) – Calculated (read-only)

**Tab 2 – Products**

- **Quote Products Subgrid** – Shows all quote line items (products/services) with pricing, quantity, discounts

**Tab 3 – Terms and Conditions**

- Payment Terms (Text) – Optional
- Shipping Method (Choice) – Optional
- Delivery Terms (Multi-line Text) – Optional
- Additional Terms (Multi-line Text) – Optional

**Tab 4 – Timeline**

- **Activity Timeline Control** – Shows all activities related to this Quote

**Footer**

*[Footer – Created By, Created On, Modified By, Modified On (all read-only system fields)]*

**Form Behavior Rules**

- Quote can only be edited when Status = Draft
- When Status changes to Active, quote becomes read-only except for Status field
- Effective To date must be after Effective From date if both are populated

---

#### 4.1.6 **Territory** Entity Form

**Form Metadata**

| Field | Value |
|---|---|
| Form Name | Territory Main Form |
| Description | Main form used to define and manage sales territories for account assignment |
| Form Type | Main |
| Form Security | Read-only for Sales Rep and Sales Manager roles; Read/Write for System Admin per PHX-1563 |

**Header**

*[Header fields – Name (required), Manager (optional)]*

**Tab 1 – General**

Fields drawn from Territory requirements (PHX-1624, PHX-1563):

- **Territory Information Section**:
  - Name (Text) – Required
  - Manager (Lookup to User) – Optional; Territory Manager user
  - Description (Multi-line Text) – Optional
  - Territory Type (Choice) – Optional: Geographic, Account-Based, Industry, Named Accounts
  
- **Geographic Coverage Section** (if Territory Type = Geographic):
  - Country (Text) – Optional
  - State/Province (Text) – Optional
  - City (Text) – Optional
  - Zip/Postal Code Range (Text) – Optional

**Tab 2 – Members**

- **Territory Members Subgrid** – Shows Users assigned to this Territory (many-to-many relationship)

**Tab 3 – Accounts**

- **Accounts Subgrid** – Shows all Accounts assigned to this Territory

**Tab 4 – Related**

- **Leads Subgrid** – Shows Leads assigned to this Territory
- **Opportunities Subgrid** – Shows Opportunities assigned to this Territory

**Footer**

*[Footer – Created By, Created On, Modified By, Modified On (all read-only system fields)]*

**Form Behavior Rules**

- Territory entity is Organization-owned (not User or Team owned) per D365 out-of-box design
- Sales Rep and Sales Manager roles have Read-only access per PHX-1563; cannot create, update, or delete
- Only System Administrator can create/modify Territory records

---

#### 4.1.7 **User** Entity Form

**Form Metadata**

| Field | Value |
|---|---|
| Form Name | User Main Form |
| Description | System user form for managing user profiles, security roles, and business unit assignments |
| Form Type | Main |
| Form Security | Read-only for most fields; only System Administrator can modify security and BU assignments |

**Header**

*[Header fields – Full Name (read-only), Business Unit (required), User Type (read-only)]*

**Tab 1 – Summary**

Fields drawn from User requirements (PHX-1626):

- **User Information Section**:
  - First Name (Text) – Required
  - Last Name (Text) – Required
  - Primary Email (Text) – Required; synced from Azure AD
  - User Name (Text) – Required; Azure AD UPN
  - Business Unit (Lookup to Business Unit) – Required; determines data access scope (PHX-1519)
  - Manager (Lookup to User) – Optional; user's manager for reporting hierarchy
  
- **Contact Information Section**:
  - Business Phone (Text) – Optional
  - Mobile Phone (Text) – Optional
  - Address (Text) – Optional
  - City (Text) – Optional
  - State/Province (Text) – Optional

**Tab 2 – Details**

- Job Title (Text) – Optional
- Department (Text) – Optional
- Employee ID (Text) – Optional

**Tab 3 – Administration**

- **Security Roles Section**:
  - Security Roles (Many-to-Many) – Shows assigned security roles (Sales Representative, Sales Manager, System Administrator, etc.) per PHX-1560, PHX-1561, PHX-1563, PHX-1570, PHX-1573, PHX-1576, PHX-1636
  
- **Teams Section**:
  - Teams (Many-to-Many) – Shows team memberships (Owner Teams and Access Teams)
  
- **Territories Section**:
  - Territories (Many-to-Many) – Shows territory assignments for sales reps per PHX-1563, PHX-1624

**Tab 4 – Field Security**

- **Field Security Profiles Section**:
  - Field Security Profiles (Many-to-Many) – Shows assigned field security profiles (Financial Fields Profile, etc.)

**Footer**

*[Footer – Created By, Created On, Modified By, Modified On (all read-only system fields)]*

**Form Behavior Rules**

- User records are created via Azure AD synchronization; cannot be manually created in D365
- Business Unit assignment determines record-level access scope based on security role privileges
- Security Roles can only be assigned by users with System Administrator or appropriate delegated admin rights
- Disabled users cannot log in to D365 but remain in system for audit trail

---

### 4.2 Related Business and Validation Rules

[See expanded table above with 29 business rules covering all entity types]

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Should Account Number be system-generated for non-integrated accounts or remain blank until ERP conversion? | TBD | TBD |
| 2 | Are there additional validation rules required for address fields (e.g., Zip Code format by country)? | TBD | TBD |
| 3 | For Primary Contact validation rule, should system auto-unmark existing Primary when new Primary is set, or prevent marking until user manually unmarks old Primary? | TBD | TBD |
| 4 | What are the complete Activity types and status values for standardization per PHX-69? | TBD | TBD |
| 5 | Should Account Type (PHX-76) be auto-populated by workflow rules or require manual selection? | TBD | TBD |

### 4.3 Process Administration

#### 4.3.1 Business Process Flows

**Business Process Flow: Account Onboarding Process** (TBD - not defined in current user stories)

| Setting | Value |
|---|---|
| Process Name | Account Onboarding Process |
| Entity | Account |
| Category | Business Process Flow |
| Description | TBD |

**Stages:**

- **Stage 1: Qualify** – TBD
- **Stage 2: Research** – TBD

*Note: BPF for Account entity not confirmed in user stories. To be defined in future iteration.*

#### 4.3.2 Workflows

**Workflow: Account Data Source Population Workflow** (Implied by PHX-2546)

| Setting | Value |
|---|---|
| Process Name | Account Data Source Population Workflow |
| Entity | Account |
| Category | Workflow |
| Trigger | On Create |
| Scope | Organization |
| Execute As | TBD |
| Description | Auto-populates Data Source field based on Account Record Type |

**Workflow Steps:**

1. Check if Account Record Type = "Non Integrated"
2. If true, set Data Source field to blank (read-only)
3. If false (Integrated), Data Source populated from integration payload

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Should workflows run synchronously or asynchronously? | TBD | TBD |
| 2 | What is the Execute As user context for workflows? | TBD | TBD |

### 4.4 Views

#### 4.4.1 System Views

**View 1: My Active Accounts**

| Setting | Value |
|---|---|
| View Name | My Active Accounts |
| Entity | Account |
| Default View | Yes |
| Description | Displays all Active accounts owned by current user |

**Filter Criteria:**
- Owner = Current User
- Status = Active

**Columns:**
- Account Name
- Account Type
- Owner
- Account Phone
- Billing City
- Billing State/Province
- Status Reason

---

**View 2: All Accounts**

| Setting | Value |
|---|---|
| View Name | All Accounts |
| Entity | Account |
| Default View | No |
| Description | Displays all accounts in the system (subject to user security permissions) |

**Filter Criteria:**
- None (shows all accounts user has read access to)

**Columns:**
- Account Name
- Account Number
- Account Type
- Owner
- Status Reason
- Created On

---

**View 3: My Inactive Accounts**

| Setting | Value |
|---|---|
| View Name | My Inactive Accounts |
| Entity | Account |
| Default View | No |
| Description | Displays all Inactive accounts owned by current user |

**Filter Criteria:**
- Owner = Current User
- Status = Inactive

**Columns:**
- Account Name
- Account Type
- Owner
- Status Reason
- Inactive Date
- Inactive Reason Description

#### 4.4.2 Custom View – **Inactive Account Status Change View** (Referenced in PHX-79)

| Setting | Value |
|---|---|
| View Name | Inactive Account Status Change View |
| View Type | Public |
| Entity | Account |
| Description | TBD - derived from user story PHX-79 reference |

**Layout and Fields:**
TBD - pending clarification from business stakeholders

**Filter Criteria:**
TBD

**Search Fields:**
TBD

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What specific columns and filter criteria are required for the Inactive Account Status Change View referenced in PHX-79? | TBD | TBD |

---

### 4.5 Form Mockups

This section provides form mockups for each applicable entity, structured to reflect the Microsoft Dynamics 365 CE form layout conventions.

**Legend:**
| Symbol | Meaning |
|---|---|
| `[R]` | Required field — must be populated before save |
| `[O]` | Optional field — not mandatory |
| `[TBD]` | Requirement status not yet confirmed |
| `[RO]` | Read-only field — displayed but not editable by user |
| `[RL]` | Read-only field populated via integration / system logic |

---

#### 4.5.1 Form Mockup — **Account** Entity (Account Main Form)

**Form Metadata**

| Property | Value |
|---|---|
| Form Name | Account Main Form |
| Entity | Account |
| Form Type | Main |
| BPF Enabled | Missing — no BPF defined for Account in current user stories |
| Form Security | Missing — to be confirmed with security team |
| Related User Stories | PHX-2855, PHX-2546, PHX-2377, PHX-2589, PHX-1584, PHX-1560, PHX-1963, PHX-1520 |

---

**► RIBBON (Command Bar)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ACCOUNT  │  + New  │  💾 Save  │  🗑 Delete  │  Deactivate  │  ··· More       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Button Label | Button Type | Visible When | Enabled When | Related Story |
|---|---|---|---|---|
| New | OOB | Always | Always | — |
| Save | OOB | Always | Form has unsaved changes | — |
| Save & Close | OOB | Always | Form has unsaved changes | — |
| Delete | OOB | Always | User has Delete privilege on Account | — |
| Deactivate | OOB | Record is Active | User has Write privilege on Account | PHX-1560 |
| Activate | OOB | Record is Inactive | User has Write privilege on Account | Related to Status management |
| Assign | OOB | Always | User has Assign privilege | — |
| Share | OOB | Always | User has Share privilege | — |
| More (···) | OOB | Always | Always — expands additional actions | — |

---

**► HEADER** *(2-column, always visible, pinned to top of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Account Name           [R][Text]│  Owner                [R][Lookup]│
│  ________________________________│  ________________________________│
│  Account Type         [O][Choice]│  Status Reason        [RO][Choice]│
└──────────────────────────────────┴──────────────────────────────────┘
```

| Position | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Header — Col 1 | Account Name | `name` | Text | `[R]` Required | Primary name field; OOB D365 field; Max length: 160 |
| Header — Col 2 | Owner | `ownerid` | Lookup (User/Team) | `[R]` Required | OOB ownership field |
| Header — Col 1 | Account Type | Missing | Choice | `[O]` Optional | Options: Key, Opportunity, Existing, Prospect, New, Lost |
| Header — Col 2 | Status Reason | `statuscode` | Choice | `[RO]` Read-Only | Active / Inactive — system-managed |

---

**► TAB 1 — General**
*Primary account information. 2-column layout.*

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 1: General                                                      ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Account Information            ║  SECTION: Account Identifiers ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Account Name          [R][Text]         ║  Account Number [TBD][Text]║
║  Account Type          [O][Choice]       ║  Account Record Type[R][Choice]║
║  Classification        [TBD][Lookup]     ║  Account Source [O][Lookup]║
║  Segmentation          [TBD][Lookup]     ║  Data Source    [RO][Text]║
║  Division              [O][Lookup]       ║  CAC Code       [TBD][Lookup]║
╠══════════════════════════════════════════╩═══════════════════════════╣
║  SECTION: Contact Information            (Full width — 2 columns)   ║
║  ─────────────────────────────────────────────────────────────────  ║
║  Account Phone     [R][Text]             Email           [R][Text]  ║
║  Account Fax       [O][Text]             Website         [O][Text]  ║
╠══════════════════════════════════════════════════════════════════════╣
║  SECTION: Description                    (Full width — 1 column)    ║
║  ─────────────────────────────────────────────────────────────────  ║
║  Description       [O][MultiLine]                                   ║
╚══════════════════════════════════════════════════════════════════════╝
```

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Account Information | Account Name | `name` | Text (160) | `[R]` Required | OOB D365 field; Required for PCG, Required for CBG |
| Account Information | Account Type | Missing | Choice | `[O]` Optional | Options: Key, Opportunity, Existing, Prospect, New, Lost |
| Account Information | Classification | Missing | Lookup | `[TBD]` | Lookup to Classification Table; Configurable values per PHX-2855 |
| Account Information | Segmentation | Missing | Lookup | `[TBD]` | Lookup to Segmentation Table; Configurable values per PHX-2855 |
| Account Information | Division | Missing | Lookup | `[O]` Optional | Lookup to Division; Required for PCG per data model |
| Account Identifiers | Account Number | `accountnumber` | Text (20) | `[TBD]` | Required for integrated accounts; blank for non-integrated |
| Account Identifiers | Account Record Type | Missing | Choice | `[R]` Required | Options: Integrated, Non Integrated |
| Account Identifiers | Account Source | Missing | Lookup | `[O]` Optional | Lookup to Account Source Table per PHX-2377 |
| Account Identifiers | Data Source | Missing | Text | `[RO]` Read-Only | Blank for non-integrated; populated from integration for integrated accounts per PHX-2546 |
| Account Identifiers | CAC Code | Missing | Lookup | `[TBD]` | Lookup to CAC Code; Required for LAD per data model |
| Contact Information | Account Phone | `address1_telephone1` | Text (50) | `[R]` Required | OOB D365 field |
| Contact Information | Account Fax | `address1_fax` | Text (100) | `[O]` Optional | OOB D365 field |
| Contact Information | Email | `emailaddress1` | Text (100) | `[R]` Required | OOB D365 field; Email format validation |
| Contact Information | Website | Missing | Text | `[O]` Optional | Schema name Missing in data model |
| Description | Description | `description` | MultiLine (2000) | `[O]` Optional | OOB D365 field |

---

**► TAB 2 — Address**
*Physical address details. 2-column layout.*

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 2: Address                                                      ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Billing Address                ║  SECTION: Location Details║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Billing Address   [O][Text]             ║  Billing Latitude [RO][Double]║
║  Billing Street    [TBD][Text]           ║  Billing Longitude[RO][Double]║
║  Address 1: Street 2[TBD][Text]          ║  Address 1: County[TBD][Text]║
║  Address 1: Street 3[TBD][Text]          ║                            ║
║  Billing City      [TBD][Text]           ║                            ║
║  Billing State/Province[TBD][Text]       ║                            ║
║  Billing Zip/Postal Code[TBD][Text]      ║                            ║
║  Billing Country   [TBD][Text]           ║                            ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Billing Address | Billing Address | `address1_name` | Text | `[O]` Optional | OOB D365 field |
| Billing Address | Billing Street | `address1_line1` | Text (250) | `[TBD]` | Required for integrated, Optional for non-integrated |
| Billing Address | Address 1: Street 2 | `address1_line2` | Text (250) | `[TBD]` | Required for integrated, Optional for non-integrated |
| Billing Address | Address 1: Street 3 | `address1_line3` | Text (250) | `[TBD]` | Required for integrated, Optional for non-integrated |
| Billing Address | Billing City | `address1_city` | Text (80) | `[TBD]` | Required for integrated, Optional for non-integrated |
| Billing Address | Billing State/Province | `address1_stateorprovince` | Text (50) | `[TBD]` | Required for integrated, Optional for non-integrated |
| Billing Address | Billing Zip/Postal Code | `address1_postalcode` | Text (20) | `[TBD]` | Required for integrated, Optional for non-integrated |
| Billing Address | Billing Country | `address1_country` | Text (80) | `[TBD]` | Required for integrated, Optional for non-integrated |
| Location Details | Billing Latitude | `address1_latitude` | Double | `[RO]` Read-Only | OOB D365 field; system-calculated |
| Location Details | Billing Longitude | `address1_longitude` | Double | `[RO]` Read-Only | OOB D365 field; system-calculated |
| Location Details | Address 1: County | `address1_county` | Text (50) | `[TBD]` | Required for integrated, Optional for non-integrated |

---

**► TAB 3 — Account Status**
*Account lifecycle and risk tracking. 2-column layout.*

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 3: Account Status                                               ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Status Information             ║  SECTION: Risk Management ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Account Status    [TBD][Choice]         ║  At Risk        [O][Two Options]║
║  Account Stage     [TBD][Choice]         ║  At Risk Reason [TBD][Choice]║
║  Status Reason     [TBD][Choice]         ║  At Risk Comments[O][MultiLine]║
║  Account Open Date [RO][Date]            ║                            ║
║  Inactive Date     [O][DateTime]         ║                            ║
║  Inactive Reason Description[O][MultiLine]║                           ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Status Information | Account Status | `statuscode` | Choice | `[TBD]` | OOB Status Reason field; Active/Inactive |
| Status Information | Account Stage / Account Phase | Missing | Choice | `[TBD]` | Options: New, Lost, Core (PCG); K.O.N.E.P (CBG) |
| Status Information | Status Reason | Missing | Choice | `[TBD]` | Required if Account Status = Inactive |
| Status Information | Account Open Date | Missing | Date | `[RO]` Read-Only | Populated for integrated accounts from source |
| Status Information | Inactive Date | Missing | DateTime | `[O]` Optional | Populated when account deactivated |
| Status Information | Inactive Reason Description | Missing | MultiLine (4000) | `[O]` Optional | Free text explanation for inactivation |
| Risk Management | At Risk | Missing | Two Options (Yes/No) | `[O]` Optional | Boolean flag for at-risk accounts |
| Risk Management | At Risk Reason | Missing | Choice | `[TBD]` | Required if At Risk = Yes; Options include: Color, Color Tools, Competitor Specification, Consolidation, Credit, Price, Product Quality, Relationship, Service Support, etc. |
| Risk Management | At Risk Comments | Missing | MultiLine (4000) | `[O]` Optional | Additional context for at-risk status |

---

**► TAB 4 — Financials** 🔒
*Financial data — secured; visible only to users with Financial Fields Security Profile.*

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 4: Financials  🔒 [Secured — Financial Fields Profile]          ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Financial Overview             ║  SECTION: Financial Analysis║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Annual Purchase Potential[TBD][Currency]║  $ Change       [TBD][Currency]║
║  Annual Revenue    [TBD][Currency]       ║  Current Year Through Last Month[TBD][Currency]║
║  Current YTD Sales [TBD][Currency]       ║  Expected FY Revenue[TBD][Currency]║
║  % Chance of Losing Business[TBD][Choice]║  Estimated Potential[TBD][Currency]║
║  % of Business at Risk[TBD][Choice]      ║                            ║
║  % of Business We Own[TBD][Choice]       ║                            ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

*\* Financial fields — Requirement TBD pending stakeholder discussion per data model notes: "Financial Fields need more discussion". All financial fields secured = Yes (Financial Fields Profile required).*

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Financial Overview | Annual Purchase Potential | Missing | Currency | `[TBD]` | Required for PCG, Required for CBG per data model; Secured; integration-populated value or 0 if not in source |
| Financial Overview | Annual Revenue | `revenue` | Currency | `[TBD]` | OOB D365 field; Secured; Financial Fields need more discussion per data model |
| Financial Overview | Current YTD Sales | Missing | Currency | `[TBD]` | Secured; Schema name Missing |
| Financial Overview | % Chance of Losing Business | Missing | Choice | `[TBD]` | Secured; Financial Fields need more discussion per data model |
| Financial Overview | % of Business at Risk | Missing | Choice | `[TBD]` | Secured; Financial Fields need more discussion per data model |
| Financial Overview | % of Business We Own | Missing | Choice | `[TBD]` | Secured; Financial Fields need more discussion per data model |
| Financial Analysis | $ Change | Missing | Currency | `[TBD]` | Secured; Duplicate of Year over Year Change per data model comments |
| Financial Analysis | Current Year Through Last Month | Missing | Currency | `[TBD]` | Secured; Reporting needs per data model |
| Financial Analysis | Expected FY Revenue | Missing | Currency | `[TBD]` | Secured; Financial Fields need more discussion per data model |
| Financial Analysis | Estimated Potential | Missing | Currency | `[TBD]` | Secured; Reporting needs per data model |

---

**► TAB 5 — Marketing**
*Campaign and currency information. 2-column layout.*

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 5: Marketing                                                    ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Marketing Information          ║  SECTION: Currency        ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Account Currency  [TBD][Lookup]         ║                            ║
║  Currency ISO Code [O][Choice]           ║                            ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Marketing Information | Account Currency | Missing | Lookup (Currency) | `[TBD]` | Lookup to Currency table (OOB); Required for CBG per data model |
| Marketing Information | Currency ISO Code | Missing | Choice | `[O]` Optional | Marked as "Not Needed" in data model; possible duplicate of Account Currency |

---

**► TAB 6 — System Information**
*System audit fields and ownership. 2-column layout.*

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 6: System Information                                           ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Ownership                      ║  SECTION: Domain Info     ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Owner             [R][Lookup]           ║  Domain ID      [RO][Text]║
║  Created By        [RO][Lookup]          ║                            ║
║  Created On        [RO][DateTime]        ║                            ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Ownership | Owner | Missing | Lookup (User) | `[R]` Required | Territory-based per data model; Required for CBG |
| Ownership | Created By | `CreatedBy` | Lookup (User) | `[RO]` Read-Only | OOB system field |
| Ownership | Created On | Missing | DateTime | `[RO]` Read-Only | System-set on record creation |
| Domain Info | Domain ID | Missing | Text (100) | `[RO]` Read-Only | Unique Key for domains to identify record; not needed on page layout per data model |

---

**► FOOTER** *(Persistent, always visible at bottom of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Created By        [RO][Lookup]  │  Created On       [RO][DateTime] │
│  Modified By       [RO][Lookup]  │  Modified On      [RO][DateTime] │
└──────────────────────────────────┴──────────────────────────────────┘
```

| Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|
| Created By | `createdby` | Lookup (User) | `[RO]` Read-Only | OOB system field |
| Created On | `createdon` | DateTime | `[RO]` Read-Only | OOB system field |
| Modified By | `modifiedby` | Lookup (User) | `[RO]` Read-Only | OOB system field |
| Modified On | `modifiedon` | DateTime | `[RO]` Read-Only | OOB system field |

**Open Questions — Account Form Mockup**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Account Form tab structure has been assumed based on the Accounts data model sections — final tab layout requires sign-off from the UX lead and business stakeholders. | TBD | TBD |
| 2 | Financial fields data types need clarification: Are "% Chance of Losing Business", "% of Business at Risk", "% of Business We Own" Choice fields or Currency/Decimal fields? Data model says "Financial Fields need more discussion". | TBD | TBD |
| 3 | Many schema names are Missing in the data dictionary — these must be confirmed before development. | TBD | TBD |
| 4 | Should the entire Financials tab be hidden for non-financial users, or only individual fields secured? | TBD | TBD |
| 5 | BPF for Account entity not confirmed — determine whether a Business Process Flow is required. | TBD | TBD |
| 6 | Classification and Segmentation lookup tables: What are the complete option values for each division? Data model shows limited examples. | TBD | TBD |
| 7 | At Risk Reason option set values are listed in data model but need confirmation: Are all values applicable enterprise-wide or filtered by division? | TBD | TBD |

---

#### 4.5.2 Form Mockup — **Contact** Entity (Contact Main Form)

**Form Metadata**

| Property | Value |
|---|---|
| Form Name | Contact Main Form |
| Entity | Contact |
| Form Type | Main |
| BPF Enabled | No |
| Form Security | Missing — to be confirmed with security team |
| Related User Stories | PHX-1598, PHX-1561, PHX-92, PHX-93, PHX-94, PHX-91, PHX-362, PHX-366, PHX-368, PHX-369 |

---

**► RIBBON (Command Bar)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONTACT  │  + New  │  💾 Save  │  🗑 Delete  │  Deactivate  │  ··· More       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Button Label | Button Type | Visible When | Enabled When | Related Story |
|---|---|---|---|---|
| New | OOB | Always | Always | PHX-92 |
| Save | OOB | Always | Form has unsaved changes | PHX-92 |
| Deactivate | OOB | Record is Active | User has Write privilege | PHX-93 |
| Delete | Custom | Always | User has Delete privilege (elevated) | PHX-94 |

---

**► HEADER** *(2-column, always visible, pinned to top of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Full Name              [RO][Text]│  Owner                [R][Lookup]│
│  ________________________________│  ________________________________│
│  Parent Account         [R][Lookup]│  Status             [RO][Choice]│
└──────────────────────────────────┴──────────────────────────────────┘
```

| Position | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Header — Col 1 | Full Name | `fullname` | Text | `[RO]` Read-Only | Calculated from First + Middle + Last Name |
| Header — Col 2 | Owner | `ownerid` | Lookup (User/Team) | `[R]` Required | OOB ownership field |
| Header — Col 1 | Parent Account | `parentcustomerid` | Lookup (Account) | `[R]` Required | Required per PHX-92 |
| Header — Col 2 | Status | `statecode` | Choice | `[RO]` Read-Only | Active (0) / Inactive (1) per PHX-369 |

---

**► TAB 1 — General**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 1: General                                                      ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Contact Information            ║  SECTION: Flags           ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  First Name            [R][Text]         ║  Primary Contact[O][Boolean]║
║  Middle Name           [O][Text]         ║  Training Enrollment      ║
║  Last Name             [R][Text]         ║              [O][Boolean] ║
║  Job Title             [O][Text]         ║                           ║
║  Parent Account        [R][Lookup]       ║                           ║
╠══════════════════════════════════════════╩═══════════════════════════╣
║  SECTION: Contact Details                (Full width — 2 columns)   ║
║  ─────────────────────────────────────────────────────────────────  ║
║  Email                 [R][Text]         Business Phone  [O][Text]  ║
║  Mobile Phone          [O][Text]         Fax             [O][Text]  ║
╚══════════════════════════════════════════════════════════════════════╝
```

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Contact Information | First Name | `firstname` | Text (50) | `[R]` Required | Required per PHX-362 |
| Contact Information | Middle Name | `middlename` | Text (50) | `[O]` Optional | OOB field |
| Contact Information | Last Name | `lastname` | Text (50) | `[R]` Required | Required per PHX-362 |
| Contact Information | Job Title | `jobtitle` | Text (100) | `[O]` Optional | OOB field |
| Contact Information | Parent Account | `parentcustomerid` | Lookup (Account) | `[R]` Required | Required per PHX-92 |
| Flags | Primary Contact | `sw_primarycontact` | Boolean | `[O]` Optional | Only one Primary per Account per PHX-368 |
| Flags | Training Enrollment | `sw_trainingenrollment` | Boolean | `[O]` Optional | CBG-specific per PHX-366 |
| Contact Details | Email | `emailaddress1` | Text (100) | `[R]` Required | Required per PHX-362; Email format validation |
| Contact Details | Business Phone | `telephone1` | Text (50) | `[O]` Optional | OOB field |
| Contact Details | Mobile Phone | `mobilephone` | Text (50) | `[O]` Optional | OOB field |
| Contact Details | Fax | `fax` | Text (50) | `[O]` Optional | OOB field |

---

**► TAB 2 — Address**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 2: Address                                                      ║
║  SECTION: Address Information            (2-column layout)           ║
║  ─────────────────────────────────────────────────────────────────  ║
║  Street 1              [O][Text]         City            [O][Text]  ║
║  Street 2              [O][Text]         State/Province  [O][Text]  ║
║  Street 3              [O][Text]         Zip/Postal Code [O][Text]  ║
║                                          Country         [O][Text]  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► TAB 3 — Timeline**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 3: Timeline                                                     ║
║  SECTION: Activity Timeline Control      (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Activity Timeline Control - Shows Tasks, Phone Calls,              ║
║   Appointments, Emails, Notes related to this Contact per PHX-99]   ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► FOOTER**

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Created By        [RO][Lookup]  │  Created On       [RO][DateTime] │
│  Modified By       [RO][Lookup]  │  Modified On      [RO][DateTime] │
└──────────────────────────────────┴──────────────────────────────────┘
```

**Open Questions — Contact Form Mockup**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Should system auto-unmark existing Primary Contact when new Primary is set, or display error? | TBD | TBD |
| 2 | What are the exact duplicate detection matching rules for Email + Last Name per PHX-91? | TBD | TBD |
| 3 | Is Training Enrollment field visible only for CBG users or all users? | TBD | TBD |

---

#### 4.5.3 Form Mockup — **Lead** Entity (Lead Main Form)

**Form Metadata**

| Property | Value |
|---|---|
| Form Name | Lead Main Form |
| Entity | Lead |
| Form Type | Main |
| BPF Enabled | Yes (Lead Qualification Process) |
| Form Security | Missing — to be confirmed with security team |
| Related User Stories | PHX-1605, PHX-1576, PHX-84, PHX-112, PHX-357, PHX-1354 |

---

**► RIBBON (Command Bar)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  LEAD  │  + New  │  💾 Save  │  ✅ Qualify  │  ❌ Disqualify  │  ··· More      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Button Label | Button Type | Visible When | Enabled When | Related Story |
|---|---|---|---|---|
| New | OOB | Always | Always | — |
| Save | OOB | Always | Form has unsaved changes | — |
| Qualify | OOB | Lead Status = Active | User has Write privilege | PHX-84, PHX-357 |
| Disqualify | OOB | Lead Status = Active | User has Write privilege | PHX-112, PHX-357 |

---

**► HEADER** *(2-column, always visible, pinned to top of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Topic                  [R][Text]│  Owner                [R][Lookup]│
│  ________________________________│  ________________________________│
│  Lead Source          [O][Choice]│  Status               [RO][Choice]│
└──────────────────────────────────┴──────────────────────────────────┘
```

| Position | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Header — Col 1 | Topic | `subject` | Text (200) | `[R]` Required | OOB field |
| Header — Col 2 | Owner | `ownerid` | Lookup (User/Team) | `[R]` Required | OOB ownership field |
| Header — Col 1 | Lead Source | `leadsourcecode` | Choice | `[O]` Optional | Web, Referral, Campaign, etc. |
| Header — Col 2 | Status | `statecode` | Choice | `[RO]` Read-Only | Active (0), Qualified (1), Disqualified (2) per PHX-357 |

---

**► TAB 1 — General**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 1: General                                                      ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Lead Information               ║  SECTION: Contact Info    ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Topic                 [R][Text]         ║  Email        [R][Text]   ║
║  First Name            [R][Text]         ║  Business Phone[O][Text]  ║
║  Last Name             [R][Text]         ║  Mobile Phone [O][Text]   ║
║  Company Name          [R][Text]         ║                           ║
║  Job Title             [O][Text]         ║                           ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

| Section | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Lead Information | Topic | `subject` | Text (200) | `[R]` Required | OOB field |
| Lead Information | First Name | `firstname` | Text (50) | `[R]` Required | OOB field |
| Lead Information | Last Name | `lastname` | Text (50) | `[R]` Required | OOB field |
| Lead Information | Company Name | `companyname` | Text (100) | `[R]` Required | OOB field |
| Lead Information | Job Title | `jobtitle` | Text (100) | `[O]` Optional | OOB field |
| Contact Info | Email | `emailaddress1` | Text (100) | `[R]` Required | Email format validation |
| Contact Info | Business Phone | `telephone1` | Text (50) | `[O]` Optional | OOB field |
| Contact Info | Mobile Phone | `mobilephone` | Text (50) | `[O]` Optional | OOB field |

---

**► TAB 2 — Timeline**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 2: Timeline                                                     ║
║  SECTION: Activity Timeline Control      (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Activity Timeline Control - Shows all lead activities per PHX-1354]║
║  [Activities transfer to Account/Contact on qualification]           ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► FOOTER**

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Created By        [RO][Lookup]  │  Created On       [RO][DateTime] │
│  Modified By       [RO][Lookup]  │  Modified On      [RO][DateTime] │
└──────────────────────────────────┴──────────────────────────────────┘
```

**Open Questions — Lead Form Mockup**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What are the complete BPF stages for Lead Qualification Process? | TBD | TBD |
| 2 | Should Opportunity be automatically created on Qualify for certain Lead Sources? | TBD | TBD |
| 3 | What are the complete Status Reason values for Disqualified status per PHX-112? | TBD | TBD |

---

#### 4.5.4 Form Mockup — **Opportunity** Entity (Opportunity Main Form)

**Form Metadata**

| Property | Value |
|---|---|
| Form Name | Opportunity Main Form |
| Entity | Opportunity |
| Form Type | Main |
| BPF Enabled | Yes (Opportunity Sales Process) |
| Form Security | Missing — to be confirmed with security team |
| Related User Stories | PHX-1608, PHX-1570 |

---

**► RIBBON (Command Bar)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  OPPORTUNITY  │  + New  │  💾 Save  │  Quote  │  Close as Won  │  Close as Lost │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

**► HEADER** *(2-column, always visible, pinned to top of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Topic                  [R][Text]│  Owner                [R][Lookup]│
│  ________________________________│  ________________________________│
│  Estimated Revenue  [O][Currency]│  Est. Close Date      [R][Date]  │
└──────────────────────────────────┴──────────────────────────────────┘
```

| Position | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Header — Col 1 | Topic | `name` | Text (300) | `[R]` Required | OOB field |
| Header — Col 2 | Owner | `ownerid` | Lookup (User/Team) | `[R]` Required | OOB ownership field |
| Header — Col 1 | Estimated Revenue | `estimatedvalue` | Currency | `[O]` Optional | OOB field; supports multi-currency per PHX-1514 |
| Header — Col 2 | Est. Close Date | `estimatedclosedate` | Date Only | `[R]` Required | OOB field |

---

**► TAB 1 — Opportunity**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 1: Opportunity                                                  ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Opportunity Information        ║  SECTION: Sales Process   ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Topic                 [R][Text]         ║  Sales Stage  [R][Choice] ║
║  Parent Account        [R][Lookup]       ║  Status       [RO][Choice]║
║  Primary Contact       [O][Lookup]       ║  Probability  [O][%]      ║
║  Currency              [R][Lookup]       ║  Status Reason[RO][Choice]║
║  Estimated Revenue     [O][Currency]     ║                           ║
║  Estimated Close Date  [R][Date]         ║                           ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

---

**► TAB 2 — Quotes**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 2: Quotes                                                       ║
║  SECTION: Quotes Subgrid                 (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Quotes Subgrid - Shows all Quote records for this Opportunity]    ║
║  Columns: Name, Account, Total Amount, Status, Created On           ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► TAB 3 — Timeline**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 3: Timeline                                                     ║
║  [Activity Timeline Control]                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► FOOTER**

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Created By        [RO][Lookup]  │  Created On       [RO][DateTime] │
│  Modified By       [RO][Lookup]  │  Modified On      [RO][DateTime] │
└──────────────────────────────────┴──────────────────────────────────┘
```

---

#### 4.5.5 Form Mockup — **Quote** Entity (Quote Main Form)

**Form Metadata**

| Property | Value |
|---|---|
| Form Name | Quote Main Form |
| Entity | Quote |
| Form Type | Main |
| BPF Enabled | TBD (Quote Approval Process) |
| Form Security | Missing — to be confirmed with security team |
| Related User Stories | PHX-1619, PHX-1573 |

---

**► RIBBON (Command Bar)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  QUOTE  │  + New  │  💾 Save  │  Activate Quote  │  Close Quote  │  Create PDF  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

**► HEADER** *(2-column, always visible, pinned to top of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Name                   [R][Text]│  Account              [R][Lookup]│
│  ________________________________│  ________________________________│
│  Total Amount       [RO][Currency]│  Status             [RO][Choice]│
└──────────────────────────────────┴──────────────────────────────────┘
```

| Position | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Header — Col 1 | Name | `name` | Text (300) | `[R]` Required | OOB field |
| Header — Col 2 | Account | `customerid` | Lookup (Account) | `[R]` Required | OOB field |
| Header — Col 1 | Total Amount | `totalamount` | Currency | `[RO]` Calculated | Calculated from quote lines; supports multi-currency per PHX-1514 |
| Header — Col 2 | Status | `statecode` | Choice | `[RO]` Read-Only | Draft (0), Active (1), Won (2), Closed (3) |

---

**► TAB 1 — Summary**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 1: Summary                                                      ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: Quote Information              ║  SECTION: Pricing Summary ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  Name                  [R][Text]         ║  Total Amount [RO][Currency]║
║  Account               [R][Lookup]       ║  Total Discount[O][Currency]║
║  Opportunity           [O][Lookup]       ║  Freight Amount[O][Currency]║
║  Contact               [O][Lookup]       ║  Total Tax    [RO][Currency]║
║  Currency              [R][Lookup]       ║  Grand Total  [RO][Currency]║
║  Effective From        [O][Date]         ║                           ║
║  Effective To          [O][Date]         ║                           ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

---

**► TAB 2 — Products**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 2: Products                                                     ║
║  SECTION: Quote Products Subgrid         (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Quote Products Subgrid - Shows line items with products/services]  ║
║  Columns: Product, Quantity, Price Per Unit, Discount, Total Amount  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► TAB 3 — Timeline**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 3: Timeline                                                     ║
║  [Activity Timeline Control]                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► FOOTER**

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Created By        [RO][Lookup]  │  Created On       [RO][DateTime] │
│  Modified By       [RO][Lookup]  │  Modified On      [RO][DateTime] │
└──────────────────────────────────┴──────────────────────────────────┘
```

---

#### 4.5.6 Form Mockup — **Territory** Entity (Territory Main Form)

**Form Metadata**

| Property | Value |
|---|---|
| Form Name | Territory Main Form |
| Entity | Territory |
| Form Type | Main |
| BPF Enabled | No |
| Form Security | Read-only for Sales Rep and Sales Manager per PHX-1563; Read/Write for System Admin |
| Related User Stories | PHX-1624, PHX-1563 |

---

**► RIBBON (Command Bar)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TERRITORY  │  + New  │  💾 Save  │  🗑 Delete  │  ··· More                     │
│  [New/Save/Delete buttons disabled for Sales Rep/Sales Manager roles]           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

**► HEADER** *(2-column, always visible, pinned to top of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Name                   [R][Text]│  Manager              [O][Lookup]│
└──────────────────────────────────┴──────────────────────────────────┘
```

| Position | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Header — Col 1 | Name | `name` | Text (200) | `[R]` Required | OOB field |
| Header — Col 2 | Manager | `managerid` | Lookup (User) | `[O]` Optional | Territory Manager |

---

**► TAB 1 — General**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 1: General                                                      ║
║  SECTION: Territory Information          (Full width — 2 columns)    ║
║  ─────────────────────────────────────────────────────────────────  ║
║  Name                  [R][Text]         Manager         [O][Lookup] ║
║  Description           [O][MultiLine]                                ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► TAB 2 — Members**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 2: Members                                                      ║
║  SECTION: Territory Members Subgrid      (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Territory Members Subgrid - Users assigned to this Territory]      ║
║  Columns: User Name, Business Unit, Security Roles                   ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► TAB 3 — Accounts**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 3: Accounts                                                     ║
║  SECTION: Accounts Subgrid               (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Accounts Subgrid - Accounts assigned to this Territory]            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► FOOTER**

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Created By        [RO][Lookup]  │  Created On       [RO][DateTime] │
│  Modified By       [RO][Lookup]  │  Modified On      [RO][DateTime] │
└──────────────────────────────────┴──────────────────────────────────┘
```

**Open Questions — Territory Form Mockup**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Territory is Organization-owned per OOB D365 design. Confirm this is acceptable. | TBD | TBD |
| 2 | Sales Rep/Sales Manager have Organization-level Read access per PHX-1563. Confirm no Write access needed. | TBD | TBD |

---

#### 4.5.7 Form Mockup — **User** Entity (User Main Form)

**Form Metadata**

| Property | Value |
|---|---|
| Form Name | User Main Form |
| Entity | System User (User) |
| Form Type | Main |
| BPF Enabled | No |
| Form Security | Most fields read-only; only System Administrator can modify security |
| Related User Stories | PHX-1626, PHX-1519 |

---

**► RIBBON (Command Bar)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  USER  │  💾 Save  │  Manage Roles  │  Reset Password  │  Disable  │  ··· More  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

**► HEADER** *(2-column, always visible, pinned to top of form)*

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Full Name              [RO][Text]│  Business Unit        [R][Lookup]│
│  ________________________________│  ________________________________│
│  User Name              [RO][Text]│  User Type            [RO][Choice]│
└──────────────────────────────────┴──────────────────────────────────┘
```

| Position | Field Display Name | Schema Name | Field Type | Requirement | Notes |
|---|---|---|---|---|---|
| Header — Col 1 | Full Name | `fullname` | Text | `[RO]` Read-Only | Calculated from First + Last Name |
| Header — Col 2 | Business Unit | `businessunitid` | Lookup (BU) | `[R]` Required | Determines data access scope per PHX-1519 |
| Header — Col 1 | User Name | `domainname` | Text | `[RO]` Read-Only | Azure AD UPN; synced from Azure AD |
| Header — Col 2 | User Type | `accessmode` | Choice | `[RO]` Read-Only | Read-Write, Administrative, Read, etc. |

---

**► TAB 1 — Summary**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 1: Summary                                                      ║
╠══════════════════════════════════════════╦═══════════════════════════╣
║  SECTION: User Information               ║  SECTION: Contact Details ║
║  ─────────────────────────────────────── ║  ──────────────────────── ║
║  First Name            [R][Text]         ║  Business Phone[O][Text]  ║
║  Last Name             [R][Text]         ║  Mobile Phone [O][Text]   ║
║  Primary Email         [RO][Text]        ║  Address      [O][Text]   ║
║  Business Unit         [R][Lookup]       ║  City         [O][Text]   ║
║  Manager               [O][Lookup]       ║  State        [O][Text]   ║
╚══════════════════════════════════════════╩═══════════════════════════╝
```

---

**► TAB 2 — Administration**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 2: Administration                                               ║
║  SECTION: Security Roles                 (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Security Roles Subgrid - Shows assigned security roles per        ║
║   PHX-1560, PHX-1561, PHX-1563, PHX-1570, PHX-1573, PHX-1576]       ║
║  Columns: Role Name, Business Unit                                   ║
║                                                                      ║
║  SECTION: Teams                          (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Teams Subgrid - Shows team memberships]                            ║
║                                                                      ║
║  SECTION: Territories                    (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Territories Subgrid - Shows territory assignments per PHX-1563]    ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► TAB 3 — Field Security**

```
╔══════════════════════════════════════════════════════════════════════╗
║  TAB 3: Field Security                                               ║
║  SECTION: Field Security Profiles        (Full width)                ║
║  ─────────────────────────────────────────────────────────────────  ║
║  [Field Security Profiles Subgrid - Shows assigned profiles such as  ║
║   Financial Fields Profile]                                          ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

**► FOOTER**

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  Created By        [RO][Lookup]  │  Created On       [RO][DateTime] │
│  Modified By       [RO][Lookup]  │  Modified On      [RO][DateTime] │
└──────────────────────────────────┴──────────────────────────────────┘
```

**Open Questions — User Form Mockup**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | User records created via Azure AD sync. Manual user creation disabled. Confirm. | TBD | TBD |
| 2 | What security roles can assign/modify other users' security roles? | TBD | TBD |

---

## 5. Reports and Dashboards

### 5.1 Reports

#### 5.1.1 Reporting Categories

- Account Performance
- Account Status Tracking
- Financial Analysis (Secured)
- TBD

#### 5.1.2 Report – **Account Status Summary** Report

| Setting | Value |
|---|---|
| Report Name | Account Status Summary |
| Report Type | SSRS |
| Report Description | Summary report showing accounts grouped by Account Status and Status Reason |
| Related Record Types | Account |
| Filter Criteria | Status = Active, InactiveDate in last 90 days |
| Sub Report | TBD |
| CRM View Used | All Accounts |
| Grouping | Group by Account Status, then by Status Reason |

**Report Columns:**
- Account Name
- Account Status
- Status Reason
- Owner
- Inactive Date
- Inactive Reason Description

### 5.2 Charts

#### 5.2.1 Chart – **Accounts by Type**

| Setting | Value |
|---|---|
| Chart Name | Accounts by Type |
| Chart Type | Column Chart |
| Description | Displays count of accounts grouped by Account Type |
| Entity | Account |
| Field | Account Type (Count) |
| Legend / Category Axis | Account Type |
| Horizontal Axis | Created Date (Month) |
| Filter | Status = Active |

### 5.3 Dashboards

#### 5.3.1 Dashboard – **Account Management** Dashboard

| Setting | Value |
|---|---|
| Dashboard Name | Account Management Dashboard |
| Layout | 2-Column Regular |
| Description | Primary dashboard for sales reps and managers to monitor account portfolio |
| Security | Sales Representative, Sales Manager roles |

**Dashboard Components:**

1. **Chart**: Accounts by Type (references section 5.2.1)
2. **List**: My Active Accounts (references view from section 4.4.1)
3. **Chart**: TBD
4. **List**: TBD (view reference TBD)

**Open Questions**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What additional charts and lists should be included on the Account Management Dashboard? | TBD | TBD |
| 2 | Are there division-specific dashboards required (PCG vs CBG)? | TBD | TBD |

---

## 6. Application Security

### 6.1 Security Design Approach

The Phoenix CRM security model leverages Dynamics 365 role-based access control (RBAC) with a multi-tiered business unit hierarchy aligned to the Sherwin-Williams organizational structure including Enterprise, Group Level, and Regional levels. Security roles define entity-level privileges (Create, Read, Write, Delete, Append, Assign, Share) scoped at Business Unit level by default to support territory-based sharing model for sales operations. Field-level security is implemented for financial and sensitive data fields requiring restricted access to specific user profiles such as sales leadership and finance teams. The full security role matrix and privilege mappings are still under review with the security team and some access levels remain TBD pending stakeholder sign-off.

### 6.2 Business Unit Hierarchy

*[Business Unit Hierarchy Diagram – To Be Inserted]*

The Phoenix CRM business unit structure will consist of a root business unit representing Sherwin-Williams at the enterprise level with child business units aligned to organizational hierarchy. The exact structure and naming conventions for divisional and regional business units are TBD pending confirmation from HR and organizational design teams.</p>

**Business Unit Hierarchy** (per PHX-1519):

- **Level 1**: S-W (Root Business Unit) — Sherwin-Williams
- **Level 2**: Enterprise / Customer Service — Enterprise-wide functions and customer service operations
- **Level 3**: Group Level — PCG (Performance Coatings Group) / CBG (Consumer Brands Group)
- **Level 4**: Region — Divisional VPs and GMs managing multiple divisions under a region
- **Level 5 (Division)**: TBD — covered in separate story/iteration per PHX-1519

**Notes from PHX-1519:**
- Enterprise and Customer Service personnel will be assigned to Enterprise BU (Level 2) given they work across Sherwin-Williams as a whole
- Group Level BUs (Level 3) dedicated to leaders of PCG vs CBG groups
- Region level (Level 4) will consist of Divisional VPs and GMs who oversee multiple divisions under a region; some nuances exist where VPs/GMs may be assigned to a specific division vs a region

### 6.3 Security Roles

#### 6.3.1 Overview

Security roles in the Phoenix CRM solution define user access to entities, processes, and data based on job function and organizational level. All security roles are configured at the Root Business Unit level with privileges scoped at Business Unit level to support territory-based access patterns (per PHX-1560, PHX-1561, PHX-1563, PHX-1570, PHX-1573, PHX-1576).

| Security Role Name | Description | Key Security Implications | Business Unit |
|---|---|---|---|
| Sales Representative | Front-line sales role with read/write access to Account, Contact, Lead, Opportunity, Quote entities | Account: Create, Read, Write, Append (BU-level). Lead: Create, Read, Write, Append (BU-level). Territory: Read only (Organization-level). Note: No delete privileges on any entity per security stories PHX-1560, PHX-1561, PHX-1576. | Root BU (privileges scoped at BU level) |
| Sales Manager | Sales leadership role with extended privileges including write access to territories and enhanced reporting access | Account: Create, Read, Write, Append (BU-level). Lead: Create, Read, Write, Append (BU-level). Opportunity: Create, Read, Write, Append (BU-level). Territory: Read only (Organization-level). Note: No delete privileges except for activities per PHX-1560, PHX-1561, PHX-1570. | Root BU (privileges scoped at BU level) |
| System Administrator | Full system access for configuration and administration | Full Create, Read, Write, Delete, Append, Assign, Share across all entities at Organization level | Root BU (Organization-level scope) |

**Note**: Territory table security per PHX-1563 specifies Organization-level read access for both Sales Rep and Sales Manager roles, not BU-level. Territory table OOB is organization level of access per data team feedback.

### 6.4 Teams

#### 6.4.1 Record Owning Teams

| Team Name | Team Type | Business Unit | Administrator | Description |
|---|---|---|---|---|
| PCG Sales Team | Owner | PCG Group BU | TBD | Record-owning team for PCG sales organization |
| CBG Sales Team | Owner | CBG Group BU | TBD | Record-owning team for CBG sales organization |

#### 6.4.2 Access Teams

| Team Name | Team Type | Description | Access Rights |
|---|---|---|---|
| Account Collaboration Team | Access | Provides temporary read/write access to Account records for cross-functional collaboration | Read, Write |

**Access Team Template:**

| Template Name | Entity | Access Rights | Description |
|---|---|---|---|
| Account Access Team Template | Account | Read, Write | Template for granting access team members read and write privileges on specific Account records |

### 6.5 Field Based Security

#### 6.5.1 Field Security Profile 1 – Financial Fields Profile

| Setting | Value |
|---|---|
| Name | Financial Fields Profile |
| Description | Provides read access to financial fields on Account entity for users requiring visibility to revenue, purchase potential, and financial metrics |
| Member Teams | TBD |
| Member Users | TBD |

**Field Security Permissions:**

| Entity | Field Name | Allow Read | Allow Update | Allow Delete |
|---|---|---|---|---|
| Account | Annual Purchase Potential | Yes | No | No |
| Account | Annual Revenue | Yes | No | No |
| Account | Current YTD Sales | Yes | No | No |
| Account | $ Change | Yes | No | No |
| Account | Current Year Through Last Month | Yes | No | No |
| Account | Expected FY Revenue | Yes | No | No |
| Account | Estimated Potential | Yes | No | No |
| Account | % Chance of Losing Business | Yes | No | No |
| Account | % of Business at Risk | Yes | No | No |
| Account | % of Business We Own | Yes | No | No |

**Note**: All financial fields marked as "Financial Fields need more discussion" in data model. Field requirement and data types TBD.

### 6.6 User Role to Application Security Mapping

| User Role | Security Role | Field Security Profile | Teams | Access Level |
|---|---|---|---|---|
| Sales Representative | Sales Representative | Financial Fields Profile | PCG Sales Team / CBG Sales Team (as applicable) | Business Unit |
| Sales Manager | Sales Manager | TBD | TBD | Business Unit |
| System Administrator | System Administrator | TBD | N/A | Organization |

**Open Questions — Security**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Which users/roles should be assigned to Financial Fields Profile? Sales Managers only, or Sales Reps as well? | TBD | TBD |
| 2 | Are additional field security profiles required (e.g., for PII data, strategic account information)? | TBD | TBD |
| 3 | Business Unit hierarchy Level 5 (Division) structure and naming to be confirmed. | TBD | TBD |
| 4 | Should Access Teams be pre-created or dynamically generated by system workflows? | TBD | TBD |
| 5 | Territory table access: Sales Rep and Sales Manager both have Read-only access at Organization level per PHX-1563, but should Territory assignment for Account records be writable? | TBD | TBD |

---

## 7. Entity Model

### 7.1 Logical Entity Relationship Diagram (ERD)

*[ERD Diagram – To Be Inserted]*

The Phoenix CRM data model centers around the Account entity as the primary customer record with relationships to Contact (1:N), Opportunity (1:N), Quote (1:N), and Territory (N:1) entities. Lead entity converts to Account via OOB qualification process. Account entity supports self-referential parent-child hierarchy for complex organizational structures.

### 7.2 **Account** Entity

#### 7.2.1 Entity Description

The Account entity represents customer organizations (both prospects and existing customers) within the Sherwin-Williams CRM system and serves as the primary container for relationship management across integrated ERP accounts and manually-created non-integrated accounts. Account records support categorization via Classification and Segmentation lookups, territory assignment, status lifecycle tracking, and financial performance metrics secured for appropriate user roles.

#### 7.2.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Account |
| Plural Name | Accounts |
| Schema Name | account |
| Ownership | User or Team |
| Description | Customer and prospect organizations |
| Primary Image | Missing |
| Define as activity entity? | No |
| Display in Activity Menus? | No |

**Options for this Entity**

| Option | Enabled |
|---|---|
| Business Process Flows | TBD |
| Notes (Attachments) | Yes |
| Activities | Yes |
| Connections | Missing |
| Sending Email | Yes |
| Mail Merge | Missing |
| Document Management | Missing |
| Queues | Missing |
| Auditing | Yes |
| Change Tracking | Missing |
| Allow Quick Create | Yes |
| Duplicate Detection | Yes |
| Mobile Offline | Missing |
| CRM for Phones | Missing |
| CRM for Tablets | Missing |

#### 7.2.3 Form Order

Missing — pending UI design sign-off

#### 7.2.4 Entity Relationships

**Many-to-One (N:1) Relationships:**
- Account → Classification (Lookup to Classification Table) — per PHX-2855, PHX-2377
- Account → Segmentation (Lookup to Segmentation Table) — per PHX-2855, PHX-2377
- Account → Account Source (Lookup to Account Source Table) — per PHX-2377
- Account → CAC Code (Lookup to CAC Code Table) — data model reference
- Account → Division (Lookup to Division) — data model reference
- Account → Currency (Lookup to Currency table OOB) — data model reference
- Account → Parent Account (self-referential hierarchy) — OOB

**One-to-Many (1:N) Relationships:**
- Account → Contact — OOB
- Account → Opportunity — OOB
- Account → Quote — OOB
- Account → Child Accounts (self-referential hierarchy) — OOB

**Many-to-Many (N:N) Relationships:**
- Missing — not specified in current user stories

#### 7.2.5 Attribute Definitions

**Note**: The following attributes are derived from the Account sheet of the Data Dictionary (Sherwin_ D365 Data Dictionary_10Mar.csv). Schema names marked as "Missing" where not provided in source file. Field requirements marked as "TBD" where data model indicates "Financial Fields need more discussion", blank values, or conflicting guidance between PCG and CBG.

| Display Name | Schema Name | Attribute Type | Attribute Type Details | Field Requirement | Secured | Audited | Notes / Comments |
|---|---|---|---|---|---|---|---|
| $ Change | Missing | Currency | Currency | TBD | Yes (Financial Field) | TBD | Financial Fields need more discussion per data model. Duplicate of Year over Year Change per comments. |
| % Chance of Losing Business | Missing | Choice | Choice | TBD | Yes (Financial Field) | TBD | Financial Fields need more discussion per data model. |
| % of Business at Risk | Missing | Choice | Choice | TBD | Yes (Financial Field) | TBD | Financial Fields need more discussion per data model. |
| % of Business We Own | Missing | Choice | Choice | TBD | Yes (Financial Field) | TBD | Financial Fields need more discussion per data model. |
| Account Branch | Missing | Single Line of Text | Text | No | No | TBD | Related accounts as bill-to or ship-to. Not required per data model. |
| Account Classification Code | Missing | Choice | Choice | No | No | TBD | Not needed per data model. |
| Account Currency | Missing | Lookup | Currency table (OOB) | Required for CBG | No | TBD | Duplicate of Currency ISO Code per data model. |
| Account Description | `description` | Multiple Lines of Text | Length: 4000 | No | No | TBD | OOB field. |
| Account Fax | `address1_fax` | Single Line of Text | Length: 100 | No | No | TBD | OOB field. |
| Account Name | `name` | Single Line of Text | Text; Max length: 160 | Required for PCG, Required for CBG | No | Yes | OOB field. Primary name field. |
| Account Number | `accountnumber` | Single Line of Text | Text; Max length: 20 | Required for integrated accounts; Not required for manual/non-integrated accounts | No | Yes | Populated by integration. |
| Account Open Date | Missing | Date | Date | TBD | No | TBD | Integrated accounts only; Date field only (no time component per data model). |
| Account Phone | `address1_telephone1` | Single Line of Text | Text; Max length: 50 | Required for PCG, Required for CBG | No | TBD | OOB field. |
| Account Record Type | Missing | Choice | Options: Integrated, Non Integrated | Required for PCG, Required for CBG | No | TBD | User story PHX-2855. |
| Account Source | Missing | Lookup | Lookup to Account Source Table | No | No | TBD | Account Source is a master table per PHX-2377. |
| Account Status | `statuscode` | Status | Active/Inactive | Required for PCG, Required for CBG | No | Yes | OOB Status Reason field. |
| Account Stage / Account Phase | Missing | Choice | Options: New, Lost, Core (PCG); K.O.N.E.P (CBG) | Required for CBG per data model | No | TBD | Not needed as of now per data model comments. |
| Account Type | Missing | Choice | Key, Opportunity, Existing, Prospect, New, Lost | No | No | TBD | Manual records default to non-ERP per data model. |
| Address 1: County | `address1_county` | Single Line of Text | Text; Max length: 50 | Required for integrated, Optional for non-integrated | No | TBD | Standardization required per data model. Lookup needed but text also needed for map functionality. |
| Address 1: Street 2 | `address1_line2` | Single Line of Text | Text; Max length: 250 | Required for integrated, Optional for non-integrated | No | TBD | OOB field. |
| Address 1: Street 3 | `address1_line3` | Single Line of Text | Text; Max length: 250 | Required for integrated, Optional for non-integrated | No | TBD | OOB field. |
| Annual Purchase Potential | Missing | Currency | Currency field | Required for PCG (0 if not in source), Required for CBG (0 if not in source) | Yes (Financial Field) | TBD | Integrated comes from source vs Manual is user input. |
| Annual Revenue | `revenue` | Currency | Currency | TBD | Yes (Financial Field) | TBD | Duplicate of Revenue per data model. OOB revenue field. |
| At Risk | Missing | Two Options | Yes/No | No | No | TBD | Boolean flag. |
| At Risk Comments | Missing | Multiple Lines of Text | Length: 4000 | No | No | TBD | Free text. |
| At Risk Reason | Missing | Choice | Current State values: Color, Color Tools, Competitor Specification, Consolidation, Credit, Didn't show Enough Value, Hard Parts Discount, No Decision, Not an Approved Paint Line, Out of Business, Pre-bate, Price, Product Approval, Product Performance, Product Quality, Relationship – Brand Preference, Relationship – Competitive Supplier, Relationship – Employee Turnover, Service – Branch/Distributor Support, Service – Sales Support, Service – Technical Support, Service & Support, Strategic Decision, Supply Chain, Technology Fit, Tier Not Awarded Program, Other | Required if At Risk = True | No | TBD | Choice field with predefined options. |
| Billing Address | `address1_name` | Single Line of Text | Text | Required for integrated, Optional for non-integrated | No | TBD | OOB field. |
| Billing City | `address1_city` | Single Line of Text | Text; Max length: 80 | Required for integrated, Optional for non-integrated | No | TBD | OOB field. |
| Billing Country | `address1_country` | Single Line of Text | Text; Max length: 80 | Required for integrated, Optional for non-integrated | No | TBD | OOB field. Make it a table instead of text per data model feedback. |
| Billing Latitude | `address1_latitude` | Double | Double | TBD | No | TBD | OOB field. System-calculated. |
| Billing Longitude | `address1_longitude` | Double | Double | TBD | No | TBD | OOB field. System-calculated. |
| Billing State/Province | `address1_stateorprovince` | Single Line of Text | Text; Max length: 50 | Required for integrated, Optional for non-integrated | No | TBD | OOB field. |
| Billing Street | `address1_line1` | Single Line of Text | Text; Max length: 250 | Required for integrated, Optional for non-integrated | No | TBD | OOB field. |
| Billing Zip/Postal Code | `address1_postalcode` | Single Line of Text | Text; Max length: 20 | Required for integrated, Optional for non-integrated | No | TBD | OOB field. |

*Full attribute list to be completed – remaining fields TBD. Limited to first 30 fields alphabetically as they appear in data model per template guidance.*

**Open Questions — Account Entity Model**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | Financial fields data types and requirement status need clarification: "Financial Fields need more discussion" appears on multiple fields ($ Change, % Chance of Losing Business, % of Business at Risk, % of Business We Own, Annual Revenue, Expected FY Revenue, etc.). | TBD | TBD |
| 2 | Schema names are Missing for majority of custom fields — these must be provided by data team before development. | TBD | TBD |
| 3 | Conflicting guidance on requirement levels between PCG and CBG for several fields — need consolidated requirement determination. | TBD | TBD |
| 4 | Several fields marked as "Not Needed" in data model (Account Branch, Account Classification Code, Home Store Number, Division, Account Stage, Currency ISO Code, Comments/Description duplicate) — should these be excluded from FDD entirely? | TBD | TBD |
| 5 | Duplicate fields identified in data model: $ Change / Year over Year Change; Account Currency / Currency ISO Code; Description / Comments; Annual Revenue / Revenue. Confirm which should be retained. | TBD | TBD |

---

#### 7.2.6 Option Sets (Choice Fields)

**Option Set: Account Type**

| Setting | Value |
|---|---|
| Display Name | Account Type |
| Option Set Type | Local (Account entity) |
| Description | Categorizes accounts by type |

**Options:**

| Label | Value | Order | Default |
|---|---|---|---|
| Key | 1 | 1 | No |
| Opportunity | 2 | 2 | No |
| Existing | 3 | 3 | No |
| Prospect | 4 | 4 | No |
| New | 5 | 5 | No |
| Lost | 6 | 6 | No |

**Default Value**: Missing

---

**Option Set: Account Record Type**

| Setting | Value |
|---|---|
| Display Name | Account Record Type |
| Option Set Type | Local (Account entity) |
| Description | Indicates whether account is integrated from ERP/domain or manually created |

**Options:**

| Label | Value | Order | Default |
|---|---|---|---|
| Integrated | 1 | 1 | No |
| Non Integrated | 2 | 2 | No |

**Default Value**: Missing

---

**Option Set: Account Stage / Account Phase**

| Setting | Value |
|---|---|
| Display Name | Account Stage |
| Option Set Type | Local (Account entity) |
| Description | Tracks account lifecycle stage |

**Options (PCG):**

| Label | Value | Order | Default |
|---|---|---|---|
| New | 1 | 1 | No |
| Lost | 2 | 2 | No |
| Core | 3 | 3 | No |

**Options (CBG):**

| Label | Value | Order | Default |
|---|---|---|---|
| K | 1 | 1 | No |
| O | 2 | 2 | No |
| N | 3 | 3 | No |
| E | 4 | 4 | No |
| P | 5 | 5 | No |

**Default Value**: Missing

**Note**: If cannot align enterprise-wide, possibility for PCG options vs CBG options per data model feedback. Not needed as of now per data model.

---

**Option Set: At Risk Reason**

| Setting | Value |
|---|---|
| Display Name | At Risk Reason |
| Option Set Type | Local (Account entity) |
| Description | Reason code for accounts flagged as at-risk |

**Options:**

| Label | Value | Order | Default |
|---|---|---|---|
| Color | 1 | 1 | No |
| Color Tools | 2 | 2 | No |
| Competitor Specification | 3 | 3 | No |
| Consolidation | 4 | 4 | No |
| Credit | 5 | 5 | No |
| Didn't show Enough Value | 6 | 6 | No |
| Hard Parts Discount | 7 | 7 | No |
| No Decision | 8 | 8 | No |
| Not an Approved Paint Line | 9 | 9 | No |
| Out of Business | 10 | 10 | No |
| Pre-bate | 11 | 11 | No |
| Price | 12 | 12 | No |
| Product Approval | 13 | 13 | No |
| Product Performance | 14 | 14 | No |
| Product Quality | 15 | 15 | No |
| Relationship – Brand Preference | 16 | 16 | No |
| Relationship – Competitive Supplier | 17 | 17 | No |
| Relationship – Employee Turnover | 18 | 18 | No |
| Service – Branch/Distributor Support | 19 | 19 | No |
| Service – Sales Support | 20 | 20 | No |
| Service – Technical Support | 21 | 21 | No |
| Service & Support | 22 | 22 | No |
| Strategic Decision | 23 | 23 | No |
| Supply Chain | 24 | 24 | No |
| Technology Fit | 25 | 25 | No |
| Tier Not Awarded Program | 26 | 26 | No |
| Other | 27 | 27 | No |

**Default Value**: Missing

---

### 7.3 **Classification** Table (Custom Entity)

#### 7.3.1 Entity Description

The Classification table is a custom master data table (configuration table) used to store classification values for Account categorization per PHX-2855 and PHX-2377. Classification values are configurable and may vary by division or business unit.

#### 7.3.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Classification |
| Plural Name | Classifications |
| Schema Name | Missing |
| Ownership | Organization |
| Description | Master table for Account classification values |
| Primary Field | Name |

**Options:**
- Auditing: Yes
- Notes: No
- Activities: No

#### 7.3.3 Attribute Definitions

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| Name | Missing | Single Line of Text | Required | Primary field storing classification label |

**Sample Values** (per PHX-2855):
- End-User
- Coil Coater
- Direct Dealer
- Architect

*Note: Full value set TBD. Choices differ by BUs per data model.*

---

### 7.4 **Segmentation** Table (Custom Entity)

#### 7.4.1 Entity Description

The Segmentation table is a custom master data table (configuration table) used to store segmentation values for Account categorization per PHX-2855 and PHX-2377. Segmentation values are configurable and may vary by division or business unit.

#### 7.4.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Segmentation |
| Plural Name | Segmentations |
| Schema Name | Missing |
| Ownership | Organization |
| Description | Master table for Account segmentation values |
| Primary Field | Name |

**Options:**
- Auditing: Yes
- Notes: No
- Activities: No

#### 7.4.3 Attribute Definitions

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| Name | Missing | Single Line of Text | Required | Primary field storing segmentation label |

**Sample Values** (per PHX-2855):
- Highway Maintenance
- OEM Extrusion
- Heavy Truck
- Commercial Designer

*Note: Full value set TBD. For integrated accounts, expecting in payload from Domain.*

---

### 7.5 **Account Source** Table (Custom Entity)

#### 7.5.1 Entity Description

The Account Source table is a custom master data table (configuration table) used to store account source values indicating the origination channel or method for account creation per PHX-2377.

#### 7.5.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Account Source |
| Plural Name | Account Sources |
| Schema Name | Missing |
| Ownership | Organization |
| Description | Master table for Account source values |
| Primary Field | Name |

**Options:**
- Auditing: Yes
- Notes: No
- Activities: No

#### 7.5.3 Attribute Definitions

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes :
|---|---|---|---|---|
| Name | Missing | Single Line of Text | Required | Primary field storing account source label |

**Sample Values**: Missing (not provided in data dictionary or user stories)

---

### 7.6 **Data Source** Table (Custom Entity)

#### 7.6.1 Entity Description

The Data Source table is a custom master data table (configuration table) used to store data source values indicating the system or origin of account data (domain/ERP integration vs manual CRM entry) per PHX-2377 and PHX-2546.

#### 7.6.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Data Source |
| Plural Name | Data Sources |
| Schema Name | Missing |
| Ownership | Organization |
| Description | Master table for Data Source values |
| Primary Field | Name |

**Options:**
- Auditing: Yes
- Notes: No
- Activities: No

#### 7.6.3 Attribute Definitions

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| Name | Missing | Single Line of Text | Required | Primary field storing data source label |

**Sample Values**: Missing (not provided in data dictionary or user stories; data model indicates integration payload will populate for integrated accounts)

---

### 7.7 **Contact** Entity

#### 7.7.1 Entity Description

The Contact entity represents individual people associated with Account organizations including decision makers, influencers, and stakeholders. Contact records are created manually by sales reps during lead qualification or account management activities. Each Contact must be associated with a parent Account and can be designated as the Primary Contact for that Account per PHX-368. Contact lifecycle includes Active and Inactive states managed through deactivation and hard delete operations (PHX-92, PHX-93, PHX-94, PHX-1598).

#### 7.7.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Contact |
| Plural Name | Contacts |
| Schema Name | contact |
| Ownership | User or Team |
| Description | Individual people associated with Account organizations |
| Primary Field | Full Name |

**Options for this Entity**

| Option | Enabled |
|---|---|
| Business Process Flows | TBD |
| Notes (Attachments) | Yes |
| Activities | Yes |
| Connections | TBD |
| Queues | No |
| Auditing | Yes |
| Change Tracking | TBD |
| Allow Quick Create | Yes |
| Duplicate Detection | Yes (per PHX-91) |

#### 7.7.3 Entity Relationships

**Many-to-One (N:1) Relationships:**
- Contact → Account (Parent Account - Required per PHX-92)
- Contact → Owner (User or Team)

**One-to-Many (1:N) Relationships:**
- Contact → Activities (Tasks, Phone Calls, Appointments, Emails)
- Contact → Opportunities (as stakeholder/decision maker)

#### 7.7.4 Attribute Definitions (Key Fields)

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| First Name | firstname | Single Line of Text | Required (PHX-362) | Contact's first name |
| Last Name | lastname | Single Line of Text | Required (PHX-362) | Contact's last name |
| Email | emailaddress1 | Single Line of Text (Email) | Required (PHX-362) | Primary email address; validated for email format |
| Business Phone | telephone1 | Single Line of Text | Optional | Business phone number |
| Mobile Phone | mobilephone | Single Line of Text | Optional | Mobile phone number |
| Job Title | jobtitle | Single Line of Text | Optional | Contact's job title/position |
| Parent Account | parentcustomerid | Lookup (Account) | Required (PHX-92) | Relationship to parent Account |
| Primary Contact | sw_primarycontact | Boolean | Optional | Flag indicating Primary Contact for Account (only one Primary per Account per PHX-368) |
| Training Enrollment | sw_trainingenrollment | Boolean | Optional | CBG-specific flag indicating enrollment in training programs (PHX-366) |
| Status | statecode | State | System | Active (0) / Inactive (1) per PHX-369 |

**Referenced User Stories**: PHX-92, PHX-93, PHX-94, PHX-91, PHX-362, PHX-366, PHX-368, PHX-369, PHX-1598, PHX-1561

---

### 7.8 **Lead** Entity

#### 7.8.1 Entity Description

The Lead entity represents potential customers in early qualification stages before conversion to Account and Contact records. Leads are created from web forms, manual entry, campaigns, or external integrations. Sales reps qualify leads through activity tracking and assessment, then either convert to Account/Contact or disqualify with a reason code. Lead Status progresses through Active → Qualified or Active → Disqualified states (PHX-357, PHX-112, PHX-84, PHX-1354, PHX-1605).

#### 7.8.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Lead |
| Plural Name | Leads |
| Schema Name | lead |
| Ownership | User or Team |
| Description | Potential customers in qualification process |
| Primary Field | Topic |

**Options for this Entity**

| Option | Enabled |
|---|---|
| Business Process Flows | Yes (Lead Qualification Process) |
| Notes (Attachments) | Yes |
| Activities | Yes (per PHX-1354) |
| Connections | TBD |
| Queues | TBD |
| Auditing | Yes |
| Change Tracking | TBD |
| Allow Quick Create | Yes |
| Duplicate Detection | Yes (per PHX-71) |

#### 7.8.3 Entity Relationships

**Many-to-One (N:1) Relationships:**
- Lead → Owner (User or Team)
- Lead → Lead Source (lookup or choice)

**One-to-Many (1:N) Relationships:**
- Lead → Activities (Tasks, Phone Calls, Appointments, Emails per PHX-1354)

**Qualification Process:**
- Lead qualification creates Account + Contact records (per PHX-84, PHX-92)
- Lead activities transfer to Account/Contact on qualification (per PHX-1354)

#### 7.8.4 Attribute Definitions (Key Fields)

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| Topic | subject | Single Line of Text | Required | Lead topic/subject |
| First Name | firstname | Single Line of Text | Required | Lead's first name |
| Last Name | lastname | Single Line of Text | Required | Lead's last name |
| Company Name | companyname | Single Line of Text | Required | Company name |
| Email | emailaddress1 | Single Line of Text (Email) | Required | Email address |
| Business Phone | telephone1 | Single Line of Text | Optional | Business phone |
| Lead Source | leadsourcecode | Choice | Optional | Origin of lead (Web, Referral, Campaign, etc.) |
| Lead Status | statecode | State | System | Active (0), Qualified (1), Disqualified (2) per PHX-357 |
| Status Reason | statuscode | Status | Required on Disqualification | Reason for disqualification (PHX-112) |

**Referenced User Stories**: PHX-84, PHX-112, PHX-357, PHX-1354, PHX-1605, PHX-1576

---

### 7.9 **Opportunity** Entity

#### 7.9.1 Entity Description

The Opportunity entity represents sales opportunities associated with Account records. Opportunities track potential deals through sales pipeline stages including qualification, proposal, negotiation, and close. Opportunity records are linked to parent Account and primary Contact, and may generate Quote records during proposal stages (PHX-1608, PHX-1570).

#### 7.9.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Opportunity |
| Plural Name | Opportunities |
| Schema Name | opportunity |
| Ownership | User or Team |
| Description | Sales opportunities for customer accounts |
| Primary Field | Topic |

**Options for this Entity**

| Option | Enabled |
|---|---|
| Business Process Flows | Yes (Opportunity Sales Process) |
| Notes (Attachments) | Yes |
| Activities | Yes |
| Connections | TBD |
| Queues | TBD |
| Auditing | Yes |
| Change Tracking | TBD |
| Allow Quick Create | Yes |
| Duplicate Detection | TBD |

#### 7.9.3 Entity Relationships

**Many-to-One (N:1) Relationships:**
- Opportunity → Account (Parent Account - Required)
- Opportunity → Contact (Primary Contact - Optional)
- Opportunity → Owner (User or Team)

**One-to-Many (1:N) Relationships:**
- Opportunity → Quotes (1:N)
- Opportunity → Activities (Tasks, Phone Calls, Appointments, Emails)

#### 7.9.4 Attribute Definitions (Key Fields)

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| Topic | name | Single Line of Text | Required | Opportunity topic/name |
| Parent Account | parentaccountid | Lookup (Account) | Required | Associated Account |
| Primary Contact | parentcontactid | Lookup (Contact) | Optional | Primary Contact for opportunity |
| Estimated Revenue | estimatedvalue | Currency | Optional | Potential deal value |
| Estimated Close Date | estimatedclosedate | Date | Required | Expected close date |
| Probability | closeprobability | Whole Number (%) | Optional | Win probability percentage |
| Status | statecode | State | System | Open (0), Won (1), Lost (2) |

**Referenced User Stories**: PHX-1608, PHX-1570

---

### 7.10 **Quote** Entity

#### 7.10.1 Entity Description

The Quote entity represents formal price quotations generated for Opportunities or Accounts. Quotes contain product/service line items, pricing, discounts, and terms. Quote records flow through proposal, approval, and acceptance stages. Quotes are associated with parent Opportunity or directly with Account for non-opportunity-based quoting scenarios (PHX-1619, PHX-1573).

#### 7.10.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Quote |
| Plural Name | Quotes |
| Schema Name | quote |
| Ownership | User or Team |
| Description | Price quotations for opportunities and accounts |
| Primary Field | Name |

**Options for this Entity**

| Option | Enabled |
|---|---|
| Business Process Flows | TBD (Quote Approval Process) |
| Notes (Attachments) | Yes |
| Activities | Yes |
| Connections | TBD |
| Queues | TBD |
| Auditing | Yes |
| Change Tracking | TBD |
| Allow Quick Create | TBD |
| Duplicate Detection | TBD |

#### 7.10.3 Entity Relationships

**Many-to-One (N:1) Relationships:**
- Quote → Opportunity (Optional)
- Quote → Account (Required)
- Quote → Contact (Primary Contact - Optional)
- Quote → Owner (User or Team)

**One-to-Many (1:N) Relationships:**
- Quote → Quote Products (Quote Line Items)

#### 7.10.4 Attribute Definitions (Key Fields)

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| Name | name | Single Line of Text | Required | Quote name/number |
| Opportunity | opportunityid | Lookup (Opportunity) | Optional | Associated Opportunity |
| Account | customerid | Lookup (Account) | Required | Associated Account |
| Contact | customerid | Lookup (Contact) | Optional | Primary Contact |
| Total Amount | totalamount | Currency | Calculated | Total quote value |
| Effective From | effectivefrom | Date | Optional | Quote valid from date |
| Effective To | effectiveto | Date | Optional | Quote expiration date |
| Status | statecode | State | System | Draft (0), Active (1), Won (2), Closed (3) |

**Referenced User Stories**: PHX-1619, PHX-1573

---

### 7.11 **Territory** Entity

#### 7.11.1 Entity Description

The Territory entity represents geographic or organizational sales territories used to assign accounts, leads, and opportunities to sales teams. Territory records support hierarchical territory management structures. Per PHX-1563, Territory table is out-of-box D365 entity with Organization-level read access for Sales Rep and Sales Manager roles (PHX-1624).

#### 7.11.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | Territory |
| Plural Name | Territories |
| Schema Name | territory |
| Ownership | Organization |
| Description | Sales territories for account assignment |
| Primary Field | Name |

**Options for this Entity**

| Option | Enabled |
|---|---|
| Business Process Flows | No |
| Notes (Attachments) | No |
| Activities | No |
| Auditing | Yes |
| Allow Quick Create | No |
| Duplicate Detection | No |

#### 7.11.3 Entity Relationships

**Many-to-One (N:1) Relationships:**
- Territory → Manager (User)

**One-to-Many (1:N) Relationships:**
- Territory → Accounts (via Territory assignment field on Account)
- Territory → Users (via User-Territory relationship)

#### 7.11.4 Attribute Definitions (Key Fields)

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| Name | name | Single Line of Text | Required | Territory name |
| Manager | managerid | Lookup (User) | Optional | Territory manager |
| Description | description | Multi-line Text | Optional | Territory description |

**Referenced User Stories**: PHX-1624, PHX-1563

**Security Note**: Per PHX-1563, Territory table has Organization-level read access for both Sales Rep and Sales Manager roles (not BU-level).

---

### 7.12 **User** Entity

#### 7.12.1 Entity Description

The User entity represents system users including sales reps, sales managers, and administrators. User records are created and managed through Azure AD integration and Dynamics 365 security administration. Users are assigned to Business Units, Security Roles, and Teams to control data access and functional permissions (PHX-1626).

#### 7.12.2 Entity Settings

**Entity Definition**

| Setting | Value |
|---|---|
| Display Name | User |
| Plural Name | Users |
| Schema Name | systemuser |
| Ownership | Organization |
| Description | System users |
| Primary Field | Full Name |

**Options for this Entity**

| Option | Enabled |
|---|---|
| Business Process Flows | No |
| Notes (Attachments) | No |
| Activities | No |
| Auditing | Yes |
| Allow Quick Create | No |
| Duplicate Detection | No |

#### 7.12.3 Entity Relationships

**Many-to-One (N:1) Relationships:**
- User → Business Unit (Required)
- User → Manager (User - Optional)

**Many-to-Many (N:N) Relationships:**
- User ↔ Security Roles
- User ↔ Teams
- User ↔ Territories

#### 7.12.4 Attribute Definitions (Key Fields)

| Display Name | Schema Name | Attribute Type | Field Requirement | Notes |
|---|---|---|---|---|
| First Name | firstname | Single Line of Text | Required | User's first name |
| Last Name | lastname | Single Line of Text | Required | User's last name |
| Business Unit | businessunitid | Lookup (Business Unit) | Required | User's primary Business Unit |
| Security Roles | N/A | Many-to-Many | Required | Security roles assigned to user |
| Manager | parentsystemuserid | Lookup (User) | Optional | User's manager |

**Referenced User Stories**: PHX-1626

---

## 8. Solution Reference Data

### 8.1 Data Governance

#### 8.1.1 Data Governance Processes

Reference data for the Phoenix CRM solution including classification values, segmentation options, account sources, and currency definitions will be owned and maintained by the business operations team with support from CRM administrators for technical configuration. Master data tables (Classification, Segmentation, Account Source, Data Source) follow a quarterly review cycle where business stakeholders validate active values and request additions or retirements through a change request process managed by the CRM governance board. The exact process owner and approval workflow for reference data updates is TBD pending establishment of the CRM governance structure.

#### 8.1.2 Data Governance Mapping

**Reference Data: Classification**

| Setting | Value |
|---|---|
| Entity Name | Classification (Master Table) |
| Used from Entities | Account |
| Dependencies | UI Logic – Dependency (Account form Classification lookup); Security – No special restrictions |
| Data Owner | TBD |
| Governance Process | TBD |
| Maintained by | Sales Operations (TBD) |

---

**Reference Data: Segmentation**

| Setting | Value |
|---|---|
| Entity Name | Segmentation (Master Table) |
| Used from Entities | Account |
| Dependencies | UI Logic – Dependency (Account form Segmentation lookup); Integration – values expected in payload from Domain for integrated accounts |
| Data Owner | TBD |
| Governance Process | TBD |
| Maintained by | Sales Operations (TBD) |

---

**Reference Data: Account Source**

| Setting | Value |
|---|---|
| Entity Name | Account Source (Master Table) |
| Used from Entities | Account |
| Dependencies | UI Logic – Dependency (Account form lookup); others TBD |
| Data Owner | TBD |
| Governance Process | TBD |
| Maintained by | Sales Operations / Data Team (TBD) |

---

**Reference Data: Data Source**

| Setting | Value |
|---|---|
| Entity Name | Data Source (Master Table) |
| Used from Entities | Account |
| Dependencies | Integration – populated from integration payload; UI Logic – read-only display on Account form |
| Data Owner | TBD |
| Governance Process | TBD |
| Maintained by | Integration Team / Data Team (TBD) |

---

### 8.2 Global Options List

#### 8.2.1 **Account Type** Option Set

| Setting | Value |
|---|---|
| Display Name | Account Type |
| Description | TBD |
| Order | Alphabetical (A-Z) |
| Default Value | TBD |

**Options:**
- Existing
- Key
- Lost
- New
- Opportunity
- Prospect

---

#### 8.2.2 **Account Record Type** Option Set

| Setting | Value |
|---|---|
| Display Name | Account Record Type |
| Description | TBD |
| Order | Value order (1, 2) |
| Default Value | TBD |

**Options:**
- Integrated
- Non Integrated

---

#### 8.2.3 **At Risk Reason** Option Set

| Setting | Value |
|---|---|
| Display Name | At Risk Reason |
| Description | TBD |
| Order | Alphabetical (A-Z) |
| Default Value | TBD |

**Options**: (refer to Section 7.2.6 for complete list of 27 values)

---

### 8.3 Currencies

Per PHX-1963, the following currencies must be created in D365 based on active currencies from Salesforce:

**Currencies to be Configured** (based on attached file reference in PHX-1963):

*Note: Specific currency codes not provided in attached user stories CSV. Refer to "Active Currencies_SW Salesforce.xlsx" file attached to PHX-1963.*

- TBD (currency list to be imported from referenced file)

**Currency Integration** (PHX-1514):

Per PHX-1514 (Technical - Currency Integration), currency data will be integrated from source systems to D365 CRM. Integration specifications including currency code mapping, exchange rate synchronization, and update frequency are defined in separate integration design documentation (refer to Section 10 Integration TBD).

**Open Questions — Reference Data**
| # | Question | Owner | Due Date |
|---|----------|-------|----------|
| 1 | What is the complete list of Classification values required for each division/business unit? Sample values provided but full set Missing. | TBD | TBD |
| 2 | What is the complete list of Segmentation values required for each division/business unit? Sample values provided but full set Missing. | TBD | TBD |
| 3 | What are the Account Source values? Not provided in source files. | TBD | TBD |
| 4 | What are the Data Source values? Integration will populate but value set not documented. | TBD | TBD |
| 5 | Currency list from PHX-1963 references attached file "Active Currencies_SW Salesforce.xlsx" which was not included in FDD source files — need currency codes and configuration details. | TBD | TBD |
| 6 | Should Classification and Segmentation tables support additional attributes beyond Name (e.g., Division filter, Active/Inactive status, Display Order)? | TBD | TBD |
| 7 | Currency integration technical specifications per PHX-1514 (exchange rate sync, update frequency) to be documented in Integration section. | TBD | TBD |

---

## 9. Data Migration (TBD)

*This section to be completed in future iteration once data migration strategy and approach are defined.*

---

## 10. Integration (TBD)

*This section to be completed in future iteration once integration architecture and data mappings are documented. Key integrations referenced in user stories:*
- Domain/ERP Account integration for integrated accounts
- Reference data integration for Classification, Segmentation, Data Source

---

## 11. Testing Strategy (TBD)

*This section to be completed in future iteration once testing approach and test scenarios are defined.*

---

## 12. Deployment and Training (TBD)

*This section to be completed in future iteration once deployment plan and training materials are prepared.*

---

## Appendices

### Appendix A: Acronyms and Definitions

| Term | Definition |
|---|---|
| BU | Business Unit |
| CBG | Consumer Brands Group |
| CRM | Customer Relationship Management |
| D365 | Dynamics 365 |
| ERP | Enterprise Resource Planning |
| FDD | Functional Design Document |
| OOB | Out of the Box (standard Dynamics 365 functionality) |
| PCG | Performance Coatings Group |
| RBAC | Role-Based Access Control |
| TBD | To Be Determined |

### Appendix B: User Story Reference

This FDD addresses all 49 user stories from the Sherwin-Williams Phoenix CRM Iteration 1 scope, organized by parent feature area:

#### **3.3 Account Management (Parent: PHX-23)**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-2855 | Account Categorization Fields (Non-Integrated) - W1 | 3.3 Account Management | Section 3.1, 7.2 |
| PHX-2589 | Account Views - W1 | 3.3 Account Management | Section 3.2, 4.4 |
| PHX-2546 | Account (Non-Integrated) - Data Source Tracking Field - W1 | 3.3 Account Management | Section 3.1, 7.2, 4.2 |
| PHX-2377 | Account - Master Tables - Classification, Segmentation, Account Source, Data Source | 3.3 Account Management | Section 7.3-7.6, 8.2 |
| PHX-1584 | Tables & Fields: Account | 3.3 Account Management | Section 7.2 |
| PHX-1560 | Security Roles: Account Table | 3.3 Account Management | Section 6.3 |
| PHX-1520 | Dynamics 365: Enable Language Packs | 3.3 Account Management | TBD (Future Iteration) |
| PHX-354 | Additional Account Fields | 3.3 Account Management | Section 7.2, 4.2 |
| PHX-89 | Account Hierarchy Relationship Identifiers | 3.3 Account Management | Section 3.8, 7.2 |
| PHX-88 | Integration Account Status | 3.3 Account Management | Section 2.2.5, 3.9, 4.2 |
| PHX-86 | Account to Contact Deactivation | 3.3 Account Management | Section 2.2.5, 3.9, 4.2 |
| PHX-85 | Manually Created Account Deactivation | 3.3 Account Management | Section 2.2.5, 3.9, 4.2 |
| PHX-84 | Manual Account Creation | 3.3 Account Management | Section 2.2.2, 3.3, 4.2 |
| PHX-82 | Account Search by Fields | 3.3 Account Management | Section 3.6, 4.2 |
| PHX-81 | Required Account Fields | 3.3 Account Management | Section 4.2, 7.2 |
| PHX-79 | CRM Account Status Change - View | 3.3 Account Management | Section 2.2.5, 3.9, 4.4 |
| PHX-76 | Account Type Identification | 3.3 Account Management | Section 4.2, 7.2 |
| PHX-75 | Account Source Tracking | 3.3 Account Management | Section 4.2, 7.5 |
| PHX-71 | Duplicate Detection and Handling | 3.3 Account Management | Section 3.7, 4.2 |
| PHX-65 | Account Hierarchy Visualization | 3.3 Account Management | Section 3.8 |

#### **3.3 Account Management - Manage Contacts (Parent: PHX-152)**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-1598 | Tables & Fields: Contact | Manage Contacts | Section 7.7 |
| PHX-1561 | Security Roles: Contact Table | Manage Contacts | Section 6.3 |
| PHX-369 | Contact Status | Manage Contacts | Section 3.4, 3.11, 4.2, 7.7 |
| PHX-368 | Primary Contact | Manage Contacts | Section 3.3, 3.4, 4.1.2, 4.2 |
| PHX-366 | Training Enrollment Flag (CBG Specific) | Manage Contacts | Section 3.4, 4.1.2, 7.7 |
| PHX-362 | Required Contact Fields | Manage Contacts | Section 3.4, 4.2, 7.7 |
| PHX-94 | Contact Deletion (Hard Delete) | Manage Contacts | Section 3.11, 4.2 |
| PHX-93 | Contact Deactivation | Manage Contacts | Section 3.11, 4.2 |
| PHX-92 | Contact Creation | Manage Contacts | Section 2.2.3, 3.3, 3.4, 4.2 |
| PHX-91 | Duplicate Contact Detection | Manage Contacts | Section 3.4, 3.7, 4.2 |

#### **3.3 Account Management - Manage Activities (Parent: PHX-153)**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-1636 | Security Roles: Note | Manage Activities | Section 6.3 |
| PHX-381 | Activity Status | Manage Activities | Section 2.2.4, 3.5, 4.2 |
| PHX-99 | Activity Creation and Update | Manage Activities | Section 2.2.4, 3.5, 4.2 |
| PHX-69 | Activity Management Standardization | Manage Activities | Section 3.5, 4.2 |

#### **4.4 Lead Management (Parent: PHX-174)**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-1605 | Tables & Fields: Lead | Lead Management | Section 7.8 |
| PHX-1576 | Security Roles: Lead Table | Lead Management | Section 6.3 |
| PHX-1354 | Activity History on Leads | Lead Management | Section 2.2.1, 3.3, 3.5, 4.1.3, 4.2 |
| PHX-357 | Lead Status | Lead Management | Section 2.2.1, 3.3, 3.10, 4.2, 7.8 |
| PHX-112 | Disqualify Lead with Reason | Lead Management | Section 2.2.1, 3.10, 4.1.3, 4.2 |

#### **6.1 Opportunity Management (Parent: PHX-TBD)**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-1608 | Tables & Fields: Opportunity | Opportunity Management | Section 7.9 |
| PHX-1570 | Security Roles: Opportunity Table | Opportunity Management | Section 6.3 |

#### **5.3 Quote Management (Parent: PHX-TBD)**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-1619 | Tables & Fields: Quote | Quote Management | Section 7.10 |
| PHX-1573 | Security Roles: Quote Table | Quote Management | Section 6.3 |

#### **3.2 Territory Management (Parent: PHX-TBD)**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-1626 | Tables & Fields: User | Territory Management | Section 7.12 |
| PHX-1624 | Tables & Fields: Territory | Territory Management | Section 7.11 |
| PHX-1563 | Security Roles: Territory Table | Territory Management | Section 6.3 |

#### **System Configuration & Technical**

| Story ID | Story Title | Parent Feature | FDD Section(s) |
|---|---|---|---|
| PHX-1963 | D365 - Set up Currencies | Configuration | Section 8.3 |
| PHX-1519 | Dynamics 365: Security Configuration | Configuration | Section 6.2, 6.3 |
| PHX-1514 | Technical - Currency Integration | Configuration | Section 8.3 |

---

**Total User Stories Addressed: 49**

**User Stories by Status** (as of March 11, 2026):
- In Progress: 6 stories
- Acceptance: 7 stories
- Test: 4 stories
- To Do: 4 stories
- Not Yet Started (Functional): 28 stories (now documented in FDD)

### Appendix C: Data Model Field Count Summary

| Entity | Total Fields Documented | Fields with Missing Schema Name | Financial/Secured Fields | Fields Marked "Not Needed" |
|---|---|---|---|---|
| Account | 30+ (limited per template guidance) | ~25 | 10 | 7 |
| Classification (Master Table) | 1 | 1 | 0 | 0 |
| Segmentation (Master Table) | 1 | 1 | 0 | 0 |
| Account Source (Master Table) | 1 | 1 | 0 | 0 |
| Data Source (Master Table) | 1 | 1 | 0 | 0 |

---

## Document Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| March 11, 2026 | 0.1 | Business Analyst | Initial FDD draft generated from data dictionary and user stories for Iteration 1. Focused on Account entity and related master tables (Classification, Segmentation, Account Source, Data Source). Security roles and field-level security defined per security user stories. Multiple open questions documented for stakeholder review. |

---

**END OF FUNCTIONAL DESIGN DOCUMENT**
