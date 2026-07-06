package com.trithienviet.qlchuoiphongtro.service;

import java.time.LocalDate;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingLogDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingStatsResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PlatePayload;

public interface ParkingLogService {

    // CREATE
    ParkingLogDTO createParking(PlatePayload payload);

    // GET
PageResponse<ParkingLogDTO> getAllParkingLogs(
    Integer pageNumber, Integer pageSize, String sortBy, String sortOrder,
    String licensePlate, String direction, Boolean isVerified, String fromDate, String toDate);

    ParkingLogDTO getParkingLogById(Long logId);

    // DELETE
    String deleteParkingLog(Long logId);

    PageResponse<ParkingLogDTO> filterParkingLogsByDate(
            LocalDate startDate, LocalDate endDate,
            Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    ParkingStatsResponse getParkingStats(LocalDate startDate, LocalDate endDate);
}