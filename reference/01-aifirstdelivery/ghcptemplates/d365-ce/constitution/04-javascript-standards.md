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
