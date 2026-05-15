# Constitution — Plugin Standards

## Class Structure
- Always implement `IPlugin` interface
- One plugin class per logical operation — do not create monolithic plugins
- Class name format: `{Entity}{Pre|Post}{Operation}Plugin`
  - Example: `AccountPreCreatePlugin`, `OpportunityPostUpdatePlugin`
- Namespace: `{OrgPrefix}.{SolutionName}.Plugins.{EntityName}`

## Execute Method
- Extract `IOrganizationService`, `ITracingService`, and `IPluginExecutionContext` at the top of Execute
- Always cast `context.InputParameters["Target"]` with a null check before use
- Never use static or instance-level fields for org-specific data (not thread-safe in sandbox)

## Error Handling
- Throw `InvalidPluginExecutionException` for user-facing validation errors
- Log full exception detail via `ITracingService` before rethrowing
- Never swallow exceptions silently
- Error message format: `"[{PluginClassName}] {UserFriendlyMessage}. Detail: {TechnicalDetail}"`

## Tracing
- Log entry and exit of the Execute method
- Log all branching decisions at key points
- Log input parameter values at DEBUG level (strip PII)
- Use `tracingService.Trace()` not `Console.Write` or `Debug.Write`

## Pre/Post Images
- Register pre-image only when you need the value before the operation
- Register post-image only when you need to react to the saved value
- Name images consistently: `PreImage`, `PostImage`
- Only include attributes you actually need in the image (reduce payload)

## Execution Context
- Check `context.Depth` for recursive plugin prevention (throw if depth > 1 unless intentional)
- Always check `context.MessageName` and `context.PrimaryEntityName` match expectations
- Use `context.SharedVariables` to pass data between plugins in the same pipeline

## Sandboxed Plugins
- No file system access
- No unrestricted network calls — use Dataverse HttpClient patterns with managed identity
- Keep execution under 2 minutes (hard platform limit)
- Avoid heavy computation — defer to async jobs if needed

## Service Instantiation
- Use `serviceFactory.CreateOrganizationService(context.UserId)` for user-context operations
- Use `serviceFactory.CreateOrganizationService(null)` for system-context only when explicitly needed, and always comment why

## Localization (User-Facing Messages)
- User-facing exception messages must come from a **localized resource** — never hardcoded English literals.
- Pattern: load strings from a per-culture RESX web resource (`{prefix}_strings.{culture}.resx`) or per-language environment variable, keyed by the calling user's `UserSettings.UILanguageId`.
- `InvalidPluginExecutionException` message must be localized; trace messages (server log) may stay in English.
- Hardcoded English literals in plugin user-facing paths are a **BLOCKER** finding at `/review`.
- Full rules: see `15-multilingual-localization.md` §4.1.

## Field Service: State-Machine Ownership
When the project includes Field Service, the OOB engine owns the Work Order and Bookable Resource Booking state machines. Custom plugins racing it cause data corruption.

**Forbidden:**
- Plugin on Create/Update of `msdyn_workorder.msdyn_systemstatus` that mutates `msdyn_systemstatus` itself or `bookableresourcebooking.bookingstatus`.
- Plugin on Create/Update of `bookableresourcebooking.bookingstatus` that mutates `msdyn_workorder.msdyn_systemstatus`.
- Plugin pre-validation on `msdyn_workorder` Create that creates `msdyn_workorderservice` / `msdyn_workorderproduct` records — these have their own creation pipeline.

**Allowed:**
- Plugin on Create/Update of *custom* columns added to FS tables to enforce your business rules.
- Async / Post-Operation plugin that reads (not mutates) FS state for downstream notifications.
- Power Automate flow triggered after status update (Dataverse trigger), idempotent, runs after the FS engine has settled.

Full rules: see `12-field-service-entities.md` §7 and `13-field-service-scheduling-and-mobile.md`.
