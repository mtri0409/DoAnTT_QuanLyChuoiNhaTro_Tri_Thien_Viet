package com.trithienviet.qlchuoiphongtro.config;

public class AppConstants {

    public static final String PAGE_NUMBER = "0";
    public static final String PAGE_SIZE = "5";
    public static final String SORT_ROOM_BY = "roomId";
    public static final String SORT_PROFILE_BY = "profileId";
    public static final String SORT_USERS_BY = "userId";
    public static final String SORT_VEHICEL_BY = "vehicleId";
    public static final String SORT_DIR = "asc";
    public static final Long ADMIN_ID = 101L;
    public static final Long USER_ID = 102L;
    public static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60; // 5 giờ tính bằng giây

    public static final String[] PUBLIC_URLS = {
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/api/register/**",
            "/api/auth/login",
            "/api/auth/create-account/**",
            "/api/contracts",

            "/error"
    };

    public static final String[] USER_URLS = { "/api/public/**" };

    public static final String[] ADMIN_URLS = { "/api/admin/**" };

}
