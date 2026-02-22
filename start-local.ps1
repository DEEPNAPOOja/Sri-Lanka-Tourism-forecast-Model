#!/usr/bin/env pwsh

Write-Host "🚀 Starting Tourism Forecast Application (Non-Docker)" -ForegroundColor Cyan
Write-Host ""

# Check Python
try {
    python --version
    Write-Host "✅ Python is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Node
try {
    node --version
    Write-Host "✅ Node.js is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Install Node dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# Start backend
Write-Host "🚀 Starting backend server..." -ForegroundColor Yellow
Start-Process -NoNewWindow python -ArgumentList "-m uvicorn src.app:app --host 0.0.0.0 --port 8000"

# Start frontend dev server
Write-Host "🚀 Starting frontend server..." -ForegroundColor Yellow
Set-Location frontend
Start-Process -NoNewWindow npm -ArgumentList "run preview --port 3000"
Set-Location ..

Write-Host ""
Write-Host "🎉 Application is starting!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""