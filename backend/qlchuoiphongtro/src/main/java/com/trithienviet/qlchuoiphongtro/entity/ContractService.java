package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;

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
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "contract_services")
@Data
public class ContractService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer contractServiceId; // Khóa chính đơn, tự tăng

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceItem service;

    // Snapshot dữ liệu lúc ký
    @Column(precision = 10, scale = 2)
    private BigDecimal priceAtSigning;
 
    private String unitAtSigning; // đơn vị tại thời điểm (kwh , per,....)

    
}