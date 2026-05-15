# Spec Review Checklist — D365 CE

Run every check below. Mark each as PASS / FAIL / N/A.
A FAIL on a BLOCKER check sets review status to NEEDS REWORK.

## Constitution: 00 — Architectural Principles
- [ ] No requirement bypasses OOB/low-code without justification — config-first principle followed (BLOCKER)
- [ ] No direct database queries or cross-system calls without a platform abstraction (Service Bus / APIM / Dataverse API) (BLOCKER)
- [ ] Every create/update operation in an integration or batch scenario has an idempotency mechanism identified (REQUIRED)
- [ ] Dataverse is the system of record — no replication of master data into external DBs for operational use (REQUIRED)

## Constitution: 01 — Solution Design
- [ ] Publisher prefix defined and follows 3–5 char rule (BLOCKER if missing)
- [ ] Solution name follows `{prefix}_{SolutionName}` format (BLOCKER)
- [ ] No requirement to modify OOB forms directly — clone-and-extend only (BLOCKER)
- [ ] Environment Variables called out for any configurable values (REQUIRED)

## Constitution: 02 — Plugin Standards
- [ ] Plugin classes identified with correct name format (REQUIRED if plugins in scope)
- [ ] No requirement to use static variables for state (BLOCKER)
- [ ] Pre/post images justified where referenced (REQUIRED)

## Constitution: 03 — Dataverse Schema
- [ ] All new tables named `{prefix}_tablename` lowercase (BLOCKER)
- [ ] All new columns named `{prefix}_columnname` lowercase (BLOCKER)
- [ ] Currency fields use Currency type not Decimal (BLOCKER)
- [ ] Descriptions provided for all new tables and columns (RECOMMENDED)
- [ ] Relationship cascade behaviour noted (REQUIRED if relationships in scope)

## Constitution: 04 — JavaScript
- [ ] No use of `Xrm.Page` referenced (BLOCKER)
- [ ] No `alert()` / `confirm()` usage (BLOCKER)
- [ ] JS file names follow `{prefix}_{entity}_{form}_{purpose}.js` (REQUIRED)

## Constitution: 06 — Security Model
- [ ] New security roles defined with correct naming (REQUIRED if roles in scope)
- [ ] Integration user identified if integrations involved (REQUIRED)
- [ ] No hardcoded user/team GUIDs (BLOCKER)
- [ ] Field security justified with business reason (REQUIRED if field security in scope)
- [ ] No secrets, API keys, or passwords referenced in spec — Azure Key Vault noted for any credential (BLOCKER if secrets in scope)
- [ ] Managed Identity identified for any Azure service integration (REQUIRED if Azure integrations in scope)
- [ ] Dataverse audit enablement called out for PII and financial tables (REQUIRED if PII or financial data in scope)

## Constitution: 11 — NFR Targets
- [ ] Every FR with synchronous plugins or real-time flows has response time NFR stated against targets in `11-nfr-targets.md` (REQUIRED)
- [ ] Availability NFR stated (99.9% or justified exception) (REQUIRED)
- [ ] Data volume estimated for all new tables — flag if > 1 million rows (REQUIRED)
- [ ] PII/financial table retention period stated (REQUIRED if PII or financial data in scope)

## Spec Completeness
- [ ] All functional requirements are numbered FR-NNN sequentially across all modules (REQUIRED)
- [ ] All actors/personas identified with D365 CE security roles (REQUIRED)
- [ ] Business Process Overview (§4) populated with numbered end-to-end steps (REQUIRED)
- [ ] Every FR has Inputs and Outputs documented (REQUIRED)
- [ ] Every FR has at least one Business Rule inline, or explicitly states "No business rules" (REQUIRED)
- [ ] Every FR has D365 CE Impact listed (REQUIRED)
- [ ] Every FR has Story Decomposition Guidance with at least one Possible Story Split (RECOMMENDED)
- [ ] Every FR has Dependencies (Upstream / Downstream) — "None" is acceptable if genuinely standalone (REQUIRED)
- [ ] Every FR has Non-Functional Considerations — at least Performance and Security (REQUIRED)
- [ ] Every FR has Traceability reference if source document was provided (RECOMMENDED)
- [ ] D365 CE Impact Summary table (§6) populated — all components across all modules (REQUIRED)
- [ ] Business Rules table (§7) populated — every BR referenced inline must appear here with enforcement point (REQUIRED if any rules exist)
- [ ] Open Questions (§9) completed — "None identified." is acceptable (REQUIRED)
- [ ] Constitution Risks (§10) completed — "None identified." is acceptable (REQUIRED)
- [ ] Acceptance Criteria (§11) has at least one Given/When/Then scenario per module (REQUIRED)
- [ ] Traceability Matrix (§13) populated if source references were provided (RECOMMENDED)

## Constitution: 12 — Field Service Entities (only when FS in scope)
- [ ] No requirement creates a custom analogue of an OOB FS table (`msdyn_workorder`, `bookableresourcebooking`, `msdyn_resourcerequirement`, `msdyn_customerasset`, `msdyn_functionallocation`, `msdyn_agreement`) (BLOCKER)
- [ ] Repeatable work modelled via Incident Type + Service Task Type, not free-text on Work Order (REQUIRED)
- [ ] Customer Asset and Functional Location hierarchies use OOB self-referential lookups, not parallel custom tables (BLOCKER)
- [ ] Recurring service / preventive maintenance modelled via Agreements + Agreement Booking Setup, not custom recurrence engines (BLOCKER)
- [ ] Inventory / Procurement / Returns flows use the OOB chain (`msdyn_inventoryjournal`, `msdyn_purchaseorder`, `msdyn_rma`, `msdyn_rtv`) end-to-end (BLOCKER)
- [ ] Time tracking uses `msdyn_timeentry`, not custom timesheet tables (BLOCKER)
- [ ] No plugin on `msdyn_workorder.msdyn_systemstatus` or `bookableresourcebooking.bookingstatus` Update mutates other FS state (BLOCKER)
- [ ] No custom BPF added on `msdyn_workorder` in new builds (REQUIRED)
- [ ] Work Order originating from a customer issue uses OOB Case → Work Order conversion (REQUIRED)

## Constitution: 13 — Field Service Scheduling & Mobile (only when FS in scope)
- [ ] All scheduled work persists as `bookableresourcebooking` against `msdyn_resourcerequirement`; no custom schedule tables (BLOCKER)
- [ ] Skill / role / territory / capacity expressed via Resource Characteristics, Categories, Roles, Territories — not via custom plugin filtering (BLOCKER)
- [ ] If RSO is licensed, no custom optimisation logic re-implemented in plugins/flows (BLOCKER)
- [ ] If RSO is not licensed and optimisation required, RSO licensing is requested rather than custom-built (BLOCKER)
- [ ] Schedule Board extended via tabs / filters / PCF cells / booking templates only — no custom-built board for OOB scheduling (BLOCKER)
- [ ] Custom matching extension uses the documented URS Custom Matching extensibility, not bypass plugins (REQUIRED)
- [ ] Mobile offline profile honours all published limits: ≤ 15 linked tables, < 100 total tables, < 1 GB DB, < 4 GB images, ≤ 14 image columns (BLOCKER)
- [ ] No "All records" offline filter — only date / relationship / user-scoped filters (BLOCKER)
- [ ] Non-offline tables (Purchase Order, Agreement, RTV, RMA) are not in the offline profile (BLOCKER)
- [ ] Mobile-side automation via offline-capable JS / PCF, not Power Automate cloud flows (BLOCKER)
- [ ] No use of legacy FS Mobile (Resco / Woodford) in new builds (BLOCKER)
- [ ] IoT scenarios use Azure IoT Hub, not Azure IoT Central (retiring 2027-03-31) (BLOCKER)
- [ ] Telemetry visuals use Microsoft Fabric / Power BI, not the deprecated Device Readings chart (BLOCKER)
- [ ] Customisations layered above FS / URS / RSO managed solutions; no modifications inside Microsoft-published solutions (BLOCKER)

## Constitution: 14 — Deprecation Gate (only when FS in scope)
- [ ] Deprecation gate run: every component cross-referenced against [FS deprecations](https://learn.microsoft.com/en-us/dynamics365/field-service/deprecations-field-service) and [URS deprecations](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/deprecations) (BLOCKER if any in-scope use of a deprecated feature)
- [ ] No use of legacy FS ↔ F&O dual-write integration in new builds (removal 2027-02-28); use Project-Operations-based path (BLOCKER)
- [ ] No use of legacy Outlook Add-in / Teams app / Viva Connections / Planner integrations (deprecated 2025-10-30); use Exchange-based + Teams collaboration (BLOCKER)
- [ ] No new builds against Dynamics 365 Guides or Remote Assist (end of availability 2026-12-31) (BLOCKER)
- [ ] FS Reports (legacy CCA): no new dependencies; replaced by Fabric / Power BI (BLOCKER)
- [ ] Deprecation gate result documented in FDD §2 Scope (REQUIRED)

## Constitution: 15 — Multilingual / Localization
- [ ] Schema is English-only; no localized strings in schema names (BLOCKER)
- [ ] Choice / option set integer values are language-neutral and immutable; no value re-use, re-purposing, or deletion (BLOCKER)
- [ ] No hardcoded user-facing strings in plugins, JS, PCF, or Power Automate flows (BLOCKER) — strings live in per-culture RESX / web resources
- [ ] `InvalidPluginExecutionException` messages loaded from a localized resource, not literals (BLOCKER)
- [ ] Form scripts load strings from per-culture web resources (`{prefix}_strings.{culture}.js`) (BLOCKER)
- [ ] PCF controls use `strings/{culture}.resx` files referenced from manifest; access via `context.resources.getString` (BLOCKER)
- [ ] Date / time formatting via `Xrm.Utility.formatDateTime` (client) or culture-aware .NET formatting (server) — never hardcoded format strings (BLOCKER)
- [ ] Integration payloads use ISO-8601 UTC for date/time; localization is presentation-layer only (REQUIRED)
- [ ] Email templates: one per language per use case; recipient-language-driven selection (REQUIRED)
- [ ] Multilingual Knowledge Articles use OOB workflow (root + per-language children); no custom Knowledge Search bypass (REQUIRED)
- [ ] If `supported-languages` includes RTL (`ar-*`, `he-*`, `fa-*`, `ur-*`): all PCF / HTML use logical CSS properties only (BLOCKER)
- [ ] Localization Matrix present in FDD §6 listing every artefact requiring translation (REQUIRED for multilingual projects)
- [ ] Translation export from Dev is part of CI; translations versioned in repo; re-import to Test/UAT/Prod automated (REQUIRED)
- [ ] Pseudo-localization environment / pseudo-language run before translator engagement (REQUIRED)
- [ ] Release gate: 100% translation coverage for all `supported-languages` before UAT promotion (BLOCKER if missing)
- [ ] Mobile offline DB size verified against the 1 GB ceiling with all `supported-languages` enabled (REQUIRED for FS Mobile multi-lang projects)
