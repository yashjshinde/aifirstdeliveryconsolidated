// ADLS Gen2 storage account + the integration container with its directory tree.

@description('Azure region.')
param location string

@description('Storage account name — must be globally unique, lowercase, ≤ 24 chars.')
param storageAccountName string

@description('Container name that hosts /raw, /staged, /final, /masters, /errors, /audit, /config, /staged-out, /final-out.')
param containerName string

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: { name: 'Standard_RAGRS' }
  properties: {
    isHnsEnabled: true                  // Hierarchical namespace = ADLS Gen2
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        blob: { enabled: true, keyType: 'Account' }
        file: { enabled: true, keyType: 'Account' }
      }
      keySource: 'Microsoft.Storage'
    }
    networkAcls: {
      defaultAction: 'Allow'            // Tighten to 'Deny' + ip rules in prod
      bypass: 'AzureServices'
    }
  }
  tags: {
    project:      'opex-integration'
    component:    'storage'
  }
}

resource blobServices 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  name: 'default'
  parent: storage
  properties: {
    deleteRetentionPolicy: { enabled: true, days: 14 }
    containerDeleteRetentionPolicy: { enabled: true, days: 14 }
    isVersioningEnabled: false
  }
}

resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: containerName
  parent: blobServices
  properties: {
    publicAccess: 'None'
    metadata: {
      project: 'opex-integration'
    }
  }
}

output storageAccountName string = storage.name
output adlsUrl            string = 'https://${storage.name}.dfs.core.windows.net'
output blobUrl            string = 'https://${storage.name}.blob.core.windows.net'
