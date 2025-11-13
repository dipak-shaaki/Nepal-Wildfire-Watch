# Forest Fire Prediction - Backend Startup Script
# This script automatically sets up and runs the backend server

$PROJECT_ROOT = "D:\Final_sem_\Forest_Fire_Prediction"
$VENV_PATH = "$PROJECT_ROOT\.venv"
$BACKEND_PATH = "$PROJECT_ROOT\backend"

Write-Host "🔥 Forest Fire Prediction - Backend Startup" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Check if virtual environment exists
if (-Not (Test-Path "$VENV_PATH\Scripts\python.exe")) {
    Write-Host "❌ Virtual environment not found. Creating new one..." -ForegroundColor Yellow
    Set-Location $PROJECT_ROOT
    python -m venv .venv
    Write-Host "✅ Virtual environment created successfully!" -ForegroundColor Green
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    & "$VENV_PATH\Scripts\python.exe" -m pip install --upgrade pip
    & "$VENV_PATH\Scripts\python.exe" -m pip install -r requirements.txt
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment found!" -ForegroundColor Green
}

# Activate virtual environment and start server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host "📍 Server will run at: http://127.0.0.1:8000" -ForegroundColor Yellow
Set-Location $BACKEND_PATH
& "$VENV_PATH\Scripts\python.exe" -m uvicorn main:app --reload

# If server stops
Write-Host "❌ Server stopped." -ForegroundColor Red
