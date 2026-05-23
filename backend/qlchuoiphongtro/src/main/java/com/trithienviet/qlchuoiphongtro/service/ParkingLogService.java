package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingLogDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PlatePayload;

public interface ParkingLogService {
    
    // CREATE
    ParkingLogDTO createParking(PlatePayload payload);
    
    // GET
    PageResponse<ParkingLogDTO> getAllParkingLogs(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    
    ParkingLogDTO getParkingLogById(Long logId);
    
    // DELETE
    String deleteParkingLog(Long logId);
}