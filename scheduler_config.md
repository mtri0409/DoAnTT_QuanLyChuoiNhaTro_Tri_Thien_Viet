Bạn là một chuyên gia Full-stack Senior Developer. Tôi đang làm một đồ án tốt nghiệp và cần tối ưu hóa hệ thống để phục vụ việc demo/báo cáo hội đồng. 



Hiện tại, các tác vụ tự động (Schedulers/Cron Jobs) trong dự án của tôi đang được cấu hình thời gian cố định (hardcoded). Điều này khiến việc kiểm thử và demo rất khó khăn. Tôi cần bạn giúp tôi thiết kế một tính năng "Quản lý Scheduler động từ Database/Dashboard" với các yêu cầu cụ thể sau:



1. ĐỌC VÀ PHÂN TÍCH SOURCE CODE:

- Hãy đọc các file source code tôi cung cấp dưới đây, tìm tất cả các hàm/tác vụ đang chạy bằng Scheduler (ví dụ: các hàm có annotation @Scheduled, Cron expressions, hoặc các thư viện Quartz, Worker Service...).



2. THIẾT KẾ BẢNG CẤU HÌNH (Database Table `scheduler_config`):

Hãy thiết kế cấu trúc bảng (SQL Script) gồm các trường sau:

- id (Primary Key)

- name (Chuỗi - Dùng để nhận diện chức năng, ví dụ: "Tự động quét chỉ số nước", "Gửi email thông báo"...)

- code_key (Chuỗi - Key duy nhất để code gọi, không thay đổi, ví dụ: "METER_READER_JOB")

- cron_expression (Chuỗi - Chứa cấu hình thời gian chạy dạng Cron, ví dụ: "0 0/5 * * * ?")

- is_active (Boolean - Trạng thái bật/tắt Scheduler này)

- description (Chuỗi - Mô tả chức năng)



3. REFACTOR SOURCE CODE (Thay thế cấu hình tĩnh thành động):

- Thay thế các đoạn hardcode thời gian của các Scheduler đã tìm thấy. Code mới phải có cơ chế đọc cấu hình từ bảng `scheduler_config` vừa tạo (đọc theo `code_key`).

- Khi ứng dụng khởi chạy hoặc khi Admin thay đổi cấu hình từ DB, các Scheduler phải tự động cập nhật lại thời gian chạy (Reschedule) mà không cần phải restart lại server.



4. VIẾT API CHO CHỨC NĂNG CRUD (Phân quyền ADMIN):

Viết các API để phục vụ cho giao diện Dashboard của Admin:

- GET /api/admin/schedulers (Lấy danh sách tất cả scheduler để hiển thị lên bảng)

- PUT /api/admin/schedulers/{id} (Cập nhật thời gian 'cron_expression' hoặc trạng thái 'is_active')

- POST /api/admin/schedulers/{code_key}/trigger (NÚT KÍCH HOẠT NGAY: Khi Admin bấm nút này, hệ thống sẽ thực thi hàm xử lý của Scheduler đó NGAY LẬP TỨC tại thời điểm bấm, không cần đợi đến giờ Cron).

* Lưu ý bảo mật: Toàn bộ các API này phải được phân quyền, chỉ tài khoản có Role = 'ADMIN' mới được phép truy cập.



