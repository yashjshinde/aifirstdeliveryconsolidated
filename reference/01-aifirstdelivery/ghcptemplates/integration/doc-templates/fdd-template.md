---
feature: {feature-name}
document-type: Functional Design Document
date: {YYYY-MM-DD}
status: DRAFT | UNDER REVIEW | APPROVED
version: 1.0
spec-ref: specs/{feature-name}/spec.md
author: Claude Code (/fdd)
---

# Functional Design Document — {Feature Display Name}

**Project:** {Project Name}
**Based On:** Functional Specification v1.0
**Governed By:** Solution Constitution – Azure Integration
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
- [3. System Overview](#3-system-overview)
  - [3.1 High-Level Overview](#31-high-level-overview)
  - [3.2 Personas](#32-personas)
  - [3.3 Key Design Decisions](#33-key-design-decisions)
  - [3.4 Pre-requisitions](#34-pre-requisitions)
- [4. Business Process](#4-business-process)
  - [4.1 Process Overview](#41-process-overview)
  - [4.2 Process Flow](#42-process-flow)
- [★ 5. Integration Artefact Inventory](#-5-integration-artefact-inventory)
- [6. Functional Design](#6-functional-design)
  - [6.1 Integration Flow: {Flow Name}](#61-integration-flow-flow-name)
    - [6.1.1 Flow Overview](#611-flow-overview)
    - [6.1.2 Functional Requirements](#612-functional-requirements)
    - [6.1.3 Validation Rules](#613-validation-rules)
    - [6.1.4 Message Schema / Payload Contract](#614-message-schema--payload-contract)
    - [6.1.5 Data Flow Description](#615-data-flow-description)
    - [6.1.6 Error Handling (Business View)](#616-error-handling-business-view)
    - [6.1.7 Idempotency and Message Ordering](#617-idempotency-and-message-ordering)
    - [6.1.8 Acceptance Criteria](#618-acceptance-criteria)
    - [6.1.9 Traceability](#619-traceability)
- [7. Interface Catalogue](#7-interface-catalogue)
- [8. Business Rules for Integration](#8-business-rules-for-integration)
- [9. Security Considerations](#9-security-considerations)
  - [9.1 Role-Based Access](#91-role-based-access)
  - [9.2 Authentication Method per Interface](#92-authentication-method-per-interface)
  - [9.3 Data Visibility Constraints](#93-data-visibility-constraints)
  - [9.4 Audit Logging Requirements](#94-audit-logging-requirements)
  - [9.5 Credential and Certificate Rotation](#95-credential-and-certificate-rotation)
- [10. Non-Functional Requirements](#10-non-functional-requirements)
  - [10.1 Performance, Reliability and Scalability](#101-performance-reliability-and-scalability)
  - [10.2 Monitoring and Alerting Requirements](#102-monitoring-and-alerting-requirements)
- [11. Assumptions & Constraints](#11-assumptions--constraints)
  - [11.1 Assumptions](#111-assumptions)
  - [11.2 Constraints](#112-constraints)
  - [11.3 Environment Strategy](#113-environment-strategy)
- [12. Out of Scope](#12-out-of-scope)
- [13. Risks & Dependencies](#13-risks--dependencies)
  - [13.1 Key Risks](#131-key-risks)
  - [13.2 External Dependencies](#132-external-dependencies)
- [14. Functional Testing](#14-functional-testing)
  - [14.1 Test Scope](#141-test-scope)
  - [14.2 Key Test Scenarios per Flow](#142-key-test-scenarios-per-flow)
- [15. Functional Gap Log and Open Items](#15-functional-gap-log-and-open-items)
  - [15.1 Functional Gaps](#151-functional-gaps)
  - [15.2 Open Items / Clarification Required](#152-open-items--clarification-required)
- [Appendix A — Full Traceability Matrix](#appendix-a--full-traceability-matrix)

---

## 1. Document Control

### 1.1 Version History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/fdd) | Initial Draft – converted from Functional Specification v1.0 |

### 1.2 Approvals

| Role | Name | Signature | Date | Status |
|---|---|---|---|---|
| Business Owner | | | | Pending |
| IT Lead | | | | Pending |
| Solution Architect | | | | Pending |
| Project Manager | | | | Pending |

### 1.3 Distribution List

| Name | Role | Organisation | Copy Type |
|---|---|---|---|
| {Name} | {Role} | {Org} | Author / Reviewer / Approver / Informed |

### 1.4 Related Documents

| Document | Version | Location |
|---|---|---|
| Functional Specification | 1.0 | [spec.md](../../specs/{feature-name}/spec.md) |
| Solution Constitution – Azure Integration | Current | `constitution/` |
| {Architecture Decision Record} | {Version} | {Path} |
| {Dependent FDD} | {Version} | {Path} |

---

## 2. Introduction

### 2.1 Purpose

{One paragraph: which integration flows are covered, who this document is for (developers, testers, integration owners, business stakeholders), and that it is the authoritative reference for integration build and UAT.}

### 2.2 Scope

#### Requirement Coverage

| Work Stream | ADO ID / URS ID | Flow Name | Requirement Title | Description |
|---|---|---|---|---|
| `{WorkStream}` | `{ADO-ID / URS-ID}` | `{Flow Name}` | `{Requirement Title}` | `{Brief description}` |

#### Flows in Scope

- **Flow 1:** {Flow Name} — {one-line description}
- **Flow 2:** {Flow Name} — {one-line description}

Reference: Functional Specification v1.0, FR-{NNN} to FR-{NNN}.

### 2.3 Definitions & Acronyms

| Term / Acronym | Definition |
|---|---|
| FR | Functional Requirement |
| FDD | Functional Design Document |
| DLQ | Dead-Letter Queue |
| SLA | Service Level Agreement |
| Idempotency | Processing the same message multiple times produces the same result |
| Correlation ID | Unique identifier that traces a message across all systems and logs |
| {Term} | {Definition} |

---

## 3. System Overview

### 3.1 High-Level Overview

{Two to three paragraphs: which systems are connected, the direction of data flow, the authoritative source(s) of data, what the integration is responsible for, and what it explicitly does not do. No Azure resource names.}

### 3.2 Personas

| Persona | Role Description | Primary Integration Flows | System Classification |
|---|---|---|---|
| {Persona} | {What this actor does} | {Flow numbers} | Internal ERP / External SaaS / Azure PaaS / Human |
| System (Source) | {Source system automated process} | {Flow numbers} | Internal ERP / External SaaS |
| Integration Service Account | {Automated pipeline actor} | All flows | Azure PaaS |

### 3.3 Key Design Decisions

Document every significant design choice. Capture options considered so future reviewers understand why alternatives were not chosen.

| Decision | Option A | Option B | Selected | Rationale |
|---|---|---|---|---|
| {e.g., Messaging pattern} | Asynchronous (message bus) | Synchronous (REST API) | Option A | Source system cannot wait for target response; decoupling required for reliability |
| {e.g., Error handling strategy} | Dead-letter queue with manual replay | Automatic retry to fallback endpoint | Option A | Target system has maintenance windows; DLQ allows controlled replay |
| {e.g., Idempotency approach} | Message store keyed on correlation ID | At-least-once with target-side dedup | Option A | Target system does not support native deduplication |
| {Decision} | {Option A} | {Option B} | {Selected} | {Rationale} |

### 3.4 Pre-requisitions

List everything that must be in place before this integration can be implemented or tested:

**Source System Readiness:**
- {Source system event publishing or API must be available in the target environment}
- {Agreed message schema / API contract signed off by source system team}
- {Source system credentials / service principal provisioned}

**Target System Readiness:**
- {Target system API / endpoint available in the target environment}
- {Target system accepts inbound connections from the integration service account}

**Infrastructure and Configuration:**
- {Message broker namespace / topics / subscriptions provisioned}
- {API gateway policy agreed for any exposed endpoints}
- {Secrets store provisioned with correct access policies}

**Data and Master Data:**
- {Mapping tables or reference data required before first message can be processed}
- {Test payloads agreed and available for each interface}

**Dependencies on Other FDDs / Integrations:**
- {FDD or integration that must be live before this one can be tested end-to-end}

---

## 4. Business Process

### 4.1 Process Overview

{One paragraph: the business event that starts the integration, and the business outcome it delivers.}

### 4.2 Process Flow

**Step Table**

| Step | Description | Actor | Integration Stage | Happy Path Outcome | Exception / Error Path |
|---|---|---|---|---|---|
| 1 | {Business event occurs} | {Source System} | Event publication | {Event published to integration layer} | {Source system retries / logs failure — FR-NNN} |
| 2 | {Message received and validated} | Integration Pipeline | Ingestion & Validation | {Valid message forwarded to Step 3} | {Invalid: dead-letter + alert — FR-NNN} |
| 3 | {Data transformed and routed} | Integration Pipeline | Transformation & Routing | {Transformed payload dispatched to target} | {Mapping failure: dead-letter + alert — FR-NNN} |
| 4 | {Target processes message} | {Target System} | Target processing | {Record created / updated in target} | {Target rejection: dead-letter + notification — FR-NNN} |
| 5 | {Outcome confirmed and logged} | Integration Pipeline | Acknowledgement | {Success acknowledgement logged} | {Timeout: retry cycle — FR-NNN} |

**Decision Points**

| Decision Point | Condition | Path A | Path B |
|---|---|---|---|
| {e.g., Duplicate detected?} | {Idempotency key already processed} | {Discard — log only} | {Process normally} |
| {e.g., Routing condition} | {Field value = X} | {Route to Target A} | {Route to Target B} |

---

## ★ 5. Integration Artefact Inventory

**This section is mandatory for technical design generation. Every integration artefact to be created or modified must be listed before build begins.**

| Artefact-ID | Artefact Name | Category | Artefact Type | Scope / Flow | Complexity | FR Reference | Notes |
|---|---|---|---|---|---|---|---|
| INT-001 | {Flow Name} | New Development | Integration Flow | {Source → Target} | Complex | FR-NNN | Async / Sync |
| INT-002 | {Interface Name} | New Development | Interface / API Contract | {Flow Name} | Medium | FR-NNN | Inbound / Outbound |
| INT-003 | {Schema Name} | New Development | Message Schema | {Flow Name} | Simple | FR-NNN | v1.0 |
| INT-004 | {Mapping Name} | New Development | Data Mapping | {Flow Name} | Medium | FR-NNN | Field-level transform |
| INT-005 | {Rule Name} | New Development | Business Rule | {Flow Name} | Simple | FR-NNN | Validation / Routing |
| INT-006 | {Config Name} | New Development | Configuration Item | All flows | Simple | FR-NNN | Endpoint / credential |

**Complexity guide:** Simple = < 1 day; Medium = 1–3 days; Complex = > 3 days.

---

## 6. Functional Design

---

## 6.1 Integration Flow: {Flow Name}

### 6.1.1 Flow Overview

{One paragraph: what business event triggers this flow, which systems are involved, the integration pattern (async event-driven / sync request-response / scheduled batch / file transfer), and what the business outcome is.}

---

### 6.1.2 Functional Requirements

#### FR-NNN: {Requirement Title}

**Description:** {From spec — do not modify}

**Integration Pattern:** Async Event-Driven / Sync Request-Response / Scheduled Batch / File Transfer

**Inputs:**
- {Source system, event type, data elements provided}

**Outputs:**
- {Target system, records created or updated, confirmations sent}

**Business Rules:**
- {Validation rule — what is checked before processing}
- {Transformation rule — how data is adapted between systems}
- {Routing rule — conditional logic in plain language}

**Dependencies:**
- Upstream: {FR or system that must exist first}
- Downstream: {FR or flow that depends on this}

---

*(Repeat FR-NNN block for each functional requirement in this flow)*

---

### 6.1.3 Validation Rules

| VAL ID | Trigger | Condition Checked | Action on Failure | Error Message | Interface |
|---|---|---|---|---|---|
| VAL-NNN | {On message receipt / On transformation / On routing} | {What is validated — field presence, format, business constraint} | {Reject to DLQ / Alert / Log and continue} | `"{Exact error message text}"` | {IF-NNN} |

---

### 6.1.4 Message Schema / Payload Contract

Define the message structure exchanged on this interface. Use business field names — no JSON property names or technical schema identifiers.

#### Inbound Message (Source → Integration)

| Field Name (Business) | Data Type | Mandatory | Format / Allowed Values | Description |
|---|---|---|---|---|
| {Field name} | String / Int / Date / Bool / Enum | Yes / No | {e.g., ISO 8601 / max 50 chars / Active\|Inactive} | {Business purpose of this field} |

**Example payload (skeleton):**
```
{
  "{field}": "{sample value}",
  "{field}": "{sample value}"
}
```

#### Outbound Message (Integration → Target) *(if transformation produces a different schema)*

| Field Name (Business) | Data Type | Mandatory | Source Field | Transformation |
|---|---|---|---|---|
| {Field name} | {Type} | Yes / No | {Source field name} | {Direct / Map / Derive / Default} |

**Schema version:** `{v1.0}` — changes to this schema must follow the schema versioning approach in §8.

---

### 6.1.5 Data Flow Description

{Business language: what data is exchanged, in which direction, at what business event.}

| Source Field (Business Name) | Source System | Target Field (Business Name) | Target System | Transformation Rule |
|---|---|---|---|---|
| {Field name} | {System} | {Field name} | {System} | {Direct copy / Map: A→X, B→Y / Concatenate / etc.} |

---

### 6.1.6 Error Handling (Business View)

| Scenario | Retry Count | What Happens After Retries | DLQ | Who Is Notified | Replay Process | Resolution SLA |
|---|---|---|---|---|---|---|
| {Source system unavailable} | {N} retries with exponential back-off | Message dead-lettered | Yes | Operations team | Manual replay via {tooling} after root cause resolved | {N hours} |
| {Invalid message — schema violation} | 0 (immediate) | Dead-lettered with validation error | Yes | Operations team | Fix source data; replay from DLQ | {N hours} |
| {Target rejects message} | {N} | Dead-lettered with rejection reason | Yes | Operations team + data owner | Investigate target rejection; fix; replay | {N hours} |
| {Duplicate message received} | N/A | Detected via idempotency key; discarded | No | None | No action required | N/A |

---

### 6.1.7 Idempotency and Message Ordering

**Idempotency key:** `{Field name(s) that uniquely identify this business event — e.g., Order ID + Event Type + Timestamp}`

**Deduplication approach:** {How duplicate messages are detected — e.g., checked against a processed-message store keyed on the idempotency key; duplicates within a {N}-hour window are discarded.}

**Message ordering requirement:** {Strict ordering required / Best-effort ordering acceptable / No ordering constraint}

**Out-of-order handling:** {What happens if a later event arrives before an earlier one — e.g., hold and reorder / process independently / flag for manual review}

---

### 6.1.8 Acceptance Criteria

- **Given** {precondition}, **When** {trigger}, **Then** {expected outcome} *(FR-NNN)*
- **Given** {failure condition}, **When** {trigger}, **Then** {error outcome — DLQ populated, alert fired} *(FR-NNN)*
- **Given** {duplicate message received}, **When** {same idempotency key processed again}, **Then** {message discarded, no duplicate record in target} *(FR-NNN)*

---

### 6.1.9 Traceability

| FR Reference | Requirement Title | BR # | Acceptance Criteria Ref |
|---|---|---|---|
| FR-NNN | {Title} | BR-# | AC-1.1, AC-1.2 |

---

*(Repeat Section 6.X block for each integration flow)*

---

## 7. Interface Catalogue

| Interface ID | Name | Source System | Target System | Direction | Integration Pattern | Trigger | Frequency | Authentication | Schema Ref | FR Reference | Error Handling Ref |
|---|---|---|---|---|---|---|---|---|---|---|---|
| IF-001 | {Interface Name} | {System A} | {System B} | A → B | Async / Sync / Batch | {Business event / Schedule} | Real-time / Near-real-time / Scheduled | {Managed Identity / API Key / OAuth} | §6.X.4 | FR-NNN | §6.X.6 |

---

## 8. Business Rules for Integration

### Validation Rules

| Rule ID | Applies To (Flow) | Interface | Condition | Action on Failure | VAL Reference |
|---|---|---|---|---|---|
| BR-VAL-001 | {Flow Name} | {IF-NNN} | {What is checked — field present, format valid, business constraint} | {Reject to DLQ / Alert / Log} | VAL-NNN |

### Transformation Rules

| Rule ID | Applies To (Flow) | Source Field | Target Field | Transformation Logic |
|---|---|---|---|---|
| BR-TRF-001 | {Flow Name} | {Source field} | {Target field} | {Direct copy / Lookup mapping / Concatenate / Derive / Default value} |

### Routing Rules

| Rule ID | Applies To (Flow) | Condition | Route To |
|---|---|---|---|
| BR-RTE-001 | {Flow Name} | {Field value or business condition} | {Target A / Target B / DLQ} |

### Schema Versioning Strategy

{How schema changes to any interface in §6.X.4 will be managed:}
- **Versioning approach:** {Semantic versioning on message schema — e.g., `v1.0`, `v2.0`. Breaking changes require a new version.}
- **Backward compatibility:** {Are older message versions still processed? For how long?}
- **Change communication:** {Who must be notified before a schema change — source system team, target system team, integration team.}
- **Version field in payload:** {Is a schema version field included in the message? e.g., `"schemaVersion": "1.0"`}

---

## 9. Security Considerations

### 9.1 Role-Based Access

| Role | Access Level | Key Restrictions |
|---|---|---|
| Integration Service Account | Create/Update target records | No UI access; programmatic only |
| Operations / Platform Admin | Read integration logs, manage queues | Cannot modify integration configuration |
| {Human Persona} | {Access} | {Restrictions} |

### 9.2 Authentication Method per Interface

| Interface ID | Interface Name | Source → Integration Auth | Integration → Target Auth | Secret Location | Rotation Frequency |
|---|---|---|---|---|---|
| IF-001 | {Interface Name} | {Managed Identity / API Key / OAuth / Mutual TLS} | {Managed Identity / API Key / OAuth / Mutual TLS} | {Key Vault secret name} | {N days / On expiry} |

### 9.3 Data Visibility Constraints

- {Data that must never flow in a particular direction}
- {Confidentiality requirements for data in transit}
- {Masking or redaction rules — e.g., PII fields masked before logging}

### 9.4 Audit Logging Requirements

| Event | What Is Logged | Log Destination | Retention Period |
|---|---|---|---|
| Message received | Correlation ID, timestamp, source system, payload size (not content) | {Log store} | {N days} |
| Message processed successfully | Correlation ID, target system, processing time | {Log store} | {N days} |
| Message dead-lettered | Correlation ID, failure reason, interface | {Log store + alert} | {N days} |
| Authentication failure | Interface ID, timestamp, source | {Log store + alert} | {N days} |

### 9.5 Credential and Certificate Rotation

- {Rotation process: who is responsible, how often, how secrets are updated without downtime}
- {Any certificate pinning requirements and renewal lead time}

---

## 10. Non-Functional Requirements

### 10.1 Performance, Reliability and Scalability

| Category | Requirement | Target / Measure |
|---|---|---|
| Performance | End-to-end latency — {flow name} | < {N} minutes from event publication |
| Performance | Throughput | {N} messages/hour peak |
| Scalability | Message volume | {N}+ messages/day |
| Reliability | Retry policy | {N} retries with exponential back-off before dead-lettering |
| Reliability | Idempotency | Re-running same message produces same result — no duplicates |
| Reliability | DLQ replay | All dead-lettered messages must be replayable without data loss |
| Security | Authentication | {Managed Identity / Service Principal — business description} |
| Availability | Integration pipeline uptime | {N}% per month |

Use "TBC in refinement" for any target not yet defined.

### 10.2 Monitoring and Alerting Requirements

| What to Monitor | Alert Condition | Alert Severity | Who Is Notified | Response SLA |
|---|---|---|---|---|
| DLQ message count — per interface | > 0 messages in DLQ | High | Operations team | {N minutes} |
| End-to-end message latency | Exceeds SLA target from §10.1 | High | Operations team | {N minutes} |
| Integration pipeline failures | Any unhandled exception | Critical | Operations team + Integration owner | {N minutes} |
| Throughput drop | < {N}% of expected volume in {N} minutes | Medium | Operations team | {N hours} |
| Schema validation failure rate | > {N}% of messages in a {N}-minute window | High | Integration owner + source system team | {N hours} |

**Operational dashboard:** {What must be visible in the operations dashboard — message counts, DLQ depth, latency percentiles, error rate per interface.}

---

## 11. Assumptions & Constraints

### 11.1 Assumptions

1. {Source system publishes events in the agreed schema}
2. {External IDs are stable, unique, and included in all payloads}
3. {Assumption 3}

### 11.2 Constraints

1. {No write-back from target to source system}
2. {Real-time sub-second sync is out of scope}
3. {Constraint 3}

### 11.3 Environment Strategy

| Environment | Source System | Target System | Integration State | Stubs / Mocks | Notes |
|---|---|---|---|---|---|
| DEV | {Real / Stub} | {Real / Stub} | {Deployed / Local only} | {List any stubbed systems} | Developer self-service |
| TEST / SIT | {Real / Stub} | {Real / Stub} | Deployed (managed) | {List any stubbed systems} | Used for integration testing |
| UAT | Real | Real | Deployed (managed) | None | Business user validation |
| PROD | Real | Real | Deployed (managed) | None | Change-controlled |

**Configuration differences across environments:** {Describe anything that changes per environment — e.g., message broker namespace, API gateway base URL, retry count, alert thresholds.}

**Cutover / go-live considerations:** {How in-flight messages are handled during deployment. What happens to messages published during the deployment window. Backward compatibility required during cutover.}

---

## 12. Out of Scope

| Integration Flow | Out of Scope Item |
|---|---|
| {Flow} | {Excluded item — drawn from spec out-of-scope section} |

---

## 13. Risks & Dependencies

### 13.1 Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| {Source system schema not finalised} | High / Medium / Low | {Mitigation action} |
| {Event publishing not available in test environment} | High / Medium / Low | {Mitigation action} |

### 13.2 External Dependencies

| Dependency | Owner | Required By (FR-NNN) | Risk Level |
|---|---|---|---|
| {Source system API contract / event schema} | {Team} | {FR-NNN} | High / Medium / Low |
| {Test environment provisioning} | {Team} | {FR-NNN} | High / Medium / Low |

---

## 14. Functional Testing

*This section describes the functional testing scope specific to this integration. Full test cases are defined in the Test Plan.*

### 14.1 Test Scope

| Test Type | Description | Scope |
|---|---|---|
| Contract Testing | Validate inbound messages conform to agreed schema before any processing | All interfaces in §7 |
| End-to-End Flow Testing | Happy-path message published by source → arrives correctly in target | All flows in §6 |
| Error & DLQ Testing | Invalid / rejected messages land in DLQ with correct error detail | All flows |
| Replay Testing | Dead-lettered message replayed successfully without duplication | All flows with DLQ |
| Idempotency Testing | Same message submitted twice → single result in target, no duplicate | All flows in §6.X.7 |
| Performance Testing | Message throughput and latency meet targets in §10.1 | Per SLA in §10.1 |

### 14.2 Key Test Scenarios per Flow

| Flow | Scenario | Expected Outcome | VAL / FR Reference |
|---|---|---|---|
| {Flow Name} | Valid message — happy path | Record created in target | FR-NNN |
| {Flow Name} | Schema validation failure | DLQ populated; operations alerted | VAL-NNN |
| {Flow Name} | Target unavailable — retries exhausted | Dead-lettered after {N} retries | FR-NNN |
| {Flow Name} | Duplicate message (same idempotency key) | Discarded; no duplicate in target | FR-NNN |

---

## 15. Functional Gap Log and Open Items

### 15.1 Functional Gaps

Gaps are requirements that are ambiguous, conflicting, or missing from the spec. Each gap must be resolved before the TDD can be generated.

| Gap ID | Description | Interface | Business Impact | Owner | Status |
|---|---|---|---|---|---|
| FG-001 | {Gap identified during FDD elaboration} | {IF-NNN} | {Business impact} | {Stakeholder} | Open |

*(none — if no gaps)*

### 15.2 Open Items / Clarification Required

Open items are questions or decisions outstanding that block completion of one or more FDD sections.

| OI ID | Question / Decision Required | Section Affected | Owner | Target Date | Status |
|---|---|---|---|---|---|
| OI-001 | {Question that must be answered before TDD can proceed} | {§N.N} | {Stakeholder} | {YYYY-MM-DD} | Open |

*(none — if no open items)*

---

## Appendix A — Full Traceability Matrix

### A.1 Functional Requirements

| BR # | Requirement Title | Integration Flow | FR Reference(s) | Acceptance Criteria Refs |
|---|---|---|---|---|
| {BR-#} | {Title} | {Flow Name} | {FR-NNN, FR-NNN} | AC-{N.N}, AC-{N.N} |

*(Every FR-NNN from the spec must appear at least once)*

### A.2 Error Scenarios

| Error Scenario | Interface | FR Reference | DLQ | Alert | Resolution Owner |
|---|---|---|---|---|---|
| {Schema validation failure} | {IF-NNN} | {FR-NNN} | Yes | Yes | Operations team |
| {Target system unavailable} | {IF-NNN} | {FR-NNN} | Yes | Yes | Operations team |

### A.3 Non-Functional Requirements

| NFR Category | Target | Acceptance Criteria | Verified By |
|---|---|---|---|
| End-to-end latency | < {N} minutes | Performance test — {N} messages processed within SLA | Test Plan §{N} |
| Throughput | {N} messages/hour | Load test results | Test Plan §{N} |
| Idempotency | No duplicates on re-delivery | Replay test — same message sent twice, one result | Test Plan §{N} |
