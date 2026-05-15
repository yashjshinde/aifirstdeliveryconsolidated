Generate a Functional Design Document (FDD) for an Azure Integration feature from an approved functional specification.

## Pre-condition Check

1. Read `specs/{feature-name}/review.md`. If status is not `APPROVED`, stop: "Run /review first and resolve all BLOCKERs before generating the FDD."

## Steps

2. Read all files in `constitution/`.
3. Read `specs/{feature-name}/spec.md` in full.
4. Generate the FDD using the template at `doc-templates/fdd-template.md`. Every section in the template is mandatory — populate all of them. Do not remove or skip any section.
5. Write to `docs-generated/{feature-name}/functional-design-document.md`.
6. Print the completion report:

```
FDD COMPLETE
════════════
Feature      : {feature-name}
Flows        : {N} integration flows documented (§6)
Artefacts    : {N} artefacts in Inventory (§5)
FRs          : {N} functional requirements across all flows
Interfaces   : {N} interfaces in catalogue (§7)
Schemas      : {N} message schemas specified (§6.X.4)
VAL Rules    : {N} validation rules (§6.X.3)
Error Scen.  : {N} error scenarios in Appendix A.2
Gaps         : {N} FDD Gaps logged in §15.1
Open Items   : {N} open items in §15.2
Output       : docs-generated/{feature-name}/functional-design-document.md

Next step: /fdd-review {feature-name}
```

## Operating Principles

- Do NOT invent requirements or modify scope — only transform the spec into structured FDD format.
- Maintain strict traceability: Integration Flow → FR → Design Section → Acceptance Criteria.
- Use business language throughout — no Azure resource names, no code, no infrastructure detail.
- Every section must reference back to FR-NNN where applicable.
- Flag any functional gap discovered during elaboration as an **FDD Gap** in §15.1.
- Ensure clarity for developers, testers, integration owners, and business stakeholders.

## Content Guidance per Section

**§1 Document Control:** Version 1.0, Initial Draft. Approvals table: Business Owner, IT Lead, Solution Architect, Project Manager — all Pending. §1.3 Distribution List: populate from spec stakeholders. §1.4 Related Documents: link the spec, constitution, any dependent FDDs or architecture decisions.

**§2 Introduction:** Purpose covers which integration flows are in scope. §2.2 Scope must include a Requirement Coverage table (`Work Stream | ADO ID/URS ID | Flow Name | Requirement Title | Description`) plus a "Flows in Scope" bullet list. Definitions table includes integration-specific terms (DLQ, idempotency, correlation ID, etc.).

**§3 System Overview:** §3.1 High-Level Overview describes which systems are connected and the data direction — no Azure resource names. §3.2 Personas table includes system actors and human operators; add System Classification column (Internal ERP / External SaaS / Azure PaaS / Human). §3.3 Key Design Decisions — document every significant integration design choice using the `Decision | Option A | Option B | Selected | Rationale` table; cover messaging pattern (async vs sync), error handling strategy, idempotency approach, and any other architecture decisions. §3.4 Pre-requisitions — list source system readiness, target system readiness, infrastructure, data, and FDD dependencies.

**§4 Business Process:** §4.2 Process Flow must use the structured step table (`Step | Description | Actor | Integration Stage | Happy Path Outcome | Exception/Error Path`) with minimum 5 steps covering ingestion, validation, transformation, target processing, and acknowledgement. Include a Decision Points table for any conditional routing or deduplication logic.

**★ §5 Integration Artefact Inventory:** List every artefact this FDD delivers — Integration Flows, Interfaces/API Contracts, Message Schemas, Data Mappings, Business Rules, Configuration Items. Use `Artefact-ID | Artefact Name | Category | Artefact Type | Scope/Flow | Complexity | FR Reference | Notes`. This section is mandatory — do not leave it empty or with placeholder-only rows.

**§6 Functional Design:** One 6.X block per integration flow. Mandatory 9-subsection structure:
- 6.X.1 Flow Overview — trigger, systems involved, integration pattern (async/sync/batch/file), business outcome
- 6.X.2 FRs — every FR with Integration Pattern field, Inputs / Outputs / Business Rules (validation, transformation, routing) / Dependencies
- 6.X.3 Validation Rules — table: `VAL ID | Trigger | Condition Checked | Action on Failure | Error Message (exact text) | Interface`
- 6.X.4 Message Schema / Payload Contract — inbound field table `Field Name | Data Type | Mandatory | Format/Allowed Values | Description` + example payload skeleton + outbound table (if schema differs) + schema version label
- 6.X.5 Data Flow Description — field-level mapping table in business terms
- 6.X.6 Error Handling (Business View) — failure scenarios table: `Scenario | Retry Count | What Happens After Retries | DLQ | Who Is Notified | Replay Process | Resolution SLA`
- 6.X.7 Idempotency and Message Ordering — idempotency key field(s), deduplication approach, ordering requirement (strict / best-effort / none), out-of-order handling
- 6.X.8 Acceptance Criteria — minimum one per FR, at least one error/DLQ scenario AC, and one idempotency/duplicate AC per flow
- 6.X.9 Traceability — FR Reference → Requirement Title → BR# → AC Ref

**§7 Interface Catalogue:** One row per interface. Columns: `Interface ID | Name | Source System | Target System | Direction | Integration Pattern | Trigger | Frequency | Authentication | Schema Ref | FR Reference | Error Handling Ref`. Use business names for systems. Cross-reference Schema Ref to §6.X.4 and Error Handling Ref to §6.X.6.

**§8 Business Rules for Integration:** Three structured rule tables — Validation Rules `Rule ID | Applies To | Interface | Condition | Action on Failure | VAL Reference`, Transformation Rules `Rule ID | Applies To | Source Field | Target Field | Transformation Logic`, Routing Rules `Rule ID | Applies To | Condition | Route To`. Plus Schema Versioning Strategy covering versioning approach, backward compatibility, change communication, and version field in payload.

**§9 Security Considerations:**
- §9.1 RBAC table — integration service accounts and human operator roles
- §9.2 Authentication Method per Interface — `Interface ID | Interface Name | Source→Integration Auth | Integration→Target Auth | Secret Location | Rotation Frequency`
- §9.3 Data Visibility Constraints — data that must never flow in a given direction; masking/redaction rules
- §9.4 Audit Logging Requirements — `Event | What Is Logged | Log Destination | Retention Period` — cover message received, processed, dead-lettered, and authentication failure
- §9.5 Credential and Certificate Rotation — rotation process, responsibility, frequency, zero-downtime approach

**§10 Non-Functional Requirements:**
- §10.1 Performance, Reliability and Scalability — specific numeric targets for latency, throughput, retry count, volume, availability. Use "TBC in refinement" where not yet defined.
- §10.2 Monitoring and Alerting — DLQ alert condition, latency breach alert, pipeline failure alert, throughput drop alert, schema failure rate. Include operational dashboard requirements. Cross-reference SLA targets to §10.1.

**§11 Assumptions & Constraints:** §11.1 Assumptions include source system schema stability and external ID uniqueness. §11.2 Constraints include no-write-back rules and sync latency boundaries. §11.3 Environment Strategy — per-environment table (DEV / TEST / UAT / PROD): source/target real vs stubbed, integration state, stubs/mocks used, config differences (namespaces, URLs, thresholds), and cutover/go-live steps.

**§12 Out of Scope:** Table format with Integration Flow column. Draw from spec; flag new items as FDD Gaps in §15.1.

**§13 Risks & Dependencies:** §13.1 Key Risks covers source system readiness and test environment availability. §13.2 External Dependencies table includes Owner and Required By FR-NNN.

**§14 Functional Testing:** §14.1 Test Scope table covering Contract Testing, End-to-End Flow Testing, Error & DLQ Testing, Replay Testing, Idempotency Testing, Performance Testing. §14.2 Key Test Scenarios per Flow — `Flow | Scenario | Expected Outcome | VAL/FR Reference` — minimum 4 rows per flow: happy path, schema failure, target unavailable, duplicate message.

**§15 Functional Gap Log and Open Items:** §15.1 Functional Gaps — every requirement ambiguity or gap discovered during elaboration; must be resolved before TDD. §15.2 Open Items — questions requiring stakeholder clarification before or during build.

**Appendix A:** A.1 Functional Requirements — every FR-NNN from the spec with AC Refs. A.2 Error Scenarios — one row per error scenario across all flows. A.3 NFR Summary — latency, throughput, idempotency targets with acceptance criteria and test plan reference.

## Rules

- FDD uses business language — no Azure resource names, no code, no infrastructure detail.
- Every FR from the spec must appear in §6.
- Every business requirement must appear in Appendix A.
- §5 Artefact Inventory must be populated before §6 — it drives the scope of what is designed.
- Flag any functional gap as an FDD Gap in §15.1 — do not silently omit ambiguous requirements.
