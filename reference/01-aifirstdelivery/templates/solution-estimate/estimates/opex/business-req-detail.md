# Business Requirements Detail — Estimation Inventory

> **Source:** C:\Users\amit.mudgal\source\repos\Opex\DetailsForEstimation.xlsm (Sheet3) → rolled up from `estimates/opex/rom-estimate.md`
> **Method:** Factor-Based Estimation (constitution/20-factor-definitions.md)
> **Reference Rates:** constitution/21-factor-rates.md
> **Estimation Level:** ROM — best available per feature (no SPEC or PLAN estimates exist yet)
> **Date:** 2026-05-13
> **Unit:** Hours (Hrs.) — Complexity columns capture **counts**, not hours.

---

## Module: Customer Master Sync (Fusion → D365)

| Req ID | Module / Feature | Req Title | Priority | Fitment | Type of Integration | Inventory | Req Level | Simple | Medium | Complex | Very Complex | Solution / Rationale | Assumptions / Comments | Open Questions |
|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|
| ROM-001 | F466 — Bill-to ↔ Ship-to | Sync Bill-to (billing account) ↔ Ship-to (service account) relationship from Fusion to D365 | High | Customization | NA | CRM Existing Entity C&UT (Account: Bill-to/Ship-to relationship) | L2 | 0 | 0 | 1 | 0 | Model 1:N self-referencing Bill-to → Ship-to relationship on Account; lookups, sub-grid, views | Re-uses existing Account entity | Is Bill-to vs Ship-to an option set on Account or distinct entities? |
| ROM-001 | F466 — Bill-to ↔ Ship-to | (same) | High | Integration | Batch | Integration (Fusion → D365 Bill-to/Ship-to relationship sync) | L2 | 0 | 0 | 1 | 0 | One-way batch carrying relationship data with mapping/transformation | One-way Fusion → D365 | Frequency and volume of sync? |
| ROM-002 | F465 — Account Hierarchy | View hierarchy on Accounts so multiple service accounts under one organization are related | High | Configuration | NA | CRM Existing Entity C&UT (Account: parent_accountid hierarchy + hierarchy view) | L2 | 0 | 0 | 1 | 0 | parent_accountid hierarchy, hierarchy view, hierarchy icon | Out-of-box account hierarchy | Custom roll-up fields or KPIs required? |
| ROM-002 | F465 — Account Hierarchy | (same) | High | Integration | Batch | Integration (Fusion → D365 hierarchy parent-link sync) | L2 | 0 | 0 | 1 | 0 | Sync parent → child links from Fusion with reference resolution | Parents sync before children | Handling of orphaned/missing parents? |
| ROM-002 | F465 — Account Hierarchy | (same) | High | Configuration | NA | Model Driven App Changes (hierarchy navigation in app) | L2 | 0 | 1 | 0 | 0 | Add hierarchy entry/view to sitemap | None | None |
| ROM-003 | F542 — Contact Multi-Account | Sync contact once and relate to multiple accounts/locations | High | Customization | NA | CRM Existing Entity C&UT (Contact: N:N to Account/Location) | L2 | 0 | 0 | 1 | 0 | Add N:N relationship Contact ↔ Account (and Contact ↔ Location if distinct); sub-grids; views | Location assumed pre-existing | Is "Location" a separate entity, sub-account, or address record? |
| ROM-003 | F542 — Contact Multi-Account | (same) | High | Integration | Batch | Integration (Fusion → D365 Contact + multi-relationship sync) | L2 | 0 | 0 | 1 | 0 | Sync contact with dedup logic and resolution of multiple account/location relationships | Fusion holds canonical contact id | Dedup key (email, party id, custom)? |
| ROM-004 | F547 — Region on Service Account | View region on Service Account for filtering and views | Medium | Customization | NA | CRM Existing Entity C&UT (Service Account: Region field + filtered views) | L2 | 0 | 1 | 0 | 0 | Add Region lookup/option to Service Account; region-filtered views | None | Option set or lookup entity for Region? |
| ROM-004 | F547 — Region on Service Account | (same) | Medium | Configuration | NA | CRM Master Data Preparation (Region master values) | L2 | 1 | 0 | 0 | 0 | Small lookup table or option set populated with project regions | Small fixed set of regions | Master ownership — Fusion or D365? |
| ROM-004 | F547 — Region on Service Account | (same) | Medium | Integration | Batch | Integration (Fusion → D365 Region attribute sync) | L2 | 0 | 1 | 0 | 0 | Sync region attribute on Service Account from Fusion | Region as Fusion attribute | If region is separate Fusion master, may escalate |
| ROM-005 | Cross-cutting — Read-only AC | Block edits to Fusion-sourced read-only fields; show localized validation message loaded from per-culture RESX (Constitution §15) | High | Customization | NA | Add'l Javascript on Entity (Account: read-only handler + RESX bridge) | L2 | 0 | 0 | 1 | 0 | Shared JS validation library reading per-culture RESX; registered on Account form save | Library cost loaded into first entity | Client-side only, or also plugin-side? |
| ROM-005 | Cross-cutting — Read-only AC | (same) | High | Customization | NA | Add'l Javascript on Entity (Contact: read-only handler) | L2 | 0 | 1 | 0 | 0 | Re-use of shared validation library; entity-specific registration only | Library already built in row above | None |
| ROM-005 | Cross-cutting — Read-only AC | (same) | High | Customization | NA | HTML WebResource (per-culture RESX bundle + loader) | L2 | 0 | 1 | 0 | 0 | Web resource hosting localized strings consumed by JS validation library | ≤ 3 cultures assumed | Which cultures must ship on Day 1? |

---

## Grand Total

| Module | Inventory Rows | Simple | Medium | Complex | Very Complex | Build Hrs |
|---|---:|---:|---:|---:|---:|---:|
| Customer Master Sync (Fusion → D365) | 13 | 1 | 5 | 7 | 0 | 62 |
| **Total** | **13** | **1** | **5** | **7** | **0** | **62** |

---

## Requirement Level Summary

| Level | Meaning | Rows | % |
|---|---|---:|---:|
| L5 | Fully Detailed | 0 | 0% |
| L4 | High Confidence | 0 | 0% |
| L3 | Medium Confidence | 0 | 0% |
| L2 | Low Confidence | 13 | 100% |
| L1 | Placeholder | 0 | 0% |
| **Total** | | **13** | **100%** |

---

## Estimation Level Notes

| Feature | Estimation Level Used | Rationale |
|---|---|---|
| F466 — Bill-to ↔ Ship-to | ROM | Only ROM exists; user-story input with limited acceptance criteria |
| F465 — Account Hierarchy | ROM | Only ROM exists |
| F542 — Contact Multi-Account | ROM | Only ROM exists |
| F547 — Region on Service Account | ROM | Only ROM exists |
| Cross-cutting Read-only AC | ROM | Derived from shared negative AC across all features |

> **ROM Uncertainty:** This deliverable carries ±40% uncertainty. Tighten to ±20% via `/estimate-spec` once open questions are resolved.
