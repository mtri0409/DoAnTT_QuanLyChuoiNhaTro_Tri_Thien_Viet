# Quan Ly Chuoi Nha Tro - Tri Thien Viet

*/Xây dựng hệ thống quản lý chuỗi nhà trọ*

- Hệ thống được tích hợp AI vào để xử lý các vấn đề
- Trợ lý ảo với LangGraph + LLM để quản lý các thông tin nhà trọ

## Kien truc he thong

| Thanh phan | Cong nghe | Mo ta |
|------------|-----------|-------|
| Backend API | Spring Boot + MySQL | REST API, JWT auth, WebSocket |
| AI Services | Python + FastAPI + YOLO/VietOCR | Nhan dien so dong ho dien/nuoc |
| VNPay Proxy | Node.js + Express | Xu ly thanh toan VNPay |
| Web Admin | React + Vite | Quan ly cho chu tro |
| Web Tenant | React + Vite | Quan ly cho quan ly vien |
| Web User | React + Vite | Tim phong, xem bai dang |
| Mobile App | React Native + Expo | App cho nguoi thue |

## Yeu cau he thong

- Docker + Docker Compose
- Node.js 22+ (dev local)
- Java 21 + Maven (dev backend)
- Python 3.10+ (dev AI)

## Chay toan bo he thong bang Docker

### 1. Cau hinh moi truong

```bash
# Copy file env mau
cp .env.example .env

# Sua HOST_IP thanh IP LAN cua may ban (dung cho mobile/web callback)
# Windows: ipconfig | findstr IPv4
# Linux/Mac: ipconfig getifaddr en0  hoac  hostname -I
```

File `.env`:
```env
DB_NAME=db_quan_ly_tro
DB_USERNAME=root
DB_PASSWORD=
DB_PORT=3306

JWT_SECRET=this_is_random_jwt_secret
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password


VNP_TMN_CODE=your_code_vnpay
VNP_HASH_SECRET=your_hash_secret

# IP LAN cua may chay Docker (khong dung localhost)
HOST_IP=your_host_ip
```

### 2. Build & chay

```bash
docker-compose up --build -d
```

### 3. Truy cap cac dich vu

| Dich vu | URL |
|---------|-----|
| Backend API | http://localhost:8080/api/v1/ |
| Web Admin | http://localhost:5173 |
| Web Tenant | http://localhost:5174 |
| Web User | http://localhost:5175 |
| VNPay Proxy | http://localhost:3001 |
| AI OCR | http://localhost:8000 |
| phpMyAdmin | http://localhost:8082 |

### 4. Dung he thong

```bash
docker-compose down
# Xoa ca volume DB
docker-compose down -v
```

## Chay tung phan rieng le (Dev mode)

### Backend (Spring Boot)

```bash
cd backend/qlchuoiphongtro
# Cau hinh DB local trong application.properties hoac env:
# DB_URL=jdbc:mysql://localhost:3306/db_quan_ly_tro
mvn spring-boot:run
```

### AI Services (Python)

```bash
cd AI_Services
pip install -r requirements.txt
uvicorn ai_services:app --host 0.0.0.0 --port 8000
```

### VNPay Proxy

```bash
cd vnpay
npm install
node server.js
```

### Web Frontend (Vite)

```bash
# Admin
cd frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin
npm install
npm run dev

# Tenant
cd frontend/QuanLyNhaTro_Tri_Thien_Viet_Tenant
npm install
npm run dev

# User
cd frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_User
npm install
npm run dev
```

### Mobile App (Expo)

```bash
cd frontend/QuanLyChuoiNhaTro_Tri_Thien_Viet_Mobile

# Cau hinh IP backend trong .env
echo "EXPO_PUBLIC_API_URL=http://192.168.1.100:8080" > .env
echo "EXPO_PUBLIC_VNPAY_PROXY_URL=http://192.168.1.100:3001" >> .env

npm install
npx expo start
# Quet QR bang Expo Go tren dien thoai
```

## Mang noi bo Docker

Cac container giao tiep qua network `qlchuoiphongtro_net`:

- `db` -> MySQL (port 3306)
- `backend` -> Spring Boot (port 8080)
- `ai-services` -> FastAPI (port 8000)
- `vnpay` -> Express (port 3001)
- `admin-web` / `tenant-web` / `user-web` -> Nginx (port 80)

Container goi nhau bang **service name**:
- Backend -> DB: `jdbc:mysql://db:3306/...`
- Backend -> AI: `http://ai-services:8000/api`
- VNPay -> Backend: `http://backend:8080`

Client ben ngoai (browser/mobile) goi qua **host IP**:
- `http://HOST_IP:8080` -> Backend
- `http://HOST_IP:5173` -> Admin Web
- `http://HOST_IP:3001` -> VNPay Proxy

## Cau truc thu muc

```
.
├── backend/qlchuoiphongtro/          # Spring Boot API
├── AI_Services/                      # Python OCR/AI
├── vnpay/                            # VNPay proxy server
├── frontend/
│   ├── QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin/    # Web Admin
│   ├── QuanLyNhaTro_Tri_Thien_Viet_Tenant/        # Web Tenant
│   ├── QuanLyChuoiNhaTro_Tri_Thien_Viet_User/     # Web User (Guest)
│   └── QuanLyChuoiNhaTro_Tri_Thien_Viet_Mobile/   # Mobile App
├── docker-compose.yml
├── .env
└── README.md
```

## Troubleshooting

| Loi | Nguyen nhan | Cach fix |
|-----|-------------|----------|
| Mobile khong ket noi duoc API | Dung `localhost` thay vi IP LAN | Sua `.env` mobile dung `EXPO_PUBLIC_API_URL=http://<IP_LAN>:8080` |
| VNPay callback fail | `VNP_RETURN_URL` sai | Kiem tra `HOST_IP` trong `.env` root |
| Frontend web goi API loi | Build time chua inject URL | Kiem tra `docker-compose` truyen dung `args` cho Dockerfile |
| AI service khong nhan anh | Model chua download | Build Docker se pre-download VietOCR model |
| Port bi chiem | Service khac dang chay | `docker-compose down` hoac doi port mapping |

## License

Do an tot nghiep - Tri Thien Viet
