# Constitution — Solution Design

## Publisher
- Publisher prefix: `opex` 3–5 lowercase characters (e.g., `xyz`)
- All custom components must use this prefix
- Never use the default publisher in non-default solutions

## Solution Naming
- Format: `{PublisherPrefix}_{SolutionName}` (PascalCase after prefix)
- Example: `xyz_SalesEnhancements`
- One solution per bounded context — do not bundle unrelated features

## Solution Layering
- Use **managed solutions** in Test, UAT, and Production
- Use **unmanaged solutions** in Development only
- Never export unmanaged from non-dev environments
- Patch solutions only for hotfixes — use full solution upgrades for features

## Component Rules
- Never modify out-of-box (OOB) forms/views directly — clone and extend
- Never delete system entities, attributes, or relationships
- Always add new components to the named solution — never the default solution
- Use **solution segments** to include only the components you own

## Environment Variables
- All connection strings, URLs, and configurable values must use Environment Variables
- Never hardcode environment-specific values in plugins or flows
- Environment Variable schema name: `{prefix}_ConfigKeyName`

## Dependency Management
- Explicitly declare all solution dependencies
- Avoid circular dependencies between solutions
- Document inter-solution dependencies in the technical design document
