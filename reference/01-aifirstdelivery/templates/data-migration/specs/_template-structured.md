---
migration: {migration-id}
date: {YYYY-MM-DD}
status: DRAFT
intake: structured
l3-intake: required         # required (default) | optional — see constitution/10-alm-configuration.md
author: Claude Code (/spec-alm)
direction: SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP
alm-ids:
  L1:
    - id: "{L1-ALM-ID}"
      title: "{L1 Title}"
  L2:
    - id: "{L2-ALM-ID}"
      title: "{L2 Title}"
  L3:
    - id: "{L3-ALM-ID}"
      title: "{L3 Title}"
      source: alm            # alm = provided by ALM tool | pending = no L3 given; /plan will generate
    # Example pending entry (l3-intake: optional only):
    # - id: "(pending)"
    #   title: "(to be defined during planning)"
    #   source: pending
    #   parent-l2: "{L2-ALM-ID}"
---

# Migration Specification — {migration-id}

> **Project:** {Project Name}
> **Intake Mode:** Structured — enhanced from ALM work items
> **Version:** 1.0
> **Status:** Draft for Review

---

## Table of Contents

1. [Overview](#1-overview)
2. [Business Justification](#2-business-justification)
3. [Source System Description](#3-source-system-description)
4. [Target System Description](#4-target-system-description)
5. [Staging Requirements](#5-staging-requirements)
6. [Migration Requirements by ALM Hierarchy](#6-migration-requirements-by-alm-hierarchy)
7. [Data Volume and Frequency](#7-data-volume-and-frequency)
8. [Data Quality Rules](#8-data-quality-rules)
9. [Error Handling Requirements](#9-error-handling-requirements)
10. [Security and Compliance Requirements](#10-security-and-compliance-requirements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Dependencies and Pre-conditions](#12-dependencies-and-pre-conditions)
13. [Out of Scope](#13-out-of-scope)

---

## 1. Overview

| Field | Value |
|---|---|
| Migration ID | {migration-id} |
| Direction | {SFTP_TO_DATAVERSE \| DATAVERSE_TO_SFTP} |
| Source System | {Derived from L1/L2 ALM items} |
| Target System | {Derived from L1/L2 ALM items} |
| Entities / Files | {Derived from L3 ALM items} |
| Estimated Volume | {From ALM item or assumption} |
| Frequency | {From ALM item or assumption} |
| Priority | {From ALM item priority field} |
| Requested By | {From ALM item assigned-to or requestor} |

> **AI Notes** — {1–2 sentences: direction inferred from ALM items, volume assumption, or schedule decision}

---

## 2. Business Justification

{Derived from the L1 work item title and description — why this migration is needed and what business process it supports.}

> **AI Notes** — {1–2 sentences: business driver inferred from ALM context}

---

## 3. Source System Description

- **System name and owner:** {from ALM item}
- **Connection type:** SFTP / SQL / REST API / Dataverse
- **Authentication method:** {from ALM item or assumption}
- **File format (if SFTP):** CSV / JSON / XML, encoding, delimiter, header row
- **Available fields:**

| Field Name | Data Type | Nullable | ALM Source |
|---|---|---|---|
| {field} | {type} | Yes / No | {L3-ALM-ID} |

- **Data quality concerns:** {inferred from ALM item description}

> **AI Notes** — {1–2 sentences: field list inferred from ALM story, gaps to resolve}

---

## 4. Target System Description

- **System name and owner:** {from ALM item}
- **Connection type:**
- **Entities / tables / files to be written:**
- **Target authentication method:**
- **Alternate key for upsert:** {from ALM item or assumption}
- **Existing data:** {Is there existing data that could conflict?}

> **AI Notes** — {1–2 sentences: upsert key assumption or existing data risk from ALM context}

---

## 5. Staging Requirements

- **SQL staging database:** {database name}
- **New tables needed:** {list}
- **Retention period for staging data:** {N} days

> **AI Notes** — {1–2 sentences: staging design derived from ALM hierarchy scope}

---

## 6. Migration Requirements by ALM Hierarchy

<!-- GENERATOR: Requirements are grouped by the imported L1/L2/L3 ALM hierarchy. Each L3 work item is
     enhanced with MR-NNN migration requirements. MR numbers are sequential across the entire spec.
     Every L3 ALM ID maps to at least one MR-NNN. -->

---

### {L1-Type}: {L1-ALM-ID} — {L1 Title}

**ALM ID:** {L1-ALM-ID}
**Original Description:** {verbatim text as imported from ALM}

---

#### {L2-Type}: {L2-ALM-ID} — {L2 Title}

**ALM ID:** {L2-ALM-ID}
**Original Description:** {verbatim text as imported from ALM}

---

##### {L3-Type}: {L3-ALM-ID} — {L3 Title}

**ALM ID:** {L3-ALM-ID}
**Original Story / Description:** {verbatim text as imported from ALM}

---

###### MR-001 — {Enhanced Migration Requirement Title}

**Description:** {What the pipeline / SQL / integration must do — clear, implementation-ready language.}

**Direction:** {SFTP→Dataverse / Dataverse→SFTP}

**Inputs:**
- {Source field or file}

**Outputs:**
- {Target field, staging table, or output file}

**Transformation Rules:**
- {Field mapping or data transformation rule}

**Data Quality:**
- {Required field, format constraint, or business rule}

**Dependencies:**
- **Upstream:** {MR-NNN or external dependency this depends on}
- **Downstream:** {MR-NNN or process that depends on this}

**Non-Functional Considerations:**
- **Performance:** {volume target, window}
- **Security:** {PII handling, encryption}
- **Reliability:** {retry policy, dead-letter}

**Traceability:** {L3-ALM-ID} — {L3 Title}

> **AI Notes** — {1–2 sentences: what was inferred from the ALM story, key assumption made, or constitution risk flagged}

---

###### MR-002 — {Next Migration Requirement Title}

*(repeat MR block structure)*

---

*(Repeat L3 block for each imported User Story / L3 work item)*

*(If `l3-intake: optional` and this L2 has no L3 items — use this pending placeholder instead of a L3 block):*

---

##### *(Pending) {L3-Type}: to be defined during planning*

**ALM ID:** *(pending)*
**Parent L2:** {L2-ALM-ID} — {L2 Title}
**Status:** No L3 work items were provided for this L2 branch.
`/plan` will decompose this L2 into {L3-Type} stories and generate Tasks under them.

---

*(Repeat L2 block for each imported Feature / L2 work item)*

*(Repeat L1 block for each imported Epic / L1 work item)*

---

## 7. Data Volume and Frequency

| Entity | Estimated Records | File Size | Frequency | Window |
|---|---|---|---|---|
| {entity} | {N} | {size} | {cron / event} | {time window} |

> **AI Notes** — {1–2 sentences: volume or frequency assumption from ALM items}

---

## 8. Data Quality Rules

### {Entity Name}

| Rule | Type | Condition | Action on Failure |
|---|---|---|---|
| {field} is required | Required | IS NULL | Reject to err table |
| {field} format | Format | NOT LIKE pattern | Reject to err table |

> **AI Notes** — {1–2 sentences: quality rule inference from ALM items}

---

## 9. Error Handling Requirements

- **Acceptable error rate:** < {N}% of records per run may fail
- **When threshold exceeded:** Stop pipeline / Continue and alert
- **Notification:** {who}, {channel}
- **Error file delivery:** {location}

> **AI Notes** — {1–2 sentences: error handling assumption from ALM context}

---

## 10. Security and Compliance Requirements

| Field | Classification | Encryption Required | Masking in Non-Prod |
|---|---|---|---|
| {field} | PII / Sensitive / Internal / Public | Yes / No | Yes / No |

- **PGP encryption:** {required for outbound files?}
- **Audit logging:** {what is logged, retention}

> **AI Notes** — {1–2 sentences: PII classification assumption or encryption decision from ALM items}

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Performance | Process {N} records in < {duration} |
| Availability | Pipeline must complete in window {HH:MM}–{HH:MM} |
| Retry | Max {N} retries before alerting |
| Data Retention | Staging data retained for {N} days |
| Recovery | RTO {duration}, RPO {duration} |

---

## 12. Dependencies and Pre-conditions

- [ ] Source system accessible from ADF
- [ ] Target entity / table exists with required fields
- [ ] SQL Staging database provisioned
- [ ] Key Vault configured with required secrets
- [ ] ADF linked services created and tested
- [ ] {custom dependency}

---

## 13. Out of Scope

- {Item derived from ALM item boundaries}

---

## ALM Traceability Matrix

<!-- GENERATOR: Maps each imported ALM ID to the MR-NNN requirements generated from it.
     Used by /plan to map Tasks back to their parent L3 ALM IDs.
     The Source column indicates whether the L3 came from the ALM tool (alm) or is pending generation by /plan (pending). -->

| L1 ALM ID | L2 ALM ID | L3 ALM ID | L3 Title | Source | MR References |
|---|---|---|---|---|---|
| {L1-ALM-ID} | {L2-ALM-ID} | {L3-ALM-ID} | {L3 Title} | alm | MR-001, MR-002 |
| {L1-ALM-ID} | {L2-ALM-ID} | *(pending)* | *(to be defined in /plan)* | pending | — |
