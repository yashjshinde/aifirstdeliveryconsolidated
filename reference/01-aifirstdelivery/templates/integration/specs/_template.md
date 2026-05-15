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
2. [Systems Involved](#2-systems-involved)
3. [Scope](#3-scope)
4. [Business Process Overview](#4-business-process-overview)
5. [Data Flows](#5-data-flows)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Error and Exception Handling](#8-error-and-exception-handling)
9. [Assumptions and Constraints](#9-assumptions-and-constraints)
10. [Open Questions](#10-open-questions)
11. [Constitution Risks](#11-constitution-risks)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [Document Control](#13-document-control)
14. [Traceability Matrix](#14-traceability-matrix)

---

## 1. Overview

**Business Objective:** {What this integration achieves and why.}

**Integration Type:** Event-driven | Request/Response | Scheduled Batch | Hybrid

**Success Criteria:**
- {Measurable outcome 1}
- {Measurable outcome 2}

---

## 2. Systems Involved

| System | Role | Direction | Protocol |
|---|---|---|---|
| {System A} | Source | Outbound | {REST / Service Bus / DMF} |
| {System B} | Target | Inbound | {REST / OData / Service Bus} |
| {Azure Service} | Intermediary | — | — |

---

## 3. Scope

### In Scope
- {Data flow 1}

### Out of Scope
- {Item}

---

## 4. Business Process Overview

<!-- GENERATOR: Describe the end-to-end integration workflow in numbered steps, including triggers, transformations, and system handoffs. -->

1. {Step 1 — source system event triggers the flow}
2. {Step 2 — intermediary receives and transforms payload}
3. {Step 3 — target system receives and applies the data}
4. {Step 4 — confirmation or error path}

---

## 5. Data Flows

### Flow 1 — {Flow Name}

**Trigger:** {What initiates this flow — event, schedule, API call}
**Source:** {System name + data entity}
**Target:** {System name + data entity}
**Frequency:** Real-time | Near real-time ({n} min SLA) | Scheduled ({cron})
**Data Volume:** {estimated msgs/day or records/batch}

#### Data Mapping

| Source Field | Source Type | Target Field | Target Type | Transformation |
|---|---|---|---|---|
| {field} | {type} | {field} | {type} | {rule or Direct} |

---

## 6. Functional Requirements

<!-- GENERATOR: Requirements are grouped by integration area. Each FR is numbered sequentially (FR-001, FR-002, …) across all groups for ALM traceability. -->

---

### {Integration Area: e.g., Account Sync / Order Events / Error Handling}

---

#### FR-001 — {Requirement Title}

**Description:** {What the integration must do — clear, implementation-ready language.}

**Trigger:** {Event, schedule, or API call that initiates this requirement.}

**Inputs:**
- {Source system, payload fields, or event data}

**Outputs:**
- {Target records created/updated, messages published, confirmations}

**Business Rules:**
- BR-001: {Rule — e.g., idempotent upsert on external ID}
- BR-002: {Rule — e.g., inactivation event must not delete target record}

**Error Handling:** {What happens on failure — retry policy, DLQ, alert, fallback.}

**Story Decomposition Guidance:**
- **Suggested Actors:** {System, Integration Developer, or business persona}
- **Suggested User Intent:** {What outcome the integration must reliably deliver}
- **Suggested System Actions:** {Sequence: receive → validate → transform → publish/upsert → log}
- **Possible Story Splits:**
  - {By event type / by system / by error path / by data entity}

**Dependencies:**
- **Upstream:** {FR-NNN or external system / event this depends on}
- **Downstream:** {FR-NNN or process that depends on this being completed}

**Non-Functional Considerations:**
- **Performance:** {e.g., end-to-end latency < 5 min; throughput 1000 msgs/hour}
- **Security:** {e.g., Managed Identity auth, Key Vault secret, no hardcoded credentials}
- **Scalability:** {e.g., Azure Function scales horizontally; Service Bus scales natively}
- **Reliability:** {e.g., idempotent upsert; DLQ on 3 retries; Application Insights alerting}

**Traceability:** {Source reference — BR #, input document section, original requirement row}

---

#### FR-002 — {Requirement Title}

*(repeat structure)*

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Latency (end-to-end) | {e.g., < 30 seconds} |
| Throughput | {e.g., 1000 msgs/hour} |
| Availability | {e.g., 99.9%} |
| Data retention | {e.g., 7 days in DLQ} |
| Security | {e.g., Managed Identity, Key Vault, no connection strings} |

---

## 8. Error and Exception Handling

| Scenario | Behaviour | Retry Policy | Alert Required |
|---|---|---|---|
| Source unavailable | Retry then DLQ | 3× exponential back-off | Yes |
| Target unavailable | {behaviour} | {policy} | {Y/N} |
| Invalid message payload | DLQ with reason code | None | Yes |
| Duplicate message | Idempotent skip — no error | None | No |
| Auth failure | Dead-letter + alert | None | Yes |

---

## 9. Assumptions and Constraints

**Assumptions:**
- {Assumption 1 — e.g., source system publishes events to Service Bus within 2 minutes}

**Constraints:**
- {Constraint 1 — e.g., source system only supports polling every 5 minutes; no push available}

---

## 10. Open Questions

| Q# | Question | Raised By | Status |
|---|---|---|---|
| Q-001 | {Question} | Spec Agent | Open |

---

## 11. Constitution Risks

| Risk ID | Description | Proposed Alternative |
|---|---|---|
| CR-001 | {Potential constitution conflict — e.g., direct DB cross-system connection} | {Compliant approach — e.g., use Service Bus instead} |

---

## 12. Acceptance Criteria

Write testable scenarios using Given / When / Then. Include happy path and failure paths.

- **Given** {precondition}, **When** {trigger}, **Then** {expected outcome}.
- **Given** {precondition}, **When** {failure condition}, **Then** {error handling outcome — DLQ, alert, retry}.

---

## 13. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/spec) | Initial draft |

---

## 14. Traceability Matrix

| Source Ref | Title | Integration Area | FR Reference |
|---|---|---|---|
| BR #1 | {Rule/Requirement title} | {Area} | FR-001, FR-002 |
| BR #2 | {Rule/Requirement title} | {Area} | FR-003 |
