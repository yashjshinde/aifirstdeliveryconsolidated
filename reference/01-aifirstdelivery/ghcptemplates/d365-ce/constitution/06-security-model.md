# Constitution — Security Model

## Record Ownership
- Default ownership model: **User or Team** unless the table is reference/configuration data
- Use org-owned tables only for lookup/reference data with no per-user access control need
- Never use `createdby` as the access-control field — use `ownerid`

## Privilege Design
- Create a dedicated security role per functional module, not per persona
- Assign roles to personas by combining module roles — no monolithic "Customizer-style" roles
- Role naming: `{SolutionName} — {ModuleName} {AccessLevel}`
  - Example: `Sales Enhancements — Opportunity Read`, `Sales Enhancements — Opportunity Full`
- Never modify the **System Administrator** or **System Customizer** roles
- Grant minimum required privilege — do not default to Organisation-level if User-level is sufficient

## Field-Level Security
- Apply field-level security only for genuinely sensitive fields (PII, financial, credentials)
- Do not use field security as a substitute for proper record-level security
- Document every field security profile and its business justification in the technical design

## Plugin Security Context
- Default to `context.UserId` for operations — preserves audit trail and respects record sharing
- Use system context (`null` userId) only when the operation must bypass user permissions, and document the reason explicitly in code and in the technical design

## Sharing
- Use Dataverse record sharing only for exception-based access — not as primary security model
- Shared records must be documented with revocation criteria

## Integration Users
- Integrations must use a dedicated application user (not a named user)
- Application user must have only the privileges required for the integration
- Never use a system administrator account for integration authentication

## Data Masking
- PII fields must be identified in the spec
- Masked fields in views/grids must use field security + a masked display format

## Secret Management
- No secrets, passwords, or API keys in solution files, connection strings, or environment variable plain-text values
- All secrets must be stored in **Azure Key Vault**
- Environment Variables of type **Secret** must reference Key Vault — never store the raw value in Dataverse
- Integration service accounts must use **Managed Identity** where the target service supports it (Azure services, Power Platform connectors with Azure AD support)
- Application registrations used for integrations must follow least-privilege — grant only the API permissions required

## Dataverse Auditing
- Audit must be **enabled at the organisation level** in all non-Development environments
- Enable audit on every custom table that contains PII, financial, or compliance-relevant data
- Enable audit on individual columns where field-level change tracking is required (e.g., status transitions, financial amounts)
- Audit retention: 7 years for PII/financial tables — align with the NFR targets in `11-nfr-targets.md`
- The TDD must include an Audit Configuration section listing every table and column with audit enabled and the business justification
