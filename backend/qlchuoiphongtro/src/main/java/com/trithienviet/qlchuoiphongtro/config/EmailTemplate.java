package com.trithienviet.qlchuoiphongtro.config;


public class EmailTemplate {

    // Style chung để dùng lại cho các mẫu
    private static final String HEADER_STYLE = "background-color: #2e7d32; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;";
    private static final String BODY_STYLE = "padding: 20px; border: 1px solid #ddd; border-top: none; font-family: Arial, sans-serif; line-height: 1.6;";
    private static final String BUTTON_STYLE = "display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;";

    // 1. Mẫu Thông báo chung (Bảo trì, Cúp điện...) - Admin tự nhập Title và Content
    public static String getGeneralNotification(String title, String content) {
        return "<div style='max-width: 600px;'>" +
               "  <div style='" + HEADER_STYLE + "'><h2>" + title + "</h2></div>" +
               "  <div style='" + BODY_STYLE + "'>" +
               "    <p>" + content + "</p>" +
               "    <p style='color: #888; font-size: 12px;'>Trân trọng,<br>Ban quản lý hệ thống</p>" +
               "  </div>" +
               "</div>";
    }

    // 2. Mẫu Hợp đồng gần hết hạn
    public static String getContractExpiring(String userName, String expiryDate) {
        return "<div style='max-width: 600px;'>" +
               "  <div style='background-color: #f57c00; " + HEADER_STYLE + "'><h2>SẮP HẾT HẠN HỢP ĐỒNG</h2></div>" +
               "  <div style='" + BODY_STYLE + "'>" +
               "    <p>Chào <b>" + userName + "</b>,</p>" +
               "    <p>Hợp đồng thuê phòng của bạn sẽ hết hạn vào ngày <b>" + expiryDate + "</b>.</p>" +
               "    <p>Vui lòng liên hệ Admin để thực hiện gia hạn nếu bạn muốn tiếp tục lưu trú.</p>" +
               "    <a href='#' style='" + BUTTON_STYLE + "'>Xem chi tiết hợp đồng</a>" +
               "  </div>" +
               "</div>";
    }

    // 3. Mẫu Có hóa đơn cần thanh toán
    public static String getNewBill(String userName, String month, String amount) {
        return "<div style='max-width: 600px;'>" +
               "  <div style='" + HEADER_STYLE + "'><h2>HÓA ĐƠN MỚI THÁNG " + month + "</h2></div>" +
               "  <div style='" + BODY_STYLE + "'>" +
               "    <p>Chào <b>" + userName + "</b>,</p>" +
               "    <p>Hệ thống vừa khởi tạo hóa đơn thanh toán cho phòng của bạn.</p>" +
               "    <p>Số tiền cần thanh toán: <span style='color: #d32f2f; font-weight: bold;'>" + amount + " VNĐ</span></p>" +
               "    <a href='http://localhost:3000/billing' style='" + BUTTON_STYLE + "'>Thanh toán ngay</a>" +
               "  </div>" +
               "</div>";
    }

    // 4. Mẫu Hóa đơn quá hạn
    public static String getOverdueBill(String userName, String amount) {
        return "<div style='max-width: 600px;'>" +
               "  <div style='background-color: #d32f2f; " + HEADER_STYLE + "'><h2>CẢNH BÁO: HÓA ĐƠN QUÁ HẠN</h2></div>" +
               "  <div style='" + BODY_STYLE + "'>" +
               "    <p>Chào <b>" + userName + "</b>,</p>" +
               "    <p>Chúng tôi nhận thấy hóa đơn số tiền <b>" + amount + " VNĐ</b> của bạn đã quá hạn thanh toán.</p>" +
               "    <p style='color: red;'><b>Lưu ý:</b> Vui lòng hoàn tất thanh toán sớm để tránh bị gián đoạn dịch vụ.</p>" +
               "    <a href='http://localhost:3000/billing' style='" + BUTTON_STYLE + "'>Kiểm tra hóa đơn</a>" +
               "  </div>" +
               "</div>";
    }
    // 5. Mẫu cấp tài khoản mới từ Admin
    public static String getNewAccountCreated(String userName, String account, String password) {
        return "<div style='max-width: 600px;'>" +
               "  <div style='background-color: #00796b; " + HEADER_STYLE + "'><h2>CHÀO MỪNG THÀNH VIÊN MỚI</h2></div>" +
               "  <div style='" + BODY_STYLE + "'>" +
               "    <p>Chào <b>" + userName + "</b>,</p>" +
               "    <p>Tài khoản của bạn trên hệ thống <b>Quản lý Phòng trọ</b> đã được khởi tạo thành công.</p>" +
               "    <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 5px solid #00796b; margin: 15px 0;'>" +
               "      <p style='margin: 5px 0;'><b>Tài khoản:</b> <span style='color: #1976d2;'>" + account + "</span></p>" +
               "      <p style='margin: 5px 0;'><b>Mật khẩu tạm thời:</b> <span style='color: #d32f2f;'>" + password + "</span></p>" +
               "    </div>" +
               "    <p style='color: #d32f2f; font-weight: bold;'>⚠️ Lưu ý quan trọng:</p>" +
               "    <p>Để đảm bảo bảo mật, vui lòng đăng nhập vào hệ thống, truy cập mục <b>Hồ sơ -> Đổi mật khẩu</b> trong vòng <b>24 giờ</b> kể từ khi nhận được email này.</p>" +
               "    <a href='http://localhost:3000/login' style='" + BUTTON_STYLE + "'>Đăng nhập ngay</a>" +
               "    <p style='margin-top: 20px; font-style: italic; color: #666;'>Nếu bạn không thực hiện đổi mật khẩu đúng hạn, tài khoản có thể bị khóa vì lý do an toàn.</p>" +
               "  </div>" +
               "</div>";
    }
}