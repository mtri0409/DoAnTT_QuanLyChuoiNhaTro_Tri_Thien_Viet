package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response-only DTO — chỉ dùng để trả dữ liệu về client.
 * Các trường input đã được chuyển sang @RequestParam trong Controller.
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ExpensesDTO {

    private Long expenseId;
    private String payer; // TENANT_FAULT | OWNER_COST
    private String expenseCategory;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private String payeeName;
    private String evidenceUrl;
    private String description;
    private Integer maintenanceRequestId;
    private Integer branchId;

    // ── RESPONSE only ─────────────────────────────────────────────────────────
    private Long invoiceId;
    private String branchName;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
}