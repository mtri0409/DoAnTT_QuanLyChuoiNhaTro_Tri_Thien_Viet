package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDate;
import java.util.List;

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
    private String address;
    private String identityNumber;
    private String idFrontImage;
    private String idBackImage;
    private LocalDate idExpirationDate;
    private LocalDate idIssueDate;
    private String idIssuePlace;
    private Boolean isActice;
    private List<VehicleDTO> vehicles;

    private String roomName; // Chỉ lấy số phòng để hiển thị nhanh
    private Long activeContractId; 
    private LocalDate contractEndDate;

}
