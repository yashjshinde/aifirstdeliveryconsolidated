---
feature: f719-activity-management-manual-creation-of-emails-and-phone-call
date: 2026-05-08
status: DRAFT
intake: structured
l3-intake: optional
author: Claude Code (/spec-alm)
source-file: tools/alm-agent/output/wi-export-features-20260508.json
parent-epic-id: "454"
parent-epic-title: "E01-Customer Management"
multi-domain-flags:
  integration: 0
  data-migration: 0
alm-ids:
  L1:
    - id: "454"
      title: "E01-Customer Management"
  L2:
    - id: "719"
      title: "Activity Management - Manual Creation of Emails and Phone calls"
  L3:
    - id: "(pending)"
      title: "(to be defined during planning)"
      source: pending
      parent-l2: "719"
---

# Functional Specification — Activity Management - Manual Creation of Emails and Phone calls

> **Project:** IS - D365 Avanade — Service Operations on Dynamics 365 CE
> **Parent Epic:** 454 — E01-Customer Management
> **Feature ALM ID:** 719 (state: Ready)
> **Intake Mode:** Structured — single-feature slice enhanced from ALM
> **Version:** 1.0
> **Status:** Draft for Review


This is a **per-feature** specification slice. It contains exactly one L2 (Feature 719) under its parent Epic (454). The L3 layer is pending — /plan will decompose this feature into Product Backlog Item stories and Tasks.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Scope](#2-scope)
3. [Actors and Personas](#3-actors-and-personas)
4. [Business Process Overview](#4-business-process-overview)
5. [Functional Requirements by ALM Hierarchy](#5-functional-requirements-by-alm-hierarchy)
6. [D365 CE Impact Summary](#6-d365-ce-impact-summary)
7. [Business Rules](#7-business-rules)
8. [Assumptions and Constraints](#8-assumptions-and-constraints)
9. [Open Questions](#9-open-questions)
10. [Constitution Risks](#10-constitution-risks)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Document Control](#12-document-control)
13. [ALM Traceability Matrix](#13-alm-traceability-matrix)

---

## 1. Overview

**Business Objective:**
Deliver the capability described in ALM Feature **719 — Activity Management - Manual Creation of Emails and Phone calls** within the broader Epic 454 (E01-Customer Management). The capability is documented verbatim in §5; this section paraphrases the intent only — no requirements are introduced beyond the ALM source.

**Success Criteria:**
- The acceptance criteria preserved verbatim in §11 are demonstrably met.
- The capability integrates cleanly with the upstream Fusion → D365 master-data sync features and any downstream service processes referenced in the feature description.

> **AI Notes** — This is a single-feature slice; the Overview is intentionally narrow. /plan will widen scope only if the L3 stories it generates surface explicit dependencies.

---

## 2. Scope

### In Scope
- ALM Feature **719 — Activity Management - Manual Creation of Emails and Phone calls** (the entirety of this single feature, as described in §5).

### Out of Scope
- All sibling features under Epic 454 (E01-Customer Management) — they have their own per-feature specs.
- Any cross-epic interactions unless explicitly raised in §9 Open Questions.
- Implementation detail (entities, fields, plugin/flow design) — that belongs in /tdd and /blueprint.

> **AI Notes** — Cross-feature concerns inferred from the description are listed as Open Questions (§9), not silently absorbed into scope.

---

## 3. Actors and Personas

| Persona | Role in Feature | D365 CE Security Role |
|---|---|---|
| D365 user | Service-side user creating/viewing records. | TBD (custom Service role expected) |

> **AI Notes** — Personas are extracted from "As a …" patterns in the feature description. Final security role names are deferred to /plan.

---

## 4. Business Process Overview

The end-to-end flow for this single feature follows directly from the ALM description:

1. The persona/trigger described in §5 initiates the action.
2. D365 CE responds per the acceptance criteria preserved in §11.
3. Outcomes are visible via the form layouts / views described in the technical notes (subject to wireframe sign-off where applicable).

> **AI Notes** — Process detail is intentionally light — it is fully described by the verbatim Description and AC in §5/§11.

---

## 5. Functional Requirements by ALM Hierarchy

<!-- Single-feature slice with l3-intake: optional. FR-NNN are NOT generated here — /plan will decompose this L2 into PBIs and generate Tasks under them. -->

---

### Epic: 454 — E01-Customer Management

**ALM ID:** 454
**Original Description:**
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

#### Feature: 719 — Activity Management - Manual Creation of Emails and Phone calls

**ALM ID:** 719
**State:** Ready
**Original Description:**
As a D365 user,

I want the system to collect only certain data points for Phone call records within D365

So that forms are quick to fill in and user friendly.



TBD - Phone call
Form Layout and Visible list of fields.



TBD - Email


Form Layout and Visible list of fields.

**Original Acceptance Criteria from ALM (verbatim):**
GIVEN A customer calls requesting a service

WHEN a D365 user enters the information in D365

THEN only relevant fields are available for data entry.



GIVEN A call record exists in D365

WHEN a D365 user Looks at the record

THEN only relevant fields are available on the form.



GIVEN a D365 user sends an email from within D365

WHEN a D365 user Looks at the email record

THEN only relevant fields are available on the form.



Technical Notes:


-
Functional team will create a sample wireframe in excel/miro/figma/visio collaborating with tech team for the Phone and Email form.

- Add/remove tabs/fields based on feedback from OPEX
- Remove unnecessary items from related record sitemap if applicable

##### *(Pending) Product Backlog Item: to be defined during planning*

**ALM ID:** *(pending)*
**Parent L2:** 719 — Activity Management - Manual Creation of Emails and Phone calls
**Status:** No L3 work items were provided for this L2 branch.
`/plan` will decompose this L2 into Product Backlog Item stories and generate Tasks under them.

> **AI Notes** — Feature description and acceptance criteria are preserved verbatim per /spec-alm rule. /plan should keep ALM IDs intact and only generate new L3 IDs for the pending entry.

---

## 6. D365 CE Impact Summary

| Component | Entity / Form / Object | Change Type | Notes |
|---|---|---|---|
| Table | `email` | Modified | Surface in 360 / form layout for this feature. |
| Table | `phonecall` | Modified | Surface in 360 / form layout for this feature. |

> **AI Notes** — Impact rows are inferred from entities mentioned in the description and AC. /plan will replace these with confirmed entities.

---

## 7. Business Rules

> Empty until /plan generates L3 stories and inline FR/BR references. With `l3-intake: optional` and no L3 in the ALM source, no FR-NNN have been emitted in this spec.

| Rule ID | Rule Description | Enforcement Point |
|---|---|---|
| _(none yet)_ | | |

---

## 8. Assumptions and Constraints

**Assumptions:**
- Upstream Fusion → D365 sync of the master-data entities referenced by this feature is in place before this feature is delivered.
- Wireframes are signed off by OPEX before any UI / form-layout implementation work begins.
- Configuration-first preference applies — declarative customisation is attempted before plugins or flows.

**Constraints:**
- Synced master-data records remain read-only for non-admin roles unless an explicit AC overrides this.
- ALM IDs are immutable — this feature retains ALM ID **719** and parent Epic **454**.

---

## 9. Open Questions

| Q# | Question | ALM ID Ref | Raised By | Status |
|---|---|---|---|---|
| Q-001 | TBD in ALM source: `TBD - Phone call` | 719 | Spec Agent | Open |
| Q-002 | TBD in ALM source: `TBD - Email` | 719 | Spec Agent | Open |

---

## 10. Constitution Risks

| Risk ID | Description | Proposed Alternative |
|---|---|---|
| CR-001 | Form-layout / 360-view changes referenced in technical notes require OPEX wireframe sign-off; proceeding without it would violate the 'no UI change without functional design approval' gate. | Block /task generation for layout work until wireframe is approved. |
| CR-002 | Any 'make table read-only except admin' rule (where applicable) may conflict with least-privilege OOB security-role design. | Prefer Field Security Profile / column-level security on governed fields rather than table-wide lockdown. |

> **AI Notes** — Risks are common across the slice and are restated here per-feature for /review traceability. Multi-domain risks (CR-003 / CR-004) appear only when domain signals are detected in the ALM text.

---

## 11. Acceptance Criteria

> ALM-provided acceptance criteria are preserved verbatim. /plan will redistribute these across the L3 stories it generates.

**L2-719 — Activity Management - Manual Creation of Emails and Phone calls**
GIVEN A customer calls requesting a service

WHEN a D365 user enters the information in D365

THEN only relevant fields are available for data entry.



GIVEN A call record exists in D365

WHEN a D365 user Looks at the record

THEN only relevant fields are available on the form.



GIVEN a D365 user sends an email from within D365

WHEN a D365 user Looks at the email record

THEN only relevant fields are available on the form.



Technical Notes:


-
Functional team will create a sample wireframe in excel/miro/figma/visio collaborating with tech team for the Phone and Email form.

- Add/remove tabs/fields based on feedback from OPEX
- Remove unnecessary items from related record sitemap if applicable

---

## 12. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-05-08 | Claude Code (/spec-alm) | Per-feature slice generated from `tools/alm-agent/output/wi-export-features-20260508.json`. Parent Epic: 454 (E01-Customer Management). L3 deferred to /plan. |

---

## 13. ALM Traceability Matrix

| L1 ALM ID | L2 ALM ID | L3 ALM ID | L3 Title | Source | FR References | BR References |
|---|---|---|---|---|---|---|
| 454 | 719 | *(pending)* | *(to be defined in /plan)* | pending | — | — |
