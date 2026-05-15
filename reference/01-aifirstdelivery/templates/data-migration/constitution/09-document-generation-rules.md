# Document Generation Rules

## General Rules

1. All documents must be Markdown (`.md`) unless the template specifies otherwise.
2. Use the templates in `doc-templates/` as the structural basis for every generated document.
3. Every document must have a header block with: Title, Version, Date, Author (agent), Status.
4. Do not leave placeholder text (e.g. `[TBD]`, `TODO`, `*pending*`) in documents that are marked APPROVED or FINAL.
5. Documents that reference ADF artifact names must use the exact names from the field mapping or pipeline design documents.

---

## Document Set per Migration

| Document | File | Status at generation |
|---|---|---|
| Migration Specification | `specs/{m}/spec.md` | DRAFT → APPROVED |
| Specification Review | `specs/{m}/review.md` | DRAFT |
| Field Mapping | `docs-generated/{m}/field-mapping.md` | DRAFT → APPROVED |
| Pipeline Design | `docs-generated/{m}/pipeline-design.md` | DRAFT → APPROVED |
| Test Plan and Strategy | `docs-generated/{m}/test-plan-and-strategy.md` | DRAFT |
| Technical Design Document | `docs-generated/{m}/technical-design-document.md` | DRAFT → APPROVED |
| Solution Blueprint | `docs-generated/{m}/solution-blueprint.md` | DRAFT → APPROVED |
| Deployment Guide | `docs-generated/{m}/deployment-guide.md` | DRAFT → FINAL |
| Runbook | `docs-generated/{m}/runbook.md` | DRAFT → FINAL |
| Release Notes | `docs-generated/{m}/release-notes.md` | DRAFT → FINAL |

---

## Section Requirements

### spec.md — Required Sections

1. Overview (direction, source system, target system, entities, volumes, frequency)
2. Business Justification
3. Source System Description (system name, format, connection type, authentication)
4. Target System Description
5. Staging Requirements
6. Data Volume and Frequency
7. Field Scope (include / exclude list)
8. Data Quality Rules
9. Error Handling Requirements
10. Security and Compliance Requirements
11. Non-Functional Requirements (performance, availability, retention)
12. Dependencies and Pre-conditions
13. Out of Scope

### field-mapping.md — Required Sections

1. Overview
2. Source Schema (table/file columns with types)
3. Target Schema (Dataverse entity / SFTP file columns)
4. Mapping Table (source field → target field → transformation → validation rule → classification)
5. Lookup / Reference Data
6. Derived / Calculated Fields
7. Fields Not Migrated (with reason)
8. Open Items

### pipeline-design.md — Required Sections

1. Architecture Diagram (ASCII or Mermaid)
2. Pipeline Inventory (all pipelines, datasets, linked services, data flows)
3. Orchestration Flow (parent → child pipeline call sequence)
4. Parameter Definitions
5. Trigger Configuration
6. Error Routing
7. Monitoring and Alerting
8. Open Items

### technical-design-document.md — Required Sections

1. Overview
2. Architecture
3. ADF Component Catalogue
4. SQL Staging Schema
5. Stored Procedure Design
6. Data Flow Design
7. Security Design
8. Error Handling Design
9. Deployment Steps
10. Rollback Procedure
11. Open Items

---

## Formatting Rules

- Use H2 (`##`) for major sections, H3 (`###`) for sub-sections.
- Tables for: field mappings, component inventories, parameter lists.
- Code blocks for: SQL DDL/DML, JSON snippets, PowerShell.
- Never embed full JSON files inline — reference the file path in `output/{migration}/adf/`.
- All architecture diagrams **must** use Mermaid syntax in triple-backtick `mermaid` code fences. ASCII art is prohibited.

---

## Approval Workflow

Documents are approved when the reviewer explicitly types one of:
- `APPROVED` — document is complete and correct
- `APPROVED WITH COMMENTS` — approved but comments must be addressed before next step

Documents must not be used as inputs to later commands until they carry an APPROVED status line at the top.
