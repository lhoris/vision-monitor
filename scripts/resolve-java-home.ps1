$ErrorActionPreference = 'SilentlyContinue'
$repoRoot = Split-Path $PSScriptRoot -Parent
$candidates = [System.Collections.Generic.List[string]]::new()

foreach ($value in @($env:PROJECT_JDK_HOME, $env:JDK_HOME, $env:JAVA_HOME)) {
  if (-not [string]::IsNullOrWhiteSpace($value)) { $candidates.Add($value) }
}
$candidates.Add((Join-Path $repoRoot '.tools\jdk-21'))

foreach ($registryPath in @(
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

foreach ($root in @("$env:ProgramFiles\Eclipse Adoptium", "$env:ProgramFiles\Microsoft", "$env:ProgramFiles\Java")) {
  if (Test-Path -LiteralPath $root) {
    foreach ($directory in (Get-ChildItem -LiteralPath $root -Directory | Where-Object Name -Match '(^|[-_])jdk[-_]?21|21.*jdk')) {
      $candidates.Add($directory.FullName)
    }
  }
}

if (Test-Path -LiteralPath 'C:\JDK') {
  foreach ($compiler in (Get-ChildItem -LiteralPath 'C:\JDK' -Filter javac.exe -File -Recurse)) {
    $candidates.Add((Split-Path (Split-Path $compiler.FullName -Parent) -Parent))
  }
}

foreach ($compiler in (Get-Command javac.exe -All)) {
  if ($compiler.Source) { $candidates.Add((Split-Path (Split-Path $compiler.Source -Parent) -Parent)) }
}

$seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($candidate in $candidates) {
  if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
  try { $javaHome = (Resolve-Path -LiteralPath $candidate -ErrorAction Stop).Path } catch { continue }
  if (-not $seen.Add($javaHome)) { continue }
  $javac = Join-Path $javaHome 'bin\javac.exe'
  $java = Join-Path $javaHome 'bin\java.exe'
  if (-not (Test-Path -LiteralPath $javac) -or -not (Test-Path -LiteralPath $java)) { continue }
  $version = (& $javac -version 2>&1 | Out-String).Trim()
  if ($version -match '^javac 21(?:\.|$)') {
    Write-Output $javaHome
    exit 0
  }
}

[Console]::Error.WriteLine('JDK 21 was not found. Install a JDK or set PROJECT_JDK_HOME to its folder; JAVA_HOME does not need to be changed globally.')
exit 1
