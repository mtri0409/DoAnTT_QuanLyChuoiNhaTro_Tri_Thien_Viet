package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDateTime;

import lombok.Data;
@Data
public class ParkingLogDTO {
    private Long logId;
    private String licensePlate;
    private String direction;
    private LocalDateTime detectedAt;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String imagePath;
    private Double confidence;
    private Boolean isVerified;
    private String status;
    private String notes;
    
    // Thông tin vehicle
    private Long vehicleId;
    private String vehicleLicensePlate;
    private String customerName;
    private String customerPhone;
    
    // Getters and Setters (hoặc dùng Lombok @Data)
}