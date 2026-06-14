# HƯỚNG DẪN MỞ KHÓA WEBCAM / CAMERA TRÊN TRÌNH DUYỆT (MẠNG NỘI BỘ)

Tài liệu hướng dẫn cấu hình trình duyệt để bỏ qua cơ chế bảo mật chống chặn Camera/Webcam khi chạy đồ án dưới giao thức `http://` với IP nội bộ (ví dụ: `192.168.0.100`).

---

## Cấu hình Trực tiếp trên Trình duyệt

Áp dụng cho các trình duyệt nhân Chromium như **Google Chrome**, **Microsoft Edge**, **Cốc Cốc**...

### Các bước thực hiện:

1. **Truy cập trang cấu hình Flags:**
   * Đối với **Google Chrome**: Dán `chrome://flags/#unsafely-treat-insecure-origin-as-secure` vào thanh địa chỉ rồi `Enter`.
   * Đối với **Microsoft Edge**: Dán `edge://flags/#unsafely-treat-insecure-origin-as-secure` vào thanh địa chỉ rồi `Enter`.

2. **Cấu hình tham số:**
   * Tìm đến mục **Insecure origins treated as secure**.
   * Chuyển trạng thái từ **Disabled** thành **Enabled**.
   * Tại ô textbox ngay phía dưới, nhập danh sách các địa chỉ IP kèm Port của đồ án (các địa chỉ cách nhau bằng **dấu phẩy** `,`):
     ```text
     [http://192.168.0.100:5173](http://192.168.0.100:5173),[http://192.168.0.100:5174](http://192.168.0.100:5174)
     ```

3. **Áp dụng thay đổi:**
   * Nhìn xuống góc dưới cùng bên phải trình duyệt, nhấn nút **Relaunch** (hoặc **Restart**) để trình duyệt tự khởi động lại.
   * F5 lại trang web đồ án và tận hưởng kết quả.
---

