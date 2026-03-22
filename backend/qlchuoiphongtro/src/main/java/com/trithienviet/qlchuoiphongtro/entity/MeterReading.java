package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDateTime;

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
@Table(name="meter_readings")
public class MeterReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long readingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="room_id",nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="service_id",nullable = false)
    private ServiceItem service;

    private Double oldValue;
    private Double newVaule;
    
    private LocalDateTime readingDate = LocalDateTime.now();

    private Integer periodMonth;
    private Integer periodYear;

    private String image;
}
