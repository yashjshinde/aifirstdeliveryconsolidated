# Architectural Principles — Reporting Agent

## 1. Report Type Selection

Choose the report type based on the primary use case:

| Use Case | Recommended Type | Rationale |
|---|---|---|
| Self-service analytics, dashboards, interactive exploration | Power BI Interactive Report | Slice/dice, drill-through, rich visuals |
| Pixel-perfect, print-ready, structured output | Power BI Paginated Report (SSRS engine) | Fixed layout, multi-page, export to PDF/Excel |
| Operational reports embedded in D365 CE | SSRS (Reporting Services) via `.rdl` | Native D365 CE integration, server-side rendering |
| Scheduled email delivery of formatted reports | Power BI Paginated or SSRS subscription | Supports recurring email with attachments |
| KPI summary tiles embedded in Canvas/MDA | Power BI Embedded or Power BI visual in MDA | Platform-native embedding |

Never use Power BI interactive reports as a substitute for pixel-perfect documents. Never use SSRS for exploratory analytics dashboards.

## 2. Spec-Driven Development

Every report must trace to a functional requirement (FR-NNN) in an approved spec. Ad hoc report requests must go through `/spec` first.

## 3. Data Model Before Visuals

Data model design (star schema, relationships, measures) must be completed before any visual layer is specified. A spec that proposes visuals without a data model is incomplete.

## 4. Single Source of Truth

Measures and KPIs must be defined once in a shared semantic model or centralised dataset. Reports must consume certified datasets — they must not duplicate measures inline.

## 5. RLS is Mandatory for D365 Data

Any report that surfaces D365 entity data (Contacts, Accounts, Cases, Opportunities, or custom entities) must define RLS rules. A spec without RLS coverage is a BLOCKER in `/review`.

## 6. Inference Rules

- If a report requirement implies a data source but does not name it, infer the most likely D365 entity or Dataverse table and flag as *(inferred — confirm with data owner)*.
- If a refresh schedule is not specified, default to Daily at 06:00 UTC and flag as *(assumed — confirm)*.
- If a workspace is not specified, use the project default workspace from `constitution/10-alm-configuration.md`.

## 7. Flagging Conventions

```
⚠ NEEDS REVIEW          Cannot determine intent from requirement
⚠ PERFORMANCE RISK      DirectQuery on large table without aggregation
⚠ RLS MISSING           Report surfaces restricted data with no RLS defined
⚠ CERTIFIED DATASET     Must use existing certified dataset — do not duplicate
⚠ DELEGATION RISK       Power BI dataflow delegation constraint applies
⚠ DEPRECATED API        Using a deprecated Power BI or SSRS feature
*(inferred)*             Derived from context, not stated explicitly
*(assumed)*              Assumed value — must be confirmed before build
```

## 8. Completeness Over Brevity

Every report in the catalogue must be fully documented — no truncation of report fields, measures, or RLS rules. If a report has 30 columns, document all 30.
