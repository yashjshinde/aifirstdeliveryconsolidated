# Field Mapping — {migration-id}

**Version:** 1.0
**Date:** {date}
**Author:** Data Migration Agent
**Status:** DRAFT
**Direction:** {direction}
**Entity:** {entity}

---

## 1. Overview

{brief description — source system, target system, number of fields, key transformation notes}

---

## 2. Source Schema

### {Source System Name} — {Entity/File}

| # | Column / Field | Type | Required | Sample Value | Notes |
|---|---|---|---|---|---|
| 1 | {col} | {type} | Y/N | {sample} | {notes} |

---

## 3. Target Schema

### {Target System Name} — {Entity/Table}

| # | Logical Name | Display Name | Type | Required | Alternate Key | Notes |
|---|---|---|---|---|---|---|
| 1 | {logicalname} | {display} | {type} | Y/N | Y/N | |

---

## 4. Mapping Table

| # | Source Field | Source Type | Target Field | Target Type | Transformation | Validation Rule | Classification | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | {source} | {type} | {target} | {type} | DIRECT | Required | Internal | |
| 2 | {source} | {type} | {target} | {type} | CAST(INT) | Range 1-100 | Internal | |
| 3 | {source} | {type} | {target} | {type} | LOOKUP(ref.country, code, name) | Must exist in ref | Internal | |
| 4 | {source} | {type} | {target} | {type} | `toDate({col}, 'dd/MM/yyyy')` | Valid date | Internal | |
| 5 | NONE | — | {target} | {type} | DEFAULT('Active') | — | Internal | System default |

---

## 5. Lookup / Reference Data

| Lookup Name | Reference Table | Key Column | Value Column | Sample |
|---|---|---|---|---|
| {lookup} | `ref.{table}` | {key} | {value} | `1` → `Active`, `2` → `Inactive` |

---

## 6. Derived / Calculated Fields

| Target Field | Source Field(s) | Derivation Rule |
|---|---|---|
| {field} | {source1}, {source2} | `concat({source1}, ' ', {source2})` |
| {field} | NONE | `utcNow()` |

---

## 7. Fields Not Migrated

| Source Field | Reason |
|---|---|
| {field} | Not in target schema |
| {field} | Out of scope per Section 13 of spec |
| {field} | Deprecated — no equivalent in target |

---

## 8. ADF Data Flow Expression Summary

```
// DF_{Entity}_Map — Derived Column expressions
{TargetField1} = trim(upper({SourceField1}))
{TargetField2} = toDate({SourceField2}, 'dd/MM/yyyy')
{TargetField3} = iifNull({SourceField3}, 'DEFAULT_VALUE')
{TargetField4} = iif({SourceField4} == '1', 'Active', iif({SourceField4} == '2', 'Inactive', 'Unknown'))
{DerivedField} = concat({SourceFieldA}, ' ', {SourceFieldB})
```

---

## 9. Open Items

| # | Item | Owner | Due |
|---|---|---|---|
| 1 | {question or gap} | {name} | {date} |
