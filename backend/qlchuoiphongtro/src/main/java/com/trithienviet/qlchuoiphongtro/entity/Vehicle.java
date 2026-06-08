package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "vehicles")
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Profile owner;

    private String brand;
    
    private Boolean status = true; // true: đang hoạt động, false: đã xóa

    @Column(unique = true, nullable = false)
    private String licensePlate; // Biển số xe (QUAN TRỌNG - unique)

    private String color; // Màu xe (tuỳ chọn)

    private LocalDateTime registeredAt = LocalDateTime.now(); // Thời gian đăng ký

    // Mới thêm cho chức năng đăng ký xe của người thân
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by_member_id", nullable = true)
    private RoomMember registeredByMember; // Người nào đăng ký biển số xe

    @Column(nullable = true)
    private String memberRelation; // Mối quan hệ của người đăng ký

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ParkingLog> parkingLogs;
}