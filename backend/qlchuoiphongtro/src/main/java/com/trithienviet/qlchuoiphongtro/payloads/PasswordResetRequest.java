package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.Data;

@Data
public class PasswordResetRequest {
    private String email;
    private Long profileId; 
}