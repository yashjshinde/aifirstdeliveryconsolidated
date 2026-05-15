---
title: 103-Factor Catalogue — Per-Complexity Definitions
agent: solution-estimate
schema-version: factor-definitions.v1
last-reviewed: 2026-05-14
owner: aggregator
---

# 103-Factor Catalogue — Per-Complexity Definitions

> Each factor describes one type of work product. For each factor, there are up to 5 complexity definitions (Very Simple / Simple / Medium / Complex / Very Complex). The `/estimate` command body picks the matching complexity by reading the requirement and comparing to these descriptions.
>
> Hour rates per factor per complexity live in [factor-rates.yaml](factor-rates.yaml). This file is the **descriptions** companion.
>
> **Source provenance.** Descriptions are PORTED from a canonical Systems Integrator effort-data Excel. Where descriptions below show `(see source for verbatim wording)`, the canonical-source text is authoritative once available; the current concise version is sufficient for `/estimate` to pick a complexity tier correctly.

## How to use this file

The `/estimate` command reads a requirement, picks the Inventory factor (per [02-factor-definitions § Factor selection heuristic](../constitution/02-factor-definitions.md)), then walks the matching factor's complexity descriptions below and picks the level whose wording best matches the requirement's scope.

When the requirement scope clearly exceeds even the VC description, log an Open Question of category `COMPLEXITY-INFERENCE` and pick VC as the upper bound.

When the catalogue source has no rate for a level (shown as `null` in `factor-rates.yaml`), do not assume zero — log an Open Question and pick the nearest defined level.

---

## CRM Core Development & Customization (17 factors)

### CRM Existing Table C&UT
Customisation + Unit Test work on an existing Dataverse table (typically a stock Customer Engagement entity).

| Level | Scope hint |
|---|---|
| VS | (rate undefined — not used) |
| S | <= 4 new custom columns; minimal validation; OOB form unchanged |
| M | 5-15 new custom columns; some validation; minor form layout changes |
| C | 16-30 new custom columns; complex validation; significant form changes; new views |
| VC | 30+ columns OR major form/UX overhaul OR cross-entity validation logic |

### CRM New Table C&UT
Brand-new Dataverse table with full lifecycle (columns, relationships, forms, views).

| Level | Scope hint |
|---|---|
| S | <= 10 columns; one form; one or two views; no plugins |
| M | 11-25 columns; 2-3 forms; multiple views; basic security |
| C | 25+ columns; multiple forms incl. role-based; complex security model; OOB charts |
| VC | All of the above + hierarchical relationships, complex BPF, advanced security (FLS / hierarchy security) |

### CRM Plugin C&UT
Custom plugin (sync or async) registered against a Dataverse SDK message.

| Level | Scope hint (from canonical SI source) |
|---|---|
| VS | Triggers on <= 2 target attributes; simple logic; no queries; CRUD within target entity scope only |
| S | Any attributes; simple logic; <= 2 read-only queries; simple CRUD in target |
| M | Any attributes; medium logic; multiple queries; simple CRUD in and out of target |
| C | Any attributes; complex logic; multiple queries; complex CRUD (incl. Assign / Share) |
| VC | Any attributes; complex logic; multiple queries in and out of CRM; complex CRUD; potentially async / batch concerns |

### CRM Workflow Assembly C&UT
Custom Workflow Activity (CWA) — .NET assembly extending the workflow engine.

| Level | Scope hint |
|---|---|
| VS | <= 2 steps; trivial logic |
| S | 3-5 steps; simple logic |
| M | 6-10 steps; medium logic |
| C | 11-18 steps; complex branching |
| VC | 19-30 steps; complex orchestration |

### Other CRM Core factors

For the remaining 13 factors in this category (CRM New Relationship C&UT, CRM Web Resource UI, CRM Workflow C&UT, CRM Staged Workflow, CRM Dialog Process, CRM Dashboard, CRM Custom Action, CRM Modify Report, Additional CRM Form, BPF C&UT, Business Rule C&UT, Additional JS on Entity, Action C&UT) — see [factor-rates.yaml](factor-rates.yaml) for hour rates. Per-complexity wording follows the same conceptual pattern (S = "single, simple, minimal scope"; M = "moderate complexity, single-entity"; C = "cross-entity / multi-step"; VC = "high-volume / orchestrated / security-sensitive"). Full canonical descriptions to be ported from the source SI catalogue in a follow-up build phase.

---

## Code / ASP.NET / Web Services (6 factors)

ASP.NET Page C&UT, ASP.NET Alternate CRM Page C&UT, Business Entity Component, Data Access Component, System Service, Web Service.

Pattern: S = "single endpoint / simple model"; M = "multiple endpoints / moderate validation"; C = "complex schema / auth / pagination"; VC = "high-throughput / complex orchestration / multi-protocol". See [factor-rates.yaml](factor-rates.yaml) for rates.

---

## Reports & Dashboards (5 factors)

### New CRM SSRS / Power BI Report — C&UT

| Level | Scope hint |
|---|---|
| VS | Single entity / single chart / predefined styles / no calc / no conditional fmt |
| S | <= 2 entities, <= 2 charts, predefined styles |
| M | <= 2 entities, <= 2 charts, customised styles, <= 3 calc, limited conditional fmt, <= 3 parameters |
| C | <= 5 entities, <= 3 charts, customised styles, calc, conditional fmt, parameters |
| VC | <= 8 entities, <= 5 charts, customised styles, calc, conditional fmt, parameters, sub-reports, pagination |

### Other reporting factors

New CRM SSRS Report, New CRM Report Wizard Report, Modify Existing CRM Report, Dashboard Config — see [factor-rates.yaml](factor-rates.yaml).

---

## Integration & Data Migration (3 SI factors + 3 reintroduced)

### Simple ETL Package C&UT, Data Migration (SSIS Kingsway), Data Migration (ADF)

Pattern: S = "1 source, 1 target, < 10K rows"; M = "few sources, transformations, batch"; C = "many sources, complex transforms, validation"; VC = "high-volume, incremental refresh, reconciliation".

### Azure Function Build & UT *(reintroduced per ADR-0009)*

| Level | Scope hint |
|---|---|
| S | Single trigger; simple business logic; no external dependencies |
| M | Multiple triggers; moderate logic; HTTP-only dependencies |
| C | External dependencies (Dataverse, Service Bus, third-party APIs); error handling; retry policy |
| VC | State management; security; complex processing; durable orchestrators |

### Integration (generic) *(reintroduced)*
For integration work that doesn't fit a specific Azure-side or SI factor. S/M/C/VC pattern as above.

### CRM Master Data Preparation *(reintroduced)*
S = "single reference dataset, < 100 rows"; M = "multiple reference datasets, mappings"; C = "transactional master data with deduplication"; VC = "cross-system master data with active reconciliation".

---

## Power Platform (5 + 2 reintroduced)

### Power Apps Canvas App Screen
S = "single-screen form bound to one dataset"; M = "multi-screen flow with shared collections"; C = "complex Power Fx, custom connectors, components"; VC = "high-performance app with offline mode / custom components".

### Power Automate Flow
S = "stock-connector linear flow"; M = "branching, error handling"; C = "child flows, custom connectors, retry policies"; VC = "long-running orchestration, error compensation".

### PCF Control Development *(reintroduced)*

| Level | Scope hint |
|---|---|
| S | UI-only; renders a single bound field; no events |
| M | UI + logic; bidirectional binding |
| C | Complex interactions; cross-field validation; external library usage |
| VC | High-performance, reusable across forms, customised lifecycle |

### Model Driven App Changes *(reintroduced)*
S = "1 sitemap edit"; M = "navigation restructure"; C = "role-targeted apps with multiple sitemaps"; VC = "many model-driven apps with shared components".

### Dynamics Portal Page (Configuration), Dynamics Portal Page (Styling), Dynamics Portal Web Role
See [factor-rates.yaml](factor-rates.yaml).

---

## Sales / Service / Marketing / Field Service / Customer Service modules (40+ factors)

These factors size out-of-the-box module capabilities being configured for a customer. Pattern across all of them:

| Level | Scope hint |
|---|---|
| S | OOB-only configuration; standard entities; default views/forms accepted |
| M | OOB + light personalisation (additional fields, role-targeted layout) |
| C | OOB + significant customisation (custom views, FLS, business rules) |
| VC | OOB + heavy customisation + cross-module interactions |

See [factor-rates.yaml](factor-rates.yaml) for the full list (Account Mgmt, Contact Mgmt, Lead Mgmt, Opportunity Mgmt, Quote Mgmt, Order Mgmt, Invoice Mgmt, Product Catalog, Sales Territories, Sales Literature, Sales Custom Entities, Sales Custom Relationships, Goals and Goal Metrics, Competitors, Case Mgmt, Contract Mgmt, Queue Mgmt, Facility/Equipment, Services Setup, Sites Setup, Service Custom Entities, Service Custom Relationships, KB, Subject Tree, Campaign, Marketing Custom Entities, Marketing Custom Relationships, Quick Campaigns, Marketing Lists).

---

## Core Foundation (6 factors)

Core Custom Entities, Core Custom Relationships, Email, KB Article, Mail Merge, Connections — same OOB-configuration pattern as the module factors. See [factor-rates.yaml](factor-rates.yaml).

---

## UI / Navigation (6 factors)

Site Map, Multi-Currency, Ribbon / Command Bar, Command Bar / Ribbon C&UT, Role-Based Form, Mobile Phone App Form.

Pattern: S = "one sitemap edit / one ribbon button"; M = "multiple buttons / role-targeted nav"; C = "complex command-bar definitions with rules"; VC = "multi-app navigation with shared components".

---

## Office / Integration Setup (5 factors)

Outlook Client Setup, Offline Client Configuration, SharePoint Integration Configuration, Activity Feeds Configuration, Bing Maps Integration Configuration. Most are one-shot configurations (M=16 hrs flat for Outlook / Offline). See [factor-rates.yaml](factor-rates.yaml).

---

## Security (5 + 1 reintroduced)

### Security Role Base Config
S = "1-2 roles, OOB privileges"; M = "5-10 roles with custom privileges"; C = "10+ roles with role hierarchy"; VC = "complex matrix with team-based security + FLS + BU hierarchy".

### Business Unit Hierarchy, Field Level Security, User Setup, Access Teams
See [factor-rates.yaml](factor-rates.yaml).

### Hierarchy Security *(reintroduced)*
S = "single hierarchy on one entity"; M = "hierarchy across 2-3 entities"; C = "multiple hierarchies with depth limits"; VC = "complex security model with hierarchy + position + manager-based".

---

## Process / Workflow / Misc (7 factors)

Workflow, Action, Business Process Flow, Business Rule, Dialogs, Duplicate Detection, Auditing — see [factor-rates.yaml](factor-rates.yaml). Pattern follows the standard "simple single-step / moderate multi-step / complex multi-condition / VC stateful-orchestration" hierarchy.

---

## Reintroduced — Reports & Dashboards extensions

### Excel Report *(reintroduced)*
S = "single sheet, simple formulas"; M = "multi-sheet with pivot tables"; C = "complex VBA / Power Query / external links"; VC = "enterprise template with data refresh + RLS-style filtering".

### ExperLogix Report *(reintroduced)*
S = "single-page output"; M = "multi-page with conditional sections"; C = "complex pricing / configuration rules"; VC = "high-customisation with custom data sources + scripts".

---

## Override path

A project can override individual factor descriptions at:
`projects/{p}/_aggregator/estimation/factor-definitions-override.md`

The agent merges per-factor by ID. Override wins; canonical falls back. See [ADR-0010](../../../design/adr/0010-templates-agent-owned.md).
