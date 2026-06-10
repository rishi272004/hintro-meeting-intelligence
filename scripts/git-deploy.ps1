param(
  [string]$Message = "Finalize: update evaluation info, add reminder scripts"
)

Write-Host "Running git status..."
git status --porcelain

$changes = git status --porcelain
if (-not $changes) {
  Write-Host "No changes to commit. Exiting." -ForegroundColor Yellow
  exit 0
}

Write-Host "Staging all changes..."
git add -A

Write-Host "Committing with message: $Message"
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
  Write-Host "Commit failed. Aborting." -ForegroundColor Red
  exit 1
}

Write-Host "Pushing to origin main..."
git push origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host "Push failed. Check remote configuration or credentials." -ForegroundColor Red
  exit 1
}

Write-Host "Push completed successfully." -ForegroundColor Green
