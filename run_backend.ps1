#!/usr/bin/env pwsh
# Navigate to script directory
Set-Location $PSScriptRoot

# Set Python path
$env:PYTHONPATH = "."

Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
Write-Host "📍 URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📍 Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

# Start the server
python -m uvicorn src.app:app --reload --host 0.0.0.0 --port 8000