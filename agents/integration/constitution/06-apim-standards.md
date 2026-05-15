---
agent: integration
sub-area: apim
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# APIM Standards (Azure API Management)

## When to put APIM in front

- External consumers need rate-limiting, transformation, or product/subscription gating
- Multiple backend services exposed under a single contract surface
- Centralised authentication translation (JWT validation, mTLS, OAuth flows)

If only one internal consumer talks to one Azure Function, prefer Function-level auth or Easy Auth — no APIM.

## Product / API / Operation structure

- **Product** — bundles APIs for a class of consumer (e.g., `partner-self-service`). Subscription key gates it.
- **API** — one per logical backend (e.g., `customer-api`).
- **Operation** — REST verb + path. Names verb-first PascalCase: `GetCustomer`, `CreateOrder`, `UpdateAddress`.
- **Versions** — header-versioned `Api-Version: 2026-05-01`. Path versioning forbidden.

## Policy strategy

Define policies at the highest scope where they apply (Global → Product → API → Operation):

| Policy | Scope | Reason |
|---|---|---|
| `set-header X-Correlation-Id` | Global | every request traceable |
| `validate-jwt` | Product | per-product auth |
| `rate-limit-by-key` | Product | per-subscription throttling |
| `cors` | API | per-API allowed origins |
| `set-backend-service` | API or Operation | route to right backend |
| `mock-response` | Operation | only when explicitly returning mocked data |

## Backend abstraction

Backends declared as APIM Backend objects (not inline URLs). Service-Tag-isolated VNet egress preferred. mTLS to backends in regulated workloads.

## Rate-limiting

- Default: 1000 req / 5 min per subscription
- Product tiers: free (100/min), basic (1000/min), premium (10000/min)
- Per-IP rate-limit only as a DDoS pre-filter; not as the primary throttle

## Documentation

- OpenAPI 3.0 spec maintained per API as the source of truth — `output/apim/{api}/openapi.yaml`
- Generate APIM artefacts from OpenAPI; don't author APIM XML directly.

## See also

- [12-observability-and-nfr.md](12-observability-and-nfr.md) (APIM diagnostics → AI / Log Analytics)
- [11-iac-and-deployment.md](11-iac-and-deployment.md)
