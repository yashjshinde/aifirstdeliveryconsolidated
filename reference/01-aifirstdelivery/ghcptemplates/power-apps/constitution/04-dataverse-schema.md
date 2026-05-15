# Constitution — Dataverse Schema (Power Apps)

## Table Naming
- Schema name: `{prefix}_tablename` (all lowercase after prefix)
- Display name: Title Case, descriptive, no abbreviations
- Always provide a Description on every custom table

## Column Naming
- Schema name: `{prefix}_columnname` (all lowercase)
- Display name: Title Case, human-readable
- Always provide a Description

## Column Types for Power Apps
- Use **Text** for short strings (set max length deliberately)
- Use **Multiline Text** for notes/descriptions (set max length)
- Use **Choice** for small fixed lists shown in dropdowns
- Use **Yes/No** (Boolean) for binary flags — do not use a 2-option Choice
- Use **Lookup** for relationships to other tables — never store related record ID as a plain text/number
- Use **Date Only** when time is not relevant — do not use Date and Time for date-only scenarios
- Use **Currency** for monetary values

## Canvas App Binding Rules
- Every column bound in a canvas app form must have `IsValidForUpdate = true`
- Calculated and rollup columns cannot be edited — do not bind them to editable controls
- Do not bind formula columns to edit forms

## Delegation-Safe Columns
- Columns used in `Filter()`, `Search()`, or `Sort()` in canvas apps must be delegation-friendly
- Text columns: `StartsWith()` is delegable; `Contains()` is NOT with Dataverse
- Document non-delegable filters and handle with explicit `Top N` + warning

## Relationships for Power Apps
- Always set cascade behaviour for Delete explicitly
- Use Many-to-Many relationships only when both sides can have many; do not fake it with two lookups
- Activity Party relationships: use only if standard activity association applies
