param(
    [string]$RootDirectory = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputPath = ""
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path $RootDirectory).Path
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $root 'licenses\THIRD-PARTY-NOTICES.md' }
$records = [System.Collections.Generic.List[object]]::new()

function Add-Record {
    param([string]$Ecosystem, [string]$Name, [string]$Version, [string]$License, [string]$Source)
    if ([string]::IsNullOrWhiteSpace($Name) -or [string]::IsNullOrWhiteSpace($Version)) { return }
    $key = "$Ecosystem|$Name|$Version"
    if (($records | ForEach-Object Key) -contains $key) { return }
    if ([string]::IsNullOrWhiteSpace($License)) { $License = 'UNKNOWN' }
    $records.Add([pscustomobject]@{ Key=$key; Ecosystem=$Ecosystem; Name=$Name; Version=$Version; License=$License; Source=$Source })
}

function Read-MavenLicense {
    param([string]$GroupId, [string]$ArtifactId, [string]$Version)
    $groupPath = $GroupId.Replace('.', [IO.Path]::DirectorySeparatorChar)
    $pom = Join-Path $env:USERPROFILE ".m2\repository\$groupPath\$ArtifactId\$Version\$ArtifactId-$Version.pom"
    if (-not (Test-Path $pom)) { return 'UNKNOWN' }
    try {
        [xml]$doc = Get-Content -Raw -Encoding UTF8 $pom
        $names = @($doc.SelectNodes("//*[local-name()='licenses']/*[local-name()='license']/*[local-name()='name']") | ForEach-Object { $_.InnerText })
        return (($names | Where-Object { $_ }) -join ', ')
    } catch { return 'UNKNOWN' }
}

$mavenOutput = Join-Path $env:TEMP "vision-monitor-maven-dependencies-$PID.txt"
Push-Location (Join-Path $root 'backend')
try { & .\mvnw.cmd -q dependency:list '-DincludeScope=runtime' "-DoutputFile=$mavenOutput" | Out-Null }
finally { Pop-Location }
if (Test-Path $mavenOutput) {
    foreach ($line in Get-Content $mavenOutput) {
        if ($line -match '^\s*([^:]+):([^:]+):([^:]+):([^:]+):([^:]+)\s*$') {
            $group = $Matches[1]; $artifact = $Matches[2]; $version = $Matches[4]
            Add-Record 'Maven' "$group`:$artifact" $version (Read-MavenLicense $group $artifact $version) 'backend/pom.xml'
        }
    }
    Remove-Item $mavenOutput -Force -ErrorAction SilentlyContinue
}

$frontend = Join-Path $root 'frontend'
$npmJson = & npm --prefix $frontend ls --json --all --omit=dev 2>$null
if ($LASTEXITCODE -eq 0 -and $npmJson) {
    $npmTree = $npmJson | ConvertFrom-Json
    function Add-NpmTree { param($Node)
        foreach ($property in $Node.dependencies.PSObject.Properties) {
            $package = $property.Value
            $packageJson = Join-Path $frontend "node_modules\$($property.Name)\package.json"
            $license = ''; $source = ''
            if (Test-Path $packageJson) {
                $metadata = Get-Content -Raw -Encoding UTF8 $packageJson | ConvertFrom-Json
                if ($metadata.license -is [string]) { $license = $metadata.license }
                elseif ($metadata.license.type) { $license = $metadata.license.type }
                elseif ($metadata.licenses) { $license = (($metadata.licenses | ForEach-Object { $_.type }) -join ', ') }
                if ($metadata.homepage) { $source = $metadata.homepage } elseif ($metadata.repository.url) { $source = $metadata.repository.url }
            }
            Add-Record 'npm' $property.Name $package.version $license $source
            Add-NpmTree $package
        }
    }
    Add-NpmTree $npmTree
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputPath) | Out-Null
$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Third-Party Notices'); $lines.Add('')
$lines.Add('Generated from the current dependency manifests.'); $lines.Add('')
$lines.Add('This is the open source dependency inventory for the current distribution. Complete company policy and legal review before distribution.'); $lines.Add('')
$lines.Add('| Ecosystem | Package | Version | License | Source | Review |')
$lines.Add('| --- | --- | --- | --- | --- | --- |')
foreach ($record in ($records | Sort-Object Ecosystem, Name, Version)) {
    $review = if ($record.License -match 'GPL|LGPL|EPL|AGPL|MPL' -or $record.License -eq 'UNKNOWN') { 'LEGAL REVIEW' } else { 'NOTICE' }
    $lines.Add("| $($record.Ecosystem) | $($record.Name) | $($record.Version) | $($record.License) | $($record.Source) | $review |")
}
$lines.Add(''); $lines.Add('## Official license references'); $lines.Add('')
$lines.Add('- Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0')
$lines.Add('- Eclipse Public License 2.0: https://www.eclipse.org/legal/epl/epl-v20.html')
$lines.Add('- GNU LGPL 2.1: https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html')
$lines.Add('- GNU GPL 2.0: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html')
$lines | Set-Content -Path $OutputPath -Encoding UTF8
Write-Output "Generated $OutputPath ($($records.Count) packages)"
