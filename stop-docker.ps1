#!/usr/bin/env pwsh

Write-Host "🛑 Stopping Tourism Forecast Application..." -ForegroundColor Yellow
Write-Host ""

# Stop and remove containers
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Application stopped successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Error stopping application" -ForegroundColor Red
}

# Optionally remove images (uncomment if needed)
# Write-Host "🧹 Removing Docker images..." -ForegroundColor Yellow
# docker-compose down --rmi all

Write-Host ""
Write-Host "To restart the application, run: .\start-docker.ps1" -ForegroundColor Cyan