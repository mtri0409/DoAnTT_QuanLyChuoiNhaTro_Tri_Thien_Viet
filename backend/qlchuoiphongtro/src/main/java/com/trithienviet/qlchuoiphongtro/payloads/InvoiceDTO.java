package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class InvoiceDTO {

    private Long invoiceId;
    private Long contractId;
    private String roomName;

    /** MONTHLY | DEPOSIT | REPAIR */
    private String type;

    private Integer periodMonth;
    private Integer periodYear;

    private BigDecimal roomPrice;
    private BigDecimal roomServiceAmount;
    private BigDecimal totalAmount;

    /** DEPOSIT only: tổng tiền đã nộp tích lũy */
    private BigDecimal paidAmount;

    /** DEPOSIT only: id của bản ghi Deposit liên kết */
    private Long depositId;

    private String status;
    private LocalDate dueDate;
    private String contractStatus;

    private LocalDateTime createdAt;
    private String paymentMethod;
    private LocalDateTime paidAt;

    @Builder.Default
    private List<Detail> invoiceDetails = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Detail {
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
    }
}