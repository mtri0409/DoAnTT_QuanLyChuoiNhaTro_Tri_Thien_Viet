package com.trithienviet.qlchuoiphongtro.payloads;

import com.trithienviet.qlchuoiphongtro.entity.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserDTO {
    private Long userId;
    private String userName;
    private String password;
    private Long profileId;
    private String fullName;
    private UserRole role;

    private boolean isActice;

}
