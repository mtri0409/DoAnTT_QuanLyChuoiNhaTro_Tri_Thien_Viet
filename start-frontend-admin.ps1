# ===================================================================
# START FRONTEND ADMIN (React + Vite)
# Port: 5173
# ===================================================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Starting Frontend Admin (Vite React)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Điều hướng vào thư mục frontend admin
Set-Location "frontend\QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin"

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
Write-Host "  Frontend Port: 5173" -ForegroundColor White
Write-Host "  API Base URL: http://localhost:8080/api/v1/" -ForegroundColor White
Write-Host "  Image Base URL: http://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "Running Frontend Admin..." -ForegroundColor Green
Write-Host ""

# Run Vite dev server
npm run dev

Write-Host ""
Write-Host "Frontend Admin stopped." -ForegroundColor Yellow
