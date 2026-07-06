package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ParkingStatsDTO {
    
    private Long inCount;           // Xe vào
    private Long outCount;          // Xe ra
    private Long totalCount;        // Tổng
    private Long unverifiedCount;   // Chưa xác thực
    private Long notifiedCount;     // Đã gửi cảnh báo
    private LocalDate date;         // Ngày thống kê
    
    // Tính toán tổng tự động
    public Long getTotalCount() {
        if (totalCount == null && (inCount != null || outCount != null)) {
            return (inCount != null ? inCount : 0L) + (outCount != null ? outCount : 0L);
        }
        return totalCount != null ? totalCount : 0L;
    }
}