---
feature: {feature-name}
date: {YYYY-MM-DD}
status: DRAFT
intake: structured
l3-intake: required         # required (default) | optional — see constitution/10-alm-configuration.md
author: Claude Code (/spec-alm)
alm-ids:
  L1:
    - id: "{L1-ALM-ID}"
      title: "{L1 Title}"
  L2:
    - id: "{L2-ALM-ID}"
      title: "{L2 Title}"
  L3:
    - id: "{L3-ALM-ID}"
      title: "{L3 Title}"
      source: alm            # alm = provided by ALM tool | pending = no L3 given; /plan will generate
    # Example pending entry (l3-intake: optional only):
    # - id: "(pending)"
    #   title: "(to be defined during planning)"
    #   source: pending
    #   parent-l2: "{L2-ALM-ID}"
---

# Integration Specification — {Feature Display Name}

> **Project:** {Project Name}
> **Intake Mode:** Structured — enhanced from ALM work items
> **Version:** 1.0
> **Status:** Draft for Review

---

## Table of Contents

1. [Overview](#1-overview)
2. [Systems Involved](#2-systems-involved)
3. [Scope](#3-scope)
4. [Business Process Overview](#4-business-process-overview)
5. [Functional Requirements by ALM Hierarchy](#5-functional-requirements-by-alm-hierarchy)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Error and Exception Handling](#7-error-and-exception-handling)
8. [Assumptions and Constraints](#8-assumptions-and-constraints)
9. [Open Questions](#9-open-questions)
10. [Constitution Risks](#10-constitution-risks)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Document Control](#12-document-control)
13. [ALM Traceability Matrix](#13-alm-traceability-matrix)

---

## 1. Overview

**Business Objective:**
{Derived from the L1 work item title and description — one paragraph on what the integration achieves and why.}

**Integration Type:** {Event-driven / Request-Response / Scheduled Batch / Hybrid}

**Success Criteria:**
- {Measurable outcome derived from L1/L2 descriptions}
- {Measurable outcome}

---

## 2. Systems Involved

| System | Role | Direction | Protocol |
|---|---|---|---|
| {System A} | Source | Outbound | {REST / Service Bus / Event Grid} |
| {System B} | Target | Inbound | {REST / SOAP / SFTP} |

---

## 3. Scope

### In Scope
- {Each L2 item represents a scope boundary — list them here with the data flow they cover}

### Out of Scope
- {Explicitly excluded — never leave blank}

---

## 4. Business Process Overview

<!-- GENERATOR: Describe the end-to-end integration flow in numbered steps, referencing L2 functional areas. -->

1. {Step — trigger event or schedule}
2. {Step — transformation or routing}
3. {Step — target system write or confirmation}
4. {Step — error path or DLQ handling}

---

## 5. Functional Requirements by ALM Hierarchy

<!-- GENERATOR: Requirements are grouped by the imported L1/L2/L3 ALM hierarchy. Each L3 work item is
     enhanced with FR-NNN requirements, acceptance criteria, and Azure Integration impact. FR numbers are
     sequential across the entire spec — they do not reset per L2 or L3. Every L3 ALM ID maps to at least one FR-NNN. -->

---

### {L1-Type}: {L1-ALM-ID} — {L1 Title}

**ALM ID:** {L1-ALM-ID}
**Original Description:** {verbatim text as imported from ALM}

---

#### {L2-Type}: {L2-ALM-ID} — {L2 Title}

**ALM ID:** {L2-ALM-ID}
**Original Description:** {verbatim text as imported from ALM}

---

##### {L3-Type}: {L3-ALM-ID} — {L3 Title}

**ALM ID:** {L3-ALM-ID}
**Original Story / Description:** {verbatim text as imported from ALM}

---

###### FR-001 — {Enhanced Requirement Title}

**Description:** {What the integration must do — clear, implementation-ready language.}

**Trigger:** {Event, schedule, or API call that initiates this flow.}

**Inputs:**
- {Source payload field or event data}

**Outputs:**
- {Target record, message published, confirmation returned}

**Business Rules:**
- BR-001: {Idempotency rule, validation, routing condition, or retry behaviour}

**Error Handling:**
- {Retry policy, DLQ behaviour, alert trigger on failure}

**Azure Integration Impact:** {Azure Function, Logic App, Service Bus topic/subscription, APIM policy, Bicep resource affected.}

**Story Decomposition Guidance:**
- **Suggested Actors:** {Who triggers or monitors this flow}
- **Suggested User Intent:** {What the business outcome is}
- **Suggested System Actions:** {Trigger → Transform → Route → Confirm}
- **Possible Story Splits:** {by interface / by direction / by error path / by schedule}

**Dependencies:**
- **Upstream:** {FR-NNN or external system this depends on}
- **Downstream:** {FR-NNN or process that depends on this}

**Non-Functional Considerations:**
- **Performance:** {e.g., end-to-end latency < 5s, throughput > 1000 msg/min}
- **Security:** {e.g., Managed Identity, no connection strings in code, private endpoint}
- **Scalability:** {e.g., must handle 10× peak load without throttling}
- **Reliability:** {e.g., idempotent, retry 3× with exponential backoff, DLQ alert}

**Traceability:** {L3-ALM-ID} — {L3 Title}

---

###### FR-002 — {Next Requirement Title}

*(repeat FR block structure)*

---

*(Repeat L3 block for each imported User Story / L3 work item)*

*(If `l3-intake: optional` and this L2 has no L3 items — use this pending placeholder instead of a L3 block):*

---

##### *(Pending) {L3-Type}: to be defined during planning*

**ALM ID:** *(pending)*
**Parent L2:** {L2-ALM-ID} — {L2 Title}
**Status:** No L3 work items were provided for this L2 branch.
`/plan` will decompose this L2 into {L3-Type} stories and generate Tasks under them.

---

*(Repeat L2 block for each imported Epic / L2 work item)*

*(Repeat L1 block for each imported Feature / L1 work item)*

---

## 6. Non-Functional Requirements

| Category | Target | Source |
|---|---|---|
| Latency | {e.g., < 5s end-to-end for synchronous flows} | {L3-ALM-ID or constitution/11-nfr-targets.md} |
| Throughput | {e.g., > 1000 messages/minute sustained} | {L3-ALM-ID} |
| Availability | {e.g., 99.9% SLA} | {L3-ALM-ID} |
| Data Retention | {e.g., messages retained 7 days in Service Bus} | {L3-ALM-ID} |

---

## 7. Error and Exception Handling

| Error Scenario | Source | Behaviour | Alert |
|---|---|---|---|
| Source unavailable | {System A} | Retry 3× then DLQ | Yes — ops team |
| Target unavailable | {System B} | Retry with backoff then DLQ | Yes |
| Invalid payload | Any | DLQ immediately, no retry | Yes |
| Duplicate message | Any | Idempotency check — skip | No |

---

## 8. Assumptions and Constraints

**Assumptions:**
- {Assumption derived from ALM item context}

**Constraints:**
- {Constraint derived from ALM item scope or Azure environment}

---

## 9. Open Questions

| Q# | Question | ALM ID Ref | Raised By | Status |
|---|---|---|---|---|
| Q-001 | {Ambiguity from ALM item that could not be resolved by inference} | {L3-ALM-ID} | Spec Agent | Open |

---

## 10. Constitution Risks

| Risk ID | Description | Proposed Alternative |
|---|---|---|
| CR-001 | {Potential constitution conflict inferred from ALM item} | {Compliant approach} |

---

## 11. Acceptance Criteria

Write testable scenarios using Given / When / Then, linked to their originating L3 ALM ID.

**{L3-ALM-ID} — {L3 Title}**
- **Given** {precondition}, **When** {trigger fires}, **Then** {integration outcome}.
- **Given** {precondition}, **When** {error condition}, **Then** {DLQ populated, alert sent}.

*(Add one or more scenarios per L3 work item)*

---

## 12. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/spec-alm) | Enhanced from ALM structured intake |

---

## 13. ALM Traceability Matrix

<!-- GENERATOR: Maps each imported ALM ID to the FR-NNN requirements generated from it.
     Used by /plan (structured mode) to map Tasks back to their parent L3 ALM IDs.
     The Source column indicates whether the L3 came from the ALM tool (alm) or is pending generation by /plan (pending). -->

| L1 ALM ID | L2 ALM ID | L3 ALM ID | L3 Title | Source | FR References | BR References |
|---|---|---|---|---|---|---|
| {L1-ALM-ID} | {L2-ALM-ID} | {L3-ALM-ID} | {L3 Title} | alm | FR-001, FR-002 | BR-001 |
| {L1-ALM-ID} | {L2-ALM-ID} | *(pending)* | *(to be defined in /plan)* | pending | — | — |
