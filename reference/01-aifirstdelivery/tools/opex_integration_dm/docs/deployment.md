# Deployment guide

End-to-end deployment of the framework — from blank Azure subscription to a running scheduled load. Three roles share the work; this guide is the master script.

## Roles

| Role | Owns |
| --- | --- |
| **Azure admin** | Subscription, resource group, RBAC, `az login` access |
| **Dataverse admin** | The D365 environment, custom schema, Application User, security roles |
| **Engineer (build / DevOps)** | Running `deploy.ps1`, KV secrets, first manual run |
| **Mapping analyst** | The workbook, configs, alias files (covered separately in [authoring-mappings.md](authoring-mappings.md)) |

## High-level flow

```
   Phase 0 — Prerequisites (parallel, ~1-2 days)
   ├─ Azure admin:     resource group, Az CLI access
   ├─ DV admin:        custom schema, SPN, App User
   └─ Analyst:         workbook gaps closed
                ▼
   Phase 1 — Infra & code deploy (single command, ~15 minutes)
   └─ Engineer: deploy.ps1
                ▼
   Phase 2 — Verify (manual smoke test, ~30 minutes)
   ├─ pl_preflight (DV connectivity)
   └─ pl_wave_orchestrator runMode=full (first wave)
                ▼
   Phase 3 — Enable schedule (one click, ongoing)
   └─ Engineer: set tr_wave_oracle_fusion_daily to Started
```

---

## Phase 0 — Prerequisites

These three streams run in parallel. **Don't run `deploy.ps1` until all three are checked off.**

### 0.1 — Azure admin tasks

```powershell
# 1. Log in to the right subscription
az login
az account set --subscription "<subscription-name-or-id>"
az account show --output table

# 2. Create the resource group (one per environment)
az group create --name rg-opex-dev --location eastus

# 3. Confirm you have Owner or Contributor + User Access Administrator on it
az role assignment list --scope $(az group show -g rg-opex-dev --query id -o tsv) --assignee $(az ad signed-in-user show --query id -o tsv)
```

### 0.2 — Dataverse admin tasks

**A. Create the custom Dataverse schema** per [architectural-spec.md §8](../reference/architectural-spec.md). The minimum list:

| Custom artifact | Type | Purpose |
| --- | --- | --- |
| `opx_AccountType` option set | Choice on Account | Customer R5 |
| `opx_equipmentdiscount` table + `opx_EquipmentDiscountId` lookup on Account | Lookup + Custom Entity | Customer R6 |
| `opx_partdiscount` + `opx_partdiscountid` | Lookup + Custom Entity | Customer R7 |
| `opx_nationaldiscount` + `opx_nationaldiscountid` | Lookup + Custom Entity | Customer R8 |
| `opx_customercategory` + `opx_customercategoryid` | Lookup + Custom Entity | Customer R9 |
| `opx_largecustomer` + `opx_largecustomerid` | Lookup + Custom Entity | Customer R15 |
| `opex_SiteNumber`, `opx_fusionRefAccountNumber`, `opx_sourceCreatedBy`, `opx_sourceModifiedBy` on Account | Text | Customer R17, R19, R20 |
| Payment-term option-set values | Option-set values | Customer R15 (values from `PaymentTermsOptionSetValues` workbook — currently a P0.8 gap) |
| `opx_county`, `opx_province`, `opx_endDate`, `opx_accountNumber` on Functional Location | Mixed | Site R10–R15 |
| `opx_contactnumber` (alt-key on Contact) | Text + Alt-key | Contact R2 |
| `opx_primaryphonetype`, `opx_primaryemailtype` on Contact | Choice | Contact R10, R16 |
| `opx_startdate`, `opx_enddate` on Contact | Date Only | Contact R19, R20 |
| `opx_Account_Contact_Contact` N:N relationship | Many-to-many | Contact R25 |
| Multi-column alt-key `(opx_accountNumber, msdyn_name)` on Functional Location | Alt-key | Site (per implementation.md P0.2) |

Track each artifact in the [implementation.md §1 P0.2 sub-tracker](../implementation.md).

**B. Register the Application User (SPN):**

1. Have an Entra admin register an Application Registration; generate a client secret.
2. In Power Platform admin center → Environment → Settings → Users + permissions → Application users → New app user.
3. Pick the registered app, assign security roles: `System Customizer` (for testing) or a custom role granting create/update on Account, Contact, Functional Location, and the custom entities created in step A.

**C. Capture three values** the engineer needs:

- Dataverse environment URL (e.g. `https://opex-dev.crm.dynamics.com`)
- SPN Application (client) ID
- SPN client secret (will go into KV — don't email it; hand off securely)

### 0.3 — Engineer / analyst prep

1. **Close mapping workbook gaps** (P0.8 in implementation.md) — freight/shipping/payment-term option-set values, Site/Contact source-entity names.
2. **Run the toolchain locally** to confirm everything's green before deploying:

   ```powershell
   py -3 -m validate_config config              # 0 errors expected
   py -3 -m dataflow_codegen --config-root config --out-dir adf/dataflows/generated
   ```

3. **Update `infra/bicep/main.parameters.dev.json`** with the real values from 0.1 and 0.2:

   ```json
   {
     "dataverseUrl":         { "value": "<from step 0.2C>" },
     "dataverseSpnClientId": { "value": "<from step 0.2C>" },
     "sftpHost":             { "value": "<your SFTP host>" },
     "sftpUserName":         { "value": "<your SFTP user>" }
   }
   ```

---

## Phase 1 — Run the deploy

A single PowerShell command:

```powershell
./infra/deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev
```

The script's six steps:

1. **Pre-flight** — confirms `az` is logged in, RG exists.
2. **Bicep deployment** — provisions ADLS Gen2 storage, Key Vault, Data Factory v2 (system MI), RBAC grants. ~5 minutes.
3. **Prints KV secret commands** for step 1.5 below — the script does not block on them.
4. **Uploads `/config/`** to the ADLS `opex-integration` container under `/config/`.
5. **Publishes ADF artifacts** in order: Linked Services → Datasets → Data Flows → Pipelines → Triggers. ~5 minutes.
6. **Summary** with resource names + ADF Studio URL.

### 1.5 — Set the three Key Vault secrets

The Bicep template creates secret **shells** with placeholder values. The real values are set out-of-band so they never enter source control:

```bash
KV=$(az keyvault list -g rg-opex-dev --query "[?starts_with(name,'kv-opex-dev')].name" -o tsv)

# SFTP password
az keyvault secret set --vault-name $KV --name kv-sftp-fusion-password \
    --value '<real SFTP password>'

# ADLS account key (look it up via az)
SA=$(az storage account list -g rg-opex-dev --query "[?starts_with(name,'stopexdev')].name" -o tsv)
ADLS_KEY=$(az storage account keys list --account-name $SA --query '[0].value' -o tsv)
az keyvault secret set --vault-name $KV --name kv-adls-accountkey --value "$ADLS_KEY"

# Dataverse SPN client secret (from step 0.2C)
az keyvault secret set --vault-name $KV --name kv-dataverse-spn-secret \
    --value '<real SPN client secret>'
```

If a secret isn't set, the affected pipeline run fails at the linked-service authentication step with an error like `KeyVault secret 'kv-sftp-fusion-password' is empty or contains placeholder text`.

---

## Phase 2 — Verify

### 2.1 — Run `pl_preflight`

Open ADF Studio (URL printed at end of `deploy.ps1`). Manually trigger `pl_preflight` with default parameters.

Expected result:

- `WebActivity_CheckDataverse` returns HTTP 200 (Dataverse reachable, SPN authenticates).
- `ForEach_EntityCheck` runs three iterations (customer, site, contact), each returns the `EntitySetName` for the target entity. **If any iteration 404s, the custom schema for that entity isn't in place — back to Phase 0.2A.**
- `Copy_PreflightReport` writes `audit/preflight/<runId>/report.json`.

### 2.2 — First wave (full mode)

Drop a sample CSV on SFTP that matches `source.inbound.pathPattern` for each entity (e.g. `/exports/HZ_CUST_ACCOUNTS_20260513.csv`). Recommended: start with **10 rows per entity** for the smoke test.

Manually trigger `pl_wave_orchestrator` with:

- `waveKey`: `oracle_fusion_daily`
- `runMode`: `full`

The wave runs Customer (phase 1) → Site/Contact (phase 2 parallel). Expected duration ≈ 5–10 minutes for 10 rows.

Verify the result:

- **In ADF Monitor:** wave pipeline + 3 child entity pipelines + many leaf pipelines, all green.
- **In ADLS:** `audit/wave_runs/<waveRunId>/wave_summary.json` exists with `"entityCount": 3`.
- **In Dataverse:** Open Account, Functional Location, Contact entities — your 10 rows are there. Spot-check field values, especially the lookup resolutions (`opx_EquipmentDiscountId` should be a real GUID).

### 2.3 — Negative-path test

Drop a CSV with a deliberately-bad row (e.g. `ACCOUNT_NUMBER` empty for a `mandatory:true` field). Re-run the wave.

Expected:

- `validation_errors.parquet` under `errors/customer/<runId>/` contains the bad row with `__failure_reason`.
- The wave summary status is `Success` if error rate is within `failureThresholdPct` (5% default).

### 2.4 — Reprocess

After 2.3, trigger `pl_reprocess` with:

- `entityKey`: `customer`
- `priorRunId`: `<the runId from 2.3>`
- `errorTypes`: `["validation"]`

Expected: error rows get replayed under a sub-runId; if you fixed the underlying issue (e.g. corrected the CSV), they now succeed.

---

## Phase 3 — Enable the schedule

Once 2.1–2.4 are all green:

1. Open ADF Studio → Manage → Triggers → `tr_wave_oracle_fusion_daily`.
2. Click the toggle to set `runtimeState` to **Started**.
3. Verify next-run time is correct (default: 02:00 UTC).

That's it. The wave runs daily until you stop the trigger.

---

## Re-deploying after a change

The deploy script is idempotent. After **any** change in `config/`, `adf/`, or `tools/dataflow-codegen/`:

```powershell
# Re-publish ADF + re-upload configs (skip Bicep — infra unchanged)
./infra/deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev -SkipBicep
```

When you change only the workbook + entity JSONs (and re-ran `dataflow-codegen` locally):

```powershell
# Re-upload configs + re-publish ADF
./infra/deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev -SkipBicep
```

When you change only the Bicep templates:

```powershell
# Re-deploy infra + re-publish (re-publish is harmless on no-op)
./infra/deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev
```

When you want a full clean redeploy (rare):

```powershell
# Tear down the RG (CAREFUL — deletes everything)
az group delete --name rg-opex-dev --yes
az group create --name rg-opex-dev --location eastus
./infra/deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev
# Re-set the three KV secrets per step 1.5
```

---

## Promoting to test / prod

For each environment:

1. Copy `infra/bicep/main.parameters.dev.json` → `main.parameters.test.json` / `main.parameters.prod.json`.
2. Update `env`, `nameSuffix`, `dataverseUrl`, `dataverseSpnClientId`, `sftpHost` to env-specific values.
3. Create a parallel RG: `az group create --name rg-opex-test --location eastus`.
4. Repeat Phase 0.2 (Dataverse admin) on the test/prod Dataverse environment.
5. Run `./infra/deploy.ps1 -ResourceGroupName rg-opex-test -Env test`.

Each environment is fully isolated — own ADF, own ADLS, own KV. No shared resources.

---

## What's NOT in deploy.ps1 (deliberately)

- **Resource group creation** — script assumes it exists, so it can't accidentally create in the wrong subscription.
- **Custom Dataverse schema** — DV admin job, done once per environment.
- **SPN registration** — Entra admin job, done once per organization.
- **Logic App for notifications** — deferred to v2 (per `implementation.md` §9).
- **Power BI dashboard** over `run_history.parquet` — operational nice-to-have, also deferred.
- **Network hardening** (private endpoints, VNet integration, firewall rules) — defaults to `Allow`; tighten in `storage.bicep` and `keyvault.bicep` for prod.
- **CI/CD pipeline** — out of scope for this iteration; the `validate-config` + `dataflow-codegen` tools have everything needed to wire up a GitHub Actions or Azure DevOps workflow when the team is ready. A sample YAML snippet is in [`tool-reference.md` §Running the tests](tool-reference.md#running-the-tests).

These are tracked in [`../implementation.md`](../implementation.md) §9 (v2-deferred).

## Pre-deploy checklist

Before running `deploy.ps1`:

- [ ] `az login` succeeds and `az account show` is the right subscription
- [ ] Resource group exists
- [ ] You have Owner or Contributor + User Access Administrator on the RG
- [ ] Dataverse custom schema is in place (Phase 0.2A)
- [ ] Dataverse Application User exists with security roles (Phase 0.2B)
- [ ] `main.parameters.<env>.json` has real values (no `REPLACE-WITH-YOUR-X` left)
- [ ] `validate-config config` returns 0 errors locally
- [ ] `dataflow-codegen` ran successfully and generated files are committed
- [ ] Sample CSVs are ready to drop on SFTP for the smoke test
