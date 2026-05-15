# Constitution — DevOps and ALM

## Branch Strategy
- Main branch: `main` (always deployable)
- Feature branches: `feature/{ticket-id}-{short-description}`
  - Example: `feature/CRM-421-account-loyalty-points`
- Hotfix branches: `hotfix/{ticket-id}-{short-description}`
- No direct commits to `main` — always via Pull Request

## Solution Export
- Solutions must be exported by the CI pipeline — never manually exported and checked in
- Export unmanaged from Development environment
- Convert to managed in the pipeline before deploying to Test/UAT/Production
- Use **Solution Packager** (`pac solution pack/unpack`) to store solution as source files in git

## Pipeline Gates
- **Solution Checker** must pass with zero Critical/High issues before merge to main
- **Unit tests** must pass (0 failures, ≥80% plugin coverage) before merge
- **Peer review** required on all PRs — minimum 1 approver

## Environment Promotion
- Dev → Test → UAT → Production (no skipping)
- All deployments via release pipeline — never manual import to Test/UAT/Production
- Environment Variables must be set per-environment in the pipeline — not in the solution

## Configuration Data
- Use **Configuration Migration Tool** for reference/config data (not solution)
- Config data schema and export must be version-controlled
- Never include transactional data in configuration migration packages

## Release Notes
- Every deployment to UAT/Production must include a release notes document
- Release notes generated via `/document` command from task artifacts

## Rollback
- Every deployment plan must include a rollback step
- Managed solution rollback: redeploy previous version
- Document rollback procedure in the deployment guide
