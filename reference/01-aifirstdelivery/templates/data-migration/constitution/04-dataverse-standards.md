# Dataverse Standards

## ADF Connector for Dataverse

Use the **Common Data Service (Legacy)** or **Dataverse** connector in ADF linked services.
Prefer the Dataverse connector for environments on Dataverse (not legacy CDS).

### Authentication
- Use **Service Principal** authentication (never user credentials).
- Store `clientId`, `tenantId`, and `clientSecret` in Azure Key Vault.
- Service Principal must have the **System Administrator** role in the target Dataverse environment OR a custom role with minimum required privileges.

---

## Entity Reference

When referencing entities:
- Use the **logical name** (plural) in ADF dataset: `accounts`, `contacts`, `opportunities`.
- Use the **schema name** (singular) in documentation: `account`, `contact`, `opportunity`.
- Custom entities follow publisher prefix: `{prefix}_{entityname}` e.g. `contoso_shipment`.

---

## Write Standards

### Upsert (Insert + Update)

All writes to Dataverse must use **Upsert** via alternate keys:
- Define an alternate key on the entity using the natural business key (e.g., `accountnumber`, `emailaddress1`).
- In ADF Data Flow sink: set `Update method: Upsert` and specify the alternate key.
- Never use GUID-based upsert unless the GUID is known from a prior read.

### Batch Size

| Operation | Recommended Batch | Max |
|---|---|---|
| Upsert (Create or Update) | 100 | 1 000 |
| Delete | 50 | 200 |
| Read (FetchXML pagination) | 500 | 5 000 |

### Throttling

- ADF Dataverse connector respects `Retry-After` headers automatically when `retry: 3` is set.
- Do not exceed 6 concurrent write threads per environment.
- Schedule large migrations during off-peak hours (21:00–05:00 UTC target environment time).

---

## Read Standards

### FetchXML vs OData

| Scenario | Use |
|---|---|
| Simple column select | OData (`$select`, `$filter`, `$orderby`) |
| Aggregations, related entity joins | FetchXML |
| ADF CopyActivity source | OData query in dataset |
| ADF Data Flow source | Dataverse connector with entity name + column projection |

### Delta / Incremental Reads

For Dataverse → SFTP exports:
- Filter by `modifiedon` >= last successful run date (stored in `audit.migration_run`).
- Use `@{formatDateTime(pipeline().parameters.batchDate, 'yyyy-MM-ddT00:00:00Z')}` as filter value.

---

## Field Type Mapping

| Dataverse Type | SQL Type | ADF/Data Flow Cast |
|---|---|---|
| Single Line of Text | `NVARCHAR(n)` | string |
| Multiple Lines of Text | `NVARCHAR(MAX)` | string |
| Whole Number | `INT` | integer |
| Decimal / Currency | `DECIMAL(18,4)` | decimal |
| Date Only | `DATE` | date |
| Date and Time | `DATETIME2` | timestamp |
| Option Set | `INT` (code) + `NVARCHAR(100)` (label) | integer |
| Lookup | `UNIQUEIDENTIFIER` | string (GUID) |
| Two Options (Boolean) | `BIT` | boolean |

---

## Solution Awareness

- All custom entities and fields used by migrations must reside in a managed or unmanaged solution.
- The migration agent does not create Dataverse entities or fields — it only reads/writes existing schema.
- If a field is missing in the target entity, the spec must flag it as a prerequisite (handled by CE agent).

---

## Audit Columns

Always include these system columns in field mapping documentation (read-only, set by Dataverse):

| Column | Description |
|---|---|
| `createdon` | Record creation timestamp |
| `createdby` | User who created |
| `modifiedon` | Last modification timestamp |
| `modifiedby` | User who last modified |
| `statecode` | Active (0) / Inactive (1) |
| `statuscode` | Status reason (sub-state) |
