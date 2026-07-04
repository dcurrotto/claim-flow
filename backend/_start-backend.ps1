Write-Host "Environment: nonprod | AWS Profile: qa"
$Environment = "qa"

# Activate venv (lives one level up at the repo root)
$venvActivate = "$PSScriptRoot\..\\.venv\Scripts\Activate.ps1"
if (Test-Path $venvActivate) { . $venvActivate }

$env:AWS_PROFILE       = $Environment
$env:AWS_REGION        = "us-east-1"
$env:COGNITO_USER_POOL_ID = "your-user-pool-id"

# Run from the backend/ directory so api.app resolves correctly
Set-Location $PSScriptRoot
python -m uvicorn api.app:app --reload
