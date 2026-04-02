package com.trithienviet.qlchuoiphongtro.payloads;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class LoginCredentials {
    private String userName;
    private String password;
}
