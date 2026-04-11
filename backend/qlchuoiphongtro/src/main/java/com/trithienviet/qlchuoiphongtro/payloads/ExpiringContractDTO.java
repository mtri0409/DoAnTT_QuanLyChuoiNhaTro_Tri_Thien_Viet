package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDate;

public record ExpiringContractDTO(
    String roomName,      // Tên phòng (ví dụ: P.101)
    String tenantName,    // Tên khách đại diện
    LocalDate endDate,    // Ngày hết hạn
    long daysLeft         // Số ngày còn lại (tính sẵn từ Backend)
) {}