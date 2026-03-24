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
public class InvoiceDetailDTO {
    private Long detailId;
    // private Long invoiceId;
    private Integer serviceId;
    private String serviceName;

    private Long readingId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal subTotal;
    
}
