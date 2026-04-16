package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RoomDTO {
    private Long roomId;
    private String roomName;
    private BigDecimal price;
    private Integer currentPeople;
    private Integer maxPeople;
    private String description;
    private String Status;
    private Long floorId;
    
    @Builder.Default
    private List<RoomMediaDTO> roomMedia = new ArrayList<>();
    @Singular
    private List<AmenityDTO> amenities;

    @Singular
    private List<AssetDTO> assets;

    private BigDecimal depositAmount;  
    
    private String depositStatus;
}
