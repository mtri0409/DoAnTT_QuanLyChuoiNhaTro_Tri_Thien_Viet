package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class GuestRegistrationApprovalDTO {
    private Integer memberId;
    private String status; // APPROVED, REJECTED
    private String rejectionReason; // Chỉ cần khi REJECTED
}
