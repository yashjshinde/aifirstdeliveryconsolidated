Generate a Functional Design Document (FDD) for a Reporting feature from an approved functional specification.

## Usage

```
/fdd {feature-name}
```

## Pre-condition Check

1. Read `specs/{feature-name}/review.md`.
2. If status is not `APPROVED`, stop: "Run /review first and resolve all BLOCKERs before generating the FDD."

## Steps

3. Read all files in `constitution/`.
4. Read `specs/{feature-name}/spec.md` in full.
5. Generate the FDD and write to `docs-generated/{feature-name}/functional-design-document.md`.
6. Print a section summary: sections written, FDD gaps flagged, stakeholder review items.

## Operating Principles

- Do NOT invent requirements or modify scope — only transform the spec into structured FDD format.
- Maintain strict traceability: Module → FR → Design Section → Acceptance Criteria.
- Use business language throughout — no DAX, no SQL, no Power BI Service configuration detail.
- Every section must reference back to FR-NNN where applicable.
- Flag any functional gap discovered during elaboration as an **FDD Gap** in the Functional Gap Log.

## FDD Structure

**§1 Document Control**
Version 1.0. Approvals table: Business Owner, IT Lead, Solution Architect, Project Manager — all Pending.

**§2 Introduction**
Purpose paragraph stating this is the authoritative reference for build and UAT. Scope lists every module. Definitions table covers report types, abbreviations, and KPI acronyms.

**§3 Reporting Overview**
- Business objective and reporting strategy.
- Report catalogue: one row per report with Name, Type, Audience, Data Source, Refresh, RLS.
- Personas table: every consumer role, their D365 CE / Azure AD security group, and the reports they access.

**§4 Business Process**
How reports are consumed in the business workflow — minimum 6 numbered steps covering: data collection → data refresh → report access → decision-making → exception handling. Reference FR-NNN at each step.

**§5 Functional Design**
One 5.X block per module. Mandatory 6-subsection structure:
- 5.X.1 Module Overview — scope, report types, data sources, dependencies
- 5.X.2 FRs — every FR from the spec: Report Type | Target Audience | Measures/KPIs | Filters | RLS Role | Refresh
- 5.X.3 Functional Logic — how the FRs work together as a business narrative
- 5.X.4 Validation & Exception Handling — what happens when data is missing, stale, or access is denied
- 5.X.5 Acceptance Criteria — Given/When/Then, minimum one per FR including one RLS scenario per FR with RLS
- 5.X.6 Traceability — FR Reference → Business Requirement → BR# → AC Ref

**§6 Data Considerations**
- Key tables and entities per dataset: Source System | Entity / Table | Direction | Key Fields.
- Data Dependencies: order in which sources must be refreshed before the report is valid.
- Data quality expectations: null handling, default values, out-of-range detection.

**§7 RLS Design**
- One section per RLS role: Role Name | Filter Description | User Group | Access Scope.
- Describe the business meaning of each filter in plain language (no DAX in FDD).
- Document what a user with no matching records sees (empty state behaviour).

**§8 Security Considerations**
- Workspace access: who has Viewer / Member / Admin access per environment.
- Sensitivity labels applied to each report and dataset.
- Subscription recipients and their access justification.
- Embedding security: service principal used, report surface (D365 CE / Canvas App / Portal).

**§9 Non-Functional Requirements**
Use specific numeric targets from the spec and `constitution/09-nfr-targets.md`. Write "TBC in refinement" where not yet defined.

**§10 Assumptions and Constraints**
Assumptions: data source availability, gateway configuration, capacity tier.
Constraints: delegation limits, DirectQuery throughput, SSRS server version, maximum PBIX size.

**§11 Out of Scope**
Table format with Module column. Draw from spec out-of-scope section. Flag new items as FDD Gaps.

**§12 Risks and Dependencies**
Key Risks table: Risk | Probability | Impact | Mitigation.
External Dependencies: Dependency | Owner | Required By FR-NNN.

**Appendix A — FR Traceability**
Every FR from the spec mapped to: Module | FDD Section | AC Reference.

**Appendix B — Report Catalogue (full)**
Every report: Name | Type | Workspace | Dataset | Pages | Measures Count | RLS Roles | Refresh Schedule | Export Formats.

## Completion Report

```
FDD COMPLETE
════════════
Feature      : {feature-name}
Modules      : {N} modules documented (§5)
FRs          : {N} functional requirements across all modules
Reports      : {N} reports in Appendix B catalogue
Datasets     : {N} datasets documented (§6)
RLS Roles    : {N} roles documented (§7)
Gaps         : {N} FDD Gaps logged
Output       : docs-generated/{feature-name}/functional-design-document.md
Next step: /testplan {feature-name}  or  /plan {feature-name}
```
