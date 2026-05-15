---
agent: d365-fo
sub-domain: dev-and-alm
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O Development + ALM

> Environments, DevOps, source control, release management, testing, Key Vault. PORTED structure from predecessor per R16; full content in bk-026.

## Environments

- **Dev** - per-developer, full AOS + SQL access. Code authored here.
- **Test** - CI-built deployable packages deployed here; integration testing
- **UAT** - business user acceptance
- **Pre-Prod** - mirror of Prod for final sign-off
- **Prod** - customer-facing

## DevOps pipeline

- Azure DevOps (or equivalent) builds deployable packages from source control on every merge to main
- Build artefact: `axdeployablepackage.zip`
- Release artefacts deploy through Test -> UAT -> Pre-Prod -> Prod gates per project-config.yaml alm.* settings

## Source control

- One model per major feature area; models stored in source control under `agents/d365-fo/output/{model-name}/`
- Branch strategy: feature branches off `main`; PR back via the ALM agent's `/alm push` (or directly via the DevOps repo when manual)

## Release management

- Deployable packages per LCS (Lifecycle Services) standard pattern
- `/lcs-deploy` extra command (this agent) generates the package + pushes to LCS

## Testing

- Per `project.config.yaml unitTestPolicy.*` - F&O uses SysTest framework for unit tests
- Test classes named `<Prefix><BaseClass>_Test`
- Integration tests run in Dev / Test environments via the build pipeline

## Key Vault for INT objects

- INT (Integration) artefacts that need credentials reference Azure Key Vault secrets via the F&O secrets management
- Never store credentials in code, configuration tables, or DMF data packages
- Each INT secret documented in the per-feature TDD with: vault name + secret name + rotation policy

## Source attribution

Full process detail PORTED from predecessor's `04-development-and-alm.md` per R16. Queued as bk-026.
