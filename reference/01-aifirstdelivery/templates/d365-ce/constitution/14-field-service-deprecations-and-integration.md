# Constitution — Field Service: Deprecations and Integration Patterns

The Field Service product is in active transition. Several long-standing components are being retired or replaced. This file enforces a **deprecation gate** at the start of every design and locks integration patterns to currently-supported paths.

References: [Field Service deprecations](https://learn.microsoft.com/en-us/dynamics365/field-service/deprecations-field-service) (single source of truth), [URS deprecations](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/deprecations), [FS integrations overview](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-integration-overview).

---

## 1 — Deprecation Gate (BLOCKER)

Every Field Service-touching design must run the deprecation gate before drafting the spec or TDD.

### Rule

Any in-scope use of a deprecated feature is a **BLOCKER** at `/review`. The spec must be reworked to use the Microsoft-supported replacement path before `/plan` may proceed. There is no "RECOMMENDED with sunset date" path — the gate is hard.

### Procedure

At the start of every Field Service design pass:
1. Read [Dynamics 365 Field Service - Deprecated features](https://learn.microsoft.com/en-us/dynamics365/field-service/deprecations-field-service).
2. Cross-reference every component named in the spec (entities, app modules, integrations, mobile features, IoT components) against the deprecation list.
3. If any in-scope component appears on the deprecation list, switch the spec to the Microsoft-supported replacement before proceeding.
4. Document the deprecation gate result in the FDD §2 (Scope) — confirming "no deprecated features in scope as of {date}".

### Currently Active Deprecations (as of 2025-12-19 MS update)

| Deprecated component | Removal / unsupported after | Replacement path |
|---|---|---|
| FS ↔ Finance & Operations integration (legacy direct) | **2027-02-28** | New Project-Operations-based integration (link work orders to projects for unified financials) |
| Outlook Add-in, Teams app, Viva Connections, Planner integrations | **2025-10-30** (already past — do not use in new builds) | Exchange-based bookings/Outlook integration; Teams collaboration on Work Orders |
| FS reports (legacy CCA-based: Resource & Utilization, Work Order Summary, RSO Admin, RSO Optimization Summary, Remote Assist Calls) | **August 2025** (already past) | Microsoft Fabric / Power BI |
| Dynamics 365 Guides and Remote Assist | **2026-12-31** | Microsoft replacement to be confirmed at announcement; do not start new builds |
| FS Plugin for Microsoft Copilot (Teams app) | Removed **2025-01-15** | Copilot side-pane chat in FS app |
| FS Mobile (Xamarin / Resco Woodford) + `msdyn_GeofenceAlerts` + `msdyn_FSMNotifications` + Drip Scheduling | **2022-06-30** (already past) | Power Apps mobile (model-driven) — see `13-field-service-scheduling-and-mobile.md` |
| Field Service (on-premises) | **2022-06-30** retired | Cloud only |
| Predictive work duration reports (Preview), Incident type AI suggestions, IoT alert suggestions | After **November 2024** | Replaced by Copilot-driven suggestions where applicable |
| Connected Field Service Device Readings chart | **2024-07-07** (TSI retirement) | Microsoft Fabric / Power BI visuals |
| Azure IoT Central | **2027-03-31** | Azure IoT Hub |

> The list above is a **snapshot**. The MS deprecations page is the authority. If MS adds or removes items, the constitution defers to the MS page — re-run the gate at every design start.

---

## 2 — Integration with Finance & Operations (ERP)

For new Field Service ↔ Finance & Operations integrations, only the Project-Operations-based path is sanctioned.

**Rules:**
- New builds use the **Project Operations-based integration** ("Connect Field Service to Finance and Operations" / "Link work orders to projects for unified financials"). Reference architecture: [Project Operations + Field Service](https://learn.microsoft.com/en-us/dynamics365/guidance/reference-architectures/project-operations-field-service-integration).
- The legacy direct **dual-write FS ↔ F&O** integration is deprecated; removal **2027-02-28**. Do not start net-new on this path. New environments cannot enable the toggle starting in FS release 8.8.139.398.
- For SCM ↔ FS procurement (Purchase Order chain into F&O / SCM), use the published [SCM-FS procurement entity integration](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/fin-ops/data-entities/scm-field-service-procurement).
- Custom integrations between FS and any ERP must transit Dataverse (events, virtual tables, or Service Bus) — never direct DB-to-DB.

References: [FS integration with F&O](https://learn.microsoft.com/en-us/dynamics365/field-service/finance-operations-integration), [Setup](https://learn.microsoft.com/en-us/dynamics365/field-service/finance-operations-integration-setup), [Connect FS to F&O — 2025 wave 2](https://learn.microsoft.com/en-us/dynamics365/release-plan/2025wave2/service/dynamics365-field-service/connect-field-service-finance-operations), [Dual-write home](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/dual-write/dual-write-home-page).

---

## 3 — Customer Service Integration (Case → Work Order)

Field Service is downstream of Customer Service for issue origination. The OOB conversion is mandatory.

**Rules:**
- A Work Order originating from a customer issue is **always** created from a Case via the OOB **Convert to → Work Order** action. Never via a custom plugin/flow that creates a Work Order without copying Case context.
- Field mappings between Case and Work Order are configured in the Customizations → Entity Mapping. Customise mapping there; never in code.
- Knowledge Articles linked to a Case automatically surface on the Work Order; do not duplicate via custom KB lookups.

References: [Create a work order](https://learn.microsoft.com/en-us/dynamics365/field-service/create-work-order).

---

## 4 — Outlook and Teams Integration

The legacy Outlook Add-in, Teams app, Viva Connections, and Planner integrations are deprecated (post-2025-10-30). New collaboration scenarios use the Exchange-based and Teams-collaboration paths.

**Rules:**
- Outlook calendar sync uses the new **Exchange-based bookings/Outlook integration** — see [Outlook integration](https://learn.microsoft.com/en-us/dynamics365/field-service/outlook-integration).
- Teams collaboration on Work Orders uses the OOB Teams collaboration feature — see [Set up Teams integration](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-teams-collab-admin) and [Collaborate on work orders with Teams](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-teams-collaboration).
- Frontline-worker workflows for Microsoft 365 are configured per [FLW admin guide](https://learn.microsoft.com/en-us/dynamics365/field-service/flw-admin) and [overview](https://learn.microsoft.com/en-us/dynamics365/field-service/flw-overview).
- Do not install, enable, or take new dependencies on the deprecated Outlook Add-in, Teams app, Viva Connections, or Planner integrations.

---

## 5 — IoT Integration Pattern

See `13-field-service-scheduling-and-mobile.md` §5 for the full IoT rule set. The deprecation gate applies:

- New IoT builds use **Azure IoT Hub** + Connected Field Service. Never IoT Central.
- The Device Readings chart is removed; visualise telemetry via Microsoft Fabric / Power BI.

---

## 6 — Custom Integration Patterns

Any custom integration not covered by an OOB pattern must follow the architectural principles (`00-architectural-principles.md` §2 Loose Coupling).

**Rules:**
- All inbound integration to FS lands in Dataverse via the Web API or virtual tables. No direct write to FS internal tables.
- Outbound integration from FS uses Dataverse events (plugin → Service Bus / event grid / webhook) or Power Automate flows. No direct cross-database calls.
- Idempotency is mandatory (`00-architectural-principles.md` §3) — every inbound message must use upsert keyed on a stable alternate key.
- Integration users use Application User accounts with least-privilege roles (`06-security-model.md`).

---

## 7 — Cross-Reference

- See `12-field-service-entities.md` for OOB entity rules (Case → WO, Agreement, Customer Asset).
- See `13-field-service-scheduling-and-mobile.md` for mobile + IoT + URS/RSO rules.
- See `15-multilingual-localization.md` for multilingual rules on email templates and customer-facing notifications generated by integrations.
