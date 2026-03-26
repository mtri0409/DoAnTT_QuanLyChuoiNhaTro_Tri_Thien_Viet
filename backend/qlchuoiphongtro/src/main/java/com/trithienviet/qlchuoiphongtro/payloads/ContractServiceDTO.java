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
public class ContractServiceDTO {
    private Integer contractServiceId;
    private Integer contractId;
    private Integer serviceId;
    private BigDecimal pirceAtSigning;
    private String unitAtSigning;
    private String note;
}
