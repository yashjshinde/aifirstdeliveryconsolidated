# Constitution — Non-Functional Requirements Targets

These targets are the minimum acceptable thresholds for every Power Platform solution. The `/spec` command must capture NFRs per FR against these baselines. The `/testplan` command must include performance test cases that verify each target. The `/tdd` command must document how the design meets each target.

Flag any feature that cannot meet a target as a Constitution Risk with a justified exception.

## Canvas App Performance

| Operation | Target | Notes |
|---|---|---|
| Screen load (warm, non-cold-start) | ≤ 3 seconds | From navigation trigger to screen fully interactive |
| App first load (cold start) | ≤ 5 seconds | Acceptable for first load; warm loads must be ≤ 3s |
| Data query on screen load | ≤ 2 seconds | All OnStart / OnVisible data loads |
| Form save (with flow trigger) | ≤ 5 seconds | UI must show a loading indicator; never appear frozen |
| Search / filter response | ≤ 2 seconds | Must be delegation-safe for tables > 500 rows |

## Delegation Limits

| Rule | Target |
|---|---|
| Delegation threshold | All queries on tables expected to exceed 500 records must fully delegate to Dataverse |
| Non-delegable operations | Must be explicitly approved and documented in the TDD as a Delegation Warning |
| Gallery / collection maximum (non-delegated) | ≤ 500 records — flag as a risk if business data can exceed this |

## Model-Driven App Performance

| Operation | Target | Notes |
|---|---|---|
| Main form load | ≤ 2 seconds | No plugins on form load unless essential |
| View / grid load (≤ 5,000 rows) | ≤ 3 seconds | Standard Dataverse query, no FetchXML aggregation on load |
| Form save (with synchronous plugin/flow) | ≤ 3 seconds | Synchronous operations blocking save must stay within this |

## Power Automate Flow Performance

| Flow Type | Target | Notes |
|---|---|---|
| User-triggered (real-time, instant) | ≤ 5 seconds end-to-end | Felt by user — must complete before UI feedback shown |
| Automated (record created/updated) | ≤ 30 seconds | Not blocking user; alert if exceeding during load test |
| Scheduled (batch) | Complete within scheduled window with 20% buffer | e.g., hourly flow must complete in ≤ 48 minutes |
| Child flow execution | ≤ 10 seconds | Per invocation; parent flow SLA must account for this |

## Copilot Studio

| Metric | Target |
|---|---|
| Topic resolution (intent matched) | ≤ 3 seconds from user input to bot response |
| Power Automate action (called from topic) | ≤ 10 seconds; show typing indicator while waiting |
| Escalation trigger | < 2 seconds from escalation decision to handoff confirmation shown |

## Availability

| Target | Scope |
|---|---|
| 99.9% monthly uptime | All production Power Platform apps and flows |
| Zero unplanned outages caused by custom code | Plugins and flows must not block the platform |
| Graceful degradation on connector failure | Flow errors must not surface raw exceptions to end users |

## Data Volume and Retention

| Dimension | Target |
|---|---|
| Table row counts (before archiving) | Design must state expected volume; flag if > 1 million rows |
| Audit log retention | 7 years for PII/financial tables; 1 year for operational tables |
| Attachment/file columns | Size limits must be set deliberately — never left at default |

## Security NFRs

| Requirement | Target |
|---|---|
| App authentication | Azure AD / Entra ID — no anonymous canvas app access |
| Secrets | Azure Key Vault via Environment Variable Secret type — no raw secrets in Dataverse |
| PII at rest | Dataverse platform encryption + field-level security on sensitive columns |
| Connection References | Service account ownership — no personal connections in production flows |
| Audit | Enabled on all PII and financial tables in Test, UAT, and Production |
