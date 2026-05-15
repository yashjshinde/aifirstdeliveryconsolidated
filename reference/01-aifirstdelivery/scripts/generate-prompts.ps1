<#
.SYNOPSIS
    Generates GHCP prompt files from Claude command files for one or all agents.

.DESCRIPTION
    Claude commands under templates/{agent}/.claude/commands/ are the source of truth
    for domain agents. The ALM agent is an exception: its source lives at
    tools/alm-agent/.claude/commands/ (registered via $agentSourceOverride).

    This script transforms each Claude command into a GitHub Copilot prompt file by:
      1. Prepending YAML frontmatter (mode: agent, description)
      2. Replacing bare /command-name with /{prefix}command-name throughout

    Frontmatter descriptions are read from existing GHCP prompt files automatically
    (self-bootstrapping). For new commands with no existing GHCP file, a placeholder
    description is used.

    Run this script whenever any Claude command file is updated.

.PARAMETER AgentName
    Name of the agent to generate prompts for, or "all" to process every agent.
    Defaults to "all".

.EXAMPLE
    cd c:\path\to\aifirstdelivery
    .\scripts\generate-prompts.ps1

.EXAMPLE
    .\scripts\generate-prompts.ps1 -AgentName reporting

.EXAMPLE
    .\scripts\generate-prompts.ps1 -AgentName d365-ce

.EXAMPLE
    .\scripts\generate-prompts.ps1 -AgentName alm
#>

param(
    [string]$AgentName = "all"
)

$ErrorActionPreference = "Stop"

# ---- Agent configuration table -----------------------------------------------
# key        = agent folder name (same in templates/ and ghcptemplates/)
# prefix     = prepended to every command name to form the GHCP prompt filename
#              and the /command replacement in content
$agentConfig = @{
    "reporting"          = "reporting-"
    "d365-ce"            = "d365-ce-"
    "d365-ce-brownfield" = "d365-ce-brownfield-"
    "d365-fo"            = "d365-fo-"
    "data-migration"     = "data-migration-"
    "integration"        = "integration-"
    "power-apps"         = "power-apps-"
    "solution-architect" = "solution-architect-"
    "solution-estimate"  = "solution-estimate-"
    "alm"                = "alm-"
}

# ---- Source path overrides ---------------------------------------------------
# Agents whose Claude commands live outside templates/{name}/.claude/commands/
# Key = agent name, Value = path relative to repo root
$agentSourceOverride = @{
    "alm" = "tools\alm-agent\.claude\commands"
}

# ---- Root of the repo --------------------------------------------------------
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
if (-not (Test-Path (Join-Path $repoRoot "templates"))) {
    # Script may be called from repo root or tools/ — adjust
    $repoRoot = $PSScriptRoot
    if (-not (Test-Path (Join-Path $repoRoot "templates"))) {
        Write-Error "Cannot locate repo root. Run from the repository root or tools/ folder."
        exit 1
    }
}

# ---- Determine which agents to process ---------------------------------------
if ($AgentName -eq "all") {
    $agentsToProcess = $agentConfig.Keys
} else {
    if (-not $agentConfig.ContainsKey($AgentName)) {
        $validAgents = ($agentConfig.Keys | Sort-Object) -join ', '
        Write-Error "Unknown agent '$AgentName'. Valid values: $validAgents, all"
        exit 1
    }
    $agentsToProcess = @($AgentName)
}

# ---- Helper: read frontmatter description from existing GHCP file ------------
function Get-ExistingDescription {
    param([string]$FilePath)
    if (-not (Test-Path $FilePath)) { return $null }
    $lines = [System.IO.File]::ReadAllLines($FilePath, [System.Text.Encoding]::UTF8)
    foreach ($line in $lines) {
        if ($line -match '^description:\s*"(.+)"') {
            return $matches[1]
        }
    }
    return $null
}

# ---- Process each agent ------------------------------------------------------
$totalGenerated = 0
$totalSkipped   = 0

foreach ($agent in $agentsToProcess) {
    $prefix    = $agentConfig[$agent]
    $sourcePath = if ($agentSourceOverride.ContainsKey($agent)) { $agentSourceOverride[$agent] } else { "templates\$agent\.claude\commands" }
    $sourceDir = Join-Path $repoRoot $sourcePath
    $targetDir = Join-Path $repoRoot "ghcptemplates\$agent\.github\prompts"

    if (-not (Test-Path $sourceDir)) {
        Write-Warning "[$agent] Source dir not found: $sourceDir — skipping"
        continue
    }
    if (-not (Test-Path $targetDir)) {
        Write-Warning "[$agent] Target dir not found: $targetDir — skipping"
        continue
    }

    $sourceFiles = Get-ChildItem -Path $sourceDir -Filter "*.md" | Sort-Object Name
    if ($sourceFiles.Count -eq 0) {
        Write-Warning "[$agent] No .md files found in $sourceDir"
        continue
    }

    # Build sorted list of command names (longest first) for safe replacement
    $cmdNames = $sourceFiles | ForEach-Object { $_.BaseName } | Sort-Object { $_.Length } -Descending

    Write-Host ""
    Write-Host "=== $agent (prefix: $prefix) ==="

    $agentGenerated = 0
    $agentSkipped   = 0

    foreach ($src in $sourceFiles) {
        $cmdName    = $src.BaseName
        $targetName = "$prefix$cmdName.prompt.md"
        $targetPath = Join-Path $targetDir $targetName

        # Read description from existing GHCP file, or use placeholder
        $desc = Get-ExistingDescription -FilePath $targetPath
        if (-not $desc) {
            $desc = "[$agent] $cmdName command. Set description here."
            Write-Warning "  NEW   $targetName - no existing description; using placeholder"
        }

        # Read Claude command content
        $body = [System.IO.File]::ReadAllText($src.FullName, [System.Text.Encoding]::UTF8)

        # Replace /command-name -> /{prefix}command-name
        # Negative lookahead (?!\.md) preserves file path references like review.md
        # Longest-first ordering avoids partial matches (e.g., spec-alm before spec)
        foreach ($cmd in $cmdNames) {
            $body = [regex]::Replace(
                $body,
                "(?<![a-z-])/$cmd(?!\.md)(?![a-z-])",
                "/$prefix$cmd"
            )
        }

        # Build GHCP frontmatter + content
        $nl     = [System.Environment]::NewLine
        $header = "---$nl" +
                  "mode: agent$nl" +
                  "description: `"$desc`"$nl" +
                  "---$nl"

        $output = $header + $nl + $body

        [System.IO.File]::WriteAllText($targetPath, $output, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  OK    $($src.Name)  ->  $targetName"
        $agentGenerated++
    }

    Write-Host "  Generated: $agentGenerated   Skipped: $agentSkipped"
    $totalGenerated += $agentGenerated
    $totalSkipped   += $agentSkipped
}

Write-Host ""
Write-Host "============================================"
Write-Host "TOTAL  Generated: $totalGenerated   Skipped: $totalSkipped"
Write-Host "Repo root: $repoRoot"

# ---- Sync template structure files (specs/, plans/, tasks/, doc-templates/) ----
# These files define output structure. GHCP agents need the same files as Claude agents
# so commands that reference _template.md, _template-structured.md, etc. work correctly.
# Agents with a source override (e.g. alm) live outside templates/ and have no template folders.

Write-Host ""
Write-Host "============================================"
Write-Host "Syncing template structure files..."

$syncFolders   = @('specs', 'plans', 'tasks', 'doc-templates')
$totalSynced   = 0
$totalSyncSkip = 0

foreach ($agent in $agentsToProcess) {
    if ($agentSourceOverride.ContainsKey($agent)) { continue }

    $agentSrcDir = Join-Path $repoRoot "templates\$agent"
    $agentDstDir = Join-Path $repoRoot "ghcptemplates\$agent"

    if (-not (Test-Path $agentDstDir)) {
        Write-Warning "[$agent] GHCP folder not found: $agentDstDir - skipping template sync"
        continue
    }

    $agentSynced = 0

    foreach ($folder in $syncFolders) {
        $srcFolder = Join-Path $agentSrcDir $folder
        $dstFolder = Join-Path $agentDstDir $folder

        if (-not (Test-Path $srcFolder)) { continue }

        if (-not (Test-Path $dstFolder)) {
            New-Item -ItemType Directory -Path $dstFolder | Out-Null
        }

        $files = Get-ChildItem -Path $srcFolder -File |
                 Where-Object { ($_.Extension -eq '.md' -or $_.Extension -eq '.yaml') -and $_.Name -ne '.gitkeep' }

        foreach ($file in $files) {
            $dstFile = Join-Path $dstFolder $file.Name
            Copy-Item $file.FullName $dstFile -Force
            Write-Host "  SYNC  $folder/$($file.Name)"
            $agentSynced++
        }
    }

    if ($agentSynced -gt 0) {
        Write-Host "  --- [$agent] $agentSynced file(s) synced"
        $totalSynced += $agentSynced
    } else {
        $totalSyncSkip++
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host "TEMPLATE SYNC  Synced: $totalSynced   Agents with no templates: $totalSyncSkip"
