param(
  [Parameter(Mandatory = $true)][string]$NginxHome,
  [Parameter(Mandatory = $true)][string]$Prefix,
  [Parameter(Mandatory = $true)][string]$ConfigPath,
  [int]$TimeoutSeconds = 15
)

$ErrorActionPreference = 'Stop'
$nginxExecutable = (Resolve-Path -LiteralPath (Join-Path $NginxHome 'nginx.exe')).Path
$pidFile = Join-Path $NginxHome 'logs\nginx.pid'
if (-not (Test-Path -LiteralPath $pidFile)) {
  Write-Output 'Project-managed Nginx is not running.'
  exit 0
}

$masterPidText = (Get-Content -LiteralPath $pidFile -Raw).Trim()
$masterPid = 0
if (-not [int]::TryParse($masterPidText, [ref]$masterPid)) {
  throw "Invalid Nginx PID file: $pidFile"
}
$master = Get-CimInstance Win32_Process -Filter "ProcessId = $masterPid"
if (-not $master) {
  Remove-Item -LiteralPath $pidFile -Force
  Write-Output 'Removed a stale project Nginx PID file; no process was running.'
  exit 0
}

$processPath = (Get-Process -Id $masterPid).Path
if (-not $processPath -or -not [string]::Equals($processPath, $nginxExecutable, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "PID $masterPid does not belong to the project Nginx executable. Refusing to signal it."
}

& $nginxExecutable -p $Prefix -c $ConfigPath -s quit
if ($LASTEXITCODE -ne 0) { throw "Nginx graceful shutdown command failed with exit code $LASTEXITCODE." }

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
  if (-not (Get-Process -Id $masterPid -ErrorAction SilentlyContinue)) {
    Write-Output "Project-managed Nginx stopped (PID $masterPid)."
    exit 0
  }
  Start-Sleep -Milliseconds 500
}

throw "Project-managed Nginx (PID $masterPid) did not stop within $TimeoutSeconds seconds. It was not force-terminated."
