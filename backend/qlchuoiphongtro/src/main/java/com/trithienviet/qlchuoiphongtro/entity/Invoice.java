package com.trithienviet.qlchuoiphongtro.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    /**
     * Phân loại hóa đơn: MONTHLY | DEPOSIT | REPAIR
     * MONTHLY : tiền phòng hàng tháng (mặc định)
     * DEPOSIT : tiền đặt cọc
     * REPAIR : tiền sửa chữa (làm sau)
     */
    @Column(length = 20, nullable = false)
    private String type = "MONTHLY";

    @Column(nullable = false)
    private Integer periodMonth; // kỳ tháng

    @Column(nullable = false)
    private Integer periodYear; // kỳ năm

    private BigDecimal roomPrice; // snapshot giá phòng
    private BigDecimal roomServiceAmount; // tổng dịch vụ

    @Column(precision = 15, scale = 2)
    private BigDecimal totalAmount; // tổng phải trả (room + services)

    /**
     * DEPOSIT only: tổng tiền đã nộp (từng phần hoặc đủ).
     * MONTHLY: luôn null (thanh toán 1 lần qua Payment).
     */
    @Column(precision = 15, scale = 2)
    private BigDecimal paidAmount;

    /**
     * DEPOSIT only: liên kết tới bản ghi Deposit tương ứng.
     * Cho phép tra cứu ngược (deposit → invoice).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_id", nullable = true)
    private Deposit deposit;

    /**
     * Status theo type:
     * MONTHLY : DRAFT → PENDING → PAID | CANCELLED
     * DEPOSIT : DRAFT → PENDING → PARTIAL → PAID | CANCELLED | REFUNDED
     * REPAIR : (giống MONTHLY, làm sau)
     */
    @Column(length = 20)
    private String status;

    private LocalDate dueDate; // hạn chót thanh toán

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<InvoiceDetail> details;

    @OneToOne(mappedBy = "invoice", cascade = CascadeType.ALL)
    private Payment payment;
}