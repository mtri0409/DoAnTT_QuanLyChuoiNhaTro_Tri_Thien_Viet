package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParkingLogRequestDTO {
    
    private String licensePlate;
    private String direction;      // IN hoặc OUT
    private Double confidence;
    private String imagePath;
    private Long vehicleId;         // Có thể null nếu xe chưa đăng ký
    private String notes;
    private String status;
}