package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class VehicleLoadDTO {
    private Long vehicleId;
    private Long roomId;
    private String roomName;
    private String brand;
    private Long ownerId;
    private String ownerName;
    private String licensePlate;
    private Boolean status;
}
