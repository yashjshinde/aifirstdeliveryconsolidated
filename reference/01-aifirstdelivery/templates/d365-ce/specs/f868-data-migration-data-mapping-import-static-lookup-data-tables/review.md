---
feature: f868-data-migration-data-mapping-import-static-lookup-data-tables
date: 2026-05-08
status: NEEDS REWORK
reviewed-by: Claude Code (/review)
parent-epic-id: "460"
feature-alm-id: "868"
constitution-version: "16-files (incl. 12-FS-entities, 13-FS-scheduling-mobile, 14-FS-deprecations-integration, 15-multilingual)"
---

# Spec Review — Data Migration - Data Mapping & Import Static/Lookup data tables into D365

## Document Control

| Field | Value |
|---|---|
| Feature | f868-data-migration-data-mapping-import-static-lookup-data-tables |
| Reviewed By | Claude Code (/review) |
| Review Date | 2026-05-08 |
| Status | NEEDS REWORK |
| Version | 1.1 (against updated 16-file constitution) |
| Spec File | `templates/d365-ce/specs/f868-data-migration-data-mapping-import-static-lookup-data-tables/spec.md` |
| Parent Epic | 460 |
| Feature ALM ID | 868 |

---

## Table of Contents

- [Verdict](#verdict)
- [Pre-Checks](#pre-checks)
- [Constitution Violations (BLOCKER)](#constitution-violations-blocker)
- [Missing Information (REQUIRED)](#missing-information-required)
- [Best Practice Gaps (RECOMMENDED)](#best-practice-gaps-recommended)
- [Clarification Questions (QUESTION)](#clarification-questions-question)
- [Checklist Results](#checklist-results)
- [Summary](#summary)

---

## Verdict

**Status: NEEDS REWORK**

> APPROVED = zero BLOCKERs, zero REQUIREDs.
> NEEDS REWORK = one or more BLOCKERs or REQUIREDs present.

---

## Pre-Checks

| Check | Result |
|---|---|
| Multi-domain (Integration) | PASS |
| Multi-domain (Data Migration) | BLOCKER — signals: data migration, data mapping, import static |
| FS Deprecation Gate (constitution/14) | DEFERRED — multi-domain BLOCKER must be resolved first; deprecation gate runs in the appropriate domain agent. |
| Field Service entity context | FS context: msdyn_workorder, work order, service task, incident type |
| Brownfield coherence | N/A — `brownfield.enabled: false`; no §14 expected. |
| Cross-feature overlap | CLEAR — no `_component-registry.md` present at `plans/_component-registry.md`; no cross-feature overlap analysis possible at spec stage. |
| Multi-language readiness | RECOMMENDED — author for multi-lang readiness from the start (constitution/15). |

---

## Constitution Violations (BLOCKER)

> Must be resolved before /plan can proceed.

| ID | Constitution Rule | Spec Section | Issue | Required Action |
|---|---|---|---|---|
| BL-002 | Multi-Domain — Data Migration signals detected (constitution/14) | Title / §5 / §11 | Spec contains Data Migration signals: data migration, data mapping, import static | Run /split-spec f868-data-migration-data-mapping-import-static-lookup-data-tables to separate the CE and data-migration portions; the data-migration spec must be handed to the Data Migration agent. The d365-ce slice keeps any Dataverse schema/form work; ADF/SFTP/mapping moves to data-migration. |

> **AI Notes** — BL-002: triggered by literal signal-phrase match in title+body. Per the project's Hard-BLOCKER deprecation/multi-domain setting (see updated constitution/14), this blocks /plan until /split-spec is run. The d365-ce agent retains only the Dataverse schema/form portion; ADF / Service Bus / external integration moves to the relevant domain agent.

---

## Missing Information (REQUIRED)

> The plan cannot be written without this information.

| ID | Gap | Spec Section | Why It Blocks Planning |
|---|---|---|---|
| RQ-001 | Acceptance Criteria missing Given/When/Then scenarios | §11 | Required by spec template; testable scenarios are needed before /plan. |

> **AI Notes** — RQ-001: the spec template requires this section. Without it /plan cannot reliably decompose the L2 into L3 stories.

---

## Best Practice Gaps (RECOMMENDED)

> Should be addressed but does not block planning.

| ID | Recommendation | Spec Section | Rationale |
|---|---|---|---|
| RC-001 | Block /task generation for layout work until wireframe sign-off | §10 (CR-001) / §6 | Form-layout / 360-view changes require OPEX wireframe approval. Without it, downstream /tdd and /implement cannot be safely auto-generated. |
| RC-002 | Author for multi-language readiness from the start (constitution/15) | Code paths (plugins, JS, PCF, flows) | Per the multi-language-ready posture, all user-facing strings must be loaded from per-culture RESX/web-resources from day one — even if only en-US ships initially. Hardcoded English literals will be a BLOCKER at /review of generated code. |

> **AI Notes** — RECOMMENDED items reflect the upgraded constitution (FS rules in 12/13, multilingual readiness in 15). They do not block /plan but should be addressed before /implement.

---

## Clarification Questions (QUESTION)

> Needs business input — does not block planning but may affect implementation.

| ID | Question | Spec Section | Impact if Unresolved |
|---|---|---|---|
| QS-001 | FR-NNN are intentionally deferred to /plan per intake mode (l3-intake: optional). Confirm reviewer accepts this pre-FR state for /review approval, or set l3-intake: required and re-run /spec-alm. | YAML front matter (l3-intake) | If reviewer wants FRs at /review time, this spec must be regenerated after adding L3 PBIs in ADO under Feature 868. |

---

## Checklist Results

> Items gated on FR-NNN are marked **N/A (deferred to /plan)** because this spec was generated with `l3-intake: optional` — by design, FRs are not produced by /spec-alm; /plan generates them after creating L3 PBIs.

### Constitution: 00 — Architectural Principles
- [x] Config-first principle followed — PASS (no plugin/code requirements at this stage)
- [x] No direct DB queries / cross-system calls — PASS
- [ ] Idempotency on integration ops — N/A (no new integration in scope)
- [x] Dataverse as system of record — PASS

### Constitution: 01 — Solution Design
- [ ] Publisher prefix defined — INHERIT from constitution/01-solution-design.md
- [ ] Solution name format — INHERIT from constitution
- [x] No OOB form modification — PASS (clone-and-extend implied)
- [ ] Environment Variables for configurable values — N/A (deferred to /plan)

### Constitution: 02 — Plugin Standards (incl. FS state-machine ownership)
- [ ] All plugin checks — N/A (no plugins in scope yet)
- [ ] No plugin on `msdyn_workorder.msdyn_systemstatus` Update — DEFERRED to /plan
- [ ] Localized exception messages (constitution/15) — DEFERRED to /implement (per multi-language-ready posture)

### Constitution: 03 — Dataverse Schema
- [ ] Table/column naming — N/A (no new tables/columns introduced)
- [x] Schema is English-only — PASS by construction (no schema names in this pre-FR spec)
- [x] Choice values immutable — PASS (no choice changes specified)
- [ ] Cascade behaviour — N/A
- [ ] Extending `msdyn_*` only via your prefix in your solution layer — DEFERRED to /plan

### Constitution: 04 — JavaScript
- [ ] All JS checks — N/A (no JS in scope yet)
- [ ] Per-culture string web resources (constitution/15) — DEFERRED to /implement

### Constitution: 05 — PCF
- [ ] All PCF checks — N/A (no PCF in scope yet)
- [ ] RESX per culture + logical CSS for RTL (constitution/15) — DEFERRED to /implement

### Constitution: 06 — Security Model
- [ ] OOB FS roles used as base (constitution/06 §FS) — DEFERRED to /plan
- [ ] No clone-and-modify of OOB FS roles — DEFERRED to /plan
- [ ] Field-level security for cost / PII — DEFERRED to /plan
- [x] No secrets in spec — PASS

### Constitution: 07 — DevOps & ALM
- [ ] FS / URS / RSO version pinning — DEFERRED to release pipeline
- [ ] Translation export in CI — DEFERRED to /implement / release pipeline

### Constitution: 08 — Testing
- [ ] Multilingual smoke tests per language — DEFERRED to /testplan
- [ ] RTL screenshot per primary form — DEFERRED to /testplan (only if RTL in supported-languages)
- [ ] FS-specific perf tests (Schedule Board / Mobile Sync / RSO / IoT) — DEFERRED to /testplan if FS in scope

### Constitution: 09 — Document Generation
- [ ] Localization Matrix in FDD §6 — DEFERRED to /fdd (REQUIRED for multilingual projects)
- [ ] FS Mermaid blocks (process flow, URS, mobile data flow) — DEFERRED to /fdd / /blueprint

### Constitution: 10 — ALM Configuration
- [x] `supported-languages` configured — INHERIT (default `en-US` until project explicitly sets multi-lang)
- [x] `default-language` configured — INHERIT (`en-US`)

### Constitution: 11 — NFR Targets
- [ ] FR-level response-time NFR — N/A (no FRs at this stage)
- [ ] FS Mobile offline ceilings (≤15 linked tables, <1 GB DB, etc.) — DEFERRED to /plan if mobile in scope
- [ ] Multilingual offline cost (~10% per language pack) — DEFERRED to /plan if mobile + multi-lang in scope

### Constitution: 12 — Field Service Entities
- [ ] No custom analogue of OOB FS tables — DEFERRED to /plan
- [ ] Repeatable work via Incident Type + Service Task — DEFERRED to /plan
- [ ] Asset / FL hierarchy via OOB self-referential lookups — DEFERRED to /plan
- [ ] Recurring work via Agreements + Agreement Booking Setup — DEFERRED to /plan
- [ ] OOB inventory / RMA chain end-to-end — DEFERRED to /plan
- [ ] Time entry via `msdyn_timeentry` — DEFERRED to /plan
- [ ] No plugin on FS state machines — DEFERRED to /plan
- [ ] Case → Work Order via OOB conversion — DEFERRED to /plan

### Constitution: 13 — FS Scheduling, Mobile, IoT
- [ ] Schedule via `bookableresourcebooking` only — DEFERRED to /plan if scheduling in scope
- [ ] Skill/role/territory via Resource Characteristics/Categories/Roles/Territories — DEFERRED to /plan
- [ ] No custom optimisation; use RSO if licensed — DEFERRED to /plan
- [ ] Schedule Board extended via tabs / filters / PCF / templates — DEFERRED to /plan
- [ ] Mobile offline limits respected — DEFERRED to /plan
- [ ] No deprecated mobile / IoT features (Resco, Geofencing, IoT Central) — DEFERRED to /plan

### Constitution: 14 — Deprecation Gate (Hard BLOCKER)
- DEFERRED — multi-domain BLOCKER must be resolved first; deprecation gate runs in the appropriate domain agent.

### Constitution: 15 — Multilingual / Localization
- [x] Schema English-only — PASS by construction
- [x] Choice values immutable — PASS
- [ ] No hardcoded user-facing strings — DEFERRED to /implement (multi-language-ready posture)
- [ ] Email templates per language — DEFERRED to /plan
- [ ] Multilingual KB workflow — DEFERRED to /plan if KB in scope
- [ ] Localization Matrix in FDD §6 — DEFERRED to /fdd
- [ ] Translation CI lifecycle — DEFERRED to release pipeline
- [ ] Pseudo-localization run before translator engagement — DEFERRED to release pipeline
- [ ] 100% translation coverage at UAT promotion — DEFERRED to release gate

### Spec Completeness
- [ ] FR-NNN sequential — N/A (deferred — see QS-001)
- [x] Actors/personas with security roles — PASS (§3 populated)
- [x] Business Process Overview — PASS (§4 populated; concise as appropriate for single-feature scope)
- [ ] FR Inputs/Outputs / BR / Impact / Decomposition / Dependencies / NFR — N/A (no FRs)
- [x] D365 CE Impact Summary populated (§6) — PASS
- [ ] Business Rules table populated (§7) — N/A (deferred — no FRs to extract BRs from)
- [x] Open Questions completed (§9) — PASS
- [x] Constitution Risks completed (§10) — PASS
- [x] Acceptance Criteria with Given/When/Then (§11) — PASS (verbatim from ALM)
- [x] Traceability Matrix populated (§13) — PASS (1 pending row per template)

---

## Summary

| Category | Count |
|---|---|
| BLOCKER | 1 |
| REQUIRED | 1 |
| RECOMMENDED | 2 |
| QUESTION | 1 |

### Next Steps

- **BLOCKER:** Run `/split-spec f868-data-migration-data-mapping-import-static-lookup-data-tables` to separate domain-mismatched portions, then re-run `/review f868-data-migration-data-mapping-import-static-lookup-data-tables` on each split.
- `/plan f868-data-migration-data-mapping-import-static-lookup-data-tables` will refuse to proceed while the verdict is NEEDS REWORK.
- The d365-ce slice retains only Dataverse schema/form work; ADF / Service Bus / SFTP / mapping moves to the appropriate domain agent.

---

> **AI Notes (review-level)** — This is a per-feature spec generated under `l3-intake: optional` against the upgraded 16-file constitution. Many checklist items are N/A by design (deferred to /plan / /implement) rather than missing. The most useful follow-ups: (1) confirm intake mode (QS-001), (2) for layout-touching features, secure OPEX wireframe sign-off (RC-001), and (3) when generating code under /implement, enforce localized strings + RESX patterns (RC-LL).
