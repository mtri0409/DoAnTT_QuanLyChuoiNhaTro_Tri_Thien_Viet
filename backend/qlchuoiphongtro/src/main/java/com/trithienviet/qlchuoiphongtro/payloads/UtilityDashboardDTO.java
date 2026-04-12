package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;

public record UtilityDashboardDTO(
      BigDecimal totalElectricUsage,
      BigDecimal totalElectricMoney,
      BigDecimal totalWaterUsage,
      BigDecimal totalWaterMoney
) 
{}
