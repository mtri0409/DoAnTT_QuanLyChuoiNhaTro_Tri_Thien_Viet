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
    private Long mediaId;
    private Long roomId;
    private String url;
    private String mediaType;
    private boolean isThumbnail;
}
