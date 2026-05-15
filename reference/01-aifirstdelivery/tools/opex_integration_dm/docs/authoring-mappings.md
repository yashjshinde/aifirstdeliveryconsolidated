# Authoring mappings

How a mapping analyst takes a new source-to-Dataverse requirement and turns it into a working integration. **No code involved** — you edit Excel and (occasionally) JSON.

## The big picture

```
   1. Edit workbook  ──►  2. excel-to-json  ──►  3. fill blanks  ──►  4. validate-config  ──►  5. commit
        (.xlsx)              (CLI)             (JSON edit)              (CLI)                   (git)
```

Every step is local. You don't need an Azure account; you don't run any pipelines. The build/ops team picks up your committed changes and ships them.

## 1. Edit the workbook

The mapping workbook is `Backup 01 CustomerDataMapping - Copy.xlsx` (at repo root, currently in `reference/` if your team chose that layout).

**One sheet per entity.** Sheet name becomes the `entityKey` — lower-cased. E.g. `Customer` → `customer.json`.

**Required columns** (header row stays as-is; the converter recognizes them):

| Column | Required | Example | Notes |
| --- | --- | --- | --- |
| Source System | yes | `Oracle Fusion` | informational |
| Source Entity | yes (recommended) | `HZ_CUST_ACCOUNTS` | informational, but fill it in — closes a known gap |
| Source Field | **yes** | `ACCOUNT_NUMBER` | The CSV column header your file actually has |
| Source Data Type | recommended | `Varchar2` | drives `sourceType` |
| Source Field MaxLength | recommended | `100` | drives `maxLength` |
| Transformation Logic | **yes** | see below | one cell of prose; drives `transform.type` |
| Target System | yes | `D365` | informational |
| Target Entity (Dataverse) | **yes** | `Account` | converter resolves the logical name |
| Target Field (Schema Name) | **yes** | `accountnumber` | the Dataverse attribute schema name |
| Target Field Type | **yes** | `Text`, `Choice`, `Lookup`, `DateTime`, `Yes/No`, `State` | drives `targetType` |
| Mandatory (Y/N) | recommended | `Y` | `Y` → adds `mandatory:true` + `notEmpty` validation |
| Default Value | optional | `0` | put as a literal |
| Key Type (PK/Alt) | recommended | `Alt Key` | "Alt" in this cell → adds the field to `target.alternateKey` |
| Comments | optional | | doesn't affect the JSON |

## 2. The "Transformation Logic" prose

This one column tells the converter which of the 10 transform types to use. The matching is keyword-based, deterministic, documented in `tools/excel_to_json/excel_to_json/converter.py`. The cheat sheet:

| Write this in the cell | Generates this transform |
| --- | --- |
| `Direct` (or blank) | `direct` |
| `Statecode (A→0, I→1)` (any mention of `statecode` or `state code`) | `state` with default A→0, I→1 |
| `Map the Choice ...` / `... option set ...` | `choice` with **empty map** — you fill the values in step 3 |
| `Need to map the code with D365 lookup ...` / `Resolve lookup ...` | `lookup` with **blank** entitySetName/navigationProperty — fill in step 3 |
| `Check in file which column value is set as "Y" ...` | `conditional` (Y/N matrix → option-set value) — fill rules in step 3 |
| `Map Y / N Field` | `yesNo` with sensible defaults |
| `Need time in UTC time zone` | `dateTime` (UTC→UTC) |

When the converter can't recognize the prose, it defaults to `direct` and the rest is up to step 3.

## 3. Fill the blanks the converter cannot fill

The converter is honest about what it doesn't know. After `excel-to-json` runs, open the generated JSON and complete:

### Lookups — `entitySetName` and `navigationProperty`

Dataverse's plural names are irregular (`accounts`, `opportunities`, `feedbacks`). The workbook doesn't carry them. After conversion, each lookup field looks like:

```json
"transform": {
  "type": "lookup",
  "forward": {
    "referenceTable": "opx_equipmentdiscount",
    "entitySetName": "",            ←  fill: opx_equipmentdiscounts
    "navigationProperty": "",       ←  fill: opx_EquipmentDiscount
    "refField": "",                 ←  fill: opx_code
    "primaryIdField": "",           ←  fill: opx_equipmentdiscountid
    ...
  }
}
```

To find these in Dataverse:

```http
GET https://<env>.crm.dynamics.com/api/data/v9.2/EntityDefinitions(LogicalName='opx_equipmentdiscount')?$select=EntitySetName,SchemaName,PrimaryIdAttribute
```

The response gives you `EntitySetName` directly. The `navigationProperty` on a parent entity is queried via the parent's `ManyToOneRelationships`:

```http
GET .../EntityDefinitions(LogicalName='account')/ManyToOneRelationships?$filter=ReferencedEntity eq 'opx_equipmentdiscount'&$select=ReferencingEntityNavigationPropertyName
```

`ReferencingEntityNavigationPropertyName` is what you paste into `navigationProperty`.

### Choices — the `map` values

For `choice` transforms the converter leaves `map: {}` empty. Fill from your enumeration of source values to Dataverse option-set integers:

```json
"forward": {
  "map": {
    "Billing Account": 884870000,
    "Service Account": 884870001,
    "Both": 884870002
  },
  "default": null,
  "onMissing": "fail"
}
```

The right-hand integers come from the option-set definition in your Dataverse solution.

### Conditional transforms

The `conditional` type comes through with empty `rules`. Fill them — example for the Contact primary-phone Y/N matrix:

```json
"transform": {
  "type": "conditional",
  "forward": {
    "rules": [
      { "when": "PRIMARY_MOBILE_PHONE=Y", "value": 884870000 },
      { "when": "PRIMARY_WORK_PHONE=Y",   "value": 884870001 },
      { "when": "PRIMARY_LAND_PHONE=Y",   "value": 884870002 }
    ],
    "default": null
  }
}
```

If the entity is bidirectional, add a `reverse.writes[]` block per the [architectural spec §3.2](../reference/architectural-spec.md).

### Relationships and post-load actions

The converter does **not** parse the workbook's prose-shaped trailing rows (Site sheet R19+, Contact sheet R24+). Add `relationships[]` and `postLoadActions[]` manually. The shipped `site.json` and `contact.json` are working examples.

## 4. Validate

```powershell
py -3 -m validate_config config
```

You'll see one of:

- **`0 error(s), N warning(s)`** — ready to commit. Warnings are informational (e.g. `V051` UTC→UTC dateTime that could be `direct`).
- **Errors** — fix them. Common ones:
  - `V002` "required property missing" — usually a blank `navigationProperty` or `entitySetName` on a lookup.
  - `V004` filename ≠ `entityKey` — rename the file or fix the value.
  - `V010` "wave references unknown entityKey" — you added a wave entry without the corresponding entity JSON.
  - `V028` "createIfMissing=true rejected in v1" — set it to `false` (the v2 feature isn't ready).

The full rule catalog is at [`../detailed-design/01-config-schemas.md` §6](../detailed-design/01-config-schemas.md).

## 5. Variant values (`Delhi` / `new delhi` / etc.) — alias files

When source data carries multiple spellings of the same logical value, don't try to encode them in the entity mapping. Use an **alias file** at `/config/aliases/<refTable>__<refField>.json`:

```json
{
  "$schemaVersion": "1",
  "refTable": "opx_city",
  "refField": "opx_cityname",
  "normalize": ["trim", "collapseWhitespace", "toLowerCase"],
  "aliases": {
    "delhi":       "Delhi",
    "new delhi":   "Delhi",
    "bombay":      "Mumbai",
    "calcutta":    "Kolkata"
  }
}
```

Reference it from the entity mapping:

```json
"transform": {
  "type": "lookup",
  "forward": {
    "referenceTable": "opx_city",
    "refField": "opx_cityname",
    "entitySetName": "opx_cities",
    "navigationProperty": "opx_City",
    "primaryIdField": "opx_cityid",
    "normalize": ["trim", "collapseWhitespace", "toLowerCase"],
    "aliasesFile": "/config/aliases/opx_city__opx_cityname.json",
    "onAliasMiss": "passThrough",
    "onMissing": "suggestion"
  }
}
```

Two entities looking up the same `(refTable, refField)` automatically share the same alias file — stewards curate one list. See spec §3.3 for the full pattern.

## 6. Commit

```powershell
git add config/entities/<entity>.json config/aliases/*.json
git commit -m "<entity>: add <feature description>"
git push
```

The CI gate runs `validate-config --strict` on every PR and fails the build if anything's off. Once merged, the deploy pipeline (or someone running `infra/deploy.ps1`) picks up the change automatically on the next run.

## Checklist for a new entity onboarding

- [ ] Sheet added to workbook with all required columns filled
- [ ] `excel-to-json` produced the entity JSON
- [ ] Lookup `entitySetName` / `navigationProperty` filled from Dataverse metadata
- [ ] Choice `map` values filled from the option-set definitions
- [ ] Conditional `rules` (and `reverse.writes` if bidirectional) filled
- [ ] Relationships and post-load actions added if applicable
- [ ] Alias files added for variant-handling masters
- [ ] `validate-config` returns zero errors
- [ ] Dataverse admin has been told which custom artifacts they need to create
- [ ] Entity added to the relevant wave file in `/config/waves/`
- [ ] PR submitted, CI green, merged

## When the workbook isn't enough

Sometimes the converter genuinely can't infer something — those are the gaps tracked as **P0.8** in [`../implementation.md`](../implementation.md). When that happens, you have two clean options:

1. **Edit the JSON directly** (smaller scope, no workbook change).
2. **Extend the workbook + extend the converter** (when the same gap will recur).

Talk to the build team before going down option 2 — it costs them a small change to `tools/excel_to_json/converter.py` and a regression test.
