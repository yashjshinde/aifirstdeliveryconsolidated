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

## Field Service / URS / RSO Version Pinning
When the project includes Field Service:
- Pin **Field Service**, **Universal Resource Scheduling (URS)**, and **Resource Scheduling Optimization (RSO)** solution versions in CI manifest.
- Take FS / URS / RSO upgrades through Dev → Test before any non-Dev environment. Validate against your customisation solutions per upgrade.
- The [FS version history](https://learn.microsoft.com/en-us/dynamics365/field-service/version-history) and [URS version history](https://learn.microsoft.com/en-us/dynamics365/field-service/field-service-version-history-resource-scheduling) are the support-window source of truth.
- Customisation solutions are layered **above** FS / URS / RSO managed solutions — never modify components inside the Microsoft-published solutions.

## Deprecation Gate (BLOCKER)
At the start of every release planning cycle (and again at `/review`):
1. Read [Field Service deprecations](https://learn.microsoft.com/en-us/dynamics365/field-service/deprecations-field-service) and [URS deprecations](https://learn.microsoft.com/en-us/dynamics365/common-scheduler/deprecations).
2. Cross-reference every component named in the in-flight specs against the deprecation list.
3. Any in-scope use of a deprecated feature is a **BLOCKER** — rework the spec to use the Microsoft-supported replacement before `/plan` may proceed.
4. Document the gate result in the FDD §2 Scope.

Full rules: see `14-field-service-deprecations-and-integration.md`.

## Translation Files in CI (Multilingual)
- Translation export from Dev is part of the CI pipeline (`pac solution export-translation`); the ZIP is committed to `output/{feature}/translations/`.
- Translator round-trip is via PR review.
- Re-import to Test/UAT/Prod is automated via the release pipeline. Never manually edited in non-Dev environments.
- Pseudo-localization environment runs before translator engagement (e.g., `qps-PLOC` or a manually-prefixed pseudo language) to surface hardcoded strings, layout truncation, and concatenation bugs.
- Release gate: every new component must have translations for every language in `supported-languages` before UAT promotion. Missing translations block the release.

Full rules: see `15-multilingual-localization.md` §3 and §11.
