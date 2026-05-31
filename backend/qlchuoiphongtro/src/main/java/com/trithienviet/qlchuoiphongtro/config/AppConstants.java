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
    //     STAFF_URLS phải khai báo các /api/v1/admin/xxx/** CỤ THỂ
    //     và đặt TRƯỚC ADMIN_URLS (catch-all /api/v1/admin/**) trong SecurityConfig.
    // =========================================================

    /**
     * Nhóm 1: PUBLIC_URLS — Không cần xác thực.
     *
     * Tất cả endpoint dành cho vãng lai (Web User) đều dùng prefix /api/v1/public/
     * nên chỉ cần 1 rule duy nhất: /api/v1/public/**
     */
    public static final String[] PUBLIC_URLS = {
            // ── Swagger / API Docs ─────────────────────────────────────────
            "/v3/api-docs/**",
            "/swagger-ui/**",

            // ── Xác thực ──────────────────────────────────────────────────
            "/api/v1/register/**",
            "/api/v1/auth/login",
            "/api/v1/auth/create-account/**",

            // ── Static / Misc ──────────────────────────────────────────────
            "/images/**",
            "/api/v1/maintenance/images/**",
            "/api/v1/admin/evidence/**",       // Ảnh minh chứng chi phí (public display)
            "/error",
            "/ws-parking/**",
            "/api/v1/ai/**",
            "/api/v1/public/**",

            // ── Gửi thông báo liên hệ (Web User contact form) ────────────
            "/api/v1/notification/send-manual",
    };

    /**
     * Nhóm 2: USER_URLS — Dành cho TENANT (khách thuê).
     */
    public static final String[] USER_URLS = {
            "/api/v1/user/**",
            "/api/v1/tenant/maintenance/**",
            "/api/v1/tenant/contracts/**",
            "/api/v1/profiles/my-profile/**"
    };

    /**
     * Nhóm 3: GUARD_URLS — Bảo vệ bãi xe (STAFF + ADMIN).
     */
    public static final String[] GUARD_URLS = {
            "/ws-parking/**",
            "/api/v1/vehicles/**",
            "/api/v1/guard/**"
    };

    /**
     * Nhóm 4: STAFF_URLS — Tất cả endpoint STAFF được truy cập.
     *
     * ⚠️  Tất cả endpoint có cần auth đều dùng prefix /api/v1/admin/
     *     → STAFF_URLS liệt kê cụ thể các /api/v1/admin/xxx/** STAFF được phép
     *     → ADMIN_URLS là catch-all /api/v1/admin/** còn lại (chỉ ADMIN)
     *
     * STAFF CÓ QUYỀN:
     *   Hợp đồng, Phòng, Chi nhánh, Tiện ích, Tầng, Room-Media,
     *   Hồ sơ (xem/sửa), Xe cộ, Ghi điện nước, Hóa đơn, Dịch vụ,
     *   Bài đăng, Tin tức, Bảo trì, Thông báo, Bãi xe + Camera
     */
    public static final String[] STAFF_URLS = {
            // ── Bãi xe / Camera / Guard ──────────────────────────────────
            "/ws-parking/**",
            "/api/v1/vehicles/**",
            "/api/v1/guard/**",

            // ── Hợp đồng ─────────────────────────────────────────────────
            "/api/v1/admin/contracts/**",

            // ── Xe cộ ────────────────────────────────────────────────────
            "/api/v1/admin/vehicles/**",

            // ── Phòng trọ ─────────────────────────────────────────────────
            "/api/v1/admin/rooms/**",

            // ── Chi nhánh ─────────────────────────────────────────────────
            "/api/v1/admin/branches/**",

            // ── Tiện ích ──────────────────────────────────────────────────
            "/api/v1/admin/amenities/**",

            // ── Tầng lầu ──────────────────────────────────────────────────
            "/api/v1/admin/floors/**",

            // ── Room Media ────────────────────────────────────────────────
            "/api/v1/admin/room-medias/**",

            // ── Hồ sơ người thuê ─────────────────────────────────────────
            "/api/v1/admin/profiles/**",
            "/api/v1/admin/profile/**",

            // ── Quản lý người dùng (Users) ─────────────────────────────────
            "/api/v1/admin/users/**",
            "/api/v1/admin/user/**",

            // ── Ghi điện nước ─────────────────────────────────────────────
            "/api/v1/admin/meter-readings/**",
            "/api/v1/admin/ocr/**",

            // ── Hóa đơn ───────────────────────────────────────────────────
            "/api/v1/admin/invoices/**",

            // ── Dịch vụ ───────────────────────────────────────────────────
            "/api/v1/admin/services/**",

            // ── Bài đăng tìm phòng (Roommate Posts) ──────────────────────
            "/api/v1/admin/roommate-posts/**",

            // ── Tin tức / Bài đăng hệ thống ──────────────────────────────
            "/api/v1/admin/posts/**",

            // ── Danh mục bài đăng ─────────────────────────────────────────
            "/api/v1/admin/post-categories/**",

            // ── Bảo trì / Báo hỏng ────────────────────────────────────────
            "/api/v1/admin/maintenance/**",

            // ── Thông báo ─────────────────────────────────────────────────
            "/api/v1/admin/notification/**",

            // ── Chi phí ───────────────────────────────────────────────────
            "/api/v1/admin/expenses/**",

            // ── Cài đặt hệ thống ──────────────────────────────────────────
            "/api/v1/admin/settings/**",
            "/api/v1/admin/system/**",

            // ── Gửi thông báo thủ công ────────────────────────────────────
            "/api/v1/notification/send-manual",
    };

    /**
     * Nhóm 5: ADMIN_URLS — Quyền hạn tối cao (ADMIN only).
     * Catch-all /api/v1/admin/** bắt mọi path chưa được khai báo trong STAFF_URLS.
     * Đặt SAU STAFF_URLS trong SecurityConfig (first-match-wins).
     *
     * ADMIN ONLY: /api/v1/admin/users/**, /api/v1/ai/**, /api/v1/ocr/**
     */
    public static final String[] ADMIN_URLS = {
            "/api/v1/admin/**",    // catch-all (STAFF exceptions đã match ở bước 4)
            "/api/v1/ocr/**",
    };

}

