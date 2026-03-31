package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.Data;

@Data
public class PasswordResetConfirm {
    private String email;
    private String otpCode;
    private String newPassword;
    private String confirmPassword; // Để check xem user có gõ nhầm không
}
