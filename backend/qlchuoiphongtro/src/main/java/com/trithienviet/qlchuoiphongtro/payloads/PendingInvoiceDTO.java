package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PendingInvoiceDTO(
    Long invoiceId,
    String roomName,
    String tenantName,
    BigDecimal totalAmount,
    BigDecimal remainingAmount, // Số tiền khách còn nợ (Total - Paid)
    LocalDate dueDate           // Hạn chót thanh toán
) {}