package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDateTime;
import java.util.List;

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
    private Long roomId;
    private String roomName;
    private Integer assetId;
    private String assetName;
    private Long createdBy;
    private String creatorName;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long branchId;
    private String branchName;
    private List<MaintenanceRequestImageDTO> images;
}
