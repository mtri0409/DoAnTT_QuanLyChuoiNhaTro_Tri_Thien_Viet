package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "expenses")
public class Expenses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long expenseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @NotBlank(message = "Expense category cannot be blank")
    private String expenseCategory;

    private BigDecimal amount;

    private LocalDateTime paymentDate;

    /**
     * Ai chịu chi phí:
     * TENANT_FAULT → khách hàng (sinh ra Invoice REPAIR)
     * OWNER_COST → nhà trọ chịu (chỉ lưu expenses)
     */
    @Column(nullable = false, length = 20)
    private String payer; // TENANT_FAULT | OWNER_COST

    private String payeeName;
    private String evidenceUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Yêu cầu sửa chữa gốc (chỉ có khi payer = TENANT_FAULT) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_request_id", nullable = true)
    private MaintenanceRequest maintenanceRequest;

    /**
     * Hóa đơn REPAIR được tạo tự động khi payer = TENANT_FAULT.
     * null nếu payer = OWNER_COST.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = true)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}