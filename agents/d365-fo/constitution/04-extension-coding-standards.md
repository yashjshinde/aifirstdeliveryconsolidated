---
agent: d365-fo
sub-domain: coding-standards
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O Extension Coding Standards (X++)

> Full X++ coding standards PORTED VERBATIM from a battle-tested predecessor per R16. Queued as **bk-026**. This v1 captures the structure + key conventions.

## Naming conventions

- **Tables**: `<Prefix><Module><Noun>` (e.g., `AcmeSalesQuoteLine`)
- **Classes**: `<Prefix><Module><Noun>` (e.g., `AcmeSalesQuoteValidator`)
- **Extension class names** (CoC): `<Prefix><BaseName>_Extension` (e.g., `AcmeSalesTable_Extension`)
- **Methods**: PascalCase; verbs first (`calculateNetPrice`, `getCustomerCredit`)
- **Variables**: camelCase; descriptive (`netPriceWithTax` not `np`)
- **Constants**: SCREAMING_SNAKE_CASE inside macros or `const` declarations

## Method patterns

- Every public method has an XML doc comment with `<param>` + `<returns>` + `<remarks>`
- Pseudocode required at the top of every method (per [00-charter.md](00-charter.md) Content Depth Rules)
- Single-responsibility: methods do one thing; refactor when above ~50 lines
- Exception handling: throw typed exceptions (`Global::error()` / `throw error()`) - never silently swallow

## CoC (Chain-of-Command) extensions

- One `_Extension` class per base class being extended
- Wrap base method with `next` call OR replace logic entirely (document the choice)
- Never bypass `next` without a justifying comment + architectural sign-off

## Table extensions

- Add fields via the table-extension designer; don't modify base fields
- Indexes follow the base table's existing index pattern
- Validation methods (`validateField`, `validateWrite`) implemented via CoC on the table-class extension

## The 32-type extension catalogue

The full catalogue covers every supported F&O extension type with: naming convention, base-class pattern, lifecycle hooks, gotchas. PORTED VERBATIM in bk-026.

## Source attribution

Full text PORTED from a predecessor's d365-fo `03-extension-coding-standards.md` per R16. Queued as bk-026 for verbatim ingestion.
