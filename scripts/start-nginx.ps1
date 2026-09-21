param(
  [Parameter(Mandatory = $true)][string]$NginxHome,
  [Parameter(Mandatory = $true)][string]$Prefix,
  [Parameter(Mandatory = $true)][string]$ConfigPath
)

$ErrorActionPreference = 'Stop'
try {
  $executable = Join-Path $NginxHome 'nginx.exe'
  $process = Start-Process -FilePath $executable `
    -ArgumentList @('-p', "`"$Prefix`"", '-c', "`"$ConfigPath`"") `
    -WorkingDirectory $NginxHome -WindowStyle Hidden -PassThru
  Start-Sleep -Milliseconds 500
  $process.Refresh()
  if ($process.HasExited) { throw "Nginx exited immediately with code $($process.ExitCode)." }
  Write-Output "Started project-managed Nginx in background (PID $($process.Id))."
} catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
}
