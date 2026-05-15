# AIC PACES — Documentation Enhancement Plan

| Property | Value |
|---|---|
| Project | AIC PACES (Primary Care Engagement System) |
| Created | 2026-05-01 |
| Status | PLAN ONLY — implementation in separate branch |
| Audience | Documentation team, delivery leads |

> **Context:** The current generated documentation serves as a component inventory — it counts entities, flows, plugins, and forms. The goal of this plan is to upgrade each document from inventory to a genuine guide that a new team member can use to understand and work with the application without opening D365 or the source code.

---

## Priority Summary

| Priority | Enhancements | Estimated Effort |
|---|---|---|
| P1 — Critical (high business impact, blockers for onboarding) | 7 enhancements | Large |
| P2 — Important (significant detail gaps, high team value) | 8 enhancements | Medium |
| P3 — Useful (completeness and quality improvements) | 6 enhancements | Small–Medium |

---

## P1 — Critical Enhancements

### E1 · Entity Data Dictionary — Field-Level Definitions

**File:** `functional/entity-catalogue.md`
**Gap:** Entities are listed with attribute counts only. No field-level definitions. A team member looking at `aic_clinic` (140 attributes) or `aic_hsgchangerequest` (152 attributes) has no way to understand what any field means, its type, or its business purpose.

**Enhancement:**

For the 10 highest-complexity entities, add a **Data Dictionary** section with one row per key field:

| Field Schema Name | Display Name | Type | Business Purpose | Linked Plugin | Linked Flow |
|---|---|---|---|---|---|
| `aic_hsgstatus` | HSG Status | OptionSet | Current participation status in HSG programme (Active / Suspended / Withdrawn / Pending) | HSGApplication plugins, ClinicSuspension plugins | AICPACES_Clinic_HSGSuspension_* |
| `aic_hcilicenceno` | HCI Licence No | Single Line Text | MOM-issued Healthcare Institution licence number — unique per clinic | None | None |

**Entities to document first (by form + flow reference count):**
1. `aic_clinic` (140 attrs, 23 forms, ~12 flows)
2. `aic_hsgchangerequest` (152 attrs, 4 forms, ~8 flows)
3. `aic_hsgapplication` (102 attrs, 2 forms, ~6 flows)
4. `contact` / Client (78 attrs, 6 forms, ~12 flows)
5. `incident` / Case (55 attrs, 4 forms, ~10 flows)
6. `account` / Partner (49 attrs, 6 forms, ~8 flows)
7. `aic_conversationfiling` (32 attrs, 5 forms, ~4 flows)
8. `aic_hsgepa` (59 attrs, 2 forms, ~4 flows)
9. `aic_clinicalprofessional` (76 attrs, 12 forms, ~6 flows)
10. `aic_clinicdoctorrelationshiprecord` (22 attrs, junction entity — explain join semantics)

**Also add per-entity:**
- Which plugin auto-populates which fields on Create/Update
- Which Classic Workflows or PA flows read or write this entity
- Relationship diagram (1–2 key relationships with cardinality)

**Source to read:** `input/solutions/AICPACESCustomizations_1_0_0_88/Entities/{EntityName}/Attributes/*.xml`

---

### E2 · Form Field Inventory — Tab and Field Mapping

**File:** `functional/forms-and-views.md`
**Gap:** Forms are counted but not described. "23 forms for aic_clinic" tells a team member nothing about how to navigate or fill a clinic record. Inferred tab structures are unconfirmed.

**Enhancement:**

For the 10 entities with the most forms, document each **named form** with its tab/section structure and key fields per tab. Use the actual form XML (`Entities/*/Forms/*.xml`) as source.

Template per form:

```
**Form: Clinic Main Form**
Entity: aic_clinic
Type: Main

| Tab | Section | Key Fields | Visibility Rule |
|---|---|---|---|
| General | Clinic Details | Clinic Name, UEN, HCI Code, Clinic Type, Status | Always visible |
| General | Contact | Primary Contact, Phone, Email, Address | Always visible |
| HSG Programme | HSG Status | HSG Status, HSG Start Date, HSG End Date, HSG PO | Visible if aic_clinic.aic_enrollhsg = true |
| HSG Programme | EPA/SBA | EPA Reference, SBA Reference, LOA Issue Date | Visible if HSG Status = Active |
| PCN Programme | PCN Details | PCN Name, PCN Join Date, PCN AM | Visible if aic_clinic.aic_enrollpcn = true |
| Subgrids | Relationships | Clinic Doctor Relationships, PCN Onboarding Records, Conversation Filings (PCF) | Read from related entities |
```

**Also add for each entity:**
- Which forms are for create vs. edit vs. read-only (quick create, quick view)
- Which subgrids are editable vs. read-only
- Which form scripts are registered on each form (map from web-resources/paces.md)

**Source to read:** `input/solutions/AICPACESCustomizations_1_0_0_88/Entities/*/Forms/*.xml`

---

### E3 · Flow Runbooks — Per-Flow Specification

**File:** `functional/flows.md`
**Gap:** Each of 84 Power Automate flows has at most one line of description. Trigger conditions, action sequences, error handling, and notification targets are all missing. Team members cannot diagnose flow failures or understand automation behaviour.

**Enhancement:**

Create a **Flow Runbook** section for each flow group, with individual runbook entries for the 20 most business-critical flows (one per key subprocess). Template:

```
**Flow: AICPACES_Clinic_HSGOnboarding_Notification**
Package: AICPACESPowerAutomates
Trigger: Record Created on aic_clinicpcnonboardingrecord
Trigger Filter: Status = "Submitted"

Actions (in order):
1. Get clinic record (aic_clinic) using aic_clinicid from trigger record
2. Get HSG Programme Officer (systemuser) from clinic.aic_hsgpo lookup
3. Send email to clinic.aic_primarycontactemail using template [HSG_Welcome] from aic_emailtemplateconfiguration
4. Update aic_clinicpcnonboardingrecord.aic_notificationsentdate = utcNow()

Error Handling:
- If clinic email missing → log to aic_accesslog (aic_accesstype = "Email Failure") + send Teams alert to HSG PO
- If email template not found → throw error, flow terminates, error visible in flow run history

Downstream Triggers: None (terminal flow)
Avg. Execution: On clinic onboarding events (low frequency, < 50/month estimated)

Classic Workflow equivalent: None (new automation)
```

**Flows to document as full runbooks (20 priority):**

| Domain | Flows to Document |
|---|---|
| Clinic / HSG | HSGOnboarding, HSGSuspension, HSGOffboarding, EPAIssue, SBAIssue |
| Clinic / PCN | PCNOnboarding, PCNSuspension, PCNWithdrawal |
| Case | CaseRouting, CaseAgingCalculation, DCVTaskGeneration, BPFStatusUpdate |
| Client | ClientProfileStatus, ClientNRICSync |
| Partner | PartnerInfoVerification, PartnerDevPlanNotification |
| Integration | PCDS_GetClinic_Endpoint, PCDS_PutApplication_Endpoint, FormSG_SurveyIngestion |
| Email | EmailFromConfig (as shared pattern used by 10+ flows) |

**Also add:**
- Flow-to-flow dependency map (does flow A trigger flow B?)
- Classic workflow inventory table — list all 69 with name, trigger entity, business purpose (currently collapsed into 8 unnamed buckets)

**Source to read:** `input/solutions/*/Workflows/*.json`, `input/solutions/*/Workflows/*.xaml`

---

### E4 · Web Resource — Document All 38+ Undocumented JS Files

**File:** `technical/web-resources/paces.md`
**Gap:** Only 11 of the 49 JS files are individually documented. The remaining 38 are grouped under a placeholder "Other Entity Scripts" section with no function-level detail. This is the most direct example of the high-level documentation problem.

**Enhancement:**

Document every JS file individually. Each entry should follow the same template as the current documented scripts:

```
**File: aic_paces/scripts/clinicpcnonboarding/clinicpcnonboarding.js**
Registered On: aic_clinicpcnonboardingrecord (Main form, Quick Create form)
Dependencies: common.js (AICCommon), xrmhelper.js (XrmHelper)

| Function | Trigger | What It Does |
|---|---|---|
| `ClinicPCNOnboarding.onLoad(ctx)` | Form OnLoad | Initialises form — sets field requirements based on status, loads clinic context via XrmHelper.retrieveRecord |
| `ClinicPCNOnboarding.onStatusChange(ctx)` | aic_status OnChange | Locks all fields if status = "Submitted" or "Approved"; unlocks if "Rejected" |
| `ClinicPCNOnboarding.validateOnboarding()` | "Submit" ribbon button | Calls aic_ValidationRuleCheck custom action; shows notification on failure |
| `ClinicPCNOnboarding.populatePCNDetails(ctx)` | aic_pcnid OnChange | Auto-fetches PCN AM and PCN start date from master PCN record |
```

**Full list of files requiring documentation (read source JS from input/src/web-resources/ for each):**

*PCN / RHS Records:*
- clinicpcnonboarding.js, clinicpcnsuspension.js, clinicswitchpcn.js, clinicpcnwithdrawal.js
- doctorpcnonboarding.js, doctorpcnsuspension.js, doctorpcnwithdrawal.js
- clinicrhsonboarding.js, clinicswitchrhs.js

*HSG Records:*
- hsgepa.js (partially documented — expand function list), hsgchangerequesttype.js

*Case / Client domain:*
- casedistribution.js, caseresolution.js, caseroutinghistory.js

*Conversation Filing:*
- conversationfiling.js, attachment.js (partially documented — expand)

*Survey:*
- surveyadmin.js, surveyitem.js, surveyresponse.js

*Partner / Account:*
- partnerdevelopmentplan.js, partnerinfoverification.js, partnerfinancial.js

*Reference / Staging:*
- postalcode.js, staginghsgclinic.js, stagingaacpostalcodemapping.js
- slrsubregion.js (also has double .js.js extension issue — flag for fix)
- division.js, ward.js, grcsmc.js

*Other entities:*
- sba.js, schemeapplicationefass.js, schemeapplicationesmf.js
- grantandscheme.js, modeofservicedelivery.js, nhlicensing.js
- emailtemplateconfiguration.js, emailrecipientconfiguration.js
- aacpostalcodemapping.js (partially documented — expand)
- HSGCRFormConfig.js (separate from hsgchangerequest.js — what does it configure?)
- CommunityCenter.js

**Source to read:** `input/src/web-resources/AIC.PACES.Webresource/` — read each .js file and document from source

---

### E5 · Plugin Business Logic — Decision Rules and Data Flows

**File:** `technical/plugins/AIC.PACES.Plugins.md`
**Gap:** Plugins are listed with step counts. No business logic, decision rules, data read/write flows, or error handling is documented. A developer cannot understand what a plugin does without reading the C# source.

**Enhancement:**

For each plugin class (61 total), add a **Logic Block** describing what the plugin reads, what decisions it makes, what it writes, and what errors it throws. Priority order:

**Tier 1 — Document fully (10 highest-impact classes):**

1. `AssignRecordOwner` (71 steps) — What assignment rule applies? Round-robin, geography-based, manager-hierarchy, or queue-based? Fallback if no owner found?
2. `Case_CaseOwnerManager` — Exactly how does round-robin work? What entities does it read (aic_casedistributionmember, aic_casedistributionunavailability)? What does it write (incident.Owner, aic_routinghistory)?
3. `HSGApplication.PopulateDataOnRecordUpdate` — Which 20+ fields does it populate? From which related entities?
4. `HSGChangeRequest.PreOperationHSGChangeRequest` — Which fields are required per CR type? What is locked after submission?
5. `Client_SyncClientUIN` — What is the UIN computation? Is it same as NRIC or derived?
6. `Entry.Client.Client_DuplicateDetection` — What fields define a duplicate? Name + DOB? NRIC alone? NRIC + clinic?
7. `SurveyItem_CalculateCSATScore` — CSAT formula: average of all items? Weighted by question type?
8. `QueueItem_RoundRobinAssignment` — Same as CaseOwnerManager? Or different queue entity?
9. `TrackChangesOnPartnerServiceDetailChange` — Which fields trigger a change record? All 9 attributes or a subset?
10. `Email.Email_CreateEmailFromConfig` — How does it resolve the email template? What substitution tokens exist?

**Tier 2 — Add data flow table only (remaining 51 classes):**

For each remaining class, a minimal table:

| Data Read | Data Written | Error Thrown |
|---|---|---|
| contact (NRIC, DOB) | aic_accesslog (access event) | "Duplicate NRIC detected" |

**Source to read:** `input/src/plugins/AIC.PACES.Plugins/*.cs` — read Execute() method body for each class

---

### E6 · SSRS Report SQL Documentation

**File:** `reporting/ssrs/*.md` (all 13 files)
**Gap:** SQL queries are listed as "inferred" with template SQL. Actual queries from RDL source are not extracted. Column mappings, groupings, and filters are not documented. The 8 registered-only reports have zero documentation.

**Enhancement:**

**For all 13 RDL-sourced reports:**
- Extract the actual SQL from the `<CommandText>` element in each `.rdl` file
- Document the exact table/view names queried (D365 filtered views)
- Document all columns returned, their display names, and any computed columns
- Document GROUP BY, ORDER BY, WHERE conditions with option set value meanings
- Map columns to report layout (which tablix columns, which groupings)

```
**Report: Count of HSG Clinics**

SQL Query (from RDL <CommandText>):
  SELECT COUNT(*) AS ClinicCount
  FROM FilteredAic_clinic
  WHERE aic_hsgstatus = 100000000   -- OptionSet value for "Active"
    AND statecode = 0               -- Active records (not deactivated)

Output Columns:
  ClinicCount | int | Count of active HSG clinics

Report Layout:
  - Single value textbox — shows ClinicCount as "Total: {N}"
  - No tablix/table — report is a single metric

Parameters: None — all clinics regardless of user context
Pre-Filter: ⚠ MISSING — add CRM_FilteredAic_clinic with @CRM_FilteredAic_clinic parameter
```

**For the 8 registered-only reports — best-effort from registration metadata:**

| Report Name | Solution Record | Inferred Purpose | Action Required |
|---|---|---|---|
| Case Category Breakdown Transactions | Paces_CaseCategoryBreakdownTransactions | Breakdown of cases by category and transaction type | Obtain RDL from report author |
| Case Distribution | Paces_CaseDistributionReport | Distribution of cases by queue/agent/geography | Obtain RDL |
| Case Lifecycle | Paces_CaseLifecycleReport | Case journey from creation to resolution with durations | Obtain RDL |
| Case Workload | Paces_CaseWorkloadReport | Active cases per agent/team with aging | Obtain RDL |
| DCV Task Daily | Paces_DCVtaskDailyReport | Daily DCV task generation status | Obtain RDL |
| HSG App Test | HSGAppTest | ⚠ Likely test artefact — confirm with team | Confirm if production |
| Survey Response (x2) | rptSurveyResponse* | Survey response details per case | Obtain RDL — two variants |

**Source to read:** `input/reporting/*.rdl` — parse `<CommandText>` from each DataSet element

---

### E7 · Integration Payload Specification

**File:** `integrations/integration-topology.md`
**Gap:** Integration flows are mapped at topology level. No request/response payloads, no authentication mechanism, no error handling, no retry logic. The team cannot implement or test integrations without this detail.

**Enhancement:**

Create a **per-operation specification** for all 20 PCDS operations + 4 InterRAI operations + FormSG webhook:

```
**Operation: aic_AICPACESActionGetClinic (PCDS → D365)**
Direction: Inbound — PCDS calls D365 to retrieve clinic data
Trigger: Power Automate HTTP endpoint (AICPACESIntegrationEndPoints package)
D365 Custom Action: aic_AICPACESActionGetClinic
Plugin Class: GetClinic (AIC.PACES.Integration.Plugin)

Request:
  Content-Type: application/json
  Auth: [⚠ Verify — API Key header / OAuth bearer / mTLS]
  Body:
    { "ClinicId": "GUID or UEN string" }

Response (success):
  HTTP 200
  Body: { "ClinicName": "...", "UEN": "...", "HCICode": "...",
          "HSGStatus": "...", "PCNName": "...", "DoctorList": [...] }
  Fields: [list field-by-field what D365 entity fields map to response properties]

Response (error):
  HTTP 404 — Clinic not found
  HTTP 400 — Invalid ClinicId format
  HTTP 500 — Plugin execution error (logged to aic_migcommunicationlog)

Retry: [⚠ Verify — does caller retry on 500?]
Logging: aic_migcommunicationlog (Request body, Response body, Status, Timestamp)
NRIC Handling: NRIC fields encrypted via aic_EncryptNRIC before inclusion in response
```

**Also add:**
- Confirmed authentication method for PCDS and InterRAI (requires team input — flag as `⚠ PENDING CONFIRMATION`)
- NRIC encryption key storage location (flag as `⚠ PENDING VERIFICATION`)
- FormSG signature validation — confirm whether the PA flow validates the webhook secret header

---

## P2 — Important Enhancements

### E8 · Security Model — Privilege Matrix per Role

**File:** `functional/security-model.md`
**Gap:** Role names and personas are documented, but no privilege detail. The "graduated privilege" Client roles (Types A–H) have no definition. Field-level security impact of NRIC and financial data is unanalysed.

**Enhancement:**
- Read each role XML from `input/solutions/AICPACESCustomizations_1_0_0_88/Other/Roles/` and extract entity-level privileges (Create/Read/Write/Delete/Append/AppendTo) for at least the top 10 entities per role
- Build a heatmap-style privilege matrix for Client, Clinic, and Partner role categories
- Document NRIC field exposure: which roles can see `contact.aic_nric` and `aic_clinicalprofessional.aic_nric`
- Document financial field exposure: which roles can read `aic_partnerfinancial.*` fields
- Add a Team Structure section — list D365 teams used for record sharing and their membership rules

---

### E9 · Custom API Parameter Specifications

**File:** `technical/custom-apis.md`
**Gap:** Custom actions are listed by name. Input/output parameters are not documented for any action. Invocation patterns (from JS, from flows, from plugins) are not shown.

**Enhancement:**
- Confirm exact registered unique names from `input/solutions/*/Other/` XML (resolve the "inferred names" gap)
- For each custom action, document: Input parameters (name, type, required/optional), Output parameters (name, type), whether it throws on validation failure or returns IsValid=false
- For the 5 most-called actions (aic_ValidationRuleCheck, aic_CreateEpaandSba, aic_Email_CreateEmailFromConfig, aic_GeneratePDFFromTemplate, aic_Case_AgingCalculator) — add example invocations from both JavaScript and Power Automate
- Resolve the `aic_AICPACEActionPutApplication` typo — confirm actual registered name from XML and document the discrepancy

---

### E10 · Functional Overview — Business Process Walkthroughs

**File:** `functional/functional-overview.md`
**Gap:** Domain descriptions repeat component counts. No end-to-end process narrative. Team members cannot understand how the system works from reading it.

**Enhancement:**
Add a **Business Processes** section with step-by-step walkthroughs for the 5 most-important processes:

1. **Clinic Enrols in HSG Programme** — from clinic record creation through application, EPA/SBA creation, LOA issue, and active status
2. **Client Case Lifecycle** — from case creation through queue routing, assignment, DCV task, resolution, and survey
3. **PCN Doctor Onboarding** — clinic-doctor relationship, onboarding record, PCN approval, active relationship
4. **HSG Change Request** — CR type selection, field requirements, approval workflow, downstream record updates
5. **Partner Annual Info Verification** — verification record creation, field updates, approval, history tracking

Each walkthrough format:
```
Step N: [Actor] does [Action]
  - Entity: [entity name]
  - Fields filled: [field names]
  - Plugin fires: [plugin class]
  - Flow triggers: [flow name]
  - Email sent to: [recipient] using template [template name]
  - Outcome: [status/record changes]
```

---

### E11 · Entity Grouping by Feature Domain

**File:** `functional/entity-catalogue.md`
**Gap:** Entities are grouped into broad domains but without explaining why. Domain boundary rationale and cross-domain entity relationships are not explained.

**Enhancement:**
Restructure entity groupings from current broad domains into **feature-based groups** that reflect how the system actually works:

| Feature Group | Entities | Purpose |
|---|---|---|
| HSG Onboarding Lifecycle | aic_hsgapplication, aic_hsgappdoctor, aic_hsgepa, aic_sba, aic_hsgclinictransaction | Full HSG enrolment-to-transaction chain |
| HSG Change Request Workflow | aic_hsgchangerequest, aic_hsgchangerequesttype, aic_hsgcrcancellationreason | CR lifecycle management |
| Clinic Suspension / Withdrawal | aic_clinichsgsuspensionrecord, aic_clinicpcnsuspensionrecord, aic_clinicswitchpcnrecord, etc. | Programme status changes |
| Clinic-Doctor Relationships | aic_clinicdoctorrelationshiprecord, aic_clinicdoctorrelationshipremark, aic_clinicpcnonboardingrecord, aic_doctorpcnonboardingrecord | PCN relationship management |
| Case Management | incident, aic_casecategory, aic_casedistributionmember, aic_routinghistory, aic_dcvtask | Case routing and resolution |
| Client Management | contact, aic_clientreferral, aic_relationalcontact, aic_interraiassessmentinfo | Client profile and referrals |
| Partner Management | account, aic_partnerfinancial, aic_partnerinfoverification, aic_partnerpersonnel, aic_serviceoffered | PRM features |
| Survey / FormSG | aic_surveyadmin, aic_surveyitem, aic_surveyresponse, aic_surveyresponsestaging | Survey ingestion and CSAT |
| Configuration | aic_AICConfiguration, aic_emailtemplateconfiguration, aic_emailrecipientconfiguration, aic_smstemplateconfig | System configuration |
| Geographic Reference | aic_postalcode, aic_slrregion, aic_slrsubregion, aic_ward, aic_division, aic_uraplanningarea | Geography hierarchy |
| Staging / Integration | aic_staginghsgclinic, aic_stagingaacpostalcodemapping, aic_migcommunicationlog, aic_migconnection | Data exchange and staging |

---

### E12 · SNAP Module Documentation

**Multiple files**
**Gap:** SNAP (programme submission / template management) is referenced across the codebase but never explained as a module. 8 SNAP JS files exist. 2 SNAP plugin classes exist (source only). SNAP entities exist in the main package.

**Enhancement:**
Create `technical/snap-module.md` covering:
- What SNAP is (Programme Submission and Notification platform)
- Which entities are SNAP-specific (aic_submissionwindow, aic_programtemplate, aic_programsubmissiondata, aic_programtemplatefielddefinition, etc.)
- Which web resources serve SNAP forms (8 SNAP JS files — document each)
- Which plugins back SNAP (SubmissionWindowNameUniqueWithinProgramValidator, SubmissionWindowStatusHandler — source only, not deployed)
- Whether SNAP is in active production use or a separate product module
- Deployment gap: no SNAP plugin solution package found — flag for team resolution

---

### E13 · View Documentation — Key Business Views

**File:** `functional/forms-and-views.md`
**Gap:** 1,323 views are counted but not documented. Views define what users see when they open an entity list — they are as important as forms for daily usage.

**Enhancement:**
For the 10 most-used entities, document the **key views** (Active, My, Lookup) with their column sets:

```
**View: Active Clinics (aic_clinic)**
Columns: Clinic Name | Clinic Type | HSG Status | PCN | SLR Sub-Region | Primary Contact | Modified On
Default Sort: Clinic Name ascending
Purpose: Default view for HSG Programme Officers browsing all active clinics
Filter: statecode = 0 (Active records only)
```

Document at minimum: Active view, My Records view, and any programme-specific views (e.g., "HSG Active Clinics", "PCN Pending Onboarding") for each of the top 10 entities.

---

### E14 · Classic Workflow Inventory

**File:** `functional/flows.md`
**Gap:** 69 classic workflows are collapsed into 8 unnamed categories. No individual workflow is documented by name. Team cannot identify which classic workflows need migration to Power Automate.

**Enhancement:**
List all 69 classic workflows individually with:

| Workflow Name | Entity | Trigger | Business Purpose | Migration Priority |
|---|---|---|---|---|
| AICPACES_Case_AssignCaseOnCreate | incident | Record Create | Assigns case to queue on creation | High — replace with PA flow |
| AICPACES_Client_SetNRICFormat | contact | Record Update (aic_nric) | Formats NRIC to uppercase with checksum | Medium |

**Source to read:** `input/solutions/AICPACESCustomizations_1_0_0_88/Workflows/*.xaml` — read each file for display name, entity, trigger, and primary action

---

### E15 · Power BI Report — DAX Measures and Data Model Detail

**Files:** `reporting/power-bi/*.md`
**Gap:** Power BI reports are documented at page level. The remote dataset measures (which live in the shared dataset, not the report) are acknowledged as undocumented. Partner Management Dashboard embedded model has 9 measures — these could be documented from the .pbit DataModelSchema.

**Enhancement:**
- Extract and document the full DAX measure definitions from `Partner Management Dashboard.pbit` (embedded model — all measures are in the .pbit DataModelSchema JSON)
- For the 3 remote-dataset reports: document the expected measures from the shared dataset (flag as requiring dataset owner input for confirmation)
- Add table relationship diagram for the Partner Management Dashboard embedded model (from DataModelSchema → Relationships array)
- Document the `SecurityBindings` present in the Dashboard — what RLS roles are defined and what filter do they apply?

---

## P3 — Completeness and Quality Improvements

### E16 · Canvas App Inspection

**File:** `component-inventory.md` + new `technical/canvas-apps/` files
**Gap:** 3 canvas apps detected but not inspected (definitions not parseable from XML without Power Apps Studio).
**Enhancement:** Open each .msapp file (which is a ZIP) and extract the `Properties.json`, `DataSources.json`, and `Screens/` folder to document: app purpose, screens, data sources, and form entities used.

---

### E17 · Power Pages Structure Documentation

**File:** `component-inventory.md` + new `technical/power-pages.md`
**Gap:** 209 Power Pages components logged but not documented.
**Enhancement:** Using the PAC CLI-managed source in `input/src/` and the solution package, document: portal page hierarchy, web templates, authenticated vs. anonymous access, entity forms exposed to portal users, and portal web roles.

---

### E18 · CI/CD Pipeline Recommendation

**File:** `architecture/solution-blueprint.md`
**Gap:** No CI/CD configuration found — flagged but no recommendation made.
**Enhancement:** Add a **Recommended CI/CD Architecture** section to solution-blueprint.md covering: Azure DevOps pipeline structure for solution export/import, plugin build and test pipeline, Power Platform tooling (PAC CLI, Power Platform Build Tools), environment promotion strategy (Dev → UAT → Prod), and branch/solution version strategy.

---

### E19 · Architecture Diagrams — Expand and Verify

**Files:** `architecture/solution-blueprint.md`, `architecture/data-model.md`, `architecture/dependency-map.md`
**Gap:** Mermaid diagrams are present but show only hub entities and high-level flows. Domain-level diagrams are missing.
**Enhancement:**
- Add domain-specific ERD for HSG lifecycle chain (Application → CR → EPA → Transaction)
- Add domain-specific ERD for PCN clinic-doctor relationship chain
- Add domain-specific ERD for Case routing chain (incident → queue → distribution member → routing history)
- Verify the dependency map upgrade risk ratings against actual usage counts from plugin step data

---

### E20 · Integration Error Recovery Procedures

**File:** `integrations/integration-topology.md`
**Gap:** Error scenarios mentioned as flags but no recovery procedures documented.
**Enhancement:** Add a **Failure Scenarios** section for each integration:
- PCDS outage: is there a message queue? Manual reconciliation process?
- FormSG signature validation failure: is the payload discarded? Logged? Does it notify someone?
- InterRAI timeout: is the client record update retried? Is there a manual trigger to retry?
- NRIC decryption failure: does the plugin surface a user-facing error? Is the record locked?

---

### E21 · Glossary and Acronym Reference

**New file:** `docs-generated/glossary.md`
**Gap:** The documentation uses many domain-specific acronyms (HSG, PCN, RHS, AAC, CHAS, CDMP, SLR, URA, MCR, NRIC, EPA, SBA, LOA, DCV, CSAT, PRM, InterRAI, FormSG, PCDS, ACCR) with no definitions. A new team member from outside Singapore's healthcare sector cannot decode the documentation.
**Enhancement:** Create a glossary covering all domain acronyms with:
- Full form
- Business definition in context of PACES
- Where it appears in the system (entity names, form fields, flow names)

---

## Implementation Sequence (Recommended for Separate Branch)

Execute enhancements in this order to build on each other:

```
Phase 1 — Source Reading (read input files for all enhancements)
  Read all entity Attributes/*.xml        → feeds E1, E2, E8, E11
  Read all Workflows/*.json + *.xaml      → feeds E3, E14
  Read all .js source files               → feeds E4
  Read all plugin .cs source files        → feeds E5
  Read all .rdl SQL <CommandText> nodes   → feeds E6
  Read Custom API XMLs from Other/        → feeds E9
  Read Role XMLs from Other/Roles/        → feeds E8

Phase 2 — Write Enhanced Documents (in dependency order)
  E11 (entity grouping)     — restructure catalogue first, others reference it
  E1  (data dictionary)     — requires entity grouping
  E2  (form field mapping)  — requires entity field definitions
  E3  (flow runbooks)       — requires entity field definitions
  E4  (JS documentation)    — requires entity + form context
  E5  (plugin logic)        — requires entity field definitions
  E6  (SSRS SQL)            — independent
  E7  (integration payloads) — requires entity field definitions
  E8  (security matrix)     — requires entity field definitions
  E9  (custom API params)   — requires entity field definitions
  E10 (process walkthroughs) — requires E1–E5 to be complete
  E12 (SNAP module)         — requires E4, E5
  E13 (views)               — requires E1
  E14 (classic workflows)   — independent
  E15 (Power BI measures)   — independent
  E16–E21                   — independent, run last

Phase 3 — Re-run /index
  Update 00-index.md to link all new files and updated sections
```

---

## Files to Create (Net New)

| New File | Enhancement | Phase |
|---|---|---|
| `technical/snap-module.md` | E12 | 2 |
| `technical/canvas-apps/aic_pacesclient*.md` | E16 | 3 |
| `technical/canvas-apps/aic_pacesclinic*.md` | E16 | 3 |
| `technical/canvas-apps/aic_seacustompage*.md` | E16 | 3 |
| `technical/power-pages.md` | E17 | 3 |
| `glossary.md` | E21 | 3 |

---

## Files to Significantly Expand (Existing)

| File | Enhancements | Scope of Change |
|---|---|---|
| `functional/entity-catalogue.md` | E1, E11 | Add field dictionary per top-10 entity; restructure by feature group |
| `functional/forms-and-views.md` | E2, E13 | Add tab/field inventory per key form; add view column sets |
| `functional/flows.md` | E3, E14 | Add flow runbooks; list all 69 classic WFs by name |
| `functional/functional-overview.md` | E10 | Add 5 end-to-end process walkthroughs |
| `technical/web-resources/paces.md` | E4 | Document all 38 undocumented JS files |
| `technical/plugins/AIC.PACES.Plugins.md` | E5 | Add logic block per plugin class |
| `technical/custom-apis.md` | E9 | Add input/output parameters + example calls |
| `functional/security-model.md` | E8 | Add privilege matrix per role |
| `integrations/integration-topology.md` | E7, E20 | Add payload specs + error recovery |
| `reporting/ssrs/*.md` (all 13) | E6 | Add actual SQL from RDL source |
| `reporting/power-bi/Partner-Management-Dashboard.md` | E15 | Add DAX measure definitions |
| `architecture/solution-blueprint.md` | E18, E19 | Add CI/CD recommendation + domain ERDs |
| `architecture/data-model.md` | E19 | Add domain-specific ERDs |
| `architecture/dependency-map.md` | E19 | Verify and expand upgrade risk ratings |
