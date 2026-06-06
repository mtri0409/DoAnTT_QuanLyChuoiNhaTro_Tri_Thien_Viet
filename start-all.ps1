# ===================================================================
# START ALL SERVICES (Master Script)
# Khởi động toàn bộ ứng dụng trực tiếp (không Docker)
# ===================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   QUAN LY CHUỖ NHÀ TRỌ - LOCAL DEVELOPMENT STARTUP    ║" -ForegroundColor Cyan
Write-Host "║          (No Docker - Direct Local Execution)          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Requirement Checks:" -ForegroundColor Yellow
Write-Host ""

# Check Java
$java = java -version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Java is installed" -ForegroundColor Green
} else {
    Write-Host "✗ Java is NOT installed (Required for Backend)" -ForegroundColor Red
    Write-Host "  Download: https://adoptium.net/" -ForegroundColor Yellow
}

# Check Maven
$maven = mvn -version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Maven is installed" -ForegroundColor Green
} else {
    Write-Host "✗ Maven is NOT installed (Required for Backend)" -ForegroundColor Red
    Write-Host "  Download: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
}

# Check Node.js
$node = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js is installed ($node)" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js is NOT installed (Required for Frontend/VNPay)" -ForegroundColor Red
    Write-Host "  Download: https://nodejs.org/" -ForegroundColor Yellow
}

# Check Python
$python = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python is installed ($python)" -ForegroundColor Green
} else {
    Write-Host "✗ Python is NOT installed (Required for AI Services)" -ForegroundColor Red
    Write-Host "  Download: https://www.python.org/downloads/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Services to Start:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. MySQL Database          (Port: 3306)" -ForegroundColor White
Write-Host "  2. Backend (Spring Boot)   (Port: 8080)" -ForegroundColor White
Write-Host "  3. AI Services (FastAPI)   (Port: 8000)" -ForegroundColor White
Write-Host "  4. VNPay Service (Node.js) (Port: 3001)" -ForegroundColor White
Write-Host "  5. Frontend Admin (Vite)   (Port: 5173)" -ForegroundColor White
Write-Host "  6. Frontend Tenant (Vite)  (Port: 5174)" -ForegroundColor White
Write-Host "  7. Frontend User (Vite)    (Port: 5175)" -ForegroundColor White
Write-Host ""

Write-Host "IMPORTANT: Each service will open in a new terminal window" -ForegroundColor Yellow
Write-Host ""

# Pause before starting
Read-Host "Press Enter to start all services..."
Write-Host ""

# Start MySQL (if running as service)
Write-Host "Checking MySQL service..." -ForegroundColor Cyan
$mysqlService = Get-Service MySQL80 -ErrorAction SilentlyContinue
if ($mysqlService) {
    if ($mysqlService.Status -ne 'Running') {
        Write-Host "Starting MySQL service..." -ForegroundColor Green
        Start-Service MySQL80 -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    } else {
        Write-Host "MySQL is already running" -ForegroundColor Green
    }
} else {
    Write-Host "MySQL service not found. Make sure MySQL is running!" -ForegroundColor Yellow
}

Write-Host ""

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; .\start-backend.ps1"
Start-Sleep -Seconds 2

# Start AI Services
Write-Host "Starting AI Services..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; .\start-ai-services.ps1"
Start-Sleep -Seconds 2

# Start VNPay Service
Write-Host "Starting VNPay Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; .\start-vnpay.ps1"
Start-Sleep -Seconds 2

# Start Frontend Admin
Write-Host "Starting Frontend Admin..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; .\start-frontend-admin.ps1"
Start-Sleep -Seconds 2

# Start Frontend Tenant
Write-Host "Starting Frontend Tenant..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; .\start-frontend-tenant.ps1"
Start-Sleep -Seconds 2

# Start Frontend User
Write-Host "Starting Frontend User..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; .\start-frontend-user.ps1"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ALL SERVICES STARTED                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Backend API:       http://localhost:8080" -ForegroundColor Cyan
Write-Host "  API Swagger Docs:  http://localhost:8080/swagger-ui/index.html" -ForegroundColor Cyan
Write-Host "  AI Services Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend Admin:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Frontend Tenant:   http://localhost:5174" -ForegroundColor Cyan
Write-Host "  Frontend User:     http://localhost:5175" -ForegroundColor Cyan
Write-Host ""
Write-Host "  VNPay Service:     http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  - Keep all terminal windows open while developing" -ForegroundColor White
Write-Host "  - Check each terminal for startup errors" -ForegroundColor White
Write-Host "  - Close any terminal to stop that service" -ForegroundColor White
Write-Host "  - To stop all services, close all terminal windows" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue..."
