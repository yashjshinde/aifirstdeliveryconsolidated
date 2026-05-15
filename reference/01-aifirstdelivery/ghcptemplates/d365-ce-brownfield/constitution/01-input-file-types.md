# Input File Types — Interpretation Guide

## D365 CE Solution XML

### solution.xml
Key fields to extract:
- `UniqueName`: solution logical name
- `Version`: solution version (Major.Minor.Build.Revision)
- `Publisher/UniqueName` + `Publisher/CustomizationPrefix`: publisher details
- `Managed`: true/false

### Entities/*/Entity.xml
Key fields:
- `Name`: logical name (e.g. `pub_customerprofile`)
- `OriginalName` or `LocalizedNames/LocalizedName`: display name
- `OwnershipType`: UserOwned / OrganizationOwned / None
- `PrimaryNameAttribute`: primary field schema name
- `Description`: entity description (often empty — use logical name to infer)

### Entities/*/Attributes/*/attribute.xml
Key fields per attribute:
- `PhysicalName`: schema name
- `Type`: `string`, `integer`, `decimal`, `money`, `boolean`, `datetime`, `lookup`, `picklist`, `memo`, `uniqueidentifier`
- `DisplayMask`: RequiredForSave (required), Recommended, Optional
- `MaxLength` (string), `MinValue`/`MaxValue` (numeric), `Format` (datetime)
- For lookup: `Targets` (referenced entity logical names)
- For picklist: `optionset` block — extract each `option` value and label

### Entities/*/Relationships/
- `ManyToManyRelationship`: entity1, entity2, intersect entity name
- `ManyToOneRelationship`: ReferencingEntity, ReferencedEntity, ReferencingAttribute (the lookup field)

### WebResources/*.xml or webresources/ folder
- `Name`: schema name (e.g. `pub_/js/account_form.js`)
- `DisplayName`
- `WebResourceType`: 1=JS, 2=HTML, 3=CSS, 4=XML, 5=PNG, 6=JPG, 7=GIF, 8=XAP, 9=XSL, 10=ICO, 11=SVG, 12=RESX

### Workflows/*.json (Power Automate)
Top-level keys: `properties.displayName`, `properties.definition.triggers`, `properties.definition.actions`
- `triggers`: look for `type` (Recurrence / ApiConnection / Request / OpenApiConnection)
- For `ApiConnection` triggers: `host.operationId` reveals the D365 CE connector operation (e.g. `ListRecords`, `GetItem`)
- `actions`: recurse through each action — `type`, `inputs.host.operationId`, `runAfter`

### Workflows/*.xaml (Classic Workflow)
Key elements:
- `Activity` root: `DisplayName`, `Description`
- Look for `mxswa:ActivityReference` or `mxswa:SetEntityProperty` elements to identify logic
- Trigger: look for `TriggerOnCreate`, `TriggerOnAllAndsChange` attributes

### PluginAssemblies/*.xml
- `PluginAssembly`: `Name`, `Version`, `IsolationMode` (1=None, 2=Sandbox)
- `PluginType`: `TypeName` (fully qualified class name)
- `SdkMessageProcessingStep`: `Mode` (0=sync, 1=async), `Stage` (10=Pre-Val, 20=Pre-Op, 40=Post-Op), `SdkMessageId` (message name), `PrimaryObjectTypeCodeId` (entity)
- `SdkMessageProcessingStepImage`: `ImageType` (0=Pre, 1=Post), `Attributes` (comma-separated)

---

## C# Plugin Source

### Finding Plugin Classes
Look for classes implementing `IPlugin` with a public `Execute(IServiceProvider serviceProvider)` method.
Extract from Execute:
- `IPluginExecutionContext` access → `context.MessageName`, `context.Stage`, `context.PrimaryEntityName`, `context.Depth`
- `IOrganizationService` calls:
  - `service.Create(entity)` → creates a record of `entity.LogicalName`
  - `service.Update(entity)` → updates
  - `service.Delete(logicalName, id)` → deletes
  - `service.Retrieve(logicalName, id, columnSet)` → retrieves single
  - `service.RetrieveMultiple(query)` → retrieves collection; inspect `QueryExpression.EntityName` or FetchXML
  - `service.Execute(request)` → look at `request` type for specific operation
- `ITracingService` → used for diagnostics; extract `tracing.Trace()` messages as logic hints
- `HttpClient` / `WebClient` → external HTTP call; extract URL pattern if determinable
- Azure SDK calls: `ServiceBusClient`, `SecretClient` (Key Vault), `BlobServiceClient`

### Identifying Business Logic
Key patterns to document:
- `if (context.MessageName == "Create")` / `if (context.Stage == 20)` — conditional logic per trigger
- `context.PreEntityImages["PreImage"]` — pre-image access; note which attributes are read
- `context.PostEntityImages["PostImage"]` — post-image access
- `context.InputParameters["Target"]` — target entity; attributes being set/read
- `throw new InvalidPluginExecutionException(msg)` — user-facing error; extract message

### Plugin Registration Attributes
If using `CrmPluginRegistration` attribute:
```csharp
[CrmPluginRegistration("Create", "account", StageEnum.PreOperation, ExecutionModeEnum.Synchronous, ...)]
```
Extract: message, entity, stage, mode, filtering attributes.

---

## JavaScript Web Resources

### Event Handler Registration Patterns
Look for:
- `formContext.getAttribute("fieldname").addOnChange(handler)` — field change handler
- `executionContext.getFormContext()` in OnLoad — identifies the function as an OnLoad handler
- `Xrm.Page.getAttribute` (legacy) — still valid, but flag as `⚠ TECHNICAL DEBT` (deprecated API)
- Event handler name in function signature used as the form event handler entry point

### Xrm WebApi Patterns
- `Xrm.WebApi.retrieveMultipleRecords(entityName, options)` → read from table
- `Xrm.WebApi.createRecord(entityName, data)` → create record
- `Xrm.WebApi.updateRecord(entityName, id, data)` → update record
- `fetch(url)` or `XMLHttpRequest` → external call; note URL pattern

---

## PCF TypeScript

### ControlManifest.Input.xml
```xml
<control namespace="Publisher" constructor="ControlName" version="1.0.0" display-name-key="..." description-key="..." control-type="standard|virtual|dataset">
  <property name="PropName" display-name-key="..." description-key="..." of-type="SingleLine.Text" usage="bound|input" required="true" />
</control>
```
- `control-type="standard"` → field-level control
- `control-type="dataset"` → dataset/view-level control
- `usage="bound"` → two-way data binding with the field
- `usage="input"` → one-way configuration input

### index.ts Lifecycle
- `init(context, notifyOutputChanged, state, container)` → setup, first render
- `updateView(context)` → called on property change or record refresh; main rendering logic
- `getOutputs()` → what values are written back to the bound field
- `destroy()` → cleanup

---

## Azure Function Definitions

### function.json (in-process model)
```json
{ "bindings": [ { "type": "httpTrigger", "methods": ["POST"], "route": "..." }, { "type": "http", "direction": "out" } ] }
```
Extract: `type` (trigger type), `methods`, `route`, `queueName`/`topicName`/`subscriptionName` (Service Bus), `schedule` (timer).

### Isolated Worker / .NET 8 (Program.cs + attribute-based)
Look for `[Function("FunctionName")]` attribute and `[HttpTrigger]`, `[ServiceBusTrigger]`, `[TimerTrigger]` on input parameters.

---

## Logic App JSON

### Consumption (workflow definition)
Top-level: `definition.triggers`, `definition.actions`
- Each trigger has `type`: `Request`, `Recurrence`, `ApiConnection`
- Each action has `type`: `Http`, `ApiConnection`, `If`, `Foreach`, `Scope`, `Terminate`
- For `ApiConnection`: `inputs.host.connection.name` = connection reference, `inputs.host.operationId` = specific operation

### Standard (workflow.json)
Similar structure but nested under `definition.actions` with potentially different connector identifiers.
Look for D365 CE connector operations: `ListItemsV2`, `CreateItemV2`, `UpdateItemV2`, `GetItemV2`.

---

## Azure Data Factory Artifacts (`input/adf/`)

ADF artifact files follow the standard Azure Data Factory JSON export format. Apply the documentation rules in `constitution/05-adf-analysis.md` to these files.

### `pipelines/{Name}.json`
Key fields:
- `name` — pipeline display name
- `properties.description` — description (often empty; infer from activity names)
- `properties.parameters` — pipeline parameters: name, type, default value
- `properties.activities[]` — array of activity objects:
  - `name`, `type`, `dependsOn[].activity` + `dependsOn[].dependencyConditions[]`
  - For Copy: `typeProperties.source.type`, `typeProperties.sink.type`, `typeProperties.source.query`, `typeProperties.sink.tableName`
  - For DataFlow: `typeProperties.dataflow.referenceName`
  - For ForEach: `typeProperties.items.value`, `typeProperties.activities[]` (nested)
  - For IfCondition: `typeProperties.expression.value`, `typeProperties.ifTrueActivities[]`, `typeProperties.ifFalseActivities[]`
  - For SqlServerStoredProcedure: `typeProperties.storedProcedureName`

### `linkedServices/{Name}.json`
Key fields:
- `name` — linked service logical name
- `properties.type` — e.g. `AzureSqlDatabase`, `SftpServer`, `AzureDataLakeStorage`, `Dataverse`, `AzureBlob`, `CosmosDb`
- `properties.typeProperties.server` / `url` / `host` — connection target (exclude credentials)
- `properties.typeProperties.authenticationType` — `ServicePrincipal`, `ManagedIdentity`, `Basic`, `Key`

### `datasets/{Name}.json`
Key fields:
- `name` — dataset name
- `properties.type` — e.g. `AzureSqlTable`, `DelimitedText`, `Json`, `Parquet`, `Binary`
- `properties.linkedServiceName.referenceName` — linked service reference
- `properties.typeProperties.tableName` / `fileName` / `folderPath` — target location
- `properties.schema[]` — column names and types if present

### `dataflows/{Name}.json` or `dataflow/{Name}.json`
Key fields:
- `name` — data flow name
- `properties.type` — usually `MappingDataFlow`
- `properties.typeProperties.sources[]` — source dataset references
- `properties.typeProperties.sinks[]` — sink dataset references
- `properties.typeProperties.transformations[]` — transformation step names
- `properties.typeProperties.script` — data flow DSL script (parse for filter/join/derive logic)

### `triggers/{Name}.json`
Key fields:
- `name` — trigger name
- `properties.type` — `ScheduleTrigger`, `TumblingWindowTrigger`, `BlobEventsTrigger`, `CustomEventsTrigger`
- For ScheduleTrigger: `properties.typeProperties.recurrence.frequency` + `interval` + `schedule` (CRON-like)
- For BlobEventsTrigger: `properties.typeProperties.blobPathBeginsWith`, `typeProperties.events[]` (`Microsoft.Storage.BlobCreated` / `Microsoft.Storage.BlobDeleted`)
- `properties.pipelines[]` — pipelines this trigger fires: `pipelineReference.referenceName`

---

## SSRS / RDL Files (`input/reporting/*.rdl`, `*.rdlc`, `*.rds`)

SSRS report definitions are XML files. Apply the documentation rules in `constitution/06-reporting-analysis.md`.

### `{ReportName}.rdl` or `{ReportName}.rdlc`
Root element: `<Report>` (namespace `http://schemas.microsoft.com/sqlserver/reporting/2010/01/reportdefinition`)

Key elements:
- `Report/DataSources/DataSource` — `Name` attribute + `ConnectionProperties/DataProvider` (e.g. `MSSQL`, `MSCRM`, `OData`) + `ConnectionString`
- `Report/DataSets/DataSet` — `Name` attribute + `Query/CommandText` (FetchXML or SQL) + `Query/QueryParameters/QueryParameter[]`
- `Report/ReportParameters/ReportParameter` — `Name`, `DataType`, `Prompt`, `DefaultValue/Values/Value`, `ValidValues/DataSetReference`
- `Report/Body/ReportItems` — top-level visual items: `Tablix`, `TextBox`, `Subreport`, `Chart`, `Image`
  - For `Tablix`: `TablixBody/TablixColumns`, `TablixRowHierarchy`, `TablixColumnHierarchy`, `SortExpressions`
  - For `Subreport`: `ReportName` (referenced subreport), `Parameters/Parameter[]` (passed parameters)
- Pre-filtering: look for `EnablePrefiltering="1"` in `DataSet/Query/CommandText` attribute or custom report properties
- Report properties: check `<CustomProperties>` for `EnablePrefiltering`, `ReportCategory`

### `{Name}.rds` (Shared Data Source)
- `Name`, `ConnectString`, `DataProvider`, `IntegratedSecurity`

---

## Power BI Files (`input/reporting/*.pbix`, `*.pbit`)

Power BI Desktop files (`.pbix`) are binary ZIP archives. Extract what is available without Power BI tooling.

### `.pbix` files
A `.pbix` is a ZIP. If you can inspect it, look for:
- `Report/Layout` — JSON with page names (tabs), visual types
- `DataModel` — binary (cannot parse without SSAS tooling); note size
- `Connections` — JSON with connection strings (masked)
- `DataMashup` — M query language definitions (if accessible, extract table names)

If the binary cannot be inspected, document at file-name level only:
- File name → use as report name
- File size → proxy for complexity
- Folder location → `input/reporting/`

### `.pbit` files (Power BI Template)
`.pbit` is a ZIP with readable JSON:
- `DataModelSchema` — table names, measure names (Title Case)
- `ReportLayout` — page names, visual counts per page

Extract from `.pbit` what would be inferred from `.pbix` alone.

---

## Provided Documents (.md or .txt in documents/)

Read these files first — they provide explicit business context that may not be inferrable from code.
- Treat stated requirements as authoritative for business intent
- Cross-reference against artefacts to confirm implementation
- Note discrepancies: "Document states X; implementation evidence suggests Y — `⚠ NEEDS REVIEW`"
- Attribute sourced content: *(from: filename.md)*
