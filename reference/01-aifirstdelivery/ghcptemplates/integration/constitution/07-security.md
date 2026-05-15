# Constitution — Security

## Authentication
- Use **Managed Identity** (system-assigned or user-assigned) for all service-to-service auth
- No connection strings, passwords, or secrets in code or configuration files
- No service principal secrets in pipelines — use Federated Identity (OIDC) with GitHub/ADO

## Secrets Management
- All secrets stored in **Azure Key Vault**
- App Settings reference Key Vault: `@Microsoft.KeyVault(SecretUri=...)`
- Key Vault access via Managed Identity — no access policies using Object IDs directly (use RBAC)
- Secret rotation: document rotation procedure in deployment guide

## Network Security
- Functions, Logic Apps, and APIM backends must be on a VNet where possible
- Use Private Endpoints for Service Bus, Storage, Key Vault in production
- Disable public network access on storage accounts and service bus in production
- Inbound APIM: protected by WAF (Application Gateway or Front Door)

## Data Protection
- Identify all PII and sensitive fields at spec stage
- PII in transit: TLS 1.2 minimum
- PII at rest: use Azure-managed encryption (default) — CMK only if compliance requires
- PII in logs: mask before logging — never log passwords, tokens, or full card numbers

## RBAC
- Grant minimum required role to every Managed Identity
- Review role assignments quarterly
- Document every role assignment and its justification in the technical design

## Compliance
- Log all authentication events to Azure Monitor
- Enable Defender for Cloud on all integration resources
- Run security review before deploying to production
