# Constitution — Model-Driven App Standards

## App Structure
- One model-driven app per business domain — do not create catch-all apps
- App name: `{OrgPrefix} {DomainName}` (e.g., `XYZ Sales`, `XYZ Customer Service`)
- Site map groups must reflect business navigation, not table names
- Include only the tables and views relevant to the app's user personas

## Forms
- Never modify the **default** main form of a system table — clone it first
- Form name: `{TableName} — {Purpose}` (e.g., `Account — Sales Main`)
- One main form per persona — do not stack all fields into a single form
- Use **tabs** for logical grouping; use **sections** within tabs
- Required fields must be marked as Business Required in form properties, not just via plugin
- Hide fields with JavaScript only when the hide/show rule cannot be done via Business Rules

## Views
- Do not modify OOB system views — create custom views
- View name: `{TableName} — {Purpose}` (e.g., `Account — Active (Sales)`)
- Every view must have at most 6 columns in the default layout
- Default sort column must be deliberate and documented

## Business Rules
- Use Business Rules for simple show/hide/require/set value logic — avoid JS for these
- Business Rules scope: set to `Entity` only when logic applies regardless of form
- Document every Business Rule in the technical design

## Dashboards and Charts
- Dashboard name: `{OrgPrefix} — {Purpose} Dashboard`
- Charts must have axis labels and a descriptive title
- Do not include personal dashboards in solution

## Site Map
- Group name matches the domain/module
- Sub-area title must match the table display name or a clear human-readable label
- Icon set for all groups and sub-areas
