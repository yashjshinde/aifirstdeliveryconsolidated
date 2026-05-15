<#
.SYNOPSIS
Seed a new agent under agents/{Name}/ using the starter content in constitution/_reference/
and templates/_reference/.

.DESCRIPTION
Per design/02-agent-skeleton.md and ADR-0010, every agent owns its own constitution and
templates outright. The repo-root _reference/ folders hold scaffolding-only starter content
(consumed only by this script, never at runtime).

This script:
  1. Validates -Name and -DocScope-* parameters
  2. Creates agents/{Name}/ with the full skeleton (constitution/, templates/, .claude/commands/, README.md)
  3. Copies each _reference/*.example file to its agent home, stripping ".example" and
     replacing {agent-slug} placeholders
  4. Generates a starter README.md per the What/How/Details contract (design/14-readme-conventions.md)
  5. Generates one stub command file per base command (when -BaseCommands is set)
  6. Appends a new entry to root agents.yaml (writes back; preserves the existing file shape)

.PARAMETER Name
Agent slug. Lowercase letters, digits, hyphens. Must NOT already exist in agents/.

.PARAMETER Description
One-paragraph description.

.PARAMETER Maturity
Hint for the registry: 'fat' / 'autonomous' / 'merged' / 'standard' / 'aggregator' / 'standalone' / 'workflow'.

.PARAMETER BaseCommands
Whether the agent gets the base 17 commands. Default $true.

.PARAMETER ExtraCommands
Comma-separated list of additional commands (e.g., 'lcs-deploy,dmf-package' for F&O).

.PARAMETER DocScopeFdd
'domain' / 'feature' / empty. Required when -BaseCommands is $true.

.PARAMETER DocScopeTdd
Same. Default: same as -DocScopeFdd.

.PARAMETER DocScopeBlueprint
Same. Default: same as -DocScopeFdd.

.PARAMETER SkipRegistryUpdate
Skip writing the new agent into agents.yaml. Use when bootstrapping for a dry-run.

.EXAMPLE
.\tools\scaffold\New-Agent.ps1 -Name 'd365-bc' -Description 'Business Central agent' -Maturity 'standard' -DocScopeFdd 'feature'
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Name,
    [string]$Description = "",
    [ValidateSet('fat','autonomous','merged','standard','aggregator','standalone','workflow')][string]$Maturity = 'standard',
    [bool]$BaseCommands = $true,
    [string]$ExtraCommands = "",
    [ValidateSet('domain','feature','')][string]$DocScopeFdd = 'domain',
    [string]$DocScopeTdd = "",
    [string]$DocScopeBlueprint = "",
    [switch]$SkipRegistryUpdate,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Read-AgentsYaml.ps1')

if ($Name -notmatch '^[a-z0-9][a-z0-9-]*$') {
    throw "Invalid -Name '$Name'. Must match ^[a-z0-9][a-z0-9-]*$."
}

$repoRoot = Find-RepoRoot -StartDir $PSScriptRoot
Write-Host "Repo root: $repoRoot"

# Default tdd/blueprint to match fdd if not explicitly passed.
if (-not $DocScopeTdd) { $DocScopeTdd = $DocScopeFdd }
if (-not $DocScopeBlueprint) { $DocScopeBlueprint = $DocScopeFdd }

# Validate docScope values match the allowed set (if not empty)
foreach ($scope in @($DocScopeTdd, $DocScopeBlueprint)) {
    if ($scope -and $scope -notin @('domain','feature','')) {
        throw "Invalid docScope value '$scope'. Allowed: domain, feature, or empty."
    }
}

# Check the agent doesn't already exist in agents/ folder.
$agentDir = Join-Path $repoRoot "agents/$Name"
if (Test-Path $agentDir) {
    if (-not $Force) {
        throw "Agent folder already exists at $agentDir. Use -Force to overwrite."
    }
    Write-Host "Removing existing $agentDir (Force)" -ForegroundColor Yellow
    Remove-Item -Recurse -Force $agentDir
}

# Check registry - refuse to add a duplicate name unless -Force
if (-not $SkipRegistryUpdate) {
    $registry = Read-AgentsYaml -RepoRoot $repoRoot
    $existing = Get-AgentByName -Agents $registry -Name $Name
    if ($existing -and -not $Force) {
        throw "Agent '$Name' is already registered in agents.yaml. Use -Force or -SkipRegistryUpdate."
    }
}

# Create folder structure (see design/02-agent-skeleton.md section Full structure)
$dirsToCreate = @(
    "$agentDir/.claude/commands",
    "$agentDir/constitution",
    "$agentDir/templates/checklists",
    "$agentDir/templates/test-plan"
)
foreach ($d in $dirsToCreate) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}
Write-Host "Created folder skeleton at $agentDir"

# Copy constitution starters from _reference/
$constRefDir = Join-Path $repoRoot 'constitution/_reference'
if (-not (Test-Path $constRefDir)) {
    throw "$constRefDir not found. Phase 1 must have run."
}

$constFiles = Get-ChildItem -Path $constRefDir -Filter '*.md.example' | Sort-Object Name
foreach ($src in $constFiles) {
    $destName = $src.Name -replace '\.example$', ''
    $destPath = Join-Path $agentDir "constitution/$destName"
    $content = Get-Content $src.FullName -Raw
    # Replace placeholders
    $content = $content -replace '\{agent-slug\}', $Name
    $content = $content -replace '\{Agent Name\}', $Name
    $content = $content -replace 'YYYY-MM-DD', (Get-Date).ToString('yyyy-MM-dd')
    Set-Content -Path $destPath -Value $content -Encoding UTF8
    Write-Host "  constitution/$destName"
}

# Copy template starters from _reference/
$tmplRefDir = Join-Path $repoRoot 'templates/_reference'
if (-not (Test-Path $tmplRefDir)) {
    throw "$tmplRefDir not found. Phase 1 must have run."
}
$tmplFiles = Get-ChildItem -Path $tmplRefDir -Filter '*.example' | Sort-Object Name
foreach ($src in $tmplFiles) {
    $destName = $src.Name -replace '\.example$', ''
    # Special-case the test-plan-* files into the test-plan/ subfolder.
    if ($destName -like 'test-plan-*') {
        $destName = $destName -replace 'test-plan-', 'test-plan/'
    }
    $destPath = Join-Path $agentDir "templates/$destName"
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    $content = Get-Content $src.FullName -Raw
    $content = $content -replace '\{agent-slug\}', $Name
    $content = $content -replace 'YYYY-MM-DD', (Get-Date).ToString('yyyy-MM-dd')
    Set-Content -Path $destPath -Value $content -Encoding UTF8
    Write-Host "  templates/$destName"
}

# Stub the six review checklists (per ADR-0001 consumption rules)
$checklists = @('spec-review','plan-review','fdd-review','tdd-review','blueprint-review','test-plan-review')
foreach ($cl in $checklists) {
    $clPath = Join-Path $agentDir "templates/checklists/$cl.checklist.md"
    $clBody = @"
<!-- $cl.checklist.md - review checklist for the $Name agent. -->
<!-- Consumption (ADR-0001):
       spec-review.checklist.md         -> /review
       plan-review.checklist.md         -> /clarify
       fdd/tdd/blueprint/test-plan      -> inline self-check by /fdd, /tdd, /blueprint, /test-plan
-->

# $($cl -replace '-', ' ' | ForEach-Object { $_.ToString().Substring(0,1).ToUpper() + $_.ToString().Substring(1) }) Checklist

> Authored 2026-05-14 by New-Agent.ps1 - replace with platform-specific categories before use.

## Categories

- [ ] Completeness - every required section present
- [ ] Correctness - content matches the upstream spec / plan
- [ ] Traceability - IDs cross-reference correctly
- [ ] Platform conventions - naming, prefixes, doc-rules per constitution
- [ ] Open Questions - none unresolved without explicit acceptance

## Severity legend

- BLOCKER - must fix before approval
- REQUIRED - must fix or accept with rationale
- WARNING - author judgement; document the decision
"@
    Set-Content -Path $clPath -Value $clBody -Encoding UTF8
}
Write-Host "  templates/checklists/ (6 starter checklists)"

# Generate base command stubs (when BaseCommands is true).
if ($BaseCommands) {
    $baseCmds = @(
        @{name='spec';        purpose="Author the spec; produces spec.md"},
        @{name='review';      purpose="Spec-only gating command - produces reviews/spec-review.md and gates SPEC_APPROVED (ADR-0001)"},
        @{name='split';       purpose="Emit handoffs for mixed-domain specs"},
        @{name='impact';      purpose="Brownfield + cross-feature impact analysis"},
        @{name='fdd';         purpose="Generate FDD; inline self-check against fdd-review.checklist.md (ADR-0001)"},
        @{name='test-plan';   purpose="Generate test-plan/ folder; inline self-check"},
        @{name='plan';        purpose="Produce work breakdown by L1-L4"},
        @{name='clarify';     purpose="Plan-approval gate - consumes plan-review.checklist.md (ADR-0001)"},
        @{name='tdd';         purpose="Technical design; inline self-check"},
        @{name='blueprint';   purpose="Architecture blueprint; inline self-check"},
        @{name='task';        purpose="Detail L4 work items"},
        @{name='validate';    purpose="Task validation gate"},
        @{name='implement';   purpose="Drive implementation"},
        @{name='document';    purpose="Update docs from implementation"},
        @{name='alm-extract'; purpose="Emit handoff for the ALM agent"},
        @{name='next';        purpose="Read .workflow.json, suggest next command"},
        @{name='status';      purpose="Show phase / gate matrix / dependencies / recent history"}
    )
    foreach ($cmd in $baseCmds) {
        $cmdPath = Join-Path $agentDir ".claude/commands/$($cmd.name).md"
        $body = @"
---
description: $($cmd.purpose)
agent: $Name
---

# /$($cmd.name)

> Stub generated by New-Agent.ps1 on $(Get-Date -Format 'yyyy-MM-dd'). Replace with the actual command body before use.

## Behavior

$($cmd.purpose)

## Inputs

(arguments expected, frontmatter consumed, files read)

## Outputs

(files written, .workflow.json transitions, MCP calls made)

## See also

- design/04-workflow-gates.md (transitions + gates)
- design/02-agent-skeleton.md (base 17 commands)
- agents/$Name/constitution/ (rules this command must obey)
- agents/$Name/templates/ (templates this command renders)
"@
        Set-Content -Path $cmdPath -Value $body -Encoding UTF8
    }
    Write-Host "  .claude/commands/ (17 base command stubs)"
}

# Generate extra command stubs
$extras = @()
if ($ExtraCommands) {
    $extras = $ExtraCommands -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    foreach ($name in $extras) {
        $cmdPath = Join-Path $agentDir ".claude/commands/$name.md"
        $body = @"
---
description: Agent-specific extra command (stub)
agent: $Name
---

# /$name

> Stub generated by New-Agent.ps1 on $(Get-Date -Format 'yyyy-MM-dd'). Authoring TBD.
"@
        Set-Content -Path $cmdPath -Value $body -Encoding UTF8
    }
    Write-Host "  .claude/commands/ (extras: $($extras -join ', '))"
}

# Generate README.md per design/14-readme-conventions.md
$readmePath = Join-Path $agentDir 'README.md'
$readmeBody = @"
# $Name

> $Description

## What

(One paragraph describing the agent's scope: artifact types it owns + boundaries with adjacent agents. Edit before first use.)

## How

- **New feature**: ``/spec --feature <slug> --source fresh`` -> ``/review --approve`` -> ``/plan`` -> ``/clarify --approve`` -> ``/task`` -> ``/validate --approve`` -> ``/implement`` -> ``/document`` -> ``/alm-extract``

## Details

- Constitution: [constitution/00-charter.md](constitution/00-charter.md), [constitution/01-doc-rules.md](constitution/01-doc-rules.md), and sibling files
- Templates: [templates/](templates/)
- Commands: [.claude/commands/](.claude/commands/)
- Design doc: ``design/agents/$Name.md`` (author when stable)
- Related ADRs: ADR-0001 (review scope), ADR-0006 (docScope: fdd=$DocScopeFdd / tdd=$DocScopeTdd / blueprint=$DocScopeBlueprint), ADR-0010 (agent-owned constitution + templates)
"@
Set-Content -Path $readmePath -Value $readmeBody -Encoding UTF8
Write-Host "  README.md"

# Append to agents.yaml (unless skipped)
if (-not $SkipRegistryUpdate) {
    $agentsYamlPath = Join-Path $repoRoot 'agents.yaml'
    $existingContent = Get-Content $agentsYamlPath -Raw

    # If the agent is already in the file (Force case), strip its block first.
    # Simple approach: only append. Document the limitation.
    if ($existingContent -match "(?m)^\s+-\s*name:\s*$([regex]::Escape($Name))\s*$") {
        Write-Warning "Agent '$Name' already in agents.yaml - leaving the existing block intact (manual cleanup if -Force was used)."
    } else {
        $newBlock = @()
        $newBlock += ""
        $newBlock += "  - name: $Name"
        $newBlock += "    version: 1.0.0"
        $newBlock += "    maturity: $Maturity"
        $newBlock += "    base-commands: $($BaseCommands.ToString().ToLower())"
        if ($extras.Count -gt 0) {
            $newBlock += "    extra-commands: [$($extras -join ', ')]"
        } else {
            $newBlock += "    extra-commands: []"
        }
        if ($BaseCommands) {
            $newBlock += "    docScope:"
            $newBlock += "      fdd: $DocScopeFdd"
            $newBlock += "      tdd: $DocScopeTdd"
            $newBlock += "      blueprint: $DocScopeBlueprint"
        } else {
            $newBlock += "    docScope: {}"
        }
        if ($Description) {
            $newBlock += "    description: ""$Description"""
        }
        $appendText = ($newBlock -join "`n") + "`n"
        Add-Content -Path $agentsYamlPath -Value $appendText -Encoding UTF8
        Write-Host "Appended agent '$Name' to agents.yaml" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Agent '$Name' scaffolded at $agentDir" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Edit constitution/*.md to replace starter content with platform specifics"
Write-Host "  2. Edit templates/*.template.md to add platform-shaped sections"
Write-Host "  3. Replace .claude/commands/*.md stubs with the actual command bodies"
Write-Host "  4. Write README.md What/How/Details (per design/14-readme-conventions.md)"
Write-Host "  5. Author design/agents/$Name.md when the agent stabilises"
