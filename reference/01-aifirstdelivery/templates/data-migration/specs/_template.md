---
migration: {migration-id}
date: {YYYY-MM-DD}
status: DRAFT
direction: SFTP_TO_DATAVERSE | DATAVERSE_TO_SFTP
author: Claude Code (/spec)
---

# Migration Specification — {migration-id}

> **Project:** {Project Name}
> **Version:** 1.0
> **Status:** Draft for Review

---

## Table of Contents

1. [Overview](#1-overview)
2. [Business Justification](#2-business-justification)
3. [Source System Description](#3-source-system-description)
4. [Target System Description](#4-target-system-description)
5. [Staging Requirements](#5-staging-requirements)
6. [Data Volume and Frequency](#6-data-volume-and-frequency)
7. [Field Scope](#7-field-scope)
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
| Source System | {name, type, owner} |
| Target System | {name, type, owner} |
| Entities / Files | {list} |
| Estimated Volume | {records or file size per run} |
| Frequency | {one-time \| daily \| hourly \| event-triggered} |
| Priority | {High \| Medium \| Low} |
| Requested By | {stakeholder} |

> **AI Notes** — {1–2 sentences: direction inference, volume assumption, or scheduling risk flagged}

---

## 2. Business Justification

Why this migration is needed. Reference the business process it supports.

> **AI Notes** — {1–2 sentences: business driver inferred or assumption made about justification}

---

## 3. Source System Description

- **System name and owner:**
- **Connection type:** SFTP / SQL / REST API / Dataverse
- **Authentication method:**
- **File format (if SFTP):** CSV / JSON / XML, encoding, delimiter, header row
- **Available fields:**

| Field Name | Data Type | Nullable | Notes |
|---|---|---|---|
| {field} | {type} | Yes / No | {notes} |

- **Data quality concerns:** {known issues: nulls, encoding problems, date formats}

> **AI Notes** — {1–2 sentences: inferred connection type, missing field detail, or data quality risk}

---

## 4. Target System Description

- **System name and owner:**
- **Connection type:**
- **Entities / tables / files to be written:**
- **Target authentication method:**
- **Alternate key for upsert:** {field used to identify existing records}
- **Existing data:** {Is there existing data that could conflict? Yes / No — describe}

> **AI Notes** — {1–2 sentences: upsert key assumption or existing data conflict risk}

---

## 5. Staging Requirements

- **SQL staging database:** {database name}
- **New tables needed:** {list} / Reusing existing: {list}
- **Retention period for staging data:** {N} days

> **AI Notes** — {1–2 sentences: staging design decision or retention assumption}

---

## 6. Data Volume and Frequency

| Entity | Estimated Records | File Size | Frequency | Window |
|---|---|---|---|---|
| {entity} | {N} | {size} | {cron / event} | {time window} |

> **AI Notes** — {1–2 sentences: volume or window assumption that affects pipeline design}

---

## 7. Field Scope

**Included fields:** {List all source fields that must be migrated}

**Excluded fields:**

| Field | Reason for Exclusion |
|---|---|
| {field} | {reason} |

> **AI Notes** — {1–2 sentences: field inclusion assumption or gap requiring confirmation}

---

## 8. Data Quality Rules

For each entity:

### {Entity Name}

| Rule | Type | Condition | Action on Failure |
|---|---|---|---|
| {field} is required | Required | IS NULL | Reject record to err table |
| {field} format | Format | NOT LIKE pattern | Reject record |
| {field} in approved list | Lookup | NOT IN ({values}) | Reject record |
| {field} > 0 | Business | {condition} | {action} |

> **AI Notes** — {1–2 sentences: quality rule inference or assumption about acceptable failure rate}

---

## 9. Error Handling Requirements

- **Acceptable error rate:** < {N}% of records per run may fail
- **When threshold exceeded:** Stop pipeline / Continue and alert
- **Notification:** {who}, {channel — email / Service Bus / Logic App}
- **Error file delivery:** {back to source / error SFTP folder / error table only}

> **AI Notes** — {1–2 sentences: error threshold assumption or notification channel decision}

---

## 10. Security and Compliance Requirements

| Field | Classification | Encryption Required | Masking in Non-Prod |
|---|---|---|---|
| {field} | PII / Sensitive / Internal / Public | Yes / No | Yes / No |

- **Data residency:** {region requirement}
- **Audit / logging:** {what is logged, retention}
- **PGP encryption:** {required for outbound files? Yes / No}

> **AI Notes** — {1–2 sentences: PII classification assumption or encryption decision}

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Performance | Process {N} records in < {duration} |
| Availability | Pipeline must complete in window {HH:MM}–{HH:MM} |
| Retry | Max {N} retries before alerting |
| Data Retention | Staging data retained for {N} days |
| Recovery | RTO {duration}, RPO {duration} |

> **AI Notes** — {1–2 sentences: NFR gap or assumption that affects pipeline trigger design}

---

## 12. Dependencies and Pre-conditions

- [ ] Source system accessible from ADF (network, firewall, credentials)
- [ ] Target entity / table exists with required fields
- [ ] SQL Staging database provisioned
- [ ] Key Vault configured with required secrets
- [ ] ADF linked services created and tested
- [ ] {custom dependency}

> **AI Notes** — {1–2 sentences: dependency risk or pre-condition that may block implementation}

---

## 13. Out of Scope

Explicitly list what is NOT part of this migration.

- {Item 1}
- {Item 2}

> **AI Notes** — {1–2 sentences: boundary decision made or adjacent requirement excluded deliberately}
