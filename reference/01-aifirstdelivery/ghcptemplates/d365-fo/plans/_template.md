---
requirement: {requirement-name}
alm-tool: {alm-tool from 10-alm-configuration.md}
generated-date: {YYYY-MM-DD}
status: PENDING REVIEW
total-objects: {N}
---

# Implementation Plan — {requirement-name}

**Spec Ref:** [fdd.md](../docs/{requirement-name}/fdd.md)
**TDD Ref:** [tdd.md](../docs/{requirement-name}/tdd.md)
**ALM Tool:** {alm-tool from 10-alm-configuration.md}

<!-- GENERATOR: This plan is object-level only — one task per X++ object or configuration item.
     Level 1 = Requirement / Epic | Level 2 = Object Task (one per Object-ID) -->

---

## Table of Contents

1. [Object Summary](#1-object-summary)
2. [Recommended Implementation Sequence](#2-recommended-implementation-sequence)
3. [Object Details](#3-object-details)
4. [Dependency Mapping](#4-dependency-mapping)
5. [Document Control](#5-document-control)

---

# 1. Object Summary

**ALM ID (Epic):** *(pending)*

| Object-ID | ALM ID | Object Name | Category | Object Type | Module | Complexity | T-Shirt | Story Pts | FDD Rules | Depends On |
|---|---|---|---|---|---|---|---|---|---|---|
| EXT-001 | *(pending)* | CustTable.Extension | Extensions | Table Extension | AR | Simple | S | 1 | BR-001 | — |
| EXT-002 | *(pending)* | AVA_{ClassName} | Extensions | New Class | AR | Medium | M | 3 | BR-001, BR-002 | EXT-001 |
| DEN-001 | *(pending)* | AVA_{EntityName} | Data Entities | Data Entity | AR | Medium | M | 3 | BR-003 | EXT-001 |
| INT-001 | *(pending)* | AVA_{InterfaceName} | Integrations | Inbound Interface | AR | Complex | L | 8 | BR-004 | DEN-001 |
| *(add rows)* | *(pending)* | | | | | | | | | |

**Total Objects:** {N} | XS: {n} | S: {n} | M: {n} | L: {n} | XL: {n}
**Total Story Points:** {N}

---

# 2. Recommended Implementation Sequence

Objects listed in dependency order — what must be built first.

1. {Object-ID} — {Object Name} ({reason if not obvious})
2. {Object-ID} — {Object Name}
3. *(continue for all objects)*

**Sequencing rules applied:**
- EDTs and Base Enums before Table Extensions and Form Extensions that reference them
- New Tables before Class Extensions that query them
- Security Privileges before Security Duties; Duties before Roles
- Data Entities after their base Table Extensions
- Integration classes after the Data Entities they depend on

---

# 3. Object Details

---

### EXT-001 — {Object Name}

| Field | Value |
|---|---|
| **Object-ID** | EXT-001 |
| **ALM ID** | *(pending)* |
| **Object Category** | Extensions |
| **Object Type** | Table Extension |
| **Object Name** | `{TechnicalName}` |
| **Module** | {module code} |
| **Complexity** | Simple |
| **T-Shirt** | S |
| **Story Points** | 1 |
| **FDD Reference** | Section 10 |
| **FDD Rules** | BR-001 |
| **TDD Reference** | Section 5.4.4 |
| **Depends On** | — |
| **Description** | {One sentence description of what this object does.} |
| **Priority** | High |

---

### EXT-002 — {Object Name}

| Field | Value |
|---|---|
| **Object-ID** | EXT-002 |
| **ALM ID** | *(pending)* |
| **Object Category** | Extensions |
| **Object Type** | New Class |
| **Object Name** | `{TechnicalName}` |
| **Module** | {module code} |
| **Complexity** | Medium |
| **T-Shirt** | M |
| **Story Points** | 3 |
| **FDD Reference** | Section 10 |
| **FDD Rules** | BR-001, BR-002 |
| **TDD Reference** | Section 5.6.1 |
| **Depends On** | EXT-001 |
| **Description** | {One sentence description of what this object does.} |
| **Priority** | High |

---

*(repeat one ### block per Object-ID)*

---

# 4. Dependency Mapping

## Object-to-Object Dependencies

| Object-ID | Object Name | Depends On | Reason |
|---|---|---|---|
| EXT-002 | {ClassName} | EXT-001 | Class queries the table extension |
| DEN-001 | {EntityName} | EXT-001 | Data entity maps to extended table |
| INT-001 | {InterfaceName} | DEN-001 | Interface uses data entity for import/export |
| *(none — write "None" if no dependencies)* | | | |

## Environment Dependencies

| Requirement | Owner |
|---|---|
| D365 F&O environment with correct model and publisher | {Owner} |
| Azure DevOps pipeline with X++ build agent configured | {Owner} |
| *(add rows)* | |

---

# 5. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/plan) | Initial plan generated from TDD v{n} |
