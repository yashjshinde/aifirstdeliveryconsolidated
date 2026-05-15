# {Solution Display Name} — Entity Catalogue

| Property | Value |
|---|---|
| Solution | {solution-name} v{version} |
| Generated | {date} |
| Status | DRAFT — for review |
| Source | Solution XML, plugin source, web resource analysis |

---

## Entity Index

| Entity | Display Name | Ownership | Attributes | Relationships | Forms | Views |
|---|---|---|---|---|---|---|
| `pub_example` | Example | User | 12 | 3 | 2 | 4 |

---

## {Entity Display Name}

**Schema name:** `{schema_name}`
**Ownership:** User-owned / Organisation-owned
**Description:** {description or *(inferred from naming and usage)*}
**Primary attribute:** `{primary_name_field}`

### Attributes

| Schema Name | Display Name | Type | Required | Description / Purpose |
|---|---|---|---|---|
| `pub_name` | Name | Text (100) | Required | Primary identifier |
| `pub_taxcode` | Tax Code | Text (20) | Optional | *(inferred: tax registration code)* |
| `pub_status` | Status | Option Set | Required | See option values below |
| `pub_parentaccountid` | Parent Account | Lookup → account | Optional | |

**Option Set — pub_status:**

| Value | Label | Meaning |
|---|---|---|
| 100000000 | Draft | Record created but not yet active |
| 100000001 | Active | Live record |
| 100000002 | Closed | Archived — no further updates |

### Relationships

| Relationship Name | Type | Related Entity | This Side | Other Side | Cascade Delete |
|---|---|---|---|---|---|
| `pub_account_pub_example` | N:1 | account | Many | One | Restrict |
| `pub_example_contacts` | N:N | contact | — | — | — |

### Forms

**{Form Name} (Main)**
- Tab: General
  - Section: Details — Fields: `pub_name`, `pub_taxcode`, `pub_status`
  - Section: Relationships — Sub-grid: related contacts
- Tab: History
  - Section: Activity wall
- Business rules on this form: {list or "None detected"}

### Views

| View Name | Type | Columns | Filter |
|---|---|---|---|
| Active Examples | Public | Name, Status, Created On | Status = Active |
| My Examples | Personal | Name, Modified On | Owner = Current User |

### Usage in Plugins

| Plugin Class | Message | What it does with this entity |
|---|---|---|
| `AccountPreCreatePlugin` | Create | Sets `pub_taxcode` default value |

### Usage in Flows

| Flow Name | Trigger | Role |
|---|---|---|
| Notify on Status Change | pub_example Updated | Triggers when `pub_status` changes |

---

## Documentation Gaps

| Entity | Gap | Reason |
|---|---|---|
| `pub_legacyentity` | Attribute descriptions missing | No source comments; XML descriptions blank |
