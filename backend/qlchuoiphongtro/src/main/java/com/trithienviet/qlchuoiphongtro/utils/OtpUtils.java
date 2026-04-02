package com.trithienviet.qlchuoiphongtro.utils;

import java.security.SecureRandom;

public class OtpUtils {

    // Sử dụng SecureRandom để đảm bảo tính bảo mật cao cho mã xác thực
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final String NUMBERS = "0123456789";

    /**
     * Tạo mã OTP chỉ gồm các chữ số
     * @param length Độ dài của mã OTP (thường là 6)
     * @return Chuỗi mã OTP
     */
    public static String generateOTP(int length) {
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(NUMBERS.charAt(secureRandom.nextInt(NUMBERS.length())));
        }
        return otp.toString();
    }

    /**
     * Tạo Token ngẫu nhiên (bao gồm cả chữ và số) - dùng cho reset link hoặc secret key
     * @param length Độ dài của token
     * @return Chuỗi token ngẫu nhiên
     */
    public static String generateRandomToken(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder token = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            token.append(characters.charAt(secureRandom.nextInt(characters.length())));
        }
        return token.toString();
    }
}