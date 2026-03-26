package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AssetDTO {
    private Integer assetId;
    private String assetName;
    private String brand;
    private String serialNumber;
    private String status;
}
