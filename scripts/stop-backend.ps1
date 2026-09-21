param(
  [Parameter(Mandatory = $true)][int]$Port,
  [string]$JarPattern = 'vision-monitor.*\.jar',
  [int]$TimeoutSeconds = 15
)

$ErrorActionPreference = 'Stop'
$listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
if ($listeners.Count -eq 0) {
  Write-Output "No process is listening on port $Port."
  exit 0
}

foreach ($processId in $listeners) {
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
  if (-not $process -or $process.CommandLine -notmatch $JarPattern) {
    throw "Refusing to stop PID $processId on port $Port because it is not the project backend JAR."
  }

  Write-Output "Stopping backend PID $processId..."
  & taskkill.exe /PID $processId /T *> $null
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline -and (Get-Process -Id $processId -ErrorAction SilentlyContinue)) {
    Start-Sleep -Milliseconds 500
  }

  if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
    Write-Output "Backend PID $processId did not stop gracefully. Forcing shutdown."
    & taskkill.exe /F /PID $processId /T *> $null
    Start-Sleep -Milliseconds 500
  }

  if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
    throw "Could not stop backend PID $processId."
  }
}

Write-Output "Backend stopped."
