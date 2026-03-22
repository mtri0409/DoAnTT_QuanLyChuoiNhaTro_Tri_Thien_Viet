package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="contracts")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_id", nullable = false)
    private Profile representative;


    private LocalDate startDate;
    private LocalDate endDate;
    private String status; // Ví dụ: "ACTIVE", "EXPIRED", "TERMINATED"
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL)
    private List<RoomMember> roomMembers;

    // singnature online

    private String digitalSignature; // Chữ ký số hoặc mã hash xác thực
    private LocalDateTime signedAt;   // Thời điểm ký chính xác
    @Column(nullable = true)
    private String ipAddress;    // Địa chỉ IP của người ký (để đối soát nếu có tranh chấp)
    @Column(nullable = true)    
    private String deviceInformation; // Thiết bị ký (ví dụ: iPhone 15, Chrome Browser)

    @Column(columnDefinition = "TEXT")
    private String contractContentHash; // Mã hash nội dung hợp đồng lúc ký (để đảm bảo sau này không ai sửa nội dung)

    private String signatureImageUrl; // Link ảnh chữ ký tay (nếu cho phép vẽ tay trên màn hình)

    @OneToMany(mappedBy="contract",fetch = FetchType.LAZY)
    
    private List<Invoice> invoices;
}
