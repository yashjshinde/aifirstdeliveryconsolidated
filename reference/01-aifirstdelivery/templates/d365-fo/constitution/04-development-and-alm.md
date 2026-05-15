# Development Standards and ALM

## Environment Strategy

| Environment | Purpose | Who Deploys | Refresh Cadence |
|---|---|---|---|
| DEV | Active development and unit testing | Developer (self-service) | On demand |
| BUILD | CI pipeline; automated build validation | Azure DevOps pipeline (automated) | Every PR |
| TEST | System integration testing (SIT) | Release Manager (via pipeline) | Per sprint |
| UAT | User acceptance testing | Release Manager | Per UAT cycle |
| PROD | Production | Release Manager (change-controlled) | Per release |

No developer has direct access to deploy to TEST, UAT, or PROD. All deployments to these environments must go through the approved pipeline.

## Azure DevOps Standards

- Every object maps to an ADO Work Item (User Story, Task, or Bug)
- Commit messages reference the ADO work item: `[#12345] EXT: Add vendor approval extension`
- Pull Requests must include: description, Object-ID, self-review checklist confirming coding standards compliance
- Branch naming: `feature/<Object-ID>-short-description` — e.g., `feature/EXT-034-vendor-approval`
- Feature branches older than 14 days without merge activity must be reviewed and progressed or deleted

## Branching Strategy

```
main ──────────────────────────────────────── (always deployable)
 └── release/vX.Y ──────────── (release candidate)
      └── feature/<Object-ID>  (developer branches)
```

- `main` is always the deployable baseline. Direct commits to `main` are prohibited.
- `release/vX.Y` is created from `main` at the start of each sprint or release cycle.
- All `feature/` branches are cut from and merged into the active `release/` branch via PR.
- Hotfixes are cut from `main`, applied, and immediately back-merged.

## Deployment Packages

- Deployable packages built by automated CI pipeline — manual builds prohibited for TEST, UAT, PROD
- Each package versioned and tagged in source control
- Package contents documented in release notes (list of objects, Object-IDs, change summaries)

## Testing Standards

| Level | Owner | Scope | Entry Criteria | Exit Criteria |
|---|---|---|---|---|
| Unit Test | Developer | Individual object / method | Development complete | All unit tests pass; code review approved |
| SIT | Technical / QA | End-to-end object in integrated environment | Deployed to TEST; unit tests passed | All SIT cases pass; no open Sev 1/2 defects |
| UAT | Business / Functional Lead | Business process end-to-end | Deployed to UAT; SIT sign-off | Business sign-off; no open Sev 1 defects |
| Performance Test | Technical / QA | Complex and batch objects | UAT environment; representative data volume | Performance benchmarks met |
| Regression | QA | Full scope | Pre-production deployment | All regression cases pass |

## Defect Severity

| Severity | Definition | Target Resolution |
|---|---|---|
| Sev 1 — Critical | System crash, data corruption, security breach, blocker with no workaround | Same business day |
| Sev 2 — High | Core business process broken; workaround exists but unacceptable for production | Within 2 business days |
| Sev 3 — Medium | Non-critical functionality impaired; acceptable workaround available | Within 5 business days |
| Sev 4 — Low | Cosmetic, minor inconvenience, no business impact | Next sprint / release |

## Test Evidence Requirements

All objects must produce test evidence: test case ID, steps executed, expected result, actual result, pass/fail, tester name. Stored in approved test management tool and linked to ADO work item.

## Performance Testing Standards

Every Medium, Complex, or Very Complex object must have performance test cases in the test plan.

- Tool: **Task Recorder** + **Performance SDK** for AOS/form performance; **Azure Load Testing** for OData/REST endpoints (INT objects)
- Performance tests must run against a **production-representative dataset** — never against an empty environment
- Pass thresholds are defined in `11-nfr-targets.md`:
  - Form load ≤ 3s; batch job throughput targets as stated per object in the TDD
  - Data entity import rates as per `11-nfr-targets.md` thresholds
- Performance test must pass before UAT promotion — failures classified as Sev 2 defects; UAT blocked until resolved
- Batch throughput results must be documented in the test evidence and linked to the TDD throughput target

## Security Standards for Integration Objects (INT category)

For INT-category objects that call external Azure services:

- Authentication must use **Managed Identity** or an Azure AD service principal — never hardcoded credentials
- All secrets (API keys, connection strings, certificates) must be stored in **Azure Key Vault**
  - Reference via Azure App Configuration or direct Key Vault SDK integration in X++
  - Never store secrets in D365 system parameters, batch job parameters, or source code
- Key Vault access from D365 F&O requires a registered Azure AD app — document the app registration in the TDD Integration Technical Design
- PII and financial identifiers must be masked before writing to integration logs or staging tables viewable by non-privileged users
