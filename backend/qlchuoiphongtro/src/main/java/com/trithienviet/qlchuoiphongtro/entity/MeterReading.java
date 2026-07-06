package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "meter_readings")
public class MeterReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long readingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceItem service;

    @Column(precision = 10, scale = 2)
    private BigDecimal oldValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal newValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal usageValue;

    private LocalDateTime readingDate = LocalDateTime.now();

    private Integer periodMonth;
    private Integer periodYear;

    private String image;

    /**
     * Đánh dấu bản ghi này là "số đầu đồng hồ" khi thêm phòng mới (chưa có HĐ).
     * Khi phòng có HĐ, giá trị newValue của bản này sẽ là oldValue cho hóa đơn đầu
     * tiên.
     * Bản isInitial KHÔNG được tính vào tiêu thụ hóa đơn.
     */
    @Column(name = "is_initial", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isInitial = false;
}