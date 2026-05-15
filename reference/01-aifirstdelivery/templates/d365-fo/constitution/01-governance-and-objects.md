# Governance and Object Framework

## 1. Purpose and Scope

This constitution establishes binding standards for all deliverables in the D365 F&O implementation. It applies to all custom objects (X++ code, SSRS, data entities, Power Platform, security, retail extensions, integrations, data migration) and all team members.

**Precedence:** Microsoft licensing terms → this constitution → workstream guidelines → team practices.

## 2. Governance Roles

| Role | Responsibility |
|---|---|
| Solution Architect | Owns this constitution; approves architectural deviations; final escalation point |
| Technical Lead | Enforces coding standards; approves all code reviews; manages branching strategy |
| Functional Lead(s) | Owns business requirement sign-off; validates designs meet process needs |
| Data Migration Lead | Governs all data entity and conversion activities; owns data quality sign-off |
| Integration Lead | Owns integration architecture; manages middleware and API contracts |
| QA Lead | Owns test strategy and entry/exit criteria for all objects |
| Release Manager | Controls deployments to non-development environments |

### RACI

| Decision | Solution Architect | Technical Lead | Functional Lead | QA Lead |
|---|---|---|---|---|
| Approve new object | A | C | R | I |
| Approve Extension approach | A | R | C | I |
| Approve data migration strategy | A | C | A (DM Lead) | I |
| Approve integration contract | A | R | C | I |
| Approve production deployment | A | R | I | C |
| Reject object failing code review | I | A/R | I | C |

**Escalation:** Developer → Technical Lead → Solution Architect → Programme Director. All blockers escalated within 1 business day.

## 3. Object Category Framework

### 3.1 Ten Object Categories

All deliverables must be classified into one of these ten categories:

| Category | Prefix | Description |
|---|---|---|
| Data Entities | DEN | Data Entity for integration, data migration, or configuration |
| Security Roles | SEC | Security Role — configure if standard exists, build if not |
| Power Platform | PPL | Custom Power Platform component (PowerApps, Power Automate) |
| Retail Extensions | RET | Custom Retail component (POS, HWS, CSU, CRT) |
| Workflows | WFL | D365 F&O native workflow or Power Automate cross-system flow |
| Business Documents | BDC | GER or SSRS business document |
| Analytical Reports | ANR | Power BI analytical report |
| Operational Reports | OPR | Form-based or SSRS operational report |
| Integrations | INT | Integration with an external system |
| Extensions | EXT | Custom X++ development not fitting another category |

### 3.2 Object Register

Every object must be registered before development begins:

| Field | Description |
|---|---|
| Object-ID | e.g., EXT-034, DEN-042, INT-022 |
| Category | One of the ten above |
| Object Name | Technical name |
| Business Requirement Ref | ALM work item ID |
| Complexity | Very Simple / Simple / Medium / Complex / Very Complex |
| Owner | Named developer/configurator |
| Status | Not Started / In Dev / In Review / In Test / Done / Retired |
| Environment Deployed | DEV / TEST / UAT / PROD |

### 3.3 Complexity Classification

| Complexity | Criteria | T-Shirt | Effort |
|---|---|---|---|
| Very Simple | Pure configuration; no custom code | XS | < 0.5 day |
| Simple | Minor config; single small extension; no business logic | S | 0.5 – 2 days |
| Medium | Limited custom X++; single integration endpoint; < 5 entities; moderate logic | M | 2 – 5 days |
| Complex | Significant custom logic; multiple integration endpoints; batch-heavy; cross-module | L | 5 – 15 days |
| Very Complex | Enterprise-grade; spanning multiple modules/systems; requires SA design review | XL | > 15 days |

Estimation requires Technical Lead peer-review for Medium, Complex, and Very Complex. Very Complex additionally requires Solution Architect review.

## Appendix A: Approved Module Codes

| Code | Module |
|---|---|
| GL | General Ledger |
| AP | Accounts Payable |
| AR | Accounts Receivable |
| FA | Fixed Assets |
| BUD | Budgeting |
| CASH | Cash & Bank Management |
| TAX | Tax |
| PO | Procurement & Sourcing |
| SO | Sales & Marketing |
| INV | Inventory Management |
| WH | Warehouse Management |
| MFG | Manufacturing / Production Control |
| PM | Project Management & Accounting |
| HR | Human Resources |
| PAY | Payroll |
| RET | Retail / Commerce |
| SYS | System / Cross-module |

## Appendix B: Object-ID Format

| Category | Prefix | Format | Example |
|---|---|---|---|
| Data Entities | DEN | DEN-NNN | DEN-042 |
| Security Roles | SEC | SEC-NNN | SEC-007 |
| Power Platform | PPL | PPL-NNN | PPL-015 |
| Retail Extensions | RET | RET-NNN | RET-003 |
| Workflows | WFL | WFL-NNN | WFL-021 |
| Business Documents | BDC | BDC-NNN | BDC-008 |
| Analytical Reports | ANR | ANR-NNN | ANR-011 |
| Operational Reports | OPR | OPR-NNN | OPR-019 |
| Integrations | INT | INT-NNN | INT-033 |
| Extensions | EXT | EXT-NNN | EXT-103 |
