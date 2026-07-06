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
public class ServiveDTO {
    private Integer serviceId;
    private String serviceName;
    private String unit;
    private BigDecimal price;
    private String serviceType;
    private Boolean is_active;
}
