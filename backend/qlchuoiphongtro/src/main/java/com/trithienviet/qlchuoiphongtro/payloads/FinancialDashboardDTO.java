package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;

public record FinancialDashboardDTO(
    BigDecimal totalPaidMonthly,    // Tổng tiền phòng + dịch vụ đã thu
    BigDecimal totalPaidDeposit,    // Tổng tiền cọc đã thu (Thực thu)
    BigDecimal totalRefunded,       // Tổng tiền đã hoàn trả khách
    BigDecimal totalPendingAmount,  // Tổng tiền khách còn nợ (Chưa thanh toán)
    Long paidInvoicesCount,         // Số hóa đơn đã xử lý xong
    Long pendingInvoicesCount  // Số hóa đơn đang chờ thu

    // Double monthlyRevenueGrowth,  // Biến động doanh thu phòng (%)
    // Double depositGrowth,         // Biến động tiền cọc (%)
    // Double debtGrowth
) {}