$ErrorActionPreference = 'SilentlyContinue'
$repoRoot = Split-Path $PSScriptRoot -Parent
$candidates = [System.Collections.Generic.List[string]]::new()

foreach ($value in @($env:PROJECT_JAVA_HOME, $env:JRE_HOME, $env:JAVA_HOME)) {
  if (-not [string]::IsNullOrWhiteSpace($value)) { $candidates.Add($value) }
}

foreach ($registryPath in @(
  'HKLM:\SOFTWARE\JavaSoft\Java Runtime Environment',
  'HKLM:\SOFTWARE\WOW6432Node\JavaSoft\Java Runtime Environment',
  'HKLM:\SOFTWARE\JavaSoft\JDK',
  'HKLM:\SOFTWARE\WOW6432Node\JavaSoft\JDK'
)) {
  $current = Get-ItemPropertyValue -Path $registryPath -Name CurrentVersion
  if ($current) {
    $javaHome = Get-ItemPropertyValue -Path (Join-Path $registryPath $current) -Name JavaHome
    if ($javaHome) { $candidates.Add($javaHome) }
  }
  foreach ($versionKey in (Get-ChildItem -Path $registryPath)) {
    $javaHome = Get-ItemPropertyValue -Path $versionKey.PSPath -Name JavaHome
    if ($javaHome) { $candidates.Add($javaHome) }
  }
}

foreach ($root in @("$env:ProgramFiles\Eclipse Adoptium", "$env:ProgramFiles\Microsoft", "$env:ProgramFiles\Java", "$env:ProgramFiles\Amazon Corretto")) {
  if (Test-Path -LiteralPath $root) {
    foreach ($directory in (Get-ChildItem -LiteralPath $root -Directory)) {
      $candidates.Add($directory.FullName)
    }
  }
}

if (Test-Path -LiteralPath 'C:\JDK') {
  foreach ($runtime in (Get-ChildItem -LiteralPath 'C:\JDK' -Filter java.exe -File -Recurse)) {
    $candidates.Add((Split-Path (Split-Path $runtime.FullName -Parent) -Parent))
  }
}

foreach ($runtime in (Get-Command java.exe -All)) {
  if ($runtime.Source) { $candidates.Add((Split-Path (Split-Path $runtime.Source -Parent) -Parent)) }
}

$seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($candidate in $candidates) {
  if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
  try { $javaHome = (Resolve-Path -LiteralPath $candidate -ErrorAction Stop).Path } catch { continue }
  if (-not $seen.Add($javaHome)) { continue }
  $java = Join-Path $javaHome 'bin\java.exe'
  if (-not (Test-Path -LiteralPath $java -PathType Leaf)) { continue }
  $processInfo = New-Object System.Diagnostics.ProcessStartInfo
  $processInfo.FileName = $java
  $processInfo.Arguments = '-version'
  $processInfo.UseShellExecute = $false
  $processInfo.CreateNoWindow = $true
  $processInfo.RedirectStandardOutput = $true
  $processInfo.RedirectStandardError = $true
  $process = [System.Diagnostics.Process]::Start($processInfo)
  $version = $process.StandardError.ReadToEnd() + $process.StandardOutput.ReadToEnd()
  $process.WaitForExit()
  if ($version -match '(?im)^(?:openjdk|java)\s+version\s+"21(?:\.|")|^openjdk\s+21(?:\.|\s|$)') {
    Write-Output $javaHome
    exit 0
  }
}

[Console]::Error.WriteLine('Java 21 runtime was not found. Add it to PATH or set PROJECT_JAVA_HOME/JAVA_HOME; deployment does not download or install Java.')
exit 1
