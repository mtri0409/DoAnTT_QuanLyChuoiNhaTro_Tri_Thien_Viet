package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "room_members")
public class RoomMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    private Boolean isStaying = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract; // Nhiều thành viên thuộc về 1 hợp đồng

    // Mới thêm cho chức năng đăng ký người thân
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RoomMemberType type = RoomMemberType.MAIN_TENANT; // Loại thành viên

    private String relationshipType; // Mối quan hệ (vợ/chồng, con, anh em, v.v.)

    @Column(nullable = true)
    private LocalDateTime registrationDate; // Ngày đăng ký

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RegistrationStatus registrationStatus = RegistrationStatus.PENDING; // Trạng thái duyệt

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by", nullable = true)
    private Profile approvedBy; // Người duyệt đơn

    @Column(nullable = true)
    private LocalDateTime approvedAt; // Thời gian duyệt

    @Column(columnDefinition = "TEXT", nullable = true)
    private String rejectionReason; // Lý do từ chối
}
