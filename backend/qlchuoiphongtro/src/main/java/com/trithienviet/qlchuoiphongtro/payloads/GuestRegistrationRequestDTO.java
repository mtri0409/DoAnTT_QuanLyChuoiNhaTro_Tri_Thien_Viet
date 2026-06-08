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
public class GuestRegistrationRequestDTO {
    private Long profileId; // ID Profile người thân (null nếu tạo mới)
    private String fullName;
    private String phone;
    private String email;
    private String identityNumber;
    private LocalDate idIssueDate;
    private LocalDate idExpirationDate;
    private String idIssuePlace;
    private String address;
    private String relationship; // Mối quan hệ (vợ/chồng, con, anh em, v.v.)
    private String memberType; // STAYING_WITH hoặc VISITING
    private List<VehicleRegisterDTO> vehicles; // Danh sách xe cần đăng ký
}
