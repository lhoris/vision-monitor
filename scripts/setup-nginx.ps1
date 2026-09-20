param(
  [string]$InstallDirectory = (Join-Path (Split-Path $PSScriptRoot -Parent) '.tools\nginx-1.30.5')
)

$ErrorActionPreference = 'Stop'
$version = '1.30.5'
$executable = Join-Path $InstallDirectory 'nginx.exe'
if (Test-Path -LiteralPath $executable) {
  Write-Output $InstallDirectory
  exit 0
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
  New-Item -ItemType Directory -Path (Join-Path $InstallDirectory 'logs') -Force | Out-Null
  Write-Output $InstallDirectory
} finally {
  Remove-Item -LiteralPath $download -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $extractDirectory -Recurse -Force -ErrorAction SilentlyContinue
}
