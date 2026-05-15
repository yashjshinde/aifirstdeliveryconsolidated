# /document — Generate Component-Level Documentation

Generate detailed documentation for a specific category of project components.
Reads from `docs-generated/component-inventory.md` (produced by `/scan`) and the raw artefacts in `input/`.

## Usage

```
/document {scope}
```

Scope options: `entities` | `plugins` | `web-resources` | `pcf` | `flows` | `integrations` | `security` | `forms-views` | `custom-apis` | `adf` | `reporting` | `all`

## Pre-condition Check

Read `docs-generated/component-inventory.md`.
If it does not exist, stop: "Run `/scan` first."

Read all files in `constitution/` before proceeding — every rule is a hard constraint.

## Core Quality Rule (applies to ALL scopes)

> **Every component must be documented individually. Grouping multiple components under a single
> placeholder entry such as "Other scripts (N files)" or "Remaining flows follow the same pattern"
> is strictly prohibited. If a component cannot be fully analysed, flag it individually as
> ⚠ NEEDS REVIEW — do not omit it or merge it into a group.**

---

## Steps by Scope

---

### scope: entities

**Output:** `docs-generated/functional/entity-catalogue.md`

#### Step 1 — Feature Domain Grouping

Before writing any entity, derive feature domains from the project's entity names, flow names, and plugin triggers. A feature domain is a cohesive business capability — not a generic label like "Clinic" or "Reference Data".

Group entities into feature domains such as:
- HSG Onboarding Lifecycle (application, EPA, SBA, transaction chain)
- HSG Change Request Workflow (CR, CR type, cancellation reason)
- Clinic Suspension / Withdrawal (per-programme suspension, switch, withdrawal records)
- PCN / RHS Clinic-Doctor Relationships (onboarding, suspension, withdrawal records)
- Case Management (case, routing, distribution, aging, DCV tasks)
- Client Management (contact/client, referrals, relational contacts, InterRAI)
- Partner Management (account/partner, financial, personnel, service offerings)
- Survey / FormSG (admin, items, responses, staging)
- Configuration & Email (configuration entity, email templates, SMS templates)
- Geographic Reference (postal code, SLR region/subregion, ward, division, URA planning area)
- Staging / Integration (staging entities, MIG communication log, connection)

Assign every entity to exactly one domain. Entities that do not fit any domain go in "Other / Reference Data".

#### Step 2 — Entity-Level Documentation

For every entity in the inventory, read `input/solutions/{package}/Entities/{logicalName}/Entity.xml`:
- Display name, logical name, schema name, ownership type (User/Organization), source package
- Primary attribute (name field) and its description
- Entity description (from Description element if present)

#### Step 3 — Field Data Dictionary

For every entity, read ALL files in `input/solutions/{package}/Entities/{logicalName}/Attributes/`:

For each attribute XML, extract and document:
- `LogicalName` — schema name
- `DisplayName` — from LocalizedNames/LocalizedName
- `AttributeType` — field type (String, Integer, Lookup, Picklist/OptionSet, DateTime, Boolean, Money, Decimal, Memo, Customer, Owner, Uniqueidentifier, BigInt, Double, ManagedProperty, Virtual)
- `RequiredLevel` — None / Recommended / Required (RequiredForSave)
- For **Lookup** fields: the referenced entity (`ReferencedEntity`) — "Lookup → {entity display name}"
- For **OptionSet** (local) fields: list all option values and labels if ≤ 15 options; summarise if more
- For **OptionSet** (global): note the global option set name
- Business purpose: infer from the field's display name, the entity context, and cross-reference with flow/plugin usage. Write one sentence describing what this field stores and why.

Minimum output per entity: a complete attribute table. **Do not write "N attributes — see solution XML for detail."**

For the top-12 entities by attribute count (typically the entities with the most attributes), additionally document:
- Which attributes are auto-populated by plugins (cross-reference plugin register)
- Which attributes trigger plugin/flow logic when changed (from FilteringAttributes in plugin steps and flow trigger conditions)
- Which attributes appear on forms (cross-reference forms register)

#### Step 4 — Relationships

For each entity, read `input/solutions/{package}/Entities/{logicalName}/Relationships/*.xml`:
- Document each relationship: type (N:1, 1:N, N:N), related entity, schema name, cascade behaviours (Assign, Delete, Merge, Reparent, Share, Unshare)
- For N:1 lookups: explain the relationship in plain English ("A Clinic Doctor Relationship Record belongs to one Clinic and one Clinical Professional")
- For self-referential relationships: flag as hierarchical ("Clinical Professional may have a supervising Clinical Professional")

#### Step 5 — Cross-References per Entity

For each entity, document (pulling from the inventory and other docs):
- Plugin classes that fire on this entity (from plugin register)
- Power Automate flows that reference this entity as trigger (from flow register)
- Classic workflows on this entity (from classic workflow register)
- Forms registered on this entity (count and form types)
- Key views (active view name, filter logic if obvious from name)

#### Step 6 — OOB Extended Entities

For each OOB extended entity, document only the customisations:
- Custom attributes added (by publisher prefix)
- OOB attributes made required or renamed
- Custom relationships added
- Do not repeat standard OOB field definitions

#### Step 7 — Write Output

Write `docs-generated/functional/entity-catalogue.md`.
Organise by feature domain (§ per domain). Within each domain, list entities in dependency order (parent entities before child/junction entities).

---

### scope: plugins

**Output:** `docs-generated/technical/plugins/{AssemblyName}.md` — one file per assembly

For every plugin assembly in the inventory:

#### Step 1 — Read Registration Metadata

Read all step registration XML from `input/solutions/{package}/PluginAssemblies/*.xml`:
- For each step: plugin type (class), entity (PrimaryEntityName), message (SdkMessageName), stage (10/20/40), mode (0=sync, 1=async), filtering attributes, pre-image attributes, post-image attributes

#### Step 2 — Read Source Code

Read all `.cs` files in `input/src/plugins/{AssemblyName}/`. For each class that implements `IPlugin`:

**Read the full `Execute()` method body** and document:

a) **Context extraction** — What does the plugin read from the execution context?
   - `context.InputParameters["Target"]` → reading the triggering record
   - `context.PreEntityImages["pre"]` → reading pre-change field values
   - `context.PostEntityImages["post"]` → reading post-change field values
   - `context.UserId`, `context.BusinessUnitId`, `context.OrganizationId` → user context

b) **Decision logic** — Document all conditional branches as if-then statements:
   - "If `context.Depth > 1`: exit immediately (recursion guard)"
   - "If `entity.Contains('aic_status')` AND `entity['aic_status'] == 100000002`: apply suspension logic"

c) **Dataverse operations** — Every `service.Create`, `service.Update`, `service.Retrieve`, `service.RetrieveMultiple`, `service.Delete`:
   - Entity logical name
   - Fields written (for Update) or column set (for Retrieve)
   - Filter criteria (for RetrieveMultiple)

d) **Custom action calls** — Every `OrganizationRequest` or `ExecuteRequest`:
   - Action unique name
   - Input parameters passed
   - Output parameters used

e) **External HTTP calls** — Every `HttpClient.Send`, `WebClient.DownloadString`, REST calls:
   - URL pattern (mask credentials)
   - HTTP method
   - Request/response shape
   - Flag: ⚠ SYNCHRONOUS HTTP IN PLUGIN — performance risk

f) **Error handling** — Every `throw new InvalidPluginExecutionException`:
   - User-facing message text
   - Conditions that trigger it

g) **Logging** — `tracingService.Trace` calls: what is logged and when

#### Step 3 — Write Per-Class Documentation

For each class, write a section with:
```
#### {ClassName}
**Registered Steps:** {N}
**Stage:** {PreValidation / PreOperation / PostOperation}
**Mode:** {Synchronous / Asynchronous}
**Entity/Message/Filter:** {entity} — {message} | Filtering: {attributes or "all fields"}

**Business Logic:**
{If-then description of what the plugin does, step by step}

**Data Read:**
| Source | Fields / Filter |
|---|---|
| {entity} (Target) | aic_field1, aic_field2 |
| {entity} (Pre-image) | aic_field3 |
| {related entity} (Retrieve) | filter: aic_parentid = Target.Id |

**Data Written:**
| Target | Fields Set |
|---|---|
| {entity} | aic_status = 100000002, aic_modifiedreason = "..." |
| {related entity} | Created: {entity} with fields... |

**Errors Thrown:**
| Condition | Message |
|---|---|
| Clinic not active | "Cannot submit application — clinic is not in Active status." |

**Key Code Excerpt:**
```csharp
{relevant Execute() excerpt, up to max-snippet-lines}
```
```

#### Step 4 — Flag Issues
- `⚠ SOURCE ONLY` — class in source with no matching registration
- `⚠ REGISTRATION ONLY` — step registered but no source found
- `⚠ SYNCHRONOUS HTTP` — external call in synchronous post-op step
- `⚠ NO RECURSION GUARD` — plugin updates its trigger entity without depth check
- `⚠ SILENT ERROR` — empty catch block or catch that does not rethrow

---

### scope: web-resources

**Output:** `docs-generated/technical/web-resources/{namespace-group}.md`

> **QUALITY RULE: Every JS file must have its own documentation section. Grouping multiple files
> under a single entry is prohibited. If a file exists in the solution but cannot be read from
> input/src/, document it as ⚠ NEEDS REVIEW — source not available, and list its schema name
> and the forms it is registered on.**

For each JavaScript file (read from `input/src/web-resources/`):

#### Step 1 — Cross-Reference Registration

For each `.js` source file, find the matching WebResource registration in `input/solutions/{package}/WebResources/`. Extract:
- Schema name (registered name in D365)
- Forms it is registered on (infer from solution form XML if available; otherwise note "form registration not confirmed in artefacts")
- Event handlers registered (OnLoad, OnChange field name, OnSave, ribbon button)

#### Step 2 — Function Documentation

Read the full JS file source. For each function defined (including immediately-invoked namespaced functions):

```
| Function | Trigger | Fields Read | Fields Written | Xrm/WebApi Calls | Custom Actions | Purpose |
|---|---|---|---|---|---|---|
| ClinicPCNOnboarding.onLoad | Form OnLoad | aic_status, aic_pcnid | aic_pcnam (setRequired) | XrmHelper.retrieveRecord('aic_masterpcninfo') | None | Initialises form — sets field requirements based on status; loads PCN details |
| ClinicPCNOnboarding.onStatusChange | aic_status OnChange | aic_status | aic_submitdate (setVisible), aic_reason (setRequired) | None | aic_ValidationRuleCheck | Toggles field visibility on status change; calls validation before submission |
```

**Fields read**: every `getAttribute('fieldname').getValue()` or `formContext.getAttribute('fieldname')`
**Fields written**: every `setAttribute`, `setRequired`, `setVisible`, `setDisabled`, `setValue`
**Xrm/WebApi calls**: `Xrm.WebApi.retrieveRecord`, `Xrm.WebApi.retrieveMultipleRecords`, `Xrm.WebApi.createRecord`, `Xrm.WebApi.updateRecord`, and any XrmHelper/AICCommon wrapper calls
**Custom actions**: `Xrm.WebApi.online.execute` or any `executeAction` / `executeMultiple` calls — note the action unique name and key parameters

#### Step 3 — Dependency Map

For each file, list which shared libraries it depends on:
- `AICCommon.*` calls → depends on `common.js`
- `XrmHelper.*` calls → depends on `xrmhelper.js`
- `CaseCommon.*` → depends on `casecommon.js`
- etc.

#### Step 4 — Deprecated API Detection

Flag any usage of:
- `Xrm.Page.*` → ⚠ DEPRECATED API — replace with formContext
- `getAttribute("x").fireOnChange()` → ⚠ DEPRECATED
- `Xrm.Utility.openEntityForm()` → ⚠ DEPRECATED
- `XMLHttpRequest` / `ActiveXObject` → ⚠ LEGACY HTTP — use Xrm.WebApi instead

#### Step 5 — Write Output

Group files by the entity they serve. Document utility/shared libraries first, then entity-specific scripts in alphabetical entity order. Every file gets its own `####` subsection.

---

### scope: pcf

**Output:** `docs-generated/technical/pcf/{ControlName}.md`

For each PCF control in `input/src/pcf/`:
1. Read `ControlManifest.Input.xml`: control name, namespace, type, properties (name, type, usage, required, description)
2. Read `index.ts`: all lifecycle methods (`init`, `updateView`, `getOutputs`, `destroy`) — document what each method does, what Dataverse operations it performs, what state it maintains
3. Read `package.json`: external dependencies with version
4. Read any `*.tsx` / `*.ts` component files: component purpose and key props
5. Document: purpose, manifest properties, lifecycle behaviour, Dataverse calls, external dependencies, browser/mobile notes

---

### scope: flows

**Output:** `docs-generated/functional/flows.md`

> **QUALITY RULE: Every flow must be documented individually with: trigger entity + condition,
> numbered action sequence (every action, not summarised), error handling pattern, and downstream
> effects. Do not write "follows the same pattern" or "similar to the above". Every flow is
> documented in full, even if it shares structural patterns with others.**

#### Step 1 — Read All Flow JSON Files

For every `.json` file in `input/solutions/{package}/Workflows/`:
- Read the flow definition JSON
- Extract: display name, trigger type, primary entity, trigger filter (exact field and value conditions), all actions in sequence

#### Step 2 — Per-Flow Documentation

For each Power Automate flow, write a section:

```
#### {Flow Display Name}
**Package:** {solution package name}
**Trigger:** {trigger type} on {entity display name}
**Trigger Condition:** {exact filter — e.g. "When aic_status changes to 'Submitted' (100000002)" or "On Create only"}
**Connection References:** {list connection references used}

**Action Sequence:**
1. {Action type} — {connector}: {operation} — {brief purpose}
   Input: {key fields passed}
   Output: {key output used downstream}
2. {Condition}: If {expression}
   True branch:
     3. {action}
   False branch:
     4. {action}
5. {Action type} ...

**Error Handling:**
{Describe run-after settings, scope catches, terminate actions. If none: ⚠ NO ERROR HANDLING — failures silently ignored}

**Downstream Effects:**
{What record state changes, emails sent, child flows triggered, or custom actions called}
```

#### Step 3 — Classic Workflow Inventory

For every `.xaml` file in `input/solutions/{package}/Workflows/`:
- Read the XAML — extract: display name, primary entity, trigger type (on-demand, on-create, on-update, on-status-change, on-field-change), trigger field (if on-field-change), primary action sequence
- Document individually — **do not group into unnamed categories**

Classic workflow section format:

```
| Workflow Name | Entity | Trigger | Trigger Field/Condition | Primary Actions |
|---|---|---|---|---|
| AICPACES_Case_AssignCaseOnCreate | incident | On Create | — | Update incident.Owner based on queue round-robin; Create aic_routinghistory record |
| AICPACES_Client_SetNRICFormat | contact | On Update | aic_nric | Format NRIC to uppercase; run checksum validation |
```

#### Step 4 — Feature Domain Grouping

Group flows by the same feature domains used in the entity catalogue. Within each domain, order flows logically (trigger flows before notification flows, parent processes before child processes).

#### Step 5 — Integration Endpoint Flows

For Power Automate HTTP trigger flows (integration endpoints):
- Document the HTTP trigger URL pattern (masked)
- Document the expected request body schema (fields, types)
- Document what D365 custom action is called
- Document the response body schema
- Note authentication method if determinable from flow definition

---

### scope: security

**Output:** `docs-generated/functional/security-model.md`

#### Step 1 — Read Role XML Files

Read every role XML from `input/solutions/*/Other/` where filename contains "Role" or element type is `RolePrivilege`. For each role:
- Role name, description (if present)
- List of all privilege entries: `PrivilegeType`, `PrivilegeDepth` (depth code: 0=None, 1=User, 2=BU, 4=Parent BU, 8=Org), privilege name (which maps to entity+operation)

#### Step 2 — Build Privilege Matrix

For the top 20 most-used entities (by form count and flow reference count), build a privilege matrix per role:

```
| Entity | Create | Read | Write | Delete | Append | AppendTo |
|---|---|---|---|---|---|---|
| aic_clinic | BU | Org | BU | None | BU | BU |
| contact (Client) | User | BU | User | None | User | User |
| incident (Case) | User | BU | User | None | User | User |
```

Privilege depth abbreviations: `None` `User` `BU` `Parent BU` `Org`

Write one matrix table per role (or one combined table if fewer than 6 roles).

#### Step 3 — Field Security Analysis

Read `FieldSecurityProfile` elements from solution XML (if present):
- Profile name, protected fields, read/write/create access per field

If no field security profiles exist: document explicitly "No field-level security profiles detected" AND list the sensitive fields that should be considered for field-level security:
- Any field with schema name containing `nric`, `ic`, `dob`, `passport`, `financial`, `salary`, `bank`, `balance`
- Any field with type Money or with description suggesting PII

#### Step 4 — Team and Access Configuration

Document any team records or team templates found in solution XML. Note their relationship to roles.

Document Canvas App security (if canvas apps present in inventory): note that canvas app access is controlled separately from D365 role security and requires Power Apps license assignment.

---

### scope: forms-views

**Output:** `docs-generated/functional/forms-and-views.md`

#### Step 1 — Read Form XML Files

For each entity, read ALL `input/solutions/{package}/Entities/{logicalName}/Forms/*.xml`:
- Form name, form type (Main / QuickCreate / QuickView / Card / Dialog), form description if present
- Tab structure: for each tab → tab label, sections → for each section → section label, columns, fields
- For each field on the form: schema name, display name, required level on form (if overridden from entity), read-only (if locked)
- Business rules referenced (if determinable from form XML)
- Web resource/PCF controls embedded in the form
- Subgrids: related entity, view used, allow create/delete/edit

For the top 10 entities by form count (typically: aic_clinic, aic_clinicalprofessional, aic_postalcode, contact, account, aic_serviceoffered, aic_conversationfiling, aic_clinicpcnsuspensionrecord, aic_clinicpcnonboardingrecord, aic_natureofcaserecommendation):

Document every Main form in full tab/section/field detail. For other entities, document the Main form structure at tab+section level with field counts per section.

Form section output format:
```
**Form: {FormName} ({FormType})**
**Entity:** {display name} ({schema name})
**Registered web resources:** {js file names}

| Tab | Section | Fields |
|---|---|---|
| General | Clinic Details | Clinic Name (aic_name, Required), UEN (aic_uen, Required), HCI Code (aic_hcicode, Optional), Clinic Type (aic_clinictype OptionSet, Required), Status (statecode, Read-only) |
| General | Contact Information | Primary Contact (aic_primarycontactid Lookup→contact, Optional), Email (aic_email, Optional), Phone (aic_phone, Optional) |
| HSG Programme | HSG Status | HSG Status (aic_hsgstatus OptionSet, Optional), HSG Start Date (aic_hsgstartdate DateTime, Optional) |
| HSG Programme | EPA Details [Subgrid] | aic_hsgepa — Active HSG EPAs view; allow create: Yes |
```

#### Step 2 — Read View XML Files

For each entity, read ALL `input/solutions/{package}/Entities/{logicalName}/Views/*.xml`:
- View name, view type (Public / Associated / Quick Find / Advanced Find / Lookup)
- Columns: schema name, display name, column width
- Filter conditions (from fetch XML): field, operator, value
- Sort order: field, ascending/descending

For the top 10 entities, document all views individually. For remaining entities, document the Active Records and My Records views.

View output format:
```
**View: Active Clinics**
**Entity:** aic_clinic | **Type:** Public
**Columns:** Clinic Name (300px) | Clinic Type (150px) | HSG Status (120px) | PCN (150px) | SLR Sub-Region (150px) | Modified On (150px)
**Filter:** statecode = 0 (Active)
**Sort:** aic_name ascending
```

---

### scope: custom-apis

**Output:** `docs-generated/technical/custom-apis.md`

> **QUALITY RULE: Do not infer custom API names from plugin class names. Read the actual
> XML registration files. If no custom API XML exists for a plugin step registered as a
> custom action, document as: ⚠ REGISTRATION GAP — plugin step registered as custom action
> but no CustomAPI or SdkMessageProcessingStep XML definition found.**

#### Step 1 — Read Custom API XML

Search `input/solutions/*/Other/` for files containing `CustomAPI` or `CustomAPIRequestParameter` elements. For each custom API:
- Exact unique name (from UniqueName element — do not infer)
- Display name, description
- Bound entity (if bound action) or unbound
- Is function (GET) or action (POST)
- Request parameters: name, type (String, Integer, Boolean, EntityReference, Entity, EntityCollection, etc.), required, description
- Response properties: name, type, description
- Implementing plugin class (from SdkMessageProcessingStep reference)

#### Step 2 — Fallback for Action-Style Plugin Steps

If no CustomAPI XML is found, look for `SdkMessageProcessingStep` entries where `SdkMessage` contains the custom action name. Document from registration XML.

#### Step 3 — Invocation Examples

For the 5 most-called custom actions (identified by cross-referencing JS source and flow JSON), provide example invocations:

```javascript
// JavaScript (form script)
Xrm.WebApi.online.execute({
  getMetadata: () => ({
    boundParameter: null,
    parameterTypes: {
      "RuleName": { typeName: "Edm.String", structuralProperty: 1 },
      "EntityName": { typeName: "Edm.String", structuralProperty: 1 },
      "EntityId": { typeName: "Edm.Guid", structuralProperty: 1 }
    },
    operationType: 0,
    operationName: "aic_ValidationRuleCheck"
  }),
  RuleName: "NRIC_Checksum",
  EntityName: "contact",
  EntityId: formContext.data.entity.getId()
}).then(result => { ... });
```

---

### scope: adf

**Output:**
- `docs-generated/data-migration/adf-topology.md` — pipeline inventory, linked service inventory, trigger inventory
- `docs-generated/data-migration/pipelines/{Name}.md` — per-pipeline detail (one file per pipeline)
- `docs-generated/data-migration/dataflows/{Name}.md` — per-data-flow detail (one file per data flow, if complex enough)

Apply all rules from `constitution/05-adf-analysis.md`.

If `input/adf/` is empty or absent, write a stub `adf-topology.md` noting no ADF artifacts were found and stop.

For each pipeline:
1. Read `input/adf/pipelines/{Name}.json`
2. Document pipeline name, description, parameters, activity sequence (numbered list with dependencies)
3. Infer direction from linked service types (source → sink)
4. Flag: `⚠ ORPHANED PIPELINE` if no trigger references this pipeline; `⚠ NO ERROR HANDLING` if no IfCondition or Scope around failure-prone steps

For each linked service:
1. Read `input/adf/linkedServices/{Name}.json`
2. Document name, type, connection target (no credentials), auth method
3. Flag `⚠ SECURITY RISK` for `Basic` auth

For each data flow:
1. Read `input/adf/dataflows/{Name}.json` or `input/adf/dataflow/{Name}.json`
2. Document sources, transformation steps, sinks, column mappings if present

For each trigger:
1. Read `input/adf/triggers/{Name}.json`
2. Document type, schedule (convert CRON to human-readable), pipelines triggered

Include the handoff note at the top of `adf-topology.md` as specified in `constitution/05-adf-analysis.md`.

---

### scope: reporting

**Output:**
- `docs-generated/reporting/reporting-inventory.md` — summary of all SSRS and Power BI reports
- `docs-generated/reporting/ssrs/{ReportName}.md` — per-report detail for each SSRS/RDL file
- `docs-generated/reporting/power-bi/{ReportName}.md` — per-file inventory for each Power BI file

Apply all rules from `constitution/06-reporting-analysis.md`.

If `input/reporting/` is empty or absent, write a stub `reporting-inventory.md` noting no reporting artifacts were found and stop.

**SSRS / RDL processing:**

For each `.rdl` or `.rdlc` file:

1. Parse the XML — read `DataSources`, `DataSets`, `ReportParameters`, `Body/ReportItems`

2. **SQL / FetchXML extraction (mandatory):**
   - Read the `<CommandText>` element from each `<DataSet>`
   - **Include the full query text verbatim in the documentation.** Do not summarise or paraphrase.
   - If the query exceeds 60 lines, include the full query in a collapsible section (use HTML `<details>` block) and show the first 20 lines inline
   - Annotate the query: explain what each table/view represents in D365 CE context (`FilteredAic_clinic` = filtered view of aic_clinic entity, visible only to the running user's security context)
   - Identify the WHERE conditions and explain their business meaning (e.g. `aic_hsgstatus = 100000000` → "filters to Active HSG status")

3. **Column documentation:**
   - List every column in the dataset result: column alias, expression or field name, business meaning
   - Map dataset columns to report visual elements (which Tablix column shows this data)

4. **Dataset and parameter documentation:**
   - Dataset name, query type (SQL / FetchXML / Stored Procedure)
   - All `<ReportParameter>` elements: name, data type, prompt text, default value, available values dataset (if any)
   - Shared dataset references (`<SharedDataSetReference>`)

5. **Report layout documentation:**
   - For each Tablix: column count, row grouping expression, column grouping expression, sort
   - For each TextBox with expression: what it displays
   - For Subreports: referenced subreport name, parameters passed

6. **Pre-filtering check:**
   - Look for `EnablePrefiltering="1"` in DataSet properties or `CRM_FilteredXxx` parameter
   - If not found: `⚠ NO PRE-FILTERING` — describe exactly what data exposure risk this creates ("Any D365 user with access to this report sees ALL records regardless of their security role")

7. **For the 8 reports registered without RDL source:**
   - Create a stub `.md` file for each one in `docs-generated/reporting/ssrs/`
   - Include: report display name (from solution registration metadata), registration GUID, inferred purpose from name, action required
   - Flag: `⚠ SOURCE NOT PROVIDED — RDL not included in artefacts`

**Power BI processing:**

For each `.pbix` file:
1. Note file name, size, folder path
2. If a companion `.pbit` exists, parse the ZIP and extract from `DataModelSchema`:
   - All table names and their source queries
   - All measure names and their DAX expressions
   - Table relationships (from Relationships array)
   - Data source connections (from DataSources array — masked credentials)
3. Extract report page names from `Report/Layout` or `Report/definition/pages/*.json`
4. Document the `SecurityBindings` if present (RLS roles and filters)
5. Flag `⚠ BINARY ONLY` if no `.pbit` or companion JSON metadata exists

---

### scope: integrations

**Output:**
- `docs-generated/integrations/integration-topology.md`
- `docs-generated/integrations/azure-functions/{FunctionApp}.md`
- `docs-generated/integrations/logic-apps/{WorkflowName}.md`

Apply `constitution/04-integration-analysis.md` for all documentation rules.

For the integration topology document, build from all available evidence:
- Plugin source: HTTP calls, external service client instantiations
- Flow JSON: HTTP trigger flows, HTTP action calls, premium connector usage
- Azure Functions: HttpTrigger routes, ServiceBusTrigger queues, external HTTP calls
- Logic Apps: connector inventory, HTTP actions

For each external system identified:
- System name (business name where known)
- Direction: Inbound / Outbound / Bidirectional
- Integration mechanism: Plugin custom action / Power Automate HTTP trigger / Azure Function / Logic App
- Data exchanged: what entity data flows in each direction (field-level where determinable)
- Authentication method (from code/config evidence — flag ⚠ NEEDS VERIFICATION if not confirmed)
- NRIC/PII handling: if NRIC or PII fields are exchanged, document encryption/masking approach
- Error handling: retry logic, dead letter, logging target
- Per-operation specification: for each distinct API call / message exchange, document request shape and response shape

---

### scope: all

Run all scopes in this sequence:
entities → forms-views → security → flows → plugins → web-resources → pcf → custom-apis → integrations → adf → reporting

Print a combined completion report at the end.

## Completion Report

```
DOCUMENT COMPLETE — {scope}
════════════════════════════
Scope    : {scope}
Files written:
  {list each output file}
Flagged  : {N} ⚠ NEEDS REVIEW  |  {N} ⚠ UPGRADE RISK  |  {N} ⚠ SOURCE ONLY  |  {N} ⚠ BINARY ONLY
           {N} ⚠ SECURITY RISK  |  {N} ⚠ INLINE SQL  |  {N} ⚠ NO PRE-FILTERING  |  {N} ⚠ ORPHANED PIPELINE

Handoff packages:
  Data Migration agent : docs-generated/data-migration/adf-topology.md  (if ADF artifacts found)
  Reporting agent      : docs-generated/reporting/reporting-inventory.md  (if Power BI artifacts found)

Next steps:
  /fdd       — functional overview
  /tdd       — technical overview
  /blueprint — architecture blueprint
  /index     — navigation index
  /generate  — run full pipeline in one shot
```
