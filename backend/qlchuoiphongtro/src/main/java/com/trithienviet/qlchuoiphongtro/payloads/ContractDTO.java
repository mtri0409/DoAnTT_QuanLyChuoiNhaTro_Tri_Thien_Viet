package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ContractDTO {
    private Long contractId;
    private Long roomId;
    private BigDecimal rentPrice;
    private BigDecimal depositAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer billingDay;
    private Long representativeId;
    private ContractStatus status;
}
