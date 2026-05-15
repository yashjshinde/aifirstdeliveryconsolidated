---
agent: d365-ce
sub-platform: solution-layering
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Publisher + Solution Layering

> Solution architecture conventions for CE. Driven by `project.config.yaml prefixes.*`.

## Publisher

- **One publisher per project**, named after `project.config.yaml prefixes.publisher` (e.g., `acme`).
- Customisation prefix matches the publisher prefix (e.g., `acme_`).
- Solution-component option-set prefix range: typically `10000` upward (project-determined; documented in the FDD §8 Reference Data).

## Solution layering (3-layer pattern)

| Layer | Solution name | Contents | Managed? |
|---|---|---|---|
| **Base** | `{prefix}Core` (per `prefixes.solutionName`) | OOB extensions, shared entities, shared security roles, shared web resources | Unmanaged in Dev, Managed in higher environments |
| **Feature** | `{prefix}{FeatureName}` (one per major feature) | Feature-specific entities, forms, plugins, JS, Canvas apps | Same |
| **Customer Hotfix** | `{prefix}Hotfix` (when needed) | Customer-environment-only emergency patches | Always Managed |

A new feature gets its own Feature solution. The base solution holds shared components.

## Dependencies

- Feature solutions depend on the Base solution (publisher-prefix shared).
- Hotfix solutions sit at the top of the stack.
- Cross-feature dependencies discouraged; when unavoidable, document in the FDD §10 Handoffs section.

## Environment variables

- For any value that differs between Dev / Test / Prod (URLs, API keys, lookup IDs, feature flags), create an **Environment Variable Definition** in the appropriate solution layer.
- Environment Variable **Values** are environment-specific overrides — set per environment, not packaged in the solution.
- Never hard-code an environment-specific value in a plugin / JS / Canvas / portal / Power Automate flow.

## Connection references

- One connection reference per external system connection in use.
- Named pattern: `{publisherPrefix}_{system}_{purpose}` (e.g., `acme_sap_pricelist`).
- Connection references are bundled with the solution layer that uses them. The actual connection (per-environment binding) is set during deployment.

## Solution publishing checklist

- [ ] All components have the publisher prefix in their schema names
- [ ] No hard-coded GUIDs or URLs anywhere
- [ ] Environment Variable Definitions exist for every environment-specific value
- [ ] Connection References exist for every external connector
- [ ] No "My flows" — every Power Automate flow lives in a solution
- [ ] Security roles are explicit (no default Org-wide privileges on custom entities unless documented in FDD §6)
- [ ] Dependencies declared explicitly (Feature -> Base, Hotfix -> any)
- [ ] Solution version bumped (semver) on every release
- [ ] Solution exported as both Managed and Unmanaged from Dev

## CI/CD path

- Source control: Power Platform solution unpacked to the agent's `output/` folder via `pac solution unpack`.
- CI build: re-packs via `pac solution pack` for promotion to higher environments.
- Promotion: Managed solution import via `pac solution import` (handled by the deployment pipeline; this agent doesn't own deployment automation).
