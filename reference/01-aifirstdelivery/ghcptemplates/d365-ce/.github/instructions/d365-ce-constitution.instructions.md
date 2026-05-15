---
applyTo: "specs/**,plans/**,tasks/**,output/**,docs-generated/**"
description: "D365 CE constitution rules — auto-injected when editing CE delivery artifacts (specs, plans, tasks, output, docs-generated). Enforces architectural principles, naming conventions, security model, and ALM standards."
---

# D365 CE Constitution — Always-On Rules

These rules apply to ALL D365 CE delivery artifacts. They are hard constraints, not suggestions.
If a user request conflicts with any rule below, flag it as a Constitution Risk and propose a compliant alternative.

## Architectural Principles

- **Config-first:** prefer Configuration → Flow → Business Rule → Plugin → Code (in that order of preference)
- **Dataverse as System of Record:** all business data must reside in Dataverse; no shadow databases
- **Loose coupling:** components must not have direct dependencies on other solution components' internal implementation; use environment variables and connection references
- **Idempotency:** all operations must be safe to retry without side effects

## Solution Design

- Publisher prefix must be consistent across all components in a solution (read from `constitution/01-solution-design.md`)
- Solution layering: Base Solution for schema; Customisation Solution for logic; never mix
- All environment-specific values must be in Environment Variables — never hardcoded

## Plugin Standards

- Class naming: **`{Entity}{Pre|Post}{Operation}Plugin`** — no exceptions
- Must implement `IPlugin`; `Execute` must be the entry point
- **No static variables** — plugins are re-entrant; static state causes race conditions
- **No hardcoded GUIDs, URLs, or connection strings** — use Environment Variables or plugin step secure configuration
- Always obtain a tracing service; trace at the start of Execute and at key decision points
- Catch all exceptions; re-throw user-visible errors as `InvalidPluginExecutionException`; log internal errors via tracing only
- Use early-bound types where generated; late-bound only when schema is dynamic
- Null-check all inputs from plugin execution context before use

## Dataverse Schema

- Table schema names: `{prefix}_{entityname}` — all lowercase, underscores only
- Column schema names: `{prefix}_{columnname}` — all lowercase, underscores only
- Relationships: `{prefix}_{parenttable}_{childtable}_{purpose}`
- Option sets: prefer global option sets over local for values reused across tables
- Required columns: only mark as required when the business rule is enforced by the solution; never over-constrain schema

## JavaScript Standards

- **Never use `Xrm.Page`** — always use `executionContext.getFormContext()`
- All event handlers must accept `executionContext` as the first parameter
- Null-check all attribute and control references before calling `.getValue()` or `.setValue()`
- Use `async/await` for all network operations; never block the UI thread
- File naming: `{prefix}_{entity}_{form}_{purpose}.js`
- Namespace all functions: `namespace.functionName(executionContext)`

## PCF Standards

- Must implement full lifecycle: `init`, `updateView`, `getOutputs`, `destroy`
- No direct DOM manipulation outside the container element
- Must be keyboard-accessible (WCAG 2.1 AA)
- TypeScript required; no plain JavaScript

## Security Model

- **Principle of least privilege:** security roles grant only the minimum privileges required
- **No over-privileged application users** — application users get only the privileges their integration requires
- All secrets (API keys, passwords, connection strings) must be stored in Azure Key Vault and referenced via Environment Variables
- Field-level security must be configured for any column holding PII or sensitive business data
- Every new custom table must have audit enabled for Create, Update, and Delete operations

## ALM and DevOps

- Never export unmanaged solutions to production
- All solution components must be source-controlled
- Pipeline steps: Export → Unpack → PR → Pack → Deploy (managed)
- Environment variables must have default values in the solution; environment-specific values set at import time

## Testing Standards

- Plugin unit tests: **FakeXrmEasy** — required, no exceptions
- JS/PCF unit tests: **Jest** — required
- Coverage minimum: 80% per component
- Test naming: `{Method}_{Scenario}_{ExpectedResult}` (e.g., `Execute_NullAccount_ThrowsInvalidPlugin`)

## Non-Functional Targets

Read specific numeric targets from `constitution/11-nfr-targets.md`. Key minimums:
- Plugin synchronous execution: < 2 seconds
- Form load: < 3 seconds
- API availability: ≥ 99.5%

## Constitution Override Procedure

If a user request requires a deviation from any rule above:
1. Flag it as a **Constitution Exception Request** in the relevant plan or spec section
2. State the rule being deviated from and the business justification
3. Propose a compliant alternative — if the deviation is truly unavoidable, document the risk explicitly
4. Never silently violate a constitution rule
