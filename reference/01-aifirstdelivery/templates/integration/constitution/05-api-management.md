# Constitution — API Management

## API Design
- All external-facing APIs must be published through APIM — no direct backend URLs
- API versioning: URL path versioning `/api/v1/`, `/api/v2/`
- Use OpenAPI 3.0 spec as the source of truth — import into APIM from spec, not vice versa
- API names in APIM: `{domain}-{version}` (e.g., `crm-accounts-v1`)

## Operations
- Operation IDs must be unique and descriptive: `GetAccountById`, `CreateOrder`
- HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE
- Never use GET for operations with side effects

## Policies
- Apply rate limiting at the API or operation level — always set a limit
- Apply JWT validation policy for all authenticated APIs
- Use `set-header` to forward `correlationId` to the backend
- Cache GET responses where appropriate — configure `cache-lookup` policy
- Never expose backend error details — use `return-response` to standardise error shape

## Security
- All APIs require subscription key minimum — disable the default no-key access
- Use OAuth 2.0 / Azure AD for user-facing APIs
- Use Managed Identity for backend service-to-service calls
- Enable HTTPS only — no HTTP

## Products
- Group APIs into APIM Products by consumer type (e.g., `Internal`, `Partner`, `Public`)
- Each product has its own subscription and rate limit tier

## Monitoring
- Enable Azure Monitor diagnostics on APIM
- Log to Application Insights — capture request/response headers and body (mask PII)
- Alert on 5xx error rate > 1% over 5 minutes
