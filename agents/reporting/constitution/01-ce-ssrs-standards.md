---
agent: reporting
sub-area: ce-ssrs
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# CE SSRS Reporting Standards

## Data source selection

- **FetchXML** — default for CE-native reports. Preserves Dataverse security automatically; no SQL access required.
- **Pre-filtered SQL** — only on the legacy CRM On-Prem deployment with a documented gap that FetchXML cannot close. Forbidden on online tenants.

## Naming

- Report file: `{publisher-prefix}_{purpose}_Report.rdl` (e.g., `acme_CaseAging_Report.rdl`)
- Dataset name in the RDL: PascalCase (`CaseAgingDataset`)
- Parameter: `param{Name}` (e.g., `paramFromDate`, `paramOwningTeamId`)

## Parameter handling

Every report MUST expose:

- `paramFromDate` / `paramToDate` (when date-range matters) — defaulted to "last 30 days"
- `paramOrgId` — implicit in Dataverse; rely on the call context
- One business filter parameter per recurring usage path

Hidden internal parameters (e.g., a security key) are tolerated but documented in the TDD §parameter table.

## Security

- Reports inherit Dataverse security via FetchXML — NEVER bypass via `<link-entity>` joins that read past the calling user's privileges.
- For aggregated reports, explicit team-aggregation rules captured in the TDD.

## Layout conventions

- Page size: A4 portrait default; A4 landscape for dense matrix reports.
- Header carries publisher logo + report name + parameters echo + run timestamp.
- Footer carries page n/N + report path + user id (for audit).
- Group headers/footers numbered to allow stable references.

## Subscriptions

- Subscriptions per [02-power-bi-standards.md](02-power-bi-standards.md) governance — same security model applies.
- Snapshots stored 90 days default.

## Multilingual

Per [05-multilingual.md](05-multilingual.md): localise report labels via parameterised resource strings; never hard-code English in the RDL XML body.

## Authoring tool

Visual Studio with SSDT extension. Reports authored as `.rdl` files committed to the agent's `output/reports/ce-ssrs/` folder.

## See also

- [02-power-bi-standards.md](02-power-bi-standards.md)
- [03-data-sourcing.md](03-data-sourcing.md)
- [04-performance-and-refresh.md](04-performance-and-refresh.md)
