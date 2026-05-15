<#
.SYNOPSIS
Scaffold a new feature inside an existing project + agent.

.DESCRIPTION
Per design/05-project-layout.md, the per-feature folder shape depends on the agent's
docScope keys (declared in agents.yaml; locked by ADR-0006):

  Domain-scoped agents (CE / Integration / Reporting - docScope.fdd = 'domain'):
    projects/{Project}/{Agent}/
      fdd.md, tdd.md, blueprint.md       <-- shared across features at agent root
      features/{Feature}/
        .workflow.json                    <-- this script writes
        spec.md, plan.md, test-plan/      <-- created by /spec, /plan, /test-plan
        reviews/, tasks/, output/

  Feature-scoped agents (F&O - docScope.fdd = 'feature'):
    projects/{Project}/{Agent}/features/{Feature}/
      .workflow.json                      <-- this script writes
      spec.md, plan.md, fdd.md, tdd.md, blueprint.md,
      test-plan/, reviews/, tasks/, output/

The initial .workflow.json starts in phase=DEFINE, currentStates=[SPEC_DRAFT], all
gates PENDING. The agent's slash commands move it forward from there.

.PARAMETER Project
Project slug. Must already exist (created via New-Project.ps1).

.PARAMETER Agent
Agent slug. Must be in agents.yaml AND in the project's agents-enabled list.

.PARAMETER Feature
Feature slug. Lowercase letters, digits, hyphens.

.PARAMETER Force
Overwrite an existing feature folder.

.EXAMPLE
.\tools\scaffold\New-Feature.ps1 -Project acme-d365 -Agent d365-ce -Feature case-management
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Project,
    [Parameter(Mandatory=$true)][string]$Agent,
    [Parameter(Mandatory=$true)][string]$Feature,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Read-AgentsYaml.ps1')

# Validate slug patterns (same as project-config.v1 + workflow-state.v1).
if ($Project -notmatch '^[a-z0-9][a-z0-9-]*$') {
    throw "Invalid -Project '$Project'. Must match ^[a-z0-9][a-z0-9-]*$."
}
if ($Feature -notmatch '^[a-z0-9][a-z0-9-]*$') {
    throw "Invalid -Feature '$Feature'. Must match ^[a-z0-9][a-z0-9-]*$."
}

$repoRoot = Find-RepoRoot -StartDir $PSScriptRoot
Write-Host "Repo root: $repoRoot"

# Validate Agent exists in registry
$registry = Read-AgentsYaml -RepoRoot $repoRoot
$agentInfo = Get-AgentByName -Agents $registry -Name $Agent
if ($null -eq $agentInfo) {
    $known = ($registry | ForEach-Object { $_.Name }) -join ', '
    throw "Agent '$Agent' is not in agents.yaml. Known agents: $known"
}

# Aggregators + alm + brownfield don't take per-feature scaffolding via this script.
# (Brownfield organises per-artefact under _brownfield/; aggregators output to _aggregator/.)
$nonFeatureAgents = @('solution-estimate','solution-architect','brownfield','alm')
if ($nonFeatureAgents -contains $Agent) {
    throw "Agent '$Agent' does not use per-feature scaffolding. " +
          "Aggregators and brownfield write to _aggregator/ and _brownfield/ directly; " +
          "alm operates on work-items.yaml. Use a different agent."
}

# Validate project exists
$projectDir = Join-Path $repoRoot "projects/$Project"
if (-not (Test-Path $projectDir)) {
    throw "Project folder not found: $projectDir. Run New-Project.ps1 first."
}

# Validate project has the agent enabled in project.config.yaml (cheap text check).
$cfgPath = Join-Path $projectDir 'project.config.yaml'
if (Test-Path $cfgPath) {
    $cfg = Get-Content $cfgPath -Raw
    if ($cfg -notmatch "(?m)^\s+-\s+$([regex]::Escape($Agent))\s*$") {
        Write-Warning "Agent '$Agent' is not listed under agents-enabled in $cfgPath. Proceeding anyway."
    }
} else {
    Write-Warning "$cfgPath not found; cannot verify agents-enabled membership."
}

# Compute feature directory. Same path for both docScopes - the difference is what
# ends up at the agent ROOT (FDD/TDD/blueprint) vs inside the feature folder.
$featureDir = Join-Path $projectDir "$Agent/features/$Feature"

if (Test-Path $featureDir) {
    if (-not $Force) {
        throw "Feature folder already exists at $featureDir. Use -Force to overwrite."
    }
    Write-Host "Removing existing $featureDir (Force)" -ForegroundColor Yellow
    Remove-Item -Recurse -Force $featureDir
}

New-Item -ItemType Directory -Path $featureDir -Force | Out-Null
Write-Host "Created: $featureDir"

# Create the common subfolders that every feature gets (regardless of docScope).
$subfolders = @('test-plan','test-plan/suites','reviews','tasks','output','templates-override','constitution-override')
foreach ($sub in $subfolders) {
    $subPath = Join-Path $featureDir $sub
    New-Item -ItemType Directory -Path $subPath -Force | Out-Null
    New-Item -ItemType File -Path (Join-Path $subPath '.keep') -Force | Out-Null
}

# Write initial .workflow.json - schema: workflow-state.v1
# phase=DEFINE, currentStates=[SPEC_DRAFT], all hard-gates PENDING.
$workflowState = [ordered]@{
    schemaVersion = '1.0'
    project = $Project
    agent = $Agent
    feature = $Feature
    phase = 'DEFINE'
    currentStates = @('SPEC_DRAFT')
    gates = [ordered]@{
        SPEC_APPROVED = [ordered]@{ status = 'PENDING' }
        PLAN_CLARIFIED = [ordered]@{ status = 'PENDING' }
        TASK_VALIDATED = [ordered]@{ status = 'PENDING' }
    }
    dependencies = @()
    history = @(
        [ordered]@{
            command = 'scaffold/New-Feature.ps1'
            ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            result = 'ok'
            notes = "Feature scaffolded by New-Feature.ps1"
        }
    )
}

$workflowJsonPath = Join-Path $featureDir '.workflow.json'
$workflowState | ConvertTo-Json -Depth 10 | Set-Content -Path $workflowJsonPath -Encoding UTF8
Write-Host "Wrote: $workflowJsonPath"

# Validate generated .workflow.json against schema
$validatorScript = Join-Path $repoRoot 'tools/scaffold/lib/Validate-Config.cjs'
if (Test-Path $validatorScript) {
    $validateResult = & node $validatorScript $workflowJsonPath 'workflow-state.v1.json' 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Validation failed for $workflowJsonPath`:`n$validateResult"
    } else {
        Write-Host "Validated $workflowJsonPath against workflow-state.v1.json" -ForegroundColor Green
    }
} else {
    Write-Verbose "Validator script not found; skipping schema check"
}

# Report what the agent's docScope means for this feature.
$docScopeFdd = $agentInfo.DocScopeFdd
$docScopeTdd = $agentInfo.DocScopeTdd
$docScopeBlueprint = $agentInfo.DocScopeBlueprint
$scopeSummary = "fdd=$docScopeFdd, tdd=$docScopeTdd, blueprint=$docScopeBlueprint"

Write-Host ""
Write-Host "Feature '$Feature' scaffolded under '$Agent' in project '$Project'." -ForegroundColor Green
Write-Host "Agent docScope: $scopeSummary"
if ($docScopeFdd -eq 'domain' -or $docScopeTdd -eq 'domain' -or $docScopeBlueprint -eq 'domain') {
    Write-Host ""
    Write-Host "Note (domain-scoped doc(s)):" -ForegroundColor Cyan
    Write-Host "  /fdd, /tdd, /blueprint will write to the agent root (projects/$Project/$Agent/) "
    Write-Host "  and tag this feature's sections+rows with <!-- feature-id: $Feature --> markers."
}
if ($docScopeFdd -eq 'feature' -or $docScopeTdd -eq 'feature' -or $docScopeBlueprint -eq 'feature') {
    Write-Host ""
    Write-Host "Note (feature-scoped doc(s)):" -ForegroundColor Cyan
    Write-Host "  /fdd, /tdd, /blueprint will write inside this feature folder ($featureDir)."
}
Write-Host ""
Write-Host "Next: open the agent in Claude/GHCP and run /spec --feature $Feature"
