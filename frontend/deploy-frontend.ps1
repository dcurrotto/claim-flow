#Requires -Version 5.1
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

$confirm = Read-Host "Deploy frontend to this account? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Aborted."
    exit 0
}

$StackName = "claim-flow-$Environment"
$Region    = "us-east-1"

Write-Host ""
Write-Host "Fetching stack outputs from $StackName..."
$outputs = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    --profile "claim-flow-$Environment" `
    --query "Stacks[0].Outputs" `
    --output json | ConvertFrom-Json

$bucketName     = ($outputs | Where-Object { $_.OutputKey -eq "FrontendBucketName" }).OutputValue
$distributionId = ($outputs | Where-Object { $_.OutputKey -eq "FrontendDistributionId" }).OutputValue
$frontendUrl    = ($outputs | Where-Object { $_.OutputKey -eq "FrontendUrl" }).OutputValue
$apiUrl         = ($outputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue

if (-not $bucketName -or -not $distributionId -or -not $apiUrl) {
    Write-Error "Could not find required stack outputs. Has the stack been deployed?"
}

Write-Host "Bucket:       $bucketName"
Write-Host "Distribution: $distributionId"
Write-Host "URL:          $frontendUrl"

$envOverride = ".env.$Environment.local"
Write-Host ""
Write-Host "Writing $envOverride with CloudFront redirect URIs..."
@"
VITE_API_URL=$apiUrl
VITE_COGNITO_REDIRECT_URI=$frontendUrl
VITE_COGNITO_LOGOUT_URI=$frontendUrl
"@ | Out-File -FilePath $envOverride -Encoding utf8

Write-Host "Building frontend..."
try {
    npm run build -- --mode $Environment
    if (-not $?) { throw "npm run build failed" }
} finally {
    Remove-Item -Path $envOverride -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Syncing to s3://$bucketName ..."
aws s3 sync dist "s3://$bucketName" --delete --region $Region --profile $Environment

Write-Host ""
Write-Host "Invalidating CloudFront cache..."
aws cloudfront create-invalidation `
    --distribution-id $distributionId `
    --paths "/*" `
    --profile "claim-flow-$Environment" `
    --query "Invalidation.Id" `
    --output text

Write-Host ""
Write-Host "Done. Frontend available at: $frontendUrl"
