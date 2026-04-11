package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;

public interface FinancialProjection {
    BigDecimal getTotalPaidMonthly();
    BigDecimal getTotalPaidDeposit();
    BigDecimal getTotalRefunded();
    BigDecimal getTotalPending();
    Long getPaidCount();
    Long getPendingCount();
} 