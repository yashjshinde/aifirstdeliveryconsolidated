# Integration Analysis Rules

## Azure Functions

### Trigger Type Documentation

| Trigger Type | What to Document |
|---|---|
| `HttpTrigger` | HTTP method, route template, auth level (Anonymous/Function/Admin), request/response shape |
| `ServiceBusTrigger` | Queue or topic name, subscription name, message format (JSON schema if determinable) |
| `TimerTrigger` | NCRONTAB expression → convert to human-readable schedule (e.g. `0 */5 * * * *` → "every 5 minutes") |
| `BlobTrigger` | Container name, blob path pattern, expected blob format |
| `EventHubTrigger` | Event Hub name, consumer group, expected event schema |
| `QueueTrigger` | Queue name, expected message format |

### D365 CE Operations in Functions
Look for:
- `IOrganizationService` or `ServiceClient` → direct Dataverse SDK calls
- `HttpClient` calls to `https://org.api.crm{N}.dynamics.com/api/data/v9.2/` → Dataverse Web API
- `Microsoft.PowerPlatform.Dataverse.Client.ServiceClient` → modern Dataverse client

For each Dataverse call, document: operation, target table/entity, key fields involved.

### Authentication Pattern
```
Function → Dataverse:
  - ServiceClient with Managed Identity → recommended (note: "Uses Managed Identity")
  - ServiceClient with client credentials → app registration (note: AppId/TenantId from config)
  - Hard-coded connection string → ⚠ SECURITY RISK

External System → Function:
  - Function-level key → standard; note if key is stored in consumer config
  - Anonymous → ⚠ SECURITY RISK — unauthenticated endpoint
  - Azure AD auth → ideal; note the authority and audience
```

### Error Handling Patterns
Document:
- `ILogger` usage → what is logged on error
- Retry policies (`Polly`, `RetryAttribute`) → retry count and backoff
- Dead letter: if output binding sends to DLQ on failure
- Response codes on HTTP functions: what HTTP status is returned on which error

---

## Logic Apps

### Connector Inventory
For each connector used, document:
- Connector name (e.g. "Dynamics 365", "Office 365 Outlook", "Azure Service Bus")
- Operations used (e.g. "List rows", "Send an email")
- Connection reference name (managed) or connection name (unmanaged)

### Action Flow Notation
Document the action sequence as a numbered list:
```
1. Trigger: When a record is created (Dynamics 365 — Lead)
2. Condition: If [Lead Source] equals "Web"
   True branch:
     3. Get record: Retrieve the Account matching [Company Name]
     4. HTTP: POST to https://api.external.com/leads with Lead data
     5. Update record: Set Lead [Integration Status] = "Sent"
   False branch:
     6. Terminate: Succeeded
```

### Error Handling in Logic Apps
- `runAfter` set to `["Failed","TimedOut","Skipped"]` on a Scope → error handling scope present
- No error handling scope → `⚠ TECHNICAL DEBT — failures silently ignored`
- `Terminate` action with `Failed` status and error message → proper failure signalling

### Data Transformation
Document any `Compose`, `Select`, `Filter array`, or expression logic:
- Expression used
- Input data shape
- Output data shape

---

## Integration Topology Template

When building the integration topology diagram, use this text notation:

```
[D365 CE]
    │
    ├──── Outbound (real-time) ────► [Azure Function: SyncLead]  ────► [External CRM]
    │                                    HttpTrigger / POST                REST API / OAuth
    │
    ├──── Outbound (async) ──────► [Service Bus: leads-queue]  ──► [Azure Function: ProcessLead]
    │                                    Post-Op Plugin                    ServiceBusTrigger
    │
    ├──── Inbound (scheduled) ───◄ [Logic App: ImportOrders]  ◄──── [ERP System]
    │                                    Timer / hourly                     REST API / API Key
    │
    └──── Bidirectional ──────────► [Azure Function: SyncContacts]  ◄──► [Marketing Platform]
                                        HttpTrigger (inbound) +               Webhook (inbound)
                                        ServiceClient (outbound)               REST API (outbound)
```

For each connection, always document:
- Direction (Outbound / Inbound / Bidirectional)
- Trigger mechanism
- Technology (Azure Function / Logic App / Direct HTTP / Service Bus)
- Authentication method
- Data exchanged (entity names, field names if determinable)
- Frequency / trigger type (real-time / scheduled / event-driven)
