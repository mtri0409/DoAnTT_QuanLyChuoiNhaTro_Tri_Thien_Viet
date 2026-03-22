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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Setter
@Table(name="deposits")
public class Deposit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long depositId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    // nullable = true vì lúc cọc giữ chỗ chưa có hợp đồng
    @OneToOne(fetch = FetchType.LAZY)
    // @Column(nullable = true)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @DecimalMin(value = "0.0",message = "amout deposit can not less than 0 .")
    private BigDecimal amount;
    
    private String status; // BOOKED, ACTIVE, REFUNDED, COMPENSATED (Bồi thường)
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
