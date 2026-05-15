<!--
integration-topology.template.md - Project-level integration topology roll-up.
Reads: all integration-asset docs + cross-refs
Emits: docs-generated/architecture/integration-topology.md
-->
---
artifact: synthesis-integration-topology
project: "{project}"
generated-at: "{generatedAt}"
generated-by: brownfield-engine
---

# Integration Topology — {project}

> System-context + per-pattern sequence diagrams + dataflow lineage across the entire integration surface. Mermaid-only.

## AI Summary

This integration topology covers {integrationArtefactCount} integration artefacts across {patternCategoryCount} pattern categories (event-driven / batch / data-migration). External systems identified: {externalSystemCount}.

## §1 System context (C4-L1)

```mermaid
{systemContextMermaid}
```

## §2 Containers (C4-L2)

```mermaid
{containersMermaid}
```

## §3 Per-pattern instance — sequence diagrams

> One sequence diagram per integration pattern instance (Function / Logic App / ADF pipeline / Service Bus topic flow / APIM operation).

{perPatternSequenceDiagrams}

## §4 ADF dataflow lineage

> Source -> staging -> conformed -> consumed-by.

```mermaid
{adfDataflowLineageMermaid}
```

## §5 Interface catalogue

| Interface | Type | Direction | Source | Target | Auth | NFR target |
|---|---|---|---|---|---|---|
{interfaceCatalogueRows}

## §6 Security topology

- **Managed identities**: {managedIdentitiesList}
- **Key Vault references**: {keyVaultRefsList}
- **Private endpoints**: {privateEndpointsList}
- **NSG egress rules**: {nsgEgressRulesList}

## §7 Observability surface

- **App Insights workspaces**: {appInsightsWorkspaces}
- **Log Analytics**: {logAnalyticsWorkspaces}
- **Alert rules**: {alertRulesList}
- **Custom metrics published**: {customMetricsList}

## §8 Detected anti-patterns

> Heuristic — reviewer to confirm.

{antiPatternsList}

## §9 Cross-references

- [docs-generated/00-index.md](../00-index.md)
- [docs-generated/architecture/solution-blueprint.md](solution-blueprint.md)
- Per-integration-asset docs in `docs-generated/technical/integration/`

---

_Synthesis doc. Heuristic anti-patterns marked **(inferred)** — reviewer to confirm._
