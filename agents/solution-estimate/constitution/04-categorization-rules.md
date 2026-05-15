---
agent: solution-estimate
version: 2.0.0
last-reviewed: 2026-05-15
owner: aggregator
adr-refs: [ADR-0012]
---

# Categorization Rules — Estimation Hierarchy

> Per [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md). The `Categorization` column on every inventory row carries the **estimation hierarchy path**: `Project > Module > Capability > Feature > Factor`. This file defines what each level means and how the agent derives it.
>
> **Naming note (post-ADR-0012, 2026-05-15):** Prior versions of this file used `L1 / L2 / L3 / L4 / L5` for these levels. Those labels were retired in ADR-0012 and are now **reserved exclusively for the business-process taxonomy** in [05-requirement-levels.md](05-requirement-levels.md). The estimation hierarchy uses explicit named labels: `Project / Module / Capability / Feature / Factor`. The composite path's values are unchanged; only the labels are renamed.

## The 5 levels

| Level | Was (pre-ADR-0012) | Now | Source / derivation |
|---|---|---|---|
| 1 | L1 | **Project** | From `projects/{p}/project.config.yaml` `name:` field. Same value on every row in the project. |
| 2 | L2 | **Module** | Agent-classified via [templates/module-detection.yaml](../templates/module-detection.yaml). Examples: Sales / Service / Marketing / Field Service / Integration / Reporting / Migration / Core. |
| 3 | L3 | **Capability / Sub-Module** | Agent-classified within module. Examples (under Module=Sales): Lead Mgmt / Opportunity Mgmt / Quote Mgmt / Order Mgmt. Under Module=Integration: Real-time / Batch / Data Migration. |
| 4 | L4 | **Feature** | Agent-classified within capability. Typically corresponds to one or more Req IDs. Examples (under Capability=Lead Mgmt): Lead Qualification / Lead Conversion / Lead Scoring. |
| 5 | L5 | **Inventory Factor** | Mirrors the `Inventory` column value (one of 103 factors). |

## XLSX export (revised per ADR-0012)

The XLSX export breaks `Categorization` into **5 separate columns named**: `Project` / `Module` / `Capability` / `Feature` / `Factor` so Excel users can pivot / filter / sort by any individual level.

**Important:** The XLSX export does NOT produce columns named `L1 / L2 / L3 / L4 / L5` for the estimation hierarchy — those labels are now reserved exclusively for the `Requirement Level` column (per [05-requirement-levels.md](05-requirement-levels.md) and [ADR-0012](../../../design/adr/0012-requirement-level-taxonomy.md)). The `Requirement Level` column itself stays as a single column in XLSX (never split).

## Project — solution name

Just the project name. Trivial. From `project.config.yaml name:`.

## Module classification

Driven by [templates/module-detection.yaml](../templates/module-detection.yaml). Same file as the brownfield agent's module-detection ruleset (shared, single source of truth). The classification keys off:

- Requirement title + body text (keyword matching: "lead", "opportunity", "case", "campaign", etc.)
- Source artefact path (if the requirement came from `projects/{p}/d365-fo/...`, default Module = the FO module; from `projects/{p}/reporting/...`, default Module = Reporting)
- Explicit Module hint in the requirement frontmatter (when present)

When the keyword matches multiple modules:
- If one match is much stronger, pick it
- If genuinely ambiguous, set `Module = <best-guess>` and add a Typed Gap of category `AMBIGUOUS-MODULE` (surfaced in Open Questions)

## Capability classification

A second pass once Module is known. The agent uses a fixed taxonomy per Module:

```
Sales:        Lead Mgmt | Opportunity Mgmt | Quote Mgmt | Order Mgmt | Account Mgmt | Contact Mgmt | Product Catalog
Service:      Case Mgmt | Knowledge Mgmt | Queue Mgmt | Routing | SLA Mgmt | Customer Self-Service
Marketing:    Campaign Mgmt | Customer Journey | List Mgmt
Field Service: Work Order | Resource Scheduling | Inventory | Customer Asset
Integration:  Real-time | Batch | Data Migration | Identity / Auth
Reporting:    Embedded BI | Operational Reports | Self-Service Analytics | Dashboards
Migration:    Reference Data | Master Data | Transactional Data | Cutover
Core:         Security | Org Setup | Reference Data | Multilingual | Audit
```

Capabilities not in this taxonomy: emit `Capability = "(uncategorised)"` and log a Typed Gap.

## Feature classification

Free-form per-project. Typically the agent groups consecutive related Req IDs into a single Feature. Example: Req IDs `REQ-021` "Lead form auto-populate from email", `REQ-022` "Lead form duplicate detection", `REQ-023` "Lead form scoring" all land under `Feature = "Lead Form Enhancements"`.

Naming convention: title-case noun phrase, no trailing punctuation.

## Inventory Factor

Just mirrors the `Inventory` column. Repeated here in the Categorization path for hierarchy completeness in pivot/filter scenarios.

## Two-level grouping in the inventory output

The rendered `Estimation-BusinessReqDetail.md` groups rows by **Module** and **Fitment sub-section**, **not** by Capability or Feature. Rationale: stakeholders scan by module-and-decision-type ("show me everything we'll customise in Sales"), not by capability or feature. The full `Project > Module > Capability > Feature > Factor` path is preserved on every row for those who want the deeper view.

The Capability / Feature grouping IS surfaced separately in §4 Estimation Hierarchy of `Estimation-ModuleOverallHrs.md` (one table per level).

The L1-L5 **business-process** roll-up (orthogonal axis) is surfaced in §4.5 Requirement Level Distribution per [05-requirement-levels.md](05-requirement-levels.md).

## Cross-cutting / cross-module rows

When a requirement genuinely spans modules (e.g., "Audit logging for all CE entities"), the agent picks the **primary** module (where the work product lives) and adds a Cross-Cutting note in Solution/Rationale: `Cross-cutting: also affects [<Module-A>], [<Module-B>], [<Module-C>]`. The row counts under the primary module; the cross-cut affects do not double-count.

## Override path

Per-project module-detection overrides go in `projects/{p}/_aggregator/estimation/module-detection-override.yaml` (same shape as the canonical file in templates/). The agent merges canonical + override at run time with override winning.

## Relationship to the Requirement Level taxonomy

The `Categorization` column (this file, **Estimation Hierarchy**) is **orthogonal** to the `Requirement Level` column (see [05-requirement-levels.md](05-requirement-levels.md), **business-process taxonomy**). Every inventory row has both. They answer different questions:

| Column | Question it answers |
|---|---|
| Categorization (`Project > Module > Capability > Feature > Factor`) | "Where in the project's effort-rollup tree does this work sit?" |
| Requirement Level (`L1` / `L2` / `L3` / `L4` / `L5`) | "Where in the business-process taxonomy does this requirement sit?" |

Examples:

| Req Title | Categorization | Requirement Level |
|---|---|---|
| "Implement Customer Service module" | `acme > Service > (uncategorised) > (uncategorised) > N/A` | L1 (Category) |
| "Build the Case-to-Resolution process" | `acme > Service > Case Mgmt > Case Lifecycle > New CRM Plugin Build & UT` | L2 (Process Group) |
| "Triage an inbound case" | `acme > Service > Case Mgmt > Case Triage > New CRM Plugin Build & UT` | L3 (Process) |
| "Assign case owner via routing rule" | `acme > Service > Routing > Case Routing > Routing Rule Configuration` | L4 (Activity) |
| "Click 'Resolve Case' to close the case" | `acme > Service > Case Mgmt > Resolve Case Button > New CRM Form Customization` | L5 (Task) |

## See also

- [ADR-0012 — Requirement Level taxonomy + Estimation Hierarchy rename](../../../design/adr/0012-requirement-level-taxonomy.md)
- [05-requirement-levels.md](05-requirement-levels.md) — the orthogonal business-process taxonomy
- [01-template-alignment.md § Output 1](01-template-alignment.md) — the 21-column inventory shape
- Implementation log: [`2026-05-15-006`](../../../implementation.md) (DEFECT-001 intake)
