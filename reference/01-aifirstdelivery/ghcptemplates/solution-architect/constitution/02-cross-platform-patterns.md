# Cross-Platform Integration Patterns

## Approved Patterns

### D365 CE → Azure Integration

- A D365 CE synchronous plugin or Power Automate flow publishes an event to **Azure Service Bus**.
- An Azure Function subscribes and processes the message downstream.
- Authentication: Azure Function uses **Managed Identity** — no connection strings in the plugin.
- Dead-letter queue handling and alerting must be addressed.

### Power Apps → Azure Integration

- A Canvas App or Power Automate flow calls an HTTP action against **APIM**.
- APIM validates the caller's **Azure AD token** before forwarding to the Azure Function.
- No direct Service Bus binding from Power Apps — APIM is the gateway.
- APIM policy enforces rate limiting and RFC 7807 error normalisation.

### Azure Integration → D365 CE / Dataverse

- Azure Function writes to Dataverse using the **Dataverse Web API** or SDK.
- Authentication: Function uses **Managed Identity** configured as a Dataverse Application User.
- Retry policy on Dataverse write: 3 attempts, exponential back-off, idempotent upsert pattern.
- No hardcoded organisation URL — use environment variable or Key Vault secret.

### Power Apps ↔ D365 CE (same Dataverse org)

- Canvas Apps and Model-Driven Apps sharing the same Dataverse org read/write directly — no integration layer required.
- Schema changes must be compatible with both app types (delegation-safe column types).
- Security roles must be consistent — a role used by the Canvas App is the same Dataverse role referenced in D365 CE plugins.

### D365 CE Plugin → Power Automate Flow

- D365 CE plugins may call a Power Automate HTTP-triggered flow only for notifications or non-transactional side effects.
- Must not use a synchronous plugin to call a flow inline (latency and reliability risk) — use Post-Operation or async.

## Cross-Template Naming Contract

When the same resource is referenced from multiple templates, use the names defined in the sibling constitutions:

| Resource | Source of truth |
|---|---|
| Dataverse publisher prefix | `../d365-ce/constitution/01-solution-design.md` |
| Dataverse table schema names | `../power-apps/constitution/04-dataverse-schema.md` (or d365-ce if power-apps not present) |
| Azure resource naming prefix | `../integration/constitution/01-integration-patterns.md` |
| Managed Identity name | `../integration/constitution/07-security.md` |
| Key Vault name | `../integration/constitution/07-security.md` |

If the same resource is named differently across templates, flag it as a **BLOCKER risk** in Section 8 of the blueprint and propose a resolution.

## Anti-Patterns (must be flagged as risks if detected in inputs)

| Anti-pattern | Risk category |
|---|---|
| Hardcoded org URL, connection string, or GUID in any component | Security Risk |
| Synchronous D365 plugin making an outbound HTTP call to Azure | Technical Risk |
| Canvas App binding directly to Service Bus | Architecture Risk |
| Two templates defining the same Dataverse table with different schema names | Integration Risk |
| Azure Function using client secret instead of Managed Identity | Security Risk |
| Power Automate flow using a personal connection instead of a connection reference | ALM Risk |
