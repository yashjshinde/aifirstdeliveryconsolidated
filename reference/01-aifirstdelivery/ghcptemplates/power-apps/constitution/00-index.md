# Power Platform Constitution — Index

Every agent command MUST read all files in this folder before generating any output.
These rules are non-negotiable constraints, not suggestions.

## Files

| File | Covers |
|---|---|
| 00-architectural-principles.md | Config-first, delegation awareness, child flows, solution layering, Dataverse as SoR |
| 01-canvas-apps.md | Canvas app design, formula standards, performance |
| 02-model-driven-apps.md | Model-driven app structure, views, forms, dashboards |
| 03-power-automate.md | Cloud flow standards, error handling, connectors |
| 04-dataverse-schema.md | Tables, columns, naming, relationships for Power Apps |
| 05-copilot-studio.md | Copilot topics, entities, escalation, testing |
| 06-security-model.md | Roles, row-level security, sharing, Key Vault, Dataverse auditing |
| 07-devops-alm.md | Solution ALM, pipelines, environment strategy |
| 08-testing-standards.md | Test Studio, flow testing, performance testing |
| 09-document-generation-rules.md | When and how to generate documents and code |
| 10-alm-configuration.md | ALM tool, work item hierarchy, field mapping, priority/status value maps |
| 11-nfr-targets.md | Canvas load time, delegation limits, flow duration, availability, retention targets |

## How to Use

At the start of every command prompt include:
> "Read all files in constitution/ before proceeding. Treat every rule as a hard constraint.
>  If a user request conflicts with the constitution, flag it and propose a compliant alternative."
