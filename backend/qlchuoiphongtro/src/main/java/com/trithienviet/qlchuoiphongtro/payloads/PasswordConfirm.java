package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.Data;

@Data
public class PasswordConfirm {
    private String resetToken;
    private String newPassword;
}
