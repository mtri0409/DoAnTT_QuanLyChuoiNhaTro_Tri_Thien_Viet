package com.trithienviet.qlchuoiphongtro.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(nullable = false)
    private Integer periodMonth;

    @Column(nullable = false)
    private Integer periodYear;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalAmount;

    // @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private String status;

    private LocalDate dueDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<InvoiceDetail> details;

    @OneToOne(mappedBy = "invoice", cascade = CascadeType.ALL)
    private Payment payment;
}