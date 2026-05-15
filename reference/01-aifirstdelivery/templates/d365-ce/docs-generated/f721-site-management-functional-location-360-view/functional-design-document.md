---
feature: f721-site-management-functional-location-360-view
document-type: Functional Design Document
date: 2026-05-08
status: DRAFT
version: 1.0
spec-ref: specs/f721-site-management-functional-location-360-view/spec.md
parent-epic-id: "454"
parent-epic-title: "E01-Customer Management"
feature-alm-id: "721"
author: Claude Code (/fdd)
intake-mode: structured (l3-intake: optional — FR-NNN deferred to /plan)
---

# Functional Design Document — Site Management - Functional Location 360 View

**Project:** IS - D365 Avanade — Service Operations on Dynamics 365 CE
**Based On:** Functional Specification v1.0 — see [spec.md](../../specs/f721-site-management-functional-location-360-view/spec.md)
**Governed By:** Solution Constitution – Dynamics 365 CE (16-file constitution incl. files 12-FS-entities, 13-FS-scheduling-mobile, 14-FS-deprecations, 15-multilingual)
**Version:** 1.0
**Status:** Draft for Review

> Sections marked **★** are mandatory for technical design and build. Do not leave any ★ section empty or with placeholder-only content.
> **Pre-FR notice:** This FDD was generated from a spec authored under `l3-intake: optional` — FR-NNN are not yet defined; `/plan` will create the L3 PBI and generate FR-NNN. Sections that depend on FR detail (§6, §10, §15, Appendix A) carry forward this deferral and are flagged as Functional Gaps in §16.

---

## Table of Contents

- [1. Document Control](#1-document-control)
- [2. Introduction](#2-introduction)
- [3. System Overview](#3-system-overview)
- [4. Business Process](#4-business-process)
- [★ 5. Object & Artefact Inventory](#-5-object--artefact-inventory)
- [6. Functional Design](#6-functional-design)
- [7. Data Considerations](#7-data-considerations)
- [8. Integration Overview](#8-integration-overview)
- [9. Security Considerations](#9-security-considerations)
- [10. D365 CE Specifics](#10-d365-ce-specifics)
- [11. Non-Functional Requirements](#11-non-functional-requirements)
- [12. Assumptions & Constraints](#12-assumptions--constraints)
- [13. Out of Scope](#13-out-of-scope)
- [14. Risks & Dependencies](#14-risks--dependencies)
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
| 1.0 | 2026-05-08 | Claude Code (/fdd) | Initial Draft — converted from Functional Specification v1.0 (pre-FR; l3-intake: optional). |

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
| TBD | Business Owner | OPEX | Approver |
| TBD | Solution Architect | Avanade | Author |
| TBD | UAT Lead | OPEX | Reviewer |

### 1.4 Related Documents

| Document | Version | Location |
|---|---|---|
| Functional Specification | 1.0 | [spec.md](../../specs/f721-site-management-functional-location-360-view/spec.md) |
| Spec Review | 1.1 | [review.md](../../specs/f721-site-management-functional-location-360-view/review.md) |
| Solution Constitution – D365 CE | 16-files | `constitution/` |
| ALM Configuration | Current | [10-alm-configuration.md](../../constitution/10-alm-configuration.md) |
| Multilingual Rules | Current | [15-multilingual-localization.md](../../constitution/15-multilingual-localization.md) |

---

## 2. Introduction

### 2.1 Purpose

This Functional Design Document is the authoritative reference for build, configuration, and User Acceptance Testing (UAT) of **Site Management - Functional Location 360 View** within the broader Epic 454 (E01-Customer Management). It is intended for developers, testers, and business stakeholders. The FDD elaborates the approved functional specification at [spec.md](../../specs/f721-site-management-functional-location-360-view/spec.md) into structured design content; it does not introduce new requirements. Where the upstream specification was authored under `l3-intake: optional` (FRs deferred to `/plan`), this FDD carries that deferral forward and flags impacted sections in §16 Functional Gap Log.

### 2.2 Scope

This document covers the design for ALM Feature **721 — Site Management - Functional Location 360 View** under Epic 454 (E01-Customer Management). The capability is delivered as a single module:

- **Module 1:** Site Management - Functional Location 360 View — see §6.1.

Cross-references: see [spec.md](../../specs/f721-site-management-functional-location-360-view/spec.md) §5 for the verbatim ALM description and acceptance criteria. FR-NNN range will be assigned by `/plan` from the L3 Product Backlog Item created at that step.

### 2.3 Definitions & Acronyms

| Term / Acronym | Definition |
|---|---|
| D365 CE | Microsoft Dynamics 365 Customer Engagement |
| FR | Functional Requirement |
| FDD | Functional Design Document |
| AC | Acceptance Criteria |
| BR | Business Rule |
| UAT | User Acceptance Testing |
| ALM | Application Lifecycle Management |
| OOB | Out of the Box (standard platform behaviour) |
| RTL | Right-to-Left (script direction for Arabic, Hebrew, Persian, Urdu) |
| RESX | .NET Resource file format used for localized strings |
| Fusion | Oracle Fusion / EBS — upstream system of record for Account, Contact, Site, Install Base |
| OPEX | Project sponsor / customer organisation |

---

## 3. System Overview

### 3.1 High-Level Overview

This feature delivers the capability described in ALM Feature **721** within **D365 Customer Engagement** (Service Operations module of the IS - D365 Avanade implementation). Master data for Account, Contact, Site (Functional Location), and Install Base (Customer Asset) is sourced from **Oracle Fusion** via the upstream sync features (Features 463, 464, 546, 575) — those integrations are scoped separately. This feature consumes the synced records and presents/maintains them in D365 forms, views, and 360-degree summaries for service users, dispatchers, and customer managers.

D365 CE is responsible for: presentation (forms, views, sub-grids), business logic on the D365 side (alternate keys, duplicate-detection rules, security roles), and any non-Fusion-bound informational data created in D365 only (e.g., parent-account hierarchy where stated).

### 3.2 Personas

| Persona | Role Description | Primary Modules |
|---|---|---|
| System | Trigger or system actor (background sync, validation, automation). | Module 1 |

### 3.3 Key Design Decisions

| Decision | Option A | Option B | Selected | Rationale |
|---|---|---|---|---|
| Build approach | OOB Configuration (forms, views, alt keys, dup-detection rules) | Custom plugin / JS / PCF | TBD at /plan | Configuration-first per Constitution §00. Preference: declarative customisation; pro-code only when OOB cannot meet the requirement. |
| FR-NNN sourcing | Generated by /spec-alm at this stage | Deferred to /plan after L3 PBI creation | Deferred to /plan | Project intake mode `l3-intake: optional` (see [10-alm-configuration.md](../../constitution/10-alm-configuration.md)) defers FR-NNN to `/plan`. FDD carries deferral forward. |
| Localization posture | Single-language (en-US) | Multi-language ready (RESX-based, even if shipping en-US only) | Multi-language ready | Constitution §15 mandates multi-language-ready posture; adding a language later is config-only. |

### 3.4 System Configuration & Prerequisites

**System Configuration**

| Configuration Area | Setting / Parameter | Required Value | Notes |
|---|---|---|---|
| Power Platform Environment | Field Service / Customer Service first-party app | Installed (where FS entities are referenced) | See `constitution/12-field-service-entities.md` |
| Power Platform Languages | `supported-languages` from `10-alm-configuration.md` | en-US (default; project may extend) | See `constitution/15-multilingual-localization.md` |
| Solution Layering | Customisation solution layered above FS / URS / RSO managed solutions | Layer above OOB | See `constitution/13-field-service-scheduling-and-mobile.md` §6 |

**Master Data & Reference Data**

| Entity | Prerequisite Records | Owner | Notes |
|---|---|---|---|
| Account | Synced from Fusion (Feature 463) before this feature is exercised | Data team / OPEX | Read-only in D365 except for governance roles |
| Contact | Synced from Fusion (Feature 546) | Data team / OPEX | Read-only in D365 |
| Functional Location | Synced from Fusion (Feature 464) | Data team / OPEX | Read-only in D365 |
| Customer Asset | Synced from Fusion (Feature 575) | Data team / OPEX | Read-only in D365 |

**User & Role Readiness**

| Item | Description |
|---|---|
| OOB FS roles | Use as base where FS is in scope: Field Service - Resource / Dispatcher / Administrator / Inventory Purchase. Do not clone-and-modify (constitution/06). |
| Custom Operations Admin | Where referenced in the spec; final naming to be locked at /plan. |

**FDD / FR Dependencies**

| Dependency | FDD / FR Reference | Required Before |
|---|---|---|
| L3 Product Backlog Item created in ADO under Feature 721 | Generated by `/plan` | FR-NNN can be authored |
| OPEX wireframe sign-off (where layout work is in scope) | Out-of-band approval | `/task` and `/implement` |

---

## 4. Business Process

### 4.1 Process Overview

**As-Is (Current State):** Service users today rely on multiple screens / external lookups / manual cross-referencing to assemble a complete picture of customer / asset / site information for service delivery. The data exists in Fusion and (post-sync) in D365 but is not consolidated into a single, role-appropriate user experience.

**To-Be (Future State):** Site Management - Functional Location 360 View delivers the capability described in the spec to give service users the consolidated view / control they need within D365 CE, leveraging records synced from Fusion and any D365-native informational data added by this feature.

### 4.2 Process Flow

**Step Table**

| Step | Description | Actor | D365 Form / Screen | Happy Path Outcome | Exception / Error Path |
|---|---|---|---|---|---|
| 1 | Master data is synced from Fusion to D365 (precondition) | System | (background) | Account / Contact / Functional Location / Customer Asset records present in D365 | Sync failure logged in upstream ADF pipeline; users see stale / missing data — degrade gracefully |
| 2 | User opens D365 (web or mobile) | Service / Dispatcher / Customer Manager | Home / module landing | Successful authentication; default app module loads | Auth failure → standard D365 error |
| 3 | User navigates to the entity covered by this feature | Service / Dispatcher / Customer Manager | TBD per /plan | Form / view / sub-grid renders per the design | Missing privilege → access-denied per security role |
| 4 | User performs the action described in the spec acceptance criteria | Service / Dispatcher / Customer Manager | TBD per /plan | Action completes; AC satisfied (see §15 Functional Testing) | Validation rule blocks save with localized message (see §10.2) |
| 5 | If applicable, customer-facing notification is sent (booking confirmation, agreement renewal, etc.) | System | (background email / notification) | Email sent in Account.PreferredLanguageCode (per Constitution §15) | Email send failure → DLQ (see Constitution §11) |
| 6 | Audit log captures the change | System | (background audit) | Change recorded in Dataverse audit | N/A — audit is platform-managed |
| 7 | Downstream features consume the result (where applicable) | Other features / agents | (background or inline) | Data available to other features (Asset 360, Cases, Work Orders, etc.) | Data not yet propagated → user advised |
| 8 | Reporting / dashboards reflect the change (where applicable) | Reporting users | Power BI / Fabric dashboards | Updated aggregates per refresh schedule | Refresh delay → users advised of timing |

**Decision Points**

| Decision Point | Condition | Path A | Path B |
|---|---|---|---|
| Record is read-only synced data | Fusion-sourced field | Block edit; surface message | Allow edit on D365-native field only |
| User language available | UILanguageId in supported-languages | Render strings in user's language | Fall back to default-language (en-US) per Constitution §15 |

> **Note (FDD Gap):** Detailed step-level FR-NNN traceability cannot be populated until `/plan` creates the L3 PBI and generates FRs. See §16 (FG-001).

---

## ★ 5. Object & Artefact Inventory

**Pre-FR state.** The objects below are inferred from the spec's §6 Impact Summary; final IDs and complexity are assigned after `/plan` creates the L3 PBI and FR-NNN.

| Object-ID | Object Name | Category | Object Type | Entity / Scope | Complexity | FR Reference | Notes |
|---|---|---|---|---|---|---|---|
| CE-001 | `account` | Extension | Custom Column on existing entity | `account` | Simple | TBD (deferred to /plan) | Surface in 360 / form layout for this feature. |
| CE-002 | `incident` | Extension | Custom Column on existing entity | `incident` | Simple | TBD (deferred to /plan) | Surface in 360 / form layout for this feature. |
| CE-003 | `contact` | Extension | Custom Column on existing entity | `contact` | Simple | TBD (deferred to /plan) | Surface in 360 / form layout for this feature. |
| CE-004 | `msdyn_functionallocation` | Extension | Custom Column on existing entity | `msdyn_functionallocation` | Simple | TBD (deferred to /plan) | Surface in 360 / form layout for this feature. |
| CE-005 | `invoice` | Extension | Custom Column on existing entity | `invoice` | Simple | TBD (deferred to /plan) | Surface in 360 / form layout for this feature. |
| CE-006 | `msdyn_workorder` | Extension | Custom Column on existing entity | `msdyn_workorder` | Simple | TBD (deferred to /plan) | Surface in 360 / form layout for this feature. |

**Complexity guide:** Simple = < 1 day; Medium = 1–3 days; Complex = > 3 days.

> **AI Notes** — Object-IDs are provisional. `/plan` re-numbers and may add objects discovered during decomposition.

---

## 6. Functional Design

### 6.1 Module: Site Management - Functional Location 360 View

#### 6.1.1 Module Overview

This module covers the entirety of ALM Feature **721 — Site Management - Functional Location 360 View**. It is a single-feature module in this FDD; sibling features under Epic 454 are scoped in their own per-feature FDDs. The module's primary personas are listed in §3.2; dependencies are documented in §3.4 and §14.2.

---

#### 6.1.2 Functional Requirements

> **Pre-FR state.** No FR-NNN are present in the source spec; `/plan` will generate them from the L3 Product Backlog Item it creates. The verbatim ALM description and acceptance criteria below carry forward as the functional intent; `/plan` and `/tdd` operate from these.

##### Original Feature Description (verbatim from ALM)

This EPIC covers the end‑to‑end
Customer Management capability
within Dynamics 365, consolidating how customer data is structured, maintained, and synchronised across
Accounts, Sites/Locations, Contacts, and Installed Base Assets within D365
.

The EPIC ensures that Dynamics 365 becomes the system of engagement for service operations while maintaining authoritative alignment with
Oracle Fusion / EBS Install Base
, supporting accurate service delivery, entitlement validation, and downstream service processes.

The scope includes core customer master data management, hierarchical account modelling, site and address structures, contact management for both enterprise and service-only use cases, assets for service execution, and all required integrations between D365 and Fusion for these entities.

---

#### Feature: 721 — Site Management - Functional Location 360 View

**ALM ID:** 721
**State:** Ready
**Original Description:**
As a System



I want all the Associated records (Contacts, Assets, Cases/Work Orders, Invoices etc,) tied to site‑level on an account


So that Site (Functional Location) 360 View is available.

##### Original Acceptance Criteria (verbatim from ALM)

AC:1









Given a Functional Location exists in D365,


When viewed in D365,


Then the Functional Location form should show fields and all the Associated records in respective grids/tabs as per the expected layout.







Technical Notes:


-
Functional team will create a simple wireframe in excel/miro/figma/visio collaborating with tech team for the Functional Location form.

-
Tech team will include the customization is solution

- Add/remove tabs/fields based on feedback from OPEX
- Remove unnecessary items from related record sitemap if applicable

> **AI Notes** — Per Constitution §15, when these strings are surfaced to users in D365 forms or notifications, they must be loaded from per-culture RESX/web-resource files — never hardcoded. This applies even though only en-US is initially shipped (multi-language-ready posture).

---

#### 6.1.3 Functional Logic

The module logic follows directly from the verbatim acceptance criteria above. Upon the trigger described in §4.2, the system: (a) loads the relevant Dataverse records (synced from Fusion or D365-native), (b) presents them per the form/view design referenced in §10.1, (c) accepts user action per the AC, (d) applies validation per §6.1.4 and §10.2, and (e) raises any required notifications per §10.7. Detailed FR-by-FR logic will be elaborated by `/plan` and `/tdd`.

#### 6.1.4 Validation & Error Handling

| Validation ID | Trigger | Condition | Action | Error / Warning Message | Severity |
|---|---|---|---|---|---|
| VAL-001 | On save (synced fields) | User attempts to edit a Fusion-sourced field | Block | "{localized: 'This field is sourced from Fusion and cannot be edited in D365.'}" — loaded from RESX per Constitution §15 | Error |
| VAL-002 | On display (multi-language) | User's UILanguageId not in `supported-languages` | Fallback to `default-language` | (no message; silent fallback) | Info |

> **AI Notes** — VAL-001 message is the canonical example of why hardcoded English literals are a /review BLOCKER (Constitution §15 §4.1). At /implement time the literal must come from a localized resource even though only en-US is shipped initially.

#### 6.1.5 Acceptance Criteria

ALM-provided AC preserved verbatim from the spec:

AC:1









Given a Functional Location exists in D365,


When viewed in D365,


Then the Functional Location form should show fields and all the Associated records in respective grids/tabs as per the expected layout.







Technical Notes:


-
Functional team will create a simple wireframe in excel/miro/figma/visio collaborating with tech team for the Functional Location form.

-
Tech team will include the customization is solution

- Add/remove tabs/fields based on feedback from OPEX
- Remove unnecessary items from related record sitemap if applicable

> **AI Notes** — When `/plan` decomposes the L3 PBI, additional AC will be authored under each generated FR-NNN with the minimum two scenarios (positive + negative) per Constitution §spec-alm rules.

#### 6.1.6 Traceability

| FR Reference | Requirement Title | BR # | Acceptance Criteria Ref |
|---|---|---|---|
| _(deferred)_ | _(generated by /plan)_ | _(deferred)_ | _(see §6.1.5; numbered ACs to be assigned by /plan)_ |

---

## 7. Data Considerations

### 7.1 Key Entities

| Entity (Display Name) | Schema Name | Description | Source | Direction |
|---|---|---|---|---|
| Table | `account` | Surface in 360 / form layout for this feature. | D365-native | D365-native |
| Table | `incident` | Surface in 360 / form layout for this feature. | D365-native | D365-native |
| Table | `contact` | Surface in 360 / form layout for this feature. | D365-native | D365-native |
| Table | `msdyn_functionallocation` | Surface in 360 / form layout for this feature. | D365-native | D365-native |
| Table | `invoice` | Surface in 360 / form layout for this feature. | D365-native | D365-native |
| Table | `msdyn_workorder` | Surface in 360 / form layout for this feature. | D365-native | D365-native |

### 7.2 Data Flow Summary

- Master data flows from **Oracle Fusion → D365 Dataverse** via upstream sync features (out of scope for this FDD).
- Within D365, this feature reads synced records and (where applicable) writes D365-native fields only.
- No D365 → Fusion outbound flow is permitted for this feature.
- Notifications (email / in-app) flow from Dataverse via Power Automate to recipients; recipient language drives template selection.

### 7.3 Data Dependencies

- All synced master-data sync features (463, 464, 546, 575) must be live before this feature is exercised end-to-end.
- D365 Field Service / Customer Service first-party apps must be installed where FS entities are referenced.

### 7.4 Calculated & Rollup Fields

N/A at FDD level. Any calculated / rollup fields required by `/plan`'s generated FRs will be added in subsequent FDD revisions.

---

## 8. Integration Overview

This feature consumes records produced by upstream Fusion → D365 sync features (Features 463, 464, 546, 575) — those integrations are out of scope here. No D365 → Fusion outbound flow is permitted for this feature. Integration failures upstream must not block core CE operations: this feature degrades gracefully by displaying records as they exist in D365 at the time of access.

---

### Integration: Fusion → D365 (upstream context only)

**Direction:** Inbound (upstream — out of scope for this FDD)
**Mechanism:** ADF / SFTP pipeline owned by the data-migration domain (separate agent).
**Trigger:** Scheduled (frequency TBD).
**Target Entity:** Account / Contact / Functional Location / Customer Asset.
**Error Handling / DLQ Strategy:** Owned upstream; this feature degrades gracefully on stale/missing data.

> **AI Notes** — The FS deprecation gate (Constitution §14) is **PASS** for this feature: no use of the legacy FS↔F&O dual-write integration, no IoT Central, no Outlook Add-in / Teams app / Viva / Planner integrations.

---

## 9. Security Considerations

### 9.1 Role-Based Access Control

| Role | Access Level | Key Restrictions |
|---|---|---|
| Field Service - Resource | Read on Account / Contact / FL / Customer Asset; Read/Update on assigned Work Orders / Bookings | Cannot create Accounts / Contacts; cannot edit Fusion-sourced fields |
| Field Service - Dispatcher | Read on Account / Contact / FL / Customer Asset; Read/Update on Work Order / Booking org-wide | Cannot edit Fusion-sourced fields |
| Customer Manager (Operations Admin custom role) | Read/Update on Account D365-native fields (e.g., Parent Account, custom Billing/Service flag) | Cannot edit Fusion-sourced fields |
| Service Representative | Read on all entities in scope | Cannot edit any record outside personal queue |
| System Administrator | Full | OOB; do not modify (Constitution §06) |

**Segregation of Duties (SoD)**

| Conflict ID | Role A | Role B | Conflicting Privilege | SoD Risk | Mitigation |
|---|---|---|---|---|---|
| SoD-001 | Operations Admin | Field Service - Dispatcher | Both can edit dispatch-related fields if both are assigned | Low | Document role-assignment policy; do not assign both to the same user without explicit approval. |

### 9.2 Field-Level Security

| Field (Display Name) | Entity | Readable By | Editable By | Business Justification |
|---|---|---|---|---|
| (Cost / pricing fields, where applicable) | Customer Asset / Work Order | Operations Admin / Service Manager | Operations Admin | Per Constitution §06 — restrict cost columns from frontline workers. |

### 9.3 Data Visibility Constraints

- Fusion-sourced records are read-only for non-admin roles.
- Customer-facing surfaces (portal, customer-facing emails) only show records the customer's contact is associated with.

### 9.4 Audit Logging Requirements

| Entity (Display Name) | Columns Audited | Retention Period | Business Justification |
|---|---|---|---|
| Account | All D365-native columns added by this feature | 7 years | PII / financial / compliance |
| Contact | All D365-native columns added by this feature | 7 years | PII |
| Customer Asset | Status / location / ownership change columns | 7 years | Asset history (FS) |
| Functional Location | Status / hierarchy change columns | 7 years | Service-location history |

### 9.5 Secret Management

| Secret / Config Value | Type | Key Vault Reference | Used By |
|---|---|---|---|
| (none introduced by this feature) | — | — | — |

---

## 10. D365 CE Specifics

### 10.1 Form and View Specifications

> **Note:** All forms must be clones of the OOB form — never modify a system form directly (Constitution §01).
> **Pre-FR state:** Detailed form / view specifications will be authored by `/plan` and `/tdd` once FR-NNN exist. The placeholder below is a Functional Gap (FG-002).

#### Form: TBD per /plan

**Purpose:** TBD — will be detailed when FR-NNN are generated.
**Object-ID:** CE-NNN (see §5)

| Schema Name | Display Name | Data Type | Length | Required | Default Value | Editable | Visibility Rule |
|---|---|---|---|---|---|---|---|
| _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ |

### 10.2 Business Rules

| Rule ID | Rule Name | Applies To | Condition | Action | Enforcement | User Message |
|---|---|---|---|---|---|---|
| _(deferred to /plan)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(localized via RESX per §15)_ |

### 10.3 Security Matrix (Detailed Privileges)

| Persona | Entity | Create | Read | Write | Delete | Append | AppendTo | Share | Assign |
|---|---|---|---|---|---|---|---|---|---|
| Field Service - Resource | Account | — | BU | — | — | ✓ | ✓ | — | — |
| Field Service - Resource | Contact | — | BU | — | — | ✓ | ✓ | — | — |
| Field Service - Dispatcher | Account | — | Org | — | — | ✓ | ✓ | — | — |
| Operations Admin | Account | ✓ | Org | ✓ (D365-native fields only) | — | ✓ | ✓ | — | — |

> Final security matrix per /plan once FR-NNN are generated.

### 10.4 Environment Variables

| Schema Name | Display Name | Type | Default Value | Used By (FR / Integration) |
|---|---|---|---|---|
| `opex_DefaultLanguage` | Default Language | String | `en-US` | All localized strings (per Constitution §15) |
| `opex_SupportedLanguages` | Supported Languages (CSV) | String | `en-US` | Mobile offline profile sizing, language fallback |

### 10.5 Automation (Flows / Workflows)

| Automation Name | Object-ID | Type | Trigger | Async / Sync | Steps (Summary) | FR Reference |
|---|---|---|---|---|---|---|
| _(deferred to /plan)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ |

> Constitution §11 cap: synchronous flows ≤ 5s end-to-end. All async flows must implement DLQ handling.

### 10.6 Plugins / Custom Code

N/A at this stage — no plugin / JS / PCF requirements identified in source spec. Constitution §00 config-first preference applies; `/plan` will confirm if any pro-code is required.

> **Reminder (Constitution §02 + §15):** if any plugin is added at /plan, user-facing exception messages must come from a localized RESX resource — never hardcoded literals. This is a /review BLOCKER on the generated code.

### 10.7 Email / Notification Templates

| Template Name | Trigger / Scenario | Recipient(s) | From | Subject | Body Summary | FR Reference |
|---|---|---|---|---|---|---|
| _(deferred to /plan if customer-facing notification is in scope)_ | — | — | — | — | — | — |

> **Localization (Constitution §15):** customer-facing email templates use **Account.PreferredLanguageCode**; internal notifications use **SystemUser.UILanguageId**. One template per language per use case (e.g., `opex_TemplateName_en-US`, `opex_TemplateName_fr-FR`).

### 10.8 Reports / Dashboards

N/A — no reports introduced by this feature.

### 10.9 Ribbon / Command Bar

N/A at FDD level — ribbon / command bar customisations (if any) will be specified by `/plan`.

### 10.10 Duplicate Detection Rules

| Rule Name | Entity | Match Criteria | Condition | Action on Duplicate Found | FR Reference |
|---|---|---|---|---|---|
| _(deferred — see spec for upstream Fusion alt-key requirements where applicable)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ |

---

## 11. Non-Functional Requirements

| Category | Requirement | Target / Measure |
|---|---|---|
| Performance | Form load — primary form | ≤ 2 seconds (Constitution §11) |
| Performance | Form save (synchronous plugin chain) | ≤ 3 seconds (Constitution §11) |
| Performance | Synchronous plugin execution | ≤ 2 seconds (Constitution §11) |
| Performance | Schedule Board initial load (if FS in scope) | ≤ 3 s (Constitution §11 — FS-specific) |
| Scalability | Record volume per year | TBC at /plan |
| Availability | Production uptime | ≥ 99.9% monthly (Constitution §11) |
| Reliability | Unhandled plugin exception rate | < 0.1% of executions |
| Security | Authentication | Azure AD / Entra ID (Constitution §11) |
| Security | Secret management | Azure Key Vault only |
| Multilingual | Form load time per language | Unchanged regardless of supported-languages count (platform caches metadata per locale) |
| Multilingual | Translation coverage at UAT promotion | 100% of new components translated to every `supported-languages` entry |
| Mobile (FS) | Offline DB size with all language packs loaded | < 1 GB (Constitution §11 / §13) — multilingual offline metadata grows ~10% per language pack |

---

## 12. Assumptions & Constraints

### 12.1 Assumptions

| ID | Assumption | Owner | Impact if Wrong |
|---|---|---|---|
| A-001 | Fusion → D365 sync features (463, 464, 546, 575) are delivered in parallel and live before this feature is exercised. | Data team / OPEX | 360 views / forms render empty; UAT cannot proceed. |
| A-002 | OPEX wireframes are signed off before any /task or /implement runs (where layout work is in scope). | OPEX | UI rebuild risk; UAT delay. |
| A-003 | Multi-language-ready posture is enforced at /implement (no hardcoded user-facing strings). | Dev team | Adding a language post-go-live becomes a re-engineering effort. |
| A-004 | OOB FS roles are used as the base; any variant is a delta role only. | Solution Architect | Security model drifts from Microsoft-supported pattern. |

### 12.2 Constraints

| ID | Constraint | Source | Affected FR(s) |
|---|---|---|---|
| C-001 | No D365 → Fusion outbound flow permitted for this feature. | Spec / upstream architecture | All FRs (deferred) |
| C-002 | Schema names are English-only, lowercase, prefixed; choice-set integer values are immutable. | Constitution §03 + §15 | All schema-touching FRs |
| C-003 | No plugin on `msdyn_workorder.msdyn_systemstatus` or `bookableresourcebooking.bookingstatus` Update may mutate other FS state. | Constitution §02 + §12 | All FS-touching FRs |
| C-004 | Hardcoded user-facing strings are forbidden — all strings via per-culture RESX / web resources. | Constitution §15 | All code-generating FRs |

---

## 13. Out of Scope

| Module | Out of Scope Item | Rationale |
|---|---|---|
| 1 | Sibling features under Epic 454 | Each has its own per-feature FDD |
| 1 | Upstream Fusion → D365 sync (Features 463, 464, 546, 575) | Owned by data-migration agent / separate features |
| 1 | Customer-merge handling (Feature 545 — Cancelled in ADO) | De-scoped at ALM level |
| 1 | Knowledge-Article-related work (where not specifically referenced in this feature) | Owned by Epic 459 (E06-Knowledge Base) |
| 1 | Implementation detail (entity specifics, plugin design, flow orchestration) | Belongs in /tdd and /blueprint |

---

## 14. Risks & Dependencies

### 14.1 Key Risks

| Risk ID | Description | Probability | Impact | Owner | Mitigation |
|---|---|---|---|---|---|
| R-001 | Form-layout / 360-view changes referenced in technical notes require OPEX wireframe sign-off; proceeding without it would violate the 'no UI change without functional design approval' gate. | Medium | Medium | Project Lead | Block /task generation for layout work until wireframe is approved. |
| R-002 | Any 'make table read-only except admin' rule (where applicable) may conflict with least-privilege OOB security-role design. | Medium | Medium | Project Lead | Prefer Field Security Profile / column-level security on governed fields rather than table-wide lockdown. |
| R-101 | Pre-FR state — FRs deferred to /plan; FDD sections that depend on FR detail are placeholders | High | Medium | Project Lead | `/plan` runs immediately after FDD review approval; subsequent FDD revisions backfill the deferred sections |

### 14.2 External Dependencies

| Dependency | Owner | Required By (FR-NNN) | Risk Level |
|---|---|---|---|
| Fusion → D365 master-data sync | Data team / OPEX | All FRs in this feature | Medium |
| OPEX wireframe sign-off (where layout work) | OPEX | All UI-touching FRs | Medium |
| FS / URS / RSO version pinning in CI | Release engineering | All FS-touching FRs | Low |

---

## 15. Functional Testing

| TC # | Test Case Title | Type | Precondition | Steps | Expected Result | FR Reference | AC Reference |
|---|---|---|---|---|---|---|---|
| TC-001 | Verify primary feature happy path | Positive | Synced master data exists; user has correct role | (per ALM AC) | (per ALM AC) | (deferred to /plan) | (per spec §11) |
| TC-002 | Verify edit blocked on Fusion-sourced field | Negative | Synced record exists; user is non-admin | Open form; attempt to edit governed field | Save blocked; localized message per VAL-001 | (deferred) | — |
| TC-003 | Verify language fallback | Multilingual | User's UILanguageId not in supported-languages | Open form | Strings render in `default-language` per Constitution §15 | — | — |

> Full test plan generated separately by `/testplan`. Multilingual smoke tests run per language; RTL screenshots required if any RTL language in supported-languages.

---

## 16. Functional Gap Log

| Gap ID | Description | Impact | Priority | Owner | Target Resolution | Status |
|---|---|---|---|---|---|---|
| FG-001 | FR-NNN deferred to `/plan` per `l3-intake: optional` intake mode. FDD §6 / §10 / Appendix A carry placeholders until /plan runs. | High | High | Project Lead | After /plan completes | Open |
| FG-002 | Form / view specifications in §10.1 are deferred — populated by /plan and /tdd. | Medium | High | Solution Architect | After /tdd completes | Open |
| FG-003 | Detailed business-rules table in §10.2 is deferred — populated when FR-NNN exist. | Medium | Medium | Solution Architect | After /plan completes | Open |
| FG-004 | Open spec question carried forward: None flagged in ALM source — confirm during /review. | Medium | Medium | Spec author / Business Owner | TBD | Open |

---

## 17. Additional Specifications

This feature touches Field Service-managed entities (e.g. msdyn_customerasset, msdyn_functionallocation). Per `constitution/12-field-service-entities.md`, do NOT replace these tables — extend only via your publisher prefix. Per `constitution/13-field-service-scheduling-and-mobile.md`, mobile-offline implications apply if this feature is exposed in the FS Mobile app.

**Multilingual readiness:** This feature is authored under the multi-language-ready posture (Constitution §15). Even if only `en-US` is shipped initially, all user-facing strings (form labels, view names, choice values, email templates, plugin error messages, JS / PCF strings) must be loaded from per-culture RESX / web resources. Adding a language later is then a configuration event — not a re-engineering effort.

**Localization Matrix:** placeholder entry (full matrix authored when FR-NNN exist):

| Artefact | Type | Source language | Target languages | Translator / Team | Sign-off date |
|---|---|---|---|---|---|
| Form labels (this feature's forms) | Form labels | en-US | (per `supported-languages`) | Localization team | TBD |
| Email templates (if customer-facing) | Email template | en-US | (per `supported-languages`) | Localization team | TBD |
| Plugin / JS exception messages | Code resource (RESX) | en-US | (per `supported-languages`) | Dev team + Localization team | TBD |

---

## Appendix A — Full Traceability Matrix

| FR Reference | Requirement Title | Module | Object-ID(s) | BR # | AC Reference | TC Reference |
|---|---|---|---|---|---|---|
| _(deferred to /plan)_ | _(deferred)_ | Module 1 | _(deferred)_ | _(deferred)_ | _(per spec §11)_ | TC-001 |

> When `/plan` generates FR-NNN, this appendix is the authoritative trace from each FR to its module, object-ID, business rule, acceptance criteria, and test case.

---

## Appendix B — Field Mapping Reference

| Entity (Display Name) | Schema Name | Field (Display Name) | Schema Name | Data Type | Length | Required | Default Value | FR Reference |
|---|---|---|---|---|---|---|---|---|
| _(deferred to /plan)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ | _(deferred)_ |

> Consolidated field mapping is generated when `/plan` produces FR-NNN and `/tdd` finalises the form/view designs.
