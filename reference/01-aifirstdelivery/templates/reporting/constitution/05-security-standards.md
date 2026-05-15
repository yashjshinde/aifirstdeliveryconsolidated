# Security Standards — Reporting

## 1. Row-Level Security (RLS)

RLS is mandatory for any report that surfaces data restricted by organisational hierarchy, user role, or business unit.

### RLS Design Patterns

| Pattern | Use Case | Implementation |
|---|---|---|
| Static RLS | Fixed role-to-filter mapping (e.g., Sales EMEA sees only EMEA records) | DAX filter in Power BI role definition |
| Dynamic RLS | Filter based on logged-in user (e.g., user sees only their own accounts) | `USERPRINCIPALNAME()` in DAX filter against a user-mapping table |
| BU-based RLS | D365 CE Business Unit hierarchy | Join to a Business Unit dimension; filter on user's BU path |
| Manage roles via Dataverse | User-to-group mapping stored in Dataverse | Import user-group table; use as bridge in RLS DAX |

### RLS Requirements in Spec
Every spec for a report surfacing restricted data must include:
- Table of RLS roles: Role Name | Filter Applied | User Group | Test User
- DAX filter expression (or description of the logic)
- Confirmation that test users for each role are identified

### RLS Testing
- Every RLS role must be tested using Power BI Desktop "View as" feature before deployment.
- Testing evidence (screenshot or test log) must be linked in the test plan.

## 2. Workspace Permissions

| Role | Access Level | Who Gets It |
|---|---|---|
| Admin | Full admin | Service principal for ALM pipeline + designated workspace admins only |
| Member | Publish, edit, share | Report developers and data engineers |
| Contributor | Publish only | CI/CD service account |
| Viewer | View published content | Business users |

Never grant Admin to individual user accounts in PROD workspace. Use security groups.

## 3. Dataset Permissions

- **Build permission** must be explicitly granted to users who need to create reports on top of a shared dataset.
- **Re-share permission** must not be granted to end users — only to workspace members.
- Sensitive datasets must have sensitivity labels applied (Confidential / Highly Confidential) matching the organisation's classification policy.

## 4. Sensitivity Labels

Apply Microsoft Purview sensitivity labels to all PBIX files and published datasets:
- **Public**: aggregated KPIs with no PII, non-restricted commercial data.
- **Internal**: internal business metrics not suitable for external sharing.
- **Confidential**: contains personal data, financial records, or commercially sensitive data.
- **Highly Confidential**: contains data subject to legal/regulatory restriction (GDPR special categories, financial audit data).

All reports containing D365 CE entity data must be classified as **Confidential** minimum unless the data owner confirms otherwise.

## 5. Embedding Security

- Reports embedded in D365 CE or Power Apps must use **service principal** authentication — not user OAuth.
- The service principal must have Viewer access to the workspace and Build access to the dataset.
- Embedding tokens must not be stored client-side or in browser local storage.
- Power BI Embedded capacity must be in the same tenant as the data — cross-tenant embedding requires explicit approval.

## 6. Guest User Access

- External guest users must not have access to reports containing PII or Confidential data.
- Guest access to Power BI workspaces must be explicitly documented and approved.
- SSRS reports embedded in D365 CE are governed by D365 CE security roles — no separate Power BI guest access required.

## 7. Audit and Monitoring

- Power BI audit logs must be enabled at tenant level.
- Report access anomalies (unusual export volumes, access outside business hours) must be monitored via Power BI activity log.
- SSRS report execution logs must be retained for minimum 90 days.
