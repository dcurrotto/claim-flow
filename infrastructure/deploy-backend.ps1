param(
    [ValidateSet("qa", "prod")]
    [string]$Environment
)

if (-not $Environment) {
    $Environment = Read-Host "Environment (qa/prod)"
    if ($Environment -notin @("qa", "prod")) {
        Write-Error "Environment must be 'qa' or 'prod'."
        exit 1
    }
}

Write-Host "Verifying AWS identity for profile '$Environment'..."
$identity = aws sts get-caller-identity --profile $Environment --output json | ConvertFrom-Json
if (-not $?) {
    Write-Error "Failed to get caller identity. Check that the '$Environment' AWS profile is configured."
    exit 1
}

Write-Host ""
Write-Host "Account : $($identity.Account)"
Write-Host "UserId  : $($identity.UserId)"
Write-Host "ARN     : $($identity.Arn)"
Write-Host ""

$confirm = Read-Host "Deploy to this account? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Aborted."
    exit 0
}

Write-Host ""
Write-Host "Building..."
sam build
if (-not $?) { exit 1 }

Write-Host ""
Write-Host "Deploying ($Environment)..."
sam deploy --config-env $Environment --profile $Environment
