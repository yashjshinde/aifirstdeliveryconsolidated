# Module Overall Hours — Estimation Deliverable

> **Source:** `module-build-hrs.md` (Grand Total per module)
> **Formulas applied per constitution/22-estimation-rules.md:**
> - Plan & Design Hrs = Org Build & UT Hrs × 0.20
> - Test Creation Hrs = Org Build & UT Hrs × 0.25
> - Test Execution Hrs = Org Build & UT Hrs × 0.35
> - Dev Fix Hrs = Org Build & UT Hrs × 0.35
> - Deployment Hrs = Org Build & UT Hrs × 0.15
> - Total Project Hrs = Sum of all phase columns (Build × 2.30)

---

## Module Overall Hours Table

| Module / Feature | Org Build & UT Hrs | Plan & Design Hrs | Test Creation Hrs | Test Execution Hrs | Dev Fix Hrs | Deployment Hrs | Total Project Hrs |
|---|---:|---:|---:|---:|---:|---:|---:|
| Customer Master Sync (Fusion → D365) | 62 | 12.4 | 15.5 | 21.7 | 21.7 | 9.3 | **142.6** |
| **Total** | **62** | **12.4** | **15.5** | **21.7** | **21.7** | **9.3** | **142.6** |

---

## Summary Notes

| Item | Value |
|---|---|
| Total Requirements Analysed | 5 (4 source user stories + 1 cross-cutting requirement) |
| Total Inventory Rows Created | 13 |
| Total Modules | 1 |
| Total Org Build & UT Hours | 62 Hrs |
| Total Project Hours (all phases) | ~142.6 Hrs |
| Estimation Level | ROM (only ROM estimate exists; ±40% uncertainty) |
| Estimation Method | Factor-Based (constitution/20-factor-definitions.md) |

---

## Key Assumptions & Open Questions Summary

### Critical Open Questions (must be resolved before Build phase)

1. Is Bill-to vs Ship-to modeled as separate Account *types* (option set) or distinct entities?
2. What is the Fusion → D365 sync frequency and volume (real-time vs scheduled batch)?
3. Are there custom roll-up fields, KPIs, or hierarchy-related computations required on the Account hierarchy?
4. How are orphaned or missing parents handled when child accounts sync before parents?
5. Is "Location" (in F542) a separate entity, a sub-account record, or simply an address?
6. What is the contact deduplication key (email, Fusion party id, custom)?
7. Are region values a fixed option set or a maintained lookup entity?
8. Who owns Region master data — Fusion (sync into D365) or D365 (manual maintenance)?
9. Is read-only field enforcement client-side only, or also enforced server-side via plugin?
10. Which cultures/locales must the RESX bundle support on Day 1?
11. Does "Constitution §15" reference an existing internal standard for localized validation, or is this a new pattern to be defined?
12. Are there security roles, sharing rules, or BU-scoped access patterns required for the synced data?
13. Is the integration platform (ADF, Logic Apps, Azure Functions, dual-write) decided?

### Key Assumptions Made

- Brownfield mode is **disabled** per `constitution/10-project-configuration.md` — standard rates applied with no rate adjustment.
- All four user stories belong to a single module: *Customer Master Sync (Fusion → D365)*.
- All requirements are L2 (Low Confidence) — unstructured user-story input with brief acceptance criteria.
- Sync direction is one-way **Fusion → D365**.
- Read-only field enforcement is delivered as a shared JS web resource + per-culture RESX bundle; library cost is loaded into the first entity row (Account), subsequent entities re-use it.
- Account hosts both Bill-to/Ship-to relationship and the parent hierarchy — re-uses out-of-box hierarchy feature.
- Region is modeled as a small option set or lookup table; treated as Simple master data prep.
- "Location" in F542 is assumed pre-existing (custom entity, sub-account, or address) — no new entity build.
- Integration is **batch**; real-time would escalate Integration rows from Medium/Complex to Complex/Very Complex.
- No new security roles, PCF controls, plugins, Power Automate flows, business rules, or reports inferred.
- All rates sourced from `constitution/21-factor-rates.md`; phase multiplier of **× 2.30** sourced from `constitution/22-estimation-rules.md`.
- No new factors required — `factors-status: CLEAN`. No `/factors-review` gate applies.
