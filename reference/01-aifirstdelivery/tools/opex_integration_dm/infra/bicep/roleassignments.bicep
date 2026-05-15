// RBAC grants for the ADF managed identity.
//   - Storage Blob Data Contributor on the storage account → read/write ADLS
//   - Key Vault Secrets User      on the Key Vault         → read KV secrets

@description('Name of the storage account to grant ADF access to.')
param storageAccountName string

@description('Name of the Key Vault to grant ADF access to.')
param keyVaultName string

@description('System-assigned principal ID of the ADF managed identity.')
param dataFactoryPrincipalId string

// Existing resources (look up by name to compose scope)
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Built-in role definition IDs (stable)
var roleIdStorageBlobDataContributor = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
var roleIdKeyVaultSecretsUser        = '4633458b-17de-408a-b874-0445c86b69e6'

// ADF MI → Storage Blob Data Contributor on the storage account
resource raAdfStorage 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storage
  name: guid(storage.id, dataFactoryPrincipalId, roleIdStorageBlobDataContributor)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleIdStorageBlobDataContributor)
    principalId:      dataFactoryPrincipalId
    principalType:    'ServicePrincipal'
  }
}

// ADF MI → Key Vault Secrets User on the Key Vault
resource raAdfKv 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: kv
  name: guid(kv.id, dataFactoryPrincipalId, roleIdKeyVaultSecretsUser)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleIdKeyVaultSecretsUser)
    principalId:      dataFactoryPrincipalId
    principalType:    'ServicePrincipal'
  }
}
