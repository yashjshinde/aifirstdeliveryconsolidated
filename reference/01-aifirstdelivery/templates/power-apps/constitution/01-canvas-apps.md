# Constitution — Canvas App Standards

## App Structure
- Use a **single-screen-per-function** pattern — avoid packing multiple workflows onto one screen
- Screen naming: `scr{Purpose}` (e.g., `scrHome`, `scrAccountDetail`, `scrEditOrder`)
- Component naming: `{Type}_{Purpose}` (e.g., `btn_Submit`, `gal_AccountList`, `lbl_Title`)
- Group related controls in named containers

## Formulas
- Never use nested `If()` more than 2 levels deep — use `Switch()` for multi-branch logic
- Avoid writing business logic in `OnSelect` — delegate to named flows or collections
- Use **named formulas** (`App.Formulas`) for values reused across screens
- Never duplicate a data source call — cache in a collection with `ClearCollect()`

## Delegation
- Always design for delegation to the data source — check delegation warnings
- Do not use `Filter()` with non-delegable functions on large datasets (>500 rows)
- Use `Search()` only on delegable fields
- Set the data row limit deliberately in app settings — document if raised above 500

## Performance
- Minimise `OnStart` — defer data loading to individual screens
- Use `Concurrent()` for parallel data loads
- Avoid calling flows synchronously from `OnVisible` for every navigation
- Limit gallery items: paginate or filter before binding

## Accessibility
- Every interactive control must have a `HintText` or `AccessibleLabel`
- Colour contrast must meet WCAG 2.1 AA
- Test with keyboard navigation and screen reader

## Theming
- Define colours, fonts, and sizes as named formulas — never hardcode hex values in controls
- Use a single `scr_Theme` or `App.Formulas` block as the theme source

## Forbidden Patterns
- No `UpdateContext()` for data shared across screens — use global variables or collections
- No undocumented use of `Set()` for global state — name variables descriptively: `gbl{Purpose}`
- No direct SQL or complex OData calls without delegation review
