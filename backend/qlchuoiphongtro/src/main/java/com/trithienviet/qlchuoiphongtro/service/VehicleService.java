package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleLoadDTO;

public interface VehicleService {
    PageResponse<VehicleLoadDTO> getAll(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
    PageResponse<VehicleLoadDTO> searchVehicles(String keyword,Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);

    VehicleDTO addVehicleForTenant(Long profileId,VehicleDTO vehicleDTO);
    VehicleDTO updateVehicle(Long vehicleId, VehicleDTO vehicleDTO);
    String deleteVehicle(Long vehicleId);
}
