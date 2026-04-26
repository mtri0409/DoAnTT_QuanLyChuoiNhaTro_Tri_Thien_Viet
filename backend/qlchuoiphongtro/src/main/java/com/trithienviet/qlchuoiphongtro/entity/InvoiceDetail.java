package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "invoice_details")
public class InvoiceDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_detail_id")
    private Long invoiceDetailID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = true)
    private ServiceItem service;

    // null nếu dịch vụ cố định (rác, xe...), có giá trị nếu tính theo đồng hồ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reading_id", nullable = true)
    private MeterReading meterReading;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity; // Số lượng (Số chữ điện, số người, hoặc 1 nếu là phí cố định)

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice; // Lưu lại giá tại thời điểm xuất hóa đơn (Snapshot Price)

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subTotal; // quantity * unit_price

    private String status;

    // ── REPAIR only: thông tin chi phí sửa chữa ──────────────────────────────

    /**
     * ID của bản ghi Expenses tương ứng.
     * Cho phép trace back từ invoice detail → expense gốc.
     */
    @Column(name = "expense_id", nullable = true)
    private Long expenseId;

    /**
     * Danh mục sửa chữa: "Sửa điện", "Sửa nước", "Thay thiết bị"…
     * Snapshot tại thời điểm tạo, tránh mất dữ liệu nếu expense bị xóa.
     */
    @Column(name = "expense_category", nullable = true)
    private String expenseCategory;

    /**
     * Mô tả / nguyên nhân gây ra chi phí sửa chữa.
     */
    @Column(name = "repair_description", columnDefinition = "TEXT", nullable = true)
    private String description;

    /**
     * Tên thợ / đơn vị thực hiện sửa chữa.
     */
    @Column(name = "payee_name", nullable = true)
    private String payeeName;

    /**
     * Link ảnh hoặc hóa đơn bằng chứng từ thợ.
     */
    @Column(name = "evidence_url", nullable = true)
    private String evidenceUrl;
}
