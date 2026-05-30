package com.trithienviet.qlchuoiphongtro.config;

public class AppConstants {

    // --- CẤU HÌNH PHÂN TRANG VÀ SẮP XẾP MẶC ĐỊNH ---
    public static final String PAGE_NUMBER = "0";
    public static final String PAGE_SIZE = "5";
    public static final String SORT_ROOM_BY = "roomId";
    public static final String SORT_PROFILE_BY = "profileId";
    public static final String SORT_USERS_BY = "userId";
    public static final String SORT_VEHICEL_BY = "vehicleId";
    public static final String SORT_NOTIFICATION_BY = "notificationId";
    public static final String SORT_DIR = "asc";

    // --- CẤU HÌNH HỆ THỐNG ĐỌC TỪ BIẾN MÔI TRƯỜNG (ENV) ---
    public static final Long ADMIN_ID = System.getenv("ADMIN_ID") != null
            ? Long.parseLong(System.getenv("ADMIN_ID")) : 101L;
    public static final Long USER_ID = System.getenv("USER_ID") != null
            ? Long.parseLong(System.getenv("USER_ID")) : 102L;
    public static final long JWT_TOKEN_VALIDITY = System.getenv("JWT_TOKEN_VALIDITY") != null
            ? Long.parseLong(System.getenv("JWT_TOKEN_VALIDITY")) : 10 * 24 * 60 * 60;

    // =========================================================
    // PHÂN NHÓM URL CHO HỆ THỐNG PHÂN QUYỀN (RESTful Security)
    //
    // ⚠️  NGUYÊN TẮC: Spring Security xử lý rule theo THỨ TỰ KHAI BÁO
    //     Rule nào match TRƯỚC sẽ thắng (first-match-wins).
    //
    //     STAFF_URLS phải khai báo các /api/admin/xxx/** CỤ THỂ
    //     và đặt TRƯỚC ADMIN_URLS (catch-all /api/admin/**) trong SecurityConfig.
    // =========================================================

    /**
     * Nhóm 1: PUBLIC_URLS — Không cần xác thực.
     */
    public static final String[] PUBLIC_URLS = {
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/api/register/**",
            "/api/auth/login",
            "/api/auth/create-account/**",
            "/api/public/**",
            "/images/**",
            "/api/maintenance/images/**",
            "/api/admin/evidence/**",       // Ảnh minh chứng chi phí (public display)
            "/error"
    };

    /**
     * Nhóm 2: USER_URLS — Dành cho TENANT (khách thuê).
     */
    public static final String[] USER_URLS = {
            "/api/user/**",
            "/api/tenant/maintenance/**",
            "/api/tenant/contracts/**",
            "/api/profiles/my-profile/**"
    };

    /**
     * Nhóm 3: GUARD_URLS — Bảo vệ bãi xe (STAFF + ADMIN).
     */
    public static final String[] GUARD_URLS = {
            "/ws-parking/**",
            "/api/vehicles/**",
            "/api/guard/**"
    };

    /**
     * Nhóm 4: STAFF_URLS — Tất cả endpoint STAFF được truy cập.
     *
     * ⚠️  KEY FIX: Frontend gọi /api/admin/contracts, /api/admin/vehicles, v.v.
     *     Nếu chỉ khai báo /api/contracts/** thì KHÔNG match vì path thực là /api/admin/contracts.
     *     → Phải liệt kê CỤ THỂ các /api/admin/xxx/** mà STAFF cần.
     *     → Trong SecurityConfig, rule STAFF_URLS đặt TRƯỚC rule ADMIN_URLS.
     *
     * STAFF CÓ QUYỀN:
     *   Hợp đồng, Phòng, Chi nhánh, Tiện ích, Tầng, Room-Media,
     *   Hồ sơ (xem/sửa, KHÔNG tạo/xóa), Xe cộ, Ghi điện nước,
     *   Hóa đơn (xem/thao tác), Dịch vụ, Bài đăng, Tin tức,
     *   Bảo trì, Thông báo (xem), Bãi xe + Camera
     *
     * STAFF KHÔNG được:
     *   /api/admin/users/**  (tài khoản),
     *   /api/admin/expenses/** (chi phí),
     *   /api/admin/settings/** (cài đặt),
     *   /api/ai/**, /api/ocr/** (AI/OCR)
     */
    public static final String[] STAFF_URLS = {
            // ── Bãi xe (cũng có trong GUARD_URLS) ──────────────────────
            "/ws-parking/**",
            "/api/vehicles/**",
            "/api/guard/**",

            // ── Hợp đồng ─────────────────────────────────────────────────
            "/api/admin/contracts/**",

            // ── Xe cộ ────────────────────────────────────────────────────
            "/api/admin/vehicles/**",

            // ── Phòng trọ ─────────────────────────────────────────────────
            "/api/rooms/**",
            "/api/admin/rooms/**",

            // ── Chi nhánh ─────────────────────────────────────────────────
            "/api/branches/**",
            "/api/admin/branches/**",

            // ── Tiện ích ──────────────────────────────────────────────────
            "/api/amenities/**",
            "/api/admin/amenities/**",

            // ── Tầng lầu ──────────────────────────────────────────────────
            "/api/floors/**",
            "/api/admin/floors/**",

            // ── Room Media ────────────────────────────────────────────────
            "/api/room-medias/**",

            // ── Hồ sơ người thuê ─────────────────────────────────────────
            "/api/admin/profiles/**",
            "/api/admin/profile/**",

            // ── Ghi điện nước ─────────────────────────────────────────────
            "/api/admin/meter-readings/**",

            // ── Hóa đơn ───────────────────────────────────────────────────
            "/api/admin/invoices/**",

            // ── Dịch vụ ───────────────────────────────────────────────────
            "/api/admin/services/**",

            // ── Bài đăng tìm phòng (Roommate Posts) ──────────────────────
            "/api/admin/roommate-posts/**",

            // ── Tin tức / Bài đăng hệ thống ──────────────────────────────
            "/api/admin/posts/**",

            // ── Danh mục bài đăng ──────────────────────────────────────────
            "/api/admin/post-categories/**",

            // ── Bảo trì / Báo hỏng ────────────────────────────────────────
            "/api/admin/maintenance/**",

            // ── Thông báo (chỉ xem) ───────────────────────────────────────
            "/api/admin/notification/**",

            // ── Chi phí ───────────────────────────────────────────────────
            "/api/admin/expenses/**",

            // ── Cài đặt hệ thống ──────────────────────────────────────────
            "/api/admin/settings/**",
            "/api/admin/system/**",

            // ── Soạn gửi thông báo thủ công ──────────────────────────────
            "/api/notification/send-manual",
    };

    /**
     * Nhóm 5: ADMIN_URLS — Quyền hạn tối cao.
     * Rule catch-all /api/admin/** phải đặt SAU STAFF_URLS trong SecurityConfig.
     * Các sub-path STAFF được phép đã được xử lý trước bởi STAFF_URLS.
     *
     * ADMIN ONLY (STAFF bị chặn):
     *   /api/admin/users/**     — Quản lý tài khoản
     *   + bất kỳ /api/admin/** nào chưa được khai báo trong STAFF_URLS
     */
    public static final String[] ADMIN_URLS = {
            "/api/admin/**",                // catch-all (sau khi STAFF exceptions đã match ở trên)
            "/api/ai/**",
            "/api/ocr/**"
    };

}
