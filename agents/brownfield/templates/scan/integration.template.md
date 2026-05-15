<!--
integration.template.md - SCAN TEMPLATE for the integration platform.
Consumed by /scan. Drives brownfield-engine/extractor.ts to enumerate every Azure-side integration artefact.
-->
---
platform: integration
scan-version: 1.0.0
consumed-by: brownfield-engine/extractor.ts
last-reviewed: 2026-05-15
---

# Scan Template — integration

## Pre-flight (`/prepare`)

- `_brownfield/input/integration/` exists
- At least one ARM template OR a folder structure containing Logic App / ADF / Function App definitions

## Extraction walk (`/scan`)

### Step 1 — Walk ARM templates

For each `.json` under `_brownfield/input/integration/`:
- Parse top-level `resources[]` array
- Dispatch to per-resource-type handler based on `type` field

| ARM `type` | Artifact-type emitted |
|---|---|
| `Microsoft.Web/sites @ kind=functionapp,kind=linux` | `function-app` |
| `Microsoft.Web/sites @ kind=workflowapp` | `logic-app-standard` |
| `Microsoft.Logic/workflows` | `logic-app-consumption` |
| `Microsoft.DataFactory/factories` | (container — enumerate sub-resources below) |
| `Microsoft.DataFactory/factories/pipelines` | `adf-pipeline` |
| `Microsoft.DataFactory/factories/linkedservices` | `adf-linked-service` |
| `Microsoft.DataFactory/factories/datasets` | `adf-dataset` |
| `Microsoft.DataFactory/factories/dataflows` | `adf-data-flow` |
| `Microsoft.DataFactory/factories/triggers` | `adf-trigger` |
| `Microsoft.DataFactory/factories/integrationruntimes` | `adf-ir` |
| `Microsoft.ServiceBus/namespaces` | (container) |
| `Microsoft.ServiceBus/namespaces/topics` | `sb-topic` |
| `Microsoft.ServiceBus/namespaces/topics/subscriptions` | `sb-subscription` |
| `Microsoft.ServiceBus/namespaces/queues` | `sb-queue` |
| `Microsoft.EventGrid/topics` | `eg-topic` |
| `Microsoft.EventGrid/topics/eventSubscriptions` | `eg-subscription` |
| `Microsoft.EventHub/namespaces/eventhubs` | `event-hub` |
| `Microsoft.ApiManagement/service` | (container) |
| `Microsoft.ApiManagement/service/products` | `apim-product` |
| `Microsoft.ApiManagement/service/apis` | `apim-api` |
| `Microsoft.ApiManagement/service/apis/operations` | `apim-operation` |
| `Microsoft.ApiManagement/service/apis/operations/policies` | `apim-policy` |
| `Microsoft.ApiManagement/service/backends` | `apim-backend` |
| `Microsoft.Storage/storageAccounts` | `storage-account` |
| `Microsoft.KeyVault/vaults` | `key-vault` |
| `Microsoft.OperationalInsights/workspaces` | `log-analytics` |
| `Microsoft.Insights/components` | `application-insights` |
| `Microsoft.Insights/metricAlerts` | `alert-rule` |
| `Microsoft.Insights/diagnosticSettings` | `diagnostic-setting` |
| `Microsoft.Network/privateEndpoints` | `private-endpoint` |
| `Microsoft.Network/networkSecurityGroups` | `nsg` |
| `Microsoft.ManagedIdentity/userAssignedIdentities` | `managed-identity` |
| (App Reg in AAD) | `app-registration` (when AAD export present) |

### Step 2 — Function App enumeration

For each Function App, walk the function source folder (when available):

```
walk: <function-app>/<function-name>/function.json   -> function-per-trigger
walk: <function-app>/<function-name>/run.cs|run.ts   -> source for validate_plugin_logic
walk: <function-app>/host.json                       -> attach to function-app artefact
```

Mark function as Durable Function (`durable-orchestrator`) when source contains `[OrchestrationTrigger]` or equivalent.

### Step 3 — Logic App walk

For each Logic App workflow `definition`:

```
parse: triggers.{name} -> Logic App trigger metadata
parse: actions.{name}  -> ordered action list (top-level)
       recurse into nested scopes preserving order
       capture: runAfter conditions for branch tracking
parse: connections.{ref} -> api-connection (cross-ref)
```

### Step 4 — ADF deep walk

For each ADF factory folder (ARM Export):

```
factory/linkedService/*.json    -> adf-linked-service
factory/pipeline/*.json         -> adf-pipeline (parse activities + dependsOn for sequence)
factory/dataset/*.json          -> adf-dataset
factory/dataflow/*.json         -> adf-data-flow
factory/trigger/*.json          -> adf-trigger
factory/integrationRuntime/*.json -> adf-ir
```

### Step 5 — APIM deep walk

```
service/products/*.json         -> apim-product
service/apis/*.json             -> apim-api (with operations array)
service/apis/<api>/operations/<op>/policy.xml -> apim-policy
service/backends/*.json         -> apim-backend
```

### Step 6 — SFTP, Cosmos, SQL surfaces

```
walk for resources of type Microsoft.Storage/storageAccounts /
       Microsoft.DocumentDB/databaseAccounts / Microsoft.Sql/servers/databases
```

### Step 7 — Custom Connectors

```
walk: customConnectors/*.json or *.swagger.json -> custom-connector
```

### Step 8 — Validate inventory coverage

`validate_inventory_coverage` against `inventory.platforms.integration`.

## Output schema

Conforms to [`schemas/brownfield-inventory.v1.json`](../../../schemas/brownfield-inventory.v1.json).

## See also

- [`constitution/platforms/integration.md`](../../constitution/platforms/integration.md)
- [`templates/bindings/integration/`](../bindings/integration/)
