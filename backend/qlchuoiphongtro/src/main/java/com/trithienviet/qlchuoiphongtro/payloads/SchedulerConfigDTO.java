package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulerConfigDTO {
    private Long id;
    private String name;
    private String codeKey;
    private String cronExpression;
    private Boolean isActive;
    private String description;
}
