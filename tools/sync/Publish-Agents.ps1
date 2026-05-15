<#
.SYNOPSIS
Publish pipeline: produce all derivative surfaces from the authored sources.

.DESCRIPTION
Per ADR-0011 (publish-pipeline-8-job-model), this script runs 8 idempotent jobs:

  1. Mirror root assets       (schemas/*.v1.json, workflow.yaml -> agents/{a}/...)
  2. Render per-agent settings.json
  3. Render per-agent plugin.json
  4. Render GHCP standalone   (chatmode + prompts inside each agent folder)
  5. Render Claude root-unified  (.claude/commands/{a}/*.md at repo root)
  6. Render GHCP root-unified (chatmodes + namespaced prompts at repo root)
  7. Render marketplace.json  (.claude-plugin/marketplace.json listing all agents)
  8. Drift check              (recompute, compare to last manifest; fail in -CheckDrift mode)

Authoring inputs (the only files humans edit):
  agents/{a}/.claude/commands/*.md     <- commands (Claude-native; ADR-0003)
  agents/{a}/constitution/*.md         <- agent-owned (ADR-0010)
  agents/{a}/templates/**              <- agent-owned (ADR-0010)
  agents/{a}/README.md                 <- agent-owned
  agents.yaml                          <- root registry
  workflow.yaml                        <- root DAG
  schemas/*.v1.json                    <- root wire contracts
  tools/sync/settings.template.json    <- canonical settings template
  tools/sync/plugin.template.json      <- canonical plugin manifest template
  tools/sync/chatmode.template.md      <- GHCP chatmode wrapper template

.PARAMETER Agent
Filter: process only this agent. Default: all agents in agents.yaml.

.PARAMETER DryRun
Compute what would change but write nothing. Exits 0; reports the count of would-write/would-skip.

.PARAMETER CheckDrift
Run in check mode. Recomputes every generated file's hash, compares to the manifest. Exits 1 on
any drift (hand-edit of a generated file, missing generated file, content mismatch). Used by CI.

.PARAMETER NoMarketplace
Skip Job 7 (marketplace.json). Useful for single-agent runs where the marketplace shouldn't change.

.PARAMETER Quiet
Suppress per-file logging; print only the summary.

.EXAMPLE
.\tools\sync\Publish-Agents.ps1
.\tools\sync\Publish-Agents.ps1 -Agent d365-ce
.\tools\sync\Publish-Agents.ps1 -DryRun
.\tools\sync\Publish-Agents.ps1 -CheckDrift   # CI mode
#>

[CmdletBinding()]
param(
    [string]$Agent = $null,
    [switch]$DryRun,
    [switch]$CheckDrift,
    [switch]$NoMarketplace,
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'

# Re-use the agents.yaml reader from scaffold/.
. (Join-Path $PSScriptRoot '../scaffold/lib/Read-AgentsYaml.ps1')

# ----- Helpers ----------------------------------------------------------------

$script:RepoRoot = Find-RepoRoot -StartDir $PSScriptRoot
$script:WriteCount = 0
$script:SkipCount = 0
$script:DriftCount = 0
$script:Touched = @{}     # path -> sha256 (recomputed for the manifest)

function Write-Info {
    param([string]$Message, [string]$Color = $null)
    if ($Quiet) { return }
    if ($Color) {
        Write-Host $Message -ForegroundColor $Color
    } else {
        Write-Host $Message
    }
}

function Get-Sha256 {
    param([string]$Content)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Content)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = $sha.ComputeHash($bytes)
        return ([System.BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
    } finally {
        $sha.Dispose()
    }
}

function Get-Sha256OfFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = $sha.ComputeHash($bytes)
        return ([System.BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
    } finally {
        $sha.Dispose()
    }
}

# Write a generated file. If -CheckDrift, do not write; instead compare current content
# on disk to the new content; if different, increment DriftCount and log.
# Always records the hash in $script:Touched.
function Write-Generated {
    param(
        [string]$Path,
        [string]$Content,
        [string]$Kind = 'text'   # 'text' for utf-8 no-BOM (json/md); 'binary' uses byte-write only
    )
    # Normalize line endings to LF BEFORE hashing so the hash matches what lands on disk.
    # (PowerShell's here-strings + ConvertTo-Json emit CRLF on Windows; we always write LF.)
    $contentLF = $Content -replace "`r`n", "`n"
    $hash = Get-Sha256 $contentLF
    $script:Touched[$Path] = $hash

    $rel = $Path.Replace($script:RepoRoot, '').TrimStart('\','/')

    if (Test-Path $Path) {
        $existingHash = Get-Sha256OfFile $Path
        if ($existingHash -eq $hash) {
            $script:SkipCount++
            Write-Info "  skip  $rel"
            return
        }
        if ($CheckDrift) {
            $script:DriftCount++
            Write-Info "  DRIFT $rel" -Color Red
            Write-Info "        existing-hash: $existingHash" -Color Red
            Write-Info "        expected-hash: $hash" -Color Red
            return
        }
    } else {
        if ($CheckDrift) {
            $script:DriftCount++
            Write-Info "  MISSING $rel (expected on disk; not present)" -Color Red
            return
        }
    }

    if ($DryRun) {
        Write-Info "  would-write $rel" -Color Cyan
        return
    }

    # Ensure parent directory exists.
    $parent = Split-Path $Path -Parent
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }

    # UTF-8 with no BOM (safe for both JSON.parse and js-yaml). Use the LF-normalized content
    # computed above so the on-disk bytes hash to $hash on the next run.
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $contentLF, $utf8NoBom)
    $script:WriteCount++
    Write-Info "  write $rel"
}

# Mirror a source file byte-for-byte to a destination. Same drift semantics.
function Copy-Mirrored {
    param([string]$SourcePath, [string]$DestPath)
    if (-not (Test-Path $SourcePath)) {
        throw "Cannot mirror non-existent source: $SourcePath"
    }
    $srcBytes = [System.IO.File]::ReadAllBytes($SourcePath)
    $srcHash = Get-Sha256OfFile $SourcePath
    $script:Touched[$DestPath] = $srcHash

    $rel = $DestPath.Replace($script:RepoRoot, '').TrimStart('\','/')

    if (Test-Path $DestPath) {
        $destHash = Get-Sha256OfFile $DestPath
        if ($destHash -eq $srcHash) {
            $script:SkipCount++
            Write-Info "  skip  $rel"
            return
        }
        if ($CheckDrift) {
            $script:DriftCount++
            Write-Info "  DRIFT $rel (mirrored from $(Split-Path $SourcePath -Leaf))" -Color Red
            return
        }
    } else {
        if ($CheckDrift) {
            $script:DriftCount++
            Write-Info "  MISSING $rel (mirror; not present)" -Color Red
            return
        }
    }

    if ($DryRun) {
        Write-Info "  would-mirror $rel" -Color Cyan
        return
    }
    $parent = Split-Path $DestPath -Parent
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    [System.IO.File]::WriteAllBytes($DestPath, $srcBytes)
    $script:WriteCount++
    Write-Info "  mirror $rel"
}

function Read-TextFile {
    param([string]$Path)
    $raw = [System.IO.File]::ReadAllText($Path)
    # Strip UTF-8 BOM if present (some authored files might have one).
    if ($raw.Length -gt 0 -and $raw[0] -eq [char]0xFEFF) {
        $raw = $raw.Substring(1)
    }
    return $raw
}

# ----- Load registry + filter ------------------------------------------------

$registry = Read-AgentsYaml -RepoRoot $script:RepoRoot
if ($Agent) {
    $registry = $registry | Where-Object { $_.Name -eq $Agent }
    if (-not $registry) {
        throw "Agent '$Agent' not found in agents.yaml."
    }
}

$mode = if ($CheckDrift) { 'CheckDrift' } elseif ($DryRun) { 'DryRun' } else { 'Publish' }
Write-Info ""
Write-Info "Publish-Agents.ps1 - mode: $mode" -Color Cyan
Write-Info "Repo root: $script:RepoRoot"
Write-Info "Agents to process: $(($registry | ForEach-Object { $_.Name }) -join ', ')"
Write-Info ""

# ----- Job 1: Mirror root assets ---------------------------------------------

Write-Info "Job 1: Mirror root assets (schemas/, workflow.yaml) -> agents/{a}/" -Color Yellow

$rootWorkflow = Join-Path $script:RepoRoot 'workflow.yaml'
$rootSchemasDir = Join-Path $script:RepoRoot 'schemas'
$schemaFiles = Get-ChildItem -Path $rootSchemasDir -Filter '*.json'

foreach ($a in $registry) {
    $agentRoot = Join-Path $script:RepoRoot "agents/$($a.Name)"
    if (-not (Test-Path $agentRoot)) {
        Write-Info "  agent folder not present yet: $($a.Name) (skip)" -Color DarkGray
        continue
    }
    Copy-Mirrored -SourcePath $rootWorkflow -DestPath (Join-Path $agentRoot 'workflow.yaml')
    foreach ($sf in $schemaFiles) {
        Copy-Mirrored -SourcePath $sf.FullName -DestPath (Join-Path $agentRoot "schemas/$($sf.Name)")
    }
}

# ----- Job 2: Render per-agent settings.json ---------------------------------

Write-Info ""
Write-Info "Job 2: Render per-agent settings.json" -Color Yellow

$settingsTemplate = Read-TextFile (Join-Path $script:RepoRoot 'tools/sync/settings.template.json')

foreach ($a in $registry) {
    $agentRoot = Join-Path $script:RepoRoot "agents/$($a.Name)"
    if (-not (Test-Path $agentRoot)) { continue }

    # Standalone MCP path: relative from agents/{a}/.claude/ -> tools/mcp-server/dist/index.js
    $mcpPath = '../../../tools/mcp-server/dist/index.js'
    $content = $settingsTemplate `
        -replace '\{\{MCP_SERVER_PATH\}\}', $mcpPath `
        -replace '\{\{AGENT_NAME\}\}', $a.Name `
        -replace '\{\{REPO_ROOT_HINT\}\}', '(agent standalone)'
    Write-Generated -Path (Join-Path $agentRoot '.claude/settings.json') -Content $content
}

# Also render the ROOT-UNIFIED settings.json (.claude/settings.json at repo root).
$rootSettings = $settingsTemplate `
    -replace '\{\{MCP_SERVER_PATH\}\}', './tools/mcp-server/dist/index.js' `
    -replace '\{\{AGENT_NAME\}\}', 'root-unified' `
    -replace '\{\{REPO_ROOT_HINT\}\}', '(root unified)'
Write-Generated -Path (Join-Path $script:RepoRoot '.claude/settings.json') -Content $rootSettings

# ----- Job 3: Render per-agent plugin.json -----------------------------------

Write-Info ""
Write-Info "Job 3: Render per-agent plugin.json" -Color Yellow

$pluginTemplate = Read-TextFile (Join-Path $script:RepoRoot 'tools/sync/plugin.template.json')

foreach ($a in $registry) {
    $agentRoot = Join-Path $script:RepoRoot "agents/$($a.Name)"
    if (-not (Test-Path $agentRoot)) { continue }

    $desc = if ($a.Description) { $a.Description } else { "$($a.Name) agent" }
    $maturity = if ($a.Maturity) { $a.Maturity } else { 'standard' }
    $version = if ($a.Version) { $a.Version } else { '0.1.0' }

    $content = $pluginTemplate `
        -replace '\{\{AGENT_NAME\}\}', $a.Name `
        -replace '\{\{AGENT_VERSION\}\}', $version `
        -replace '\{\{AGENT_DESCRIPTION\}\}', $desc `
        -replace '\{\{AGENT_MATURITY\}\}', $maturity
    Write-Generated -Path (Join-Path $agentRoot '.claude-plugin/plugin.json') -Content $content
}

# ----- Job 4: Render GHCP standalone (chatmode + prompts inside agent) -------

Write-Info ""
Write-Info "Job 4: Render GHCP standalone surface" -Color Yellow

$chatmodeTemplate = Read-TextFile (Join-Path $script:RepoRoot 'tools/sync/chatmode.template.md')

foreach ($a in $registry) {
    $agentRoot = Join-Path $script:RepoRoot "agents/$($a.Name)"
    $commandsDir = Join-Path $agentRoot '.claude/commands'
    if (-not (Test-Path $commandsDir)) {
        Write-Info "  no commands authored yet: $($a.Name) (skip)" -Color DarkGray
        continue
    }

    $commandFiles = Get-ChildItem -Path $commandsDir -Filter '*.md' | Sort-Object Name
    if (-not $commandFiles) {
        Write-Info "  $($a.Name): empty commands/ (skip)" -Color DarkGray
        continue
    }

    # Chatmode listing
    $cmdListLines = $commandFiles | ForEach-Object {
        "- ``/$($_.BaseName)``"
    }
    $cmdList = $cmdListLines -join "`n"
    $desc = if ($a.Description) { $a.Description } else { "$($a.Name) agent" }

    $chatmodeContent = $chatmodeTemplate `
        -replace '\{\{AGENT_NAME\}\}', $a.Name `
        -replace '\{\{AGENT_DESCRIPTION\}\}', $desc `
        -replace '\{\{COMMAND_LIST\}\}', $cmdList

    Write-Generated -Path (Join-Path $agentRoot ".github/chatmodes/$($a.Name).chatmode.md") -Content $chatmodeContent

    # Per-command prompt files (standalone: non-namespaced)
    foreach ($cmd in $commandFiles) {
        $promptHeader = "<!-- GENERATED by tools/sync/Publish-Agents.ps1 from agents/$($a.Name)/.claude/commands/$($cmd.Name). DO NOT EDIT. -->`n`n"
        $promptBody = Read-TextFile $cmd.FullName
        $promptContent = $promptHeader + $promptBody
        Write-Generated -Path (Join-Path $agentRoot ".github/prompts/$($cmd.BaseName).prompt.md") -Content $promptContent
    }
}

# ----- Job 5: Render Claude root-unified (.claude/commands/{a}/*.md) --------

Write-Info ""
Write-Info "Job 5: Render Claude root-unified surface" -Color Yellow

foreach ($a in $registry) {
    $agentRoot = Join-Path $script:RepoRoot "agents/$($a.Name)"
    $commandsDir = Join-Path $agentRoot '.claude/commands'
    if (-not (Test-Path $commandsDir)) { continue }

    $commandFiles = Get-ChildItem -Path $commandsDir -Filter '*.md' | Sort-Object Name
    foreach ($cmd in $commandFiles) {
        $header = "<!-- GENERATED by tools/sync/Publish-Agents.ps1 from agents/$($a.Name)/.claude/commands/$($cmd.Name). DO NOT EDIT. Invoked as /$($a.Name):$($cmd.BaseName) -->`n`n"
        $body = Read-TextFile $cmd.FullName
        $content = $header + $body
        Write-Generated -Path (Join-Path $script:RepoRoot ".claude/commands/$($a.Name)/$($cmd.Name)") -Content $content
    }
}

# ----- Job 6: Render GHCP root-unified (.github/chatmodes/ + .github/prompts/) ------

Write-Info ""
Write-Info "Job 6: Render GHCP root-unified surface" -Color Yellow

foreach ($a in $registry) {
    $agentRoot = Join-Path $script:RepoRoot "agents/$($a.Name)"
    $commandsDir = Join-Path $agentRoot '.claude/commands'
    if (-not (Test-Path $commandsDir)) { continue }

    $commandFiles = Get-ChildItem -Path $commandsDir -Filter '*.md' | Sort-Object Name
    if (-not $commandFiles) { continue }

    # Same chatmode body as Job 4 (re-rendered at root with namespaced prompt list).
    $cmdListLines = $commandFiles | ForEach-Object {
        "- ``$($a.Name)-$($_.BaseName)``"
    }
    $cmdList = $cmdListLines -join "`n"
    $desc = if ($a.Description) { $a.Description } else { "$($a.Name) agent" }

    $chatmodeContent = $chatmodeTemplate `
        -replace '\{\{AGENT_NAME\}\}', $a.Name `
        -replace '\{\{AGENT_DESCRIPTION\}\}', $desc `
        -replace '\{\{COMMAND_LIST\}\}', $cmdList

    Write-Generated -Path (Join-Path $script:RepoRoot ".github/chatmodes/$($a.Name).chatmode.md") -Content $chatmodeContent

    foreach ($cmd in $commandFiles) {
        $header = "<!-- GENERATED by tools/sync/Publish-Agents.ps1 from agents/$($a.Name)/.claude/commands/$($cmd.Name). DO NOT EDIT. Invoked in GHCP root-unified as $($a.Name)-$($cmd.BaseName). -->`n`n"
        $body = Read-TextFile $cmd.FullName
        $content = $header + $body
        Write-Generated -Path (Join-Path $script:RepoRoot ".github/prompts/$($a.Name)-$($cmd.BaseName).prompt.md") -Content $content
    }
}

# ----- Job 7: Render marketplace.json ----------------------------------------

if (-not $NoMarketplace) {
    Write-Info ""
    Write-Info "Job 7: Render .claude-plugin/marketplace.json" -Color Yellow

    # We list ALL agents (even ones being processed with -Agent filter), reading every
    # known plugin.json. This way -Agent X doesn't accidentally drop the others from the marketplace.
    $fullRegistry = Read-AgentsYaml -RepoRoot $script:RepoRoot
    $marketplaceObj = [ordered]@{
        '_comment' = 'GENERATED by tools/sync/Publish-Agents.ps1 (Job 7). DO NOT EDIT.'
        name = 'spec-driven-dev'
        description = 'Spec-Driven Development consolidated platform - 8 D365/Power Platform delivery agents.'
        plugins = @()
    }
    foreach ($a in $fullRegistry) {
        $desc = if ($a.Description) { $a.Description } else { "$($a.Name) agent" }
        $maturity = if ($a.Maturity) { $a.Maturity } else { 'standard' }
        $version = if ($a.Version) { $a.Version } else { '0.1.0' }
        $marketplaceObj.plugins += [ordered]@{
            name = "spec-driven-dev-$($a.Name)"
            description = $desc
            version = $version
            maturity = $maturity
            source = "agents/$($a.Name)"
        }
    }
    $marketplaceJson = $marketplaceObj | ConvertTo-Json -Depth 10
    Write-Generated -Path (Join-Path $script:RepoRoot '.claude-plugin/marketplace.json') -Content $marketplaceJson
} else {
    Write-Info ""
    Write-Info "Job 7: skipped (-NoMarketplace)" -Color DarkGray
}

# ----- Job 8: Drift check + manifest write -----------------------------------

Write-Info ""
Write-Info "Job 8: Drift check + manifest" -Color Yellow

$manifestPath = Join-Path $script:RepoRoot '.publish-manifest.json'
$manifest = [ordered]@{
    '_comment' = 'GENERATED by tools/sync/Publish-Agents.ps1 (Job 8). Snapshot of every file produced/mirrored. DO NOT EDIT.'
    generatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    files = [ordered]@{}
}
foreach ($p in ($script:Touched.Keys | Sort-Object)) {
    $rel = $p.Replace($script:RepoRoot, '').TrimStart('\','/').Replace('\','/')
    $manifest.files[$rel] = $script:Touched[$p]
}

if ($CheckDrift) {
    # In check-drift mode we don't overwrite the manifest; we compare.
    # The DriftCount has already been accumulated by Write-Generated/Copy-Mirrored on per-file mismatch.
    # Additionally, the manifest's recorded file set must equal the current touched set.
    if (Test-Path $manifestPath) {
        $existing = (Get-Content $manifestPath -Raw | ConvertFrom-Json).files
        $recordedKeys = @($existing.PSObject.Properties.Name)
        $currentKeys = @($manifest.files.Keys)
        $added = $currentKeys | Where-Object { $_ -notin $recordedKeys }
        $removed = $recordedKeys | Where-Object { $_ -notin $currentKeys }
        if ($added) {
            $script:DriftCount += $added.Count
            foreach ($a2 in $added) { Write-Info "  DRIFT (new generated file not in manifest): $a2" -Color Red }
        }
        if ($removed) {
            $script:DriftCount += $removed.Count
            foreach ($r in $removed) { Write-Info "  DRIFT (manifest file no longer produced): $r" -Color Red }
        }
    } else {
        Write-Info "  no manifest exists yet (first run); will be created on next normal publish" -Color DarkGray
    }
} else {
    if ($DryRun) {
        Write-Info "  would-write manifest at .publish-manifest.json"
    } else {
        # The manifest itself is regenerated every run (timestamp changes); never compared.
        # Still write with LF + UTF-8 no BOM for consistency.
        $manifestJson = $manifest | ConvertTo-Json -Depth 10
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        $manifestContentLF = $manifestJson -replace "`r`n", "`n"
        [System.IO.File]::WriteAllText($manifestPath, $manifestContentLF, $utf8NoBom)
        Write-Info "  wrote manifest at .publish-manifest.json ($($manifest.files.Count) files tracked)"
    }
}

# ----- Summary ----------------------------------------------------------------

Write-Info ""
Write-Info "----- Summary -----" -Color Cyan
Write-Info "Mode:        $mode"
Write-Info "Wrote:       $script:WriteCount file(s)"
Write-Info "Skipped:     $script:SkipCount file(s) (already up to date)"
Write-Info "Drift:       $script:DriftCount file(s)"
Write-Info "Tracked:     $($script:Touched.Count) file(s) total"

if ($CheckDrift -and $script:DriftCount -gt 0) {
    Write-Host ""
    Write-Host "DRIFT DETECTED: $script:DriftCount file(s) differ from expected. Failing build." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Publish complete." -ForegroundColor Green
