# D365 CE Constitution — Index

Every agent command MUST read all files in this folder before generating any output.
These rules are non-negotiable constraints, not suggestions.

## Files

| File | Covers |
|---|---|
| 00-architectural-principles.md | Config-first, loose coupling, idempotency, Dataverse as SoR |
| 01-solution-design.md | Solution structure, naming, layers, publisher |
| 02-plugin-standards.md | Plugin pipeline, error handling, tracing, images |
| 03-dataverse-schema.md | Table/column naming, relationships, keys, metadata |
| 04-javascript-standards.md | Xrm API usage, web resource standards, async patterns |
| 05-pcf-standards.md | PCF lifecycle, TypeScript, accessibility, testing |
| 06-security-model.md | Roles, privileges, field security, record ownership, Key Vault, auditing |
| 07-devops-alm.md | Branching, solution export, pipelines, environments |
| 08-testing-standards.md | Unit tests, coverage, naming, FakeXrmEasy, performance testing |
| 09-document-generation-rules.md | When and how to generate documents and code |
| 10-alm-configuration.md | ALM tool, work item hierarchy, field mapping, priority/status value maps, supported languages |
| 11-nfr-targets.md | Response time, availability, throughput, data retention, error rate targets |
| 12-field-service-entities.md | D365 Field Service OOB data model: Work Order, Booking, Customer Asset, Functional Location, Incident Type, Agreement, Time Entry, Inventory/RMA — extend, never replace |
| 13-field-service-scheduling-and-mobile.md | URS / Schedule Board / RSO scheduling; Field Service Mobile offline limits; Connected Field Service / IoT |
| 14-field-service-deprecations-and-integration.md | Mandatory deprecation gate (BLOCKER); Field Service ↔ F&O via Project Operations; Outlook/Teams collaboration |
| 15-multilingual-localization.md | Multi-language ready posture: schema English-only, RESX-based localization, translation CI, RTL, multilingual KB and email templates |

## How to Use

At the start of every command prompt include:
> "Read all files in constitution/ before proceeding. Treat every rule as a hard constraint.
>  If a user request conflicts with the constitution, flag it and propose a compliant alternative."
