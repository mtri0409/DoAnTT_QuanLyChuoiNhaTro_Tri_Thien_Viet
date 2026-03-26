package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private Integer periodMonth;
    private Integer periodYear;
    private BigDecimal roomServiceAmount;
    private BigDecimal roomPrice;
    private BigDecimal totalAmount;
    private String status;
    private LocalDate dueDate;

    
    private List<InvoiceDetailDTO> invoiceDetails = new ArrayList<>();
}
