# DANH SÁCH CÁC KỊCH BẢN DEMO TRỢ LÝ ẢO AI CHATBOT
*(Phục vụ Hội đồng Bảo vệ Đồ án Tốt nghiệp)*

Tài liệu này chứa các bộ câu hỏi thử nghiệm (test cases) phân theo cấp độ phức tạp để sếp sử dụng khi demo trước Hội đồng chấm đồ án, chứng minh năng lực xử lý lập luận nhiều bước (Multi-step Agent) của trợ lý ảo.

---

## 📌 PHẦN 1: CÁC CÂU HỎI ĐƠN (1-Step Queries)
*AI chỉ cần gọi duy nhất 1 API tương ứng của Java Backend và trả kết quả.*

### Kịch bản 1: Truy xuất Doanh thu
* **Câu hỏi**: *"Thống kê doanh thu tháng này của chi nhánh Bình Thạnh"* hoặc *"Doanh thu năm 2026 của chi nhánh Thủ Đức thế nào?"*
* **API kích hoạt**: `get_revenue_stats`
* **Dữ liệu trả về**: Bảng thống kê doanh thu theo tháng và năm tương ứng.

### Kịch bản 2: Liệt kê phòng trống
* **Câu hỏi**: *"Nhà mình ở chi nhánh Thủ Đức còn những phòng nào trống vậy em?"*
* **API kích hoạt**: `get_vacant_rooms_list`
* **Dữ liệu trả về**: Bảng danh sách phòng đang có trạng thái `AVAILABLE` gồm: Tên phòng, tầng, giá thuê, số người ở tối đa.

### Kịch bản 3: Tra cứu nợ nần
* **Câu hỏi**: *"Danh sách những người đang nợ tiền phòng năm nay"* hoặc *"Ai chưa đóng tiền phòng tháng này ở Bình Thạnh?"*
* **API kích hoạt**: `get_detailed_debtors`
* **Dữ liệu trả về**: Bảng danh sách chi tiết các hóa đơn nợ (`PENDING` hoặc `PARTIAL`), số tiền nợ, ngày hết hạn đóng tiền.

### Kịch bản 4: Tiêu thụ Điện & Nước
* **Câu hỏi**: *"Thống kê tiêu thụ điện nước tháng trước của chi nhánh Thủ Đức"*
* **API kích hoạt**: `get_utility_stats`
* **Dữ liệu trả về**: Bảng thống kê lượng dùng điện (kWh), lượng dùng nước (m³), số tiền điện và tiền nước của chi nhánh.

---

## 📌 PHẦN 2: CÁC CÂU HỎI KÉP (2-Step Queries)
*AI sẽ chạy vòng lặp 2 lượt để gọi tuần tự 2 API khác nhau trước khi đưa ra câu trả lời cuối cùng.*

### Kịch bản 1: Đối chiếu Doanh thu & Cư dân nợ
* **Câu hỏi**: *"Hãy so sánh tình hình doanh thu giữa chi nhánh Bình Thạnh và Thủ Đức, rồi liệt kê chi tiết những phòng đang nợ tiền của cả 2 chi nhánh này."*
* **Luồng di chuyển qua các Node**:
  1. `START` -> `intent` -> `llm_intent` (Lượt 1).
  2. AI nhận diện ý định đầu tiên: Gọi `compare_branches`.
  3. Node `execute_tool` gọi API so sánh doanh thu -> Lưu kết quả vào lịch sử hội thoại.
  4. Node `format_tool_message` tăng `loop_count` lên 1 và quay ngược lại `llm_intent` (Lượt 2).
  5. AI đọc lịch sử đã có bảng so sánh, lập luận cần gọi tiếp `get_detailed_debtors` để lấy danh sách nợ.
  6. Node `execute_tool` gọi API lấy danh sách nợ -> Lưu vào lịch sử hội thoại.
  7. Node `format_tool_message` tăng `loop_count` lên 2 và quay lại `llm_intent` (Lượt 3).
  8. AI nhận diện đã đủ thông tin -> chuyển sang `chat_response` để tạo câu trả lời tổng hợp.

### Kịch bản 2: Lọc phòng trống & Kiểm tra chỉ số dùng điện nước
* **Câu hỏi**: *"Liệt kê danh sách các phòng còn trống ở chi nhánh Thủ Đức và kiểm tra xem chỉ số điện nước tháng trước của các phòng đó là bao nhiêu."*
* **Luồng di chuyển qua các Node**:
  * **Vòng lặp 1**: AI gọi công cụ `get_vacant_rooms_list` để tìm các phòng trống ở Thủ Đức -> Nhận về danh sách phòng (A102, A201, A202).
  * **Vòng lặp 2**: AI tự động gọi công cụ `get_utility_stats` của chi nhánh Thủ Đức để lấy chỉ số điện nước tháng trước của các phòng đó.
  * **Kết thúc**: AI tổng hợp bảng danh sách phòng trống kèm theo cột lượng điện nước sử dụng tương ứng.

---

## 📌 PHẦN 3: CÂU HỎI PHỨC HỢP 3 BƯỚC (3-Step Queries - Điểm 10)
*AI thể hiện tối đa khả năng tự lập kế hoạch chạy chuỗi API và tự động thực thi nghiệp vụ thông minh.*

### Kịch bản Cốt lõi: Lọc phòng trống -> So sánh Điện nước -> Tự động soạn thảo hợp đồng mẫu

* **Câu hỏi**: 
  > *"Em kiểm tra xem chi nhánh Thủ Đức còn phòng trống nào giá dưới 4 triệu không? Nếu còn thì lọc ra phòng có chỉ số điện nước tháng trước thấp nhất, rồi tự động soạn một hợp đồng mẫu với thông tin phòng đó, tiền cọc mặc định 1 tháng gửi qua đây cho anh xem."*

* **Luồng chạy chi tiết của Agent qua các Node**:
  * **Vòng lặp 1 (Tìm phòng trống)**:
    * AI phân tích câu hỏi và nhận diện cần tìm phòng trống trước.
    * Node `execute_tool` thực thi API `/vacant-rooms-list` của chi nhánh Thủ Đức.
    * Kết quả nhận về: Phòng **A102** (Giá 2.6M), phòng **A201** (Giá 2.8M), phòng **A202** (Giá 3M).
    * Kết quả được lưu vào lịch sử, `loop_count` = 1. Quay lại `llm_intent`.
  * **Vòng lặp 2 (Kiểm tra và so sánh điện nước)**:
    * AI đọc lịch sử thấy đã có danh sách 3 phòng trống giá dưới 4 triệu.
    * AI lập luận tiếp: Cần so sánh lượng điện nước dùng của các phòng đó trong tháng trước (Tháng 5/2026).
    * Node `execute_tool` thực thi API `/utility-stats` của chi nhánh Thủ Đức.
    * Kết quả nhận về chỉ số điện nước:
      * Phòng A102: 10 kWh điện, 2 m³ nước (Thấp nhất).
      * Phòng A201: 87 kWh điện, 5 m³ nước.
      * Phòng A202: 120 kWh điện, 8 m³ nước.
    * Kết quả nạp vào lịch sử, `loop_count` = 2. Quay lại `llm_intent`.
  * **Vòng lặp 3 (Tự lập luận soạn thảo hợp đồng)**:
    * AI đọc lịch sử thấy đã có đầy đủ: Danh sách phòng trống và lượng điện nước tháng trước của từng phòng.
    * AI so sánh thấy phòng **A102** có lượng tiêu thụ thấp nhất (10 số điện, 2 khối nước).
    * AI nhận diện đã đủ thông tin, không cần gọi thêm API nào khác -> Gán ý định là `"none"`.
    * Cạnh điều hướng chuyển sang node **`chat_response`**.
  * **Kết xuất (Final Response)**:
    * LLM tổng hợp dữ liệu: Chọn phòng **A102** làm phòng mục tiêu.
    * LLM tự động biên soạn một bản **Hợp đồng thuê phòng mẫu** dạng Markdown gửi trực tiếp trên khung chat cho sếp xem.
    * Hợp đồng được tự động điền các thông tin thật:
      * **Địa chỉ phòng**: Phòng A102, tầng 1, chi nhánh Nhà trọ Thủ Đức.
      * **Giá thuê**: 2.600.000 VND / tháng.
      * **Tiền cọc mặc định (1 tháng)**: 2.600.000 VND.
      * **Các dịch vụ đi kèm** (lấy từ dữ liệu của phòng).
    * Khung chat hiển thị nút **Xuất Excel 📊** để sếp click tải bản thống kê và hợp đồng này về máy tính.
