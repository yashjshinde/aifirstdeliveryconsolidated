---
agent: integration
sub-area: bulk-dataverse
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Bulk Dataverse Loader Standards

## When to use which API

| Volume per batch | API | Notes |
|---|---|---|
| 1-99 rows | Web API `POST/PATCH` individual | Simple; one HTTP call per row |
| 100-1,000 rows | `ExecuteMultipleRequest` (SDK) | Batch up to 1000 ops with `Settings.ContinueOnError = true` |
| 1k-100k rows | Service-Bus + Function fan-out with `ExecuteMultipleRequest` | Throughput-tunable; observability via App Insights |
| 100k+ rows | Dataverse Storage API (bulk) or ADF Mapping Data Flow | Use sink-staging; respect daily API limits |

Do NOT call the Web API row-by-row above 1k rows — it eats licence-API limits.

## Alternate keys

- Always upsert by alternate key (NEVER by primary key from another system) — partial-failure resilience
- Define alternate keys at entity level in the d365-ce TDD; integration consumes them
- Format: `keyattributes` field on the request

```csharp
var req = new UpsertRequest {
  Target = new Entity("contact") {
    ["acme_externalid"] = "EXT-12345",
    ["firstname"] = "Ada"
  }
};
```

## ExecuteMultipleRequest

```csharp
var requests = batch.Select(BuildUpsertRequest).ToList();
var em = new ExecuteMultipleRequest {
  Requests = new OrganizationRequestCollection { ... },
  Settings = new ExecuteMultipleSettings {
    ContinueOnError = true,
    ReturnResponses = true
  }
};
var resp = (ExecuteMultipleResponse) service.Execute(em);
foreach (var r in resp.Responses.Where(r => r.Fault != null)) {
  log.LogError("Row {Index} failed: {Fault}", r.RequestIndex, r.Fault.Message);
}
```

## Throughput tuning

- Service Bus prefetch = 0 for the Function consumer (avoid double-locking)
- ExecuteMultiple batch size = 100 for tables with many lookups; 500 for simple tables
- Parallel Functions instances limited by `host.json maxConcurrentCalls` (default 16) and Service Bus session affinity

## Error categorisation

- **Transient** (HTTP 429, 503, SDK `WebFault`) → retry per [03-azure-functions-standards.md § Retry](03-azure-functions-standards.md)
- **Validation** (HTTP 400, business-rule rejection) → DLQ + manual review
- **Auth / Privilege** (HTTP 401, 403) → alert + fail fast (configuration bug, not data bug)

## Identity

- Service principal with Dataverse `Application User` permission
- Application User assigned the LEAST-privilege security role (commonly a custom `Integration Loader` role)
- Token refresh via MSAL; cache token until ~5 min before expiry

## See also

- [03-azure-functions-standards.md](03-azure-functions-standards.md)
- [05-service-bus-and-event-grid.md](05-service-bus-and-event-grid.md)
- [d365-ce constitution/00-charter.md § Customization inventory](../../d365-ce/constitution/00-charter.md) (alternate-key declarations live in CE TDD)
