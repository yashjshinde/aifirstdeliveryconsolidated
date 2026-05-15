# Constitution — Non-Functional Requirements Targets

These targets are the minimum acceptable thresholds for every Azure Integration solution. The `/spec` command must capture NFRs per FR against these baselines. The `/testplan` command must include performance test cases that verify each target. The `/tdd` command must document how the design meets each target.

Flag any feature that cannot meet a target as a Constitution Risk with a justified exception.

## API Response Time (Synchronous Flows)

| Operation | Target | Notes |
|---|---|---|
| APIM API response (p95) | ≤ 500ms | End-to-end from client to backend and back |
| Azure Function HTTP trigger (p95) | ≤ 300ms | Excluding cold start — warm instance target |
| Cold start (consumption plan) | ≤ 2 seconds | Flag if cold start frequency is unacceptable — consider Premium plan |
| Logic App HTTP action (p95) | ≤ 1 second | Per action, not end-to-end workflow |

## Async Message Processing Latency

| Priority | Target | Notes |
|---|---|---|
| Standard messages (p95) | ≤ 30 seconds from publish to processing complete | Applies to Service Bus triggered Functions |
| Batch / scheduled flows | Complete within scheduled window with 20% buffer | e.g., hourly flow must complete in ≤ 48 minutes |
| High-priority messages (where SLA defined) | Stated per feature in spec NFR section | Override the standard target with a business-justified value |

## Throughput

| Scenario | Target | Notes |
|---|---|---|
| Service Bus message ingestion | ≥ 1,000 messages/minute per function instance | Scale-out applies; document max scale units |
| API Gateway throughput | Stated per API product in APIM policy | Rate limit policy must be set — no unlimited products |
| Batch data volume | Stated per feature at design time | Must be verified in performance test |

## Availability

| Target | Scope |
|---|---|
| 99.9% monthly uptime | All production integration services |
| Zero message loss | DLQ handling required for all async flows — no message silently dropped |
| Graceful degradation | Target system unavailability must not cause data loss — use retry + DLQ |

## Dead-Letter Queue (DLQ) SLA

| Metric | Target |
|---|---|
| DLQ review cadence | DLQ messages reviewed within 4 business hours of first arrival |
| DLQ replay | Every DLQ flow must have a documented and tested replay procedure |
| DLQ alert | Alert fires within 5 minutes of first message on any DLQ |

## Error and Reliability

| Metric | Target |
|---|---|
| Unrecoverable failure rate | < 0.5% of all processed messages |
| Retry exhaustion rate | < 0.1% — if exceeding, review retry policy and target system SLA |
| Critical alert acknowledgement | Within 15 minutes (business hours); within 30 minutes (out of hours with on-call) |
| Mean Time to Recovery (MTTR) | < 2 hours for Severity 1 integration failures |

## Security NFRs

| Requirement | Target |
|---|---|
| Authentication | Managed Identity for all service-to-service; no service principal secrets |
| Secrets | Azure Key Vault only — no secrets in code, config, or pipeline variables |
| TLS | TLS 1.2 minimum for all in-transit communication |
| PII in logs | Masked before logging — zero tolerance for credentials or full PAN in logs |
| Network isolation | Private Endpoints for Service Bus, Storage, and Key Vault in production |
