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
**Governed By:** Solution Constitution – Reporting
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
- [3. Business Context](#3-business-context)
  - [3.1 High-Level Overview](#31-high-level-overview)
  - [3.2 Personas and Audiences](#32-personas-and-audiences)
  - [3.3 Key Design Decisions](#33-key-design-decisions)
- [4. Business Process](#4-business-process)
  - [4.1 Process Overview](#41-process-overview)
  - [4.2 User Journey](#42-user-journey)
- [★ 5. Report Catalogue](#-5-report-catalogue)
- [★ 6. Functional Design](#-6-functional-design)
  - [6.1 Module: {Name}](#61-module-name)
- [★ 7. Data Requirements](#-7-data-requirements)
  - [7.1 Source Systems](#71-source-systems)
  - [7.2 Key Entities and Fields](#72-key-entities-and-fields)
  - [7.3 Data Refresh Requirements](#73-data-refresh-requirements)
- [★ 8. RLS Requirements](#-8-rls-requirements)
  - [8.1 Security Roles](#81-security-roles)
  - [8.2 Filter Rules per Role](#82-filter-rules-per-role)
- [9. Integration Overview](#9-integration-overview)
- [10. Non-Functional Requirements](#10-non-functional-requirements)
- [11. Assumptions and Dependencies](#11-assumptions-and-dependencies)
- [12. Open Questions and Risks](#12-open-questions-and-risks)
- [13. Functional Acceptance Criteria](#13-functional-acceptance-criteria)

---

## 1. Document Control

### 1.1 Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | {Author} | Initial draft |

### 1.2 Approvals

| Role | Name | Signature | Date | Status |
|---|---|---|---|---|
| Business Owner | | | | Pending |
| BI Lead | | | | Pending |
| QA Lead | | | | Pending |
| Project Manager | | | | Pending |

### 1.3 Distribution List

| Name | Role | Organisation |
|---|---|---|
| | | |

### 1.4 Related Documents

| Document | Location | Status |
|---|---|---|
| Functional Specification | `specs/{feature-name}/spec.md` | APPROVED |
| Test Plan and Strategy | `docs-generated/{feature-name}/test-plan-and-strategy.md` | — |
| Technical Design Document | `docs-generated/{feature-name}/technical-design-document.md` | — |

---

## 2. Introduction

### 2.1 Purpose

{Describe the purpose of this Functional Design Document. What reporting capability is being delivered and for whom.}

### 2.2 Scope

**In scope:**
- {Report / dataset / measure set / RLS configuration}

**Out of scope:**
- {Items explicitly excluded}

### 2.3 Definitions & Acronyms

| Term | Definition |
|---|---|
| Power BI | Microsoft Power BI — self-service analytics and reporting platform |
| SSRS | SQL Server Reporting Services — operational and paginated report platform |
| RLS | Row-Level Security — Power BI / SSRS mechanism for restricting data visibility per user |
| Dataset | Power BI semantic model (data model with tables, relationships, DAX measures) |
| TMDL | Tabular Model Definition Language — Power BI dataset source-control format |
| DAX | Data Analysis Expressions — formula language for Power BI measures and calculated columns |

---

## 3. Business Context

### 3.1 High-Level Overview

{Describe the business need this reporting solution addresses. Include the current-state problem and the desired future-state outcome.}

### 3.2 Personas and Audiences

| Persona | Role | Report Access | Key Questions Answered |
|---|---|---|---|
| {e.g., Sales Manager} | {Role} | {All regions} | {What is my team's revenue this month?} |
| {e.g., Sales Rep} | {Role} | {Own territory} | {How am I tracking against target?} |

### 3.3 Key Design Decisions

| Decision | Options Considered | Choice | Rationale |
|---|---|---|---|
| {e.g., Data connectivity} | {Import vs DirectQuery} | {Import} | {Performance — data refreshed daily} |

---

## 4. Business Process

### 4.1 Process Overview

{Describe how business users will interact with the reports. Include discovery, navigation, filtering, and sharing patterns.}

### 4.2 User Journey

{Step-by-step user journey for the primary report consumer — from opening the workspace to taking action on an insight.}

---

## ★ 5. Report Catalogue

| Report Name | Type | Audience | Primary KPIs / Metrics | Refresh | RLS Applied |
|---|---|---|---|---|---|
| {Sales Dashboard} | Power BI Interactive | Sales Manager, Sales Rep | Revenue, Pipeline, Win Rate | Daily 06:00 UTC | Yes — territory |
| {Invoice Report} | Power BI Paginated | Finance | Invoice totals, payment status | On demand | No |

---

## ★ 6. Functional Design

### 6.1 Module: {Module Name}

*(Repeat for each module / report group)*

#### Functional Requirements

| FR | Description | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-001 | {Description} | Must Have | {AC-001: …} |

#### Report Specification: {Report Name}

**Report Type:** {Power BI Interactive | Power BI Paginated | SSRS}
**Canvas Size:** {1280×720 | Letter | Custom}
**Pages / Tabs:**

| Page | Purpose | Key Visuals | Filters Available |
|---|---|---|---|
| {Summary} | {Executive view} | {KPI card, bar chart} | {Date, Region} |

**Interactions and Navigation:**
- {Drill-through from Summary to Detail page on click of Region bar}
- {Bookmarks for toggling between Revenue and Units view}

**DAX Measures Used:**
- {[Total Revenue], [Revenue YTD], [Win Rate %]}

---

## ★ 7. Data Requirements

### 7.1 Source Systems

| System | Connection Type | Tables / Entities Used | Refresh Pattern |
|---|---|---|---|
| {D365 CE Dataverse} | {Import / DirectQuery} | {Opportunity, Account, SystemUser} | {Daily} |
| {SQL Staging} | {Import} | {stg_opportunity} | {Post-ADF pipeline run} |

### 7.2 Key Entities and Fields

| Source Entity | Key Fields | Notes |
|---|---|---|
| {Opportunity} | {Revenue, CloseDate, OwnerId, AccountId} | {Revenue in base currency only} |

### 7.3 Data Refresh Requirements

| Dataset | Refresh Schedule | Incremental Refresh | Archive Period |
|---|---|---|---|
| {Sales Dataset} | {Daily at 06:00 UTC} | {Yes — 7 days rolling} | {3 years} |

---

## ★ 8. RLS Requirements

### 8.1 Security Roles

| Role Name | Description | Users / Groups |
|---|---|---|
| {Territory Manager} | {Sees all data within assigned territories} | {Sales Managers group} |
| {Sales Rep} | {Sees only own opportunity records} | {Sales Reps group} |

### 8.2 Filter Rules per Role

| Role | Table | Filter Expression | Notes |
|---|---|---|---|
| {Sales Rep} | {Opportunity} | {[OwnerId] = USERPRINCIPALNAME()} | {Dynamic RLS via UPN} |
| {Territory Manager} | {Territory} | {[ManagerEmail] = USERPRINCIPALNAME()} | {Requires Territory lookup table} |

---

## 9. Integration Overview

{Describe how this reporting solution integrates with upstream systems (ADF pipelines, Dataverse connectors, SSRS data sources, API feeds). List any dependencies on data migration or integration pipelines.}

| Integration | Direction | Type | Owner |
|---|---|---|---|
| {ADF Staging Pipeline} | {ADF → SQL → Dataset} | {Scheduled push} | {Data Migration agent} |

---

## 10. Non-Functional Requirements

| Requirement | Target | Notes |
|---|---|---|
| Dashboard load time | < 3 seconds | {Import mode — post refresh} |
| Paginated report render time | < 10 seconds | {For datasets up to 100k rows} |
| Data refresh latency | Daily by 07:00 UTC | {Refresh window: 06:00–07:00 UTC} |
| RLS coverage | 100% of sensitive reports | {Verified by RLS security test suite} |
| Concurrent users | {50} | {Power BI Premium capacity required above 20 concurrent} |

---

## 11. Assumptions and Dependencies

| # | Assumption / Dependency | Owner | Impact if Wrong |
|---|---|---|---|
| A-001 | {Dataverse connector available with service principal} | {Platform team} | {Cannot use Import mode} |
| A-002 | {Power BI Premium Per User (PPU) licensed for all consumers} | {Licensing team} | {Cannot use paginated reports or deployment pipelines} |

---

## 12. Open Questions and Risks

| # | Question / Risk | Raised By | Status | Resolution |
|---|---|---|---|---|
| OQ-001 | {Does the sales hierarchy need to be reflected in RLS?} | {BA} | Open | — |

---

## 13. Functional Acceptance Criteria

| FR | Acceptance Criteria | Test Case Ref |
|---|---|---|
| FR-001 | {AC-001: Revenue KPI card displays current month revenue in base currency} | TC-{MODULE}-DA-001 |
