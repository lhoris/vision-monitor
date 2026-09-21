param(
  [string]$InstallDirectory = (Join-Path $PSScriptRoot '..\nginx\windows\runtime')
)

$ErrorActionPreference = 'Stop'
$InstallDirectory = [System.IO.Path]::GetFullPath($InstallDirectory)
$requiredFiles = @('nginx.exe', 'conf\mime.types')
$missingFiles = @($requiredFiles | Where-Object { -not (Test-Path -LiteralPath (Join-Path $InstallDirectory $_) -PathType Leaf) })
if ($missingFiles.Count) {
  throw "Project-managed Nginx runtime is incomplete at '$InstallDirectory'. Missing: $($missingFiles -join ', ')"
}

$requiredDirectories = @(
  'logs',
  'temp/client_body_temp',
  'temp/proxy_temp',
  'temp/fastcgi_temp',
  'temp/uwsgi_temp',
  'temp/scgi_temp'
)

function Ensure-NginxDirectories {
  foreach ($directory in $requiredDirectories) {
    New-Item -ItemType Directory -Path (Join-Path $InstallDirectory $directory) -Force | Out-Null
  }
}

Ensure-NginxDirectories
Write-Output $InstallDirectory
