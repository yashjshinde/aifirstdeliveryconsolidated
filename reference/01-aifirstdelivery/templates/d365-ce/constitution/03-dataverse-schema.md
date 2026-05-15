# Constitution — Dataverse Schema Standards

## Table Naming
- Schema name: `{prefix}_tablename` (all lowercase after prefix, no camelCase)
  - Example: `xyz_customerprofile`
- Display name: Title Case, descriptive, no abbreviations
- Plural name: explicit (do not rely on auto-plural)
- Always provide a Description on every custom table

## Column Naming
- Schema name: `{prefix}_columnname` (all lowercase)
  - Example: `xyz_loyaltypoints`
- Display name: Title Case, human-readable
- Always provide a Description — document the purpose and business rules
- Avoid abbreviations unless universally understood (e.g., `id`, `url`)

## Required Columns
Every custom table must include:
- `{prefix}_name` — primary name column (string, 100 chars min)
- Standard audit columns are auto-included: `createdon`, `modifiedon`, `createdby`, `modifiedby`
- `ownerid` (User or Team ownership) unless the table is org-owned with a documented reason

## Data Types
- Use **Lookup** over string for references to other tables
- Use **Choice (Option Set)** for fixed, admin-managed lists
- Use **Multi-Select Choice** only when truly multiple values apply simultaneously
- Use **Whole Number** not Decimal for counts
- Use **Currency** type for monetary values — never Decimal
- Maximum string length should be set deliberately, not left at default 100

## Relationships
- Relationship schema name: `{prefix}_{parenttable}_{childtable}`
- Always set cascade behaviour explicitly — do not rely on defaults
- Document cascade decisions in the technical design document
- Avoid self-referential relationships unless the hierarchy use case is explicit

## Keys
- Use the system-generated GUID as primary key — never create surrogate integer keys
- Define alternate keys only for integration identity matching
- Alternate key name: `{prefix}_{tablename}_AK_{purpose}`

## Option Sets
- Use **global** option sets for values shared across multiple tables
- Use **local** option sets for table-specific values unlikely to be reused
- Global option set name: `{prefix}_OptionSetName`
- Always add new options — never delete or reuse option values (reuse breaks reporting)
- Option set **integer values are language-neutral and immutable** — never re-purpose, re-use, or delete a value. Display labels are localized via translation export, never the integer values

## Schema Language
- Schema names (tables, columns, relationships, alternate keys, choice values) are **English-only, lowercase, prefixed**. Never localize the schema layer.
- Display names / labels / descriptions / option set labels are localized via translation export — see `15-multilingual-localization.md`.
- Code (FetchXML, JS, plugin code, tests) references schema names only — never display names.

## Extending Field Service (`msdyn_*`) Tables
When the project includes Field Service:
- **Never replace** `msdyn_workorder`, `bookableresourcebooking`, `msdyn_resourcerequirement`, `msdyn_customerasset`, `msdyn_functionallocation`, `msdyn_agreement`, or any other OOB FS entity with a custom analogue.
- Custom columns on `msdyn_*` tables use your `{prefix}_` and live in your unmanaged solution layered **above** the Field Service managed solution. Never add components to the FS / URS / RSO managed solutions.
- Never rename or delete columns/relationships on `msdyn_*` tables.
- Hierarchies (Customer Asset, Functional Location) use the OOB self-referential lookups — do not invent parallel hierarchy tables.
- Full rules: see `12-field-service-entities.md`.
