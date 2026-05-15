# Constitution — PCF (Power Apps Component Framework) Standards

## Language
- Always use **TypeScript** — never plain JavaScript for PCF controls
- Target ES2015 or later; configure `tsconfig.json` accordingly
- Enable strict mode in TypeScript (`"strict": true`)

## Component Types
- Use **Field component** for single-value inputs bound to a column
- Use **Dataset component** for list/grid scenarios
- Choose the correct type at design time — migration is costly

## Lifecycle Methods
- `init`: initialize state, set up subscriptions — never manipulate the DOM here before the container is ready
- `updateView`: called on every context change — keep it idempotent and fast
- `getOutputs`: return only changed output values — do not return the full state every time
- `destroy`: clean up all event listeners and subscriptions — memory leaks fail App Source review

## DOM Rules
- Only manipulate the DOM inside the `container` element passed to `init`
- Never access `document.body` or elements outside the container
- Use a virtual DOM library (React, Preact) for complex UIs — do not build large DOMs imperatively

## Accessibility
- All interactive elements must have `aria-label` or associated `<label>`
- Keyboard navigation must work without a mouse
- Colour contrast must meet WCAG 2.1 AA
- Test with a screen reader before marking a PCF task complete

## Performance
- Do not perform heavy computation or API calls in `updateView`
- Cache API results — `updateView` may be called frequently
- Lazy-load heavy dependencies

## Manifest Rules
- Set `control-type` correctly: `standard` for field, `dataset` for grids
- Declare all properties in `ControlManifest.Input.xml` — no runtime duck-typing
- Use `usage="bound"` for columns the user maps; `usage="input"` for configuration

## Testing
- Write unit tests using Jest and `@microsoft/pcf-scripts`
- Test `init`, `updateView`, and `destroy` lifecycle methods
- Mock `ComponentFramework.Context` for isolated unit tests

## Localization
- All user-facing strings live in `strings/{culture}.resx` files (e.g., `strings/Control.1033.resx` for `en-US`, `strings/Control.1036.resx` for `fr-FR`).
- `ControlManifest.Input.xml` declares all supported cultures via `<resx>` entries — CI fails the build if any declared culture is missing its RESX file.
- Access strings via `context.resources.getString("KEY")` — never embed literals in TypeScript.
- Strings selected automatically by the platform based on user's `UILanguageId`.
- Full rules: see `15-multilingual-localization.md` §4.3 and [PCF resx localization](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/manifest-schema-reference/resx).

## Right-to-Left (RTL) Safety
- Use **logical CSS properties** for spacing, alignment, and layout: `margin-inline-start`, `margin-inline-end`, `padding-inline-start`, `padding-inline-end`, `text-align: start | end`, `inset-inline-start`, `inset-inline-end`.
- Never `margin-left`, `margin-right`, `text-align: left`, `left:`, `right:`, or any pixel-positional logic that assumes LTR.
- Test all PCF controls under both LTR and RTL UI direction before release; capture a screenshot per direction.
- Schedule Board PCF cells must mirror correctly under RTL.
