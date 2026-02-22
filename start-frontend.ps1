$frontendPath = "C:\Users\dell\OneDrive\Desktop\L4S1\ML & Pattern Recognition\tourism-forecast-ml\frontend"
Write-Host "Starting Sri Lanka Tourism Forecasting Frontend..." -ForegroundColor Green
Write-Host "Changing to: $frontendPath" -ForegroundColor Yellow

Set-Location -LiteralPath $frontendPath
Write-Host "Changed to: $(Get-Location)" -ForegroundColor Green

Write-Host "Starting Vite development server..." -ForegroundColor Cyan

# Run vite directly to avoid path parsing issues
node ".\node_modules\vite\bin\vite.js"