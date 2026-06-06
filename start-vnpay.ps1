# ===================================================================
# START VNPAY SERVICE (Node.js)
# Chạy VNPay Service trực tiếp không qua Docker
# ===================================================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Starting VNPay Service (Node.js)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Điều hướng vào thư mục vnpay
Set-Location "vnpay"

# Kiểm tra Node.js có được cài đặt không
$node = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Node.js version: $node" -ForegroundColor Green
Write-Host ""

# Kiểm tra npm
$npm = npm --version 2>&1
Write-Host "npm version: $npm" -ForegroundColor Green
Write-Host ""

# Cài đặt dependencies nếu chưa có
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  VNPay Port: 3001" -ForegroundColor White
Write-Host "  Return URL: http://localhost:5174" -ForegroundColor White
Write-Host ""

Write-Host "Running VNPay Service..." -ForegroundColor Green
Write-Host ""

# Run Node.js service
node index.js

Write-Host ""
Write-Host "VNPay Service stopped." -ForegroundColor Yellow
