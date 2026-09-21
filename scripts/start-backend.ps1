param(
  [Parameter(Mandatory = $true)][string]$JavaPath,
  [Parameter(Mandatory = $true)][string]$JarPath,
  [Parameter(Mandatory = $true)][string]$WorkingDirectory,
  [Parameter(Mandatory = $true)][string]$LogDirectory
)

$ErrorActionPreference = 'Stop'
try {
  $stdout = Join-Path $LogDirectory 'backend.log'
  $stderr = Join-Path $LogDirectory 'backend-error.log'
  $process = Start-Process -FilePath $JavaPath -ArgumentList @('-jar', "`"$JarPath`"") `
    -WorkingDirectory $WorkingDirectory -WindowStyle Hidden `
    -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
  Start-Sleep -Milliseconds 500
  $process.Refresh()
  if ($process.HasExited) { throw "Backend exited immediately with code $($process.ExitCode)." }
  Write-Output "Started backend in background (PID $($process.Id))."
} catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
}
