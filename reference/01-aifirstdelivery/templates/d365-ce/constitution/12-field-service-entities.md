# Constitution — Dynamics 365 Field Service: OOB Entities and Data Model

These rules apply when the project includes any Field Service capability. Treat them as hard constraints, not guidance. Field Service ships its own data model and engines (Universal Resource Scheduling, mobile offline sync, work-order state machine); replacing or shadowing those components forks the product and breaks support.

Reference: [Dynamics 365 Field Service documentation hub](https://learn.microsoft.com/en-us/dynamics365/field-service/), [Work order architecture](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-architecture), [Field Service developer entity reference](https://learn.microsoft.com/en-us/dynamics365/field-service/developer/reference/entities/).

---

## 1 — Use OOB Entities; Never Replace

The Field Service core entities are the single source of truth for service execution. Custom analogues are forbidden.

| Concern | OOB Entity | Schema Name | Rule |
|---|---|---|---|
| Service execution unit | Work Order | `msdyn_workorder` | All service work originates here. No custom "Job" / "Ticket" / "Service Request" tables. |
| Scheduled assignment | Bookable Resource Booking | `bookableresourcebooking` | Owns time-on-resource; never store schedule state in custom tables. |
| Scheduling demand | Resource Requirement | `msdyn_resourcerequirement` | Always paired with a bookable resource booking. |
| Resource | Bookable Resource | `bookableresource` | Use OOB resource types (User, Account, Contact, Equipment, Facility, Pool, Crew, Generic). |
| Customer-owned equipment | Customer Asset | `msdyn_customerasset` | Use for serviceable assets. Hierarchy via `msdyn_customerasset.msdyn_parentasset`. |
| Service location | Functional Location | `msdyn_functionallocation` | Use for site / building / floor / room hierarchy. Never replicate via Account-child tables. |
| Repeatable work template | Incident Type | `msdyn_incidenttype` | Templates work-order content (services, products, tasks, characteristics). |
| Work step template | Service Task Type | `msdyn_servicetasktype` | Defines the standard step for a technician. Re-used across Incident Types. |
| Service contract | Agreement | `msdyn_agreement` | Recurring service / preventive maintenance / SLAs. |
| Recurring booking | Agreement Booking Setup | `msdyn_agreementbookingsetup` + `msdyn_agreementbookingincident` | Drives the recurrence engine; never re-implement. |
| Time tracking | Time Entry | `msdyn_timeentry` | Captures technician hours; integrates with billing/payroll. |
| Inventory unit | Warehouse / Product Inventory | `msdyn_warehouse`, `msdyn_inventoryjournal`, `msdyn_purchaseorder`, `msdyn_rma` | Use OOB inventory + procurement chain end-to-end. |

**Rules:**
- Never create a custom table that duplicates the purpose of any of the above. If a project requirement needs a "different concept", first prove the OOB concept cannot be configured/extended.
- Always extend by adding columns to the OOB table (publisher prefix, your unmanaged solution, layered above FS — see `13-field-service-scheduling-and-mobile.md` §Solution Layering).
- Never rename or delete columns/relationships on `msdyn_*` tables.
- Hierarchies (Customer Asset, Functional Location) use the OOB self-referential lookups — do not invent parallel hierarchy tables.

---

## 2 — Work-Template Pattern Is Mandatory

Repeatable work must be defined declaratively via Incident Type + Service Task Type, not by code.

**Rules:**
- Every recurring service activity (PM, calibration, install, RMA pickup, etc.) must be modelled as an **Incident Type** with the products, services, characteristics, and service tasks it requires.
- Free-text task lists on the Work Order are forbidden for repeatable work — define them on the Service Task Type and link to the Incident Type.
- Ad-hoc tasks are permitted only when the work is genuinely one-off; flag in the spec if more than 20% of work orders are ad-hoc — that's a signal of incomplete Incident Type modelling.
- Service Task Types carry estimated duration; use it for capacity planning and Schedule Assistant inputs. Do not store estimated duration in custom fields.

References: [Incident type overview](https://learn.microsoft.com/en-us/dynamics365/field-service/incident-type-overview), [Configure incident types](https://learn.microsoft.com/en-us/dynamics365/field-service/configure-incident-types), [Set up service task types](https://learn.microsoft.com/en-us/dynamics365/field-service/set-up-service-task-types).

---

## 3 — Customer Asset and Functional Location Modelling

The OOB Asset / Functional Location hierarchy is the canonical equipment model.

**Rules:**
- A Customer Asset always belongs to one Account (`msdyn_account` lookup) and optionally to a Functional Location.
- Sub-components of a serialised asset are modelled as child Customer Assets via `msdyn_parentasset`. Never as a separate "Sub-Asset" table.
- Non-serialised consumables linked to an asset use the OOB `msdyn_customerasset.msdyn_quantity` pattern; do not invent alternative quantity tables.
- Functional Location is the spatial hierarchy (Site → Building → Floor → Room). Use `msdyn_parentfunctionallocation` for the hierarchy. Never replace with Account parent-child for spatial purposes.
- Asset history (location moves, ownership changes, configuration changes) is captured via Dataverse audit (column-level audit on the asset's location/owner/config fields), not via a custom history table.
- Asset → Knowledge Article links use OOB `msdyn_customerasset_knowledgearticle` association — never a custom junction table.

References: [Customer assets](https://learn.microsoft.com/en-us/dynamics365/field-service/assets), [Functional locations](https://learn.microsoft.com/en-us/dynamics365/field-service/functional-locations).

---

## 4 — Agreements and Recurring Maintenance

Agreements are the engine for recurring service / SLA / preventive maintenance. Custom recurrence implementations are forbidden.

**Rules:**
- Every recurring service (preventive maintenance, calibration, SLA-driven inspection) is defined as an **Agreement** with a recurrence pattern via Agreement Booking Setup.
- The Agreement → Work Order generation engine creates work orders on schedule; never write a custom plugin/flow that creates work orders on a recurring basis.
- Pricing and entitlement come from the Agreement's `msdyn_agreementproductsservices` and Price List, not from custom calculation.
- SLA tracking on work orders uses the OOB `msdyn_workorder.msdyn_serviceaccount.msdyn_paymentterms` chain plus standard SLA entities — do not implement custom SLA timers.

References: [Agreements overview](https://learn.microsoft.com/en-us/dynamics365/field-service/agreements-overview), [Set up customer agreements](https://learn.microsoft.com/en-us/dynamics365/field-service/set-up-customer-agreements), [Agreement Booking Incident entity](https://learn.microsoft.com/en-us/dynamics365/field-service/developer/reference/entities/msdyn_agreementbookingincident).

---

## 5 — Inventory, Procurement, and Returns

The full chain — Warehouse → Product Inventory → Inventory Journal → Purchase Order → Goods Receipt → Inventory Adjustment → RMA → RTV — is OOB and must be used end-to-end.

**Rules:**
- Inventory transactions go through `msdyn_inventoryjournal`. No custom inventory adjustment tables.
- Purchase Orders use `msdyn_purchaseorder` with the OOB approval flow. Never create a custom purchase-order workflow.
- Returns Materials Authorisation (`msdyn_rma`) and Return To Vendor (`msdyn_rtv`) are mandatory for the return flow. Custom return tables are forbidden.
- Stock movement triggered by a Work Order Product (`msdyn_workorderproduct`) is automated by FS — do not duplicate the journal write.

References: [Inventory, purchasing, returns overview](https://learn.microsoft.com/en-us/dynamics365/field-service/inventory-purchasing-returns-overview), [Create a purchase order](https://learn.microsoft.com/en-us/dynamics365/field-service/create-purchase-order), [Process a return](https://learn.microsoft.com/en-us/dynamics365/field-service/process-return).

---

## 6 — Time Entry and Billing

Time Entry is the canonical time-tracking entity for technicians.

**Rules:**
- Technician time on a booking is captured as `msdyn_timeentry` (entered via mobile or back-office). Never via custom timesheet tables.
- Time Entry status flows (Draft → Submitted → Approved → Posted) are owned by FS — never plugin on status update to mutate the same record.
- Billing uses the Work Order's product/service line items + Time Entry totals. Do not generate invoices from a custom calculation in plugins; use the OOB invoice generation pipeline.

References: [Time entries](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-time-entry).

---

## 7 — Work Order Lifecycle Ownership

The OOB Field Service engine owns the Work Order state machine end-to-end. Custom plugins racing it cause data corruption.

**Rules:**
- **Forbidden plugin scenarios:**
  - Plugin on Create/Update of `msdyn_workorder.msdyn_systemstatus` that mutates `msdyn_systemstatus` itself or `bookableresourcebooking.bookingstatus`.
  - Plugin on Create/Update of `bookableresourcebooking.bookingstatus` that mutates `msdyn_workorder.msdyn_systemstatus`.
  - Plugin pre-validation on `msdyn_workorder` Create that creates child records (`msdyn_workorderservice`, `msdyn_workorderproduct`) — these have their own creation pipeline.
- **Allowed extension scenarios:**
  - Plugin on Create/Update of *custom* columns added to `msdyn_workorder` to enforce your own business rules.
  - Power Automate flow triggered after status update (Dataverse trigger filtering on `msdyn_systemstatus` change) — runs after FS engine has settled. Must be idempotent.
  - Async plugin on Post-Operation that reads (not mutates) FS state for downstream notifications.
- **Business Process Flow rule:** the new Work Order experience replaces the classic BPF with a dynamic card. Do not add a custom BPF to `msdyn_workorder` in new builds. Extend the dynamic card via configurable cards instead.

References: [Customize the work order form](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-customize-forms), [New work order experience](https://learn.microsoft.com/en-us/dynamics365/field-service/work-order-experience).

---

## 8 — Case → Work Order Conversion

Work Orders that originate from customer issues must come through the OOB Case → WO conversion.

**Rules:**
- A Work Order originating from a customer issue is **always** created from a Case via the OOB conversion (Convert to → Work Order). Never via a custom plugin/flow that bypasses Case context.
- Case → Work Order copy mapping uses field mapping (Customizations → Entity Mapping); customise field mapping there, not in code.
- Cross-references: the `msdyn_workorder.msdyn_serviceaccount` and `msdyn_workorder.msdyn_billingaccount` are populated from the Case's account; the `msdyn_workorder.msdyn_billingaccount` is overridable per the Bill-To rules in your project.

References: [Create a work order](https://learn.microsoft.com/en-us/dynamics365/field-service/create-work-order).

---

## 9 — Reference Architectures

Implementation choices must align with Microsoft's published reference architectures for the closest industry vertical.

**Rules:**
- Read [Field Service utilities reference architecture](https://learn.microsoft.com/en-us/dynamics365/guidance/reference-architectures/field-service-utilities-architecture) and [Project Operations + Field Service reference architecture](https://learn.microsoft.com/en-us/dynamics365/guidance/reference-architectures/project-operations-field-service-integration) before drafting any TDD that introduces new architecture.
- Deviation from a reference architecture must be documented as a Constitution Risk in the spec with rationale.

---

## 10 — Persona and App-Module Mapping

Persona-to-app-module mapping must follow Microsoft's published personas.

**Rules:**
- Map every project persona to one (or more) of: Customer Service Agent, Service Manager, Dispatcher, Frontline Worker (Field Service Mobile).
- New app modules are forbidden unless an explicit gap is documented; extend the OOB Field Service / Field Service Dispatcher / Field Service Mobile apps via Sitemap, Forms, and Views.

References: [Field Service overview](https://learn.microsoft.com/en-us/dynamics365/field-service/overview).
