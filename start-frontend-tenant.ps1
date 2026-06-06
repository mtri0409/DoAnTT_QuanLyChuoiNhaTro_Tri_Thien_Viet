# ===================================================================
# START FRONTEND TENANT (React + Vite)
# Port: 5174
# ===================================================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Starting Frontend Tenant (Vite React)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Điều hướng vào thư mục frontend tenant
Set-Location "frontend\QuanLyNhaTro_Tri_Thien_Viet_Tenant"

# Kiểm tra Node.js có được cài đặt không
$node = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Node.js version: $node" -ForegroundColor Green
Write-Host ""

# Cài đặt dependencies nếu chưa có
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Frontend Port: 5174" -ForegroundColor White
Write-Host "  API Base URL: http://localhost:8080/api/v1/" -ForegroundColor White
Write-Host "  Image Base URL: http://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "Running Frontend Tenant..." -ForegroundColor Green
Write-Host ""

# Run Vite dev server
npm run dev

Write-Host ""
Write-Host "Frontend Tenant stopped." -ForegroundColor Yellow
