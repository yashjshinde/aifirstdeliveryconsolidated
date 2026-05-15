# /index — Generate Master Navigation Index

Build a `00-index.md` linking all generated documentation for the project.

## Usage

```
/index
```

## Pre-condition Check

Check `docs-generated/component-inventory.md` exists.
If not, stop: "Run `/scan` first."

## Steps

1. Scan `docs-generated/` recursively — list every `.md` file found.
2. Read the first 5 lines of each file to extract its title and status.
3. Build the index with documentation status table and section links.
4. Write `docs-generated/00-index.md`.
5. Print completion report.

## Index Structure

```markdown
# {Project Name} — Documentation Index

Generated: {date}  |  Publisher: {publisher-name} [{publisher-prefix}]

## Documentation Status

| Document | Status | Location |
|---|---|---|
| Component Inventory | COMPLETE | component-inventory.md |
| Functional Overview | COMPLETE / NOT YET GENERATED | functional/functional-overview.md |
| Entity Catalogue | COMPLETE / NOT YET GENERATED | functional/entity-catalogue.md |
| Forms & Views | ... | functional/forms-and-views.md |
| Flows | ... | functional/flows.md |
| Security Model | ... | functional/security-model.md |
| Technical Overview | ... | technical/technical-overview.md |
| Plugins | ... | technical/plugins/ |
| Web Resources | ... | technical/web-resources/ |
| PCF Controls | ... | technical/pcf/ |
| Custom APIs | ... | technical/custom-apis.md |
| Integration Topology | ... | integrations/integration-topology.md |
| Azure Functions | ... | integrations/azure-functions/ |
| Logic Apps | ... | integrations/logic-apps/ |
| Solution Blueprint | ... | architecture/solution-blueprint.md |
| Data Model | ... | architecture/data-model.md |
| Dependency Map | ... | architecture/dependency-map.md |
| Impact Map | ... | architecture/impact-map.md |

---

## Solution Packages

| Package | Version | Entities | Plugins | Web Resources | Flows | Notes |
|---|---|---|---|---|---|---|
| {PackageName} | {v} | {N} | {N} | {N} | {N} | base entities |

(from component-inventory.md)

---

## Discovery
- [Component Inventory](component-inventory.md) — full project component catalogue

## Functional Documentation
- [Functional Overview](functional/functional-overview.md) *(if exists)*
- [Entity Catalogue](functional/entity-catalogue.md) *(if exists)*
- [Forms & Views](functional/forms-and-views.md) *(if exists)*
- [Power Automate Flows](functional/flows.md) *(if exists)*
- [Security Model](functional/security-model.md) *(if exists)*

## Technical Documentation
- [Technical Overview](technical/technical-overview.md) *(if exists)*
- **Plugins** *(one link per file in technical/plugins/)*
- **Web Resources** *(one link per file in technical/web-resources/)*
- **PCF Controls** *(one link per file in technical/pcf/)*
- [Custom APIs](technical/custom-apis.md) *(if exists)*

## Integration Documentation
- [Integration Topology](integrations/integration-topology.md) *(if exists)*
- **Azure Functions** *(one link per file)*
- **Logic Apps** *(one link per file)*

## Architecture Documentation
- [Solution Blueprint](architecture/solution-blueprint.md) *(if exists)*
- [Data Model](architecture/data-model.md) *(if exists)*
- [Dependency Map](architecture/dependency-map.md) *(if exists)*
- [Impact Map](architecture/impact-map.md) *(if exists — developer reference: "what touches entity/field X")*

---

## Component Counts

| Type | Count | Across Packages |
|---|---|---|
| Custom Entities | {N} | {N} packages |
| Plugin Steps | {N} | {N} assemblies |
| Web Resources | {N} | {N} namespace groups |
| PCF Controls | {N} | — |
| Power Automate Flows | {N} | {N} packages |
| Security Roles | {N} | {N} packages |
| Azure Functions | {N} | {N} apps |
| Logic Apps | {N} | — |

## Outstanding Documentation Gaps

- [ ] {scope} — run `/document {scope}` to generate
```

Only mark COMPLETE if the file exists on disk.

## Completion Report

```
INDEX COMPLETE
══════════════
Project      : {project-name}
Files linked : {N}  |  Complete: {N}  |  Pending: {N}
Output       : docs-generated/00-index.md
```
