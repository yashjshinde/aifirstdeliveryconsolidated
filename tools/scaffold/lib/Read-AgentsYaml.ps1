<#
.SYNOPSIS
Minimal YAML reader for agents.yaml - extracts the agent registry without external dependencies.

.DESCRIPTION
agents.yaml has a known, narrow shape (see schemas/agents-registry.* + design/01-repo-structure.md
section agents.yaml). This script avoids the powershell-yaml module dependency by parsing the file
with a small state machine that handles only the shape this project uses.

Returns an array of PSCustomObjects, one per agent, with fields:
  - Name, Version, Maturity, BaseCommands (bool), ExtraCommands (string[]),
    DocScopeFdd, DocScopeTdd, DocScopeBlueprint (each: "domain" / "feature" / $null)

Dot-source this file:
  . (Join-Path $PSScriptRoot 'Read-AgentsYaml.ps1')
  $agents = Read-AgentsYaml -RepoRoot $repoRoot
#>

function Read-AgentsYaml {
    param(
        [Parameter(Mandatory=$true)][string]$RepoRoot
    )

    $path = Join-Path $RepoRoot 'agents.yaml'
    if (-not (Test-Path $path)) {
        throw "agents.yaml not found at $path"
    }

    $lines = Get-Content $path

    $agents = @()
    $current = $null
    $inAgentsList = $false
    $inExtraCommands = $false
    $inDocScope = $false
    $extraCommandsBuffer = @()

    function Save-Current {
        param($cur, [ref]$list)
        if ($null -ne $cur) {
            $list.Value += $cur
        }
    }

    foreach ($line in $lines) {
        # Skip blank lines and pure-comment lines
        if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }

        # Detect entering the agents: list
        if ($line -match '^agents:\s*$') {
            $inAgentsList = $true
            continue
        }

        if (-not $inAgentsList) { continue }

        # New agent entry: "  - name: <slug>"
        if ($line -match '^\s*-\s*name:\s*(.+)\s*$') {
            Save-Current $current ([ref]$agents)
            $current = [PSCustomObject]@{
                Name              = $Matches[1].Trim()
                Version           = $null
                Maturity          = $null
                BaseCommands      = $false
                ExtraCommands     = @()
                DocScopeFdd       = $null
                DocScopeTdd       = $null
                DocScopeBlueprint = $null
                Description       = $null
            }
            $inExtraCommands = $false
            $inDocScope = $false
            continue
        }

        if ($null -eq $current) { continue }

        # Inline extra-commands list "  extra-commands: [a, b, c]"
        if ($line -match '^\s+extra-commands:\s*\[(.*)\]\s*$') {
            $body = $Matches[1].Trim()
            if ($body -eq '') {
                $current.ExtraCommands = @()
            } else {
                $current.ExtraCommands = $body -split ',' | ForEach-Object { $_.Trim() }
            }
            $inExtraCommands = $false
            continue
        }

        # Inline docScope object "  docScope: {}"
        if ($line -match '^\s+docScope:\s*\{\s*\}\s*$') {
            $inDocScope = $false
            continue
        }

        # Multi-line docScope start "  docScope:"
        if ($line -match '^\s+docScope:\s*$') {
            $inDocScope = $true
            continue
        }

        # docScope children "    fdd: domain"
        if ($inDocScope) {
            if ($line -match '^\s{4,}fdd:\s*(.+)\s*$') { $current.DocScopeFdd = $Matches[1].Trim(); continue }
            if ($line -match '^\s{4,}tdd:\s*(.+)\s*$') { $current.DocScopeTdd = $Matches[1].Trim(); continue }
            if ($line -match '^\s{4,}blueprint:\s*(.+)\s*$') { $current.DocScopeBlueprint = $Matches[1].Trim(); continue }
            # Exit docScope when we see a sibling key (back to 2-space indent)
            if ($line -match '^\s{2}\S') {
                $inDocScope = $false
                # Fall through to handle this line as a sibling
            }
        }

        # Sibling agent fields (2-space indented)
        if ($line -match '^\s+version:\s*(.+)\s*$') { $current.Version = $Matches[1].Trim(); continue }
        if ($line -match '^\s+maturity:\s*(.+)\s*$') { $current.Maturity = $Matches[1].Trim(); continue }
        if ($line -match '^\s+base-commands:\s*(true|false)\s*$') {
            $current.BaseCommands = [bool]::Parse($Matches[1])
            continue
        }
        if ($line -match '^\s+description:\s*(.+)\s*$') {
            $desc = $Matches[1].Trim()
            # Strip surrounding quotes if any
            $desc = $desc -replace '^"','' -replace '"$',''
            $current.Description = $desc
            continue
        }
    }

    Save-Current $current ([ref]$agents)

    return ,$agents
}

function Get-AgentByName {
    param(
        [Parameter(Mandatory=$true)][array]$Agents,
        [Parameter(Mandatory=$true)][string]$Name
    )
    return $Agents | Where-Object { $_.Name -eq $Name } | Select-Object -First 1
}

function Find-RepoRoot {
    <#
    .SYNOPSIS
    Walks upward from $StartDir looking for agents.yaml. Returns the directory containing it.
    #>
    param(
        [string]$StartDir = (Get-Location).Path
    )
    $current = Resolve-Path $StartDir
    while ($true) {
        if (Test-Path (Join-Path $current 'agents.yaml')) {
            return $current.ToString()
        }
        $parent = Split-Path $current -Parent
        if (-not $parent -or $parent -eq $current) {
            throw "Could not locate repo root (no agents.yaml found walking up from $StartDir)"
        }
        $current = $parent
    }
}
