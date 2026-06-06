# ===================================================================
# START BACKEND SERVICE (Spring Boot)
# Chạy Backend trực tiếp không qua Docker
# ===================================================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Starting Backend Service (Spring Boot)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Điều hướng vào thư mục backend
Set-Location "backend\qlchuoiphongtro"

# Kiểm tra Maven có được cài đặt không
$maven = mvn -version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Maven is not installed!" -ForegroundColor Red
    Write-Host "Please install Maven from: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
    exit 1
}

Write-Host "Maven version: $maven" -ForegroundColor Green
Write-Host ""

# Hiển thị thông tin kết nối
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Database: localhost:3306" -ForegroundColor White
Write-Host "  API Port: 8080" -ForegroundColor White
Write-Host "  AI Services: http://localhost:8000" -ForegroundColor White
Write-Host ""

Write-Host "Running Backend..." -ForegroundColor Green
Write-Host ""

# Run Spring Boot application
mvn spring-boot:run

Write-Host ""
Write-Host "Backend stopped." -ForegroundColor Yellow
