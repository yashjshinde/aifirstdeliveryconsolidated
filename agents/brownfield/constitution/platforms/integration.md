---
agent: brownfield
sub-area: platforms/integration
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Platform Rules — integration (brownfield)

## Accepted input file types

Under `_brownfield/input/integration/`:

| Input | Format | Notes |
|---|---|---|
| ARM template | `.json` (azuredeploy.json + parameters) | Preferred — declarative source of truth for Azure resources |
| Bicep | `.bicep` | When ARM JSON not exported; transpile to ARM for analysis |
| Function App ZIP | `.zip` | Compiled assemblies + `host.json` + `function.json` per function |
| Function source | `.cs` / `.ts` / `.js` (per function folder) | Optional; enables full body analysis |
| Logic App Consumption | `.json` workflow definition | Each workflow.json |
| Logic App Standard | folder w/ `workflow.json` per workflow + `host.json` | Single-tenant |
| ADF | folder under `dataFactory/` w/ `linkedService/`, `pipeline/`, `dataset/`, `trigger/`, `dataflow/`, `integrationRuntime/` JSONs | Exported via ADF Studio "Export ARM" |
| APIM | `policies/`, `apis/`, `products/`, `backends/` (per ARM export structure) | API definitions in OpenAPI 3.0 preferred |
| Service Bus | ARM resource definitions for namespace + topics + queues + subscriptions | |
| Event Grid | ARM for topics + subscriptions | |

## Scan strategy

1. Walk every `*.json` in `_brownfield/input/integration/` filtering by ARM resource type:
   - `Microsoft.Web/sites` (function-app)
   - `Microsoft.Logic/workflows` (logic-app-consumption)
   - `Microsoft.Web/sites @ kind=workflowapp` (logic-app-standard)
   - `Microsoft.DataFactory/factories/*` (ADF)
   - `Microsoft.ServiceBus/namespaces/*` (Service Bus)
   - `Microsoft.EventGrid/topics`, `eventSubscriptions` (Event Grid)
   - `Microsoft.ApiManagement/service/*` (APIM)
   - `Microsoft.KeyVault/vaults` (Key Vault — surfaced for cross-ref)
   - `Microsoft.Storage/storageAccounts` (storage)
2. For each Function App, walk `host.json` + per-function `function.json` → enumerate functions per trigger
3. For each Logic App, parse the workflow definition → enumerate triggers + actions
4. For each ADF factory, walk per-resource folders → enumerate pipelines / linked services / datasets / triggers / dataflows / IRs
5. For each APIM service, walk products + APIs (per operation) + policies (global + product + API + operation)

## Module detection signals (integration side)

No module gating at the integration platform level (Azure resources don't carry module concepts in the way Dynamics does). All artifact types always run.

## Analysis rules

### Function Apps + Functions

- One doc per **function** (NOT per Function App; one Function App is documented as a container under `container-asset`)
- Per function: trigger type + bindings + retry policy + auth mode + idempotency strategy
- Logic narrative requires `validate_plugin_logic` semantics (analogous): source `.cs` enables full Execute body; compiled binary alone → `BLOCKED-BY-BINARY` gap

### Logic Apps

- One doc per workflow
- Logic narrative: trigger + numbered actions (top-level) + branches + error handling scopes
- Connection references separately captured; cross-ref into the workflow doc

### ADF

- Per pipeline: activities (sequential vs parallel), parameters, triggers, dataset dependencies
- Per linked service: type, connection-string-pattern, auth (MI / SP / key)
- Per dataset: schema, format, partitioning
- Per dataflow: source + sink + transformations
- Per trigger: schedule / event-grid / tumbling-window

### Service Bus

- Topology graph: namespace → topic → subscription → consumer
- For each subscription: filters + rules + dead-letter strategy

### APIM

- Per product: APIs included + subscription gating
- Per API: operations + backend + policies (global / product / API / operation chain captured per Microsoft inheritance order)
- Per policy: full XML quoted (verbatim)

### Custom Connectors

- Schema (operations + parameters) + auth + connection-reference targets

## Cross-references for integration

- function ↔ service-bus-subscription (`function.bindings[*].connection == sb.namespace`)
- function ↔ storage-account (blob/queue triggers)
- logic-app ↔ api-connection (workflow.connections[*])
- adf-pipeline ↔ adf-linked-service ↔ source resources
- apim-operation ↔ apim-backend ↔ function-app / Azure-resource

## See also

- [04-input-file-types-base.md](../04-input-file-types-base.md)
- [`templates/bindings/integration/`](../../templates/bindings/integration/)
- [`templates/scan/integration.template.md`](../../templates/scan/integration.template.md)
