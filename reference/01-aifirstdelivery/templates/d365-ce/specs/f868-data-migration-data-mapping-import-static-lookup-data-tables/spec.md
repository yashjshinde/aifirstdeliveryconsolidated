---
feature: f868-data-migration-data-mapping-import-static-lookup-data-tables
date: 2026-05-08
status: DRAFT
intake: structured
l3-intake: optional
author: Claude Code (/spec-alm)
source-file: tools/alm-agent/output/wi-export-features-20260508.json
parent-epic-id: "460"
parent-epic-title: "E07-System Configurations"
multi-domain-flags:
  integration: 0
  data-migration: 0
alm-ids:
  L1:
    - id: "460"
      title: "E07-System Configurations"
  L2:
    - id: "868"
      title: "Data Migration - Data Mapping & Import Static/Lookup data tables into D365"
  L3:
    - id: "(pending)"
      title: "(to be defined during planning)"
      source: pending
      parent-l2: "868"
---

# Functional Specification — Data Migration - Data Mapping & Import Static/Lookup data tables into D365

> **Project:** IS - D365 Avanade — Service Operations on Dynamics 365 CE
> **Parent Epic:** 460 — E07-System Configurations
> **Feature ALM ID:** 868 (state: Refinement)
> **Intake Mode:** Structured — single-feature slice enhanced from ALM
> **Version:** 1.0
> **Status:** Draft for Review


This is a **per-feature** specification slice. It contains exactly one L2 (Feature 868) under its parent Epic (460). The L3 layer is pending — /plan will decompose this feature into Product Backlog Item stories and Tasks.

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
Deliver the capability described in ALM Feature **868 — Data Migration - Data Mapping & Import Static/Lookup data tables into D365** within the broader Epic 460 (E07-System Configurations). The capability is documented verbatim in §5; this section paraphrases the intent only — no requirements are introduced beyond the ALM source.

**Success Criteria:**
- The acceptance criteria preserved verbatim in §11 are demonstrably met.
- The capability integrates cleanly with the upstream Fusion → D365 master-data sync features and any downstream service processes referenced in the feature description.

> **AI Notes** — This is a single-feature slice; the Overview is intentionally narrow. /plan will widen scope only if the L3 stories it generates surface explicit dependencies.

---

## 2. Scope

### In Scope
- ALM Feature **868 — Data Migration - Data Mapping & Import Static/Lookup data tables into D365** (the entirety of this single feature, as described in §5).

### Out of Scope
- All sibling features under Epic 460 (E07-System Configurations) — they have their own per-feature specs.
- Any cross-epic interactions unless explicitly raised in §9 Open Questions.
- Implementation detail (entities, fields, plugin/flow design) — that belongs in /tdd and /blueprint.

> **AI Notes** — Cross-feature concerns inferred from the description are listed as Open Questions (§9), not silently absorbed into scope.

---

## 3. Actors and Personas

| Persona | Role in Feature | D365 CE Security Role |
|---|---|---|
| System | Trigger or system actor (background sync, validation, automation). | TBD (custom Service role expected) |

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

### Epic: 460 — E07-System Configurations

**ALM ID:** 460
**Original Description:**


---

#### Feature: 868 — Data Migration - Data Mapping & Import Static/Lookup data tables into D365

**ALM ID:** 868
**State:** Refinement
**Original Description:**
Get static/lookup data from to D365. So far, we know of:

- National Discount
- Large Customer
- Payment Term
- Equipment Discount
- Customer Category



I reviewed this today (5/7) provided by OPEX to Ajay. This is not ready for import. This needs a call with OPEX to map them to Out of box tables like Work Order Type, Work Order Sub Statuses, Incident Type, Service Task Types, Get more details for Problem Code,

- Task Types
- Problem Code
- Service Request Status
- Service Request Type


Source:


- Field Service Reference Data - Avinash added some of the file here

- FILES to Import - additional items provided by OPEX earlier

**Original Acceptance Criteria from ALM (verbatim):**
- See links in the description to source files and the tables
- Import the tables into DEV environment
- Please start a new document as a template

-  OPEX Deployment Guide in the DEPLOYMENT folder in OPEX SharePoint as this will be repeated for TEST/UAT/PROD environments.
- Document getting the data into the environment as a pre-requisite
- This data is also a pre-requisite for migration of core data so mention this to Omkar.

##### *(Pending) Product Backlog Item: to be defined during planning*

**ALM ID:** *(pending)*
**Parent L2:** 868 — Data Migration - Data Mapping & Import Static/Lookup data tables into D365
**Status:** No L3 work items were provided for this L2 branch.
`/plan` will decompose this L2 into Product Backlog Item stories and generate Tasks under them.

> **AI Notes** — Feature description and acceptance criteria are preserved verbatim per /spec-alm rule. /plan should keep ALM IDs intact and only generate new L3 IDs for the pending entry.

---

## 6. D365 CE Impact Summary

| Component | Entity / Form / Object | Change Type | Notes |
|---|---|---|---|
| Table | `msdyn_workorder` | Modified | Surface in 360 / form layout for this feature. |

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
- ALM IDs are immutable — this feature retains ALM ID **868** and parent Epic **460**.

---

## 9. Open Questions

| Q# | Question | ALM ID Ref | Raised By | Status |
|---|---|---|---|---|
| Q-001 | None flagged in ALM source — confirm during /review. | 868 | Spec Agent | Open |

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

**L2-868 — Data Migration - Data Mapping & Import Static/Lookup data tables into D365**
- See links in the description to source files and the tables
- Import the tables into DEV environment
- Please start a new document as a template

-  OPEX Deployment Guide in the DEPLOYMENT folder in OPEX SharePoint as this will be repeated for TEST/UAT/PROD environments.
- Document getting the data into the environment as a pre-requisite
- This data is also a pre-requisite for migration of core data so mention this to Omkar.

---

## 12. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-05-08 | Claude Code (/spec-alm) | Per-feature slice generated from `tools/alm-agent/output/wi-export-features-20260508.json`. Parent Epic: 460 (E07-System Configurations). L3 deferred to /plan. |

---

## 13. ALM Traceability Matrix

| L1 ALM ID | L2 ALM ID | L3 ALM ID | L3 Title | Source | FR References | BR References |
|---|---|---|---|---|---|---|
| 460 | 868 | *(pending)* | *(to be defined in /plan)* | pending | — | — |
