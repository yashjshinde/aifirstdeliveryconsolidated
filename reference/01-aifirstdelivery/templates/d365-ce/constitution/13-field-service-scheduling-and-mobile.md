# Constitution — Field Service: Scheduling, Mobile, and IoT

These rules govern Universal Resource Scheduling (URS), Resource Scheduling Optimization (RSO), Field Service Mobile (offline), and Connected Field Service (IoT). All limits below are Microsoft-published; design for them as ceilings, not aspirations.

References: [Universal Resource Scheduling for Field Service](https://learn.microsoft.com/en-us/dynamics365/field-service/universal-resource-scheduling-for-field-service), [Schedule Assistant](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/schedule-assistant), [RSO overview](https://learn.microsoft.com/en-us/dynamics365/field-service/rso-overview), [FS mobile offline best practices](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/best-practices-limitations-offline-profile), [Connected Field Service](https://learn.microsoft.com/en-us/dynamics365/field-service/connected-field-service).

---

## 1 — Scheduling: URS Is the Engine

Universal Resource Scheduling is the platform-wide scheduling engine and the only sanctioned scheduling implementation. Custom-built schedulers, custom optimisation, or non-URS booking persistence forks the product and breaks compatibility with Schedule Assistant, RSO, and Schedule Board.

**Rules:**
- Every scheduled unit of work persists as a `bookableresourcebooking` linked to a `msdyn_resourcerequirement`. Never store schedule state in custom tables.
- Schedule the work via Schedule Assistant (manual), Schedule Board drag-and-drop (manual), or RSO (automatic). Never via a custom plugin that bypasses requirement matching.
- Express constraints declaratively:
  - Skill requirements → Resource Characteristics + characteristic ratings on the requirement.
  - Role/grade → Resource Categories.
  - Geography → Territories.
  - Time windows → `msdyn_resourcerequirement.msdyn_fromdate` / `msdyn_todate`.
  - Capacity → Bookable Resource working hours + capacity.
- Never inject filtering logic via plugins on `bookableresourcebooking` Create — extend matching via the documented [Custom Matching extensibility](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/developer/understanding-and-customizing-resource-matching-in-urs).
- Multi-resource bookings for one requirement use Requirement Groups, not multiple parallel requirements glued together by code. See [Requirement Groups](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/multi-resource-scheduling-requirement-groups).
- Facility (room/asset) scheduling uses [Facility scheduling](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/facility-scheduling); never a custom calendar table.

---

## 2 — Schedule Board: Extend, Don't Replace

The Schedule Board is the authoritative dispatcher UI. Custom-built boards are forbidden for OOB scheduling scenarios.

**Rules:**
- Add tabs (filter views), filters (resource attributes), and resource cells (PCF) to extend the OOB board. See [Schedule Board tab settings](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/schedule-board-tab-settings).
- Booking templates (the cards on the board) must be configurable per tab — do not hardcode board appearance in PCF.
- Replace the Schedule Board only when the OOB board provably cannot meet a requirement; document the gap as a Constitution Risk and engage Microsoft support before commencing.

---

## 3 — RSO: Use the Add-In, Don't Re-Implement

Resource Scheduling Optimization is a separately-licensed add-in. When RSO is licensed, it is the only sanctioned optimiser.

**Rules:**
- If RSO is licensed: never re-implement optimization logic in custom plugins/flows. Extend via RSO **Scope** (which requirements to optimise), **Goals** (objective functions), and **Constraints**.
- If RSO is **not** licensed: optimisation is manual via Schedule Assistant. Custom optimisation algorithms are forbidden — flag the gap and request RSO licensing.
- RSO scope is a contract surface: changes to scope (which resources are optimised) directly affect licensing cost. Document scope explicitly in the TDD.
- One active RSO instance per tenant, bound to a single Dynamics organisation. Multi-org tenants must plan accordingly.

References: [Get and install RSO](https://learn.microsoft.com/en-us/dynamics365/field-service/rso-get-install), [RSO configuration](https://learn.microsoft.com/en-us/dynamics365/field-service/rso-configuration).

---

## 4 — Mobile (Field Service Mobile / Power Apps Mobile)

The Field Service Mobile experience is a model-driven Power App with strict offline limits. Most production incidents come from violating these limits.

### Offline profile

The **Field Service Mobile - Offline Profile** is the contract. Extend it; never delete OOB tables from it.

| Limit (MS-published) | Value | Source |
|---|---|---|
| Linked tables in offline profile (incl. downstream) | **≤ 15** | [FS offline best practices](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/best-practices-limitations-offline-profile) |
| Total tables in offline profile | < 100 | [Power Apps offline limitations](https://learn.microsoft.com/en-us/power-apps/mobile/offline-limitations) |
| Records per profile (target) | < 200,000 | same |
| Records per profile (hard ceiling) | **3,000,000** | same |
| Offline DB size | **< 1 GB** | same |
| Total offline images / files | **< 4 GB** | same |
| Image columns across profile | **≤ 14** | same |
| Offline search scope | Single table only | same |

### Hard rules

- Build on the OOB FS Mobile offline profile. **Do not delete** OOB tables from it. Only extend.
- **"All records"** as an offline filter is forbidden. Always scope by date range (e.g., bookings in next 14 days), by relationship (assets linked to my bookings), or by user (records where I am the assigned resource).
- These tables are **not supported offline** — design mobile flows accordingly:
  - Purchase Order (`msdyn_purchaseorder`)
  - Agreement (`msdyn_agreement`)
  - Return To Vendor (`msdyn_rtv`)
  - Returns Materials Authorisation (`msdyn_rma`)
- **Field Mapping is not honoured offline** — design parent-child auto-population accordingly. Use offline-aware JS to copy values from parent to child on the device.
- Use `Xrm.WebApi.online` only when intentionally requiring connectivity. Default to APIs that work both online and offline; assume offline-first.
- Power Automate cloud flows do not run on the device offline. Any logic that must run on-device offline goes in **offline-capable JavaScript** or **PCF** — never in cloud flows.
- Geofencing (`msdyn_GeofenceAlerts`) is deprecated; do not use.

### Mobile customisation

- Customise the FS mobile app via Power Apps maker portal — not via the legacy Resco/Woodford project files (deprecated 2022-06-30, do not start net-new).
- Mobile-specific JavaScript in the same web resource as full-client JS — gate by `Xrm.Utility.getGlobalContext().client.getClient()`.
- PCF used in mobile must be tested on iOS, Android, and Windows mobile clients before release.

References: [Configure FS mobile via Power Apps](https://learn.microsoft.com/en-us/dynamics365/guidance/resources/field-service-mobile-customize-powerapps), [Set up the mobile offline profile](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/set-up-offline-profile), [Power Apps mobile offline overview](https://learn.microsoft.com/en-us/power-apps/mobile/offline-capabilities), [Optimize the offline profile](https://learn.microsoft.com/en-us/power-apps/mobile/mobile-offline-guidelines), [Workflows and scripts for FS mobile](https://learn.microsoft.com/en-us/dynamics365/guidance/resources/fs-mobile-automate-business-processes), [FS mobile FAQ](https://learn.microsoft.com/en-us/dynamics365/field-service/mobile/mobile-power-app-faq).

---

## 5 — IoT and Connected Field Service

Connected Field Service for **Azure IoT Hub** is the only supported Microsoft IoT path for new builds. Azure IoT Central is retiring; legacy CFS components are removed.

**Rules:**
- New IoT scenarios use **Azure IoT Hub** as the canonical broker — see [Install/configure CFS for Azure IoT Hub](https://learn.microsoft.com/en-us/dynamics365/field-service/installation-setup-iothub).
- **Azure IoT Central** is retiring **2027-03-31** — do not start new builds; existing IoT Central apps must have a documented migration plan to IoT Hub or alternative.
- The OOB **Device Readings chart** was removed when Azure Time Series Insights retired (2024-07-07). Replace with **Microsoft Fabric / Power BI** telemetry visuals — never restore via a custom chart that depends on TSI.
- Map IoT alerts (`msdyn_iotalert`) → Work Order via the OOB Alert→WO automation. Never route raw telemetry into Dataverse — keep telemetry in the IoT/analytics layer and only persist alerts and events in Dataverse.
- IoT security roles: `IoT - Administrator` for human admins; `IoT - Endpoint User` is for the platform's own use only — do not assign to humans.

References: [Connected Field Service overview](https://learn.microsoft.com/en-us/dynamics365/field-service/connected-field-service), [How CFS with IoT Hub works](https://learn.microsoft.com/en-us/dynamics365/field-service/connected-field-service-architecture), [CFS security roles](https://learn.microsoft.com/en-us/dynamics365/field-service/cfs-security-roles), [TSI retirement / Fabric migration](https://learn.microsoft.com/en-us/azure/time-series-insights/migration-to-fabric).

---

## 6 — Solution Layering for Field Service

The customisation solution stack must be layered correctly above the Microsoft-managed solutions. Modifying components inside FS / URS / RSO managed solutions is forbidden.

**Layer order (bottom → top):**

```
Dataverse / Common Data Model
    └─ Customer Service / Service Management
        └─ Universal Resource Scheduling (URS)
            └─ Field Service
                └─ Resource Scheduling Optimization (optional add-in)
                    └─ Your customisation solutions (managed at deploy time)
```

**Rules:**
- All customisations live in **your** unmanaged solution(s) layered above FS / URS / RSO. Never add components to the Microsoft-published solutions.
- Split into a "core / schema" solution and an "app / UI" solution where feasible (recommended ALM pattern). See [Organize solutions in Power Platform](https://learn.microsoft.com/en-us/power-platform/alm/organize-solutions).
- Pin solution versions in CI; verify FS / URS / RSO upgrades in lower environments before Production. The [FS version history](https://learn.microsoft.com/en-us/dynamics365/field-service/version-history) and [URS version history](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-version-history-resource-scheduling) are the support-window source of truth.
- Avoid taking dependencies on internal FS components that aren't documented in the public entity reference.

---

## 7 — Performance and NFR Targets (Field Service-Specific)

Targets supplement `11-nfr-targets.md`.

| Scenario | Target | Notes |
|---|---|---|
| Schedule Board initial load (default tab, ≤ 50 resources, 7-day view) | ≤ 3 s | Dispatcher productivity threshold |
| Schedule Assistant search response (typical scope) | ≤ 5 s | User waits for matches |
| Mobile sync (full sync, < 200K records) | ≤ 5 minutes | Field-day start tolerance |
| Mobile incremental sync | ≤ 30 s | Foreground refresh tolerance |
| RSO single-pass optimisation (≤ 500 requirements) | ≤ 15 minutes | Operations-team SLA expectation |
| IoT alert → Work Order creation | ≤ 60 s end-to-end | Operational responsiveness |

---

## 8 — Cross-Reference

- See `12-field-service-entities.md` for the OOB entity model and "use OOB, never replace" rule.
- See `14-field-service-deprecations-and-integration.md` for deprecation gate and ERP integration patterns.
- See `15-multilingual-localization.md` for mobile + multilingual interactions (offline metadata cost per language pack).
