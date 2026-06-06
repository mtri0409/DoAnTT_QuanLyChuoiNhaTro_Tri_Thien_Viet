# 🚀 LOCAL DEVELOPMENT SETUP GUIDE (No Docker)

## 📋 Tổng Quan

Ứng dụng Quản Lý Chuỗi Nhà Trọ hiện được cấu hình để chạy **trực tiếp trên máy** mà không cần Docker.

### 🔧 Services

| Service | Port | Technology | Status |
|---------|------|-----------|--------|
| **Backend API** | 8080 | Spring Boot (Java 21) | ✅ |
| **Frontend Admin** | 5173 | React + Vite | ✅ |
| **Frontend Tenant** | 5174 | React + Vite | ✅ |
| **Frontend User** | 5175 | React + Vite | ✅ |
| **AI Services** | 8000 | FastAPI (Python) | ✅ |
| **VNPay Service** | 3001 | Node.js Express | ✅ |
| **MySQL Database** | 3306 | MySQL 8.0+ | ✅ |

---

## ⚙️ Yêu Cầu Hệ Thống

### Bắt Buộc Cài Đặt

#### 1. **Java 21** (cho Backend)
- Download: https://adoptium.net/
- Hoặc: https://www.oracle.com/java/technologies/downloads/#java21
- Kiểm tra: `java -version`

#### 2. **Maven 3.9+** (Build tool cho Backend)
- Download: https://maven.apache.org/download.cgi
- Kiểm tra: `mvn -version`

#### 3. **Node.js 18+** (cho Frontend & VNPay)
- Download: https://nodejs.org/
- Kiểm tra: `node --version` và `npm --version`

#### 4. **Python 3.10+** (cho AI Services)
- Download: https://www.python.org/downloads/
- Kiểm tra: `python --version`

#### 5. **MySQL 8.0+** (Database)
- Option A: XAMPP - https://www.apachefriends.org/
- Option B: MySQL Server - https://dev.mysql.com/downloads/mysql/
- Kiểm tra: Chạy MySQL Workbench hoặc Command line

---

## 🚀 Khởi Động Nhanh

### **Cách 1: Khởi Động Tất Cả Cùng Lúc (Recommended)**

```powershell
# Từ thư mục project root
.\start-all.ps1
```

Script này sẽ:
- ✅ Kiểm tra tất cả dependencies
- ✅ Khởi động MySQL service
- ✅ Mở 7 terminal windows cho từng service
- ✅ Tự động cài dependencies nếu chưa có

### **Cách 2: Khởi Động Từng Service Riêng Lẻ**

Mở 7 PowerShell terminal riêng biệt và chạy:

```powershell
# Terminal 1: Backend
.\start-backend.ps1

# Terminal 2: AI Services
.\start-ai-services.ps1

# Terminal 3: VNPay Service
.\start-vnpay.ps1

# Terminal 4: Frontend Admin
.\start-frontend-admin.ps1

# Terminal 5: Frontend Tenant
.\start-frontend-tenant.ps1

# Terminal 6: Frontend User
.\start-frontend-user.ps1

# Terminal 7: MySQL (nếu chưa chạy)
net start MySQL80
```

---

## 📦 Cấu Hình Thủ Công (Nếu Cần)

### 1️⃣ **Database Setup**

```bash
# Kết nối MySQL
mysql -u root -p

# Tạo database (nếu chưa có)
CREATE DATABASE db_quan_ly_tro;

# Xem database
SHOW DATABASES;
```

Hoặc dùng MySQL Workbench để tạo database.

### 2️⃣ **Backend Environment Variables**

File `.env` đã được cấu hình tại root project:

```env
DB_URL=jdbc:mysql://localhost:3306/db_quan_ly_tro?useSSL=false&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=hethongquanlynhatroTri338Thien354Viet337
```

Nếu cần thay đổi, sửa file này hoặc cập nhật `backend/qlchuoiphongtro/src/main/resources/application.properties`

### 3️⃣ **Frontend Environment Variables**

Các file `.env.development` đã được cấu hình:
- `frontend/QuanLyNhaTro_Tri_Thien_Viet_Tenant/.env.development`
- `frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin/.env.development`
- `frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_User/.env.development`

Tất cả đều trỏ tới `http://localhost:8080/api/v1/`

### 4️⃣ **AI Services Configuration**

File `AI_Services/.env`:
```env
API_BACKEND_URL=http://localhost:8080/api/v1/ai
```

### 5️⃣ **VNPay Configuration**

File `vnpay/.env`:
```env
VNP_TMN_CODE=J28E86FM
VNP_HASH_SECRET=OVHY8POT5SL9HD8DU5BJNGOLKF28QN41
VNP_RETURN_URL=http://localhost:5174
PORT=3001
```

---

## 🎯 Kiểm Tra Services

### Health Checks

```bash
# Backend
curl http://localhost:8080/actuator/health

# Backend Swagger
http://localhost:8080/swagger-ui/index.html

# AI Services
http://localhost:8000/docs

# Frontend Tenant
http://localhost:5174

# Frontend Admin
http://localhost:5173

# Frontend User
http://localhost:5175
```

---

## 📁 Cấu Trúc Project

```
DoAnTT_QuanLyChuoiNhaTro_Tri_Thien_Viet/
├── .env                                    # Environment variables (chính)
├── start-all.ps1                          # Script khởi động tất cả
├── start-backend.ps1                      # Script khởi động Backend
├── start-ai-services.ps1                  # Script khởi động AI Services
├── start-vnpay.ps1                        # Script khởi động VNPay
├── start-frontend-admin.ps1               # Script khởi động Frontend Admin
├── start-frontend-tenant.ps1              # Script khởi động Frontend Tenant
├── start-frontend-user.ps1                # Script khởi động Frontend User
│
├── backend/qlchuoiphongtro/
│   ├── pom.xml                           # Maven configuration
│   ├── .env.example                      # Example env file
│   ├── Dockerfile                        # (Không dùng - chỉ reference)
│   ├── mvnw / mvnw.cmd                   # Maven wrapper
│   └── src/main/resources/
│       └── application.properties        # Spring Boot configuration
│
├── frontend/QuanLyNhaTro_Tri_Thien_Viet_Tenant/
│   ├── package.json
│   ├── .env.development
│   ├── .env.production
│   └── src/
│
├── frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin/
│   ├── package.json
│   ├── .env.development
│   ├── .env.production
│   └── src/
│
├── frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_User/
│   ├── package.json
│   ├── .env.development
│   ├── .env.production
│   └── src/
│
├── AI_Services/
│   ├── .env
│   ├── requirements.txt
│   ├── ai_services.py
│   ├── Dockerfile                        # (Không dùng - chỉ reference)
│   └── runs/                            # YOLO models
│
├── vnpay/
│   ├── .env
│   ├── package.json
│   ├── index.js
│   ├── Dockerfile                        # (Không dùng - chỉ reference)
│   └── node_modules/
│
└── uploads/                              # Thư mục upload files
    ├── identification/
    ├── room-images/
    ├── system/
    └── posts/
```

---

## 🔧 Troubleshooting

### ❌ "Port already in use"

```powershell
# Kiểm tra quy trình dùng port
netstat -ano | findstr :8080

# Hoặc dùng lsof (nếu cài git bash)
lsof -i :8080

# Kill process (thay [PID] bằng process ID)
taskkill /PID [PID] /F
```

### ❌ "Cannot connect to database"

```bash
# Kiểm tra MySQL service
# Windows:
Get-Service MySQL80

# Start MySQL (nếu chưa chạy)
net start MySQL80

# Kiểm tra kết nối
mysql -u root -p -h localhost
```

### ❌ "Maven not found"

```bash
# Thêm Maven vào PATH hoặc chạy từ thư mục Maven bin
# Windows PATH: C:\apache-maven-3.9.x\bin

# Kiểm tra
mvn -version
```

### ❌ "Python dependencies missing"

```bash
cd AI_Services
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### ❌ "Node modules error"

```bash
cd frontend/QuanLyNhaTro_Tri_Thien_Viet_Tenant
rm -r node_modules package-lock.json
npm cache clean --force
npm install
```

### ❌ "Backend won't start - port 8080 in use"

```powershell
# Tìm và kill process sử dụng port 8080
$process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
```

---

## 📊 Service Status Monitoring

### Kiểm tra tất cả services đang chạy

```bash
# Kiểm tra ports
netstat -ano | findstr LISTENING | findstr "3306 8080 8000 3001 5173 5174 5175"

# Hoặc dùng PowerShell
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in 3306,8080,8000,3001,5173,5174,5175}
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT - Development Only**

Các thông tin sau là cho **development local** chỉ:
- Database password để trống (KHÔNG dùng production)
- JWT Secret là hardcoded
- Email credentials được commit (KHÔNG dùng production)

**Trước khi deploy production:**
1. Thay đổi tất cả passwords
2. Dùng environment variables cho secrets
3. Bật SSL/HTTPS
4. Cấu hình CORS đúng
5. Disable debug logging

---

## 🛑 Dừng Services

### Từng service
- Đóng terminal window của service đó

### Tất cả services
- Đóng tất cả terminal windows

### Stop MySQL Service
```powershell
net stop MySQL80
```

---

## 📝 Logs & Debugging

### Backend Logs
- Xem trong terminal where Backend is running
- Hoặc file: `backend/qlchuoiphongtro/logs/`

### Frontend Console
- Mở DevTools: F12 trong browser
- Xem Console tab

### AI Services Logs
- Xem trong terminal where AI Services is running

---

## 🆘 Need Help?

1. **Check logs** - Xem terminal output của service gặp lỗi
2. **Verify ports** - Đảm bảo ports không bị chiếm
3. **Restart services** - Đóng và khởi động lại
4. **Check environment** - Xác nhận tất cả ENV variables đúng
5. **Database** - Xác nhận MySQL đang chạy và database được tạo

---

## 📞 Quick Reference

```bash
# Start all services
.\start-all.ps1

# Check Java
java -version

# Check Maven
mvn -version

# Check Node.js
node --version
npm --version

# Check Python
python --version

# Check MySQL
mysql -u root

# View running services
netstat -ano | findstr LISTENING

# Kill a process
taskkill /PID [PID] /F
```

---

**Last Updated**: 2026-06-06
**Status**: ✅ All services configured for local development
