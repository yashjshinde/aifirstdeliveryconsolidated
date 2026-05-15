---
agent: reporting
sub-area: data-sourcing
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Data Sourcing Patterns

## Authoritative sources

| Source | When |
|---|---|
| **Dataverse direct** (CE data) | Low-to-moderate volume; near-real-time freshness; ≤ 5 GB extract |
| **Synapse Link for Dataverse** | Large CE datasets; CDC desired; data lake landing required |
| **BYOD** (F&O → SQL DB) | When F&O is the source AND a relational shape is needed |
| **Entity Store** (F&O) | Aggregate measures + pre-aggregated KPIs from F&O (read-only) |
| **Data lake export** (F&O) | F&O CDC into Azure Data Lake Gen2 in CDM folder format |
| **External SQL / SaaS** | Per-project case; document the source in the FDD |

## Source-selection rules

1. CE data + freshness < 15 min → Dataverse direct DirectQuery
2. CE data + bulk modeling → Synapse Link (Spark / SQL pool) → Power BI dataflow → dataset
3. F&O data + transactional shape → BYOD SQL DB → dataflow → dataset
4. F&O data + KPI aggregates only → Entity Store via virtual tables
5. F&O data + multi-source warehouse → data lake export → Synapse / Fabric Lakehouse → dataflow → dataset
6. Mixed CE + F&O → conformed warehouse layer (integration agent's responsibility); reporting consumes the warehouse

## Gateways

- Cloud-only sources: no gateway needed.
- On-prem sources: on-prem data gateway named per [02-power-bi-standards.md § Naming](02-power-bi-standards.md).
- Gateway clusters of size ≥ 2 for PROD; single-node OK for non-PROD.

## Credentials

- Service principals where supported (Azure SQL, Azure Storage, ADLS, Synapse).
- Managed identities not yet supported by every Power BI connector — document any password-credential exceptions in `project.config.yaml reporting.connections.*`.
- Credentials rotated annually; secret stored in customer Key Vault, not in dataflow XML.

## Source-to-report lineage

Every report's data source chain captured in `tdd.md`:

```
Dataverse (Account)
  → Dataflow df-dataverse-account (Power BI Premium)
    → Dataset ds-customer
      → Report rep-customer-aging
```

## Synapse Link nuance

- Initial sync time scales with table size — record initial-sync ETA in TDD per table.
- Incremental sync interval (Native = ~15 min default; configurable).
- Schema-change handling: ADDITIVE changes flow automatically; deletions / renames require Synapse Link reset (downtime windows captured in TDD).

## BYOD nuance

- BYOD export schedule defined in F&O DMF (per [d365-fo constitution/05-development-and-alm.md](../../d365-fo/constitution/05-development-and-alm.md)); reporting orchestrates the post-BYOD dataflow refresh.
- BYOD SQL DB owned by d365-fo project but the reporting agent has SELECT permissions via a service principal.

## See also

- [02-power-bi-standards.md](02-power-bi-standards.md)
- [04-performance-and-refresh.md](04-performance-and-refresh.md)
