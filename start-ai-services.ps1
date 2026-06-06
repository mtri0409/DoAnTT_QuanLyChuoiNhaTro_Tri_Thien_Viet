# ===================================================================
# START AI SERVICES (FastAPI + Python)
# Chạy AI Services trực tiếp không qua Docker
# ===================================================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Starting AI Services (FastAPI)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Điều hướng vào thư mục AI_Services
Set-Location "AI_Services"

# Kiểm tra Python có được cài đặt không
$python = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python is not installed!" -ForegroundColor Red
    Write-Host "Please install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Python version: $python" -ForegroundColor Green
Write-Host ""

# Kiểm tra virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Kích hoạt virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Cài đặt dependencies nếu chưa có
Write-Host "Checking dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  API Port: 8000" -ForegroundColor White
Write-Host "  Backend URL: http://localhost:8080/api/v1/ai" -ForegroundColor White
Write-Host ""

Write-Host "Running AI Services..." -ForegroundColor Green
Write-Host ""

# Run FastAPI server
uvicorn ai_services:app --host 0.0.0.0 --port 8000 --reload

Write-Host ""
Write-Host "AI Services stopped." -ForegroundColor Yellow
