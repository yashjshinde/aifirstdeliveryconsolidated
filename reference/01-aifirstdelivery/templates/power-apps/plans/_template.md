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
7. [Delegation Risk Summary](#7-delegation-risk-summary)
8. [Document Control](#8-document-control)

---

# 1. Work Breakdown

---

## {L1-Type} {L1-Prefix}-001 — {Title}

**ALM ID:** *(pending)*
**Description:** {What Power Platform capability this {L1-Type} delivers — one paragraph.}
**FR Coverage:** FR-001, FR-002, …
**Success Criteria:**
- {Measurable outcome 1 — what does "done" look like for this {L1-Type}?}
- {Measurable outcome 2}
- {Measurable outcome 3}

### Architecture Summary

{2–3 sentences: which Power Platform components are used (Canvas App / MDA / Flow / Copilot / DataverseSchema / SecurityRole), why, and the high-level data/event flow.}

**Data Flow:**
```
{Source} → {Component} → {Target}
```

---

### {L2-Type} {L2-Prefix}-001 — {Functional Grouping Title}

**ALM ID:** *(pending)*
**Description:** {What functional area this {L2-Type} covers — e.g., "All Dataverse schema changes including custom tables, columns, and relationships."}
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
| {L4-Prefix}-001 | *(pending)* | {Task title} | DataverseSchema | `{prefix}_{table}` custom table | None | S | Functional | Config |
| {L4-Prefix}-002 | *(pending)* | {Task title} | DataverseSchema | `{prefix}_{column}` column on `{table}` | {L4-Prefix}-001 | S | Functional | Config |
| {L4-Prefix}-003 | *(pending)* | {Task title} | SecurityRole | Security role `{RoleName}` | None | S | Functional | Security |

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
| {L4-Prefix}-004 | *(pending)* | {Task title} | Flow | `{FlowName}` cloud flow | {L4-Prefix}-001 | M | Developer | Flow |
| {L4-Prefix}-005 | *(pending)* | {Task title} | CopilotTopic | `{TopicName}` topic | {L4-Prefix}-004 | M | Developer | Dev |

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
| {L4-Prefix}-006 | *(pending)* | {Task title} | CanvasApp | `scr{Screen}` in `{AppName}` | {L4-Prefix}-001 | M | Developer | UX |
| {L4-Prefix}-007 | *(pending)* | {Task title} | ModelDrivenApp | `{entity}` main form — `{section}` tab | {L4-Prefix}-002 | S | Functional | Config |
| {L4-Prefix}-008 | *(pending)* | {Task title} | Configuration | Test cases for {L4-Prefix}-006 | {L4-Prefix}-006 | S | QA | Testing |

---

## {L1-Type} {L1-Prefix}-002 — {Title}

**ALM ID:** *(pending)*
**Description:** {What Power Platform capability this {L1-Type} delivers.}
**FR Coverage:** FR-004, FR-005
**Success Criteria:**
- {Measurable outcome 1}
- {Measurable outcome 2}

### Architecture Summary

{2–3 sentences on architecture approach for this module.}

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
| {L4-Prefix}-001 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | DataverseSchema | S | Functional | Config | FR-001 |
| {L4-Prefix}-002 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | DataverseSchema | S | Functional | Config | FR-001 |
| {L4-Prefix}-003 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-001 | {Title} | SecurityRole | S | Functional | Security | FR-001 |
| {L4-Prefix}-004 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-002 | {Title} | Flow | M | Developer | Flow | FR-002 |
| {L4-Prefix}-005 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-001 | {L3-Prefix}-002 | {Title} | CopilotTopic | M | Developer | Dev | FR-002 |
| {L4-Prefix}-006 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | CanvasApp | M | Developer | UX | FR-003 |
| {L4-Prefix}-007 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | ModelDrivenApp | S | Functional | Config | FR-003 |
| {L4-Prefix}-008 | *(pending)* | {L1-Prefix}-001 | {L2-Prefix}-002 | {L3-Prefix}-003 | {Title} | Configuration | S | QA | Testing | FR-003 |

**Total Tasks:** {n} | S: {n} | M: {n} | L: {n} | XL: {n}
**By Role:** Developer: {n} | Functional: {n} | QA: {n}

---

# 3. Implementation Sequence

<!-- GENERATOR: Schema and security tasks always precede apps, flows, and Copilot topics that depend on them. -->

## Phase 1 — Foundation (Sprint {n})

1. **Dataverse schema** — all new tables and columns before any app or flow work
   - {L4-Prefix}-001: `{prefix}_{table}` custom table
   - {L4-Prefix}-002: `{prefix}_{column}` column
2. **Security roles and sharing** — before any form or app configuration
   - {L4-Prefix}-003: Security role `{RoleName}`

## Phase 2 — Automation and Copilot (Sprint {n}–{n})

3. **Power Automate flows** — automation on top of stable schema
   - {L4-Prefix}-004: `{FlowName}` cloud flow
4. **Copilot Studio topics** — after flows are available as actions
   - {L4-Prefix}-005: `{TopicName}` topic

## Phase 3 — App UI and Configuration (Sprint {n})

5. **Canvas App screens** — after schema and flows are stable
   - {L4-Prefix}-006: `scr{Screen}` in `{AppName}`
6. **Model-Driven App forms, views, and dashboards** — configuration
   - {L4-Prefix}-007: `{entity}` main form

## Phase 4 — Testing and Hardening (Sprint {n})

7. **Test cases** for screens, flows, and Copilot topics
   - {L4-Prefix}-008: Test cases for `scr{Screen}`
8. **Delegation boundary tests** with > 500 records
9. **Solution Checker pass; peer review; UAT sign-off**

---

# 4. Dependency Mapping

## {L3-Type}-to-{L3-Type} Dependencies

| {L3-Type} | Depends On | Reason |
|---|---|---|
| {L3-Prefix}-002 | {L3-Prefix}-001 | Flow trigger operates on schema created in {L3-Prefix}-001 |
| *(none — write "None" if no story-level dependencies)* | | |

## Task-to-Task Dependencies

| Task | Depends On | Reason |
|---|---|---|
| {L4-Prefix}-002 | {L4-Prefix}-001 | Column depends on custom table existing first |
| {L4-Prefix}-004 | {L4-Prefix}-001 | Flow reads from custom table — table must exist first |
| {L4-Prefix}-005 | {L4-Prefix}-004 | Copilot topic invokes flow — flow must exist first |
| {L4-Prefix}-006 | {L4-Prefix}-001 | Canvas App binds to custom table — table must exist first |
| {L4-Prefix}-008 | {L4-Prefix}-006 | Cannot test a screen before it is implemented |

## Integration Dependencies

| Dependency | Blocking {L3-Type}s | Action Required |
|---|---|---|
| {External system / connection reference provisioned} | {L3-Prefix}-XXX | {Who provisions it and when} |
| *(none — write "None" if no external dependencies)* | | |

## Environment Dependencies

| Requirement | Needed By Phase | Owner |
|---|---|---|
| Power Platform environment with correct publisher prefix | Phase 1 | {Owner} |
| CI/CD pipeline with Power Platform Build Tools configured | Phase 1 | {Owner} |
| Connection references provisioned for all connectors | Phase 2 | {Owner} |
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

# 7. Delegation Risk Summary

| Task | Table | Operation | Delegable? | Mitigation |
|---|---|---|---|---|
| {L4-Prefix}-006 | `{prefix}_{table}` | Filter by `{column}` | No | Limit top 500; add server-side view |
| *(one row per non-delegable operation — write "None identified." if all operations are delegable)* | | | | |

---

# 8. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/plan) | Initial plan generated from spec v{n} |
