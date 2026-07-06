package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "parking_logs", indexes = {
    @Index(name = "idx_license_plate", columnList = "licensePlate"),
    @Index(name = "idx_detected_at", columnList = "detectedAt"),
    @Index(name = "idx_direction", columnList = "direction")
})
public class ParkingLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;
    
    // Liên kết với vehicle (có thể null nếu xe chưa đăng ký)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
    
    // Lưu biển số thực tế từ camera (quan trọng khi xe chưa đăng ký)
    @Column(nullable = false)
    private String licensePlate;
    
    // Hướng: IN (vào) hoặc OUT (ra)
    @Column(nullable = false, length = 3)
    private String direction;
    
    // Thời gian phát hiện
    @Column(nullable = false)
    private LocalDateTime detectedAt;
    
    // Thời gian vào/ra (có thể giống detectedAt)
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    
    // Đường dẫn ảnh chụp từ camera
    private String imagePath;
    
    // Độ tin cậy của AI (0-1)
    private Double confidence;
    
    // Xe đã được xác thực với DB chưa?
    @Column(columnDefinition = "boolean default false")
    private Boolean isVerified = false;
    
    // Đã gửi cảnh báo đến chủ xe chưa?
    @Column(columnDefinition = "boolean default false")
    private Boolean isNotified = false;
    
    // Thời gian gửi cảnh báo
    private LocalDateTime notifiedAt;
    
    // Trạng thái: PENDING, PROCESSED, CANCELLED
    @Column(length = 20)
    private String status = "PENDING";
    
    // Ghi chú (nếu có)
    @Column(columnDefinition = "TEXT")
    private String notes;
}