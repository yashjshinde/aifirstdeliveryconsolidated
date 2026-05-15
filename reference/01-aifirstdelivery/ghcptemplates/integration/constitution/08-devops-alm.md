# Constitution — DevOps and ALM

## Branch Strategy
- Main branch: `main` (always deployable)
- Feature branches: `feature/{ticket-id}-{description}`
- Hotfix: `hotfix/{ticket-id}-{description}`
- No direct commits to `main` — always via Pull Request with minimum 1 approver

## Infrastructure as Code
- All Azure resources defined in **Bicep** (preferred) or Terraform — never portal-only
- IaC files in `infrastructure/` folder
- Separate Bicep modules per resource type: `servicebus.bicep`, `functions.bicep`, etc.
- Parameter files per environment: `parameters.dev.json`, `parameters.prod.json`

## Pipeline Structure
- CI pipeline: lint, build, unit tests, security scan
- CD pipeline: deploy IaC → deploy application → smoke test
- Pipelines defined in `pipelines/` as YAML
- Use pipeline templates for repeated steps

## Environment Promotion
- Dev → Test → UAT → Production
- No skipping environments for features (hotfixes may skip Test with approval)
- Environment-specific secrets injected via Key Vault references — never stored in pipeline vars

## Versioning
- APIs versioned using URL path: `/v1/`, `/v2/`
- Function App published packages tagged with git SHA
- Bicep modules versioned in a module registry

## Testing in Pipeline
- Unit tests: run on every PR
- Integration tests: run on deploy to Test environment
- Contract tests (Pact or OpenAPI validation): run before UAT promotion

## Monitoring as Code
- Alert rules defined in Bicep alongside resources
- Dashboard templates version-controlled
- Runbooks stored in `docs/runbooks/` and linked in alerts
