#!/bin/bash
set -e

echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🚀 Starting application..."
uvicorn src.app:app --host 0.0.0.0 --port ${PORT:-8000}