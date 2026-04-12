package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ProfileDTO {
    private Long profileId;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String identityNumber;
    private Boolean isActive;
    private Integer branchId;
    private String branchName;
    private String roomName;
}
