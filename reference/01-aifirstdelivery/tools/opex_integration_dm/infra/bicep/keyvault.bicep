// Azure Key Vault for SFTP credentials, Dataverse SPN secret, ADLS account key, etc.

@description('Azure region.')
param location string

@description('Key Vault name — must be globally unique.')
param keyVaultName string

@description('SKU — standard is fine for v1; premium adds HSM-backed keys (not needed here).')
@allowed(['standard', 'premium'])
param sku string = 'standard'

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: sku }
    enableRbacAuthorization: true       // RBAC instead of legacy access policies
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    enabledForDeployment: false
    enabledForTemplateDeployment: false
    enabledForDiskEncryption: false
    publicNetworkAccess: 'Enabled'      // Tighten in prod via private endpoint
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
  tags: {
    project:   'opex-integration'
    component: 'keyvault'
  }
}

// Placeholder secrets. The actual values are set out-of-band by the operator
// (the deploy script's prompts) so they never appear in source control.
// These resources just declare the secret names so RBAC can be granted to a
// stable list.
resource secretSftpPassword 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'kv-sftp-fusion-password'
  properties: {
    value: 'PLACEHOLDER-set-via-az-keyvault-secret-set'
    contentType: 'text/plain'
    attributes: { enabled: true }
  }
}

resource secretAdlsAccountKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'kv-adls-accountkey'
  properties: {
    value: 'PLACEHOLDER-set-via-az-keyvault-secret-set'
    contentType: 'text/plain'
    attributes: { enabled: true }
  }
}

resource secretDataverseSpn 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'kv-dataverse-spn-secret'
  properties: {
    value: 'PLACEHOLDER-set-via-az-keyvault-secret-set'
    contentType: 'text/plain'
    attributes: { enabled: true }
  }
}

output keyVaultName string = kv.name
output keyVaultUri  string = kv.properties.vaultUri
output keyVaultId   string = kv.id
