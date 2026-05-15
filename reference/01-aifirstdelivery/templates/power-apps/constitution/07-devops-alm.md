# Constitution — DevOps and ALM (Power Platform)

## Environment Strategy
- Minimum four environments: Development | Test | UAT | Production
- Each developer works in a personal developer environment for independent work
- Shared development environment for integration testing only

## Branch Strategy
- Feature branches: `feature/{ticket-id}-{description}`
- Hotfix: `hotfix/{ticket-id}-{description}`
- No direct commits to `main`

## Solution Management
- Use **managed solutions** in Test, UAT, and Production — unmanaged in Development only
- Export unmanaged solution from Development, convert to managed in pipeline
- Use `pac solution pack/unpack` to store solution as source files in git
- One solution per bounded domain — do not bundle unrelated apps and flows

## Pipeline (Azure DevOps / GitHub Actions)
- CI: solution checker (no Critical/High issues) + any unit tests
- CD: unpack → build → deploy managed solution → smoke test
- Use the **Power Platform Build Tools** (ADO) or **power-platform-actions** (GitHub)

## Connection References and Environment Variables
- All flows must use connection references — not hardcoded connections
- All environment-specific config values via Environment Variables
- Environment Variables set per-environment in the pipeline — never in the solution

## Configuration Migration
- Reference/lookup data deployed via **Configuration Migration Tool**
- Config data schema and export checked into git

## App Governance
- Every canvas app and flow must have a description and owner set
- Orphaned apps/flows (owner left org): reassign within 30 days
- Review and clean up unused apps/flows quarterly
