package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RoomMediaDTO {
    private Integer meadiaId;
    private Integer roomId;
    private String url;
    private String meadiaType;
    private boolean isThumbnail;
}
