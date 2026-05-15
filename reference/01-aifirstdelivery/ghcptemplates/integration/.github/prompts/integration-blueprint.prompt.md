---
mode: agent
description: "Generate an Azure Integration solution blueprint. Triggers on: 'blueprint', 'solution blueprint'."
---

Generate a Solution Blueprint for an Azure Integration feature from a task-ready plan.

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`. If not `TASK-READY` or `PARTIALLY READY`, stop.

## Steps

2. Read all files in `constitution/`.

2b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Read `{brownfield.docs-path}/architecture/solution-blueprint.md` if it exists.
    - Read `{brownfield.docs-path}/architecture/dependency-map.md` if it exists.
    - Read `{brownfield.docs-path}/integrations/integration-topology.md` if it exists.
    - The existing blueprint is the baseline. The new blueprint must:
      (a) identify which existing integration patterns the feature follows;
      (b) call out any deliberate departures with justification;
      (c) show how the new components integrate into the existing topology.
    If `false`: skip.

3. Read `specs/{feature-name}/spec.md` and `plans/{feature-name}/plan.md`.
4. Determine architecture pattern from task inventory (see patterns below).
5. Generate Blueprint using `doc-templates/solution-blueprint-template.md`.
6. Write to `docs-generated/{feature-name}/solution-blueprint.md`.
7. Print: pattern chosen, key decisions, risks.

## Architecture Pattern Selection

### Pattern A — Event-Driven Async
**Use when:** Decoupled producers/consumers, high throughput, eventual consistency acceptable.
**Stack:** Service Bus Topics → Azure Functions (SB Trigger) → Target System
**Indicators:** Multiple consumers, fire-and-forget, fan-out scenarios.

### Pattern B — Request/Response Synchronous
**Use when:** Caller needs immediate confirmation, low latency required, transactional.
**Stack:** APIM → Azure Function (HTTP) → Target System
**Indicators:** UI-driven integrations, real-time lookups, payment processing.

### Pattern C — Hybrid (Async + Sync)
**Use when:** Mix of real-time queries and background processing in same feature.
**Stack:** APIM for sync + Service Bus for async; Functions for both.
**Indicators:** Task inventory has both HTTP Function tasks and Service Bus tasks.

### Pattern D — Orchestrated Workflow
**Use when:** Multi-step process with conditionals, human tasks, or long-running operations.
**Stack:** Logic App Standard (orchestrator) + Functions (compute) + Service Bus (async steps)
**Indicators:** Approval workflows, multi-system saga, SLA-tracked processes.

### Pattern E — Scheduled Batch
**Use when:** Bulk data synchronisation, periodic reporting, ETL.
**Stack:** Timer-triggered Function → Batch read/write → Target
**Indicators:** Scheduled tasks dominate, high data volume, nightly sync.

## What the Blueprint Must Cover

### 1. Architecture Pattern and Rationale
- Selected pattern, why alternatives were rejected

### 2. Integration Topology

Generate a Mermaid `graph LR` diagram. Label every arrow with the protocol/trigger. Use `subgraph` blocks for Azure resource groupings. Apply `:::info` to external source/target systems; `:::critical` to dead-letter / error paths.

````mermaid
graph LR
  Src["{Source System}"]:::info
  subgraph Azure["Azure Integration"]
    APIM["APIM\n{api-name-v1}"]
    Func1["Function\n{ProcessFunction}"]
    SB["Service Bus\n{topic/queue}"]
    Func2["Function\n{SyncFunction}"]
  end
  Tgt["{Target System}"]:::info
  DLQ["Dead Letter Queue"]:::critical
  Src -- "HTTPS POST" --> APIM
  APIM --> Func1
  Func1 -- "publish" --> SB
  SB -- "trigger" --> Func2
  Func2 -- "{protocol}" --> Tgt
  Func2 -- "on failure" --> DLQ
  classDef info fill:#93c5fd,color:#000,stroke:#3b82f6
  classDef critical fill:#ef4444,color:#fff,stroke:#b91c1c
````

### 3. Data Architecture
- Data flows with transformation points
- Schema versioning strategy
- Data retention per store (Service Bus, storage, database)

### 4. Security Architecture
- Authentication map: every service-to-service hop with auth method
- Managed Identity assignments
- Network perimeter: what is VNet-isolated

### 5. Resilience Architecture
- Retry topology per component
- DLQ strategy and replay mechanism
- Circuit breaker placement
- Failover approach

### 6. Scalability Architecture
- Scale-out triggers per component (CPU%, queue depth, custom metric)
- Peak throughput capacity and how it is achieved
- Bottleneck analysis

### 7. ALM Architecture
- IaC strategy (Bicep modules structure)
- Environment promotion path
- Deployment pipeline stages

### 8. Technical Risks and Mitigations
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {Risk} | H/M/L | H/M/L | {Mitigation} |

### 9. Brownfield Architecture Delta *(include only when `brownfield.enabled: true`)*
- Before/after integration topology: existing components (from brownfield blueprint) annotated with what changes (EXTEND / REPLACE) and what is new (NEW)
- Pattern consistency: does this feature follow the established integration pattern or introduce a new one? If new, provide justification.
- Schema versioning impact: for any modified message schema, document how existing consumers are protected (backwards compatibility, deprecation notice, parallel version period)
- Net additions: list every new Azure resource not present in the brownfield system
