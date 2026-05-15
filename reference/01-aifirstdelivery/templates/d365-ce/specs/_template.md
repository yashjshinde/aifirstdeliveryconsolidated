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
3. [Actors and Personas](#3-actors-and-personas)
4. [Business Process Overview](#4-business-process-overview)
5. [Functional Requirements](#5-functional-requirements)
6. [D365 CE Impact Summary](#6-d365-ce-impact-summary)
7. [Business Rules](#7-business-rules)
8. [Assumptions and Constraints](#8-assumptions-and-constraints)
9. [Open Questions](#9-open-questions)
10. [Constitution Risks](#10-constitution-risks)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Document Control](#12-document-control)
13. [Traceability Matrix](#13-traceability-matrix)

---

## 1. Overview

**Business Objective:**
{One paragraph describing what this feature achieves and why it is needed.}

**Success Criteria:**
- {Measurable outcome 1}
- {Measurable outcome 2}

---

## 2. Scope

### In Scope
- {Item 1}

### Out of Scope
- {Item 1}

---

## 3. Actors and Personas

| Persona | Role in Feature | D365 CE Security Role |
|---|---|---|
| {Persona 1} | {What they do} | {Security Role Name} |
| {Persona 2} | {What they do} | {Security Role Name} |

---

## 4. Business Process Overview

<!-- GENERATOR: Describe the end-to-end workflow in numbered steps, including system interactions and decision points. -->

1. {Step 1 — actor does X}
2. {Step 2 — system does Y}
3. {Step 3 — outcome Z}

---

## 5. Functional Requirements

<!-- GENERATOR: Requirements are grouped by module. Each FR is numbered sequentially (FR-001, FR-002, …) for ALM
     traceability. Every requirement must be testable and traceable to a business rule or acceptance criterion. -->

---

### Module: {Module Name}

**Module scope:** {One sentence describing what this module covers.}

---

#### FR-001 — {Requirement Title}

**Description:** {What the system must do — clear, implementation-ready language.}

**Trigger:** {What initiates this behaviour — user action, system event, integration event.}

**Inputs:**
- {Input 1}

**Outputs:**
- {Output 1}

**Business Rules:**
- BR-001: {Rule description}
- BR-002: {Rule description}

**D365 CE Impact:** {Entities, forms, views, plugins, flows, PCF controls involved.}

**Story Decomposition Guidance:**
- **Suggested Actors:** {Who performs or triggers this}
- **Suggested User Intent:** {What the actor is trying to achieve}
- **Suggested System Actions:** {Sequence: trigger → action → outcome}
- **Possible Story Splits:**
  - {Split by persona / by workflow step / by data entity / by channel / by integration boundary}

**Dependencies:**
- **Upstream:** {FR-NNN or external system this depends on}
- **Downstream:** {FR-NNN or process that depends on this}

**Non-Functional Considerations:**
- **Performance:** {e.g., form load < 3 seconds, sync latency < 5 min}
- **Security:** {e.g., field-level security, role restriction, Managed Identity}
- **Scalability:** {e.g., must handle 500k+ records/year}
- **Reliability:** {e.g., idempotent, retry policy, dead-letter alerting}

**Traceability:** {Source reference — BR #, original requirement section, or input document row}

---

#### FR-002 — {Requirement Title}

*(repeat structure)*

---

### Module: {Second Module Name}

*(repeat module structure)*

---

## 6. D365 CE Impact Summary

| Component | Entity / Form / Object | Change Type | Notes |
|---|---|---|---|
| Table | `{prefix}_{tablename}` | New / Modified | {brief note} |
| Form | `{EntityName} — Main` | Modified | {brief note} |
| Plugin | `{Entity}{Operation}Plugin` | New | {brief note} |
| Flow | `{Flow Name}` | New / Modified | {brief note} |
| Security Role | `{Role Name}` | New / Modified | {brief note} |

---

## 7. Business Rules

| Rule ID | Rule Description | Enforcement Point |
|---|---|---|
| BR-001 | {Rule} | Plugin / Flow / Form Script / Business Rule |
| BR-002 | {Rule} | {Enforcement Point} |

---

## 8. Assumptions and Constraints

**Assumptions:**
- {Assumption 1 — e.g., Oracle Fusion is the system of record for customer data}

**Constraints:**
- {Constraint 1 — e.g., must work in offline mode, must support mobile, no direct table insert from external system}

---

## 9. Open Questions

| Q# | Question | Raised By | Status |
|---|---|---|---|
| Q-001 | {Question} | Spec Agent | Open |

---

## 10. Constitution Risks

| Risk ID | Description | Proposed Alternative |
|---|---|---|
| CR-001 | {Potential constitution conflict — e.g., sync pattern violates Managed Identity rule} | {Compliant approach} |

---

## 11. Acceptance Criteria

Write testable scenarios using Given / When / Then. Include positive and negative paths.

- **Given** {precondition}, **When** {action}, **Then** {expected outcome}.
- **Given** {precondition}, **When** {action}, **Then** {expected outcome — error case}.

*(Add one or more scenarios per FR or per module as appropriate)*

---

## 12. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/spec) | Initial draft |

---

## 13. Traceability Matrix

| Source Ref | Title | Module | FR Reference |
|---|---|---|---|
| BR #1 | {Rule/Requirement title} | {Module Name} | FR-001, FR-002 |
| BR #2 | {Rule/Requirement title} | {Module Name} | FR-003 |
