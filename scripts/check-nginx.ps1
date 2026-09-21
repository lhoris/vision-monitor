param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [string]$ApiPath = '/api/common-codes/bootstrap'
)

$ErrorActionPreference = 'Stop'
$base = $BaseUrl.TrimEnd('/')
$page = Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec 5
if ($page.StatusCode -ne 200 -or $page.Headers['Content-Type'] -notmatch 'text/html') {
  throw "Nginx root did not return an HTML page (HTTP $($page.StatusCode))."
}

$assets = [regex]::Matches($page.Content, '(?:src|href)="([^\"]+\.(?:js|css)(?:\?[^\"]*)?)"')
$jsAsset = $assets | Where-Object { $_.Groups[1].Value -match '\.js(?:\?|$)' } | Select-Object -First 1
$cssAsset = $assets | Where-Object { $_.Groups[1].Value -match '\.css(?:\?|$)' } | Select-Object -First 1
if (-not $jsAsset -or -not $cssAsset) { throw 'The served index.html does not reference both JavaScript and CSS assets.' }

foreach ($asset in @($jsAsset, $cssAsset)) {
  $assetPath = $asset.Groups[1].Value
  if (-not $assetPath.StartsWith('/')) { throw "Expected a root-relative static asset URL, got: $assetPath" }
  $response = Invoke-WebRequest -Uri "$base$assetPath" -UseBasicParsing -TimeoutSec 5
  if ($response.StatusCode -ne 200 -or $response.Headers['Content-Type'] -notmatch '(javascript|css)') {
    throw "Static asset was not served with its expected content type: $assetPath"
  }
}

$apiStatus = 0
$apiContentType = ''
try {
  $api = Invoke-WebRequest -Uri "$base$ApiPath" -UseBasicParsing -TimeoutSec 5
  $apiStatus = [int]$api.StatusCode
  $apiContentType = [string]$api.Headers['Content-Type']
} catch {
  if ($_.Exception.Response) {
    $apiStatus = [int]$_.Exception.Response.StatusCode
    $apiContentType = [string]$_.Exception.Response.Headers['Content-Type']
  } else {
    throw
  }
}
if (($apiStatus -lt 200 -or $apiStatus -ge 300) -and $apiStatus -ne 401) {
  throw "Nginx API proxy returned unexpected HTTP $apiStatus."
}
if ($apiContentType -notmatch 'application/json') {
  throw "API path did not reach the JSON backend (Content-Type: $apiContentType)."
}

Write-Output "Nginx verified: HTML, JS/CSS assets, and API proxy (HTTP $apiStatus)."
