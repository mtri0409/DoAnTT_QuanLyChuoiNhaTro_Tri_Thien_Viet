package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class DepositDTO {
    private Long despositId;
    private Long roomId;
    
    private Integer contractId;
    private BigDecimal amount;
    private String status;
}
