# Document Generation Rules — Reporting

## 1. Audience and Tone

| Document | Primary Audience | Tone |
|---|---|---|
| Functional Design Document (FDD) | Business stakeholders, report consumers | Business language — no DAX, no SQL, no technical implementation detail |
| Technical Design Document (TDD) | Developers, data engineers | Technical — include DAX expressions, data model diagram, SQL queries |
| Solution Blueprint | Architects, delivery leads | Mixed — architecture patterns, deployment topology, risk summary |
| Test Plan | QA, UAT participants | Procedural — step-by-step, pass/fail criteria, test data instructions |
| Deployment Guide | DevOps, release team | Operational — exact commands, workspace IDs, checklist |

## 2. Mandatory Sections

Every generated document must include:
- YAML or structured front matter: feature, domain, status, version, date, author.
- Document Control table: version history with date, author, and change summary.
- Traceability: link every design decision back to a FR-NNN from the approved spec.

## 3. Completeness Rules

- Every report in the catalogue must be fully documented — no "see spec for details" references.
- Every measure must appear with its business definition (FDD) and DAX expression (TDD).
- Every RLS role must appear in both FDD (business description) and TDD (DAX filter expression).
- Gap flagging: any FR not fully addressed by the design must be flagged as a **Design Gap** — do not silently omit.

## 4. AI Notes

At the end of each major section and each individual FR/measure block, append:
`> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or risk flagged}.`
Write only what is non-obvious — never summarise section content.

## 5. Table Format Standards

- Use markdown tables for all structured data (measure catalogues, RLS roles, report catalogues, test cases).
- Minimum columns for measure tables: Measure Name | Business Definition | DAX Expression | Format | Source Table.
- Minimum columns for report catalogue: Report Name | Type | Audience | Data Source | Refresh | RLS Required.
- Minimum columns for RLS table: Role Name | Filter Condition | User Group | Test User.

## 6. Diagram Standards

- Architecture diagrams: use Mermaid `graph TD` or `graph LR` format embedded in markdown.
- Data model diagrams: use Mermaid `erDiagram` for star schema documentation.
- Deployment pipeline diagram: use Mermaid `graph LR` showing DEV → UAT → PROD flow with gate conditions.
- All diagrams must have a caption explaining what they show.

## 7. Naming Consistency

Throughout all generated documents:
- Report names must match the PBIX/RDL filename convention from `constitution/01-report-design-standards.md`.
- Measure names must match the Power BI model exactly (including square brackets: `[Total Revenue YTD]`).
- Workspace names must match the convention from `constitution/06-devops-alm.md`.
- Data source / entity names must use the schema names from the data source (Dataverse logical names, SQL table names).
