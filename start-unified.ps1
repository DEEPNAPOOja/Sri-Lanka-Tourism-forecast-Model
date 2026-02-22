#!/usr/bin/env pwsh

Write-Host "🚀 Unified Deployment - Building Full Stack App" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "🔨 Building React Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ..

if (!(Test-Path "frontend/dist/index.html")) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Step 2: Install Backend Dependencies  
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 3: Start Unified Server
Write-Host "🚀 Starting unified server (Frontend + API)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Application will be available at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:8000" -ForegroundColor Green
Write-Host "   API: http://localhost:8000/api" -ForegroundColor Green  
Write-Host "   Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""

# Start the unified server
python -m uvicorn src.app:app --host 0.0.0.0 --port 8000 --reload