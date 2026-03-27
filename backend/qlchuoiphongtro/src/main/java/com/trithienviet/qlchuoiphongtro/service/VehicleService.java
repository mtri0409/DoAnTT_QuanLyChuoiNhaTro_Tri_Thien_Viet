package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.VehicleDTO;

public interface VehicleService {
    VehicleDTO addVehicleForTenant(Long profileId,VehicleDTO vehicleDTO);
    VehicleDTO updateVehicle(Long vehicleId, VehicleDTO vehicleDTO);
    String deleteVehicle(Long vehicleId);
}
