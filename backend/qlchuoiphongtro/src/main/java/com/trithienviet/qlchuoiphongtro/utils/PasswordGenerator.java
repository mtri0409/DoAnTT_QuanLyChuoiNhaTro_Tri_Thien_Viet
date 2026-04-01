package com.trithienviet.qlchuoiphongtro.utils;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class PasswordGenerator {

    // Bộ ký tự để tạo pass (đã loại bỏ các ký tự dễ nhầm lẫn)
    private static final String CHAR_LOWER = "abcdefghjkmnpqrstuvwxyz";
    private static final String CHAR_UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final String NUMBER = "23456789";
    private static final String OTHER = "!@#$%&*";
    private static final String PASSWORD_ALLOW = CHAR_LOWER + CHAR_UPPER + NUMBER + OTHER;

    private static SecureRandom random = new SecureRandom();

    public static String generateRandomPassword(int length) {
        if (length < 8) length = 8; // Tối thiểu 8 ký tự cho bảo mật

        StringBuilder sb = new StringBuilder(length);
        
        // Đảm bảo có ít nhất 1 ký tự từ mỗi nhóm để thỏa mãn chính sách bảo mật
        sb.append(CHAR_LOWER.charAt(random.nextInt(CHAR_LOWER.length())));
        sb.append(CHAR_UPPER.charAt(random.nextInt(CHAR_UPPER.length())));
        sb.append(NUMBER.charAt(random.nextInt(NUMBER.length())));
        sb.append(OTHER.charAt(random.nextInt(OTHER.length())));

        // Các ký tự còn lại chọn ngẫu nhiên
        for (int i = 4; i < length; i++) {
            sb.append(PASSWORD_ALLOW.charAt(random.nextInt(PASSWORD_ALLOW.length())));
        }

        // Trộn các ký tự lên để không bị lộ quy luật (ví dụ ký tự đầu luôn là chữ thường)
        List<Character> letters = sb.chars().mapToObj(c -> (char) c).collect(Collectors.toList());
        Collections.shuffle(letters);
        
        return letters.stream().map(String::valueOf).collect(Collectors.joining());
    }
}