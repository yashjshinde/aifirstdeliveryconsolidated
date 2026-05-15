# Constitution — JavaScript / Web Resource Standards

## File Naming
- Format: `{prefix}_{entityname}_{formname}_{purpose}.js`
  - Example: `xyz_account_main_validation.js`
- One JS file per form per functional area — do not create one monolithic file per entity
- Never name files `common.js` or `utils.js` without a domain qualifier

## Namespace
- Always wrap code in a namespace object to avoid global scope pollution
- Format: `var {Prefix}.{Entity}.{Form} = {Prefix}.{Entity}.{Form} || {};`
- Export only the functions registered as event handlers

## Xrm API Usage
- Use `Xrm.WebApi` for all CRUD operations — never use raw XMLHttpRequest or fetch directly
- Use `Xrm.Navigation` for navigation and dialogs — never use `window.location`
- Use `Xrm.Utility` for utility operations
- Never use internal/unsupported APIs (anything not in official Xrm documentation)
- Never rely on DOM selectors (`document.getElementById`) — use `formContext` exclusively

## Form Context
- Always receive `executionContext` as the first parameter of event handlers
- Derive `formContext` via `executionContext.getFormContext()` — never use `Xrm.Page` (deprecated)
- Always null-check attributes before accessing: `var attr = formContext.getAttribute("xyz_field"); if (attr) { ... }`

## Async Patterns
- Use `async/await` for all `Xrm.WebApi` calls
- Always wrap async calls in try/catch
- Show/hide save button or use `setSubmitMode` to prevent double-submits during async operations
- Never block the UI thread with synchronous operations

## Performance
- Minimise work done in `OnLoad` — defer non-critical operations
- Avoid querying Dataverse on every `OnChange` — debounce or cache where possible
- Do not load external scripts dynamically at runtime

## Forbidden Patterns
- No `alert()` or `confirm()` — use `Xrm.Navigation.openAlertDialog` / `openConfirmDialog`
- No jQuery — it is no longer bundled and its presence is not guaranteed
- No `parent.Xrm` — use `Xrm` directly; cross-frame references are unreliable
- No hardcoded GUIDs for users, teams, or business units
- No hardcoded user-facing strings (English or otherwise) — load from per-culture string web resource

## Localization
- All user-facing strings live in `{prefix}_strings.{culture}.js` web resources (one per culture: `en-US`, `fr-FR`, etc.).
- Form OnLoad selects the appropriate strings file based on `Xrm.Utility.getGlobalContext().userSettings.languageId`, with fallback to org base language then `en-US`.
- Form scripts reference string keys only — never embed literals.
- Date / time formatting via `Xrm.Utility.formatDateTime` only — never `Date.toLocaleString()` with hardcoded format strings.
- Currency formatting uses Dataverse currency-aware APIs — never string-concatenate currency symbols.
- Hardcoded user-facing strings are a **BLOCKER** finding at `/review`.
- Full rules: see `15-multilingual-localization.md` §4.2.

## Field Service Mobile / Offline Awareness
When customising forms used in the Field Service Mobile app:
- Default to APIs that work both online and offline. Use `Xrm.WebApi.online` only when intentionally requiring connectivity.
- Field Mapping is **not honoured offline** — copy parent → child values via offline-aware JS on the device.
- Power Automate cloud flows do not run on the device offline. Logic that must run on-device offline goes in JS or PCF, never in cloud flows.
- Gate device-specific code via `Xrm.Utility.getGlobalContext().client.getClient()`.
- Full rules: see `13-field-service-scheduling-and-mobile.md` §4.
