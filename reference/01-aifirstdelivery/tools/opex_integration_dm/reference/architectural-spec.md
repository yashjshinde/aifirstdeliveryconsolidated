# Metadata-Driven Integration & Migration Framework on Azure Data Factory — Detailed Specification

## Context

The business needs a **configurable, metadata-driven integration and data-migration framework** that can move data **in either direction** between an external file/system endpoint (initially SFTP-hosted CSV/Excel from Oracle Fusion) and Dataverse / D365, using **Azure Data Factory (ADF)** as the orchestration backbone. **Direction is itself a configuration value** — the same entity mapping can be authored once and run inbound (file → Dataverse), outbound (Dataverse → file), or both (on independent schedules). The first use case is to load three Oracle Fusion entities — **Customer (→ Account)**, **Site (→ Functional Location + Account address + N:N)**, and **Contact (→ Contact + N:N + primary contact update)** — but the framework must be **generic**: onboarding a new entity or flipping its direction should require only a new/edited mapping configuration file, **not** new pipelines or code.

The starting point is:

- The objectives in [Integration framework ADF.docx](Integration%20framework%20ADF.docx) *(same folder)*.
- The partial source-to-destination mapping in [../Backup 01 CustomerDataMapping - Copy.xlsx](../Backup%2001%20CustomerDataMapping%20-%20Copy.xlsx) (3 sheets — Customer 21 fields, Site 14 fields + N:N + 7 address-pushdown fields, Contact 22 fields + N:N + primary-contact update).

Decisions confirmed with the requester (2026-05-13):
- **Config format:** JSON.
- **Scope:** Build the generic engine and validate it by onboarding the 3 entities above.
- **Dataverse writer:** ADF native Dataverse connector (Copy Activity / Data Flow).
- **Missing lookup policy:** Project-level default + per-mapping override (`createMissingLookups: true|false`).
- **Direction:** Configurable per entity: `inbound` (file → Dataverse), `outbound` (Dataverse → file), or `bidirectional` (both, on independent triggers).
- **Outbound extraction:** Incremental by default with a **configurable filter expression** (not restricted to `modifiedon`) — supports OData filter strings, FetchXML, or saved views; a `full` mode is available for initial loads/recovery.
- **Outbound N:N export:** Each N:N relationship is emitted as a **separate association file** (one row per association with the two alt-keys), mirroring the inbound shape.
- **Outbound delivery hardening:** Plain SFTP upload only at this stage — no PGP encryption, atomic rename, or checksum sidecars (revisit per downstream-system requirements).

---

## 1. Solution Architecture

```
                          ┌─────────────────────────────────────────────────────────────────────────┐
                          │                          Azure Data Factory                             │
                          │                                                                         │
                          │   pl_master_orchestrator (switches on config.direction)                 │
                          │      │                                                                  │
                          │      ├── INBOUND (file → Dataverse) ──────────────────────────────┐     │
   SFTP file endpoint     │      │   ├──► pl_extract_file       (SFTP   → /raw)               │     │
   (Oracle Fusion or      │      │   ├──► pl_stage_validate     (/raw   → /staged)            │     │
   downstream consumer)   │      │   ├──► pl_master_prefetch    (DV     → /masters)           │     │
            ▲             │      │   ├──► pl_transform_inbound  (staged+masters → /final)     │     │
            │  pull/push  │      │   ├──► pl_load_upsert        (/final → Dataverse)          │     │
            ▼             │      │   └──► pl_load_relationships (N:N associate, post-load)    │     │
                          │      │                                                            │     │
                          │      └── OUTBOUND (Dataverse → file) ─────────────────────────────┤     │
                          │          ├──► pl_master_prefetch    (option-sets + lookups cache) │     │
                          │          ├──► pl_extract_dataverse  (DV query/FetchXML → /raw)    │     │
                          │          ├──► pl_transform_outbound (raw+masters → /staged-out)   │     │
                          │          ├──► pl_export_relationships (N:N → association files)   │     │
                          │          └──► pl_deliver_sftp       (/final-out → SFTP)           │     │
                          └─────────────────────────────────────────────────────────────────────────┘
                                       │                       │                  │
                          ┌────────────┴───────────┐  ┌─────────┴────────┐  ┌──────┴────────┐
                          │   Azure Data Lake      │  │ Azure Key Vault  │  │  Dataverse /  │
                          │   /config              │  │  (SFTP creds,    │  │     D365      │
                          │   /raw  /staged        │  │   SPN secrets,   │  │  (Account,    │
                          │   /masters  /final     │  │   API keys)      │  │   FuncLoc,    │
                          │   /staged-out /final-out│  │                 │  │   Contact)    │
                          │   /errors  /audit      │  │                  │  │               │
                          │   /audit/watermarks    │  │                  │  │               │
                          └────────────────────────┘  └──────────────────┘  └───────────────┘

                          Monitoring → Log Analytics + Azure Monitor → Logic App / Power Automate → Email / Teams
```

Key principles:

- **Everything routing-related is in metadata** (`/config/<entity>.json`), **including the direction of flow**. The pipelines are entity-agnostic *and* direction-agnostic at the orchestrator level — they read configuration from ADLS at the start of every run, so mapping or direction edits take effect on the next run automatically.
- **Staging zones are immutable per run**. Inbound uses `/raw → /staged → /final → Dataverse`; outbound uses `/raw → /staged-out → /final-out → SFTP`. The `runId` is an ADF `pipeline().RunId` and is the correlation ID across all logs in either direction.
- **Symmetric mapping rows**: a field-mapping row says "this *file column* ↔ this *Dataverse field*" once; the engine applies the forward transform on inbound and the reverse transform on outbound. Where a transform isn't trivially invertible (e.g. `concat`, `split`, `conditional`), the config must declare an explicit `reverse` block.
- **All secrets** (SFTP, Dataverse SPN, SMTP/Teams webhooks) live in **Azure Key Vault**, surfaced to ADF via linked-service Key Vault references — never as plain parameters.

---

## 2. Configuration Model (JSON)

Mappings are authored once per source entity. They are produced from the existing Excel mapping sheet by a small **build/conversion utility** (see §11) so business analysts keep authoring in Excel.

### 2.1 Entity mapping file — `/config/entities/<entity>.json`

> **Naming anchor:** `source` always refers to the **file/SFTP endpoint** (CSV/Excel side). `target` always refers to the **Dataverse endpoint**. The `direction` field decides which endpoint is read from and which is written to at runtime — so the same mapping rows serve both flows.

```jsonc
{
  "entityKey": "customer",                        // unique slug, used as folder/run prefix
  "direction": "inbound",                         // inbound | outbound | bidirectional
                                                  //   inbound      = read source (file) → write target (Dataverse)
                                                  //   outbound     = read target (Dataverse) → write source (file)
                                                  //   bidirectional = both, scheduled independently (see §12)

  "source": {                                     // FILE side — used as extract on inbound, as deliver on outbound
    "system": "SFTP",
    "format": "csv",                              // csv | xlsx
    "sftpLinkedService": "ls_sftp_fusion",        // KV-backed
    "inbound": {                                  // file-pickup (inbound) settings
      "pathPattern": "/exports/HZ_CUST_ACCOUNTS_*.csv",
      "worksheet": null,                          // required when format=xlsx
      "archiveTo": "/archive/customer/{yyyy}/{MM}/{dd}/",
      "onMultipleFiles": "concat"                 // concat | latestOnly | fail
    },
    "outbound": {                                 // file-deliver (outbound) settings
      "pathPattern": "/inbox/customer/customer_{yyyyMMdd_HHmmss}_{runId}.csv",
      "worksheet": "Customer",                    // when format=xlsx
      "writeHeaderRow": true,
      "emptyFileBehavior": "writeHeaderOnly"      // writeHeaderOnly | skipFile | fail
    },
    "delimiter": ",",
    "encoding": "utf-8",
    "headerRow": 1
  },

  "target": {                                     // DATAVERSE side — used as load on inbound, as extract on outbound
    "system": "Dataverse",
    "entityLogicalName": "account",
    "alternateKey": ["accountnumber"],            // upsert key on inbound; alt-key projected on outbound
    "inbound": {                                  // write settings (inbound only)
      "writeMode": "upsert",                      // upsert | create | update
      "bypassPlugins": true                       // Dataverse "BypassCustomPluginExecution" header
    },
    "outbound": {                                 // read settings (outbound only)
      "query": {
        "mode": "odataFilter",                    // odataFilter | fetchXml | savedView
        "odataFilter": "statecode eq 0 and modifiedon gt {lastSyncedAt}",
                                                  // free-form: any column, any operator;
                                                  // tokens: {lastSyncedAt}, {runStartUtc}, {asOfDate}
        "fetchXml": null,                         // mutually exclusive with odataFilter
        "savedView": null,                        // e.g. "Active Customers For Export"
        "orderBy": "modifiedon asc",
        "pageSize": 5000,
        "maxRows": null                           // null = unbounded
      },
      "delta": {
        "enabled": true,                          // false = always full
        "watermarkStore": "/audit/watermarks/customer.json",
        "watermarkField": "modifiedon",           // any field exposed by the query result
        "initialFromUtc": "2000-01-01T00:00:00Z", // bootstrap for first run
        "fullModeOverrideParam": "forceFull"      // pipeline param to force full this run
      },
      "expand": [                                 // OData $expand for resolving lookups to alt-keys at extract time
        { "navigationProperty": "opx_EquipmentDiscountId", "select": ["opx_code"] },
        { "navigationProperty": "primarycontactid",        "select": ["opx_contactnumber"] }
      ]
    }
  },

  "dedup": {                                      // applied after extract, both directions
    "enabled": true,
    "checksumColumns": ["ACCOUNT_NUMBER"],        // names refer to source-side columns
    "onDuplicate": "keepLatest"                   // keepLatest | keepFirst | fail
  },
  "dateTime": {
    "defaultTimeZone": "UTC",                     // project-level default
    "format": "yyyy-MM-dd HH:mm:ss"
  },
  "lookups": {
    "createMissingDefault": false                 // inbound-only behavior; see §4.5
  },
  "fields": [ /* see §2.2 */ ],
  "relationships": [ /* see §2.3 */ ],
  "postLoadActions": [ /* inbound only — see §2.4 */ ]
}
```

**Direction validation rules (enforced by JSON Schema):**

| `direction` | `source.inbound` | `source.outbound` | `target.inbound` | `target.outbound` |
| --- | --- | --- | --- | --- |
| `inbound` | **required** | ignored | **required** | ignored |
| `outbound` | ignored | **required** | ignored | **required** |
| `bidirectional` | **required** | **required** | **required** | **required** |

### 2.2 Field-mapping block — repeated per row of the mapping sheet

A field mapping is **direction-neutral**: `source` is always the file-column name, `target` is always the Dataverse schema name. The `transform` block has a **forward** behavior (file → Dataverse, used on inbound) and an optional **reverse** behavior (Dataverse → file, used on outbound). The engine auto-derives `reverse` for trivially-invertible transforms; for the rest, the config must declare it.

```jsonc
{
  "source": "ACCOUNT_NUMBER",                     // file column name
  "sourceType": "text",                           // text|int|decimal|date|datetime|bool
  "target": "accountnumber",                      // Dataverse schema name
  "targetType": "text",                           // text|int|decimal|datetime|dateonly|bool|choice|state|lookup
  "maxLength": 100,
  "mandatory": true,                              // applies in the *write* direction at runtime
  "defaultValue": null,
  "validations": ["notEmpty", "maxLength:100"],
  "outboundInclude": true,                        // when false, field is suppressed on outbound exports
  "inboundInclude": true,                         // when false, field is suppressed on inbound writes
  "transform": {
    "type": "direct",                             // direct | concat | split | map | conditional | dateTime | lookup | choice | state | yesNo
    "forward": { /* type-specific params, file → Dataverse */ },
    "reverse": { /* required only when not auto-invertible */ }
  }
}
```

**Auto-invertible vs. explicit-reverse transforms** (see §3 for the full table):

- *Auto-invertible* (engine derives reverse from forward): `direct`, `dateTime`, `yesNo`, `choice`, `state`, `lookup`, `map`.
- *Requires explicit `reverse`*: `concat`, `split`, `conditional`.

Example — auto-invertible `choice` covers both directions from one declaration:

```jsonc
"transform": {
  "type": "choice",
  "forward": {
    "map": { "Billing Account": 884870000, "Service Account": 884870001, "Both": 884870002 },
    "default": null,
    "onMissing": "fail"                           // fail | useDefault | passThrough
  }
  // reverse auto-derived by inverting the map: int → label
}
```

Example — explicit `reverse` for a `conditional` (Y/N matrix → primary phone type):

```jsonc
"transform": {
  "type": "conditional",
  "forward": {
    "rules": [
      { "when": "PRIMARY_MOBILE_PHONE=Y", "value": 884870000 },
      { "when": "PRIMARY_WORK_PHONE=Y",   "value": 884870001 },
      { "when": "PRIMARY_LAND_PHONE=Y",   "value": 884870002 }
    ]
  },
  "reverse": {                                    // one outbound input column → multiple file columns
    "writes": [
      { "column": "PRIMARY_MOBILE_PHONE", "value": "Y", "when": "opx_primaryphonetype=884870000", "elseValue": "N" },
      { "column": "PRIMARY_WORK_PHONE",   "value": "Y", "when": "opx_primaryphonetype=884870001", "elseValue": "N" },
      { "column": "PRIMARY_LAND_PHONE",   "value": "Y", "when": "opx_primaryphonetype=884870002", "elseValue": "N" }
    ]
  }
}
```

Example — explicit `reverse` for a `concat`:

```jsonc
"transform": {
  "type": "concat",
  "forward": { "inputs": ["FIRST_NAME","LAST_NAME"], "separator": " ", "target": "fullname" },
  "reverse": { "input": "fullname", "regex": "^(?<FIRST_NAME>[^ ]+) (?<LAST_NAME>.+)$" }
}
```

Examples drawn directly from the mapping sheet:

| Sheet row | Field | Transform block |
| --- | --- | --- |
| Customer R4 | `ACCOUNT_STATUS` → `statecode` | `{type:"state", map:{"A":0,"I":1}, default:0}` |
| Customer R5 | `ACCOUNT_TYPE` → `opx_AccountType` | `{type:"choice", map:{"Billing Account":884870000,"Service Account":884870001,"Both":884870002}}` |
| Customer R6 | `EQUIPMET_DISCOUNT` → `opx_EquipmentDiscountId` | `{type:"lookup", referenceTable:"opx_equipmentdiscount", refField:"opx_code", createIfMissing:false}` |
| Customer R14 | `Credit Hold` → `CreditOnHold` | `{type:"yesNo", trueValues:["Y","Yes","1"], falseValues:["N","No","0"]}` |
| Customer R17,R20 | `LAST_UPDATE_DATE` → `modifiedon` | `{type:"dateTime", sourceTz:"America/Chicago", targetTz:"UTC"}` |
| Contact R10–R12 | `PRIMARY_MOBILE_PHONE/_WORK_PHONE/_LAND_PHONE` → `opx_primaryphonetype` | `{type:"conditional", rules:[{when:"PRIMARY_MOBILE_PHONE=Y",value:884870000},{when:"PRIMARY_WORK_PHONE=Y",value:884870001},{when:"PRIMARY_LAND_PHONE=Y",value:884870002}]}` |

### 2.3 Relationship block (N:N + lookup-on-account)

```jsonc
"relationships": [
  {
    "type": "NN",
    "relationshipSchemaName": "msdyn_msdyn_functionallocation_account",
    "primaryEntity": "account",
    "primaryKey": { "field": "accountnumber", "source": "ACCOUNT_NUMBER" },
    "relatedEntity": "msdyn_functionallocation",
    "relatedKey":   { "field": "msdyn_name",   "source": "PARTY_SITE_NUMBER" },
    "inbound": {
      "writeMode": "associate"                    // associate | disassociate | upsertAssociation
    },
    "outbound": {
      "exportMode": "separateFile",               // separateFile (only mode in scope)
      "filePattern": "/inbox/customer/customer_account_funcloc_assoc_{yyyyMMdd_HHmmss}_{runId}.csv",
      "columns": ["ACCOUNT_NUMBER","PARTY_SITE_NUMBER"]
    }
  }
]
```

### 2.4 Post-load actions (e.g. set Account.primarycontactid from Contact load)

```jsonc
"postLoadActions": [
  {
    "type": "setLookup",
    "condition": "PRIMARY_CONTACT_FLAG=Y",
    "targetEntity": "account",
    "targetLookupField": "primarycontactid",
    "valueFromSelf": "contactid"
  }
]
```

### 2.5 Project-level settings — `/config/_project.json`

```jsonc
{
  "schedules": {
    "customer_inbound":  { "type": "daily",        "atUtc": "02:00", "direction": "inbound"  },
    "customer_outbound": { "type": "everyNHours",  "n": 4,           "direction": "outbound" },
    "site_inbound":      { "type": "daily",        "atUtc": "02:30", "direction": "inbound"  },
    "contact_inbound":   { "type": "daily",        "atUtc": "03:00", "direction": "inbound"  }
  },
  "batchSize": 500,                                // Dataverse batch chunk (write side)
  "outboundPageSize": 5000,                        // Dataverse extract page size default
  "retry": { "maxAttempts": 5, "backoffSec": 30, "exponential": true },
  "createMissingLookupsDefault": false,            // inbound-only
  "partialLoadAllowed": true,                      // applies to writes either direction
  "failureThresholdPct": 5,                        // pipeline fails if >5% of rows error
  "notification": {
    "onFailure": ["email","teams"],
    "onPartial": ["email"],
    "onSlaBreach": ["teams"],
    "slaMinutes": 60,
    "to": ["dataops@example.com"],
    "teamsWebhookSecretName": "kv-teams-webhook"
  }
}
```

---

## 3. Reusable Transformation Library

Implemented as a single **Mapping Data Flow** (or a parameterized library of Data Flow / Function steps) keyed on `transform.type`. All transforms operate against a row + the loaded mapping config. Each transform declares its **reverse semantics** so the same library serves both inbound and outbound runs.

### 3.1 Transform catalog

| Type | Purpose (forward = file→DV) | Forward params | Reverse (DV→file) | Source rows that need it |
| --- | --- | --- | --- | --- |
| `direct` | 1:1 copy with type-cast + length validation | — | **Auto.** Same field, cast to target type; format dates per `source.format`. | Customer R2–R3, all Site address fields, most Contact fields |
| `concat` | Merge ≥2 columns into one Dataverse field | `inputs[]`, `separator` | **Explicit.** Must declare `reverse.regex` to split the DV value back into the input columns; output to `outputs[]`. | Reserved for future mappings |
| `split` | Regex split, output ≥1 target columns | `input`, `regex`, `outputs[]` | **Explicit.** Must declare `reverse.inputs[]` + `reverse.separator` to concat back. | Reserved |
| `conditional` | Y/N matrix → single value | `rules[]` (`when`, `value`, optional `default`) | **Explicit.** Must declare `reverse.writes[]` — one rule per output column. | Contact R10–R12, R16–R18 |
| `map` (a.k.a. translation) | Static value translation | `map{}`, `default`, `caseSensitive` | **Auto.** Map is inverted; if forward map is not 1:1, schema-validation fails and config must declare `reverse.map` explicitly. | Customer freight terms (R11–R12) |
| `choice` | Translate to Dataverse option-set integer | `map{}`, `default`, `onMissing` | **Auto.** Inverts integer→label; for unseen integers, emits `default` or the integer string per `onMissing`. | Customer R5, R12–R13, R15; Contact R10, R16, R21 |
| `state` | Translate to `statecode` int | `map{}`, `default` | **Auto.** Same as `choice`. | Customer R4, Site R12, Contact R23 |
| `yesNo` | Y/N/1/0 → bool | `trueValues[]`, `falseValues[]`, `outputTrue` (default `true`), `outputFalse` (default `false`) | **Auto.** Emits `trueValues[0]` for `true`, `falseValues[0]` for `false`. | Customer R14 |
| `dateTime` | TZ conversion + format parsing | `sourceTz`, `targetTz`, `inputFormat`, `outputFormat` | **Auto.** Parses DV value as `targetTz`/`outputFormat`, converts to `sourceTz`, formats as `inputFormat`. | Customer R17, R20; Site R13–R14; Contact R19–R20 |
| `lookup` | Resolve FK by alt-key against a master cached in `/masters/` | `referenceTable`, `refField`, `createIfMissing`, `cacheKey` | **Auto + extract-time hint.** Outbound prefers `target.outbound.expand` so Dataverse returns the alt-key directly. If not expanded, joins against the same `/masters/<refTable>.parquet` cache. `createIfMissing` is ignored. | Customer R6–R10, R15–R16, R19, R21–R22, Site R15 |

**Schema-level rule:** the JSON Schema validator (`tools/validate-config`) statically detects when an auto-invertible transform would be ambiguous in reverse (e.g. a `map` with duplicate values) and requires an explicit `reverse` block in those cases — failing CI rather than at runtime.

The library is the **single place** where new transformation kinds get added in future. Engine code never gets per-entity or per-direction logic.

### 3.2 Lookup transform — end-to-end behavior (inbound)

The `lookup` row in the catalog above is the most complex transform in the framework — every Dataverse foreign-key field uses it, and it's worth a worked example. The walkthrough below uses Customer-sheet row R6: `EQUIPMET_DISCOUNT` (Oracle Fusion CSV) → `opx_EquipmentDiscountId` (Dataverse `account` lookup to the custom `opx_equipmentdiscount` table). The same pattern applies to every lookup-typed transform in the workbook (R6–R10, R15–R16, R19, R21–R22, Site R15).

#### 3.2.1 The data on each side

**Inbound CSV slice** (`HZ_CUST_ACCOUNTS_*.csv`):

| ACCOUNT_NUMBER | EQUIPMET_DISCOUNT | … |
| --- | --- | --- |
| CUST-1001 | `ED-PLAT` | … |
| CUST-1002 | `ED-GOLD` | … |
| CUST-1003 | `ED-UNKNOWN` | … |
| CUST-1004 | *(empty)* | … |

**Reference table in Dataverse** (`opx_equipmentdiscount`, custom entity):

| Schema | Logical | Purpose |
| --- | --- | --- |
| `opx_equipmentdiscountid` | `opx_equipmentdiscountid` | Primary GUID |
| `opx_code` | `opx_code` | Business code (alt-key, e.g. `ED-PLAT`) |
| `opx_name` | `opx_name` | Display name |

Rows:

| opx_equipmentdiscountid | opx_code | opx_name |
| --- | --- | --- |
| `aa11...` | `ED-PLAT` | Platinum |
| `bb22...` | `ED-GOLD` | Gold |

`ED-UNKNOWN` does **not** exist in Dataverse — that case drives the "missing value" branches.

**On the `account` side** the lookup attribute is:

- Attribute schema name: `opx_EquipmentDiscountId` (this is what the mapping sheet records).
- Logical name: `opx_equipmentdiscountid`.
- **Navigation property** (used in write payloads): `opx_EquipmentDiscount`.
- **Entity set name** of the referenced table (used in `@odata.bind` URL): `opx_equipmentdiscounts`.

These last two are not in the mapping workbook today and must be added to the JSON config — the engine cannot guess them reliably (Dataverse pluralization is irregular, e.g. `opportunities`, `accounts`, but `feedback` → `feedbacks`, etc.).

#### 3.2.2 Mapping JSON for this one row

```jsonc
{
  "source": "EQUIPMET_DISCOUNT",
  "sourceType": "text",
  "target": "opx_EquipmentDiscountId",          // lookup attribute schema name
  "targetType": "lookup",
  "mandatory": false,                            // empty source value is allowed (row CUST-1004)
  "validations": [],
  "transform": {
    "type": "lookup",
    "forward": {
      "referenceTable": "opx_equipmentdiscount",         // logical name of the master entity
      "entitySetName":  "opx_equipmentdiscounts",        // plural — used in @odata.bind URL
      "navigationProperty": "opx_EquipmentDiscount",     // single-valued nav property on `account`
      "refField":          "opx_code",                   // column on master that source value matches
      "primaryIdField":    "opx_equipmentdiscountid",    // primary GUID column on master
      "matchPolicy":       "exact",                      // exact | caseInsensitive | trim
      "createIfMissing":   false,                        // overrides _project.createMissingLookupsDefault
      "onMissing":         "error",                      // error | useDefault | passNull
      "default":           null,                         // value emitted when onMissing=useDefault
      "createDefaults": {                                // used only when createIfMissing=true
        "opx_name": "{sourceValue}",                     // tokens: {sourceValue}, {runId}, {entityKey}
        "opx_autocreated": true
      },
      "cacheKey": "opx_equipmentdiscount.opx_code"       // dedupes broadcast caches across fields
    }
  }
}
```

#### 3.2.3 Lifecycle, step by step

```
  /raw/customer/<runId>/data.parquet            (CSV verbatim, including EQUIPMET_DISCOUNT="ED-PLAT")
        │
        │  pl_stage_validate
        ▼
  /staged/customer/<runId>/data.parquet         (type-cast, dedup, mandatory check)
        │
        │  pl_master_prefetch   ── reads opx_equipmentdiscount via Dataverse Copy Activity
        ▼                          projecting (opx_code, opx_equipmentdiscountid, opx_name)
  /masters/opx_equipmentdiscount.parquet
                                  ┌────────────────────────┐
                                  │ opx_code  │ opx_equipmentdiscountid │ opx_name │
                                  │ ED-PLAT   │ aa11...                 │ Platinum │
                                  │ ED-GOLD   │ bb22...                 │ Gold     │
                                  └────────────────────────┘
        │
        │  pl_transform_inbound  ── Mapping Data Flow does a BROADCAST LEFT JOIN
        ▼                          /staged.EQUIPMET_DISCOUNT == /masters.opx_code
  /final/customer/<runId>/data.parquet
        │
        │  pl_load_upsert  ── Copy Activity to Dataverse sink, writeBehavior=Upsert,
        ▼                    alternateKeyName=accountnumber
  Dataverse `account` table  (rows upserted with lookup bound)
```

#### 3.2.4 The four outcomes per source row

| Source row | `EQUIPMET_DISCOUNT` | Join result | Behavior with `createIfMissing=false` | Behavior with `createIfMissing=true` |
| --- | --- | --- | --- | --- |
| CUST-1001 | `ED-PLAT` | Match → `aa11...` | `/final` row carries `opx_EquipmentDiscountId = aa11...` | Same as left column |
| CUST-1002 | `ED-GOLD` | Match → `bb22...` | `/final` row carries `opx_EquipmentDiscountId = bb22...` | Same |
| CUST-1003 | `ED-UNKNOWN` | **No match** | Row routed to `/errors/customer/<runId>/transform_errors.parquet` with `reason="lookup.notfound: opx_equipmentdiscount.opx_code='ED-UNKNOWN'"` | Engine writes a new `opx_equipmentdiscount` row via the **create-master sink** (`opx_code=ED-UNKNOWN`, fields from `createDefaults`), refreshes the broadcast cache, re-joins, then emits the row normally |
| CUST-1004 | *(empty)* | No join attempted (null) | `mandatory=false` → row emitted with `opx_EquipmentDiscountId = null` (existing value on the account is **cleared** on upsert; switch to `passNull=false` semantics if that's not desired — see §3.2.7) | Same |

#### 3.2.5 What the engine emits to Dataverse

The ADF Dataverse Copy Activity sink, when writing to a lookup attribute, accepts the **resolved GUID** in the lookup column. So `/final` for CUST-1001 looks like:

| accountnumber | name | opx_AccountType | opx_EquipmentDiscountId | … |
| --- | --- | --- | --- | --- |
| CUST-1001 | Acme Corp | 884870000 | `aa11...` | … |

Under the hood the connector serializes that column into the Web API write as:

```http
PATCH /api/data/v9.2/accounts(accountnumber='CUST-1001') HTTP/1.1
Content-Type: application/json
MSCRM.SuppressDuplicateDetection: false
MSCRM.BypassCustomPluginExecution: true

{
  "name": "Acme Corp",
  "opx_AccountType": 884870000,
  "opx_EquipmentDiscount@odata.bind": "/opx_equipmentdiscounts(aa11...)"
}
```

The mapping config's `navigationProperty` and `entitySetName` are what the engine substitutes into the `@odata.bind` URL — **they must be correct or the Dataverse write fails with a 400** (`Cannot find a property named...`). The pre-flight pipeline (`pl_preflight`) verifies both by calling `EntityDefinitions(LogicalName='account')/ManyToOneRelationships` and asserting the navigation property exists.

For lookups written via **Web Activity** (used in `pl_load_relationships` and the create-master sink), the engine constructs the same `@odata.bind` payload explicitly.

#### 3.2.6 Master prefetch in detail (§4.4, expanded for lookups)

For every distinct `transform.type=="lookup"` across the whole `fields[]` list, the orchestrator emits **one** Copy Activity per **distinct `cacheKey`** (so two fields referencing the same `opx_equipmentdiscount.opx_code` share a single cached file):

- Source: Dataverse Web API request, `GET /api/data/v9.2/opx_equipmentdiscounts?$select=opx_equipmentdiscountid,opx_code,opx_name`.
- Sink: parquet at `/masters/opx_equipmentdiscount.parquet`.
- Cache state row written to `/audit/master_cache_state.json`: `{ "table": "opx_equipmentdiscount", "rows": N, "refreshedAt": "..." }`.
- TTL from `_project.json.masterCacheTtlMinutes`; within TTL the orchestrator skips this Copy.
- For very large masters, the config can declare `filter` (e.g. `statecode eq 0`) to project only the rows the integration needs.

For the **two-pass case** (`BILL_TO_ACCOUNT` → `msdyn_billingaccount`, self-lookup to `account`): master prefetch can't include account rows that don't exist yet because the *current* load is what will create them. The engine handles this by:

1. First pass: load all accounts **omitting** `msdyn_billingaccount` (and any self-referencing lookup).
2. Re-snapshot the `account` master cache.
3. Second pass: a thin update-only run that projects `accountnumber` + `msdyn_billingaccount`, joins against the freshly-refreshed master, and patches each account.

This two-pass pattern is encoded in the config via a `loadPhase: 1 | 2` annotation on the field (default `1`). `pl_load_upsert` runs phase 1 first, refreshes the relevant master, then runs phase 2.

#### 3.2.7 Edge cases and policy knobs (call out for functional architects)

- **Null source value on upsert clears existing Dataverse lookup.** If that's not desired, set `onMissing="passNull"` plus `nullBehavior="skip"` — the engine omits the lookup column entirely from the PATCH payload for that row, preserving any existing target value.
- **Duplicate alt-key in master** (`opx_code` collides on `ED-PLAT` in two rows) — the broadcast join would explode rows. The engine validates uniqueness at prefetch time and fails the run with a clear master-data quality error before any account is touched.
- **Case sensitivity** — Dataverse text columns are case-insensitive by default; `matchPolicy: caseInsensitive | trim | exact` lets the mapping author opt out of the default exact match if Oracle Fusion emits inconsistent casing.
- **User lookups (R19, R21, R22 — `CreatedBy`/`ModifiedBy`)** — these are system-managed columns; writing them directly is rejected. To preserve source authorship the mapping should either (a) use Dataverse impersonation via the `MSCRMCallerID` header (requires every Oracle user to exist as a Dataverse user and the SPN to hold "Act on behalf of another user"), or (b) project the source user into a custom shadow field (`opx_sourceCreatedBy`). The framework supports both via a `lookup.targetMode: "system" | "impersonate" | "shadowField"` knob — the default is `shadowField` for safety. **Functional architecture needs to decide which mode applies for the three Oracle-Fusion entities.**
- **`createIfMissing=true` is deferred to v2.** v1 ships with the mapping property exposed in config but constrained to `false` only — `tools/validate-config` rejects any entity declaring `createIfMissing: true`. The reason: a correct implementation needs a dedicated `pl_create_missing_masters` sub-pipeline with dedupe-before-insert (so two source rows referencing the same unknown master don't both try to create it), retry on alt-key collision, and a cache-refresh-then-rejoin flow — none of these are specified in v1, and a build-team-improvised version risks duplicate masters or master-data corruption. v2 will add the pipeline plus a `createDefaults` stamping convention so stewards can curate auto-created rows.

#### 3.2.8 Outbound counterpart (one-line cross-reference)

On outbound, the same field uses the **inverse** of step §3.2.3: `pl_extract_dataverse` resolves the lookup at the **source side** by adding `$expand=opx_EquipmentDiscount($select=opx_code)` to the OData query (see §2.1 `target.outbound.expand`), so the extract result already contains the `opx_code` value and the reverse transform is a pure projection — no broadcast join required. The same `/masters/opx_equipmentdiscount.parquet` cache is used as a fallback if `$expand` is not configured.

### 3.3 Variant source values → canonical master row (alias / synonym handling)

Real-world source data routinely carries multiple spellings, casings, or business aliases that must all resolve to the **same** Dataverse master row. Example: a `CITY` column emits `Delhi`, `delhi`, `new delhi`, `Delhi-NCR`, `DELHI` — and every one of them must resolve to the single `opx_city` row where `opx_cityname = "Delhi"`. Same shape applies to `Bombay`/`Mumbai`, `Calcutta`/`Kolkata`, `Bangalore`/`Bengaluru`, country-code aliases, currency aliases, etc.

This is **not** solvable by `matchPolicy: caseInsensitive` alone (that only handles `Delhi` vs `delhi`, not `new delhi` → `Delhi`). The lookup transform handles the full pattern with two composable layers added to its `forward` block.

#### 3.3.1 The two layers

1. **`normalize`** — an ordered list of value-cleanup rules applied to the source value *before* any matching. Built-ins: `trim`, `collapseWhitespace`, `toLowerCase`, `toUpperCase`, `stripPunctuation`, `stripDiacritics`, `removeRegex:<pattern>`. Used to absorb cheap variance like trailing spaces and casing without authoring a full alias entry.

2. **`aliases`** — an explicit `variant → canonical` map. The canonical value is what gets joined against the Dataverse master on `refField`. Authored either inline or in an externalized file (recommended for any list > ~20 entries).

Pipeline applied in order:

```
   source value "NEW DELHI "
        │ trim, collapseWhitespace, toLowerCase     (normalize rules)
        ▼
   "new delhi"
        │ aliases lookup                            (variant → canonical)
        ▼
   "Delhi"                                          (canonical, original casing preserved)
        │ broadcast join /masters/opx_city.parquet  on opx_cityname == "Delhi"
        ▼
   GUID  cc33...
```

The crucial subtlety: `normalize` rules are applied **only to the lookup key**, not to the canonical value or the master row. So lowercasing during normalization doesn't force the master to be lowercased — `aliases["new delhi"] = "Delhi"` deliberately returns the properly-cased canonical, which the master also stores properly cased.

#### 3.3.2 Inline mapping example (the `CITY` case end-to-end)

```jsonc
{
  "source": "CITY",
  "target": "opx_CityId",
  "targetType": "lookup",
  "transform": {
    "type": "lookup",
    "forward": {
      "referenceTable":     "opx_city",
      "entitySetName":      "opx_cities",
      "navigationProperty": "opx_City",
      "refField":           "opx_cityname",
      "primaryIdField":     "opx_cityid",
      "matchPolicy":        "exact",

      "normalize": ["trim", "collapseWhitespace", "toLowerCase"],
      "aliases": {
        "delhi":       "Delhi",
        "new delhi":   "Delhi",
        "delhi ncr":   "Delhi",
        "delhi-ncr":   "Delhi",
        "bombay":      "Mumbai",
        "calcutta":    "Kolkata",
        "bangalore":   "Bengaluru"
      },
      "onAliasMiss":     "passThrough",   // passThrough | suggestion | error
      "onMissing":       "suggestion",    // error | useDefault | passNull | suggestion
      "createIfMissing": false
    }
  }
}
```

Outcomes on representative source values (assuming master has rows for `Delhi`, `Mumbai`, `Kolkata`, `Bengaluru`):

| Source value | After `normalize` | Alias hit? | Canonical | Master hit? | Result |
| --- | --- | --- | --- | --- | --- |
| `Delhi`         | `delhi`        | yes → `Delhi`   | `Delhi`    | yes | GUID `cc33...` written to `opx_CityId` |
| `new delhi`     | `new delhi`    | yes → `Delhi`   | `Delhi`    | yes | GUID `cc33...` |
| `DELHI-NCR`     | `delhi-ncr`    | yes → `Delhi`   | `Delhi`    | yes | GUID `cc33...` |
| `BOMBAY`        | `bombay`       | yes → `Mumbai`  | `Mumbai`   | yes | GUID for Mumbai |
| `Mumbai`        | `mumbai`       | no              | `mumbai`*  | …   | `onAliasMiss=passThrough` → falls through to master join with normalized value. If `matchPolicy=caseInsensitive`, hits; if `exact`, misses and lands in `onMissing` branch. |
| `Gurgaon`       | `gurgaon`      | no              | `gurgaon`  | no  | `onMissing=suggestion` → row is **still loaded** but its `opx_CityId` is null and the unmapped value is captured for steward review (§3.3.4). |

#### 3.3.3 Externalizing aliases — recommended for any non-trivial list

For city/country/currency/industry lists, inline aliases bloat the entity mapping and force a redeploy every time a steward adds a synonym. Externalize to its own file under `/config/aliases/`:

```
/config/aliases/opx_city__opx_cityname.json
```

```jsonc
{
  "refTable": "opx_city",
  "refField": "opx_cityname",
  "normalize": ["trim", "collapseWhitespace", "toLowerCase"],
  "aliases": {
    "delhi":     "Delhi",
    "new delhi": "Delhi",
    "delhi ncr": "Delhi",
    "delhi-ncr": "Delhi",
    "bombay":    "Mumbai",
    "calcutta":  "Kolkata",
    "bangalore": "Bengaluru"
  }
}
```

Reference from the mapping (replacing the inline block):

```jsonc
"forward": {
  /* …everything else as in §3.3.2… */
  "aliasesFile": "/config/aliases/opx_city__opx_cityname.json"
}
```

Resolution rules when both inline and file are present:
- Per-key, **inline overrides file** (lets an entity mapping override a single alias without forking the whole file).
- Inline `normalize` overrides file `normalize` *as a whole list*, not per-rule.
- The file is reloaded at the start of every run, identically to entity mappings — stewards edit, save, and the **next** run picks it up with no pipeline redeploy.

Naming convention `<refTable>__<refField>.json` ensures the same alias file is reused automatically by every field that looks up the same `(table, field)` — e.g. if both `Account.CITY` and `Site.CITY` resolve to `opx_city.opx_cityname`, both mapping files reference the single alias file and stewards curate one list.

#### 3.3.4 Alias-suggestion sink — closing the loop with data stewards

When `onMissing="suggestion"` (or `onAliasMiss="suggestion"`) is configured, unresolved source values are **not** rejected as row failures. The engine writes (or merges into) a single sidecar per run:

```
/errors/<entityKey>/<runId>/alias_suggestions.parquet
```

Schema:

| sourceValue | normalizedValue | refTable | refField | rowCount | sampleSourceKeys | firstSeenRunId |
| --- | --- | --- | --- | --- | --- | --- |
| `Gurgaon` | `gurgaon` | `opx_city` | `opx_cityname` | 47 | `[CUST-1003, CUST-1008, …]` | `<runId>` |
| `Noida`   | `noida`   | `opx_city` | `opx_cityname` | 12 | `[CUST-1042, …]`            | `<runId>` |

The data rows themselves still load to Dataverse with `opx_CityId = null`, and — if the mapping declares an `opx_unmappedCityRaw` shadow field — the original source string is preserved on the account form so business users can see why no city was set.

A small Logic App or Power Automate flow polls `alias_suggestions.parquet`, aggregates across runs, and emails the steward team a weekly digest: *"47 rows arrived with unmapped `CITY=Gurgaon` — add an alias to `opx_city__opx_cityname.json` or create the master row?"*. Stewards make a one-line change, the next run resolves the rows automatically — no reprocessing of historical rows needed unless the mapping is configured to backfill (a separate `pl_reprocess` invocation scoped to the affected rows).

This pattern intentionally **prefers landing data with a known gap over rejecting it**, matching the requirement document's "allow partial loads with clear reporting" principle. Functional architecture should decide *per master* whether suggestion-mode or hard-fail-mode is correct:

| Master kind | Recommended `onMissing` | Why |
| --- | --- | --- |
| Geography (city, state, country) | `suggestion` | Long-tail variants, low risk to leave null |
| Industry / category | `suggestion` | Same |
| Currency code | `error` | Wrong currency on a financial row is unsafe |
| State / status codes | `error` | Workflow-critical |
| User / owner | `error` or `useDefault: <SystemAccount>` | Ownership has security implications |

#### 3.3.5 Where these properties live

`normalize`, `aliases`, `aliasesFile`, `onAliasMiss` are valid additions to the **`forward` block of any `lookup` transform** (§3.2.2). The same four properties are also valid on the `forward` block of `choice` and `state` transforms — useful for option-set fields where the source emits multiple variants of the same logical value (e.g. `Y`, `Yes`, `YES`, `true`, `1` all → option `884870000`). The `tools/validate-config` CI gate fails the build if an `aliasesFile` reference cannot be resolved or if its content violates the schema.

---

## 4. Pipeline-by-Pipeline Design

### 4.1 `pl_master_orchestrator` (one per entity, parameterized) — direction-aware

Parameters: `entityKey`, `direction` (`inbound|outbound`; required when entity config is `bidirectional`), `runMode` (`incremental|full`), `asOfDate?`, `forceFull?`.

Sequence:

1. `Lookup` activity loads `/config/entities/${entityKey}.json` and `/config/_project.json` from ADLS — gives every downstream activity its full metadata.
2. **Validate direction**: if entity config `direction` is `inbound` or `outbound`, the parameter must match (or be omitted). For `bidirectional`, the parameter is required.
3. `Switch` activity on resolved `direction`:

   **Inbound branch:**
   1. `Execute Pipeline` → `pl_extract_file`.
   2. `Execute Pipeline` → `pl_stage_validate`.
   3. `Execute Pipeline` → `pl_master_prefetch` (skippable when masters were refreshed within N hours — controlled by `/audit/master_cache_state.json`).
   4. `Execute Pipeline` → `pl_transform_inbound`.
   5. `Execute Pipeline` → `pl_load_upsert`.
   6. `Execute Pipeline` → `pl_load_relationships`.

   **Outbound branch:**
   1. `Execute Pipeline` → `pl_master_prefetch` (option-sets + lookup alt-key caches needed for reverse transforms).
   2. `Execute Pipeline` → `pl_extract_dataverse`.
   3. `Execute Pipeline` → `pl_stage_validate` (parameterized for the Dataverse-shaped staging output).
   4. `Execute Pipeline` → `pl_transform_outbound`.
   5. `Execute Pipeline` → `pl_export_relationships`.
   6. `Execute Pipeline` → `pl_deliver_sftp`.
   7. `Execute Pipeline` → `pl_advance_watermark` (writes the new `lastSyncedAt` only after successful delivery).

4. `Web` activity → notification dispatcher (Logic App) on success/partial/failure.

All steps emit a row to `/audit/run_history.parquet` with `runId`, `entityKey`, `direction`, `step`, `start`, `end`, `inputRows`, `outputRows`, `errorRows`, `status`.

### 4.2 `pl_extract_file` (inbound) — SFTP → `/raw/<entityKey>/<runId>/`

- Linked Service: SFTP with Key Vault–referenced password / SSH key.
- For CSV: ADF Copy Activity using delimited-text dataset, file pattern from `source.inbound.pathPattern`.
- For Excel: ADF Copy Activity with Excel dataset, `sheetName` parameter sourced from `source.inbound.worksheet` (satisfies the worksheet-level mapping requirement).
- Multi-file handling via `source.inbound.onMultipleFiles` (`concat | latestOnly | fail`).
- On zero files found and `runMode=incremental`: short-circuit to "no-op success".
- After extract, picked-up files are moved to `source.inbound.archiveTo` (date-templated).

### 4.3 `pl_stage_validate` — `/raw` → `/staged`

Single Mapping Data Flow `df_stage_validate`. Steps:

1. **Schema drift handling** — late-bind to header row.
2. **Type & length validation** — per-field rules from config (`text length`, `numeric ranges`, `date formats` — covers requirement §4).
3. **Mandatory check** — fails the row if a `mandatory:true` field is null/empty.
4. **Deduplication** — checksum hash over `dedup.checksumColumns`; behavior from `dedup.onDuplicate`.
5. **Split outputs** — valid → `/staged/<entityKey>/<runId>/data.parquet`; invalid → `/errors/<entityKey>/<runId>/validation_errors.parquet` (one row per failure with reasons).

### 4.4 `pl_master_prefetch` — Dataverse → `/masters/<refTable>.parquet`

For every distinct `transform.type=="lookup"` and `transform.type=="choice"|"state"`:

- Lookups: Copy Activity reads the referenced Dataverse table projecting `(refField, primaryid)` into a parquet cache.
- Option sets: a single Copy Activity with FetchXML / Web API call pulls `EntityDefinitions(...)/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata/OptionSet/Options` for each entity, normalized into `/masters/optionsets.parquet`.
- Output is consumed by the transform Data Flow as a broadcast join.
- Honors a project-level cache TTL so repeated runs the same day don't re-pull masters.

### 4.5 `pl_transform_inbound` — `/staged + /masters` → `/final`

A Mapping Data Flow driven by the field-mapping list. Each field is materialized through the matching transform from §3. Output columns use Dataverse **schema names** (`name`, `accountnumber`, `opx_AccountType`, etc.). Errors during transformation (e.g. lookup resolution failed and `createIfMissing=false`) go to `/errors/<entityKey>/<runId>/transform_errors.parquet`.

For `lookup` transforms with `createIfMissing=true` (or project default), missing keys are routed to a parallel **"create-master" sink** that upserts into the referenced Dataverse table first; the transform then re-joins and continues.

### 4.6 `pl_load_upsert` — `/final` → Dataverse

- Single **Copy Activity** with Dataverse sink, `writeBehavior = Upsert`, `alternateKeyName = config.target.alternateKey`.
- `BatchSize` from `_project.json` (default 500).
- `Pre-copy script` field on the sink (or a preceding Web activity) sets `MSCRM.BypassCustomPluginExecution: true` when `target.bypassPlugins=true` — addresses the "disable backend processing for bulk loads" requirement.
- Sink "fault tolerance" set to `skipIncompatibleRow` + `logErrors=true`, with error log path `/errors/<entityKey>/<runId>/load_errors/`.
- After load, Copy returns row counts; orchestrator compares `error_rows / total_rows` against `failureThresholdPct` and decides success / partial / fail.

### 4.7 `pl_load_relationships` (inbound) — N:N + post-load lookup updates

A Mapping Data Flow + Web activities:

- For each `relationships[].type=="NN"`:
  1. Read `/final/<entityKey>` and `/masters/<relatedEntity>` (already cached in step 4.4).
  2. Resolve `primaryEntity.primaryId` and `relatedEntity.relatedId` GUIDs.
  3. Call Dataverse `Associate` via Web activity in batches (Dataverse `$batch` endpoint, configured batch size).
- For each `postLoadActions[].type=="setLookup"`:
  - Re-read the just-loaded entity rows (e.g. Contact rows where `PRIMARY_CONTACT_FLAG=Y`), Web-call Dataverse to update the target lookup on the related entity (Account.primarycontactid). Covers Contact R28.

### 4.8 `pl_extract_dataverse` (outbound) — Dataverse → `/raw/<entityKey>/<runId>/`

- Linked Service: `ls_dataverse` (SPN-auth via Key Vault).
- Resolve query input from `target.outbound.query`:
  - `mode=odataFilter`: build the Web API `$filter` string after token-substituting `{lastSyncedAt}` (from `/audit/watermarks/<entityKey>.json`), `{runStartUtc}`, `{asOfDate}`.
  - `mode=fetchXml`: post the FetchXML body with the same token substitution.
  - `mode=savedView`: resolve `userquery` / `savedquery` GUID by name, then execute it.
- `$select` is auto-derived from `fields[].target` (every Dataverse schema name referenced by the mapping plus `<entity>id`).
- `$expand` from `target.outbound.expand` resolves lookup alt-keys at extract time so reverse-lookup transforms can be a pure projection.
- Page through results using `pageSize`/`@odata.nextLink`; write parquet to `/raw/<entityKey>/<runId>/data.parquet`.
- On `runMode=full` or `forceFull=true`: ignore the watermark, do not substitute `{lastSyncedAt}` (the filter must guard against it being unset — typically `or {lastSyncedAt} eq null`).
- Activity emits `extractedRows` to `/audit/run_history.parquet`.

### 4.9 `pl_transform_outbound` — `/raw + /masters` → `/staged-out` → `/final-out`

A Mapping Data Flow driven by the **same** `fields[]` list as inbound, but executing the **reverse** branch of each transform (see §3):

- `direct`: cast Dataverse value to the source-type and format per `source.format`.
- `choice`/`state`: project the integer through the inverted `map`; for unmapped values, apply `onMissing` policy.
- `lookup`: prefer the alt-key value already returned by `$expand`; otherwise join `/masters/<refTable>.parquet`.
- `dateTime`: convert UTC → `dateTime.sourceTz` (or per-field override) and format as `inputFormat`.
- `yesNo`: bool → first entry of `trueValues[]` / `falseValues[]`.
- `concat`/`split`/`conditional`: execute the declared `reverse` block; fail the row to `/errors/.../transform_errors.parquet` if no reverse is declared.

Output: a parquet file at `/staged-out/<entityKey>/<runId>/data.parquet` keyed by **source column names** (i.e. file headers). The deliver step converts this to CSV/Excel.

### 4.10 `pl_export_relationships` (outbound) — N:N → association files

For each `relationships[]` with `outbound.exportMode=="separateFile"`:

1. Extract the N:N intersect table from Dataverse (`{relationshipSchemaName}/$ref` listing or via the intersect entity FetchXML) — scoped to the same delta filter as the primary entity to avoid emitting stale associations.
2. Resolve each end's alt-key by joining against `/masters/<entity>.parquet`.
3. Project the configured `outbound.columns` and write to `/staged-out/<entityKey>/<runId>/relationships/<relationshipSchemaName>.parquet`.
4. The deliver step renders one CSV per relationship using the configured `filePattern`.

### 4.11 `pl_deliver_sftp` (outbound) — `/staged-out` → CSV/Excel → SFTP

- One Copy Activity per artifact (primary entity + each relationship file):
  - Source: parquet under `/staged-out/<entityKey>/<runId>/...`.
  - Sink: delimited-text (CSV) or Excel dataset over SFTP, target path resolved from `source.outbound.pathPattern` / `relationships[].outbound.filePattern` after token substitution (`{runId}`, `{yyyyMMdd_HHmmss}`).
  - Header row controlled by `source.outbound.writeHeaderRow`.
  - Empty-result handling per `source.outbound.emptyFileBehavior`.
- Delivery is a **plain SFTP put** — no `.tmp`+rename, no PGP, no checksum sidecar (per requirer's direction; can be added later).
- On any Copy failure, the watermark is **not** advanced (see §4.12) so the next run retries the same delta range.

### 4.12 `pl_advance_watermark` (outbound)

- Reads the max value of `target.outbound.delta.watermarkField` over the extracted rows (already computed during extract).
- Writes `{ "lastSyncedAt": "<max>", "runId": "<id>", "completedAt": "<utc>" }` to `target.outbound.delta.watermarkStore` only if all prior steps in the outbound branch reported success / partial-success-within-threshold.
- This step is the **commit** of the outbound run.

### 4.13 Scheduling

ADF **schedule triggers** parameterized from `_project.json.schedules` — `daily`, `every N hours`, or **manual / one-time** (tumbling-window trigger disabled, run-on-demand). Each schedule entry carries its own `direction`, so a single entity can have an inbound trigger at 02:00 daily and an outbound trigger every 4 hours independently. Trigger creation is performed by an ARM/Bicep template, not hard-coded.

---

## 5. Multi-Entity Orchestration (Waves)

Real loads rarely involve a single entity. The Oracle Fusion daily load comprises **Customer → Site → Contact**, with Site and Contact both depending on Customer running first — Site looks up `account` by alt-key `ACCOUNT_NUMBER`, and Contact creates an N:N to `account`. The per-entity machinery from §4 stays unchanged; a **wave** is a metadata-driven group on top of it that runs entities in dependency order, refreshes shared master caches between phases so downstream lookups see freshly-loaded data, and applies a single failure policy across the group.

### 5.1 Wave configuration — `/config/waves/<wave>.json`

```jsonc
{
  "waveKey": "oracle_fusion_daily",
  "direction": "inbound",                      // inbound | outbound | mixed
  "entities": [
    {
      "entityKey": "customer",
      "phase": 1,
      "dependsOn": [],
      "concurrent": false
    },
    {
      "entityKey": "site",
      "phase": 2,
      "dependsOn": ["customer"],               // ACCOUNT_NUMBER lookup on /masters/account
      "concurrent": true                       // can run in parallel with other phase-2 entities
    },
    {
      "entityKey": "contact",
      "phase": 2,
      "dependsOn": ["customer"],               // N:N to account
      "concurrent": true
    }
  ],
  "failurePolicy": {
    "onEntityFailure":      "continueIndependent",  // stopWave | continueIndependent | continueAll
    "onDependencyFailure":  "skipDependent",        // skipDependent | runAnyway
    "wavePartialThresholdPct": 10                   // wave = Failed if cross-entity error % exceeds this
  },
  "masterCacheRefresh": "betweenPhases",       // never | betweenPhases | beforeEachEntity
  "configVersion":     "pinAtWaveStart",       // pinAtWaveStart | latest
  "notification": {
    "onWaveFailure": ["email","teams"],
    "onWavePartial": ["email"]
  }
}
```

`phase` + `dependsOn` together drive the execution plan: `phase` is the coarse layer (everything in phase N runs only after phase N-1 finishes), `dependsOn` is the fine-grained edge inside or across phases (used for failure propagation and for selective master-cache refresh — only masters touched by the dependency are refreshed, not all of them).

### 5.2 New pipeline — `pl_wave_orchestrator`

Parameters: `waveKey`, `runMode` (`incremental|full`), `forceFull?`, `entityFilter?` (optional list — see §5.5).

Sequence:

1. `Lookup` activity loads `/config/waves/${waveKey}.json` plus each referenced `/config/entities/<entityKey>.json` plus `/config/_project.json`.
2. **Build execution plan** — topological sort by `phase` then `dependsOn`; validate no cycles; generate a `waveRunId` that becomes the parent of every child entity `runId`.
3. **Pin configs** if `configVersion=pinAtWaveStart` — snapshot each entity mapping to `/audit/wave_runs/<waveRunId>/configs/<entityKey>.json` and pass the snapshot path (not the live `/config/` path) into each child orchestrator. Right choice for compliance-sensitive bulk migrations; mid-wave mapping edits don't take effect until the next wave.
4. **For each phase in order**:
   1. `ForEach` activity iterates the phase's entities, in parallel iff `concurrent=true`.
   2. For each entity:
      - **Skip check**: if any entry in `dependsOn` failed in this wave **and** `failurePolicy.onDependencyFailure=skipDependent`, skip with status `Skipped (upstream failure)`.
      - Otherwise `Execute Pipeline` → `pl_master_orchestrator(entityKey, direction, runMode, configPath=<snapshot or live>, waveRunId)`.
      - Collect per-entity status into `/audit/wave_runs/<waveRunId>/<entityKey>.json`.
   3. **Master-cache refresh** — if `masterCacheRefresh=betweenPhases`, invalidate exactly the master caches touched by entities just loaded (computed from each entity's `target.entityLogicalName` plus any `referenceTable` in its `fields[].transform.forward`). Phase N+1's first `pl_master_prefetch` then re-pulls fresh data.
5. **Aggregate** — wave status is `Success` (all entities Success), `Partial` (some Partial, none Failed, cross-entity error rate ≤ `wavePartialThresholdPct`), or `Failed` (any entity Failed or threshold exceeded).
6. **Single wave-level notification** via the Logic App, with a structured payload listing every child entity's row counts and status. Avoids the "three success emails per night" noise of running entity triggers independently.

### 5.3 How cross-entity lookups work (Site → Account)

The interesting case: a Site row carries `ACCOUNT_NUMBER="CUST-1003"` and must resolve to the Dataverse `account` GUID — which may have been **created one minute earlier** in phase 1 of the same wave.

The mechanism is exactly the lookup pattern from §3.2.3, with one wave-orchestration wrinkle: `pl_master_prefetch` for the `account` table re-runs between phases, so `/masters/account.parquet` reflects the newly-inserted accountnumber → accountid rows before Site's transform runs. Nothing inside Site's mapping needs to know that Customer just ran — Site's `ACCOUNT_NUMBER` mapping simply declares:

```jsonc
"transform": {
  "type": "lookup",
  "forward": {
    "referenceTable":     "account",
    "refField":           "accountnumber",
    "navigationProperty": "opx_AccountId",
    "entitySetName":      "accounts",
    "onMissing":          "error"
    /* ... */
  }
}
```

And the broadcast join in `pl_transform_inbound` resolves it against the freshly-refreshed master. If you ever need to require all source ACCOUNT_NUMBERs to exist in the *just-loaded* set (not in the pre-existing Dataverse universe), add `lookupScope: "wavePhase"` to the field's `forward` block — out of scope for the first release but the JSON Schema reserves the property.

### 5.4 Cross-entity N:N relationships

Every N:N is **owned by exactly one entity** — the entity whose data brings the link into existence:

| Relationship | Owner entity | Where declared |
| --- | --- | --- |
| `msdyn_msdyn_functionallocation_account` (Account ↔ Functional Location) | `site` | Site mapping's `relationships[]` |
| `opx_Account_Contact_Contact` (Account ↔ Contact) | `contact` | Contact mapping's `relationships[]` |

The wave just ensures the owner runs after its dependencies, and each entity's `pl_load_relationships` resolves both endpoints against fresh master caches. If two entities ever declared the same N:N schema name, `tools/validate-config` fails CI with "ambiguous N:N owner".

### 5.5 Failure modes — what runs when something breaks

| Scenario | `onEntityFailure` | `onDependencyFailure` | Outcome |
| --- | --- | --- | --- |
| Customer 100% Success; Site 3% rows error (entity threshold = 5%) | n/a (Site = Partial) | n/a | Site → Partial. Contact runs (its dep was Customer, not Site). Wave Partial unless 3% × Site rows pushes the cross-entity rate over `wavePartialThresholdPct=10`. |
| Customer fails outright | `stopWave` | n/a | Site, Contact skipped immediately. Wave Failed. |
| Customer fails outright | `continueIndependent` | `skipDependent` | Site, Contact skipped (both `dependsOn=["customer"]`). An unrelated phase-1 entity (e.g. `vendor`) still runs. Wave Failed. |
| Customer Success; Site Failed; Contact only depends on Customer | `continueIndependent` | `skipDependent` | Contact runs. Wave Failed (Site Failed). |
| Customer hits Dataverse throttling, retries exhausted | `continueIndependent` | `skipDependent` | Customer Failed → Site/Contact Skipped. The wave can be **re-driven** by re-firing `pl_wave_orchestrator` with the same `waveRunId` — Customer reprocesses, Site/Contact then run on the now-loaded accounts. |

### 5.6 Reprocessing scope inside a wave

`pl_wave_orchestrator` accepts `entityFilter: ["site"]` to re-run **only** that entity in the context of a prior wave. Behavior:

- The entity inherits the **same `waveRunId`** so the audit trail stays coherent.
- Master caches from the prior wave are reused unless they're past TTL — no need to re-load Customer just to refresh `/masters/account`.
- `dependsOn` entities are **not** automatically re-run; the operator is asserting they're still good.
- If a `dependsOn` entity's last wave-run was `Failed` or `Skipped`, the wave orchestrator **refuses** the partial reprocess. The operator must either fix and re-run the upstream entity first, or pass `--ignoreDependencyState` explicitly.

This makes the common "Contact load hit throttling at 11pm, re-run just Contact at 7am" scenario trivial without touching Customer/Site.

### 5.7 Schedule shape — per-wave vs per-entity triggers

Both modes are supported; the choice is per-deployment:

- **Per-wave trigger (recommended for the Oracle Fusion daily load)** — one `tr_wave_oracle_fusion_daily` at 02:00 UTC fires `pl_wave_orchestrator(waveKey="oracle_fusion_daily")`. Single email per day, dependency-ordered run.
- **Per-entity trigger** — three independent triggers (`tr_customer_inbound`, `tr_site_inbound`, `tr_contact_inbound`) as in the earlier draft. Right when entities arrive at different times of day from different upstream systems and the dependency chain isn't load-tight.
- **Mixed** — outbound feeds typically don't share dependencies and can stay per-entity; inbound feeds with foreign-key chains migrate to waves.

When an entity moves into a wave, its standalone trigger is disabled, but `pl_master_orchestrator` remains directly invocable (used by `pl_wave_orchestrator`, by ad-hoc operator runs, and by `pl_reprocess`).

### 5.8 Where wave-related artifacts live

```
/config/waves/
  oracle_fusion_daily.json              // inbound wave, three entities
  oracle_fusion_outbound_hourly.json    // future: outbound feed to downstream
/adf/pipelines/
  pl_wave_orchestrator.json             // new
/adf/triggers/
  tr_wave_oracle_fusion_daily.json      // replaces three per-entity inbound triggers
/audit/wave_runs/<waveRunId>/
  wave_summary.json
  customer.json                         // per-entity status
  site.json
  contact.json
  configs/                              // snapshots when configVersion=pinAtWaveStart
    customer.json
    site.json
    contact.json
```

### 5.9 Verification additions (extends §10)

Three wave-level test cases worth adding when implementation begins:

- **Wave happy path** — load a Customer/Site/Contact wave; assert phase-2 entities see phase-1 GUIDs in `/masters/account.parquet`; one wave-summary email lands.
- **Wave dependency failure** — force Customer to fail; assert Site and Contact are `Skipped (upstream failure)` and an unrelated phase-1 entity still runs.
- **Wave partial reprocess** — re-fire `pl_wave_orchestrator(entityFilter=["site"])` against a prior successful wave; assert Customer is untouched, Site re-extracts and re-loads cleanly, and the audit trail reuses the prior `waveRunId`.

---

## 6. Operational Concerns

| Concern | Mechanism |
| --- | --- |
| **Run history** | `/audit/run_history.parquet` + ADF built-in run history; one Power BI dataset over the parquet for self-serve dashboards. |
| **Correlation IDs / tracing** | `pipeline().RunId` propagated as `runId` column in every output artifact + injected as a header on Dataverse calls (`MSCRM.CorrelationId`). |
| **Retry / backoff** | Per-activity retry from `_project.json.retry`; the Dataverse Web activity uses exponential backoff with jitter on HTTP 429/503. |
| **Notifications** | Single **Logic App** wrapper (or Power Automate flow), invoked via Web activity, fans out to Email (SMTP / O365) and Teams (incoming webhook). Webhook URL and SMTP creds in Key Vault. |
| **Partial loads** | Allowed when `partialLoadAllowed=true`; `failureThresholdPct` decides outcome status. |
| **Error export / reprocess** | All error files in `/errors/<entityKey>/<runId>/` are CSV-exportable; a `pl_reprocess` pipeline can be triggered with `runId` to re-run only the error rows after correction. |
| **Idempotency** | Upsert by alternate key makes re-runs safe; N:N associate is naturally idempotent. |
| **Checkpoint restart** | Each sub-pipeline writes a status marker to `/audit/checkpoints/<runId>/<step>.json`; orchestrator skips already-successful steps when re-run with the same `runId`. |
| **Throttling protection** | Dataverse batch size + concurrent-batch limit configurable; Copy Activity DIU capped; Web activity uses `wait_seconds_between_calls` parameter. |

---

## 7. Security

- **All secrets** in Azure Key Vault: SFTP password / private key, Dataverse SPN client secret, SMTP credentials, Teams webhook URL.
- **ADF managed identity** is the only principal with KV `get/list` permission on these secrets.
- **Dataverse application user** (SPN) granted only the security roles required for the targeted entities (Account, Functional Location, Contact, plus the custom lookup tables: `opx_equipmentdiscount`, `opx_partdiscount`, `opx_nationaldiscount`, `opx_customercategory`, `opx_largecustomer`).
- **ADLS** with hierarchical namespace; RBAC scoped so the ADF MI has write to `/raw`,`/staged`,`/final`,`/masters`,`/errors`,`/audit` and read-only to `/config`. Business authors get write to `/config` only.
- **Network**: SFTP via private endpoint or Self-hosted Integration Runtime in customer VNet; Dataverse via service endpoint.

---

## 8. Custom Dataverse Schema Pre-requisites (called out by the mapping sheet)

These must exist in the target environment **before** the framework can load. The mapping JSON references their schema names but does not create them.

| Custom artifact | Type | Used by |
| --- | --- | --- |
| `opx_AccountType` option set with values 884870000/884870001/884870002 | Choice on Account | Customer R5 |
| `opx_EquipmentDiscountId` + `opx_equipmentdiscount` table | Lookup + custom entity | Customer R6 |
| `opx_partdiscountid` + `opx_partdiscount` table | Lookup + custom entity | Customer R7 |
| `opx_nationaldiscountid` + `opx_nationaldiscount` table | Lookup + custom entity | Customer R8 |
| `opx_customercategoryid` + `opx_customercategory` table | Lookup + custom entity | Customer R9 |
| `opx_largecustomerid` + `opx_largecustomer` table | Lookup + custom entity | Customer R15 |
| `opex_SiteNumber`, `opx_fusionRefAccountNumber` on Account | Text | Customer R17, R19 |
| Payment-term option-set values (per `PaymentTermsOptionSetValues` workbook) | Option-set values | Customer R15 |
| `opx_county`, `opx_province`, `opx_endDate`, `opx_accountNumber` on Functional Location | Text/Date | Site R10–R11, R14–R15 |
| `opx_contactnumber` (alt-key), `opx_primaryphonetype`, `opx_primaryemailtype`, `opx_startdate`, `opx_enddate` on Contact | Mixed | Contact R2, R10, R16, R19–R20 |
| `opx_Account_Contact_Contact` N:N relationship between Contact and Account | Many-to-many | Contact R25 |

A pre-flight checker pipeline (`pl_preflight`) is included to read all `targetField`s from the configs and call Dataverse `EntityDefinitions` to verify these exist; it surfaces missing schema before any data is touched.

---

## 9. Critical Files / Artifacts (to be produced by implementation)

```
/adf/
  pipelines/
    pl_wave_orchestrator.json            // §5 — multi-entity, dependency-ordered
    pl_master_orchestrator.json          // §4 — single-entity, direction switch
    pl_extract_file.json                 // inbound
    pl_stage_validate.json               // both directions
    pl_master_prefetch.json              // both directions (also re-run between wave phases)
    pl_transform_inbound.json
    pl_load_upsert.json                  // inbound
    pl_load_relationships.json           // inbound (associate)
    pl_extract_dataverse.json            // outbound
    pl_transform_outbound.json           // outbound
    pl_export_relationships.json         // outbound (separate-file association export)
    pl_deliver_sftp.json                 // outbound
    pl_advance_watermark.json            // outbound (commit step)
    pl_reprocess.json                    // re-runs the error subset
    pl_preflight.json                    // schema/availability checks (DV + SFTP)
  dataflows/
    df_stage_validate.json
    df_transform_inbound.json
    df_transform_outbound.json
  linkedServices/
    ls_adls.json
    ls_sftp.json
    ls_dataverse.json
    ls_keyvault.json
  datasets/
    ds_sftp_csv.json
    ds_sftp_xlsx.json
    ds_adls_parquet.json
    ds_dataverse.json
  triggers/
    tr_wave_oracle_fusion_daily.json     // §5.7 — recommended for the Oracle Fusion inbound wave
    tr_customer_outbound.json            // per-entity outbound trigger (no inter-entity deps)
    // tr_customer_inbound.json / tr_site_inbound.json / tr_contact_inbound.json
    // are *disabled* when the entities are owned by a wave; kept in source for ad-hoc use
/config/
  _project.json
  entities/
    customer.json
    site.json
    contact.json
  waves/                                 // §5 — multi-entity orchestration configs
    oracle_fusion_daily.json             // inbound wave: customer → (site || contact)
    // oracle_fusion_outbound_hourly.json — future, per §5.7
  aliases/                               // §3.3.3 — externalized variant→canonical maps
    opx_city__opx_cityname.json
    opx_country__opx_countrycode.json
    // …one file per (refTable, refField) where alias curation lives
  schemas/
    entity-mapping.schema.json           // validates direction + reverse blocks + alias refs
    wave.schema.json                     // validates wave configs (cycles, dep refs, phase order)
    alias-file.schema.json               // validates externalized alias files
/tools/
  excel_to_json/                         // converts mapping workbook sheets → /config/entities/*.json
  validate-config/                       // CI gate: direction/reverse completeness, wave DAG, alias refs
/infra/
  bicep/                                 // IR, KV, ADLS, ADF, role assignments
/docs/
  README.md
  authoring-mappings.md                  // how analysts edit Excel, direction + reverse rules, alias curation
  authoring-waves.md                     // how to compose entities into a wave, dep-order, failure policy
```

Runtime-only paths (not under source control, listed for reference):

```
/audit/
  run_history.parquet                    // per-entity run rows
  master_cache_state.json                // §4.4 — TTL bookkeeping
  watermarks/<entityKey>.json            // §4.12 — outbound delta commit
  wave_runs/<waveRunId>/                 // §5.2/§5.8 — wave audit trail
    wave_summary.json
    <entityKey>.json                     // one per entity in the wave
    configs/<entityKey>.json             // snapshot when configVersion=pinAtWaveStart
  checkpoints/<runId>/<step>.json        // §6 — restart-from-last-success markers
  locks/<entityKey>.json                 // §12 — bidirectional serialization sentinel
/raw  /staged  /final                    // inbound staging zones
/staged-out  /final-out                  // outbound staging zones
/masters/<refTable>.parquet              // master-data caches for lookup transforms
/errors/<entityKey>/<runId>/             // validation/transform/load error sidecars
  validation_errors.parquet
  transform_errors.parquet
  load_errors/                           // ADF fault-tolerance log directory
  alias_suggestions.parquet              // §3.3.4 — unmapped-value steward queue
```

---

## 10. Verification Plan (end-to-end)

1. **Schema pre-flight** — run `pl_preflight` against a freshly-provisioned Dataverse sandbox; assert it reports the §8 list as **missing**, then create them and assert it reports **clean**.
2. **Mapping conversion** — run `tools/excel_to_json` against the current workbook; diff the produced `customer.json` against a hand-authored golden copy of the same 21 fields.
3. **Happy-path Customer load** — drop a 100-row `HZ_CUST_ACCOUNTS.csv` on SFTP, trigger `pl_master_orchestrator(entityKey="customer")`, expect:
   - 100 rows in `/staged`, 0 validation errors;
   - all 6 lookup masters cached under `/masters`;
   - 100 upserts on `account`; spot-check `statecode`, `opx_AccountType`, `defaultpricelevelid`, `modifiedon` (UTC).
4. **Site → Account N:N + address pushdown** — load 20 site rows; assert the N:N `msdyn_msdyn_functionallocation_account` rows exist and each Account row also got its `Address1_*` block updated.
5. **Contact + primary contact post-load** — load 10 contacts with one `PRIMARY_CONTACT_FLAG=Y`; assert the Contact rows exist, the N:N `opx_Account_Contact_Contact` rows exist, and the associated Account's `primarycontactid` was set.
6. **Negative tests**
   - A row with an unknown `EQUIPMET_DISCOUNT` code: with `createIfMissing=false` it lands in `transform_errors.parquet`; with `true` the master is created and the row succeeds.
   - A row exceeding a `maxLength`: lands in `validation_errors.parquet`.
   - 6% bad rows when `failureThresholdPct=5` → pipeline status = **Failed**; 4% → **PartialSuccess**.
7. **Mapping change auto-pickup** — edit `customer.json` to add a new direct mapping, **without** touching pipelines; next run should pick it up.
8. **Idempotency** — re-run the same `runId` after a forced failure mid-load; assert no duplicate Account rows and N:N associations are not duplicated.
9. **Notifications** — force a failure; confirm a Teams card and an email land within 2 minutes.
10. **Secrets** — confirm no secret appears in any ADF pipeline JSON or run output (only KV references).
11. **Outbound — Customer initial full** — set `direction=outbound`, `runMode=full`; trigger orchestrator; expect:
    - `pl_extract_dataverse` pulls all `account` rows matching the OData filter, with `$expand` resolving `opx_EquipmentDiscountId/opx_code` etc.;
    - reverse `state`/`choice`/`yesNo`/`dateTime` transforms produce file values matching the original source semantics;
    - one CSV at `source.outbound.pathPattern` lands on SFTP with the expected header row;
    - `/audit/watermarks/customer.json.lastSyncedAt` is set to the max `modifiedon` from the run.
12. **Outbound — incremental delta** — modify 3 Dataverse accounts; trigger the next outbound run; expect exactly those 3 rows in the new CSV, watermark advanced; an unmodified 4th row is **not** re-exported.
13. **Outbound — custom filter** — switch `target.outbound.query.mode` to `fetchXml` with a filter referencing a custom flag (e.g. `opx_readytoexport eq true`) — confirm only flagged rows are emitted regardless of `modifiedon`.
14. **Outbound — N:N file** — confirm `customer_account_funcloc_assoc_*.csv` is emitted alongside the primary file with one row per association (alt-keys, not GUIDs).
15. **Outbound — failure does not advance watermark** — kill `pl_deliver_sftp` mid-upload; assert watermark is unchanged so the next run repeats the same delta range.
16. **Reverse-transform completeness** — `tools/validate-config` flags an entity that declares a `conditional` transform without a `reverse` block when `direction` includes outbound; the config fails CI.
17. **Round-trip integrity** — export `customer` outbound, then ingest the same file inbound into a clone Dataverse; assert all field values match the original after both passes (catches asymmetric forward/reverse declarations).

---

## 11. Known Gaps in the Source Mapping Sheet (to be closed before/during build)

These are columns the existing workbook left blank and that the JSON config **requires** before the entity can go live. They are not blockers for engine design but must be filled by the data team:

- **`Source Data Type` and `Source Field MaxLength`** for Site rows R2–R15 and most Contact rows.
- **`FREIGHT_TERMS` and `SHIPPING_METHOD` mapping tables** (Customer R11–R12) — option-set value mapping is not enumerated.
- **`PaymentTermsOptionSetValues` workbook** referenced in Customer R15 — needs to be supplied.
- **`EquipmentDiscountDataMapping` / `NationalDiscountDataMapping` / `CustomerCategoryDataMapping` / `LargeCustomerDataMapping`** workbooks (Customer R6–R9, R15) — referenced but not attached.
- **Site sheet, R18 narrative** — the "find unique account by Account Number + Party Site Number" rule is described prose; the JSON config formalizes it as the `account` lookup with `referenceTable:"account", refField:"accountnumber"` — please confirm this is the only key (otherwise add `opex_SiteNumber` as a second key column).
- **Source `Source Entity` column** is blank for Site and Contact — confirm the Oracle Fusion table names (likely `HZ_PARTY_SITES` and `HZ_PARTIES`/`HZ_RELATIONSHIPS`).

---

## 12. Bidirectional Considerations (open items for functional architects)

When an entity is configured `direction: "bidirectional"`, the framework will run both flows on independent triggers. This introduces concerns that **do not exist** for unidirectional entities and need explicit decisions from functional architecture before any bidirectional entity goes live:

1. **Authoritative system per field**
   Even with bidirectional movement at the entity level, individual fields usually have a single owner. Recommend introducing a `ownership` flag per field (`source | target | both`) so the engine ignores updates flowing the "wrong" way for owner-bound fields. Out of scope for the first build but the JSON Schema reserves the property.

2. **Echo / ping-pong prevention**
   If an outbound run emits a row whose data originated from a recent inbound run, the next inbound (when the consumer system writes back) can re-import the same logical change, advancing `modifiedon` and triggering another outbound — a loop. Two mitigations to capture in functional design:
   - **Watermark cool-off**: outbound's delta filter automatically excludes rows whose `modifiedon < lastInboundCompletedAt + cooldownMinutes`.
   - **Origin stamp**: inbound writes set a custom field (e.g. `opx_lastIngestRunId`) on every row; outbound's filter excludes rows whose latest change was authored by an inbound-write SPN. Either approach must be ratified by the functional team and reflected in the mapping config.

3. **Conflict resolution policy**
   If a row changes on both sides between syncs, define the resolution: **last-writer-wins by `modifiedon`** (simple, default recommendation), **source-wins**, **target-wins**, or **manual quarantine to `/errors/conflicts/`**. The chosen policy becomes a project-level setting (`conflictPolicy`) with per-entity override.

4. **Trigger overlap**
   The orchestrator must serialize per-`(entityKey, direction)` and globally per-`entityKey` for bidirectional entities, so an inbound run cannot start while an outbound run for the same entity is mid-flight. Implementation: ADF `concurrency: 1` on the orchestrator plus a sentinel marker in `/audit/locks/<entityKey>.json`.

5. **Schema drift on the file side**
   Inbound tolerates extra columns; outbound emits exactly the fields it knows about. If the external system adds a column it wants populated, the mapping must be updated — bidirectional entities should have a stricter `validate-config` gate that fails CI when a downstream-required column is missing from `fields[]`.

6. **Direction-asymmetric transformations**
   A `conditional` transform's `reverse` block may be intentionally lossy (e.g. several distinct DV option values that all map to the same source label). For bidirectional entities the JSON Schema validator should warn on lossy reverses so functional architects explicitly accept the loss in writing.

These items are listed so functional architecture can fold them into requirements before the first bidirectional entity is onboarded. The framework's first release (the three Oracle Fusion entities) is **inbound-only**, with the outbound machinery built and validated against a sample export entity (TBD) to prove the engine but without yet enabling round-trip for Customer/Site/Contact.
