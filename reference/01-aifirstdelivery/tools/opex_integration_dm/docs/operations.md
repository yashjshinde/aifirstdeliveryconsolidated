# Operations guide

Day-to-day running of the framework. **Audience:** ops / on-call rotation.

## Daily rhythm

| When | What you check |
| --- | --- |
| Morning after the 02:00 UTC wave | ADF Monitor → most recent `pl_wave_orchestrator` run is green |
| Same time | `audit/wave_runs/<latest>/wave_summary.json` in ADLS shows `entityCount: 3` |
| Same time | Sample 2-3 freshly-loaded Dataverse rows look right |
| Weekly | `audit/run_history.*` parquets — error rate trends per entity |
| Weekly | KV secret expirations — SPN secrets have a 2-year max |

## Where to look

| Question | Where |
| --- | --- |
| Did the wave run? | ADF Studio → Monitor → Pipeline runs (filter for `pl_wave_orchestrator`) |
| Did one entity succeed/fail? | `audit/wave_runs/<waveRunId>/<entityKey>.json` |
| Did one pipeline step succeed? | `audit/checkpoints/<runId>/<pipelineName>.json` |
| Which rows failed validation? | `errors/<entityKey>/<runId>/validation_errors.parquet` |
| Which rows failed transform? | `errors/<entityKey>/<runId>/transform_errors.parquet` |
| Which rows failed the Dataverse write? | `errors/<entityKey>/<runId>/load_errors/` (ADF Copy log directory) |
| What's the current outbound delta watermark? | `audit/watermarks/<entityKey>.json` |
| What was the wave's overall status? | `audit/wave_runs/<waveRunId>/wave_summary.json` |

All paths are under the `opex-integration` container in the ADLS account.

## Running pipelines manually

### From ADF Studio (the usual way)

ADF Studio → Author → Pipelines → pick a pipeline → **Trigger** → **Trigger now** → fill parameters → OK.

### From Az CLI (scriptable)

```powershell
# Trigger pl_wave_orchestrator with full mode
az datafactory pipeline create-run `
  --resource-group rg-opex-dev `
  --factory-name adf-opex-dev `
  --pipeline-name pl_wave_orchestrator `
  --parameters '{ "waveKey": "oracle_fusion_daily", "runMode": "full" }'

# Get the runId back, then poll status
$run = az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev -n pl_wave_orchestrator --parameters '{"waveKey":"oracle_fusion_daily"}' | ConvertFrom-Json
$runId = $run.runId
az datafactory pipeline-run show -g rg-opex-dev -f adf-opex-dev --run-id $runId --query 'status'
```

## Reprocessing failed rows

When a wave reports Partial and the error sidecars show fixable issues:

### Option 1 — Re-fire the whole wave (recommended for most cases)

```powershell
az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev `
  -n pl_wave_orchestrator `
  --parameters '{ "waveKey": "oracle_fusion_daily", "runMode": "incremental", "priorWaveRunId": "<the failed waveRunId>" }'
```

The wave uses the same `waveRunId` so the audit trail stays coherent. Master caches from the prior run are reused if within TTL.

### Option 2 — Re-fire just one entity

```powershell
az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev `
  -n pl_wave_orchestrator `
  --parameters '{ "waveKey": "oracle_fusion_daily", "entityFilter": ["site"], "priorWaveRunId": "<original waveRunId>" }'
```

### Option 3 — Reprocess just the error rows (after fixing the underlying issue)

```powershell
az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev `
  -n pl_reprocess `
  --parameters '{ "entityKey": "customer", "priorRunId": "<runId>", "errorTypes": ["validation","transform"] }'
```

This replays just the error subset through stage → transform → load with a synthetic sub-runId. Original raw data must still be in retention (default 30 days).

## Outbound: managing the watermark

Outbound entities track `lastSyncedAt` per entity in `audit/watermarks/<entityKey>.json`. To reset (e.g. after a downstream system asks for a full re-export):

```powershell
# Delete the watermark file
az storage blob delete `
  --account-name <storage-account> `
  --container-name opex-integration `
  --name "audit/watermarks/<entityKey>.json" `
  --auth-mode login

# Next outbound run will fall back to initialFromUtc
```

Or force-full for one run without permanently resetting:

```powershell
az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev `
  -n pl_master_orchestrator `
  --parameters '{ "entityKey": "customer", "direction": "outbound", "runMode": "full", "forceFull": true }'
```

## Pause / resume the schedule

```powershell
# Pause (e.g. before a maintenance window)
az datafactory trigger stop -g rg-opex-dev -f adf-opex-dev -n tr_wave_oracle_fusion_daily

# Resume
az datafactory trigger start -g rg-opex-dev -f adf-opex-dev -n tr_wave_oracle_fusion_daily
```

The trigger is left in `Stopped` state by `deploy.ps1`. You start it manually after the first successful manual run.

## Rotating secrets

### Dataverse SPN secret (expires every 2 years max)

```bash
# 1. In Entra, generate a new client secret for the App Registration
# 2. Update KV
KV=$(az keyvault list -g rg-opex-dev --query "[?starts_with(name,'kv-opex-dev')].name" -o tsv)
az keyvault secret set --vault-name $KV --name kv-dataverse-spn-secret --value '<new secret>'

# 3. ADF caches secrets per linked-service instance for a short window; force re-resolve by
#    restarting an in-progress run, or wait ~5 minutes for the cache to expire.
```

### SFTP password

```bash
KV=$(az keyvault list -g rg-opex-dev --query "[?starts_with(name,'kv-opex-dev')].name" -o tsv)
az keyvault secret set --vault-name $KV --name kv-sftp-fusion-password --value '<new password>'
```

### ADLS account key (cycle quarterly)

```bash
SA=$(az storage account list -g rg-opex-dev --query "[?starts_with(name,'stopexdev')].name" -o tsv)

# Regenerate key2
az storage account keys renew --account-name $SA --key key2

# Update KV with key2
NEW_KEY=$(az storage account keys list --account-name $SA --query "[?keyName=='key2'].value | [0]" -o tsv)
KV=$(az keyvault list -g rg-opex-dev --query "[?starts_with(name,'kv-opex-dev')].name" -o tsv)
az keyvault secret set --vault-name $KV --name kv-adls-accountkey --value "$NEW_KEY"

# After verifying everything works on key2, regenerate key1
az storage account keys renew --account-name $SA --key key1
```

## Verifying a run end-to-end

The 5-minute health-check after any deploy or maintenance window:

```powershell
# 1. Fire pl_preflight — should be green within 30 seconds
az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev -n pl_preflight `
  --parameters '{ "entities": ["customer","site","contact"] }'

# 2. If green, fire the wave with a small test file
az datafactory pipeline create-run -g rg-opex-dev -f adf-opex-dev -n pl_wave_orchestrator `
  --parameters '{ "waveKey": "oracle_fusion_daily", "runMode": "incremental" }'

# 3. Watch ADF Monitor; once Done, check the summary
az storage blob download `
  --account-name <storage-account> `
  --container-name opex-integration `
  --name "audit/wave_runs/<waveRunId>/wave_summary.json" `
  --file ./wave_summary.json --auth-mode login
cat wave_summary.json
```

## What to do when…

| Symptom | First action | See |
| --- | --- | --- |
| Wave failed completely | Find the failed child entity in ADF Monitor; expand error message | [troubleshooting.md](troubleshooting.md) |
| Wave Partial — N% errors | Pull the error sidecars; review root cause | [troubleshooting.md §validation-errors](troubleshooting.md) |
| One row in Dataverse looks wrong | Trace the source row in `raw/<entity>/<runId>/data.parquet` → `staged/` → `final/` | [troubleshooting.md §field-value-trace](troubleshooting.md) |
| Outbound CSV is missing rows | Check the watermark + the OData filter against your expectations | [troubleshooting.md §outbound-delta](troubleshooting.md) |
| Lookup returning null | Master cache may be stale; check `audit/master_cache_state.json` | [troubleshooting.md §lookup-not-found](troubleshooting.md) |
| Pipeline stuck "in progress" >2h | Likely Dataverse throttling; check service-protection metrics | [troubleshooting.md §throttling](troubleshooting.md) |
| Stale lock blocking re-run | Delete `audit/locks/<entityKey>__<direction>.json` manually | (note in implementation.md if recurring) |

## Audit & retention

| Path | What's there | Retention |
| --- | --- | --- |
| `audit/run_history.parquet` | Per-pipeline status rows | Indefinite |
| `audit/wave_runs/<waveRunId>/` | Per-entity wave status + summary | Indefinite |
| `audit/checkpoints/<runId>/` | Per-pipeline success markers | Indefinite (small) |
| `audit/watermarks/<entityKey>.json` | Outbound delta state | Indefinite (one file per entity) |
| `audit/master_cache_state.json` | Master prefetch bookkeeping | Indefinite |
| `audit/preflight/<runId>/` | Preflight check reports | 90 days (rolling) |
| `raw/<entity>/<runId>/` | Original SFTP files as parquet | 30 days |
| `staged/` and `staged-out/` | Post-validation, pre-transform | 30 days |
| `final/` and `final-out/` | Pre-load / pre-delivery | 30 days |
| `masters/<refTable>.parquet` | Cached Dataverse master tables | Overwritten on next prefetch |
| `errors/<entity>/<runId>/validation_errors.parquet` | Row-level validation failures | 30 days |
| `errors/<entity>/<runId>/transform_errors.parquet` | Row-level transform failures | 30 days |
| `errors/<entity>/<runId>/load_errors/` | ADF Copy log directory | 90 days |
| `errors/<entity>/<runId>/alias_suggestions.parquet` | Steward queue (when used) | 180 days |

Retention is **not enforced by the framework** — set ADLS lifecycle management rules on the storage account to delete old files automatically. Recommended Bicep addition in v2.

## When to escalate

| Situation | Page |
| --- | --- |
| Dataverse 503 for >15 minutes | Microsoft support (DV health issue) |
| ADF instance "Unhealthy" in Az portal | Microsoft support |
| Several consecutive waves fail with the same code | Build team (likely a config/code change needed) |
| Recurring lookup-not-found on a master that exists | Mapping analyst (alias file curation) |
| 412 conflict rate >10% on N:N associate | Data team (master data quality / dedup issue) |

## Open work item

The framework currently does NOT send email/Teams notifications — `Logic App la-opex-notify` is deferred to v2. Today the only way to know a wave failed is to check ADF Monitor or the wave_summary.json. Set up a Power BI alert or a small custom poller against the audit folder until the notification infrastructure ships.
