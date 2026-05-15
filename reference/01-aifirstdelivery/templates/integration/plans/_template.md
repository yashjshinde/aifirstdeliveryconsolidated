---
feature: {feature-name}
date: {YYYY-MM-DD}
status: DRAFT
spec-ref: specs/{feature-name}/spec.md
author: Claude Code (/plan)
---

# Technical Plan — {Feature Display Name}

**Goal:** {One sentence technical goal.}
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
4. [Dependency Mapping](#4-dependency-mapping)
5. [FR → {L3-Type} → Task Traceability](#5-fr--l3-type--task-traceability)
6. [Constitution Exception Requests](#6-constitution-exception-requests)
7. [Document Control](#7-document-control)

---

# 1. Work Breakdown

---

## {L1-Type} {L1-Prefix}-001 — {Title}

**ALM ID:** *(pending)*
**Description:** {What integration capability this {L1-Type} delivers — one paragraph.}
**FR Coverage:** FR-001, FR-002, …
**Success Criteria:**
- {Measurable outcome 1 — what does "done" look like for this {L1-Type}?}
- {Measurable outcome 2}
- {Measurable outcome 3}

### Integration Architecture Summary

{2–3 sentences: which Azure components are used (Function / Logic App / Service Bus / APIM / Bicep), why, and the high-level event/data flow.}

**Data Flow:**
```
{Source} → {Component} → {Target}
```

---

### {L2-Type} {L2-Prefix}-001 — {Functional Grouping Title}

**ALM ID:** *(pending)*
**Description:** {What functional area this {L2-Type} covers — e.g., "All Azure infrastructure provisioned via Bicep including Service Bus, Function App, and APIM."}
**FR Coverage:** FR-001, FR-002

#### {L3-Type} {L3-Prefix}-001 — {Story Title}

**ALM ID:** *(pending)*

**As a** {persona}
**I want to** {action}
**So that** {business value}

**Mapped FR:** FR-001

**Acceptance Criteria:**
- Given {context}, When {action}, Then {outcome}.
- Given {edge case}, When {action}, Then {error or alternative outcome}.

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-001 | *(pending)* | {Task title} | Bicep | `{resource-name}` resource | None | S | Developer | DevOps |
| {L4-Prefix}-002 | *(pending)* | {Task title} | Bicep | `{resource-name}` resource | {L4-Prefix}-001 | S | Developer | DevOps |
| {L4-Prefix}-003 | *(pending)* | {Task title} | Configuration | Managed Identity RBAC assignment | {L4-Prefix}-001 | S | Developer | Security |

---

#### {L3-Type} {L3-Prefix}-002 — {Story Title}

**ALM ID:** *(pending)*

**As a** {persona}
**I want to** {action}
**So that** {business value}

**Mapped FR:** FR-002

**Acceptance Criteria:**
- Given {context}, When {action}, Then {outcome}.
- Given {edge case}, When {action}, Then {error or alternative outcome}.

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-004 | *(pending)* | {Task title} | Function | `{FunctionName}` | {L4-Prefix}-001 | M | Developer | Dev |
| {L4-Prefix}-005 | *(pending)* | {Task title} | ServiceBus | Topic: `{topic-name}` | {L4-Prefix}-001 | S | Developer | Integration |

---

### {L2-Type} {L2-Prefix}-002 — {Functional Grouping Title}

**ALM ID:** *(pending)*
**Description:** {What functional area this {L2-Type} covers.}
**FR Coverage:** FR-003

#### {L3-Type} {L3-Prefix}-003 — {Story Title}

**ALM ID:** *(pending)*

**As a** {persona}
**I want to** {action}
**So that** {business value}

**Mapped FR:** FR-003

**Acceptance Criteria:**
- Given {context}, When {action}, Then {outcome}.

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-006 | *(pending)* | {Task title} | APIM | `{api-name}` policy | None | M | Developer | Dev |
| {L4-Prefix}-007 | *(pending)* | {Task title} | LogicApp | `{LogicAppName}` | {L4-Prefix}-001 | M | Developer | Integration |
| {L4-Prefix}-008 | *(pending)* | {Task title} | Configuration | Unit tests for {L4-Prefix}-004 | {L4-Prefix}-004 | S | QA | Testing |

---

## {L1-Type} {L1-Prefix}-002 — {Title}

**ALM ID:** *(pending)*
**Description:** {What integration capability this {L1-Type} delivers.}
**FR Coverage:** FR-004, FR-005
**Success Criteria:**
- {Measurable outcome 1}
- {Measurable outcome 2}

### Integration Architecture Summary

{2–3 sentences on architecture approach for this integration module.}

**Data Flow:**
```
{Source} → {Component} → {Target}
```

---

### {L2-Type} {L2-Prefix}-003 — {Functional Grouping Title}

**ALM ID:** *(pending)*
**Description:** {What functional area this {L2-Type} covers.}
**FR Coverage:** FR-004, FR-005

#### {L3-Type} {L3-Prefix}-004 — {Story Title}

**ALM ID:** *(pending)*

**As a** {persona}
**I want to** {action}
**So that** {business value}

**Mapped FR:** FR-004, FR-005

**Acceptance Criteria:**
- Given {context}, When {action}, Then {outcome}.

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-009 | *(pending)* | {Task title} | {ComponentType} | {artefact} | None | M | Developer | Dev |

---

*(repeat ## / ### / #### / ##### pattern for each {L1-Type} > {L2-Type} > {L3-Type} > Tasks)*

---

# 2. Task Inventory

| Task ID | ALM ID | {L1-Type} | {L2-Type} | {L3-Type} | Title | Component Type | Complexity | Role | Type | FR Ref |
|---|---|---|---|---|---|---|---|---|---|---|
| {L4-Prefix}-001 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | Bicep | S | Developer | DevOps | FR-001 |
| {L4-Prefix}-002 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | Bicep | S | Developer | DevOps | FR-001 |
| {L4-Prefix}-003 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | Configuration | S | Developer | Security | FR-001 |
| {L4-Prefix}-004 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-002 | {Title} | Function | M | Developer | Dev | FR-002 |
| {L4-Prefix}-005 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-002 | {Title} | ServiceBus | S | Developer | Integration | FR-002 |
| {L4-Prefix}-006 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | APIM | M | Developer | Dev | FR-003 |
| {L4-Prefix}-007 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | LogicApp | M | Developer | Integration | FR-003 |
| {L4-Prefix}-008 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | Configuration | S | QA | Testing | FR-003 |

**Total Tasks:** {n} | S: {n} | M: {n} | L: {n} | XL: {n}
**By Role:** Developer: {n} | Functional: {n} | QA: {n}

---

# 3. Implementation Sequence

<!-- GENERATOR: Infrastructure tasks always precede application code that depends on them. -->

## Phase 1 — Infrastructure (Sprint {n})

1. **Bicep / IaC** — all Azure resources before any application code
   - {L4-Prefix}-001: `{resource-name}` resource
   - {L4-Prefix}-002: `{resource-name}` resource
2. **Managed Identity and RBAC** — before any service-to-service calls
   - {L4-Prefix}-003: Managed Identity RBAC assignment

## Phase 2 — Core Integration (Sprint {n}–{n})

3. **Azure Functions** — stateless processing after infrastructure is stable
   - {L4-Prefix}-004: `{FunctionName}` function
4. **Service Bus and Logic Apps** — messaging and orchestration
   - {L4-Prefix}-005: Topic `{topic-name}`
   - {L4-Prefix}-007: `{LogicAppName}` workflow

## Phase 3 — API Layer and Configuration (Sprint {n})

5. **APIM policies and products** — after backend functions are stable
   - {L4-Prefix}-006: `{api-name}` APIM policy
6. **Environment variables, connection strings, and Key Vault secrets**

## Phase 4 — Testing and Hardening (Sprint {n})

7. **Unit and integration tests** for functions and flows
   - {L4-Prefix}-008: Unit tests for `{FunctionName}`
8. **End-to-end scenario tests** with real messages
9. **Solution Checker pass; peer review; UAT sign-off**

---

# 4. Dependency Mapping

## {L3-Type}-to-{L3-Type} Dependencies

| {L3-Type} | Depends On | Reason |
|---|---|---|
| {L3-Prefix}-002 | {L3-Prefix}-001 | Function trigger depends on Service Bus topic created in {L3-Prefix}-001 |
| *(none — write "None" if no story-level dependencies)* | | |

## Task-to-Task Dependencies

| Task | Depends On | Reason |
|---|---|---|
| {L4-Prefix}-002 | {L4-Prefix}-001 | Second resource depends on first resource existing |
| {L4-Prefix}-003 | {L4-Prefix}-001 | RBAC assignment requires the identity resource to exist |
| {L4-Prefix}-004 | {L4-Prefix}-001 | Function App host must exist before function code is deployed |
| {L4-Prefix}-007 | {L4-Prefix}-001 | Logic App requires Service Bus namespace to exist |
| {L4-Prefix}-008 | {L4-Prefix}-004 | Cannot test a function before it is implemented |

## Integration Dependencies

| Dependency | Blocking {L3-Type}s | Action Required |
|---|---|---|
| {External system endpoint / credentials provisioned} | {L3-Prefix}-XXX | {Who provisions it and when} |
| *(none — write "None" if no external dependencies)* | | |

## Environment Dependencies

| Requirement | Needed By Phase | Owner |
|---|---|---|
| Azure subscription with correct resource group | Phase 1 | {Owner} |
| CI/CD pipeline with Azure DevOps / GitHub Actions configured | Phase 1 | {Owner} |
| Key Vault provisioned with required secrets | Phase 1 | {Owner} |
| *(add rows)* | | |

---

# 5. FR → {L3-Type} → Task Traceability

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

*(none — write "None identified." if no exceptions needed)*

---

# 7. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/plan) | Initial plan generated from spec v{n} |
