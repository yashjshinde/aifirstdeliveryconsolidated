# Constitution — Non-Functional Requirements Targets

These targets are the minimum acceptable thresholds for every D365 F&O deliverable. The FDD must capture NFR expectations per business process. The TDD must document how the design meets each target. The test plan must include performance test cases that verify each target before UAT.

Flag any design that cannot meet a target as a Constitution Risk in the TDD with a justified exception.

## AOS Response Time

| Operation | Target | Notes |
|---|---|---|
| Standard form load | ≤ 3 seconds | Form interactive with no custom queries on load |
| Form save (no batch, no complex validation) | ≤ 2 seconds | Synchronous validation only |
| Custom form with plugin/extension logic | ≤ 5 seconds | State in TDD if heavier; justify and get TL approval |
| Menu item / workspace load | ≤ 3 seconds | Including tile counts and KPIs |
| SSRS report (standard, ≤ 1,000 rows) | ≤ 10 seconds | Report with parameters; flag if data volume may exceed |
| GER report (standard, ≤ 1,000 rows) | ≤ 15 seconds | |

## Batch Job Throughput

Every batch object (BDC, WFL, EXT categorised as batch) must state throughput targets in the TDD.

| Complexity | Minimum Throughput Target | Notes |
|---|---|---|
| Simple batch | ≥ 50,000 records/hour | Single-threaded; set-based X++ |
| Medium batch | ≥ 20,000 records/hour | With moderate business logic per record |
| Complex batch | ≥ 5,000 records/hour | With joins, lookups, and external calls |

- Throughput must be verified against a **production-representative dataset** before UAT deployment
- Batch jobs that miss their target must be redesigned before UAT sign-off — parallelisation required

## Data Entity Performance (DEN Objects)

| Scenario | Target | Notes |
|---|---|---|
| Simple data entity import | ≥ 10,000 records/minute | No complex validation, single table |
| Complex data entity import | ≥ 2,000 records/minute | With cross-table validation and mapping |
| OData API read (single entity, ≤ 100 rows) | ≤ 1 second | Per page |
| Data Management export (≤ 100,000 rows) | ≤ 30 minutes | Scheduled batch export |

## Concurrency

| Scenario | Target |
|---|---|
| Concurrent AOS users (production) | State design-time concurrent user count in FDD; TDD must confirm AOS tier sizing |
| Batch server slot capacity | Batch job must not monopolise > 50% of available batch slots in a single run |
| Integration message throughput (INT objects) | State msgs/min target in TDD; verified in performance test |

## Availability

| Target | Scope |
|---|---|
| 99.9% monthly uptime | D365 F&O SaaS SLA — custom code must not degrade this |
| Zero unplanned outages from custom code | X++ exceptions must be caught and handled; never crash AOS |
| Integration resilience | INT objects must handle target system unavailability without data loss |

## Error and Reliability

| Metric | Target |
|---|---|
| Unhandled X++ exception rate | < 0.1% of executions in production per month |
| Batch job failure rate | < 1% of scheduled runs — recurring failures are a Sev 2 defect |
| Integration message loss | Zero — staging table + retry + alerting required for all INT objects |
| Data corruption incidents | Zero tolerance — validated by SIT before UAT promotion |

## Security NFRs (Integration Objects)

For INT-category objects that call external Azure services:

| Requirement | Target |
|---|---|
| Authentication to Azure services | Managed Identity or Azure AD service principal — no hardcoded credentials |
| Secrets | Azure Key Vault — referenced via Azure App Configuration or Key Vault direct integration; never stored in D365 parameters |
| TLS | TLS 1.2 minimum for all outbound calls |
| PII in logs | Masked before logging — never log passwords, tokens, or financial identifiers |
