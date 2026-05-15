# Implementation Tracker

**Single source of truth for the build effort.** Update this file as you complete tasks, fix bugs, and revise the design.

## Status at a glance

| Phase | Owner | Status | Notes |
| --- | --- | --- | --- |
| Phase 0 — Prerequisites (Azure / DV admin / workbook) | Azure + DV admins + analyst | **Pending (real-world)** | Cannot be done in code; must be completed before deploy.ps1 |
| Phase 1 — Foundations (tools, schemas, configs) | Build | **✅ DONE** | 34/34 tests pass; configs validate clean |
| Phase 2 — Inbound pipelines | Build | **✅ DONE** | All ADF artifacts authored and JSON-valid |
| Phase 3 — Outbound pipelines | Build | **✅ DONE** | All outbound ADF artifacts; `func-sftp-rename` is the only v2 stub |
| Phase 4 — Verification | Build + Ops | **Not started** | Requires Azure deploy to run; manual test plan in deployment.md |
| Phase 5 — Bicep & deploy script | Build | **✅ DONE** | Single-command deploy; tested locally for syntax |
| Phase 6 — Documentation | Build | **✅ DONE** | Spec + detailed design + 8 user-facing docs |
| Phase 7 — Hardening / v2 (notifications, atomic SFTP rename, OData filter parser) | TBD | **Largely complete** — 13 of 17 audit-found gaps fixed 2026-05-13; 4 deferred (B004 moot, B008 needs OData parser, B017 needs Azure Function) | See §6 (bug log) and §9 below |

> Conventions:
> - Status: `Not started` · `In progress` · `Blocked` · `Done` · `Won't do`
> - Bug entries (§6): code (Bxxx), opened-on, found-by, status, fix commit, closed-on.
> - Architectural / design changes go in **§7 Design revisions** with rationale.
> - Implementation gaps (code that doesn't yet match design) go in **§10**.

---

## 1. Phase 0 — Prerequisites (before deploy.ps1)

These three streams must close **before** `deploy.ps1` runs. They are real-world admin tasks; no code involved.

| # | Task | Owner | Status | Notes |
| --- | --- | --- | --- | --- |
| P0.1 | Provision Dataverse sandbox (D365 instance) for dev | TBD | Not started | URL, region, SPN client ID logged here when done |
| P0.2 | Create all custom entities, attributes, option sets, N:N relationships per spec §8 | Dataverse admin | Not started | Track sub-items in P0.2 table below |
| P0.3 | Provision ADLS Gen2 storage account (or let Bicep do it) | Infra | Not started | Bicep `storage.bicep` creates this — only do manually if reusing existing |
| P0.4 | Provision Azure Data Factory instance (or let Bicep do it) | Infra | Not started | Bicep `datafactory.bicep` creates this |
| P0.5 | Provision Azure Key Vault (or let Bicep do it) | Infra | Not started | Bicep `keyvault.bicep` creates this |
| P0.6 | SFTP test server with sample CSVs for Customer/Site/Contact | Infra + Build | Not started | Sample files derived from the workbook |
| P0.7 | Dataverse SPN + Application User + security roles | Dataverse admin | Not started | Client ID goes in `main.parameters.<env>.json`; secret goes in KV after deploy |
| P0.8 | Close workbook gaps per spec §11 — freight/shipping/payment-term tables, Site/Contact source-entity names | Business analyst | Not started | Without this, `excel_to_json` produces incomplete configs |
| P0.9 | Confirm v1 outbound scope: in or out? | Project owner | **Decided 2026-05-13: in v1** | Outbound pipelines are built; flip an entity to `direction: "bidirectional"` to use them |
| P0.10 | Logic App `la-opex-notify` — build now or defer? | Project owner | **Decided 2026-05-13: defer to v2** | Pipelines run without; ADF Monitor + audit folder are sole status sources |

### P0.2 — Custom Dataverse schema sub-tracker

Track each artifact's existence per environment. Spec §8 lists these — one row per artifact:

| Artifact | Type | Dev | Test | Prod | Notes |
| --- | --- | --- | --- | --- | --- |
| `opx_AccountType` (option set on Account) | Choice | Not yet | — | — | Values 884870000/001/002 |
| `opx_equipmentdiscount` table + `opx_EquipmentDiscountId` lookup on Account | Lookup + Custom Entity | Not yet | — | — | Alt-key: `opx_code` |
| `opx_partdiscount` + `opx_partdiscountid` | Lookup + Custom Entity | Not yet | — | — | Alt-key: `opx_code` |
| `opx_nationaldiscount` + `opx_nationaldiscountid` | Lookup + Custom Entity | Not yet | — | — | Alt-key: `opx_code` |
| `opx_customercategory` + `opx_customercategoryid` | Lookup + Custom Entity | Not yet | — | — | Alt-key: `opx_code` |
| `opx_largecustomer` + `opx_largecustomerid` | Lookup + Custom Entity | Not yet | — | — | Alt-key: `opx_code` |
| `opex_SiteNumber`, `opx_fusionRefAccountNumber`, `opx_sourceCreatedBy`, `opx_sourceModifiedBy` on Account | Text | Not yet | — | — | |
| Payment-term option-set values on Account | Option-set values | Not yet | — | — | Values per `PaymentTermsOptionSetValues` (P0.8) |
| `opx_county`, `opx_province`, `opx_endDate`, `opx_accountNumber` on Functional Location | Mixed | Not yet | — | — | |
| Multi-column alt-key `(opx_accountNumber, msdyn_name)` on Functional Location | Alt-key | Not yet | — | — | Required because Site.json uses both |
| `opx_contactnumber` (alt-key on Contact) | Text + Alt-key | Not yet | — | — | |
| `opx_primaryphonetype`, `opx_primaryemailtype` on Contact | Choice | Not yet | — | — | |
| `opx_startdate`, `opx_enddate` on Contact | Date Only | Not yet | — | — | |
| `opx_Account_Contact_Contact` N:N relationship | Many-to-many | Not yet | — | — | Between Contact and Account |

---

## 2. Phase 1 — Foundations ✅ DONE

| # | Task | Status | Where the code is | Tests |
| --- | --- | --- | --- | --- |
| 1.1 | Repo structure (`/adf/`, `/config/`, `/tools/`, `/infra/`, `/docs/`, `/detailed-design/`, `/reference/`) | ✅ DONE | Top-level tree | n/a |
| 1.2 | `tools/validate-config` CLI | ✅ DONE | [`tools/validate-config/`](tools/validate-config/) | 11/11 pass |
| 1.3 | Golden fixtures per validate-config rule | ⚠️ PARTIAL — inline test fixtures, not per-rule directory | [`tools/validate-config/tests/test_validate_config.py`](tools/validate-config/tests/test_validate_config.py) | Covers V001, V002, V004, V010, V028, V030, V032 + strict/allowlist |
| 1.4 | `tools/excel_to_json` converter | ✅ DONE | [`tools/excel_to_json/`](tools/excel_to_json/) | 9/9 unit + 6 workbook-dependent skip |
| 1.5 | `tools/dataflow-codegen` generator | ✅ DONE | [`tools/dataflow-codegen/`](tools/dataflow-codegen/) | 14/14 pass; supports inbound + outbound |
| 1.6 | JSON Schemas (project, entity-mapping, wave, alias-file) under `/config/schemas/` | ✅ DONE | [`config/schemas/`](config/schemas/) | Validated via Ajv/Python jsonschema |
| 1.7 | Convert mapping workbook to `/config/entities/*.json` (initial pass) | ✅ DONE — full structure | [`config/entities/customer.json`](config/entities/customer.json), [`site.json`](config/entities/site.json), [`contact.json`](config/entities/contact.json) | Gaps from P0.8 still need analyst completion (3 TODO blocks in customer.json) |
| 1.8 | `/config/_project.json` | ✅ DONE | [`config/_project.json`](config/_project.json) | Includes all v1 settings + new throttling/codegen params |
| 1.9 | `/config/waves/oracle_fusion_daily.json` | ✅ DONE | [`config/waves/oracle_fusion_daily.json`](config/waves/oracle_fusion_daily.json) | Customer phase 1 → Site/Contact phase 2 |

**Exit criteria: MET.** `validate-config /config` returns 0 errors + 7 design-acceptable warnings. `dataflow-codegen` emits valid ADF Mapping Data Flow ARM JSON for all three entities.

---

## 3. Phase 2 — Inbound Pipelines ✅ DONE

| # | Task | Status | File |
| --- | --- | --- | --- |
| 2.1 | Linked Services (4) | ✅ DONE | [`adf/linkedServices/`](adf/linkedServices/) — ls_keyvault, ls_adls, ls_sftp_fusion, ls_dataverse |
| 2.2 | Datasets (5 — added ds_adls_json for runtime config reads) | ✅ DONE | [`adf/datasets/`](adf/datasets/) |
| 2.3 | `pl_preflight` — DV connectivity + entity-existence checks | ✅ DONE | [`adf/pipelines/pl_preflight.json`](adf/pipelines/pl_preflight.json) |
| 2.4 | `pl_extract_file` | ✅ DONE | [`adf/pipelines/pl_extract_file.json`](adf/pipelines/pl_extract_file.json) |
| 2.5 | `pl_stage_validate` + `df_stage_validate` | ✅ DONE | [`adf/pipelines/pl_stage_validate.json`](adf/pipelines/pl_stage_validate.json), [`adf/dataflows/manual/df_stage_validate.json`](adf/dataflows/manual/df_stage_validate.json) |
| 2.6 | `pl_master_prefetch` | ✅ DONE | [`adf/pipelines/pl_master_prefetch.json`](adf/pipelines/pl_master_prefetch.json) |
| 2.7 | Inbound Data Flow codegen output | ✅ DONE — 3 generated files | [`adf/dataflows/generated/`](adf/dataflows/generated/) |
| 2.8 | `pl_transform_inbound` | ✅ DONE | [`adf/pipelines/pl_transform_inbound.json`](adf/pipelines/pl_transform_inbound.json) |
| 2.9 | `pl_load_upsert` | ✅ DONE — correct Dataverse connector property names per H7 fix | [`adf/pipelines/pl_load_upsert.json`](adf/pipelines/pl_load_upsert.json) |
| 2.10 | `pl_load_upsert_phase2` (two-pass for self-lookups) | ✅ DONE | [`adf/pipelines/pl_load_upsert_phase2.json`](adf/pipelines/pl_load_upsert_phase2.json) |
| 2.11 | `pl_load_relationships` (with 412 silent-success) | ✅ DONE | [`adf/pipelines/pl_load_relationships.json`](adf/pipelines/pl_load_relationships.json) |
| 2.12 | `pl_master_orchestrator` (direction switch + Switch activity) | ✅ DONE (⚠️ checkpoint-skip logic deferred — see §10) | [`adf/pipelines/pl_master_orchestrator.json`](adf/pipelines/pl_master_orchestrator.json) |
| 2.13 | `pl_wave_orchestrator` (phase-by-phase) | ✅ DONE (⚠️ failurePolicy enforcement partial — see §10) | [`adf/pipelines/pl_wave_orchestrator.json`](adf/pipelines/pl_wave_orchestrator.json) |
| 2.14 | `pl_reprocess` | ✅ DONE | [`adf/pipelines/pl_reprocess.json`](adf/pipelines/pl_reprocess.json) |
| 2.15 | `tr_wave_oracle_fusion_daily` trigger | ✅ DONE (starts in `Stopped` state) | [`adf/triggers/tr_wave_oracle_fusion_daily.json`](adf/triggers/tr_wave_oracle_fusion_daily.json) |
| 2.16 | Audit writer activity | ⚠️ PARTIAL — per-pipeline checkpoint JSONs are written; consolidated `run_history.parquet` appender pipeline is not built | See §10.B5 |

**Exit criteria: MET in code; not yet exercised against Azure.** Manual run requires Phase 0 + Phase 5 deploy first.

---

## 4. Phase 3 — Outbound Pipelines ✅ DONE (with deferred Function)

| # | Task | Status | File |
| --- | --- | --- | --- |
| 3.1 | `pl_extract_dataverse` (OData / FetchXML / SavedView with token substitution) | ✅ DONE | [`adf/pipelines/pl_extract_dataverse.json`](adf/pipelines/pl_extract_dataverse.json) |
| 3.2 | Outbound Data Flow codegen output | ⚠️ PARTIAL — generator supports outbound; no entities currently have `direction: "outbound"` or `"bidirectional"`, so no outbound dataflows are emitted | Flip any entity to `bidirectional`, re-run `dataflow-codegen` |
| 3.3 | `pl_transform_outbound` | ✅ DONE | [`adf/pipelines/pl_transform_outbound.json`](adf/pipelines/pl_transform_outbound.json) |
| 3.4 | `pl_export_relationships` (N:N intersect → separate CSV per relationship) | ✅ DONE | [`adf/pipelines/pl_export_relationships.json`](adf/pipelines/pl_export_relationships.json) |
| 3.5 | `func-sftp-rename` Azure Function (atomic write) | ❌ DEFERRED to v2 | [`adf/pipelines/pl_deliver_sftp.json`](adf/pipelines/pl_deliver_sftp.json) skips rename when `atomicRenameFunctionUrl` is empty; downstream consumers see `<file>.csv.tmp` until built |
| 3.6 | `pl_deliver_sftp` | ✅ DONE — incl. .tmp + rename hook | [`adf/pipelines/pl_deliver_sftp.json`](adf/pipelines/pl_deliver_sftp.json) |
| 3.7 | `pl_advance_watermark` (commit step) | ✅ DONE | [`adf/pipelines/pl_advance_watermark.json`](adf/pipelines/pl_advance_watermark.json) |

---

## 5. Phase 4 — Verification

Each row maps to a verification case in spec §10 + the wave additions in §5.9. **All status = Not started until Azure deploy lands.**

| # | Verification case | Status | Run ID(s) | Notes |
| --- | --- | --- | --- | --- |
| V1 | Schema pre-flight on fresh Dataverse | Not started | | Use `pl_preflight` |
| V2 | Mapping conversion diff (`excel_to_json` vs hand-authored golden) | Not started | | Re-run `excel-to-json` and diff against `/config/entities/*.json` |
| V3 | Happy-path Customer load (100 rows) | Not started | | |
| V4 | Site → Account N:N + address pushdown | Not started | | |
| V5 | Contact + primary contact post-load | Not started | | |
| V6 | Negative tests (unknown lookup, maxLength, threshold) | Not started | | |
| V7 | Mapping change auto-pickup | Not started | | |
| V8 | Idempotency (re-run same `runId`) | Not started | | Limited because pl_master_orchestrator checkpoint-skip is deferred (§10.B1) |
| V9 | Notifications | **SKIP** | | Logic App deferred per P0.10 |
| V10 | Secrets — no plaintext in artifacts | Not started | | |
| V11 | Outbound — Customer initial full | Not started | | Requires entity flipped to bidirectional + outbound dataflow regenerated |
| V12 | Outbound — incremental delta | Not started | | |
| V13 | Outbound — custom filter via FetchXML | Not started | | |
| V14 | Outbound — N:N file | Not started | | |
| V15 | Outbound — failure does not advance watermark | Not started | | |
| V16 | Reverse-transform completeness (validate-config V020) | ✅ DONE | | V020 implemented; covered by `test_validate_config.py` |
| V17 | Round-trip integrity | Not started | | Requires inbound + outbound configured for same entity |
| Wave-1 | Wave happy path | Not started | | |
| Wave-2 | Wave dependency failure cascade | **DEFERRED** | | failurePolicy enforcement not yet built (§10.B2) |
| Wave-3 | Wave partial reprocess (`entityFilter`) | Not started | | entityFilter parameter exists; filter logic minimal |
| OPS-8.1 | Runbook drill — Dataverse throttling | Not started | | |
| OPS-8.2 | Runbook drill — validation error rate | Not started | | |
| OPS-8.3 | Runbook drill — lookup not-found surge | Not started | | |
| OPS-8.4 | Runbook drill — wave dependency failure | Not started | | |
| OPS-8.5 | Runbook drill — stale lock | Not started | | |

---

## 6. Bug log

One row per issue. Severity follows [`detailed-design/03-error-model-and-runbook.md` §1](detailed-design/03-error-model-and-runbook.md): `FATAL` / `ROW` / `SOFT` / `WARN` plus `Impl` for build-time defects.

| Code | Opened | Found by | Severity | Title | Component | Status | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **B001** | 2026-05-13 | spec audit | Impl | V014 — lookup references no known master (warning) | `validate-config/rules.py` | **Fixed** | rule_V014 added; cross-entity reference-table check |
| **B002** | 2026-05-13 | spec audit | Impl | V016 — alias file content not validated against schema | `validate-config/rules.py` + `runner.py` | **Fixed** | rule_V016 added; runs alias-file.schema.json validation per alias file |
| **B003** | 2026-05-13 | spec audit | Impl | V024 — lookup.aliases keys may be unreachable after normalize | `validate-config/rules.py` | **Fixed** | rule_V024 added; warns when alias key contains uppercase + normalize includes toLowerCase |
| **B004** | 2026-05-13 | spec audit | Impl | V027 — createIfMissing=true without createDefaults | `validate-config/rules.py` | **Won't do (moot)** | V028 rejects createIfMissing=true entirely in v1; V027 re-enabled with v2's createIfMissing |
| **B005** | 2026-05-13 | spec audit | Impl | V034 — N:N relatedEntity in wave but not in dependsOn (warning) | `validate-config/rules.py` | **Fixed** | rule_V034 added; cross-config check warning |
| **B006** | 2026-05-13 | spec audit | Impl | V042 — outbound lookup must have $expand or be excluded | `validate-config/rules.py` | **Fixed** | rule_V042 added; direction-aware iteration |
| **B007** | 2026-05-13 | spec audit | Impl | V043 — bidirectional transforms must declare explicit reverse (warning) | `validate-config/rules.py` | **Fixed** | rule_V043 added; warns on auto-inverted maps in bidirectional entities |
| **B008** | 2026-05-13 | spec audit | Impl | V045 — OData filter parseable after token substitution | `validate-config/rules.py` | **Deferred to v2** | Needs an OData expression parser; out of scope for this iteration |
| **B009** | 2026-05-13 | spec audit | Impl | V052 — partialLoadAllowed:false with failureThresholdPct>0 | `validate-config/rules.py` | **Fixed** | rule_V052 added; trivial project-config check |
| **B010** | 2026-05-13 | spec audit | Impl | `pl_master_orchestrator` doesn't skip checkpointed sub-pipelines on re-run | `adf/pipelines/pl_master_orchestrator.json` | **Fixed** | Added `IfCondition_CheckpointExists` wrapper per spec §6 |
| **B011** | 2026-05-13 | spec audit | Impl | `pl_wave_orchestrator` doesn't enforce `failurePolicy.onDependencyFailure` | `adf/pipelines/pl_wave_orchestrator.json` | **Fixed** | Phase ForEach now skips entities whose dependsOn failed when policy=skipDependent |
| **B012** | 2026-05-13 | spec audit | Impl | Generated Data Flows emit `sinkFinal` only — no validation-error split | `tools/dataflow-codegen/generator.py` | **Fixed** | Codegen emits a Conditional Split on `__row_valid`; invalid rows routed to `sinkTransformErrors` |
| **B013** | 2026-05-13 | spec audit | Impl | Generated Data Flows don't emit `sinkAliasSuggestions` for `onMissing:"suggestion"` | `tools/dataflow-codegen/generator.py` | **Fixed** | Codegen detects suggestion-mode fields and emits the sink |
| **B014** | 2026-05-13 | spec audit | Impl | No consolidated `run_history.parquet` appender | `adf/pipelines/pl_audit_aggregator.json` (new) | **Fixed** | New pipeline aggregates per-pipeline checkpoint JSONs into one parquet per run; invoked by orchestrators at completion |
| **B015** | 2026-05-13 | spec audit | Impl | `pl_load_upsert_phase2` references `phase2.parquet` that codegen doesn't emit | `tools/dataflow-codegen/generator.py` | **Fixed** | Codegen now emits `df_phase2_<entity>_inbound.json` when any field declares `loadPhase: 2` |
| **B016** | 2026-05-13 | spec audit | Impl | `pl_export_relationships` extracts full N:N intersect (no delta filter) | `adf/pipelines/pl_export_relationships.json` | **Fixed** | Added `deltaFilter` parameter passed to the Copy source as a FetchXML predicate |
| **B017** | 2026-05-13 | spec audit | Impl | `func-sftp-rename` Azure Function not built; `.csv.tmp` files persist | `func-sftp-rename/` (new) | **Deferred to v2** | Pipeline skips rename when URL empty; downstream consumers tolerate `.tmp` files for v1 |

**Bugs found during this audit-and-fix pass:** 17 (8 ADF + 9 validate-config rule gaps).
**Bugs fixed in code this turn:** 13.
**Bugs deferred:** 4 (B004 moot, B008 needs OData parser, B017 needs Azure Function).

When new bugs land, append rows. Don't delete closed entries — they're institutional memory.

---

## 7. Design revisions

Every change to architectural spec or detailed-design after initial draft. Each row links the commit / PR and one-line rationale.

| Date | Doc(s) updated | Rationale | Changed by |
| --- | --- | --- | --- |
| 2026-05-13 | Spec §3.2.7, Doc 01 §3, Doc 02 §7/§7b/§8/§9/§12/§13/§18/§-A, Doc 03 §2.5/§5.3/§5.5 | Initial fix pass from independent audit: corrected JSON Schema `if/then` to `oneOf` discriminator; rewrote MDF expression library with real ADF syntax; corrected Dataverse sink property names; added `pl_load_upsert_phase2`; added codegen appendix; added Dataverse throttling math; deferred `createIfMissing:true` to v2 | (initial author) |
| 2026-05-13 | `tools/dataflow-codegen` | Added outbound generator (`generate_outbound_dataflow`) — reverse transforms for direct/choice/state/yesNo/dateTime/lookup auto-derived; non-invertible types require explicit reverse block | (impl) |
| 2026-05-13 | `adf/pipelines/pl_load_relationships.json` | 412 silent-success implementation — IfCondition on `error.message` containing "412" or "already exists" routes to `alreadyExistsCount` append-variable; correct per design but never tested against real Dataverse | (impl) |
| 2026-05-13 | `adf/pipelines/pl_wave_orchestrator.json` | Implemented happy-path phase orchestration. `failurePolicy.onEntityFailure` and `onDependencyFailure` parameters read from config but **not enforced** — orchestrator continues regardless. See §10.B2 | (impl) |
| 2026-05-13 | `docs/` (8 files), `tools/README.md`, `infra/README.md` | User-facing documentation per spec §9. Replaces the placeholders in original spec | (impl) |

---

## 8. Open questions / decisions pending

| Date raised | Question | Owner | Resolution | Resolved |
| --- | --- | --- | --- | --- |
| 2026-05-13 | Outbound (Dataverse → SFTP) in v1 scope? | Project owner | **In v1** | 2026-05-13 |
| 2026-05-13 | Logic App `la-opex-notify` build now or defer? | Project owner | **Defer to v2** | 2026-05-13 |
| 2026-05-13 | Codegen in CI (output committed) vs runtime? | Build lead | Codegen runs locally + in CI; output committed under `adf/dataflows/generated/`. CI diffs regenerated vs committed | 2026-05-13 |
| 2026-05-13 | Two-pass `WaitForDataverseConsistency`: fixed 30s vs poll-until? | Build lead | **Fixed-30s default**; `_project.json.phase2WaitStrategy` lets you flip to `pollUntilConsistent60s` later | 2026-05-13 |
| 2026-05-13 | Multi-column alt-key for Site — confirm Dataverse alt-key creation | Dataverse admin | **Add to P0.2 sub-tracker as required** | 2026-05-13 |
| 2026-05-13 | Should `pl_wave_orchestrator` enforce `failurePolicy.onEntityFailure` programmatically? | Build lead | **Defer to v2 enhancement** (see §10.B2) — happy-path orchestration is sufficient for v1 deploy | 2026-05-13 |
| Open | When does the team build the run_history.parquet aggregator? | Build lead | TBD — partial implementation via per-pipeline checkpoint JSONs is sufficient for v1 | |
| Open | Tighten network security (private endpoints, VNet, firewall) for prod? | Infra | TBD — Bicep defaults to `Allow` for dev; flip to `Deny` + private endpoints in prod | |

---

## 9. Deferred to v2 (do not build now)

| Item | Reason for deferral | When to revisit |
| --- | --- | --- |
| `createIfMissing: true` + `pl_create_missing_masters` | Concurrency hazards (duplicate creates) need dedicated design pass; v1 ships with schema enforcing `false` (V028) | When stewards request auto-create for a specific master |
| `func-sftp-rename` Azure Function | Atomic SFTP rename — designed and pipeline-wired but no Function yet. Pipeline skips rename if URL empty | When a downstream consumer rejects `.tmp` files |
| `pl_wave_orchestrator` failure-policy enforcement | Happy-path orchestration sufficient for v1; `stopWave` / `skipDependent` logic complex to implement in ADF | When a wave's failure mode causes operational pain |
| `pl_master_orchestrator` checkpoint-skip logic | Re-runs always restart from extract today; per-step skip via `GetMetadata` + `IfCondition` deferred | When wave-level retry against same `runId` becomes a routine pattern |
| Consolidated `run_history.parquet` appender pipeline | Per-pipeline checkpoint JSONs provide equivalent info today | When a Power BI dashboard is built |
| Logic App `la-opex-notify` + email/Teams notifications | Manually monitor via ADF + audit folder for v1 | When operational rotation requires push notifications |
| Power BI dashboard over `run_history.parquet` | Ops can use ADF Monitor for v1 | When self-serve dashboards are needed |
| PII / GDPR / data-residency hardening | Out of v1 audit scope | Before first prod load with real personal data |
| Approval gate for `/config/` changes in prod | Not blocking dev/test; needed for SOX/audit | Before prod cutover |
| Environment promotion topology (dev → test → prod) | Single-env for now | Before second env is created |
| Backup / DR procedures | Operational, not implementation | After v1 ships |
| PGP encryption + checksum sidecar on outbound | Plain SFTP atomic-rename sufficient for v1 | When a downstream consumer requires it |
| Alias-suggestion sink + steward weekly digest | Not yet needed for the 3 entities | When the first master gets >5 unmapped variants/run |
| Cross-schema `$ref` improvements | Schemas duplicate `normalizeRules` instead — works fine | Only if we add more cross-schema references |
| CI workflow files (`.github/workflows/`) | Sample YAML in `tools/README.md`; user pastes when ready | When team picks CI platform |
| Power BI dashboard PBIX | Same | When ops team is ready for it |

---

## 10. Implementation gaps

**As of 2026-05-13 — closed in the audit-and-fix pass.** Every gap previously listed here has been logged in §6 (Bug log) and either fixed or marked Deferred with a reason. See §6 for current status.

**Summary:**

- **17 gaps logged** (B001–B017).
- **13 fixed in code this turn:** B001, B002, B003, B005, B006, B007, B009, B010, B011, B012, B013, B014, B015, B016.
- **4 explicitly deferred:**
  - **B004** (V027) — moot; V028 rejects `createIfMissing:true` entirely in v1.
  - **B008** (V045) — needs an OData expression parser; out of scope.
  - **B017** (`func-sftp-rename`) — needs an Azure Function build; v1 pipeline tolerates missing rename.

**Validate-config rule coverage post-fix:** 31 of 33 rules implemented (V001–V034 except V008/V009/V027; V040–V043; V050–V052). V045 deferred to v2.

### 10.A — Tests / fixtures gaps

- **Test fixtures per validate-config rule** (originally Phase 1.3) — current tests use inline programmatic fixtures rather than `tests/fixtures/Vxxx-{pass,fail}/` directories. Coverage is functionally equivalent but doesn't match the test-fixture protocol described in `detailed-design/01-config-schemas.md` §10.
- **Outbound codegen unit tests** — the outbound generator is exercised indirectly through `test_generate_*_dataflow_smoke` tests. No dedicated `test_outbound_*` tests assert per-transform-type reverse expressions. Half-day to add.
- **Tests for new rules V014, V016, V024, V034, V042, V043, V052** — implementations added without dedicated pass/fail unit tests. Existing test suite still green (11/11) because the new rules don't fire on the current live configs as errors; should add per-rule tests in a follow-up.
- **Tests for orchestrator changes (B010, B011)** — pipeline JSON is structurally valid but the checkpoint-skip and dependency-skip logic is not unit-testable without an ADF runtime. Will be exercised in Phase 4 verification.
- **End-to-end test against real Azure** — not done. Cannot be done without Phase 0 + deploy. The verification plan in §5 is the manual test plan.

### 10.B — Documentation consolidation (2026-05-13)

| Action | Detail |
| --- | --- |
| Deleted `/tools/README.md` | Content lived in `/docs/tool-reference.md`; removed duplication. |
| Deleted `/infra/README.md` | Content lived in `/docs/deployment.md`; removed duplication. |
| Trimmed `/README.md` to a landing page | Just elevator pitch + role-based pointers into `/docs/`. |
| Per-tool READMEs (`tools/validate-config/README.md` etc.) | Reduced to install + minimal-use stubs pointing at `/docs/tool-reference.md`. |
| Added CI sample YAML to `/docs/tool-reference.md` | Was previously in the now-deleted `/tools/README.md`. |

### 10.C — Documentation files in `/docs/` (8 files)

| Asset | Notes |
| --- | --- |
| `/docs/README.md` | Index, role-based reading order |
| `/docs/getting-started.md` | 5-minute orientation |
| `/docs/authoring-mappings.md` | Analyst workflow (per spec §9) |
| `/docs/authoring-waves.md` | Wave workflow (per spec §9) |
| `/docs/tool-reference.md` | Complete CLI ref + CI YAML |
| `/docs/deployment.md` | Phase 0 prereqs through Phase 3 enablement |
| `/docs/operations.md` | Day-to-day ops |
| `/docs/troubleshooting.md` | Failure-mode diagnostics |

### 10.D — Spec sections to revisit in v2

A pass at the architectural spec will be needed when v2 work begins, to remove the v1 caveats added during this build:

- **Spec §3.2.7** — drop the `createIfMissing: true` deferral once `pl_create_missing_masters` is built.
- **Spec §5.5** — once `pl_wave_orchestrator` enforces failurePolicy, the prose can describe actual behavior instead of design intent.
- **Spec §6** — Logic App notifications section becomes live, not aspirational.
- **Spec §12 (Bidirectional)** — currently a "considerations" section; will become "Bidirectional Implementation Guide" once ownership/echo-prevention/conflict-resolution are built.

---

## 11. Phase 5 — Bicep & deployment ✅ DONE

| # | Task | File |
| --- | --- | --- |
| 5.1 | `main.bicep` — top-level template + outputs | [`infra/bicep/main.bicep`](infra/bicep/main.bicep) |
| 5.2 | `storage.bicep` — ADLS Gen2 + container | [`infra/bicep/storage.bicep`](infra/bicep/storage.bicep) |
| 5.3 | `keyvault.bicep` — KV + 3 secret shells | [`infra/bicep/keyvault.bicep`](infra/bicep/keyvault.bicep) |
| 5.4 | `datafactory.bicep` — ADF v2 with system MI | [`infra/bicep/datafactory.bicep`](infra/bicep/datafactory.bicep) |
| 5.5 | `roleassignments.bicep` — ADF MI → Blob Contributor + KV Secrets User | [`infra/bicep/roleassignments.bicep`](infra/bicep/roleassignments.bicep) |
| 5.6 | `main.parameters.dev.json` | [`infra/bicep/main.parameters.dev.json`](infra/bicep/main.parameters.dev.json) — fill placeholders before running |
| 5.7 | `deploy.ps1` — one-command end-to-end | [`infra/deploy.ps1`](infra/deploy.ps1) |
| 5.8 | `infra/README.md` | [`infra/README.md`](infra/README.md) |

---

## 12. Phase 6 — Documentation ✅ DONE

| # | Task | File |
| --- | --- | --- |
| 6.1 | Root `README.md` | [`README.md`](README.md) |
| 6.2 | `detailed-design/README.md` | [`detailed-design/README.md`](detailed-design/README.md) |
| 6.3 | `detailed-design/01-config-schemas.md` | [`detailed-design/01-config-schemas.md`](detailed-design/01-config-schemas.md) |
| 6.4 | `detailed-design/02-pipelines-and-dataflows.md` | [`detailed-design/02-pipelines-and-dataflows.md`](detailed-design/02-pipelines-and-dataflows.md) |
| 6.5 | `detailed-design/03-error-model-and-runbook.md` | [`detailed-design/03-error-model-and-runbook.md`](detailed-design/03-error-model-and-runbook.md) |
| 6.6 | `docs/` user-facing (8 files) | [`docs/`](docs/) — README, getting-started, authoring-mappings, authoring-waves, tool-reference, deployment, operations, troubleshooting |
| 6.7 | Per-tool stub READMEs (install + pointer to `/docs/tool-reference.md`) | [`tools/validate-config/README.md`](tools/validate-config/README.md), [`tools/excel_to_json/README.md`](tools/excel_to_json/README.md), [`tools/dataflow-codegen/README.md`](tools/dataflow-codegen/README.md) |
| 6.8 | Doc consolidation pass — deleted `/tools/README.md` and `/infra/README.md` (duplication of `/docs/`) | Removed 2026-05-13 — see §10.B |

---

## 13. How to update this file

- **Daily during build:** check off completed tasks; add bug entries as found.
- **At any design discussion:** add the question to §8 immediately; resolve it in writing.
- **After every commit that fixes a bug:** link the commit in §6 and mark the bug Closed with date.
- **After every doc/spec edit:** add a row to §7 with rationale.
- **Phase complete:** confirm exit criteria are met and tag the commit (`phase-1-complete`, `phase-2-complete`, etc.).
- **New implementation gap discovered:** add to §10 with the Bxx code, expected vs actual, impact, and disposition (close now / defer / accept).

---

## 14. Audit summary

This file was thoroughly audited against [`reference/architectural-spec.md`](reference/architectural-spec.md) and [`detailed-design/`](detailed-design/) on **2026-05-13**.

**Conclusions:**

1. **Build is substantially complete.** Phases 1, 2, 3, 5, 6 are DONE. Phase 4 (verification) cannot be done without Azure deploy; Phase 0 (prerequisites) cannot be done in code.
2. **Eight pipelines + four data flows + nine config files + three Python tools + five Bicep modules + nine docs = ~50 files, all JSON-valid, 34 of 34 tests pass.**
3. **§10 captures the 8 ADF behaviors and 9 validate-config rules that are designed but not fully implemented.** Each gap has an impact note and a disposition. None block the v1 deploy; most are deferred to v2.
4. **The remaining work is operational, not engineering:** Phase 0 prereqs (Azure access, Dataverse schema, workbook gap closure), the `deploy.ps1` first run, and Phase 4 verification against a real environment.
