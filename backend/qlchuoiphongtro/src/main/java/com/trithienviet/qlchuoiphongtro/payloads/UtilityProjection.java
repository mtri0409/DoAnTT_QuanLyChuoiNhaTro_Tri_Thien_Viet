package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;

public interface UtilityProjection {
    BigDecimal getTotalElectricUsage();
    BigDecimal getTotalElectricMoney();
    BigDecimal getTotalWaterUsage();
    BigDecimal getTotalWaterMoney();
} 
