# Environment Setup Guide

Hướng dẫn thiết lập biến môi trường cho dự án Quản Lý Chuỗi Nhà Trọ.

## 1. Backend (Spring Boot)

### Tạo file cấu hình
```bash
cd backend/qlchuoiphongtro/src/main/resources/
```

Sao chép từ `application-example.properties`:
```bash
cp application-example.properties application.properties
```

### Chỉnh sửa application.properties
Mở file `application.properties` và cập nhật các giá trị sau:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/db_quan_ly_tro?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_db_password

# JWT Secret (PHẢI ĐỔI - thay đổi giá trị mặc định)
jwt_secret=your_super_secret_jwt_key_here_min_32_chars

# Email Gmail (Lấy App Password từ Google Account)
spring.mail.username=your_email@gmail.com
spring.mail.password=your_gmail_app_password
```

**Cách lấy Gmail App Password:**
1. Truy cập https://myaccount.google.com/security
2. Bật "2-Step Verification"
3. Vào "App passwords" → chọn Mail & Windows
4. Copy password được tạo ra

---

## 2. VNPay Module

### Tạo file .env
```bash
cd vnpay
cp .env.example .env
```

### Chỉnh sửa .env
```env
VNP_TMN_CODE=your_merchant_code_from_vnpay
VNP_HASH_SECRET=your_hash_secret_from_vnpay
VNP_RETURN_URL=http://localhost:5174
PORT=3001
```

---

## 3. Frontend Applications

Mỗi frontend app cần file `.env`:

### Admin App
```bash
cd frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=ws://localhost:8080/ws
VITE_APP_NAME=QuanLyChuoiNhaTro_Admin
VITE_API_TIMEOUT=30000
```

### User App
```bash
cd frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_User
cp .env.example .env
```

### Mobile App
```bash
cd frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_Mobile
cp .env.example .env
```

### Tenant App
```bash
cd frontend/QuanLyNhaTro_Tri_Thien_Viet_Tenant
cp .env.example .env
```

---

## 4. AI Services (Python)

### Tạo file .env
```bash
cd AI_Services
cp .env.example .env
```

### Chỉnh sửa .env
```env
API_BACKEND_URL=http://localhost:8080/api/ai
PORT=8000
```

---

## 5. Xác minh Setup

### Backend
```bash
cd backend/qlchuoiphongtro
mvn spring-boot:run
```
Server sẽ chạy trên: http://localhost:8080

### VNPay Module
```bash
cd vnpay
npm install
npm start
```
Server sẽ chạy trên: http://localhost:3001

### Frontend Apps
```bash
# Mở terminal riêng cho mỗi app
cd frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin
npm install
npm run dev
```
Dev server sẽ chạy trên: http://localhost:5173+

### AI Services
```bash
cd AI_Services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python ai_services.py
```

---

## ⚠️ IMPORTANT - Security Notice

1. **KHÔNG COMMIT** các file `.env` và `application.properties` vào repository
2. **KHÔNG SHARE** các credentials với người khác qua Slack, Email
3. **MỖI DEVELOPER** phải có bộ credentials riêng
4. **PRODUCTION** phải dùng environment variables thật từ server
5. **JWT Secret, Email Password, VNPay Key** PHẢI được đổi trước khi deploy

---

## Production Deployment

Khi deploy production:
1. Tạo các environment variables trên server
2. Không cần các file `.env` hay `application.properties`
3. Spring Boot sẽ đọc từ system environment variables tự động
4. Đảm bảo tất cả secrets được bảo vệ bằng Secret Management (AWS Secrets Manager, Vault, etc.)
