# AI Meter Reader Service 🚀

Phân hệ AI Service chịu trách nhiệm tiếp nhận hình ảnh đồng hồ nước từ hệ thống, sử dụng mô hình học máy (YOLOv8 & PyTorch) để tự động nhận diện, cắt và trích xuất các chữ số hiển thị trên mặt đồng hồ (Meter Digits Detection & OCR).

## 🛠 Yêu cầu hệ thống (Prerequisites)

Trước khi khởi chạy, hãy đảm bảo máy tính/server của bạn đã cài đặt sẵn:

- **Python**: Phiên bản từ `3.9` đến `3.11` (Khuyến nghị `3.10`).
- **Pip**: Trình quản lý thư viện Python đi kèm.
- **Môi trường ảo (Khuyến nghị)**: `venv` hoặc `conda` để tránh xung đột thư viện hệ thống.

---

## 📦 Hướng dẫn cài đặt và Triển khai

Thực hiện các bước sau thông qua Terminal hoặc Command Prompt tại thư mục `ai-service`:

### Bước 1: Tạo và kích hoạt môi trường ảo

- **Trên Windows:**
  ```bash
  python -m venv venv
  .\venv\Scripts\activate
  ```

### Bước 2: Cài đặt môi trường cần thiết

pip install --upgrade pip
pip install -r requirements.txt

### Bước 3: Chạy server

python ai_services.py || py ai_services.py
