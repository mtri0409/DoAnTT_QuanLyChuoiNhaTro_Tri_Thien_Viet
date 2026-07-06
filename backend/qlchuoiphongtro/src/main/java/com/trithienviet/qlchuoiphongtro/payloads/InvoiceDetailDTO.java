package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho một dòng trong hóa đơn.
 *
 * - MONTHLY: dùng serviceId, serviceName, unit, unitPrice, quantity,
 * subTotal, oldValue, newValue, meterReadingId
 * - REPAIR: dùng expenseId, expenseCategory, description,
 * payeeName, evidenceUrl, subTotal
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailDTO {

    // ── MONTHLY / chung ───────────────────────────────────────────────────────
    private Long invoiceDetailId;
    private Integer serviceId;
    private String serviceName;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    private BigDecimal subTotal;
    private Long meterReadingId;

    private BigDecimal oldValue;
    private BigDecimal newValue;

    // ── REPAIR only ───────────────────────────────────────────────────────────
    /** ID của Expenses tương ứng */
    private Long expenseId;
    /** Danh mục sửa chữa (Sửa điện, Sửa nước…) */
    private String expenseCategory;
    /** Mô tả / nguyên nhân gây ra chi phí */
    private String description;
    /** Tên thợ / đơn vị thực hiện */
    private String payeeName;
    /** Link bằng chứng / hóa đơn thợ */
    private String evidenceUrl;
}