// Opex Integration Framework — top-level Bicep template.
// Provisions: ADLS Gen2 storage, Key Vault, Data Factory, role assignments.
// Deploys against a resource group; the RG itself must exist before running this.
//
// Usage:
//   az deployment group create \
//     --resource-group rg-opex-dev \
//     --template-file main.bicep \
//     --parameters @main.parameters.dev.json

targetScope = 'resourceGroup'

@description('Short environment identifier — drives naming. e.g. dev / test / prod.')
@allowed(['dev', 'test', 'prod'])
param env string = 'dev'

@description('Azure region. Defaults to the resource group location.')
param location string = resourceGroup().location

@description('Random suffix to make storage account names globally unique. Set once per env and never change.')
@minLength(3)
@maxLength(8)
param nameSuffix string = 'op${uniqueString(resourceGroup().id)}'

@description('Dataverse environment URL (e.g. https://opex-dev.crm.dynamics.com). Stored as ADF parameter default.')
param dataverseUrl string = 'https://opex-${env}.crm.dynamics.com'

@description('Dataverse SPN client (application) ID. Must already exist in Entra.')
param dataverseSpnClientId string = '00000000-0000-0000-0000-000000000000'

@description('SFTP host (e.g. sftp.oraclefusion.example.com).')
param sftpHost string = 'sftp.oraclefusion.example.com'

@description('SFTP port (usually 22).')
param sftpPort int = 22

@description('SFTP username.')
param sftpUserName string = 'opex_integration'

// ---------------------------------------------------------------------------
// Naming convention
// ---------------------------------------------------------------------------
var storageAccountName = toLower('stopex${env}${nameSuffix}')
var keyVaultName       = 'kv-opex-${env}-${nameSuffix}'
var dataFactoryName    = 'adf-opex-${env}'
var integrationContainer = 'opex-integration'

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------
module storage 'storage.bicep' = {
  name: 'storage'
  params: {
    location:          location
    storageAccountName: storageAccountName
    containerName:     integrationContainer
  }
}

module keyvault 'keyvault.bicep' = {
  name: 'keyvault'
  params: {
    location:      location
    keyVaultName:  keyVaultName
  }
}

module datafactory 'datafactory.bicep' = {
  name: 'datafactory'
  params: {
    location:           location
    dataFactoryName:    dataFactoryName
  }
}

// MI grants (storage + KV must exist before grants are attempted)
module roleAssignments 'roleassignments.bicep' = {
  name: 'roleAssignments'
  params: {
    storageAccountName:    storage.outputs.storageAccountName
    keyVaultName:          keyvault.outputs.keyVaultName
    dataFactoryPrincipalId: datafactory.outputs.principalId
  }
}

// ---------------------------------------------------------------------------
// Outputs — consumed by the PowerShell deploy script.
// ---------------------------------------------------------------------------
output storageAccountName    string = storage.outputs.storageAccountName
output storageAccountUrl     string = storage.outputs.adlsUrl
output containerName         string = integrationContainer
output keyVaultName          string = keyvault.outputs.keyVaultName
output keyVaultUri           string = keyvault.outputs.keyVaultUri
output dataFactoryName       string = datafactory.outputs.dataFactoryName
output dataFactoryPrincipalId string = datafactory.outputs.principalId
output dataverseUrl          string = dataverseUrl
output dataverseSpnClientId  string = dataverseSpnClientId
output sftpHost              string = sftpHost
output sftpPort              int    = sftpPort
output sftpUserName          string = sftpUserName
