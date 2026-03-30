package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDate;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ProfileRequestDTO {
    private Long profileId;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String identityNumber;
    private LocalDate idExpirationDate;
    private LocalDate idIssueDate;
    private String idIssuePlace;
}
