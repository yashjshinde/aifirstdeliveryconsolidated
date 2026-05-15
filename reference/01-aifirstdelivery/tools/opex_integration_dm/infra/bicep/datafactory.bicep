// Azure Data Factory v2 with system-assigned managed identity.
// The MI gets RBAC grants in roleassignments.bicep so it can read KV secrets
// and read/write ADLS.

@description('Azure region.')
param location string

@description('Data Factory name. Must be globally unique within the region.')
param dataFactoryName string

resource adf 'Microsoft.DataFactory/factories@2018-06-01' = {
  name: dataFactoryName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    publicNetworkAccess: 'Enabled'      // Tighten in prod via managed VNet + private endpoints
  }
  tags: {
    project:   'opex-integration'
    component: 'datafactory'
  }
}

output dataFactoryName string = adf.name
output dataFactoryId   string = adf.id
output principalId     string = adf.identity.principalId
