package com.trithienviet.qlchuoiphongtro.config;

public class EmailTemplate {

    // Style chung để dùng lại cho các mẫu
    private static final String HEADER_STYLE = "background-color: #2e7d32; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;";
    private static final String BODY_STYLE = "padding: 20px; border: 1px solid #ddd; border-top: none; font-family: Arial, sans-serif; line-height: 1.6;";
    private static final String BUTTON_STYLE = "display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;";

    // 1. Mẫu Thông báo chung (Bảo trì, Cúp điện...) - Admin tự nhập Title và
    // Content
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

    // 3. Mẫu Thông báo Hóa đơn (Gọn gàng + Hạn chót)
    public static String getNewBill(String userName, String month, String year, String amount,
            String roomFee, String serviceTotal, String deadline) {
        return "<div style='max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; font-family: Arial, sans-serif; border-radius: 8px; overflow: hidden;'>"
                +
                "  <div style='background-color: #2e7d32; " + HEADER_STYLE + " text-align: center;'>" +
                "    <h2 style='margin:0; color: white;'>THÔNG BÁO HÓA ĐƠN THÁNG " + month + "/" + year + "</h2>" +
                "  </div>" +
                "  <div style='" + BODY_STYLE + "'>" +
                "    <p>Chào <b>" + userName + "</b>,</p>" +
                "    <p>Hệ thống vừa cập nhật hóa đơn tiền phòng tháng " + month
                + ". Vui lòng kiểm tra tổng chi phí cần thanh toán dưới đây:</p>" +
                "    " +
                "    <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;'>"
                +
                "      <div style='display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;'>"
                +
                "        <span style='color: #555;'>Tiền phòng:</span>" +
                "        <b style='float: right;'>" + roomFee + " VNĐ</b>" +
                "      </div>" +
                "      <div style='display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;'>"
                +
                "        <span style='color: #555;'>Tổng điện, nước & dịch vụ:</span>" +
                "        <b style='float: right;'>" + serviceTotal + " VNĐ</b>" +
                "      </div>" +
                "      <div style='display: flex; justify-content: space-between; padding-top: 5px; margin-bottom: 10px;'>"
                +
                "        <span style='font-size: 16px; font-weight: bold;'>TỔNG THANH TOÁN:</span>" +
                "        <span style='float: right; font-size: 18px; color: #d32f2f; font-weight: bold;'>" + amount
                + " VNĐ</span>" +
                "      </div>" +
                "      <div style='border-top: 2px dashed #ff9800; margin-top: 10px; padding-top: 10px; color: #e65100; font-weight: bold; font-size: 14px; text-align: center;'>"
                +
                "        📅 HẠN CHÓT THANH TOÁN: " + deadline + "" +
                "      </div>" +
                "    </div>" +
                "    " +
                "    <p style='background-color: #fff3e0; padding: 10px; border-left: 4px solid #ff9800; font-size: 13px; color: #666;'>"
                +
                "      💡 <b>Lưu ý:</b> Các chỉ số điện, nước chi tiết và hình ảnh đồng hồ thực tế đã được cập nhật đầy đủ trên hệ thống. Vui lòng truy cập để xem chi tiết."
                +
                "    </p>" +
                "    " +
                "    <div style='text-align: center; margin-top: 25px;'>" +
                "      <a href='http://localhost:3000/billing' style='" + BUTTON_STYLE
                + "'>Xem chi tiết & Thanh toán</a>" +
                "    </div>" +
                "    " +
                "    <p style='margin-top: 25px; font-size: 12px; color: #999; text-align: center;'>Trân trọng,<br>Ban quản lý hệ thống</p>"
                +
                "  </div>" +
                "</div>";
    }

    // 4. Mẫu Hóa đơn quá hạn
    public static String getOverdueBill(String userName, String amount) {
        return "<div style='max-width: 600px;'>" +
                "  <div style='background-color: #d32f2f; " + HEADER_STYLE
                + "'><h2>CẢNH BÁO: HÓA ĐƠN QUÁ HẠN</h2></div>" +
                "  <div style='" + BODY_STYLE + "'>" +
                "    <p>Chào <b>" + userName + "</b>,</p>" +
                "    <p>Chúng tôi nhận thấy hóa đơn số tiền <b>" + amount
                + " VNĐ</b> của bạn đã quá hạn thanh toán.</p>" +
                "    <p style='color: red;'><b>Lưu ý:</b> Vui lòng hoàn tất thanh toán sớm để tránh bị gián đoạn dịch vụ.</p>"
                +
                "    <a href='http://localhost:3000/billing' style='" + BUTTON_STYLE + "'>Kiểm tra hóa đơn</a>" +
                "  </div>" +
                "</div>";
    }

    // 5. Mẫu cấp tài khoản mới từ Admin
    public static String getNewAccountCreated(String userName, String account, String password) {
        return "<div style='max-width: 600px;'>" +
                "  <div style='background-color: #00796b; " + HEADER_STYLE + "'><h2>CHÀO MỪNG THÀNH VIÊN MỚI</h2></div>"
                +
                "  <div style='" + BODY_STYLE + "'>" +
                "    <p>Chào <b>" + userName + "</b>,</p>" +
                "    <p>Tài khoản của bạn trên hệ thống <b>Quản lý Phòng trọ</b> đã được khởi tạo thành công.</p>" +
                "    <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 5px solid #00796b; margin: 15px 0;'>"
                +
                "      <p style='margin: 5px 0;'><b>Tài khoản:</b> <span style='color: #1976d2;'>" + account
                + "</span></p>" +
                "      <p style='margin: 5px 0;'><b>Mật khẩu tạm thời:</b> <span style='color: #d32f2f;'>" + password
                + "</span></p>" +
                "    </div>" +
                "    <p style='color: #d32f2f; font-weight: bold;'>⚠️ Lưu ý quan trọng:</p>" +
                "    <p>Để đảm bảo bảo mật, vui lòng đăng nhập vào hệ thống, truy cập mục <b>Hồ sơ -> Đổi mật khẩu</b> trong vòng <b>24 giờ</b> kể từ khi nhận được email này.</p>"
                +
                "    <a href='http://localhost:3000/login' style='" + BUTTON_STYLE + "'>Đăng nhập ngay</a>" +
                "    <p style='margin-top: 20px; font-style: italic; color: #666;'>Nếu bạn không thực hiện đổi mật khẩu đúng hạn, tài khoản có thể bị khóa vì lý do an toàn.</p>"
                +
                "  </div>" +
                "</div>";
    }

    // 6. Mẫu Thông báo Tạo Hợp đồng Thành công
    public static String getContractCreatedSuccess(String fullname, String roomName, String startDate, String endDate,
            String depositAmount) {
        return "<div style='max-width: 600px;'>" +
                "  <div style='background-color: #1976d2; " + HEADER_STYLE + "'>" +
                "    <h2 style='margin:0;'>XÁC NHẬN KÝ KẾT HỢP ĐỒNG</h2>" +
                "  </div>" +
                "  <div style='" + BODY_STYLE + "'>" +
                "    <p>Chào <b>" + fullname + "</b>,</p>" +
                "    <p>Chúc mừng bạn! Hợp đồng thuê phòng của bạn trên hệ thống <b>Quản lý Chuỗi Phòng Trọ</b> đã được khởi tạo và xác nhận thành công.</p>"
                +
                "    " +
                "    <div style='background-color: #f0f7ff; padding: 15px; border-radius: 5px; border-left: 5px solid #1976d2; margin: 20px 0;'>"
                +
                "      <h4 style='margin-top: 0; color: #1976d2;'>Thông tin lưu trú:</h4>" +
                "      <table style='width: 100%; font-size: 14px;'>" +
                "        <tr><td style='width: 40%; color: #666;'>Phòng:</td><td><b>" + roomName + "</b></td></tr>" +
                "        <tr><td style='color: #666;'>Ngày bắt đầu:</td><td><b>" + startDate + "</b></td></tr>" +
                "         <tr><td style='color: #666;'>Ngày kết thúc :</td><td><b>" + endDate + "</b></td></tr>" +
                "        <tr><td style='color: #666;'>Tiền cọc đã đóng:</td><td style='color: #2e7d32;'><b>"
                + depositAmount + " VNĐ</b></td></tr>" +
                "      </table>" +
                "    </div>" +
                "    " +
                "    <p>Bạn hiện đã có thể truy cập vào hệ thống để quản lý dịch vụ, xem hóa đơn hằng tháng và đăng ký các tiện ích đi kèm.</p>"
                +
                "    " +
                "    <div style='text-align: center; margin-top: 25px;'>" +
                "      <a href='http://localhost:3000/my-contract' style='" + BUTTON_STYLE
                + "'>Xem chi tiết hợp đồng</a>" +
                "    </div>" +
                "    " +
                "    <p style='margin-top: 20px; font-size: 13px; color: #666;'><i>* Mọi thắc mắc vui lòng liên hệ trực tiếp với quản lý chi nhánh để được hỗ trợ nhanh nhất.</i></p>"
                +
                "    <p style='color: #888; font-size: 12px; margin-top: 20px;'>Trân trọng,<br>Ban quản lý hệ thống</p>"
                +
                "  </div>" +
                "</div>";

    }

    // 7. Mẫu Yêu cầu Cập nhật Thông tin CCCD
    public static String getRequestUpdateIdentity(String userName, String deadline) {
        return "<div style='max-width: 600px;'>" +
                "  <div style='background-color: #607d8b; " + HEADER_STYLE + "'>" +
                "    <h2 style='margin:0;'>YÊU CẦU CẬP NHẬT THÔNG TIN</h2>" +
                "  </div>" +
                "  <div style='" + BODY_STYLE + "'>" +
                "    <p>Chào <b>" + userName + "</b>,</p>" +
                "    <p>Để hoàn tất thủ tục <b>đăng ký tạm trú</b> và đảm bảo quyền lợi của bạn trong suốt thời gian lưu trú, Ban quản lý yêu cầu bạn cập nhật thông tin Căn cước công dân (CCCD) mới nhất lên hệ thống.</p>"
                +
                "    " +
                "    <div style='background-color: #fff3e0; padding: 15px; border-radius: 5px; border-left: 5px solid #ff9800; margin: 20px 0;'>"
                +
                "      <p style='margin: 0; color: #e65100; font-weight: bold;'>⚠️ Thời hạn thực hiện:</p>" +
                "      <p style='margin: 5px 0 0 0;'>Trước ngày: <b>" + deadline + "</b></p>" +
                "    </div>" +
                "    " +
                "    <p><b>Các bước thực hiện:</b></p>" +
                "    <ol>" +
                "      <li>Đăng nhập vào tài khoản cá nhân.</li>" +
                "      <li>Truy cập mục <b>Hồ sơ cá nhân</b>.</li>" +
                "      <li>Cập nhật số CCCD và đính kèm ảnh chụp 2 mặt (nếu có).</li>" +
                "      <li>Nhấn <b>Lưu thay đổi</b>.</li>" +
                "    </ol>" +
                "    " +
                "    <div style='text-align: center; margin-top: 25px;'>" +
                "      <a href='http://localhost:3000/profile' style='" + BUTTON_STYLE + "'>Cập nhật ngay</a>" +
                "    </div>" +
                "    " +
                "    <p style='margin-top: 20px; font-size: 13px; color: #666;'><i>* Lưu ý: Việc chậm trễ cập nhật có thể ảnh hưởng đến công tác kiểm tra hành chính của cơ quan chức năng tại khu vực.</i></p>"
                +
                "    <p style='color: #888; font-size: 12px; margin-top: 20px;'>Trân trọng,<br>Ban quản lý hệ thống</p>"
                +
                "  </div>" +
                "</div>";
    }

    // 8. Mẫu Thông báo Thủ công (Dùng chung cho mọi nội dung)
    public static String getManualNotification(String title, String content) {
        return "<div style='max-width: 600px; margin: 0 auto; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>"
                +
                "  <div style='background-color: #37474f; " + HEADER_STYLE + "'>" + // Màu xám đậm chuyên nghiệp
                "    <h2 style='margin:0; font-size: 20px; text-transform: uppercase;'>" + title + "</h2>" +
                "  </div>" +
                "  <div style='" + BODY_STYLE + " background-color: #ffffff;'>" +
                "    <div style='margin-bottom: 25px; color: #333333; font-size: 16px;'>" +
                "      " + content.replace("\n", "<br>") + "" + // Giữ nguyên xuống dòng từ textarea
                "    </div>" +
                "    " +
                "    <div style='border-top: 1px dashed #cccccc; padding-top: 15px; margin-top: 20px;'>" +
                "      <p style='margin: 0; color: #7f8c8d; font-size: 13px;'>Đây là thông báo từ Ban quản lý hệ thống.</p>"
                +
                "      <p style='margin: 5px 0 0 0; color: #7f8c8d; font-size: 13px;'>Mọi thắc mắc vui lòng liên hệ trực tiếp để được giải đáp.</p>"
                +
                "    </div>" +
                "    " +
                "    <div style='text-align: center; margin-top: 30px;'>" +
                "      <a href='http://localhost:3000/notifications' style='" + BUTTON_STYLE + "'>Xem trên ứng dụng</a>"
                +
                "    </div>" +
                "  </div>" +
                "</div>";
    }

    // 9. Mẫu Thông báo Hợp đồng được Kích hoạt thành công (Hệ thống tự động quét)
    public static String getContractActivated(String userName, String roomName, String startDate, String endDate) {
        return "<div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>"
                +
                "  <div style='background-color: #1976d2; color: white; padding: 25px; text-align: center;'>" +
                "    <h2 style='margin: 0; text-transform: uppercase;'>Hợp đồng đã kích hoạt</h2>" +
                "  </div>" +
                "  <div style='padding: 30px; line-height: 1.6; color: #333;'>" +
                "    <p>Xin chào <b>" + userName + "</b>,</p>" +
                "    <p>Hệ thống xin thông báo hợp đồng thuê phòng của bạn đã chính thức có hiệu lực kể từ hôm nay.</p>"
                +
                "    " +
                "    <div style='background-color: #f8f9fa; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0;'>"
                +
                "      <p style='margin: 5px 0;'>🏠 <b>Phòng:</b> " + roomName + "</p>" +
                "      <p style='margin: 5px 0;'>📅 <b>Ngày bắt đầu:</b> " + startDate + "</p>" +
                "      <p style='margin: 5px 0;'>⏳ <b>Ngày kết thúc dự kiến:</b> " + endDate + "</p>" +
                "    </div>" +
                "    " +
                "    <p>Từ bây giờ, bạn có thể sử dụng đầy đủ các tiện ích của tòa nhà và theo dõi các dịch vụ trên ứng dụng của chúng tôi.</p>"
                +
                "    " +
                "    <div style='text-align: center; margin-top: 30px;'>" +
                "      <a href='http://localhost:3000/my-room' style='background-color: #1976d2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Xem chi tiết phòng</a>"
                +
                "    </div>" +
                "  </div>" +
                "  <div style='background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;'>"
                +
                "    Đây là email tự động, vui lòng không phản hồi email này.<br>© Ban quản lý hệ thống Quản lý Phòng trọ"
                +
                "  </div>" +
                "</div>";
    }

    // 10. Mẫu Thông báo Hợp đồng đã Hết hạn
    public static String getContractExpired(String userName, String roomName, String endDate) {
        return "<div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ffcdd2; border-radius: 8px; overflow: hidden;'>"
                +
                "  <div style='background-color: #d32f2f; color: white; padding: 25px; text-align: center;'>" +
                "    <h2 style='margin: 0; text-transform: uppercase;'>Hợp đồng đã hết hạn</h2>" +
                "  </div>" +
                "  <div style='padding: 30px; line-height: 1.6; color: #333;'>" +
                "    <p>Chào <b>" + userName + "</b>,</p>" +
                "    <p>Ban quản lý xin thông báo hợp đồng thuê <b>Phòng " + roomName
                + "</b> của bạn đã chính thức <b>hết hạn</b> vào ngày " + endDate + ".</p>" +
                "    " +
                "    <div style='background-color: #ffebee; border: 1px dashed #d32f2f; padding: 20px; border-radius: 5px; margin: 20px 0;'>"
                +
                "      <p style='margin: 0; color: #c62828; font-weight: bold;'>⚠️ Lưu ý quan trọng:</p>" +
                "      <ul style='margin: 10px 0 0 0; padding-left: 20px; color: #333;'>" +
                "        <li>Vui lòng hoàn tất thủ tục trả phòng và bàn giao chìa khóa.</li>" +
                "        <li>Thanh toán các khoản phí dịch vụ còn lại (nếu có).</li>" +
                "        <li>Nếu bạn muốn tiếp tục ở lại, vui lòng liên hệ Admin để làm thủ tục <b>Gia hạn</b> ngay lập tức.</li>"
                +
                "      </ul>" +
                "    </div>" +
                "    " +
                "    <div style='text-align: center; margin-top: 30px;'>" +
                "      <a href='http://localhost:3000/contact' style='background-color: #d32f2f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Liên hệ Ban quản lý</a>"
                +
                "    </div>" +
                "  </div>" +
                "</div>";
    }

    // 11. Mẫu Thông báo Hợp đồng bị Chấm dứt trước hạn
    public static String getContractTerminated(String userName, String roomName, String reason) {
        return "<div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ffcdd2; border-radius: 8px; overflow: hidden;'>"
                +
                "  <div style='background-color: #b71c1c; color: white; padding: 25px; text-align: center;'>" +
                "    <h2 style='margin: 0; text-transform: uppercase;'>Hợp đồng bị chấm dứt trước hạn</h2>" +
                "  </div>" +
                "  <div style='padding: 30px; line-height: 1.6; color: #333;'>" +
                "    <p>Chào <b>" + userName + "</b>,</p>" +
                "    <p>Ban quản lý xin thông báo hợp đồng thuê <b>Phòng " + roomName
                + "</b> của bạn đã bị <b>chấm dứt trước hạn</b>.</p>" +
                "    <div style='background-color: #ffebee; border: 1px dashed #b71c1c; padding: 20px; border-radius: 5px; margin: 20px 0;'>"
                +
                "      <p style='margin: 0; color: #b71c1c; font-weight: bold;'>📋 Lý do chấm dứt:</p>" +
                "      <p style='margin: 8px 0 0 0;'>" + reason + "</p>" +
                "    </div>" +
                "    <div style='background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;'>"
                +
                "      <p style='margin: 0; color: #e65100; font-weight: bold;'>⚠️ Các bước cần thực hiện:</p>" +
                "      <ul style='margin: 10px 0 0 0; padding-left: 20px; color: #333;'>" +
                "        <li>Hoàn tất thủ tục trả phòng và bàn giao chìa khóa.</li>" +
                "        <li>Thanh toán các khoản phí còn lại (nếu có).</li>" +
                "        <li>Liên hệ Ban quản lý để xử lý hoàn cọc theo quy định.</li>" +
                "      </ul>" +
                "    </div>" +
                "    <div style='text-align: center; margin-top: 30px;'>" +
                "      <a href='http://localhost:3000/contact' style='background-color: #b71c1c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Liên hệ Ban quản lý</a>"
                +
                "    </div>" +
                "  </div>" +
                "  <div style='background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;'>"
                +
                "    Đây là email tự động, vui lòng không phản hồi email này.<br>© Ban quản lý hệ thống Quản lý Phòng trọ"
                +
                "  </div>" +
                "</div>";
    }

        // utils/EmailTemplate.java
    public static String getVehicleExitAlert(String fullName, String licensePlate, String roomName, String exitTime) {
        return String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>"
            + "<div style='background-color: #dc3545; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;'>"
            + "<h2 style='color: white; margin: 0;'>⚠️ CẢNH BÁO XE RỜI BÃI</h2>"
            + "</div>"
            + "<div style='padding: 20px;'>"
            + "<p style='font-size: 16px; color: #333;'>Kính gửi anh/chị <strong>%s</strong>,</p>"
            + "<p>Hệ thống ghi nhận xe của quý khách có biển số <strong style='color: #dc3545;'>%s</strong> "
            + "đã rời khỏi bãi xe vào lúc <strong>%s</strong>.</p>"
            + "<div style='background-color: #f8f9fa; padding: 12px; border-radius: 8px; margin: 15px 0;'>"
            + "<p style='margin: 5px 0;'><strong>🏠 Phòng:</strong> %s</p>"
            + "<p style='margin: 5px 0;'><strong>🚗 Biển số:</strong> %s</p>"
            + "<p style='margin: 5px 0;'><strong>⏰ Thời gian:</strong> %s</p>"
            + "</div>"
            + "<p>Nếu đây không phải là bạn hoặc có nghi vấn, vui lòng kiểm tra lại hoặc liên hệ với ban quản lý ngay lập tức.</p>"
            + "<hr style='margin: 20px 0; border-color: #e0e0e0;'>"
            + "<p style='color: #666; font-size: 12px;'>Đây là email tự động từ hệ thống quản lý nhà trọ. Vui lòng không phản hồi email này.</p>"
            + "</div>"
            + "</div>",
            fullName, licensePlate, exitTime, roomName, licensePlate, exitTime
        );
    }

    public static String getUnknownVehicleAlert(String licensePlate, String direction, String time) {
        String action = direction.equals("IN") ? "vào" : "ra";
        return String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>"
            + "<div style='background-color: #ff9800; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;'>"
            + "<h2 style='color: white; margin: 0;'>🚨 PHÁT HIỆN XE LẠ</h2>"
            + "</div>"
            + "<div style='padding: 20px;'>"
            + "<p>Hệ thống ghi nhận một xe <strong>chưa đăng ký</strong> đã %s khỏi bãi.</p>"
            + "<div style='background-color: #fff3e0; padding: 12px; border-radius: 8px; margin: 15px 0;'>"
            + "<p style='margin: 5px 0;'><strong>🚗 Biển số:</strong> %s</p>"
            + "<p style='margin: 5px 0;'><strong>📅 Thời gian:</strong> %s</p>"
            + "</div>"
            + "<p>Vui lòng kiểm tra camera an ninh để xác minh.</p>"
            + "</div>"
            + "</div>",
            action, licensePlate, time
        );
    }
}