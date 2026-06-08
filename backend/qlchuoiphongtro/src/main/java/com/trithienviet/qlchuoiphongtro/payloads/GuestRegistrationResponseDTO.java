package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class GuestRegistrationResponseDTO {
    private Integer memberId; // ID RoomMember
    private Long profileId;
    private String fullName;
    private String phone;
    private String email;
    private String identityNumber;
    private String address;
    private String memberType; // STAYING_WITH, VISITING
    private String relationship;
    private String status; // PENDING, APPROVED, REJECTED, CANCELLED
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String approvedByName;
    private String rejectionReason;
    private List<VehicleDTO> vehicles;
    private String roomName;
    private String branchName;
    private String idFrontImage;
    private String idBackImage;
}
