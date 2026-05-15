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
6. [Power Platform Impact Summary](#6-power-platform-impact-summary)
7. [Business Rules](#7-business-rules)
8. [Data Considerations](#8-data-considerations)
9. [Assumptions and Constraints](#9-assumptions-and-constraints)
10. [Open Questions](#10-open-questions)
11. [Constitution Risks](#11-constitution-risks)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [Document Control](#13-document-control)
14. [Traceability Matrix](#14-traceability-matrix)

---

## 1. Overview

**Business Objective:** {What this feature achieves and why.}

**Power Platform Components:** Canvas App | Model-Driven App | Power Automate | Copilot Studio | Dataverse

**Success Criteria:**
- {Measurable outcome 1}
- {Measurable outcome 2}

---

## 2. Scope

### In Scope
- {Item}

### Out of Scope
- {Item}

---

## 3. Actors and Personas

| Persona | Role in Feature | Security Role | App Access |
|---|---|---|---|
| {Persona 1} | {What they do} | {D365 Security Role} | Canvas / MDA / Copilot / Portal |
| {Persona 2} | {What they do} | {D365 Security Role} | {App type} |

---

## 4. Business Process Overview

<!-- GENERATOR: Describe the end-to-end workflow in numbered steps, including app interactions, flow triggers, and decision points. -->

1. {Step 1 — persona opens app / submits form / triggers flow}
2. {Step 2 — system validates / creates / notifies}
3. {Step 3 — outcome for the user or downstream system}

---

## 5. Functional Requirements

<!-- GENERATOR: Requirements are grouped by module. Each FR is numbered sequentially (FR-001, FR-002, …) across all modules for ALM traceability. -->

---

### Module: {Module Name — e.g., Request Submission / Approval Flow / Admin Portal}

**Module scope:** {One sentence describing what this module covers.}

---

#### FR-001 — {Requirement Title}

**Description:** {What the system must do — clear, implementation-ready language.}

**Trigger:** {User action (button, form submit) or system event (record created, scheduled).}

**Inputs:**
- {Data entered by user, record fields read, or trigger payload}

**Outputs:**
- {Records created/updated, notifications sent, screens navigated to}

**Business Rules:**
- BR-001: {Rule — e.g., approval required if amount > £10,000}
- BR-002: {Rule — e.g., delegation-safe filter must use indexed column}

**Component:** Canvas App | Model-Driven App | Power Automate | Copilot Studio | Dataverse Schema

**Story Decomposition Guidance:**
- **Suggested Actors:** {Who performs or triggers this}
- **Suggested User Intent:** {What the persona is trying to achieve}
- **Suggested System Actions:** {Sequence: trigger → validate → action → outcome}
- **Possible Story Splits:**
  - {By screen / by flow step / by persona / by data entity / by channel}

**Dependencies:**
- **Upstream:** {FR-NNN or external data source this depends on}
- **Downstream:** {FR-NNN or process that depends on this}

**Non-Functional Considerations:**
- **Performance:** {e.g., screen load < 3 seconds; delegation-safe for 100k+ records}
- **Security:** {e.g., Azure AD auth; row-level security via security role; no anonymous access}
- **Scalability:** {e.g., Power Pages scales per environment SLA; connection reference named}
- **Reliability:** {e.g., flow has error-handling scope; failed runs trigger alert}

**Traceability:** {Source reference — BR #, input document section, or original requirement row}

---

#### FR-002 — {Requirement Title}

*(repeat structure)*

---

### Module: {Second Module Name}

*(repeat module structure)*

---

## 6. Power Platform Impact Summary

| Component | Name / Purpose | Change Type | Notes |
|---|---|---|---|
| Canvas App | `{AppName}` | New / Modified | {note} |
| Model-Driven App | `{AppName}` | New / Modified | {note} |
| Power Automate Flow | `{FlowName}` | New / Modified | {note} |
| Dataverse Table | `{prefix}_{table}` | New / Modified | {note} |
| Copilot Studio Topic | `{TopicName}` | New / Modified | {note} |
| Security Role | `{RoleName}` | New / Modified | {note} |

---

## 7. Business Rules

| Rule ID | Description | Enforcement Point |
|---|---|---|
| BR-001 | {Rule} | Business Rule / Power Automate / Canvas Formula / Plugin |
| BR-002 | {Rule} | {Enforcement Point} |

---

## 8. Data Considerations

**Delegation Risk:** {Any large-dataset filters that may not delegate — identify the column and table.}

**Data Volume:** {Estimated record counts for key tables — drives delegation and performance decisions.}

**Sensitive Data:** {Any PII, financial, or restricted data — drives security role and column-level security decisions.}

---

## 9. Assumptions and Constraints

**Assumptions:**
- {Assumption 1 — e.g., users will authenticate via Azure AD; no anonymous access required}

**Constraints:**
- {Constraint 1 — e.g., must work on mobile; offline capability needed; DLP policy restricts connector X}

---

## 10. Open Questions

| Q# | Question | Raised By | Status |
|---|---|---|---|
| Q-001 | {Question} | Spec Agent | Open |

---

## 11. Constitution Risks

| Risk ID | Description | Proposed Alternative |
|---|---|---|
| CR-001 | {Potential constitution conflict — e.g., delegation-unsafe filter on large table} | {Compliant approach — e.g., use indexed column or virtual table} |

---

## 12. Acceptance Criteria

Write testable scenarios using Given / When / Then. Include positive and negative paths.

- **Given** {precondition}, **When** {user action or event}, **Then** {expected outcome}.
- **Given** {precondition}, **When** {error condition}, **Then** {error handling — message, block, redirect}.

---

## 13. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/spec) | Initial draft |

---

## 14. Traceability Matrix

| Source Ref | Title | Module | FR Reference |
|---|---|---|---|
| BR #1 | {Rule/Requirement title} | {Module Name} | FR-001, FR-002 |
| BR #2 | {Rule/Requirement title} | {Module Name} | FR-003 |
