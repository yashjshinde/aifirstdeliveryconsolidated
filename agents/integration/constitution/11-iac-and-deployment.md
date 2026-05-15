---
agent: integration
sub-area: iac-and-deployment
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Infrastructure-as-Code and Deployment Standards

## Tool choice

- **Bicep** is the default for all new Azure infrastructure.
- ARM JSON only when consuming an existing customer-mandated template; transpile to Bicep where possible.
- Terraform allowed in multi-cloud or partner-mandated scenarios; declare in `project.config.yaml integration.iac.tool` so the build pipeline picks the right runner.

## Module structure

```
projects/{p}/integration/features/{f}/output/iac/
├── main.bicep                  # entry; calls modules; receives env params
├── modules/
│   ├── serviceBus.bicep
│   ├── functionApp.bicep
│   ├── logicApp.bicep
│   ├── apim.bicep
│   └── dataFactory.bicep
├── params/
│   ├── dev.bicepparam
│   ├── test.bicepparam
│   ├── uat.bicepparam
│   └── prod.bicepparam
└── README.md                   # purpose + env matrix
```

## Naming via `naming.bicep` helper

Every module imports a single `naming.bicep` module that produces resource names from `(workload, env, resourceKind)`. Forbids ad-hoc string concatenation.

## Module rules

- Module ≤ 250 lines; if larger, split by concern (e.g., separate `serviceBusTopic.bicep` from `serviceBusNamespace.bicep`)
- Outputs always include the resource id + name + any connection-string secret URI (not the secret itself)
- Inputs typed with `@allowed`, `@minLength`, `@maxLength` where applicable
- No inline secrets — secrets sourced from Key Vault via `getSecret` references

## What-If always

CI MUST run `az deployment sub what-if` (or `group what-if`) before `create` — fail the PR on destructive changes that lack an `--approved-by` annotation in the PR description.

## Tagging

Every resource carries:
- `WorkloadName` — the integration name
- `Environment` — dev/test/uat/prod
- `CostCenter` — sourced from project.config
- `OwnerTeam` — sourced from project.config
- `DataClassification` — `Public` | `Internal` | `Confidential`

## Network

- Default to VNet-integrated where service supports it (Function Premium, Logic App Standard, Service Bus Premium, Storage)
- Private endpoints for backend Azure services; public DNS resolution via private DNS zones in hub VNet
- NSGs deny-by-default; allow only declared flows in module

## See also

- [12-observability-and-nfr.md](12-observability-and-nfr.md) (tags drive cost+monitoring slicing)
- [06-apim-standards.md](06-apim-standards.md)
