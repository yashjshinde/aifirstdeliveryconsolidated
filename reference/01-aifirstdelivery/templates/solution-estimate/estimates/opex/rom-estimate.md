---
estimation-level: ROM
project: opex
date: 2026-05-13
status: DRAFT
brownfield: false
factors-status: CLEAN
---

# ROM Estimate — opex

## Section 1 — ROM Summary

| Item | Value |
|---|---|
| Estimation Level | ROM |
| Input Source | C:\Users\amit.mudgal\source\repos\Opex\DetailsForEstimation.xlsm (Sheet3, 4 user stories) |
| Total Modules | 1 |
| Total Requirements | 5 |
| Total Inventory Rows | 13 |
| Total Build Hrs (rough) | 62 |
| Total Project Hrs (rough) | 142.6 |
| Confidence | Low — L2 requirements; estimate refines after `/estimate-spec` (±20%) or `/estimate-plan` (±10%) |

> **ROM Uncertainty:** This estimate is ±40% due to unstructured input. Confidence refines after `/estimate-spec` (±20%) or `/estimate-plan` (±10%).

## Section 2 — Requirement Level Distribution

| Level | Count | % |
|---|---:|---:|
| L1 — Placeholder | 0 | 0% |
| L2 — Low Confidence | 5 | 100% |

## Section 3 — Module Summaries

**Module: Customer Master Sync (Fusion → D365)**

| Req ID | Module / Feature | Req Title | Priority | Fitment | Type of Integration | Inventory | Req Level | Simple | Medium | Complex | Very Complex | Solution / Rationale | Assumptions / Comments | Open Questions |
|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|
| ROM-001 | F466 — Bill-to ↔ Ship-to | As a System/Operations Admin, sync Bill-to (billing account) ↔ Ship-to (service account) relationship from Fusion to D365 | High | Customization | NA | CRM Existing Entity C&UT (Account: Bill-to/Ship-to relationship) | L2 | 0 | 0 | 1 | 0 | Model 1:N self-referencing Bill-to → Ship-to relationship on Account entity; new lookups, sub-grid, and views | Re-uses existing Account entity; no new entity required | Is Bill-to vs Ship-to modeled as separate account types (option set) or distinct entities? |
| ROM-001 | F466 — Bill-to ↔ Ship-to | (same) | High | Integration | Batch | Integration (Fusion → D365 Bill-to/Ship-to relationship sync) | L2 | 0 | 0 | 1 | 0 | One-way batch integration carrying relationship data with mapping/transformation | Assumed one-way Fusion → D365; volume not specified | Frequency and volume of sync? Real-time or scheduled batch? |
| ROM-002 | F465 — Account Hierarchy | As a Customer Manager, view hierarchy on Accounts so multiple service accounts under one organization are related | High | Configuration | NA | CRM Existing Entity C&UT (Account: parent_accountid hierarchy + hierarchy view) | L2 | 0 | 0 | 1 | 0 | Configure parent_accountid hierarchy, hierarchy view, hierarchy icon | Re-uses out-of-box hierarchy feature on Account | Does hierarchy require custom roll-up fields or KPIs? |
| ROM-002 | F465 — Account Hierarchy | (same) | High | Integration | Batch | Integration (Fusion → D365 hierarchy parent-link sync) | L2 | 0 | 0 | 1 | 0 | Sync parent → child account links from Fusion with reference-resolution logic | Assumes parent records always sync before children | How are orphaned/missing parents handled? |
| ROM-002 | F465 — Account Hierarchy | (same) | High | Configuration | NA | Model Driven App Changes (hierarchy navigation in app) | L2 | 0 | 1 | 0 | 0 | Add hierarchy entry/view to app sitemap | — | — |
| ROM-003 | F542 — Contact Multi-Account | As a System, sync contact once and relate to multiple accounts/locations | High | Customization | NA | CRM Existing Entity C&UT (Contact: N:N to Account/Location) | L2 | 0 | 0 | 1 | 0 | Add N:N relationship between Contact ↔ Account (and Contact ↔ Location if Location is distinct); new sub-grids and views | Assumes Location is an existing custom entity or a sub-account | Is "Location" a separate entity, sub-account, or address record? |
| ROM-003 | F542 — Contact Multi-Account | (same) | High | Integration | Batch | Integration (Fusion → D365 Contact + multi-relationship sync) | L2 | 0 | 0 | 1 | 0 | Sync contact with deduplication logic and resolution of multiple account/location relationships | Assumes Fusion holds the canonical contact identifier | What is the dedup key (email, Fusion party id, etc.)? |
| ROM-004 | F547 — Region on Service Account | As a Customer Manager, view region on Service Account so region is available for filtering and views | Medium | Customization | NA | CRM Existing Entity C&UT (Service Account: Region field + filtered views) | L2 | 0 | 1 | 0 | 0 | Add Region lookup/option to Service Account; create region-filtered views | — | Are region values fixed (option set) or maintained data (lookup entity)? |
| ROM-004 | F547 — Region on Service Account | (same) | Medium | Configuration | NA | CRM Master Data Preparation (Region master values) | L2 | 1 | 0 | 0 | 0 | Single lookup table or option set populated with project regions | Assumes a small fixed set of regions | Who owns region master data — Fusion or D365? |
| ROM-004 | F547 — Region on Service Account | (same) | Medium | Integration | Batch | Integration (Fusion → D365 Region attribute sync) | L2 | 0 | 1 | 0 | 0 | Sync region attribute on Service Account from Fusion | Assumes region is an attribute on Fusion's customer record | If region is a separate Fusion master, may upgrade to Complex |
| ROM-005 | Cross-cutting — Read-only AC | Negative AC across all features: block edits to Fusion-sourced read-only fields with localized validation message loaded from per-culture RESX (Constitution §15) | High | Customization | NA | Add'l Javascript on Entity (Account: read-only field handler + RESX bridge) | L2 | 0 | 0 | 1 | 0 | Shared JS validation library reading per-culture RESX strings; registered on Account form save | Pattern is reused across entities; first implementation absorbs library cost | Is enforcement client-side only, or also plugin-side? |
| ROM-005 | Cross-cutting — Read-only AC | (same) | High | Customization | NA | Add'l Javascript on Entity (Contact: read-only field handler) | L2 | 0 | 1 | 0 | 0 | Re-use of shared validation library; entity-specific registration only | Lower complexity because library is built in ROM-005 row 1 | — |
| ROM-005 | Cross-cutting — Read-only AC | (same) | High | Customization | NA | HTML WebResource (per-culture RESX bundle + loader) | L2 | 0 | 1 | 0 | 0 | Webresource hosting localized strings consumed by the JS validation library | Languages list not provided; assumed ≤3 cultures | Which cultures must be supported on Day 1? |

Module total build hrs: **62 hrs**

### Per-row hour derivation (from `constitution/21-factor-rates.md`)

| Req ID | Factor | Complexity | Count | Rate | Hours |
|---|---|---|---:|---:|---:|
| ROM-001 | CRM Existing Entity C&UT | Complex | 1 | 4 | 4 |
| ROM-001 | Integration | Complex | 1 | 10 | 10 |
| ROM-002 | CRM Existing Entity C&UT | Complex | 1 | 4 | 4 |
| ROM-002 | Integration | Complex | 1 | 10 | 10 |
| ROM-002 | Model Driven App Changes | Medium | 1 | 2 | 2 |
| ROM-003 | CRM Existing Entity C&UT | Complex | 1 | 4 | 4 |
| ROM-003 | Integration | Complex | 1 | 10 | 10 |
| ROM-004 | CRM Existing Entity C&UT | Medium | 1 | 2 | 2 |
| ROM-004 | CRM Master Data Preparation | Simple | 1 | 1 | 1 |
| ROM-004 | Integration | Medium | 1 | 6 | 6 |
| ROM-005 | Add'l Javascript on Entity | Complex | 1 | 4 | 4 |
| ROM-005 | Add'l Javascript on Entity | Medium | 1 | 2 | 2 |
| ROM-005 | HTML WebResource | Medium | 1 | 3 | 3 |
| **Total Build Hrs** | | | | | **62** |
| **Total Project Hrs** (× 2.30) | | | | | **142.6** |

## Section 4 — Open Questions

1. Is Bill-to vs Ship-to modeled as separate Account *types* (option set) or distinct entities in scope?
2. What is the Fusion → D365 sync frequency and volume (real-time vs scheduled batch)?
3. Are there custom roll-up fields, KPIs, or hierarchy-related computations required on the Account hierarchy?
4. How are orphaned or missing parents handled when child accounts sync before parents?
5. Is "Location" (in F542) a separate entity, a sub-account record, or simply an address?
6. What is the contact deduplication key (email, Fusion party id, custom)?
7. Are region values a fixed option set or a maintained lookup entity?
8. Who owns Region master data — Fusion (sync into D365) or D365 (manual maintenance)?
9. Is the read-only field enforcement client-side only, or also enforced server-side via plugin?
10. Which cultures/locales must the RESX bundle support on Day 1?
11. Does "Constitution §15" point to an existing internal standard for localized validation, or is this a new pattern to be defined?
12. Are there security roles, sharing rules, or BU-scoped access patterns required for the synced data?
13. Is the integration platform (ADF, Logic Apps, Azure Functions, dual-write) decided?

## Section 5 — Key Assumptions

1. Brownfield mode is **disabled** per `constitution/10-project-configuration.md` (`brownfield.enabled: false`) — standard rates applied, no rate adjustments.
2. All four user stories belong to a single module: *Customer Master Sync (Fusion → D365)*.
3. All requirements are L2 (Low Confidence) — unstructured user-story input with brief acceptance criteria; none are title-only (so no L1).
4. Sync direction is one-way **Fusion → D365** (no reverse sync inferred).
5. Read-only field enforcement is delivered as a **shared JS web resource + per-culture RESX bundle**; complexity is loaded into the first entity row (Account) with subsequent entities re-using the library.
6. Account entity hosts both Bill-to/Ship-to relationship modeling and the parent hierarchy — re-uses out-of-box account hierarchy feature.
7. Region is modeled as either a small option set or a small lookup table; treated as **Simple** master data prep.
8. "Location" in F542 is assumed to be an existing concept (custom entity, sub-account, or address) — no new entity build is estimated.
9. Integration is **batch**; if real-time is required, Integration rows escalate from Medium/Complex to Complex/Very Complex.
10. No new security roles, PCF controls, plugins, Power Automate flows, business rules, or reports are inferred from the input.
11. All rates sourced from `constitution/21-factor-rates.md`; phase multiplier of **× 2.30** sourced from `constitution/22-estimation-rules.md`.
12. No new factors were required — `factors-status: CLEAN`.
