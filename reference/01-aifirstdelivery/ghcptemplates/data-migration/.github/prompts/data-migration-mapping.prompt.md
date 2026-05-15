---
mode: agent
description: "Generate a field mapping document — source to target field mapping with transformations. Triggers on: 'mapping', 'field mapping', 'data mapping'."
---

Generate the Field Mapping Document for a migration.

## Usage

```
/data-migration-mapping {migration-id}
```

## Pre-condition

`specs/{migration-id}/review.md` must exist and status must be **APPROVED**.

## Steps

1. Read ALL files in `constitution/`.
2. Verify `specs/{migration-id}/review.md` is APPROVED — stop if not.
3. Read `specs/{migration-id}/spec.md`.
4. Generate `docs-generated/{migration-id}/field-mapping.md`.

## field-mapping.md Structure

### Header

```markdown
# Field Mapping — {migration-id}

**Version:** 1.0
**Date:** {today}
**Author:** Data Migration Agent
**Status:** DRAFT
**Direction:** {direction}

---
```

### Section 1 — Overview

Brief summary: which entity/file, source system, target system, number of fields.

### Section 2 — Source Schema

For SFTP sources (CSV/JSON):

| Column | Data Type | Sample Value | Notes |
|---|---|---|---|
| {col_name} | {source type} | {example} | {any issues} |

For Dataverse sources:

| Logical Name | Display Name | Type | Required | Notes |
|---|---|---|---|---|
| {logicalname} | {display} | {type} | Yes/No | |

For SQL sources:

| Column | SQL Type | Nullable | Notes |
|---|---|---|---|
| {col} | {type} | Yes/No | |

### Section 3 — Target Schema

For Dataverse targets:

| Logical Name | Display Name | Type | Required | Alternate Key | Notes |
|---|---|---|---|---|---|
| {logicalname} | {display} | {type} | Yes/No | Yes/No | |

For SFTP targets (CSV/JSON):

| Column | Data Type | Format | Required | Notes |
|---|---|---|---|---|
| {col} | {type} | {format} | Yes/No | |

### Section 4 — Mapping Table

This is the primary deliverable.

| # | Source Field | Source Type | Target Field | Target Type | Transformation | Validation Rule | Classification | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | {source} | {type} | {target} | {type} | {expression or DIRECT} | {rule} | PII/Sensitive/Internal/Public | |

**Transformation values:**
- `DIRECT` — no transformation, direct copy
- `CAST({type})` — type conversion
- `LOOKUP({ref_table}, {key_col}, {value_col})` — lookup enrichment
- `CONCAT({a}, ' ', {b})` — string concatenation
- `FORMAT({col}, '{pattern}')` — date/number format
- `IIF({condition}, {true_val}, {false_val})` — conditional
- `DEFAULT({value})` — default when source is null
- `TRIM | UPPER | LOWER | LEFT({n}) | RIGHT({n})` — string operations
- `DERIVED: {formula}` — complex derived field

### Section 5 — Lookup / Reference Data

For each lookup transformation, document:

| Lookup | Reference Table | Key Column | Value Column | Sample Mappings |
|---|---|---|---|---|
| {name} | `ref.{table}` | {key} | {value} | Code 1 → 'Active', Code 2 → 'Inactive' |

### Section 6 — Derived / Calculated Fields

Fields that have no direct source equivalent:

| Target Field | Source | Derivation Rule |
|---|---|---|
| {field} | {source field(s) or NONE} | {formula / business rule} |

### Section 7 — Fields Not Migrated

| Source Field | Reason Not Migrated |
|---|---|
| {col} | {reason: not in target schema / out of scope / deprecated / no mapping agreed} |

### Section 8 — Data Flow Expression Summary

Provide the ADF Data Flow `derivedColumn` expression block for all non-DIRECT mappings:

```
// {entity} mapping expressions for DF_{Entity}_Map
{TargetField} = {expression}
{TargetField} = trim(upper({SourceField}))
{TargetField} = toDate({SourceField}, 'dd/MM/yyyy')
```

### Section 9 — Open Items

| # | Item | Owner | Due |
|---|---|---|---|
| 1 | {question or gap} | {name} | {date} |

---

## Output

Write `docs-generated/{migration-id}/field-mapping.md`.

Print:

```
FIELD MAPPING WRITTEN — {migration-id}
════════════════════════════════════════
File        : docs-generated/{migration-id}/field-mapping.md
Entity      : {entity}
Total Fields: {N} mapped, {N} derived, {N} excluded
Lookups     : {N}
Open Items  : {N}

Next step: /data-migration-pipeline {migration-id}
```
