package com.trithienviet.qlchuoiphongtro.payloads;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class MetterReadingDTO {
    private Long readingId;
    private Long roomId;
    private String roomName;
    private Integer serviceId;
    private String serviceName;
    private BigDecimal oldValue;
    private BigDecimal newValue;
    private BigDecimal usageValue;
    private String image;
    private LocalDateTime readingDate;

    /**
     * true = bản ghi số đầu đồng hồ (thêm phòng mới chưa có HĐ).
     * Frontend dùng field này để phân biệt và không hiển thị vào tiêu thụ.
     */
    private Boolean isInitial;
}