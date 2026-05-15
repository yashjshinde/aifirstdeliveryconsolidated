# Constitution — Non-Functional Requirements Targets

These targets are the minimum acceptable thresholds for every D365 CE solution. The `/spec` command must capture NFRs per FR against these baselines. The `/testplan` command must include test cases that verify each target. The `/tdd` command must document how the design meets each target.

If a feature cannot meet a target, flag it as a Constitution Risk with a justified exception in the relevant document.

## Platform Response Time

| Operation | Target | Notes |
|---|---|---|
| Form load (main form, no plugins) | ≤ 2 seconds | Measured from navigation to form fully interactive |
| Form save (synchronous plugin chain) | ≤ 3 seconds | UI must not appear frozen; use async where possible |
| View/grid load (≤ 5,000 rows) | ≤ 3 seconds | Applies with standard Dataverse query — no FetchXML aggregation on load |
| Canvas App screen load | ≤ 2 seconds | Delegation-safe queries only on screen load |
| Power Automate flow (real-time / sync) | ≤ 5 seconds end-to-end | Sync flows called from plugins must stay within plugin timeout |
| Plugin execution (synchronous) | ≤ 2 seconds | Exceeding this risks transaction timeout under load |
| API response (Dataverse Web API) | ≤ 1 second | For single-record read/write operations |

## Availability

| Target | Scope |
|---|---|
| 99.9% monthly uptime | All production CE customisations |
| Zero unplanned outages caused by custom code | Plugins and flows must not take down the platform |
| Graceful degradation on external dependency failure | Integration failures must not block core CE operations |

## Throughput and Concurrency

| Scenario | Target |
|---|---|
| Concurrent users (standard operation) | Support 100 concurrent users without degradation |
| Batch plugin execution | ≤ 500ms per record at sustained batch of 1,000 records/minute |
| Flow trigger throughput | ≤ 100 simultaneous flow executions without throttling |

## Data Volume and Retention

| Dimension | Target |
|---|---|
| Table row counts (before archiving) | Design must specify expected volume; flag if > 1 million rows |
| Audit log retention | 7 years for PII/financial tables; 1 year for operational tables |
| Attachment/file storage | File-type columns must have size limits set; large files use Azure Blob via note attachment or custom storage |
| Data export retention | Reporting extracts retained per organisational data classification policy |

## Error and Reliability

| Metric | Target |
|---|---|
| Unhandled plugin exception rate | < 0.1% of executions in production |
| Flow failure rate (unrecoverable) | < 0.5% of executions |
| Integration message loss | Zero — DLQ handling required for all async flows |
| System-generated error surfaced to user | Must include a user-friendly message; raw stack traces must never appear in UI |

## Security NFRs

| Requirement | Target |
|---|---|
| Authentication | Azure AD / Entra ID for all app access — no username/password basic auth |
| Authorisation | Least-privilege — roles grant minimum required access; reviewed per release |
| PII data at rest | Encrypted by Dataverse platform; field-level security applied to sensitive columns |
| Secret management | No secrets in solution, environment variables, or code — Azure Key Vault only |
| Audit coverage | All PII and financial tables have audit enabled; audit reviewed quarterly |
