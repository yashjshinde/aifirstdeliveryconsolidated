# Analysis Rules

## Entity Analysis

### Custom vs OOB Extended
- Custom entity: `Name` starts with publisher prefix (e.g. `pub_`) or `IsCustomEntity=true`
- OOB extended: standard entity name (account, contact, opportunity, etc.) with custom attributes or modified forms

### Field Classification
- **Custom field**: schema name starts with publisher prefix — document fully (type, required level, options, business purpose)
- **OOB field used as-is**: no documentation needed unless it has been renamed
- **OOB field customised** (made required, renamed, added to form): document the customisation

### Field Documentation — Mandatory Steps
For every custom entity, read all files under `input/solutions/{Package}/Entities/{EntityName}/Attributes/`.
For every attribute XML file found:
1. Extract: `Name` (schema name), `DisplayName`, `Type`, `RequiredLevel`, `Description`
2. For OptionSet/Picklist types: extract all `<OptionSetOption>` values and their labels
3. For Lookup/Customer types: extract the `ReferencedEntityName` (target entity)
4. For DateTime types: note the `Format` (DateOnly vs DateAndTime)
5. If `Description` is empty, infer purpose from the field name and entity context — flag as `⚠ NEEDS REVIEW — description inferred`

**Do not document fields by count.** Every field must have a row in the field dictionary table.

### Status Reason Analysis
For every custom entity, read the `statuscode` attribute XML.
Document every Status Reason value (integer code + label) and its business meaning.
Map which Status values correspond to which Status Reason values.

### Relationship Inference
- N:1 lookup from `pub_quoteline` to `opportunity` → Quote Lines belong to an Opportunity
- Self-referential lookup → hierarchical structure (e.g. Manager lookup on systemuser)
- Polymorphic lookup (`CustomerIdType`) → Customer field accepts both Account and Contact
- For every N:1 relationship, document: schema name, lookup field, target entity, relationship purpose

### Option Set Analysis
- Shared option sets: used across multiple entities — document once in a global reference table
- Local option sets: document inline with the entity
- Status / Status Reason: always document all values and their meaning

---

## Plugin Analysis

### Mandatory Source Reading
For every plugin class:
1. Locate the C# source file in `input/src/plugins/{AssemblyFolder}/`
2. Read the complete `Execute()` method
3. Document what you find — do NOT infer or assume behaviour from class names alone

If no source file exists, document from registration XML only and add: `> Source not available — documented from registration XML only.`

### Execution Logic Documentation
From the `Execute()` method, extract and document:

1. **Context extraction**: Every `context.InputParameters["..."]` and `context.PreEntityImages["..."]` / `context.PostEntityImages["..."]` access — what fields are being read
2. **Decision logic**: Every `if` / `else if` / `switch` that changes behaviour — document as: Condition → Action (if-then format)
3. **Dataverse operations**: Every `service.Create()`, `service.Update()`, `service.Retrieve()`, `service.RetrieveMultiple()`, `service.Delete()`, `service.Execute()` call — document: operation type, entity name, fields involved
4. **External calls**: Every `HttpClient.GetAsync()`, `HttpClient.PostAsync()`, `WebClient.*` — document: URL pattern (mask credentials), HTTP method, auth approach, request/response shape if visible
5. **Error messages**: Every `throw new InvalidPluginExecutionException("...")` — extract the exact message string
6. **Depth check**: Whether `context.Depth > 1` guard is present

### Depth Checking
If `context.Depth > 1` is checked, the plugin has recursion protection — note this.
If there is no depth check on a plugin that calls `service.Update()` on the same entity it triggers on, flag `⚠ UPGRADE RISK — potential recursion`.

### Stage Implications
- `PreValidation (10)`: runs before DB transaction — used for validation only; Dataverse rollback not guaranteed
- `PreOperation (20)`: runs inside DB transaction — used for data manipulation before save
- `PostOperation (40)`: runs after DB transaction — used for side effects; async variants don't block the user

### Execution Mode
- `Synchronous (0)` on `PostOperation`: blocks the user; flag if doing heavy computation or external HTTP calls as `⚠ UPGRADE RISK — performance`
- `Asynchronous (1)`: runs in background; note that failures appear in System Jobs

### Filtering Attributes
If `FilteringAttributes` is set: plugin only fires when those specific fields change.
Document this explicitly — it is important for understanding when the logic triggers.

### External HTTP Calls
- Any synchronous HTTP call in Pre-Operation or synchronous Post-Operation is a `⚠ UPGRADE RISK` — Microsoft may disable outbound HTTP in future sandbox changes
- Document: URL pattern, HTTP method, auth approach, timeout handling

---

## JavaScript Analysis

### Mandatory: Document Every File Individually
Every JS file in `input/src/web-resources/` and every WebResource in `input/solutions/*/WebResources/` MUST be documented in its own section.

**Grouping is prohibited.** Entries like "Other scripts (~N files)" or "Remaining scripts follow the same pattern" are never acceptable.

### Mandatory: Document Every Function
For each JS file, read the complete file content and document every function:
1. Function name and declaration signature
2. What event triggers it (form OnLoad, field OnChange, OnSave, ribbon button)
3. Every `formContext.getAttribute("...")` and `formContext.getControl("...")` call — fields read
4. Every `formContext.getAttribute("...").setValue(...)` and `formContext.getAttribute("...").setRequiredLevel(...)` call — fields written
5. Every `Xrm.WebApi.*` call — operation, entity, fields
6. Every `Xrm.Navigation.*` call
7. Every custom action call via `Xrm.WebApi.online.execute()` — action unique name, input parameters
8. Business purpose: what business rule does this function implement

### Client-Side Business Logic vs Server Duplication
If JS code validates or transforms data AND a plugin also does the same thing — flag: "Client-side logic may duplicate server-side plugin {PluginName} — verify intended behaviour."

### Deprecated API Detection
Flag all usage of:
- `Xrm.Page.*` → deprecated since D365 v9 — use `formContext` instead
- `getAttribute("field").fireOnChange()` → deprecated
- `Xrm.Utility.openEntityForm()` → deprecated — use `Xrm.Navigation.openEntityRecord()`

### Field Name Inference
When a JS function references `getAttribute("pub_taxcode")`, the field `pub_taxcode` is being read.
Document all fields read and written by each function.

### Dependency Map
For each JS file, document:
- Which other JS files or libraries it references (ClientGlobalContext.js.aspx, jQuery, etc.)
- Which forms it is registered on (cross-reference with form XML)

---

## Flow Analysis

### Mandatory: Document Every Flow Individually
Every Power Automate flow in `input/solutions/*/Workflows/` must be documented in its own section.

**"Follows the same pattern as above" is never acceptable.** Each flow has specific trigger conditions, filter criteria, and action sequences that must be individually documented.

### Trigger Entity Detection
For `ApiConnection` triggers with D365 CE connector:
- `ListRecords` on Create trigger → automated on record creation
- `WhenARecordIsCreatedOrUpdated` → automated on create/update; extract the `filterExpression` or `filterQuery` value exactly
- `WhenARecordIsDeleted` → automated on delete
- For scheduled flows: extract the recurrence interval and time

### Filter Condition Extraction
When a trigger has a filter expression or OData filter, extract it verbatim:
- `filterExpression`: `statuscode eq 1 and pub_approvalstatus eq 100000001`
- Document what this filter means in plain English

### Step-Level Purpose Inference
| Action OperationId | Purpose |
|---|---|
| `CreateRecord` / `CreateItemV2` | Creates a D365 CE record |
| `UpdateRecord` / `UpdateItemV2` | Updates a D365 CE record |
| `ListRecords` / `ListItemsV2` | Queries D365 CE records |
| `SendAnEmail(V2)` | Sends email via Exchange/Office 365 |
| `PostMessage` (Teams) | Posts to Microsoft Teams channel |
| `CreateOrUpdateItem` (SharePoint) | Creates/updates SharePoint item |
| Service Bus `SendMessage` | Publishes message to Service Bus |

### Action Sequence Documentation
For each flow, number all actions sequentially. For each action document:
- Action number and display name
- Operation type (from table above)
- For D365 operations: entity name, fields read/written
- For conditions/branches: condition expression and both branch outcomes
- For Apply-to-each loops: what collection is iterated and what happens per iteration
- For HTTP calls: URL, method, auth, what the response is used for

### Connection Reference Names
Connection references (not hard-coded connections) indicate a properly ALM-ready flow.
Hard-coded `@parameters('$connections')` referencing specific credentials → `⚠ TECHNICAL DEBT`

### Classic Workflow Analysis
For classic workflows (Workflow XML in `input/solutions/*/Workflows/`):
- Extract: display name, primary entity, trigger (record created / field change / on demand), activation status
- Document the step sequence (CheckCondition, WaitCondition, SendEmail, UpdateEntity steps)
- Each workflow gets a row in the classic workflows table — name, entity, trigger, status, summary

---

## Security Analysis

### Role Privilege Levels
- `0` = None
- `1` = User (own records only)
- `2` = Business Unit
- `4` = Parent: Child Business Units
- `8` = Organisation (all records)

### Privilege Matrix — Mandatory Extraction
For each security role XML in `input/solutions/*/Other/Roles/`:
1. Read all `<RolePrivilege>` elements
2. For each custom entity: extract Create / Read / Write / Delete / Append / Append To privilege depth codes
3. For key OOB entities (account, contact, systemuser, queue, etc.): extract privilege depth codes
4. Produce a privilege matrix table per role

Flag any custom entity granting Org-level Delete (`depth=8`) to a role other than System Administrator as `⚠ SECURITY RISK`.

### Field Security Profile Analysis
Look for `FieldSecurityProfile` elements in solution XML.
For each profile: which columns are protected, read access, update access, create access.
Document which roles are assigned which field security profiles.

### Integration User Detection
If a security role is named containing "Integration", "API", "Service", "System" — it is likely an application user role.
Document separately from human user roles.

---

## Integration Analysis

### Auth Pattern Classification
| Evidence | Authentication Pattern |
|---|---|
| `Authorization: Bearer {token}` with client_credentials grant | Client Credentials / App Registration |
| `ManagedIdentityCredential` or `DefaultAzureCredential` | Managed Identity (recommended) |
| Hard-coded API key in code or config | `⚠ SECURITY RISK — hard-coded credential` |
| `IConfiguration["ApiKey"]` | API key from configuration (acceptable if backed by Key Vault) |
| Connection string with `SharedAccessKey` | Service Bus SAS — flag if in code rather than Key Vault |

### Payload Schema Extraction
For each Azure Function or Logic App:
1. Read the function/workflow definition
2. Extract the request body schema (field names, types, required/optional)
3. Extract the response body schema
4. Document these as a payload table: Field | Type | Required | Description

### Error Handling Assessment
- Try/catch with `ILogger.LogError` → proper error logging
- Empty catch blocks → `⚠ TECHNICAL DEBT — silent error suppression`
- No retry logic on external HTTP calls → `⚠ TECHNICAL DEBT — no resilience`
- Dead letter queue handling for Service Bus → positive pattern, note it

---

## Reporting Analysis

### SSRS Report — Mandatory SQL Extraction
For every `.rdl` file in `input/reporting/`:
1. Read the full RDL XML
2. Locate every `<DataSet>` element
3. Extract the `<CommandText>` value verbatim — this is the SQL query; do NOT summarise or paraphrase it
4. Extract every `<ReportParameter>` element: name, data type, default value, prompt label
5. Extract every `<Field>` in each dataset: field name and value expression
6. Map fields to visible report columns/text boxes in the report body

### Power BI Analysis
For `.pbit` files (ZIP archives):
1. Extract and read `DataModelSchema` JSON
2. Document: tables, measures (DAX expressions), relationships (from/to table+column, cardinality)
3. For dataset-connected reports: record the dataset UUID and workspace reference
4. Document report pages and key visuals

For `.pbix` files where data model schema is accessible, apply the same rules.
