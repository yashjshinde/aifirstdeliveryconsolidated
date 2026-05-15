---
agent: solution-estimate
version: 1.0.0
last-reviewed: 2026-05-14
owner: aggregator
---

# Categorization Rules — L1 through L5 Hierarchy

The `Categorization` column on every inventory row carries the full hierarchy path: `L1 > L2 > L3 > L4 > L5`. This file defines what each level means and how the agent derives it.

## The 5 levels

| Level | Meaning | Source / derivation |
|---|---|---|
| **L1** | Solution / Project | From `projects/{p}/project.config.yaml` `name:` field. Same value on every row in the project. |
| **L2** | Module | Agent-classified via [templates/module-detection.yaml](../templates/module-detection.yaml). Examples: Sales / Service / Marketing / Field Service / Integration / Reporting / Migration / Core. |
| **L3** | Capability / Sub-Module | Agent-classified within module. Examples (under L2=Sales): Lead Mgmt / Opportunity Mgmt / Quote Mgmt / Order Mgmt. Under L2=Integration: Real-time / Batch / Data Migration. |
| **L4** | Feature | Agent-classified within capability. Typically corresponds to one or more Req IDs. Examples (under L3=Lead Mgmt): Lead Qualification / Lead Conversion / Lead Scoring. |
| **L5** | Inventory Factor | Mirrors the `Inventory` column value (one of 103 factors). |

## XLSX export

The XLSX export breaks `Categorization` into 5 separate columns named `L1` / `L2` / `L3` / `L4` / `L5` so Excel users can pivot / filter / sort by any individual level.

## L1 — Solution

Just the project name. Trivial.

## L2 — Module classification

Driven by [templates/module-detection.yaml](../templates/module-detection.yaml). Same file as the brownfield agent's module-detection ruleset (shared, single source of truth). The classification keys off:

- Requirement title + body text (keyword matching: "lead", "opportunity", "case", "campaign", etc.)
- Source artefact path (if the requirement came from `projects/{p}/d365-fo/...`, default L2 = the FO module; from `projects/{p}/reporting/...`, default L2 = Reporting)
- Explicit Module hint in the requirement frontmatter (when present)

When the keyword matches multiple modules:
- If one match is much stronger, pick it
- If genuinely ambiguous, set `L2 = <best-guess>` and add a Typed Gap of category `AMBIGUOUS-MODULE` (per Open Questions in inventory output)

## L3 — Capability classification

A second pass once L2 is known. The agent uses a fixed taxonomy per L2:

```
Sales:    Lead Mgmt | Opportunity Mgmt | Quote Mgmt | Order Mgmt | Account Mgmt | Contact Mgmt | Product Catalog
Service:  Case Mgmt | Knowledge Mgmt | Queue Mgmt | Routing | SLA Mgmt | Customer Self-Service
Marketing: Campaign Mgmt | Customer Journey | List Mgmt
Field Service: Work Order | Resource Scheduling | Inventory | Customer Asset
Integration: Real-time | Batch | Data Migration | Identity / Auth
Reporting: Embedded BI | Operational Reports | Self-Service Analytics | Dashboards
Migration: Reference Data | Master Data | Transactional Data | Cutover
Core: Security | Org Setup | Reference Data | Multilingual | Audit
```

Capabilities not in this taxonomy: emit `L3 = "(uncategorised)"` and log a Typed Gap.

## L4 — Feature classification

Free-form per-project. Typically the agent groups consecutive related Req IDs into a single L4 feature. Example: Req IDs `REQ-021` "Lead form auto-populate from email", `REQ-022` "Lead form duplicate detection", `REQ-023` "Lead form scoring" all land under `L4 = "Lead Form Enhancements"`.

Naming convention: title-case noun phrase, no trailing punctuation.

## L5 — Inventory Factor

Just mirrors the `Inventory` column. Repeated here in the Categorization path for hierarchy completeness in pivot/filter scenarios.

## Two-level grouping in the inventory output

The rendered `Estimation-BusinessReqDetail.md` groups rows by Module (L2) and Fitment sub-section, **not** by L3 or L4. Rationale: stakeholders scan by module-and-decision-type ("show me everything we'll customise in Sales"), not by capability or feature. The L1-L5 path is preserved on every row for those who want the deeper view.

The L3/L4 grouping IS surfaced separately in §4 Requirement Hierarchy of `Estimation-ModuleOverallHrs.md` (one table per level).

## Cross-cutting / cross-module rows

When a requirement genuinely spans modules (e.g., "Audit logging for all CE entities"), the agent picks the **primary** module for L2 (where the work product lives) and adds a Cross-Cutting note in Solution/Rationale: `Cross-cutting: also affects [L2-A], [L2-B], [L2-C]`. The row counts under the primary module; the cross-cut affects do not double-count.

## Override path

Per-project module-detection overrides go in `projects/{p}/_aggregator/estimation/module-detection-override.yaml` (same shape as the canonical file in templates/). The agent merges canonical + override at run time with override winning.
