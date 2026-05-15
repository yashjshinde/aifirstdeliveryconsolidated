<#
.SYNOPSIS
File-watcher mode for the publish pipeline. Re-runs Jobs 1-7 incrementally as authored sources change.

.DESCRIPTION
Per ADR-0011, Watch mode is the developer-loop companion to Publish-Agents.ps1. It runs the
pipeline once at startup, then watches the SOURCE inputs:

  - agents.yaml                            (registry change -> full re-run)
  - workflow.yaml                          (mirror to all agents)
  - schemas/*.json                         (mirror to all agents)
  - agents/*/.claude/commands/*.md         (render that agent's surfaces)
  - agents/*/constitution/*                (no derivative; just trigger drift check)
  - agents/*/templates/**                  (no derivative; just trigger drift check)
  - tools/sync/*.template.*                (re-render everything)

Drift check (Job 8) is intentionally NOT run in watch mode - it lives in CI per
.github/workflows/check-publish-drift.yml.

.PARAMETER DebounceMs
Milliseconds to wait after a file event before re-running. Default 500.

.PARAMETER Agent
Filter to one agent (same semantics as Publish-Agents.ps1).

.EXAMPLE
.\tools\sync\Watch-Agents.ps1
.\tools\sync\Watch-Agents.ps1 -Agent d365-ce
.\tools\sync\Watch-Agents.ps1 -DebounceMs 1000
#>

[CmdletBinding()]
param(
    [int]$DebounceMs = 500,
    [string]$Agent = $null
)

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot '../scaffold/lib/Read-AgentsYaml.ps1')

$repoRoot = Find-RepoRoot -StartDir $PSScriptRoot
$publishScript = Join-Path $PSScriptRoot 'Publish-Agents.ps1'

if (-not (Test-Path $publishScript)) {
    throw "Publish-Agents.ps1 not found at $publishScript"
}

Write-Host ""
Write-Host "Watch-Agents.ps1 - watching $repoRoot" -ForegroundColor Cyan
if ($Agent) { Write-Host "Filter: agent = $Agent" }
Write-Host "Debounce: ${DebounceMs}ms"
Write-Host ""

# Initial publish so disk state is current.
Write-Host "Initial publish..." -ForegroundColor Yellow
if ($Agent) {
    & $publishScript -Agent $Agent
} else {
    & $publishScript
}

# Set up watchers. We use one FileSystemWatcher per root + filter combination so we get
# events for both modifies and creates of new files (the default just sees content edits).
$watchers = @()

function New-Watcher {
    param([string]$Path, [string]$Filter = '*.*', [bool]$IncludeSubdirs = $true)
    if (-not (Test-Path $Path)) {
        Write-Host "  (skip: $Path does not exist yet)" -ForegroundColor DarkGray
        return $null
    }
    $w = New-Object System.IO.FileSystemWatcher
    $w.Path = (Resolve-Path $Path).Path
    $w.Filter = $Filter
    $w.IncludeSubdirectories = $IncludeSubdirs
    $w.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor `
                      [System.IO.NotifyFilters]::LastWrite -bor `
                      [System.IO.NotifyFilters]::Size
    $w.EnableRaisingEvents = $true
    return $w
}

Write-Host ""
Write-Host "Registering watchers:" -ForegroundColor Yellow
$watchers += New-Watcher (Join-Path $repoRoot 'agents.yaml') 'agents.yaml' $false
$watchers += New-Watcher (Join-Path $repoRoot 'workflow.yaml') 'workflow.yaml' $false
$watchers += New-Watcher (Join-Path $repoRoot 'schemas') '*.json' $false
$watchers += New-Watcher (Join-Path $repoRoot 'tools/sync') '*.template.*' $false
if (Test-Path (Join-Path $repoRoot 'agents')) {
    $watchers += New-Watcher (Join-Path $repoRoot 'agents') '*.md' $true
}
$watchers = $watchers | Where-Object { $_ -ne $null }

foreach ($w in $watchers) {
    Write-Host "  watching: $($w.Path) (filter=$($w.Filter), recursive=$($w.IncludeSubdirectories))"
}

Write-Host ""
Write-Host "Watching for changes. Ctrl+C to stop." -ForegroundColor Cyan
Write-Host ""

# Debounce: track last-event time; re-run only if no new events for $DebounceMs.
$script:LastEventTime = $null
$script:PendingRun = $false

$action = {
    $script:LastEventTime = Get-Date
    $script:PendingRun = $true
}

foreach ($w in $watchers) {
    Register-ObjectEvent -InputObject $w -EventName Changed -Action $action | Out-Null
    Register-ObjectEvent -InputObject $w -EventName Created -Action $action | Out-Null
    Register-ObjectEvent -InputObject $w -EventName Deleted -Action $action | Out-Null
    Register-ObjectEvent -InputObject $w -EventName Renamed -Action $action | Out-Null
}

try {
    while ($true) {
        Start-Sleep -Milliseconds 200
        if ($script:PendingRun -and $script:LastEventTime) {
            $sinceLast = (Get-Date) - $script:LastEventTime
            if ($sinceLast.TotalMilliseconds -ge $DebounceMs) {
                $script:PendingRun = $false
                Write-Host ""
                Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] change detected; re-running publish..." -ForegroundColor Cyan
                try {
                    if ($Agent) {
                        & $publishScript -Agent $Agent -Quiet
                    } else {
                        & $publishScript -Quiet
                    }
                } catch {
                    Write-Host "  publish failed: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    }
} finally {
    Get-EventSubscriber | Unregister-Event
    foreach ($w in $watchers) {
        $w.EnableRaisingEvents = $false
        $w.Dispose()
    }
}
