---
agent: d365-fo
sub-domain: object-type-standards
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O Object-Type Standards (10 Categories)

> Per-category conventions for every F&O artefact type the agent produces. Full per-category catalogue PORTED VERBATIM from predecessor per R16; queued as bk-026. This v1 captures the category framework + key conventions per type.

## 1. Data Entities

- Composite + virtual + standard entities. Pattern: `<PrefixName>Entity`.
- Mandatory: staging table, target table, mappings, security key.
- DMF projects: one project per data area (Master Data / Reference Data / Transactional Data / Cutover).
- Object-ID prefix: `DEN-NNN`

## 2. Security (keys, duties, privileges, roles)

- Security keys gate table access at the configuration-key level.
- Duties + privileges defined per module's standard pattern.
- Role assignments documented per `project.config.yaml prefixes.publisher` naming convention.
- Object-ID prefix: `SEC-NNN`

## 3. Power Platform integration (virtual entities, business events)

- Virtual entities expose F&O data to Dataverse without replication.
- Business events for outbound notifications (Dataverse / Logic Apps consumers).
- Cross-references the integration agent for any Azure-side handler.

## 4. Retail (when retail module is in scope)

- Channel + hardware profile + payment connector extensions per Retail SDK pattern.
- POS extensions (when applicable) follow the Retail SDK conventions.

## 5. Workflows (F&O workflow framework)

- F&O native workflow framework - NOT Power Automate, NOT CE classic workflows.
- Approval / review / parallel branches per the framework's standard patterns.
- Object-ID prefix: `WFL-NNN`

## 6. Business Documents

- Print management, Word / Excel templates, electronic reporting (ER) configurations.
- ER format + model + mapping per the ER standard structure.
- Object-ID prefix: `BDC-NNN`

## 7. Reports (F&O-native SSRS)

- RDP-driven (Report Data Provider class) per the F&O SSRS pattern.
- CE SSRS reports + Power BI live in the reporting agent (NOT here).
- Per-report: RDP class + report design + parameter contract.

## 8. Integrations (service classes)

- SOAP / JSON service endpoints exposed via service groups.
- Inbound + outbound contracts documented.
- INT credentials stored in Key Vault (per [05-development-and-alm.md](05-development-and-alm.md)).
- Object-ID prefix: `INT-NNN`

## 9. Extensions (the 32-type catalogue)

The predecessor's "32-type extension catalogue" enumerates every supported extension type with its naming convention, base-class pattern, and lifecycle hooks. Full table PORTED in bk-026.

Headline categories:
- Table extensions (add fields, indexes, methods)
- Form extensions (add controls, modify visibility)
- Class extensions via Chain-of-Command (CoC)
- EDT (Extended Data Type) extensions
- Base enum extensions
- View extensions
- Query extensions

Object-ID prefix: `EXT-NNN`

## 10. Operations (batch + recurring data jobs)

- Batch jobs: implement `RunBaseBatch` or use the modern batch framework.
- Recurring data jobs: paired with a data entity + DMF project.
- Object-ID prefix: `OPR-NNN`

## Cross-reference

- Coding standards per object type: [04-extension-coding-standards.md](04-extension-coding-standards.md)
- Documentation requirements per object type: [06-documentation-and-change.md](06-documentation-and-change.md)
