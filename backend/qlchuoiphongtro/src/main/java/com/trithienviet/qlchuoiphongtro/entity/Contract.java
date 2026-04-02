package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contracts")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "rent_price", precision = 10, scale = 2)
    private BigDecimal rentPrice;

    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount; // Đây là con số Snapshot từ bảng Deposit

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_id", nullable = false)
    private Profile representative;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status;

    @Min(value = 1, message = "Billing day must be at least 1")
    @Max(value = 31, message = "Billing day cannot be greater than 31")
    private Integer billingDay; // lưu ngày sẽ tính tiền

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomMember> roomMembers;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContractService> contractServices;// danh sách dịch vụ của hợp đồng

    @Column(nullable = false)
    private Boolean isDeleted = false;

    // singnature online

    private String digitalSignature; // Chữ ký số hoặc mã hash xác thực
    private LocalDateTime signedAt; // Thời điểm ký chính xác

    private String ipAddress; // Địa chỉ IP của người ký (để đối soát nếu có tranh chấp)

    private String deviceInformation; // Thiết bị ký (ví dụ: iPhone 15, Chrome Browser)

    @Column(columnDefinition = "TEXT")
    private String contractContentHash; // Mã hash nội dung hợp đồng lúc ký (để đảm bảo sau này không ai sửa nội dung)

    private String signatureImageUrl; // Link ảnh chữ ký tay (nếu cho phép vẽ tay trên màn hình)

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
    private List<Invoice> invoices;
}
