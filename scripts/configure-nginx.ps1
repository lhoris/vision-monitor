param(
  [Parameter(Mandatory = $true)][string]$NginxHome,
  [Parameter(Mandatory = $true)][string]$WebRoot,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [int]$Port = 8088
)

$ErrorActionPreference = 'Stop'
if ($Port -lt 1 -or $Port -gt 65535) { throw "Invalid Nginx listen port: $Port" }
$templatePath = Join-Path (Split-Path $PSScriptRoot -Parent) 'nginx\windows\nginx.conf.template'
$nginxPath = (Resolve-Path -LiteralPath $NginxHome).Path.Replace('\', '/')
$webPath = [System.IO.Path]::GetFullPath($WebRoot).Replace('\', '/')
$configuration = Get-Content -LiteralPath $templatePath -Raw -Encoding utf8
$configuration = $configuration.Replace('@@NGINX_HOME@@', $nginxPath)
$configuration = $configuration.Replace('@@WEB_ROOT@@', $webPath)
$configuration = $configuration.Replace('@@NGINX_PORT@@', [string]$Port)
if ($configuration -match '@@[^@]+@@') { throw 'Nginx configuration contains unresolved template values.' }
New-Item -ItemType Directory -Path (Split-Path $OutputPath -Parent) -Force | Out-Null
[System.IO.File]::WriteAllText($OutputPath, $configuration, [System.Text.UTF8Encoding]::new($false))
