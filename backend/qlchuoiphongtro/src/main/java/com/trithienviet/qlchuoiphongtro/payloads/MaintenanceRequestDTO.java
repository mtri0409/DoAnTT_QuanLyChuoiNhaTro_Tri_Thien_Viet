package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class MaintenanceRequestDTO {
    private Integer requestId;
    private Integer roomId;
    private String roomName;
    private Integer assetId;
    private String assetName;
    private Integer createBy;
    private String user;
    private String status;
}
