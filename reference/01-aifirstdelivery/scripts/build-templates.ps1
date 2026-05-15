# Build and zip all agent templates
param(
    [string]$OutputDir = "dist",
    [string]$TemplatesDir = "templates"
)

$templates = @(
    @{ Name = "d365-ce";            Zip = "AgentTemplate-D365CE" },
    @{ Name = "d365-ce-brownfield"; Zip = "AgentTemplate-D365CEBrownfield" },
    @{ Name = "d365-fo";            Zip = "AgentTemplate-D365FO" },
    @{ Name = "data-migration";     Zip = "AgentTemplate-DataMigration" },
    @{ Name = "integration";        Zip = "AgentTemplate-Integration" },
    @{ Name = "power-apps";         Zip = "AgentTemplate-PowerApps" },
    @{ Name = "solution-architect"; Zip = "AgentTemplate-SolutionArchitect" },
    @{ Name = "solution-estimate";  Zip = "AgentTemplate-SolutionEstimate" }
)

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }

foreach ($t in $templates) {
    $src  = Join-Path $TemplatesDir $t.Name
    $dest = Join-Path $OutputDir $t.Zip
    $zip  = "$dest.zip"

    if (-not (Test-Path $src)) {
        Write-Warning "Template folder not found: $src — skipping"
        continue
    }

    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $src $dest -Recurse

    if (Test-Path $zip) { Remove-Item $zip -Force }
    Compress-Archive -Path "$dest\*" -DestinationPath $zip
    Remove-Item $dest -Recurse -Force

    Write-Host "Built: $zip"
}

Write-Host "`nDone. Templates in: $OutputDir"
