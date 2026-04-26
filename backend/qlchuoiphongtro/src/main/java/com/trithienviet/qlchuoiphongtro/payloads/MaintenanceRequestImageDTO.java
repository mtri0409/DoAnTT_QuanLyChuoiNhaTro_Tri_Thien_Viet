package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class MaintenanceRequestImageDTO {
    private Integer imageId;
    private String imageName;
    private String imageUrl;
}