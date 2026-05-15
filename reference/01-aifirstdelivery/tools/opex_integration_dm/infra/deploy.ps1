<#
.SYNOPSIS
  One-command deploy for the Opex Integration Framework.

.DESCRIPTION
  Steps performed (in order):
    1. Sanity check — az CLI present, logged in, subscription set.
    2. Deploy Bicep — provisions ADLS Gen2, Key Vault, Data Factory, RBAC grants.
    3. (Optional, prompted) set Key Vault secrets to real values.
    4. Upload /config/ tree to ADLS so pipelines can read configs at runtime.
    5. Publish ADF artifacts in correct order:
       Linked Services → Datasets → Data Flows → Pipelines → Triggers.
    6. Summary — print URLs, principal IDs, next steps.

.PARAMETER ResourceGroupName
  Resource group to deploy into. Must already exist (`az group create` first).

.PARAMETER Env
  Environment short name. Drives parameter file selection.

.PARAMETER SkipBicep
  Skip the Bicep deployment step (use when re-publishing ADF artifacts only).

.PARAMETER SkipConfigUpload
  Skip uploading /config/ to ADLS (use when configs haven't changed).

.PARAMETER SkipAdfPublish
  Skip publishing ADF artifacts (use when only re-running the infrastructure).

.EXAMPLE
  # First-time deploy
  ./deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev

.EXAMPLE
  # Re-publish only the ADF artifacts after a code change
  ./deploy.ps1 -ResourceGroupName rg-opex-dev -Env dev -SkipBicep -SkipConfigUpload

.NOTES
  Prerequisites:
    - Az CLI installed and logged in (`az login`)
    - Bicep CLI (bundled with recent Az CLI versions)
    - The resource group `$ResourceGroupName` already exists
    - You own Owner or Contributor + User Access Administrator on the RG
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'test', 'prod')]
    [string]$Env,

    [switch]$SkipBicep,
    [switch]$SkipConfigUpload,
    [switch]$SkipAdfPublish
)

$ErrorActionPreference = 'Stop'
$InformationPreference = 'Continue'

# Repo root = parent of /infra/
$RepoRoot = (Resolve-Path "$PSScriptRoot/..").Path
$ConfigDir = Join-Path $RepoRoot 'config'
$AdfDir = Join-Path $RepoRoot 'adf'
$BicepDir = $PSScriptRoot

# ============================================================================
# Step 1 — Sanity check
# ============================================================================
Write-Information ""
Write-Information "[1/6] Pre-flight checks"

$az = Get-Command az -ErrorAction SilentlyContinue
if (-not $az) {
    throw "Az CLI is not on PATH. Install from https://aka.ms/installazurecliwindows then re-run."
}

$accountJson = az account show 2>$null
if (-not $accountJson) {
    throw "You are not logged in. Run: az login"
}
$account = $accountJson | ConvertFrom-Json
Write-Information "  Subscription: $($account.name) ($($account.id))"
Write-Information "  Tenant:       $($account.tenantId)"
Write-Information "  User:         $($account.user.name)"

$rg = az group show --name $ResourceGroupName 2>$null
if (-not $rg) {
    throw "Resource group '$ResourceGroupName' does not exist. Create with: az group create --name $ResourceGroupName --location eastus"
}

# ============================================================================
# Step 2 — Bicep deployment
# ============================================================================
if (-not $SkipBicep) {
    Write-Information ""
    Write-Information "[2/6] Bicep deployment"

    $paramsFile = Join-Path $BicepDir "main.parameters.$Env.json"
    if (-not (Test-Path $paramsFile)) {
        throw "Parameters file not found: $paramsFile"
    }

    $deploymentName = "opex-integration-$Env-$(Get-Date -Format 'yyyyMMddHHmmss')"
    $deployment = az deployment group create `
        --resource-group $ResourceGroupName `
        --name $deploymentName `
        --template-file (Join-Path $BicepDir 'main.bicep') `
        --parameters "@$paramsFile" `
        --output json | ConvertFrom-Json

    if (-not $deployment -or $deployment.properties.provisioningState -ne 'Succeeded') {
        throw "Bicep deployment failed. See az output above."
    }

    $script:DeployOutputs = $deployment.properties.outputs
    Write-Information "  Storage:       $($script:DeployOutputs.storageAccountName.value)"
    Write-Information "  Key Vault:     $($script:DeployOutputs.keyVaultName.value)"
    Write-Information "  Data Factory:  $($script:DeployOutputs.dataFactoryName.value)"
    Write-Information "  ADF principal: $($script:DeployOutputs.dataFactoryPrincipalId.value)"
} else {
    Write-Information ""
    Write-Information "[2/6] Bicep deployment SKIPPED — looking up existing resources"

    $adfName = "adf-opex-$Env"
    $adf = az datafactory show --resource-group $ResourceGroupName --name $adfName 2>$null
    if (-not $adf) {
        throw "Data Factory '$adfName' not found. Drop -SkipBicep on the first run."
    }
    $storages = az storage account list --resource-group $ResourceGroupName --query "[?starts_with(name, 'stopex$Env')].{name:name}" -o json | ConvertFrom-Json
    if ($storages.Count -eq 0) { throw "No storage account starting with stopex$Env found in $ResourceGroupName." }
    $kvs = az keyvault list --resource-group $ResourceGroupName --query "[?starts_with(name, 'kv-opex-$Env')].{name:name}" -o json | ConvertFrom-Json
    if ($kvs.Count -eq 0) { throw "No Key Vault starting with kv-opex-$Env found in $ResourceGroupName." }

    $script:DeployOutputs = [pscustomobject]@{
        storageAccountName = [pscustomobject]@{ value = $storages[0].name }
        storageAccountUrl  = [pscustomobject]@{ value = "https://$($storages[0].name).dfs.core.windows.net" }
        containerName      = [pscustomobject]@{ value = 'opex-integration' }
        keyVaultName       = [pscustomobject]@{ value = $kvs[0].name }
        dataFactoryName    = [pscustomobject]@{ value = $adfName }
    }
}

# ============================================================================
# Step 3 — Prompt for secrets
# ============================================================================
Write-Information ""
Write-Information "[3/6] Key Vault secrets"
Write-Information "  Bicep created the secret SHELLS with placeholder values."
Write-Information "  Set their real values now via:"
Write-Information "    az keyvault secret set --vault-name $($script:DeployOutputs.keyVaultName.value) --name kv-sftp-fusion-password   --value '<real sftp password>'"
Write-Information "    az keyvault secret set --vault-name $($script:DeployOutputs.keyVaultName.value) --name kv-adls-accountkey       --value '<real ADLS account key>'"
Write-Information "    az keyvault secret set --vault-name $($script:DeployOutputs.keyVaultName.value) --name kv-dataverse-spn-secret  --value '<real SPN client secret>'"
Write-Information "  (Skip this step if secrets are already set — the script does not block on it.)"

# ============================================================================
# Step 4 — Upload /config/ to ADLS
# ============================================================================
if (-not $SkipConfigUpload) {
    Write-Information ""
    Write-Information "[4/6] Uploading /config/ to ADLS"

    $storageAccount = $script:DeployOutputs.storageAccountName.value
    $container = $script:DeployOutputs.containerName.value

    az storage blob upload-batch `
        --account-name $storageAccount `
        --destination $container `
        --destination-path 'config' `
        --source $ConfigDir `
        --overwrite `
        --auth-mode login `
        --output none

    Write-Information "  Uploaded $ConfigDir → $container/config"
} else {
    Write-Information ""
    Write-Information "[4/6] Config upload SKIPPED"
}

# ============================================================================
# Step 5 — Publish ADF artifacts (correct order matters)
# ============================================================================
if (-not $SkipAdfPublish) {
    Write-Information ""
    Write-Information "[5/6] Publishing ADF artifacts"

    $adf = $script:DeployOutputs.dataFactoryName.value

    function Publish-AdfArtifact {
        param([string]$Type, [string]$Path, [string]$DisplayName)
        $name = [System.IO.Path]::GetFileNameWithoutExtension($Path)
        Write-Information "  $DisplayName/$name"

        $cmd = switch ($Type) {
            'linkedservice' { @('datafactory', 'linked-service', 'create') }
            'dataset'       { @('datafactory', 'dataset', 'create') }
            'dataflow'      { @('datafactory', 'data-flow', 'create') }
            'pipeline'      { @('datafactory', 'pipeline', 'create') }
            'trigger'       { @('datafactory', 'trigger', 'create') }
        }

        az @cmd --resource-group $ResourceGroupName --factory-name $adf --name $name --properties "@$Path" --output none
    }

    foreach ($f in Get-ChildItem -Path (Join-Path $AdfDir 'linkedServices') -Filter *.json) {
        Publish-AdfArtifact -Type 'linkedservice' -Path $f.FullName -DisplayName 'LinkedService'
    }
    foreach ($f in Get-ChildItem -Path (Join-Path $AdfDir 'datasets') -Filter *.json) {
        Publish-AdfArtifact -Type 'dataset' -Path $f.FullName -DisplayName 'Dataset'
    }
    # Data flows: manual first, then generated (in case generated reference manual ones)
    foreach ($subdir in @('manual', 'generated')) {
        $df = Join-Path $AdfDir "dataflows/$subdir"
        if (Test-Path $df) {
            foreach ($f in Get-ChildItem -Path $df -Filter *.json) {
                Publish-AdfArtifact -Type 'dataflow' -Path $f.FullName -DisplayName "Dataflow($subdir)"
            }
        }
    }
    # Pipelines: leaves first, then orchestrators (master → wave)
    $pipelineOrder = @(
        'pl_extract_file', 'pl_extract_dataverse', 'pl_master_prefetch',
        'pl_stage_validate', 'pl_transform_inbound', 'pl_transform_outbound',
        'pl_load_upsert', 'pl_load_upsert_phase2',
        'pl_load_relationships', 'pl_export_relationships',
        'pl_deliver_sftp', 'pl_advance_watermark',
        'pl_audit_aggregator',
        'pl_reprocess', 'pl_preflight',
        'pl_master_orchestrator', 'pl_wave_orchestrator'
    )
    foreach ($name in $pipelineOrder) {
        $path = Join-Path $AdfDir "pipelines/$name.json"
        if (Test-Path $path) {
            Publish-AdfArtifact -Type 'pipeline' -Path $path -DisplayName 'Pipeline'
        }
    }
    # Triggers last (they reference pipelines)
    foreach ($f in Get-ChildItem -Path (Join-Path $AdfDir 'triggers') -Filter *.json) {
        Publish-AdfArtifact -Type 'trigger' -Path $f.FullName -DisplayName 'Trigger'
    }
} else {
    Write-Information ""
    Write-Information "[5/6] ADF publish SKIPPED"
}

# ============================================================================
# Step 6 — Summary
# ============================================================================
Write-Information ""
Write-Information "[6/6] Deployment complete"
Write-Information ""
Write-Information "Resources:"
Write-Information "  Resource Group:  $ResourceGroupName"
Write-Information "  Data Factory:    $($script:DeployOutputs.dataFactoryName.value)"
Write-Information "  Storage:         $($script:DeployOutputs.storageAccountName.value)"
Write-Information "  Key Vault:       $($script:DeployOutputs.keyVaultName.value)"
Write-Information ""
Write-Information "Next steps:"
Write-Information "  1. Set KV secrets to real values (see step 3 above) if you haven't already."
Write-Information "  2. Open ADF Studio:"
Write-Information "       https://adf.azure.com/?factory=/subscriptions/$($account.id)/resourceGroups/$ResourceGroupName/providers/Microsoft.DataFactory/factories/$($script:DeployOutputs.dataFactoryName.value)"
Write-Information "  3. Run pl_preflight first to verify connectivity."
Write-Information "  4. Trigger pl_wave_orchestrator manually with waveKey=oracle_fusion_daily and runMode=full for the initial load."
Write-Information "  5. Once green, enable tr_wave_oracle_fusion_daily by setting runtimeState to Started."
Write-Information ""
