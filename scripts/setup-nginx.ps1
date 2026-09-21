param(
  [string]$InstallDirectory = (Join-Path (Split-Path $PSScriptRoot -Parent) '.tools\nginx-1.30.5')
)

$ErrorActionPreference = 'Stop'
$version = '1.30.5'
$executable = Join-Path $InstallDirectory 'nginx.exe'
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

if (Test-Path -LiteralPath $executable) {
  Ensure-NginxDirectories
  Write-Output $InstallDirectory
  exit 0
}

if (Test-Path -LiteralPath $InstallDirectory) {
  $existingFiles = Get-ChildItem -LiteralPath $InstallDirectory -Force
  if ($existingFiles) { throw "Incomplete Nginx installation exists at '$InstallDirectory'. Remove or rename that folder, then retry." }
  Remove-Item -LiteralPath $InstallDirectory -Force
}

$toolsDirectory = Split-Path $InstallDirectory -Parent
$download = Join-Path $env:TEMP "nginx-windows-$version.zip"
$extractDirectory = Join-Path $env:TEMP "nginx-windows-$version-$PID"
$archiveUrl = "https://nginx.org/download/nginx-$version.zip"

try {
  New-Item -ItemType Directory -Path $toolsDirectory -Force | Out-Null
  Write-Output "Downloading official Nginx $version runtime..."
  $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
  if ($curl) {
    & $curl.Source --fail --location --silent --show-error --connect-timeout 10 --max-time 120 --output $download $archiveUrl
    if ($LASTEXITCODE -ne 0) { throw "Nginx download failed with curl exit code $LASTEXITCODE." }
  } else {
    $request = [System.Net.HttpWebRequest]::Create($archiveUrl)
    $request.Timeout = 120000
    $request.ReadWriteTimeout = 120000
    $response = $request.GetResponse()
    try {
      $inputStream = $response.GetResponseStream()
      $outputStream = [System.IO.File]::Create($download)
      try { $inputStream.CopyTo($outputStream) } finally { $outputStream.Dispose(); $inputStream.Dispose() }
    } finally { $response.Dispose() }
  }
  if ((Get-Item -LiteralPath $download).Length -lt 1MB) { throw 'Downloaded Nginx archive is unexpectedly small.' }
  Expand-Archive -LiteralPath $download -DestinationPath $extractDirectory -Force
  $extracted = Join-Path $extractDirectory "nginx-$version"
  if (-not (Test-Path -LiteralPath (Join-Path $extracted 'nginx.exe'))) { throw 'nginx.exe was not found in the official archive.' }
  Move-Item -LiteralPath $extracted -Destination $InstallDirectory
  Ensure-NginxDirectories
  Write-Output $InstallDirectory
} finally {
  Remove-Item -LiteralPath $download -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $extractDirectory -Recurse -Force -ErrorAction SilentlyContinue
}
