package com.trithienviet.qlchuoiphongtro.config;

public class NotificationConstant {

    // --- CÁC LOẠI THÔNG BÁO (TYPE) ---
    public static final String TYPE_SYSTEM = "SYSTEM";
    public static final String TYPE_CONTRACT = "CONTRACT";
    public static final String TYPE_BILL = "BILL";
    public static final String TYPE_ACCOUNT = "ACCOUNT";
    public static final String TYPE_MAINTENANCE = "MAINTENANCE";

    // --- MẪU THÔNG BÁO HỢP ĐỒNG ---
    public static final String CONTRACT_CREATED_TITLE = "Hợp đồng thuê phòng mới";
    public static final String CONTRACT_CREATED_CONTENT = "Chào %s! Hợp đồng thuê phòng %s của bạn đã được khởi tạo thành công. Vui lòng kiểm tra lại thông tin.";

     public static final String CONTRACT_ACTIVE_TITLE = "Hợp đồng được kích hoạt";
    public static final String CONTRACT_ACTIVE_CONTENT = "Chào %s! Hợp đồng thuê phòng %s của bạn đã được kích hoạt từ hôm nay. Vui lòng kiểm tra lại thông tin.";


    public static final String CONTRACT_EXPIRING_TITLE = "Hợp đồng sắp hết hạn";
    public static final String CONTRACT_EXPIRING_CONTENT = "Hợp đồng phòng %s của bạn sẽ hết hạn vào ngày %s. Vui lòng liên hệ quản lý để gia hạn.";

    // --- MẪU THÔNG BÁO HÓA ĐƠN ---
    public static final String BILL_NEW_TITLE = "Hóa đơn tiền phòng mới";
    public static final String BILL_NEW_CONTENT = "Hóa đơn tháng %s cho phòng %s đã có. Tổng tiền: %s VNĐ. Hạn thanh toán: %s.";

    public static final String BILL_REMIND_TITLE = "Nhắc nhở thanh toán hóa đơn";
    public static final String BILL_REMIND_CONTENT = "Bạn có hóa đơn chưa thanh toán với số tiền %s VNĐ. Vui lòng hoàn tất để tránh bị gián đoạn dịch vụ.";

    // --- MẪU THÔNG BÁO TÀI KHOẢN ---
    public static final String ACCOUNT_WELCOME_TITLE = "Chào mừng thành viên mới";
    public static final String ACCOUNT_WELCOME_CONTENT = "Tài khoản của bạn đã được tạo thành công. Tên đăng nhập: %s. Hãy đổi mật khẩu ngay để đảm bảo an toàn.";

    // --- MẪU THÔNG BÁO XE ---
    public static final String VEHICLE_ADDED_TITLE = "Đăng ký phương tiện thành công";
    public static final String VEHICLE_ADDED_CONTENT = "Xe biển số %s đã được thêm vào hồ sơ của bạn thành công.";
}