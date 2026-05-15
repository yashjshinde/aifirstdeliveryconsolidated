---
feature: {feature-name}
date: {YYYY-MM-DD}
status: DRAFT
spec-ref: specs/{feature-name}/spec.md
author: Claude Code (/plan)
---

# Technical Plan — {Feature Display Name}

**Goal:** {One sentence technical goal — what the plan delivers end-to-end.}
**Spec Ref:** [spec.md](../specs/{feature-name}/spec.md)
**Overall Complexity:** S | M | L | XL
**ALM Tool:** {alm-tool from 10-alm-configuration.md}

<!-- GENERATOR: Work item type names in this plan are read from `constitution/10-alm-configuration.md`.
     {L1-Type} = Level 1 | {L2-Type} = Level 2 | {L3-Type} = Level 3 | {L4-Type} = Level 4 -->

---

## Table of Contents

1. [Work Breakdown](#1-work-breakdown)
2. [Task Inventory](#2-task-inventory)
3. [Implementation Sequence](#3-implementation-sequence)
4a. [Cross-Feature Dependencies](#4a-cross-feature-dependencies)
4. [Dependency Mapping](#4-dependency-mapping)
5. [FR → Story → Task Traceability](#5-fr--story--task-traceability)
6. [Constitution Exception Requests](#6-constitution-exception-requests)
7. [Document Control](#7-document-control)

---

# 1. Work Breakdown

---

## {L1-Type} {L1-Prefix}-001 — {Reporting Capability Title}

**ALM ID:** *(pending)*
**Description:** {What reporting capability this {L1-Type} delivers — one paragraph.}
**FR Coverage:** FR-001, FR-002, …
**Success Criteria:**
- {Measurable outcome — e.g., "Report loads in < 3 seconds for 95% of users"}
- {Measurable outcome — e.g., "RLS correctly restricts data for all security roles"}

### Architecture Summary

{2–3 sentences on data flow and stack used for this reporting capability.}

**Data Flow:**
```
{Source} → {Dataset / Dataflow} → {Report} → {Consumer}
```

> **AI Notes** — {1–2 sentences: decomposition rationale or architectural decision.}

---

### {L2-Type} {L2-Prefix}-001 — {Functional Grouping — e.g., Dataset, Report Build, RLS, Deployment}

**ALM ID:** *(pending)*
**Description:** {What functional area this {L2-Type} covers — e.g., "All dataset tables and relationships for the Sales pipeline report."}
**FR Coverage:** FR-001, FR-002

> **AI Notes** — {1–2 sentences: grouping rationale or cross-feature consideration.}

#### {L3-Type} {L3-Prefix}-001 — {Story Title}

**ALM ID:** *(pending)*

**As a** {persona}
**I want to** {reporting capability or insight}
**So that** {business value — decision enabled}

**Mapped FR:** FR-001

**Acceptance Criteria:**
- Given {precondition}, When {report accessed or filter applied}, Then {expected output}.
- Given {RLS or error condition}, When {action}, Then {restriction or error handling}.

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-001 | *(pending)* | {Task title} | DataModel | `{DatasetName}` — fact table | None | M | Data Engineer | DataModel |
| {L4-Prefix}-002 | *(pending)* | {Task title} | Measure | `{MeasureName}` DAX measure | {L4-Prefix}-001 | S | BI Developer | MeasureDev |
| {L4-Prefix}-003 | *(pending)* | {Task title} | Report-Interactive | `{ReportName}` page `{PageName}` | {L4-Prefix}-002 | M | BI Developer | ReportBuild |

---

#### {L3-Type} {L3-Prefix}-002 — {Story Title}

**ALM ID:** *(pending)*

**As a** {persona}
**I want to** {capability}
**So that** {business value}

**Mapped FR:** FR-002

**Acceptance Criteria:**
- Given {precondition}, When {action}, Then {outcome}.
- Given {edge case}, When {action}, Then {expected result}.

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-004 | *(pending)* | {Task title} | RLS | `{RoleName}` RLS role | {L4-Prefix}-001 | S | BI Developer | RLSConfig |
| {L4-Prefix}-005 | *(pending)* | {Task title} | Testing | TEST-{L4-Prefix}-004-rls-validation | {L4-Prefix}-004 | S | QA | Testing |

---

### {L2-Type} {L2-Prefix}-002 — {Functional Grouping}

**ALM ID:** *(pending)*
**Description:** {What functional area this covers.}
**FR Coverage:** FR-003

> **AI Notes** — {1–2 sentences.}

#### {L3-Type} {L3-Prefix}-003 — {Story Title}

**ALM ID:** *(pending)*

**As a** {persona}
**I want to** {capability}
**So that** {value}

**Mapped FR:** FR-003

**Acceptance Criteria:**
- Given {precondition}, When {action}, Then {outcome}.

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-006 | *(pending)* | {Task title} | Report-Paginated | `{RDLName}` paginated report | {L4-Prefix}-001 | L | BI Developer | ReportBuild |
| {L4-Prefix}-007 | *(pending)* | {Task title} | Testing | TEST-{L4-Prefix}-006-visual-render | {L4-Prefix}-006 | S | QA | Testing |
| {L4-Prefix}-008 | *(pending)* | {Task title} | Deployment | Workspace `{WorkspaceName}` publish | {L4-Prefix}-006 | S | BI Developer | Deployment |

---

*(repeat ## / ### / #### / ##### pattern for each {L1-Type} > {L2-Type} > {L3-Type} > Tasks)*

---

# 2. Task Inventory

| Task ID | ALM ID | {L1-Type} | {L2-Type} | {L3-Type} | Title | Component Type | Complexity | Role | Type | FR Ref |
|---|---|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-001 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | DataModel | M | Data Engineer | DataModel | FR-001 |
| {L4-Prefix}-002 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | Measure | S | BI Developer | MeasureDev | FR-001 |
| {L4-Prefix}-003 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | Report-Interactive | M | BI Developer | ReportBuild | FR-001 |
| {L4-Prefix}-004 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-002 | {Title} | RLS | S | BI Developer | RLSConfig | FR-002 |
| {L4-Prefix}-005 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-002 | {Title} | Testing | S | QA | Testing | FR-002 |
| {L4-Prefix}-006 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | Report-Paginated | L | BI Developer | ReportBuild | FR-003 |
| {L4-Prefix}-007 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | Testing | S | QA | Testing | FR-003 |
| {L4-Prefix}-008 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | Deployment | S | BI Developer | Deployment | FR-003 |

**Total Tasks:** {n} | S: {n} | M: {n} | L: {n} | XL: {n}
**By Role:** BI Developer: {n} | Data Engineer: {n} | QA: {n} | Functional: {n}

---

# 3. Implementation Sequence

<!-- GENERATOR: Data foundation tasks must precede semantic layer; semantic layer must precede report build. -->

## Phase 1 — Data Foundation

1. **DataModel + Dataflow tasks** — fact tables, dimension tables, dataflows, storage mode configuration
   - {L4-Prefix}-001: `{DatasetName}` — fact table
   - {e.g. dataflow or staging tasks}
2. **Configuration tasks** — workspace setup, sensitivity label assignment, gateway configuration
   - {e.g. workspace creation tasks}

## Phase 2 — Semantic Layer

3. **Measure tasks** — DAX measures after data model is stable
   - {L4-Prefix}-002: `{MeasureName}` measure
4. **RLS tasks** — row-level security roles before UAT on any report with RLS
   - {L4-Prefix}-004: `{RoleName}` RLS role

## Phase 3 — Report Build

5. **Report-Interactive tasks** — Power BI interactive reports
   - {L4-Prefix}-003: `{ReportName}` — `{PageName}` page
6. **Report-Paginated / Report-SSRS tasks** — paginated and SSRS reports
   - {L4-Prefix}-006: `{RDLName}` paginated report

## Phase 4 — Testing and Deployment

7. **Testing tasks** — data accuracy, RLS validation, visual render
   - {L4-Prefix}-005: TEST-{L4-Prefix}-004-rls-validation
   - {L4-Prefix}-007: TEST-{L4-Prefix}-006-visual-render
8. **Deployment tasks** — publish to workspace, refresh schedule, deployment pipeline
   - {L4-Prefix}-008: workspace publish

---

# 4a. Cross-Feature Dependencies

<!-- GENERATOR: Findings from the cross-feature dependency scan (step 3b). -->

| Feature | Component | Overlap Type | Recommended Action |
|---|---|---|---|
| {other-feature} | {dataset or report name} | CONFLICT / SEQUENTIAL / SHARED | {action — e.g., coordinate schema change; ensure other feature deploys first} |

*(Write "No cross-feature overlaps found." if scan found none.)*

---

# 4. Dependency Mapping

## Dataset-to-Report Dependencies

| Dataset | Report(s) | Notes |
|---|---|---|
| `{DatasetName}` | `{ReportName}` | {brief note} |

## Measure-to-Report Dependencies

| Measure | Report(s) | Notes |
|---|---|---|
| `{MeasureName}` | `{ReportName}` | {brief note} |

## RLS-to-Report Dependencies

| RLS Role | Report(s) | Notes |
|---|---|---|
| `{RoleName}` | `{ReportName}` | {brief note} |

## Dataflow-to-Dataset Dependencies

| Dataflow | Dataset(s) | Notes |
|---|---|---|
| `{DataflowName}` | `{DatasetName}` | {brief note} |

---

# 5. FR → Story → Task Traceability

| FR | {L1-Type} | {L3-Type}s | Key Tasks |
|---|---|---|---|
| FR-001 | {L1-Prefix}-001 | {L3-Prefix}-001 | {L4-Prefix}-001, {L4-Prefix}-002, {L4-Prefix}-003 |
| FR-002 | {L1-Prefix}-001 | {L3-Prefix}-002 | {L4-Prefix}-004, {L4-Prefix}-005 |
| FR-003 | {L1-Prefix}-001 | {L3-Prefix}-003 | {L4-Prefix}-006, {L4-Prefix}-007, {L4-Prefix}-008 |
| *(one row per FR in spec — every FR must appear)* | | | |

---

# 6. Constitution Exception Requests

| ID | Task | Exception Needed | Justification |
|---|---|---|---|
| CE-001 | {L4-Prefix}-XXX | {Which constitution rule needs an exception} | {Business or technical reason} |

*(Write "None identified." if no exceptions needed.)*

---

# 7. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/plan) | Initial plan generated from spec v{n} |
