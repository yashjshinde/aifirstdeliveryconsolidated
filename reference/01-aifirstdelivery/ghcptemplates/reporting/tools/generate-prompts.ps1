<#
.SYNOPSIS
    Regenerates GHCP prompt files for the Reporting agent from Claude source commands.

.DESCRIPTION
    Thin wrapper around the shared root-level generate-prompts.ps1.
    Claude commands in templates/reporting/.claude/commands/ are the source of truth.

.EXAMPLE
    cd ghcptemplates/reporting
    .\tools\generate-prompts.ps1

.EXAMPLE
    # Or run from the repo root for all agents at once:
    .\tools\generate-prompts.ps1 -AgentName reporting
#>

$repoRoot  = Split-Path -Parent $PSScriptRoot | Split-Path -Parent | Split-Path -Parent
$sharedScript = Join-Path $repoRoot "scripts\generate-prompts.ps1"

if (-not (Test-Path $sharedScript)) {
    Write-Error "Shared script not found at: $sharedScript"
    exit 1
}

& $sharedScript -AgentName "reporting"
