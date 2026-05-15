# Troubleshooting

Symptom → diagnosis → fix. Organized by where the failure surfaces.

## Quick reference

| Where it shows up | Most likely cause |
| --- | --- |
| `deploy.ps1` fails before Bicep | Az CLI not logged in, RG missing, missing permission |
| `deploy.ps1` fails during Bicep | Wrong parameter values, name collision, region not supported |
| `deploy.ps1` fails during ADF publish | Linked service references resolve before secrets are set |
| Pipeline fails at `pl_extract_file` | SFTP unreachable, wrong path pattern, auth secret missing |
| Pipeline fails at `pl_master_prefetch` | Dataverse 401/403, SPN missing security role on the master table |
| Pipeline fails at `pl_load_upsert` | Dataverse throttling, schema mismatch (custom artifacts missing) |
| Pipeline fails at `pl_load_relationships` | N:N relationship doesn't exist, alt-key resolution miss |
| Pipeline reports Partial | Some rows hit validation/transform errors — open the sidecar |
| Outbound: empty CSV | Watermark advanced past current rows, or filter excludes everything |
| Lookup returns null | Master not prefetched, or value not in master + no alias |

---

## Deployment failures

### `deploy.ps1: You are not logged in`

```powershell
az login
az account set --subscription "<right-subscription-id>"
```

### Bicep fails with `AuthorizationFailed`

You lack Owner or Contributor + User Access Administrator on the RG. Either have an Owner run the deploy, or get the role assigned to your account.

### Bicep fails with `StorageAccountAlreadyTaken`

The storage account name `stopex<env><nameSuffix>` is globally unique and the default `nameSuffix` collided with someone else's. Edit `infra/bicep/main.parameters.<env>.json` and change `nameSuffix` to something different (3–8 lowercase alphanumeric chars).

### ADF publish fails with `Linked service 'ls_keyvault' not found`

The publish order is wrong, or the prior step failed silently. Re-run:

```powershell
./infra/deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev -SkipBicep
```

The script publishes Linked Services first, then Datasets, then Dataflows, then Pipelines, then Triggers. If you previously published manually in the wrong order, the re-run fixes it.

### ADF Pipeline shows `Cannot resolve KeyVault secret`

The secret shell is still the placeholder value. Set the real value:

```bash
KV=$(az keyvault list -g rg-opex-dev --query "[?starts_with(name,'kv-opex-dev')].name" -o tsv)
az keyvault secret set --vault-name $KV --name kv-<which-one> --value '<real value>'
```

Wait ~30 seconds for ADF's secret cache to expire, then re-run the pipeline.

---

## Extract failures

### `pl_extract_file`: `Cannot connect to SFTP host`

Diagnose in this order:

1. **DNS:** `nslookup <sftpHost>` from any machine — should return an IP.
2. **TCP:** `tnc <sftpHost> -port 22` from the SHIR machine (or any machine in the same VNet if you use private endpoints).
3. **Auth:** test from a regular SFTP client using the same user + password (from KV).
4. **Firewall:** if the SFTP server has an IP allow-list, add the ADF managed-VNet egress IPs (or your SHIR's outbound IP).

### `pl_extract_file`: 0 files found

Run `GetMetadata_SftpFiles` manually and inspect output. Common cause: `source.inbound.pathPattern` in the entity config doesn't match the file the upstream system actually drops. Patterns use SFTP wildcards (`*`, `?`); regex is **not** supported.

### `pl_extract_dataverse`: HTTP 401

The SPN secret in KV is invalid, expired, or doesn't match the Application User. Verify:

```bash
# Try to acquire a token manually
SPN_ID=<from main.parameters.dev.json>
SPN_SECRET=<the value in kv-dataverse-spn-secret>
TENANT=<your tenant id>

curl -X POST "https://login.microsoftonline.com/$TENANT/oauth2/v2.0/token" \
  -d "grant_type=client_credentials&client_id=$SPN_ID&client_secret=$SPN_SECRET&scope=https://<env>.crm.dynamics.com/.default"
```

If you get a token but DV still 401s, the SPN exists in Entra but the Application User wasn't created in Power Platform admin center. Phase 0.2B in [deployment.md](deployment.md).

### `pl_extract_dataverse`: HTTP 403 on a specific entity

The SPN's security role doesn't grant read on that entity. Have the DV admin add `System Customizer` (for testing) or grant the read privilege on the missing entity to a custom role.

---

## Load failures

### `pl_load_upsert`: `Entity 'opx_equipmentdiscount' not found`

The Dataverse custom schema is missing. Run `pl_preflight` — it will list every entity that's missing. Have the DV admin create them per Phase 0.2A in [deployment.md](deployment.md).

### `pl_load_upsert`: HTTP 429 throttling

Dataverse service-protection limit hit. The connector retries automatically on 429, but if it exhausts the retry budget:

1. **Reduce concurrency:** edit `_project.json`'s `maxConcurrentConnectionsDataverse` from 2 to 1.
2. **Reduce batch size:** drop `batchSize` from 500 to 250.
3. **Use a different SPN for different entities:** advanced; gives each entity its own throttle bucket.

Full math in [`../detailed-design/03-error-model-and-runbook.md` §5.5](../detailed-design/03-error-model-and-runbook.md).

### `pl_load_upsert`: Partial — some rows skipped

Check `errors/<entityKey>/<runId>/load_errors/`. The ADF Copy log lists per-row failures. Common cases:

- **Alt-key collision** (rare with `Upsert`): `MSCRM.SuppressDuplicateDetection` is already on.
- **Required field missing in row** despite passing validation: the field is mandatory in Dataverse but not flagged `mandatory:true` in the entity config — update the config.
- **Option-set value out of range:** the `choice` map in the entity config has a value the option set doesn't actually contain. Verify against Dataverse.

### `pl_load_relationships`: many 412 conflicts

412 is treated as **silent success** per design — it means the association already exists, which happens on every replay of the same `runId`. Look at `audit/checkpoints/<runId>/pl_load_relationships.json`; `alreadyExistsCount` should be roughly equal to your input row count if you're replaying a successful run.

If you're seeing 412 on a **first** run, something else loaded the associations between the master prefetch and the relationship-load step. Investigate.

### `pl_load_relationships`: actual association failures

Look at `audit/checkpoints/<runId>/pl_load_relationships.json`'s `associateFailedCount`. Then ADF Monitor → the failed `WebActivity_Associate` invocations. Common causes:

- **Primary entity row doesn't exist yet** — phase ordering issue. Customer should be phase 1; Contact phase 2.
- **Related entity row doesn't exist** — the master prefetch's filter excluded it, or it was never loaded.
- **Wrong relationship schema name** — verify against Dataverse `OneToManyRelationships` metadata. Pre-flight should catch this.

---

## Transform failures

### Lookup returns null where it should resolve

Triage:

1. **Open `masters/<refTable>.parquet`** in ADLS — verify the master row exists with the expected `refField` value.
2. **Check `audit/master_cache_state.json`** — when was the master last refreshed? If stale, the row exists in DV but not the cache.
3. **Check the alias file** at `config/aliases/<refTable>__<refField>.json` — does it cover the source variant?
4. **Check case sensitivity** — the source might have `EQUIPMET_DISCOUNT="ed-plat"` and the master has `ED-PLAT`. Add `matchPolicy: caseInsensitive` to the field's transform.

### High `transform_errors.parquet` count

Open the parquet and group by `__failure_reason`. Usually one root cause dominates. Common patterns:

- `choice.notfound: opx_AccountType=<X>` — `<X>` isn't in the choice map. Add it, or set `onMissing: useDefault` if `<X>` is genuinely unknown.
- `lookup.notfound: opx_city.opx_cityname=<X>` — same shape. Add an alias entry (best), create the master row (if it should exist), or change `onMissing` to `suggestion` (load the row with null lookup + queue for steward review).

### `__failure_reason` is empty

Cause: the source value is null and the field is mandatory. Open `raw/<entityKey>/<runId>/data.parquet` and confirm the column is empty for those rows.

---

## Outbound issues

### Outbound CSV is empty

Three possibilities:

1. **Watermark too recent** — `lastSyncedAt` is after every row's `modifiedon`. Force-full:

   ```powershell
   az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev `
     -n pl_master_orchestrator `
     --parameters '{ "entityKey": "<X>", "direction": "outbound", "forceFull": true }'
   ```

2. **Filter excludes everything** — open the entity config and verify `target.outbound.query.odataFilter`. Test the filter manually:

   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "https://<env>.crm.dynamics.com/api/data/v9.2/accounts?$filter=<your-filter>&$top=5"
   ```

3. **Empty-file behavior** — if `source.outbound.emptyFileBehavior` is `skipFile`, the pipeline reports Success but writes no file. Set it to `writeHeaderOnly` if you want at least the headers.

### Outbound delivery succeeded but watermark didn't advance

`pl_advance_watermark` is the **last** step. If any prior step in the outbound chain failed (or was skipped), the watermark stays at its prior value. Re-run the outbound pipeline manually and trace which step is missing its checkpoint.

### `.tmp` file left on SFTP

The atomic rename via `func-sftp-rename` Azure Function is **deferred** in v1 — `WebActivity_RenameSftpTmpToFinal` skips when `atomicRenameFunctionUrl` is empty. The CSV lands as `<file>.csv.tmp` and stays that way. Either:

- **Tolerate it** — downstream consumers ignore `.tmp` files.
- **Build the Function** (next implementation milestone — see implementation.md §3.5).
- **Manual rename:** SSH into the SFTP server and `mv`.

---

## Field-value trace — when one row looks wrong

The framework's audit trail lets you trace a single row end-to-end:

```powershell
# 1. Original source CSV (as parquet)
$runId = "<the-runId>"
az storage blob download `
  --account-name <storage-account> `
  --container-name opex-integration `
  --name "raw/customer/$runId/data.parquet" `
  --file raw.parquet --auth-mode login

# 2. Post-validation (after type-cast + dedup)
az storage blob download `
  --account-name <storage-account> `
  --container-name opex-integration `
  --name "staged/customer/$runId/data.parquet" `
  --file staged.parquet --auth-mode login

# 3. Post-transform (after lookups, choices, etc.)
az storage blob download `
  --account-name <storage-account> `
  --container-name opex-integration `
  --name "final/customer/$runId/data.parquet" `
  --file final.parquet --auth-mode login
```

Open the three parquets in pandas / Power BI / DuckDB, filter on the alt-key, compare the column values. Where it changes is where the bug is.

```python
import pandas as pd
raw = pd.read_parquet("raw.parquet")
staged = pd.read_parquet("staged.parquet")
final = pd.read_parquet("final.parquet")

acct = "CUST-1003"
print(raw[raw.ACCOUNT_NUMBER == acct].T)
print(staged[staged.ACCOUNT_NUMBER == acct].T)
print(final[final.accountnumber == acct].T)
```

---

## Pipeline stuck "in progress"

Most common cause: an ADF Web activity is waiting on a service that's not responding (Dataverse timeout, Logic App, etc.). ADF won't auto-kill a stuck pipeline. To recover:

```powershell
# Cancel the run
az datafactory pipeline-run cancel -g rg-opex-dev -f adf-opex-dev --run-id <runId>

# If a sentinel lock was created, delete it manually so the next run can start
az storage blob delete `
  --account-name <storage-account> `
  --container-name opex-integration `
  --name "audit/locks/<entityKey>__inbound.json" `
  --auth-mode login
```

Then re-run with the same `runId` if you want checkpoint-aware resume; or with a fresh run for a clean re-start.

---

## Diagnostic queries

### Last 10 pipeline runs

```powershell
az datafactory pipeline-run query-by-factory `
  -g rg-opex-dev -f adf-opex-dev `
  --last-updated-after $(Get-Date).AddDays(-1).ToString("o") `
  --last-updated-before $(Get-Date).ToString("o") `
  --query "value[].[runId,pipelineName,status,durationInMs]" -o table
```

### Find all failed runs in the past week

```powershell
az datafactory pipeline-run query-by-factory `
  -g rg-opex-dev -f adf-opex-dev `
  --last-updated-after $(Get-Date).AddDays(-7).ToString("o") `
  --last-updated-before $(Get-Date).ToString("o") `
  --filters "operand=Status;operator=Equals;values=Failed" `
  --query "value[].[runId,pipelineName,message]" -o table
```

### Inspect a wave summary

```powershell
$summaryBlob = "audit/wave_runs/<waveRunId>/wave_summary.json"
az storage blob download `
  --account-name <storage-account> `
  --container-name opex-integration `
  --name $summaryBlob --file summary.json --auth-mode login
cat summary.json | ConvertFrom-Json | Format-List
```

## Reporting a bug

When something's broken and the doc doesn't cover it, log it in [`../implementation.md`](../implementation.md) §6 (Bug log). Required fields:

- **Code** (Bxxx, next number)
- **Opened** (date)
- **Severity** (FATAL / ROW / SOFT / WARN / Impl-bug)
- **Title** (one line)
- **Component** (which pipeline / tool / module)
- **Reproduction** (run command + observed behavior)

If you have a fix already, link the commit in the same row. The bug log is the institutional memory for the next on-call.
