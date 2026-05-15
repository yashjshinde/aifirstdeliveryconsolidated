# Constitution — Security Model (Power Apps)

## App-Level Security
- Canvas apps must have **Azure AD authentication** enabled — no anonymous access
- Model-driven apps inherit Dataverse security — no separate app-level security needed
- Share apps with **Azure AD Groups** not individuals — simplifies administration

## Dataverse Row-Level Security
- Use security roles with minimum privilege — never assign System Customizer to end users
- Role naming: `{SolutionName} — {Module} {Level}` (e.g., `XYZ CRM — Opportunities Read`)
- Business Unit hierarchy: use only when organisational data isolation is genuinely required
- Record sharing: use as exception-based access only — not the primary security model

## Column-Level Security
- Apply only to genuinely sensitive columns (salary, NI number, bank details)
- Document every field security profile and its business reason
- Never use field security to work around form design limitations

## Power Automate Security
- Flows must run in the context of an appropriate service account, not the flow creator
- Use **connection references** — do not embed personal connections
- Sensitive data in flow runs: disable **run history** logging for steps that handle credentials or PII

## Copilot Studio Security
- Authenticate users via Azure AD before allowing access to personal or sensitive data
- Use `User.Email` and `User.DisplayName` system variables — never ask users to type their own identity
- Restrict copilot publishing scope: Internal (Teams/Web) unless explicitly approved for public

## Environment Access
- Production environment: restricted to service accounts and release pipeline — no developer access
- Developers work in personal developer environments or a shared development environment
- System Administrator role in production: maximum 2 named individuals

## Secret Management
- No secrets, API keys, or passwords in solution files, canvas app connection strings, or flow action parameters
- All secrets must be stored in **Azure Key Vault**
- Environment Variables of type **Secret** must reference Key Vault — never store the raw value in Dataverse
- Flows connecting to Azure services must use **Managed Identity** via the Azure AD connector where supported
- Service account app registrations must follow least-privilege — grant only the API permissions required

## Dataverse Auditing
- Audit must be **enabled at the organisation level** in all non-Development environments
- Enable audit on every custom table that contains PII, financial, or compliance-relevant data
- Enable column-level audit on fields where change history is required (status transitions, financial amounts, consent fields)
- Audit retention: 7 years for PII/financial tables; 1 year for operational tables — align with `11-nfr-targets.md`
- The TDD must include an Audit Configuration section: every table and column with audit enabled and the business justification
