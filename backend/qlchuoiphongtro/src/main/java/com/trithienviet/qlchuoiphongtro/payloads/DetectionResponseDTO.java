// payloads/DetectionResponseDTO.java
package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DetectionResponseDTO {
    private boolean success;
    private String plateNumber;
    private String direction;
    private boolean isVerified;
    private String ownerName;
    private Long logId;
    private boolean notified;
    private String message;
}