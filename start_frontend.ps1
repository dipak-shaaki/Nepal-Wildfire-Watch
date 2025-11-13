# Forest Fire Prediction - Frontend Startup Script
# This script automatically sets up and runs the frontend

$PROJECT_ROOT = "D:\Final_sem_\Forest_Fire_Prediction"
$FRONTEND_PATH = "$PROJECT_ROOT\frontend"

Write-Host "🔥 Forest Fire Prediction - Frontend Startup" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Set-Location $FRONTEND_PATH

# Check if node_modules exists
if (-Not (Test-Path "$FRONTEND_PATH\node_modules")) {
    Write-Host "❌ Dependencies not found. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies found!" -ForegroundColor Green
}

# Start development server
Write-Host "🚀 Starting frontend server..." -ForegroundColor Cyan
npm run dev

# If server stops
Write-Host "❌ Server stopped." -ForegroundColor Red
