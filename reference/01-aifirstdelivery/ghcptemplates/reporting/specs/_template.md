---
feature: {feature-name}
date: {YYYY-MM-DD}
status: DRAFT
author: Claude Code (/spec)
---

# Functional Specification — {Feature Display Name}

> **Project:** {Project Name}
> **Version:** 1.0
> **Status:** Draft for Review

---

## Table of Contents

1. [Overview](#1-overview)
2. [Scope](#2-scope)
3. [Report Catalogue](#3-report-catalogue)
4. [Business Process Overview](#4-business-process-overview)
5. [Functional Requirements](#5-functional-requirements)
6. [Report Impact Summary](#6-report-impact-summary)
7. [Business Rules](#7-business-rules)
8. [Data Model Requirements](#8-data-model-requirements)
8a. [Data Transformation and Staging](#8a-data-transformation-and-staging)
9. [Assumptions and Constraints](#9-assumptions-and-constraints)
10. [Open Questions](#10-open-questions)
11. [Constitution Risks](#11-constitution-risks)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [Document Control](#13-document-control)
14. [Traceability Matrix](#14-traceability-matrix)
15. [Brownfield Context](#15-brownfield-context)

---

## 1. Overview

**Business Objective:** {What reporting problem this feature solves and why — one paragraph.}

**Reporting Stack:** Power BI | SSRS / Paginated Reports | Azure Analysis Services | Dataverse / D365 Data

**Success Criteria:**
- {Measurable outcome 1 — e.g., "All account managers can view pipeline KPIs without manual extracts"}
- {Measurable outcome 2}

---

## 2. Scope

### In Scope
- {Explicit list of reports, datasets, and report types included}

### Out of Scope
- {Explicit exclusions — never leave blank}

---

## 3. Report Catalogue

| Report Name | Report Type | Target Audience | Data Source | Refresh Schedule | RLS Required |
|---|---|---|---|---|---|
| {Name} | Power BI Interactive / Power BI Paginated / SSRS | {Personas} | {Source} | {Schedule} | Yes / No |

---

## 4. Business Process Overview

<!-- GENERATOR: Describe how reports are consumed in the business workflow in numbered steps.
     Include: who creates/publishes, who consumes, how they access (portal / D365 CE / Canvas App / email),
     and what decisions they make with the data. -->

1. {Step — data source or trigger event}
2. {Step — dataset refresh / transformation / calculation}
3. {Step — report rendered, distributed, or embedded}
4. {Step — consumer action or downstream outcome}

---

## 5. Functional Requirements

<!-- GENERATOR: Group FRs under module headings representing distinct reporting domains (e.g., Sales Analytics,
     Finance Dashboards). Number FRs sequentially across all modules — do not reset per module. -->

---

### Module: {Module Name — e.g., Sales Pipeline Dashboard / Finance Reports / Customer Service KPIs}

**Module scope:** {One sentence describing what reporting domain this module covers.}

---

#### FR-001 — {Requirement Title}

**Description:** {What the report must show — clear, business-language description.}

**Report Type:** Power BI Interactive | Power BI Paginated | SSRS

**Target Audience:** {Personas and security roles who consume this report.}

**Data Sources:**
- {D365 CE entity / Dataverse table / SQL table or other source. For SSRS: stored procedure name if known.}

**Key Measures and KPIs:**

| KPI | Logic | Table Name | Field Names / Filters Applied | Display Format | Remarks |
|---|---|---|---|---|---|
| {KPI name} | {Business calculation — plain language} | {Source table} | {Field names and filter conditions} | Currency \| % \| Integer \| Decimal N dp | {Rounding rule, ⚠ NEW, assumptions} |

**Filters and Slicers:** {Available filters; default values; cross-filter behaviour.}

**Visuals / Layout:** {Page list with purpose; key visual types; drill-through targets.}

**Canvas Size:** {Width × Height — default 1280×720 px interactive / 1280×960 px paginated. Justify deviations.}

**Accessibility:** {WCAG AA compliance: contrast ≥ 4.5:1; alt-text on key visuals; tooltip text; keyboard-navigation needs.}

**RLS Requirements:** {Roles, filter logic in plain language, named test user per role. If none: "No RLS — report is fully open". Flag ⚠ RLS MISSING in §11 if D365 entity data with no RLS.}

**Embedding Scenarios:** {If embedded: scenario (D365 CE form / Canvas App / Teams / Portal), auth method, cross-tenant, token refresh. Write "Not embedded" if not applicable.}

**Refresh Schedule:** {Frequency and timing. Incremental refresh required? "Yes — fact > 10M rows" or "No".}

**Export / Delivery:** {Export formats. Subscription: frequency, distribution list, trigger, attachment format. "No subscription" if not required.}

**Business Rules:**
- BR-001: {Rule — e.g., revenue rounded to 2 decimal places; RLS must filter by security role}

**Story Decomposition Guidance:**
- **Suggested Actors:** {Who consumes or triggers this report}
- **Suggested User Intent:** {What the persona is trying to analyse or decide}
- **Suggested System Actions:** {Sequence: refresh trigger → transform → render → distribute}
- **Possible Story Splits:** {By report page / by dataset / by RLS role / by delivery channel}

**Dependencies:**
- **Upstream:** {FR-NNN or data source this depends on}
- **Downstream:** {FR-NNN or consumer process that depends on this}

**Non-Functional Considerations:**
- **Performance:** {page load target — default < 3 sec interactive / < 10 sec paginated; data volume; concurrency}
- **Security:** {Sensitivity label: Public | Internal | Confidential | Highly Confidential — Confidential minimum for D365 data}
- **Scalability:** {Row count over 3 years; Premium capacity requirement if > 200 concurrent users}
- **Reliability:** {Refresh failure alert; retry on timeout}

**Traceability:** {Source requirement ID or business request reference}

> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or constitution risk flagged.}

---

#### FR-002 — {Requirement Title}

*(repeat FR block structure)*

---

### Module: {Second Module Name}

*(repeat module structure)*

---

## 6. Report Impact Summary

| Report Name | Module | Type | Dataset | Data Sources | RLS | Sensitivity Label | Workspace |
|---|---|---|---|---|---|---|---|
| {Report Name} | {Module} | Power BI Interactive / Paginated / SSRS | {Dataset} | {Sources} | Yes / No | Confidential | {ProjectName}-DEV / -UAT / -PROD |

> **AI Notes** — {1–2 sentences on overall impact scope and any cross-report dataset sharing.}

---

## 7. Business Rules

| Rule ID | Rule Description | Report / Measure Applied |
|---|---|---|
| BR-001 | {Rule} | {Report name or measure name} |
| BR-002 | {Rule} | {Report name or measure name} |

> **AI Notes** — {1–2 sentences on any rules with broad cross-report impact.}

---

## 8. Data Model Requirements

<!-- GENERATOR: For each dataset list required tables, key relationships, and storage mode.
     Flag ⚠ NEEDS REVIEW for data not yet available. In brownfield mode, cross-reference
     functional/entity-catalogue.md and mark each table REUSED / EXTEND / NEW. -->

**Dataset: {DatasetName}**

| Table | Role | Storage Mode | Source | Brownfield Action |
|---|---|---|---|---|
| {TableName} | Fact / Dimension | Import / DirectQuery / Composite | {D365 entity / SQL / API} | REUSED / EXTEND / NEW |

**Relationships:** {Single-direction unless bi-directional justified. Role-playing dimensions noted — USERELATIONSHIP() required in TDD.}

**Date Dimension:** {Required fields: Date, Year, Quarter, Month, Month Name, Week, Financial Quarter, Financial Year. Fiscal calendar required? Yes / No.}

> **AI Notes** — {1–2 sentences on storage mode rationale or any ⚠ NEEDS REVIEW items.}

---

## 8a. Data Transformation and Staging

<!-- GENERATOR: Only if dataset requires transformation before loading. -->

**Dataflow: {DataflowName}** *(if applicable)*

- **Source → Destination mapping:** {Summary of key transformations; field-level detail belongs in TDD.}
- **Dataflow dependencies:** {Which dataflows must complete before dataset refresh runs.}
- **Incremental refresh:** {Required if fact > 10M rows. Archive window / incremental window / partitioning column.}
- **Refresh sequencing:** {Required refresh order for multiple datasets; cross-dataset dependencies.}

Write "No dataflow dependencies" if dataset connects directly to source.

> **AI Notes** — {1–2 sentences on transformation complexity or staging approach.}

---

## 9. Assumptions and Constraints

**Assumptions:**
- {Assumption — e.g., data available in Dataverse; gateway configured; DEV/UAT/PROD workspaces exist}

**Constraints:**
- {Constraint — e.g., Power BI Premium Per User required for paginated; model size < 1 GB; SSRS 2019}
- **Credential management:** {All credentials in Azure Key Vault or gateway credential store — no hardcoded credentials in PBIX or RDL.}
- **Scalability:** {Expected row growth over 3 years for key fact tables; Premium capacity requirement noted.}

> **AI Notes** — {1–2 sentences on any capacity or licensing constraints that affect design choices.}

---

## 10. Open Questions

| Q# | Question | Raised By | Status |
|---|---|---|---|
| Q-001 | {Ambiguity that could not be resolved by inference} | Spec Agent | Open |

---

## 11. Constitution Risks

| Risk ID | Description | Proposed Alternative |
|---|---|---|
| CR-001 | {Potential constitution conflict — e.g., RLS bypass risk, delegation-unsafe filter} | {Compliant approach} |

*(Write "None identified." if no risks.)*

---

## 12. Acceptance Criteria

Write testable scenarios using Given / When / Then — at least one positive and one negative path per module. Include an RLS criterion for every module with RLS requirements.

**Module: {Module Name}**
- **Given** {precondition}, **When** {filter applied or report accessed}, **Then** {expected report output}.
- **Given** {RLS precondition}, **When** {user without permission accesses report}, **Then** {data is restricted or access denied}.

---

## 13. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/spec) | Initial draft |

---

## 14. Traceability Matrix

| Source Ref | Description | Module | FR-NNN | ALM Epic | ALM Feature | ALM Story |
|---|---|---|---|---|---|---|
| {REQ-NNN or document section} | {Brief description} | {Module} | FR-001 | {EP-NNN or —} | {FT-NNN or —} | {US-NNN or —} |

---

## 15. Brownfield Context

<!-- GENERATOR: Generate this section only when brownfield.enabled: true in constitution/10-alm-configuration.md.
     Table Name and Field Names must use exact names from functional/entity-catalogue.md and reporting docs.
     Write "Not applicable — greenfield deployment." if brownfield.enabled: false or docs are absent. -->

| FR | KPI / Attribute | Logic | Table Name | Field Names / Filters Applied | Action | Remarks |
|---|---|---|---|---|---|---|
| FR-001 | {KPI or attribute name} | {Business calculation — plain language} | {Exact table from entity-catalogue} | {Exact field names and filters} | REUSED \| EXTEND \| NEW | {Delta or ⚠ flag} |
