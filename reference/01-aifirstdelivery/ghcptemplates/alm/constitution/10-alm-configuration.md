# ALM Configuration

> **Project-wide settings** (ADO org URL, project, area path, iteration path, work item type names,
> field mapping, priority mapping, status mapping) are defined once in `../../alm-configuration.md`.
> Read that file first. Configure only the ALM-agent-specific settings below.
> If `../../alm-configuration.md` does not exist, set `ado-org-url`, `ado-project`, `area-path`,
> and `iteration-path` here as a fallback.

---

## Test Plan Defaults

```
test-plan-naming:  {feature-name} — Test Plan
```

## Wiki

```
# wiki-id: find via https://dev.azure.com/{org}/{project}/_apis/wiki/wikis?api-version=7.1
wiki-id:        YOUR-PROJECT.wiki
wiki-root:      /Delivery
```

### Document sync toggles (true = sync enabled)

#### Core delivery documents
```
sync-spec:             true
sync-fdd:              true
sync-tdd:              true
sync-blueprint:        true
sync-testplan:         true
sync-plan:             false
```

#### Review and validation documents
```
sync-review:           true
sync-clarify:          true
sync-fdd-review:       true
sync-tdd-review:       true
```

#### Operational documents
```
sync-deployment-guide: true
sync-release-notes:    true
sync-runbook:          true
```

#### Domain-specific documents (opt-in per project)
```
# Data Migration
sync-mapping:          false
sync-pipeline-design:  false

# Integration
sync-api-contract:     false
sync-message-schema:   false

# Power Apps
sync-app-design:       false

# Reporting
sync-data-dictionary:  false
sync-asset-registry:   false

# D365 F&O
sync-object-register:  false
sync-test-evidence:    false

# Solution Architect
sync-solution-blueprint: false
sync-solution-review:    false

# Solution Estimate
sync-rom-estimate:       false
sync-estimate-build:     false
```

## Domain Paths

Paths to domain agent roots, relative to this constitution folder:

```
d365-ce:            ../../templates/d365-ce
integration:        ../../templates/integration
power-apps:         ../../templates/power-apps
d365-fo:            ../../templates/d365-fo
solution-estimate:  ../../templates/solution-estimate
data-migration:     ../../templates/data-migration
reporting:          ../../templates/reporting
solution-architect: ../../templates/solution-architect
```
