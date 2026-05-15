---
agent: d365-ce
sub-platform: pcf
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# PCF (PowerApps Component Framework) Standards

> Conventions for PCF controls: TypeScript-based reusable form/dataset components.

## Project layout

- **One PCF project per logical control.** Repo path `agents/d365-ce/output/pcf/{controlName}/`.
- **Manifest** (`ControlManifest.Input.xml`) declares: name, namespace `{publisherPrefix}.{controlName}`, version (semver), required properties (typed), preview image.
- **`tsconfig.json`** targets ES2017, strict mode on.
- **`package.json`** scripts: `start` (test harness), `build` (`pcf-scripts`), `test` (Jest).

## TypeScript

- **Strict mode mandatory** (`strict: true` in tsconfig). No `any` without a justifying comment.
- **`init` / `updateView` / `getOutputs` / `destroy`** — implement the four lifecycle methods explicitly. Even no-op `destroy` is written out (not inherited).
- **State management** via React (when complex). Simple controls can use direct DOM manipulation.
- **External dependencies** declared in `package.json`. Use only well-maintained libraries; document the choice in TDD.

## Lifecycle

- **`init`** — register DOM event handlers; initial render.
- **`updateView`** — re-render on context change. Never assume state from prior calls.
- **`getOutputs`** — return the current bound-property values for the form's two-way binding.
- **`destroy`** — unregister event handlers; clear timers.

## Manifest properties

- **Bound properties** typed (text, decimal, datetime, boolean, lookup). No untyped properties.
- **Input properties** for read-only configuration.
- **Lookup properties** when the control needs to display + edit a related-entity reference.
- **Dataset binding** for grid-style controls.

## Test harness

- **`npm start`** launches the PCF test harness for local visual iteration.
- **Mock data** in `node_modules/@types/powerapps-component-framework` shim or via custom fixtures.

## Unit tests

- Per `project.config.yaml unitTestPolicy.pcf: required` (default).
- **Jest** for lifecycle methods + render-output validation.
- Coverage targets: every public method, every property setter.

## Publishing to a solution

- `pcf-scripts build` produces the bundle.
- Imported into the CE solution as a `CustomControl`; declared in `06-publisher-and-solution.md` solution definition.

## Performance

- **Bundle size** under 250 KB after build (warn at 200 KB). Tree-shake unused imports.
- **Render performance**: re-renders only on context changes that affect output (use `shouldUpdate` heuristic).

## Accessibility

- **WCAG 2.1 AA** minimum for all rendered DOM.
- Keyboard navigation: tab order + Enter / Space activation per WAI-ARIA patterns.
- Visible focus states for every interactive element.
- Screen-reader labels (`aria-label`) on icon-only buttons.

## FDD section ownership

PCF sub-platform pack owns:
- §4 (PCF-specific): per-control manifest summary + bound properties + lifecycle behaviour
- §7 (impact on entity model when the PCF binds to a specific entity/field): bound-attribute coverage
