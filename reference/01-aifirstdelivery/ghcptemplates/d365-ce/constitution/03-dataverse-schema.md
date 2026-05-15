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
