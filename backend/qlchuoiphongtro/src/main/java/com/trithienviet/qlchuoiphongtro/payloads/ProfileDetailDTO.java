package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDate;
import java.util.List;

import com.trithienviet.qlchuoiphongtro.entity.Vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ProfileDetailDTO {
    private Long profileId;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String identityNumber;
    private String idFrontImage;
    private String idBackImage;
    private LocalDate idExpirationDate;
    private LocalDate idIssueDate;
    private String idIssuePlace;
    private Boolean isActice;
    private List<VehicleLoadDTO> vehicles;

    private String roomName;
    private String branchName;
    private Long activeContractId;
    private LocalDate contractEndDate;
    private String roleName;
}
