# Spec Review Checklist — Azure Integration

## Constitution: 00 — Architectural Principles
- [ ] Integration pattern is async/event-driven unless sync response is explicitly required (BLOCKER if sync used without justification)
- [ ] No direct service-to-service calls without a broker (Service Bus / APIM) (BLOCKER)
- [ ] Idempotency mechanism identified for every message handler or create/update operation (BLOCKER if missing)
- [ ] All Azure resources will be defined as IaC (Bicep/Terraform) — no portal-only resources (REQUIRED)
- [ ] Correlation ID strategy described — propagated through all message and API hops (REQUIRED)

## Constitution: 01 — Integration Patterns
- [ ] Integration pattern explicitly stated: async/sync, event/scheduled (REQUIRED)
- [ ] Pattern matches the use case per the selection table (BLOCKER if wrong pattern)
- [ ] No direct database cross-system connections (BLOCKER)
- [ ] All Azure resources follow naming convention (REQUIRED)
- [ ] All resources tagged with environment, project, owner, cost-centre (RECOMMENDED)

## Constitution: 02 — Service Bus (if in scope)
- [ ] Queue vs Topic justified (REQUIRED)
- [ ] Message schema includes envelope structure (REQUIRED)
- [ ] DLQ handling described (REQUIRED)
- [ ] Idempotency mechanism identified (BLOCKER if missing)
- [ ] Managed Identity auth — no connection strings (BLOCKER)

## Constitution: 03 — Azure Functions (if in scope)
- [ ] Trigger type specified (REQUIRED)
- [ ] Isolated worker model stated (REQUIRED)
- [ ] No `async void` patterns described (BLOCKER)
- [ ] Timeout values stated (REQUIRED)

## Constitution: 05 — APIM (if in scope)
- [ ] API versioning defined (REQUIRED)
- [ ] Authentication mechanism stated (BLOCKER if missing)
- [ ] Rate limiting described (REQUIRED)

## Constitution: 06 — Error Handling
- [ ] Retry policy described for each outbound call (REQUIRED)
- [ ] DLQ or fallback for all async flows (REQUIRED)
- [ ] Alerting requirements stated (REQUIRED)

## Constitution: 07 — Security
- [ ] Managed Identity used throughout — no secrets in config (BLOCKER)
- [ ] Key Vault referenced for any secrets (BLOCKER)
- [ ] PII fields identified (REQUIRED if personal data involved)

## Constitution: 11 — NFR Targets
- [ ] API/sync response time NFR stated for every synchronous FR — must be ≤ 500ms p95 or justified exception (REQUIRED)
- [ ] Async message processing latency stated per flow — must meet targets in `11-nfr-targets.md` or justified exception (REQUIRED)
- [ ] Availability target stated (99.9% or justified exception) (REQUIRED)
- [ ] DLQ review SLA and replay procedure called out for every async flow (REQUIRED)
- [ ] Throughput target stated per interface — messages/min or records/min (REQUIRED)

## Spec Completeness
- [ ] All functional requirements numbered FR-NNN sequentially across all integration areas (REQUIRED)
- [ ] All systems involved documented with direction and protocol (REQUIRED)
- [ ] Data mapping table present per data flow (REQUIRED)
- [ ] Business Process Overview (§4) populated with numbered end-to-end steps (REQUIRED)
- [ ] Every FR has Inputs and Outputs documented (REQUIRED)
- [ ] Every FR has at least one Business Rule inline, or explicitly states "No business rules" (REQUIRED)
- [ ] Every FR has Error Handling documented — retry policy, DLQ behaviour, alert trigger (REQUIRED)
- [ ] Every FR has Story Decomposition Guidance with at least one Possible Story Split (RECOMMENDED)
- [ ] Every FR has Dependencies (Upstream / Downstream) — "None" acceptable if standalone (REQUIRED)
- [ ] Every FR has Non-Functional Considerations — at least Performance, Security, Reliability (REQUIRED)
- [ ] Every FR has Traceability reference if source document was provided (RECOMMENDED)
- [ ] Non-Functional Requirements table (§7) populated with latency, throughput, availability targets (REQUIRED)
- [ ] Error and Exception Handling table (§8) covers all failure scenarios (REQUIRED)
- [ ] Open Questions (§10) completed — "None identified." is acceptable (REQUIRED)
- [ ] Constitution Risks (§11) completed — "None identified." is acceptable (REQUIRED)
- [ ] Acceptance Criteria (§12) has at least one happy path and one failure path per integration area (REQUIRED)
- [ ] Traceability Matrix (§14) populated if source references were provided (RECOMMENDED)
