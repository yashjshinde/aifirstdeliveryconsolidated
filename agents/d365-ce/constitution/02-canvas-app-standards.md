---
agent: d365-ce
sub-platform: canvas
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# Canvas App Standards

> Conventions for Canvas apps + Canvas component libraries built on Power Apps.

## App-level conventions

- **App name** follows pattern `{publisherPrefix}-canvas-{slug}`. Same publisher prefix as model-driven solution.
- **Connection references** declared in the app's connection set. Document each connection's purpose in FDD §4 sub-platform pack.
- **Environment variables** for any value that differs between Dev / Test / Prod (URLs, feature flags, lookup IDs). Authored in CE solution (per `06-publisher-and-solution.md`); referenced from Canvas Power Fx via `EnvironmentVariableValues`.

## Screens

- **One screen per logical user task.** No "kitchen sink" screens.
- **Navigation.** Use named screens; never reference by index. `Navigate(EditOpportunityScreen, ScreenTransition.Fade)` etc.
- **Header / footer** as reusable components (in the Canvas component library — see "Component libraries" below).

## Power Fx

- **Variables.** `Set` for global state, `UpdateContext` for per-screen state, `Collect` for collections. Avoid global state where per-screen suffices.
- **Formulas in `OnStart`** kept minimal (cold-start cost). Heavy data prep goes into a named function in `Formulas` (the App.Formulas property, experimental but stable enough for v1 production).
- **Error handling.** `IfError(expr, FallbackBehavior)` on every external-data call. Never let a connector error reach the user as a raw "Operation failed".
- **Concurrency.** `Concurrent(expr1; expr2; expr3)` for independent data loads on `OnStart`.

## Connectors

- **Premium connectors** are accepted in v1 (licensing assumed). Document each in FDD §4 sub-platform pack with the purpose + auth model + rate limits.
- **Custom connectors** built in `integration` agent's domain (the connector definition lives there); CE Canvas just consumes them. Cross-reference the integration agent's TDD section.

## Components + component libraries

- **Canvas component library** named `{publisherPrefix}-canvas-components`. One library per project; all Canvas apps consume it.
- **Component input/output properties** all typed. No untyped `Object` inputs.
- **Component lifecycle.** `OnReset` resets internal state.

## Multilingual

- When `project.config.yaml multilingual.canvas: true`, app labels go through a `Translate` function backed by a labels collection. Default language from `multilingual.defaultLanguage`.

## Performance

- **`StartsWith` and `Filter` on indexed columns only** for Dataverse. Document the index strategy in FDD §4.
- **Delegation warnings** must be zero. If a delegation warning is unavoidable, document it in FDD §4 with the data-volume justification.

## Testing

- Per `project.config.yaml unitTestPolicy.canvas: optional` (default).
- When enabled: Power Fx tests in the Test Studio. Cover at least: happy-path navigation per screen; error states for each external call.

## FDD section ownership

Canvas sub-platform pack owns:
- §4 (Canvas-specific): screen list + Power Fx logic per screen + connector usage + component-library inventory
- §6 (Canvas-specific security): app-share roles + connection-reference-role mappings
