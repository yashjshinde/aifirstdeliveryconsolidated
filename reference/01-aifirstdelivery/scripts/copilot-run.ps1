# Generates a self-contained GitHub Copilot prompt for any AI First Delivery agent command.
# The prompt is written to .tmp/copilot-prompt.md and copied to clipboard.
#
# Usage:
#   .\scripts\copilot-run.ps1 <domain> <command> <feature>
#
# Examples:
#   .\scripts\copilot-run.ps1 d365-ce spec customer-loyalty-points
#   .\scripts\copilot-run.ps1 d365-ce review customer-loyalty-points
#   .\scripts\copilot-run.ps1 data-migration spec sftp-to-dv-accounts
#   .\scripts\copilot-run.ps1 integration spec erp-customer-sync

param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet('d365-ce','d365-ce-brownfield','d365-fo','integration','power-apps','data-migration','solution-architect','solution-estimate')]
    [string]$Domain,

    [Parameter(Position=1, Mandatory=$true)]
    [string]$Command,

    [Parameter(Position=2)]
    [string]$Feature = ""
)

$ErrorActionPreference = "Stop"

$root        = Split-Path $PSScriptRoot -Parent
$runnerDir   = Join-Path $root "tools" "runner"
$runnerScript= Join-Path $runnerDir "run-agent.js"
$outDir      = Join-Path $root ".tmp"
$outFile     = Join-Path $outDir "copilot-prompt.md"

# Auto-install runner dependencies on first run
if (-not (Test-Path (Join-Path $runnerDir "node_modules"))) {
    Write-Host "First run — installing runner dependencies ..." -ForegroundColor Cyan
    Push-Location $runnerDir
    try { npm install --silent } finally { Pop-Location }
}

# Ensure .tmp output folder exists
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# Build argument list for run-agent.js
$runArgs = @($runnerScript, $Domain, $Command)
if ($Feature) { $runArgs += $Feature }
$runArgs += @("--output-prompt", $outFile)

Write-Host ""
Write-Host "Generating prompt: [$Domain] /$Command$(if ($Feature) { ' ' + $Feature })" -ForegroundColor Cyan

node @runArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "Prompt generation failed. Ensure 'node' is on your PATH and rerun."
    exit 1
}

# Copy generated prompt to clipboard
try {
    Get-Content $outFile -Raw | Set-Clipboard
    $clipMsg = "Copied to clipboard"
} catch {
    $clipMsg = "Clipboard unavailable — open $outFile manually"
}

$fileSize = [math]::Round((Get-Item $outFile).Length / 1KB, 1)

Write-Host ""
Write-Host "  Prompt ready  ($($fileSize) KB)" -ForegroundColor Green
Write-Host "  File:         $outFile" -ForegroundColor Gray
Write-Host "  Clipboard:    $clipMsg" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open Copilot Chat    Ctrl+Alt+I  (or View > Chat)" -ForegroundColor White
Write-Host "  2. Switch to Agent mode click the  *  icon (not Ask / Edit)" -ForegroundColor White
Write-Host "  3. Paste                Ctrl+V" -ForegroundColor White
Write-Host "  4. Press Enter and follow Copilot's prompts" -ForegroundColor White
Write-Host ""
