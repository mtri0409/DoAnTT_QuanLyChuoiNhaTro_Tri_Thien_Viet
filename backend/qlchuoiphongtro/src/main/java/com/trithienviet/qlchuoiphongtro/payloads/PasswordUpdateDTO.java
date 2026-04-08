package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.Data;

@Data
public class PasswordUpdateDTO {
    private String oldPassword;
    private String newPassword;
}
