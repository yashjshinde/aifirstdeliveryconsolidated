---
agent: solution-estimate
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Fitment Classification — 8 Allowed Values

Every inventory row carries a `Fitment` column. The value MUST be one of the 8 below. No custom values; no shorthand. This list is locked by [ADR-0009](../../../design/adr/0009-solution-estimate-consolidated.md) and key rule #5.

## The 8 values

| # | Value | Meaning | Hours? | Sub-section in inventory output |
|---|---|---|---|---|
| 1 | **Out of the Box** | OOB. No build effort. | 0 | Configuration |
| 2 | **Configuration** | Declarative config (security roles, BPF in CE designer, Power BI dataset settings). No code. | > 0 | Configuration |
| 3 | **Customization** | Custom code (plugin, JS, X++ extension, PCF, ADF custom activity). | > 0 | Customization |
| 4 | **Integration** | External-system integration (Azure Function, Logic App, Service Bus, ADF, SFTP). | > 0 | Integration |
| 5 | **Non-Functional** | NFR-specific work (perf-tuning, hardening, monitoring instrumentation). | > 0 | Configuration |
| 6 | **Covered in other requirement** | Subsumed by a sibling row. The "other req" Req ID is named in Solution/Rationale. | 0 | Configuration |
| 7 | **Out of Scope** | Excluded from delivery by agreement. Logged for traceability. | 0 | Out of Scope / Deprecated |
| 8 | **Deprecated / Not Supported** | Cannot be delivered (platform doesn't support / OOB removed / replaced by a different requirement). | 0 | Out of Scope / Deprecated |

## Classification decision tree

```
1. Does the platform / OOB satisfy the requirement as-is?
     -> YES: Fitment = "Out of the Box"
     -> NO: continue

2. Can declarative config (no code) satisfy it?
     -> YES: Fitment = "Configuration"
        (this includes: security roles, business rules in CE designer, BPF, Power BI dataset+RLS settings, ADF copy-only pipelines)
     -> NO: continue

3. Does it require external-system integration (cross-system data flow, API calls to non-Dataverse systems)?
     -> YES: Fitment = "Integration"
        (Type of Integration column must be set: Batch / Real-time / Middleware / API based / File based)
     -> NO: continue

4. Is it an NFR (perf / availability / security / observability)?
     -> YES: Fitment = "Non-Functional"
     -> NO: continue

5. Is this requirement already covered by another row in the inventory?
     -> YES: Fitment = "Covered in other requirement"
        (Solution / Rationale must name the covering Req ID)
     -> NO: continue

6. Is it explicitly excluded by agreement?
     -> YES: Fitment = "Out of Scope"
     -> NO: continue

7. Is it impossible to deliver (platform constraint / deprecated capability)?
     -> YES: Fitment = "Deprecated / Not Supported"
     -> NO: continue

8. Otherwise: Fitment = "Customization"
   (Custom code / plugin / X++ / JS / PCF / custom Power Automate logic)
```

## Type of Integration rules

Required only when Fitment = "Integration". Otherwise Type of Integration = `NA` (Key rule #7).

| Type | When |
|---|---|
| Batch | Scheduled bulk movement; non-realtime |
| Real-time | Event-driven, push-based, low-latency |
| Middleware | Logic App / Service Bus / APIM mediating |
| API based | REST / SOAP / GraphQL direct consumption |
| File based | SFTP / Blob / file watcher |

## Boundaries between Configuration and Customization

The most common classification disagreement. Use this rubric:

| Pattern | Fitment |
|---|---|
| Adding a Security Role + assigning a privilege via the CE designer | Configuration |
| Adding a Business Rule via the CE designer | Configuration |
| Authoring a Power Automate cloud flow with stock connectors | Configuration |
| Writing a CE plugin in C# | Customization |
| Writing a JS web resource | Customization |
| Authoring a Power Automate cloud flow that requires a custom connector | Customization (the connector) + Configuration (the flow shell) — **two rows** per rule #1 |
| Adding an X++ extension class (CoC) | Customization |
| Adding a Logic App that calls external SAP | Integration |
| Tuning P95 response time on a high-volume entity | Non-Functional |

## When to emit two rows

Per rule #1, never collapse multiple inventory types. Examples that produce multiple rows for the same Req ID:

- Requirement: "Case auto-assignment based on product + region"
  - Row 1: Inventory = CRM Plugin C&UT, Fitment = Customization
  - Row 2: Inventory = Business Rule, Fitment = Configuration (for the form-side validation that surfaces routing reasoning)
- Requirement: "Sales pipeline dashboard with RLS"
  - Row 1: Inventory = New CRM SSRS / Power BI Report - C&UT, Fitment = Customization (the report build)
  - Row 2: Inventory = Field Level Security, Fitment = Configuration (the RLS roles)
