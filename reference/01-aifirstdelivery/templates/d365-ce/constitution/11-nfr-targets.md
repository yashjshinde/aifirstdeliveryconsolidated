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

## Field Service Mobile — Offline Limits (Microsoft-published; hard ceilings)

When the project includes Field Service Mobile, these are non-negotiable platform ceilings.

| Limit | Target | Source |
|---|---|---|
| Linked tables in offline profile (incl. downstream relationships) | **≤ 15** | [FS offline best practices](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/best-practices-limitations-offline-profile) |
| Total tables in offline profile | < 100 | [Power Apps offline limitations](https://learn.microsoft.com/en-us/power-apps/mobile/offline-limitations) |
| Records per profile (target) | < 200,000 | same |
| Records per profile (hard ceiling, unsupported beyond) | **3,000,000** | same |
| Total offline DB size | **< 1 GB** | same |
| Total offline images / files | < 4 GB | same |
| Image columns across the profile | ≤ 14 | same |
| Offline search scope | Single table only | same |

**Tables not supported offline** (do not place in offline profile): `msdyn_purchaseorder`, `msdyn_agreement`, `msdyn_rtv`, `msdyn_rma`.

**Rules:**
- Treat the numeric thresholds as design ceilings; performance review is **mandatory** before any technician profile exceeds them.
- "All records" filter is forbidden — always scope by date range or relationship.
- Multilingual offline DB grows ~**10% per additional language pack** enabled. Verify against the 1 GB ceiling with all `supported-languages` (from `10-alm-configuration.md`) loaded.

## Field Service — Performance Targets

| Scenario | Target | Notes |
|---|---|---|
| Schedule Board initial load (default tab, ≤ 50 resources, 7-day view) | ≤ 3 s | Dispatcher productivity threshold |
| Schedule Assistant search response (typical scope) | ≤ 5 s | User waits for matches |
| Mobile sync (full sync, < 200K records) | ≤ 5 minutes | Field-day start tolerance |
| Mobile incremental sync | ≤ 30 s | Foreground refresh tolerance |
| RSO single-pass optimisation (≤ 500 requirements) | ≤ 15 minutes | Operations-team SLA expectation |
| IoT alert → Work Order creation | ≤ 60 s end-to-end | Operational responsiveness |

Full rules: see `13-field-service-scheduling-and-mobile.md` §7 and `08-testing-standards.md`.

## Multilingual NFRs

| Requirement | Target |
|---|---|
| Form load time per language | Unchanged regardless of `supported-languages` count — platform caches metadata per locale |
| Translation coverage at UAT promotion | 100% — every new component translated to every `supported-languages` entry; missing translations block release |
| Pseudo-localization smoke pass | Required before any translator engagement |
| Mobile offline DB growth per language pack | ~10% — count against the 1 GB ceiling above |
