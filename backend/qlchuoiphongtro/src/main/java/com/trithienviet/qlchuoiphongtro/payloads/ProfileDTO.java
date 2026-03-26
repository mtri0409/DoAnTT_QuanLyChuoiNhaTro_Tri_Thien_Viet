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
public class ProfileDTO {
    private Long profileId;
    private String fullName;
    private String phone;
    private String address;
    private String identityNumber;
    private String idFrontImage;
    private String idBackImage;
    private LocalDate idExpirationDate;
    private LocalDate idIssueDate;
    private String idIssuePlace;
}
