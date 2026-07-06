package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingStatsResponse {
    private long totalLogs;       // Tổng số lượt quét trong ngày
    private long totalIn;         // Số lượt xe vào
    private long totalOut;        // Số lượt xe ra
    private long unknownVehicles; // Số lượt xe vãng lai (Xe lạ)
    private long failedOcr;       // Số lượt không đọc được biển (UNKNOWN)
}