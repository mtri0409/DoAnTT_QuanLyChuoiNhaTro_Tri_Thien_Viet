# Hướng dẫn Khởi chạy & Đóng gói Hệ thống qua Docker (Localhost) 🐳

Tài liệu này hướng dẫn cách đóng gói, cấu hình và khởi chạy toàn bộ chuỗi hệ thống quản lý nhà trọ (Backend, AI Services, VNPay Mock và 3 web Frontends) bằng Docker Compose trên localhost.

---

## 🛠 1. Chuẩn bị trước khi khởi chạy

Đảm bảo máy tính của bạn đã cài đặt:
- **Docker Desktop** (hoặc Docker Engine & Docker Compose v2 trở lên).
- Bạn có kết nối internet để Docker tải xuống các base image lần đầu tiên.

---

## ⚙️ 2. Cấu hình biến môi trường

File `.env` tại thư mục gốc chứa các thiết lập chính của hệ thống. Bạn có thể mở ra để chỉnh sửa nếu cần:
- `DB_NAME`: Tên database của hệ thống (mặc định: `db_quan_ly_tro`).
- `DB_PORT`: Cổng MySQL map ra ngoài localhost (mặc định: `3307`).
- `JWT_SECRET`: Khóa bí mật ký mã token.
- `MAIL_USERNAME` / `MAIL_PASSWORD`: Cấu hình gửi mail thông báo.

---

## 🚀 3. Các bước khởi chạy hệ thống

### Bước 3.1: Build và chạy các container

Tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`), mở Terminal/PowerShell và chạy lệnh:

```bash
docker compose up --build -d
```

*Lệnh trên sẽ tự động:*
1. Build file jar cho Spring Boot Backend.
2. Cài đặt các thư viện hệ thống cần thiết (OpenCV), tải và cache trọng số VietOCR cho phân hệ AI.
3. Build tĩnh 3 ứng dụng React/Vite và đóng gói chạy trên máy chủ Nginx riêng biệt.
4. Tải xuống database MySQL và cài đặt môi trường.
5. Khởi động tất cả các container chạy ngầm (`-d`).

### Bước 3.2: Kiểm tra trạng thái hoạt động

Xem các container đã chạy ổn định chưa bằng lệnh:
```bash
docker compose ps
```
Hoặc kiểm tra log của Backend:
```bash
docker compose logs backend
```

---

## 💾 4. Khởi tạo Cơ sở dữ liệu (Database)

Hibernate trong Backend được cấu hình ở chế độ `update` (`spring.jpa.hibernate.ddl-auto=update`), do đó cấu trúc bảng sẽ tự động được tạo khi Backend kết nối tới MySQL lần đầu tiên.

Để import dữ liệu mẫu (Seed Data) hoặc file SQL dump của bạn:
1. Kết nối cơ sở dữ liệu client của bạn (như **DBeaver**, **Navicat**, hoặc **HeidiSQL**) đến địa chỉ:
   - **Host:** `localhost`
   - **Port:** `3307` (Hoặc cổng khai báo ở `DB_PORT` trong `.env`)
   - **Username:** `root`
   - **Password:** *(Để trống)*
   - **Database:** `db_quan_ly_tro`
2. Thực thi file script SQL dump của bạn trực tiếp lên kết nối này để nạp dữ liệu.

---

## 🌐 5. Địa chỉ truy cập các dịch vụ

Sau khi khởi chạy thành công, bạn truy cập các dịch vụ qua các đường dẫn tương ứng trên trình duyệt:

| Dịch vụ / Website | Địa chỉ truy cập | Ghi chú |
| :--- | :--- | :--- |
| **Admin Web App** | [http://localhost:5173](http://localhost:5173) | Trang quản trị dành cho Admin & Staff |
| **Tenant Web App** | [http://localhost:5174](http://localhost:5174) | Cổng thông tin dành cho Khách thuê trọ |
| **User/Guest Web App** | [http://localhost:5175](http://localhost:5175) | Trang chủ tìm kiếm và giới thiệu phòng trọ |
| **Spring Boot API** | [http://localhost:8080](http://localhost:8080) | Backend chính (Swagger UI: `/swagger-ui/index.html`) |
| **AI Services API** | [http://localhost:8000](http://localhost:8000) | Nhận diện biển số, đồng hồ nước |
| **VNPay Mock Proxy** | [http://localhost:3001](http://localhost:3001) | Cổng kết nối thử nghiệm VNPay |

---

## 🧹 6. Dừng hệ thống và giải phóng tài nguyên

Để tắt toàn bộ hệ thống đang chạy:
```bash
docker compose down
```

Nếu muốn xóa sạch toàn bộ container và ổ đĩa dữ liệu MySQL (Lưu ý: sẽ mất toàn bộ dữ liệu đã import):
```bash
docker compose down -v
```
