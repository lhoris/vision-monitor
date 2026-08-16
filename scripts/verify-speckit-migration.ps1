param(
    [switch]$AfterBmadRemoval
)

$ErrorActionPreference = "Stop"

function Assert-PathExists {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing required path: $Path"
    }
}

function Assert-TextContains {
    param(
        [string]$Path,
        [string]$Pattern
    )
    $text = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $Path))
    if ($text -notmatch $Pattern) {
        throw "Missing required pattern '$Pattern' in $Path"
    }
}

$requiredPaths = @(
    ".specify/memory/constitution.md",
    ".specify/feature.json",
    "AGENTS.md",
    "CLAUDE.md",
    ".github/copilot-instructions.md",
    "specs/003-camera-focus-view/spec.md",
    "specs/003-camera-focus-view/plan.md",
    "specs/003-camera-focus-view/research.md",
    "specs/003-camera-focus-view/data-model.md",
    "specs/003-camera-focus-view/quickstart.md",
    "specs/003-camera-focus-view/tasks.md",
    "specs/003-camera-focus-view/contracts/camera-focus-contract.md",
    "specs/003-camera-focus-view/contracts/focus-route-contract.md",
    "specs/003-camera-focus-view/contracts/ui-state-contract.md"
)

foreach ($path in $requiredPaths) {
    Assert-PathExists $path
}

$featureJson = Get-Content -Raw .specify/feature.json | ConvertFrom-Json
if ($featureJson.feature_directory -ne "specs/003-camera-focus-view") {
    throw ".specify/feature.json points to '$($featureJson.feature_directory)' instead of specs/003-camera-focus-view"
}

Assert-TextContains "specs/003-camera-focus-view/spec.md" "## 1\."
Assert-TextContains "specs/003-camera-focus-view/spec.md" "## 2\."
Assert-TextContains "specs/003-camera-focus-view/spec.md" "FR-001"
Assert-TextContains "specs/003-camera-focus-view/spec.md" "active"
Assert-TextContains "specs/003-camera-focus-view/spec.md" "deprecated"
Assert-TextContains "specs/003-camera-focus-view/plan.md" "Mock-First MVP"
Assert-TextContains "specs/003-camera-focus-view/tasks.md" "BMAD"
Assert-TextContains ".specify/memory/constitution.md" "Mock-First MVP"
Assert-TextContains "AGENTS.md" "\.specify/memory/constitution\.md"
Assert-TextContains "CLAUDE.md" "AGENTS\.md"
Assert-TextContains ".github/copilot-instructions.md" "AGENTS\.md"

if ($AfterBmadRemoval) {
    $bmadPaths = @(
        "_bmad",
        "_bmad-output",
        ".agents/skills/bmad-advanced-elicitation",
        ".claude/skills/bmad-advanced-elicitation"
    )

    foreach ($path in $bmadPaths) {
        if (Test-Path -LiteralPath $path) {
            throw "BMAD path still exists after removal mode: $path"
        }
    }

    $trackedBmad = git ls-files _bmad _bmad-output .agents/skills .claude/skills .github/agents .github/prompts |
        Select-String -Pattern '(^_bmad|bmad-)'
    if ($trackedBmad) {
        throw "Tracked BMAD files still exist after removal mode."
    }
}

Write-Output "Spec Kit migration harness passed."
